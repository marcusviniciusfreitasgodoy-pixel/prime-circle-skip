import { Cpu, Combine, Box, CheckCircle } from 'lucide-react'
import { Card } from '@/components/ui/card'

export function MatchmakingShowcase() {
  return (
    <section className="py-24 bg-background relative border-t border-border overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/5 via-background to-background opacity-60" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-foreground">
            Motor de <span className="text-primary gold-text">Matchmaking IA</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Esqueça grupos de WhatsApp barulhentos e ineficientes. Nossa infraestrutura cruza sua
            carteira privada com as demandas exatas da rede instantaneamente.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-12 mt-12">
          {/* Properties Node */}
          <div className="flex-1 w-full max-w-sm">
            <Card className="p-8 bg-secondary/30 border-border text-center relative hover:border-primary/40 transition-colors shadow-lg group">
              <Box className="w-12 h-12 text-muted-foreground mx-auto mb-4 group-hover:text-primary transition-colors" />
              <h3 className="text-xl font-bold text-foreground mb-2">Suas Ofertas</h3>
              <p className="text-sm text-muted-foreground">
                Imóveis off-market indexados de forma segura e totalmente discreta.
              </p>
              <div className="absolute -right-6 top-1/2 -translate-y-1/2 w-12 h-px bg-gradient-to-r from-border to-primary/50 hidden lg:block" />
            </Card>
          </div>

          {/* Engine Node */}
          <div className="relative flex flex-col items-center shrink-0 my-8 lg:my-0">
            <div className="w-px h-12 bg-gradient-to-b from-border to-primary/50 lg:hidden mb-4" />
            <div className="w-24 h-24 rounded-full bg-background border-2 border-primary flex items-center justify-center shadow-[0_0_30px_rgba(201,168,76,0.3)] relative z-10 overflow-hidden">
              <div className="absolute inset-0 bg-primary/10 animate-pulse" />
              <Cpu className="w-10 h-10 text-primary relative z-10" />
            </div>
            <span className="absolute -bottom-8 whitespace-nowrap text-sm font-bold text-primary tracking-widest uppercase bg-background px-3 py-1 rounded-full border border-primary/20 shadow-sm">
              Cross-Data
            </span>
            <div className="w-px h-12 bg-gradient-to-t from-border to-primary/50 lg:hidden mt-8" />
          </div>

          {/* Demands Node */}
          <div className="flex-1 w-full max-w-sm">
            <Card className="p-8 bg-secondary/30 border-border text-center relative hover:border-emerald-500/40 transition-colors shadow-lg group">
              <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-12 h-px bg-gradient-to-l from-border to-primary/50 hidden lg:block" />
              <Combine className="w-12 h-12 text-muted-foreground mx-auto mb-4 group-hover:text-emerald-500 transition-colors" />
              <h3 className="text-xl font-bold text-foreground mb-2">Demandas Reais</h3>
              <p className="text-sm text-muted-foreground">
                Necessidades altamente qualificadas publicadas por corretores de elite.
              </p>
            </Card>
          </div>
        </div>

        <div
          className="mt-24 flex justify-center animate-fade-in-up"
          style={{ animationDelay: '200ms' }}
        >
          <div className="inline-flex items-center gap-3 bg-card border border-primary/30 px-6 py-3 rounded-full text-foreground font-medium shadow-[0_0_15px_rgba(201,168,76,0.1)]">
            <CheckCircle className="w-5 h-5 text-primary" />
            Notificação imediata no seu celular ao encontrar compatibilidade
          </div>
        </div>
      </div>
    </section>
  )
}
