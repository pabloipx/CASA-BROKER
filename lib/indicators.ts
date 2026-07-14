// ============================================================================
// Indicadores tecnicos (funcoes puras) usados no grafico de trade.
// Todos recebem candles ordenados por tempo crescente e retornam series
// no formato { time, value } compativel com lightweight-charts.
// ============================================================================

export interface Candle {
  time: number
  open: number
  high: number
  low: number
  close: number
}

export interface LinePoint {
  time: number
  value: number
}

// ---------------------------------------------------------------------------
// Media Movel Simples (SMA)
// ---------------------------------------------------------------------------
export function sma(candles: Candle[], period: number): LinePoint[] {
  if (period <= 0 || candles.length < period) return []
  const out: LinePoint[] = []
  let sum = 0
  for (let i = 0; i < candles.length; i++) {
    sum += candles[i].close
    if (i >= period) sum -= candles[i - period].close
    if (i >= period - 1) out.push({ time: candles[i].time, value: sum / period })
  }
  return out
}

// ---------------------------------------------------------------------------
// Media Movel Exponencial (EMA) — retorna array alinhado (com undefined no
// aquecimento) para reuso interno em MACD.
// ---------------------------------------------------------------------------
function emaSeries(values: number[], period: number): (number | undefined)[] {
  const out: (number | undefined)[] = new Array(values.length).fill(undefined)
  if (period <= 0 || values.length < period) return out
  const k = 2 / (period + 1)
  // Primeiro valor da EMA = SMA do primeiro bloco.
  let prev = 0
  for (let i = 0; i < period; i++) prev += values[i]
  prev /= period
  out[period - 1] = prev
  for (let i = period; i < values.length; i++) {
    prev = values[i] * k + prev * (1 - k)
    out[i] = prev
  }
  return out
}

export function ema(candles: Candle[], period: number): LinePoint[] {
  const closes = candles.map((c) => c.close)
  const e = emaSeries(closes, period)
  const out: LinePoint[] = []
  for (let i = 0; i < candles.length; i++) {
    if (e[i] !== undefined) out.push({ time: candles[i].time, value: e[i] as number })
  }
  return out
}

// ---------------------------------------------------------------------------
// Bandas de Bollinger (media SMA + N desvios-padrao)
// ---------------------------------------------------------------------------
export function bollinger(
  candles: Candle[],
  period = 20,
  mult = 2,
): { upper: LinePoint[]; middle: LinePoint[]; lower: LinePoint[] } {
  const upper: LinePoint[] = []
  const middle: LinePoint[] = []
  const lower: LinePoint[] = []
  if (candles.length < period) return { upper, middle, lower }
  for (let i = period - 1; i < candles.length; i++) {
    let sum = 0
    for (let j = i - period + 1; j <= i; j++) sum += candles[j].close
    const mean = sum / period
    let variance = 0
    for (let j = i - period + 1; j <= i; j++) {
      const d = candles[j].close - mean
      variance += d * d
    }
    const sd = Math.sqrt(variance / period)
    const t = candles[i].time
    middle.push({ time: t, value: mean })
    upper.push({ time: t, value: mean + mult * sd })
    lower.push({ time: t, value: mean - mult * sd })
  }
  return { upper, middle, lower }
}

// ---------------------------------------------------------------------------
// MACD (12, 26, 9): linha MACD, linha de sinal e histograma
// ---------------------------------------------------------------------------
export function macd(
  candles: Candle[],
  fast = 12,
  slow = 26,
  signalPeriod = 9,
): { macd: LinePoint[]; signal: LinePoint[]; histogram: (LinePoint & { color: string })[] } {
  const closes = candles.map((c) => c.close)
  const fastE = emaSeries(closes, fast)
  const slowE = emaSeries(closes, slow)

  // Linha MACD = EMA rapida - EMA lenta (so onde ambas existem)
  const macdVals: (number | undefined)[] = new Array(candles.length).fill(undefined)
  const macdLine: LinePoint[] = []
  for (let i = 0; i < candles.length; i++) {
    if (fastE[i] !== undefined && slowE[i] !== undefined) {
      const v = (fastE[i] as number) - (slowE[i] as number)
      macdVals[i] = v
      macdLine.push({ time: candles[i].time, value: v })
    }
  }

  // Linha de sinal = EMA(signalPeriod) da linha MACD (ignorando o aquecimento)
  const firstIdx = macdVals.findIndex((v) => v !== undefined)
  const signal: LinePoint[] = []
  const histogram: (LinePoint & { color: string })[] = []
  if (firstIdx >= 0) {
    const compact = macdVals.slice(firstIdx).map((v) => v as number)
    const sigE = emaSeries(compact, signalPeriod)
    for (let k = 0; k < compact.length; k++) {
      const i = firstIdx + k
      if (sigE[k] !== undefined) {
        const s = sigE[k] as number
        signal.push({ time: candles[i].time, value: s })
        const h = compact[k] - s
        histogram.push({
          time: candles[i].time,
          value: h,
          color: h >= 0 ? "rgba(0,230,118,0.5)" : "rgba(255,82,82,0.5)",
        })
      }
    }
  }
  return { macd: macdLine, signal, histogram }
}

// ---------------------------------------------------------------------------
// Fractais de Bill Williams (padrao de 5 velas)
// Up fractal: a maxima do meio e maior que as 2 de cada lado.
// Down fractal: a minima do meio e menor que as 2 de cada lado.
// Retorna marcadores no formato aceito pelo createSeriesMarkers.
// ---------------------------------------------------------------------------
export interface FractalMarker {
  time: number
  position: "aboveBar" | "belowBar"
  color: string
  shape: "arrowDown" | "arrowUp"
  text?: string
}

export function fractals(candles: Candle[]): FractalMarker[] {
  const out: FractalMarker[] = []
  for (let i = 2; i < candles.length - 2; i++) {
    const h = candles[i].high
    const l = candles[i].low
    const isUp =
      h > candles[i - 1].high &&
      h > candles[i - 2].high &&
      h > candles[i + 1].high &&
      h > candles[i + 2].high
    const isDown =
      l < candles[i - 1].low &&
      l < candles[i - 2].low &&
      l < candles[i + 1].low &&
      l < candles[i + 2].low
    if (isUp) {
      out.push({ time: candles[i].time, position: "aboveBar", color: "#38bdf8", shape: "arrowDown" })
    }
    if (isDown) {
      out.push({ time: candles[i].time, position: "belowBar", color: "#f59e0b", shape: "arrowUp" })
    }
  }
  return out
}
