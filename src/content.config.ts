import { defineCollection, z } from 'astro:content';

const tools = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    titleZh: z.string().optional(),
    description: z.string(),
    descriptionZh: z.string().optional(),
    category: z.string(),
    tags: z.array(z.string()),
    pricing: z.enum(['free', 'freemium', 'paid']),
    priceFrom: z.string(),
    rating: z.number().min(1).max(5).nullable().optional(),
    affiliateUrl: z.string().url(),
    affiliateNetwork: z.enum(['direct', 'impact', 'shareasale']),
    officialUrl: z.string().url(),
    logo: z.string(),
    screenshots: z.array(z.string()),
    isFeatured: z.boolean().default(false),
    isNew: z.boolean().default(false),
    dateAdded: z.date(),
    alternatives: z.array(z.string()),
    faq: z.array(z.object({
      question: z.string(),
      answer: z.string(),
    })),
    faqZh: z.array(z.object({
      question: z.string(),
      answer: z.string(),
    })).optional(),
  }),
});

const categories = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    titleZh: z.string().optional(),
    icon: z.string(),
    description: z.string(),
    descriptionZh: z.string().optional(),
    order: z.number(),
  }),
});

const scenarios = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    titleZh: z.string().optional(),
    icon: z.string(),
    description: z.string(),
    descriptionZh: z.string().optional(),
    tools: z.array(z.string()),
  }),
});

export const collections = { tools, categories, scenarios };
