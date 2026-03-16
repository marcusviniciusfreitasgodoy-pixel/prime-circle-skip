import { AlertCircle, EyeOff, Handshake } from 'lucide-react'

export function ProblemSection() {
  return (
    <section id="how-it-works" className="py-24 bg-background relative border-t border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            O mercado de alto padrão está quebrado.
          </h2>
          <p className="text-lg text-muted-foreground">
            Grupos de WhatsApp lotados, informações perdidas, parcerias não honradas e falta de
            privacidade para seus clientes exclusivos.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-secondary/50 p-8 rounded-2xl border border-border">
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
              <EyeOff className="w-6 h-6 text-destructive" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Exposição Desnecessária</h3>
            <p className="text-muted-foreground">
              Colocar imóveis de clientes premium em portais abertos desvaloriza o ativo e irrita o
              proprietário.
            </p>
          </div>

          <div className="bg-secondary/50 p-8 rounded-2xl border border-border">
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
              <AlertCircle className="w-6 h-6 text-destructive" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">O Caos dos Grupos</h3>
            <p className="text-muted-foreground">
              Mensagens perdidas, demandas irrelevantes e a constante insegurança sobre a
              procedência da informação.
            </p>
          </div>

          <div className="bg-secondary/50 p-8 rounded-2xl border border-border">
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
              <Handshake className="w-6 h-6 text-destructive" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Ética Questionável</h3>
            <p className="text-muted-foreground">
              Acordos de 50/50 não honrados e "atravessamentos" que minam a confiança entre os
              profissionais.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
