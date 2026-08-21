import { parseMarkdown } from '../lib/markdown'

export function MarkdownRenderer({ text, className = '' }) {
  if (!text) return null

  const html = parseMarkdown(text)

  return (
    <div
      className={`markdown-content ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}