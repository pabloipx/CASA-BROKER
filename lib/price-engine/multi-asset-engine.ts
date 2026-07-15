/**
 * MULTI-ASSET OTC ENGINE - Realistic Market Phases
 * 
 * Market phases that cycle naturally:
 *  - UPTREND:       gradual climb, higher highs
 *  - DOWNTREND:     gradual drop, lower lows
 *  - CONSOLIDATION: tight range, small moves
 * 
 * Each phase lasts 15-45 seconds, with smooth blending between them.
 * Deterministic: same timestamp always produces the same price.
 */

export interface OTCCandle {
  time: number
  open: number
  high: number
  low: number
  close: number
}

export interface OTCAsset {
  symbol: string
  name: string
  basePrice: number
  pipSize: number
  volatility: number
  icon: string
  decimals: number
}

export const OTC_ASSETS: OTCAsset[] = [
  { symbol: "EURUSD_OTC", name: "EUR/USD OTC", basePrice: 1.085, pipSize: 0.00001, volatility: 35, icon: "EU", decimals: 5 },
  { symbol: "GBPUSD_OTC", name: "GBP/USD OTC", basePrice: 1.265, pipSize: 0.00001, volatility: 40, icon: "GB", decimals: 5 },
  { symbol: "USDJPY_OTC", name: "USD/JPY OTC", basePrice: 149.5, pipSize: 0.001, volatility: 38, icon: "JP", decimals: 3 },
  { symbol: "AUDUSD_OTC", name: "AUD/USD OTC", basePrice: 0.655, pipSize: 0.00001, volatility: 32, icon: "AU", decimals: 5 },
  { symbol: "BTCUSD_OTC", name: "BTC/USD OTC", basePrice: 43500, pipSize: 0.01, volatility: 150, icon: "BTC", decimals: 2 },
  // Novos ativos
  { symbol: "USDBRL_OTC", name: "USD/BRL OTC", basePrice: 5.42, pipSize: 0.0001, volatility: 34, icon: "BR", decimals: 4 },
  { symbol: "SPACEX_OTC", name: "SpaceXCoin OTC", basePrice: 18.75, pipSize: 0.001, volatility: 130, icon: "SX", decimals: 3 },
  { symbol: "TRUMP_OTC", name: "TRUMP Coin OTC", basePrice: 9.4, pipSize: 0.001, volatility: 120, icon: "TR", decimals: 3 },
  { symbol: "AMZN_OTC", name: "Amazon OTC", basePrice: 178.5, pipSize: 0.01, volatility: 60, icon: "AMZ", decimals: 2 },
  { symbol: "PENUSD_OTC", name: "PEN/USD OTC", basePrice: 0.267, pipSize: 0.00001, volatility: 28, icon: "PE", decimals: 5 },
  // Lote adicional
  { symbol: "ONDO_OTC", name: "Ondo OTC", basePrice: 1.18, pipSize: 0.0001, volatility: 110, icon: "OND", decimals: 4 },
  { symbol: "SHIBUSD_OTC", name: "SHIB/USD OTC", basePrice: 0.0000245, pipSize: 0.0000001, volatility: 140, icon: "SHIB", decimals: 8 },
  { symbol: "TSLA_OTC", name: "Tesla OTC", basePrice: 248.6, pipSize: 0.01, volatility: 70, icon: "TSLA", decimals: 2 },
  { symbol: "PEPE_OTC", name: "Pepe OTC", basePrice: 0.0000118, pipSize: 0.0000001, volatility: 160, icon: "PEPE", decimals: 8 },
  { symbol: "META_OTC", name: "Meta OTC", basePrice: 482.3, pipSize: 0.01, volatility: 65, icon: "META", decimals: 2 },
  { symbol: "DOGE_OTC", name: "DogeCoin OTC", basePrice: 0.162, pipSize: 0.00001, volatility: 135, icon: "DOGE", decimals: 5 },

  // ===== Pares abertos (mercado regular) =====
  { symbol: "EURUSD", name: "EUR/USD", basePrice: 1.085, pipSize: 0.00001, volatility: 35, icon: "EU", decimals: 5 },
  { symbol: "EURJPY", name: "EUR/JPY", basePrice: 162.3, pipSize: 0.001, volatility: 38, icon: "EJ", decimals: 3 },
  { symbol: "EURCAD", name: "EUR/CAD", basePrice: 1.472, pipSize: 0.00001, volatility: 34, icon: "EC", decimals: 5 },
  { symbol: "EURGBP", name: "EUR/GBP", basePrice: 0.857, pipSize: 0.00001, volatility: 30, icon: "EG", decimals: 5 },
  { symbol: "GBPUSD", name: "GBP/USD", basePrice: 1.265, pipSize: 0.00001, volatility: 40, icon: "GU", decimals: 5 },
  { symbol: "GBPJPY", name: "GBP/JPY", basePrice: 189.2, pipSize: 0.001, volatility: 42, icon: "GJ", decimals: 3 },
  { symbol: "AUDCAD", name: "AUD/CAD", basePrice: 0.895, pipSize: 0.00001, volatility: 32, icon: "AC", decimals: 5 },
  { symbol: "AUDJPY", name: "AUD/JPY", basePrice: 97.9, pipSize: 0.001, volatility: 36, icon: "AJ", decimals: 3 },

  // ===== Novos pares OTC =====
  { symbol: "EURJPY_OTC", name: "EUR/JPY OTC", basePrice: 162.3, pipSize: 0.001, volatility: 38, icon: "EJ", decimals: 3 },
  { symbol: "EURCAD_OTC", name: "EUR/CAD OTC", basePrice: 1.472, pipSize: 0.00001, volatility: 34, icon: "EC", decimals: 5 },
  { symbol: "EURGBP_OTC", name: "EUR/GBP OTC", basePrice: 0.857, pipSize: 0.00001, volatility: 30, icon: "EG", decimals: 5 },
  { symbol: "GBPJPY_OTC", name: "GBP/JPY OTC", basePrice: 189.2, pipSize: 0.001, volatility: 42, icon: "GJ", decimals: 3 },
  { symbol: "AUDCAD_OTC", name: "AUD/CAD OTC", basePrice: 0.895, pipSize: 0.00001, volatility: 32, icon: "AC", decimals: 5 },
  { symbol: "AUDNZD_OTC", name: "AUD/NZD OTC", basePrice: 1.086, pipSize: 0.00001, volatility: 31, icon: "AN", decimals: 5 },
  { symbol: "AUDJPY_OTC", name: "AUD/JPY OTC", basePrice: 97.9, pipSize: 0.001, volatility: 36, icon: "AJ", decimals: 3 },
  { symbol: "XAUUSD_OTC", name: "XAU/USD OTC", basePrice: 2350.0, pipSize: 0.01, volatility: 70, icon: "XAU", decimals: 2 },
  { symbol: "SPX500_OTC", name: "S&P 500 OTC", basePrice: 5200.0, pipSize: 0.1, volatility: 55, icon: "SPX", decimals: 2 },
  { symbol: "SNAP_OTC", name: "Snap OTC", basePrice: 11.2, pipSize: 0.01, volatility: 80, icon: "SNAP", decimals: 2 },
  { symbol: "AAPL_OTC", name: "Apple OTC", basePrice: 185.0, pipSize: 0.01, volatility: 60, icon: "AAPL", decimals: 2 },
  { symbol: "GOOGL_OTC", name: "Google OTC", basePrice: 168.0, pipSize: 0.01, volatility: 60, icon: "GOOG", decimals: 2 },
  { symbol: "FB_OTC", name: "Facebook OTC", basePrice: 482.0, pipSize: 0.01, volatility: 65, icon: "FB", decimals: 2 },
  { symbol: "INTC_OTC", name: "Intel OTC", basePrice: 30.5, pipSize: 0.01, volatility: 72, icon: "INTC", decimals: 2 },
  { symbol: "AXP_OTC", name: "Amex OTC", basePrice: 240.0, pipSize: 0.01, volatility: 58, icon: "AXP", decimals: 2 },
  { symbol: "ADAUSD_OTC", name: "Cardano OTC", basePrice: 0.45, pipSize: 0.0001, volatility: 115, icon: "ADA", decimals: 4 },
  { symbol: "SOLUSD_OTC", name: "Solana OTC", basePrice: 145.0, pipSize: 0.01, volatility: 130, icon: "SOL", decimals: 2 },

  // ===== Mercado Aberto REAL (dados ao vivo da Binance) =====
  // basePrice e apenas um valor inicial; o preco real vem do realMarketEngine em runtime.
  { symbol: "BTCUSD", name: "Bitcoin", basePrice: 95000, pipSize: 0.01, volatility: 150, icon: "BTC", decimals: 2 },
  { symbol: "ETHUSD", name: "Ethereum", basePrice: 3500, pipSize: 0.01, volatility: 140, icon: "ETH", decimals: 2 },
  { symbol: "SOLUSD", name: "Solana", basePrice: 200, pipSize: 0.01, volatility: 150, icon: "SOL", decimals: 2 },
  { symbol: "BNBUSD", name: "BNB", basePrice: 700, pipSize: 0.01, volatility: 130, icon: "BNB", decimals: 2 },
  { symbol: "XRPUSD", name: "XRP", basePrice: 2.2, pipSize: 0.0001, volatility: 140, icon: "XRP", decimals: 4 },
  { symbol: "ADAUSD", name: "Cardano", basePrice: 1.0, pipSize: 0.0001, volatility: 130, icon: "ADA", decimals: 4 },
  { symbol: "DOGEUSD", name: "Dogecoin", basePrice: 0.38, pipSize: 0.00001, volatility: 150, icon: "DOGE", decimals: 5 },
  { symbol: "LTCUSD", name: "Litecoin", basePrice: 100, pipSize: 0.01, volatility: 130, icon: "LTC", decimals: 2 },
]

