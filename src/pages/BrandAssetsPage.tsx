import { useEffect, useRef } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Download } from 'lucide-react'
import { useSEO } from '@/hooks/use-seo'

export default function BrandAssetsPage() {
  useSEO({
    title: 'Ativos da Marca | Prime Circle',
    description:
      'Faça o download do logotipo oficial do Prime Circle para utilizar nas suas redes sociais e perfil do WhatsApp.',
  })

  const fullLogoRef = useRef<HTMLCanvasElement>(null)
  const iconLogoRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    // Draw Full Logo
    const fullCtx = fullLogoRef.current?.getContext('2d')
    if (fullCtx && fullLogoRef.current) {
      const canvas = fullLogoRef.current
      canvas.width = 1024
      canvas.height = 1024

      fullCtx.fillStyle = '#000000'
      fullCtx.fillRect(0, 0, 1024, 1024)

      const cx = 512
      const cy = 512

      // Outer circle
      fullCtx.beginPath()
      fullCtx.arc(cx, cy - 80, 160, 0, Math.PI * 2)
      fullCtx.fillStyle = '#c9a84c'
      fullCtx.fill()

      // Inner circle
      fullCtx.beginPath()
      fullCtx.arc(cx, cy - 80, 70, 0, Math.PI * 2)
      fullCtx.fillStyle = '#000000'
      fullCtx.fill()

      // Text
      fullCtx.font =
        'bold 120px ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
      fullCtx.textAlign = 'left'
      fullCtx.textBaseline = 'middle'

      const primeWidth = fullCtx.measureText('PRIME').width
      const circleWidth = fullCtx.measureText('CIRCLE').width
      const totalWidth = primeWidth + circleWidth
      const startX = cx - totalWidth / 2

      fullCtx.fillStyle = '#ffffff'
      fullCtx.fillText('PRIME', startX, cy + 180)

      fullCtx.fillStyle = '#c9a84c'
      fullCtx.fillText('CIRCLE', startX + primeWidth, cy + 180)
    }

    // Draw Icon Logo
    const iconCtx = iconLogoRef.current?.getContext('2d')
    if (iconCtx && iconLogoRef.current) {
      const canvas = iconLogoRef.current
      canvas.width = 1024
      canvas.height = 1024

      iconCtx.fillStyle = '#000000'
      iconCtx.fillRect(0, 0, 1024, 1024)

      const cx = 512
      const cy = 512

      iconCtx.beginPath()
      iconCtx.arc(cx, cy, 300, 0, Math.PI * 2)
      iconCtx.fillStyle = '#c9a84c'
      iconCtx.fill()

      iconCtx.beginPath()
      iconCtx.arc(cx, cy, 120, 0, Math.PI * 2)
      iconCtx.fillStyle = '#000000'
      iconCtx.fill()
    }
  }, [])

  const handleDownload = (ref: React.RefObject<HTMLCanvasElement>, filename: string) => {
    const canvas = ref.current
    if (!canvas) return
    const url = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 pt-32 pb-24 max-w-5xl">
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-4xl font-bold text-white mb-4">Ativos da Marca</h1>
          <p className="text-muted-foreground text-lg">
            Faça o download do logotipo oficial do Prime Circle para utilizar nas suas redes sociais
            ou perfil do WhatsApp.
          </p>
        </div>

        <div
          className="grid md:grid-cols-2 gap-8 animate-fade-in-up"
          style={{ animationDelay: '100ms' }}
        >
          <Card className="bg-card border-border shadow-elevation">
            <CardHeader>
              <CardTitle className="text-white text-xl">Ícone (WhatsApp / Instagram)</CardTitle>
              <CardDescription>
                Proporção perfeita para avatares de redes sociais onde o nome já aparece na conta.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 flex flex-col items-center">
              <div className="w-48 h-48 rounded-full overflow-hidden border-2 border-primary/50 shadow-[0_0_20px_rgba(201,168,76,0.15)] bg-black">
                <canvas ref={iconLogoRef} className="w-full h-full object-contain" />
              </div>
              <Button
                onClick={() => handleDownload(iconLogoRef, 'prime-circle-icon.png')}
                className="w-full gold-gradient text-black font-bold h-12"
              >
                <Download className="w-4 h-4 mr-2" />
                Baixar para WhatsApp
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-elevation">
            <CardHeader>
              <CardTitle className="text-white text-xl">Logotipo Completo</CardTitle>
              <CardDescription>
                Ideal para uso em materiais, publicações e assinaturas onde a marca precisa ser lida
                claramente.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 flex flex-col items-center">
              <div className="w-48 h-48 rounded-2xl overflow-hidden border border-border shadow-[0_0_20px_rgba(201,168,76,0.15)] bg-black">
                <canvas ref={fullLogoRef} className="w-full h-full object-contain" />
              </div>
              <Button
                onClick={() => handleDownload(fullLogoRef, 'prime-circle-logo.png')}
                className="w-full bg-secondary text-white hover:bg-secondary/80 border border-border font-bold h-12"
              >
                <Download className="w-4 h-4 mr-2" />
                Baixar Logotipo Completo
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}
