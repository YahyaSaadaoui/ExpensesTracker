import { SupabaseClient } from "@supabase/supabase-js";
import { getPeriodForDate, toISODate } from "@/lib/period";
import { num, round2 } from "@/lib/money";

export async function recomputePeriodForDate(sb: SupabaseClient, d: Date) {
  const { data: settings } = await sb
    .from("settings")
    .select("month_start_day,salary")
    .limit(1)
    .single();

  const monthStart = settings?.month_start_day ?? 28;
  const salary = num(settings?.salary ?? 0);

  const period = getPeriodForDate(d, monthStart);
  const start = toISODate(period.start);
  const end = toISODate(period.end);

  const { data: expenses, error: e1 } = await sb
    .from("expenses")
    .select("id,monthly_budget,active")
    .eq("active", true);

  if (e1) throw new Error(e1.message);

  const { data: consumptions, error: e2 } = await sb
    .from("consumptions")
    .select("expense_id,amount,date")
    .gte("date", start)
    .lt("date", end);

  if (e2) throw new Error(e2.message);

  const consumedByExpense = new Map<string, number>();
  let totalSpent = 0;

  for (const c of consumptions ?? []) {
    const id = c.expense_id as string;
    const v = num(c.amount);
    totalSpent += v;
    consumedByExpense.set(id, (consumedByExpense.get(id) ?? 0) + v);
  }

  // Upsert expense_periods
  const rows = (expenses ?? []).map((ex) => {
    const budget = num(ex.monthly_budget);
    const consumed = round2(consumedByExpense.get(ex.id) ?? 0);
    const remaining = round2(budget - consumed);
    const pct_used = budget > 0 ? round2((consumed / budget) * 100) : 0;

    return {
      expense_id: ex.id,
      period_start: start,
      period_end: end,
      consumed,
      remaining,
      pct_used,
    };
  });

  if (rows.length) {
    const { error } = await sb
      .from("expense_periods")
      .upsert(rows, { onConflict: "expense_id,period_start,period_end" });

    if (error) throw new Error(error.message);
  }

  // Upsert month_summaries
  const remainingSalary = round2(salary - round2(totalSpent));

  const { error: e3 } = await sb
    .from("month_summaries")
    .upsert(
      [
        {
          period_start: start,
          period_end: end,
          salary,
          total_spent: round2(totalSpent),
          remaining_salary: remainingSalary,
        },
      ],
      { onConflict: "period_start,period_end" }
    );

  if (e3) throw new Error(e3.message);

  return { start, end, monthStart };
}
