import { Lightbulb, Wrench, Gift, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Link } from 'react-router-dom'

export function CollaborationSection() {
  return (
    <section className="py-24 bg-zinc-950 text-white relative border-t border-zinc-900 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-zinc-950 to-zinc-950 opacity-40" />

      <div className="container relative mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4 animate-fade-in-up">
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs sm:text-sm font-medium text-primary shadow-[0_0_10px_rgba(201,168,76,0.1)]">
            Co-criação e Evolução
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
            Uma plataforma construída a{' '}
            <span className="text-primary gold-text drop-shadow-sm">várias mãos</span>
          </h2>
          <p className="text-base sm:text-lg text-zinc-400 leading-relaxed">
            O Prime Circle é um organismo vivo em constante evolução. Nossa tecnologia e roadmap são
            guiados diretamente pela inteligência e experiência de mercado dos nossos membros
            fundadores.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12 relative z-10">
          <Card className="bg-zinc-900/60 border-zinc-800 backdrop-blur p-8 hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 shadow-lg group">
            <div className="w-14 h-14 rounded-2xl bg-zinc-950 flex items-center justify-center mb-6 border border-zinc-800 group-hover:border-primary/50 transition-colors shadow-[0_0_15px_rgba(201,168,76,0.05)]">
              <Wrench className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-zinc-100 mb-3">Desenvolvimento Contínuo</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Não somos uma ferramenta estática. Lançamos melhorias frequentemente com base nos
              desafios reais que você enfrenta nas suas negociações diárias.
            </p>
          </Card>

          <Card className="bg-zinc-900/60 border-zinc-800 backdrop-blur p-8 hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 shadow-lg group">
            <div className="w-14 h-14 rounded-2xl bg-zinc-950 flex items-center justify-center mb-6 border border-zinc-800 group-hover:border-primary/50 transition-colors shadow-[0_0_15px_rgba(201,168,76,0.05)]">
              <Lightbulb className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-zinc-100 mb-3">Sua Voz no Roadmap</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Você tem um canal direto para sugerir novas funcionalidades, filtros ou ferramentas
              que tornariam o seu trabalho mais eficiente e lucrativo.
            </p>
          </Card>

          <Card className="bg-zinc-900/60 border-primary/30 backdrop-blur p-8 hover:border-primary/60 transition-all duration-300 hover:-translate-y-1 shadow-[0_0_20px_rgba(201,168,76,0.1)] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-colors" />
            <div className="w-14 h-14 rounded-2xl bg-zinc-950 flex items-center justify-center mb-6 border border-primary/30 group-hover:border-primary/60 transition-colors shadow-[0_0_15px_rgba(201,168,76,0.1)] relative z-10">
              <Gift className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-zinc-100 mb-3 relative z-10">
              Recompensa por Valor
            </h3>
            <p className="text-zinc-400 text-sm leading-relaxed relative z-10">
              Sua expertise vale muito. Toda sugestão sua que for aprovada e implementada na
              plataforma rende{' '}
              <strong className="text-zinc-200 font-semibold">1 mês de crédito extra</strong> na sua
              assinatura.
            </p>
          </Card>
        </div>

        <div
          className="flex justify-center relative z-10 animate-fade-in-up"
          style={{ animationDelay: '200ms' }}
        >
          <Button
            asChild
            size="lg"
            className="h-14 px-8 text-base shadow-elevation hover:scale-105 transition-transform duration-300 gold-gradient text-black font-bold group"
          >
            <Link to="/suggestions">
              Contribuir com o Roadmap
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
