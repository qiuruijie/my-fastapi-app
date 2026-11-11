// content-collections.ts
import { defineCollection, defineConfig } from "@content-collections/core";
import { z } from "zod";
var posts = defineCollection({
  name: "posts",
  directory: "./src/blog",
  include: "*.md",
  schema: z.object({
    title: z.string(),
    published: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    description: z.string(),
    authors: z.array(z.string()),
    content: z.string()
  }),
  transform: (post) => ({
    ...post,
    slug: post._meta.path
  })
});
var content_collections_default = defineConfig({
  collections: [posts]
});
export {
  content_collections_default as default
};
