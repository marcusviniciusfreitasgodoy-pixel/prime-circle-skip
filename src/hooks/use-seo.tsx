import { useEffect } from 'react'

interface SEOProps {
  title: string
  description?: string
}

export function useSEO({ title, description }: SEOProps) {
  useEffect(() => {
    // Define o título da aba do navegador
    document.title = title

    // Define ou atualiza a meta description para mecanismos de busca / PWA
    if (description) {
      let metaDescription = document.querySelector('meta[name="description"]')
      if (metaDescription) {
        metaDescription.setAttribute('content', description)
      } else {
        metaDescription = document.createElement('meta')
        metaDescription.setAttribute('name', 'description')
        metaDescription.setAttribute('content', description)
        document.head.appendChild(metaDescription)
      }

      // Atualiza o og:description dinamicamente (útil caso o crawler execute JS, como o do Google)
      let ogDescription = document.querySelector('meta[property="og:description"]')
      if (ogDescription) {
        ogDescription.setAttribute('content', description)
      }
    }
  }, [title, description])
}
