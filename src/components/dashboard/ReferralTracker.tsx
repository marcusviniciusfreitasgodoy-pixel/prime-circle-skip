import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Copy,
  Share2,
  Crown,
  Activity,
  UserCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Save,
} from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

export function ReferralTracker({
  userId,
  referralLink,
}: {
  userId: string
  referralLink: string
}) {
  const { toast } = useToast()
  const [clicksCount, setClicksCount] = useState(0)
  const [registrationsCount, setRegistrationsCount] = useState(0)
  const [myCircle, setMyCircle] = useState<any[]>([])
  const [notificationLogs, setNotificationLogs] = useState<any[]>([])
  const [inviteMessage, setInviteMessage] = useState('')
  const [originalMessage, setOriginalMessage] = useState('')
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!userId) return
    let mounted = true

    const fetchData = async () => {
      try {
        const { count, error } = await supabase
          .from('referral_clicks')
          .select('id', { count: 'exact' })
          .eq('referrer_id', userId)
          .limit(1)

        if (error) {
          console.warn('Error fetching clicks count:', error)
        } else if (count !== null && mounted) {
          setClicksCount(count)
        }
      } catch (err) {
        console.warn('Exception fetching referral clicks count handled safely:', err)
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, status, created_at, avatar_url')
          .eq('referred_by_id', userId)
          .order('created_at', { ascending: false })

        if (error) {
          console.warn('Error fetching referrals:', error)
        } else if (data && mounted) {
          setMyCircle(data)
          setRegistrationsCount(data.length)
        }
      } catch (err) {
        console.warn('Exception fetching referrals handled safely:', err)
      }

      try {
        const { data: logs, error: logsError } = await supabase
          .from('notification_logs')
          .select('id, created_at, message_body, status')
          .eq('user_id', userId)
          .eq('channel', 'whatsapp')
          .ilike('message_body', '%acabou de se cadastrar%')

        if (!logsError && logs && mounted) {
          setNotificationLogs(logs)
        }
      } catch (err) {
        console.warn('Error fetching logs', err)
      }

      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single()

        if (mounted) {
          const customMsg = (profile as any)?.custom_referral_message
          if (customMsg) {
            setInviteMessage(customMsg)
            setOriginalMessage(customMsg)
          } else if (referralLink) {
            const defaultMsg = `[Nome], acabei de lançar a *Prime Circle* e selecionei você pessoalmente para ser um dos *Membros Fundadores*.\n\nÉ uma rede privada exclusiva para corretores de alto padrão na *Barra e Recreio*, feita para profissionalizar nossas parcerias e eliminar de vez o caos e a informalidade dos grupos de WhatsApp.\n\nAo entrar, você terá acesso imediato à nossa *Área de Membros*, uma plataforma completa onde você pode:\n\n— *Gerenciar sua carteira:* Publique seus imóveis para que outros membros encontrem compradores qualificados rapidamente.\n— *Radar de Demandas:* Cadastre o que seus clientes buscam e receba alertas automáticos de match na rede.\n— *Acesso Off-Market:* Visualize oportunidades exclusivas que ainda não chegaram aos portais.\n— *Painel de Conexões:* Acompanhe o status das suas parcerias em um ambiente profissional.\n\nDentro da sua área logada, você também encontrará seu *Link de Embaixador*. Como a rede cresce por curadoria, você poderá usá-lo para convidar os corretores da sua total confiança, fortalendo seu círculo e ganhando benefícios por cada indicação aprovada.\n\n*Isso não é apenas mais um grupo; é a oportunidade de construirmos juntos uma comunidade selecionada, com regras claras e foco total em fechar negócios de alto nível.* É o novo padrão de colaboração para quem opera no topo do mercado.\n\nAs vagas de Fundador são limitadas para garantirmos essa qualidade desde o início.\n\nGaranta seu lugar e acesse as ferramentas aqui:\n${referralLink}`

            setInviteMessage(defaultMsg)
            setOriginalMessage(defaultMsg)
          }
        }
      } catch (err) {
        console.warn('Error fetching custom message', err)
      }
    }

    fetchData()

    return () => {
      mounted = false
    }
  }, [userId, referralLink])

  const handleSaveMessage = async () => {
    setIsSaving(true)
    const { error } = await supabase
      .from('profiles')
      .update({ custom_referral_message: inviteMessage } as any)
      .eq('id', userId)

    setIsSaving(false)
    if (!error) {
      toast({ title: 'Sucesso', description: 'Sua mensagem personalizada foi salva!' })
      setOriginalMessage(inviteMessage)
      setHasUnsavedChanges(false)
    } else {
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar a mensagem.',
        variant: 'destructive',
      })
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteMessage)
    toast({ title: 'Copiado!', description: 'Mensagem copiada para a área de transferência.' })
  }

  const handleShare = () => {
    const encodedText = encodeURIComponent(inviteMessage)
    window.open(`https://wa.me/?text=${encodedText}`, '_blank')
  }

  return (
    <div className="space-y-6">
      <Card className="bg-card border-primary/30 shadow-[0_0_30px_rgba(201,168,76,0.1)] relative overflow-hidden h-auto flex flex-col">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />
        <CardHeader className="p-5 sm:p-6 pb-3 sm:pb-6 relative z-10">
          <CardTitle className="text-xl sm:text-2xl text-primary flex items-center gap-2">
            <Crown className="w-5 h-5 sm:w-6 sm:h-6" /> Indique Parceiros
          </CardTitle>
          <CardDescription className="text-sm sm:text-base text-muted-foreground max-w-2xl mt-1.5 leading-relaxed">
            Convide corretores alinhados à política 50/50 e receba meses grátis. Personalize sua
            mensagem abaixo, salve-a como padrão e compartilhe com sua rede.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0 relative z-10 flex-1 flex flex-col">
          <div className="space-y-4 flex-1 flex flex-col w-full h-auto">
            <Textarea
              value={inviteMessage}
              onChange={(e) => {
                setInviteMessage(e.target.value)
                setHasUnsavedChanges(e.target.value !== originalMessage)
              }}
              rows={12}
              className="bg-background/80 border-primary/20 text-muted-foreground text-sm sm:text-base min-h-[300px] focus-visible:ring-primary leading-relaxed p-4 resize-y w-full flex-1"
            />
            <div className="flex flex-col xl:flex-row gap-3 w-full shrink-0">
              <Button
                onClick={handleSaveMessage}
                disabled={!hasUnsavedChanges || isSaving}
                variant="outline"
                className={cn(
                  'h-12 transition-colors text-sm sm:text-base font-medium w-full xl:flex-1',
                  hasUnsavedChanges
                    ? 'border-green-500/50 text-green-500 bg-green-500/10 hover:bg-green-500/20'
                    : 'border-border text-muted-foreground',
                )}
              >
                <Save className="w-4 h-4 mr-2 shrink-0" />{' '}
                {isSaving ? 'Salvando...' : 'Salvar Padrão'}
              </Button>
              <Button
                onClick={handleCopy}
                variant="outline"
                className="border-primary/50 text-primary hover:bg-primary/10 h-12 text-sm sm:text-base font-medium w-full xl:flex-1"
              >
                <Copy className="w-4 h-4 mr-2 shrink-0" /> Copiar Mensagem
              </Button>
              <Button
                onClick={handleShare}
                className="gold-gradient text-black font-bold h-12 shadow-[0_0_15px_rgba(201,168,76,0.2)] text-sm sm:text-base w-full xl:flex-[1.5]"
              >
                <Share2 className="w-5 h-5 mr-2 shrink-0" /> Enviar WhatsApp
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-4 sm:p-6">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Cliques no Link
            </CardTitle>
            <Activity className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="text-2xl font-bold text-white">{clicksCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Acessos registrados</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-4 sm:p-6">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Cadastros Realizados
            </CardTitle>
            <UserCheck className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="text-2xl font-bold text-white">{registrationsCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Parceiros no seu círculo</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardHeader className="p-4 sm:p-6 pb-4">
          <CardTitle className="text-lg text-white">Meu Círculo</CardTitle>
          <CardDescription>Acompanhe o status dos parceiros que usaram seu código.</CardDescription>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 sm:pt-0">
          {myCircle.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50 hover:bg-transparent">
                    <TableHead className="w-[50px] pl-4 sm:pl-2"></TableHead>
                    <TableHead className="text-muted-foreground font-semibold min-w-[120px]">
                      Nome
                    </TableHead>
                    <TableHead className="text-muted-foreground font-semibold">Status</TableHead>
                    <TableHead className="text-muted-foreground font-semibold">
                      Notificação
                    </TableHead>
                    <TableHead className="text-muted-foreground font-semibold text-right pr-4 sm:pr-2">
                      Data
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myCircle.map((partner) => {
                    const partnerName = partner.full_name || 'um novo corretor'
                    const log = notificationLogs.find((l) =>
                      l.message_body.includes(`*${partnerName}*`),
                    )

                    return (
                      <TableRow key={partner.id} className="border-border/50 hover:bg-secondary/30">
                        <TableCell className="pl-4 sm:pl-2">
                          <Avatar className="w-8 h-8 border border-border bg-background">
                            <AvatarImage src={partner.avatar_url} />
                            <AvatarFallback className="bg-secondary text-muted-foreground text-xs">
                              {partner.full_name?.substring(0, 2).toUpperCase() || 'US'}
                            </AvatarFallback>
                          </Avatar>
                        </TableCell>
                        <TableCell className="font-medium text-white">
                          {partner.full_name || 'Usuário'}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn(
                              partner.status === 'active'
                                ? 'bg-green-500/10 text-green-500 border-green-500/20'
                                : partner.status === 'pending_validation'
                                  ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                                  : 'bg-secondary text-muted-foreground',
                            )}
                          >
                            {partner.status === 'active'
                              ? 'Ativo'
                              : partner.status === 'pending_validation'
                                ? 'Pendente'
                                : partner.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {log ? (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex items-center gap-1.5 cursor-help">
                                    {log.status === 'success' ? (
                                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                                    ) : (
                                      <XCircle className="w-4 h-4 text-red-500" />
                                    )}
                                    <span className="text-xs text-muted-foreground">
                                      {log.status === 'success' ? 'Enviada' : 'Falha'}
                                    </span>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="text-xs">
                                    Notificação de indicação:{' '}
                                    {new Date(log.created_at).toLocaleString('pt-BR')}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ) : (
                            <div className="flex items-center gap-1.5 text-muted-foreground/50">
                              <Clock className="w-4 h-4" />
                              <span className="text-xs">Aguardando</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm text-right pr-4 sm:pr-2">
                          {new Date(partner.created_at || Date.now()).toLocaleDateString('pt-BR')}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center px-4 bg-secondary/20 rounded-lg border border-dashed border-border/50 mx-4 sm:mx-0 mb-4 sm:mb-0">
              <UserCheck className="w-8 h-8 text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">
                Você ainda não possui parceiros no seu círculo.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Compartilhe seu link para começar a construir sua rede.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
