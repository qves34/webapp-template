import { useState } from 'react'
import { authErrorKey } from '../lib/authErrors'
import { useI18n } from '../lib/i18n/context'
import { BIO_MAX_LENGTH } from '../lib/profile'
import { ItemRow } from './ItemRow'

export function ProfilePanel({
  email,
  nickname,
  onSetNickname,
  bio,
  onSetBio,
  onUpdatePassword,
  favorites,
  onUpdateItem,
  onRemoveItem,
}) {
  const { t } = useI18n()
  const [nicknameValue, setNicknameValue] = useState(nickname)
  const [nicknameBusy, setNicknameBusy] = useState(false)
  const [nicknameNotice, setNicknameNotice] = useState(null)

  const [bioValue, setBioValue] = useState(bio)
  const [bioBusy, setBioBusy] = useState(false)
  const [bioNotice, setBioNotice] = useState(null)

  const [password, setPassword] = useState('')
  const [passwordBusy, setPasswordBusy] = useState(false)
  const [passwordNotice, setPasswordNotice] = useState(null)

  async function handleNicknameSubmit(event) {
    event.preventDefault()
    setNicknameBusy(true)
    const { error } = await onSetNickname(nicknameValue)
    setNicknameBusy(false)
    setNicknameNotice(
      error ? { kind: 'warn', key: error.key ?? 'nickname.errGeneric' } : { kind: 'ok', key: 'profile.nicknameUpdated' },
    )
  }

  async function handleBioSubmit(event) {
    event.preventDefault()
    setBioBusy(true)
    const { error } = await onSetBio(bioValue)
    setBioBusy(false)
    setBioNotice(
      error ? { kind: 'warn', key: error.key ?? 'profile.bioErrGeneric' } : { kind: 'ok', key: 'profile.bioUpdated' },
    )
  }

  async function handlePasswordSubmit(event) {
    event.preventDefault()
    setPasswordBusy(true)
    const { error } = await onUpdatePassword(password)
    setPasswordBusy(false)
    if (error) {
      setPasswordNotice({ kind: 'warn', key: authErrorKey(error) })
      return
    }
    setPassword('')
    setPasswordNotice({ kind: 'ok', key: 'profile.passwordUpdated' })
  }

  return (
    <div className="friends">
      <section className="friends__section">
        <h3 className="friends__heading">{t('profile.accountHeading')}</h3>

        <p className="friends__row">
          <span className="friends__nickname">{t('auth.email')}</span>
          <span className="friends__state">{email}</span>
        </p>

        <form className="profile__form" onSubmit={handleNicknameSubmit}>
          <label className="field field--wide">
            <span className="field__label">{t('nickname.label')}</span>
            <input
              value={nicknameValue}
              onChange={(event) => setNicknameValue(event.target.value)}
              minLength={3}
              maxLength={20}
              required
            />
          </label>
          {nicknameNotice && (
            <p
              className={`notice notice--${nicknameNotice.kind}`}
              onAnimationEnd={() => setNicknameNotice(null)}
            >
              {t(nicknameNotice.key)}
            </p>
          )}
          <button type="submit" className="ghost" disabled={nicknameBusy || !nicknameValue.trim()}>
            {t('profile.saveNickname')}
          </button>
        </form>

        <form className="profile__form" onSubmit={handleBioSubmit}>
          <label className="field field--wide">
            <span className="field__label">{t('profile.bioLabel')}</span>
            <textarea
              rows={3}
              value={bioValue}
              onChange={(event) => setBioValue(event.target.value)}
              maxLength={BIO_MAX_LENGTH}
              placeholder={t('profile.bioPlaceholder')}
            />
          </label>
          <p className="profile__hint">{t('profile.bioHint')}</p>
          {bioNotice && (
            <p
              className={`notice notice--${bioNotice.kind}`}
              onAnimationEnd={() => setBioNotice(null)}
            >
              {t(bioNotice.key)}
            </p>
          )}
          <button type="submit" className="ghost" disabled={bioBusy}>
            {t('profile.saveBio')}
          </button>
        </form>

        <form className="profile__form" onSubmit={handlePasswordSubmit}>
          <label className="field field--wide">
            <span className="field__label">{t('profile.newPassword')}</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
              minLength={6}
              required
            />
          </label>
          {passwordNotice && (
            <p
              className={`notice notice--${passwordNotice.kind}`}
              onAnimationEnd={() => setPasswordNotice(null)}
            >
              {t(passwordNotice.key)}
            </p>
          )}
          <button type="submit" className="ghost" disabled={passwordBusy}>
            {t('profile.savePassword')}
          </button>
        </form>
      </section>

      <section className="friends__section">
        <h3 className="friends__heading">{t('profile.favorites')}</h3>
        {favorites.length === 0 ? (
          <p className="empty">{t('profile.favoritesEmpty')}</p>
        ) : (
          <ul className="list">
            {favorites.map((item) => (
              <ItemRow key={item.id} item={item} onUpdate={onUpdateItem} onRemove={onRemoveItem} />
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
