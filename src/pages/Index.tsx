import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  Crown,
  CheckCircle2,
  XCircle,
  Shield,
  Target,
  ArrowRight,
  Activity,
  Users,
} from 'lucide-react'
import useAppStore from '@/stores/main'

export default function Index() {
  const navigate = useNavigate()
  const { login, completeOnboarding } = useAppStore()

  const handleDemoLogin = () => {
    // Demo login bypasses onboarding for a quick preview, but triggers the same state structure
    login('approved')
    completeOnboarding()
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-white selection:bg-primary/30 font-sans">
      {/* HEADER */}
      <header className="fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center bg-background/90 backdrop-blur-md border-b border-border">
        <div className="flex items-center gap-2">
          <Crown className="text-primary w-8 h-8" />
          <span className="font-bold text-xl tracking-tight text-white">Prime Circle</span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <a href="#solucao" className="hover:text-primary transition-colors">
            A Solução
          </a>
          <a href="#como-funciona" className="hover:text-primary transition-colors">
            Como Funciona
          </a>
          <a href="#comparativo" className="hover:text-primary transition-colors">
            Comparativo
          </a>
        </nav>
        <div className="flex gap-4">
          <Button
            variant="ghost"
            onClick={handleDemoLogin}
            className="text-muted-foreground hover:text-white"
          >
            Login Demo
          </Button>
          <Button asChild className="gold-gradient gold-glow hidden sm:inline-flex px-6">
            <Link to="/apply">Solicitar Acesso</Link>
          </Button>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://img.usecurling.com/p/1920/1080?q=luxury%20rio%20de%20janeiro"
            alt="Barra da Tijuca"
            className="w-full h-full object-cover opacity-10"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/90 to-background" />
        </div>

        <div className="container relative z-10 text-center max-w-4xl mx-auto px-4">
          <Badge className="mb-6 bg-primary/10 text-primary border border-primary/20 px-4 py-1.5 font-semibold tracking-wide uppercase text-xs">
            Exclusivo: Barra da Tijuca & Adjacências
          </Badge>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-6 leading-tight animate-fade-in-up">
            Infraestrutura Privada de{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C9A84C] to-[#E3C67B]">
              Liquidez Imobiliária.
            </span>
          </h1>
          <p
            className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-fade-in-up"
            style={{ animationDelay: '100ms' }}
          >
            Substitua a desordem dos grupos de WhatsApp por uma rede curada para corretores de alto
            padrão. Regra número um: 50/50 sempre.
          </p>
          <div
            className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up"
            style={{ animationDelay: '200ms' }}
          >
            <Button
              asChild
              size="lg"
              className="gold-gradient gold-glow text-base h-14 px-8 font-semibold"
            >
              <Link to="/apply">
                Aplicar para o Círculo <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* PAIN & OPPORTUNITY SECTION */}
      <section
        id="solucao"
        className="py-24 bg-card border-y border-border relative overflow-hidden"
      >
        <div className="container max-w-6xl mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">O fim dos grupos de WhatsApp.</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Seu tempo é valioso. Chega de rolar o feed infinitamente atrás de demandas reais ou
              lidar com especuladores não verificados.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-background border border-border flex flex-col items-center text-center">
              <Shield className="w-12 h-12 text-primary mb-6" />
              <h3 className="text-xl font-semibold text-white mb-3">Ambiente Curado</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Apenas corretores validados pelo CRECI, com foco na região e ticket médio comprovado
                acima de R$ 1M.
              </p>
            </div>
            <div className="p-8 rounded-2xl bg-background border border-border flex flex-col items-center text-center">
              <Activity className="w-12 h-12 text-primary mb-6" />
              <h3 className="text-xl font-semibold text-white mb-3">Match Inteligente</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Cruze imóveis privados com demandas específicas em segundos, acompanhando o status
                do negócio no pipeline.
              </p>
            </div>
            <div className="p-8 rounded-2xl bg-background border border-border flex flex-col items-center text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-primary/5" />
              <Users className="w-12 h-12 text-primary mb-6 relative z-10" />
              <h3 className="text-xl font-semibold text-white mb-3 relative z-10">
                Parceria 50/50
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed relative z-10">
                A regra de ouro. Transparência total e segurança de que o trabalho em rede será
                recompensado de forma justa.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="como-funciona" className="py-24 bg-background">
        <div className="container max-w-5xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Como Funciona</h2>
            <p className="text-muted-foreground">O processo para se juntar à elite.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-8 left-[15%] right-[15%] h-px bg-border z-0" />

            {[
              { title: 'Aplicação', desc: 'Forneça seu CRECI e comprove sua atuação.' },
              { title: 'Curadoria', desc: 'Nossa equipe analisa seu perfil e ticket médio.' },
              { title: 'Liquidez', desc: 'Acesso liberado para cadastrar e cruzar negócios.' },
            ].map((step, i) => (
              <div
                key={i}
                className="relative z-10 flex flex-col items-center text-center space-y-4"
              >
                <div className="w-16 h-16 rounded-full bg-card border-2 border-primary flex items-center justify-center text-xl font-bold text-primary shadow-elevation">
                  {i + 1}
                </div>
                <h3 className="text-xl font-semibold text-white">{step.title}</h3>
                <p className="text-muted-foreground text-sm px-4">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMPARISON SECTION */}
      <section id="comparativo" className="py-24 bg-card border-y border-border">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Comparativo</h2>
            <p className="text-muted-foreground">Porque a infraestrutura certa faz a diferença.</p>
          </div>

          <div className="bg-background rounded-2xl border border-border overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-secondary/50">
                  <th className="p-5 font-medium text-muted-foreground border-b border-border">
                    Critério
                  </th>
                  <th className="p-5 font-bold text-primary border-b border-border w-[35%]">
                    Prime Circle
                  </th>
                  <th className="p-5 font-medium text-muted-foreground border-b border-border w-[35%]">
                    Grupos Comuns
                  </th>
                </tr>
              </thead>
              <tbody className="text-sm sm:text-base">
                {[
                  {
                    label: 'Qualificação de Leads',
                    prime: 'Corretores Verificados',
                    other: 'Especuladores',
                  },
                  { label: 'Modelo de Parceria', prime: '50/50 Garantido', other: 'Incertezas' },
                  {
                    label: 'Privacidade de Dados',
                    prime: 'Alto Sigilo',
                    other: 'Telefone Público',
                  },
                  { label: 'Organização', prime: 'Pipeline Kanban', other: 'Feed Infinito' },
                  { label: 'Acesso', prime: 'Curadoria', other: 'Link de Convite' },
                ].map((row, i) => (
                  <tr
                    key={i}
                    className="border-b border-border/50 last:border-0 hover:bg-secondary/20 transition-colors"
                  >
                    <td className="p-5 font-medium text-white">{row.label}</td>
                    <td className="p-5 text-primary bg-primary/5 flex items-center gap-2 h-full">
                      <CheckCircle2 className="w-4 h-4 shrink-0" /> {row.prime}
                    </td>
                    <td className="p-5 text-muted-foreground relative">
                      <div className="flex items-center gap-2">
                        <XCircle className="w-4 h-4 shrink-0 opacity-50" /> {row.other}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FOUNDER SECTION */}
      <section className="py-24 bg-background">
        <div className="container max-w-4xl mx-auto px-4 flex flex-col md:flex-row items-center gap-12">
          <div className="md:w-1/3">
            <div className="aspect-square rounded-2xl overflow-hidden border-2 border-primary/30 relative">
              <img
                src="https://img.usecurling.com/ppl/medium?gender=male&seed=7"
                alt="Founder"
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
              />
              <div className="absolute inset-0 shadow-[inset_0_0_40px_rgba(26,26,46,0.8)] mix-blend-multiply" />
            </div>
          </div>
          <div className="md:w-2/3 space-y-6 text-center md:text-left">
            <Target className="w-10 h-10 text-primary mx-auto md:mx-0" />
            <h2 className="text-3xl font-bold">Por corretores, para corretores.</h2>
            <p className="text-muted-foreground leading-relaxed text-lg italic">
              "Desenvolvemos o Prime Circle porque estávamos cansados de perder negócios por
              desorganização. A Barra da Tijuca merece um mercado de luxo que opere com a eficiência
              de um banco privado. Sem ruídos, sem curiosos. Apenas liquidez."
            </p>
            <div>
              <p className="font-bold text-white">Board de Fundadores</p>
              <p className="text-sm text-primary">Prime Circle Barra</p>
            </div>
          </div>
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="py-32 bg-primary/10 border-t border-primary/20 text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[300px] bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="container relative z-10 px-4">
          <h2 className="text-4xl font-bold text-white mb-6">Pronto para elevar seu padrão?</h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-10 text-lg">
            As vagas para a primeira fase da Barra da Tijuca são limitadas para garantir a qualidade
            do círculo.
          </p>
          <Button
            asChild
            size="lg"
            className="gold-gradient gold-glow text-lg h-16 px-10 rounded-xl font-bold"
          >
            <Link to="/apply">Solicitar Acesso Agora</Link>
          </Button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 bg-card border-t border-border text-center text-sm text-muted-foreground flex flex-col md:flex-row items-center justify-between px-8">
        <p>© {new Date().getFullYear()} Prime Circle. Todos os direitos reservados.</p>
        <div className="flex gap-6 mt-4 md:mt-0">
          <Link to="/terms" className="hover:text-primary transition-colors">
            Termos de Serviço
          </Link>
          <Link to="/privacy" className="hover:text-primary transition-colors">
            Privacidade
          </Link>
        </div>
      </footer>

      {/* Mobile Sticky CTA */}
      <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center sm:hidden px-4">
        <Button
          asChild
          className="gold-gradient gold-glow w-full h-14 text-lg font-bold shadow-2xl"
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
