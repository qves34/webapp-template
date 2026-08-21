import { useEffect, useState } from 'react'
import { useI18n } from '../lib/i18n/context'

const DEBOUNCE_MS = 350

export function FriendsPanel({
  friends,
  incoming,
  outgoing,
  nicknames,
  recommendations,
  searchNickname,
  sendRequest,
  acceptRequest,
  removeFriendship,
  onViewFriend,
}) {
  const { t } = useI18n()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [noticeKey, setNoticeKey] = useState(null)

  const friendIds = new Set(friends.map((f) => f.otherId))
  const outgoingIds = new Set(outgoing.map((f) => f.otherId))
  const incomingIds = new Set(incoming.map((f) => f.otherId))

  useEffect(() => {
    const needle = query.trim()
    if (needle.length < 2) {
      setResults([])
      return
    }

    const timer = setTimeout(async () => {
      const results = await searchNickname(needle)
      setResults(results)
    }, DEBOUNCE_MS)

    return () => clearTimeout(timer)
  }, [query, searchNickname])

  async function handleSend(id) {
    const { error } = await sendRequest(id)
    setNoticeKey(error ? (error.key ?? 'friends.errGeneric') : 'friends.requestSent')
  }

  async function handleAccept(friendshipId) {
    await acceptRequest(friendshipId)
  }

  async function handleRemove(friendshipId) {
    await removeFriendship(friendshipId)
  }

  return (
    <div className="friends">
      <div className="friends__search">
        <input
          className="search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t('friends.searchPlaceholder')}
          aria-label={t('friends.searchPlaceholder')}
        />
        {results.length > 0 && (
          <ul className="friends__results">
            {results.map((result) => (
              <li key={result.id} className="friends__row">
                <span className="friends__nickname">{result.nickname}</span>
                {friendIds.has(result.id) ? (
                  <span className="friends__state">{t('friends.stateFriends')}</span>
                ) : outgoingIds.has(result.id) ? (
                  <span className="friends__state">{t('friends.statePending')}</span>
                ) : incomingIds.has(result.id) ? (
                  <span className="friends__state">{t('friends.stateIncoming')}</span>
                ) : (
                  <button type="button" className="ghost" onClick={() => handleSend(result.id)}>
                    {t('friends.add')}
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {noticeKey && (
        <p
          className={`notice notice--${noticeKey === 'friends.requestSent' ? 'ok' : 'warn'}`}
          onAnimationEnd={() => setNoticeKey(null)}
        >
          {t(noticeKey)}
        </p>
      )}

      {incoming.length > 0 && (
        <section className="friends__section">
          <h3 className="friends__heading">{t('friends.incomingHeading')}</h3>
          <ul className="friends__list">
            {incoming.map((f) => (
              <li key={f.id} className="friends__row">
                <span className="friends__nickname">{nicknames[f.otherId] ?? '…'}</span>
                <span className="friends__actions">
                  <button type="button" className="ghost" onClick={() => handleAccept(f.id)}>
                    {t('friends.accept')}
                  </button>
                  <button type="button" className="ghost" onClick={() => handleRemove(f.id)}>
                    {t('friends.decline')}
                  </button>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="friends__section">
        <h3 className="friends__heading">{t('friends.heading')}</h3>
        {friends.length === 0 ? (
          <p className="empty">{t('friends.empty')}</p>
        ) : (
          <ul className="friends__list">
            {friends.map((f) => (
              <li key={f.id} className="friends__row">
                <button
                  type="button"
                  className="friends__nickname friends__nickname--link"
                  onClick={() => onViewFriend(f.otherId, nicknames[f.otherId])}
                >
                  {nicknames[f.otherId] ?? '…'}
                </button>
                <button type="button" className="ghost" onClick={() => handleRemove(f.id)}>
                  {t('friends.remove')}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {recommendations.length > 0 && (
        <section className="friends__section">
          <h3 className="friends__heading">{t('friends.recommendations')}</h3>
          <ul className="friends__list">
            {recommendations.map((rec) => (
              <li key={rec.candidate_id} className="friends__row">
                <span className="friends__nickname">{rec.nickname}</span>
                <span className="friends__actions">
                  <span className="friends__state">
                    {t('friends.shared', { count: rec.shared_count })}
                    {rec.shared_favorite_count > 0
                      ? t('friends.sharedFavorites', { count: rec.shared_favorite_count })
                      : ''}
                  </span>
                  <button
                    type="button"
                    className="ghost"
                    onClick={() => handleSend(rec.candidate_id)}
                  >
                    {t('friends.add')}
                  </button>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {outgoing.length > 0 && (
        <section className="friends__section">
          <h3 className="friends__heading">{t('friends.outgoingHeading')}</h3>
          <ul className="friends__list">
            {outgoing.map((f) => (
              <li key={f.id} className="friends__row">
                <span className="friends__nickname">{nicknames[f.otherId] ?? '…'}</span>
                <button type="button" className="ghost" onClick={() => handleRemove(f.id)}>
                  {t('friends.cancel')}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
