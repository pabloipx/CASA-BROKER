import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { ASSET_CATALOG } from "@/lib/asset-catalog"

export const dynamic = "force-dynamic"

const ADMIN_TOKEN = "Admin123!"

function verifyAdminToken(request: Request): boolean {
  return request.headers.get("x-admin-token") === ADMIN_TOKEN
}

// GET: lista todas as manipulacoes (mais recentes primeiro)
export async function GET(request: Request) {
  try {
    if (!verifyAdminToken(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const adminClient = createAdminClient()
    const { data, error } = await adminClient
      .from("candle_manipulations")
      .select("*")
      .order("start_at", { ascending: false })
      .limit(200)

    if (error) throw error

    return NextResponse.json({ manipulations: data || [] })
  } catch (error) {
    console.error("Error fetching manipulations:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST: cria uma nova manipulacao { symbol, direction, start_at, end_at }
export async function POST(request: Request) {
  try {
    if (!verifyAdminToken(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { symbol, direction, start_at, end_at } = body
    const intensity = body.intensity || "MEDIUM"

    if (typeof symbol !== "string" || !ASSET_CATALOG.some((a) => a.symbol === symbol)) {
      return NextResponse.json({ error: "Ativo inválido" }, { status: 400 })
    }
    if (direction !== "UP" && direction !== "DOWN") {
      return NextResponse.json({ error: "Direção inválida" }, { status: 400 })
    }
    if (!["SOFT", "MEDIUM", "STRONG"].includes(intensity)) {
      return NextResponse.json({ error: "Intensidade inválida" }, { status: 400 })
    }
    const start = new Date(start_at)
    const end = new Date(end_at)
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
      return NextResponse.json({ error: "Horário inválido: o fim deve ser depois do início" }, { status: 400 })
    }

    const adminClient = createAdminClient()
    const { data, error } = await adminClient
      .from("candle_manipulations")
      .insert({
        symbol,
        direction,
        intensity,
        start_at: start.toISOString(),
        end_at: end.toISOString(),
        active: true,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, manipulation: data })
  } catch (error) {
    console.error("Error creating manipulation:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PATCH: ativa/desativa uma manipulacao { id, active }
export async function PATCH(request: Request) {
  try {
    if (!verifyAdminToken(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { id, active } = body
    if (typeof id !== "string" || typeof active !== "boolean") {
      return NextResponse.json({ error: "id e active são obrigatórios" }, { status: 400 })
    }

    const adminClient = createAdminClient()
    const { error } = await adminClient.from("candle_manipulations").update({ active }).eq("id", id)
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating manipulation:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE: remove uma manipulacao ?id=...
export async function DELETE(request: Request) {
  try {
    if (!verifyAdminToken(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) {
      return NextResponse.json({ error: "id é obrigatório" }, { status: 400 })
    }

    const adminClient = createAdminClient()
    const { error } = await adminClient.from("candle_manipulations").delete().eq("id", id)
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting manipulation:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
