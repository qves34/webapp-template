import { useCallback, useEffect, useState } from 'react'
import { DEFAULT_BANNER_STYLE, isValidBannerStyle, isValidBio, isValidNickname } from '../lib/profile'
import { supabase } from '../lib/supabaseClient'

/**
 * Vlastní nickname, bio a preference uživatele. `nickname === null` po
 * doběhnutí `loading` znamená, že si ho ještě nenastavil - App na to reaguje
 * NicknameGate. Bio je volitelné, chybějící řádek v `profile_bios` (dokud ho
 * nikdo neuloží) čteme jako prázdný string.
 */
export function useProfile(userId) {
  const [nickname, setNicknameState] = useState(null)
  const [bio, setBioState] = useState('')
  const [bannerStyle, setBannerStyleState] = useState(DEFAULT_BANNER_STYLE)
  const [bannerImageLeft, setBannerImageLeftState] = useState(null)
  const [bannerImageRight, setBannerImageRightState] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setNicknameState(null)
      setBioState('')
      setBannerStyleState(DEFAULT_BANNER_STYLE)
      setBannerImageLeftState(null)
      setBannerImageRightState(null)
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    Promise.all([
      supabase
        .from('profiles')
        .select('nickname, banner_style, banner_image_left, banner_image_right')
        .eq('id', userId)
        .maybeSingle(),
      supabase.from('profile_bios').select('bio').eq('user_id', userId).maybeSingle(),
    ]).then(([{ data: profileData, error: profileError }, { data: bioData }]) => {
      if (cancelled) return
      setNicknameState(profileError ? null : (profileData?.nickname ?? null))
      setBannerStyleState(
        isValidBannerStyle(profileData?.banner_style) ? profileData.banner_style : DEFAULT_BANNER_STYLE,
      )
      setBannerImageLeftState(profileData?.banner_image_left ?? null)
      setBannerImageRightState(profileData?.banner_image_right ?? null)
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

  const setBannerStyle = useCallback(
    async (value) => {
      if (!isValidBannerStyle(value)) return { error: { key: 'profile.bannerErrGeneric' } }

      const previous = bannerStyle
      setBannerStyleState(value)
      const { error } = await supabase.from('profiles').update({ banner_style: value }).eq('id', userId)

      if (error) {
        console.warn('Uložení banneru selhalo:', error)
        setBannerStyleState(previous)
        return { error: { key: 'profile.bannerErrGeneric' } }
      }

      return { error: null }
    },
    [userId, bannerStyle],
  )

  // Nastaví styl 'custom' + obrázek. `side` 'both' přepíše obě strany stejně
  // (výchozí, rychlá volba), 'left'/'right' upraví jen jednu a druhá zůstane,
  // jak byla - tak jde mít na každé straně jiný plakát ze stejného titulu.
  const setCustomBanner = useCallback(
    async (side, imageUrl) => {
      const previousStyle = bannerStyle
      const previousLeft = bannerImageLeft
      const previousRight = bannerImageRight

      const nextLeft = side === 'right' ? bannerImageLeft : imageUrl
      const nextRight = side === 'left' ? bannerImageRight : imageUrl

      setBannerStyleState('custom')
      setBannerImageLeftState(nextLeft)
      setBannerImageRightState(nextRight)
      const { error } = await supabase
        .from('profiles')
        .update({ banner_style: 'custom', banner_image_left: nextLeft, banner_image_right: nextRight })
        .eq('id', userId)

      if (error) {
        console.warn('Uložení vlastního banneru selhalo:', error)
        setBannerStyleState(previousStyle)
        setBannerImageLeftState(previousLeft)
        setBannerImageRightState(previousRight)
        return { error: { key: 'profile.bannerErrGeneric' } }
      }

      return { error: null }
    },
    [userId, bannerStyle, bannerImageLeft, bannerImageRight],
  )

  return {
    nickname,
    bio,
    bannerStyle,
    bannerImageLeft,
    bannerImageRight,
    loading,
    setNickname,
    setBio,
    setBannerStyle,
    setCustomBanner,
  }
}
