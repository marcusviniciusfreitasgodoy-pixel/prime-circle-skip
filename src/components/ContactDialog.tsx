import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import useAppStore from '@/stores/main'

const formSchema = z.object({
  name: z.string().min(2, 'O nome deve ter no mínimo 2 caracteres.'),
  email: z.string().email('Insira um endereço de e-mail válido.'),
  subject: z.string().min(3, 'O assunto deve ter no mínimo 3 caracteres.'),
  message: z.string().min(10, 'A mensagem deve ter no mínimo 10 caracteres.'),
})

type FormValues = z.infer<typeof formSchema>

interface ContactDialogProps {
  children: React.ReactNode
}

export function ContactDialog({ children }: ContactDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const { user: authUser } = useAuth()
  const { user: profileUser } = useAppStore()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        name: profileUser?.full_name || authUser?.user_metadata?.full_name || '',
        email: authUser?.email || '',
        subject: '',
        message: '',
      })
    }
  }, [open, authUser, profileUser, form])

  async function onSubmit(values: FormValues) {
    setIsLoading(true)
    try {
      const { error } = await supabase.functions.invoke('send-email', {
        body: {
          to: 'contato@primecircle.app.br',
          subject: `[Contato Plataforma] ${values.subject}`,
          text: `Nome: ${values.name}\nE-mail: ${values.email}\n\nMensagem:\n${values.message}`,
          user_id: authUser?.id,
        },
      })

      if (error) throw error

      toast({
        title: 'Sucesso!',
        description: 'Mensagem enviada com sucesso! Entraremos em contato em breve.',
        className: 'bg-primary text-black border-none',
      })
      setOpen(false)
      form.reset()
    } catch (error) {
      console.error('Error sending contact email:', error)
      toast({
        title: 'Erro',
        description: 'Erro ao enviar mensagem. Por favor, tente novamente mais tarde.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Fale Conosco</DialogTitle>
          <DialogDescription>
            Envie sua dúvida, sugestão ou reporte um problema. Nossa equipe responderá o mais breve
            possível.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Seu nome completo" {...field} />
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
                  <FormLabel>E-mail</FormLabel>
                  <FormControl>
                    <Input placeholder="Seu e-mail para contato" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assunto</FormLabel>
                  <FormControl>
                    <Input placeholder="Qual o motivo do contato?" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mensagem</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva sua dúvida ou solicitação..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="pt-2">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? 'Enviando...' : 'Enviar Mensagem'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
