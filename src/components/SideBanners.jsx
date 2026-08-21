const MAX_POSTERS_PER_SIDE = 8

/**
 * Postranní bannery na širokém desktopu - čistě dekorativní (viz README),
 * proto `aria-hidden` a `pointer-events: none` v CSS. Skryté pod ~1400px,
 * kam se vejde i .app (max-width 820px) beze stísnění.
 */
export function SideBanners({ style, posters }) {
  if (style === 'off' || !style) return null

  if (style === 'pattern') {
    return (
      <>
        <div className="side-banner side-banner--left side-banner--pattern" aria-hidden="true" />
        <div className="side-banner side-banner--right side-banner--pattern" aria-hidden="true" />
      </>
    )
  }

  if (posters.length === 0) return null

  const left = posters.filter((_, i) => i % 2 === 0).slice(0, MAX_POSTERS_PER_SIDE)
  const right = posters.filter((_, i) => i % 2 === 1).slice(0, MAX_POSTERS_PER_SIDE)

  return (
    <>
      <PosterBanner side="left" posters={left} />
      <PosterBanner side="right" posters={right.length > 0 ? right : left} />
    </>
  )
}

function PosterBanner({ side, posters }) {
  return (
    <div className={`side-banner side-banner--${side}`} aria-hidden="true">
      <div className="side-banner__track">
        {posters.map((item) => (
          <img key={item.id} className="side-banner__poster" src={item.poster} alt="" loading="lazy" />
        ))}
      </div>
    </div>
  )
}
