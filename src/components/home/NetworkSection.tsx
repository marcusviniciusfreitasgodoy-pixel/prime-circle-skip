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
            <div className="relative w-full h-[400px] lg:h-[600px] rounded-3xl overflow-hidden shadow-2xl border border-zinc-200/50 dark:border-zinc-800/50">
              {/* Image with scale-[1.05] to hide the bottom-right AI watermark */}
              <img
                src={networkImg}
                alt="Profissionais trabalhando juntos em um escritório"
                className="absolute inset-0 w-full h-full object-cover scale-[1.05] object-center"
              />
              <Card className="absolute bottom-6 left-6 right-6 p-4 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm border-zinc-200/50 dark:border-zinc-800/50 shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Network className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                      Algorithm Match
                    </p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      Conexões inteligentes e alta liquidez
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          <div className="order-1 lg:order-2 space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                Conexões que geram <span className="text-primary">liquidez imediata</span>
              </h2>
              <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Nossa infraestrutura utiliza inteligência de mercado avançada para cruzar dados de
                oferta e demanda entre os principais corretores de alto padrão, garantindo negócios
                mais rápidos e eficientes.
              </p>
            </div>

            <ul className="space-y-4">
              {[
                'Match perfeito entre o seu imóvel e o cliente ideal.',
                'Acesso a uma rede fechada de corretores de elite.',
                'Transações otimizadas com foco em resultados reais.',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-primary shrink-0" />
                  <span className="text-zinc-700 dark:text-zinc-300">{item}</span>
                </li>
              ))}
            </ul>

            <Button size="lg" className="gap-2">
              Entenda o Algoritmo <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
