// src/routes/release-notes.tsx
import { createFileRoute } from '@tanstack/react-router'
import releaseNotes from '../../../release-notes.md?raw'
import { Markdown } from '~/components/Markdown'

export const Route = createFileRoute('/release-notes')({
  component: ReleaseNotes,
})

function ReleaseNotes() {
  return (
    <article className="prose max-w-none">
      <Markdown content={releaseNotes} />
    </article>
  )
}
