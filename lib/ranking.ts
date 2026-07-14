// Sistema de ranking com 5 niveis. Cada rank exige DUAS metas simultaneas:
// - metaDeposito: total depositado (depositos concluidos, em R$)
// - metaTrades: quantidade de operacoes na conta real
// O usuario alcanca um rank quando atinge AS DUAS metas daquele nivel.

export interface Rank {
  id: string
  name: string
  level: number
  color: string
  metaDeposito: number
  metaTrades: number
  beneficio: string
}

export const RANKS: Rank[] = [
  {
    id: "bronze",
    name: "Bronze",
    level: 1,
    color: "#cd7f32",
    metaDeposito: 0,
    metaTrades: 0,
    beneficio: "Acesso a plataforma e conta demo",
  },
  {
    id: "prata",
    name: "Prata",
    level: 2,
    color: "#9ca3af",
    metaDeposito: 500,
    metaTrades: 25,
    beneficio: "Suporte prioritario no chat",
  },
  {
    id: "ouro",
    name: "Ouro",
    level: 3,
    color: "#f59e0b",
    metaDeposito: 2000,
    metaTrades: 100,
    beneficio: "Saques mais rapidos e bonus exclusivos",
  },
  {
    id: "platina",
    name: "Platina",
    level: 4,
    color: "#22d3ee",
    metaDeposito: 10000,
    metaTrades: 300,
    beneficio: "Gerente de conta dedicado",
  },
  {
    id: "diamante",
    name: "Diamante",
    level: 5,
    color: "#60a5fa",
    metaDeposito: 50000,
    metaTrades: 1000,
    beneficio: "Condicoes VIP e eventos exclusivos",
  },
]

export interface RankProgress {
  current: Rank
  next: Rank | null
  totalDeposited: number
  totalTrades: number
  // Progresso 0..1 para a proxima meta
  depositProgress: number
  tradeProgress: number
  // Progresso geral (menor das duas metas), 0..1
  overallProgress: number
}

// Retorna o rank atual a partir das estatisticas do usuario.
export function getCurrentRank(totalDeposited: number, totalTrades: number): Rank {
  let current = RANKS[0]
  for (const rank of RANKS) {
    if (totalDeposited >= rank.metaDeposito && totalTrades >= rank.metaTrades) {
      current = rank
    }
  }
  return current
}

export function getRankProgress(totalDeposited: number, totalTrades: number): RankProgress {
  const current = getCurrentRank(totalDeposited, totalTrades)
  const next = RANKS.find((r) => r.level === current.level + 1) || null

  let depositProgress = 1
  let tradeProgress = 1

  if (next) {
    // Progresso relativo entre a meta do rank atual e a do proximo.
    const depDenom = next.metaDeposito - current.metaDeposito
    const trdDenom = next.metaTrades - current.metaTrades
    depositProgress =
      depDenom > 0 ? Math.min(1, Math.max(0, (totalDeposited - current.metaDeposito) / depDenom)) : 1
    tradeProgress = trdDenom > 0 ? Math.min(1, Math.max(0, (totalTrades - current.metaTrades) / trdDenom)) : 1
  }

  return {
    current,
    next,
    totalDeposited,
    totalTrades,
    depositProgress,
    tradeProgress,
    overallProgress: next ? Math.min(depositProgress, tradeProgress) : 1,
  }
}

export function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })
}
