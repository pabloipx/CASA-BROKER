import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { ASSET_CATALOG } from "@/lib/asset-catalog"

export const dynamic = "force-dynamic"

const ADMIN_TOKEN = "Admin123!"

function verifyAdminToken(request: Request): boolean {
  return request.headers.get("x-admin-token") === ADMIN_TOKEN
}

export async function GET(request: Request) {
  try {
    if (!verifyAdminToken(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const adminClient = createAdminClient()
    const { data: rows, error } = await adminClient
      .from("asset_settings")
      .select("symbol, enabled, sort_order, payout_override")
    if (error) throw error

    const settings = new Map((rows || []).map((r: any) => [r.symbol, r]))

    const assets = ASSET_CATALOG.map((a, index) => {
      const row = settings.get(a.symbol)
      const override = row?.payout_override
      return {
        symbol: a.symbol,
        name: a.name,
        category: a.category,
        // payout efetivo: override do admin quando definido, senão o padrão do catálogo
        payout: override ?? a.payout,
        defaultPayout: a.payout,
        payoutOverride: override ?? null,
        logo: a.logo,
        enabled: row ? row.enabled : true,
        sortOrder: row?.sort_order ?? index,
      }
    }).sort((a, b) => a.sortOrder - b.sortOrder)

    return NextResponse.json({ assets })
  } catch (error) {
    console.error("Error fetching assets:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    if (!verifyAdminToken(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { symbol } = body
    const hasEnabled = typeof body.enabled === "boolean"
    const hasPayout = body.payout !== undefined

    if (typeof symbol !== "string" || (!hasEnabled && !hasPayout)) {
      return NextResponse.json({ error: "symbol e (enabled ou payout) são obrigatórios" }, { status: 400 })
    }
    if (!ASSET_CATALOG.some((a) => a.symbol === symbol)) {
      return NextResponse.json({ error: "Ativo inválido" }, { status: 400 })
    }

    // Monta apenas os campos enviados (permite alterar só o payout ou só o enabled)
    const update: Record<string, any> = { symbol, updated_at: new Date().toISOString() }
    if (hasEnabled) update.enabled = body.enabled
    if (hasPayout) {
      // null/"" => volta ao padrão do catálogo; caso contrário valida 1..100
      if (body.payout === null || body.payout === "") {
        update.payout_override = null
      } else {
        const p = Number(body.payout)
        if (!Number.isFinite(p) || p < 1 || p > 100) {
          return NextResponse.json({ error: "Payout deve estar entre 1 e 100" }, { status: 400 })
        }
        update.payout_override = Math.round(p)
      }
    }

    const adminClient = createAdminClient()
    const { error } = await adminClient.from("asset_settings").upsert(update, { onConflict: "symbol" })
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating asset:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
