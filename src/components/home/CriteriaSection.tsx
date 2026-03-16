import { Check, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function CriteriaSection() {
  const criteria = [
    'Atuação principal focada na Barra da Tijuca',
    'Ticket médio comprovado acima de R$ 1 Milhão',
    'CRECI ativo, regular e verificado',
    'Adesão incondicional à política de parceria 50/50',
    'Indicação direta de um membro fundador (Requisito Ouro)',
  ]

  return (
    <section className="py-24 bg-secondary/30 relative border-t border-border overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="relative w-full aspect-[4/3] sm:aspect-square lg:aspect-auto lg:h-[700px] rounded-2xl overflow-hidden order-2 lg:order-1 border border-border shadow-elevation">
            <img
              src="https://img.usecurling.com/p/800/1000?q=group%20rooftop%20city"
              alt="Elite Club Networking"
              className="w-full h-full object-cover object-center scale-110"
            />
            <div className="absolute inset-0 bg-black/40 mix-blend-multiply pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-tr from-background/80 via-transparent to-transparent pointer-events-none" />
          </div>

          <div className="order-1 lg:order-2 space-y-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Não é para todos. E esse é exatamente o ponto.
              </h2>
              <p className="text-lg text-muted-foreground">
                Preservamos a integridade e a altíssima performance da nossa rede através de uma
                barreira de entrada rigorosa. O acesso é liberado apenas para quem cumpre
                integralmente nossos requisitos.
              </p>
            </div>

            <div className="bg-card rounded-2xl border border-border p-6 sm:p-8 shadow-elevation">
              <ul className="space-y-4">
                {criteria.map((c, i) => (
                  <li key={i} className="flex items-center gap-3 text-white text-base sm:text-lg">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                      <Check className="w-4 h-4 text-primary" />
                    </div>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <Button
                size="lg"
                className="h-14 px-8 text-base w-full sm:w-auto shadow-lg shadow-primary/25 hover:scale-105 transition-transform duration-300"
              >
                Quero fazer parte
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-14 px-8 text-base w-full sm:w-auto border-border text-white hover:bg-secondary transition-all duration-300"
              >
                Ver requisitos
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
