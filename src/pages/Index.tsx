import { useEffect } from 'react'
import { HeroSection } from '@/components/home/HeroSection'
import { ProblemSection } from '@/components/home/ProblemSection'
import { MatchmakingShowcase } from '@/components/home/MatchmakingShowcase'
import { NetworkSection } from '@/components/home/NetworkSection'
import { NetworkDetailsSection } from '@/components/home/NetworkDetailsSection'
import { ProcessTimeline } from '@/components/home/ProcessTimeline'
import { PersonaSection } from '@/components/home/PersonaSection'
import { CriteriaSection } from '@/components/home/CriteriaSection'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { useAuth } from '@/hooks/use-auth'
import { useSEO } from '@/hooks/use-seo'
import { Loader2 } from 'lucide-react'

export default function Index() {
  const { loading } = useAuth()

  useSEO({
    title: 'Prime Circle | O Lado Exclusivo do Mercado Imobiliário',
    description:
      'A infraestrutura privada definitiva para corretores de alto padrão. Acesse imóveis reservados, publique demandas reais e feche negócios ágeis com divisão garantida de 50/50.',
  })

  useEffect(() => {
    document.documentElement.classList.add('scroll-smooth')
    return () => {
      document.documentElement.classList.remove('scroll-smooth')
    }
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <ProblemSection />
        <MatchmakingShowcase />
        <NetworkSection />
        <NetworkDetailsSection />
        <ProcessTimeline />
        <PersonaSection />
        <CriteriaSection />
      </main>
      <Footer />
    </div>
  )
}
