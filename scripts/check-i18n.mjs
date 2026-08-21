/**
 * Kontrola slovníků - pustí se přes `npm run check:i18n`.
 *
 * Hlavní riziko lokalizace je, že se jazyky časem rozejdou: klíč přibude jen
 * v jednom, plurál nemá tvar, který jazyk vyžaduje, nebo se anglický text
 * zapomene přeložit. Tohle to odchytí bez prohlížeče a bez testovacího
 * frameworku - `core.js` je čistý JS, takže ho Node načte přímo.
 */
import assert from 'node:assert/strict'
import { cs } from '../src/lib/i18n/cs.js'
import { en } from '../src/lib/i18n/en.js'
import { LOCALES, localeMeta, nextLocale, translate as t } from '../src/lib/i18n/core.js'

// Identifikátory drží `lib/watchlist.js`. Kopie schválně: kdyby se tam něco
// přejmenovalo, tahle kontrola má spadnout a upozornit na chybějící překlad.
const KINDS = ['film', 'anime', 'serial']
const STATUSES = ['chci', 'divam', 'pauza', 'preruseno', 'hotovo']
const SORT_MODES = ['stav', 'abeceda', 'hodnoceni']
const FILTERS = ['vse', ...STATUSES]

// Texty, které jsou v obou jazycích shodné záměrně - u zbytku shoda znamená
// zapomenutý překlad.
const SAME_ON_PURPOSE = new Set([
  'app.mark',
  'kind.anime',
  'kind.anime.short',
  'auth.email',
  'nickname.label',
  'field.posterUrlPlaceholder',
])

const DICTS = { cs, en }

let passed = 0
const failures = []
function check(name, fn) {
  try {
    fn()
    passed++
  } catch (error) {
    failures.push(`${name}\n    ${error.message.split('\n')[0]}`)
  }
}

check('cs a en mají stejnou sadu klíčů', () => {
  const missingInEn = Object.keys(cs).filter((k) => !(k in en))
  const missingInCs = Object.keys(en).filter((k) => !(k in cs))
  assert.deepEqual(missingInEn, [], `chybí v en: ${missingInEn.join(', ')}`)
  assert.deepEqual(missingInCs, [], `chybí v cs: ${missingInCs.join(', ')}`)
})

check('plurálové klíče mají všechny tvary, které jazyk používá', () => {
  for (const [locale, dict] of Object.entries(DICTS)) {
    const rules = new Intl.PluralRules(locale)
    const needed = new Set()
    for (let n = 0; n <= 100; n++) needed.add(rules.select(n))

    for (const [key, value] of Object.entries(dict)) {
      if (typeof value !== 'object') continue
      for (const category of needed) {
        assert.ok(value[category], `${locale}/${key} nemá tvar "${category}"`)
      }
    }
  }
})

// Klíče, které mají oba jazyky - jen ty jde mezi sebou porovnávat. Chybějící
// hlásí kontrola parity výše, tady by jen zaváděly druhou chybu za totéž.
const sharedKeys = Object.keys(cs).filter((key) => key in en)

check('plurál a prostý text se nemíchají mezi jazyky', () => {
  for (const key of sharedKeys) {
    assert.equal(typeof cs[key], typeof en[key], `${key} má v každém jazyce jiný tvar`)
  }
})

check('stejné zástupné symboly v obou jazycích', () => {
  const placeholders = (value) =>
    [...new Set([...JSON.stringify(value).matchAll(/\{(\w+)\}/g)].map((m) => m[1]))].sort()
  for (const key of sharedKeys) {
    assert.deepEqual(
      placeholders(cs[key]),
      placeholders(en[key]),
      `${key} používá v každém jazyce jiné proměnné`,
    )
  }
})

check('žádný text nezůstal nepřeložený', () => {
  const same = Object.keys(cs).filter(
    (k) => typeof cs[k] === 'string' && cs[k] === en[k] && !SAME_ON_PURPOSE.has(k),
  )
  assert.deepEqual(same, [], `shodné v cs i en: ${same.join(', ')}`)
})

check('klíče skládané za běhu existují v obou jazycích', () => {
  for (const locale of Object.keys(DICTS)) {
    const expect = (key) => assert.notEqual(t(locale, key), key, `${locale}: chybí ${key}`)
    for (const kind of KINDS) {
      expect(`kind.${kind}`)
      expect(`kind.${kind}.short`)
    }
    for (const status of STATUSES) expect(`status.${status}`)
    for (const filter of FILTERS) expect(`empty.${filter}`)
    for (const mode of SORT_MODES) expect(`sort.${mode}`)
  }
})

check('interpolace dosadí proměnné a neznámý symbol nechá být', () => {
  assert.equal(t('cs', 'list.noMatch', { query: 'Dune' }), 'Na „Dune“ nic nesedí.')
  assert.equal(t('en', 'list.noMatch', { query: 'Dune' }), 'Nothing matches “Dune”.')
  assert.equal(t('cs', 'migration.done', { count: 3, total: 5 }), 'Uloženo do účtu: 3 z 5.')
  assert.equal(t('cs', 'list.noMatch', { jine: 'x' }), 'Na „{query}“ nic nesedí.')
})

check('české plurály berou tvary 1 / 2-4 / 5+', () => {
  assert.equal(
    t('cs', 'migration.prompt', { count: 1 }),
    'Našli jsme 1 titul uložený v tomhle prohlížeči. Nahrát ho do účtu?',
  )
  assert.equal(
    t('cs', 'migration.prompt', { count: 3 }),
    'Našli jsme 3 tituly uložené v tomhle prohlížeči. Nahrát je do účtu?',
  )
  assert.equal(
    t('cs', 'migration.prompt', { count: 7 }),
    'Našli jsme 7 titulů uložených v tomhle prohlížeči. Nahrát je do účtu?',
  )
  assert.equal(
    t('cs', 'migration.prompt', { count: 0 }),
    'Našli jsme 0 titulů uložených v tomhle prohlížeči. Nahrát je do účtu?',
  )
})

check('anglické plurály berou tvary 1 / ostatní', () => {
  assert.equal(
    t('en', 'migration.prompt', { count: 1 }),
    'We found 1 title saved in this browser. Upload it to your account?',
  )
  assert.equal(
    t('en', 'migration.prompt', { count: 5 }),
    'We found 5 titles saved in this browser. Upload them to your account?',
  )
})

check('neznámý klíč vrátí sám sebe', () => {
  assert.equal(t('cs', 'neexistujici.klic'), 'neexistujici.klic')
  assert.equal(t('en', 'neexistujici.klic'), 'neexistujici.klic')
})

check('neznámý jazyk spadne na češtinu včetně českých plurálů', () => {
  assert.equal(t('de', 'app.loading'), 'Načítám…')
  assert.equal(
    t('de', 'migration.prompt', { count: 3 }),
    'Našli jsme 3 tituly uložené v tomhle prohlížeči. Nahrát je do účtu?',
  )
})

check('přepínání jazyků cyklí a metadata sedí', () => {
  assert.equal(nextLocale('cs'), 'en')
  assert.equal(nextLocale('en'), 'cs')
  assert.equal(nextLocale('neznamy'), LOCALES[0].id)
  assert.equal(localeMeta('en').htmlLang, 'en')
  assert.equal(localeMeta('neznamy').id, 'cs')
})

if (failures.length > 0) {
  console.error(`✗ ${failures.length} z ${failures.length + passed} kontrol selhalo:\n`)
  for (const failure of failures) console.error(`  ✗ ${failure}\n`)
  process.exit(1)
}

console.log(`✓ ${passed} kontrol slovníků prošlo`)
