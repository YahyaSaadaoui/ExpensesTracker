import { supabaseServer } from "@/lib/supabaseServer";
import { getPeriodForDate, toISODate } from "@/lib/period";
import { num, round2 } from "@/lib/money";
import { recomputePeriodForDate } from "@/lib/periodRecompute";

function parseMonthParam(month: string | null) {
  // month format: YYYY-MM
  if (!month) return null;
  if (!/^\d{4}-\d{2}$/.test(month)) return null;
  return new Date(`${month}-01T00:00:00`);
}

export async function GET(req: Request) {
  const sb = supabaseServer();

  const url = new URL(req.url);
  const monthParam = url.searchParams.get("month");
  const forDate = parseMonthParam(monthParam) ?? new Date();

  // ensure computed tables exist for this period
  const periodInfo = await recomputePeriodForDate(sb, forDate);

  const { data: settings } = await sb
    .from("settings")
    .select("salary,month_start_day")
    .limit(1)
    .single();

  const salary = num(settings?.salary ?? 0);
  const monthStart = settings?.month_start_day ?? 28;

  const period = getPeriodForDate(forDate, monthStart);
  const start = toISODate(period.start);
  const end = toISODate(period.end);

  const { data: expenses, error: e1 } = await sb
    .from("expenses")
    .select("id,name,monthly_budget,active,created_at")
    .eq("active", true)
    .order("created_at", { ascending: true });

  if (e1) return Response.json({ error: e1.message }, { status: 500 });

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

    return { ...ex, consumed, remaining, pctUsed };
  });

  const totalSpent = round2(enriched.reduce((s, e) => s + num(e.consumed), 0));
  const remainingSalary = round2(salary - totalSpent);

  // history (latest 12 periods)
  const { data: history } = await sb
    .from("month_summaries")
    .select("period_start,period_end,total_spent,remaining_salary,salary")
    .order("period_start", { ascending: false })
    .limit(12);

  return Response.json({
    period: { start, end, monthStart },
    summary: { salary, totalSpent, remainingSalary },
    history: history ?? [],
    expenses: enriched,
  });
}
