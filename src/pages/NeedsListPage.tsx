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
import { Search, FileText, MapPin, Info, HelpCircle } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { AddNeedDialog } from '@/components/dashboard/AddNeedDialog'
import { EditNeedSheet } from '@/components/dashboard/EditNeedSheet'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

export default function NeedsListPage() {
  const [demands, setDemands] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [bairro, setBairro] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)
  const [editingNeed, setEditingNeed] = useState<any>(null)

  const { user } = useAuth()

  useEffect(() => {
    const fetchDemands = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .contains('metadata', { type: 'demanda' })
        .order('id', { ascending: false })

      if (!error && data) setDemands(data)
      setLoading(false)
    }
    fetchDemands()
  }, [refreshKey])

  const filteredDemands = demands.filter((d) => {
    const demandBairro = (
      d.metadata?.bairro ||
      d.metadata?.region ||
      d.metadata?.endereco ||
      ''
    ).toLowerCase()
    const matchBairro = bairro === 'all' || demandBairro.includes(bairro.toLowerCase())
    const searchString =
      `${d.metadata?.title || ''} ${d.metadata?.tipo_imovel || ''} ${d.content || ''}`.toLowerCase()
    const matchSearch = searchTerm === '' || searchString.includes(searchTerm.toLowerCase())
    return matchBairro && matchSearch
  })

  const uniqueRegions = Array.from(
    new Set(demands.map((d) => d.metadata?.region || d.metadata?.bairro).filter(Boolean)),
  )

  return (
    <div className="space-y-6 animate-fade-in-up">
      <EditNeedSheet
        need={editingNeed}
        open={!!editingNeed}
        onOpenChange={(open) => !open && setEditingNeed(null)}
        onSuccess={() => {
          setEditingNeed(null)
          setRefreshKey((prev) => prev + 1)
        }}
      />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">
            Central de Demandas: O que meus clientes buscam
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Poste aqui as necessidades específicas dos seus clientes que você não possui em sua base
            para encontrar parceiros com o imóvel ideal.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="text-muted-foreground hover:text-primary transition-colors flex items-center justify-center"
                >
                  <HelpCircle className="w-5 h-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-[250px] text-center" side="bottom">
                <p>
                  Use este botão para solicitar imóveis de outros membros quando não tiver uma opção
                  compatível em sua base.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <AddNeedDialog onSuccess={() => setRefreshKey((prev) => prev + 1)} />
        </div>
      </div>

      <Alert className="bg-primary/5 border-primary/20">
        <Info className="h-4 w-4 text-primary" />
        <AlertTitle className="text-primary font-semibold">Como usar as Demandas?</AlertTitle>
        <AlertDescription className="text-primary/80 mt-1">
          Não encontrou o imóvel em seu portfólio? Poste a demanda aqui e deixe a rede ajudar você a
          fechar negócio através de parcerias.
        </AlertDescription>
      </Alert>

      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-card rounded-lg border border-border">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar demandas..."
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
            <Skeleton key={i} className="h-48 w-full bg-card rounded-xl border border-border" />
          ))}
        </div>
      ) : filteredDemands.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-card/50 rounded-xl border border-dashed border-border text-center">
          <FileText className="w-12 h-12 text-muted-foreground/50 mb-4" />
          <p className="text-lg font-medium text-white mb-2">Nenhuma demanda ativa?</p>
          <p className="text-muted-foreground text-sm max-w-sm mb-6">
            Se você tem um cliente buscando algo específico, publique agora e notifique a rede.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
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
            {bairro === 'all' && searchTerm === '' && (
              <AddNeedDialog onSuccess={() => setRefreshKey((prev) => prev + 1)} />
            )}
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredDemands.map((d) => {
            const isMine = d.metadata?.user_id === user?.id
            return (
              <Card
                key={d.id}
                className="bg-card/80 border-border relative overflow-hidden transition-all group flex flex-col h-full hover:border-primary/50"
              >
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
                    {isMine && (
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
        </div>
      )}
    </div>
  )
}
