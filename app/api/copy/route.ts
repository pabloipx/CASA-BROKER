import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

const MIN_COPY_AMOUNT = 5

// GET: lista os traders que o aluno segue (com dados do perfil).
export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const admin = createAdminClient()
    const { data: follows } = await admin
      .from("copy_follows")
      .select("id, master_id, fixed_amount, active, created_at")
      .eq("follower_id", user.id)
      .order("created_at", { ascending: false })

    const masterIds = (follows || []).map((f) => f.master_id)
    const { data: profiles } = masterIds.length
      ? await admin.from("profiles").select("id, full_name, email").in("id", masterIds)
      : { data: [] as any[] }

    const profileMap = new Map((profiles || []).map((p) => [p.id, p]))

    const following = (follows || []).map((f) => ({
      id: f.id,
      masterId: f.master_id,
      masterName: profileMap.get(f.master_id)?.full_name || "Trader",
      masterEmail: profileMap.get(f.master_id)?.email || "",
      fixedAmount: Number(f.fixed_amount),
      active: f.active,
    }))

    return NextResponse.json({ following })
  } catch (err) {
    console.error("[v0] copy GET exception:", err)
    return NextResponse.json({ following: [] })
  }
}

// POST: comeca a seguir (ou atualiza valor/ativo) um trader.
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const masterId: string = body.masterId
    const fixedAmount = Number(body.fixedAmount)
    const active = body.active !== undefined ? Boolean(body.active) : true

    if (!masterId) {
      return NextResponse.json({ error: "masterId obrigatorio" }, { status: 400 })
    }
    if (masterId === user.id) {
      return NextResponse.json({ error: "Voce nao pode copiar a si mesmo" }, { status: 400 })
    }
    if (!Number.isFinite(fixedAmount) || fixedAmount < MIN_COPY_AMOUNT) {
      return NextResponse.json({ error: `Valor minimo por copia e R$ ${MIN_COPY_AMOUNT}` }, { status: 400 })
    }

    const admin = createAdminClient()

    // Confirma que o trader existe.
    const { data: master } = await admin.from("profiles").select("id").eq("id", masterId).single()
    if (!master) {
      return NextResponse.json({ error: "Trader nao encontrado" }, { status: 404 })
    }

    const { error } = await admin.from("copy_follows").upsert(
      {
        follower_id: user.id,
        master_id: masterId,
        fixed_amount: fixedAmount,
        active,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "follower_id,master_id" },
    )

    if (error) {
      console.error("[v0] copy POST error:", error.message)
      return NextResponse.json({ error: "Erro ao salvar" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[v0] copy POST exception:", err)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

// DELETE: deixa de seguir um trader.
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const masterId = searchParams.get("masterId")
    if (!masterId) {
      return NextResponse.json({ error: "masterId obrigatorio" }, { status: 400 })
    }

    const admin = createAdminClient()
    await admin.from("copy_follows").delete().eq("follower_id", user.id).eq("master_id", masterId)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[v0] copy DELETE exception:", err)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
