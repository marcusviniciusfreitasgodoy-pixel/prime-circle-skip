import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ChevronRight, FileText, Search, UserCheck, Play, DollarSign } from 'lucide-react'

export function ProcessTimeline() {
  const steps = [
    {
      icon: FileText,
      title: 'Aplicação',
      desc: 'Preenchimento do formulário inicial com seu histórico.',
    },
    {
      icon: Search,
      title: 'Análise Técnica',
      desc: 'Avaliação de portfólio e background check detalhado.',
    },
    {
      icon: UserCheck,
      title: 'Entrevista',
      desc: 'Alinhamento cultural e validação dos 7 pilares.',
    },
    {
      icon: Play,
      title: 'Onboarding',
      desc: 'Acesso à tecnologia de match e imersão na rede.',
    },
    {
      icon: DollarSign,
      title: 'Fechamento',
      desc: 'Match realizado e primeira comissão 50/50 segura.',
    },
  ]

  return (
    <section className="py-24 bg-card border-t border-border/50 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Seu Caminho até a <span className="text-primary">Elite</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Um processo seletivo estruturado para garantir a excelência e exclusividade da nossa
            comunidade.
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
                className="relative flex md:flex-col items-start md:items-center gap-6 md:gap-4"
              >
                <div className="relative z-10 w-16 h-16 rounded-full bg-background border-2 border-primary shadow-[0_0_15px_rgba(201,168,76,0.3)] flex items-center justify-center shrink-0 mx-auto">
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
          <Button size="lg" asChild className="h-14 px-10 shadow-[0_0_20px_rgba(201,168,76,0.2)]">
            <Link to="/apply">
              Iniciar Aplicação <ChevronRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
