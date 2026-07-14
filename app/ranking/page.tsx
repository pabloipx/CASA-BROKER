"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { ChevronLeft, Trophy, Lock, Check, CircleDollarSign, BarChart3, Crown } from "lucide-react"
import { RANKS, formatBRL } from "@/lib/ranking"
import { useRank } from "@/lib/hooks/use-rank"

export default function RankingPage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | undefined>(undefined)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.replace("/auth/login")
        return
      }
      setUserId(user.id)
      setChecking(false)
    })
  }, [router])

  const { progress, loading } = useRank(userId)

  if (checking || loading || !progress) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#0B0F14" }}>
        <div className="w-8 h-8 border-2 border-[#2563eb] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const { current, next, totalDeposited, totalTrades, depositProgress, tradeProgress } = progress

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: "#0B0F14" }}>
      {/* Header */}
      <div className="sticky top-0 z-20 px-4 py-4 flex items-center gap-3 border-b border-[#1F2933]/60 backdrop-blur-md bg-[#0B0F14]/80">
        <button onClick={() => router.back()} className="p-2 -ml-2 active:opacity-70" aria-label="Voltar">
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <h1 className="text-xl font-bold text-white">Ranking</h1>
      </div>

      {/* Current rank hero */}
      <div className="px-4 pt-6">
        <div
          className="relative overflow-hidden rounded-2xl border p-6"
          style={{
            borderColor: `${current.color}40`,
            background: `linear-gradient(135deg, ${current.color}22 0%, #121826 60%)`,
          }}
        >
          <div className="flex items-center gap-4">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center shrink-0 border"
              style={{ backgroundColor: "#0B0F14", borderColor: `${current.color}55` }}
            >
              <Crown className="w-10 h-10" style={{ color: current.color }} />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-xs text-[#9CA3AF] uppercase tracking-wider">Seu nivel atual</span>
              <h2 className="text-2xl font-bold text-white leading-tight" style={{ color: current.color }}>
                {current.name}
              </h2>
              <p className="text-[#9CA3AF] text-xs mt-1">{current.beneficio}</p>
            </div>
          </div>

          {/* Stats resumo */}
          <div className="grid grid-cols-2 gap-3 mt-5">
            <div className="rounded-xl p-3" style={{ backgroundColor: "#0B0F14" }}>
              <div className="flex items-center gap-1.5 mb-1">
                <CircleDollarSign className="w-3.5 h-3.5 text-[#2563eb]" />
                <span className="text-[10px] text-[#9CA3AF] uppercase tracking-wide">Depositado</span>
              </div>
              <p className="text-lg font-bold text-white">{formatBRL(totalDeposited)}</p>
            </div>
            <div className="rounded-xl p-3" style={{ backgroundColor: "#0B0F14" }}>
              <div className="flex items-center gap-1.5 mb-1">
                <BarChart3 className="w-3.5 h-3.5 text-[#2563eb]" />
                <span className="text-[10px] text-[#9CA3AF] uppercase tracking-wide">Operacoes</span>
              </div>
              <p className="text-lg font-bold text-white">{totalTrades}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress to next rank */}
      {next ? (
        <div className="px-4 pt-5">
          <div className="rounded-2xl border border-[#1F2933] p-5" style={{ backgroundColor: "#121826" }}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-white">
                Progresso para <span style={{ color: next.color }}>{next.name}</span>
              </span>
              <Trophy className="w-4 h-4" style={{ color: next.color }} />
            </div>

            {/* Deposit progress */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-[#9CA3AF]">Meta de deposito</span>
                <span className="text-xs font-medium text-white">
                  {formatBRL(totalDeposited)} / {formatBRL(next.metaDeposito)}
                </span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-[#0B0F14] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${depositProgress * 100}%`, backgroundColor: next.color }}
                />
              </div>
            </div>

            {/* Trade progress */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-[#9CA3AF]">Meta de operacoes</span>
                <span className="text-xs font-medium text-white">
                  {totalTrades} / {next.metaTrades}
                </span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-[#0B0F14] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${tradeProgress * 100}%`, backgroundColor: next.color }}
                />
              </div>
            </div>

            <p className="text-[11px] text-[#6B7280] mt-4 leading-relaxed">
              Complete as duas metas para subir para o nivel {next.name}.
            </p>
          </div>
        </div>
      ) : (
        <div className="px-4 pt-5">
          <div
            className="rounded-2xl border p-5 text-center"
            style={{ borderColor: `${current.color}40`, backgroundColor: "#121826" }}
          >
            <Crown className="w-8 h-8 mx-auto mb-2" style={{ color: current.color }} />
            <p className="text-sm font-semibold text-white">Voce atingiu o nivel maximo!</p>
            <p className="text-xs text-[#9CA3AF] mt-1">Aproveite todos os beneficios VIP.</p>
          </div>
        </div>
      )}

      {/* All ranks list */}
      <div className="px-4 pt-6">
        <h3 className="text-base font-semibold text-white mb-3">Todos os niveis</h3>
        <div className="space-y-2.5">
          {RANKS.map((rank) => {
            const unlocked = current.level >= rank.level
            const isCurrent = current.level === rank.level
            return (
              <div
                key={rank.id}
                className="flex items-center gap-3 p-4 rounded-2xl border transition"
                style={{
                  backgroundColor: "#121826",
                  borderColor: isCurrent ? `${rank.color}66` : "#1F2933",
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border"
                  style={{
                    backgroundColor: "#0B0F14",
                    borderColor: unlocked ? `${rank.color}55` : "#1F2933",
                  }}
                >
                  {unlocked ? (
                    <Crown className="w-6 h-6" style={{ color: rank.color }} />
                  ) : (
                    <Lock className="w-5 h-5 text-[#4B5563]" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm" style={{ color: unlocked ? rank.color : "#9CA3AF" }}>
                      {rank.name}
                    </span>
                    {isCurrent && (
                      <span
                        className="px-1.5 py-0.5 text-[9px] font-bold rounded uppercase"
                        style={{ color: rank.color, backgroundColor: `${rank.color}22` }}
                      >
                        Atual
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#6B7280] mt-0.5">
                    {rank.metaDeposito === 0 && rank.metaTrades === 0
                      ? "Nivel inicial"
                      : `${formatBRL(rank.metaDeposito)} + ${rank.metaTrades} operacoes`}
                  </p>
                  <p className="text-[11px] text-[#9CA3AF] mt-0.5">{rank.beneficio}</p>
                </div>

                {unlocked && (
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${rank.color}22` }}
                  >
                    <Check className="w-3.5 h-3.5" style={{ color: rank.color }} />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
