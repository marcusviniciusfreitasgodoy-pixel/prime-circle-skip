import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  LogOut,
  Settings,
  Lightbulb,
  Zap,
  Map,
  MessageSquare,
  Menu,
  User as UserIcon,
} from 'lucide-react'
import useAppStore from '@/stores/main'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'

export function Navbar() {
  const { user, logout } = useAppStore()
  const { signOut } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)

  const closeMenu = () => setIsOpen(false)

  const handleLogout = async () => {
    try {
      const { error } = await signOut()
      if (error) throw error
      logout()
      navigate('/')
    } catch (error) {
      toast({
        title: 'Erro ao sair',
        description: 'Não foi possível encerrar a sessão. Tente novamente.',
        variant: 'destructive',
      })
    }
  }

  return (
    <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center gap-2" onClick={closeMenu}>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-[0_0_15px_rgba(201,168,76,0.3)]">
              <div className="w-4 h-4 rounded-full bg-background" />
            </div>
            <span className="text-xl font-bold tracking-widest text-white">
              PRIME<span className="text-primary">CIRCLE</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {!user && (
              <a
                href="/#how-it-works"
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
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
                        Painel de Controle
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
                        <Map className="w-4 h-4" /> Cronograma de Evolução
                      </Link>
                    </>
                  )}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-10 w-10 rounded-full border border-border"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {user.name?.charAt(0)?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-56 bg-card border-border"
                    align="end"
                    forceMount
                  >
                    <div className="flex items-center justify-start gap-2 p-3">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium text-sm text-white truncate">{user.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                    </div>
                    <DropdownMenuSeparator className="bg-border" />
                    <DropdownMenuItem
                      asChild
                      className="cursor-pointer hover:bg-secondary focus:bg-secondary py-2"
                    >
                      <Link to="/profile">
                        <UserIcon className="mr-2 h-4 w-4" />
                        <span>Meu Perfil</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="cursor-pointer text-red-400 focus:text-red-400 focus:bg-red-400/10 py-2"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sair</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button
                  asChild
                  variant="ghost"
                  className="font-semibold text-white hover:text-primary"
                >
                  <Link to="/login">Acesso Exclusivo</Link>
                </Button>
                <Button
                  asChild
                  variant="default"
                  className="font-semibold shadow-[0_0_15px_rgba(201,168,76,0.2)] gold-gradient text-black"
                >
                  <Link to="/apply">Quero Participar</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Navigation */}
          <div className="flex md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Open menu"
                  className="text-muted-foreground hover:text-white"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="bg-background border-l-border w-[300px] sm:w-[400px]"
              >
                <SheetHeader className="mb-6 mt-4 text-left">
                  <SheetTitle className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-[0_0_15px_rgba(201,168,76,0.3)]">
                      <div className="w-3 h-3 rounded-full bg-background" />
                    </div>
                    <span className="text-lg font-bold tracking-widest text-white">
                      PRIME<span className="text-primary">CIRCLE</span>
                    </span>
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-4">
                  {!user ? (
                    <>
                      <a
                        href="/#how-it-works"
                        onClick={closeMenu}
                        className="text-base font-medium text-muted-foreground hover:text-primary transition-colors py-2"
                      >
                        Como Funciona
                      </a>
                      <div className="h-px bg-border w-full my-2" />
                      <Button
                        asChild
                        variant="ghost"
                        className="justify-start px-0 text-base font-semibold text-white hover:text-primary"
                        onClick={closeMenu}
                      >
                        <Link to="/login">Acesso Exclusivo</Link>
                      </Button>
                      <Button
                        asChild
                        className="justify-center text-base font-semibold shadow-[0_0_15px_rgba(201,168,76,0.2)] gold-gradient text-black mt-2"
                        onClick={closeMenu}
                      >
                        <Link to="/apply">Quero Participar</Link>
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/dashboard"
                        onClick={closeMenu}
                        className="text-base font-medium text-muted-foreground hover:text-white transition-colors py-2"
                      >
                        Painel de Controle
                      </Link>
                      {user.status === 'admin' && (
                        <Link
                          to="/admin"
                          onClick={closeMenu}
                          className="text-base font-medium text-muted-foreground hover:text-white transition-colors py-2 flex items-center gap-2"
                        >
                          <Settings className="w-5 h-5" /> Admin
                        </Link>
                      )}
                      {user.status === 'approved' && user.onboarded && (
                        <>
                          <Link
                            to="/plans"
                            onClick={closeMenu}
                            className="text-base font-medium text-muted-foreground hover:text-primary transition-colors py-2 flex items-center gap-2"
                          >
                            <Zap className="w-5 h-5" /> Planos
                          </Link>
                          <Link
                            to="/notifications"
                            onClick={closeMenu}
                            className="text-base font-medium text-muted-foreground hover:text-white transition-colors py-2 flex items-center gap-2"
                          >
                            <MessageSquare className="w-5 h-5" /> Comunicações
                          </Link>
                          <Link
                            to="/suggestions"
                            onClick={closeMenu}
                            className="text-base font-medium text-muted-foreground hover:text-white transition-colors py-2 flex items-center gap-2"
                          >
                            <Lightbulb className="w-5 h-5" /> Comunidade
                          </Link>
                          <Link
                            to="/roadmap"
                            onClick={closeMenu}
                            className="text-base font-medium text-muted-foreground hover:text-white transition-colors py-2 flex items-center gap-2"
                          >
                            <Map className="w-5 h-5" /> Cronograma de Evolução
                          </Link>
                        </>
                      )}
                      <div className="h-px bg-border w-full my-2" />
                      <Button
                        variant="outline"
                        onClick={() => {
                          handleLogout()
                          closeMenu()
                        }}
                        className="justify-start text-red-400 border-border hover:bg-red-400/10 hover:text-red-400 w-full"
                      >
                        <LogOut className="w-4 h-4 mr-2" /> Sair
                      </Button>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}
