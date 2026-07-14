import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

/**
 * Replica a operacao recem-aberta pelo mestre para todos os seguidores ativos.
 * Chamado pelo cliente do mestre logo apos abrir uma operacao REAL.
 *
 * Cada copia usa: o mesmo symbol/direction/entry_price/timeframe/expiry_time do mestre,
 * mas o VALOR FIXO definido por cada seguidor. Como o preco de saida e determinado pelo
 * mesmo motor deterministico no instante de expiracao, o resultado (WIN/LOSS) do seguidor
 * sera identico ao do mestre. A liquidacao ocorre no proprio cliente do seguidor.
 */
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
    const { symbol, direction, entryPrice, timeframe, expiryTime, payoutPercentage } = body

    if (!symbol || !direction || !entryPrice || !timeframe || !expiryTime) {
      return NextResponse.json({ error: "Campos obrigatorios ausentes" }, { status: 400 })
    }
    if (!["CALL", "PUT"].includes(direction)) {
      return NextResponse.json({ error: "Direcao invalida" }, { status: 400 })
    }

    const admin = createAdminClient()

    // Seguidores ativos deste mestre.
    const { data: followers } = await admin
      .from("copy_follows")
      .select("follower_id, fixed_amount")
      .eq("master_id", user.id)
      .eq("active", true)

    if (!followers || followers.length === 0) {
      return NextResponse.json({ copied: 0 })
    }

    const payout = Number.isFinite(Number(payoutPercentage)) ? Number(payoutPercentage) : 0.96
    let copied = 0

    for (const f of followers) {
      const followerId = f.follower_id
      const amount = Number(f.fixed_amount)
      if (!Number.isFinite(amount) || amount <= 0) continue

      // Nao duplica se o seguidor ja tem operacao pendente.
      const { data: pending } = await admin
        .from("trades")
        .select("id")
        .eq("user_id", followerId)
        .in("result", ["pending", "PENDING"])
        .limit(1)
      if (pending && pending.length > 0) continue

      // Verifica saldo real do seguidor.
      const { data: balanceData } = await admin
        .from("user_balances")
        .select("balance_real")
        .eq("user_id", followerId)
        .single()

      const balanceReal = Number(balanceData?.balance_real ?? 0)
      if (balanceReal < amount) continue

      // Debita o saldo.
      const newBalance = Math.round((balanceReal - amount) * 100) / 100
      const { error: balErr } = await admin
        .from("user_balances")
        .update({ balance_real: newBalance })
        .eq("user_id", followerId)
      if (balErr) continue

      // Cria a operacao copiada (espelha o mestre).
      const { error: insErr } = await admin.from("trades").insert({
        user_id: followerId,
        symbol,
        direction,
        amount: Math.round(amount * 100) / 100,
        entry_price: entryPrice,
        entry_time: new Date().toISOString(),
        timeframe,
        expiry_time: expiryTime,
        payout_percentage: payout,
        is_demo: false,
        result: "pending",
      })

      if (insErr) {
        // Rollback do saldo em caso de falha.
        await admin.from("user_balances").update({ balance_real: balanceReal }).eq("user_id", followerId)
        continue
      }

      copied++
    }

    return NextResponse.json({ copied })
  } catch (err) {
    console.error("[v0] copy/replicate exception:", err)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
