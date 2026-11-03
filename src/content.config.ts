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
    // Publication dates are calendar dates, independent of build time or timezone.
    publishedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(value => {
      const date = new Date(`${value}T00:00:00Z`);
      return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
    }, "Use a valid publication date in YYYY-MM-DD format"),
  }),
});

export const collections = {spec, pages, articles};
