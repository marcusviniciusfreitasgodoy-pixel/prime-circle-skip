import { HeroSection } from '@/components/home/HeroSection'
import { NetworkSection } from '@/components/home/NetworkSection'
import { PersonaSection } from '@/components/home/PersonaSection'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

export default function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <NetworkSection />
        <PersonaSection />
      </main>
      <Footer />
    </div>
  )
}
