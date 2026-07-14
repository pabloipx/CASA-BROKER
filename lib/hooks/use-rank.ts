"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { getRankProgress, type RankProgress } from "@/lib/ranking"

// Busca as estatisticas reais do usuario (total depositado com depositos concluidos
// e quantidade de operacoes na conta real) e devolve o progresso de ranking calculado.
export function useRank(userId?: string) {
  const [progress, setProgress] = useState<RankProgress | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    let isMounted = true

    const load = async () => {
      try {
        const supabase = createClient()

        // Total depositado (apenas depositos concluidos).
        const { data: deposits } = await supabase
          .from("deposits")
          .select("amount, status")
          .eq("user_id", userId)

        const totalDeposited = (deposits || [])
          .filter((d) => {
            const s = (d.status || "").toLowerCase()
            return s === "completed" || s === "paid" || s === "approved"
          })
          .reduce((sum, d) => sum + (Number(d.amount) || 0), 0)

        // Quantidade de operacoes finalizadas na conta real.
        const { count: tradeCount } = await supabase
          .from("trades")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId)
          .eq("is_demo", false)
          .not("result", "is", null)

        if (isMounted) {
          setProgress(getRankProgress(totalDeposited, tradeCount || 0))
          setLoading(false)
        }
      } catch (error) {
        console.error("[v0] useRank error:", error)
        if (isMounted) setLoading(false)
      }
    }

    load()

    return () => {
      isMounted = false
    }
  }, [userId])

  return { progress, loading }
}
