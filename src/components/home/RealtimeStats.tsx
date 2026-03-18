import { Card } from '@/components/ui/card'
import { TrendingUp, Users, Clock } from 'lucide-react'

export function RealtimeStats() {
  return (
    <section className="py-24 bg-zinc-950 relative border-t border-zinc-900 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-zinc-950 to-zinc-950 opacity-50" />

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs sm:text-sm font-medium text-primary mb-4 shadow-[0_0_15px_rgba(201,168,76,0.15)]">
            Social Proof Dashboard
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            A Força da Nossa <span className="text-primary">Rede</span>
          </h2>
          <p className="text-lg text-zinc-400">
            Dados reais que comprovam a liquidez e eficiência do nosso ecossistema privado.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card className="p-8 text-center bg-zinc-900/60 border-zinc-800 backdrop-blur hover:border-primary/50 transition-all duration-300 group shadow-lg hover:-translate-y-1">
            <TrendingUp className="w-12 h-12 text-primary mx-auto mb-6 group-hover:scale-110 transition-transform" />
            <h3 className="text-4xl lg:text-5xl font-extrabold text-white mb-2 drop-shadow-md">
              R$ 850M+
            </h3>
            <p className="text-zinc-400 font-medium">VGV em Circulação na Rede</p>
          </Card>

          <Card className="p-8 text-center bg-zinc-900/60 border-zinc-800 backdrop-blur hover:border-primary/50 transition-all duration-300 group shadow-lg hover:-translate-y-1">
            <Users className="w-12 h-12 text-primary mx-auto mb-6 group-hover:scale-110 transition-transform" />
            <h3 className="text-4xl lg:text-5xl font-extrabold text-white mb-2 drop-shadow-md">
              214
            </h3>
            <p className="text-zinc-400 font-medium">Membros Elite Ativos</p>
          </Card>

          <Card className="p-8 text-center bg-zinc-900/60 border-zinc-800 backdrop-blur hover:border-primary/50 transition-all duration-300 group shadow-lg hover:-translate-y-1">
            <Clock className="w-12 h-12 text-primary mx-auto mb-6 group-hover:scale-110 transition-transform" />
            <h3 className="text-4xl lg:text-5xl font-extrabold text-white mb-2 drop-shadow-md">
              36h
            </h3>
            <p className="text-zinc-400 font-medium">Tempo Médio de Match</p>
          </Card>
        </div>
      </div>
    </section>
  )
}
