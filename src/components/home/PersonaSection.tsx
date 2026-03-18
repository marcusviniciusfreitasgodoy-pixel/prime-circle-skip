import { Building2, Users, TrendingUp, ShieldCheck } from 'lucide-react'
import personaImg from '@/assets/voce-tem-o-imovel-84ce6.png'

export function PersonaSection() {
  return (
    <section className="py-24 bg-white dark:bg-zinc-950 overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="space-y-6 sm:space-y-8 order-2 lg:order-1">
            <div className="space-y-4">
              <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs sm:text-sm font-medium text-primary">
                Perfil do Membro
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                Feito para quem <span className="text-primary">movimenta o mercado</span>
              </h2>
              <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
                O Prime Circle é um ambiente restrito, desenhado exclusivamente para corretores de
                alto padrão que buscam parcerias estratégicas, discrição e acesso a um portfólio de
                imóveis reservados incomparável.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                {
                  icon: Users,
                  title: 'Networking Premium',
                  desc: 'Acesso direto aos top producers.',
                },
                {
                  icon: Building2,
                  title: 'Portfólio Exclusivo',
                  desc: 'Imóveis reservados selecionados.',
                },
                {
                  icon: ShieldCheck,
                  title: 'Discrição Total',
                  desc: 'Ambiente seguro para negócios.',
                },
                {
                  icon: TrendingUp,
                  title: 'Alta Liquidez',
                  desc: 'Fechamentos ágeis e assertivos.',
                },
              ].map((feature, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <feature.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm sm:text-base">
                      {feature.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                      {feature.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative w-full h-[400px] sm:h-[500px] lg:h-[700px] mt-8 lg:mt-0 order-1 lg:order-2">
            <div className="absolute inset-0 rounded-3xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/50 dark:border-zinc-700/50 shadow-2xl">
              {/* Hiding AI watermark reliably with scale-110 */}
              <img
                src={personaImg}
                alt="Corretora de alto padrão"
                className="w-full h-full object-cover scale-110 object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/90 via-zinc-900/30 to-transparent pointer-events-none" />
              <div className="absolute bottom-6 sm:bottom-8 left-6 sm:left-8 right-6 sm:right-8 text-white z-10">
                <p className="font-medium text-lg sm:text-xl">
                  Junte-se aos melhores profissionais
                </p>
                <p className="text-zinc-300 text-xs sm:text-sm mt-2 max-w-sm">
                  Aumente sua autoridade local e maximize seus resultados no mercado de alto padrão
                  da Barra da Tijuca
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
