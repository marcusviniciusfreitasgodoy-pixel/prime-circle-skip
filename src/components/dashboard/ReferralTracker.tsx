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
    }

    fetchData()

    return () => {
      mounted = false
    }
  }, [userId])

  useEffect(() => {
    if (referralLink && !inviteMessage) {
      setInviteMessage(
        `Olá! Faço parte do Prime Circle, uma rede privada de liquidez imobiliária para corretores de alto padrão. Gostaria de te convidar para o meu círculo. Cadastre-se por este link para ter prioridade na análise e garantir sua vaga como membro Founder, com isenção total de cobrança pelos primeiros 6 meses:\n\n${referralLink}`,
      )
    }
  }, [referralLink])

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
      <Card className="bg-card border-primary/30 shadow-[0_0_30px_rgba(201,168,76,0.1)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />
        <CardHeader>
          <CardTitle className="text-2xl text-primary flex items-center gap-2">
            <Crown className="w-6 h-6" /> Indique Parceiros
          </CardTitle>
          <CardDescription className="text-base text-muted-foreground max-w-2xl">
            Convide corretores alinhados à política 50/50 e receba meses grátis. Personalize sua
            mensagem abaixo e compartilhe com sua rede.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 relative z-10">
            <Textarea
              value={inviteMessage}
              onChange={(e) => setInviteMessage(e.target.value)}
              className="bg-background/80 border-primary/20 text-muted-foreground min-h-[140px] focus-visible:ring-primary leading-relaxed"
            />
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={handleCopy}
                variant="outline"
                className="flex-1 border-primary/50 text-primary hover:bg-primary/10 h-12"
              >
                <Copy className="w-4 h-4 mr-2" /> Copiar Mensagem
              </Button>
              <Button
                onClick={handleShare}
                className="flex-1 gold-gradient text-black font-bold h-12 shadow-[0_0_15px_rgba(201,168,76,0.2)]"
              >
                <Share2 className="w-5 h-5 mr-2" /> Compartilhar no WhatsApp
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Cliques no Link
            </CardTitle>
            <Activity className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{clicksCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Acessos registrados</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Cadastros Realizados
            </CardTitle>
            <UserCheck className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{registrationsCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Parceiros no seu círculo</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg text-white">Meu Círculo</CardTitle>
          <CardDescription>Acompanhe o status dos parceiros que usaram seu código.</CardDescription>
        </CardHeader>
        <CardContent>
          {myCircle.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50 hover:bg-transparent">
                    <TableHead className="w-[50px]"></TableHead>
                    <TableHead className="text-muted-foreground font-semibold">Nome</TableHead>
                    <TableHead className="text-muted-foreground font-semibold">Status</TableHead>
                    <TableHead className="text-muted-foreground font-semibold">
                      Notificação
                    </TableHead>
                    <TableHead className="text-muted-foreground font-semibold text-right">
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
                        <TableCell>
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
                        <TableCell className="text-muted-foreground text-sm text-right">
                          {new Date(partner.created_at || Date.now()).toLocaleDateString('pt-BR')}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center px-4 bg-secondary/20 rounded-lg border border-dashed border-border/50">
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
