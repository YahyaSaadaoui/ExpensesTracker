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
  const monthStart = settings?.month_start_day ?? Number(process.env.DEFAULT_MONTH_START_DAY ?? 28);

  const period = getPeriodForDate(new Date(), monthStart);
  const start = toISODate(period.start);
  const end = toISODate(period.end);

  const { data: expenses, error: e1 } = await sb
    .from("expenses")
    .select("id,name,monthly_budget,active,created_at")
    .order("created_at", { ascending: true });

  if (e1) return Response.json({ error: e1.message }, { status: 500 });

  const { data: rows, error: e2 } = await sb
    .from("consumptions")
    .select("expense_id,amount,date")
    .gte("date", start)
    .lt("date", end);

  if (e2) return Response.json({ error: e2.message }, { status: 500 });

  const consumedByExpense = new Map<string, number>();
  for (const r of rows ?? []) {
    const id = r.expense_id as string;
    consumedByExpense.set(id, (consumedByExpense.get(id) ?? 0) + num(r.amount));
  }

  const enriched = (expenses ?? []).map((ex) => {
    const budget = num(ex.monthly_budget);
    const consumed = round2(consumedByExpense.get(ex.id) ?? 0);
    const remaining = round2(budget - consumed);
    const pctUsed = budget > 0 ? round2((consumed / budget) * 100) : 0;

    return {
      ...ex,
      consumed,
      remaining,
      pctUsed,
    };
  });

  return Response.json({
    period: { start, end_exclusive: end, monthStartDay: monthStart },
    expenses: enriched,
  });
}

export async function POST(req: Request) {
  const sb = supabaseServer();
  const body = await req.json().catch(() => null);

  const name = body?.name;
  const monthly_budget = body?.monthly_budget;

  if (!name || typeof name !== "string") {
    return Response.json({ error: "name is required" }, { status: 400 });
  }

  const budgetNum = num(monthly_budget);
  if (budgetNum < 0) return Response.json({ error: "budget must be >= 0" }, { status: 400 });

  const { data, error } = await sb
    .from("expenses")
    .insert({ name, monthly_budget: budgetNum, active: true })
    .select("id,name,monthly_budget,active,created_at")
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ expense: data }, { status: 201 });
}
