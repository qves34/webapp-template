import { useState } from 'react'
import { useI18n } from '../lib/i18n/context'
import { KINDS, STATUSES, nextStatus } from '../lib/watchlist'
import { MarkdownRenderer } from './MarkdownRenderer'
import { PosterPicker } from './PosterPicker'

const RATINGS = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1]

export function ItemRow({
  item,
  onUpdate,
  onRemove,
  onMove,
  canMoveUp = false,
  canMoveDown = false,
  onSelect,
  selected,
  onSetCustomBanner,
  readOnly = false,
}) {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const [bannerPickerOpen, setBannerPickerOpen] = useState(false)
  const [bannerSide, setBannerSide] = useState('both')

  if (readOnly) {
    return (
      <li className="row" data-status={item.status}>
        <div className="row__strip" aria-hidden="true" />
        <div className="row__main">
          {item.poster ? (
            <img className="row__poster" src={item.poster} alt="" />
          ) : (
            <span className="row__kind" data-kind={item.kind}>
              {t(`kind.${item.kind}.short`)}
            </span>
          )}
          <span className="row__title">
            {item.title}
            {item.year && <span className="row__year"> ({item.year})</span>}
          </span>

          {item.progress && <span className="row__progress">{item.progress}</span>}
          {item.rating != null && (
            <span className="row__rating" title={t('row.ratingTitle', { rating: item.rating })}>
              {item.rating}
            </span>
          )}
          {item.hated && (
            <span className="row__hated" title={t('row.hated')}>
              HATED
            </span>
          )}
          {item.favorite && (
            <span
              className="row__favorite row__favorite--static"
              data-active
              title={t('row.favorite')}
            >
              ★
            </span>
          )}

          <span className="row__status row__status--static">{t(`status.${item.status}`)}</span>
        </div>

        {item.note && <MarkdownRenderer text={item.note} className="row__note" />}
      </li>
    )
  }

  return (
    <li className="row" data-status={item.status} data-open={open || undefined}>
      <div className="row__strip" aria-hidden="true" />

      {onSelect && (
        <div className="row__checkbox">
          <input
            type="checkbox"
            checked={selected}
            onChange={(e) => onSelect(item.id, e.target.checked)}
            aria-label={t('row.select')}
          />
        </div>
      )}

      <div className="row__main">
        {item.poster ? (
          <img className="row__poster" src={item.poster} alt="" />
        ) : (
          <span className="row__kind" data-kind={item.kind}>
            {t(`kind.${item.kind}.short`)}
          </span>
        )}
        <span className="row__title">
          {item.title}
          {item.year && <span className="row__year"> ({item.year})</span>}
        </span>

        {item.progress && <span className="row__progress">{item.progress}</span>}
        {item.rating != null && (
          <span className="row__rating" title={t('row.ratingTitle', { rating: item.rating })}>
            {item.rating}
          </span>
        )}
        {item.hated && (
          <span className="row__hated" title={t('row.hated')}>
            HATED
          </span>
        )}

        <button
          type="button"
          className="row__favorite"
          data-active={item.favorite || undefined}
          aria-pressed={item.favorite}
          onClick={() => onUpdate(item.id, { favorite: !item.favorite })}
          title={item.favorite ? t('row.favoriteRemove') : t('row.favoriteAdd')}
        >
          {item.favorite ? '★' : '☆'}
        </button>

        <button
          type="button"
          className="row__status"
          onClick={() => onUpdate(item.id, { status: nextStatus(item.status) })}
          title={t('row.statusSwitch', { label: t(`status.${nextStatus(item.status)}`) })}
        >
          {t(`status.${item.status}`)}
        </button>

        <button
          type="button"
          className="row__toggle"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
        >
          {open ? t('row.editDone') : t('row.edit')}
        </button>
      </div>

      {open && (
        <div className="detail">
          <label className="field field--wide">
            <span className="field__label">{t('field.title')}</span>
            <input
              value={item.title}
              onChange={(event) => onUpdate(item.id, { title: event.target.value })}
            />
          </label>

          <label className="field">
            <span className="field__label">{t('field.kind')}</span>
            <select
              value={item.kind}
              onChange={(event) => onUpdate(item.id, { kind: event.target.value })}
            >
              {KINDS.map((option) => (
                <option key={option} value={option}>
                  {t(`kind.${option}`)}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span className="field__label">{t('field.status')}</span>
            <select
              value={item.status}
              onChange={(event) => onUpdate(item.id, { status: event.target.value })}
            >
              {STATUSES.map((option) => (
                <option key={option} value={option}>
                  {t(`status.${option}`)}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span className="field__label">{t('field.progress')}</span>
            <input
              value={item.progress}
              onChange={(event) => onUpdate(item.id, { progress: event.target.value })}
              placeholder="S2E5"
            />
          </label>

          <label className="field">
            <span className="field__label">{t('field.rating')}</span>
            <select
              value={item.rating ?? ''}
              onChange={(event) =>
                onUpdate(item.id, {
                  rating: event.target.value === '' ? null : Number(event.target.value),
                })
              }
            >
              <option value="">{t('field.ratingNone')}</option>
              {RATINGS.map((value) => (
                <option key={value} value={value}>
                  {value} / 10
                </option>
              ))}
            </select>
          </label>

          <label className="field field--check">
            <input
              type="checkbox"
              checked={item.hated}
              onChange={(event) => onUpdate(item.id, { hated: event.target.checked })}
            />
            <span className="field__label">HATED</span>
          </label>

          <label className="field field--wide">
            <span className="field__label">{t('field.note')}</span>
            <textarea
              rows={2}
              value={item.note}
              onChange={(event) => onUpdate(item.id, { note: event.target.value })}
              placeholder={t('field.notePlaceholder')}
            />
          </label>

          <label className="field field--wide">
            <span className="field__label">{t('field.posterUrl')}</span>
            <input
              value={item.poster || ''}
              onChange={(event) => onUpdate(item.id, { poster: event.target.value })}
              placeholder={t('field.posterUrlPlaceholder')}
            />
          </label>

          <button type="button" className="detail__remove" onClick={() => onRemove(item)}>
            {t('row.delete')}
          </button>

          {onMove && (
            <div className="detail__move">
              <button
                type="button"
                className="detail__move-btn"
                onClick={() => onMove(item.id, 'up')}
                disabled={!canMoveUp}
                title={t('row.moveUp')}
              >
                ↑
              </button>
              <button
                type="button"
                className="detail__move-btn"
                onClick={() => onMove(item.id, 'down')}
                disabled={!canMoveDown}
                title={t('row.moveDown')}
              >
                ↓
              </button>
            </div>
          )}

          {onSetCustomBanner && item.tmdbId && (
            <div className="detail__banner">
              <button
                type="button"
                className="detail__remove"
                onClick={() => setBannerPickerOpen((value) => !value)}
              >
                {t(bannerPickerOpen ? 'row.bannerPickerClose' : 'row.bannerPickerOpen')}
              </button>
              {bannerPickerOpen && (
                <>
                  <div className="segmented" role="radiogroup" aria-label={t('row.bannerSideLabel')}>
                    <button
                      type="button"
                      role="radio"
                      aria-checked={bannerSide === 'both'}
                      className="segmented__option"
                      onClick={() => setBannerSide('both')}
                    >
                      {t('row.bannerSideBoth')}
                    </button>
                    <button
                      type="button"
                      role="radio"
                      aria-checked={bannerSide === 'left'}
                      className="segmented__option"
                      onClick={() => setBannerSide('left')}
                    >
                      {t('row.bannerSideLeft')}
                    </button>
                    <button
                      type="button"
                      role="radio"
                      aria-checked={bannerSide === 'right'}
                      className="segmented__option"
                      onClick={() => setBannerSide('right')}
                    >
                      {t('row.bannerSideRight')}
                    </button>
                  </div>
                  <PosterPicker
                    tmdbId={item.tmdbId}
                    kind={item.kind}
                    onPick={(url) => {
                      onSetCustomBanner(bannerSide, url)
                      setBannerPickerOpen(false)
                    }}
                  />
                </>
              )}
            </div>
          )}
        </div>
      )}

      {!open && item.note && <MarkdownRenderer text={item.note} className="row__note" />}
    </li>
  )
}
