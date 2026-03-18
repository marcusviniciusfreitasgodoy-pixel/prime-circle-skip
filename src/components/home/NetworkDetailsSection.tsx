import { Card } from '@/components/ui/card'
import { Megaphone, Search, Handshake } from 'lucide-react'

export function NetworkDetailsSection() {
  return (
    <section
      id="network-details"
      className="py-24 bg-zinc-950 text-white relative border-t border-zinc-900 overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-primary/5 via-zinc-950 to-zinc-950 opacity-50" />

      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs sm:text-sm font-medium text-primary">
            Processo Colaborativo
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
            Como Funciona a <span className="text-primary">Nossa Rede</span>
          </h2>
          <p className="text-lg text-zinc-400">
            Diferente de algoritmos automatizados, o Prime Circle foca na interação humana e na
            inteligência de mercado dos melhores corretores em seus respectivos Núcleos Regionais.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative mt-12">
          {/* Connector line for desktop */}
          <div className="hidden md:block absolute top-16 left-[16%] right-[16%] h-[2px] bg-gradient-to-r from-zinc-800 via-primary/50 to-zinc-800 z-0" />

          {/* Step 1 */}
          <Card className="bg-zinc-900/60 border-zinc-800 backdrop-blur p-8 relative z-10 hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 group">
            <div className="w-16 h-16 rounded-2xl bg-zinc-950 flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(201,168,76,0.1)] border border-zinc-800 mx-auto group-hover:border-primary/50 group-hover:scale-110 transition-all duration-300">
              <Megaphone className="w-8 h-8 text-primary" />
            </div>
            <div className="text-center">
              <span className="text-primary text-xs font-bold tracking-widest uppercase mb-3 block">
                Pilar 1
              </span>
              <h3 className="text-xl font-bold text-zinc-100 mb-4">
                Publicação de Oportunidades e Demandas
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Nossos corretores parceiros têm a disponibilidade e o interesse constante em
                publicar suas oportunidades reais e as necessidades específicas de seus clientes em
                um ambiente seguro e qualificado.
              </p>
            </div>
          </Card>

          {/* Step 2 */}
          <Card className="bg-zinc-900/60 border-zinc-800 backdrop-blur p-8 relative z-10 hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 group">
            <div className="w-16 h-16 rounded-2xl bg-zinc-950 flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(201,168,76,0.1)] border border-zinc-800 mx-auto group-hover:border-primary/50 group-hover:scale-110 transition-all duration-300">
              <Search className="w-8 h-8 text-primary" />
            </div>
            <div className="text-center">
              <span className="text-primary text-xs font-bold tracking-widest uppercase mb-3 block">
                Pilar 2
              </span>
              <h3 className="text-xl font-bold text-zinc-100 mb-4">Busca em Imóveis Reservados</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Facilitamos a busca de imóveis que não estão disponíveis nas imobiliárias ou portais
                públicos, atendendo com precisão às exigências dos clientes mais exclusivos.
              </p>
            </div>
          </Card>

          {/* Step 3 */}
          <Card className="bg-zinc-900/60 border-zinc-800 backdrop-blur p-8 relative z-10 hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 group">
            <div className="w-16 h-16 rounded-2xl bg-zinc-950 flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(201,168,76,0.1)] border border-zinc-800 mx-auto group-hover:border-primary/50 group-hover:scale-110 transition-all duration-300">
              <Handshake className="w-8 h-8 text-primary" />
            </div>
            <div className="text-center">
              <span className="text-primary text-xs font-bold tracking-widest uppercase mb-3 block">
                Pilar 3
              </span>
              <h3 className="text-xl font-bold text-zinc-100 mb-4">Colaboração de Elite</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                A infraestrutura do Prime Circle gera conexões diretas, transparentes e justas entre
                corretores de alto padrão, garantindo agilidade no fechamento de negócios e liquidez
                imediata.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}
