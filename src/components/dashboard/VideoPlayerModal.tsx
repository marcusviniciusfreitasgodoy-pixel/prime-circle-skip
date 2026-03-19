import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

function getEmbedUrl(url: string) {
  if (!url) return ''

  // Format YouTube URLs
  const ytMatch = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})/,
  )
  if (ytMatch && ytMatch[1]) {
    return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1`
  }

  // Format Vimeo URLs
  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?([0-9]+)/)
  if (vimeoMatch && vimeoMatch[1]) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`
  }

  return url
}

interface VideoPlayerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  url: string | null
}

export function VideoPlayerModal({ open, onOpenChange, url }: VideoPlayerModalProps) {
  if (!url) return null
  const embedUrl = getEmbedUrl(url)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl p-0 overflow-hidden bg-black border-border shadow-2xl">
        <DialogHeader className="sr-only">
          <DialogTitle>Visualizador de Vídeo</DialogTitle>
          <DialogDescription>Assista ao vídeo da propriedade selecionada.</DialogDescription>
        </DialogHeader>
        <div className="relative pt-[56.25%] w-full bg-black">
          <iframe
            src={embedUrl}
            className="absolute top-0 left-0 w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
