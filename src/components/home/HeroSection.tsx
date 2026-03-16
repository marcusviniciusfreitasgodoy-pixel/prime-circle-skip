import { Button } from '@/components/ui/button'
import { ArrowRight, Lock } from 'lucide-react'
import heroBg from '@/assets/acesso-fundador-aace0.png'

export function HeroSection() {
  return (
    <section className="relative flex items-center justify-center min-h-[90vh] overflow-hidden w-full">
      {/* Background Image Setup */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBg})` }}
        aria-hidden="true"
      />

      {/* Dark Overlay for Text Contrast */}
      <div className="absolute inset-0 z-10 bg-black/60 sm:bg-black/50 transition-colors duration-500" />

      {/* Hero Content */}
      <div className="container relative z-20 px-4 md:px-6 py-24 sm:py-32 flex flex-col items-center text-center">
        <div className="inline-flex items-center text-left sm:text-center rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm sm:text-base font-medium text-white mb-8 backdrop-blur-md animate-fade-in-up max-w-[95%]">
          <Lock className="mr-2 h-4 w-4 text-primary shrink-0" />
          <span className="truncate whitespace-normal sm:whitespace-nowrap">
            Acesso restrito a corretores convidados por membros do núcleo.
          </span>
        </div>

        <h1
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-5xl mx-auto animate-fade-in-up drop-shadow-md leading-tight"
          style={{ animationDelay: '100ms' }}
        >
          Aqui, o outro lado do seu negócio{' '}
          <span className="text-primary drop-shadow-sm">já está esperando.</span>
        </h1>

        <p
          className="mt-6 text-lg sm:text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto animate-fade-in-up drop-shadow"
          style={{ animationDelay: '200ms' }}
        >
          Uma rede privada para corretores selecionados da Barra da Tijuca — onde demandas reais
          circulam antes de qualquer portal ver.
        </p>

        <p
          className="mt-4 text-base sm:text-lg text-gray-300 max-w-2xl mx-auto animate-fade-in-up drop-shadow font-medium"
          style={{ animationDelay: '250ms' }}
        >
          Acesso por indicação e aprovação. Demandas e imóveis que não aparecem em nenhum outro
          lugar.
        </p>

        <div
          className="mt-10 flex flex-col sm:flex-row gap-4 sm:gap-6 w-full sm:w-auto animate-fade-in-up"
          style={{ animationDelay: '300ms' }}
        >
          <Button
            size="lg"
            className="h-14 px-8 text-base w-full sm:w-auto shadow-lg shadow-primary/25 hover:scale-105 transition-transform duration-300"
          >
            Quero fazer parte
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-14 px-8 text-base w-full sm:w-auto bg-black/20 border-white/40 text-white hover:bg-white/20 hover:text-white backdrop-blur-sm transition-all duration-300"
          >
            Entenda como Funciona
          </Button>
        </div>
      </div>
    </section>
  )
}
