import { supabaseServer } from "@/lib/supabaseServer";
import { getPeriodForDate, toISODate } from "@/lib/period";
import { num, round2 } from "@/lib/money";

async function getSettings(sb: ReturnType<typeof supabaseServer>) {
  const { data, error } = await sb.from("settings").select("*").limit(1).single();
  if (error) throw error;
  return data as { salary: any; month_start_day: number };
}

export async function GET() {
  const sb = supabaseServer();
  const settings = await getSettings(sb);

  const salary = num(settings.salary);
  const monthStart = settings?.month_start_day ?? Number(process.env.DEFAULT_MONTH_START_DAY ?? 28);

  const period = getPeriodForDate(new Date(), monthStart);
  const start = toISODate(period.start);
  const end = toISODate(period.end);

  const { data: expenses, error: e1 } = await sb
    .from("expenses")
    .select("id,name,monthly_budget,active")
    .eq("active", true);

  if (e1) return Response.json({ error: e1.message }, { status: 500 });

  const { data: cons, error: e2 } = await sb
    .from("consumptions")
    .select("expense_id,amount,date")
    .gte("date", start)
    .lt("date", end);

  if (e2) return Response.json({ error: e2.message }, { status: 500 });

  const consumedByExpense = new Map<string, number>();
  for (const c of cons ?? []) {
    const id = c.expense_id as string;
    consumedByExpense.set(id, (consumedByExpense.get(id) ?? 0) + num(c.amount));
  }

  const pie = (expenses ?? []).map((ex) => {
    const consumed = round2(consumedByExpense.get(ex.id) ?? 0);
    return { expenseId: ex.id, name: ex.name, consumed };
  });

  const totalConsumed = round2(pie.reduce((s, x) => s + x.consumed, 0));
  const savings = round2(salary - totalConsumed);

  return Response.json({
    period: { start, end_exclusive: end, monthStartDay: monthStart },
    salary,
    totalConsumed,
    savings,
    remaining: savings, // for you: remaining salary = salary - totalConsumed
    pie,
  });
}
