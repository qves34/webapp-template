import { useCallback, useEffect, useRef, useState } from 'react'
import { rowToFriendship } from '../lib/friends'
import { supabase } from '../lib/supabaseClient'

/**
 * Přátelství přihlášeného uživatele (žádosti i přijatá) + nicky protistran.
 * Refetch po každé mutaci - objem dat je malý, netřeba optimistic patch.
 */
export function useFriends(userId) {
  const [rows, setRows] = useState([])
  const [nicknames, setNicknames] = useState({})
  const [loading, setLoading] = useState(true)
  const rowsRef = useRef(rows)

  useEffect(() => {
    rowsRef.current = rows
  }, [rows])

  const load = useCallback(async () => {
    if (!userId) {
      setRows([])
      setNicknames({})
      setLoading(false)
      return
    }

    setLoading(true)
    const { data: friendshipRows, error } = await supabase
      .from('friendships')
      .select('*')
      .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)

    if (error || !friendshipRows) {
      setRows([])
      setLoading(false)
      return
    }

    const otherIds = [
      ...new Set(
        friendshipRows.map((row) => (row.requester_id === userId ? row.addressee_id : row.requester_id)),
      ),
    ]

    let nicknameById = {}
    if (otherIds.length > 0) {
      const { data: profiles } = await supabase.from('profiles').select('id, nickname').in('id', otherIds)
      nicknameById = Object.fromEntries((profiles ?? []).map((p) => [p.id, p.nickname]))
    }

    setRows(friendshipRows)
    setNicknames(nicknameById)
    setLoading(false)
  }, [userId])

  useEffect(() => {
    load()
  }, [load])

  const friendships = rows.map((row) => rowToFriendship(row, userId))
  const friends = friendships.filter((f) => f.status === 'accepted')
  const incoming = friendships.filter((f) => f.status === 'pending' && f.incoming)
  const outgoing = friendships.filter((f) => f.status === 'pending' && !f.incoming)

  const searchNickname = useCallback(
    async (query) => {
      const needle = query.trim()
      if (needle.length < 2) return []
      const { data, error } = await supabase
        .from('profiles')
        .select('id, nickname')
        .ilike('nickname', `${needle}%`)
        .neq('id', userId)
        .limit(8)
      return error ? [] : data
    },
    [userId],
  )

  const sendRequest = useCallback(
    async (targetId) => {
      // Opačná žádost už čeká - přijmout rovnou místo poslání duplicitní.
      const reverse = rowsRef.current.find(
        (row) =>
          row.requester_id === targetId && row.addressee_id === userId && row.status === 'pending',
      )
      if (reverse) {
        const { error } = await supabase
          .from('friendships')
          .update({ status: 'accepted', updated_at: new Date().toISOString() })
          .eq('id', reverse.id)
        if (!error) await load()
        return { error }
      }

      const { error } = await supabase
        .from('friendships')
        .insert({ requester_id: userId, addressee_id: targetId })
      if (!error) await load()
      return { error: error && (error.code === '23505' ? { message: 'Žádost už existuje.' } : error) }
    },
    [userId, load],
  )

  const acceptRequest = useCallback(
    async (friendshipId) => {
      const { error } = await supabase
        .from('friendships')
        .update({ status: 'accepted', updated_at: new Date().toISOString() })
        .eq('id', friendshipId)
      if (!error) await load()
      return { error }
    },
    [load],
  )

  const removeFriendship = useCallback(
    async (friendshipId) => {
      const { error } = await supabase.from('friendships').delete().eq('id', friendshipId)
      if (!error) await load()
      return { error }
    },
    [load],
  )

  return {
    friends,
    incoming,
    outgoing,
    nicknames,
    loading,
    searchNickname,
    sendRequest,
    acceptRequest,
    removeFriendship,
  }
}
