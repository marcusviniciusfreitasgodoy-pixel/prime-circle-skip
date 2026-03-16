import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Crown, Shield, Activity, Users } from 'lucide-react'
import useAppStore from '@/stores/main'

export default function Index() {
  const navigate = useNavigate()
  const { login } = useAppStore()

  const handleDemoLogin = () => {
    login('approved')
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/30">
      <header className="absolute top-0 w-full z-50 px-6 py-6 flex justify-between items-center max-w-7xl mx-auto left-0 right-0">
        <div className="flex items-center gap-2">
          <Crown className="text-primary w-8 h-8" />
          <span className="font-bold text-xl tracking-tight text-white">Prime Circle</span>
        </div>
        <div className="flex gap-4">
          <Button
            variant="ghost"
            onClick={handleDemoLogin}
            className="text-muted-foreground hover:text-white"
          >
            Login Demo
          </Button>
          <Button asChild className="gold-gradient hidden sm:inline-flex">
            <Link to="/apply">Solicitar Acesso</Link>
          </Button>
        </div>
      </header>

      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden flex-1 flex flex-col justify-center">
        <div className="absolute inset-0 z-0">
          <img
            src="https://img.usecurling.com/p/1920/1080?q=luxury%20rio%20de%20janeiro"
            alt="Barra da Tijuca"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background" />
        </div>

        <div className="container relative z-10 text-center max-w-4xl mx-auto px-4">
          <Badge className="mb-6 bg-primary/10 text-primary border border-primary/20 px-4 py-1">
            Exclusivo para Barra da Tijuca
          </Badge>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-8 leading-tight animate-fade-in-up">
            A elite do mercado imobiliário da Barra{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C9A84C] to-[#E3C67B]">
              em um só círculo.
            </span>
          </h1>
          <p
            className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-fade-in-up"
            style={{ animationDelay: '100ms' }}
          >
            Substitua a desordem dos grupos de WhatsApp por uma infraestrutura privada, rastreável e
            focada em parcerias 50/50 reais.
          </p>
          <div
            className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up"
            style={{ animationDelay: '200ms' }}
          >
            <Button asChild size="lg" className="gold-gradient text-base h-14 px-8">
              <Link to="/apply">Solicitar Acesso Agora</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-primary text-primary hover:bg-primary/10 h-14 px-8"
            >
              Conheça o Modelo
            </Button>
          </div>
        </div>
      </section>

      <section className="py-20 bg-card border-y border-border">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-background border border-border flex flex-col items-center text-center hover:border-primary/50 transition-colors">
              <Shield className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Ambiente Curado</h3>
              <p className="text-muted-foreground">
                Apenas corretores validados com alto ticket médio e ética comprovada.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-background border border-border flex flex-col items-center text-center hover:border-primary/50 transition-colors">
              <Activity className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Match Inteligente</h3>
              <p className="text-muted-foreground">
                Conecte imóveis a demandas reais com um clique, sem perder o rastro.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-background border border-border flex flex-col items-center text-center hover:border-primary/50 transition-colors">
              <Users className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Parceria 50/50</h3>
              <p className="text-muted-foreground">
                Regra de ouro inegociável. Transparência total em todas as transações.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center sm:hidden px-4">
        <Button
          asChild
          className="gold-gradient w-full h-14 text-lg shadow-elevation shadow-black/50"
        >
          <Link to="/apply">Solicitar Acesso</Link>
        </Button>
      </div>
    </div>
  )
}

function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center rounded-full text-sm font-medium ${className}`}>
      {children}
    </span>
  )
}
