/**
 * Jednoduchý Markdown parser pro základní syntaxi:
 * - **bold**, *italic*, `code`
 * - [links](url)
 * - # headers (převádí na strong)
 * - - seznamy
 * - Nové řádky se zachovají
 */

const SAFE_URL = /^(https?:|mailto:)/i

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function parseMarkdown(text) {
  if (!text) return ''

  // Escapovat HTML napřed - poznámka je uživatelský vstup a čte ji i přátel
  // v read-only pohledu, takže tady nesmí projít žádný cizí tag/atribut.
  let result = escapeHtml(text)

  // První zpracovat code block (aby se nemíchaly s dalšími)
  result = result.replace(/`([^`]+)`/g, '<code>$1</code>')

  // Bold a italic
  result = result.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  result = result.replace(/\*([^*]+)\*/g, '<em>$1</em>')

  // Headers (#, ##) -> strong
  result = result.replace(/^#{1,3}\s+(.+)$/gm, '<strong>$1</strong>')

  // Links [text](url) - jen http(s)/mailto smí jako href, jinak zůstane jen text
  result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, label, url) => {
    const trimmed = url.trim()
    if (!SAFE_URL.test(trimmed)) return `${label} (${trimmed})`
    return `<a href="${trimmed}" target="_blank" rel="noopener noreferrer">${label}</a>`
  })

  // Seznamy (- item)
  result = result.replace(/^-\s+(.+)$/gm, '<li>$1</li>')
  result = result.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')

  // Nové řádky
  result = result.replace(/\n/g, '<br />')

  return result
}
