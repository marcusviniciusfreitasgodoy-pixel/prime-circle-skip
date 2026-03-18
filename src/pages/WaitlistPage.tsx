import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Clock } from 'lucide-react'

export default function WaitlistPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
      <div className="max-w-md space-y-6 bg-card p-8 rounded-2xl border border-border shadow-elevation">
        <Clock className="w-16 h-16 text-primary mx-auto" />
        <h1 className="text-3xl font-bold text-white">Lista de Espera</h1>
        <p className="text-muted-foreground">
          Sua região ou perfil de atuação ainda não está habilitado para auto-aprovação. Nossa
          infraestrutura escala de forma curada por Núcleos Regionais.
        </p>
        <div className="bg-secondary p-4 rounded-lg border border-border text-sm text-left text-muted-foreground">
          Avisaremos via e-mail assim que um novo Núcleo Regional for aberto na sua região ou sua
          aplicação for revisada manualmente.
        </div>
        <Button asChild className="w-full gold-gradient text-black mt-4 text-lg h-12 font-semibold">
          <Link to="/">Voltar ao Início</Link>
        </Button>
      </div>
    </div>
  )
}
