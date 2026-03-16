import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ChevronRight } from 'lucide-react'
import heroImage from '@/assets/gemini_generated_image_c06t14c06t14c06t-7beec.png'

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden pt-20">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/40 z-10" />
        <img
          src={heroImage}
          alt="High-end real estate lifestyle"
          className="w-full h-full object-cover object-right opacity-40 mix-blend-overlay"
        />
      </div>
      <div className="container relative z-20 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
            A infraestrutura privada de <span className="text-primary">liquidez imobiliária</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
            Exclusivo para corretores de alto padrão. Acesse uma rede fechada, tecnologia de ponta e
            feche negócios no modelo 50/50 de maneira segura e imediata.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" asChild className="font-semibold text-lg h-14 px-8">
              <Link to="/apply">
                Aplique para o Prime Circle <ChevronRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="border-primary text-primary hover:bg-primary/10 h-14 px-8"
            >
              <a href="#how-it-works">Saiba mais</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
