import { NextResponse } from "next/server"
import { OTC_ASSETS, multiAssetEngine } from "@/lib/price-engine/multi-asset-engine"
import { getAssetUI } from "@/lib/asset-catalog"

export const dynamic = "force-dynamic"

function isValidNum(n: number) {
  return typeof n === "number" && Number.isFinite(n) && n > 0
}

export async function GET() {
  const timeframes: (60 | 300 | 600)[] = [60, 300, 600]
  const results: any[] = []
  let failures = 0

  for (const asset of OTC_ASSETS) {
    const issues: string[] = []

    // Preço atual
    const price = multiAssetEngine.getCurrentPrice(asset.symbol)
    if (!isValidNum(price)) issues.push(`preço inválido (${price})`)

    // Metadata de UI
    const ui = getAssetUI(asset.symbol)
    if (!ui || !ui.name) issues.push("sem metadata de UI")
    if (ui && !ui.logo) issues.push("sem logo")

    // Velas por timeframe
    for (const tf of timeframes) {
      const candles = multiAssetEngine.getCandles(asset.symbol, tf)
      if (!candles || candles.length === 0) {
        issues.push(`sem velas tf=${tf}`)
        continue
      }
      for (const c of candles) {
        if (!isValidNum(c.open) || !isValidNum(c.high) || !isValidNum(c.low) || !isValidNum(c.close)) {
          issues.push(`OHLC inválido tf=${tf}`)
          break
        }
        if (c.high < c.low || c.high < c.open || c.high < c.close || c.low > c.open || c.low > c.close) {
          issues.push(`OHLC inconsistente tf=${tf}`)
          break
        }
      }
    }

    if (issues.length) failures++
    results.push({
      symbol: asset.symbol,
      name: ui?.name ?? asset.name,
      price,
      status: issues.length ? "FALHA" : "OK",
      issues,
    })
  }

  return NextResponse.json({
    total: OTC_ASSETS.length,
    ok: OTC_ASSETS.length - failures,
    failures,
    results,
  })
}
