import { useEffect, useState } from 'react'

export default function useMediaQuery() {
  const [matches, setMatches] = useState({
    isMobile: typeof window !== 'undefined' ? window.matchMedia('(max-width: 768px)').matches : false,
    isTouch: typeof window !== 'undefined' ? window.matchMedia('(pointer: coarse)').matches : false,
    prefersReducedMotion: typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false,
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mqMobile = window.matchMedia('(max-width: 768px)')
    const mqTouch = window.matchMedia('(pointer: coarse)')
    const mqReduced = window.matchMedia('(prefers-reduced-motion: reduce)')

    const handler = () => {
      setMatches({
        isMobile: mqMobile.matches,
        isTouch: mqTouch.matches,
        prefersReducedMotion: mqReduced.matches,
      })
    }

    handler()

    mqMobile.addEventListener('change', handler)
    mqTouch.addEventListener('change', handler)
    mqReduced.addEventListener('change', handler)

    return () => {
      mqMobile.removeEventListener('change', handler)
      mqTouch.removeEventListener('change', handler)
      mqReduced.removeEventListener('change', handler)
    }
  }, [])

  return matches
}
