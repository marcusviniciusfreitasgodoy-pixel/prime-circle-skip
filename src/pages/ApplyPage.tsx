import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Crown, Loader2, ArrowLeft, Check, ChevronsUpDown, Info } from 'lucide-react'
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
import { toast } from 'sonner'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { sendWelcomeNotifications } from '@/services/notifications'

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
  referral: z.string().optional(),
  agreement: z
    .boolean()
    .refine((val) => val === true, { message: 'Você deve concordar com a política de 50/50' }),
})

export default function ApplyPage() {
  const navigate = useNavigate()
  const { signUp } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

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
      referral: '',
      agreement: false,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    try {
      const redirectUrl = `${window.location.origin}/dashboard`

      // Pass user metadata as a robust fallback for the database trigger
      const { data, error } = await signUp(
        values.email,
        values.password,
        {
          full_name: values.name,
          whatsapp_number: values.phone,
          creci: values.creci,
          region: values.region.join(', '),
          ticket_value: values.ticket,
          referral_code: values.referral,
          accepted_terms: values.agreement,
        },
        redirectUrl,
      )

      if (error) {
        throw new Error(`Erro na criação da conta: ${error.message}`)
      }

      if (data?.user) {
        // Explicitly update the profiles table to ensure all fields are persisted.
        // We throw an explicit error if this fails (e.g., due to RLS) to prevent silent failures.
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            full_name: values.name,
            whatsapp_number: values.phone,
            creci: values.creci,
            region: values.region.join(', '),
            ticket_value: values.ticket,
            referral_code: values.referral,
            accepted_terms: values.agreement,
          })
          .eq('id', data.user.id)

        if (profileError) {
          console.error('Error updating profile:', profileError)
          throw new Error(`Erro ao salvar dados do perfil: ${profileError.message}`)
        }

        // Send automated welcome notifications via WhatsApp and Email
        try {
          await sendWelcomeNotifications({
            userId: data.user.id,
            fullName: values.name,
            recipientPhone: values.phone,
            recipientEmail: values.email,
          })
        } catch (err) {
          console.error('Failed to send welcome notifications:', err)
          // Non-blocking error: we still want them to proceed if registration succeeded
        }
      }

      toast.success('Solicitação enviada com sucesso!')
      // Redirect to onboarding avoiding loops
      navigate('/onboarding')
    } catch (error: any) {
      toast.error(error.message || 'Erro ao processar solicitação')
    } finally {
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
        >
          <Link to="/">
            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
          </Link>
        </Button>

        <div className="flex flex-col items-center mb-8 mt-6">
          <Crown className="w-10 h-10 text-primary mb-4" />
          <h1 className="text-2xl font-bold text-white text-center">Solicitar Acesso</h1>
          <p className="text-muted-foreground text-center text-sm mt-2">
            Junte-se ao círculo exclusivo.
          </p>
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
                    <Input placeholder="Seu nome" {...field} className="bg-background" />
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
                      <Input placeholder="00000" {...field} className="bg-background" />
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
                      <Input placeholder="(21) 99999-9999" {...field} className="bg-background" />
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
              name="referral"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white flex items-center gap-2">
                    Código de Indicação
                    <Info className="w-4 h-4 text-muted-foreground" />
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Opcional" {...field} className="bg-background" />
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
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
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
              className="w-full gold-gradient gold-glow h-12 text-lg mt-6 font-semibold text-black"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Enviar Solicitação'}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  )
}
