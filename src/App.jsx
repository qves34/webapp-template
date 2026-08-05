import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import { AddForm } from './components/AddForm'
import { AuthForm } from './components/AuthForm'
import { ItemRow } from './components/ItemRow'
import { Toolbar } from './components/Toolbar'
import { useAuth } from './hooks/useAuth'
import { useWatchlist } from './hooks/useWatchlist'
import { STATUSES, downloadExport, loadItems, readExport } from './lib/watchlist'

const EMPTY_TEXT = {
  vse: 'Zatím prázdno. Napiš nahoru název a přidej první titul.',
  chci: 'Nic tu nečeká. Co přidáš, začíná tady.',
  divam: 'Nic rozkoukaného. U titulu přepni stav na „Dívám se“.',
  pauza: 'Nic v pauze. Titul, ke kterému se chceš vrátit, sem přepneš přes „Upravit“.',
  preruseno: 'Nic přerušeného. Klidně tu ale zůstane, kdyby ses k tomu vrátil.',
  hotovo: 'Zatím nic dokoukaného.',
}

const MIGRATION_FLAG = 'watchlist.migrated.v1'

function App() {
  const { session, user, loading, signIn, signUp, signOut } = useAuth()

  if (loading) return <p className="app-loading">Načítám…</p>
  if (!session) return <AuthForm onSignIn={signIn} onSignUp={signUp} />
  return <Watchlist user={user} onSignOut={signOut} />
}

