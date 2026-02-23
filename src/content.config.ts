import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const pathway = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/pathway' }),
  schema: z.object({
    title: z.string(),
    step: z.number(),
    summary: z.string(),
  }),
});

const alternatives = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/alternatives' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    order: z.number().optional(),
  }),
});

const practitioners = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/practitioners' }),
  schema: z.object({
    title: z.string(),
    cost: z.string(),
    rebate: z.string(),
    referralRequired: z.boolean(),
    waitTime: z.string().optional(),
    order: z.number().optional(),
  }),
});

const stories = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/stories' }),
  schema: z.object({
    title: z.string(),
    name: z.string(),
    age: z.string().optional(),
    location: z.string().optional(),
    summary: z.string(),
    publishedDate: z.string().optional(),
  }),
});

const tips = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/tips' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    category: z.string().optional(),
    publishedDate: z.string().optional(),
  }),
});

export const collections = { pathway, alternatives, practitioners, stories, tips };
