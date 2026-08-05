import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { createItem, mergeItems, sortItems } from '../lib/watchlist'
import { itemToRow, rowToItem } from '../lib/watchlistRemote'

/**
 * Seznam titulů uložený v Supabase, vlastněný přihlášeným uživatelem (RLS
 * hlídá, že vidí a mění jen svoje řádky). Zápisy jsou optimistické - lokální
 * stav se upraví hned, Supabase se zapíše na pozadí; když zápis selže,
 * `storageError` se přepne na true (stejný banner, co appka měla dřív pro
 * localStorage).
 */
export function useWatchlist(userId) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [storageError, setStorageError] = useState(false)
  const itemsRef = useRef(items)

  useEffect(() => {
    itemsRef.current = items
  }, [items])

  useEffect(() => {
    if (!userId) {
      itemsRef.current = []
      setItems([])
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    supabase
      .from('watchlist_items')
      .select('*')
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) {
          setStorageError(true)
          setLoading(false)
          return
        }
        const loaded = data.map(rowToItem)
        itemsRef.current = loaded
        setItems(loaded)
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [userId])

  const add = useCallback(
    (title, kind, extra) => {
      const item = createItem(title, kind, extra)
      itemsRef.current = [item, ...itemsRef.current]
      setItems(itemsRef.current)
      supabase
        .from('watchlist_items')
        .insert(itemToRow(item, userId))
        .then(({ error }) => {
          if (error) setStorageError(true)
        })
      return item
    },
    [userId],
  )

  const update = useCallback(
    (id, patch) => {
      const updatedAt = new Date().toISOString()
      itemsRef.current = itemsRef.current.map((item) =>
        item.id === id ? { ...item, ...patch, updatedAt } : item,
      )
      setItems(itemsRef.current)
      supabase
        .from('watchlist_items')
        .update(itemToRow({ ...patch, updatedAt }, userId))
        .eq('id', id)
        .then(({ error }) => {
          if (error) setStorageError(true)
        })
    },
    [userId],
  )

  const remove = useCallback((id) => {
    itemsRef.current = itemsRef.current.filter((item) => item.id !== id)
    setItems(itemsRef.current)
    supabase
      .from('watchlist_items')
      .delete()
      .eq('id', id)
      .then(({ error }) => {
        if (error) setStorageError(true)
      })
  }, [])

  const merge = useCallback(
    (incoming) => {
      const result = mergeItems(itemsRef.current, incoming)
      itemsRef.current = result.items
      setItems(result.items)

      // mergeItems dosadí do mapy přesně ten objekt z `incoming`, když titul
      // přidá nebo aktualizuje - referenční shoda tak řekne, co poslat dál.
      const incomingSet = new Set(incoming)
      const toUpsert = result.items.filter((item) => incomingSet.has(item))

      if (toUpsert.length > 0) {
        supabase
          .from('watchlist_items')
          .upsert(toUpsert.map((item) => itemToRow(item, userId)))
          .then(({ error }) => {
            if (error) setStorageError(true)
          })
      }

      return { added: result.added, updated: result.updated }
    },
    [userId],
  )

  return { items: sortItems(items), add, update, remove, merge, storageError, loading }
}
