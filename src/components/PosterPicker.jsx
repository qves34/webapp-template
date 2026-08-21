import { useI18n } from '../lib/i18n/context'
import { useTitlePosters } from '../hooks/useTitlePosters'

export function PosterPicker({ tmdbId, kind, onPick }) {
  const { t } = useI18n()
  const { posters, loading } = useTitlePosters(tmdbId, kind, true)

  if (loading) return <p className="profile__hint">{t('row.bannerPickerLoading')}</p>
  if (posters.length === 0) return <p className="profile__hint">{t('row.bannerPickerEmpty')}</p>

  return (
    <div className="poster-picker">
      {posters.map((url) => (
        <button
          key={url}
          type="button"
          className="poster-picker__option"
          onClick={() => onPick(url)}
          aria-label={t('row.bannerPickerChoose')}
        >
          <img src={url} alt="" loading="lazy" />
        </button>
      ))}
    </div>
  )
}
