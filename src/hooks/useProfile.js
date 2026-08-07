import { useCallback, useEffect, useState } from 'react'
import { isValidNickname } from '../lib/profile'
import { supabase } from '../lib/supabaseClient'

/**
 * Vlastní nickname uživatele. `nickname === null` po doběhnutí `loading`
 * znamená, že si ho ještě nenastavil - App na to reaguje NicknameGate.
 */
export function useProfile(userId) {
  const [nickname, setNicknameState] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setNicknameState(null)
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    supabase
      .from('profiles')
      .select('nickname')
      .eq('id', userId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return
        setNicknameState(error ? null : (data?.nickname ?? null))
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [userId])

  const setNickname = useCallback(
    async (value) => {
      const trimmed = value.trim()
      // Vracíme klíč do slovníku, ne hotovou větu - hlášku složí až komponenta
      // podle zvoleného jazyka (a Supabase hlášky jsou navíc vždycky anglicky).
      if (!isValidNickname(trimmed)) {
        return { error: { key: 'nickname.errFormat' } }
      }

      const { error } = await supabase.from('profiles').upsert({ id: userId, nickname: trimmed })

      if (error) {
        if (error.code !== '23505') console.warn('Uložení nicknamu selhalo:', error)
        return { error: { key: error.code === '23505' ? 'nickname.errTaken' : 'nickname.errGeneric' } }
      }

      setNicknameState(trimmed)
      return { error: null }
    },
    [userId],
  )

  return { nickname, loading, setNickname }
}
