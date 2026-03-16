import { Outlet, Link, useLocation } from 'react-router-dom'
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
import useAppStore from '@/stores/main'
import { cn } from '@/lib/utils'

export function AppLayout() {
  const { user, logout } = useAppStore()
  const location = useLocation()

  const navItems = [
    { title: 'Dashboard', icon: LayoutDashboard, url: '/dashboard' },
    { title: 'Meu Perfil', icon: UserIcon, url: '/profile' },
    { title: 'Demandas', icon: FileText, url: '/needs' },
    { title: 'Imóveis', icon: Home, url: '/listings' },
    { title: 'Conexões', icon: GitMerge, url: '/matches' },
    { title: 'Sugestões', icon: Lightbulb, url: '/suggestions' },
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
                            'flex items-center gap-3 px-4 py-3 transition-colors rounded-lg',
                            isActive
                              ? 'text-primary bg-primary/5'
                              : 'text-muted-foreground hover:text-white hover:bg-secondary/50',
                          )}
                        >
                          <item.icon className="w-5 h-5" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroup>
            <div className="mt-auto p-4 border-t border-border">
              <Link
                to="/profile"
                className="flex items-center gap-3 mb-4 px-2 hover:bg-secondary/50 p-2 rounded-lg transition-colors"
              >
                <Avatar className="ring-2 ring-primary/20">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="bg-secondary text-primary">JC</AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-medium text-white truncate">{user?.name}</span>
                  <span className="text-xs text-primary truncate">Tier {user?.tier}</span>
                </div>
              </Link>
              <Button
                variant="ghost"
                className="w-full justify-start text-muted-foreground hover:text-red-400 hover:bg-red-400/10"
                onClick={logout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </SidebarContent>
        </Sidebar>

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden pb-safe sm:pb-0">
          <header className="h-16 glass-header flex items-center justify-between px-6 sticky top-0 z-40">
            <h1 className="text-lg font-medium text-white drop-shadow-sm">
              {navItems.find((i) => i.url === location.pathname)?.title || 'Prime Circle'}
            </h1>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-primary relative"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full animate-pulse" />
            </Button>
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
    </SidebarProvider>
  )
}
