import { Markdown as ReactMarkdown } from '@tanstack/markdown/react'
import type { MarkdownDocument } from '@tanstack/markdown'

type MarkdownProps = {
  content: string | MarkdownDocument
  className?: string
}

export function Markdown({ content, className }: MarkdownProps) {
  return (
    <div className={className}>
      <ReactMarkdown
        headingAnchors
        components={{
          img: (props) => (
            <img
              {...props}
              loading="lazy"
              decoding="async"
              alt={props.alt ?? ''}
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}