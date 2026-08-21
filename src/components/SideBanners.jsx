import { useFamousBanners } from '../hooks/useFamousBanners'

const MAX_PER_SIDE = 6

/**
 * Postranní bannery na širokém desktopu - čistě dekorativní (viz README),
 * proto `aria-hidden` a `pointer-events: none` v CSS. Skryté pod ~1400px,
 * kam se vejde i .app (max-width 820px) beze stísnění.
 */
export function SideBanners({ style, imageLeft, imageRight }) {
  const { items } = useFamousBanners(style === 'famous')

  if (style === 'off' || !style) return null

  if (style === 'pattern') {
    return (
      <>
        <div className="side-banner side-banner--left side-banner--pattern" aria-hidden="true" />
        <div className="side-banner side-banner--right side-banner--pattern" aria-hidden="true" />
      </>
    )
  }

  if (style === 'famous') {
    if (items.length === 0) return null

    const left = items.filter((_, i) => i % 2 === 0).slice(0, MAX_PER_SIDE)
    const right = items.filter((_, i) => i % 2 === 1).slice(0, MAX_PER_SIDE)

    return (
      <>
        <PosterBanner side="left" items={left} />
        <PosterBanner side="right" items={right.length > 0 ? right : left} />
      </>
    )
  }

  if (style === 'custom') {
    // Obě strany šly nastavit nezávisle - chybějící strana ukáže tu druhou,
    // ať banner není poloviční, když si uživatel vybral jen jednu.
    const left = imageLeft ?? imageRight
    const right = imageRight ?? imageLeft
    if (!left && !right) return null

    return (
      <>
        <div className="side-banner side-banner--left side-banner--custom" aria-hidden="true">
          <img className="side-banner__custom-image" src={left} alt="" />
        </div>
        <div className="side-banner side-banner--right side-banner--custom" aria-hidden="true">
          <img className="side-banner__custom-image" src={right} alt="" />
        </div>
      </>
    )
  }

  return null
}

function PosterBanner({ side, items }) {
  return (
    <div className={`side-banner side-banner--${side}`} aria-hidden="true">
      <div className="side-banner__track">
        {items.map((item) => (
          <img key={item.id} className="side-banner__poster" src={item.image} alt="" loading="lazy" />
        ))}
      </div>
    </div>
  )
}