// =============================================
// DETERMINISTIC RNG
// =============================================
function srand(seed: number): number {
  const x = Math.sin(seed * 12345.6789 + 0.7) * 43758.5453
  return x - Math.floor(x)
}

// =============================================
// PURE, STATELESS PRICE GENERATION
// =============================================
// IMPORTANT: This must be a pure function of (asset, timestamp). It cannot depend
// on any mutable cache of a "previous tick", because in serverless the process
// memory is cold between requests, which made the previous implementation collapse
// to basePrice on every call (a frozen chart). We build a continuous, smoothly
// moving price by layering value-noise octaves over time — deterministic and O(1).

// Smooth value noise in [-1, 1]: interpolate deterministic randoms at integer steps.
function valueNoise(x: number, seed: number): number {
  const i = Math.floor(x)
  const f = x - i
  const a = srand(i + seed)
  const b = srand(i + 1 + seed)
  const u = f * f * (3 - 2 * f) // smoothstep
  return (a * (1 - u) + b * u) * 2 - 1
}

// ============================================================================
// DUAS CAMADAS: TENDENCIA + TEXTURA
// ============================================================================
// O erro do modelo antigo era somar TODAS as oitavas, normalizar para [-1,1] e
// prender o preco numa banda fixa e estreita (~0.6%). Isso deixava o mercado SEMPRE
// lateral, sem tendencias longas (altista/baixista).
//
// Agora separamos em duas camadas independentes:
//
//  1) TENDENCIA (trend): ondas de PERIODO LONGO com amplitude GRANDE, medida em % do
//     preco. Sao elas que levam o preco para cima/baixo por varios minutos, criando
//     movimentos direcionais claros (subidas, quedas, topos, fundos). NAO sao presas
//     por banda estreita — so ha uma trava de seguranca bem larga (+-18%).
//
//  2) TEXTURA (texture): ruido RAPIDO de amplitude pequena que da a "vida" tick a tick
//     (as pequenas oscilacoes dentro de cada vela), sem mascarar a tendencia.
//
// Ambas continuam PURAS e deterministicas (funcao de asset+timestamp), O(1) e estaveis
// (senoide/valueNoise sao limitados), entao funcionam bem em serverless (sem estado).

