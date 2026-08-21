import { useFamousBanners } from '../hooks/useFamousBanners'

const MAX_PER_SIDE = 6

/**
 * Postranní bannery na širokém desktopu - čistě dekorativní (viz README),
 * proto `aria-hidden` a `pointer-events: none` v CSS. Skryté pod ~1400px,
 * kam se vejde i .app (max-width 820px) beze stísnění.
 */
export function SideBanners({ style }) {
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
