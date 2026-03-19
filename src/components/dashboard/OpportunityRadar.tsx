import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MapPin, Target, Zap, Lock, ShieldAlert, PlayCircle, Eye } from 'lucide-react'
import { AddNeedDialog } from './AddNeedDialog'
import { EditNeedSheet } from './EditNeedSheet'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { VideoPlayerModal } from './VideoPlayerModal'

export function OpportunityRadar({
  refreshKey,
  onAddNeed,
  reputationScore = 0,
}: {
  refreshKey: number
  onAddNeed: () => void
  reputationScore?: number
}) {
  const [demands, setDemands] = useState<any[]>([])
  const [offMarketProps, setOffMarketProps] = useState<any[]>([])
  const [myProperties, setMyProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [playingVideoUrl, setPlayingVideoUrl] = useState<string | null>(null)
  const [editingNeed, setEditingNeed] = useState<any>(null)
  const { user } = useAuth()
  const { toast } = useToast()

  const ELITE_THRESHOLD = 80
  const isElite = reputationScore > ELITE_THRESHOLD

  useEffect(() => {
    if (!user) return
    const fetchRadarData = async () => {
      setLoading(true)
      const [demandsRes, myPropsRes, offMarketRes] = await Promise.all([
        supabase
          .from('documents')
          .select('*')
          .contains('metadata', { type: 'demanda' })
          .order('id', { ascending: false }),
        supabase
          .from('documents')
          .select('*')
          .contains('metadata', { type: 'oferta', user_id: user.id }),
        supabase
          .from('documents')
          .select('*')
          .contains('metadata', { type: 'oferta', is_off_market: true })
          .order('id', { ascending: false }),
      ])

      if (demandsRes.data) setDemands(demandsRes.data)
      if (myPropsRes.data) setMyProperties(myPropsRes.data)
      if (offMarketRes.data) setOffMarketProps(offMarketRes.data)
      setLoading(false)
    }
    fetchRadarData()
  }, [user, refreshKey])

  const checkMatch = (demand: any) => {
    const demandRegion = (
      demand.metadata?.region ||
      demand.metadata?.bairro ||
      demand.metadata?.endereco ||
      ''
    ).toLowerCase()
    return myProperties.some((p) => {
      const propLocation = (
        p.metadata?.location ||
        p.metadata?.bairro ||
        p.metadata?.endereco ||
        ''
      ).toLowerCase()
      if (!demandRegion || !propLocation) return false
      return propLocation.includes(demandRegion) || demandRegion.includes(propLocation)
    })
  }

  const handleMatchClick = () => {
    toast({
      title: 'Alerta de Conexão Enviado',
      description: 'O corretor responsável foi notificado. Em breve ele entrará em contato.',
      className: 'border-primary/50 text-white',
    })
  }

  const handleRequestAccess = () => {
    toast({
      title: 'Acesso Restrito',
      description: 'Você precisa de uma pontuação maior que 80 para acessar.',
      variant: 'destructive',
    })
  }

  const handlePlayVideo = async (e: React.MouseEvent, p: any) => {
    e.stopPropagation()
    if (!p.metadata?.video_url) return
    setPlayingVideoUrl(p.metadata.video_url)

    try {
      await supabase.rpc('increment_video_views', { doc_id: p.id })
      setOffMarketProps((prev) =>
        prev.map((prop) => {
          if (prop.id === p.id) {
            return {
              ...prop,
              metadata: {
                ...prop.metadata,
                video_views: (prop.metadata.video_views || 0) + 1,
              },
            }
          }
          return prop
        }),
      )
      setMyProperties((prev) =>
        prev.map((prop) => {
          if (prop.id === p.id) {
            return {
              ...prop,
              metadata: {
                ...prop.metadata,
                video_views: (prop.metadata.video_views || 0) + 1,
              },
            }
          }
          return prop
        }),
      )
    } catch (err) {
      console.error('Failed to increment video views', err)
    }
  }

  return (
    <div className="space-y-6 mt-10 animate-fade-in-up">
      <VideoPlayerModal
        open={!!playingVideoUrl}
        onOpenChange={(open) => !open && setPlayingVideoUrl(null)}
        url={playingVideoUrl}
      />

      <EditNeedSheet
        need={editingNeed}
        open={!!editingNeed}
        onOpenChange={(open) => !open && setEditingNeed(null)}
        onSuccess={() => {
          setEditingNeed(null)
          onAddNeed()
        }}
      />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Target className="text-primary w-6 h-6" />
            Radar de Oportunidades
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Mural de Demandas e acesso privilegiado a Imóveis Reservados da rede.
          </p>
        </div>
        <AddNeedDialog onSuccess={onAddNeed} />
      </div>

      <Tabs defaultValue="demandas" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 bg-background border border-border h-12 mb-6">
          <TabsTrigger value="demandas" className="data-[state=active]:bg-card rounded-sm h-10">
            Demandas da Rede ({demands.length})
          </TabsTrigger>
          <TabsTrigger
            value="offmarket"
            className="data-[state=active]:bg-card rounded-sm h-10 flex items-center gap-1"
          >
            Imóveis Reservados {!isElite && <Lock className="w-3 h-3 text-red-400" />}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="demandas">
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
                    className={`bg-card/80 border-border relative overflow-hidden transition-all group flex flex-col h-full ${isMatch && !isMine ? 'ring-1 ring-primary shadow-[0_0_15px_rgba(201,168,76,0.15)] hover:border-primary/50' : 'hover:border-primary/50'}`}
                  >
                    {isMatch && !isMine && (
                      <div className="absolute top-0 right-0 bg-primary text-black text-xs font-bold px-3 py-1 rounded-bl-lg z-10 flex items-center gap-1 shadow-md">
                        <Zap className="w-3 h-3 fill-black" /> Conexão Inteligente
                      </div>
                    )}
                    <CardHeader className="pb-3 pt-5 flex-none">
                      <CardTitle
                        className="text-lg text-white font-semibold line-clamp-1 pr-4"
                        title={d.metadata?.profile || d.metadata?.tipo_imovel || 'Demanda'}
                      >
                        {d.metadata?.profile || d.metadata?.tipo_imovel || 'Demanda'}
                      </CardTitle>
                      <CardDescription className="text-primary font-bold text-base mt-1">
                        {d.metadata?.budget ||
                          (d.metadata?.valor
                            ? new Intl.NumberFormat('pt-BR', {
                                style: 'currency',
                                currency: 'BRL',
                              }).format(d.metadata.valor)
                            : 'Não informado')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col flex-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3 bg-background/50 p-2 rounded-md">
                        <MapPin className="w-4 h-4 text-primary/70 shrink-0" />
                        <span className="font-medium truncate">
                          {d.metadata?.region ||
                            d.metadata?.bairro ||
                            d.metadata?.endereco ||
                            'Região não informada'}
                        </span>
                      </div>

                      {d.metadata?.condominiums && d.metadata.condominiums.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {d.metadata.condominiums.map((condo: string, idx: number) => (
                            <Badge
                              key={idx}
                              variant="secondary"
                              className="text-[10px] py-0 font-medium bg-secondary/50 border-border"
                            >
                              {condo}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <p className="text-sm text-muted-foreground line-clamp-3 mb-5 leading-relaxed min-h-[60px] flex-1">
                        {d.content}
                      </p>

                      <div className="mt-auto pt-2">
                        {!isMine ? (
                          <Button
                            variant={isMatch ? 'default' : 'outline'}
                            className={`w-full font-semibold ${isMatch ? 'gold-gradient text-black shadow-md' : 'border-border hover:bg-secondary text-muted-foreground'}`}
                            onClick={handleMatchClick}
                          >
                            {isMatch ? 'Conectar Imóvel' : 'Sugerir Imóvel'}
                          </Button>
                        ) : (
                          <div className="flex gap-2">
                            <Badge
                              variant="outline"
                              className="justify-center bg-secondary/20 py-2 border-dashed text-muted-foreground flex-1"
                            >
                              Sua Publicação
                            </Badge>
                            <Button
                              variant="outline"
                              className="shrink-0 border-border hover:bg-secondary hover:text-white"
                              onClick={() => setEditingNeed(d)}
                            >
                              Editar
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
              {demands.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center p-12 bg-card/50 rounded-xl border border-dashed border-border text-center">
                  <Target className="w-12 h-12 text-muted-foreground/50 mb-4" />
                  <p className="text-lg font-medium text-white mb-2">Radar Limpo</p>
                  <p className="text-muted-foreground text-sm max-w-sm">
                    Nenhuma demanda foi captada no momento. Seja o primeiro a publicar uma
                    necessidade!
                  </p>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="offmarket">
          {!isElite && (
            <div className="mb-6 p-4 rounded-lg bg-red-950/20 border border-red-900/50 flex items-start gap-4 animate-fade-in">
              <ShieldAlert className="w-6 h-6 text-red-500 shrink-0 mt-1" />
              <div>
                <h4 className="text-red-400 font-semibold text-lg">Acesso Restrito</h4>
                <p className="text-red-300/80 text-sm mt-1">
                  Sua Pontuação PrimeCircle atual é{' '}
                  <strong className="text-white">{reputationScore}</strong>. É necessário atingir{' '}
                  <strong>mais de {ELITE_THRESHOLD} pontos</strong> para visualizar detalhes de
                  propriedades Reservadas exclusivas. Continue fechando parcerias para aumentar sua
                  reputação.
                </p>
              </div>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {offMarketProps.map((p) => {
              const isMine = p.metadata?.user_id === user?.id
              const canView = isElite || isMine

              return (
                <Card
                  key={p.id}
                  className={`bg-card border-border relative overflow-hidden transition-all group ${!canView ? 'opacity-80 pointer-events-none' : 'hover:border-primary/50'}`}
                >
                  <div className="absolute top-0 right-0 bg-primary/20 text-primary border-b border-l border-primary/20 text-xs font-bold px-3 py-1 rounded-bl-lg z-10 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Reservado
                  </div>

                  {p.metadata?.video_url && canView && (
                    <button
                      type="button"
                      onClick={(e) => handlePlayVideo(e, p)}
                      className="absolute top-0 left-0 bg-primary hover:bg-primary/90 text-black text-xs font-bold px-3 py-1 rounded-br-lg z-10 flex items-center gap-1 shadow-md transition-colors pointer-events-auto"
                    >
                      <PlayCircle className="w-3 h-3 fill-black/20" /> Vídeo
                    </button>
                  )}

                  <CardHeader className="pb-3 pt-8">
                    <CardTitle
                      className={`text-lg text-white font-semibold line-clamp-1 pr-12 ${!canView ? 'blur-sm select-none' : ''}`}
                    >
                      {canView
                        ? p.metadata?.title || p.metadata?.tipo_imovel || 'Imóvel Exclusivo'
                        : 'Propriedade Exclusiva Oculta'}
                    </CardTitle>
                    <CardDescription
                      className={`text-primary font-bold text-base mt-1 ${!canView ? 'blur-sm select-none' : ''}`}
                    >
                      {canView
                        ? p.metadata?.price ||
                          (p.metadata?.valor
                            ? new Intl.NumberFormat('pt-BR', {
                                style: 'currency',
                                currency: 'BRL',
                              }).format(p.metadata.valor)
                            : 'Não informado')
                        : 'R$ *,***,***'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div
                      className={`flex items-center gap-2 text-sm text-muted-foreground mb-4 bg-background/50 p-2 rounded-md ${!canView ? 'blur-[2px] select-none' : ''}`}
                    >
                      <MapPin className="w-4 h-4 text-primary/70 shrink-0" />
                      <span className="font-medium truncate">
                        {canView
                          ? p.metadata?.location ||
                            p.metadata?.bairro ||
                            p.metadata?.endereco ||
                            'Localização não informada'
                          : 'Localização Protegida'}
                      </span>
                    </div>
                    <p
                      className={`text-sm text-muted-foreground line-clamp-3 mb-5 leading-relaxed min-h-[60px] ${!canView ? 'blur-md select-none' : ''}`}
                    >
                      {canView
                        ? p.content
                        : 'Os detalhes desta propriedade estão ocultos. Aumente sua pontuação de reputação para acessar todo o portfólio exclusivo da Prime Circle.'}
                    </p>

                    {!canView ? (
                      <Button
                        variant="outline"
                        className="w-full border-red-900/50 text-red-400 pointer-events-auto"
                        onClick={handleRequestAccess}
                      >
                        <Lock className="w-4 h-4 mr-2" /> Bloqueado (Pontuação &lt;={' '}
                        {ELITE_THRESHOLD})
                      </Button>
                    ) : (
                      <div className="space-y-3">
                        {isMine ? (
                          <Badge
                            variant="outline"
                            className="w-full justify-center bg-secondary/20 py-2 border-dashed text-muted-foreground"
                          >
                            Sua Publicação Exclusiva
                          </Badge>
                        ) : (
                          <Button className="w-full gold-gradient text-black font-semibold shadow-md">
                            Contatar Captador
                          </Button>
                        )}

                        {p.metadata?.video_url && (
                          <div className="mt-3 flex items-center justify-between w-full gap-2">
                            <Button
                              size="sm"
                              variant="secondary"
                              className={`bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 ${isMine ? 'flex-1' : 'w-full'}`}
                              onClick={(e) => handlePlayVideo(e, p)}
                            >
                              <PlayCircle className="w-4 h-4 mr-2" /> Assistir Vídeo
                            </Button>
                            {isMine && (
                              <div
                                className="flex items-center gap-1 text-xs text-muted-foreground px-2 bg-secondary/20 rounded-md py-1.5 border border-border/50 shrink-0"
                                title="Visualizações do vídeo"
                              >
                                <Eye className="w-3 h-3" /> {p.metadata.video_views || 0}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
            {offMarketProps.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center p-12 bg-card/50 rounded-xl border border-dashed border-border text-center">
                <Lock className="w-12 h-12 text-muted-foreground/50 mb-4" />
                <p className="text-lg font-medium text-white mb-2">Nenhum Imóvel Reservado</p>
                <p className="text-muted-foreground text-sm max-w-sm">
                  Atualmente não há ofertas exclusivas ativas. Seja o primeiro a postar!
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
