import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks/use-toast'
import { Lock, Image as ImageIcon, X } from 'lucide-react'

const formatCurrency = (value: string | number) => {
  if (typeof value === 'number') {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }
  const digits = value.replace(/\D/g, '')
  if (!digits) return ''
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
    parseInt(digits, 10) / 100,
  )
}
const parseCurrency = (val: string) => parseInt(val.replace(/\D/g, '') || '0', 10) / 100

interface EditPropertySheetProps {
  property: any
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function EditPropertySheet({
  property,
  open,
  onOpenChange,
  onSuccess,
}: EditPropertySheetProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [isOffMarket, setIsOffMarket] = useState(false)
  const [valor, setValor] = useState('')
  const [status, setStatus] = useState('Ativo')
  const [photos, setPhotos] = useState<string[]>([])
  const [uploadingPhotos, setUploadingPhotos] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (property && open) {
      setIsOffMarket(!!property.metadata?.is_off_market)
      setValor(formatCurrency(property.metadata?.valor || 0))
      setStatus(property.metadata?.status || 'Ativo')
      setPhotos(property.metadata?.photos || [])
    }
  }, [property, open])

  if (!property) return null

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0 || !user) return

    setUploadingPhotos(true)
    try {
      const newPhotos: string[] = []
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
        const filePath = `${user.id}/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('property_photos')
          .upload(filePath, file)

        if (uploadError) throw uploadError

        const { data: publicUrlData } = supabase.storage
          .from('property_photos')
          .getPublicUrl(filePath)

        newPhotos.push(publicUrlData.publicUrl)
      }
      setPhotos((prev) => [...prev, ...newPhotos])
      toast({
        title: 'Upload concluído',
        description: `${files.length} foto(s) adicionada(s) com sucesso.`,
      })
    } catch (error) {
      toast({
        title: 'Erro no Upload',
        description: 'Não foi possível fazer upload das imagens.',
        variant: 'destructive',
      })
    } finally {
      setUploadingPhotos(false)
      e.target.value = ''
    }
  }

  const handleRemovePhoto = (urlToRemove: string) => {
    setPhotos((prev) => prev.filter((url) => url !== urlToRemove))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!user) return
    setLoading(true)

    const fd = new FormData(e.currentTarget)

    const md = {
      ...property.metadata,
      is_off_market: isOffMarket,
      valor: parseCurrency(valor),
      tipo_imovel: fd.get('tipo_imovel'),
      endereco: fd.get('endereco'),
      complemento: fd.get('complemento') || '',
      bairro: fd.get('bairro'),
      quartos: fd.get('quartos'),
      suites: fd.get('suites'),
      tamanho_imovel: Number(fd.get('tamanho_imovel')),
      tamanho_terreno: fd.get('tamanho_terreno') ? Number(fd.get('tamanho_terreno')) : null,
      nome_condominio: fd.get('nome_condominio'),
      link_imovel: fd.get('link_imovel'),
      description: fd.get('description'),
      status,
      photos,
    }

    md.title = md.tipo_imovel
    md.price = formatCurrency(md.valor)
    md.location = md.bairro || md.endereco
    md.property_type = md.tipo_imovel

    const content = `Tipo: ${md.tipo_imovel}\nBairro: ${md.bairro}\nEndereço: ${md.endereco} ${md.complemento ? `- ${md.complemento}` : ''}\nValor: R$ ${md.valor}\nQuartos: ${md.quartos}\nSuítes: ${md.suites}\nDetalhes: ${md.description}`

    const { error } = await supabase
      .from('documents')
      .update({ content, metadata: md })
      .eq('id', property.id)
      .eq('metadata->>user_id', user.id)

    setLoading(false)
    if (error) {
      toast({
        title: 'Erro de Permissão',
        description: 'Falha ao atualizar imóvel. Apenas o proprietário pode realizar alterações.',
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Sucesso',
        description: 'Imóvel atualizado com sucesso!',
        className: 'bg-card border-primary/50 text-white',
      })
      onSuccess()
    }
  }

  const handleDelete = async () => {
    if (!property || !user) return
    setIsDeleting(true)

    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', property.id)
      .eq('metadata->>user_id', user.id)

    setIsDeleting(false)

    if (error) {
      toast({
        title: 'Erro ao excluir',
        description: 'Não foi possível remover o imóvel. Verifique suas permissões.',
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Imóvel removido',
        description: 'O imóvel foi excluído permanentemente.',
        className: 'bg-card border-primary/50 text-white',
      })
      onOpenChange(false)
      onSuccess()
    }
  }

  const getSelectValue = (key: string, fallback: string) => {
    return property.metadata?.[key]?.toString() || fallback
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>Editar Imóvel</SheetTitle>
          <SheetDescription>
            Atualize as informações, fotos e status da sua oportunidade de negócio.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-3">
            <Label>Fotos do Imóvel</Label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {photos.map((url, i) => (
                <div
                  key={i}
                  className="relative aspect-square rounded-md overflow-hidden bg-secondary border border-border group"
                >
                  <img src={url} alt={`Foto ${i + 1}`} className="object-cover w-full h-full" />
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(url)}
                    className="absolute top-1 right-1 bg-black/60 hover:bg-black p-1.5 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <label className="relative aspect-square rounded-md border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-secondary/20 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handlePhotoUpload}
                  disabled={uploadingPhotos}
                />
                {uploadingPhotos ? (
                  <span className="text-xs text-muted-foreground animate-pulse text-center px-1">
                    Enviando...
                  </span>
                ) : (
                  <>
                    <ImageIcon className="w-6 h-6 text-muted-foreground mb-1" />
                    <span className="text-xs text-muted-foreground">Adicionar</span>
                  </>
                )}
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status do Imóvel</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ativo">Ativo</SelectItem>
                  <SelectItem value="Negociando">Negociando</SelectItem>
                  <SelectItem value="Vendido">Vendido</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tipo de Imóvel</Label>
              <Select
                name="tipo_imovel"
                required
                defaultValue={getSelectValue('tipo_imovel', 'Apartamento')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['Apartamento', 'Cobertura', 'Casa', 'Terreno', 'Sala Comercial'].map((o) => (
                    <SelectItem key={o} value={o}>
                      {o}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Valor</Label>
              <Input
                required
                placeholder="R$ 0,00"
                value={valor}
                onChange={(e) => setValor(formatCurrency(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>Rua/Avenida</Label>
              <Input
                name="endereco"
                required
                defaultValue={property.metadata?.endereco || property.metadata?.location || ''}
              />
            </div>
            <div className="space-y-2">
              <Label>Complemento (Opcional)</Label>
              <Input name="complemento" defaultValue={property.metadata?.complemento || ''} />
            </div>
            <div className="space-y-2">
              <Label>Bairro</Label>
              <Input
                name="bairro"
                required
                defaultValue={property.metadata?.bairro || property.metadata?.location || ''}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Quartos</Label>
              <Select name="quartos" required defaultValue={getSelectValue('quartos', '1')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['1', '2', '3', '4', '5 ou mais'].map((o) => (
                    <SelectItem key={o} value={o}>
                      {o}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Suítes</Label>
              <Select name="suites" required defaultValue={getSelectValue('suites', '1')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['1', '2', '3', '4', '5 ou mais'].map((o) => (
                    <SelectItem key={o} value={o}>
                      {o}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Área Útil (m²)</Label>
              <Input
                name="tamanho_imovel"
                type="number"
                required
                defaultValue={property.metadata?.tamanho_imovel || ''}
              />
            </div>
            <div className="space-y-2">
              <Label>Terreno (m²) (Opcional)</Label>
              <Input
                name="tamanho_terreno"
                type="number"
                defaultValue={property.metadata?.tamanho_terreno || ''}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nome do Condomínio (Opcional)</Label>
              <Input
                name="nome_condominio"
                defaultValue={property.metadata?.nome_condominio || ''}
              />
            </div>
            <div className="space-y-2">
              <Label>Link do Imóvel (Opcional)</Label>
              <Input name="link_imovel" defaultValue={property.metadata?.link_imovel || ''} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea
              name="description"
              required
              defaultValue={property.metadata?.description || property.content || ''}
              className="h-32"
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border p-3 bg-secondary/30">
            <div>
              <Label className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-primary" /> Exclusivo / Reservado
              </Label>
              <p className="text-xs text-muted-foreground">
                Restringir visibilidade para corretores de alta pontuação.
              </p>
            </div>
            <Switch checked={isOffMarket} onCheckedChange={setIsOffMarket} />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-border mt-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button type="button" variant="destructive" className="w-full sm:w-auto">
                  Remover Imóvel
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Tem certeza que deseja excluir este imóvel?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita. O imóvel será permanentemente removido da
                    plataforma.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {isDeleting ? 'Removendo...' : 'Sim, excluir imóvel'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Button
              type="submit"
              className="w-full sm:flex-1 gold-gradient text-black font-semibold shadow-md"
              disabled={loading || uploadingPhotos}
            >
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
