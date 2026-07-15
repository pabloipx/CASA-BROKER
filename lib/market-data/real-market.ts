/**
 * REAL MARKET DATA (Binance) — dados de mercado REAIS para os ativos de "Mercado Aberto".
 *
 * Diferente do multiAssetEngine (sintetico/deterministico usado nos ativos OTC), este modulo
 * espelha precos REAIS da Binance. Ele expoe a MESMA interface do multiAssetEngine
 * (getCandles / getHistory / getCurrentPrice / getCurrentCandle / getPriceAtTime), para ser um
 * "drop-in": o grafico, o hook de preco e a liquidacao apenas escolhem a fonte conforme o ativo.
 *
 * Os dados sao buscados via nosso proxy server-side (/api/market/*), que consome o cluster
 * publico de dados da Binance (data-api.binance.vision) — sem chave e sem bloqueio geografico.
 * Um unico poller mantem o ativo ATIVO atualizado (preco a cada ~1.2s, velas a cada ~5s).
 */

export interface RealCandle {
  time: number // segundos (inicio da vela)
  open: number
  high: number
  low: number
  close: number
}

// Mapa dos ativos de mercado aberto (simbolo do app -> par da Binance + casas decimais).
export const REAL_MARKET: Record<string, { binance: string; decimals: number }> = {
  BTCUSD: { binance: "BTCUSDT", decimals: 2 },
  ETHUSD: { binance: "ETHUSDT", decimals: 2 },
  SOLUSD: { binance: "SOLUSDT", decimals: 2 },
  BNBUSD: { binance: "BNBUSDT", decimals: 2 },
  XRPUSD: { binance: "XRPUSDT", decimals: 4 },
  ADAUSD: { binance: "ADAUSDT", decimals: 4 },
  DOGEUSD: { binance: "DOGEUSDT", decimals: 5 },
  LTCUSD: { binance: "LTCUSDT", decimals: 2 },
}

export const REAL_SYMBOLS = new Set(Object.keys(REAL_MARKET))

/** Este ativo usa dados reais da Binance? */
export function isRealAsset(symbol: string): boolean {
  return REAL_SYMBOLS.has(symbol)
}

// ============================================================================
// Cache client-side + poller
// ============================================================================
interface AssetStore {
  candlesByTf: Map<number, RealCandle[]>
  lastPrice: number
}

const store = new Map<string, AssetStore>()
const subs = new Set<() => void>()

let activeSymbol = ""
let activeTf = 60
let priceTimer: ReturnType<typeof setInterval> | null = null
let klineTimer: ReturnType<typeof setInterval> | null = null

function getStore(sym: string): AssetStore {
  let s = store.get(sym)
  if (!s) {
    s = { candlesByTf: new Map(), lastPrice: 0 }
    store.set(sym, s)
  }
  return s
}

function notify() {
  subs.forEach((cb) => {
    try {
      cb()
    } catch {}
  })
}

async function fetchKlines(sym: string, tf: number) {
  if (!isRealAsset(sym)) return
  try {
    const res = await fetch(`/api/market/klines?symbol=${encodeURIComponent(sym)}&tf=${tf}&limit=300`, {
      cache: "no-store",
    })
    if (!res.ok) return
    const json = await res.json()
    const candles: RealCandle[] = json?.candles || []
    if (candles.length === 0) return
    const s = getStore(sym)
    s.candlesByTf.set(tf, candles)
    // Preco atual: fecha da ultima vela, caso ainda nao tenhamos um tick de preco.
    if (s.lastPrice <= 0) s.lastPrice = candles[candles.length - 1].close
    notify()
  } catch {}
}

async function fetchPrice(sym: string) {
  if (!isRealAsset(sym)) return
  try {
    const res = await fetch(`/api/market/price?symbol=${encodeURIComponent(sym)}`, { cache: "no-store" })
    if (!res.ok) return
    const json = await res.json()
    const p = Number(json?.price)
    if (p > 0) {
      getStore(sym).lastPrice = p
      notify()
    }
  } catch {}
}

