import { useEffect, useMemo, useRef, useState } from 'react'

const MAX_SEEDS = 8
export const MIN_SEEDS = 2

/**
 * Tituly appka bere jako "vkus" uživatele - oblíbené i vysoko ohodnocené
 * dokoukané, jen ty s tmdbId (ručně zapsané titulům TMDB doporučení dát nemá
 * z čeho). Favoritů dá přednost před hodnocením - jsou to jasnější signál.
 */
function pickSeeds(items) {
  const candidates = items.filter(
    (item) => item.tmdbId != null && (item.favorite || (item.status === 'hotovo' && (item.rating ?? 0) >= 7)),
  )
  candidates.sort((a, b) => {
    if (a.favorite !== b.favorite) return a.favorite ? -1 : 1
    return (b.rating ?? 0) - (a.rating ?? 0)
  })

  const seen = new Set()
  const seeds = []
  for (const item of candidates) {
    if (seen.has(item.tmdbId)) continue
    seen.add(item.tmdbId)
    seeds.push({ tmdbId: item.tmdbId, kind: item.kind })
    if (seeds.length >= MAX_SEEDS) break
  }
  return seeds
}

/** Doporučení podle TMDB `/recommendations` nad tituly, co uživatel ohodnotil vysoko/oblíbil. */
export function useRecommendations(items, enabled) {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const cacheRef = useRef({ signature: null, results: [] })

  const seeds = useMemo(() => pickSeeds(items), [items])
  const exclude = useMemo(
    () => items.filter((item) => item.tmdbId != null).map((item) => item.tmdbId),
    [items],
  )
  const signature = seeds.map((seed) => `${seed.kind}:${seed.tmdbId}`).join(',')

  useEffect(() => {
    if (!enabled || seeds.length < MIN_SEEDS) return

    if (cacheRef.current.signature === signature) {
      setResults(cacheRef.current.results)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(false)
    fetch('/api/recommendations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ seeds, exclude }),
    })
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data) => {
        if (cancelled) return
        const list = data.results ?? []
        cacheRef.current = { signature, results: list }
        setResults(list)
        setLoading(false)
      })
      .catch(() => {
        if (cancelled) return
        setError(true)
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
    // `seeds`/`exclude` se přepočítají z `items` při každém renderu (i když
    // se přidá/upraví titul mimo doporučení) - k refetchi stačí, když se
    // reálně změní `signature`, jinak by přidání doporučení hned zahodilo cache.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, signature])

  return { results, loading, error, seedCount: seeds.length }
}
