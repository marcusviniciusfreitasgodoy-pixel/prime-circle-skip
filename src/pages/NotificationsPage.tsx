import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Bell, History } from 'lucide-react'
import { TemplatesTab } from '@/components/notifications/TemplatesTab'
import { LogsTab } from '@/components/notifications/LogsTab'

export default function NotificationsPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in-up">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white">Comunicações</h2>
        <p className="text-muted-foreground mt-2 text-lg">
          Gerencie seus templates de notificação e acompanhe o histórico de envios automáticos para
          seus parceiros.
        </p>
      </div>

      <Tabs defaultValue="templates" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 bg-secondary border border-border mb-8">
          <TabsTrigger
            value="templates"
            className="data-[state=active]:bg-background data-[state=active]:text-primary"
          >
            <Bell className="w-4 h-4 mr-2" /> Templates
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="data-[state=active]:bg-background data-[state=active]:text-primary"
          >
            <History className="w-4 h-4 mr-2" /> Histórico
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates">
          <TemplatesTab />
        </TabsContent>

        <TabsContent value="history">
          <LogsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
