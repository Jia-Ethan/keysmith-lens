import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";

// One Markdown file per chapter and language: src/content/docs/<lang>/<NN>-<slug>.md
const docs = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/docs" }),
  schema: z.object({
    title: z.string(),
    lede: z.string(),
    group: z.string(),
    order: z.number(),
    page: z.string(),
  }),
});

export const collections = { docs };
