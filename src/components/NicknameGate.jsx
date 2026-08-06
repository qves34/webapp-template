import { useState } from 'react'

export function NicknameGate({ onSetNickname }) {
  const [value, setValue] = useState('')
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError(null)
    setBusy(true)

    const { error: nicknameError } = await onSetNickname(value)

    setBusy(false)
    if (nicknameError) setError(nicknameError.message)
  }

  return (
    <main className="auth">
      <form className="auth__card" onSubmit={handleSubmit}>
        <h1 className="auth__mark">Watchlist</h1>
        <h2 className="auth__title">Zvol si nickname</h2>
        <p className="auth__hint">
          Podle něj tě budou hledat přátelé. 3-20 znaků, jen písmena, čísla a podtržítko.
        </p>

        <label className="field field--wide">
          <span className="field__label">Nickname</span>
          <input
            value={value}
            onChange={(event) => setValue(event.target.value)}
            autoComplete="off"
            minLength={3}
            maxLength={20}
            required
          />
        </label>

        {error && <p className="notice notice--warn notice--sticky">{error}</p>}

        <button className="add__submit auth__submit" type="submit" disabled={busy}>
          Pokračovat
        </button>
      </form>
    </main>
  )
}
