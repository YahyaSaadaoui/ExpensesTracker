import { supabaseServer } from "@/lib/supabaseServer";
import { num } from "@/lib/money";
import { recomputePeriodForDate } from "@/lib/periodRecompute";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const sb = supabaseServer();
  const body = await req.json().catch(() => null);

  const patch: any = {};
  if (body?.amount !== undefined) patch.amount = num(body.amount);
  if (typeof body?.note === "string") patch.note = body.note;
  if (typeof body?.date === "string") patch.date = body.date;

  if (!Object.keys(patch).length) {
    return Response.json({ error: "Nothing to update" }, { status: 400 });
  }

  const { data, error } = await sb
    .from("consumptions")
    .update(patch)
    .eq("id", params.id)
    .select("date")
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  // 🔁 recompute period for that date
  await recomputePeriodForDate(sb, new Date(data.date));

  return Response.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const sb = supabaseServer();

  const { data, error } = await sb
    .from("consumptions")
    .delete()
    .eq("id", params.id)
    .select("date")
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  await recomputePeriodForDate(sb, new Date(data.date));

  return Response.json({ ok: true });
}
