import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { GitMerge, ChevronRight, Star } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { ReviewDialog } from '@/components/dashboard/ReviewDialog'

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.305-.885-.653-1.482-1.459-1.656-1.758-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
  </svg>
)

const STATUS_STAGES = ['match', 'contact', 'visit', 'proposal', 'closed'] as const
const STAGE_LABELS = ['Novo', 'Contato', 'Visita', 'Proposta', 'Fechado'] as const

export default function MatchesListPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [partnerships, setPartnerships] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadPartnerships = async () => {
    if (!user) return
    const { data } = await supabase
      .from('partnerships')
      .select(`
        id,
        status,
        created_at,
        property:documents!partnerships_property_id_fkey(id, metadata),
        demand:documents!partnerships_demand_id_fkey(id, metadata),
        broker_property:profiles!partnerships_broker_property_id_fkey(id, full_name, whatsapp_number),
        broker_demand:profiles!partnerships_broker_demand_id_fkey(id, full_name, whatsapp_number)
      `)
      .or(`broker_property_id.eq.${user.id},broker_demand_id.eq.${user.id}`)
      .neq('status', 'cancelled')
      .order('created_at', { ascending: false })

    if (data) {
      setPartnerships(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadPartnerships()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const getStageIndex = (status: string) => {
    if (status === 'aguardando_vgv' || status === 'closed') return 4
    const idx = STATUS_STAGES.indexOf(status as any)
    return idx !== -1 ? idx : 0
  }

  const advanceMatch = async (id: string, currentStatus: string) => {
    if (!user) return
    const nextStatusMap: Record<string, string> = {
      contact: 'visit',
      visit: 'proposal',
      proposal: 'closed',
    }

    if (currentStatus === 'proposal' || currentStatus === 'aguardando_vgv') {
      navigate(`/matches/${id}/close`)
      return
    }

    const nextStatus = nextStatusMap[currentStatus]
    if (nextStatus) {
      const { error } = await supabase
        .from('partnerships')
        .update({
          status: nextStatus,
          last_interaction_at: new Date().toISOString(),
          last_updated_by: user.id,
        })
        .eq('id', id)

      if (!error) {
        setPartnerships((prev) => prev.map((p) => (p.id === id ? { ...p, status: nextStatus } : p)))
        toast.success(`Conexão avançou para ${STAGE_LABELS[getStageIndex(nextStatus)]}`)
      } else {
        toast.error('Erro ao avançar status')
      }
    }
  }

  const handleWhatsAppClick = async (match: any) => {
    if (!user) return
    const isPropertyOwner = match.broker_property?.id === user.id
    const me = isPropertyOwner ? match.broker_property : match.broker_demand
    const partner = isPropertyOwner ? match.broker_demand : match.broker_property

    const propertyTitle = match.property?.metadata?.tipo_imovel || 'Imóvel'
    const propertyBairro = match.property?.metadata?.bairro
      ? ` em ${match.property.metadata.bairro}`
      : ''
    const fullPropertyTitle = `${propertyTitle}${propertyBairro}`
    const myName = me?.full_name ? me.full_name.split(' ')[0] : 'Corretor'

    const phone = partner?.whatsapp_number?.replace(/\D/g, '')
    if (!phone) {
      toast.error('O parceiro não possui um número de WhatsApp cadastrado.')
      return
    }

    const text = `Olá! Sou o ${myName}, vi que temos um match na Prime Circle para o imóvel ${fullPropertyTitle}. Vamos conversar?`

    if (match.status === 'match') {
      const { error } = await supabase
        .from('partnerships')
        .update({
          status: 'contact',
          last_interaction_at: new Date().toISOString(),
          last_updated_by: user.id,
        })
        .eq('id', match.id)

      if (!error) {
        setPartnerships((prev) =>
          prev.map((p) => (p.id === match.id ? { ...p, status: 'contact' } : p)),
        )
        toast.success('Status atualizado para Contato')
      }
    }

    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank')
  }

  const counts = {
    match: partnerships.filter((p) => p.status === 'match').length,
    contact: partnerships.filter((p) => p.status === 'contact').length,
    visit: partnerships.filter((p) => p.status === 'visit').length,
    proposal: partnerships.filter((p) => p.status === 'proposal').length,
    closed: partnerships.filter((p) => p.status === 'closed' || p.status === 'aguardando_vgv')
      .length,
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Minhas Conexões</h2>
          <p className="text-muted-foreground text-sm">
            Acompanhe o andamento das suas parcerias e matches.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-1">
            <span className="text-3xl font-bold text-white">{counts.match}</span>
            <span className="text-xs text-muted-foreground uppercase font-semibold">Novos</span>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-1">
            <span className="text-3xl font-bold text-white">{counts.contact}</span>
            <span className="text-xs text-muted-foreground uppercase font-semibold">Contato</span>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-1">
            <span className="text-3xl font-bold text-white">{counts.visit}</span>
            <span className="text-xs text-muted-foreground uppercase font-semibold">Visitas</span>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-1">
            <span className="text-3xl font-bold text-white">{counts.proposal}</span>
            <span className="text-xs text-muted-foreground uppercase font-semibold">Propostas</span>
          </CardContent>
        </Card>
        <Card className="bg-card border-border bg-gradient-to-br from-primary/10 to-transparent">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-1">
            <span className="text-3xl font-bold text-primary">{counts.closed}</span>
            <span className="text-xs text-primary/80 uppercase font-semibold">Fechados</span>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg text-white">Funil de Negócios de Conexões</CardTitle>
          <CardDescription>
            Fluxo de validação obrigatório até o fechamento.
            {counts.match > 0 && (
              <span className="block mt-2 font-medium text-primary">
                Você tem {counts.match} {counts.match === 1 ? 'novo match' : 'novos matches'}.
                Clique no botão de WhatsApp para iniciar a parceria.
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {partnerships.map((match) => {
                const propertyTitle = match.property?.metadata?.tipo_imovel || 'Imóvel'
                const demandTitle = match.demand?.metadata?.tipo_imovel || 'Demanda'

                const isPropertyOwner = match.broker_property?.id === user?.id
                const partner = isPropertyOwner ? match.broker_demand : match.broker_property
                const partnerName = partner?.full_name || 'Parceiro'

                const currentIdx = getStageIndex(match.status)

                return (
                  <div key={match.id} className="p-4 bg-background rounded-lg border border-border">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-white font-medium flex items-center gap-2">
                            {demandTitle} <span className="text-muted-foreground">↔</span>{' '}
                            {propertyTitle}
                          </p>
                          {match.status === 'match' && (
                            <Badge className="bg-primary/20 text-primary border-primary/30 hover:bg-primary/30 font-semibold shadow-[0_0_10px_rgba(201,168,76,0.2)]">
                              Novo
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Parceiro: <span className="text-foreground">{partnerName}</span> • ID:{' '}
                          {match.id.substring(0, 8)}
                        </p>
                      </div>

                      <div className="w-full md:w-auto flex justify-end">
                        {match.status === 'match' ? (
                          <Button
                            size="sm"
                            className="bg-[#25D366] hover:bg-[#1DA851] text-white border-none font-medium shadow-md shadow-[#25D366]/20 transition-all duration-300 w-full md:w-auto"
                            onClick={() => handleWhatsAppClick(match)}
                          >
                            <WhatsAppIcon className="w-4 h-4 mr-2" />
                            Chamar no WhatsApp
                          </Button>
                        ) : match.status !== 'closed' && match.status !== 'aguardando_vgv' ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-primary/50 text-primary hover:bg-primary/10 w-full md:w-auto"
                            onClick={() => advanceMatch(match.id, match.status)}
                          >
                            {match.status === 'proposal'
                              ? 'Registrar Fechamento'
                              : 'Avançar Status'}
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        ) : (
                          <div className="flex gap-2 w-full md:w-auto">
                            <Badge className="bg-green-500/20 text-green-500 border-none hover:bg-green-500/30 px-3 py-1 flex items-center justify-center whitespace-nowrap">
                              Fechamento Validado
                            </Badge>
                            {partner?.id && (
                              <ReviewDialog partnerId={partner.id} partnerName={partnerName}>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-primary/50 text-primary hover:bg-primary/10 whitespace-nowrap"
                                >
                                  <Star className="w-3.5 h-3.5 mr-1" /> Avaliar
                                </Button>
                              </ReviewDialog>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center w-full justify-between mt-8 relative">
                      <div className="absolute top-1/2 left-0 w-full h-0.5 bg-secondary -translate-y-1/2 z-0" />
                      <div
                        className="absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2 z-0 transition-all duration-500"
                        style={{ width: `${(currentIdx / (STAGE_LABELS.length - 1)) * 100}%` }}
                      />

                      {STAGE_LABELS.map((stage, i) => (
                        <div key={stage} className="relative z-10 flex flex-col items-center gap-2">
                          <div
                            className={`w-4 h-4 rounded-full border-2 transition-colors ${i <= currentIdx ? 'bg-primary border-primary' : 'bg-background border-border'} ${i === currentIdx ? 'shadow-[0_0_10px_rgba(201,168,76,0.5)] scale-125' : ''}`}
                          />
                          <span
                            className={`text-[10px] uppercase font-bold tracking-wider absolute top-6 whitespace-nowrap ${i <= currentIdx ? 'text-white' : 'text-muted-foreground'}`}
                          >
                            {stage}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="h-4" />
                  </div>
                )
              })}

              {partnerships.length === 0 && (
                <div className="flex flex-col items-center justify-center p-12 bg-card/50 rounded-xl border border-dashed border-border text-center mt-4">
                  <GitMerge className="w-12 h-12 text-muted-foreground/50 mb-4" />
                  <p className="text-lg font-medium text-white mb-2">Nenhuma conexão ativa</p>
                  <p className="text-muted-foreground text-sm max-w-sm mb-6">
                    Você ainda não possui matches em andamento. Continue publicando demandas e
                    imóveis para gerar parcerias.
                  </p>
                  <Button
                    variant="outline"
                    className="border-border hover:bg-secondary text-muted-foreground"
                    onClick={() => navigate('/dashboard')}
                  >
                    Voltar ao Dashboard
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
