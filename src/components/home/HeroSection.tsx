import { Button } from '@/components/ui/button'
import { ArrowRight, Lock } from 'lucide-react'
import heroBg from '@/assets/acesso-fundador-aace0.png'

export function HeroSection() {
  return (
    <section className="relative flex items-center justify-center min-h-[90vh] md:min-h-screen overflow-hidden w-full">
      {/* Background Image Setup */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat scale-110 md:scale-105 transition-transform duration-1000"
        style={{ backgroundImage: `url(${heroBg})` }}
        aria-hidden="true"
      />

      {/* Dark Overlay for Text Contrast */}
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/80 via-black/60 to-background/95 transition-colors duration-500" />

      {/* Hero Content */}
      <div className="container relative z-20 px-4 md:px-6 pt-32 pb-24 sm:py-32 flex flex-col items-center text-center">
        <div className="inline-flex items-center text-center rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm sm:text-base font-medium text-primary mb-8 backdrop-blur-md animate-fade-in-up shadow-[0_0_15px_rgba(201,168,76,0.15)] max-w-[90vw]">
          <Lock className="mr-2 h-4 w-4 shrink-0" />
          <span>Acesso restrito a corretores convidados por membros do núcleo.</span>
        </div>

        <h1
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-5xl mx-auto animate-fade-in-up drop-shadow-xl leading-tight"
          style={{ animationDelay: '100ms' }}
        >
          Aqui, o outro lado do seu negócio <br className="hidden lg:block" />
          <span className="text-primary drop-shadow-sm gold-text">já está esperando.</span>
        </h1>

        <p
          className="mt-6 text-lg sm:text-xl md:text-2xl text-zinc-300 max-w-3xl mx-auto animate-fade-in-up drop-shadow-md leading-relaxed"
          style={{ animationDelay: '200ms' }}
        >
          Uma rede privada para corretores selecionados da Barra da Tijuca — com demandas reais e
          condições especiais fora dos portais
        </p>

        <div
          className="mt-10 flex flex-col sm:flex-row gap-4 sm:gap-6 w-full sm:w-auto animate-fade-in-up px-4 sm:px-0"
          style={{ animationDelay: '300ms' }}
        >
          <Button
            size="lg"
            className="h-14 px-8 text-base w-full sm:w-auto shadow-elevation hover:scale-105 transition-transform duration-300 gold-gradient text-black font-bold"
          >
            Quero fazer parte
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-14 px-8 text-base w-full sm:w-auto bg-black/40 border-primary/50 text-white hover:bg-primary/20 hover:text-white backdrop-blur-md transition-all duration-300"
          >
            Entenda como Funciona
          </Button>
        </div>
      </div>
    </section>
  )
}
