import { Button } from '@/components/ui/button'
import { ArrowRight, Building } from 'lucide-react'
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
        <div className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-white mb-8 backdrop-blur-md animate-fade-in-up">
          <Building className="mr-2 h-4 w-4 text-primary" />
          <span>Acesso Exclusivo para Corretores de Elite</span>
        </div>

        <h1
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-5xl mx-auto animate-fade-in-up drop-shadow-md"
          style={{ animationDelay: '100ms' }}
        >
          A Infraestrutura Privada de <br className="hidden lg:block" />
          <span className="text-primary drop-shadow-sm">Liquidez Imobiliária</span>
        </h1>

        <p
          className="mt-6 text-lg sm:text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto animate-fade-in-up drop-shadow"
          style={{ animationDelay: '200ms' }}
        >
          Uma plataforma exclusiva desenhada para corretores de alto padrão acelerarem fechamentos,
          acessarem oportunidades off-market e maximizarem seus resultados.
        </p>

        <div
          className="mt-10 flex flex-col sm:flex-row gap-4 sm:gap-6 w-full sm:w-auto animate-fade-in-up"
          style={{ animationDelay: '300ms' }}
        >
          <Button
            size="lg"
            className="h-14 px-8 text-base w-full sm:w-auto shadow-lg shadow-primary/25 hover:scale-105 transition-transform duration-300"
          >
            Solicitar Acesso
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
