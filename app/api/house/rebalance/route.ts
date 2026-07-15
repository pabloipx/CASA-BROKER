import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export const dynamic = "force-dynamic"

// Janela (em segundos) antes do vencimento em que a casa "empurra" o preco.
// Fora dela o mercado corre natural; so nos ultimos segundos o resultado e direcionado,
// mantendo o grafico realista e evitando ficar mudando de direcao o tempo todo.
const NEAR_WINDOW_SEC = 30

// So agimos em ativos OTC (sinteticos). Ativos reais (Binance) nunca sao manipulados.
function isOtc(symbol: string) {
  return symbol.endsWith("_OTC")
}

async function isEnabled(admin: any): Promise<boolean> {
  const { data } = await admin
    .from("platform_settings")
    .select("setting_value")
    .eq("setting_key", "house_always_wins")
    .maybeSingle()
  const v = data?.setting_value
  return v === true || v === "true" || v === '"true"'
}

/**
 * Motor "a casa sempre no lucro".
 * Perto do fechamento de cada vela OTC, soma o capital apostado em CALL e em PUT
 * (apenas operacoes REAIS e pendentes) e cria uma manipulacao direcionando o preco
 * para o lado com MENOR capital vencer — assim a casa paga o menor valor possivel.
 *
 * E chamado periodicamente pelos clientes na pagina de trade (nao ha cron). Varios
 * clientes podem chamar em paralelo: a operacao e idempotente (recria a decisao).
 */
export async function POST() {
  try {
    const admin = createAdminClient()
    const nowMs = Date.now()
    const nowIso = new Date(nowMs).toISOString()

    // Limpa manipulacoes automaticas ja vencidas (mantem a tabela enxuta).
    await admin.from("candle_manipulations").delete().eq("source", "HOUSE").lt("end_at", nowIso)

    const enabled = await isEnabled(admin)
    if (!enabled) {
      // Modo desligado: remove qualquer manipulacao automatica ainda ativa.
      await admin.from("candle_manipulations").delete().eq("source", "HOUSE")
      return NextResponse.json({ enabled: false })
    }

    // Operacoes REAIS pendentes que ainda vao vencer.
    const { data: trades, error } = await admin
      .from("trades")
      .select("symbol, direction, amount, payout_percentage, expiry_time")
      .in("result", ["pending", "PENDING"])
      .eq("is_demo", false)
      .gt("expiry_time", nowIso)
    if (error) throw error

    // Agrupa por (symbol + instante exato de vencimento).
    type Group = { symbol: string; expiryMs: number; call: number; put: number }
    const groups = new Map<string, Group>()
    for (const t of trades || []) {
      if (!t.symbol || !isOtc(t.symbol) || !t.expiry_time) continue
      const expiryMs = new Date(t.expiry_time).getTime()
      const key = `${t.symbol}__${expiryMs}`
      let g = groups.get(key)
      if (!g) {
        g = { symbol: t.symbol, expiryMs, call: 0, put: 0 }
        groups.set(key, g)
      }
      const amt = Number(t.amount) || 0
      if (t.direction === "CALL") g.call += amt
      else if (t.direction === "PUT") g.put += amt
    }

    // Para cada ativo, considera apenas o vencimento MAIS PROXIMO (o que esta prestes a fechar).
    const nearestBySymbol = new Map<string, Group>()
    for (const g of groups.values()) {
      const cur = nearestBySymbol.get(g.symbol)
      if (!cur || g.expiryMs < cur.expiryMs) nearestBySymbol.set(g.symbol, g)
    }

    const decisions: { symbol: string; direction: "UP" | "DOWN"; expiryMs: number }[] = []

    for (const g of nearestBySymbol.values()) {
      const secsToExpiry = (g.expiryMs - nowMs) / 1000
      // So agimos na janela final. Antes disso, sem manipulacao (mercado natural).
      if (secsToExpiry > NEAR_WINDOW_SEC || secsToExpiry <= 0) {
        await admin.from("candle_manipulations").delete().eq("source", "HOUSE").eq("symbol", g.symbol)
        continue
      }

      // Empate exato: nao ha vantagem, deixa correr natural.
      if (g.call === g.put) {
        await admin.from("candle_manipulations").delete().eq("source", "HOUSE").eq("symbol", g.symbol)
        continue
      }

      // Vence o lado com MENOS capital. CALL vence => preco SOBE (UP). PUT vence => preco DESCE (DOWN).
      const callWins = g.call < g.put
      const direction: "UP" | "DOWN" = callWins ? "UP" : "DOWN"

      // Recria a decisao para este ativo (idempotente).
      await admin.from("candle_manipulations").delete().eq("source", "HOUSE").eq("symbol", g.symbol)
      await admin.from("candle_manipulations").insert({
        symbol: g.symbol,
        direction,
        intensity: "STRONG",
        start_at: nowIso,
        // Vai um pouco alem do vencimento para garantir que o preco no instante da liquidacao ja esteja no lado certo.
        end_at: new Date(g.expiryMs + 2000).toISOString(),
        active: true,
        source: "HOUSE",
      })

      decisions.push({ symbol: g.symbol, direction, expiryMs: g.expiryMs })
    }

    return NextResponse.json({ enabled: true, decisions })
  } catch (e) {
    console.error("[v0] house rebalance error:", e)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
