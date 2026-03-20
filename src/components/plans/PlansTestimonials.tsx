import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const testimonials = [
  {
    name: 'Carlos Eduardo',
    plan: 'Plano PROFESSIONAL',
    text: 'Fechei 3 negócios em apenas 1 mês usando a rede da Prime Circle. A exposição ilimitada de imóveis e o desconto por matches fazem toda a diferença na lucratividade.',
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=15',
    initials: 'CE',
  },
  {
    name: 'Mariana Fontes',
    plan: 'Plano FOUNDER',
    text: 'Entrei logo no início do Prime Circle e o acesso direto a demandas tão qualificadas me colocou em outro patamar de atendimento com meus clientes premium.',
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=female&seed=22',
    initials: 'MF',
  },
  {
    name: 'Roberto Alves',
    plan: 'Plano PROFESSIONAL',
    text: 'Sem dúvidas o melhor investimento para o meu negócio. Em poucas semanas já bati o teto de desconto pelas conexões geradas. O retorno sobre o investimento é imediato.',
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=8',
    initials: 'RA',
  },
]

export function PlansTestimonials() {
  return (
    <div className="mt-24">
      <div className="text-center mb-10">
        <h3 className="text-3xl font-bold text-white mb-4">O Que Dizem Nossos Corretores</h3>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Profissionais que já estão transformando sua forma de fazer negócios através da nossa
          infraestrutura de liquidez.
        </p>
      </div>
      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {testimonials.map((t, i) => (
          <Card
            key={i}
            className="bg-secondary/20 border-border hover:bg-secondary/40 transition-colors"
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <Avatar className="h-12 w-12 border border-primary/20">
                  <AvatarImage src={t.avatar} alt={t.name} />
                  <AvatarFallback>{t.initials}</AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-bold text-white text-base">{t.name}</h4>
                  <p className="text-xs text-primary font-medium">{t.plan}</p>
                </div>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed italic">"{t.text}"</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
