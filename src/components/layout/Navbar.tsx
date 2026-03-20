import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import useAppStore from '@/stores/main'
import { LogOut, Menu, User as UserIcon, LayoutDashboard } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export function Navbar() {
  const { user: authUser, signOut } = useAuth()
  const { user: storeUser, logout, updateUser } = useAppStore()
  const location = useLocation()
  const [profileAvatar, setProfileAvatar] = useState('')

  useEffect(() => {
    if (authUser) {
      // Prioritize store avatar, then metadata, then fetch from profile
      if (storeUser?.avatar) {
        setProfileAvatar(storeUser.avatar)
      } else if (authUser.user_metadata?.avatar_url) {
        setProfileAvatar(authUser.user_metadata.avatar_url)
      } else {
        supabase
          .from('profiles')
          .select('avatar_url')
          .eq('id', authUser.id)
          .single()
          .then(({ data }) => {
            if (data?.avatar_url) {
              setProfileAvatar(data.avatar_url)
              updateUser({ avatar: data.avatar_url })
            }
          })
      }
    }
  }, [authUser, storeUser?.avatar, updateUser])

  const handleLogout = async () => {
    await signOut()
    logout()
  }

  const isPublicRoute = ['/', '/apply', '/login', '/waitlist'].includes(location.pathname)

  const navLinks = authUser
    ? [
        { title: 'Dashboard', url: '/dashboard' },
        { title: 'Conexões', url: '/matches' },
        { title: 'Planos', url: '/plans' },
      ]
    : [
        { title: 'Início', url: '/' },
        { title: 'Aplicar', url: '/apply' },
      ]

  const userName =
    storeUser?.name ||
    authUser?.user_metadata?.full_name ||
    authUser?.email?.split('@')[0] ||
    'Usuário'

  return (
    <header className="fixed top-0 w-full z-50 glass-header border-b border-border/50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to={authUser ? '/dashboard' : '/'} className="flex items-center gap-2 group">
          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-[0_0_10px_rgba(201,168,76,0.3)] group-hover:scale-105 transition-transform">
            <div className="w-2.5 h-2.5 rounded-full bg-background" />
          </div>
          <span className="text-lg font-bold tracking-widest text-white hidden sm:block">
            PRIME<span className="text-primary">CIRCLE</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.title}
              to={link.url}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location.pathname === link.url ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              {link.title}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          {!authUser ? (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                asChild
                className="hidden sm:inline-flex text-white hover:text-primary"
              >
                <Link to="/login">Entrar</Link>
              </Button>
              <Button asChild className="gold-gradient text-black font-semibold">
                <Link to="/apply">Aplicar Agora</Link>
              </Button>
            </div>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-9 w-9 rounded-full ring-2 ring-primary/20 hover:ring-primary/50 transition-all p-0"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={profileAvatar} alt={userName} />
                    <AvatarFallback className="bg-secondary text-primary font-semibold">
                      {userName.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-card border-border">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium text-sm text-white">{userName}</p>
                    <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                      {authUser.email}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem
                  asChild
                  className="cursor-pointer hover:bg-secondary focus:bg-secondary"
                >
                  <Link to="/dashboard" className="w-full flex items-center">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  asChild
                  className="cursor-pointer hover:bg-secondary focus:bg-secondary"
                >
                  <Link to="/profile" className="w-full flex items-center">
                    <UserIcon className="mr-2 h-4 w-4" />
                    Meu Perfil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer text-red-400 focus:text-red-400 focus:bg-red-400/10"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden text-white">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64 bg-card border-border p-6">
              <SheetTitle className="sr-only">Menu de Navegação</SheetTitle>
              <nav className="flex flex-col gap-4 mt-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.title}
                    to={link.url}
                    className={`text-lg font-medium transition-colors hover:text-primary ${
                      location.pathname === link.url ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  >
                    {link.title}
                  </Link>
                ))}
                {!authUser && (
                  <div className="flex flex-col gap-2 mt-4">
                    <Button variant="outline" asChild className="w-full border-border">
                      <Link to="/login">Entrar</Link>
                    </Button>
                    <Button asChild className="w-full gold-gradient text-black font-semibold">
                      <Link to="/apply">Aplicar</Link>
                    </Button>
                  </div>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
