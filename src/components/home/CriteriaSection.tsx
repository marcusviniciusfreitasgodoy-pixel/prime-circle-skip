import { Shield, Lock, Award } from 'lucide-react'
import { Card } from '@/components/ui/card'
import criteriaImg from '@/assets/gemini_generated_image_7mhaio7mhaio7mha-a5b5d.png'

export function CriteriaSection() {
  return (
    <section className="py-24 bg-zinc-950 text-white overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-zinc-950 opacity-80" />

      <div className="container relative mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-4">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
            Critérios de <span className="text-primary">Admissão</span>
          </h2>
          <p className="text-base sm:text-lg text-zinc-400">
            O Prime Circle é um clube de negócios e networking exclusivo. Nossa curadoria garante
            que apenas profissionais com histórico comprovado integrem nossa rede.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          <div className="lg:col-span-5 space-y-4 sm:space-y-6 order-2 lg:order-1">
            <Card className="p-5 sm:p-6 bg-zinc-900/50 border-zinc-800 backdrop-blur text-left hover:bg-zinc-800/80 transition-colors shadow-lg">
              <div className="flex gap-4">
                <Shield className="w-8 h-8 text-primary shrink-0" />
                <div>
                  <h3 className="font-semibold text-base sm:text-lg text-zinc-100">
                    Reputação Ilibada
                  </h3>
                  <p className="text-zinc-400 mt-2 text-xs sm:text-sm leading-relaxed">
                    Análise criteriosa do histórico profissional no mercado imobiliário de luxo.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-5 sm:p-6 bg-zinc-900/50 border-zinc-800 backdrop-blur text-left hover:bg-zinc-800/80 transition-colors shadow-lg">
              <div className="flex gap-4">
                <Award className="w-8 h-8 text-primary shrink-0" />
                <div>
                  <h3 className="font-semibold text-base sm:text-lg text-zinc-100">
                    Volume de Vendas
                  </h3>
                  <p className="text-zinc-400 mt-2 text-xs sm:text-sm leading-relaxed">
                    Exigência de VGV mínimo comprovado nos últimos 24 meses em propriedades de alto
                    padrão.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-5 sm:p-6 bg-zinc-900/50 border-zinc-800 backdrop-blur text-left hover:bg-zinc-800/80 transition-colors shadow-lg">
              <div className="flex gap-4">
                <Lock className="w-8 h-8 text-primary shrink-0" />
                <div>
                  <h3 className="font-semibold text-base sm:text-lg text-zinc-100">
                    Indicação Exclusiva
                  </h3>
                  <p className="text-zinc-400 mt-2 text-xs sm:text-sm leading-relaxed">
                    A entrada requer aprovação por membros ativos e análise da diretoria do clube.
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-7 relative w-full h-[350px] sm:h-[450px] lg:h-[600px] rounded-3xl overflow-hidden ring-1 ring-white/10 shadow-2xl order-1 lg:order-2">
            {/* Using scale-110 inside an overflow-hidden wrapper conceals AI generation watermarks */}
            <img
              src={criteriaImg}
              alt="Membros do Prime Circle em reunião"
              className="w-full h-full object-cover scale-110 object-center brightness-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-zinc-950/90 lg:from-zinc-950/80 via-transparent to-transparent pointer-events-none" />
          </div>
        </div>
      </div>
    </section>
  )
}
