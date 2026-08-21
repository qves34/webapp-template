const TMDB_BASE = 'https://api.themoviedb.org/3'
const IMAGE_BASE = 'https://image.tmdb.org/t/p/w185'

/**
 * Názvy titulů se drží anglicky bez ohledu na jazyk UI - anglický název je
 * univerzálnější a hlavně existuje vždycky, kdežto český na TMDB u spousty
 * anime a méně známých seriálů chybí (a vrátil by se stejně původní).
 * Díky tomu je uložený název jednoznačný a hledání v seznamu má co hledat.
 * Ovlivňuje jen jazyk *odpovědi*, ne to, co TMDB najde - dotaz se pořád
 * matchuje i proti přeloženým názvům, takže "Duna" najde Dune.
 */
const TMDB_LANGUAGE = 'en-US'

const KIND_FILTERS = {
  film: (item) => item.media_type === 'movie',
  serial: (item) => item.media_type === 'tv',
  // TMDB nemá kategorii "anime" - přiblížíme ji přes žánr Animace + japonský originál.
  anime: (item) =>
    (item.media_type === 'movie' || item.media_type === 'tv') &&
    (item.genre_ids ?? []).includes(16) &&
    item.original_language === 'ja',
}

export default async function handler(req, res) {
  const query = typeof req.query.q === 'string' ? req.query.q.trim() : ''
  if (!query) {
    res.status(200).json({ results: [] })
    return
  }

  const kind = typeof req.query.kind === 'string' ? req.query.kind : ''
  const matchesKind = KIND_FILTERS[kind]

  const apiKey = process.env.TMDB_API_KEY
  if (!apiKey) {
    res.status(500).json({ error: 'TMDB_API_KEY není nastavený na serveru.' })
    return
  }

  const url = new URL(`${TMDB_BASE}/search/multi`)
  url.searchParams.set('api_key', apiKey)
  url.searchParams.set('query', query)
  url.searchParams.set('include_adult', 'false')
  url.searchParams.set('language', TMDB_LANGUAGE)

  try {
    const response = await fetch(url)
    if (!response.ok) {
      res.status(502).json({ error: `TMDB odpověděl ${response.status}.` })
      return
    }

    const data = await response.json()
    const results = (data.results ?? [])
      .filter((item) => item.media_type === 'movie' || item.media_type === 'tv')
      .filter((item) => (matchesKind ? matchesKind(item) : true))
      .slice(0, 8)
      .map((item) => ({
        tmdbId: item.id,
        title: item.title ?? item.name ?? '',
        kind: kind === 'anime' ? 'anime' : item.media_type === 'movie' ? 'film' : 'serial',
        year: (item.release_date ?? item.first_air_date ?? '').slice(0, 4) || null,
        poster: item.poster_path ? `${IMAGE_BASE}${item.poster_path}` : null,
      }))
      .filter((item) => item.title)

    res.status(200).json({ results })
  } catch {
    res.status(502).json({ error: 'Spojení s TMDB selhalo.' })
  }
}
