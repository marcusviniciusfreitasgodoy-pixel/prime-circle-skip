import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ChevronRight, FileText, Search, Zap, Play, DollarSign } from 'lucide-react'

export function ProcessTimeline() {
  const steps = [
    {
      icon: Search,
      title: 'Admissão',
      desc: 'Validação de CRECI e histórico para entrada na rede.',
    },
    {
      icon: FileText,
      title: 'Listagem Privativa',
      desc: 'Publicação do seu portfólio de forma segura e restrita.',
    },
    {
      icon: Zap,
      title: 'Conexão Automática',
      desc: 'Nossa IA cruza suas ofertas com demandas ativas.',
    },
    {
      icon: Play,
      title: 'Negociação Direta',
      desc: 'Conexão direta com o corretor parceiro para agendamento.',
    },
    {
      icon: DollarSign,
      title: 'Sucesso Mútuo',
      desc: 'Fechamento do negócio com divisão obrigatória de 50/50.',
    },
  ]

  return (
    <section className="py-24 bg-card border-t border-border/50 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            O Ciclo de <span className="text-primary">Sucesso</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A jornada do corretor de alto padrão dentro da nossa infraestrutura: do cadastro à
            comissão garantida.
          </p>
        </div>

        <div className="relative">
          {/* Vertical line for mobile */}
          <div className="absolute left-8 top-4 bottom-4 w-px bg-primary/20 md:hidden" />

          <div className="space-y-12 md:space-y-0 md:grid md:grid-cols-5 md:gap-4 relative">
            {/* Horizontal line for desktop */}
            <div className="hidden md:block absolute top-8 left-12 right-12 h-px bg-primary/20" />

            {steps.map((step, index) => (
              <div
                key={index}
                className="relative flex md:flex-col items-start md:items-center gap-6 md:gap-4 group"
              >
                <div className="relative z-10 w-16 h-16 rounded-full bg-background border-2 border-primary shadow-[0_0_15px_rgba(201,168,76,0.2)] flex items-center justify-center shrink-0 mx-auto group-hover:scale-110 transition-transform">
                  <step.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="pt-2 md:pt-6 md:text-center">
                  <div className="text-xs font-bold text-primary mb-2 uppercase tracking-widest">
                    Passo {index + 1}
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-foreground">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-20 text-center">
          <Button
            size="lg"
            asChild
            className="h-14 px-10 shadow-[0_0_20px_rgba(201,168,76,0.2)] hover:scale-105 transition-transform duration-300"
          >
            <Link to="/apply">
              Iniciar Aplicação <ChevronRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
