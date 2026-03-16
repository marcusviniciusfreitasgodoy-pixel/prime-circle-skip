import { HeroSection } from '@/components/home/HeroSection'
import { ProblemSection } from '@/components/home/ProblemSection'
import { NetworkSection } from '@/components/home/NetworkSection'
import { CriteriaSection } from '@/components/home/CriteriaSection'
import { ReferralSection } from '@/components/home/ReferralSection'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

export default function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <ProblemSection />
        <NetworkSection />
        <CriteriaSection />
        <ReferralSection />
      </main>
      <Footer />
    </div>
  )
}
