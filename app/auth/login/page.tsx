"use client"

import type React from "react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isTestLoading, setIsTestLoading] = useState(false)
  const router = useRouter()

  // Redireciona em segundo plano se já houver sessão, sem bloquear o render do formulário
  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace("/trade")
      }
    })
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isLoading) return

    const trimmedEmail = email.trim().toLowerCase()
    const trimmedPassword = password.trim()

    if (!trimmedEmail || !trimmedPassword) {
      setError("Preencha todos os campos")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password: trimmedPassword,
      })

      if (signInError) {
        const msg = signInError.message.toLowerCase()
        if (msg.includes("invalid login credentials") || msg.includes("invalid_credentials")) {
          throw new Error("E-mail ou senha incorretos")
        }
        if (msg.includes("email not confirmed")) {
          throw new Error("Confirme seu e-mail antes de entrar")
        }
        if (msg.includes("too many requests")) {
          throw new Error("Muitas tentativas. Aguarde alguns minutos.")
        }
        throw new Error(signInError.message)
      }

      router.push("/trade")
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao fazer login"
      setError(message)
      setIsLoading(false)
    }
  }

  const handleTestLogin = async () => {
    if (isLoading || isTestLoading) return

    setIsTestLoading(true)
    setError(null)

    try {
      // Garante que a conta de teste exista (cria/normaliza no servidor)
      const res = await fetch("/api/auth/test-login", { method: "POST" })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.error || "Não foi possível preparar a conta de teste")
      }

      const supabase = createClient()
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (signInError) {
        throw new Error(signInError.message)
      }

      router.push("/trade")
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao entrar com a conta de teste"
      setError(message)
      setIsTestLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col bg-white text-gray-900">
      {/* Header */}
      <header className="flex items-center justify-between px-5 md:px-10 py-4 border-b border-gray-100">
        <Link href="/" className="flex items-center">
          <Image
            src="/images/kodilex-logo.png"
            alt="CASA BROKER"
            width={160}
            height={40}
            className="h-9 w-auto"
            unoptimized
          />
        </Link>
        <Link
          href="/auth/sign-up"
          className="shrink-0 whitespace-nowrap rounded-lg bg-[#2563eb] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1d4ed8]"
        >
          Registre-se<span className="hidden sm:inline"> — CASA BROKER</span>
        </Link>
      </header>

      {/* Main */}
      <main className="flex flex-1 items-start justify-center px-5 py-16">
        <div className="w-full max-w-md">
          <h1 className="mb-10 text-center text-4xl font-bold text-gray-800">Entrar</h1>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <input
              id="email"
              type="email"
              placeholder="E-mail"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              disabled={isLoading}
              className="h-14 w-full rounded-lg border border-gray-300 bg-white px-4 text-base text-gray-900 placeholder:text-gray-400 outline-none transition-colors focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] disabled:opacity-50"
            />

            {/* Senha */}
            <input
              id="password"
              type="password"
              placeholder="Senha"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              disabled={isLoading}
              className="h-14 w-full rounded-lg border border-gray-300 bg-white px-4 text-base text-gray-900 placeholder:text-gray-400 outline-none transition-colors focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] disabled:opacity-50"
            />

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                <span className="font-bold">!</span>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="flex h-14 w-full items-center justify-center gap-2 rounded-lg bg-[#2563eb] text-base font-semibold text-white transition-colors hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </button>

            {/* Login de teste */}
            <button
              type="button"
              onClick={handleTestLogin}
              disabled={isLoading || isTestLoading}
              className="flex h-14 w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white text-base font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isTestLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar com conta teste"
              )}
            </button>
            <p className="text-center text-xs text-gray-400">
              Conta de teste: teste@teste.com / Teste123!
            </p>
          </form>

          {/* Links */}
          <div className="mt-6 space-y-3 text-center">
            <div>
              <Link href="/auth/forgot-password" className="text-sm font-medium text-[#2563eb] hover:underline">
                Esqueceu a senha?
              </Link>
            </div>
            <p className="text-sm text-gray-600">
              Ainda não possui uma conta?{" "}
              <Link href="/auth/sign-up" className="font-medium text-[#2563eb] hover:underline">
                Inscrever-se
              </Link>
            </p>
          </div>

          {/* Aviso de risco */}
          <div className="mt-8">
            <div className="relative mb-3 text-center">
              <span className="bg-white px-3 text-sm font-bold uppercase tracking-wide text-gray-500">
                Aviso de risco:
              </span>
              <div className="absolute left-0 top-1/2 -z-10 h-px w-full bg-gray-200" />
            </div>
            <div className="rounded-lg border border-gray-200 p-4 text-sm leading-relaxed text-gray-500">
              Toda negociação envolve risco. Apenas arrisque o capital que você está preparado para perder.
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-6 text-center text-sm text-gray-500">CASA BROKER</footer>
    </div>
  )
}
