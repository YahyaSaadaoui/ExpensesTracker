import { supabaseServer } from "@/lib/supabaseServer";
import { getPeriodForDate, toISODate } from "@/lib/period";
import { num, round2 } from "@/lib/money";

export async function GET() {
  const sb = supabaseServer();

  // Settings
  const { data: settings } = await sb
    .from("settings")
    .select("month_start_day")
    .limit(1)
    .single();

  const monthStart = settings?.month_start_day ?? 28;

  const period = getPeriodForDate(new Date(), monthStart);
  const start = toISODate(period.start);
  const end = toISODate(period.end);

  const { data: expenses, error: e1 } = await sb
    .from("expenses")
    .select("id,name,monthly_budget,active,created_at")
    .eq("active", true)
    .order("created_at", { ascending: true });

  if (e1) return Response.json({ error: e1.message }, { status: 500 });

  // Pull stored computed values for this period
  const { data: periodRows, error: e2 } = await sb
    .from("expense_periods")
    .select("expense_id,consumed,remaining,pct_used,period_start,period_end")
    .eq("period_start", start)
    .eq("period_end", end);

  if (e2) return Response.json({ error: e2.message }, { status: 500 });

  const map = new Map<string, any>();
  for (const r of periodRows ?? []) map.set(r.expense_id, r);

  const enriched = (expenses ?? []).map((ex) => {
    const budget = num(ex.monthly_budget);

    const pr = map.get(ex.id);
    const consumed = pr ? round2(num(pr.consumed)) : 0;
    const remaining = pr ? round2(num(pr.remaining)) : round2(budget);
    const pctUsed = pr ? round2(num(pr.pct_used)) : 0;

    return {
      ...ex,
      consumed,
      remaining,
      pctUsed,
    };
  });

  return Response.json({
    period: { start, end, monthStart },
    expenses: enriched,
  });
}

export async function POST(req: Request) {
  const sb = supabaseServer();
  const body = await req.json().catch(() => null);

  const name = String(body?.name ?? "").trim();
  const monthly_budget = num(body?.monthly_budget);

  if (!name || monthly_budget <= 0) {
    return Response.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { error } = await sb.from("expenses").insert({
    name,
    monthly_budget,
    active: true,
  });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true }, { status: 201 });
}
