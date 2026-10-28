import {defineCollection, z} from 'astro:content';
import {glob} from 'astro/loaders';

const spec = defineCollection({
  loader: glob({pattern: '**/*.md', base: './src/spec'}),
  schema: z.object({
    title: z.string(),
    draft: z.string(),
    status: z.string(),
    date: z.string(),
    abstract: z.string(),
  }),
});

const pages = defineCollection({
  loader: glob({pattern: '**/*.md', base: './src/content/pages'}),
  schema: z.object({}).passthrough(),
});

const articles = defineCollection({
  loader: glob({pattern: '**/*.{md,mdx}', base: './src/content/articles'}),
  schema: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    category: z.string().min(1),
    // Existing posts have no confirmed publication dates; retain editorial order.
    order: z.number().int().nonnegative().default(100),
  }),
});

export const collections = {spec, pages, articles};
