import { CheckCircle2, ArrowRight, Network } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import networkImg from '@/assets/voce-quer-parceria-seria-45452.png'

export function NetworkSection() {
  return (
    <section className="py-24 bg-zinc-50 dark:bg-zinc-900 overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="order-2 lg:order-1 relative">
            <div className="relative w-full h-[350px] sm:h-[400px] lg:h-[600px] rounded-3xl overflow-hidden shadow-2xl border border-zinc-200/50 dark:border-zinc-800/50">
              <img
                src={networkImg}
                alt="Profissionais trabalhando juntos em um escritório"
                className="absolute inset-0 w-full h-full object-cover scale-110 object-center"
              />
              <Card className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6 p-4 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm border-zinc-200/50 dark:border-zinc-800/50 shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Network className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm sm:text-base">
                      Rede de Colaboração
                    </p>
                    <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                      Parcerias diretas e alta liquidez
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          <div className="order-1 lg:order-2 space-y-6 sm:space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                Conexões que geram <span className="text-primary">liquidez imediata</span>
              </h2>
              <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
                O verdadeiro valor da nossa rede está na colaboração ativa. Uma comunidade onde você
                pode publicar oportunidades reais e buscar imóveis para atender às necessidades
                específicas dos seus clientes, acessando um portfólio que não está disponível nas
                imobiliárias tradicionais.
              </p>
            </div>

            <ul className="space-y-4">
              {[
                {
                  title: 'Oportunidades Reais',
                  desc: 'Publicação direta de demandas e necessidades dos clientes.',
                },
                {
                  title: 'Acesso a Imóveis Reservados',
                  desc: 'Estoque exclusivo e imóveis que não aparecem em portais tradicionais.',
                },
                {
                  title: 'Liquidez e Colaboração',
                  desc: 'Conexões diretas entre corretores para fechamento ágil de negócios.',
                },
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm sm:text-base text-zinc-700 dark:text-zinc-300">
                    <strong className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {item.title}:
                    </strong>{' '}
                    {item.desc}
                  </span>
                </li>
              ))}
            </ul>

            <Button asChild size="lg" className="gap-2 w-full sm:w-auto font-semibold">
              <a href="#network-details">
                Como funciona a rede <ArrowRight className="w-4 h-4" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
