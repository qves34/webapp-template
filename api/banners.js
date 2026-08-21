const TMDB_TRENDING_URL = 'https://api.themoviedb.org/3/trending/all/week'
const TMDB_BACKDROP_BASE = 'https://image.tmdb.org/t/p/w1280'
const ANILIST_URL = 'https://graphql.anilist.co'
const PER_SOURCE = 6

// AniList `bannerImage` je jediné pole napříč TMDB/AniList určené přímo pro
// tenhle účel (široký "hero" formát) - TMDB backdrop_path je taky širokoúhlý,
// ale míněný jako pozadí detailu titulu, ne jako banner.
const ANILIST_QUERY = `
  query ($perPage: Int) {
    Page(perPage: $perPage) {
      media(sort: TRENDING_DESC, type: ANIME, isAdult: false) {
        id
        bannerImage
        title {
          english
          romaji
        }
      }
    }
  }
`

async function fetchTmdb(apiKey) {
  const url = new URL(TMDB_TRENDING_URL)
  url.searchParams.set('api_key', apiKey)
  url.searchParams.set('language', 'en-US')

  const response = await fetch(url)
  if (!response.ok) return []

  const data = await response.json()
  return (data.results ?? [])
    .filter((item) => (item.media_type === 'movie' || item.media_type === 'tv') && item.backdrop_path)
    .slice(0, PER_SOURCE)
    .map((item) => ({
      id: `tmdb-${item.id}`,
      title: item.title ?? item.name ?? '',
      image: `${TMDB_BACKDROP_BASE}${item.backdrop_path}`,
      kind: item.media_type === 'movie' ? 'film' : 'serial',
    }))
}

async function fetchAnilist() {
  const response = await fetch(ANILIST_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ query: ANILIST_QUERY, variables: { perPage: PER_SOURCE } }),
  })
  if (!response.ok) return []

  const data = await response.json()
  return (data?.data?.Page?.media ?? [])
    .filter((item) => item.bannerImage)
    .map((item) => ({
      id: `anilist-${item.id}`,
      title: item.title?.english ?? item.title?.romaji ?? '',
      image: item.bannerImage,
      kind: 'anime',
    }))
}

export default async function handler(req, res) {
  const apiKey = process.env.TMDB_API_KEY

  const [tmdb, anilist] = await Promise.all([
    apiKey ? fetchTmdb(apiKey).catch(() => []) : Promise.resolve([]),
    fetchAnilist().catch(() => []),
  ])

  // Poskládat dohromady (ne film/seriál/seriál/... pak anime/anime/...),
  // ať banner není jednostranný, kdyby se zobrazilo jen pár položek.
  const results = []
  const max = Math.max(tmdb.length, anilist.length)
  for (let i = 0; i < max; i++) {
    if (tmdb[i]) results.push(tmdb[i])
    if (anilist[i]) results.push(anilist[i])
  }

  // Trendující žebříčky se mění pomalu - cache na edge ať se TMDB/AniList
  // nevolá při každém načtení stránky každého uživatele.
  res.setHeader('Cache-Control', 's-maxage=21600, stale-while-revalidate=86400')
  res.status(200).json({ results })
}