function stopTimers() {
  if (priceTimer) {
    clearInterval(priceTimer)
    priceTimer = null
  }
  if (klineTimer) {
    clearInterval(klineTimer)
    klineTimer = null
  }
}

/** Define o ativo/timeframe ATIVO e (re)inicia o poller. Idempotente. */
export function setActive(symbol: string, timeframe: number) {
  if (typeof window === "undefined") return
  if (!isRealAsset(symbol)) {
    // Ativo sintetico: nao precisamos de poller (mas mantemos o cache dos reais).
    activeSymbol = ""
    stopTimers()
    return
  }
  if (symbol === activeSymbol && timeframe === activeTf && priceTimer) return
  activeSymbol = symbol
  activeTf = timeframe
  stopTimers()

  // Carga imediata
  fetchKlines(symbol, timeframe)
  fetchPrice(symbol)

  // Poller: preco frequente (movimento vivo) + velas periodicas (integridade do historico).
  priceTimer = setInterval(() => fetchPrice(activeSymbol), 1200)
  klineTimer = setInterval(() => fetchKlines(activeSymbol, activeTf), 5000)
}

export function subscribe(cb: () => void): () => void {
  subs.add(cb)
  return () => {
    subs.delete(cb)
  }
}

// ============================================================================
// Interface compativel com o multiAssetEngine
// ============================================================================
function candlesFor(sym: string, tf: number): RealCandle[] {
  return getStore(sym).candlesByTf.get(tf) || []
}

export const realMarketEngine = {
  getHistory(symbol: string, timeframe: number): RealCandle[] {
    return candlesFor(symbol, timeframe)
  },
  getCandles(symbol: string, timeframe: number): RealCandle[] {
    return candlesFor(symbol, timeframe)
  },
  getCurrentPrice(symbol: string): number {
    return getStore(symbol).lastPrice || 0
  },
  getCurrentCandle(symbol: string, timeframe: number): RealCandle | null {
    const arr = candlesFor(symbol, timeframe)
    if (arr.length === 0) return null
    const price = getStore(symbol).lastPrice || arr[arr.length - 1].close
    const nowSec = Math.floor(Date.now() / 1000)
    const t = Math.floor(nowSec / timeframe) * timeframe
    const last = arr[arr.length - 1]
    if (last.time === t) {
      return { time: t, open: last.open, high: Math.max(last.high, price), low: Math.min(last.low, price), close: price }
    }
    // Nova vela em formacao ancorada no fecho anterior.
    return { time: t, open: last.close, high: Math.max(last.close, price), low: Math.min(last.close, price), close: price }
  },
  getPriceAtTime(symbol: string, timeSec: number): number {
    // Procura a vela que cobre o instante (na menor timeframe cacheada). Fallback: ultimo preco.
    const s = getStore(symbol)
    let best = 0
    for (const [tf, arr] of s.candlesByTf) {
      for (let i = arr.length - 1; i >= 0; i--) {
        if (arr[i].time <= timeSec && timeSec < arr[i].time + tf) {
          return arr[i].close
        }
      }
    }
    return best || s.lastPrice || 0
  },
}

/**
 * Busca (assincrona) o preco REAL num instante passado — usado na liquidacao de operacoes
 * que expiraram enquanto o usuario estava ausente (rede de seguranca). Retorna 0 em caso de erro.
 */
export async function fetchRealPriceAt(symbol: string, atMs: number): Promise<number> {
  if (!isRealAsset(symbol)) return 0
  try {
    const res = await fetch(`/api/market/price?symbol=${encodeURIComponent(symbol)}&at=${atMs}`, { cache: "no-store" })
    if (!res.ok) return 0
    const json = await res.json()
    const p = Number(json?.price)
    return p > 0 ? p : 0
  } catch {
    return 0
  }
}
