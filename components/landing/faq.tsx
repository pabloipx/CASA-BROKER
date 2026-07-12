"use client"

import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"

const faqs = [
  {
    q: "Qual é o depósito mínimo?",
    a: "O depósito mínimo na CASA BROKER é de apenas R$ 10. Você pode começar a negociar com valores acessíveis e aumentar seus aportes conforme ganha confiança.",
  },
  {
    q: "Posso testar a plataforma sem fazer um depósito?",
    a: "Sim! Ao criar sua conta você recebe R$ 10.000 em uma conta de demonstração para praticar suas estratégias sem nenhum risco, com cotações em tempo real.",
  },
  {
    q: "Quanto tempo leva um saque?",
    a: "Os saques são processados de forma rápida, geralmente em poucos minutos via PIX, para que você tenha acesso aos seus lucros o quanto antes.",
  },
  {
    q: "Como funciona o suporte ao cliente?",
    a: "Nosso time de suporte está disponível 24 horas por dia, 7 dias por semana, pronto para ajudar você em qualquer etapa da sua jornada de investimentos.",
  },
  {
    q: "A CASA BROKER é segura?",
    a: "Sim. Utilizamos criptografia de ponta a ponta, autenticação em duas etapas e monitoramento contínuo de todas as transações, seguindo padrões internacionais de KYC e AML.",
  },
  {
    q: "Vocês têm um aplicativo para dispositivos móveis?",
    a: "Nossa plataforma é totalmente otimizada para qualquer dispositivo. Você pode negociar diretamente pelo navegador do seu celular, tablet ou computador, a qualquer hora e lugar.",
  },
]

export function Faq() {
  return (
    <Accordion type="single" collapsible className="w-full space-y-3">
      {faqs.map((faq, i) => (
        <AccordionItem
          key={i}
          value={`item-${i}`}
          className="rounded-xl border border-white/[0.08] bg-white/[0.02] px-5 data-[state=open]:border-[#2563eb]/40"
        >
          <AccordionTrigger className="text-left text-white hover:no-underline text-sm md:text-base py-5">
            {faq.q}
          </AccordionTrigger>
          <AccordionContent className="text-white/50 text-sm leading-relaxed pb-5">{faq.a}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
