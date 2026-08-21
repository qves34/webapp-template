import { useEffect, useState } from 'react'

// Modulová cache - trendující žebříček se v rámci jedné session nemění,
// není důvod volat /api/banners znovu při každém přepnutí panelu Vzhled.
let cache = null

/**
 * Pár aktuálně nejoblíbenějších titulů (TMDB trending + AniList).
 * Nepoužívá se momentálně nikde - banner "Trendující" byl na žádost
 * uživatele odebraný (viz dokumentace.md), tenhle hook i /api/banners
 * ale zůstávají, plánovaná je samostatná stránka "Trendující"
 * (top 5 filmů/seriálů/anime právě teď), co je bude znovu využívat.
 */
export function useFamousBanners(enabled) {
  const [items, setItems] = useState(cache ?? [])

  useEffect(() => {
    if (!enabled || cache) return

    let cancelled = false
    fetch('/api/banners')
      .then((response) => (response.ok ? response.json() : { results: [] }))
      .then((data) => {
        if (cancelled) return
        cache = data.results ?? []
        setItems(cache)
      })
      .catch(() => {
        // Ticho - appka bez banneru "Z filmů" funguje dál normálně.
      })

    return () => {
      cancelled = true
    }
  }, [enabled])

  return { items }
}
