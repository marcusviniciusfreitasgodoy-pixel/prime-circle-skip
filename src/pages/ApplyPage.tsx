import { useNavigate } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Crown } from 'lucide-react'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import useAppStore from '@/stores/main'
import { toast } from 'sonner'
import { sendTransactionalEmail } from '@/lib/email'

const formSchema = z.object({
  name: z.string().min(2, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(10, 'Telefone inválido'),
  creci: z.string().min(4, 'CRECI inválido'),
  region: z.string().min(2, 'Informe a região primária'),
  ticket: z.string().min(1, 'Informe seu ticket médio'),
  referral: z.string().optional(),
  agreement: z
    .boolean()
    .refine((val) => val === true, { message: 'Você deve concordar com a política de 50/50' }),
})

export default function ApplyPage() {
  const navigate = useNavigate()
  const { login } = useAppStore()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      creci: '',
      region: 'Barra da Tijuca',
      ticket: '',
      referral: '',
      agreement: false,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const ticketValue = parseInt(values.ticket.replace(/\D/g, '')) || 0
    const isBarra = values.region.toLowerCase().includes('barra')

    // Waitlist Logic based on minimum criteria
    if (!isBarra || ticketValue < 1000000) {
      if (!values.referral) {
        navigate('/apply/lista-de-espera')
        return
      }
    }

    // Trigger Referral Notification
    if (values.referral) {
      await sendTransactionalEmail('Indicator Notification', {
        to: 'admin@primecircle.com',
        candidate: values.name,
        code: values.referral,
      })
    }

    // Trigger Application Received Email
    await sendTransactionalEmail('Application Received', {
      to: values.email,
      candidate: values.name,
    })

    login('pending')
    toast.success('Solicitação recebida com sucesso! Você está em análise.')
    navigate('/pending')
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 py-12">
      <div className="w-full max-w-md bg-card p-8 rounded-2xl border border-border shadow-2xl">
        <div className="flex flex-col items-center mb-8">
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
                    <Input placeholder="João Silva" {...field} className="bg-background" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Email Profissional</FormLabel>
                  <FormControl>
                    <Input placeholder="joao@prime.com" {...field} className="bg-background" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                      <Input placeholder="(21) 90000-0000" {...field} className="bg-background" />
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
                    <FormControl>
                      <Input {...field} className="bg-background" />
                    </FormControl>
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
                  <FormLabel className="text-white">Código de Indicação (Opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: CARLOS-123" {...field} className="bg-background" />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Acelera o processo de análise.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="agreement"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border border-border rounded-lg bg-background mt-6">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="data-[state=checked]:bg-primary data-[state=checked]:text-black mt-0.5"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-white text-sm cursor-pointer">
                      Aceito a Política 50/50
                    </FormLabel>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Concordo em praticar a divisão justa de honorários (50/50) em todas as
                      parcerias geradas via Prime Circle.
                    </p>
                  </div>
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full gold-gradient gold-glow h-12 text-lg mt-6 font-semibold"
            >
              Enviar Solicitação
            </Button>
          </form>
        </Form>
      </div>
    </div>
  )
}
