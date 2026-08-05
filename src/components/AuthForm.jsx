import { useState } from 'react'

const COPY = {
  signin: { title: 'Přihlásit se', switchTo: 'signup', switchLabel: 'Nemáš účet? Zaregistruj se' },
  signup: { title: 'Vytvořit účet', switchTo: 'signin', switchLabel: 'Už máš účet? Přihlas se' },
}

export function AuthForm({ onSignIn, onSignUp }) {
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  const copy = COPY[mode]

  async function handleSubmit(event) {
    event.preventDefault()
    setError(null)
    setBusy(true)

    const action = mode === 'signin' ? onSignIn : onSignUp
    const { error: authError } = await action(email.trim(), password)

    setBusy(false)
    if (authError) setError(authError.message)
  }

  return (
    <main className="auth">
      <form className="auth__card" onSubmit={handleSubmit}>
        <h1 className="auth__mark">Watchlist</h1>
        <h2 className="auth__title">{copy.title}</h2>

        <label className="field field--wide">
          <span className="field__label">Email</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />
        </label>

        <label className="field field--wide">
          <span className="field__label">Heslo</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            minLength={6}
            required
          />
        </label>

        {error && <p className="notice notice--warn notice--sticky">{error}</p>}

        <button className="add__submit auth__submit" type="submit" disabled={busy}>
          {copy.title}
        </button>

        <button
          type="button"
          className="auth__switch"
          onClick={() => {
            setError(null)
            setMode(copy.switchTo)
          }}
        >
          {copy.switchLabel}
        </button>
      </form>
    </main>
  )
}
