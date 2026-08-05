import { useMemo, useRef, useState } from 'react'
import './App.css'
import { AddForm } from './components/AddForm'
import { ItemRow } from './components/ItemRow'
import { Toolbar } from './components/Toolbar'
import { useWatchlist } from './hooks/useWatchlist'
import { STATUSES, downloadExport, readExport } from './lib/watchlist'

const EMPTY_TEXT = {
  vse: 'Zatím prázdno. Napiš nahoru název a přidej první titul.',
  chci: 'Nic tu nečeká. Co přidáš, začíná tady.',
  divam: 'Nic rozkoukaného. U titulu přepni stav na „Dívám se“.',
  hotovo: 'Zatím nic dokoukaného.',
}

function App() {
  const { items, add, update, remove, merge, storageError } = useWatchlist()
  const [filter, setFilter] = useState('vse')
  const [query, setQuery] = useState('')
  const [notice, setNotice] = useState(null)
  const fileInput = useRef(null)
  const noticeId = useRef(0)

  // Nový klíč při každé hlášce, aby se odpočet do zmizení spustil znovu.
  function showNotice(kind, text) {
    noticeId.current += 1
    setNotice({ id: noticeId.current, kind, text })
  }

  const counts = useMemo(() => {
    const result = {}
    for (const item of items) result[item.status] = (result[item.status] ?? 0) + 1
    return result
  }, [items])

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return items.filter((item) => {
      if (filter !== 'vse' && item.status !== filter) return false
      if (!needle) return true
      return `${item.title} ${item.note}`.toLowerCase().includes(needle)
    })
  }, [items, filter, query])

  const watching = items.filter((item) => item.status === 'divam')

  function handleAdd(title, kind) {
    add(title, kind)
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
        query={query}
        onQuery={setQuery}
        counts={counts}
        total={items.length}
      />

      {storageError && (
        <p className="notice notice--warn notice--sticky">
          Prohlížeč odmítl data uložit. Zkontroluj, jestli nemáš blokované úložiště, a zatím si
          udělej Export.
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

      {visible.length > 0 ? (
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
        <span>Data zůstávají v tomhle prohlížeči. Zálohu přenes přes Export a Import.</span>
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
