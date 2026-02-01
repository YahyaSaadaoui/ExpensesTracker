import { supabaseServer } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  const sb = supabaseServer();

  const form = await req.formData();
  const file = form.get("file") as File | null;

  if (!file) {
    return Response.json({ error: "No file" }, { status: 400 });
  }

  const text = await file.text();
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);

  const [, ...rows] = lines; // skip header

  let salary: number | null = null;
  const expenses: { name: string; monthly_budget: number }[] = [];

  for (const row of rows) {
    const [rawName, rawAmount] = row.split(",");
    const name = rawName.trim();
    const amount = Number(rawAmount);

    if (!name || isNaN(amount)) continue;

    if (name.toLowerCase() === "income") {
      salary = amount;
      continue;
    }

    if (name.toLowerCase() === "saving") {
      continue;
    }

    expenses.push({
      name,
      monthly_budget: amount,
    });
  }

  // Update salary if present
  if (salary !== null) {
    await sb.from("settings").upsert({ id: 1, salary });
  }

  // Upsert expenses
  for (const e of expenses) {
    await sb
      .from("expenses")
      .upsert(
        { name: e.name, monthly_budget: e.monthly_budget },
        { onConflict: "name" }
      );
  }

  return Response.json({
    imported: expenses.length,
    salaryUpdated: salary !== null,
  });
}
