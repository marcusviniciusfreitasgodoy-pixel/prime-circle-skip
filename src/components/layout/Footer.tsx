import { Link } from 'react-router-dom'
import { ContactDialog } from '@/components/ContactDialog'
import logoUrl from '@/assets/logo-horizontal-texto-claro-transparente2x-ceb50.png'

export function Footer() {
  return (
    <footer className="bg-background border-t border-border pt-16 pb-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-12">
          <div className="md:col-span-2">
            <Link to="/" className="inline-flex items-center mb-6">
              <img
                src={logoUrl}
                alt="Prime Circle - Real Estate Network"
                className="h-12 md:h-16 lg:h-20 w-auto object-contain"
              />
            </Link>
            <p className="text-muted-foreground max-w-sm mb-6">
              A infraestrutura privada definitiva para corretores de alto padrão. Focado em liquidez
              e parcerias justas (50/50).
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Plataforma</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/apply"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Quero Participar
                </Link>
              </li>
              <li>
                <Link
                  to="/login"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Acesso Exclusivo
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/termos-de-uso"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link
                  to="/politica-de-privacidade"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <ContactDialog>
                  <button className="text-muted-foreground hover:text-primary transition-colors text-left bg-transparent border-none p-0 cursor-pointer">
                    Contato
                  </button>
                </ContactDialog>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border/50 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Prime Circle. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
