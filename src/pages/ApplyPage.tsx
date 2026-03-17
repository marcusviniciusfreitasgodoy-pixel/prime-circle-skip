import { useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Crown, Loader2, ArrowLeft, Check, ChevronsUpDown, Info, Camera } from 'lucide-react'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'
import useAppStore from '@/stores/main'
import { supabase } from '@/lib/supabase/client'

const REGIONS = [
  'Barra da Tijuca',
  'Recreio dos Bandeirantes',
  'Leblon',
  'Ipanema',
  'Lagoa',
  'Gávea',
  'São Conrado',
  'Centro',
  'Zona Sul',
  'Zona Oeste',
]

const TICKET_RANGES = [
  'R$ 1.000.000,00 - R$ 2.000.000,00',
  'R$ 2.000.001,00 - R$ 5.000.000,00',
  'R$ 5.000.001,00 - R$ 10.000.000,00',
  'Acima de R$ 10.000.000,00',
]

const formSchema = z.object({
  name: z.string().min(2, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha mínima de 6 caracteres'),
  phone: z.string().min(10, 'Telefone inválido'),
  creci: z.string().min(4, 'CRECI inválido'),
  region: z.array(z.string()).min(1, 'Informe pelo menos uma região'),
  ticket: z.string().min(1, 'Informe seu ticket médio'),
  workType: z.enum(['autonomo', 'imobiliaria']).default('autonomo'),
  companyName: z.string().max(100, 'Nome muito longo').optional(),
  referral: z.string().optional(),
  agreement: z
    .boolean()
    .refine((val) => val === true, { message: 'Você deve concordar com a política de 50/50' }),
})

export default function ApplyPage() {
  const { signUp } = useAuth()
  const { login } = useAppStore()
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { toast } = useToast()

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: 'A imagem deve ter no máximo 2MB.',
        })
        return
      }
      if (!file.type.startsWith('image/')) {
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: 'Selecione uma imagem válida (JPG, PNG ou WEBP).',
        })
        return
      }
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onloadend = () => setAvatarPreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      phone: '',
      creci: '',
      region: [],
      ticket: '',
      workType: 'autonomo',
      companyName: '',
      referral: '',
      agreement: false,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (isLoading) return
    setIsLoading(true)

    try {
      const { data, error } = await signUp(values.email, values.password, {
        full_name: values.name,
        whatsapp_number: values.phone,
        creci: values.creci,
        region: values.region.join(', '),
        ticket_value: values.ticket,
        referral_code: values.referral,
        company_name:
          values.workType === 'autonomo'
            ? 'Autônomo'
            : values.companyName || 'Imobiliária (Não informada)',
        accepted_terms: values.agreement,
      })

      if (error) {
        const authError = error as any

        if (authError.status === 422 || authError.code === 'user_already_exists') {
          throw new Error('Este e-mail já está cadastrado.')
        }

        if (authError.status === 429 || authError.code === 'over_email_send_rate_limit') {
          throw new Error(
            'Limite de envio de e-mails atingido. Por favor, aguarde alguns minutos antes de tentar novamente.',
          )
        }

        if (
          authError.status === 504 ||
          authError.code === 'timeout' ||
          (authError.message && authError.message.toLowerCase().includes('timeout'))
        ) {
          toast({
            title: 'Solicitação em Processamento',
            description:
              'A criação da sua conta demorou um pouco mais que o normal, mas já está sendo finalizada. Tente fazer login ou verifique seu e-mail em breve.',
          })
          navigate('/auth/confirm')
          return
        }

        if (
          authError.status === 500 ||
          authError.code === 'unexpected_failure' ||
          (authError.message && authError.message.includes('Error sending confirmation email'))
        ) {
          throw new Error(
            'Não foi possível concluir o cadastro devido a uma falha na comunicação com o servidor. Por favor, tente novamente.',
          )
        } else {
          throw new Error(`Erro na criação da conta: ${error.message}`)
        }
      }

      // UX Continuity
      login(values.email, 'password')
      localStorage.setItem('just_registered', 'true')

      const userId = data?.user?.id
      let uploadErrorMsg = ''

      if (userId && avatarFile) {
        try {
          await supabase.auth.getSession()

          const fileExt = avatarFile.name.split('.').pop()
          const fileName = `${userId}/avatar-${Date.now()}.${fileExt}`

          const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(fileName, avatarFile, { upsert: true })

          if (uploadError) {
            console.error('Avatar upload error:', uploadError)
            uploadErrorMsg = ' Não foi possível enviar a foto de perfil.'
          } else {
            const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(fileName)

            await supabase
              .from('profiles')
              .update({ avatar_url: publicUrlData.publicUrl })
              .eq('id', userId)
          }
        } catch (err) {
          console.error('Failed to process avatar:', err)
          uploadErrorMsg = ' Erro ao configurar a foto de perfil.'
        }
      }

      toast({
        title: 'Cadastro Concluído!',
        description:
          'Bem-vindo ao Prime Circle. Suas notificações e e-mails de boas-vindas estão a caminho.' +
          uploadErrorMsg,
      })

      navigate('/welcome')
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message || 'Erro ao processar solicitação',
      })
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 py-12 relative">
      <div className="w-full max-w-md bg-card p-8 rounded-2xl border border-border shadow-elevation relative">
        <Button
          variant="ghost"
          asChild
          className="absolute top-4 left-4 text-muted-foreground hover:text-white"
          disabled={isLoading}
        >
          <Link to="/">
            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
          </Link>
        </Button>

        <div className="flex flex-col items-center mb-6 mt-6">
          <Crown className="w-10 h-10 text-primary mb-4" />
          <h1 className="text-2xl font-bold text-white text-center">Solicitar Acesso</h1>
          <p className="text-muted-foreground text-center text-sm mt-2">
            Junte-se ao círculo exclusivo.
          </p>
        </div>

        <div className="flex flex-col items-center mb-8">
          <div
            className={cn(
              'relative w-24 h-24 rounded-full border-2 border-dashed flex items-center justify-center overflow-hidden transition-colors group',
              isLoading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
              avatarPreview
                ? 'border-primary/50 bg-background'
                : 'border-border bg-background hover:bg-secondary/50',
            )}
            onClick={() => !isLoading && fileInputRef.current?.click()}
          >
            {avatarPreview ? (
              <>
                <img
                  src={avatarPreview}
                  alt="Avatar preview"
                  className="w-full h-full object-cover"
                />
                {!isLoading && (
                  <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-6 h-6 text-white mb-1" />
                    <span className="text-[10px] text-white">Alterar</span>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center text-muted-foreground group-hover:text-primary transition-colors">
                <Camera className="w-6 h-6 mb-1" />
                <span className="text-[10px] text-center px-2 leading-tight">
                  Foto de
                  <br />
                  Perfil
                </span>
              </div>
            )}
          </div>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            disabled={isLoading}
          />
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Nome Completo</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Seu nome"
                      {...field}
                      className="bg-background"
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="seu@email.com"
                        {...field}
                        className="bg-background"
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Senha</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="******"
                        {...field}
                        className="bg-background"
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="creci"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">CRECI</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="00000"
                        {...field}
                        className="bg-background"
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">WhatsApp</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="(21) 99999-9999"
                        {...field}
                        className="bg-background"
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="region"
                render={({ field }) => (
                  <FormItem className="flex flex-col pt-1">
                    <FormLabel className="text-white">Regiões</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            disabled={isLoading}
                            className={cn(
                              'w-full justify-between bg-background border-input font-normal hover:bg-background/90 hover:text-white px-3 overflow-hidden',
                              !field.value?.length && 'text-muted-foreground',
                            )}
                          >
                            <span className="truncate block flex-1 text-left">
                              {field.value?.length > 0 ? field.value.join(', ') : 'Selecione...'}
                            </span>
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent
                        className="p-0"
                        style={{ width: 'var(--radix-popover-trigger-width)' }}
                      >
                        <Command>
                          <CommandInput placeholder="Buscar..." />
                          <CommandList>
                            <CommandEmpty>Nenhuma região.</CommandEmpty>
                            <CommandGroup>
                              {REGIONS.map((region) => (
                                <CommandItem
                                  key={region}
                                  value={region}
                                  onSelect={() => {
                                    const curr = field.value || []
                                    form.setValue(
                                      'region',
                                      curr.includes(region)
                                        ? curr.filter((r) => r !== region)
                                        : [...curr, region],
                                      { shouldValidate: true },
                                    )
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      'mr-2 h-4 w-4',
                                      field.value?.includes(region) ? 'opacity-100' : 'opacity-0',
                                    )}
                                  />
                                  {region}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ticket"
                render={({ field }) => (
                  <FormItem className="flex flex-col pt-1">
                    <FormLabel className="text-white">Ticket Médio</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TICKET_RANGES.map((range) => (
                          <SelectItem key={range} value={range}>
                            {range}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="workType"
              render={({ field }) => (
                <FormItem className="space-y-3 pt-2">
                  <FormLabel className="text-white">Atuação Profissional</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isLoading}
                      className="flex flex-col space-y-2 sm:flex-row sm:space-x-4 sm:space-y-0"
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="autonomo" />
                        </FormControl>
                        <FormLabel className="font-normal text-white cursor-pointer">
                          Corretor Autônomo
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="imobiliaria" />
                        </FormControl>
                        <FormLabel className="font-normal text-white cursor-pointer">
                          Imobiliária / Agência
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.watch('workType') === 'imobiliaria' && (
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem className="animate-in fade-in zoom-in slide-in-from-top-2 duration-300">
                    <FormLabel className="text-white">Nome da Imobiliária</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Digite o nome da imobiliária (opcional)"
                        {...field}
                        className="bg-background"
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormDescription className="text-xs text-muted-foreground">
                      Se você faz parte de uma agência, informe o nome para melhor identificação na
                      rede.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="referral"
              render={({ field }) => (
                <FormItem className="pt-2">
                  <FormLabel className="text-white flex items-center gap-2">
                    Código de Indicação
                    <Info className="w-4 h-4 text-muted-foreground" />
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Opcional"
                      {...field}
                      className="bg-background"
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription className="text-xs text-muted-foreground leading-relaxed">
                    Opcional. Insira o código enviado por um membro fundador para validação
                    imediata. Se não possuir um código, deixe em branco para entrar na fila de
                    análise do comitê.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="agreement"
              render={({ field }) => (
                <FormItem className="flex items-start space-x-3 space-y-0 p-4 border border-border rounded-lg bg-background mt-6">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-white text-sm cursor-pointer">
                      Aceito a Política 50/50
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full gold-gradient gold-glow h-12 text-lg mt-6 font-semibold text-black transition-all"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Processando...
                </>
              ) : (
                'Enviar Solicitação'
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  )
}
