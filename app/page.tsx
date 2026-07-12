import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Faq } from "@/components/landing/faq"
import {
  Shield,
  Zap,
  TrendingUp,
  Clock,
  Headphones,
  Wallet,
  BarChart3,
  Signal,
  Flame,
  LineChart,
  CalendarDays,
  Newspaper,
  Gift,
  RotateCcw,
  BadgePercent,
  Smartphone,
  ArrowRight,
  ArrowUpRight,
  UserPlus,
  Rocket,
} from "lucide-react"

export const metadata = {
  title: "CASA BROKER - Uma corretora, infinitos caminhos para investir",
  description:
    "Negocie de forma simples e clara em ações, criptomoedas e câmbio. Sinta-se em casa com a CASA BROKER.",
}

const comforts = [
  { icon: Headphones, title: "Apoio atencioso", desc: "Nossa equipe de suporte está disponível 24/7 para ajudar você em cada negociação." },
  { icon: Clock, title: "Negociação 24/7", desc: "Opere quando quiser, com uma plataforma sempre ativa e mercados disponíveis a qualquer hora." },
  { icon: Zap, title: "Retiradas rápidas", desc: "Retire seus lucros com poucos cliques e receba via PIX em minutos, sem burocracia." },
  { icon: TrendingUp, title: "Lucratividade de 96%", desc: "Aproveite alguns dos maiores retornos do mercado em operações bem-sucedidas." },
]

const assets = [
  { pair: "USD/CAD", change: "+1.52%", up: true },
  { pair: "USD/CHF", change: "+1.11%", up: true },
  { pair: "BTC/USD", change: "+2.84%", up: true },
  { pair: "EUR/USD", change: "-0.42%", up: false },
]

const tools = [
  { icon: Signal, title: "Sinais automatizados", desc: "Receba sinais gerados por análise de mercado para apoiar suas decisões." },
  { icon: Flame, title: "Ativos quentes", desc: "Veja em tempo real quais são os ativos mais negociados do momento." },
  { icon: BarChart3, title: "Indicadores na plataforma", desc: "Analise gráficos com indicadores técnicos direto na tela de negociação." },
  { icon: LineChart, title: "Cotações em tempo real", desc: "Acompanhe preços atualizados a cada segundo, sem atrasos." },
  { icon: CalendarDays, title: "Calendário econômico", desc: "Fique por dentro dos principais eventos que movimentam os mercados." },
  { icon: Newspaper, title: "Notícias financeiras", desc: "As notícias mais relevantes do mercado, atualizadas em tempo real." },
]

const bonuses = [
  { icon: Shield, title: "Negociações sem risco", desc: "Comece a operar com proteção nas suas primeiras negociações." },
  { icon: Gift, title: "Bônus sem depósito", desc: "Ganhe um bônus para começar mesmo antes de fazer seu primeiro depósito." },
  { icon: RotateCcw, title: "Reembolsos", desc: "Receba parte das suas operações de volta em condições especiais." },
  { icon: BadgePercent, title: "Bônus de até 200%", desc: "Multiplique seu saldo com bônus generosos sobre seus depósitos." },
]

