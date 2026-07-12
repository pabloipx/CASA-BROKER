"use client"

import { useEffect } from "react"
import { setManipulations, type CandleManipulation } from "@/lib/price-engine/multi-asset-engine"

/**
 * Sincroniza as manipulacoes de vela agendadas pelo admin no motor de precos do cliente.
 * Faz polling em /api/manipulations/active e alimenta o motor via setManipulations().
 * Como o grafico e a liquidacao das operacoes leem o preco do mesmo motor, o resultado
 * (Win/Loss) segue a direcao configurada durante a janela de manipulacao.
 */
export function useManipulationSync(intervalMs = 5000) {
  useEffect(() => {
    let mounted = true

    const fetchManipulations = async () => {
      try {
        const res = await fetch("/api/manipulations/active", { cache: "no-store" })
        if (!res.ok) return
        const data = await res.json()
        if (mounted && Array.isArray(data.manipulations)) {
          setManipulations(data.manipulations as CandleManipulation[])
        }
      } catch {
        // silencioso: sem manipulacao, o preco segue normal
      }
    }

    fetchManipulations()
    const interval = setInterval(fetchManipulations, intervalMs)
    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [intervalMs])
}
