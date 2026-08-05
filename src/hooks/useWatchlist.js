import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  createItem,
  loadItems,
  mergeItems,
  saveItems,
  sortItems,
} from '../lib/watchlist'

/** Seznam titulů držený v localStorage. Každá změna se rovnou uloží. */
export function useWatchlist() {
  const [items, setItems] = useState(loadItems)
  const [storageError, setStorageError] = useState(false)
  const itemsRef = useRef(items)
  const loaded = useRef(false)

  useEffect(() => {
    itemsRef.current = items
    // První průchod jen načetl, co v úložišti už bylo. Kdyby se načtení
    // nepovedlo, nechceme prázdným polem přepsat data, co jdou možná zachránit.
    if (!loaded.current) {
      loaded.current = true
      return
    }
    setStorageError(!saveItems(items))
  }, [items])

  const add = useCallback((title, kind, extra) => {
    const item = createItem(title, kind, extra)
    itemsRef.current = [item, ...itemsRef.current]
    setItems(itemsRef.current)
    return item
  }, [])

  const update = useCallback((id, patch) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, ...patch, updatedAt: new Date().toISOString() }
          : item,
      ),
    )
  }, [])

  const remove = useCallback((id) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const merge = useCallback((incoming) => {
    const result = mergeItems(itemsRef.current, incoming)
    itemsRef.current = result.items
    setItems(result.items)
    return { added: result.added, updated: result.updated }
  }, [])

  const sorted = useMemo(() => sortItems(items), [items])

  return { items: sorted, add, update, remove, merge, storageError }
}
