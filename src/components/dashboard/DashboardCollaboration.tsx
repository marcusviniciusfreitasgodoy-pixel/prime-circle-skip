import { Lightbulb, Wrench, Gift, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Link } from 'react-router-dom'

export function DashboardCollaboration() {
  return (
    <Card className="bg-zinc-950 border-zinc-900 shadow-sm relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-zinc-950 to-zinc-950 opacity-40 pointer-events-none" />

      <CardHeader className="text-center pb-8 relative z-10 p-5 sm:p-6">
        <div className="mx-auto inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-4 shadow-[0_0_10px_rgba(201,168,76,0.1)]">
          Co-criação e Evolução
        </div>
        <CardTitle className="text-2xl md:text-3xl font-bold text-white tracking-tight">
          Uma plataforma construída a <span className="text-primary gold-text">várias mãos</span>
        </CardTitle>
        <CardDescription className="text-sm sm:text-base max-w-2xl mx-auto mt-3 text-zinc-400">
          O Prime Circle é um organismo vivo em constante evolução. Nossa tecnologia e roadmap são
          guiados diretamente pela inteligência e experiência de mercado dos nossos membros.
        </CardDescription>
      </CardHeader>

      <CardContent className="relative z-10 p-5 sm:p-6 pt-0">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 sm:p-6 hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 group">
            <div className="w-12 h-12 rounded-lg bg-zinc-950 flex items-center justify-center mb-4 border border-zinc-800 group-hover:border-primary/50 transition-colors shadow-[0_0_15px_rgba(201,168,76,0.05)]">
              <Wrench className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-zinc-100 mb-2">Desenvolvimento Contínuo</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Não somos uma ferramenta estática. Lançamos melhorias frequentemente com base nos
              desafios reais que você enfrenta nas suas negociações diárias.
            </p>
          </div>

          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 sm:p-6 hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 group">
            <div className="w-12 h-12 rounded-lg bg-zinc-950 flex items-center justify-center mb-4 border border-zinc-800 group-hover:border-primary/50 transition-colors shadow-[0_0_15px_rgba(201,168,76,0.05)]">
              <Lightbulb className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-zinc-100 mb-2">Você contribui com a evolução</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Você tem um canal direto para sugerir novas funcionalidades, filtros ou ferramentas
              que tornariam o seu trabalho mais eficiente e lucrativo.
            </p>
          </div>

          <div className="bg-zinc-900/60 border border-primary/30 rounded-xl p-5 sm:p-6 hover:border-primary/60 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group shadow-[0_0_20px_rgba(201,168,76,0.1)]">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-colors" />
            <div className="w-12 h-12 rounded-lg bg-zinc-950 flex items-center justify-center mb-4 border border-primary/30 group-hover:border-primary/60 transition-colors relative z-10 shadow-[0_0_15px_rgba(201,168,76,0.1)]">
              <Gift className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-zinc-100 mb-2 relative z-10">
              Recompensa por Valor
            </h3>
            <p className="text-zinc-400 text-sm leading-relaxed relative z-10">
              Sua expertise vale muito. Toda sugestão aprovada rende{' '}
              <strong className="text-zinc-200 font-semibold">1 mês de crédito extra</strong> na sua
              assinatura.
            </p>
          </div>
        </div>

        <div className="flex justify-center w-full">
          <Button
            asChild
            size="lg"
            className="h-12 w-full sm:w-auto px-8 gold-gradient text-black font-bold shadow-[0_0_20px_rgba(201,168,76,0.2)] hover:scale-105 transition-transform duration-300 group"
          >
            <Link to="/suggestions" className="flex items-center justify-center">
              Contribuir com a plataforma
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
