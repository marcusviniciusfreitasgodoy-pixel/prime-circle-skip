import { useEffect, useRef } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  FileText,
  Home,
  GitMerge,
  Lightbulb,
  Crown,
  Settings,
  LogOut,
  Bell,
  Map,
  User as UserIcon,
} from 'lucide-react'
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import useAppStore from '@/stores/main'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { PlanLimitModal } from '@/components/PlanLimitModal'

export function AppLayout() {
  const { user, logout, suggestions, notifications, clearNotifications } = useAppStore()
  const { signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const { toast } = useToast()

  const clearRef = useRef(clearNotifications)

  useEffect(() => {
    clearRef.current = clearNotifications
  }, [clearNotifications])

  useEffect(() => {
    if (notifications.length > 0) {
      notifications.forEach((n) => {
        toast({
          title: n.title,
          description: n.description,
          className: 'border-primary/50 bg-card text-white shadow-elevation',
        })
      })
      clearRef.current()
    }
  }, [notifications, toast])

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

  const unseenSuggestionsCount = suggestions.filter(
    (s) =>
      ['Em Desenvolvimento', 'Entregue'].includes(s.status) &&
      (!user?.lastViewedSuggestionsAt ||
        new Date(s.updatedAt) > new Date(user.lastViewedSuggestionsAt)),
  ).length

  const navItems = [
    { title: 'Painel de Controle', icon: LayoutDashboard, url: '/dashboard' },
    { title: 'Meu Perfil', icon: UserIcon, url: '/profile' },
    { title: 'Demandas', icon: FileText, url: '/needs' },
    { title: 'Imóveis', icon: Home, url: '/listings' },
    { title: 'Conexões', icon: GitMerge, url: '/matches' },
    { title: 'Sugestões', icon: Lightbulb, url: '/suggestions' },
    { title: 'Cronograma de Evolução', icon: Map, url: '/roadmap' },
    { title: 'Planos', icon: Crown, url: '/plans' },
  ]

  if (user?.status === 'admin') {
    navItems.push({ title: 'Admin', icon: Settings, url: '/admin' })
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background selection:bg-primary/30">
        <Sidebar className="border-r border-border hidden sm:flex bg-card">
          <SidebarContent>
            <div className="p-6 flex items-center gap-2">
              <Crown className="text-primary w-8 h-8 drop-shadow-[0_0_8px_rgba(201,168,76,0.5)]" />
              <span className="font-bold text-xl tracking-tight text-white">Prime Circle</span>
            </div>
            <SidebarGroup>
              <SidebarMenu>
                {navItems.map((item) => {
                  const isActive = location.pathname === item.url
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={isActive}>
                        <Link
                          to={item.url}
                          className={cn(
                            'flex items-center gap-3 px-4 py-3 transition-colors rounded-lg relative',
                            isActive
                              ? 'text-primary bg-primary/5'
                              : 'text-muted-foreground hover:text-white hover:bg-secondary/50',
                          )}
                        >
                          <item.icon className="w-5 h-5" />
                          <span className="flex-1">{item.title}</span>
                          {item.title === 'Cronograma de Evolução' &&
                            unseenSuggestionsCount > 0 && (
                              <Badge
                                variant="destructive"
                                className="ml-auto h-5 min-w-5 px-1.5 flex items-center justify-center text-[10px]"
                              >
                                {unseenSuggestionsCount}
                              </Badge>
                            )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroup>
            <div className="mt-auto p-4 border-t border-border">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-3 w-full px-2 hover:bg-secondary/50 p-2 rounded-lg transition-colors outline-none focus:ring-2 focus:ring-primary/50">
                    <Avatar className="ring-2 ring-primary/20">
                      <AvatarImage src={user?.avatar} />
                      <AvatarFallback className="bg-secondary text-primary">
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0 text-left">
                      <span className="text-sm font-medium text-white truncate">{user?.name}</span>
                      <span className="text-xs text-primary truncate">Tier {user?.tier}</span>
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  side="right"
                  sideOffset={16}
                  className="w-56 bg-card border-border"
                >
                  <div className="flex items-center justify-start gap-2 p-3 md:hidden">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium text-sm text-white truncate">{user?.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                  </div>
                  <DropdownMenuItem
                    asChild
                    className="cursor-pointer hover:bg-secondary focus:bg-secondary py-2"
                  >
                    <Link to="/profile">
                      <UserIcon className="mr-2 h-4 w-4" />
                      <span>Meu Perfil</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-border" />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-red-400 focus:text-red-400 focus:bg-red-400/10 py-2"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sair</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </SidebarContent>
        </Sidebar>

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden pb-safe sm:pb-0">
          <header className="h-16 glass-header flex items-center justify-between px-6 sticky top-0 z-40">
            <h1 className="text-lg font-medium text-white drop-shadow-sm">
              {navItems.find((i) => i.url === location.pathname)?.title || 'Prime Circle'}
            </h1>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-primary relative"
              >
                <Bell className="w-5 h-5" />
                {unseenSuggestionsCount > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full" />
                )}
              </Button>
              <div className="sm:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full relative h-8 w-8">
                      <Avatar className="h-8 w-8 ring-1 ring-primary/20">
                        <AvatarImage src={user?.avatar} />
                        <AvatarFallback className="bg-secondary text-primary text-xs">
                          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-card border-border mt-2">
                    <div className="flex flex-col space-y-1 p-3 border-b border-border">
                      <p className="font-medium text-sm text-white truncate">{user?.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                    <DropdownMenuItem
                      asChild
                      className="cursor-pointer hover:bg-secondary focus:bg-secondary py-2 mt-1"
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
                      <LogOut className="w-4 h-4 mr-2" />
                      <span>Sair</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-20 sm:pb-8">
            <Outlet />
          </main>
        </div>

        {/* Mobile Bottom Nav */}
        <div className="fixed bottom-0 w-full bg-card/90 backdrop-blur-md border-t border-border flex justify-around items-center h-16 sm:hidden z-50 pb-safe">
          {[navItems[0], navItems[2], navItems[3], navItems[4]].map((item) => {
            const isActive = location.pathname.startsWith(item.url)
            return (
              <Link
                key={item.title}
                to={item.url}
                className={cn(
                  'flex flex-col items-center justify-center w-full h-full relative transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground hover:text-white',
                )}
              >
                {isActive && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-b-full shadow-[0_0_8px_rgba(201,168,76,0.8)]" />
                )}
                <item.icon
                  className={cn(
                    'w-5 h-5 mb-1',
                    isActive && 'drop-shadow-[0_0_8px_rgba(201,168,76,0.5)]',
                  )}
                />
                <span className="text-[10px] font-medium">{item.title}</span>
              </Link>
            )
          })}
        </div>
      </div>
      <PlanLimitModal />
    </SidebarProvider>
  )
}
