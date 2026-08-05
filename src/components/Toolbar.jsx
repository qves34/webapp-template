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
}) {
  return (
    <div className="toolbar">
      <div className="toolbar__tabs">
        <div className="tabs" role="tablist" aria-label="Filtr podle stavu">
          <button
            type="button"
            role="tab"
            aria-selected={filter === 'vse'}
            className="tab"
            onClick={() => onFilter('vse')}
          >
            Vše <span className="tab__count">{total}</span>
          </button>
          {STATUSES.map((status) => (
            <button
              key={status.id}
              type="button"
              role="tab"
              aria-selected={filter === status.id}
              className="tab"
              data-status={status.id}
              onClick={() => onFilter(status.id)}
            >
              {status.label} <span className="tab__count">{counts[status.id] ?? 0}</span>
            </button>
          ))}
        </div>

        <div className="tabs" role="tablist" aria-label="Filtr podle typu">
          <button
            type="button"
            role="tab"
            aria-selected={kindFilter === 'vse'}
            className="tab"
            onClick={() => onKindFilter('vse')}
          >
            Vše
          </button>
          {KINDS.map((kind) => (
            <button
              key={kind.id}
              type="button"
              role="tab"
              aria-selected={kindFilter === kind.id}
              className="tab"
              data-kind={kind.id}
              onClick={() => onKindFilter(kind.id)}
            >
              {kind.label} <span className="tab__count">{kindCounts[kind.id] ?? 0}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="toolbar__controls">
        <select
          className="sort"
          value={sort}
          onChange={(event) => onSort(event.target.value)}
          aria-label="Řadit"
        >
          {SORT_MODES.map((mode) => (
            <option key={mode.id} value={mode.id}>
              Řadit: {mode.label}
            </option>
          ))}
        </select>

        <input
          className="search"
          type="search"
          value={query}
          onChange={(event) => onQuery(event.target.value)}
          placeholder="Hledat"
          aria-label="Hledat v seznamu"
        />
      </div>
    </div>
  )
}
