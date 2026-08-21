export const NICKNAME_PATTERN = /^[a-zA-Z0-9_]{3,20}$/
export const BIO_MAX_LENGTH = 200
export const BANNER_STYLES = ['off', 'pattern', 'famous', 'custom']
export const DEFAULT_BANNER_STYLE = 'pattern'

export function isValidNickname(value) {
  return NICKNAME_PATTERN.test(value)
}

export function isValidBio(value) {
  return value.length <= BIO_MAX_LENGTH
}

export function isValidBannerStyle(value) {
  return BANNER_STYLES.includes(value)
}
