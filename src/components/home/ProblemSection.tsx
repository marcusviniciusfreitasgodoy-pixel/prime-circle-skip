import { AlertCircle, EyeOff, Handshake } from 'lucide-react'

export function ProblemSection() {
  return (
    <section id="how-it-works" className="py-24 bg-background relative border-t border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Um novo caminho que se abre no mercado
          </h2>
          <p className="text-lg text-muted-foreground">
            Diga adeus à fadiga dos portais ineficientes e ao ruído dos grupos de WhatsApp
            desorganizados. O Prime Circle é a solução curada que elimina distrações e foca no que
            importa para a elite da Barra da Tijuca.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-secondary/50 p-8 rounded-2xl border border-border">
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
              <EyeOff className="w-6 h-6 text-destructive" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">A Ineficiência dos Portais</h3>
            <p className="text-muted-foreground">
              Publicar imóveis premium em portais abertos desvaloriza o ativo, atrai curiosos e
              desgasta a relação com o proprietário.
            </p>
          </div>

          <div className="bg-secondary/50 p-8 rounded-2xl border border-border">
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
              <AlertCircle className="w-6 h-6 text-destructive" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">O Caos do WhatsApp</h3>
            <p className="text-muted-foreground">
              Centenas de mensagens irrelevantes por dia. Demandas reais se perdem em meio ao
              amadorismo, à falta de filtros e à desorganização total.
            </p>
          </div>

          <div className="bg-secondary/50 p-8 rounded-2xl border border-border">
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
              <Handshake className="w-6 h-6 text-destructive" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Parcerias Inseguras</h3>
            <p className="text-muted-foreground">
              Acordos de boca não honrados, falta de governança e atravessamentos que minam a
              confiança e destroem negócios de alto ticket.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
