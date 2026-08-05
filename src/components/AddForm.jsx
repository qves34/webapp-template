import { useEffect, useRef, useState } from 'react'
import { KINDS } from '../lib/watchlist'

const KIND_LABEL = Object.fromEntries(KINDS.map((k) => [k.id, k.label]))

const DEBOUNCE_MS = 350

export function AddForm({ onAdd }) {
  const [title, setTitle] = useState('')
  const [kind, setKind] = useState('film')
  const [results, setResults] = useState([])
  const [open, setOpen] = useState(false)
  const [picked, setPicked] = useState(null)
  const abortRef = useRef(null)
  const blurTimerRef = useRef(null)

  useEffect(() => {
    const needle = title.trim()
    if (!needle || (picked && picked.title === needle)) {
      setResults([])
      return
    }

    const timer = setTimeout(async () => {
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller
      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(needle)}&kind=${kind}`,
          { signal: controller.signal },
        )
        const data = await response.json()
        setResults(response.ok ? (data.results ?? []) : [])
      } catch {
        // Zrušený nebo neúspěšný požadavek - ticho, ruční psaní pořád funguje.
      }
    }, DEBOUNCE_MS)

    return () => clearTimeout(timer)
  }, [title, kind, picked])

  function handleTitleChange(value) {
    setTitle(value)
    setPicked(null)
    setOpen(true)
  }

  function handlePick(result) {
    setTitle(result.title)
    setKind(result.kind)
    setPicked(result)
    setResults([])
    setOpen(false)
  }

  function handleSubmit(event) {
    event.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) return
    const extra = picked && picked.title === trimmed ? picked : undefined
    onAdd(trimmed, kind, extra)
    setTitle('')
    setKind('film')
    setPicked(null)
    setResults([])
  }

  return (
    <form className="add" onSubmit={handleSubmit} autoComplete="off">
      <div className="add__search">
        <input
          className="add__title"
          value={title}
          onChange={(event) => handleTitleChange(event.target.value)}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            blurTimerRef.current = setTimeout(() => setOpen(false), 150)
          }}
          placeholder="Název titulu"
          aria-label="Název titulu"
          autoComplete="off"
        />

        {open && results.length > 0 && (
          <ul className="add__results">
            {results.map((result) => (
              <li key={`${result.kind}-${result.tmdbId}`}>
                <button type="button" className="add__result" onClick={() => handlePick(result)}>
                  {result.poster ? (
                    <img className="add__poster" src={result.poster} alt="" />
                  ) : (
                    <span className="add__poster add__poster--empty" aria-hidden="true" />
                  )}
                  <span className="add__result-text">
                    <span className="add__result-title">{result.title}</span>
                    <span className="add__result-meta">
                      {KIND_LABEL[result.kind] ?? result.kind}
                      {result.year ? ` · ${result.year}` : ''}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="add__kinds" role="radiogroup" aria-label="Typ">
        {KINDS.map((option) => (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={kind === option.id}
            className="add__kind"
            data-kind={option.id}
            onClick={() => {
              clearTimeout(blurTimerRef.current)
              setKind(option.id)
              setPicked(null)
              setOpen(true)
            }}
          >
            {option.label}
          </button>
        ))}
      </div>
      <button className="add__submit" type="submit" disabled={!title.trim()}>
        Přidat
      </button>
    </form>
  )
}
