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
    /** True when a referral is required to book at all. Note: a psychiatrist can be seen
     *  privately without one — a referral there only unlocks the Medicare rebate. */
    referralRequired: z.boolean(),
    waitTime: z.string().optional(),
    bestFor: z.string().optional(),
    registrationStatus: z.string().optional(),
    order: z.number().optional(),
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

export const collections = { pathway, alternatives, practitioners, tips };
