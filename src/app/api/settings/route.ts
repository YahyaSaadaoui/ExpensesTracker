import { supabaseServer } from "@/lib/supabaseServer";
import { num } from "@/lib/money";

export async function GET() {
  const sb = supabaseServer();

  const { data, error } = await sb
    .from("settings")
    .select("salary, month_start_day")
    .eq("id", 1)
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({
    salary: num(data.salary),
    monthStartDay: data.month_start_day,
  });
}

export async function PATCH(req: Request) {
  const sb = supabaseServer();
  const body = await req.json().catch(() => null);

  const patch: any = {};

  if (body?.salary !== undefined) {
    const salary = num(body.salary);
    if (salary < 0) {
      return Response.json({ error: "salary must be >= 0" }, { status: 400 });
    }
    patch.salary = salary;
  }

  if (body?.monthStartDay !== undefined) {
    const d = Number(body.monthStartDay);
    if (!Number.isInteger(d) || d < 1 || d > 28) {
      return Response.json(
        { error: "monthStartDay must be integer between 1 and 28" },
        { status: 400 }
      );
    }
    patch.month_start_day = d;
  }

  if (Object.keys(patch).length === 0) {
    return Response.json({ error: "Nothing to update" }, { status: 400 });
  }

  const { data, error } = await sb
    .from("settings")
    .update(patch)
    .eq("id", 1)
    .select("salary, month_start_day")
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({
    salary: num(data.salary),
    monthStartDay: data.month_start_day,
  });
}
