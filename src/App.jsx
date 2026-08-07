import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import { AddForm } from './components/AddForm'
import { AuthForm } from './components/AuthForm'
import { FriendsPanel } from './components/FriendsPanel'
import { ItemRow } from './components/ItemRow'
import { NicknameGate } from './components/NicknameGate'
import { ProfilePanel } from './components/ProfilePanel'
import { Toolbar } from './components/Toolbar'
import { useAuth } from './hooks/useAuth'
import { useFriends } from './hooks/useFriends'
import { useFriendProfile } from './hooks/useFriendProfile'
import { useFriendWatchlist } from './hooks/useFriendWatchlist'
import { useProfile } from './hooks/useProfile'
import { useTheme } from './hooks/useTheme'
import { useWatchlist } from './hooks/useWatchlist'
import { useI18n } from './lib/i18n/context'
import { localeMeta, nextLocale } from './lib/i18n/core'
import { STATUSES, loadItems, sortItems } from './lib/watchlist'

const MIGRATION_FLAG = 'watchlist.migrated.v1'

function App() {
  const { session, user, loading, signIn, signUp, signOut, updatePassword } = useAuth()
  const { t } = useI18n()

  return (
    <>
      <div className="controls">
        <LocaleToggle />
        <ThemeToggle />
      </div>

      {loading ? (
        <p className="app-loading">{t('app.loading')}</p>
      ) : !session ? (
        <AuthForm onSignIn={signIn} onSignUp={signUp} />
      ) : (
        <Gate user={user} onSignOut={signOut} onUpdatePassword={updatePassword} />
      )}
    </>
  )
}

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const { t } = useI18n()

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={theme === 'dark' ? t('theme.toLight') : t('theme.toDark')}
      title={theme === 'dark' ? t('theme.light') : t('theme.dark')}
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  )
}

/** Ukazuje jazyk, na který se přepne - ne ten, co je zapnutý. */
function LocaleToggle() {
  const { locale, toggleLocale, t } = useI18n()
  const next = localeMeta(nextLocale(locale))

  return (
    <button
      type="button"
      className="lang-toggle"
      onClick={toggleLocale}
      aria-label={t('lang.switchTo', { lang: next.name })}
      title={t('lang.switchTo', { lang: next.name })}
      lang={next.htmlLang}
    >
      {next.short}
    </button>
  )
}

/** Nickname je potřeba dřív, než appku vůbec uvidíš - jinak by tě přátelé nenašli. */
function Gate({ user, onSignOut, onUpdatePassword }) {
  const { nickname, bio, loading, setNickname, setBio } = useProfile(user.id)
  const { t } = useI18n()

  if (loading) return <p className="app-loading">{t('app.loading')}</p>
  if (!nickname) return <NicknameGate onSetNickname={setNickname} />
  return (
    <Watchlist
      user={user}
      onSignOut={onSignOut}
      nickname={nickname}
      onSetNickname={setNickname}
      bio={bio}
      onSetBio={setBio}
      onUpdatePassword={onUpdatePassword}
    />
  )
}

