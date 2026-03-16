import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'

export function TiersSection() {
  const tiers = [
    {
      name: 'Bronze',
      target: 'Membros Iniciais',
      features: [
        'Acesso à rede fechada',
        'Suporte jurídico básico',
        'Comissionamento padrão 50/50',
        'Perfil no diretório nacional',
      ],
      highlight: false,
    },
    {
      name: 'Prata',
      target: 'Corretores em Ascensão',
      features: [
        'Destaque no matchmaking',
        'Assessoria de marketing',
        'Eventos e imersões exclusivas',
        'Análise de dados de mercado',
      ],
      highlight: true,
    },
    {
      name: 'Ouro',
      target: 'Elite Prime Circle',
      features: [
        'Prioridade em leads prime',
        'Account manager dedicado',
        'Assento no comitê de diretoria',
        'Benefícios premium de parceiros',
      ],
      highlight: false,
    },
  ]

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Programa de <span className="text-primary">Embaixadores</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Uma jornada clara de crescimento. Quanto mais negócios você fecha na rede, maiores seus
            benefícios e prioridades.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-center">
          {tiers.map((tier, index) => (
            <Card
              key={index}
              className={`relative ${
                tier.highlight
                  ? 'border-primary shadow-[0_0_30px_rgba(201,168,76,0.15)] md:-translate-y-4 bg-card/90 backdrop-blur'
                  : 'border-border/50 bg-card/50'
              }`}
            >
              {tier.highlight && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                  Avançado
                </div>
              )}
              <CardHeader className="text-center pb-8 pt-8">
                <h3 className="text-3xl font-bold mb-2 text-foreground">{tier.name}</h3>
                <p className="text-primary/80 font-medium">{tier.target}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {tier.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground/90 leading-snug">{feature}</span>
                  </div>
                ))}
              </CardContent>
              <CardFooter className="pt-8 pb-8">
                <Button
                  asChild
                  className="w-full h-12 font-semibold"
                  variant={tier.highlight ? 'default' : 'outline'}
                >
                  <Link to="/apply">Aplicar Agora</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
