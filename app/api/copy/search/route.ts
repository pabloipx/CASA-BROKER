import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

// Busca usuarios (traders) pelo nome ou email para o aluno seguir no Copy Trade.
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const q = (searchParams.get("q") || "").trim()
    if (q.length < 2) {
      return NextResponse.json({ results: [] })
    }

    const admin = createAdminClient()

    // Busca por nome OU email, excluindo o proprio usuario.
    const { data: profiles, error } = await admin
      .from("profiles")
      .select("id, full_name, email")
      .or(`full_name.ilike.%${q}%,email.ilike.%${q}%`)
      .neq("id", user.id)
      .limit(12)

    if (error) {
      console.error("[v0] copy/search error:", error.message)
      return NextResponse.json({ results: [] })
    }

    const ids = (profiles || []).map((p) => p.id)

    // Quais desses o aluno ja segue (ativos).
    const { data: follows } = await admin
      .from("copy_follows")
      .select("master_id, active")
      .eq("follower_id", user.id)
      .in("master_id", ids.length ? ids : ["00000000-0000-0000-0000-000000000000"])

    const followingMap = new Map((follows || []).map((f) => [f.master_id, f.active]))

    // Total de operacoes reais por trader (nao expomos taxa de acerto).
    const results = await Promise.all(
      (profiles || []).map(async (p) => {
        const { count } = await admin
          .from("trades")
          .select("id", { count: "exact", head: true })
          .eq("user_id", p.id)
          .eq("is_demo", false)

        return {
          id: p.id,
          full_name: p.full_name || "Trader",
          email: p.email || "",
          totalTrades: count || 0,
          isFollowing: followingMap.get(p.id) === true,
        }
      }),
    )

    return NextResponse.json({ results })
  } catch (err) {
    console.error("[v0] copy/search exception:", err)
    return NextResponse.json({ results: [] })
  }
}
