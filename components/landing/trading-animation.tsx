"use client"

import { useEffect, useRef, useState } from "react"
import { Bitcoin, DollarSign, TrendingUp, TrendingDown } from "lucide-react"

type Candle = {
  open: number
  close: number
  high: number
  low: number
}

function generateCandles(count: number, start = 100): Candle[] {
  const candles: Candle[] = []
  let price = start
  for (let i = 0; i < count; i++) {
    const open = price
    const change = (Math.random() - 0.48) * 10
    const close = Math.max(20, open + change)
    const high = Math.max(open, close) + Math.random() * 5
    const low = Math.min(open, close) - Math.random() * 5
    candles.push({ open, close, high, low })
    price = close
  }
  return candles
}

/**
 * Live animated candlestick chart drawn on a canvas.
 * New candles stream in from the right continuously.
 */
export function TradingAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let width = 0
    let height = 0
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      width = rect.width
      height = rect.height
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener("resize", resize)

    const visibleCandles = 40
    let candles = generateCandles(visibleCandles + 5)
    let offset = 0
    let raf = 0
    let lastAdd = 0

    const draw = (t: number) => {
      ctx.clearRect(0, 0, width, height)

      const candleGap = width / visibleCandles
      const candleWidth = candleGap * 0.55

      // price range across visible candles
      const shown = candles.slice(-visibleCandles - 1)
      let min = Infinity
      let max = -Infinity
      for (const c of shown) {
        min = Math.min(min, c.low)
        max = Math.max(max, c.high)
      }
      const pad = (max - min) * 0.15
      min -= pad
      max += pad
      const range = max - min || 1
      const y = (price: number) => height - ((price - min) / range) * height

      // grid lines
      ctx.strokeStyle = "rgba(37,99,235,0.08)"
      ctx.lineWidth = 1
      for (let i = 1; i < 5; i++) {
        const gy = (height / 5) * i
        ctx.beginPath()
        ctx.moveTo(0, gy)
        ctx.lineTo(width, gy)
        ctx.stroke()
      }

      // area under close line
      ctx.beginPath()
      shown.forEach((c, i) => {
        const cx = i * candleGap - offset * candleGap
        const cy = y(c.close)
        if (i === 0) ctx.moveTo(cx, cy)
        else ctx.lineTo(cx, cy)
      })
      const lastX = (shown.length - 1) * candleGap - offset * candleGap
      ctx.lineTo(lastX, height)
      ctx.lineTo(0 - candleGap, height)
      ctx.closePath()
      const grad = ctx.createLinearGradient(0, 0, 0, height)
      grad.addColorStop(0, "rgba(37,99,235,0.25)")
      grad.addColorStop(1, "rgba(37,99,235,0)")
      ctx.fillStyle = grad
      ctx.fill()

      // candles
      shown.forEach((c, i) => {
        const cx = i * candleGap - offset * candleGap
        const bullish = c.close >= c.open
        const color = bullish ? "#22c55e" : "#ef4444"
        ctx.strokeStyle = color
        ctx.fillStyle = color

        // wick
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.moveTo(cx, y(c.high))
        ctx.lineTo(cx, y(c.low))
        ctx.stroke()

        // body
        const bodyTop = y(Math.max(c.open, c.close))
        const bodyH = Math.max(2, Math.abs(y(c.open) - y(c.close)))
        ctx.globalAlpha = 0.9
        ctx.fillRect(cx - candleWidth / 2, bodyTop, candleWidth, bodyH)
        ctx.globalAlpha = 1
      })

      // latest price dot + glow
      const last = shown[shown.length - 1]
      const px = lastX
      const py = y(last.close)
      ctx.beginPath()
      ctx.arc(px, py, 4, 0, Math.PI * 2)
      ctx.fillStyle = "#3b82f6"
      ctx.shadowColor = "#3b82f6"
      ctx.shadowBlur = 16
      ctx.fill()
      ctx.shadowBlur = 0

      // advance
      offset += 0.02
      if (t - lastAdd > 900) {
        candles.push(generateCandles(1, candles[candles.length - 1].close)[0])
        if (candles.length > visibleCandles + 10) candles = candles.slice(-visibleCandles - 6)
        offset = 0
        lastAdd = t
      }

      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("resize", resize)
    }
  }, [])

  return (
    <div className="relative w-full">
      {/* glow */}
      <div className="absolute inset-0 bg-[#2563eb]/15 blur-[90px] rounded-full" />

      <div className="relative rounded-2xl border border-white/[0.08] bg-[#0a0f1c]/80 backdrop-blur-sm overflow-hidden shadow-[0_20px_80px_-20px_rgba(37,99,235,0.4)]">
        {/* fake terminal header */}
        <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
          <div className="flex items-center gap-2">
            <Bitcoin className="h-5 w-5 text-[#f7931a]" />
            <span className="text-white font-semibold text-sm">BTC/USD</span>
            <span className="flex items-center gap-1 text-[#22c55e] text-xs font-medium">
              <TrendingUp className="h-3.5 w-3.5" />
              +2.84%
            </span>
          </div>
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ef4444]/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#f59e0b]/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#22c55e]/70" />
          </div>
        </div>

        <canvas ref={canvasRef} className="block w-full h-[280px] sm:h-[340px] lg:h-[400px]" />
      </div>

      {/* floating crypto tickers */}
      <FloatingTicker
        className="left-[-8px] top-8"
        icon={<Bitcoin className="h-4 w-4 text-[#f7931a]" />}
        label="BTC"
        value="+2.84%"
        up
        delay="0s"
      />
      <FloatingTicker
        className="right-[-8px] top-24"
        icon={<DollarSign className="h-4 w-4 text-[#3b82f6]" />}
        label="EUR/USD"
        value="-0.42%"
        up={false}
        delay="0.8s"
      />
      <FloatingTicker
        className="left-4 bottom-6"
        icon={<TrendingUp className="h-4 w-4 text-[#22c55e]" />}
        label="ETH"
        value="+4.10%"
        up
        delay="1.6s"
      />
    </div>
  )
}

