import { supabaseServer } from "@/lib/supabaseServer"
import { recomputePeriodForDate } from "@/lib/periodRecompute"

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const sb = supabaseServer()

  // ✅ IMPORTANT: params is async in Next 16
  const { id: consumptionId } = await context.params

  if (!consumptionId) {
    return Response.json(
      { error: "consumption id required" },
      { status: 400 }
    )
  }

  // 1️⃣ Fetch date before delete
  const { data: consumption, error: fetchError } = await sb
    .from("consumptions")
    .select("date")
    .eq("id", consumptionId)
    .single()

  if (fetchError || !consumption) {
    return Response.json(
      { error: "Consumption not found" },
      { status: 404 }
    )
  }

  // 2️⃣ Delete
  const { error: deleteError } = await sb
    .from("consumptions")
    .delete()
    .eq("id", consumptionId)

  if (deleteError) {
    return Response.json(
      { error: deleteError.message },
      { status: 500 }
    )
  }

  // 3️⃣ Recompute period
  await recomputePeriodForDate(
    sb,
    new Date(consumption.date)
  )

  return Response.json({ ok: true })
}
