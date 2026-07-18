import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"

// Credenciais fixas da conta de teste
const TEST_EMAIL = "teste@teste.com"
const TEST_PASSWORD = "Teste123!"
const TEST_NAME = "Conta Teste"

// Garante que a conta de teste exista (cria caso ainda nao exista) e
// redefine a senha para o valor padrao. Retorna as credenciais para o
// cliente fazer o signInWithPassword.
export async function POST() {
  try {
    const supabaseAdmin = createAdminClient()

    // Tenta localizar o usuario de teste pelo e-mail
    const { data: list, error: listError } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 200,
    })

    if (listError) {
      console.error("[v0] listUsers error:", listError)
      return NextResponse.json({ error: "Erro ao verificar conta de teste" }, { status: 500 })
    }

    const existing = list?.users?.find((u) => u.email?.toLowerCase() === TEST_EMAIL)

    if (existing) {
      // Garante e-mail confirmado e senha padrao (caso tenha sido alterada)
      await supabaseAdmin.auth.admin.updateUserById(existing.id, {
        password: TEST_PASSWORD,
        email_confirm: true,
      })
    } else {
      // Cria a conta de teste ja confirmada
      const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        email_confirm: true,
        user_metadata: { full_name: TEST_NAME },
      })

      if (createError || !created.user) {
        console.error("[v0] createUser (test) error:", createError)
        return NextResponse.json({ error: "Erro ao criar conta de teste" }, { status: 500 })
      }

      // Garante saldo demo inicial (o trigger ja cria o profile)
      await supabaseAdmin.from("user_balances").upsert(
        {
          user_id: created.user.id,
          balance_real: 0,
          balance_demo: 10000,
          currency: "BRL",
        },
        { onConflict: "user_id" },
      )
    }

    return NextResponse.json({ email: TEST_EMAIL, password: TEST_PASSWORD }, { status: 200 })
  } catch (error) {
    console.error("[v0] test-login API error:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
