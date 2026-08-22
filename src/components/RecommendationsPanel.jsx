import { useI18n } from '../lib/i18n/context'
import { MIN_SEEDS } from '../hooks/useRecommendations'

export function RecommendationsPanel({ results, loading, error, seedCount, existingTmdbIds, onAdd }) {
  const { t } = useI18n()

  if (seedCount < MIN_SEEDS) {
    return <p className="empty">{t('recommendations.needMore', { count: MIN_SEEDS })}</p>
  }

  if (loading) return <p className="empty">{t('app.loading')}</p>
  if (error) return <p className="empty">{t('recommendations.error')}</p>

  const visible = results.filter((item) => !existingTmdbIds.has(item.tmdbId))
  if (visible.length === 0) return <p className="empty">{t('recommendations.empty')}</p>

  return (
    <div className="recommendations">
      {visible.map((item) => (
        <div key={item.tmdbId} className="rec-card">
          {item.poster ? (
            <img className="rec-card__poster" src={item.poster} alt="" loading="lazy" />
          ) : (
            <span className="rec-card__poster rec-card__poster--empty" aria-hidden="true" />
          )}
          <span className="rec-card__title">{item.title}</span>
          <span className="rec-card__meta" data-kind={item.kind}>
            {t(`kind.${item.kind}`)}
            {item.year ? ` · ${item.year}` : ''}
          </span>
          <button type="button" className="rec-card__add" onClick={() => onAdd(item)}>
            {t('recommendations.add')}
          </button>
        </div>
      ))}
    </div>
  )
}
