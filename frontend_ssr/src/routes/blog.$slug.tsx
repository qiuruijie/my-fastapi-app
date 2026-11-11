// src/routes/blog.$slug.tsx
import { createFileRoute, notFound } from '@tanstack/react-router'
import { allPosts } from 'content-collections'
import { Markdown } from '~/components/Markdown'

export const Route = createFileRoute('/blog/$slug')({
  loader: ({ params }) => {
    const post = allPosts.find((post) => post.slug === params.slug)
    if (!post) {
      throw notFound()
    }
    return post
  },
  component: BlogPost,
})

function BlogPost() {
  const post = Route.useLoaderData()

  return (
    <article>
      <h1>{post.title}</h1>
      <p>
        By {post.authors.join(', ')} on {post.published}
      </p>
      <Markdown content={post.content} className="prose" />
    </article>
  )
}