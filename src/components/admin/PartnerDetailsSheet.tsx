import { useEffect, useState } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Building, MapPin, User, Phone, Mail, Award, Info, Loader2, Home } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface Profile {
  id: string
  full_name?: string
  email?: string
  role: string
  plan: string
  status: string
  avatar_url?: string
  whatsapp_number?: string
  creci?: string
  region?: string
  specialties?: string
  bio?: string
  reputation_score?: number
}

interface Document {
  id: number
  metadata: any
  created_at?: string
}

interface PartnerDetailsSheetProps {
  profile: Profile | null
  onClose: () => void
  onStatusChange?: (id: string, newStatus: string) => void
}

const formatCurrency = (val: number) => {
  if (!val) return 'Sob Consulta'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
}

export function PartnerDetailsSheet({
  profile,
  onClose,
  onStatusChange,
}: PartnerDetailsSheetProps) {
  const [loading, setLoading] = useState(false)
  const [ofertas, setOfertas] = useState<Document[]>([])

  const getAvatarUrl = (url?: string) => {
    if (!url) return undefined
    if (url.startsWith('http') || url.startsWith('data:')) return url
    const cleanUrl = url.startsWith('avatars/') ? url.replace('avatars/', '') : url
    return supabase.storage.from('avatars').getPublicUrl(cleanUrl).data.publicUrl
  }
  const [demandas, setDemandas] = useState<Document[]>([])
  const [status, setStatus] = useState<string>('pending_validation')

  useEffect(() => {
    if (!profile) return

    setStatus(profile.status || 'pending_validation')

    const fetchDocuments = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('documents')
          .select('*')
          .filter('metadata->>user_id', 'eq', profile.id)

        if (error) throw error

        const docs = data || []
        setOfertas(docs.filter((d) => d.metadata?.type === 'oferta'))
        setDemandas(docs.filter((d) => d.metadata?.type === 'demanda'))
      } catch (err) {
        console.error('Error fetching partner documents:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchDocuments()
  }, [profile])

  const handleStatusChange = async (newStatus: string) => {
    if (!profile) return
    const prevStatus = status
    setStatus(newStatus)

    try {
      const updates: any = { status: newStatus }
      if (newStatus === 'active') {
        const { data: userData } = await supabase.auth.getUser()
        updates.validated_by = userData?.user?.id
        updates.validation_date = new Date().toISOString()
      }

      const { error } = await supabase.from('profiles').update(updates).eq('id', profile.id)

      if (error) throw error

      toast.success('Status do parceiro atualizado com sucesso!')
      if (onStatusChange) {
        onStatusChange(profile.id, newStatus)
      }
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Erro ao atualizar o status.')
      setStatus(prevStatus)
    }
  }

  if (!profile) return null

  return (
    <Sheet open={!!profile} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="bg-card border-border w-full sm:max-w-md md:max-w-lg lg:max-w-xl flex flex-col p-0 gap-0">
        <SheetHeader className="p-6 border-b border-border/50 bg-secondary/30">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16 ring-2 ring-primary/20">
              <AvatarImage src={getAvatarUrl(profile.avatar_url)} />
              <AvatarFallback className="bg-secondary text-lg">
                {profile.full_name?.substring(0, 2).toUpperCase() || 'US'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-xl text-white truncate">
                {profile.full_name || 'Sem Nome'}
              </SheetTitle>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Badge
                  variant="outline"
                  className="bg-primary/10 text-primary border-primary/20 text-[10px]"
                >
                  {profile.plan || 'Free'}
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-background border-border text-muted-foreground text-[10px] capitalize"
                >
                  {profile.role}
                </Badge>

                <Select value={status} onValueChange={handleStatusChange}>
                  <SelectTrigger
                    className={cn(
                      'h-6 px-2 py-0 min-w-[120px] text-[10px] font-semibold border focus:ring-0 rounded-full',
                      status === 'active'
                        ? 'bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20'
                        : status === 'pending_validation'
                          ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20 hover:bg-yellow-500/20'
                          : 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20',
                    )}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="pending_validation">Em Verificação</SelectItem>
                    <SelectItem value="rejected">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          <Tabs defaultValue="overview" className="flex-1 flex flex-col w-full h-full">
            <div className="px-6 pt-4 border-b border-border/50">
              <TabsList className="bg-transparent h-auto p-0 gap-6">
                <TabsTrigger
                  value="overview"
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-0 pb-2"
                >
                  Visão Geral
                </TabsTrigger>
                <TabsTrigger
                  value="ofertas"
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-0 pb-2"
                >
                  Ofertas ({ofertas.length})
                </TabsTrigger>
                <TabsTrigger
                  value="demandas"
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-0 pb-2"
                >
                  Demandas ({demandas.length})
                </TabsTrigger>
              </TabsList>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-6">
                <TabsContent value="overview" className="mt-0 space-y-6">
                  <div className="grid gap-4">
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="text-white">{profile.email || 'Não informado'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="text-white">
                        {profile.whatsapp_number || 'Não informado'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Award className="w-4 h-4 text-muted-foreground" />
                      <span className="text-white">CRECI: {profile.creci || 'Não informado'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="text-white">
                        Região: {profile.region || 'Não informado'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                      <Info className="w-4 h-4 text-primary" /> Especialidades
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {profile.specialties ? (
                        profile.specialties.split(',').map((spec, i) => (
                          <Badge key={i} variant="secondary" className="bg-secondary/50">
                            {spec.trim()}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">Não informadas</span>
                      )}
                    </div>
                  </div>

                  {profile.bio && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-white">Sobre</h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap bg-secondary/20 p-4 rounded-lg border border-border/50">
                        {profile.bio}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <Card className="bg-background border-border">
                      <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-1">
                        <span className="text-2xl font-bold text-white">
                          {profile.reputation_score || 0}
                        </span>
                        <span className="text-xs text-muted-foreground uppercase tracking-wider">
                          Reputação
                        </span>
                      </CardContent>
                    </Card>
                    <Card className="bg-background border-border">
                      <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-1">
                        <span className="text-2xl font-bold text-white">
                          {ofertas.length + demandas.length}
                        </span>
                        <span className="text-xs text-muted-foreground uppercase tracking-wider">
                          Oportunidades
                        </span>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="ofertas" className="mt-0 space-y-4">
                  {loading ? (
                    <div className="flex justify-center p-8">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  ) : ofertas.length === 0 ? (
                    <div className="text-center p-8 border border-dashed border-border rounded-lg bg-secondary/10">
                      <Home className="w-8 h-8 text-muted-foreground/50 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">Nenhuma oferta cadastrada.</p>
                    </div>
                  ) : (
                    ofertas.map((doc) => (
                      <Card key={doc.id} className="bg-background border-border shadow-none">
                        <CardContent className="p-4 flex flex-col gap-2">
                          <div className="flex justify-between items-start gap-4">
                            <h5 className="font-medium text-white line-clamp-2">
                              {doc.metadata.tipo_imovel || 'Imóvel'} em{' '}
                              {doc.metadata.bairro ||
                                doc.metadata.endereco ||
                                'Localização não informada'}
                            </h5>
                            <Badge
                              variant="outline"
                              className="shrink-0 bg-primary/5 text-primary border-primary/20"
                            >
                              Oferta
                            </Badge>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground mt-2">
                            <span className="font-semibold text-white bg-secondary px-2 py-1 rounded">
                              {formatCurrency(doc.metadata.valor)}
                            </span>
                            {doc.metadata.tamanho_imovel && (
                              <span className="flex items-center gap-1">
                                <Building className="w-3 h-3" /> {doc.metadata.tamanho_imovel}m²
                              </span>
                            )}
                            {doc.metadata.nome_condominio && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" /> Condomínio{' '}
                                {doc.metadata.nome_condominio}
                              </span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </TabsContent>

                <TabsContent value="demandas" className="mt-0 space-y-4">
                  {loading ? (
                    <div className="flex justify-center p-8">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  ) : demandas.length === 0 ? (
                    <div className="text-center p-8 border border-dashed border-border rounded-lg bg-secondary/10">
                      <User className="w-8 h-8 text-muted-foreground/50 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">Nenhuma demanda cadastrada.</p>
                    </div>
                  ) : (
                    demandas.map((doc) => (
                      <Card key={doc.id} className="bg-background border-border shadow-none">
                        <CardContent className="p-4 flex flex-col gap-2">
                          <div className="flex justify-between items-start gap-4">
                            <h5 className="font-medium text-white line-clamp-2">
                              Busca por {doc.metadata.tipo_imovel || 'Imóvel'} em{' '}
                              {doc.metadata.region ||
                                doc.metadata.bairro ||
                                'Localização não informada'}
                            </h5>
                            <Badge
                              variant="outline"
                              className="shrink-0 bg-blue-500/10 text-blue-400 border-blue-500/20"
                            >
                              Demanda
                            </Badge>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground mt-2">
                            <span className="font-semibold text-white bg-secondary px-2 py-1 rounded">
                              Até {formatCurrency(doc.metadata.valor)}
                            </span>
                            {doc.metadata.urgency && (
                              <span className="capitalize">Urgência: {doc.metadata.urgency}</span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </TabsContent>
              </div>
            </ScrollArea>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  )
}
