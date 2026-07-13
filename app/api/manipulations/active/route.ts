import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export const dynamic = "force-dynamic"

/**
 * Endpoint PUBLICO (somente leitura) das manipulacoes de vela ativas ou futuras proximas.
 * O cliente sincroniza estas manipulacoes no motor de precos para que o grafico e a
 * liquidacao das operacoes sigam a direcao configurada pelo admin.
 */
export async function GET() {
  try {
    const adminClient = createAdminClient()
    const nowIso = new Date().toISOString()

    const { data, error } = await adminClient
      .from("candle_manipulations")
      .select("symbol, direction, intensity, start_at, end_at")
      .eq("active", true)
      .gte("end_at", nowIso)
      .order("start_at", { ascending: true })

    if (error) throw error

    const manipulations = (data || []).map((m: any) => ({
      symbol: m.symbol,
      direction: m.direction,
      intensity: m.intensity || "MEDIUM",
      startMs: new Date(m.start_at).getTime(),
      endMs: new Date(m.end_at).getTime(),
    }))

    return NextResponse.json({ manipulations })
  } catch (error) {
    console.error("Error fetching active manipulations:", error)
    return NextResponse.json({ manipulations: [] })
  }
}
