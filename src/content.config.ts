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

export const collections = {spec, pages};
