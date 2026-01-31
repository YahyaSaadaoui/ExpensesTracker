import { supabaseServer } from "@/lib/supabaseServer";

export async function GET() {
  const sb = supabaseServer();

  const { data, error } = await sb
    .from("monthly_snapshots")
    .select("*")
    .order("period_start", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    return Response.json({ error: "No snapshots found" }, { status: 404 });
  }

  return Response.json({ snapshot: data });
}