// Camada de tendencia — amplitude relativa (fracao do movimento total de tendencia).
// Periodos longos (varios minutos) para gerar tendencias sustentadas.
const TREND_OCTAVES = [
  { period: 2600, amp: 1.0 }, // ~43 min: macro tendencia
  { period: 900, amp: 0.6 }, // ~15 min: swing principal
  { period: 320, amp: 0.34 }, // ~5 min: perna de tendencia
  { period: 110, amp: 0.18 }, // ~2 min: micro tendencia
]
const TREND_OCTAVE_TOTAL = TREND_OCTAVES.reduce((s, o) => s + o.amp, 0)

// Camada de textura — ruido rapido (dentro da vela), amplitude relativa pequena.
const TEXTURE_OCTAVES = [
  { period: 34, amp: 0.5 }, // ~34 s
  { period: 12, amp: 0.3 }, // ~12 s
  { period: 4.5, amp: 0.2 }, // ~4.5 s micro
]
const TEXTURE_OCTAVE_TOTAL = TEXTURE_OCTAVES.reduce((s, o) => s + o.amp, 0)

// =============================================
// MANIPULACAO DE VELAS (controle do admin)
// =============================================
// O admin pode agendar, para um ativo e um intervalo de tempo, uma direcao forcada
// (UP = vela sobe / DOWN = vela desce). Enquanto uma manipulacao esta ativa, injetamos
// um vies (bias) crescente sobre o preco deterministico. Como TODO o app (grafico e
// liquidacao de operacoes) le o preco por esta mesma funcao, o resultado Win/Loss segue
// a direcao configurada automaticamente.
export type ManipulationIntensity = "SOFT" | "MEDIUM" | "STRONG"

