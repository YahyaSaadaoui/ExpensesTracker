import { supabaseServer } from "@/lib/supabaseServer";
import { num } from "@/lib/money";

export async function POST(req: Request) {
  const sb = supabaseServer();
  const body = await req.json().catch(() => null);

  const expense_id = body?.expense_id;
  const amount = num(body?.amount);
  const date = body?.date; // optional "YYYY-MM-DD"
  const note = body?.note;

  if (!expense_id || typeof expense_id !== "string") {
    return Response.json({ error: "expense_id is required" }, { status: 400 });
  }
  if (amount <= 0) return Response.json({ error: "amount must be > 0" }, { status: 400 });
  if (note !== undefined && note !== null && typeof note !== "string") {
    return Response.json({ error: "note must be string" }, { status: 400 });
  }
  if (date !== undefined && typeof date !== "string") {
    return Response.json({ error: "date must be YYYY-MM-DD string" }, { status: 400 });
  }

  const { data, error } = await sb
    .from("consumptions")
    .insert({
      expense_id,
      amount,
      ...(date ? { date } : {}),
      ...(note ? { note } : {}),
    })
    .select("id,expense_id,amount,date,note,created_at")
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ consumption: data }, { status: 201 });
}
