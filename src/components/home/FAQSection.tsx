import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

export function FAQSection() {
  const faqs = [
    {
      q: 'Como funciona a divisão 50/50?',
      a: 'Todos os negócios fechados dentro da rede Prime Circle têm a comissão dividida igualmente (50% para quem detém o imóvel, 50% para quem traz o comprador). Nossa infraestrutura jurídica garante que esse repasse seja seguro, contratual e imediato, eliminando burocracias e desgastes.',
    },
    {
      q: 'Quem pode se candidatar?',
      a: 'Corretores que já atuam ativamente no mercado de alto padrão, possuem CRECI ativo, histórico comprovado de vendas significativas, carteira de clientes qualificada e operam imóveis "off-market" ou de ticket alto.',
    },
    {
      q: 'Existe custo fixo mensal?',
      a: 'Não. O Prime Circle funciona sob um modelo de parceria. Nós cobramos apenas uma pequena taxa administrativa (success fee) sobre o sucesso das transações fechadas dentro da nossa infraestrutura. Não há mensalidades para ser membro da comunidade.',
    },
    {
      q: 'Qual a segurança jurídica das parcerias?',
      a: 'Nossa equipe de suporte jurídico cuida da elaboração de todos os contratos de parceria, acordos de confidencialidade (NDA) e termos de comissionamento, assegurando que não haja by-pass e que os recebimentos ocorram de forma clara e blindada.',
    },
    {
      q: 'Como funciona a tecnologia de matchmaking?',
      a: 'Os membros cadastram suas demandas (clientes buscando) e ofertas (imóveis em carteira) de forma confidencial. Nosso algoritmo inteligente cruza esses dados e alerta as duas pontas instantaneamente quando há um match ideal, acelerando drasticamente a liquidez.',
    },
    {
      q: 'Como posso entrar em contato com o suporte?',
      a: (
        <>
          Nossa equipe está disponível através do email oficial:{' '}
          <a
            href="mailto:contato@primecircle.app.br"
            className="text-primary hover:underline font-medium"
          >
            contato@primecircle.app.br
          </a>
          . Sinta-se à vontade para nos acionar em caso de dúvidas ou necessidades de suporte
          técnico.
        </>
      ),
    },
  ]

  return (
    <section className="py-24 bg-background border-t border-border/50 relative">
      <div className="absolute bottom-0 left-0 w-full h-[300px] bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Perguntas <span className="text-primary">Frequentes</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Tire suas dúvidas sobre o ecossistema exclusivo do Prime Circle.
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="border border-border/50 bg-card rounded-lg px-6 data-[state=open]:border-primary/50 data-[state=open]:shadow-[0_0_20px_rgba(201,168,76,0.05)] transition-all"
            >
              <AccordionTrigger className="text-left text-lg font-medium hover:no-underline hover:text-primary py-6">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-base leading-relaxed pb-6">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-12 text-center text-muted-foreground text-sm">
          Ainda tem dúvidas? Fale conosco em{' '}
          <a
            href="mailto:contato@primecircle.app.br"
            className="text-primary hover:underline font-medium"
          >
            contato@primecircle.app.br
          </a>
        </div>
      </div>
    </section>
  )
}