export interface CandleManipulation {
  symbol: string
  direction: "UP" | "DOWN"
  startMs: number
  endMs: number
  intensity?: ManipulationIntensity
}

// Multiplicador de forca por intensidade. Quanto maior, mais agressivo o movimento da vela.
const INTENSITY_MULTIPLIER: Record<ManipulationIntensity, number> = {
  SOFT: 1.4,
  MEDIUM: 2.5,
  STRONG: 4.0,
}

let ACTIVE_MANIPULATIONS: CandleManipulation[] = []

/** Substitui a lista de manipulacoes ativas (chamado pelo cliente e pelo servidor). */
export function setManipulations(list: CandleManipulation[]) {
  ACTIVE_MANIPULATIONS = Array.isArray(list) ? list : []
}

export function getManipulations(): CandleManipulation[] {
  return ACTIVE_MANIPULATIONS
}

/** Retorna a manipulacao ativa para um ativo em um dado instante (ms), se houver. */
function findManipulation(symbol: string, tMs: number): CandleManipulation | null {
  for (const m of ACTIVE_MANIPULATIONS) {
    if (m.symbol === symbol && tMs >= m.startMs && tMs <= m.endMs) return m
  }
  return null
}

// Onda triangular suave em [0,1] usada para criar "pausas": quando o mercado entra
// numa janela de consolidacao, comprimimos a amplitude do ruido por alguns segundos,
// simulando aquelas paradinhas rapidas antes de o preco voltar a andar.
function pauseEnvelope(timestamp: number, seed: number): number {
  // A cada ~9s decidimos se estamos numa fase de "andar" (1.0) ou "pausar" (~0.28).
  const slot = Math.floor(timestamp / 9)
  const r = srand(slot * 3.11 + seed)
  const isPause = r > 0.72 // ~28% dos slots sao pausas curtas
  if (!isPause) return 1
  // Suaviza a entrada/saida da pausa para nao "travar" bruscamente.
  const f = (timestamp / 9) - slot
  const smooth = Math.sin(f * Math.PI) // 0 -> 1 -> 0 dentro do slot
  return 1 - 0.72 * smooth
}

