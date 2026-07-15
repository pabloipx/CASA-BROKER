import { NextResponse } from "next/server"
import { REAL_MARKET } from "@/lib/market-data/real-market"

export const dynamic = "force-dynamic"

// Cluster PUBLICO de dados de mercado da Binance (sem chave, sem bloqueio geografico).
const BINANCE_HOSTS = ["https://data-api.binance.vision", "https://api.binance.com"]

// Intervalos nativos da Binance por timeframe (segundos).
const NATIVE_INTERVAL: Record<number, string> = {
  60: "1m",
  180: "3m",
  300: "5m",
  900: "15m",
  1800: "30m",
  3600: "1h",
  14400: "4h",
  86400: "1d",
}

interface RealCandle {
  time: number
  open: number
  high: number
  low: number
  close: number
}

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
  const tf = Math.max(1, Number.parseInt(searchParams.get("tf") || "60", 10))
  const limit = Math.min(500, Math.max(20, Number.parseInt(searchParams.get("limit") || "300", 10)))

  const mapping = REAL_MARKET[symbol]
  if (!mapping) {
    return NextResponse.json({ error: "unknown symbol", candles: [] }, { status: 400 })
  }
  const pair = mapping.binance

  // Escolhe intervalo nativo ou agrega a partir de uma base menor.
  let interval: string
  let aggFactor = 1
  if (NATIVE_INTERVAL[tf]) {
    interval = NATIVE_INTERVAL[tf]
  } else if (tf < 60) {
    interval = "1s"
    aggFactor = tf
  } else {
    interval = "1m"
    aggFactor = Math.max(1, Math.round(tf / 60))
  }

  const fetchLimit = Math.min(1000, limit * aggFactor)
  const raw = await fetchBinance(`/api/v3/klines?symbol=${pair}&interval=${interval}&limit=${fetchLimit}`)

  if (!Array.isArray(raw)) {
    return NextResponse.json({ candles: [] }, { status: 502 })
  }

  // Kline Binance: [openTime(ms), open, high, low, close, volume, closeTime, ...]
  const base: RealCandle[] = raw.map((k: any[]) => ({
    time: Math.floor(k[0] / 1000),
    open: Number(k[1]),
    high: Number(k[2]),
    low: Number(k[3]),
    close: Number(k[4]),
  }))

  let candles: RealCandle[] = base
  if (aggFactor > 1) {
    // Agrega em baldes de tamanho tf (alinhados ao relogio).
    const buckets = new Map<number, RealCandle>()
    for (const c of base) {
      const t = Math.floor(c.time / tf) * tf
      const b = buckets.get(t)
      if (!b) {
        buckets.set(t, { time: t, open: c.open, high: c.high, low: c.low, close: c.close })
      } else {
        b.high = Math.max(b.high, c.high)
        b.low = Math.min(b.low, c.low)
        b.close = c.close
      }
    }
    candles = Array.from(buckets.values()).sort((a, b) => a.time - b.time)
  }

  if (candles.length > limit) candles = candles.slice(candles.length - limit)

  return NextResponse.json({ symbol, tf, candles })
}
