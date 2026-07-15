import { OTC_ASSETS } from "@/lib/price-engine/multi-asset-engine"

export interface AssetUIInfo {
  symbol: string
  name: string
  category: "forex" | "crypto" | "stocks"
  payout: number
  logo: string
}

// Cores de fundo por categoria para os selos gerados
const BADGE_COLORS: Record<string, string> = {
  forex: "#2563eb",
  crypto: "#f7931a",
  stocks: "#16a34a",
  commodities: "#d4af37",
}

/**
 * Gera um logo em SVG (data-URI) com as iniciais do ativo sobre um círculo colorido
 * por categoria. Usado para os ativos que ainda não possuem imagem dedicada, evitando
 * placeholders quebrados e mantendo o visual consistente.
 */
function makeBadge(initials: string, category: string): string {
  const bg = BADGE_COLORS[category] || "#2563eb"
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><circle cx="20" cy="20" r="20" fill="${bg}"/><text x="20" y="21" font-family="Arial, sans-serif" font-size="14" font-weight="700" fill="#ffffff" text-anchor="middle" dominant-baseline="central">${initials}</text></svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

/**
 * Metadados de UI (nome de exibição, categoria, payout e logo) por símbolo.
 * A fonte de verdade dos preços continua sendo OTC_ASSETS no price engine.
 */
const ASSET_UI: Record<string, Omit<AssetUIInfo, "symbol">> = {
  EURUSD_OTC: { name: "EUR/USD (OTC)", category: "forex", payout: 96, logo: "/images/a1640800-8419-484d-9351.jpeg" },
  GBPUSD_OTC: { name: "GBP/USD (OTC)", category: "forex", payout: 96, logo: "/images/5c13c1c5-2d6b-4006-b117.jpeg" },
  USDJPY_OTC: { name: "USD/JPY (OTC)", category: "forex", payout: 96, logo: "/images/06fd67b4-821f-4dad-9daf.jpeg" },
  AUDUSD_OTC: { name: "AUD/USD (OTC)", category: "forex", payout: 96, logo: "/images/82329959-774d-46ff-b731.jpeg" },
  BTCUSD_OTC: { name: "BTC/USD (OTC)", category: "crypto", payout: 96, logo: "/images/a8ba8d63-a559-42c6-955c.jpeg" },
  USDBRL_OTC: { name: "USD/BRL (OTC)", category: "forex", payout: 92, logo: "/images/assets/usdbrl-otc.png" },
  SPACEX_OTC: { name: "SpaceXCoin (OTC)", category: "crypto", payout: 90, logo: "/images/assets/spacex-otc.png" },
  TRUMP_OTC: { name: "TRUMP Coin (OTC)", category: "crypto", payout: 90, logo: "/images/assets/trump-otc.png" },
  AMZN_OTC: { name: "Amazon (OTC)", category: "stocks", payout: 92, logo: "/images/assets/amzn-otc.png" },
  PENUSD_OTC: { name: "PEN/USD (OTC)", category: "forex", payout: 92, logo: "/images/assets/penusd-otc.png" },
  ONDO_OTC: { name: "Ondo (OTC)", category: "crypto", payout: 90, logo: "/images/assets/ondo-otc.png" },
  SHIBUSD_OTC: { name: "SHIB/USD (OTC)", category: "crypto", payout: 90, logo: "/images/assets/shib-otc.png" },
  TSLA_OTC: { name: "Tesla (OTC)", category: "stocks", payout: 92, logo: "/images/assets/tsla-otc.png" },
  PEPE_OTC: { name: "Pepe (OTC)", category: "crypto", payout: 90, logo: "/images/assets/pepe-otc.png" },
  META_OTC: { name: "Meta (OTC)", category: "stocks", payout: 92, logo: "/images/assets/meta-otc.png" },
  DOGE_OTC: { name: "DogeCoin (OTC)", category: "crypto", payout: 90, logo: "/images/assets/doge-otc.png" },

  // ===== Pares abertos (mercado regular) =====
  EURUSD: { name: "EUR/USD", category: "forex", payout: 87, logo: makeBadge("EU", "forex") },
  EURJPY: { name: "EUR/JPY", category: "forex", payout: 87, logo: makeBadge("EJ", "forex") },
  EURCAD: { name: "EUR/CAD", category: "forex", payout: 87, logo: makeBadge("EC", "forex") },
  EURGBP: { name: "EUR/GBP", category: "forex", payout: 87, logo: makeBadge("EG", "forex") },
  GBPUSD: { name: "GBP/USD", category: "forex", payout: 87, logo: makeBadge("GU", "forex") },
  GBPJPY: { name: "GBP/JPY", category: "forex", payout: 87, logo: makeBadge("GJ", "forex") },
  AUDCAD: { name: "AUD/CAD", category: "forex", payout: 87, logo: makeBadge("AC", "forex") },
  AUDJPY: { name: "AUD/JPY", category: "forex", payout: 87, logo: makeBadge("AJ", "forex") },

  // ===== Novos pares OTC =====
  EURJPY_OTC: { name: "EUR/JPY (OTC)", category: "forex", payout: 92, logo: makeBadge("EJ", "forex") },
  EURCAD_OTC: { name: "EUR/CAD (OTC)", category: "forex", payout: 92, logo: makeBadge("EC", "forex") },
  EURGBP_OTC: { name: "EUR/GBP (OTC)", category: "forex", payout: 92, logo: makeBadge("EG", "forex") },
  GBPJPY_OTC: { name: "GBP/JPY (OTC)", category: "forex", payout: 92, logo: makeBadge("GJ", "forex") },
  AUDCAD_OTC: { name: "AUD/CAD (OTC)", category: "forex", payout: 92, logo: makeBadge("AC", "forex") },
  AUDNZD_OTC: { name: "AUD/NZD (OTC)", category: "forex", payout: 92, logo: makeBadge("AN", "forex") },
  AUDJPY_OTC: { name: "AUD/JPY (OTC)", category: "forex", payout: 92, logo: makeBadge("AJ", "forex") },
  XAUUSD_OTC: { name: "XAU/USD (OTC)", category: "commodities", payout: 90, logo: makeBadge("AU", "commodities") },
  SPX500_OTC: { name: "S&P 500 (OTC)", category: "stocks", payout: 90, logo: makeBadge("SP", "stocks") },
  SNAP_OTC: { name: "Snap (OTC)", category: "stocks", payout: 92, logo: makeBadge("SN", "stocks") },
  AAPL_OTC: { name: "Apple (OTC)", category: "stocks", payout: 92, logo: makeBadge("AA", "stocks") },
  GOOGL_OTC: { name: "Google (OTC)", category: "stocks", payout: 92, logo: makeBadge("GO", "stocks") },
  FB_OTC: { name: "Facebook (OTC)", category: "stocks", payout: 92, logo: makeBadge("FB", "stocks") },
  INTC_OTC: { name: "Intel (OTC)", category: "stocks", payout: 92, logo: makeBadge("IN", "stocks") },
  AXP_OTC: { name: "Amex (OTC)", category: "stocks", payout: 92, logo: makeBadge("AX", "stocks") },
  ADAUSD_OTC: { name: "Cardano (OTC)", category: "crypto", payout: 90, logo: makeBadge("AD", "crypto") },
  SOLUSD_OTC: { name: "Solana (OTC)", category: "crypto", payout: 90, logo: makeBadge("SO", "crypto") },

  // ===== Mercado Aberto REAL (Binance) =====
  BTCUSD: { name: "Bitcoin", category: "crypto", payout: 87, logo: makeBadge("BTC", "crypto") },
  ETHUSD: { name: "Ethereum", category: "crypto", payout: 87, logo: makeBadge("ETH", "crypto") },
  SOLUSD: { name: "Solana", category: "crypto", payout: 87, logo: makeBadge("SOL", "crypto") },
  BNBUSD: { name: "BNB", category: "crypto", payout: 87, logo: makeBadge("BNB", "crypto") },
  XRPUSD: { name: "XRP", category: "crypto", payout: 87, logo: makeBadge("XRP", "crypto") },
  ADAUSD: { name: "Cardano", category: "crypto", payout: 87, logo: makeBadge("ADA", "crypto") },
  DOGEUSD: { name: "Dogecoin", category: "crypto", payout: 87, logo: makeBadge("DOGE", "crypto") },
  LTCUSD: { name: "Litecoin", category: "crypto", payout: 87, logo: makeBadge("LTC", "crypto") },
}

const FALLBACK_LOGO = "/placeholder.svg"

/** Catálogo completo (todos os ativos existentes no price engine + metadados de UI). */
export const ASSET_CATALOG: AssetUIInfo[] = OTC_ASSETS.map((a) => {
  const ui = ASSET_UI[a.symbol]
  return {
    symbol: a.symbol,
    name: ui?.name || a.name,
    category: ui?.category || "forex",
    payout: ui?.payout ?? 90,
    logo: ui?.logo || FALLBACK_LOGO,
  }
})

export function getAssetUI(symbol: string): AssetUIInfo | undefined {
  return ASSET_CATALOG.find((a) => a.symbol === symbol)
}
