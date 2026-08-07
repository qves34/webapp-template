import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

/** Bio přítele - read-only, čtení umožňuje "select friends bio" RLS policy. */
export function useFriendProfile(friendId) {
  const [bio, setBio] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!friendId) {
      setBio('')
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    supabase
      .from('profile_bios')
      .select('bio')
      .eq('user_id', friendId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return
        setBio(error ? '' : (data?.bio ?? ''))
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [friendId])

  return { bio, loading }
}
