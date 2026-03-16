import { Shield, Target, Lock } from 'lucide-react'

export function NetworkSection() {
  return (
    <section className="py-24 bg-background relative border-t border-border overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          <div className="flex-1 space-y-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Tecnologia proprietária para gerar liquidez imediata.
              </h2>
              <p className="text-lg text-muted-foreground">
                O Prime Circle não é mais uma vitrine de imóveis. É um clube de negócios movido por
                uma infraestrutura de liquidez automática, focada na garantia de negócios (50/50) e
                curadoria rigorosa.
              </p>
            </div>

            <ul className="space-y-6">
              <li className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white">Governança de Elite</h4>
                  <p className="text-muted-foreground mt-1">
                    Acesso exclusivo por convite e aprovação. Verificação de credenciais e auditoria
                    contínua para garantir um ambiente 100% profissional.
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Target className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white">Algoritmo de Match</h4>
                  <p className="text-muted-foreground mt-1">
                    Nossa tecnologia cruza automaticamente as demandas ativas com os imóveis
                    off-market da rede, gerando liquidez imediata e conexões precisas sem esforço
                    manual.
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Lock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white">Chapter Isolation</h4>
                  <p className="text-muted-foreground mt-1">
                    Suas operações são isoladas e protegidas. Demandas e ofertas da Barra da Tijuca
                    não vazam, mantendo a exclusividade e confidencialidade dos seus clientes.
                  </p>
                </div>
              </li>
            </ul>
          </div>

          <div className="flex-1 w-full max-w-md lg:max-w-none relative mx-auto">
            <div className="relative w-full aspect-square lg:aspect-[4/5] rounded-2xl overflow-hidden border border-border">
              <img
                src="https://img.usecurling.com/p/800/1000?q=two%20business%20professionals%20office"
                alt="Match Algorithm e Inteligência de Mercado"
                className="w-full h-full object-cover object-center scale-110"
              />
              <div className="absolute inset-0 bg-black/30 mix-blend-multiply pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-90 pointer-events-none" />
            </div>

            <div className="bg-card border border-primary/30 p-6 sm:p-8 rounded-2xl shadow-[0_0_40px_rgba(201,168,76,0.15)] relative -mt-24 lg:mt-0 lg:absolute lg:-left-12 lg:bottom-12 lg:w-[calc(100%+3rem)] lg:max-w-md mx-4 lg:mx-0 z-10">
              <div className="absolute -top-4 -right-4 bg-primary text-black font-bold text-xs px-3 py-1 rounded-full">
                AMBIENTE SEGURO
              </div>
              <h3 className="text-xl font-bold text-white mb-6 border-b border-border pb-4">
                O Padrão Prime Circle
              </h3>
              <div className="space-y-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" /> Adesão mandatória
                  à divisão 50/50 em comissões.
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" /> Sigilo absoluto
                  sobre as operações e clientes envolvidos.
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-destructive shrink-0" /> Inatividade
                  prolongada (&gt;60 dias) acarreta perda de acesso.
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-destructive shrink-0" /> Quebra de
                  governança ou ética resulta em banimento irreversível.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
