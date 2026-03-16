import { Users, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ReferralSection() {
  return (
    <section className="py-24 bg-background relative overflow-hidden border-t border-border/50">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-[400px] bg-primary/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 max-w-5xl">
        <div className="bg-card/80 backdrop-blur-md border border-primary/20 rounded-2xl p-8 md:p-14 shadow-[0_0_40px_rgba(201,168,76,0.1)] text-center flex flex-col items-center group hover:border-primary/40 transition-colors duration-500">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-8 border border-primary/30 group-hover:scale-110 transition-transform duration-500">
            <Users className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-foreground">
            Indicação de <span className="text-primary">Parceiros Qualificados</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed">
            Indique parceiros qualificados e fortaleça nossa rede. Uma vez aprovados, eles recebem{' '}
            <strong className="text-primary font-semibold">acesso imediato</strong> à plataforma.
            Uma comunidade de alto nível gera mais liquidez, segurança e oportunidades exclusivas
            para todos os membros.
          </p>
          <Button
            size="lg"
            className="h-16 px-10 font-bold text-lg shadow-[0_0_20px_rgba(201,168,76,0.2)] hover:shadow-[0_0_40px_rgba(201,168,76,0.4)] hover:-translate-y-1 transition-all duration-300"
          >
            Indicar um Parceiro <ArrowRight className="ml-3 w-6 h-6" />
          </Button>
        </div>
      </div>
    </section>
  )
}
