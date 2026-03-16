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
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar className="border-r border-border hidden sm:flex bg-card">
          <SidebarContent>
            <div className="p-6 flex items-center gap-2">
              <Crown className="text-primary w-8 h-8" />
              <span className="font-bold text-xl tracking-tight text-white">Prime Circle</span>
            </div>
            <SidebarGroup>
              <SidebarMenu>
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={location.pathname === item.url}>
                      <Link
                        to={item.url}
                        className="flex items-center gap-3 px-4 py-3 text-muted-foreground hover:text-white transition-colors"
                      >
                        <item.icon className="w-5 h-5" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
            <div className="mt-auto p-4 border-t border-border">
              <div className="flex items-center gap-3 mb-4 px-2">
                <Avatar>
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback>JC</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-white">{user?.name}</span>
                  <span className="text-xs text-primary">
                    Status: {user?.status === 'admin' ? 'Admin' : 'Membro'}
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                className="w-full justify-start text-muted-foreground hover:text-white"
                onClick={logout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </SidebarContent>
        </Sidebar>

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden pb-16 sm:pb-0">
          <header className="h-16 glass-header flex items-center justify-between px-6 sticky top-0 z-40">
            <h1 className="text-lg font-medium text-white">
              {navItems.find((i) => i.url === location.pathname)?.title || 'Prime Circle'}
            </h1>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-primary"
            >
              <Bell className="w-5 h-5" />
            </Button>
          </header>
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <Outlet />
          </main>
        </div>

        {/* Mobile Bottom Nav */}
        <div className="fixed bottom-0 w-full bg-card border-t border-border flex justify-around items-center h-16 sm:hidden z-50">
          {[navItems[0], navItems[1], navItems[2], navItems[3]].map((item) => {
            const isActive = location.pathname === item.url
            return (
              <Link
                key={item.title}
                to={item.url}
                className={cn(
                  'flex flex-col items-center justify-center w-full h-full',
                  isActive ? 'text-primary' : 'text-muted-foreground',
                )}
              >
                <item.icon className="w-5 h-5 mb-1" />
                <span className="text-[10px]">{item.title}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </SidebarProvider>
  )
}
