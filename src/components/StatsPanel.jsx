import { useMemo } from 'react'
import { useI18n } from '../lib/i18n/context'
import { computeStats } from '../lib/stats'
import { KINDS, STATUSES } from '../lib/watchlist'

const KIND_COLOR = { film: 'var(--kind-film)', anime: 'var(--kind-anime)', serial: 'var(--kind-serial)' }
// Stejné barvy jako "sprocket" akcent u řádků titulu (App.css .row[data-status]),
// ať grafy v přehledu ladí s tím, na co je uživatel zvyklý ze seznamu.
const STATUS_COLOR = {
  chci: 'var(--dim-2)',
  divam: 'var(--tape)',
  pauza: 'var(--gold)',
  preruseno: 'var(--dim-2)',
  hotovo: 'var(--done)',
}

export function StatsPanel({ items, locale }) {
  const { t } = useI18n()
  const stats = useMemo(() => computeStats(items), [items])

  if (stats.total === 0) {
    return <p className="empty">{t('stats.empty')}</p>
  }

  const busiestMonthLabel = stats.busiestMonth
    ? new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long' }).format(
        new Date(`${stats.busiestMonth}-01`),
      )
    : null

  return (
    <div className="stats">
      <div className="stats__tiles">
        <StatTile label={t('stats.total')} value={stats.total} />
        <StatTile label={t('profile.favorites')} value={stats.favoriteCount} />
        <StatTile label={t('stats.hated')} value={stats.hatedCount} />
        <StatTile
          label={t('stats.avgRating')}
          value={stats.averageRating != null ? stats.averageRating.toFixed(1) : '—'}
        />
      </div>

      {busiestMonthLabel && (
        <p className="stats__highlight">
          {t('stats.busiestMonth', { month: busiestMonthLabel, count: stats.busiestMonthCount })}
        </p>
      )}

      <section className="stats__section">
        <h3 className="stats__heading">{t('stats.byKindHeading')}</h3>
        <div className="stats__bars">
          {KINDS.map((kind) => (
            <StatsBar
              key={kind}
              label={t(`kind.${kind}`)}
              value={stats.byKind[kind]}
              total={stats.total}
              color={KIND_COLOR[kind]}
            />
          ))}
        </div>
      </section>

      <section className="stats__section">
        <h3 className="stats__heading">{t('stats.byStatusHeading')}</h3>
        <div className="stats__bars">
          {STATUSES.map((status) => (
            <StatsBar
              key={status}
              label={t(`status.${status}`)}
              value={stats.byStatus[status]}
              total={stats.total}
              color={STATUS_COLOR[status]}
            />
          ))}
        </div>
      </section>

      {stats.topRated.length > 0 && (
        <section className="stats__section">
          <h3 className="stats__heading">{t('stats.topRatedHeading')}</h3>
          <ol className="stats__top-list">
            {stats.topRated.map((item) => (
              <li key={item.id} className="stats__top-item">
                <span className="stats__top-title">{item.title}</span>
                <span className="stats__top-rating">{item.rating} / 10</span>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  )
}

function StatTile({ label, value }) {
  return (
    <div className="stat-tile">
      <span className="stat-tile__value">{value}</span>
      <span className="stat-tile__label">{label}</span>
    </div>
  )
}

function StatsBar({ label, value, total, color }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0
  return (
    <div className="stats-bar">
      <div className="stats-bar__label">
        <span>{label}</span>
        <span className="stats-bar__value">{value}</span>
      </div>
      <div className="stats-bar__track">
        <div className="stats-bar__fill" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  )
}
