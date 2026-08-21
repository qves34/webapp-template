import { useEffect, useRef, useState } from 'react'
import { useI18n } from '../lib/i18n/context'

const COLOR_ICONS = { orange: '🟠', blue: '🔵', green: '🟢', purple: '🟣' }

/**
 * Jedno tlačítko "Vzhled" vedle přepínače jazyka, po kliku otevře kartu se
 * vším kolem vzhledu pohromadě - dřív to byly 3 samostatné ikonky vedle sebe
 * (motiv/auto/barva), což se na mobilu začalo prát s hlavičkou.
 */
export function AppearancePanel({
  theme,
  colorScheme,
  autoMode,
  colorSchemes,
  onSetLightDark,
  onSetColorScheme,
  onToggleAutoMode,
  bannerStyle,
  onSetBannerStyle,
  showBanners,
}) {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  // Barevné/Z filmů - jen který panel je vidět, netýká se toho, jestli jsou
  // bannery zapnuté (to řeší samostatný checkbox níž).
  const [bannerTab, setBannerTab] = useState(bannerStyle === 'posters' ? 'movies' : 'colorful')
  const rootRef = useRef(null)

  useEffect(() => {
    if (!open) return

    function handlePointerDown(event) {
      if (!rootRef.current?.contains(event.target)) setOpen(false)
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  // "Z filmů" je zatím jen placeholder (viz README) - jediný reálně
  // aktivovatelný styl je 'pattern', tab jen přepíná náhled textu níž.
  function handleBannerEnable(enabled) {
    onSetBannerStyle(enabled ? 'pattern' : 'off')
  }

  function handleBannerTab(tab) {
    setBannerTab(tab)
    if (tab === 'colorful' && bannerStyle !== 'off') onSetBannerStyle('pattern')
  }

  return (
    <div className="appearance" ref={rootRef}>
      <button
        type="button"
        className="appearance-toggle"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
      >
        {t('appearance.button')}
      </button>

      {open && (
        <div className="appearance-panel" role="dialog" aria-label={t('appearance.button')}>
          <section className="appearance-section">
            <h4 className="appearance-section__heading">{t('appearance.themeHeading')}</h4>
            <div className="segmented" role="radiogroup" aria-label={t('appearance.themeHeading')}>
              <button
                type="button"
                role="radio"
                aria-checked={theme === 'light'}
                className="segmented__option"
                disabled={autoMode}
                onClick={() => onSetLightDark('light')}
              >
                {t('theme.light')}
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={theme === 'dark'}
                className="segmented__option"
                disabled={autoMode}
                onClick={() => onSetLightDark('dark')}
              >
                {t('theme.dark')}
              </button>
            </div>
            <label className="appearance-check">
              <input type="checkbox" checked={autoMode} onChange={onToggleAutoMode} />
              {t('appearance.autoLabel')}
            </label>
          </section>

          <section className="appearance-section">
            <h4 className="appearance-section__heading">{t('appearance.colorHeading')}</h4>
            <div className="segmented" role="radiogroup" aria-label={t('appearance.colorHeading')}>
              {colorSchemes.map((option) => (
                <button
                  key={option}
                  type="button"
                  role="radio"
                  aria-checked={colorScheme === option}
                  className="segmented__option"
                  onClick={() => onSetColorScheme(option)}
                >
                  {COLOR_ICONS[option]} {t(`theme.colorName.${option}`)}
                </button>
              ))}
            </div>
          </section>

          {showBanners && (
            <section className="appearance-section">
              <h4 className="appearance-section__heading">{t('appearance.bannerHeading')}</h4>
              <label className="appearance-check">
                <input
                  type="checkbox"
                  checked={bannerStyle !== 'off'}
                  onChange={(event) => handleBannerEnable(event.target.checked)}
                />
                {t('appearance.bannerEnable')}
              </label>

              {bannerStyle !== 'off' && (
                <>
                  <div className="tabs-mini" role="tablist" aria-label={t('appearance.bannerHeading')}>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={bannerTab === 'colorful'}
                      className="tabs-mini__tab"
                      onClick={() => handleBannerTab('colorful')}
                    >
                      {t('appearance.bannerColorful')}
                    </button>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={bannerTab === 'movies'}
                      className="tabs-mini__tab"
                      onClick={() => handleBannerTab('movies')}
                    >
                      {t('appearance.bannerMovies')}
                    </button>
                  </div>

                  {bannerTab === 'colorful' ? (
                    <p className="profile__hint">{t('appearance.bannerColorfulHint')}</p>
                  ) : (
                    <p className="profile__hint">{t('appearance.bannerMoviesPlaceholder')}</p>
                  )}
                </>
              )}
            </section>
          )}
        </div>
      )}
    </div>
  )
}
