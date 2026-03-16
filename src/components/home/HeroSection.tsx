import { Button } from '@/components/ui/button'
import { ArrowRight, Lock } from 'lucide-react'
import heroBg from '@/assets/acesso-fundador-aace0.png'

export function HeroSection() {
  return (
    <section className="relative flex items-center justify-center min-h-[90vh] overflow-hidden w-full">
      {/* Background Image Setup */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat scale-110"
        style={{ backgroundImage: `url(${heroBg})` }}
        aria-hidden="true"
      />

      {/* Dark Overlay for Text Contrast */}
      <div className="absolute inset-0 z-10 bg-black/60 sm:bg-black/50 transition-colors duration-500" />

      {/* Hero Content */}
      <div className="container relative z-20 px-4 md:px-6 py-24 sm:py-32 flex flex-col items-center text-center">
        <div className="inline-flex items-center text-left sm:text-center rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm sm:text-base font-medium text-white mb-8 backdrop-blur-md animate-fade-in-up max-w-[95%]">
          <Lock className="mr-2 h-4 w-4 text-primary shrink-0" />
          <span className="truncate whitespace-normal sm:whitespace-nowrap">
            Um clube exclusivo para a elite do mercado imobiliário.
          </span>
        </div>

        <h1
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-5xl mx-auto animate-fade-in-up drop-shadow-md leading-tight"
          style={{ animationDelay: '100ms' }}
        >
          O <span className="text-primary drop-shadow-sm">Lado B dos negócios</span> imobiliários de
          alto padrão.
        </h1>

        <p
          className="mt-6 text-lg sm:text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto animate-fade-in-up drop-shadow"
          style={{ animationDelay: '200ms' }}
        >
          Um clube exclusivo onde demandas reais e imóveis off-market circulam e se conectam muito
          antes de chegarem aos portais públicos.
        </p>

        <p
          className="mt-4 text-base sm:text-lg text-gray-300 max-w-2xl mx-auto animate-fade-in-up drop-shadow font-medium"
          style={{ animationDelay: '250ms' }}
        >
          Acesso rigoroso por indicação e aprovação. Liquidez silenciosa e parcerias de alto nível
          na Barra da Tijuca.
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
