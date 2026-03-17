import { Link, Navigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { PartyPopper, CheckCircle2, Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import useAppStore from '@/stores/main'

export default function WelcomePage() {
  const { user, loading } = useAuth()
  const { user: mockUser } = useAppStore()

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground text-sm">Verificando sua confirmação...</p>
      </div>
    )
  }

  const justRegistered = localStorage.getItem('just_registered') === 'true'

  if (!user && !mockUser && !justRegistered) {
    return <Navigate to="/auth/confirm" replace />
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
      <div className="max-w-md w-full bg-card p-8 rounded-2xl border border-primary/30 shadow-elevation relative overflow-hidden animate-in fade-in zoom-in duration-500">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <PartyPopper className="w-32 h-32 text-primary" />
        </div>

        <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6 relative z-10 ring-4 ring-primary/10">
          <CheckCircle2 className="w-10 h-10 text-primary" />
        </div>

        <h1 className="text-3xl font-bold text-white mb-4 relative z-10 tracking-tight">
          Bem-vindo à Prime Circle! 🚀
        </h1>

        <p className="text-white font-medium text-lg leading-relaxed mb-2 relative z-10">
          Seu cadastro foi validado com sucesso e agora você faz parte da nossa rede exclusiva.
        </p>

        <p className="text-muted-foreground text-base leading-relaxed mb-8 relative z-10">
          Explore seu dashboard para encontrar novos matches e oportunidades de parceria.
        </p>

        <Button
          asChild
          className="w-full gold-gradient gold-glow text-black font-bold h-14 text-lg relative z-10"
        >
          <Link to="/dashboard">Acessar meu Dashboard</Link>
        </Button>
      </div>
    </div>
  )
}
