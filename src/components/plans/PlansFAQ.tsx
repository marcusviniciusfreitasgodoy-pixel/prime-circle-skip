import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

const faqs = [
  {
    question: 'Posso mudar de plano a qualquer momento?',
    answer:
      'Sim, você tem total liberdade para fazer upgrade ou downgrade de plano a qualquer momento diretamente pelo seu painel de controle. As alterações de acesso são imediatas e o faturamento é ajustado no próximo ciclo.',
  },
  {
    question: 'Como funciona o desconto por matches?',
    answer:
      'No Prime Circle, quem colabora mais, paga menos. Ao assinar o plano PROFESSIONAL, se você atingir 10 conexões (matches) no mês corrente, ganha 20% de desconto na mensalidade. Ao alcançar 20 ou mais conexões, o desconto chega a 30%.',
  },
  {
    question: 'O que é o plano Founder?',
    answer:
      'O plano FOUNDER é uma modalidade destinada exclusivamente aos primeiros membros (pioneiros) da plataforma. Além do acesso ilimitado com um valor fixo reduzido de R$ 47/mês, os Founders têm benefícios exclusivos, selo de autoridade, poder de voto nas atualizações do sistema e isenção total de cobrança nos primeiros 6 meses de uso. Atualmente, as vagas para este plano são limitadíssimas.',
  },
  {
    question: 'Há contrato de longo prazo?',
    answer:
      'Não! Não exigimos fidelidade. Nossas assinaturas são renovadas mensalmente e você pode cancelar quando desejar, sem multas ou taxas ocultas.',
  },
]

export function PlansFAQ() {
  return (
    <div className="mt-24 max-w-3xl mx-auto mb-16">
      <div className="text-center mb-10">
        <h3 className="text-3xl font-bold text-white mb-4">Perguntas Frequentes</h3>
        <p className="text-muted-foreground text-lg">
          Tire suas dúvidas sobre nossa assinatura e infraestrutura.
        </p>
      </div>
      <Accordion type="single" collapsible className="w-full">
        {faqs.map((faq, i) => (
          <AccordionItem key={i} value={`item-${i}`} className="border-border">
            <AccordionTrigger className="text-left text-white font-medium hover:text-primary transition-colors text-base">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}
