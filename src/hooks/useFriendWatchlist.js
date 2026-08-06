import { useEffect, useState } from 'react'
import { sortItems } from '../lib/watchlist'
import { rowToItem } from '../lib/watchlistRemote'
import { supabase } from '../lib/supabaseClient'

/** Read-only watchlist přítele - čtení umožňuje "select friends items" RLS policy. */
export function useFriendWatchlist(friendId) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!friendId) {
      setItems([])
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(false)
    supabase
      .from('watchlist_items')
      .select('*')
      .eq('user_id', friendId)
      .then(({ data, error: fetchError }) => {
        if (cancelled) return
        if (fetchError) {
          setError(true)
          setLoading(false)
          return
        }
        setItems(sortItems(data.map(rowToItem), 'stav'))
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [friendId])

  return { items, loading, error }
}
