const TMDB_BASE = 'https://api.themoviedb.org/3'
const POSTER_BASE = 'https://image.tmdb.org/t/p/w500'
const MAX_POSTERS = 12

async function fetchImages(mediaType, tmdbId, apiKey) {
  const url = new URL(`${TMDB_BASE}/${mediaType}/${tmdbId}/images`)
  url.searchParams.set('api_key', apiKey)
  // Bez omezení na jazyk appky - textless/anglické verze bývají nejpoužitelnější
  // jako "hero" banner, cizojazyčné varianty mívají přes sebe cizí titulky.
  url.searchParams.set('include_image_language', 'en,null')

  const response = await fetch(url)
  if (!response.ok) return null
  return response.json()
}

export default async function handler(req, res) {
  const tmdbId = Number(req.query.tmdbId)
  if (!Number.isInteger(tmdbId) || tmdbId <= 0) {
    res.status(400).json({ error: 'Neplatné tmdbId.' })
    return
  }

  const apiKey = process.env.TMDB_API_KEY
  if (!apiKey) {
    res.status(500).json({ error: 'TMDB_API_KEY není nastavený na serveru.' })
    return
  }

  const kind = typeof req.query.kind === 'string' ? req.query.kind : ''
  // "Anime" není v appce vázané na konkrétní TMDB media_type (viz api/search.js
  // - přiblížení přes žánr běží nad movie i tv), takže se zkusí obojí.
  const mediaTypes = kind === 'film' ? ['movie'] : kind === 'serial' ? ['tv'] : ['tv', 'movie']

  try {
    for (const mediaType of mediaTypes) {
      const data = await fetchImages(mediaType, tmdbId, apiKey)
      const posters = (data?.posters ?? [])
        .sort((a, b) => (b.vote_average ?? 0) - (a.vote_average ?? 0))
        .slice(0, MAX_POSTERS)
        .map((item) => `${POSTER_BASE}${item.file_path}`)

      if (posters.length > 0) {
        res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=604800')
        res.status(200).json({ posters })
        return
      }
    }

    res.status(200).json({ posters: [] })
  } catch {
    res.status(502).json({ error: 'Spojení s TMDB selhalo.' })
  }
}
