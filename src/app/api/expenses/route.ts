import { supabaseServer } from "@/lib/supabaseServer";
import { getPeriodForDate, toISODate } from "@/lib/period";
import { num, round2 } from "@/lib/money";

/**
 * ✅ GET expenses with computed fields
 * This is what your table calls
 */
export async function GET() {
  const sb = supabaseServer();

  // Settings
  const { data: settings } = await sb
    .from("settings")
    .select("month_start_day")
    .limit(1)
    .single();

  const monthStart =
    settings?.month_start_day ??
    Number(process.env.DEFAULT_MONTH_START_DAY ?? 28);

  const period = getPeriodForDate(new Date(), monthStart);
  const start = toISODate(period.start);
  const end = toISODate(period.end);

  // Base expenses
  const { data: expenses, error: e1 } = await sb
    .from("expenses")
    .select("id,name,monthly_budget,active,created_at")
    .eq("active", true)
    .order("created_at", { ascending: true });

  if (e1) {
    return Response.json({ error: e1.message }, { status: 500 });
  }

  // Consumptions for period
  const { data: consumptions, error: e2 } = await sb
    .from("consumptions")
    .select("expense_id,amount,date")
    .gte("date", start)
    .lt("date", end);

  if (e2) {
    return Response.json({ error: e2.message }, { status: 500 });
  }

  const consumedByExpense = new Map<string, number>();
  for (const c of consumptions ?? []) {
    const id = c.expense_id as string;
    consumedByExpense.set(
      id,
      (consumedByExpense.get(id) ?? 0) + num(c.amount)
    );
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

  return Response.json({ expenses: enriched });
}

/**
 * ➕ Create expense
 */
export async function POST(req: Request) {
  const sb = supabaseServer();
  const body = await req.json();

  const name = String(body.name ?? "").trim();
  const monthly_budget = num(body.monthly_budget);

  if (!name || monthly_budget <= 0) {
    return Response.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { error } = await sb.from("expenses").insert({
    name,
    monthly_budget,
    active: true,
  });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ ok: true }, { status: 201 });
}
