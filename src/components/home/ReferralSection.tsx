import { Trophy } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export function ReferralSection() {
  return (
    <section className="py-24 bg-background relative border-t border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 flex items-center justify-center gap-3">
            <Trophy className="text-primary w-8 h-8" /> Ambassador Program
          </h2>
          <p className="text-lg text-muted-foreground">
            Ajude a construir o círculo e elimine seus custos operacionais. Indicações aprovadas
            destravam níveis e benefícios exclusivos.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-secondary p-6 rounded-2xl border border-border text-center">
            <Badge variant="outline" className="mb-4 text-blue-400 border-blue-400/30">
              Ambassador
            </Badge>
            <h3 className="text-xl font-bold text-white mb-2">1-4 Indicações</h3>
            <p className="text-sm text-muted-foreground">
              Status base, acesso ao mural de demandas públicas.
            </p>
          </div>
          <div className="bg-secondary p-6 rounded-2xl border border-border text-center">
            <Badge variant="outline" className="mb-4 text-gray-300 border-gray-300/30">
              Silver
            </Badge>
            <h3 className="text-xl font-bold text-white mb-2">5-6 Indicações</h3>
            <p className="text-sm text-muted-foreground">
              1 Mês de acesso gratuito ao plano Standard.
            </p>
          </div>
          <div className="bg-secondary p-6 rounded-2xl border border-primary/30 shadow-[0_0_15px_rgba(201,168,76,0.1)] text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-primary/20 blur-[20px]" />
            <Badge variant="outline" className="mb-4 text-primary border-primary/30">
              Gold
            </Badge>
            <h3 className="text-xl font-bold text-white mb-2">7-9 Indicações</h3>
            <p className="text-sm text-muted-foreground">
              2 Meses gratuitos + Destaque na plataforma.
            </p>
          </div>
          <div className="bg-secondary p-6 rounded-2xl border border-border text-center">
            <Badge variant="outline" className="mb-4 text-purple-400 border-purple-400/30">
              Elite
            </Badge>
            <h3 className="text-xl font-bold text-white mb-2">10+ Indicações</h3>
            <p className="text-sm text-muted-foreground">
              Até 4 Meses gratuitos e 30% de desconto vitalício.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
