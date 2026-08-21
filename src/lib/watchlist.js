export const STORAGE_KEY = 'watchlist.v1'

// Jen identifikátory - ty jsou i v databázi. Zobrazované názvy drží slovníky
// v `lib/i18n` pod klíči `kind.<id>`, `status.<id>` a `sort.<id>`.
export const KINDS = ['film', 'anime', 'serial']
export const STATUSES = ['chci', 'divam', 'pauza', 'preruseno', 'hotovo']
export const SORT_MODES = ['stav', 'abeceda', 'hodnoceni']

// Pořadí ve výpisu (mode 'stav'): rozkoukané nahoru, dokoukané a přerušené dolů.
const SORT_RANK = { divam: 0, pauza: 1, chci: 2, preruseno: 3, hotovo: 4 }

export function nextStatus(id) {
  const i = STATUSES.indexOf(id)
  return STATUSES[(i + 1) % STATUSES.length]
}

function newId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID()
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

export function createItem(title, kind = 'film', extra = {}) {
  const now = new Date().toISOString()
  return {
    id: newId(),
    title: title.trim(),
    kind: KINDS.includes(kind) ? kind : 'film',
    status: 'chci',
    progress: '',
    rating: null,
    hated: false,
    favorite: false,
    note: '',
    addedAt: now,
    updatedAt: now,
    tmdbId: typeof extra.tmdbId === 'number' ? extra.tmdbId : null,
    year: typeof extra.year === 'string' ? extra.year : null,
    poster: typeof extra.poster === 'string' ? extra.poster : null,
    rewatches: [],
  }
}

function normalizeRewatches(raw) {
  if (!Array.isArray(raw)) return []
  return raw
    .filter((entry) => entry && typeof entry.date === 'string')
    .map((entry) => {
      const rating = Number(entry.rating)
      return {
        date: entry.date,
        rating: Number.isFinite(rating) && rating >= 1 && rating <= 10 ? Math.round(rating) : null,
      }
    })
}

/** Ořeže cizí data do našeho tvaru. Vrací null, když z toho nejde udělat titul. */
export function normalizeItem(raw) {
  if (!raw || typeof raw !== 'object') return null
  const title = typeof raw.title === 'string' ? raw.title.trim() : ''
  if (!title) return null

  const rating = Number(raw.rating)
  const now = new Date().toISOString()

  return {
    id: typeof raw.id === 'string' && raw.id ? raw.id : newId(),
    title,
    kind: KINDS.includes(raw.kind) ? raw.kind : 'film',
    status: STATUSES.includes(raw.status) ? raw.status : 'chci',
    progress: typeof raw.progress === 'string' ? raw.progress : '',
    rating: Number.isFinite(rating) && rating >= 1 && rating <= 10 ? Math.round(rating) : null,
    hated: raw.hated === true,
    favorite: raw.favorite === true,
    note: typeof raw.note === 'string' ? raw.note : '',
    addedAt: typeof raw.addedAt === 'string' ? raw.addedAt : now,
    updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : now,
    tmdbId: typeof raw.tmdbId === 'number' ? raw.tmdbId : null,
    year: typeof raw.year === 'string' ? raw.year : null,
    poster: typeof raw.poster === 'string' ? raw.poster : null,
    rewatches: normalizeRewatches(raw.rewatches),
  }
}

/** Řadí podle addedAt, ne updatedAt - jinak by řádek při psaní poskakoval nahoru. */
function sortByStav(items) {
  return [...items].sort((a, b) => {
    const rank = SORT_RANK[a.status] - SORT_RANK[b.status]
    if (rank !== 0) return rank
    return b.addedAt.localeCompare(a.addedAt)
  })
}

/** Abecedu určuje jazyk UI - čeština řadí Č/Ř/Š jinak než angličtina. */
function sortByAbeceda(items, locale) {
  const collator = new Intl.Collator(locale, { sensitivity: 'base', numeric: true })
  return [...items].sort((a, b) => collator.compare(a.title, b.title))
}

/** Bez hodnocení jdou vždycky na konec, ne namíchané mezi ohodnocené. */
function sortByHodnoceni(items) {
  return [...items].sort((a, b) => {
    if (a.rating == null && b.rating == null) return 0
    if (a.rating == null) return 1
    if (b.rating == null) return -1
    return b.rating - a.rating
  })
}

const SORTERS = { stav: sortByStav, abeceda: sortByAbeceda, hodnoceni: sortByHodnoceni }

export function sortItems(items, mode = 'stav', locale = 'cs') {
  return (SORTERS[mode] ?? sortByStav)(items, locale)
}

export function loadItems() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.map(normalizeItem).filter(Boolean)
  } catch {
    return []
  }
}

export function saveItems(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    return true
  } catch {
    return false
  }
}

/**
 * Sloučí příchozí položky (migrace ze starého localStorage) do aktuálního
 * seznamu. Stejné id = vyhrává novější updatedAt, takže se nikdy nepřepíše
 * čerstvější změna ani nesmaže, co v příchozích datech není.
 */
export function mergeItems(current, incoming) {
  const byId = new Map(current.map((item) => [item.id, item]))
  let added = 0
  let updated = 0

  for (const item of incoming) {
    const existing = byId.get(item.id)
    if (!existing) {
      byId.set(item.id, item)
      added += 1
    } else if (item.updatedAt > existing.updatedAt) {
      byId.set(item.id, item)
      updated += 1
    }
  }

  return { items: [...byId.values()], added, updated }
}

/**
 * Posune titul o jednu pozici nahoru/dolů v rámci stejného stavu - to je
 * jediná osa, kde na pořadí (addedAt) vůbec záleží, viz `sortByStav`.
 * V jiném řazení (abeceda/hodnocení) by posun neměl žádný viditelný efekt.
 */
export function moveItem(items, itemId, direction) {
  const item = items.find((i) => i.id === itemId)
  if (!item) return items

  const sameStatus = items
    .filter((i) => i.status === item.status)
    .sort((a, b) => b.addedAt.localeCompare(a.addedAt))
  const currentIndex = sameStatus.findIndex((i) => i.id === itemId)
  const swapIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
  if (swapIndex < 0 || swapIndex >= sameStatus.length) return items

  const swapItem = sameStatus[swapIndex]
  const now = new Date().toISOString()

  return items.map((i) => {
    if (i.id === item.id) return { ...i, addedAt: swapItem.addedAt, updatedAt: now }
    if (i.id === swapItem.id) return { ...i, addedAt: item.addedAt, updatedAt: now }
    return i
  })
}
