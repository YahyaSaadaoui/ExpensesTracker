import { supabaseServer } from "@/lib/supabaseServer";
import * as XLSX from "xlsx";
import { num } from "@/lib/money";
import { recomputePeriodForDate } from "@/lib/periodRecompute";

export const runtime = "nodejs"; // XLSX needs Node runtime

export async function POST(req: Request) {
  const sb = supabaseServer();

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return Response.json({ error: "No file uploaded" }, { status: 400 });
  }

  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, {
    defval: "",
  });

  // expects:
  // Category | Amount (DH)
  let salary: number | null = null;
  const expensesToUpsert: { name: string; monthly_budget: number }[] = [];

  for (const r of rows) {
    const name = String(r["Category"] ?? "").trim();
    const amount = num(r["Amount (DH)"]);

    if (!name) continue;

    const lower = name.toLowerCase();

    if (lower === "income") {
      if (amount > 0) salary = amount;
      continue;
    }

    if (lower === "saving") continue; // ignore saving

    if (amount > 0) {
      expensesToUpsert.push({ name, monthly_budget: amount });
    }
  }

  if (expensesToUpsert.length) {
    const { error } = await sb
      .from("expenses")
      .upsert(
        expensesToUpsert.map((e) => ({ ...e, active: true })),
        { onConflict: "name" }
      );

    if (error) return Response.json({ error: error.message }, { status: 500 });
  }

  if (salary !== null) {
    // ensure settings row exists
    const { data: sRow } = await sb.from("settings").select("id").limit(1).single();
    if (!sRow?.id) {
      await sb.from("settings").insert({ salary });
    } else {
      await sb.from("settings").update({ salary }).neq("id", "");
    }
  }

  // recompute current period stats after import
  await recomputePeriodForDate(sb, new Date());

  return Response.json({
    importedExpenses: expensesToUpsert.length,
    salaryUpdated: salary !== null,
  });
}
