import { supabaseServer } from "@/lib/supabaseServer";
import { num, round2 } from "@/lib/money";
import { getPeriodForDate, toISODate } from "@/lib/period";

export async function POST(req: Request) {
  const sb = supabaseServer();
  const body = await req.json().catch(() => null);

  const expense_id = body?.expense_id;
  const amount = num(body?.amount);
  const note = body?.note;

  if (!expense_id || typeof expense_id !== "string") {
    return Response.json({ error: "expense_id is required" }, { status: 400 });
  }
  if (amount <= 0) {
    return Response.json({ error: "amount must be > 0" }, { status: 400 });
  }
  if (note !== undefined && note !== null && typeof note !== "string") {
    return Response.json({ error: "note must be string" }, { status: 400 });
  }

  // Insert consumption
  const { data: c, error: e1 } = await sb
    .from("consumptions")
    .insert({
      expense_id,
      amount,
      ...(note ? { note } : {}),
    })
    .select("id,expense_id,amount,date,created_at")
    .single();

  if (e1) return Response.json({ error: e1.message }, { status: 500 });

  // Determine current period based on settings month start
  const { data: settings } = await sb
    .from("settings")
    .select("month_start_day")
    .limit(1)
    .single();

  const monthStart = settings?.month_start_day ?? 28;

  const period = getPeriodForDate(new Date(), monthStart);
  const start = toISODate(period.start);
  const end = toISODate(period.end);

  // Get expense budget
  const { data: ex, error: e2 } = await sb
    .from("expenses")
    .select("id,monthly_budget")
    .eq("id", expense_id)
    .single();

  if (e2 || !ex) {
    return Response.json({ error: "Expense not found" }, { status: 404 });
  }

  // Sum consumptions in this period for this expense
  const { data: rows, error: e3 } = await sb
    .from("consumptions")
    .select("amount,date")
    .eq("expense_id", expense_id)
    .gte("date", start)
    .lt("date", end);

  if (e3) return Response.json({ error: e3.message }, { status: 500 });

  const consumed = round2((rows ?? []).reduce((s, r) => s + num(r.amount), 0));
  const budget = num(ex.monthly_budget);
  const remaining = round2(budget - consumed);
  const pct_used = budget > 0 ? round2((consumed / budget) * 100) : 0;

  // Upsert stored totals in DB
  const { error: e4 } = await sb.from("expense_periods").upsert(
    {
      expense_id,
      period_start: start,
      period_end: end,
      consumed,
      remaining,
      pct_used,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "expense_id,period_start,period_end" }
  );

  if (e4) return Response.json({ error: e4.message }, { status: 500 });

  return Response.json(
    {
      consumption: c,
      period: { start, end },
      totals: { consumed, remaining, pct_used },
    },
    { status: 201 }
  );
}
