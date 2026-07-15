import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"

const ADMIN_PASSWORD = "Admin123!"

function isAdminAuthenticated(request: Request): boolean {
  return request.headers.get("x-admin-token") === ADMIN_PASSWORD
}

function num(v: any): number {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

// GET /api/admin/users/[id] -> perfil completo + agregados reais do usuario
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!isAdminAuthenticated(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    if (!id) return NextResponse.json({ error: "User ID required" }, { status: 400 })

    const admin = createAdminClient()

    // Perfil
    const { data: profile, error: profileError } = await admin.from("profiles").select("*").eq("id", id).single()

    if (profileError || !profile) {
      return NextResponse.json({ error: "Usuário não encontrado", details: profileError?.message }, { status: 404 })
    }

    // Buscas paralelas: saldo, operacoes, depositos, saques, ultimas transacoes
    const [balanceRes, tradesRes, depositsRes, withdrawalsRes, recentTradesRes] = await Promise.all([
      admin.from("user_balances").select("balance_real, balance_demo, currency").eq("user_id", id).maybeSingle(),
      admin.from("trades").select("amount, profit, result, is_demo, created_at").eq("user_id", id),
      admin.from("deposits").select("amount, status, created_at").eq("user_id", id),
      admin.from("withdrawals").select("amount, status, created_at").eq("user_id", id),
      admin
        .from("trades")
        .select("id, symbol, direction, amount, profit, result, is_demo, created_at")
        .eq("user_id", id)
        .order("created_at", { ascending: false })
        .limit(8),
    ])

    const balance = balanceRes.data || null
    const trades = tradesRes.data || []
    const deposits = depositsRes.data || []
    const withdrawals = withdrawalsRes.data || []

    // ---- Agregados de operacoes (apenas conta REAL) ----
    const realTrades = trades.filter((t: any) => !t.is_demo)
    const settled = realTrades.filter((t: any) => t.result === "win" || t.result === "loss")
    const wins = settled.filter((t: any) => t.result === "win").length
    const losses = settled.filter((t: any) => t.result === "loss").length
    const pending = realTrades.filter((t: any) => t.result === "pending").length
    const totalVolume = realTrades.reduce((s: number, t: any) => s + num(t.amount), 0)
    const netProfit = realTrades.reduce((s: number, t: any) => s + num(t.profit), 0)
    const winRate = settled.length > 0 ? (wins / settled.length) * 100 : 0

    // ---- Agregados financeiros (apenas concluidos) ----
    const approvedDeposits = deposits.filter((d: any) =>
      ["completed", "approved", "paid", "confirmed"].includes(String(d.status || "").toLowerCase()),
    )
    const approvedWithdrawals = withdrawals.filter((w: any) =>
      ["completed", "approved", "paid", "confirmed"].includes(String(w.status || "").toLowerCase()),
    )
    const totalDeposited = approvedDeposits.reduce((s: number, d: any) => s + num(d.amount), 0)
    const totalWithdrawn = approvedWithdrawals.reduce((s: number, w: any) => s + num(w.amount), 0)

    return NextResponse.json({
      profile: {
        id: profile.id,
        email: profile.email || "",
        full_name: profile.full_name || "",
        phone: profile.phone || "",
        cpf: profile.cpf || "",
        birth_date: profile.birth_date || null,
        is_admin: !!profile.is_admin,
        is_verified: !!profile.is_verified,
        is_blocked: !!profile.is_blocked,
        kyc_status: profile.kyc_status || "pending",
        is_affiliate: !!profile.is_affiliate,
        affiliate_code: profile.affiliate_code || null,
        affiliate_status: profile.affiliate_status || null,
        affiliate_balance: num(profile.affiliate_balance),
        affiliate_total_earned: num(profile.affiliate_total_earned),
        affiliate_total_referrals: num(profile.affiliate_total_referrals),
        referred_by: profile.referred_by || null,
        created_at: profile.created_at,
        last_seen_at: profile.last_seen_at || null,
        balance_real: num(balance?.balance_real),
        balance_demo: num(balance?.balance_demo),
        currency: balance?.currency || "BRL",
      },
      stats: {
        totalTrades: realTrades.length,
        wins,
        losses,
        pending,
        winRate,
        totalVolume,
        netProfit,
        totalDeposited,
        totalWithdrawn,
        depositCount: approvedDeposits.length,
        withdrawalCount: approvedWithdrawals.length,
      },
      recentTrades: (recentTradesRes.data || []).map((t: any) => ({
        id: t.id,
        symbol: t.symbol,
        direction: t.direction,
        amount: num(t.amount),
        profit: num(t.profit),
        result: t.result,
        is_demo: !!t.is_demo,
        created_at: t.created_at,
      })),
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error", details: String(error) }, { status: 500 })
  }
}
