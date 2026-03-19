import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Download, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

export function PwaInstallPrompt() {
  const [isStandalone, setIsStandalone] = useState(true)
  const [dismissed, setDismissed] = useState(false)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    const isStandaloneQuery = window.matchMedia('(display-mode: standalone)').matches
    const isIosStandalone = 'standalone' in window.navigator && (window.navigator as any).standalone

    if (!isStandaloneQuery && !isIosStandalone) {
      setIsStandalone(false)
    }

    if (localStorage.getItem('pwa_prompt_dismissed')) {
      setDismissed(true)
    }
  }, [])

  if (isStandalone || dismissed) return null

  return (
    <>
      <div className="mb-6 p-4 rounded-lg bg-primary/10 border border-primary/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in">
        <div>
          <h4 className="text-primary font-semibold text-lg flex items-center gap-2">
            <Download className="w-5 h-5" /> Instalar App Prime Circle
          </h4>
          <p className="text-white/80 text-sm mt-1">
            Adicione o Prime Circle à tela inicial do seu celular para acesso rápido e notificações
            em tempo real.
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            onClick={() => setShowModal(true)}
            className="flex-1 sm:flex-none gold-gradient text-black font-semibold"
          >
            Ver Instruções
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setDismissed(true)
              localStorage.setItem('pwa_prompt_dismissed', 'true')
            }}
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </Button>
        </div>
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Como instalar o aplicativo</DialogTitle>
            <DialogDescription>
              Siga os passos abaixo de acordo com o seu sistema:
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2 bg-secondary p-4 rounded-lg">
              <h5 className="font-bold text-white flex items-center gap-2">🍎 iOS (iPhone/iPad)</h5>
              <p className="text-sm text-muted-foreground">
                1. Abra este site no <strong>Safari</strong>.
              </p>
              <p className="text-sm text-muted-foreground">
                2. Toque no ícone de <strong>Compartilhar</strong> (quadrado com seta para cima) na
                barra inferior.
              </p>
              <p className="text-sm text-muted-foreground">
                3. Role para baixo e selecione <strong>Adicionar à Tela de Início</strong>.
              </p>
            </div>
            <div className="space-y-2 bg-secondary p-4 rounded-lg">
              <h5 className="font-bold text-white flex items-center gap-2">🤖 Android</h5>
              <p className="text-sm text-muted-foreground">
                1. Abra este site no <strong>Google Chrome</strong>.
              </p>
              <p className="text-sm text-muted-foreground">
                2. Toque nos <strong>três pontinhos</strong> no canto superior direito.
              </p>
              <p className="text-sm text-muted-foreground">
                3. Selecione <strong>Instalar aplicativo</strong> ou{' '}
                <strong>Adicionar à Tela Inicial</strong>.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
