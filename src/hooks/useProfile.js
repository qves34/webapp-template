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
  const [bannerImageUrl, setBannerImageUrlState] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setNicknameState(null)
      setBioState('')
      setBannerStyleState(DEFAULT_BANNER_STYLE)
      setBannerImageUrlState(null)
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    Promise.all([
      supabase
        .from('profiles')
        .select('nickname, banner_style, banner_image_url')
        .eq('id', userId)
        .maybeSingle(),
      supabase.from('profile_bios').select('bio').eq('user_id', userId).maybeSingle(),
    ]).then(([{ data: profileData, error: profileError }, { data: bioData }]) => {
      if (cancelled) return
      setNicknameState(profileError ? null : (profileData?.nickname ?? null))
      setBannerStyleState(
        isValidBannerStyle(profileData?.banner_style) ? profileData.banner_style : DEFAULT_BANNER_STYLE,
      )
      setBannerImageUrlState(profileData?.banner_image_url ?? null)
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

  // Nastaví oboje najednou (styl 'custom' + konkrétní URL) - odděleně by šlo
  // uložit jen banner_style bez obrázku k němu.
  const setCustomBanner = useCallback(
    async (imageUrl) => {
      const previousStyle = bannerStyle
      const previousImage = bannerImageUrl
      setBannerStyleState('custom')
      setBannerImageUrlState(imageUrl)
      const { error } = await supabase
        .from('profiles')
        .update({ banner_style: 'custom', banner_image_url: imageUrl })
        .eq('id', userId)

      if (error) {
        console.warn('Uložení vlastního banneru selhalo:', error)
        setBannerStyleState(previousStyle)
        setBannerImageUrlState(previousImage)
        return { error: { key: 'profile.bannerErrGeneric' } }
      }

      return { error: null }
    },
    [userId, bannerStyle, bannerImageUrl],
  )

  return {
    nickname,
    bio,
    bannerStyle,
    bannerImageUrl,
    loading,
    setNickname,
    setBio,
    setBannerStyle,
    setCustomBanner,
  }
}
