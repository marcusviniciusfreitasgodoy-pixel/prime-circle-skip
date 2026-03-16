import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import useAppStore from '@/stores/main'

export function Navbar() {
  const { user, login, logout } = useAppStore()

  return (
    <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-background" />
            </div>
            <span className="text-xl font-bold tracking-widest">
              PRIME<span className="text-primary">CIRCLE</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a
              href="#how-it-works"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Como Funciona
            </a>

            {user ? (
              <>
                <Button
                  asChild
                  variant="ghost"
                  className="font-semibold text-primary hover:text-primary/80"
                >
                  <Link to="/dashboard">Dashboard</Link>
                </Button>
                <Button variant="ghost" onClick={logout} className="text-muted-foreground">
                  Sair
                </Button>
              </>
            ) : (
              <Button variant="ghost" onClick={() => login('admin')} className="font-semibold">
                Entrar
              </Button>
            )}

            <Button
              asChild
              variant="default"
              className="font-semibold shadow-[0_0_15px_rgba(201,168,76,0.2)]"
            >
              <Link to="/apply">Aplicar Agora</Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
