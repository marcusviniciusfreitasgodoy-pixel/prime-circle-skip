import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ChevronRight } from 'lucide-react'
import personaImage from '@/assets/voce-tem-o-imovel-457ae.png'

export function PersonaSection() {
  return (
    <section className="py-24 bg-card relative overflow-hidden">
      <div className="absolute -left-40 top-20 w-80 h-80 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1 space-y-8">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold leading-tight mb-6">
                Junte-se à <span className="text-primary">Elite Imobiliária</span>
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                O Prime Circle é desenhado para corretores que não aceitam o padrão comum. Se você
                tem o networking, a expertise e o portfólio, esta é a oportunidade para escalar suas
                vendas.
              </p>
            </div>

            <ul className="space-y-5 mb-8">
              <li className="flex items-center gap-4 text-lg text-foreground/90">
                <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(201,168,76,0.8)]" />
                Acesso a propriedades "off-market" exclusivas
              </li>
              <li className="flex items-center gap-4 text-lg text-foreground/90">
                <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(201,168,76,0.8)]" />
                Tecnologia avançada de match entre clientes e imóveis
              </li>
              <li className="flex items-center gap-4 text-lg text-foreground/90">
                <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(201,168,76,0.8)]" />
                Suporte jurídico e administrativo dedicado
              </li>
            </ul>

            <Button
              size="lg"
              asChild
              className="font-semibold text-lg w-full sm:w-auto h-14 px-8 shadow-[0_0_20px_rgba(201,168,76,0.2)]"
            >
              <Link to="/apply">
                Faça sua Aplicação Agora <ChevronRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>

          <div className="order-1 lg:order-2 relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="absolute inset-0 bg-primary/20 translate-x-4 translate-y-4 rounded-xl -z-10 blur-xl"></div>
            <img
              src={personaImage}
              alt="Corretora Prime Circle"
              className="rounded-xl w-full object-cover border border-primary/30 shadow-[0_0_30px_rgba(201,168,76,0.15)] h-[400px] lg:h-[600px] object-top"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
