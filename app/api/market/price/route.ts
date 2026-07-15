import { NextResponse } from "next/server"
import { REAL_MARKET } from "@/lib/market-data/real-market"

export const dynamic = "force-dynamic"

const BINANCE_HOSTS = ["https://data-api.binance.vision", "https://api.binance.com"]

async function fetchBinance(path: string): Promise<any | null> {
  for (const host of BINANCE_HOSTS) {
    try {
      const res = await fetch(`${host}${path}`, { cache: "no-store" })
      if (res.ok) return await res.json()
    } catch {}
  }
  return null
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const symbol = searchParams.get("symbol") || ""
  const at = searchParams.get("at") // ms opcional: preco num instante passado

  const mapping = REAL_MARKET[symbol]
  if (!mapping) {
    return NextResponse.json({ error: "unknown symbol" }, { status: 400 })
  }
  const pair = mapping.binance

  // Preco historico (liquidacao de operacoes expiradas): fecha da vela de 1m em/antes de `at`.
  if (at) {
    const atMs = Number.parseInt(at, 10)
    if (Number.isFinite(atMs)) {
      const raw = await fetchBinance(`/api/v3/klines?symbol=${pair}&interval=1m&endTime=${atMs}&limit=1`)
      if (Array.isArray(raw) && raw.length > 0) {
        return NextResponse.json({ symbol, price: Number(raw[0][4]), time: Math.floor(raw[0][0] / 1000) })
      }
      return NextResponse.json({ symbol, price: 0 }, { status: 502 })
    }
  }

  // Preco ao vivo
  const data = await fetchBinance(`/api/v3/ticker/price?symbol=${pair}`)
  if (data && data.price) {
    return NextResponse.json({ symbol, price: Number(data.price) })
  }
  return NextResponse.json({ symbol, price: 0 }, { status: 502 })
}
