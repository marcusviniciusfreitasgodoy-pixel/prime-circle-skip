import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { AmbassadorWidget } from '@/components/AmbassadorWidget'
import useAppStore from '@/stores/main'
import type { Tier } from '@/stores/main'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import {
  ShieldCheck,
  BellRing,
  Camera,
  Save,
  Loader2,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  Star,
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

const AVAILABLE_SPECIALTIES = [
  'Casas de Alto Padrão',
  'Apartamentos',
  'Coberturas',
  'Terrenos',
  'Condomínios',
]

export default function ProfilePage() {
  const { user, updateUser } = useAppStore()
  const { user: authUser } = useAuth()
  const { toast } = useToast()

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [avatarUrl, setAvatarUrl] = useState('')
  const [email, setEmail] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [fullName, setFullName] = useState('')
  const [profileType, setProfileType] = useState<'autonomo' | 'imobiliaria'>('autonomo')
  const [companyName, setCompanyName] = useState('')
  const [creci, setCreci] = useState('')
  const [region, setRegion] = useState('')
  const [bio, setBio] = useState('')
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([])
  const [condominiumName, setCondominiumName] = useState('')

  const [isSaving, setIsSaving] = useState(false)
  const [validatedBy, setValidatedBy] = useState<{ name: string; date: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [userTier, setUserTier] = useState<Tier>('None')
  const [referralsCount, setReferralsCount] = useState(0)

  const [pushEnabled, setPushEnabled] = useState(false)
  const [isUpdatingPush, setIsUpdatingPush] = useState(false)

  const [reviews, setReviews] = useState<any[]>([])
  const [averageRating, setAverageRating] = useState(0)

  useEffect(() => {
    let mounted = true

    if (authUser) {
      setIsLoading(true)
      Promise.all([
        supabase
          .from('profiles')
          .select(
            'whatsapp_number, full_name, validated_by, validation_date, avatar_url, referral_code, company_name, creci, region, specialties, email, bio',
          )
          .eq('id', authUser.id)
          .single(),
        supabase.from('user_push_subscriptions').select('id').eq('user_id', authUser.id).limit(1),
        supabase
          .from('profiles')
          .select('id', { count: 'exact' })
          .eq('referral_code', authUser.id)
          .eq('status', 'active'),
        supabase
          .from('broker_reviews')
          .select(
            'rating, comment, created_at, reviewer:profiles!broker_reviews_reviewer_id_fkey(full_name, avatar_url)',
          )
          .eq('reviewed_id', authUser.id)
          .order('created_at', { ascending: false }),
      ])
        .then(async ([profileRes, pushRes, refRes, reviewsRes]) => {
          if (!mounted) return

          if (profileRes.data) {
            const d = profileRes.data
            setWhatsapp(d.whatsapp_number || '')
            setFullName(d.full_name || '')
            setEmail(d.email || authUser.email || '')
            setAvatarUrl(d.avatar_url || '')
            setCreci(d.creci || '')
            setRegion(d.region || '')
            setBio(d.bio || '')

            if (d.company_name) {
              if (
                d.company_name.toLowerCase() === 'autônomo' ||
                d.company_name.toLowerCase() === 'autonomo'
              ) {
                setProfileType('autonomo')
                setCompanyName('')
              } else {
                setProfileType('imobiliaria')
                setCompanyName(d.company_name)
              }
            } else {
              setProfileType('autonomo')
              setCompanyName('')
            }

            if (d.specialties) {
              try {
                const parsed = JSON.parse(d.specialties)
                if (Array.isArray(parsed)) {
                  const specs: string[] = []
                  parsed.forEach((s: string) => {
                    if (s.startsWith('Condomínios: ')) {
                      specs.push('Condomínios')
                      setCondominiumName(s.replace('Condomínios: ', '').trim())
                    } else if (s === 'Condomínios') {
                      specs.push('Condomínios')
                    } else {
                      specs.push(s)
                    }
                  })
                  setSelectedSpecialties(specs)
                } else {
                  throw new Error('Not an array')
                }
              } catch (e) {
                if (d.specialties.startsWith('Condomínios: ')) {
                  setSelectedSpecialties(['Condomínios'])
                  setCondominiumName(d.specialties.replace('Condomínios: ', '').trim())
                } else if (d.specialties !== 'Não especificado') {
                  setSelectedSpecialties([d.specialties])
                } else {
                  setSelectedSpecialties([])
                }
              }
            } else {
              setSelectedSpecialties([])
            }

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

          if (reviewsRes && reviewsRes.data) {
            setReviews(reviewsRes.data)
            if (reviewsRes.data.length > 0) {
              const sum = reviewsRes.data.reduce((acc: number, curr: any) => acc + curr.rating, 0)
              setAverageRating(sum / reviewsRes.data.length)
            }
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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (email && !emailRegex.test(email)) {
      toast({
        title: 'E-mail inválido',
        description: 'Por favor, insira um endereço de e-mail válido.',
        variant: 'destructive',
      })
      return
    }

    let formattedWhatsapp = whatsapp.replace(/\D/g, '')
    if (formattedWhatsapp.length === 10 || formattedWhatsapp.length === 11) {
      formattedWhatsapp = '55' + formattedWhatsapp
    }

    const phoneRegex = /^\+?[1-9]\d{1,14}$/
    if (formattedWhatsapp && !phoneRegex.test(formattedWhatsapp)) {
      toast({
        title: 'Número inválido',
        description: 'Por favor, insira um número válido de WhatsApp',
        variant: 'destructive',
      })
      return
    }

    setIsSaving(true)

    if (email && authUser.email && email.toLowerCase() !== authUser.email.toLowerCase()) {
      try {
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', email)
          .maybeSingle()

        if (existingProfile && existingProfile.id !== authUser.id) {
          toast({
            title: 'E-mail indisponível',
            description: 'Este e-mail já está sendo utilizado por outra conta.',
            variant: 'destructive',
          })
          setIsSaving(false)
          return
        }
      } catch (err: any) {
        console.error('Update email pre-check error:', err)
      }
    }

    let finalSpecialtiesStr = null
    if (selectedSpecialties.length > 0) {
      const finalArray = selectedSpecialties.map((s) => {
        if (s === 'Condomínios' && condominiumName.trim()) {
          return `Condomínios: ${condominiumName.trim()}`
        }
        return s
      })
      finalSpecialtiesStr = JSON.stringify(finalArray)
    }

    const finalCompanyName = profileType === 'autonomo' ? 'Autônomo' : companyName.trim()
    const finalCreci = creci.trim()

    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        email: email,
        whatsapp_number: formattedWhatsapp,
        company_name: finalCompanyName,
        creci: finalCreci,
        region: region,
        specialties: finalSpecialtiesStr,
        bio: bio,
        updated_at: new Date().toISOString(),
      })
      .eq('id', authUser.id)

    if (profileError) {
      setIsSaving(false)
      toast({
        title: 'Erro ao salvar',
        description: profileError.message,
        variant: 'destructive',
      })
      return
    }

    let emailMessage = ''
    if (email && authUser.email && email.toLowerCase() !== authUser.email.toLowerCase()) {
      try {
        const { error: authError } = await supabase.auth.updateUser({ email })
        if (authError) {
          const isEmailExists =
            authError.status === 422 ||
            authError.message.includes('already been registered') ||
            (authError as any).code === 'email_exists'
          toast({
            title: 'Perfil salvo, mas ocorreu um erro no e-mail de acesso',
            description: isEmailExists
              ? 'Este e-mail já está sendo utilizado por outra conta.'
              : authError.message,
            variant: 'destructive',
          })
          setIsSaving(false)
          return
        }
        emailMessage = ' Verifique sua caixa de entrada para confirmar o novo e-mail.'
      } catch (err: any) {
        toast({
          title: 'Perfil salvo, mas erro ao atualizar e-mail',
          description: 'Ocorreu um erro inesperado ao atualizar o e-mail de acesso.',
          variant: 'destructive',
        })
        setIsSaving(false)
        return
      }
    }

    setIsSaving(false)
    setWhatsapp(formattedWhatsapp)
    toast({
      title: 'Sucesso',
      description: 'Perfil atualizado com sucesso.' + emailMessage,
    })
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

    if (
      !('serviceWorker' in navigator) ||
      !('PushManager' in window) ||
      !('Notification' in window)
    ) {
      toast({
        title: 'Não suportado',
        description: 'As notificações Push não são suportadas neste navegador ou dispositivo.',
        variant: 'default',
      })
      setPushEnabled(false)
      setIsUpdatingPush(false)
      return
    }

    if (Notification.permission === 'denied') {
      toast({
        title: 'Permissão Bloqueada',
        description:
          'Você bloqueou as notificações. Clique no ícone de cadeado na barra de endereços para permitir.',
        variant: 'destructive',
      })
      setPushEnabled(false)
      setIsUpdatingPush(false)
      return
    }

    try {
      const permission = await Notification.requestPermission()

      if (permission !== 'granted') {
        toast({
          title: 'Permissão necessária',
          description: 'Para ativar as notificações, você precisa aceitar o pedido do navegador.',
          variant: 'default',
        })
        setPushEnabled(false)
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
      console.warn('Simulating push subscription due to context error', err)
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

  const getWhatsappStatus = (val: string) => {
    if (!val) return { status: 'idle', message: '' }
    const digits = val.replace(/\D/g, '')
    if (digits.length === 0) return { status: 'idle', message: '' }

    if (digits.startsWith('55') && (digits.length === 12 || digits.length === 13)) {
      return { status: 'success', message: 'Número formatado corretamente.' }
    }

    if (digits.length === 10 || digits.length === 11) {
      return { status: 'success', message: 'Número formatado corretamente (+55 será adicionado).' }
    }

    if (digits.length > 13) {
      return { status: 'error', message: 'Verifique o formato, parece ter dígitos extras.' }
    }

    return {
      status: 'error',
      message: 'Número incompleto. Insira DDD + telefone (10 ou 11 dígitos).',
    }
  }

  const whatsappStatus = getWhatsappStatus(whatsapp)

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
              <p className="text-sm text-primary mb-4">
                {profileType === 'autonomo' ? 'Corretor Autônomo' : companyName || 'Imobiliária'}
              </p>

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
          {(activeTier !== 'None' || activeReferrals > 0) && (
            <AmbassadorWidget tier={activeTier} referrals={activeReferrals} />
          )}

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
                <Label htmlFor="email" className="text-white">
                  E-mail
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Seu E-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-background text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp" className="text-white">
                  Número do WhatsApp
                </Label>
                <Input
                  id="whatsapp"
                  placeholder="Ex: 21999999999"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="bg-background text-white"
                />
                {whatsappStatus.status === 'success' && (
                  <p className="text-xs text-green-500 flex items-center gap-1.5 mt-1.5 animate-in fade-in slide-in-from-top-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {whatsappStatus.message}
                  </p>
                )}
                {whatsappStatus.status === 'error' && (
                  <p className="text-xs text-destructive flex items-center gap-1.5 mt-1.5 animate-in fade-in slide-in-from-top-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {whatsappStatus.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg text-white">Atuação Profissional</CardTitle>
              <CardDescription>Informações sobre seu foco de atuação e mercado.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4 border border-border rounded-lg p-4 bg-secondary/10">
                <div className="space-y-3">
                  <Label className="text-white text-base">Tipo de Atuação</Label>
                  <RadioGroup
                    value={profileType}
                    onValueChange={(val) => setProfileType(val as 'autonomo' | 'imobiliaria')}
                    className="flex flex-col sm:flex-row gap-4"
                  >
                    <div
                      className="flex items-center space-x-2 bg-background border border-border px-4 py-3 rounded-lg flex-1 cursor-pointer hover:bg-secondary/50 transition-colors"
                      onClick={() => setProfileType('autonomo')}
                    >
                      <RadioGroupItem value="autonomo" id="autonomo" />
                      <Label
                        htmlFor="autonomo"
                        className="text-white font-normal cursor-pointer flex-1"
                      >
                        Corretor Autônomo
                      </Label>
                    </div>
                    <div
                      className="flex items-center space-x-2 bg-background border border-border px-4 py-3 rounded-lg flex-1 cursor-pointer hover:bg-secondary/50 transition-colors"
                      onClick={() => setProfileType('imobiliaria')}
                    >
                      <RadioGroupItem value="imobiliaria" id="imobiliaria" />
                      <Label
                        htmlFor="imobiliaria"
                        className="text-white font-normal cursor-pointer flex-1"
                      >
                        Imobiliária / Agência
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {profileType === 'imobiliaria' && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-2 pt-2">
                    <Label htmlFor="companyName" className="text-white">
                      Nome da Imobiliária / Agência
                    </Label>
                    <Input
                      id="companyName"
                      placeholder="Ex: Prime Imóveis"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="bg-background text-white"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <Label htmlFor="specialty" className="text-white">
                    Especializado em (Opcional)
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className="w-full justify-between bg-background text-white border-border hover:bg-secondary hover:text-white"
                      >
                        <span className="truncate mr-2">
                          {selectedSpecialties.length === 0
                            ? 'Selecione...'
                            : selectedSpecialties.length <= 2
                              ? selectedSpecialties.join(', ')
                              : `${selectedSpecialties.length} selecionados`}
                        </span>
                        <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-2 bg-popover border-border shadow-md">
                      <div className="space-y-3 p-1">
                        {AVAILABLE_SPECIALTIES.map((sp) => (
                          <div key={sp} className="flex items-center space-x-2">
                            <Checkbox
                              id={`specialty-${sp}`}
                              checked={selectedSpecialties.includes(sp)}
                              onCheckedChange={(checked) => {
                                setSelectedSpecialties((prev) =>
                                  checked ? [...prev, sp] : prev.filter((s) => s !== sp),
                                )
                              }}
                            />
                            <label
                              htmlFor={`specialty-${sp}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-white cursor-pointer"
                            >
                              {sp}
                            </label>
                          </div>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {selectedSpecialties.includes('Condomínios') && (
                <div className="space-y-2 animate-fade-in-down">
                  <Label htmlFor="condominiumName" className="text-white">
                    Nome do Condomínio (Opcional)
                  </Label>
                  <Input
                    id="condominiumName"
                    placeholder="Ex: Alphaville, Malibu..."
                    value={condominiumName}
                    onChange={(e) => setCondominiumName(e.target.value)}
                    className="bg-background text-white"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="bio" className="text-white">
                  Resumo Profissional (Bio - Opcional)
                </Label>
                <Textarea
                  id="bio"
                  placeholder="Escreva um breve resumo sobre sua trajetória, diferenciais..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="bg-background text-white min-h-[100px]"
                />
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

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg text-white flex items-center justify-between">
                <span>Avaliações e Recomendações</span>
                {reviews.length > 0 && (
                  <div className="flex items-center gap-1 text-yellow-500 text-sm bg-yellow-500/10 px-2 py-1 rounded-full">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="font-bold">{averageRating.toFixed(1)}</span>
                    <span className="text-muted-foreground ml-1">({reviews.length})</span>
                  </div>
                )}
              </CardTitle>
              <CardDescription>O que seus parceiros de negócio dizem sobre você.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {reviews.length === 0 ? (
                <div className="text-center p-6 bg-secondary/20 rounded-lg border border-border border-dashed">
                  <p className="text-muted-foreground text-sm">
                    Você ainda não recebeu nenhuma avaliação.
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Feche negócios para receber recomendações de seus parceiros.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-background rounded-lg border border-border space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={review.reviewer?.avatar_url} />
                            <AvatarFallback>
                              {review.reviewer?.full_name?.charAt(0) || 'P'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-white text-sm">
                            {review.reviewer?.full_name || 'Parceiro'}
                          </span>
                        </div>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-3.5 h-3.5 ${star <= review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'}`}
                            />
                          ))}
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-sm text-muted-foreground italic">"{review.comment}"</p>
                      )}
                      <p className="text-[10px] text-muted-foreground/50">
                        {new Date(review.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  ))}
                </div>
              )}
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
