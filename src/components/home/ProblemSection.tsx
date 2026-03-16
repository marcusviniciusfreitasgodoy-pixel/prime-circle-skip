import { XCircle, CheckCircle2 } from 'lucide-react'

export function ProblemSection() {
  const points = [
    {
      pain: 'Falta de liquidez e inventário estagnado sem clientes qualificados.',
      solution: 'Cruze ofertas e demandas com uma rede nacional conectada instantaneamente.',
    },
    {
      pain: 'Isolamento profissional e custos operacionais e jurídicos altíssimos.',
      solution: 'Acesse infraestrutura jurídica e tecnológica de ponta compartilhada.',
    },
    {
      pain: 'Parcerias informais (boca a boca) com alto risco de by-pass.',
      solution: 'Segurança jurídica e fluxo financeiro garantidos em cada negociação.',
    },
  ]

  return (
    <section className="py-24 bg-secondary/20 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            O mercado imobiliário tradicional <span className="text-primary">está quebrado</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            A forma como os corretores fazem parcerias hoje é ineficiente e arriscada. Nós mudamos
            as regras do jogo para alta performance.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {points.map((point, i) => (
            <div
              key={i}
              className="bg-card border border-border/50 rounded-xl p-8 shadow-lg relative overflow-hidden group"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-destructive/50 to-destructive" />
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4 text-destructive">
                  <XCircle className="w-6 h-6 shrink-0" />
                  <h3 className="font-semibold text-lg">Mercado Tradicional</h3>
                </div>
                <p className="text-muted-foreground">{point.pain}</p>
              </div>

              <div className="relative">
                <div className="absolute -inset-4 bg-primary/5 rounded-xl -z-10" />
                <div className="flex items-center gap-3 mb-4 text-primary">
                  <CheckCircle2 className="w-6 h-6 shrink-0" />
                  <h3 className="font-semibold text-lg">Prime Circle</h3>
                </div>
                <p className="text-foreground font-medium">{point.solution}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
