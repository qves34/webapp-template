const TMDB_BASE = 'https://api.themoviedb.org/3'
const IMAGE_BASE = 'https://image.tmdb.org/t/p/w185'

export default async function handler(req, res) {
  const query = typeof req.query.q === 'string' ? req.query.q.trim() : ''
  if (!query) {
    res.status(200).json({ results: [] })
    return
  }

  const apiKey = process.env.TMDB_API_KEY
  if (!apiKey) {
    res.status(500).json({ error: 'TMDB_API_KEY není nastavený na serveru.' })
    return
  }

  const url = new URL(`${TMDB_BASE}/search/multi`)
  url.searchParams.set('api_key', apiKey)
  url.searchParams.set('query', query)
  url.searchParams.set('include_adult', 'false')
  url.searchParams.set('language', 'cs-CZ')

  try {
    const response = await fetch(url)
    if (!response.ok) {
      res.status(502).json({ error: `TMDB odpověděl ${response.status}.` })
      return
    }

    const data = await response.json()
    const results = (data.results ?? [])
      .filter((item) => item.media_type === 'movie' || item.media_type === 'tv')
      .slice(0, 8)
      .map((item) => ({
        tmdbId: item.id,
        title: item.title ?? item.name ?? '',
        kind: item.media_type === 'movie' ? 'film' : 'serial',
        year: (item.release_date ?? item.first_air_date ?? '').slice(0, 4) || null,
        poster: item.poster_path ? `${IMAGE_BASE}${item.poster_path}` : null,
      }))
      .filter((item) => item.title)

    res.status(200).json({ results })
  } catch {
    res.status(502).json({ error: 'Spojení s TMDB selhalo.' })
  }
}
