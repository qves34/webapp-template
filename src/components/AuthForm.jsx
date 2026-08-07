import { useState } from 'react'
import { authErrorKey } from '../lib/authErrors'
import { useI18n } from '../lib/i18n/context'

const COPY = {
  signin: { titleKey: 'auth.signIn', switchTo: 'signup', switchKey: 'auth.toSignUp' },
  signup: { titleKey: 'auth.signUp', switchTo: 'signin', switchKey: 'auth.toSignIn' },
}

export function AuthForm({ onSignIn, onSignUp }) {
  const { t } = useI18n()
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorKey, setErrorKey] = useState(null)
  const [busy, setBusy] = useState(false)

  const copy = COPY[mode]

  async function handleSubmit(event) {
    event.preventDefault()
    setErrorKey(null)
    setBusy(true)

    const action = mode === 'signin' ? onSignIn : onSignUp
    const { error: authError } = await action(email.trim(), password)

    setBusy(false)
    setErrorKey(authErrorKey(authError))
  }

  return (
    <main className="auth">
      <form className="auth__card" onSubmit={handleSubmit}>
        <h1 className="auth__mark">{t('app.mark')}</h1>
        <h2 className="auth__title">{t(copy.titleKey)}</h2>

        <label className="field field--wide">
          <span className="field__label">{t('auth.email')}</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />
        </label>

        <label className="field field--wide">
          <span className="field__label">{t('auth.password')}</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            minLength={6}
            required
          />
        </label>

        {errorKey && <p className="notice notice--warn notice--sticky">{t(errorKey)}</p>}

        <button className="add__submit auth__submit" type="submit" disabled={busy}>
          {t(copy.titleKey)}
        </button>

        <button
          type="button"
          className="auth__switch"
          onClick={() => {
            setErrorKey(null)
            setMode(copy.switchTo)
          }}
        >
          {t(copy.switchKey)}
        </button>
      </form>
    </main>
  )
}
