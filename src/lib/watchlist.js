export const STORAGE_KEY = 'watchlist.v1'
export const EXPORT_VERSION = 1

export const KINDS = [
  { id: 'film', label: 'Film', short: 'FILM' },
  { id: 'anime', label: 'Anime', short: 'ANIME' },
  { id: 'serial', label: 'Seriál', short: 'SERIÁL' },
]

export const STATUSES = [
  { id: 'chci', label: 'Chci vidět' },
  { id: 'divam', label: 'Dívám se' },
  { id: 'pauza', label: 'Dočasně přerušeno' },
  { id: 'preruseno', label: 'Přerušeno' },
  { id: 'hotovo', label: 'Dokoukáno' },
]

export const SORT_MODES = [
  { id: 'stav', label: 'Stav' },
  { id: 'abeceda', label: 'Abecedně' },
  { id: 'hodnoceni', label: 'Hodnocení' },
]

const KIND_IDS = KINDS.map((k) => k.id)
const STATUS_IDS = STATUSES.map((s) => s.id)

// Pořadí ve výpisu (mode 'stav'): rozkoukané nahoru, dokoukané a přerušené dolů.
const SORT_RANK = { divam: 0, pauza: 1, chci: 2, preruseno: 3, hotovo: 4 }

export const kindLabel = (id) => KINDS.find((k) => k.id === id)?.short ?? id
export const statusLabel = (id) => STATUSES.find((s) => s.id === id)?.label ?? id

export function nextStatus(id) {
  const i = STATUS_IDS.indexOf(id)
  return STATUS_IDS[(i + 1) % STATUS_IDS.length]
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
    kind: KIND_IDS.includes(kind) ? kind : 'film',
    status: 'chci',
    progress: '',
    rating: null,
    note: '',
    addedAt: now,
    updatedAt: now,
    tmdbId: typeof extra.tmdbId === 'number' ? extra.tmdbId : null,
    year: typeof extra.year === 'string' ? extra.year : null,
    poster: typeof extra.poster === 'string' ? extra.poster : null,
  }
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
    kind: KIND_IDS.includes(raw.kind) ? raw.kind : 'film',
    status: STATUS_IDS.includes(raw.status) ? raw.status : 'chci',
    progress: typeof raw.progress === 'string' ? raw.progress : '',
    rating: Number.isFinite(rating) && rating >= 1 && rating <= 10 ? Math.round(rating) : null,
    note: typeof raw.note === 'string' ? raw.note : '',
    addedAt: typeof raw.addedAt === 'string' ? raw.addedAt : now,
    updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : now,
    tmdbId: typeof raw.tmdbId === 'number' ? raw.tmdbId : null,
    year: typeof raw.year === 'string' ? raw.year : null,
    poster: typeof raw.poster === 'string' ? raw.poster : null,
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

function sortByAbeceda(items) {
  return [...items].sort((a, b) => a.title.localeCompare(b.title, 'cs'))
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

export function sortItems(items, mode = 'stav') {
  return (SORTERS[mode] ?? sortByStav)(items)
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
 * Sloučí zálohu do aktuálního seznamu. Stejné id = vyhrává novější updatedAt,
 * takže import nikdy nepřepíše čerstvější změnu ani nesmaže, co v záloze není.
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

export function buildExport(items) {
  return {
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    items,
  }
}

/** Přijme jak náš export ({items:[…]}), tak holé pole titulů. */
export function readExport(text) {
  const parsed = JSON.parse(text)
  const list = Array.isArray(parsed) ? parsed : parsed?.items
  if (!Array.isArray(list)) throw new Error('Soubor neobsahuje seznam titulů.')
  const items = list.map(normalizeItem).filter(Boolean)
  if (items.length === 0) throw new Error('V souboru není žádný titul s názvem.')
  return items
}

export function downloadExport(items) {
  const stamp = new Date().toISOString().slice(0, 10)
  const blob = new Blob([JSON.stringify(buildExport(items), null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `watchlist-${stamp}.json`
  link.click()
  // Okamžité revokeObjectURL některým prohlížečům stahování utne.
  setTimeout(() => URL.revokeObjectURL(url), 5000)
}
