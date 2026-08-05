import { STATUSES } from '../lib/watchlist'

export function Toolbar({ filter, onFilter, query, onQuery, counts, total }) {
  return (
    <div className="toolbar">
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

      <input
        className="search"
        type="search"
        value={query}
        onChange={(event) => onQuery(event.target.value)}
        placeholder="Hledat"
        aria-label="Hledat v seznamu"
      />
    </div>
  )
}
