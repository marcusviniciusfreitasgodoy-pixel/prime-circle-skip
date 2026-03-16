import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Check, X, ChevronRight } from 'lucide-react'

export function ComparisonSection() {
  const comparisons = [
    {
      feature: 'Gestão de Dados',
      traditional: 'Informação Descentralizada',
      prime: 'Plataforma Centralizada',
    },
    {
      feature: 'Rastreabilidade',
      traditional: 'Perda de Histórico',
      prime: 'Histórico Completo de Negociações',
    },
    {
      feature: 'Comunicação',
      traditional: 'Ruído Excessivo',
      prime: 'Comunicação Assertiva',
    },
    {
      feature: 'Operação',
      traditional: 'Gestão Manual e Ineficiente',
      prime: 'Automação e Suporte 50/50',
    },
  ]

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[150px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
            A Evolução do <span className="text-primary">Profissionalismo</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Grupos de WhatsApp são ineficientes e descentralizados. O Prime Circle é a
            infraestrutura definitiva para profissionalizar sua carreira e escalar suas vendas com
            segurança.
          </p>
        </div>

        <div className="space-y-4 md:space-y-0 md:bg-card/50 md:backdrop-blur-sm md:border md:border-primary/20 md:rounded-xl md:shadow-[0_0_40px_rgba(201,168,76,0.05)] md:overflow-hidden">
          {/* Desktop Header */}
          <div className="hidden md:grid md:grid-cols-3 bg-secondary/50 border-b border-primary/20">
            <div className="py-6 px-8 text-lg font-semibold text-foreground">Recurso</div>
            <div className="py-6 px-8 text-lg font-semibold text-muted-foreground text-center">
              Grupos de WhatsApp
            </div>
            <div className="py-6 px-8 text-lg font-bold text-primary text-center">Prime Circle</div>
          </div>

          {/* Rows */}
          <div className="grid gap-6 md:gap-0">
            {comparisons.map((row, index) => (
              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-0 p-6 md:p-0 bg-card/50 md:bg-transparent border border-primary/10 md:border-0 md:border-b md:last:border-0 rounded-xl md:rounded-none hover:bg-primary/5 transition-colors"
              >
                {/* Mobile Feature Title */}
                <div className="font-bold text-lg md:hidden text-foreground border-b border-border/50 pb-3 mb-2">
                  {row.feature}
                </div>

                {/* Desktop Feature Title */}
                <div className="hidden md:flex items-center px-8 py-6 font-medium text-base">
                  {row.feature}
                </div>

                {/* Traditional (WhatsApp) */}
                <div className="flex flex-col justify-center md:items-center md:px-8 md:py-6">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 md:hidden">
                    Situação Atual (WhatsApp)
                  </span>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center shrink-0 md:w-auto md:h-auto md:bg-transparent">
                      <X className="w-5 h-5 text-destructive" />
                    </div>
                    <span className="font-medium md:font-normal">{row.traditional}</span>
                  </div>
                </div>

                {/* Prime Circle */}
                <div className="flex flex-col justify-center md:items-center bg-primary/10 md:bg-transparent rounded-lg p-5 md:p-6 mt-2 md:mt-0 border border-primary/20 md:border-0">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-wider mb-2 md:hidden">
                    Solução Proposta
                  </span>
                  <div className="flex items-center gap-3 text-foreground font-semibold">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 md:w-auto md:h-auto md:bg-transparent">
                      <Check className="w-6 h-6 text-primary" />
                    </div>
                    <span className="text-[15px] md:text-base">{row.prime}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-20 text-center flex flex-col items-center">
          <Button
            size="lg"
            asChild
            className="h-16 px-12 text-lg font-bold shadow-[0_0_30px_rgba(201,168,76,0.25)] hover:shadow-[0_0_50px_rgba(201,168,76,0.4)] transition-all duration-300 hover:-translate-y-1"
          >
            <Link to="/apply">
              Fazer Minha Aplicação <ChevronRight className="ml-2 w-6 h-6" />
            </Link>
          </Button>
          <p className="mt-6 text-sm text-muted-foreground font-medium flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Vagas limitadas para manter a exclusividade da rede.
          </p>
        </div>
      </div>
    </section>
  )
}
