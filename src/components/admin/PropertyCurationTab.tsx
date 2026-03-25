import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase/client'
import { CheckCircle2, Trash2, AlertTriangle, Eye, ArrowRight, Building } from 'lucide-react'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'

const formatCurrency = (val: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0)

export function PropertyCurationTab({ profiles }: { profiles: any[] }) {
  const [docs, setDocs] = useState<any[]>([])
  const [originals, setOriginals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('documents')
      .select('*')
      .contains('metadata', { has_duplicate_history: true })
      .order('id', { ascending: false })

    if (data) {
      setDocs(data)
      const origIds = new Set<number>()
      data.forEach((d) => {
        if (d.metadata.duplicate_of) {
          d.metadata.duplicate_of.forEach((id: number) => origIds.add(id))
        }
      })

      if (origIds.size > 0) {
        const { data: origData } = await supabase
          .from('documents')
          .select('*')
          .in('id', Array.from(origIds))
        if (origData) setOriginals(origData)
      }
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleAction = async (docId: number, md: any, action: 'unique' | 'duplicate') => {
    const newMd = {
      ...md,
      potential_duplicate: false,
      resolution: action,
      status: action === 'duplicate' ? 'Cancelado' : md.status,
    }
    const { error } = await supabase.from('documents').update({ metadata: newMd }).eq('id', docId)
    if (!error) {
      toast.success(
        action === 'unique' ? 'Marcado como único.' : 'Duplicidade removida (Cancelado).',
      )
      setDocs((prev) => prev.map((d) => (d.id === docId ? { ...d, metadata: newMd } : d)))
    } else {
      toast.error('Erro ao atualizar registro.')
    }
  }

  const getProfileName = (userId: string) => {
    const p = profiles.find((p) => p.id === userId)
    return p?.full_name || 'Corretor Desconhecido'
  }

  const totalAlerts = docs.length
  const pendingDocs = docs.filter((d) => d.metadata.resolution === 'pending')
  const pendingCount = pendingDocs.length
  const uniqueConfirmed = docs.filter((d) => d.metadata.resolution === 'unique').length
  const duplicatesConfirmed = docs.filter((d) => d.metadata.resolution === 'duplicate').length

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex flex-col justify-center">
            <span className="text-3xl font-bold text-white">{totalAlerts}</span>
            <span className="text-sm text-muted-foreground">Total de Alertas</span>
          </CardContent>
        </Card>
        <Card className="bg-card border-border border-l-4 border-l-yellow-500/50">
          <CardContent className="p-4 flex flex-col justify-center">
            <span className="text-3xl font-bold text-yellow-500">{pendingCount}</span>
            <span className="text-sm text-muted-foreground">Em Análise</span>
          </CardContent>
        </Card>
        <Card className="bg-card border-border border-l-4 border-l-green-500/50">
          <CardContent className="p-4 flex flex-col justify-center">
            <span className="text-3xl font-bold text-green-500">{uniqueConfirmed}</span>
            <span className="text-sm text-muted-foreground">Falsos Positivos (Únicos)</span>
          </CardContent>
        </Card>
        <Card className="bg-card border-border border-l-4 border-l-red-500/50">
          <CardContent className="p-4 flex flex-col justify-center">
            <span className="text-3xl font-bold text-red-500">{duplicatesConfirmed}</span>
            <span className="text-sm text-muted-foreground">Verdadeiros Positivos (Removidos)</span>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-500" />
          Aguardando Revisão ({pendingCount})
        </h3>

        {pendingDocs.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 bg-card/50 rounded-xl border border-dashed border-border text-center">
            <CheckCircle2 className="w-12 h-12 text-muted-foreground/50 mb-4" />
            <p className="text-lg font-medium text-white mb-2">Base Limpa</p>
            <p className="text-muted-foreground text-sm max-w-sm">
              Não há imóveis sinalizados como duplicidade aguardando curadoria no momento.
            </p>
          </div>
        ) : (
          pendingDocs.map((doc) => {
            const matchedOriginals = originals.filter((o) =>
              doc.metadata.duplicate_of?.includes(o.id),
            )

            return (
              <Card key={doc.id} className="bg-card border-border shadow-elevation">
                <CardContent className="p-5 flex flex-col gap-6">
                  <div className="grid md:grid-cols-2 gap-8 relative">
                    <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center justify-center w-8 h-8 rounded-full bg-secondary border border-border z-10 text-muted-foreground">
                      VS
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center mb-2">
                        <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30 hover:bg-yellow-500/30">
                          Novo Cadastro (Em Análise)
                        </Badge>
                      </div>
                      <div className="p-4 bg-secondary/30 rounded-lg border border-primary/20 relative overflow-hidden">
                        <h4 className="font-bold text-white text-lg">
                          {doc.metadata.tipo_imovel} em {doc.metadata.bairro}
                        </h4>
                        <p className="text-sm text-primary font-medium mt-1">
                          Por: {getProfileName(doc.metadata.user_id)}
                        </p>
                        <div className="flex gap-4 mt-3 pt-3 border-t border-border/50 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <Building className="w-4 h-4" /> {doc.metadata.tamanho_imovel}m²
                          </span>
                          <span className="font-semibold text-white">
                            {formatCurrency(doc.metadata.valor)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center mb-2">
                        <Badge
                          variant="outline"
                          className="bg-background border-border text-muted-foreground"
                        >
                          Cadastros Existentes (Similares)
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        {matchedOriginals.map((orig) => (
                          <div
                            key={orig.id}
                            className="p-3 bg-background rounded-lg border border-border flex justify-between items-center"
                          >
                            <div className="min-w-0 pr-2">
                              <h5 className="font-medium text-white text-sm truncate">
                                {orig.metadata.tipo_imovel} em {orig.metadata.bairro}
                              </h5>
                              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                                Por: {getProfileName(orig.metadata.user_id)}
                              </p>
                            </div>
                            <div className="text-right text-xs text-muted-foreground shrink-0">
                              <div>{orig.metadata.tamanho_imovel}m²</div>
                              <div className="font-medium text-white mt-0.5">
                                {formatCurrency(orig.metadata.valor)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-border">
                    <Button
                      variant="outline"
                      onClick={() => handleAction(doc.id, doc.metadata, 'duplicate')}
                      className="border-red-500/20 text-red-500 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4 mr-2" /> Sinalizar como Duplicado (Excluir)
                    </Button>
                    <Button
                      onClick={() => handleAction(doc.id, doc.metadata, 'unique')}
                      className="bg-green-500/20 text-green-500 hover:bg-green-500/30 border-none"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" /> Confirmar como Único
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