function Watchlist({ user, onSignOut, nickname, onSetNickname, bio, onSetBio, onUpdatePassword }) {
  const { t, locale } = useI18n()
  const { items, add, update, remove, merge, storageError, loading } = useWatchlist(user.id)
  const {
    friends,
    incoming,
    outgoing,
    nicknames: friendNicknames,
    recommendations,
    searchNickname,
    sendRequest,
    acceptRequest,
    removeFriendship,
  } = useFriends(user.id)
  const [filter, setFilter] = useState('vse')
  const [kindFilter, setKindFilter] = useState('vse')
  const [sort, setSort] = useState('stav')
  const [query, setQuery] = useState('')
  const [notice, setNotice] = useState(null)
  const [migration, setMigration] = useState(null)
  const [view, setView] = useState('mine')
  const [viewingFriend, setViewingFriend] = useState(null)
  const friendWatchlist = useFriendWatchlist(viewingFriend?.id)
  const friendProfile = useFriendProfile(viewingFriend?.id)
  const noticeId = useRef(0)
  const migrationChecked = useRef(false)

  // Nový klíč při každé hlášce, aby se odpočet do zmizení spustil znovu.
  // Držíme klíč do slovníku a proměnné, ne hotový text - hláška se tak přeloží
  // i zpětně, když uživatel mezitím přepne jazyk.
  function showNotice(kind, key, vars) {
    noticeId.current += 1
    setNotice({ id: noticeId.current, kind, key, vars })
  }

  // Jednou za přihlášení do tohoto prohlížeče nabídne nahrání dat, co tu
  // z dřívějška zůstala v localStorage (dokud appka ještě neměla účty).
  useEffect(() => {
    if (loading || migrationChecked.current) return
    migrationChecked.current = true

    if (localStorage.getItem(MIGRATION_FLAG) === '1') return

    const localItems = loadItems()
    if (localItems.length === 0) {
      localStorage.setItem(MIGRATION_FLAG, '1')
      return
    }

    setMigration(localItems)
  }, [loading])

  function acceptMigration() {
    const { added, updated } = merge(migration)
    localStorage.setItem(MIGRATION_FLAG, '1')
    const total = migration.length
    setMigration(null)
    showNotice('ok', 'migration.done', { count: added + updated, total })
  }

  function declineMigration() {
    localStorage.setItem(MIGRATION_FLAG, '1')
    setMigration(null)
  }

  const counts = useMemo(() => {
    const result = {}
    for (const item of items) result[item.status] = (result[item.status] ?? 0) + 1
    return result
  }, [items])

  const kindCounts = useMemo(() => {
    const result = {}
    for (const item of items) result[item.kind] = (result[item.kind] ?? 0) + 1
    return result
  }, [items])

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase()
    const filtered = items.filter((item) => {
      if (filter !== 'vse' && item.status !== filter) return false
      if (kindFilter !== 'vse' && item.kind !== kindFilter) return false
      if (!needle) return true
      return `${item.title} ${item.note}`.toLowerCase().includes(needle)
    })
    return sortItems(filtered, sort, locale)
  }, [items, filter, kindFilter, query, sort, locale])

  const watching = items.filter((item) => item.status === 'divam')

  function handleAdd(title, kind, extra) {
    add(title, kind, extra)
    setQuery('')
    if (filter !== 'vse' && filter !== 'chci') setFilter('vse')
  }

  function handleRemove(item) {
    if (window.confirm(t('row.confirmDelete', { title: item.title }))) remove(item.id)
  }

  function goHome() {
    setViewingFriend(null)
    setView('mine')
  }

  function openFriends() {
    setViewingFriend(null)
    setView('friends')
  }

  function openProfile() {
    setViewingFriend(null)
    setView('profile')
  }

  function viewFriendWatchlist(id, nickname) {
    setViewingFriend({ id, nickname })
  }

  if (viewingFriend) {
    return (
      <main className="app">
        <header className="head">
          <div className="head__bar">
            <h1
              className="head__mark head__mark--link"
              role="button"
              tabIndex={0}
              onClick={goHome}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  goHome()
                }
              }}
            >
              {t('app.mark')}
            </h1>
            <div className="head__backup">
              <button type="button" className="ghost" onClick={() => setViewingFriend(null)}>
                {t('nav.backFriends')}
              </button>
              <button type="button" className="ghost" onClick={onSignOut}>
                {t('auth.signOut')}
              </button>
            </div>
          </div>
          <p className="head__now">
            <span className="head__now-label">{t('friends.watchlistOf')}</span>
            <span className="head__now-titles">{viewingFriend.nickname}</span>
          </p>
          {friendProfile.bio && <p className="head__bio">{friendProfile.bio}</p>}
        </header>

        {friendWatchlist.loading ? (
          <p className="empty">{t('app.loading')}</p>
        ) : friendWatchlist.error ? (
          <p className="empty">{t('friends.loadFailed')}</p>
        ) : friendWatchlist.items.length > 0 ? (
          <ul className="list">
            {friendWatchlist.items.map((item) => (
              <ItemRow key={item.id} item={item} readOnly />
            ))}
          </ul>
        ) : (
          <p className="empty">
            {t('friends.watchlistEmpty', { nickname: viewingFriend.nickname })}
          </p>
        )}
      </main>
    )
  }

  if (view === 'friends') {
    return (
      <main className="app">
        <header className="head">
          <div className="head__bar">
            <h1
              className="head__mark head__mark--link"
              role="button"
              tabIndex={0}
              onClick={goHome}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  goHome()
                }
              }}
            >
              {t('app.mark')}
            </h1>
            <div className="head__backup">
              <button type="button" className="ghost" onClick={() => setView('mine')}>
                {t('nav.backMine')}
              </button>
              <button type="button" className="ghost" onClick={onSignOut}>
                {t('auth.signOut')}
              </button>
            </div>
          </div>
        </header>

        <FriendsPanel
          friends={friends}
          incoming={incoming}
          outgoing={outgoing}
          nicknames={friendNicknames}
          recommendations={recommendations}
          searchNickname={searchNickname}
          sendRequest={sendRequest}
          acceptRequest={acceptRequest}
          removeFriendship={removeFriendship}
          onViewFriend={viewFriendWatchlist}
        />
      </main>
    )
  }

  if (view === 'profile') {
    return (
      <main className="app">
        <header className="head">
          <div className="head__bar">
            <h1
              className="head__mark head__mark--link"
              role="button"
              tabIndex={0}
              onClick={goHome}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  goHome()
                }
              }}
            >
              {t('app.mark')}
            </h1>
            <div className="head__backup">
              <button type="button" className="ghost" onClick={() => setView('mine')}>
                {t('nav.backMine')}
              </button>
              <button type="button" className="ghost" onClick={onSignOut}>
                {t('auth.signOut')}
              </button>
            </div>
          </div>
        </header>

        <ProfilePanel
          email={user.email}
          nickname={nickname}
          onSetNickname={onSetNickname}
          bio={bio}
          onSetBio={onSetBio}
          onUpdatePassword={onUpdatePassword}
          favorites={items.filter((item) => item.favorite)}
          onUpdateItem={update}
          onRemoveItem={handleRemove}
        />
      </main>
    )
  }

  return (
    <main className="app">
      <header className="head">
        <div className="head__bar">
          <h1
            className="head__mark head__mark--link"
            role="button"
            tabIndex={0}
            onClick={goHome}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                goHome()
              }
            }}
          >
            {t('app.mark')}
          </h1>
          <div className="head__backup">
            <button type="button" className="ghost" onClick={openFriends}>
              {t('nav.friends')}
              {incoming.length > 0 && <span className="head__badge">{incoming.length}</span>}
            </button>
            <button type="button" className="ghost" onClick={openProfile}>
              {t('nav.profile')}
            </button>
            <button type="button" className="ghost" onClick={onSignOut}>
              {t('auth.signOut')}
            </button>
          </div>
        </div>

        <p className="head__now">
          <span className="head__now-label">
            {watching.length > 0 ? t('head.watchingNow') : t('head.watching')}
          </span>
          {watching.length > 0 ? (
            <span className="head__now-titles">
              {watching.map((item) => item.title).join(' · ')}
            </span>
          ) : (
            <span className="head__now-titles head__now-titles--quiet">
              {items.length > 0
                ? t('head.queued', { count: counts.chci ?? 0 })
                : t('head.nothing')}
            </span>
          )}
        </p>
      </header>

      <AddForm onAdd={handleAdd} />

      <Toolbar
        filter={filter}
        onFilter={setFilter}
        kindFilter={kindFilter}
        onKindFilter={setKindFilter}
        sort={sort}
        onSort={setSort}
        query={query}
        onQuery={setQuery}
        counts={counts}
        kindCounts={kindCounts}
        total={items.length}
      />

      {migration && (
        <p className="notice notice--warn notice--sticky migration">
          {t('migration.prompt', { count: migration.length })}
          <span className="migration__actions">
            <button type="button" className="ghost" onClick={acceptMigration}>
              {t('migration.upload')}
            </button>
            <button type="button" className="ghost" onClick={declineMigration}>
              {t('migration.dismiss')}
            </button>
          </span>
        </p>
      )}

      {storageError && <p className="notice notice--warn notice--sticky">{t('sync.failed')}</p>}

      {notice && (
        <p
          key={notice.id}
          className={`notice notice--${notice.kind}`}
          onAnimationEnd={() => setNotice(null)}
        >
          {t(notice.key, notice.vars)}
        </p>
      )}

      {loading ? (
        <p className="empty">{t('list.loading')}</p>
      ) : visible.length > 0 ? (
        <ul className="list">
          {visible.map((item) => (
            <ItemRow key={item.id} item={item} onUpdate={update} onRemove={handleRemove} />
          ))}
        </ul>
      ) : (
        <p className="empty">
          {query.trim() ? t('list.noMatch', { query: query.trim() }) : t(`empty.${filter}`)}
        </p>
      )}

      <footer className="foot">
        <span>{t('foot.data')}</span>
        {items.length > 0 && (
          <span className="foot__tally">
            {STATUSES.map(
              (status) => `${t(`status.${status}`).toLowerCase()} ${counts[status] ?? 0}`,
            ).join(' · ')}
          </span>
        )}
      </footer>
    </main>
  )
}

export default App
