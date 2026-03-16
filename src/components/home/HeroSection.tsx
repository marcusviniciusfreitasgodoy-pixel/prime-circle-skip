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
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
            Aqui, o outro lado do seu negócio já{' '}
            <span className="text-primary">está esperando.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-4 leading-relaxed">
            Uma rede privada para corretores selecionados da Barra — onde demandas reais circulam
            antes de qualquer portal ver.
          </p>
          <p className="text-base md:text-lg text-foreground/90 font-medium mb-8">
            Acesso por indicação e aprovação. Demandas e imóveis que não aparecem em nenhum outro
            lugar.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              size="lg"
              asChild
              className="font-semibold text-lg h-14 px-8 gold-gradient text-black"
            >
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
          <p className="mt-8 text-sm text-muted-foreground font-medium flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse shrink-0" />
            Acesso inicial restrito a corretores convidados por membros do núcleo.
          </p>
        </div>
      </div>
    </section>
  )
}
