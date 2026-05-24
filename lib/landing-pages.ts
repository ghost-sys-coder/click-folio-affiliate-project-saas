import { z } from "zod";
import { appThemes } from "./themes";

export const landingPageGoals = [
  "Drive affiliate clicks",
  "Explain the product",
  "Promote a product offer",
  "Build trust before purchase",
  "Create a niche recommendation page",
] as const;

export const landingPageTones = [
  "Direct",
  "Educational",
  "Friendly",
  "Professional",
  "Bold",
  "Story driven",
] as const;

export const landingPageAudiences = [
  "Use profile audience",
  "Beginners",
  "Creators",
  "Small business owners",
  "Developers",
  "Students",
  "Budget conscious buyers",
  "Advanced users",
  "Custom",
] as const;

export const landingPageGenerationSchema = z.object({
  linkId: z.string().uuid("Select a valid affiliate link."),
  audience: z.enum(landingPageAudiences),
  customAudience: z.string().trim().max(120).optional(),
  pageGoal: z.enum(landingPageGoals),
  tone: z.enum(landingPageTones),
  theme: z.enum([appThemes.growthMint, appThemes.signalPurple, appThemes.commerceGold]),
  extraContext: z
    .string()
    .trim()
    .max(1000, "Extra context must be 1000 characters or fewer.")
    .optional(),
  avoidClaims: z
    .string()
    .trim()
    .max(500, "Avoid claims list must be 500 characters or fewer.")
    .optional(),
});

export type LandingPageGenerationInput = z.infer<typeof landingPageGenerationSchema>;

// Output schema for AI
const titleDescriptionSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().min(1),
});

export const landingPageOutputSchema = z.object({
  hero: z.object({
    headline: z.string().trim().min(1),
    subheadline: z.string().trim().min(1),
    eyebrow: z.string().trim().optional(),
    ctaLabel: z.string().trim().min(1),
  }),
  problem: z.object({
    title: z.string().trim().min(1),
    body: z.string().trim().min(1),
    bullets: z.array(z.string().trim().min(1)).min(1),
  }),
  solution: z.object({
    title: z.string().trim().min(1),
    body: z.string().trim().min(1),
  }),
  benefits: z.array(titleDescriptionSchema).min(1),
  useCases: z.array(titleDescriptionSchema).min(1),
  whoItIsFor: z.array(z.string().trim().min(1)).min(1),
  whoItIsNotFor: z.array(z.string().trim().min(1)).min(1),
  productHighlights: z.array(titleDescriptionSchema).min(1),
  faq: z.array(z.object({
    question: z.string().trim().min(1),
    answer: z.string().trim().min(1),
  })).min(1),
  disclosure: z.string().trim().min(1),
  finalCta: z.object({
    headline: z.string().trim().min(1),
    body: z.string().trim().min(1),
    ctaLabel: z.string().trim().min(1),
  }),
  seo: z.object({
    title: z.string().trim().min(1),
    description: z.string().trim().min(1),
  }),
  riskWarnings: z.array(z.string().trim().min(1)),
});

export type LandingPageOutput = z.infer<typeof landingPageOutputSchema>;

export const landingPageSystemPrompt = `You are Clickfolio Landing Page Generator, an affiliate marketing landing page strategist.

Your job is to turn one affiliate product or offer into a clear, trustworthy, conversion aware landing page draft.

Use only the profile, affiliate link, and extra product context provided. Do not invent product features, discounts, testimonials, personal experience, income claims, scarcity, or unsupported claims.

Create a practical landing page with hero copy, problem framing, solution framing, benefits, use cases, FAQ, CTA copy, SEO metadata, and affiliate disclosure.

Keep the page transparent, specific, and easy to scan.

Return structured JSON only.`;

export function getLandingPageJsonSchema() {
  return {
    type: "object",
    additionalProperties: false,
    required: [
      "hero",
      "problem",
      "solution",
      "benefits",
      "useCases",
      "whoItIsFor",
      "whoItIsNotFor",
      "productHighlights",
      "faq",
      "disclosure",
      "finalCta",
      "seo",
      "riskWarnings",
    ],
    properties: {
      hero: {
        type: "object",
        additionalProperties: false,
        required: ["headline", "subheadline", "eyebrow", "ctaLabel"],
        properties: {
          headline: { type: "string" },
          subheadline: { type: "string" },
          eyebrow: { type: "string" },
          ctaLabel: { type: "string" },
        },
      },
      problem: {
        type: "object",
        additionalProperties: false,
        required: ["title", "body", "bullets"],
        properties: {
          title: { type: "string" },
          body: { type: "string" },
          bullets: { type: "array", items: { type: "string" } },
        },
      },
      solution: {
        type: "object",
        additionalProperties: false,
        required: ["title", "body"],
        properties: {
          title: { type: "string" },
          body: { type: "string" },
        },
      },
      benefits: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["title", "description"],
          properties: {
            title: { type: "string" },
            description: { type: "string" },
          },
        },
      },
      useCases: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["title", "description"],
          properties: {
            title: { type: "string" },
            description: { type: "string" },
          },
        },
      },
      whoItIsFor: { type: "array", items: { type: "string" } },
      whoItIsNotFor: { type: "array", items: { type: "string" } },
      productHighlights: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["title", "description"],
          properties: {
            title: { type: "string" },
            description: { type: "string" },
          },
        },
      },
      faq: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["question", "answer"],
          properties: {
            question: { type: "string" },
            answer: { type: "string" },
          },
        },
      },
      disclosure: { type: "string" },
      finalCta: {
        type: "object",
        additionalProperties: false,
        required: ["headline", "body", "ctaLabel"],
        properties: {
          headline: { type: "string" },
          body: { type: "string" },
          ctaLabel: { type: "string" },
        },
      },
      seo: {
        type: "object",
        additionalProperties: false,
        required: ["title", "description"],
        properties: {
          title: { type: "string" },
          description: { type: "string" },
        },
      },
      riskWarnings: { type: "array", items: { type: "string" } },
    },
  };
}
