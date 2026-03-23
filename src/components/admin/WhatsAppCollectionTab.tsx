import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase/client'
import { Loader2, MessageSquare, CheckCircle, BarChart3 } from 'lucide-react'

export function WhatsAppCollectionTab() {
  const [metrics, setMetrics] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMetrics = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase.rpc('get_whatsapp_collection_metrics')
        if (data && !error) {
          setMetrics(data)
        }
      } catch (err) {
        console.error('Failed to fetch whatsapp collection metrics:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchMetrics()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-white">Coleta de Status Automática (WhatsApp)</h3>
        <p className="text-muted-foreground text-sm mt-1">
          Monitoramento de funil via links de ação rápida. Visão dos últimos 30 dias.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Checks Enviados
            </CardTitle>
            <MessageSquare className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{metrics?.checks_enviados || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Gatilhos disparados</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Taxa de Resposta
            </CardTitle>
            <CheckCircle className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{metrics?.taxa_resposta || 0}%</div>
            <p className="text-xs text-muted-foreground mt-1">Conversão de tokens</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Status Atualizados
            </CardTitle>
            <BarChart3 className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{metrics?.tokens_usados || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Ações via 1-Clique</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
