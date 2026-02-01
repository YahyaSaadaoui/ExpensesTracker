import { supabaseServer } from "@/lib/supabaseServer";
import { getPeriodForDate, toISODate } from "@/lib/period";
import { num, round2 } from "@/lib/money";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month"); // YYYY-MM

  if (!month) {
    return Response.json({ error: "month required" }, { status: 400 });
  }

  const date = new Date(`${month}-15`);
  const sb = supabaseServer();

  const { data: settings } = await sb
    .from("settings")
    .select("month_start_day")
    .limit(1)
    .single();

  const period = getPeriodForDate(date, settings?.month_start_day ?? 28);

  const start = toISODate(period.start);
  const end = toISODate(period.end);

  const { data: expenses } = await sb
    .from("expenses")
    .select("id,name,monthly_budget")
    .eq("active", true);

  const { data: consumptions } = await sb
    .from("consumptions")
    .select("expense_id,amount")
    .gte("date", start)
    .lt("date", end);

  const map = new Map<string, number>();
  for (const c of consumptions ?? []) {
    map.set(c.expense_id, (map.get(c.expense_id) ?? 0) + num(c.amount));
  }

  const result = (expenses ?? []).map((e) => {
    const consumed = round2(map.get(e.id) ?? 0);
    const remaining = round2(e.monthly_budget - consumed);

    return {
      ...e,
      consumed,
      remaining,
    };
  });

  return Response.json({ expenses: result, period });
}
