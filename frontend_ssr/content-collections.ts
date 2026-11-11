import { defineCollection, defineConfig } from '@content-collections/core'
import { z } from 'zod'

const posts = defineCollection({
  name: 'posts',
  directory: './src/blog',
  include: '*.md',
  schema: z.object({
    title: z.string(),
    published: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    description: z.string(),
    authors: z.array(z.string()),
    content: z.string(),
  }),
  transform: (post) => ({
    ...post,
    slug: post._meta.path,
  }),
})

export default defineConfig({
  collections: [posts],
})