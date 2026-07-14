"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { ChevronLeft, Search, Copy, Trash2, UserPlus, Check, X, Loader2, Users, Activity } from "lucide-react"

const MIN_COPY_AMOUNT = 5

interface SearchResult {
  id: string
  full_name: string
  email: string
  totalTrades: number
  isFollowing: boolean
}

interface Following {
  id: string
  masterId: string
  masterName: string
  masterEmail: string
  fixedAmount: number
  active: boolean
}

export default function CopyTradePage() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)

  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)

  const [following, setFollowing] = useState<Following[]>([])
  const [loadingFollowing, setLoadingFollowing] = useState(true)

  // Trader selecionado no resultado para definir o valor fixo antes de seguir.
  const [pendingMaster, setPendingMaster] = useState<SearchResult | null>(null)
  const [pendingAmount, setPendingAmount] = useState("5")
  const [savingFollow, setSavingFollow] = useState(false)

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.replace("/auth/login")
        return
      }
      setChecking(false)
    })
  }, [router])

  const loadFollowing = useCallback(async () => {
    setLoadingFollowing(true)
    try {
      const res = await fetch("/api/copy")
      const data = await res.json()
      setFollowing(data.following || [])
    } catch {
      setFollowing([])
    } finally {
      setLoadingFollowing(false)
    }
  }, [])

  useEffect(() => {
    if (!checking) loadFollowing()
  }, [checking, loadFollowing])

  // Busca com debounce.
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (query.trim().length < 2) {
      setResults([])
      setSearching(false)
      return
    }
    setSearching(true)
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/copy/search?q=${encodeURIComponent(query.trim())}`)
        const data = await res.json()
        setResults(data.results || [])
      } catch {
        setResults([])
      } finally {
        setSearching(false)
      }
    }, 350)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query])

  const openFollowForm = (master: SearchResult) => {
    setPendingMaster(master)
    setPendingAmount("5")
  }

  const confirmFollow = async () => {
    if (!pendingMaster) return
    const amount = Number.parseFloat(pendingAmount.replace(",", "."))
    if (!Number.isFinite(amount) || amount < MIN_COPY_AMOUNT) return
    setSavingFollow(true)
    try {
      const res = await fetch("/api/copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ masterId: pendingMaster.id, fixedAmount: amount, active: true }),
      })
      if (res.ok) {
        setPendingMaster(null)
        setResults((prev) => prev.map((r) => (r.id === pendingMaster.id ? { ...r, isFollowing: true } : r)))
        await loadFollowing()
      }
    } finally {
      setSavingFollow(false)
    }
  }

  const toggleActive = async (f: Following) => {
    setFollowing((prev) => prev.map((x) => (x.id === f.id ? { ...x, active: !x.active } : x)))
    await fetch("/api/copy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ masterId: f.masterId, fixedAmount: f.fixedAmount, active: !f.active }),
    })
  }

  const updateAmount = async (f: Following, raw: string) => {
    const amount = Number.parseFloat(raw.replace(",", "."))
    if (!Number.isFinite(amount) || amount < MIN_COPY_AMOUNT) return
    setFollowing((prev) => prev.map((x) => (x.id === f.id ? { ...x, fixedAmount: amount } : x)))
    await fetch("/api/copy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ masterId: f.masterId, fixedAmount: amount, active: f.active }),
    })
  }

  const unfollow = async (f: Following) => {
    setFollowing((prev) => prev.filter((x) => x.id !== f.id))
    await fetch(`/api/copy?masterId=${f.masterId}`, { method: "DELETE" })
    setResults((prev) => prev.map((r) => (r.id === f.masterId ? { ...r, isFollowing: false } : r)))
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#0B0F14" }}>
        <div className="w-8 h-8 border-2 border-[#2563eb] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const initials = (name: string) =>
    name
      .split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase()

  const activeCount = following.filter((f) => f.active).length

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: "#0B0F14" }}>
      {/* Header */}
      <div className="sticky top-0 z-20 px-4 py-4 flex items-center gap-3 border-b border-[#1F2933]/60 backdrop-blur-md bg-[#0B0F14]/80">
        <button onClick={() => router.back()} className="p-2 -ml-2 active:opacity-70" aria-label="Voltar">
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <div className="flex items-center gap-2">
          <Copy className="w-5 h-5 text-[#2563eb]" />
          <h1 className="text-xl font-bold text-white">Copy Trade</h1>
        </div>
      </div>

      <div className="px-4 pt-5 max-w-2xl mx-auto">
        {/* Hero / destaque */}
        <div className="relative overflow-hidden rounded-2xl border border-[#2563eb]/30 bg-gradient-to-br from-[#152238] to-[#121826] p-5 mb-5">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#2563eb]/20 px-2.5 py-1 mb-3">
              <Activity className="w-3 h-3 text-[#3b82f6]" />
              <span className="text-[11px] font-semibold text-[#3b82f6]">Copie automaticamente</span>
            </div>
            <h2 className="text-lg font-bold text-white text-balance mb-1.5">Siga os melhores traders</h2>
            <p className="text-sm text-[#9CA3AF] leading-relaxed text-pretty max-w-md">
              Pesquise um trader pelo nome e copie as operacoes dele em tempo real. Cada operacao real que ele abrir e
              replicada na sua conta com o valor fixo que voce escolher.
            </p>
          </div>
          <Copy className="absolute -right-4 -bottom-4 w-28 h-28 text-[#2563eb]/10" strokeWidth={1.5} />
        </div>

        {/* Resumo */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="rounded-xl border border-[#1F2933] bg-[#121826] p-3.5">
            <div className="flex items-center gap-1.5 text-[#6B7280] mb-1">
              <Users className="w-3.5 h-3.5" />
              <span className="text-[11px] font-medium uppercase tracking-wide">Copiando</span>
            </div>
            <p className="text-2xl font-bold text-white">{following.length}</p>
          </div>
          <div className="rounded-xl border border-[#1F2933] bg-[#121826] p-3.5">
            <div className="flex items-center gap-1.5 text-[#6B7280] mb-1">
              <span className="w-2 h-2 rounded-full bg-[#10b981]" />
              <span className="text-[11px] font-medium uppercase tracking-wide">Ativos</span>
            </div>
            <p className="text-2xl font-bold text-white">{activeCount}</p>
          </div>
        </div>

        {/* Busca */}
        <div className="relative mb-3">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pesquisar trader por nome ou email"
            className="w-full h-12 pl-11 pr-4 rounded-xl bg-[#121826] border border-[#1F2933] text-white placeholder:text-[#6B7280] outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20 transition-all"
          />
          {searching && (
            <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#2563eb] animate-spin" />
          )}
        </div>

        {/* Resultados da busca */}
        {results.length > 0 && (
          <div className="flex flex-col gap-2 mb-6">
            {results.map((r) => (
              <div
                key={r.id}
                className="rounded-xl border border-[#1F2933] bg-[#121826] p-3 transition-colors hover:border-[#2A3441]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#2563eb]/30 to-[#2563eb]/10 flex items-center justify-center shrink-0 ring-1 ring-[#2563eb]/20">
                    <span className="text-sm font-bold text-[#3b82f6]">{initials(r.full_name)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold truncate">{r.full_name}</p>
                    <span className="text-[11px] text-[#6B7280]">{r.totalTrades} operacoes</span>
                  </div>
                  {r.isFollowing ? (
                    <span className="flex items-center gap-1 text-[12px] font-medium text-[#10b981] px-2">
                      <Check className="w-4 h-4" />
                      Seguindo
                    </span>
                  ) : (
                    <button
                      onClick={() => openFollowForm(r)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#2563eb] text-white text-sm font-semibold hover:bg-[#1d4fd8] active:opacity-80 transition-colors shrink-0"
                    >
                      <UserPlus className="w-4 h-4" />
                      Copiar
                    </button>
                  )}
                </div>

                {/* Form de valor fixo inline */}
                {pendingMaster?.id === r.id && (
                  <div className="mt-3 pt-3 border-t border-[#1F2933]">
                    <label className="text-xs text-[#9CA3AF]">
                      Valor fixo por operacao (min. R$ {MIN_COPY_AMOUNT})
                    </label>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] text-sm">R$</span>
                        <input
                          type="text"
                          inputMode="decimal"
                          value={pendingAmount}
                          onChange={(e) => setPendingAmount(e.target.value.replace(/[^\d.,]/g, ""))}
                          className="w-full h-11 pl-9 pr-3 rounded-lg bg-[#0B0F14] border border-[#1F2933] text-white outline-none focus:border-[#2563eb]"
                        />
                      </div>
                      <button
                        onClick={confirmFollow}
                        disabled={savingFollow}
                        className="h-11 px-4 rounded-lg bg-[#10b981] text-white text-sm font-semibold hover:bg-[#0ea472] active:opacity-80 disabled:opacity-50 flex items-center gap-1.5 transition-colors"
                      >
                        {savingFollow ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        Confirmar
                      </button>
                      <button
                        onClick={() => setPendingMaster(null)}
                        className="h-11 w-11 rounded-lg bg-[#1F2933] text-white flex items-center justify-center active:opacity-80"
                        aria-label="Cancelar"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {query.trim().length >= 2 && !searching && results.length === 0 && (
          <p className="text-center text-[#6B7280] text-sm py-4 mb-4">Nenhum trader encontrado.</p>
        )}

        {/* Seguindo */}
        <h2 className="text-sm font-semibold text-[#9CA3AF] uppercase tracking-wider mb-3">Traders que voce copia</h2>

        {loadingFollowing ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 text-[#2563eb] animate-spin" />
          </div>
        ) : following.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#1F2933] p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-[#121826] flex items-center justify-center mx-auto mb-3">
              <Copy className="w-6 h-6 text-[#374151]" />
            </div>
            <p className="text-[#6B7280] text-sm">
              Voce ainda nao copia nenhum trader. Pesquise acima para comecar.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {following.map((f) => (
              <div key={f.id} className="rounded-xl border border-[#1F2933] bg-[#121826] p-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#2563eb]/30 to-[#2563eb]/10 flex items-center justify-center shrink-0 ring-1 ring-[#2563eb]/20">
                    <span className="text-sm font-bold text-[#3b82f6]">{initials(f.masterName)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold truncate">{f.masterName}</p>
                    <p className="text-[11px] text-[#6B7280] truncate">{f.masterEmail}</p>
                  </div>
                  <button
                    onClick={() => unfollow(f)}
                    className="h-9 w-9 rounded-lg bg-[#1F2933] text-[#ef4444] flex items-center justify-center hover:bg-[#ef4444]/15 active:opacity-80 shrink-0 transition-colors"
                    aria-label="Deixar de copiar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#1F2933]">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] text-xs">R$</span>
                    <input
                      type="text"
                      inputMode="decimal"
                      defaultValue={String(f.fixedAmount)}
                      onBlur={(e) => updateAmount(f, e.target.value)}
                      className="w-full h-10 pl-9 pr-3 rounded-lg bg-[#0B0F14] border border-[#1F2933] text-white text-sm outline-none focus:border-[#2563eb]"
                    />
                  </div>
                  <button
                    onClick={() => toggleActive(f)}
                    className="h-10 px-3 rounded-lg text-sm font-semibold flex items-center gap-1.5 active:opacity-80 shrink-0 transition-colors"
                    style={{
                      backgroundColor: f.active ? "#10b98122" : "#1F2933",
                      color: f.active ? "#10b981" : "#9CA3AF",
                    }}
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: f.active ? "#10b981" : "#6B7280" }}
                    />
                    {f.active ? "Ativo" : "Pausado"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
