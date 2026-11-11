// src/routes/blog.index.tsx
import { createFileRoute, Link } from '@tanstack/react-router'
import { allPosts } from 'content-collections'

export const Route = createFileRoute('/blog/')({
  component: BlogIndex,
})

function BlogIndex() {
  const sortedPosts = [...allPosts].sort((a, b) =>
    b.published.localeCompare(a.published),
  )

  return (
    <main>
      <h1>Blog</h1>
      <ul>
        {sortedPosts.map((post) => (
          <li key={post.slug}>
            <Link to="/blog/$slug" params={{ slug: post.slug }}>
              {post.title}
            </Link>
            <p>{post.description}</p>
            <time dateTime={post.published}>{post.published}</time>
          </li>
        ))}
      </ul>
    </main>
  )
}