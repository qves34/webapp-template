/**
 * Překladová logika bez Reactu - odtud si ji bere provider v `index.jsx`.
 * Oddělené proto, že je to čistá funkce nad slovníky: dá se testovat i použít
 * mimo komponenty (třeba když text potřebuje modul, co o Reactu nic neví).
 */
// Přípony schválně: bez nich modul načte jen Vite, s nimi i holý Node -
// a na tom stojí `npm run check:i18n`.
import { cs } from './cs.js'
import { en } from './en.js'

export const STORAGE_KEY = 'watchlist.locale'

/**
 * `htmlLang` jde do <html lang>, `short` na přepínač, `name` je název jazyka
 * v něm samotném (tak se jazyky v přepínačích uvádějí).
 *
 * Jazyk pro TMDB tu schválně není - názvy titulů se drží anglicky bez ohledu
 * na jazyk UI, takže si `api/search.js` `en-US` drží sám.
 */
export const LOCALES = [
  { id: 'cs', short: 'CS', name: 'Čeština', htmlLang: 'cs' },
  { id: 'en', short: 'EN', name: 'English', htmlLang: 'en' },
]

export const DEFAULT_LOCALE = 'cs'

const DICTS = { cs, en }
const LOCALE_IDS = LOCALES.map((l) => l.id)

export const localeMeta = (id) => LOCALES.find((l) => l.id === id) ?? LOCALES[0]

export function nextLocale(id) {
  const i = LOCALE_IDS.indexOf(id)
  return LOCALE_IDS[(i + 1) % LOCALE_IDS.length]
}

/** Uložená volba vyhrává, jinak jazyk prohlížeče, jinak čeština. */
export function initialLocale() {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (LOCALE_IDS.includes(stored)) return stored

  for (const tag of navigator.languages ?? [navigator.language]) {
    const base = String(tag ?? '').toLowerCase().split('-')[0]
    if (LOCALE_IDS.includes(base)) return base
  }
  return DEFAULT_LOCALE
}

// Intl.PluralRules zná česká pravidla (1 = one, 2-4 = few, 5+ = other) i anglická,
// takže plurály nemusíme počítat ručně a přibývající jazyk je jen další slovník.
const pluralCache = new Map()
function pluralCategory(locale, count) {
  let rules = pluralCache.get(locale)
  if (!rules) {
    rules = new Intl.PluralRules(locale)
    pluralCache.set(locale, rules)
  }
  return rules.select(count)
}

function format(value, locale) {
  return typeof value === 'number' ? new Intl.NumberFormat(locale).format(value) : String(value)
}

/** `{jméno}` v textu nahradí hodnotou z `vars`. Neznámý zástupný symbol nechá být. */
function interpolate(template, vars, locale) {
  if (!vars) return template
  return template.replace(/\{(\w+)\}/g, (match, key) =>
    key in vars ? format(vars[key], locale) : match,
  )
}

/**
 * Chybějící klíč vrátí sám sebe - v UI je hned vidět, co se nepřeložilo,
 * místo aby text tiše zmizel.
 */
export function translate(locale, key, vars) {
  // Plurálový tvar se musí vybrat podle jazyka, ze kterého text opravdu pochází.
  // Když klíč ve zvoleném jazyce chybí a spadneme na češtinu, počítá se česky -
  // jinak by anglická pravidla sáhla po tvaru, který český slovník nemá.
  const dict = DICTS[locale]?.[key] !== undefined ? locale : DEFAULT_LOCALE
  const entry = DICTS[dict]?.[key]
  if (entry === undefined) return key

  if (typeof entry === 'object') {
    const count = Number(vars?.count ?? 0)
    const picked = entry[pluralCategory(dict, count)] ?? entry.other
    if (picked === undefined) return key
    return interpolate(picked, vars, dict)
  }

  return interpolate(entry, vars, dict)
}
