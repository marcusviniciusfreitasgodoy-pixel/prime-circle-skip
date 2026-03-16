import circleImage from '@/assets/gemini_generated_image_7mhaio7mhaio7mha-efbfa.png'
import { Shield, Globe, TrendingUp } from 'lucide-react'

export function NetworkSection() {
  return (
    <section id="how-it-works" className="py-24 bg-background border-t border-border/50 relative">
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            O Modelo <span className="text-primary">50/50</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            No Prime Circle, o sucesso é compartilhado. Trabalhe com uma comunidade de elite e
            maximize seus resultados juntos.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative group mx-auto w-full max-w-md lg:max-w-none">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/40 to-primary/10 rounded-xl blur-lg opacity-30 group-hover:opacity-60 transition duration-700"></div>
            <img
              src={circleImage}
              alt="Prime Circle Network"
              className="relative rounded-xl w-full object-cover shadow-2xl border border-primary/20 aspect-square lg:aspect-auto lg:h-[500px]"
            />
          </div>

          <div className="space-y-10">
            <div className="flex gap-6">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/30">
                <Globe className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Rede Fechada e Exclusiva</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Conecte-se exclusivamente com profissionais validados que operam imóveis de
                  altíssimo padrão. Compartilhe portfólios confidenciais com total segurança.
                </p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/30">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Parceria 50/50 Segura</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Fluxos garantidos pela nossa plataforma. Divida comissões de forma transparente e
                  elimine qualquer ruído nas negociações conjuntas.
                </p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/30">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Liquidez Imediata</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Cruze seus clientes compradores com o inventário da rede. Multiplique suas chances
                  de conversão aproveitando o poder da comunidade.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
