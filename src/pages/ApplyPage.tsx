import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Crown, Loader2, ArrowLeft } from 'lucide-react'
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
import { toast } from 'sonner'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'

const formSchema = z.object({
  name: z.string().min(2, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
  phone: z.string().min(10, 'Telefone inválido'),
  creci: z.string().min(4, 'CRECI inválido'),
  region: z.string().min(2, 'Informe a região de atuação'),
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
      region: '',
      ticket: '',
      referral: '',
      agreement: false,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      const { data, error } = await signUp(values.email, values.password, {
        full_name: values.name,
      })

      if (error) throw error

      if (data?.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            whatsapp_number: values.phone,
            creci: values.creci,
            region: values.region,
            ticket_value: values.ticket,
            referral_code: values.referral,
          })
          .eq('id', data.user.id)

        if (profileError) {
          console.error('Error updating profile:', profileError)
        }
      }

      toast.success('Solicitação enviada com sucesso! Bem-vindo.')
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
            Junte-se ao círculo exclusivo da Barra da Tijuca.
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
                    <FormLabel className="text-white">Email Profissional</FormLabel>
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
                  <FormItem>
                    <FormLabel className="text-white">Região de Atuação</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Barra da Tijuca">Barra da Tijuca</SelectItem>
                        <SelectItem value="Recreio">Recreio dos Bandeirantes</SelectItem>
                        <SelectItem value="Zona Sul">Zona Sul</SelectItem>
                        <SelectItem value="Outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ticket"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Ticket Médio (R$)</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: 2.500.000" {...field} className="bg-background" />
                    </FormControl>
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
                  <FormLabel className="text-white">Código de Indicação</FormLabel>
                  <FormControl>
                    <Input placeholder="Opcional" {...field} className="bg-background" />
                  </FormControl>
                  <FormDescription className="text-[10px]">Acelera auto-aprovação.</FormDescription>
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
