import { supabaseServer } from "@/lib/supabaseServer";
import { getPeriodForDate, toISODate } from "@/lib/period";
import { num } from "@/lib/money";

function parseMonthParam(month: string | null) {
  if (!month || !/^\d{4}-\d{2}$/.test(month)) return new Date();
  return new Date(`${month}-01T00:00:00`);
}

export async function GET(req: Request) {
  const sb = supabaseServer();

  const url = new URL(req.url);
  const monthParam = url.searchParams.get("month");
  const forDate = parseMonthParam(monthParam);

  const { data: settings } = await sb
    .from("settings")
    .select("salary,month_start_day")
    .single();

  const salary = num(settings?.salary ?? 0);
  const monthStart = settings?.month_start_day ?? 28;

  const period = getPeriodForDate(forDate, monthStart);
  const start = toISODate(period.start);
  const end = toISODate(period.end);

  const { data: expenses } = await sb
    .from("expenses")
    .select("id,name,monthly_budget")
    .eq("active", true)
    .order("created_at");

  const { data: periods } = await sb
    .from("expense_periods")
    .select("expense_id,consumed")
    .eq("period_start", start)
    .eq("period_end", end);

  const periodMap = new Map<string, number>();
  for (const p of periods ?? []) {
    periodMap.set(p.expense_id, num(p.consumed));
  }

  let totalUsed = 0;

  const rows = (expenses ?? []).map((e) => {
    const consumed = periodMap.get(e.id) ?? 0;
    totalUsed += consumed;
    return [
      `"${e.name.replace(/"/g, '""')}"`,
      num(e.monthly_budget),
      consumed,
    ].join(",");
  });

  const remaining = salary - totalUsed;

  const csv = [
    "Expense Name,Budget (DH),Consumed (DH)",
    ...rows,
    "",
    `TOTAL USED,,${totalUsed}`,
    `REMAINING SALARY,,${remaining}`,
  ].join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="expenses-${start}_to_${end}.csv"`,
    },
  });
}
