/**
 * Postranní bannery na širokém desktopu - čistě dekorativní (viz README),
 * proto `aria-hidden` a `pointer-events: none` v CSS. Skryté pod ~1400px,
 * kam se vejde i .app (max-width 820px) beze stísnění.
 */
export function SideBanners({ style, imageLeft, imageRight }) {
  if (style === 'off' || !style) return null

  if (style === 'pattern') {
    return (
      <>
        <div className="side-banner side-banner--left side-banner--pattern" aria-hidden="true" />
        <div className="side-banner side-banner--right side-banner--pattern" aria-hidden="true" />
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
