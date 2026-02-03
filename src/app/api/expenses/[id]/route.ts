import { supabaseServer } from "@/lib/supabaseServer";
import { num } from "@/lib/money";


export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const sb = supabaseServer();
  const body = await req.json().catch(() => null);

  const patch: Record<string, any> = {};

  if (typeof body?.name === "string") {
    patch.name = body.name.trim();
  }

  if (body?.monthly_budget !== undefined) {
    patch.monthly_budget = num(body.monthly_budget);
  }

  if (typeof body?.active === "boolean") {
    patch.active = body.active;
  }

  if (Object.keys(patch).length === 0) {
    return Response.json(
      { error: "Nothing to update" },
      { status: 400 }
    );
  }

  const { data, error } = await sb
    .from("expenses")
    .update(patch)
    .eq("id", id)
    .select("id,name,monthly_budget,active,created_at")
    .single();

  if (error) {
    console.error("PATCH expense failed:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ expense: data });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params; 
  const sb = supabaseServer();
  const { error } = await sb
    .from("expenses")
    .update({ active: false })
    .eq("id", id);

  if (error) {
    console.error("DELETE expense failed:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ ok: true });
}
