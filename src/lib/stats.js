import { KINDS, STATUSES } from './watchlist'

/**
 * Čistá funkce nad seznamem titulů - žádné volání appky, jen agregace,
 * ať jde snadno otestovat/měnit nezávisle na komponentě, co ji zobrazuje.
 */
export function computeStats(items) {
  const byKind = Object.fromEntries(KINDS.map((kind) => [kind, 0]))
  const byStatus = Object.fromEntries(STATUSES.map((status) => [status, 0]))
  const monthCounts = new Map()

  let favoriteCount = 0
  let hatedCount = 0
  let ratedCount = 0
  let ratingSum = 0

  for (const item of items) {
    byKind[item.kind] += 1
    byStatus[item.status] += 1
    if (item.favorite) favoriteCount += 1
    if (item.hated) hatedCount += 1
    if (item.rating != null) {
      ratedCount += 1
      ratingSum += item.rating
    }

    const month = item.addedAt.slice(0, 7) // "YYYY-MM"
    monthCounts.set(month, (monthCounts.get(month) ?? 0) + 1)
  }

  let busiestMonth = null
  let busiestMonthCount = 0
  for (const [month, count] of monthCounts) {
    if (count > busiestMonthCount) {
      busiestMonth = month
      busiestMonthCount = count
    }
  }

  const topRated = items
    .filter((item) => item.rating != null)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 5)

  return {
    total: items.length,
    byKind,
    byStatus,
    favoriteCount,
    hatedCount,
    ratedCount,
    averageRating: ratedCount > 0 ? ratingSum / ratedCount : null,
    busiestMonth,
    busiestMonthCount,
    topRated,
  }
}
