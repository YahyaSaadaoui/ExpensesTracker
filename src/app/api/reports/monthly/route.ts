import { supabaseServer } from "@/lib/supabaseServer";
import { getPeriodForDate } from "@/lib/period";

export async function GET() {
  const sb = supabaseServer();

  const { data: expenses } = await sb
    .from("expenses")
    .select("name,monthly_budget");

  const { data: consumptions } = await sb
    .from("consumptions")
    .select("amount");

  return Response.json({
    title: "Monthly Expense Report",
    generatedAt: new Date().toISOString(),
    expenses,
    totalConsumed: consumptions?.reduce((s, c) => s + c.amount, 0) ?? 0,
  });
}
async function downloadPdf() {
  const res = await fetch("/api/reports/monthly");
  const data = await res.json();

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "monthly-report.json";
  a.click();
}

