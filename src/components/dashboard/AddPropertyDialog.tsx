import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { cn } from '@/lib/utils'
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
import { PlusCircle, Lock, Image as ImageIcon, X, AlertCircle } from 'lucide-react'
import { AddressAutocomplete } from '@/components/ui/address-autocomplete'

const formatCurrency = (value: string) => {
  const digits = value.replace(/\D/g, '')
  if (!digits) return ''
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
    parseInt(digits, 10) / 100,
  )
}
const parseCurrency = (val: string) => parseInt(val.replace(/\D/g, '') || '0', 10) / 100

async function calculateHash(file: File): Promise<string> {
  try {
    const buffer = await file.arrayBuffer()
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
  } catch (e) {
    console.error('Failed to calculate image hash', e)
    return Math.random().toString(36).substring(2)
  }
}

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
  const [imageHashes, setImageHashes] = useState<string[]>([])
  const [uploadingPhotos, setUploadingPhotos] = useState(false)

  const [endereco, setEndereco] = useState('')
  const [bairro, setBairro] = useState('')
  const [city, setCity] = useState('')
  const [stateLocation, setStateLocation] = useState('')

  // Controlled states for duplicate detection
  const [tamanhoImovel, setTamanhoImovel] = useState('')
  const [nomeCondominio, setNomeCondominio] = useState('')
  const [suites, setSuites] = useState('1')
  const [andar, setAndar] = useState('')

  // Duplication states
  const [potentialDuplicates, setPotentialDuplicates] = useState<any[]>([])
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false)
  const [confirmedDuplicate, setConfirmedDuplicate] = useState(false)

  useEffect(() => {
    if (!open) {
      setPhotos([])
      setImageHashes([])
      setValor('')
      setIsOffMarket(false)
      setEndereco('')
      setBairro('')
      setCity('')
      setStateLocation('')
      setTamanhoImovel('')
      setNomeCondominio('')
      setSuites('1')
      setAndar('')
      setPotentialDuplicates([])
      setShowDuplicateWarning(false)
      setConfirmedDuplicate(false)
    }
  }, [open])

  useEffect(() => {
    const check = async () => {
      if (!bairro || !tamanhoImovel) {
        setPotentialDuplicates([])
        setShowDuplicateWarning(false)
        return
      }

      const { data } = await supabase
        .from('documents')
        .select('id, metadata')
        .eq('metadata->>type', 'oferta')
        .eq('metadata->>bairro', bairro)

      if (data) {
        const size = Number(tamanhoImovel)
        const minSize = size * 0.95
        const maxSize = size * 1.05

        const duplicates = data.filter((d) => {
          const md = d.metadata
          const mdSize = Number(md.tamanho_imovel)
          const sizeMatch = mdSize >= minSize && mdSize <= maxSize

          const isSameCondo =
            nomeCondominio &&
            md.nome_condominio &&
            md.nome_condominio.toLowerCase().trim() === nomeCondominio.toLowerCase().trim()
          const isSameStreet =
            endereco &&
            md.endereco &&
            md.endereco.toLowerCase().trim() === endereco.toLowerCase().trim()
          const locationMatch = isSameCondo || isSameStreet

          const suitesMatch = md.suites === suites

          const mdHashes = md.image_hashes || []
          const hashMatch =
            imageHashes.length > 0 && mdHashes.some((h: string) => imageHashes.includes(h))

          return hashMatch || (sizeMatch && locationMatch && suitesMatch)
        })

        setPotentialDuplicates(duplicates)
        if (duplicates.length > 0) {
          setShowDuplicateWarning(true)
        } else {
          setShowDuplicateWarning(false)
        }
      }
    }

    const timer = setTimeout(check, 800)
    return () => clearTimeout(timer)
  }, [bairro, endereco, tamanhoImovel, nomeCondominio, suites, imageHashes])

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
      const newHashes: string[] = []

      for (const file of Array.from(files)) {
        const hash = await calculateHash(file)
        newHashes.push(hash)

        const ext = file.name.split('.').pop()
        const path = `${user.id}/${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`
        const { error } = await supabase.storage.from('property_photos').upload(path, file)
        if (error) throw error
        const { data } = supabase.storage.from('property_photos').getPublicUrl(path)
        newPhotos.push(data.publicUrl)
      }

      setPhotos((prev) => [...prev, ...newPhotos])
      setImageHashes((prev) => [...prev, ...newHashes])
      toast({ title: 'Sucesso', description: 'Fotos adicionadas e validadas.' })
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
    const suitesVal = String(fd.get('suites') || suites)
    const banheiros = String(fd.get('banheiros') || '')
    const vagas = String(fd.get('vagas') || '')
    const tamanho_imovel_val = Number(fd.get('tamanho_imovel')) || Number(tamanhoImovel)
    const tamanho_terreno_val = fd.get('tamanho_terreno')
    const tamanho_terreno = tamanho_terreno_val ? Number(tamanho_terreno_val) : null
    const nome_condominio_val = String(fd.get('nome_condominio') || nomeCondominio)
    const andar_val = String(fd.get('andar') || andar)
    const link_imovel = String(fd.get('link_imovel') || '')
    const video_url_val = fd.get('video_url')
    const video_url = video_url_val ? String(video_url_val) : null
    const description = String(fd.get('description') || '')

    const hasDups = potentialDuplicates.length > 0

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
      andar: andar_val,
      quartos,
      suites: suitesVal,
      banheiros,
      vagas,
      tamanho_imovel: tamanho_imovel_val,
      tamanho_terreno,
      nome_condominio: nome_condominio_val,
      link_imovel,
      video_url,
      description,
      status: 'Ativo',
      photos,
      image_hashes: imageHashes,
      is_verified_unique: confirmedDuplicate,
      has_duplicate_history: hasDups,
      duplicate_of: hasDups ? potentialDuplicates.map((d) => d.id) : null,
      resolution: hasDups ? 'pending' : null,
    }

    const content = `Tipo: ${md.tipo_imovel}\nBairro: ${md.neighborhood}\nEndereço: ${md.street} ${md.complemento ? `- ${md.complemento}` : ''}\nAndar: ${md.andar}\nCidade: ${md.city}\nEstado: ${md.state}\nValor: R$ ${md.valor}\nQuartos: ${md.quartos}\nSuítes: ${md.suites}\nBanheiros: ${md.banheiros}\nVagas: ${md.vagas}\nDetalhes: ${md.description}`

    const { error } = await supabase.from('documents').insert({ content, metadata: md })

    setLoading(false)
    if (error) {
      toast({ title: 'Erro', description: 'Falha ao divulgar imóvel.', variant: 'destructive' })
    } else {
      toast({
        title: 'Sucesso',
        description: confirmedDuplicate
          ? 'Imóvel publicado! Ele passará pela Curadoria da plataforma.'
          : 'Imóvel publicado!',
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
                    onClick={() => {
                      setPhotos((p) => p.filter((u) => u !== url))
                      setImageHashes((h) => h.filter((_, idx) => idx !== i))
                    }}
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
                    accept="image/png, image/jpeg, image/jpg, image/webp"
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <Select name="suites" required value={suites} onValueChange={setSuites}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['0', '1', '2', '3', '4', '5 ou mais'].map((o) => (
                    <SelectItem key={o} value={o}>
                      {o}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Banheiros</Label>
              <Select name="banheiros" required defaultValue="1">
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
              <Label>Vagas</Label>
              <Select name="vagas" required defaultValue="1">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['0', '1', '2', '3', '4', '5 ou mais'].map((o) => (
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
                placeholder="120"
                value={tamanhoImovel}
                onChange={(e) => setTamanhoImovel(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Terreno (m²) (Opcional)</Label>
              <Input name="tamanho_terreno" type="number" placeholder="200" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Condomínio (Opcional)</Label>
              <Input
                name="nome_condominio"
                placeholder="Ex: Península"
                value={nomeCondominio}
                onChange={(e) => setNomeCondominio(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Andar (Opcional)</Label>
              <Input
                name="andar"
                placeholder="Ex: 5"
                value={andar}
                onChange={(e) => setAndar(e.target.value)}
              />
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

          {showDuplicateWarning && potentialDuplicates.length > 0 && (
            <Alert className="bg-yellow-500/10 border-yellow-500/50 text-yellow-500 animate-fade-in-up">
              <AlertCircle className="w-5 h-5 text-yellow-500" />
              <AlertTitle className="font-semibold ml-2">Atenção: Possível Duplicidade</AlertTitle>
              <AlertDescription className="ml-2 mt-2">
                <p className="mb-2 text-sm text-yellow-500/90">
                  Identificamos imóveis com características similares ou fotos iguais já cadastrados
                  na rede.
                </p>
                <div className="bg-background/40 rounded-md p-2 max-h-[100px] overflow-y-auto border border-yellow-500/20 mb-3">
                  <ul className="list-disc pl-4 space-y-1 text-xs text-yellow-500/80">
                    {potentialDuplicates.map((d) => (
                      <li key={d.id}>
                        {d.metadata?.tipo_imovel} - {d.metadata?.tamanho_imovel}m²
                        {d.metadata?.nome_condominio ? ` (${d.metadata.nome_condominio})` : ''}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex items-center gap-3 p-3 bg-background/80 rounded-lg border border-yellow-500/30">
                  <Switch
                    id="confirm-diff"
                    checked={confirmedDuplicate}
                    onCheckedChange={(c) => setConfirmedDuplicate(c)}
                  />
                  <label
                    htmlFor="confirm-diff"
                    className="text-sm font-medium cursor-pointer text-white"
                  >
                    Confirmo que é uma unidade diferente (Selo de Unidade Validada)
                  </label>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            className={cn(
              'w-full mt-4',
              potentialDuplicates.length > 0 && !confirmedDuplicate
                ? 'bg-secondary text-muted-foreground'
                : '',
            )}
            disabled={
              loading || uploadingPhotos || (potentialDuplicates.length > 0 && !confirmedDuplicate)
            }
          >
            {loading
              ? 'Salvando...'
              : potentialDuplicates.length > 0 && !confirmedDuplicate
                ? 'Confirme a unidade para publicar'
                : 'Publicar Imóvel'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
