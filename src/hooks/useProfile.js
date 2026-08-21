import { useCallback, useEffect, useState } from 'react'
import { isValidBio, isValidNickname } from '../lib/profile'
import { supabase } from '../lib/supabaseClient'

/**
 * Vlastní nickname a bio uživatele. `nickname === null` po doběhnutí `loading`
 * znamená, že si ho ještě nenastavil - App na to reaguje NicknameGate. Bio je
 * volitelné, chybějící řádek v `profile_bios` (dokud ho nikdo neuloží) čteme
 * jako prázdný string.
 */
export function useProfile(userId) {
  const [nickname, setNicknameState] = useState(null)
  const [bio, setBioState] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setNicknameState(null)
      setBioState('')
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    Promise.all([
      supabase.from('profiles').select('nickname').eq('id', userId).maybeSingle(),
      supabase.from('profile_bios').select('bio').eq('user_id', userId).maybeSingle(),
    ]).then(([{ data: profileData, error: profileError }, { data: bioData }]) => {
      if (cancelled) return
      setNicknameState(profileError ? null : (profileData?.nickname ?? null))
      setBioState(bioData?.bio ?? '')
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

  const setBio = useCallback(
    async (value) => {
      const trimmed = value.trim()
      if (!isValidBio(trimmed)) {
        return { error: { key: 'profile.bioErrLength' } }
      }

      const { error } = await supabase
        .from('profile_bios')
        .upsert({ user_id: userId, bio: trimmed, updated_at: new Date().toISOString() })

      if (error) {
        console.warn('Uložení bia selhalo:', error)
        return { error: { key: 'profile.bioErrGeneric' } }
      }

      setBioState(trimmed)
      return { error: null }
    },
    [userId],
  )

  return { nickname, bio, loading, setNickname, setBio }
}
