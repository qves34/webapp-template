/**
 * Supabase vrací chybové hlášky natvrdo anglicky ("Invalid login credentials"),
 * takže je nepouštíme do UI - mapujeme `error.code` na vlastní přeložitelný klíč.
 * Neznámý kód spadne na obecnou hlášku; skutečný důvod jde do konzole, ať se dá dohledat.
 */
const KEYS = {
  invalid_credentials: 'auth.errInvalidCredentials',
  email_not_confirmed: 'auth.errEmailNotConfirmed',
  user_already_exists: 'auth.errUserExists',
  email_exists: 'auth.errUserExists',
  weak_password: 'auth.errWeakPassword',
  validation_failed: 'auth.errValidation',
  over_email_send_rate_limit: 'auth.errRateLimit',
  over_request_rate_limit: 'auth.errRateLimit',
  signup_disabled: 'auth.errSignupDisabled',
  email_provider_disabled: 'auth.errSignupDisabled',
}

export function authErrorKey(error) {
  if (!error) return null

  const key = KEYS[error.code]
  if (key) return key

  // Výpadek sítě nemá `code`, ale pozná se podle chybějícího HTTP statusu.
  if (error.status == null || error.status === 0) return 'auth.errNetwork'

  console.warn('Nezmapovaná chyba Supabase Auth:', error.code, error.message)
  return 'auth.errGeneric'
}
