import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import {
  FileText,
  Upload,
  Send,
  Clock,
  Calendar as CalendarIcon,
  CheckCircle2,
  Loader2,
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'

export function NewsletterManagerTab() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [newsletters, setNewsletters] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form State
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchNewsletters = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('newsletters')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setNewsletters(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchNewsletters()
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      // Validação simples de tamanho e tipo (ex: max 5MB, PDF/Imagens)
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast({
          title: 'Arquivo muito grande',
          description: 'O limite é de 5MB.',
          variant: 'destructive',
        })
        return
      }
      setFile(selectedFile)
    }
  }

  const clearForm = () => {
    setTitle('')
    setContent('')
    setFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handlePublish = async (action: 'draft' | 'send') => {
    if (!title) {
      toast({
        title: 'Campo obrigatório',
        description: 'O título/assunto é obrigatório.',
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)
    try {
      let attachmentUrl = null

      if (file) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('newsletters')
          .upload(fileName, file)

        if (uploadError) throw new Error('Falha ao fazer upload do arquivo')

        const {
          data: { publicUrl },
        } = supabase.storage.from('newsletters').getPublicUrl(fileName)

        attachmentUrl = publicUrl
      }

      const status = action === 'send' ? 'scheduled' : 'draft' // Marcamos como scheduled antes de invocar p/ bloquear multiplos envios

      const { data: newNl, error: insertError } = await supabase
        .from('newsletters')
        .insert({
          title,
          content,
          attachment_url: attachmentUrl,
          status,
          created_by: user?.id,
        })
        .select()
        .single()

      if (insertError) throw new Error('Falha ao salvar a newsletter no banco')

      if (action === 'send' && newNl) {
        toast({
          title: 'Processando envio...',
          description: 'Disparando para todos os usuários ativos.',
        })

        // Dispara Edge Function
        const res = await supabase.functions.invoke('send-newsletter', {
          body: { newsletter_id: newNl.id },
        })

        if (res.error) throw new Error('Falha no disparo em massa: ' + res.error.message)

        toast({
          title: 'Sucesso!',
          description: `Newsletter enviada para ${res.data?.sent || 0} usuários ativos.`,
        })
      } else {
        toast({
          title: 'Salvo com sucesso!',
          description: 'Sua newsletter foi salva como rascunho.',
        })
      }

      clearForm()
      fetchNewsletters()
    } catch (error: any) {
      console.error(error)
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      <Card className="bg-card border-border border-t-4 border-t-primary shadow-elevation">
        <CardHeader>
          <CardTitle className="text-xl text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Nova Edição (Curadoria Mensal)
          </CardTitle>
          <CardDescription>
            Crie o conteúdo que será enviado via E-mail e notificado via WhatsApp para toda a sua
            base de corretores ativos.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Assunto / Título da Edição *</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Radar Prime: Desempenho de Março e Oportunidades na Barra"
              className="bg-background border-border text-white"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Resumo / Mensagem (Opcional)</label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Escreva um breve resumo do que a rede conquistou este mês ou os destaques do relatório..."
              className="bg-background border-border text-white min-h-[120px]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Material de Mercado (Anexo) *</label>
            <div
              className={cn(
                'border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center transition-colors',
                file
                  ? 'border-primary/50 bg-primary/5'
                  : 'border-border bg-background hover:bg-secondary/50',
              )}
            >
              <Upload
                className={cn('w-8 h-8 mb-3', file ? 'text-primary' : 'text-muted-foreground')}
              />
              <p className="text-sm text-white font-medium mb-1">
                {file ? file.name : 'Selecione o arquivo da Newsletter'}
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                {file
                  ? `${(file.size / 1024 / 1024).toFixed(2)} MB`
                  : 'PDF, JPG ou PNG recomendados (Máx 5MB)'}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="relative z-10 border-primary/30 hover:bg-primary/10"
                >
                  {file ? 'Trocar Arquivo' : 'Procurar Arquivo'}
                </Button>
                {file && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFile(null)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                  >
                    Remover
                  </Button>
                )}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-border">
            <Button
              variant="outline"
              onClick={() => handlePublish('draft')}
              disabled={isSubmitting || !title}
              className="border-border text-muted-foreground hover:text-white"
            >
              <Clock className="w-4 h-4 mr-2" />
              Salvar como Rascunho
            </Button>

            {/* MVP: Disparo imediato. Botão agendar foi simplificado para garantir entrega imediata fluida */}
            <Button
              onClick={() => handlePublish('send')}
              disabled={isSubmitting || !title}
              className="gold-gradient text-black font-bold shadow-[0_0_15px_rgba(201,168,76,0.3)]"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              {isSubmitting ? 'Processando...' : 'Disparar Agora (E-mail e WhatsApp)'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg text-white">Histórico de Disparos</CardTitle>
          <CardDescription>
            Acompanhe todas as edições já enviadas ou salvas na plataforma.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader className="bg-secondary/30">
              <TableRow className="border-border">
                <TableHead>Data</TableHead>
                <TableHead>Assunto</TableHead>
                <TableHead>Anexo</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {newsletters.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    Nenhuma newsletter registrada.
                  </TableCell>
                </TableRow>
              ) : (
                newsletters.map((nl) => (
                  <TableRow key={nl.id} className="border-border hover:bg-secondary/20">
                    <TableCell className="text-muted-foreground whitespace-nowrap">
                      {new Date(nl.created_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="font-medium text-white">{nl.title}</TableCell>
                    <TableCell>
                      {nl.attachment_url ? (
                        <a
                          href={nl.attachment_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary hover:underline text-xs flex items-center gap-1"
                        >
                          <FileText className="w-3 h-3" /> Visualizar
                        </a>
                      ) : (
                        <span className="text-muted-foreground text-xs">Sem anexo</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant="outline"
                        className={cn(
                          'font-medium',
                          nl.status === 'sent'
                            ? 'bg-green-500/10 text-green-500 border-green-500/20'
                            : nl.status === 'draft'
                              ? 'bg-secondary text-muted-foreground border-border'
                              : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
                        )}
                      >
                        {nl.status === 'sent' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                        {nl.status === 'sent'
                          ? 'Enviado'
                          : nl.status === 'draft'
                            ? 'Rascunho'
                            : 'Processando'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
