import { createContext, useContext } from 'react'

/**
 * Kontext a hook bydlí zvlášť od provideru schválně: `index.jsx` tak exportuje
 * jen komponentu a Fast Refresh při úpravě provideru nezahodí stav celé appky.
 */
export const I18nContext = createContext(null)

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) throw new Error('useI18n musí být uvnitř <I18nProvider>.')
  return context
}
