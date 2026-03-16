import { HeroSection } from '@/components/home/HeroSection'
import { ProblemSection } from '@/components/home/ProblemSection'
import { ComparisonSection } from '@/components/home/ComparisonSection'
import { NetworkSection } from '@/components/home/NetworkSection'
import { CriteriaSection } from '@/components/home/CriteriaSection'
import { TiersSection } from '@/components/home/TiersSection'
import { ProcessTimeline } from '@/components/home/ProcessTimeline'
import { PersonaSection } from '@/components/home/PersonaSection'
import { FAQSection } from '@/components/home/FAQSection'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

export default function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <ProblemSection />
        <ComparisonSection />
        <NetworkSection />
        <CriteriaSection />
        <TiersSection />
        <ProcessTimeline />
        <PersonaSection />
        <FAQSection />
      </main>
      <Footer />
    </div>
  )
}
