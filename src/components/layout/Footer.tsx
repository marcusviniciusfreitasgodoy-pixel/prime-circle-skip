import { Mail, Globe } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-background border-t border-border py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-8">
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-background" />
              </div>
              <span className="text-lg font-bold tracking-widest text-foreground">
                PRIME<span className="text-primary">CIRCLE</span>
              </span>
            </div>
            <p className="text-muted-foreground text-sm text-center md:text-left max-w-xs">
              A infraestrutura privada de liquidez imobiliária definitiva para corretores de alto
              padrão.
            </p>
          </div>

          <div className="flex flex-col items-center md:items-end gap-3">
            <h4 className="font-semibold text-foreground mb-1">Contato & Suporte</h4>
            <a
              href="mailto:contato@primecircle.app.br"
              className="text-muted-foreground hover:text-primary transition-colors text-sm flex items-center gap-2 group"
            >
              <Mail className="w-4 h-4 group-hover:text-primary transition-colors" />
              contato@primecircle.app.br
            </a>
            <a
              href="https://primecircle.app.br"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors text-sm flex items-center gap-2 group"
            >
              <Globe className="w-4 h-4 group-hover:text-primary transition-colors" />
              primecircle.app.br
            </a>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border/50 flex justify-center md:justify-start">
          <p className="text-muted-foreground text-sm">
            &copy; {new Date().getFullYear()} Prime Circle. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
