import { useEffect, useState } from 'react'

const DEBOUNCE_MS = 350

export function FriendsPanel({
  friends,
  incoming,
  outgoing,
  nicknames,
  searchNickname,
  sendRequest,
  acceptRequest,
  removeFriendship,
  onViewFriend,
}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [notice, setNotice] = useState(null)

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
    setNotice(error ? error.message : 'Žádost odeslána.')
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
          placeholder="Hledat podle nicku"
          aria-label="Hledat podle nicku"
        />
        {results.length > 0 && (
          <ul className="friends__results">
            {results.map((result) => (
              <li key={result.id} className="friends__row">
                <span className="friends__nickname">{result.nickname}</span>
                {friendIds.has(result.id) ? (
                  <span className="friends__state">Přátelé</span>
                ) : outgoingIds.has(result.id) ? (
                  <span className="friends__state">Žádost čeká</span>
                ) : incomingIds.has(result.id) ? (
                  <span className="friends__state">Čeká na tebe</span>
                ) : (
                  <button type="button" className="ghost" onClick={() => handleSend(result.id)}>
                    Přidat
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {notice && (
        <p className="notice notice--ok" onAnimationEnd={() => setNotice(null)}>
          {notice}
        </p>
      )}

      {incoming.length > 0 && (
        <section className="friends__section">
          <h3 className="friends__heading">Žádosti o přátelství</h3>
          <ul className="friends__list">
            {incoming.map((f) => (
              <li key={f.id} className="friends__row">
                <span className="friends__nickname">{nicknames[f.otherId] ?? '…'}</span>
                <span className="friends__actions">
                  <button type="button" className="ghost" onClick={() => handleAccept(f.id)}>
                    Přijmout
                  </button>
                  <button type="button" className="ghost" onClick={() => handleRemove(f.id)}>
                    Odmítnout
                  </button>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="friends__section">
        <h3 className="friends__heading">Přátelé</h3>
        {friends.length === 0 ? (
          <p className="empty">Zatím žádní přátelé. Najdi je výše podle nicku.</p>
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
                  Odebrat
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {outgoing.length > 0 && (
        <section className="friends__section">
          <h3 className="friends__heading">Odeslané žádosti</h3>
          <ul className="friends__list">
            {outgoing.map((f) => (
              <li key={f.id} className="friends__row">
                <span className="friends__nickname">{nicknames[f.otherId] ?? '…'}</span>
                <button type="button" className="ghost" onClick={() => handleRemove(f.id)}>
                  Zrušit
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
