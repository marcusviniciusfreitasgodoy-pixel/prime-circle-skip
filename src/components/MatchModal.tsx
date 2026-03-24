import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { AddPropertyDialog } from '@/components/dashboard/AddPropertyDialog'
import { PlusCircle } from 'lucide-react'

export function MatchModal({
  need,
  isOpen,
  onClose,
}: {
  need: any | null
  isOpen: boolean
  onClose: () => void
}) {
  const { user } = useAuth()
  const [myProperties, setMyProperties] = useState<any[]>([])
  const [selectedProperty, setSelectedProperty] = useState('')
  const [loading, setLoading] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    if (isOpen && user) {
      const fetchProps = async () => {
        const { data } = await supabase
          .from('documents')
          .select('*')
          .contains('metadata', { type: 'oferta', user_id: user.id })

        if (data) {
          setMyProperties(data)
        }
      }
      fetchProps()
    }
  }, [isOpen, user, refreshKey])

  const handleConfirm = async () => {
    if (!selectedProperty || !need || !user) return
    setLoading(true)

    const demandId = typeof need.id === 'string' && !need.metadata ? parseInt(need.id) : need.id
    const brokerDemandId = need.metadata?.user_id || need.ownerId
    const demandTitle = need.metadata?.tipo_imovel || need.title || 'Demanda'

    if (isNaN(demandId) && !need.metadata) {
      toast.success('Parceria proposta localmente!')
      onClose()
      setLoading(false)
      return
    }

    const property = myProperties.find((p) => p.id.toString() === selectedProperty)
    if (!property) {
      setLoading(false)
      return
    }

    const { data: existing } = await supabase
      .from('partnerships')
      .select('id')
      .eq('demand_id', demandId)
      .eq('property_id', property.id)
      .single()

    if (existing) {
      toast.error('Você já vinculou este imóvel a esta demanda!')
      setLoading(false)
      return
    }

    const { error } = await supabase.from('partnerships').insert({
      demand_id: demandId,
      property_id: property.id,
      broker_demand_id: brokerDemandId,
      broker_property_id: user.id,
      status: 'match',
    })

    if (error) {
      toast.error('Erro ao vincular imóvel.')
    } else {
      toast.success('Parceria proposta! O negócio foi adicionado ao seu funil.')

      if (brokerDemandId) {
        const { data: partnerProfile } = await supabase
          .from('profiles')
          .select('full_name, whatsapp_number')
          .eq('id', brokerDemandId)
          .single()

        if (partnerProfile?.whatsapp_number) {
          const partnerName = partnerProfile.full_name || 'Corretor'
          const propertyDetails = property.metadata?.tipo_imovel || 'Imóvel'
          const msg = `Olá ${partnerName}! Um corretor da Prime Circle acaba de vincular o imóvel "${propertyDetails}" que atende à sua demanda ("${demandTitle}"). Acesse a plataforma para conferir os detalhes e iniciar a negociação: https://www.primecircle.app.br/dashboard`
          await supabase.functions.invoke('send-whatsapp', {
            body: { number: partnerProfile.whatsapp_number, text: msg, user_id: brokerDemandId },
          })
        }
      }

      onClose()
      setSelectedProperty('')
    }
    setLoading(false)
  }

  const demandTitle = need?.metadata?.tipo_imovel || need?.title || 'Demanda'

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-card border-border sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-white text-xl">Vincular Imóvel à Demanda</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Escolha um dos seus imóveis disponíveis para propor parceria (50/50) nesta demanda:{' '}
            <span className="text-white font-medium">{demandTitle}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {myProperties.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-5 bg-secondary/20 rounded-lg border border-border border-dashed text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Você ainda não tem imóveis cadastrados para vincular.
              </p>
              <AddPropertyDialog
                onSuccess={() => setRefreshKey((k) => k + 1)}
                trigger={
                  <Button
                    variant="outline"
                    className="border-primary/50 text-primary hover:bg-primary/10 w-full"
                  >
                    <PlusCircle className="w-4 h-4 mr-2" /> Cadastrar Novo Imóvel
                  </Button>
                }
              />
            </div>
          ) : (
            <div className="space-y-4">
              <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                <SelectTrigger className="w-full bg-background border-border text-white">
                  <SelectValue placeholder="Selecione um imóvel" />
                </SelectTrigger>
                <SelectContent>
                  {myProperties.map((p) => {
                    const title = p.metadata?.tipo_imovel || 'Imóvel'
                    const bairro = p.metadata?.bairro || p.metadata?.region || ''
                    const valor = p.metadata?.valor
                      ? new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(p.metadata.valor)
                      : ''
                    return (
                      <SelectItem key={p.id} value={p.id.toString()}>
                        {title} {bairro ? `- ${bairro}` : ''} {valor ? `(${valor})` : ''}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>

              <div className="flex justify-end pt-1">
                <AddPropertyDialog
                  onSuccess={() => setRefreshKey((k) => k + 1)}
                  trigger={
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary hover:text-primary hover:bg-primary/10"
                    >
                      <PlusCircle className="w-4 h-4 mr-2" /> Não é este? Cadastrar outro
                    </Button>
                  }
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-border mt-2">
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-muted-foreground hover:text-white"
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedProperty || loading}
            className="gold-gradient text-black"
          >
            {loading ? 'Vinculando...' : 'Confirmar Conexão'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
