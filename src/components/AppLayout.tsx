import { useEffect, useRef, useState } from 'react'
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
  Palette,
  BookOpen,
  MessageSquare,
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
import { supabase } from '@/lib/supabase/client'

export function AppLayout() {
  const {
    user: storeUser,
    logout,
    suggestions,
    notifications,
    clearNotifications,
    updateUser,
  } = useAppStore()
  const { user: authUser, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [profileAvatar, setProfileAvatar] = useState('')
  const [userRole, setUserRole] = useState('user')

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

  // Real-time match notifications
  useEffect(() => {
    if (!authUser) return

    const channel = supabase
      .channel('notification_logs_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notification_logs',
          filter: `user_id=eq.${authUser.id}`,
        },
        (payload) => {
          const newLog = payload.new as any
          if (
            newLog &&
            newLog.message_body &&
            newLog.message_body.toLowerCase().includes('match')
          ) {
            toast({
              title: 'Novo Match Encontrado! 🚀',
              description:
                'Uma oportunidade compatível com sua carteira acabou de ser identificada.',
              className:
                'border-primary/50 bg-card text-white shadow-[0_0_15px_rgba(201,168,76,0.2)]',
              duration: 8000,
            })
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [authUser, toast])

  useEffect(() => {
    if (authUser) {
      if (storeUser?.avatar) {
        setProfileAvatar(storeUser.avatar)
      } else if (authUser.user_metadata?.avatar_url) {
        setProfileAvatar(authUser.user_metadata.avatar_url)
      }

      supabase
        .from('profiles')
        .select('avatar_url, role')
        .eq('id', authUser.id)
        .single()
        .then(({ data }) => {
          if (data) {
            if (data.avatar_url && !profileAvatar) {
              setProfileAvatar(data.avatar_url)
              updateUser({ avatar: data.avatar_url })
            }
            if (data.role) {
              setUserRole(data.role)
            }
          }
        })
    }
  }, [authUser, storeUser?.avatar, updateUser, profileAvatar])

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
      (!storeUser?.lastViewedSuggestionsAt ||
        new Date(s.updatedAt) > new Date(storeUser.lastViewedSuggestionsAt)),
  ).length

  const navItems = [
    { title: 'Painel de Controle', icon: LayoutDashboard, url: '/dashboard' },
    { title: 'Como Funciona (Guia)', icon: BookOpen, url: '/guide' },
    { title: 'Meu Perfil', icon: UserIcon, url: '/profile' },
    { title: 'Demandas', icon: FileText, url: '/needs' },
    { title: 'Imóveis', icon: Home, url: '/listings' },
    { title: 'Conexões', icon: GitMerge, url: '/matches' },
    { title: 'Sugestões', icon: Lightbulb, url: '/suggestions' },
    { title: 'Cronograma de Evolução', icon: Map, url: '/roadmap' },
    { title: 'Planos', icon: Crown, url: '/plans' },
    { title: 'Ativos da Marca', icon: Palette, url: '/brand' },
  ]

  const isAdminRole =
    storeUser?.status === 'admin' || authUser?.email?.includes('admin') || userRole === 'admin'
  const isMarcusOnly =
    authUser?.email === 'marcusviniciusfreitasgodoy@gmail.com' ||
    authUser?.email === 'marcus@godoyprime.com.br' ||
    storeUser?.id === 'admin-1'

  if (isAdminRole || isMarcusOnly) {
    navItems.push({ title: 'Comunicações', icon: MessageSquare, url: '/notifications' })
  }

  // Acesso à página de Admin restrito ao perfil principal/solicitado
  if (isMarcusOnly) {
    navItems.push({ title: 'Admin', icon: Settings, url: '/admin' })
  }

  const userName =
    storeUser?.name ||
    authUser?.user_metadata?.full_name ||
    authUser?.email?.split('@')[0] ||
    'Usuário'

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background selection:bg-primary/30">
        <Sidebar className="border-r border-border hidden sm:flex bg-card">
          <SidebarContent>
            <div className="p-6 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-[0_0_15px_rgba(201,168,76,0.3)] shrink-0">
                <div className="w-3.5 h-3.5 rounded-full bg-card" />
              </div>
              <span className="font-bold text-xl tracking-widest text-white">
                PRIME<span className="text-primary">CIRCLE</span>
              </span>
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
                      <AvatarImage src={profileAvatar} />
                      <AvatarFallback className="bg-secondary text-primary font-semibold">
                        {userName.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0 text-left">
                      <span className="text-sm font-medium text-white truncate">{userName}</span>
                      <span className="text-xs text-primary truncate">
                        Tier {storeUser?.tier || 'None'}
                      </span>
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
                      <p className="font-medium text-sm text-white truncate">{userName}</p>
                      <p className="text-xs text-muted-foreground truncate">{authUser?.email}</p>
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
                        <AvatarImage src={profileAvatar} />
                        <AvatarFallback className="bg-secondary text-primary text-xs font-semibold">
                          {userName.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-card border-border mt-2">
                    <div className="flex flex-col space-y-1 p-3 border-b border-border">
                      <p className="font-medium text-sm text-white truncate">{userName}</p>
                      <p className="text-xs text-muted-foreground truncate">{authUser?.email}</p>
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
          {[navItems[0], navItems[3], navItems[4], navItems[5]].map((item) => {
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
                <span className="text-[10px] font-medium truncate max-w-[70px] text-center">
                  {item.title}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
      <PlanLimitModal />
    </SidebarProvider>
  )
}
