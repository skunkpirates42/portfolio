import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const caseStudies = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/case-studies" }),
  schema: z.object({
    title: z.string(),
    role: z.string(),
    period: z.string(),
    summary: z.string(),
    stack: z.array(z.string()),
    order: z.number(),
  }),
});

export const collections = { "case-studies": caseStudies };
