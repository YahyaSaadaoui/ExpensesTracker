import { supabaseServer } from "@/lib/supabaseServer";
import * as XLSX from "xlsx";
import { num } from "@/lib/money";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const sb = supabaseServer();

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) return Response.json({ error: "No file uploaded" }, { status: 400 });

  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];

  // Reads rows as objects by header names in row 1
  const excelRows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, {
    defval: "",
  });

  // Expect columns: "Category" and "Amount (DH)"
  const expensesToUpsert: { name: string; monthly_budget: number; active: boolean }[] = [];

  for (const row of excelRows) {
    const name = String(row["Category"] ?? "").trim();
    const amount = num(row["Amount (DH)"]);

    if (!name) continue;
    if (amount <= 0) continue;

    const lower = name.toLowerCase();
    if (lower === "income") continue;  // ignore salary here (separate feature)
    if (lower === "saving") continue;  // ignore saving category

    expensesToUpsert.push({
      name,
      monthly_budget: amount,
      active: true,
    });
  }

  if (expensesToUpsert.length === 0) {
    return Response.json({ importedExpenses: 0 }, { status: 200 });
  }

  const { error } = await sb
    .from("expenses")
    .upsert(expensesToUpsert, { onConflict: "name" });

  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ importedExpenses: expensesToUpsert.length }, { status: 200 });
}
