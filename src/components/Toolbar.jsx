import { useI18n } from '../lib/i18n/context'
import { KINDS, SORT_MODES, STATUSES } from '../lib/watchlist'

export function Toolbar({
  filter,
  onFilter,
  kindFilter,
  onKindFilter,
  sort,
  onSort,
  query,
  onQuery,
  counts,
  kindCounts,
  total,
  batchMode,
  onToggleBatchMode,
  selectedCount,
  onBatchUpdate,
  onBatchDelete,
}) {
  const { t } = useI18n()

  return (
    <div className="toolbar">
      <div className="toolbar__tabs">
        <div className="tabs" role="tablist" aria-label={t('toolbar.filterStatus')}>
          <button
            type="button"
            role="tab"
            aria-selected={filter === 'vse'}
            className="tab"
            onClick={() => onFilter('vse')}
          >
            {t('toolbar.all')} <span className="tab__count">{total}</span>
          </button>
          {STATUSES.map((status) => (
            <button
              key={status}
              type="button"
              role="tab"
              aria-selected={filter === status}
              className="tab"
              data-status={status}
              onClick={() => onFilter(status)}
            >
              {t(`status.${status}`)} <span className="tab__count">{counts[status] ?? 0}</span>
            </button>
          ))}
        </div>

        <div className="tabs" role="tablist" aria-label={t('toolbar.filterKind')}>
          <button
            type="button"
            role="tab"
            aria-selected={kindFilter === 'vse'}
            className="tab"
            onClick={() => onKindFilter('vse')}
          >
            {t('toolbar.all')}
          </button>
          {KINDS.map((kind) => (
            <button
              key={kind}
              type="button"
              role="tab"
              aria-selected={kindFilter === kind}
              className="tab"
              data-kind={kind}
              onClick={() => onKindFilter(kind)}
            >
              {t(`kind.${kind}`)} <span className="tab__count">{kindCounts[kind] ?? 0}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="toolbar__controls">
        {batchMode && selectedCount > 0 && (
          <div className="batch-controls">
            <span className="batch-info">{t('toolbar.selected', { count: selectedCount })}</span>
            <select
              className="batch-action"
              onChange={(e) => {
                const [field, value] = e.target.value.split(':')
                if (field === 'delete') {
                  onBatchDelete()
                } else {
                  onBatchUpdate(field, value)
                }
              }}
            >
              <option value="">{t('toolbar.batchAction')}</option>
              <option value="status:chci">{t('status.chci')}</option>
              <option value="status:divam">{t('status.divam')}</option>
              <option value="status:pauza">{t('status.pauza')}</option>
              <option value="status:preruseno">{t('status.preruseno')}</option>
              <option value="status:hotovo">{t('status.hotovo')}</option>
              <option value="favorite:true">{t('row.favoriteAdd')}</option>
              <option value="favorite:false">{t('row.favoriteRemove')}</option>
              <option value="delete">{t('row.delete')}</option>
            </select>
          </div>
        )}

        <button
          type="button"
          className={`batch-toggle ${batchMode ? 'batch-toggle--active' : ''}`}
          onClick={onToggleBatchMode}
          title={batchMode ? t('toolbar.exitBatchMode') : t('toolbar.enterBatchMode')}
        >
          {batchMode ? '✕' : '☐'}
        </button>

        <select
          className="sort"
          value={sort}
          onChange={(event) => onSort(event.target.value)}
          aria-label={t('toolbar.sort')}
        >
          {SORT_MODES.map((mode) => (
            <option key={mode} value={mode}>
              {t('toolbar.sortOption', { label: t(`sort.${mode}`) })}
            </option>
          ))}
        </select>

        <input
          className="search"
          type="search"
          value={query}
          onChange={(event) => onQuery(event.target.value)}
          placeholder={t('toolbar.search')}
          aria-label={t('toolbar.searchAria')}
        />
      </div>
    </div>
  )
}
