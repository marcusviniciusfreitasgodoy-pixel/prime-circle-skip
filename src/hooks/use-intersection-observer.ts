import { useEffect, useState, useRef, RefObject } from 'react'

interface Args extends IntersectionObserverInit {
  freezeOnceVisible?: boolean
}

export function useIntersectionObserver({
  threshold = 0,
  root = null,
  rootMargin = '0%',
  freezeOnceVisible = true,
}: Args = {}): [RefObject<HTMLDivElement | null>, boolean] {
  const ref = useRef<HTMLDivElement>(null)
  const [isIntersecting, setIsIntersecting] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isElementIntersecting = entry.isIntersecting
        if (isElementIntersecting) {
          setIsIntersecting(true)
          if (freezeOnceVisible) {
            observer.unobserve(element)
          }
        } else if (!freezeOnceVisible) {
          setIsIntersecting(false)
        }
      },
      { threshold, root, rootMargin },
    )

    observer.observe(element)

    return () => {
      if (element) {
        observer.unobserve(element)
      }
    }
  }, [threshold, root, rootMargin, freezeOnceVisible])

  return [ref as RefObject<HTMLDivElement | null>, isIntersecting]
}