function Watchlist({ user, onSignOut }) {
  const { items, add, update, remove, merge, storageError, loading } = useWatchlist(user.id)
  const [filter, setFilter] = useState('vse')
  const [kindFilter, setKindFilter] = useState('vse')
  const [query, setQuery] = useState('')
  const [notice, setNotice] = useState(null)
  const [migration, setMigration] = useState(null)
  const fileInput = useRef(null)
  const noticeId = useRef(0)
  const migrationChecked = useRef(false)

  // Nový klíč při každé hlášce, aby se odpočet do zmizení spustil znovu.
  function showNotice(kind, text) {
    noticeId.current += 1
    setNotice({ id: noticeId.current, kind, text })
  }

  // Jednou za přihlášení do tohoto prohlížeče nabídne nahrání dat, co tu
  // z dřívějška zůstala v localStorage (dokud appka ještě neměla účty).
  useEffect(() => {
    if (loading || migrationChecked.current) return
    migrationChecked.current = true

    if (localStorage.getItem(MIGRATION_FLAG) === '1') return

    const localItems = loadItems()
    if (localItems.length === 0) {
      localStorage.setItem(MIGRATION_FLAG, '1')
      return
    }

    setMigration(localItems)
  }, [loading])

  function acceptMigration() {
    const { added, updated } = merge(migration)
    localStorage.setItem(MIGRATION_FLAG, '1')
    setMigration(null)
    showNotice('ok', `Nahráno ${added + updated} z ${migration.length} titulů z tohoto prohlížeče.`)
  }

  function declineMigration() {
    localStorage.setItem(MIGRATION_FLAG, '1')
    setMigration(null)
  }

  const counts = useMemo(() => {
    const result = {}
    for (const item of items) result[item.status] = (result[item.status] ?? 0) + 1
    return result
  }, [items])

  const kindCounts = useMemo(() => {
    const result = {}
    for (const item of items) result[item.kind] = (result[item.kind] ?? 0) + 1
    return result
  }, [items])

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return items.filter((item) => {
      if (filter !== 'vse' && item.status !== filter) return false
      if (kindFilter !== 'vse' && item.kind !== kindFilter) return false
      if (!needle) return true
      return `${item.title} ${item.note}`.toLowerCase().includes(needle)
    })
  }, [items, filter, kindFilter, query])

  const watching = items.filter((item) => item.status === 'divam')

  function handleAdd(title, kind, extra) {
    add(title, kind, extra)
    setQuery('')
    if (filter !== 'vse' && filter !== 'chci') setFilter('vse')
  }

  function handleRemove(item) {
    if (window.confirm(`Smazat „${item.title}“?`)) remove(item.id)
  }

  function handleExport() {
    if (items.length === 0) {
      showNotice('warn', 'Není co zálohovat, seznam je prázdný.')
      return
    }
    downloadExport(items)
    showNotice('ok', `Staženo ${items.length} titulů.`)
  }

  async function handleImport(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    try {
      const incoming = readExport(await file.text())
      const { added, updated } = merge(incoming)
      showNotice(
        'ok',
        added + updated === 0
          ? 'Záloha nepřinesla nic nového.'
          : `Přidáno ${added}, aktualizováno ${updated}.`,
      )
    } catch (error) {
      showNotice('warn', `Import se nepovedl: ${error.message}`)
    }
  }

  return (
    <main className="app">
      <header className="head">
        <div className="head__bar">
          <h1 className="head__mark">Watchlist</h1>
          <div className="head__backup">
            <button type="button" className="ghost" onClick={handleExport}>
              Export
            </button>
            <button type="button" className="ghost" onClick={() => fileInput.current?.click()}>
              Import
            </button>
            <input
              ref={fileInput}
              type="file"
              accept="application/json,.json"
              onChange={handleImport}
              hidden
            />
            <button type="button" className="ghost" onClick={onSignOut}>
              Odhlásit se
            </button>
          </div>
        </div>

        <p className="head__now">
          <span className="head__now-label">
            {watching.length > 0 ? 'Právě koukám' : 'Rozkoukané'}
          </span>
          {watching.length > 0 ? (
            <span className="head__now-titles">
              {watching.map((item) => item.title).join(' · ')}
            </span>
          ) : (
            <span className="head__now-titles head__now-titles--quiet">
              {items.length > 0 ? `Nic. Ve frontě čeká ${counts.chci ?? 0}.` : 'Nic. Zatím.'}
            </span>
          )}
        </p>
      </header>

      <AddForm onAdd={handleAdd} />

      <Toolbar
        filter={filter}
        onFilter={setFilter}
        kindFilter={kindFilter}
        onKindFilter={setKindFilter}
        query={query}
        onQuery={setQuery}
        counts={counts}
        kindCounts={kindCounts}
        total={items.length}
      />

      {migration && (
        <p className="notice notice--warn notice--sticky migration">
          Našli jsme {migration.length} titulů uložených v tomhle prohlížeči. Nahrát je do účtu?
          <span className="migration__actions">
            <button type="button" className="ghost" onClick={acceptMigration}>
              Nahrát
            </button>
            <button type="button" className="ghost" onClick={declineMigration}>
              Nechat být
            </button>
          </span>
        </p>
      )}

      {storageError && (
        <p className="notice notice--warn notice--sticky">
          Synchronizace s účtem selhala. Zkus to znovu, mezitím si radši udělej Export.
        </p>
      )}

      {notice && (
        <p
          key={notice.id}
          className={`notice notice--${notice.kind}`}
          onAnimationEnd={() => setNotice(null)}
        >
          {notice.text}
        </p>
      )}

      {loading ? (
        <p className="empty">Načítám tvůj seznam…</p>
      ) : visible.length > 0 ? (
        <ul className="list">
          {visible.map((item) => (
            <ItemRow key={item.id} item={item} onUpdate={update} onRemove={handleRemove} />
          ))}
        </ul>
      ) : (
        <p className="empty">
          {query.trim()
            ? `Na „${query.trim()}“ nic nesedí.`
            : (EMPTY_TEXT[filter] ?? EMPTY_TEXT.vse)}
        </p>
      )}

      <footer className="foot">
        <span>Data jsou u tvého účtu, dostupná odkudkoli. Zálohu si navíc uděláš přes Export.</span>
        {items.length > 0 && (
          <span className="foot__tally">
            {STATUSES.map((status) => `${status.label.toLowerCase()} ${counts[status.id] ?? 0}`).join(
              ' · ',
            )}
          </span>
        )}
      </footer>
    </main>
  )
}

export default App
