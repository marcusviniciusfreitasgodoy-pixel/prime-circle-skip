import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="bg-background border-t border-border pt-16 pb-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-12">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-background" />
              </div>
              <span className="text-lg font-bold tracking-widest text-white">
                PRIME<span className="text-primary">CIRCLE</span>
              </span>
            </Link>
            <p className="text-muted-foreground max-w-sm mb-6">
              A infraestrutura privada definitiva para corretores de alto padrão da Barra da Tijuca.
              Focado em liquidez e parcerias justas (50/50).
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
                  Solicitar Acesso
                </Link>
              </li>
              <li>
                <Link
                  to="/auth/confirm"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Login
                </Link>
              </li>
              <li>
                <Link
                  to="/plans"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Planos e Preços
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
                <a
                  href="mailto:contato@primecircle.app.br"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Contato
                </a>
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
