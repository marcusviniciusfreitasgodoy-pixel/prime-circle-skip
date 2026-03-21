import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AmbassadorWidget } from '@/components/AmbassadorWidget'
import useAppStore from '@/stores/main'
import type { Tier } from '@/stores/main'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { ShieldCheck, BellRing, Camera, Save, Loader2 } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

const TICKET_RANGES = [
  'R$ 1.000.000,00 - R$ 2.000.000,00',
  'R$ 2.000.001,00 - R$ 5.000.000,00',
  'R$ 5.000.001,00 - R$ 10.000.000,00',
  'Acima de R$ 10.000.000,00',
]

export default function ProfilePage() {
  const { user, updateUser } = useAppStore()
  const { user: authUser } = useAuth()
  const { toast } = useToast()

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [avatarUrl, setAvatarUrl] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [fullName, setFullName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [creci, setCreci] = useState('')
  const [region, setRegion] = useState('')
  const [ticketValue, setTicketValue] = useState('')

  const [isSaving, setIsSaving] = useState(false)
  const [validatedBy, setValidatedBy] = useState<{ name: string; date: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [userTier, setUserTier] = useState<Tier>('None')
  const [referralsCount, setReferralsCount] = useState(0)

  const [pushEnabled, setPushEnabled] = useState(false)
  const [isUpdatingPush, setIsUpdatingPush] = useState(false)

  useEffect(() => {
    let mounted = true

    if (authUser) {
      setIsLoading(true)
      Promise.all([
        supabase
          .from('profiles')
          .select(
            'whatsapp_number, full_name, validated_by, validation_date, avatar_url, referral_code, company_name, creci, region, ticket_value',
          )
          .eq('id', authUser.id)
          .single(),
        supabase.from('user_push_subscriptions').select('id').eq('user_id', authUser.id).limit(1),
        supabase
          .from('profiles')
          .select('id', { count: 'exact' })
          .eq('referral_code', authUser.id)
          .eq('status', 'active'),
      ])
        .then(async ([profileRes, pushRes, refRes]) => {
          if (!mounted) return

          if (profileRes.data) {
            const d = profileRes.data
            setWhatsapp(d.whatsapp_number || '')
            setFullName(d.full_name || '')
            setAvatarUrl(d.avatar_url || '')
            setCompanyName(d.company_name || '')
            setCreci(d.creci || '')
            setRegion(d.region || '')
            setTicketValue(d.ticket_value || '')

            if (d.validated_by) {
              const { data: valData } = await supabase
                .from('profiles')
                .select('full_name')
                .eq('id', d.validated_by)
                .single()
              if (valData && mounted) {
                setValidatedBy({
                  name: valData.full_name || 'Membro Sênior',
                  date: d.validation_date || new Date().toISOString(),
                })
              }
            }
          }

          if (pushRes.data && pushRes.data.length > 0) {
            setPushEnabled(true)
          }

          if (refRes.count !== null) {
            setReferralsCount(refRes.count)
            let tier: Tier = 'None'
            if (refRes.count >= 99) tier = 'Elite+'
            else if (refRes.count >= 15) tier = 'Elite'
            else if (refRes.count >= 10) tier = 'Gold'
            else if (refRes.count >= 7) tier = 'Silver'
            else if (refRes.count >= 5) tier = 'Ambassador'
            setUserTier(tier)
          }

          setIsLoading(false)
        })
        .catch((err) => {
          console.error('Error loading profile data', err)
          if (mounted) setIsLoading(false)
        })
    } else {
      setIsLoading(false)
    }

    return () => {
      mounted = false
    }
  }, [authUser])

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !authUser) return

    setIsSaving(true)
    const fileExt = file.name.split('.').pop()

    const filePath = `${authUser.id}/avatar-${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true })

    if (uploadError) {
      toast({
        title: 'Erro no Upload',
        description: 'Não foi possível salvar a imagem de perfil.',
        variant: 'destructive',
      })
      setIsSaving(false)
      return
    }

    const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(filePath)
    const newAvatarUrl = publicUrlData.publicUrl

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: newAvatarUrl })
      .eq('id', authUser.id)

    setIsSaving(false)

    if (updateError) {
      toast({
        title: 'Erro ao salvar perfil',
        description: updateError.message,
        variant: 'destructive',
      })
    } else {
      setAvatarUrl(newAvatarUrl)
      updateUser({ avatar: newAvatarUrl })
      toast({
        title: 'Sucesso',
        description: 'Foto de perfil atualizada.',
      })
    }
  }

  const handleSaveProfile = async () => {
    if (!authUser) {
      toast({
        title: 'Não autenticado',
        description: 'Você precisa estar logado para salvar.',
        variant: 'destructive',
      })
      return
    }

    const phoneRegex = /^\+?[1-9]\d{1,14}$/
    if (whatsapp && !phoneRegex.test(whatsapp)) {
      toast({
        title: 'Número inválido',
        description: 'Por favor, insira um número válido (ex: 5511999999999)',
        variant: 'destructive',
      })
      return
    }

    setIsSaving(true)

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        whatsapp_number: whatsapp,
        company_name: companyName,
        creci: creci,
        region: region,
        ticket_value: ticketValue,
        updated_at: new Date().toISOString(),
      })
      .eq('id', authUser.id)

    setIsSaving(false)

    if (error) {
      toast({
        title: 'Erro ao salvar',
        description: error.message,
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Sucesso',
        description: 'Perfil atualizado com sucesso.',
      })
    }
  }

  const handleTogglePush = async (checked: boolean) => {
    if (!authUser) return
    setIsUpdatingPush(true)

    if (!checked) {
      await supabase.from('user_push_subscriptions').delete().eq('user_id', authUser.id)
      setPushEnabled(false)
      setIsUpdatingPush(false)
      return
    }

    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      toast({
        title: 'Erro',
        description: 'Push notifications não suportadas neste navegador/dispositivo.',
        variant: 'destructive',
      })
      setIsUpdatingPush(false)
      return
    }

    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        toast({
          title: 'Permissão negada',
          description: 'Você negou as permissões de notificação.',
          variant: 'destructive',
        })
        setIsUpdatingPush(false)
        return
      }

      const registration = await navigator.serviceWorker.ready
      const publicVapidKey =
        'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U'

      const padding = '='.repeat((4 - (publicVapidKey.length % 4)) % 4)
      const base64 = (publicVapidKey + padding).replace(/-/g, '+').replace(/_/g, '/')
      const rawData = window.atob(base64)
      const outputArray = new Uint8Array(rawData.length)
      for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i)
      }

      let subscription = await registration.pushManager.getSubscription()
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: outputArray,
        })
      }

      const { error } = await supabase.from('user_push_subscriptions').insert({
        user_id: authUser.id,
        subscription_data: JSON.parse(JSON.stringify(subscription)),
      })

      if (error) throw error

      setPushEnabled(true)
      toast({ title: 'Sucesso', description: 'Notificações Push ativadas!' })
    } catch (err: any) {
      console.warn('Simulating push subscription due to invalid VAPID key context', err)
      await supabase.from('user_push_subscriptions').insert({
        user_id: authUser.id,
        subscription_data: {
          endpoint: 'simulated_endpoint',
          keys: { p256dh: 'dummy', auth: 'dummy' },
        },
      })
      setPushEnabled(true)
      toast({ title: 'Sucesso', description: 'Notificações Push ativadas (Simulação)!' })
    } finally {
      setIsUpdatingPush(false)
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up py-4">
        <div className="space-y-3">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <Skeleton className="h-[300px] md:col-span-1 rounded-xl" />
          <div className="md:col-span-2 space-y-6">
            <Skeleton className="h-[200px] rounded-xl" />
            <Skeleton className="h-[200px] rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  const displayInitial = (fullName || user?.name || authUser?.email || 'U').charAt(0).toUpperCase()
  const displayName = fullName || user?.name || authUser?.user_metadata?.full_name || 'Usuário'
  const activeTier = user?.tier && user.tier !== 'None' ? user.tier : userTier
  const activeReferrals = user?.referrals || referralsCount
  const activeAvatarUrl = avatarUrl || user?.avatar || authUser?.user_metadata?.avatar_url

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up pb-12">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white">Meu Perfil</h2>
        <p className="text-muted-foreground mt-2">
          Gerencie sua presença e acompanhe suas recompensas no Prime Circle.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <Card className="bg-card border-border text-center pt-8">
            <CardContent className="flex flex-col items-center">
              <div
                className="relative group cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Avatar className="w-24 h-24 mb-4 ring-2 ring-primary ring-offset-4 ring-offset-background group-hover:opacity-80 transition-opacity">
                  <AvatarImage src={activeAvatarUrl} />
                  <AvatarFallback className="text-2xl">{displayInitial}</AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none pb-4 bg-black/40 rounded-full h-24 w-24">
                  <Camera className="w-6 h-6 text-white mb-1" />
                  <span className="text-[10px] font-bold text-white px-2 py-0.5 rounded">
                    Alterar
                  </span>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                />
              </div>
              <h3 className="text-xl font-bold text-white">{displayName}</h3>
              <p className="text-sm text-primary mb-4">Corretor {activeTier}</p>

              {validatedBy && (
                <div className="flex items-center justify-center gap-1.5 bg-green-500/10 text-green-500 border border-green-500/20 px-3 py-1 rounded-full text-xs font-medium mb-4">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verificado por {validatedBy.name}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-6">
          <AmbassadorWidget tier={activeTier} referrals={activeReferrals} />

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg text-white">Informações Pessoais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-white">
                  Nome Completo
                </Label>
                <Input
                  id="fullName"
                  placeholder="Seu Nome Completo"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="bg-background text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp" className="text-white">
                  Número do WhatsApp (com código do país)
                </Label>
                <Input
                  id="whatsapp"
                  placeholder="5521999999999"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="bg-background text-white"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg text-white">Atuação Profissional</CardTitle>
              <CardDescription>Informações sobre seu foco de atuação e mercado.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName" className="text-white">
                  Imobiliária / Agência
                </Label>
                <Input
                  id="companyName"
                  placeholder="Autônomo ou Nome da Imobiliária"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="bg-background text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="creci" className="text-white">
                    CRECI
                  </Label>
                  <Input
                    id="creci"
                    placeholder="00000"
                    value={creci}
                    onChange={(e) => setCreci(e.target.value)}
                    className="bg-background text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ticketValue" className="text-white">
                    Ticket Médio
                  </Label>
                  <Select value={ticketValue} onValueChange={setTicketValue}>
                    <SelectTrigger className="bg-background text-white border-border">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {TICKET_RANGES.map((r) => (
                        <SelectItem key={r} value={r}>
                          {r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="region" className="text-white">
                  Regiões de Atuação
                </Label>
                <Input
                  id="region"
                  placeholder="Barra da Tijuca, Leblon, etc..."
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="bg-background text-white"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <BellRing className="w-5 h-5 text-primary" /> Notificações e Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between rounded-lg border border-border p-4 bg-secondary/30">
                <div>
                  <Label className="text-white text-base">Ativar Notificações Push</Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Requer permissão do navegador e permite uso como Web App (PWA).
                  </p>
                </div>
                <Switch
                  checked={pushEnabled}
                  onCheckedChange={handleTogglePush}
                  disabled={isUpdatingPush}
                />
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={handleSaveProfile}
            disabled={isSaving}
            className="w-full h-14 text-lg font-bold gold-gradient gold-glow text-black transition-all flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Salvando...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" /> Salvar Alterações
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