function getLivePrice(asset: OTCAsset, timestamp: number): number {
  const symSeed = asset.basePrice * 13.37

  // ---- CAMADA 1: TENDENCIA (movimento amplo e direcional) ----
  // Cada ativo tem um deslocamento de fase proprio (por symSeed), entao ativos diferentes
  // estao em tendencias diferentes ao mesmo tempo (um subindo, outro caindo, outro lateral).
  let trend = 0
  for (let i = 0; i < TREND_OCTAVES.length; i++) {
    const { period, amp } = TREND_OCTAVES[i]
    trend += valueNoise(timestamp / period + i * 137.5 + symSeed, symSeed + i) * amp
  }
  trend = trend / TREND_OCTAVE_TOTAL // ~[-1, 1]

  // Amplitude da tendencia em % do preco: escala com a volatilidade do ativo.
  // vol ~28..160 -> ~3.5%..10%. E aqui que nascem as subidas/quedas visiveis por minutos.
  const trendPct = 0.03 + (asset.volatility / 100) * 0.045
  const trendDev = trend * asset.basePrice * trendPct

  // ---- CAMADA 2: TEXTURA (ruido rapido dentro da vela) ----
  let texture = 0
  for (let i = 0; i < TEXTURE_OCTAVES.length; i++) {
    const { period, amp } = TEXTURE_OCTAVES[i]
    texture += valueNoise(timestamp / period + i * 71.3 + symSeed, symSeed + 900 + i) * amp
  }
  texture = texture / TEXTURE_OCTAVE_TOTAL // ~[-1, 1]
  // Textura reduzida durante pausas curtas, para dar aquelas "paradinhas" naturais.
  texture *= pauseEnvelope(timestamp, symSeed)
  const texturePct = 0.004 + (asset.volatility / 100) * 0.01
  const textureDev = texture * asset.basePrice * texturePct

  let price = asset.basePrice + trendDev + textureDev

  // Trava de seguranca BEM LARGA (so evita estourar a escala em casos extremos).
  const safeCap = asset.basePrice * 0.18
  price = Math.max(asset.basePrice - safeCap, Math.min(asset.basePrice + safeCap, price))

  // ---- Aplica manipulacao do admin, se ativa para este ativo/instante ----
  const manip = ACTIVE_MANIPULATIONS.length ? findManipulation(asset.symbol, timestamp * 1000) : null
  if (manip) {
    const dur = Math.max(1, manip.endMs - manip.startMs)
    const progress = Math.min(1, Math.max(0, (timestamp * 1000 - manip.startMs) / dur))
    // smoothstep: acelera no comeco e desacelera no fim, como um movimento real.
    const eased = progress * progress * (3 - 2 * progress)
    const mult = INTENSITY_MULTIPLIER[manip.intensity || "MEDIUM"]
    const dir = manip.direction === "UP" ? 1 : -1

    // Deslocamento direcional total (a "trilha" que a vela deve seguir ate o fim da janela).
    const target = asset.basePrice * texturePct * 6 * mult * eased

    // Mantem a textura natural do candle e adiciona recuos VISIVEIS candle a candle, mas a
    // deriva direcional (target) sempre vence no conjunto, respeitando a direcao do admin.
    const jitter =
      valueNoise(timestamp / 8 + symSeed, symSeed + 313) * 0.6 +
      valueNoise(timestamp / 3 + symSeed, symSeed + 517) * 0.4
    const naturalSwing = asset.basePrice * texturePct * 6 * mult * 0.9 * jitter * (0.4 + 0.6 * eased)

    // Durante a manipulacao, a tendencia natural fica reduzida para nao brigar com a direcao forcada.
    price = asset.basePrice + trendDev * 0.3 + textureDev
    price += dir * target + naturalSwing

    if (price <= 0) price = asset.basePrice * 0.5
  }

  const prec = asset.decimals
  return Number(price.toFixed(prec))
}

// =============================================
// HISTORICAL CANDLE BUILDER
// =============================================
function buildCandle(asset: OTCAsset, startTime: number, timeframe: number): OTCCandle {
  const prec = asset.decimals
  // Only 10 samples per candle (was 60) - 6x faster, still realistic OHLC
  const samples = 10
  const prices: number[] = []

  for (let i = 0; i <= samples; i++) {
    const t = startTime + (i * timeframe) / samples
    prices.push(getLivePrice(asset, t))
  }

  const open = prices[0]
  const close = prices[prices.length - 1]
  let high = Math.max(...prices)
  let low = Math.min(...prices)

  // Realistic wicks
  const sd = startTime * 7777
  const body = Math.abs(close - open) || asset.pipSize * 5
  if (srand(sd * 3) > 0.35) high = Math.max(high, Math.max(open, close) + body * (0.2 + srand(sd * 5) * 1.0))
  if (srand(sd * 7) > 0.35) low = Math.min(low, Math.min(open, close) - body * (0.2 + srand(sd * 9) * 1.0))

  return {
    time: startTime,
    open: Number(open.toFixed(prec)),
    high: Number(high.toFixed(prec)),
    low: Number(low.toFixed(prec)),
    close: Number(close.toFixed(prec)),
  }
}

