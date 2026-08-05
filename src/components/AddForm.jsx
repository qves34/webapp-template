import { useState } from 'react'
import { KINDS } from '../lib/watchlist'

export function AddForm({ onAdd }) {
  const [title, setTitle] = useState('')
  const [kind, setKind] = useState('film')

  function handleSubmit(event) {
    event.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) return
    onAdd(trimmed, kind)
    setTitle('')
  }

  return (
    <form className="add" onSubmit={handleSubmit}>
      <input
        className="add__title"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Název titulu"
        aria-label="Název titulu"
        autoComplete="off"
      />
      <div className="add__kinds" role="radiogroup" aria-label="Typ">
        {KINDS.map((option) => (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={kind === option.id}
            className="add__kind"
            data-kind={option.id}
            onClick={() => setKind(option.id)}
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
