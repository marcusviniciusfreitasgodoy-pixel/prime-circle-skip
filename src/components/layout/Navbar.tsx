import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { LogOut, Settings, Lightbulb, Zap, Map, MessageSquare } from 'lucide-react'
import useAppStore from '@/stores/main'

export function Navbar() {
  const { user, logout } = useAppStore()

  return (
    <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-[0_0_15px_rgba(201,168,76,0.3)]">
              <div className="w-4 h-4 rounded-full bg-background" />
            </div>
            <span className="text-xl font-bold tracking-widest">
              PRIME<span className="text-primary">CIRCLE</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {!user && (
              <a
                href="/#how-it-works"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Como Funciona
              </a>
            )}

            {user ? (
              <>
                <div className="flex items-center gap-4 mr-4">
                  {user.status === 'admin' && (
                    <Link
                      to="/admin"
                      className="text-sm font-medium text-muted-foreground hover:text-white transition-colors flex items-center gap-1"
                    >
                      <Settings className="w-4 h-4" /> Admin
                    </Link>
                  )}
                  {user.status === 'approved' && user.onboarded && (
                    <>
                      <Link
                        to="/dashboard"
                        className="text-sm font-medium text-muted-foreground hover:text-white transition-colors"
                      >
                        Dashboard
                      </Link>
                      <Link
                        to="/plans"
                        className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                      >
                        <Zap className="w-4 h-4" /> Planos
                      </Link>
                      <Link
                        to="/notifications"
                        className="text-sm font-medium text-muted-foreground hover:text-white transition-colors flex items-center gap-1"
                      >
                        <MessageSquare className="w-4 h-4" /> Comunicações
                      </Link>
                      <Link
                        to="/suggestions"
                        className="text-sm font-medium text-muted-foreground hover:text-white transition-colors flex items-center gap-1"
                      >
                        <Lightbulb className="w-4 h-4" /> Comunidade
                      </Link>
                      <Link
                        to="/roadmap"
                        className="text-sm font-medium text-muted-foreground hover:text-white transition-colors flex items-center gap-1"
                      >
                        <Map className="w-4 h-4" /> Roadmap
                      </Link>
                    </>
                  )}
                </div>
                <Button
                  variant="outline"
                  onClick={logout}
                  className="text-muted-foreground border-border hover:bg-secondary"
                >
                  <LogOut className="w-4 h-4 mr-2" /> Sair
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="ghost" className="font-semibold">
                  <Link to="/auth/confirm">Entrar</Link>
                </Button>
                <Button
                  asChild
                  variant="default"
                  className="font-semibold shadow-[0_0_15px_rgba(201,168,76,0.2)] gold-gradient text-black"
                >
                  <Link to="/apply">Aplicar Agora</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
