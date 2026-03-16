import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Clock } from 'lucide-react'

export default function WaitlistPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
      <div className="max-w-md space-y-6 bg-card p-8 rounded-2xl border border-border shadow-2xl">
        <Clock className="w-16 h-16 text-primary mx-auto" />
        <h1 className="text-3xl font-bold text-white">Lista de Espera</h1>
        <p className="text-muted-foreground">
          Nossa infraestrutura é estritamente curada para garantir liquidez e parcerias justas
          (50/50). No momento, focamos exclusivamente em tickets acima de R$ 1M na região da Barra
          da Tijuca e adjacências.
        </p>
        <div className="bg-secondary p-4 rounded-lg border border-border text-sm text-left text-muted-foreground">
          Guardamos suas informações com segurança. Avisaremos você assim que expandirmos os
          critérios para o seu perfil ou região de atuação.
        </div>
        <Button asChild className="w-full gold-gradient gold-glow mt-4 text-lg h-12 font-semibold">
          <Link to="/">Voltar ao Início</Link>
        </Button>
      </div>
    </div>
  )
}