const steps = [
  { icon: UserPlus, title: "Registre uma conta", desc: "Leva menos de um minuto: informe seus dados e crie sua conta gratuitamente." },
  { icon: Rocket, title: "Pratique na conta demo", desc: "Use os R$ 10.000 da conta de demonstração para treinar sem risco algum." },
  { icon: Wallet, title: "Deposite e negocie", desc: "Deposite via PIX a partir de R$ 10 e comece a operar de verdade." },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#030712]">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#1e3a8a] via-[#2563eb] to-[#1e3a8a] text-center py-2.5 px-4">
        <p className="text-white text-sm font-medium">
          Cadastre-se agora e receba R$ 10.000 na sua conta demo para começar!
        </p>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#030712]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center">
            <img src="/images/kodilex-logo.png" alt="CASA BROKER" className="h-9 w-auto object-contain" />
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm text-white/60">
            <a href="#conforto" className="hover:text-white transition-colors">Vantagens</a>
            <a href="#ativos" className="hover:text-white transition-colors">Ativos</a>
            <a href="#ferramentas" className="hover:text-white transition-colors">Ferramentas</a>
            <a href="#faq" className="hover:text-white transition-colors">Dúvidas</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10 text-sm">
              <Link href="/auth/login">Entrar</Link>
            </Button>
            <Button asChild className="bg-[#2563eb] hover:bg-[#3b82f6] font-semibold text-sm">
              <Link href="/auth/sign-up">Criar conta</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 h-80 w-[40rem] max-w-[90%] rounded-full bg-[#2563eb]/25 blur-[130px]" />
          <div
            className="absolute inset-0 opacity-[0.12]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(37,99,235,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.4) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
              maskImage: "radial-gradient(ellipse 70% 60% at 50% 30%, #000 30%, transparent 75%)",
              WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 30%, #000 30%, transparent 75%)",
            }}
          />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center px-6 pt-16 lg:pt-24 pb-6">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full border border-[#2563eb]/40 bg-[#2563eb]/10 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#3b82f6] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#3b82f6]" />
            </span>
            <span className="text-[#93c5fd] text-xs md:text-sm font-medium tracking-wide uppercase">
              Negocie em tempo real
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[1.05] mb-6 text-balance">
            Uma corretora,{" "}
            <span className="bg-gradient-to-r from-[#3b82f6] via-[#60a5fa] to-[#93c5fd] bg-clip-text text-transparent">
              infinitos caminhos
            </span>{" "}
            para investir
          </h1>
          <p className="text-white/60 text-base md:text-lg leading-relaxed mb-9 max-w-2xl mx-auto text-pretty">
            Negocie de forma simples e clara em ações, criptomoedas e câmbio. Comece com uma conta demo gratuita e
            evolua no seu ritmo.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-[#2563eb]/50 text-white hover:bg-[#2563eb]/10 bg-transparent font-semibold px-8 py-6 rounded-xl"
            >
              <Link href="/auth/sign-up">Negociar na conta demo</Link>
            </Button>
            <Button
              asChild
              size="lg"
              className="group bg-[#2563eb] hover:bg-[#3b82f6] text-white font-bold px-8 py-6 rounded-xl shadow-[0_8px_40px_-8px_rgba(37,99,235,0.7)] transition-all"
            >
              <Link href="/auth/sign-up" className="flex items-center gap-2">
                Negociar ao vivo
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Hero image */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 pb-8">
          <img
            src="/images/hero-3d-candles.png"
            alt="Gráfico de velas em 3D representando negociações na CASA BROKER"
            className="w-full h-auto object-contain drop-shadow-[0_20px_80px_rgba(37,99,235,0.3)]"
          />
        </div>
      </section>

      {/* Conforto / Vantagens */}
      <section id="conforto" className="py-16 px-4 bg-[#030712]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-10 text-center text-balance">
            Desfrute de conforto em todas as negociações
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {comforts.map((item) => (
              <div
                key={item.title}
                className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 transition-all hover:border-[#2563eb]/40 hover:bg-[#2563eb]/[0.04]"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#2563eb]/10 ring-1 ring-[#2563eb]/20 transition-colors group-hover:bg-[#2563eb]/20">
                  <item.icon className="h-6 w-6 text-[#3b82f6]" />
                </div>
                <h3 className="text-white font-semibold mb-2">{item.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ativos populares */}
      <section id="ativos" className="py-16 px-4 bg-[#0e1a33]/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 text-balance">
              Principais ativos populares para explorar
            </h2>
            <p className="text-white/50 max-w-xl mx-auto text-pretty">
              Comece a negociar os pares e ativos mais procurados do mercado internacional.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {assets.map((asset) => (
              <div
                key={asset.pair}
                className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 transition-all hover:border-[#2563eb]/40"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-white font-semibold">{asset.pair}</span>
                  <span
                    className={`flex items-center gap-1 text-sm font-medium ${
                      asset.up ? "text-[#22c55e]" : "text-[#ef4444]"
                    }`}
                  >
                    {asset.change}
                    <ArrowUpRight className={`w-3.5 h-3.5 ${asset.up ? "" : "rotate-90"}`} />
                  </span>
                </div>
                {/* mini sparkline */}
                <svg viewBox="0 0 100 32" className="w-full h-10 mb-4" preserveAspectRatio="none">
                  <polyline
                    fill="none"
                    stroke={asset.up ? "#22c55e" : "#ef4444"}
                    strokeWidth="2"
                    points={
                      asset.up
                        ? "0,26 20,20 40,22 60,12 80,14 100,4"
                        : "0,8 20,12 40,10 60,18 80,16 100,26"
                    }
                  />
                </svg>
                <Button
                  asChild
                  className="w-full bg-[#2563eb] hover:bg-[#3b82f6] text-white font-semibold text-sm"
                >
                  <Link href="/auth/sign-up">Investir agora</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Qualquer dispositivo */}
      <section className="py-16 px-4 bg-[#030712]">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 text-balance">
              Negocie a qualquer hora, em qualquer dispositivo
            </h2>
            <p className="text-white/50 leading-relaxed mb-6 text-pretty">
              A plataforma da CASA BROKER é totalmente otimizada para o navegador do seu celular, tablet ou
              computador. Sem instalar nada, você acessa seus gráficos e opera de onde estiver.
            </p>
            <ul className="space-y-3 mb-8">
              {["Acesso instantâneo pelo navegador", "Interface responsiva e fluida", "Sincronização em tempo real"].map(
                (t) => (
                  <li key={t} className="flex items-center gap-3 text-white/70 text-sm">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#2563eb]/15">
                      <Smartphone className="h-3.5 w-3.5 text-[#3b82f6]" />
                    </span>
                    {t}
                  </li>
                ),
              )}
            </ul>
            <Button
              asChild
              size="lg"
              className="bg-[#2563eb] hover:bg-[#3b82f6] text-white font-bold px-8 py-6 rounded-xl"
            >
              <Link href="/auth/sign-up">Abrir plataforma</Link>
            </Button>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-[#2563eb]/20 blur-[100px] rounded-full" />
            <img
              src="/images/hero-3d-candles.png"
              alt="Plataforma de negociação CASA BROKER em diferentes dispositivos"
              className="relative w-full h-auto object-contain"
            />
          </div>
        </div>
      </section>

      {/* Ferramentas */}
      <section id="ferramentas" className="py-16 px-4 bg-[#0e1a33]/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-10 text-center text-balance">
            Encontre tudo o que você precisa na CASA BROKER
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tools.map((item) => (
              <div
                key={item.title}
                className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 transition-all hover:border-[#2563eb]/40 hover:bg-[#2563eb]/[0.04]"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#2563eb]/10 ring-1 ring-[#2563eb]/20 transition-colors group-hover:bg-[#2563eb]/20">
                  <item.icon className="h-6 w-6 text-[#3b82f6]" />
                </div>
                <h3 className="text-white font-semibold mb-2">{item.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bônus */}
      <section className="py-16 px-4 bg-[#030712]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-10 text-center text-balance">
            Oferecemos bônus para mantê-lo aquecido
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {bonuses.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-[#2563eb]/20 bg-gradient-to-b from-[#0e1a33] to-[#0e1a33]/30 p-6 transition-all hover:border-[#2563eb]/50"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#2563eb]/15 ring-1 ring-[#2563eb]/30">
                  <item.icon className="h-6 w-6 text-[#3b82f6]" />
                </div>
                <h3 className="text-white font-semibold mb-2">{item.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button
              asChild
              size="lg"
              className="bg-[#2563eb] hover:bg-[#3b82f6] text-white font-bold px-10 py-6 rounded-xl"
            >
              <Link href="/auth/sign-up">Resgatar meu bônus</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 3 etapas */}
      <section className="py-16 px-4 bg-[#0e1a33]/50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-12 text-center text-balance">
            Entre com facilidade. São apenas 3 etapas
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((step, i) => (
              <div key={step.title} className="relative text-center">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#2563eb]/10 ring-1 ring-[#2563eb]/30">
                  <step.icon className="h-8 w-8 text-[#3b82f6]" />
                </div>
                <div className="mb-2 text-[#3b82f6] font-bold text-sm">Passo {i + 1}</div>
                <h3 className="text-white font-semibold mb-2">{step.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed max-w-xs mx-auto">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-4 bg-[#030712] border-y border-[#1e3a8a]/30">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          {[
            { value: "R$ 10", label: "Depósito mínimo" },
            { value: "Minutos", label: "Retiradas rápidas via PIX" },
            { value: "Segundos", label: "Lucros em operações rápidas" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
              <p className="text-3xl md:text-4xl font-bold text-[#3b82f6]">{s.value}</p>
              <p className="text-white/50 text-sm mt-2">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-16 px-4 bg-[#0e1a33]/50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-10 text-center text-balance">
            Perguntas Frequentes
          </h2>
          <Faq />
        </div>
      </section>

      {/* Sinta-se em casa (CTA final) */}
      <section className="relative py-20 px-4 overflow-hidden bg-[#030712]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-72 w-[40rem] max-w-[90%] rounded-full bg-[#2563eb]/20 blur-[130px]" />
        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4 text-balance">Sinta-se em casa</h2>
          <p className="text-white/60 mb-8 text-pretty">
            Cadastre-se agora e junte-se a milhares de traders que já negociam com a CASA BROKER.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-[#2563eb] hover:bg-[#3b82f6] text-white font-bold px-10 py-6 rounded-xl shadow-[0_8px_40px_-8px_rgba(37,99,235,0.7)]"
            >
              <Link href="/auth/sign-up">Criar conta grátis</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 bg-transparent font-semibold px-10 py-6 rounded-xl"
            >
              <Link href="/auth/login">Já tenho uma conta</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-[#030712] border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <img src="/images/kodilex-logo.png" alt="CASA BROKER" className="h-8 w-auto" />
          <p className="text-white/30 text-xs text-center">© 2025 CASA BROKER. Todos os direitos reservados.</p>
          <div className="flex gap-4">
            <Link href="/terms" className="text-white/30 hover:text-white text-xs">Termos</Link>
            <Link href="/privacy" className="text-white/30 hover:text-white text-xs">Privacidade</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
