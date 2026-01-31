import { supabaseServer } from "@/lib/supabaseServer";
import { getPeriodForDate, toISODate } from "@/lib/period";
import { num, round2 } from "@/lib/money";

async function getSettings(sb: ReturnType<typeof supabaseServer>) {
  const { data, error } = await sb
    .from("settings")
    .select("salary, month_start_day")
    .eq("id", 1)
    .single();

  if (error) throw error;
  return data;
}

export async function POST() {
  const sb = supabaseServer();

  // 1️⃣ Settings
  const settings = await getSettings(sb);
  const salary = num(settings.salary);
  const monthStartDay = settings.month_start_day;

  // 2️⃣ Period
  const period = getPeriodForDate(new Date(), monthStartDay);
  const start = toISODate(period.start);
  const end = toISODate(period.end);

  // 3️⃣ Check if snapshot already exists
  const { data: existing } = await sb
    .from("monthly_snapshots")
    .select("id")
    .eq("period_start", start)
    .eq("period_end", end)
    .maybeSingle();

  if (existing) {
    return Response.json(
      { error: "Snapshot already exists for this period" },
      { status: 409 }
    );
  }

  // 4️⃣ Sum consumptions
  const { data: cons, error: consErr } = await sb
    .from("consumptions")
    .select("amount")
    .gte("date", start)
    .lt("date", end);

  if (consErr) {
    return Response.json({ error: consErr.message }, { status: 500 });
  }

  const totalConsumed = round2(
    (cons ?? []).reduce((s, c) => s + num(c.amount), 0)
  );

  const totalSaved = round2(salary - totalConsumed);

  // 5️⃣ Insert snapshot
  const { data: snapshot, error } = await sb
    .from("monthly_snapshots")
    .insert({
      period_start: start,
      period_end: end,
      salary,
      total_consumed: totalConsumed,
      total_saved: totalSaved,
    })
    .select("*")
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ snapshot }, { status: 201 });
}

export async function GET() {
  const sb = supabaseServer();

  const { data, error } = await sb
    .from("monthly_snapshots")
    .select("*")
    .order("period_start", { ascending: false });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ snapshots: data ?? [] });
}
