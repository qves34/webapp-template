import { useEffect, useRef, useState } from 'react'
import { useI18n } from '../lib/i18n/context'
import { KINDS } from '../lib/watchlist'

const DEBOUNCE_MS = 350

export function AddForm({ onAdd }) {
  const { t } = useI18n()
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
        // Našeptávač schválně nedostává jazyk UI - názvy titulů se drží
        // anglicky bez ohledu na jazyk appky (viz README, sekce Jazyky).
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
          placeholder={t('add.titlePlaceholder')}
          aria-label={t('add.titlePlaceholder')}
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
                      {t(`kind.${result.kind}`)}
                      {result.year ? ` · ${result.year}` : ''}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="add__kinds" role="radiogroup" aria-label={t('add.kindAria')}>
        {KINDS.map((option) => (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={kind === option}
            className="add__kind"
            data-kind={option}
            onClick={() => {
              clearTimeout(blurTimerRef.current)
              setKind(option)
              setPicked(null)
              setOpen(true)
            }}
          >
            {t(`kind.${option}`)}
          </button>
        ))}
      </div>
      <button className="add__submit" type="submit" disabled={!title.trim()}>
        {t('add.submit')}
      </button>
    </form>
  )
}
