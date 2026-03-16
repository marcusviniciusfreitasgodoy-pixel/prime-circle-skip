import { Award, Briefcase, Star, Users, Target, Handshake, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function CriteriaSection() {
  const pillars = [
    {
      icon: Briefcase,
      title: 'Experiência Comprovada',
      desc: 'Histórico de transações de alto valor no mercado imobiliário.',
    },
    {
      icon: Star,
      title: 'Portfólio de Alto Padrão',
      desc: 'Acesso a imóveis exclusivos e carteira "off-market".',
    },
    {
      icon: Award,
      title: 'Reputação Ilibada',
      desc: 'Conduta ética inquestionável atestada pelo próprio mercado.',
    },
    {
      icon: Users,
      title: 'Networking Qualificado',
      desc: 'Relacionamento ativo com clientes e investidores de alta renda.',
    },
    {
      icon: Target,
      title: 'Foco no Cliente',
      desc: 'Atendimento consultivo e personalizado de excelência extrema.',
    },
    {
      icon: Handshake,
      title: 'Colaboração (50/50)',
      desc: 'Mentalidade aberta e transparente para parcerias estruturadas.',
    },
    {
      icon: TrendingUp,
      title: 'Mentalidade de Crescimento',
      desc: 'Busca constante por inovação, capacitação e ganho de escala.',
    },
  ]

  return (
    <section className="py-24 bg-secondary/10 relative overflow-hidden border-t border-border/50">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Os <span className="text-primary">7 Pilares</span> de Seleção
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Nossa rede é fechada por um motivo. Exigimos o mais alto nível de profissionalismo e
            alinhamento ético para proteger nossos membros.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((pillar, index) => (
            <Card
              key={index}
              className="bg-card/80 backdrop-blur border-primary/10 hover:border-primary/40 transition-all duration-300 group hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(201,168,76,0.1)]"
            >
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <pillar.icon className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-lg">{pillar.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">{pillar.desc}</p>
              </CardContent>
            </Card>
          ))}
          <div className="hidden lg:flex items-center justify-center p-6 border border-dashed border-primary/30 rounded-xl bg-primary/5">
            <p className="text-primary/90 text-sm font-semibold text-center uppercase tracking-widest">
              Apenas a Elite.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
