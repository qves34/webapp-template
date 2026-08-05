/** Mapování mezi tvarem položky v appce (camelCase) a řádkem v Supabase (snake_case). */

export function rowToItem(row) {
  return {
    id: row.id,
    title: row.title,
    kind: row.kind,
    status: row.status,
    progress: row.progress,
    rating: row.rating,
    hated: row.hated,
    note: row.note,
    addedAt: row.added_at,
    updatedAt: row.updated_at,
    tmdbId: row.tmdb_id,
    year: row.year,
    poster: row.poster,
  }
}

/**
 * Přijme i částečný patch (jen měněná pole) - klíče chybějící v `item`
 * vyjdou jako `undefined` a JSON.stringify je při odesílání na Supabase
 * zahodí, takže se v DB přepíšou jen skutečně změněné sloupce.
 */
export function itemToRow(item, userId) {
  return {
    id: item.id,
    user_id: userId,
    title: item.title,
    kind: item.kind,
    status: item.status,
    progress: item.progress,
    rating: item.rating,
    hated: item.hated,
    note: item.note,
    added_at: item.addedAt,
    updated_at: item.updatedAt,
    tmdb_id: item.tmdbId,
    year: item.year,
    poster: item.poster,
  }
}
