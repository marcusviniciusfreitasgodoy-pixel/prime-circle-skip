import { Shield, Target, Lock } from 'lucide-react'

export function NetworkSection() {
  return (
    <section className="py-24 bg-background relative border-t border-border overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          <div className="flex-1 space-y-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Uma infraestrutura desenhada para liquidez e confiança.</h2>
              <p className="text-lg text-muted-foreground">O Prime Circle não é um portal. É uma ferramenta operacional focada na garantia de negócios (50/50) através de Chapter Isolation e curadoria rigorosa.</p>
            </div>

            <ul className="space-y-6">
              <li className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white">Governança Rigorosa</h4>
                  <p className="text-muted-foreground mt-1">Acesso exclusivo por convite. Verificação automática de 7 critérios e auditoria contínua de atividade.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Target className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white">Matches Precisos</h4>
                  <p className="text-muted-foreground mt-1">Algoritmo liga diretamente suas demandas ativas aos imóveis da rede, gerando um pipeline estruturado até o fechamento.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Lock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white">Chapter Isolation</h4>
                  <p className="text-muted-foreground mt-1">Informações isoladas por região (Ex: Barra da Tijuca). Suas demandas não vazam para fora do seu círculo de atuação.</p>
                </div>
              </li>
            </ul>
          </div>
          
          <div className="flex-1 w-full max-w-md lg:max-w-none">
             <div className="bg-card border border-primary/30 p-8 rounded-2xl shadow-[0_0_40px_rgba(201,168,76,0.15)] relative">
                <div className="absolute -top-4 -right-4 bg-primary text-black font-bold text-xs px-3 py-1 rounded-full">AMBIENTE SEGURO</div>
                <h3 className="text-xl font-bold text-white mb-6 border-b border-border pb-4">Política de Engajamento</h3>
                <div className="space-y-4 text-sm text-muted-foreground">
                   <p className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> Adesão mandatória à divisão 50/50 em comissões.</p>
                   <p className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> Necessidade de confirmação bilateral para negócios fechados.</p>
                   <p className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-destructive" /> Inatividade prolongada (>60 dias) acarreta perda de benefícios.</p>
                   <p className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-destructive" /> Transgressão ética resulta em banimento sem recurso.</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </section>
  )
}
