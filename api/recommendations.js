const TMDB_BASE = 'https://api.themoviedb.org/3'
const IMAGE_BASE = 'https://image.tmdb.org/t/p/w185'
const TMDB_LANGUAGE = 'en-US'
const MAX_SEEDS = 8
const MAX_RESULTS = 16

// Stejná aproximace jako api/search.js - TMDB nemá kategorii "anime".
function guessKind(item, mediaType) {
  const isAnime = (item.genre_ids ?? []).includes(16) && item.original_language === 'ja'
  if (isAnime) return 'anime'
  return mediaType === 'movie' ? 'film' : 'serial'
}

// Anime v appce nedrží vlastní TMDB media_type - zkusí se obojí, stejně
// jako u api/posters.js, jen tady se výsledky z obou (pokud existují) sečtou.
function mediaTypesFor(kind) {
  if (kind === 'film') return ['movie']
  if (kind === 'serial') return ['tv']
  return ['tv', 'movie']
}

async function fetchRecommendations(mediaType, tmdbId, apiKey) {
  const url = new URL(`${TMDB_BASE}/${mediaType}/${tmdbId}/recommendations`)
  url.searchParams.set('api_key', apiKey)
  url.searchParams.set('language', TMDB_LANGUAGE)

  try {
    const response = await fetch(url)
    if (!response.ok) return []
    const data = await response.json()
    return (data.results ?? []).map((item) => ({ item, mediaType }))
  } catch {
    return []
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Jen POST.' })
    return
  }

  const apiKey = process.env.TMDB_API_KEY
  if (!apiKey) {
    res.status(500).json({ error: 'TMDB_API_KEY není nastavený na serveru.' })
    return
  }

  const body = typeof req.body === 'object' && req.body ? req.body : {}
  const seeds = Array.isArray(body.seeds) ? body.seeds : []
  const exclude = new Set(Array.isArray(body.exclude) ? body.exclude : [])

  const validSeeds = seeds
    .filter((seed) => Number.isInteger(seed?.tmdbId) && typeof seed?.kind === 'string')
    .slice(0, MAX_SEEDS)

  if (validSeeds.length === 0) {
    res.status(200).json({ results: [] })
    return
  }

  const fetches = validSeeds.flatMap((seed) =>
    mediaTypesFor(seed.kind).map((mediaType) => fetchRecommendations(mediaType, seed.tmdbId, apiKey)),
  )
  const batches = await Promise.all(fetches)

  // Sečíst přes seedy: kolikrát se titul objevil = jak moc "sedí" k víc
  // oblíbeným/ohodnoceným titulům najednou, ne jen náhodně k jednomu.
  const byId = new Map()
  for (const batch of batches) {
    for (const { item, mediaType } of batch) {
      if (!item.id || exclude.has(item.id)) continue
      const existing = byId.get(item.id)
      if (existing) {
        existing.score += 1
        continue
      }
      byId.set(item.id, {
        tmdbId: item.id,
        title: item.title ?? item.name ?? '',
        kind: guessKind(item, mediaType),
        year: (item.release_date ?? item.first_air_date ?? '').slice(0, 4) || null,
        poster: item.poster_path ? `${IMAGE_BASE}${item.poster_path}` : null,
        score: 1 + (item.vote_average ?? 0) / 10,
      })
    }
  }

  const results = [...byId.values()]
    .filter((item) => item.title)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_RESULTS)
    .map(({ score: _score, ...item }) => item)

  res.status(200).json({ results })
}
