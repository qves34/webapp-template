import { useEffect, useRef, useState } from 'react'
import { useI18n } from '../lib/i18n/context'

// Reprezentativní odstín pro švatch - nezávislé na tom, jaké téma/motiv je
// zrovna aktivní, jinak by se u zvolené barvy nedalo poznat, jak vypadají ty ostatní.
const COLOR_HEX = { orange: '#e4572e', blue: '#3b82f6', green: '#10b981', purple: '#8b5cf6' }

// Tab -> reálná hodnota banner_style. 'custom' se navíc nastavuje i z ItemRow
// (výběrem konkrétního plakátu), tady se jen přepíná zpátky na už uložený.
const STYLE_FOR_TAB = { colorful: 'pattern', trending: 'famous', custom: 'custom' }

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
  bannerImageUrl,
  onSetBannerStyle,
  showBanners,
}) {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  // Barevné/Trendující/Vlastní - jen který panel je vidět, netýká se toho,
  // jestli jsou bannery zapnuté (to řeší samostatný checkbox níž).
  const [bannerTab, setBannerTab] = useState(
    bannerStyle === 'famous' ? 'trending' : bannerStyle === 'custom' ? 'custom' : 'colorful',
  )
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

  function handleBannerEnable(enabled) {
    onSetBannerStyle(enabled ? STYLE_FOR_TAB[bannerTab] : 'off')
  }

  function handleBannerTab(tab) {
    setBannerTab(tab)
    if (bannerStyle !== 'off') onSetBannerStyle(STYLE_FOR_TAB[tab])
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
            <div className="color-swatches" role="radiogroup" aria-label={t('appearance.colorHeading')}>
              {colorSchemes.map((option) => (
                <button
                  key={option}
                  type="button"
                  role="radio"
                  aria-checked={colorScheme === option}
                  aria-label={t(`theme.colorName.${option}`)}
                  title={t(`theme.colorName.${option}`)}
                  className="color-swatch"
                  style={{ '--swatch-color': COLOR_HEX[option] }}
                  onClick={() => onSetColorScheme(option)}
                />
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
                      aria-selected={bannerTab === 'trending'}
                      className="tabs-mini__tab"
                      onClick={() => handleBannerTab('trending')}
                    >
                      {t('appearance.bannerTrending')}
                    </button>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={bannerTab === 'custom'}
                      className="tabs-mini__tab"
                      onClick={() => handleBannerTab('custom')}
                    >
                      {t('appearance.bannerCustom')}
                    </button>
                  </div>

                  {bannerTab === 'colorful' && (
                    <p className="profile__hint">{t('appearance.bannerColorfulHint')}</p>
                  )}
                  {bannerTab === 'trending' && (
                    <p className="profile__hint">{t('appearance.bannerTrendingHint')}</p>
                  )}
                  {bannerTab === 'custom' && (
                    <div className="appearance-custom-banner">
                      {bannerImageUrl && (
                        <img
                          className="appearance-custom-banner__preview"
                          src={bannerImageUrl}
                          alt=""
                        />
                      )}
                      <p className="profile__hint">
                        {t(bannerImageUrl ? 'appearance.bannerCustomHint' : 'appearance.bannerCustomEmpty')}
                      </p>
                    </div>
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
