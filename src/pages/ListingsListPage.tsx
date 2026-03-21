import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, Building, MapPin, PlayCircle, Eye, Image as ImageIcon } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { AddPropertyDialog } from '@/components/dashboard/AddPropertyDialog'
import { EditPropertySheet } from '@/components/dashboard/EditPropertySheet'
import { VideoPlayerModal } from '@/components/dashboard/VideoPlayerModal'

export default function ListingsListPage() {
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [bairro, setBairro] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)
  const [editingProperty, setEditingProperty] = useState<any>(null)
  const [playingVideoUrl, setPlayingVideoUrl] = useState<string | null>(null)

  const { user } = useAuth()

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .contains('metadata', { type: 'oferta' })
        .order('id', { ascending: false })

      if (!error && data) {
        setProperties(data)
      }
      setLoading(false)
    }
    fetchProperties()
  }, [refreshKey])

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

  const filteredProperties = properties.filter((p) => {
    const propBairro = (
      p.metadata?.bairro ||
      p.metadata?.region ||
      p.metadata?.endereco ||
      ''
    ).toLowerCase()
    const matchBairro = bairro === 'all' || propBairro.includes(bairro.toLowerCase())

    const searchString =
      `${p.metadata?.title || ''} ${p.metadata?.tipo_imovel || ''} ${p.content || ''}`.toLowerCase()
    const matchSearch = searchTerm === '' || searchString.includes(searchTerm.toLowerCase())

    const isActive = p.metadata?.status !== 'Vendido' && p.metadata?.status !== 'Cancelado'
    const isMine = p.metadata?.user_id === user?.id
    const isOffMarket = p.metadata?.is_off_market

    return matchBairro && matchSearch && (isActive || isMine) && (!isOffMarket || isMine)
  })

  const uniqueRegions = Array.from(
    new Set(properties.map((p) => p.metadata?.region || p.metadata?.bairro).filter(Boolean)),
  )

  return (
    <div className="space-y-6 animate-fade-in-up">
      <EditPropertySheet
        property={editingProperty}
        open={!!editingProperty}
        onOpenChange={(open) => !open && setEditingProperty(null)}
        onSuccess={() => {
          setEditingProperty(null)
          setRefreshKey((prev) => prev + 1)
        }}
      />

      <VideoPlayerModal
        open={!!playingVideoUrl}
        onOpenChange={(open) => !open && setPlayingVideoUrl(null)}
        url={playingVideoUrl}
      />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Imóveis Ativos</h2>
          <p className="text-muted-foreground text-sm">Explore o portfólio de imóveis da rede.</p>
        </div>
        <AddPropertyDialog onSuccess={() => setRefreshKey((prev) => prev + 1)} />
      </div>

      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-card rounded-lg border border-border">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar imóveis..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-background border-border text-white h-10"
          />
        </div>
        <Select value={bairro} onValueChange={setBairro}>
          <SelectTrigger className="w-full sm:w-[200px] bg-background border-border">
            <SelectValue placeholder="Bairro / Região" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as Regiões</SelectItem>
            {uniqueRegions.map((region) => (
              <SelectItem key={region as string} value={region as string}>
                {region as string}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64 w-full bg-card rounded-xl border border-border" />
          ))}
        </div>
      ) : filteredProperties.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-card/50 rounded-xl border border-dashed border-border text-center">
          <Building className="w-12 h-12 text-muted-foreground/50 mb-4" />
          <p className="text-lg font-medium text-white mb-2">Nenhum imóvel encontrado</p>
          <p className="text-muted-foreground text-sm max-w-sm mb-6">
            Não há imóveis disponíveis para os filtros selecionados no momento.
          </p>
          {(bairro !== 'all' || searchTerm !== '') && (
            <Button
              variant="outline"
              className="border-border hover:bg-secondary"
              onClick={() => {
                setBairro('all')
                setSearchTerm('')
              }}
            >
              Limpar Filtros
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredProperties.map((p) => {
            const isMine = p.metadata?.user_id === user?.id
            return (
              <Card
                key={p.id}
                className="bg-card border-border hover:border-primary/50 transition-all cursor-pointer group flex flex-col h-full"
                onClick={() => isMine && setEditingProperty(p)}
              >
                <CardHeader className="pb-3 flex-none">
                  {p.metadata.photos && p.metadata.photos.length > 0 ? (
                    <div className="w-full h-40 mb-3 rounded-md overflow-hidden bg-secondary border border-border relative">
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
                    <div className="w-full h-40 mb-3 rounded-md overflow-hidden bg-secondary/50 border border-border border-dashed flex items-center justify-center relative">
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

                  {isMine && (
                    <Badge
                      variant="outline"
                      className="mt-3 w-full justify-center bg-secondary/20 py-1.5 border-dashed text-muted-foreground"
                    >
                      Sua Publicação
                    </Badge>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
