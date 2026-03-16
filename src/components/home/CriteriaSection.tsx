import { Check } from 'lucide-react'

export function CriteriaSection() {
  const criteria = [
    'Atuação principal na Barra da Tijuca',
    'Ticket médio acima de R$ 1 Milhão',
    'CRECI ativo e verificado',
    'Concordância com a política 50/50',
    'Recomendação de um membro fundador (Prioridade)',
  ]

  return (
    <section className="py-24 bg-secondary/30 relative border-t border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Não é para todos. E esse é o ponto.
          </h2>
          <p className="text-lg text-muted-foreground">
            Mantemos a integridade da rede com uma barreira de entrada alta. Auto-aprovação
            habilitada apenas para quem cumpre 100% dos requisitos abaixo.
          </p>
        </div>

        <div className="max-w-xl mx-auto bg-card rounded-2xl border border-border p-8 shadow-elevation">
          <ul className="space-y-4">
            {criteria.map((c, i) => (
              <li key={i} className="flex items-center gap-3 text-white text-lg">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <Check className="w-4 h-4 text-primary" />
                </div>
                {c}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
