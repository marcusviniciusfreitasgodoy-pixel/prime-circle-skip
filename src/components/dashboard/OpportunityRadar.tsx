import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { MapPin, Target, Zap } from 'lucide-react'
import { AddNeedDialog } from './AddNeedDialog'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'

export function OpportunityRadar({
  refreshKey,
  onAddNeed,
}: {
  refreshKey: number
  onAddNeed: () => void
}) {
  const [demands, setDemands] = useState<any[]>([])
  const [myProperties, setMyProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (!user) return
    const fetchRadarData = async () => {
      setLoading(true)
      const [demandsRes, myPropsRes] = await Promise.all([
        supabase
          .from('documents')
          .select('*')
          .contains('metadata', { type: 'demanda' })
          .order('id', { ascending: false }),
        supabase
          .from('documents')
          .select('*')
          .contains('metadata', { type: 'oferta', user_id: user.id }),
      ])

      if (demandsRes.data) setDemands(demandsRes.data)
      if (myPropsRes.data) setMyProperties(myPropsRes.data)
      setLoading(false)
    }
    fetchRadarData()
  }, [user, refreshKey])

  const checkMatch = (demand: any) => {
    // Basic fallback matching algorithm mimicking match_documents textually
    const demandRegion = demand.metadata?.region?.toLowerCase() || ''
    return myProperties.some((p) => {
      const propLocation = p.metadata?.location?.toLowerCase() || ''
      return propLocation.includes(demandRegion) || demandRegion.includes(propLocation)
    })
  }

  const handleMatchClick = () => {
    toast({
      title: 'Alerte de Match Enviado',
      description: 'O corretor responsável foi notificado. Em breve ele entrará em contato.',
      className: 'border-primary/50 text-white',
    })
  }

  return (
    <div className="space-y-6 mt-10 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Target className="text-primary w-6 h-6" />
            Radar de Oportunidades
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Mural de Demandas da rede. Destacamos compatibilidade com seu portfólio privado.
          </p>
        </div>
        <AddNeedDialog onSuccess={onAddNeed} />
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-full bg-card rounded-xl border border-border" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {demands.map((d) => {
            const isMatch = checkMatch(d)
            const isMine = d.metadata?.user_id === user?.id
            return (
              <Card
                key={d.id}
                className={`bg-card/80 border-border relative overflow-hidden transition-all hover:border-primary/50 group ${isMatch && !isMine ? 'ring-1 ring-primary shadow-[0_0_15px_rgba(201,168,76,0.15)]' : ''}`}
              >
                {isMatch && !isMine && (
                  <div className="absolute top-0 right-0 bg-primary text-black text-xs font-bold px-3 py-1 rounded-bl-lg z-10 flex items-center gap-1 shadow-md">
                    <Zap className="w-3 h-3 fill-black" /> Smart Match
                  </div>
                )}
                <CardHeader className="pb-3 pt-5">
                  <CardTitle
                    className="text-lg text-white font-semibold line-clamp-1 pr-4"
                    title={d.metadata?.profile}
                  >
                    {d.metadata?.profile}
                  </CardTitle>
                  <CardDescription className="text-primary font-bold text-base mt-1">
                    {d.metadata?.budget}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4 bg-background/50 p-2 rounded-md">
                    <MapPin className="w-4 h-4 text-primary/70 shrink-0" />
                    <span className="font-medium truncate">{d.metadata?.region}</span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-5 leading-relaxed min-h-[60px]">
                    {d.content}
                  </p>

                  {!isMine ? (
                    <Button
                      variant={isMatch ? 'default' : 'outline'}
                      className={`w-full font-semibold ${isMatch ? 'gold-gradient text-black shadow-md' : 'border-border hover:bg-secondary text-muted-foreground'}`}
                      onClick={handleMatchClick}
                    >
                      {isMatch ? 'Conectar Imóvel' : 'Sugerir Imóvel'}
                    </Button>
                  ) : (
                    <Badge
                      variant="outline"
                      className="w-full justify-center bg-secondary/20 py-2 border-dashed text-muted-foreground"
                    >
                      Sua Publicação
                    </Badge>
                  )}
                </CardContent>
              </Card>
            )
          })}
          {demands.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center p-12 bg-card/50 rounded-xl border border-dashed border-border text-center">
              <Target className="w-12 h-12 text-muted-foreground/50 mb-4" />
              <p className="text-lg font-medium text-white mb-2">Radar Limpo</p>
              <p className="text-muted-foreground text-sm max-w-sm">
                Nenhuma demanda foi captada no momento. Seja o primeiro a publicar uma necessidade!
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
