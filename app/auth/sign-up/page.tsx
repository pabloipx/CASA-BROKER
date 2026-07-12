"use client"

import type React from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect, Suspense } from "react"
import { CheckCircle2, Loader2, X } from "lucide-react"

function SignUpForm() {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [showTerms, setShowTerms] = useState(false)
  const [referralCode, setReferralCode] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const ref = searchParams.get("ref")
    if (ref) {
      setReferralCode(ref.toUpperCase())
    }
  }, [searchParams])

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 2) return `(${numbers}`
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value)
    if (formatted.length <= 16) setPhone(formatted)
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    if (!acceptTerms) {
      setError("Você precisa aceitar os termos e condições")
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres")
      setIsLoading(false)
      return
    }

    try {
      const res = await fetch("/api/auth/sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, fullName, phone, referralCode }),
      })

      const result = await res.json()

      if (!res.ok) {
        throw new Error(result.error || "Erro ao criar conta")
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        console.error("[v0] Sign-in error:", signInError)
        throw new Error("Conta criada, mas houve erro ao entrar. Tente fazer login.")
      }

      setSuccess(true)

      setTimeout(() => {
        router.push("/trade")
      }, 2000)
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : "Erro ao criar conta"
      if (errMsg.includes("already registered")) {
        setError("Este e-mail já está cadastrado")
      } else {
        setError(errMsg)
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-white">
        <div className="text-center px-6 animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center bg-[#2563eb]/10">
            <CheckCircle2 className="w-12 h-12 text-[#2563eb]" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Conta criada com sucesso!</h1>
          <p className="text-gray-500 mb-6">Você será redirecionado para a plataforma...</p>
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-[#2563eb]" />
            <span className="text-[#2563eb]">Entrando...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full flex flex-col bg-white text-gray-900">
      {showTerms && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="relative w-full max-w-lg max-h-[85vh] rounded-2xl overflow-hidden flex flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Termos e Condições de Uso</h2>
              <button
                onClick={() => setShowTerms(false)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Fechar"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 text-gray-600 text-sm leading-relaxed space-y-4">
              <p className="text-xs text-gray-400">Última atualização: Janeiro de 2026</p>
              <p>
                Ao acessar, cadastrar-se ou utilizar a plataforma CASA BROKER, o usuário declara que leu, compreendeu e
                concorda integralmente com os presentes Termos e Condições.
              </p>
              <h3 className="text-gray-900 font-semibold pt-2">1. DEFINIÇÕES</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <strong>CASA BROKER:</strong> Plataforma digital para operações em opções binárias.
                </li>
                <li>
                  <strong>Usuário:</strong> Pessoa física que acessa ou utiliza a plataforma.
                </li>
                <li>
                  <strong>Conta:</strong> Cadastro individual do usuário na plataforma.
                </li>
              </ul>
              <h3 className="text-gray-900 font-semibold pt-2">2. ACEITAÇÃO DOS TERMOS</h3>
              <p>O uso da plataforma está condicionado à aceitação integral destes Termos e Condições.</p>
              <h3 className="text-gray-900 font-semibold pt-2">3. ELEGIBILIDADE</h3>
              <p>A utilização é exclusiva para pessoas maiores de 18 anos.</p>
              <h3 className="text-gray-900 font-semibold pt-2">4. CADASTRO</h3>
              <p>O usuário compromete-se a fornecer informações verdadeiras e completas.</p>
              <h3 className="text-gray-900 font-semibold pt-2">5. VERIFICAÇÃO KYC</h3>
              <p>A CASA BROKER poderá solicitar documentos para verificação de identidade. Prazo de até 24 horas.</p>
              <h3 className="text-gray-900 font-semibold pt-2">6. DEPÓSITOS</h3>
              <p>Valor mínimo: R$ 50,00. Processamento instantâneo via PIX.</p>
              <h3 className="text-gray-900 font-semibold pt-2">7. SAQUES</h3>
              <p>Valor mínimo: R$ 10,00. Prazo de até 24 horas para primeiro saque.</p>
              <h3 className="text-gray-900 font-semibold pt-2">8. RISCOS</h3>
              <p>Operações financeiras envolvem riscos e podem resultar em perdas. A CASA BROKER não garante lucros.</p>
              <h3 className="text-gray-900 font-semibold pt-2">9. ACEITE FINAL</h3>
              <p>Ao marcar o checkbox, o usuário declara que leu, é maior de 18 anos e concorda com todas as regras.</p>
            </div>

            <div className="p-4 border-t border-gray-200">
              <Button
                onClick={() => setShowTerms(false)}
                className="w-full h-12 rounded-lg text-white font-semibold bg-[#2563eb] hover:bg-[#1d4ed8]"
              >
                Li e Entendi
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
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
        <Link href="/auth/login">
          <Button className="rounded-md px-5 h-10 text-white font-medium bg-[#2563eb] hover:bg-[#1d4ed8]">
            Entrar — CASA BROKER
          </Button>
        </Link>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-start justify-center px-6 py-14">
        <div className="w-full max-w-md">
          <h1 className="text-4xl font-bold text-center text-gray-800 mb-10">Criar conta</h1>

          <form onSubmit={handleSignUp} className="space-y-4">
            <input
              type="text"
              placeholder="Nome completo"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full h-14 px-4 rounded-md border border-gray-300 text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] transition-colors"
            />

            <input
              type="email"
              placeholder="E-mail"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-14 px-4 rounded-md border border-gray-300 text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] transition-colors"
            />

            <input
              type="tel"
              placeholder="Telefone"
              required
              value={phone}
              onChange={handlePhoneChange}
              className="w-full h-14 px-4 rounded-md border border-gray-300 text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] transition-colors"
            />

            <input
              type="password"
              placeholder="Senha"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-14 px-4 rounded-md border border-gray-300 text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] transition-colors"
            />

            <label className="flex items-start gap-3 pt-1 cursor-pointer">
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-1 h-4 w-4 accent-[#2563eb]"
              />
              <span className="text-gray-500 text-sm leading-relaxed">
                Tenho mais de 18 anos e concordo com os{" "}
                <button
                  type="button"
                  onClick={() => setShowTerms(true)}
                  className="text-[#2563eb] underline underline-offset-2 hover:opacity-80"
                >
                  Termos &amp; Condições
                </button>
              </span>
            </label>

            {error && (
              <div className="text-sm p-3 rounded-md flex items-center gap-2 text-red-600 bg-red-50 border border-red-100">
                <span>⚠</span>
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-14 rounded-md font-semibold text-base text-white bg-[#2563eb] hover:bg-[#1d4ed8] transition-colors"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Criando conta...
                </span>
              ) : (
                "Criar conta"
              )}
            </Button>
          </form>

          <p className="text-center text-gray-600 text-sm mt-6">
            Já possui uma conta?{" "}
            <Link href="/auth/login" className="text-[#2563eb] font-medium hover:underline">
              Entrar
            </Link>
          </p>

          {/* Risk warning */}
          <div className="mt-8 border border-gray-200 rounded-md px-5 py-4">
            <div className="flex items-center justify-center gap-3 mb-2">
              <span className="h-px flex-1 bg-gray-200" />
              <span className="text-xs font-bold tracking-wide text-gray-500">AVISO DE RISCO:</span>
              <span className="h-px flex-1 bg-gray-200" />
            </div>
            <p className="text-sm text-gray-500 text-center leading-relaxed">
              Toda negociação envolve risco. Apenas arrisque o capital que você está preparado para perder.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-6 text-center text-sm text-gray-400">CASA BROKER</footer>
    </div>
  )
}

export default function SignUpPage() {
  return (
    <Suspense fallback={null}>
      <SignUpForm />
    </Suspense>
  )
}
