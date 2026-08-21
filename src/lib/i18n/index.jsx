import { useCallback, useEffect, useMemo, useState } from 'react'
import { I18nContext } from './context'
import { STORAGE_KEY, initialLocale, localeMeta, nextLocale, translate } from './core'

export function I18nProvider({ children }) {
  const [locale, setLocale] = useState(initialLocale)

  useEffect(() => {
    const meta = localeMeta(locale)
    document.documentElement.lang = meta.htmlLang
    localStorage.setItem(STORAGE_KEY, locale)

    const description = document.querySelector('meta[name="description"]')
    if (description) description.content = translate(locale, 'meta.description')
  }, [locale])

  const t = useCallback((key, vars) => translate(locale, key, vars), [locale])

  const toggleLocale = useCallback(() => setLocale(nextLocale), [])

  const value = useMemo(
    () => ({ locale, meta: localeMeta(locale), setLocale, toggleLocale, t }),
    [locale, toggleLocale, t],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}
