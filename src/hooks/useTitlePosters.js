import { useEffect, useState } from 'react'

/** Dostupné plakáty ke konkrétnímu titulu z TMDB - pro výběr vlastního banneru. */
export function useTitlePosters(tmdbId, kind, enabled) {
  const [posters, setPosters] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!enabled || !tmdbId) {
      setPosters([])
      return
    }

    let cancelled = false
    setLoading(true)
    fetch(`/api/posters?tmdbId=${tmdbId}&kind=${encodeURIComponent(kind ?? '')}`)
      .then((response) => (response.ok ? response.json() : { posters: [] }))
      .then((data) => {
        if (cancelled) return
        setPosters(data.posters ?? [])
        setLoading(false)
      })
      .catch(() => {
        if (cancelled) return
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [tmdbId, kind, enabled])

  return { posters, loading }
}
