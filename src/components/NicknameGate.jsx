import { useState } from 'react'
import { useI18n } from '../lib/i18n/context'

export function NicknameGate({ onSetNickname }) {
  const { t } = useI18n()
  const [value, setValue] = useState('')
  const [errorKey, setErrorKey] = useState(null)
  const [busy, setBusy] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setErrorKey(null)
    setBusy(true)

    const { error: nicknameError } = await onSetNickname(value)

    setBusy(false)
    if (nicknameError) setErrorKey(nicknameError.key ?? 'nickname.errGeneric')
  }

  return (
    <main className="auth">
      <form className="auth__card" onSubmit={handleSubmit}>
        <h1 className="auth__mark">{t('app.mark')}</h1>
        <h2 className="auth__title">{t('nickname.title')}</h2>
        <p className="auth__hint">{t('nickname.hint')}</p>

        <label className="field field--wide">
          <span className="field__label">{t('nickname.label')}</span>
          <input
            value={value}
            onChange={(event) => setValue(event.target.value)}
            autoComplete="off"
            minLength={3}
            maxLength={20}
            required
          />
        </label>

        {errorKey && <p className="notice notice--warn notice--sticky">{t(errorKey)}</p>}

        <button className="add__submit auth__submit" type="submit" disabled={busy}>
          {t('nickname.submit')}
        </button>
      </form>
    </main>
  )
}
