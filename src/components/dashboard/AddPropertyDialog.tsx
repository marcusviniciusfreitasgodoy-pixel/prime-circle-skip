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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { PlusCircle, Lock, Image as ImageIcon, X } from 'lucide-react'
import { AddressAutocomplete } from '@/components/ui/address-autocomplete'

const formatCurrency = (value: string) => {
  const digits = value.replace(/\D/g, '')
  if (!digits) return ''
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
    parseInt(digits, 10) / 100,
  )
}
const parseCurrency = (val: string) => parseInt(val.replace(/\D/g, '') || '0', 10) / 100

export function AddPropertyDialog({
  onSuccess,
  trigger,
}: {
  onSuccess: () => void
  trigger?: React.ReactNode
}) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isOffMarket, setIsOffMarket] = useState(false)
  const [valor, setValor] = useState('')
  const [photos, setPhotos] = useState<string[]>([])
  const [uploadingPhotos, setUploadingPhotos] = useState(false)

  const [endereco, setEndereco] = useState('')
  const [bairro, setBairro] = useState('')
  const [city, setCity] = useState('')
  const [stateLocation, setStateLocation] = useState('')

  useEffect(() => {
    if (!open) {
      setPhotos([])
      setValor('')
      setIsOffMarket(false)
      setEndereco('')
      setBairro('')
      setCity('')
      setStateLocation('')
    }
  }, [open])

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0 || !user) return

    if (photos.length + files.length > 5) {
      toast({
        title: 'Limite excedido',
        description: 'Você pode carregar no máximo 5 imagens.',
        variant: 'destructive',
      })
      e.target.value = ''
      return
    }

    setUploadingPhotos(true)
    try {
      const newPhotos: string[] = []
      for (const file of Array.from(files)) {
        const ext = file.name.split('.').pop()
        const path = `${user.id}/${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`
        const { error } = await supabase.storage.from('property_photos').upload(path, file)
        if (error) throw error
        const { data } = supabase.storage.from('property_photos').getPublicUrl(path)
        newPhotos.push(data.publicUrl)
      }
      setPhotos((prev) => [...prev, ...newPhotos])
      toast({ title: 'Sucesso', description: 'Fotos adicionadas.' })
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha no upload.', variant: 'destructive' })
    } finally {
      setUploadingPhotos(false)
      e.target.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!user) return
    setLoading(true)

    const fd = new FormData(e.currentTarget)

    const tipo_imovel = String(fd.get('tipo_imovel') || '')
    const complemento = String(fd.get('complemento') || '')
    const quartos = String(fd.get('quartos') || '')
    const suites = String(fd.get('suites') || '')
    const tamanho_imovel = Number(fd.get('tamanho_imovel'))
    const tamanho_terreno_val = fd.get('tamanho_terreno')
    const tamanho_terreno = tamanho_terreno_val ? Number(tamanho_terreno_val) : null
    const nome_condominio = String(fd.get('nome_condominio') || '')
    const link_imovel = String(fd.get('link_imovel') || '')
    const video_url_val = fd.get('video_url')
    const video_url = video_url_val ? String(video_url_val) : null
    const description = String(fd.get('description') || '')

    const md = {
      type: 'oferta',
      user_id: user.id,
      is_off_market: isOffMarket,
      valor: parseCurrency(valor),
      tipo_imovel,
      endereco,
      bairro,
      street: endereco,
      neighborhood: bairro,
      city,
      state: stateLocation,
      complemento,
      quartos,
      suites,
      tamanho_imovel,
      tamanho_terreno,
      nome_condominio,
      link_imovel,
      video_url,
      description,
      status: 'Ativo',
      photos,
    }

    const content = `Tipo: ${md.tipo_imovel}\nBairro: ${md.neighborhood}\nEndereço: ${md.street} ${md.complemento ? `- ${md.complemento}` : ''}\nCidade: ${md.city}\nEstado: ${md.state}\nValor: R$ ${md.valor}\nQuartos: ${md.quartos}\nSuítes: ${md.suites}\nDetalhes: ${md.description}`

    const { error } = await supabase.from('documents').insert({ content, metadata: md })

    setLoading(false)
    if (error) {
      toast({ title: 'Erro', description: 'Falha ao divulgar imóvel.', variant: 'destructive' })
    } else {
      toast({
        title: 'Sucesso',
        description: 'Imóvel publicado!',
        className: 'bg-card border-primary/50 text-white',
      })
      setOpen(false)
      onSuccess()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gold-gradient text-black font-semibold shadow-[0_0_15px_rgba(201,168,76,0.2)]">
            <PlusCircle className="w-4 h-4 mr-2" /> Divulgar Imóvel
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Divulgar Novo Imóvel</DialogTitle>
          <DialogDescription>
            Insira os dados do imóvel. Todos os membros poderão ver, mas você pode marcá-lo como
            Off-Market.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-3">
            <Label>Fotos do Imóvel (Máx. 5)</Label>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {photos.map((url, i) => (
                <div
                  key={i}
                  className="relative aspect-square rounded-md overflow-hidden bg-secondary border border-border group"
                >
                  <img src={url} alt={`Foto ${i + 1}`} className="object-cover w-full h-full" />
                  <button
                    type="button"
                    onClick={() => setPhotos((p) => p.filter((u) => u !== url))}
                    className="absolute top-1 right-1 bg-black/60 hover:bg-black p-1.5 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {photos.length < 5 && (
                <label className="relative aspect-square rounded-md border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-secondary/20 transition-colors">
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/jpg"
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
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo de Imóvel</Label>
              <Select name="tipo_imovel" required defaultValue="Apartamento">
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
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Logradouro / Rua</Label>
              <AddressAutocomplete
                name="endereco"
                required
                value={endereco}
                onChange={setEndereco}
                onSelect={(details) => {
                  setEndereco(details.street || details.formattedAddress)
                  if (details.neighborhood) setBairro(details.neighborhood)
                  if (details.city) setCity(details.city)
                  if (details.state) setStateLocation(details.state)
                }}
                placeholder="Ex: Av. das Américas"
              />
            </div>
            <div className="space-y-2">
              <Label>Bairro</Label>
              <AddressAutocomplete
                name="bairro"
                required
                types={['(regions)']}
                value={bairro}
                onChange={setBairro}
                onSelect={(details) => {
                  setBairro(details.neighborhood || details.street || details.formattedAddress)
                }}
                placeholder="Ex: Barra da Tijuca"
              />
            </div>
            <div className="space-y-2">
              <Label>Complemento (Opcional)</Label>
              <Input name="complemento" placeholder="Ex: Apto 101" />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Quartos</Label>
              <Select name="quartos" required defaultValue="1">
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
              <Select name="suites" required defaultValue="1">
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
              <Input name="tamanho_imovel" type="number" required placeholder="120" />
            </div>
            <div className="space-y-2">
              <Label>Terreno (m²) (Opcional)</Label>
              <Input name="tamanho_terreno" type="number" placeholder="200" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nome do Condomínio (Opcional)</Label>
              <Input name="nome_condominio" placeholder="Ex: Condomínio Península" />
            </div>
            <div className="space-y-2">
              <Label>Link do Imóvel (Opcional)</Label>
              <Input
                name="link_imovel"
                type="url"
                placeholder="https://"
                pattern="https?://.*"
                title="O link deve começar com http:// ou https://"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Link do Vídeo (Opcional)</Label>
            <Input
              name="video_url"
              type="url"
              placeholder="https://youtube.com/... ou virtual tour"
              pattern="https?://.*"
              title="O link deve começar com http:// ou https://"
            />
          </div>
          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea name="description" required placeholder="Diferenciais..." className="h-20" />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-3 bg-secondary/30">
            <div>
              <Label className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-primary" /> Off-Market
              </Label>
              <p className="text-xs text-muted-foreground">
                Sinaliza que o imóvel não está em portais públicos, apenas para redes privadas.
              </p>
            </div>
            <Switch checked={isOffMarket} onCheckedChange={setIsOffMarket} />
          </div>
          <Button type="submit" className="w-full mt-4" disabled={loading || uploadingPhotos}>
            {loading ? 'Salvando...' : 'Publicar Imóvel'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