// =============================================
// SINGLETON ENGINE
// =============================================
class MultiAssetEngine {
  private static instance: MultiAssetEngine | null = null
  private maxCandles = 30
  private cache = new Map<string, { ts: number; data: any }>()

  private constructor() {}
  static getInstance(): MultiAssetEngine {
    if (!MultiAssetEngine.instance) MultiAssetEngine.instance = new MultiAssetEngine()
    return MultiAssetEngine.instance
  }

  getCurrentPrice(symbol: string): number {
    const asset = OTC_ASSETS.find(a => a.symbol === symbol)
    if (!asset) return 0
    return getLivePrice(asset, Date.now() / 1000)
  }

  // Preco deterministico (com manipulacao aplicada, se houver) em um instante especifico (segundos).
  getPriceAtTime(symbol: string, timestampSeconds: number): number {
    const asset = OTC_ASSETS.find(a => a.symbol === symbol)
    if (!asset) return 0
    return getLivePrice(asset, timestampSeconds)
  }

  getCandles(symbol: string, timeframe: number): OTCCandle[] {
    const asset = OTC_ASSETS.find(a => a.symbol === symbol)
    if (!asset) return []
    const now = Math.floor(Date.now() / 1000)
    const candleStart = Math.floor(now / timeframe) * timeframe
    const candles: OTCCandle[] = []
    for (let i = this.maxCandles; i > 0; i--) {
      candles.push(buildCandle(asset, candleStart - i * timeframe, timeframe))
    }
    return candles
  }

  // Returns ~24h of candles for the given timeframe, built oldest-first.
  getHistory(symbol: string, timeframe: number): OTCCandle[] {
    const asset = OTC_ASSETS.find(a => a.symbol === symbol)
    if (!asset) return []
    const now = Math.floor(Date.now() / 1000)
    const candleStart = Math.floor(now / timeframe) * timeframe
    const count = Math.min(1440, Math.ceil((24 * 60 * 60) / timeframe))
    const candles: OTCCandle[] = []
    for (let i = count; i > 0; i--) {
      candles.push(buildCandle(asset, candleStart - i * timeframe, timeframe))
    }
    return candles
  }

  getCurrentCandle(symbol: string, timeframe: number): OTCCandle | null {
    const asset = OTC_ASSETS.find(a => a.symbol === symbol)
    if (!asset) return null
    const now = Date.now() / 1000
    const candleStart = Math.floor(now / timeframe) * timeframe
    const prec = asset.decimals

    const openPrice = getLivePrice(asset, candleStart)
    const closePrice = getLivePrice(asset, now)
    // Only 5 samples instead of per-second loop (was O(elapsed), now O(1))
    let high = Math.max(openPrice, closePrice)
    let low = Math.min(openPrice, closePrice)
    const elapsed = now - candleStart
    for (let i = 1; i <= 4; i++) {
      const t = candleStart + (elapsed * i) / 5
      const p = getLivePrice(asset, t)
      if (p > high) high = p
      if (p < low) low = p
    }

    return {
      time: candleStart,
      open: Number(openPrice.toFixed(prec)),
      high: Number(high.toFixed(prec)),
      low: Number(low.toFixed(prec)),
      close: Number(closePrice.toFixed(prec)),
    }
  }

  getAssetState(symbol: string, timeframe: number) {
    const asset = OTC_ASSETS.find(a => a.symbol === symbol)
    const now = Math.floor(Date.now() / 1000)
    const cacheKey = `${symbol}_${timeframe}`
    const cached = this.cache.get(cacheKey)

    // Cache candles for 5 seconds (deterministic, only change at candle boundary)
    let candles
    if (cached && now - cached.ts < 5) {
      candles = cached.data
    } else {
      candles = this.getCandles(symbol, timeframe)
      this.cache.set(cacheKey, { ts: now, data: candles })
    }

    return {
      symbol,
      name: asset?.name || symbol,
      price: this.getCurrentPrice(symbol),
      timestamp: now,
      candles,
      currentCandle: this.getCurrentCandle(symbol, timeframe),
      timeframe,
    }
  }

  isEngineRunning() { return true }
  getLastTickTime() { return Math.floor(Date.now() / 1000) }
  start() {}
  stop() {}
}

export const multiAssetEngine = MultiAssetEngine.getInstance()
export const getMultiAssetEngine = () => MultiAssetEngine.getInstance()
