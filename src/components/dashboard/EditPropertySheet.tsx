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
import { useToast } from '@/hooks/use-toast'
import { Save, Lock, Image as ImageIcon, X } from 'lucide-react'
import { AddressAutocomplete } from '@/components/ui/address-autocomplete'

const formatCurrency = (value: string) => {
  const digits = value.replace(/\D/g, '')
  if (!digits) return ''
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
    parseInt(digits, 10) / 100,
  )
}

const parseCurrency = (val: string) => parseInt(val.replace(/\D/g, '') || '0', 10) / 100

export function EditPropertySheet({
  property,
  open,
  onOpenChange,
  onSuccess,
}: {
  property: any
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}) {
  const { user } = useAuth()
  const { toast } = useToast()
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
    if (property && open) {
      const md = property.metadata || {}
      setValor(
        md.valor
          ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(md.valor)
          : md.price || '',
      )
      setIsOffMarket(!!md.is_off_market)
      setPhotos(md.photos || [])
      setEndereco(md.endereco || md.street || md.location || '')
      setBairro(md.bairro || md.neighborhood || md.location || '')
      setCity(md.city || '')
      setStateLocation(md.state || '')
    }
  }, [property, open])

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0 || !user) return

    if (photos.length + files.length > 5) {
      toast({
        title: 'Limite excedido',
        description: 'Você pode ter no máximo 5 imagens.',
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
    if (!user || !property) return
    setLoading(true)

    const fd = new FormData(e.currentTarget)

    const parsedVal = valor.includes('R$')
      ? parseCurrency(valor)
      : property.metadata.valor || parseCurrency(valor)

    const md = {
      ...property.metadata,
      is_off_market: isOffMarket,
      valor: parsedVal,
      tipo_imovel: String(fd.get('tipo_imovel') || property.metadata.tipo_imovel || ''),
      endereco: endereco,
      bairro: bairro,
      street: endereco,
      neighborhood: bairro,
      city: city,
      state: stateLocation,
      complemento: String(fd.get('complemento') || property.metadata.complemento || ''),
      andar: String(fd.get('andar') || property.metadata.andar || ''),
      quartos: String(fd.get('quartos') || property.metadata.quartos || ''),
      suites: String(fd.get('suites') || property.metadata.suites || ''),
      tamanho_imovel: Number(fd.get('tamanho_imovel') || property.metadata.tamanho_imovel || 0),
      tamanho_terreno: fd.get('tamanho_terreno')
        ? Number(fd.get('tamanho_terreno'))
        : property.metadata.tamanho_terreno,
      nome_condominio: String(fd.get('nome_condominio') || property.metadata.nome_condominio || ''),
      link_imovel: fd.get('link_imovel')
        ? String(fd.get('link_imovel'))
        : property.metadata.link_imovel,
      video_url: fd.get('video_url') ? String(fd.get('video_url')) : property.metadata.video_url,
      description: String(fd.get('description') || property.metadata.description || ''),
      photos,
      status: String(fd.get('status') || property.metadata.status || 'Ativo'),
    }

    if (valor.includes('R$')) {
      md.price = valor
    }

    const content = `Tipo: ${md.tipo_imovel}\nBairro: ${md.neighborhood}\nEndereço: ${md.street} ${md.complemento ? `- ${md.complemento}` : ''}\nAndar: ${md.andar}\nCidade: ${md.city}\nEstado: ${md.state}\nValor: R$ ${md.valor}\nQuartos: ${md.quartos}\nSuítes: ${md.suites}\nDetalhes: ${md.description}`

    const { error } = await supabase
      .from('documents')
      .update({ content, metadata: md })
      .eq('id', property.id)

    setLoading(false)
    if (error) {
      toast({ title: 'Erro', description: 'Falha ao atualizar imóvel.', variant: 'destructive' })
    } else {
      toast({
        title: 'Sucesso',
        description: 'Imóvel atualizado!',
        className: 'bg-card border-primary/50 text-white',
      })
      onOpenChange(false)
      onSuccess()
    }
  }

  if (!property) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Editar Imóvel</SheetTitle>
          <SheetDescription>Atualize as informações do seu imóvel divulgado.</SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div className="space-y-3">
            <Label>Fotos do Imóvel (Máx. 5)</Label>
            <div className="grid grid-cols-4 gap-2">
              {photos.map((url, i) => (
                <div
                  key={i}
                  className="relative aspect-square rounded-md overflow-hidden bg-secondary border border-border group"
                >
                  <img src={url} alt={`Foto ${i + 1}`} className="object-cover w-full h-full" />
                  <button
                    type="button"
                    onClick={() => setPhotos((p) => p.filter((u) => u !== url))}
                    className="absolute top-1 right-1 bg-black/60 hover:bg-black p-1 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
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
                    <span className="text-[10px] text-muted-foreground animate-pulse text-center">
                      Enviando...
                    </span>
                  ) : (
                    <ImageIcon className="w-5 h-5 text-muted-foreground" />
                  )}
                </label>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Status do Imóvel</Label>
            <Select name="status" defaultValue={property.metadata?.status || 'Ativo'}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Ativo">Ativo (Disponível)</SelectItem>
                <SelectItem value="Vendido">Vendido</SelectItem>
                <SelectItem value="Suspenso">Suspenso / Pausado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo de Imóvel</Label>
              <Select
                name="tipo_imovel"
                required
                defaultValue={property.metadata?.tipo_imovel || 'Apartamento'}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['Apartamento', 'Cobertura', 'Casa', 'Terreno', 'Sala Comercial', 'Flat'].map(
                    (o) => (
                      <SelectItem key={o} value={o}>
                        {o}
                      </SelectItem>
                    ),
                  )}
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
            <Label>Cidade</Label>
            <AddressAutocomplete
              name="cidade"
              required
              types={['(cities)']}
              value={city}
              onChange={setCity}
              onSelect={(details) => {
                setCity(details.city || details.formattedAddress.split(',')[0])
                if (details.state) setStateLocation(details.state)
              }}
              placeholder="Ex: Rio de Janeiro"
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
                if (details.city) setCity(details.city)
                if (details.state) setStateLocation(details.state)
              }}
              placeholder="Ex: Barra da Tijuca"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Complemento (Opcional)</Label>
              <Input
                name="complemento"
                defaultValue={property.metadata?.complemento || ''}
                placeholder="Ex: Apto 101"
              />
            </div>
            <div className="space-y-2">
              <Label>Andar (Opcional)</Label>
              <Input
                name="andar"
                defaultValue={property.metadata?.andar || ''}
                placeholder="Ex: 5"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Quartos</Label>
              <Select name="quartos" required defaultValue={property.metadata?.quartos || '1'}>
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
              <Select name="suites" required defaultValue={property.metadata?.suites || '1'}>
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Área Útil (m²)</Label>
              <Input
                name="tamanho_imovel"
                type="number"
                required
                defaultValue={property.metadata?.tamanho_imovel || ''}
                placeholder="120"
              />
            </div>
            <div className="space-y-2">
              <Label>Terreno (m²)</Label>
              <Input
                name="tamanho_terreno"
                type="number"
                defaultValue={property.metadata?.tamanho_terreno || ''}
                placeholder="200"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nome do Condomínio (Opcional)</Label>
              <Input
                name="nome_condominio"
                defaultValue={property.metadata?.nome_condominio || ''}
                placeholder="Ex: Condomínio Península"
              />
            </div>
            <div className="space-y-2">
              <Label>Link do Imóvel (Opcional)</Label>
              <Input
                name="link_imovel"
                type="url"
                defaultValue={property.metadata?.link_imovel || ''}
                placeholder="https://"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Link do Vídeo (Opcional)</Label>
            <Input
              name="video_url"
              type="url"
              defaultValue={property.metadata?.video_url || ''}
              placeholder="https://youtube.com/..."
            />
          </div>

          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea
              name="description"
              required
              defaultValue={property.metadata?.description || ''}
              placeholder="Diferenciais..."
              className="h-20"
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border p-3 bg-secondary/30">
            <div>
              <Label className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-primary" /> Off-Market
              </Label>
              <p className="text-[10px] text-muted-foreground">
                Não está em portais públicos, apenas para redes privadas.
              </p>
            </div>
            <Switch checked={isOffMarket} onCheckedChange={setIsOffMarket} />
          </div>

          <div className="pt-4 flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={loading || uploadingPhotos}>
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
