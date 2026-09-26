import type { ReactNode } from 'react'

/** Strip Thought/Action preamble models sometimes prepend. */
export function cleanAgentText(raw: string): string {
  let text = raw.trim()
  text = text.replace(/^(Thought|Action|Observation|Reflection)\s*:[\s\S]*?(?=\n#{1,3}\s|\n---\s*\n|$)/gim, '')
  text = text.replace(/^Below is the final teaching pack\.?\s*/i, '')
  text = text.replace(/^---\s*/m, '')
  return text.trim()
}

function renderInline(text: string): ReactNode[] {
  const parts: ReactNode[] = []
  const re = /(\*\*[^*]+\*\*|`[^`]+`)/g
  let last = 0
  let match: RegExpExecArray | null
  let k = 0
  while ((match = re.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index))
    const token = match[0]
    if (token.startsWith('**')) {
      parts.push(
        <strong key={k++} className="font-semibold text-teal-ink">
          {token.slice(2, -2)}
        </strong>,
      )
    } else {
      parts.push(
        <code key={k++} className="rounded bg-teal-soft/70 px-1 py-0.5 font-mono text-[0.85em] text-teal-ink">
          {token.slice(1, -1)}
        </code>,
      )
    }
    last = match.index + token.length
  }
  if (last < text.length) parts.push(text.slice(last))
  return parts
}

/**
 * Lightweight markdown → React (headings, lists, tables, code fences, paragraphs).
 */
export function FormattedMarkdown({ text }: { text: string }) {
  const lines = text.split(/\r?\n/)
  const blocks: ReactNode[] = []
  let i = 0
  let key = 0

  while (i < lines.length) {
    const line = lines[i]

    if (!line.trim()) {
      i += 1
      continue
    }

    // Fenced code block
    if (line.trim().startsWith('```')) {
      const lang = line.trim().slice(3).trim()
      i += 1
      const codeLines: string[] = []
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i])
        i += 1
      }
      if (i < lines.length) i += 1
      blocks.push(
        <div key={key++} className="my-3 overflow-x-auto rounded-lg bg-teal-ink p-4">
          {lang && <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-sand/80">{lang}</p>}
          <pre className="font-mono text-xs leading-relaxed text-white/90 whitespace-pre">
            {codeLines.join('\n')}
          </pre>
        </div>,
      )
      continue
    }

    // Markdown table
    if (line.includes('|') && lines[i + 1]?.match(/^\s*\|?\s*[-:]+/)) {
      const tableLines: string[] = []
      while (i < lines.length && lines[i].includes('|')) {
        tableLines.push(lines[i])
        i += 1
      }
      const rows = tableLines
        .filter((l) => !l.match(/^\s*\|?\s*[-:| ]+\s*$/))
        .map((l) =>
          l
            .replace(/^\|/, '')
            .replace(/\|$/, '')
            .split('|')
            .map((c) => c.trim()),
        )
      if (rows.length) {
        const [header, ...body] = rows
        blocks.push(
          <div key={key++} className="my-4 overflow-x-auto rounded-lg bg-white ring-1 ring-teal-ink/10">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-teal-soft/70 text-teal-ink">
                <tr>
                  {header.map((cell) => (
                    <th key={cell} className="px-3 py-2 font-semibold">
                      {cell}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {body.map((row, ri) => (
                  <tr key={ri} className="border-t border-teal-ink/10">
                    {row.map((cell, ci) => (
                      <td key={ci} className="px-3 py-2 text-ink/80">
                        {renderInline(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>,
        )
      }
      continue
    }

    if (line.startsWith('### ')) {
      blocks.push(
        <h4 key={key++} className="mt-4 text-sm font-semibold text-teal-ink">
          {renderInline(line.slice(4))}
        </h4>,
      )
      i += 1
      continue
    }
    if (line.startsWith('## ')) {
      blocks.push(
        <h3 key={key++} className="mt-5 text-base font-semibold text-teal-ink">
          {renderInline(line.slice(3))}
        </h3>,
      )
      i += 1
      continue
    }
    if (line.startsWith('# ')) {
      blocks.push(
        <h2 key={key++} className="font-display text-xl text-teal-ink">
          {renderInline(line.slice(2))}
        </h2>,
      )
      i += 1
      continue
    }

    if (/^[-*]\s+/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^[-*]\s+/, ''))
        i += 1
      }
      blocks.push(
        <ul key={key++} className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink/80">
          {items.map((item) => (
            <li key={item}>{renderInline(item)}</li>
          ))}
        </ul>,
      )
      continue
    }

    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s+/, ''))
        i += 1
      }
      blocks.push(
        <ol key={key++} className="mt-2 list-decimal space-y-1 pl-5 text-sm text-ink/80">
          {items.map((item) => (
            <li key={item}>{renderInline(item)}</li>
          ))}
        </ol>,
      )
      continue
    }

    if (line.trim() === '---') {
      blocks.push(<hr key={key++} className="my-4 border-teal-ink/15" />)
      i += 1
      continue
    }

    blocks.push(
      <p key={key++} className="mt-2 text-sm leading-relaxed text-ink/80">
        {renderInline(line)}
      </p>,
    )
    i += 1
  }

  return <div className="formatted-md">{blocks}</div>
}
