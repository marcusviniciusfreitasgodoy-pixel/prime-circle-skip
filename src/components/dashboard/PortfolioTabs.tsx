import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { MapPin, Building, UserSearch } from 'lucide-react'
import { EditPropertySheet } from './EditPropertySheet'

export function PortfolioTabs({ refreshKey }: { refreshKey: number }) {
  const { user } = useAuth()
  const [properties, setProperties] = useState<any[]>([])
  const [needs, setNeeds] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editingProperty, setEditingProperty] = useState<any>(null)

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
                <Skeleton key={i} className="h-40 w-full bg-card rounded-xl border border-border" />
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
                  className="bg-card border-border hover:border-primary/50 transition-all cursor-pointer group"
                  onClick={() => setEditingProperty(p)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <CardTitle className="text-lg text-white line-clamp-1">
                        {p.metadata.title || p.metadata.tipo_imovel || 'Imóvel'}
                      </CardTitle>
                      <Badge
                        variant="outline"
                        className="gold-gradient text-black shrink-0 border-0"
                      >
                        {p.metadata.property_type || p.metadata.tipo_imovel || 'Apartamento'}
                      </Badge>
                    </div>
                    <CardDescription className="text-primary font-bold text-lg">
                      {p.metadata.price ||
                        new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(p.metadata.valor || 0)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                      <MapPin className="w-4 h-4 text-primary/70 shrink-0" />
                      <span className="truncate">
                        {p.metadata.location ||
                          p.metadata.bairro ||
                          p.metadata.endereco ||
                          'Não informado'}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{p.content}</p>
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
                  className="bg-card border-border hover:border-primary/50 transition-all"
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <CardTitle className="text-lg text-white line-clamp-1">
                        {n.metadata.profile}
                      </CardTitle>
                      <Badge
                        variant="outline"
                        className="bg-primary/5 text-primary border-primary/20 shrink-0"
                      >
                        Demanda
                      </Badge>
                    </div>
                    <CardDescription className="text-primary font-bold text-lg">
                      {n.metadata.budget}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                      <MapPin className="w-4 h-4 text-primary/70 shrink-0" />
                      <span className="truncate">{n.metadata.region}</span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{n.content}</p>
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