const marketRows = [
  { icon: Bitcoin, color: "#f7931a", name: "Bitcoin", sym: "BTC/USD", base: 67432.1, initialChange: 1.24 },
  { icon: DollarSign, color: "#3b82f6", name: "Euro / Dólar", sym: "EUR/USD", base: 1.0842, initialChange: 0.42 },
  { icon: TrendingUp, color: "#627eea", name: "Ethereum", sym: "ETH/USD", base: 3521.4, initialChange: -0.86 },
  { icon: DollarSign, color: "#22c55e", name: "Dólar / Real", sym: "USD/BRL", base: 5.432, initialChange: 0.31 },
  { icon: Bitcoin, color: "#a259ff", name: "Solana", sym: "SOL/USD", base: 172.3, initialChange: -1.53 },
  ]

/**
 * Animated "market watch" panel with live-updating prices.
 * Prices tick up/down on an interval to give a real-time feel.
 */
export function MarketWatch() {
  const [rows, setRows] = useState(() =>
    marketRows.map((r) => ({ ...r, price: r.base, change: r.initialChange, flash: "" })),
  )

  useEffect(() => {
    const id = setInterval(() => {
      setRows((prev) =>
        prev.map((r) => {
          const drift = (Math.random() - 0.5) * (r.base * 0.004)
          const price = Math.max(r.base * 0.9, r.price + drift)
          const change = r.change + (Math.random() - 0.5) * 0.3
          return { ...r, price, change, flash: drift >= 0 ? "up" : "down" }
        }),
      )
    }, 1400)
    return () => clearInterval(id)
  }, [])

  const fmt = (n: number) =>
    n >= 1000 ? n.toLocaleString("pt-BR", { maximumFractionDigits: 2 }) : n.toFixed(n < 10 ? 4 : 2)

  return (
    <div className="relative w-full">
      <div className="absolute inset-0 bg-[#2563eb]/15 blur-[90px] rounded-full" />
      <div className="relative rounded-2xl border border-white/[0.08] bg-[#0a0f1c]/80 backdrop-blur-sm overflow-hidden shadow-[0_20px_80px_-20px_rgba(37,99,235,0.4)]">
        <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
          <span className="text-white font-semibold text-sm">Mercados ao vivo</span>
          <span className="flex items-center gap-1.5 text-xs text-[#22c55e]">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#22c55e] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#22c55e]" />
            </span>
            Tempo real
          </span>
        </div>
        <div className="divide-y divide-white/[0.04]">
          {rows.map((r) => {
            const up = r.change >= 0
            return (
              <div key={r.sym} className="flex items-center justify-between px-4 py-3.5">
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-9 w-9 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${r.color}1f` }}
                  >
                    <r.icon className="h-4.5 w-4.5" style={{ color: r.color }} />
                  </span>
                  <div className="leading-tight">
                    <p className="text-white text-sm font-semibold">{r.sym}</p>
                    <p className="text-white/40 text-xs">{r.name}</p>
                  </div>
                </div>
                <div className="text-right leading-tight">
                  <p
                    className={`text-sm font-semibold tabular-nums transition-colors duration-300 ${
                      r.flash === "up" ? "text-[#22c55e]" : r.flash === "down" ? "text-[#ef4444]" : "text-white"
                    }`}
                  >
                    {fmt(r.price)}
                  </p>
                  <p
                    className={`text-xs font-medium flex items-center justify-end gap-0.5 ${
                      up ? "text-[#22c55e]" : "text-[#ef4444]"
                    }`}
                  >
                    {up ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
                    {up ? "+" : ""}
                    {r.change.toFixed(2)}%
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function FloatingTicker({
  className,
  icon,
  label,
  value,
  up,
  delay,
}: {
  className: string
  icon: React.ReactNode
  label: string
  value: string
  up: boolean
  delay: string
}) {
  return (
    <div
      className={`absolute hidden sm:flex items-center gap-2 rounded-xl border border-white/[0.08] bg-[#0a0f1c]/90 backdrop-blur-md px-3 py-2 shadow-lg animate-float ${className}`}
      style={{ animationDelay: delay }}
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.04]">{icon}</span>
      <div className="text-left leading-tight">
        <p className="text-white text-xs font-semibold">{label}</p>
        <p className={`text-[11px] font-medium flex items-center gap-0.5 ${up ? "text-[#22c55e]" : "text-[#ef4444]"}`}>
          {up ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
          {value}
        </p>
      </div>
    </div>
  )
}
