import { useEffect, useState } from 'react'

const THEME_STORAGE_KEY = 'watchlist.theme'
const COLOR_STORAGE_KEY = 'watchlist.color'
const AUTO_MODE_KEY = 'watchlist.autoMode'

const COLOR_SCHEMES = ['orange', 'blue', 'green', 'purple']

function initialTheme() {
  const stored = localStorage.getItem(THEME_STORAGE_KEY)
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

function initialColorScheme() {
  const stored = localStorage.getItem(COLOR_STORAGE_KEY)
  if (COLOR_SCHEMES.includes(stored)) return stored
  return 'orange'
}

function initialAutoMode() {
  const stored = localStorage.getItem(AUTO_MODE_KEY)
  return stored === 'true'
}

function getThemeByTime() {
  const hour = new Date().getHours()
  // Tmavý režim od 20:00 do 6:00
  return (hour >= 20 || hour < 6) ? 'dark' : 'light'
}

/** Světlý/tmavý motiv + barevné schéma - uložené per prohlížeč, jinak podle systému. */
export function useTheme() {
  const [theme, setTheme] = useState(initialTheme)
  const [colorScheme, setColorSchemeState] = useState(initialColorScheme)
  const [autoMode, setAutoMode] = useState(initialAutoMode)

  useEffect(() => {
    if (autoMode) {
      const timeBasedTheme = getThemeByTime()
      document.documentElement.dataset.theme = timeBasedTheme
      localStorage.setItem(THEME_STORAGE_KEY, timeBasedTheme)
    } else {
      document.documentElement.dataset.theme = theme
      localStorage.setItem(THEME_STORAGE_KEY, theme)
    }
  }, [theme, autoMode])

  useEffect(() => {
    document.documentElement.dataset.colorScheme = colorScheme
    localStorage.setItem(COLOR_STORAGE_KEY, colorScheme)
  }, [colorScheme])

  useEffect(() => {
    localStorage.setItem(AUTO_MODE_KEY, autoMode)
  }, [autoMode])

  function setLightDark(value) {
    if (value !== 'light' && value !== 'dark') return
    setAutoMode(false)
    setTheme(value)
  }

  function setColorScheme(value) {
    if (COLOR_SCHEMES.includes(value)) setColorSchemeState(value)
  }

  function toggleAutoMode() {
    setAutoMode((current) => !current)
    if (!autoMode) {
      // Při zapnutí automatického režimu okamžitě aplikovat téma podle času
      setTheme(getThemeByTime())
    }
  }

  return { theme, colorScheme, autoMode, setLightDark, setColorScheme, toggleAutoMode, COLOR_SCHEMES }
}
