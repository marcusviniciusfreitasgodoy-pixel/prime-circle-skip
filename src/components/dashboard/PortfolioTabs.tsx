import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { MapPin, Building, UserSearch, Image as ImageIcon, PlayCircle, Eye } from 'lucide-react'
import { EditPropertySheet } from './EditPropertySheet'
import { EditNeedSheet } from './EditNeedSheet'
import { Button } from '@/components/ui/button'
import { VideoPlayerModal } from './VideoPlayerModal'

export function PortfolioTabs({ refreshKey }: { refreshKey: number }) {
  const { user } = useAuth()
  const [properties, setProperties] = useState<any[]>([])
  const [needs, setNeeds] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editingProperty, setEditingProperty] = useState<any>(null)
  const [editingNeed, setEditingNeed] = useState<any>(null)
  const [playingVideoUrl, setPlayingVideoUrl] = useState<string | null>(null)

  const fetchPortfolio = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .contains('metadata', { user_id: user.id })
      .order('id', { ascending: false })

    if (!error && data) {
      const props = data.filter((d) => d.metadata?.type === 'oferta')
      const nds = data.filter((d) => d.metadata?.type === 'demanda')
      setProperties(props)
      setNeeds(nds)
    }
    setLoading(false)
  }, [user])

  useEffect(() => {
    fetchPortfolio()
  }, [fetchPortfolio, refreshKey])

  const handlePlayVideo = async (e: React.MouseEvent, p: any) => {
    e.stopPropagation()
    if (!p.metadata?.video_url) return
    setPlayingVideoUrl(p.metadata.video_url)

    try {
      await supabase.rpc('increment_video_views', { doc_id: p.id })
      setProperties((prev) =>
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
    <div className="w-full">
      <EditPropertySheet
        property={editingProperty}
        open={!!editingProperty}
        onOpenChange={(open) => !open && setEditingProperty(null)}
        onSuccess={() => {
          setEditingProperty(null)
          fetchPortfolio()
        }}
      />

      <EditNeedSheet
        need={editingNeed}
        open={!!editingNeed}
        onOpenChange={(open) => !open && setEditingNeed(null)}
        onSuccess={() => {
          setEditingNeed(null)
          fetchPortfolio()
        }}
      />

      <VideoPlayerModal
        open={!!playingVideoUrl}
        onOpenChange={(open) => !open && setPlayingVideoUrl(null)}
        url={playingVideoUrl}
      />

      <Tabs defaultValue="imoveis" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 bg-background border border-border h-12">
          <TabsTrigger value="imoveis" className="data-[state=active]:bg-card rounded-sm h-10">
            Meus Imóveis ({properties.length})
          </TabsTrigger>
          <TabsTrigger value="necessidades" className="data-[state=active]:bg-card rounded-sm h-10">
            Minhas Publicações ({needs.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="imoveis" className="mt-6">
          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-48 w-full bg-card rounded-xl border border-border" />
              ))}
            </div>
          ) : properties.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 bg-card/50 rounded-xl border border-dashed border-border text-center">
              <Building className="w-12 h-12 text-muted-foreground/50 mb-4" />
              <p className="text-lg font-medium text-white mb-2">Nenhum imóvel divulgado</p>
              <p className="text-muted-foreground text-sm max-w-sm">
                Divulgue seus imóveis para que outros corretores da rede possam encontrar matches
                para seus clientes.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {properties.map((p) => (
                <Card
                  key={p.id}
                  className="bg-card border-border hover:border-primary/50 transition-all cursor-pointer group flex flex-col h-full"
                  onClick={() => setEditingProperty(p)}
                >
                  <CardHeader className="pb-3 flex-none">
                    {p.metadata.photos && p.metadata.photos.length > 0 ? (
                      <div className="w-full h-32 mb-3 rounded-md overflow-hidden bg-secondary border border-border relative">
                        <img
                          src={p.metadata.photos[0]}
                          alt="Imóvel"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {p.metadata.video_url && (
                          <button
                            type="button"
                            onClick={(e) => handlePlayVideo(e, p)}
                            className="absolute top-2 left-2 bg-primary/90 hover:bg-primary text-black px-2 py-1 rounded text-xs font-bold flex items-center gap-1 shadow-md z-10 backdrop-blur-sm transition-colors"
                          >
                            <PlayCircle className="w-3 h-3 fill-black/20" /> Vídeo
                          </button>
                        )}
                        {p.metadata.photos.length > 1 && (
                          <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-0.5 rounded text-xs font-medium text-white flex items-center gap-1 backdrop-blur-sm z-10">
                            <ImageIcon className="w-3 h-3" />
                            {p.metadata.photos.length}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="w-full h-32 mb-3 rounded-md overflow-hidden bg-secondary/50 border border-border border-dashed flex items-center justify-center relative">
                        <Building className="w-8 h-8 text-muted-foreground/30" />
                        {p.metadata.video_url && (
                          <button
                            type="button"
                            onClick={(e) => handlePlayVideo(e, p)}
                            className="absolute top-2 left-2 bg-primary/90 hover:bg-primary text-black px-2 py-1 rounded text-xs font-bold flex items-center gap-1 shadow-md z-10 backdrop-blur-sm transition-colors"
                          >
                            <PlayCircle className="w-3 h-3 fill-black/20" /> Vídeo
                          </button>
                        )}
                      </div>
                    )}
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <CardTitle className="text-lg text-white line-clamp-1">
                        {p.metadata.title || p.metadata.tipo_imovel || 'Imóvel'}
                      </CardTitle>
                      <div className="flex flex-col gap-1 items-end shrink-0">
                        <Badge variant="outline" className="gold-gradient text-black border-0">
                          {p.metadata.property_type || p.metadata.tipo_imovel || 'Apartamento'}
                        </Badge>
                        {p.metadata.status && p.metadata.status !== 'Ativo' && (
                          <Badge
                            variant="outline"
                            className={`text-[10px] uppercase font-bold tracking-wider ${p.metadata.status === 'Vendido' ? 'bg-green-500/20 text-green-500 border-green-500/30' : 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30'}`}
                          >
                            {p.metadata.status}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <CardDescription className="text-primary font-bold text-lg mt-1">
                      {p.metadata.price ||
                        new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(p.metadata.valor || 0)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                      <MapPin className="w-4 h-4 text-primary/70 shrink-0" />
                      <span className="truncate">
                        {p.metadata.location ||
                          p.metadata.bairro ||
                          p.metadata.endereco ||
                          'Não informado'}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-auto mb-1">
                      {p.content}
                    </p>

                    {p.metadata.video_url && (
                      <div className="mt-3 flex items-center justify-between w-full gap-2 bg-secondary/20 p-1.5 rounded-md border border-border/50">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 flex-1"
                          onClick={(e) => handlePlayVideo(e, p)}
                        >
                          <PlayCircle className="w-4 h-4 mr-2" /> Assistir Vídeo
                        </Button>
                        <div
                          className="flex items-center gap-1 text-xs text-muted-foreground px-2"
                          title="Visualizações do vídeo"
                        >
                          <Eye className="w-3 h-3" /> {p.metadata.video_views || 0}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="necessidades" className="mt-6">
          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-40 w-full bg-card rounded-xl border border-border" />
              ))}
            </div>
          ) : needs.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 bg-card/50 rounded-xl border border-dashed border-border text-center">
              <UserSearch className="w-12 h-12 text-muted-foreground/50 mb-4" />
              <p className="text-lg font-medium text-white mb-2">Nenhuma necessidade publicada</p>
              <p className="text-muted-foreground text-sm max-w-sm">
                Publique o que seus clientes estão buscando para receber indicações direcionadas.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {needs.map((n) => (
                <Card
                  key={n.id}
                  className="bg-card border-border hover:border-primary/50 transition-all flex flex-col h-full group"
                >
                  <CardHeader className="pb-3 flex-none">
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <CardTitle
                        className="text-lg text-white line-clamp-1"
                        title={n.metadata.profile || n.metadata.tipo_imovel || 'Demanda'}
                      >
                        {n.metadata.profile || n.metadata.tipo_imovel || 'Demanda'}
                      </CardTitle>
                      <Badge
                        variant="outline"
                        className="bg-primary/5 text-primary border-primary/20 shrink-0"
                      >
                        Demanda
                      </Badge>
                    </div>
                    <CardDescription className="text-primary font-bold text-lg mt-1">
                      {n.metadata.budget ||
                        (n.metadata.valor
                          ? new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            }).format(n.metadata.valor)
                          : 'Orçamento não informado')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col flex-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3 bg-secondary/30 p-2 rounded-md border border-border/50">
                      <MapPin className="w-4 h-4 text-primary/70 shrink-0" />
                      <span className="truncate font-medium">
                        {n.metadata.region ||
                          n.metadata.bairro ||
                          n.metadata.endereco ||
                          'Região não informada'}
                      </span>
                    </div>

                    {n.metadata.condominiums && n.metadata.condominiums.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {n.metadata.condominiums.map((condo: string, idx: number) => (
                          <Badge
                            key={idx}
                            variant="secondary"
                            className="text-[10px] py-0 font-medium bg-background border-border"
                          >
                            {condo}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-1">
                      {n.content}
                    </p>

                    <Button
                      variant="outline"
                      className="w-full mt-auto border-border hover:bg-secondary group-hover:border-primary/50 transition-colors"
                      onClick={() => setEditingNeed(n)}
                    >
                      Editar Demanda
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
