import { z } from "zod";
import { appThemeValues } from "./themes.ts";

export const heroMediaLayouts = ["left", "right", "stacked", "background"] as const;
export const faqVariants = ["cards", "accordion"] as const;
export const landingPageSectionTypes = [
  "hero",
  "problem",
  "solution",
  "benefits",
  "useCases",
  "productHighlights",
  "audience",
  "comparison",
  "howItWorks",
  "faq",
  "finalCta",
] as const;

export function getHeroMediaLayoutMode(
  mediaLayout: (typeof heroMediaLayouts)[number] | undefined,
  hasMedia: boolean
) {
  const resolvedLayout = mediaLayout ?? "right";
  const backgroundLayout = resolvedLayout === "background" && hasMedia;
  const mediaFirst = resolvedLayout === "left";
  const stackedLayout = (resolvedLayout === "stacked" || !hasMedia) && !backgroundLayout;

  return {
    backgroundLayout,
    stackedLayout,
    mediaFirst,
    showMediaPanel: hasMedia && !backgroundLayout,
  };
}

export function getFaqVariant(
  variant: (typeof faqVariants)[number] | undefined
) {
  return variant ?? "cards";
}

type LandingPageSectionType = (typeof landingPageSectionTypes)[number];

export function createDefaultLandingPageSection(
  type: LandingPageSectionType
): LandingPageSection {
  switch (type) {
    case "hero":
      return {
        type,
        content: {
          headline: "New headline",
          subheadline: "Add a compelling subheadline for this offer.",
          ctaLabel: "View offer",
          mediaLayout: "right",
        },
      };
    case "problem":
      return {
        type,
        content: {
          title: "The problem",
          body: "Describe the main challenge this product solves.",
          bullets: ["Pain point one"],
        },
      };
    case "solution":
      return {
        type,
        content: {
          title: "The solution",
          body: "Explain how this offer addresses the problem.",
        },
      };
    case "benefits":
      return {
        type,
        content: {
          title: "Key benefits",
          items: [{ title: "Benefit title", description: "Benefit description" }],
        },
      };
    case "useCases":
      return {
        type,
        content: {
          title: "Use cases",
          items: [{ title: "Use case title", description: "Use case description" }],
        },
      };
    case "productHighlights":
      return {
        type,
        content: {
          title: "Product highlights",
          items: [{ title: "Highlight title", description: "Highlight description" }],
        },
      };
    case "audience":
      return {
        type,
        content: {
          perfectForTitle: "Perfect for",
          perfectForItems: ["Ideal audience type"],
          notForTitle: "Not for",
          notForItems: ["Poor fit example"],
        },
      };
    case "comparison":
      return {
        type,
        content: {
          title: "Compare your options",
          leftColumn: "Typical alternative",
          rightColumn: "This offer",
          rows: [
            {
              feature: "Feature",
              leftValue: "Basic support",
              rightValue: "Better support",
            },
          ],
        },
      };
    case "howItWorks":
      return {
        type,
        content: {
          title: "How it works",
          steps: [{ title: "Step one", description: "Describe the first step." }],
        },
      };
    case "faq":
      return {
        type,
        content: {
          title: "Frequently asked questions",
          variant: "cards",
          items: [{ question: "Question", answer: "Answer" }],
        },
      };
    case "finalCta":
      return {
        type,
        content: {
          headline: "Ready to take the next step?",
          body: "Close with a clear, compliant invitation to click through.",
          ctaLabel: "View offer",
        },
      };
  }
}

export function hydrateLandingPageSectionsFromForm(params: {
  existingSections: LandingPageSection[];
  formData: FormData;
}) {
  const requestedSectionCount = Number(params.formData.get("sectionCount"));
  const sectionCount = Number.isFinite(requestedSectionCount) && requestedSectionCount > 0
    ? requestedSectionCount
    : params.existingSections.length;

  return Array.from({ length: sectionCount }, (_value, index) => {
    const typeValue = params.formData.get(`section.${index}.type`);
    const type = landingPageSectionTypes.find((candidate) => candidate === typeValue);
    const baseSection =
      params.existingSections[index] ??
      createDefaultLandingPageSection(type ?? "problem");
    const section = type && baseSection.type !== type
      ? createDefaultLandingPageSection(type)
      : baseSection;
    const newContent = { ...section.content } as Record<string, unknown>;

    Object.keys(newContent).forEach((key) => {
      const formValue = params.formData.get(`section.${index}.${key}`);

      if (formValue === null) {
        return;
      }

      if (key === "bullets" || key === "perfectForItems" || key === "notForItems") {
        newContent[key] = String(formValue).split("\n").filter(Boolean);
        return;
      }

      if (key === "items" || key === "rows" || key === "steps") {
        return;
      }

      if (typeof newContent[key] === "boolean") {
        newContent[key] = formValue === "true";
        return;
      }

      newContent[key] = String(formValue);
    });

    if ("items" in newContent && Array.isArray(newContent.items)) {
      if (section.type === "faq") {
        const parsedItems = parseObjectArrayFromForm(params.formData, `section.${index}.items`, [
          "question",
          "answer",
        ]);

        if (parsedItems) {
          newContent.items = parsedItems as typeof section.content.items;
        }
      } else if (
        section.type === "benefits" ||
        section.type === "useCases" ||
        section.type === "productHighlights"
      ) {
        const parsedItems = parseObjectArrayFromForm(params.formData, `section.${index}.items`, [
          "title",
          "description",
        ]);

        if (parsedItems) {
          newContent.items = parsedItems as typeof section.content.items;
        }
      }
    }

    if (section.type === "comparison") {
      const parsedRows = parseObjectArrayFromForm(params.formData, `section.${index}.rows`, [
        "feature",
        "leftValue",
        "rightValue",
        "isPositive",
      ]);

      if (parsedRows) {
        newContent.rows = parsedRows.map((row) => ({
          ...row,
          isPositive:
            row.isPositive === undefined || row.isPositive === ""
              ? undefined
              : row.isPositive === "true",
        })) as typeof section.content.rows;
      }
    }

    if (section.type === "howItWorks") {
      const parsedSteps = parseObjectArrayFromForm(params.formData, `section.${index}.steps`, [
        "title",
        "description",
      ]);

      if (parsedSteps) {
        newContent.steps = parsedSteps as typeof section.content.steps;
      }
    }

    return {
      ...section,
      content: newContent,
    };
  }) as LandingPageSection[];
}

function parseObjectArrayFromForm(
  formData: FormData,
  prefix: string,
  keys: string[]
) {
  const items: Array<Record<string, string>> = [];

  for (let index = 0; index < 50; index += 1) {
    const entry = keys.reduce<Record<string, string>>((acc, key) => {
      const value = formData.get(`${prefix}.${index}.${key}`);

      if (typeof value === "string" && value.length > 0) {
        acc[key] = value;
      }

      return acc;
    }, {});

    if (keys.every((key) => !(key in entry))) {
      break;
    }

    items.push(entry);
  }

  return items.length > 0 ? items : null;
}

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
  theme: z.enum(appThemeValues),
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
  imageUrl: z.string().trim().optional(),
  videoUrl: z.string().trim().optional(),
});

export type LandingPageGenerationInput = z.infer<typeof landingPageGenerationSchema>;

export const landingPageEditSchema = z.object({
  landingPageId: z.string().uuid("Invalid landing page ID."),
  instructions: z
    .string()
    .trim()
    .min(10, "Describe the edit in at least 10 characters.")
    .max(2000, "Edit instructions must be 2000 characters or fewer."),
});

export type LandingPageEditInput = z.infer<typeof landingPageEditSchema>;

// Shared content schemas
const titleDescriptionSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().min(1),
});

// Block-based Section Schemas
export const heroSectionSchema = z.object({
  type: z.literal("hero"),
  content: z.object({
    headline: z.string().trim().min(1),
    subheadline: z.string().trim().min(1),
    eyebrow: z.string().trim().optional(),
    ctaLabel: z.string().trim().min(1),
    imageUrl: z.string().trim().optional(),
    videoUrl: z.string().trim().optional(),
    mediaLayout: z.enum(heroMediaLayouts).default("right"),
  }),
});

export const problemSectionSchema = z.object({
  type: z.literal("problem"),
  content: z.object({
    title: z.string().trim().min(1),
    body: z.string().trim().min(1),
    bullets: z.array(z.string().trim().min(1)).min(1),
  }),
});

export const solutionSectionSchema = z.object({
  type: z.literal("solution"),
  content: z.object({
    title: z.string().trim().min(1),
    body: z.string().trim().min(1),
  }),
});

export const benefitsSectionSchema = z.object({
  type: z.literal("benefits"),
  content: z.object({
    title: z.string().trim().min(1),
    items: z.array(titleDescriptionSchema).min(1),
  }),
});

export const useCasesSectionSchema = z.object({
  type: z.literal("useCases"),
  content: z.object({
    title: z.string().trim().min(1),
    items: z.array(titleDescriptionSchema).min(1),
  }),
});

export const productHighlightsSectionSchema = z.object({
  type: z.literal("productHighlights"),
  content: z.object({
    title: z.string().trim().min(1),
    items: z.array(titleDescriptionSchema).min(1),
  }),
});

export const audienceSectionSchema = z.object({
  type: z.literal("audience"),
  content: z.object({
    perfectForTitle: z.string().trim().min(1),
    perfectForItems: z.array(z.string().trim().min(1)).min(1),
    notForTitle: z.string().trim().min(1),
    notForItems: z.array(z.string().trim().min(1)).min(1),
  }),
});

export const faqSectionSchema = z.object({
  type: z.literal("faq"),
  content: z.object({
    title: z.string().trim().min(1),
    variant: z.enum(faqVariants).default("cards"),
    items: z.array(z.object({
      question: z.string().trim().min(1),
      answer: z.string().trim().min(1),
    })).min(1),
  }),
});

export const finalCtaSectionSchema = z.object({
  type: z.literal("finalCta"),
  content: z.object({
    headline: z.string().trim().min(1),
    body: z.string().trim().min(1),
    ctaLabel: z.string().trim().min(1),
  }),
});

export const comparisonSectionSchema = z.object({
  type: z.literal("comparison"),
  content: z.object({
    title: z.string().trim().min(1),
    leftColumn: z.string().trim().min(1),
    rightColumn: z.string().trim().min(1),
    rows: z.array(z.object({
      feature: z.string().trim().min(1),
      leftValue: z.string().trim().min(1),
      rightValue: z.string().trim().min(1),
      isPositive: z.boolean().optional(),
    })).min(1),
  }),
});

export const howItWorksSectionSchema = z.object({
  type: z.literal("howItWorks"),
  content: z.object({
    title: z.string().trim().min(1),
    steps: z.array(z.object({
      title: z.string().trim().min(1),
      description: z.string().trim().min(1),
    })).min(1),
  }),
});

export const landingPageSectionSchema = z.discriminatedUnion("type", [
  heroSectionSchema,
  problemSectionSchema,
  solutionSectionSchema,
  benefitsSectionSchema,
  useCasesSectionSchema,
  productHighlightsSectionSchema,
  audienceSectionSchema,
  faqSectionSchema,
  finalCtaSectionSchema,
  comparisonSectionSchema,
  howItWorksSectionSchema,
]);

export type LandingPageSection = z.infer<typeof landingPageSectionSchema>;

export const landingPageOutputSchema = z.object({
  sections: z.array(landingPageSectionSchema).min(3),
  disclosure: z.string().trim().min(1),
  riskWarnings: z.array(z.string().trim().min(1)),
  seo: z.object({
    title: z.string().trim().min(1),
    description: z.string().trim().min(1),
  }),
});

export type LandingPageOutput = z.infer<typeof landingPageOutputSchema>;

type LegacyLandingPageOutput = {
  hero?: Record<string, unknown>;
  problem?: Record<string, unknown>;
  solution?: Record<string, unknown>;
  benefits?: Array<{ title: string; description: string }>;
  productHighlights?: Array<{ title: string; description: string }>;
  whoItIsFor?: string[];
  whoItIsNotFor?: string[];
  useCases?: Array<{ title: string; description: string }>;
  faq?: Array<{ question: string; answer: string }>;
  finalCta?: Record<string, unknown>;
  disclosure?: string;
  riskWarnings?: string[];
  seo?: { title?: string; description?: string };
  sections?: LandingPageSection[];
};

export function normalizeLandingPageOutput(value: unknown): LandingPageOutput {
  const directResult = landingPageOutputSchema.safeParse(value);

  if (directResult.success) {
    return directResult.data;
  }

  const legacyData = (value ?? {}) as LegacyLandingPageOutput;
  const sections =
    legacyData.sections ||
    ([
    legacyData.hero
      ? {
          type: "hero" as const,
          content: {
            ...legacyData.hero,
            mediaLayout:
              typeof legacyData.hero.mediaLayout === "string" &&
              heroMediaLayouts.includes(
                legacyData.hero.mediaLayout as (typeof heroMediaLayouts)[number]
              )
                ? legacyData.hero.mediaLayout
                : "right",
          },
        }
      : null,
    legacyData.problem
      ? { type: "problem" as const, content: legacyData.problem }
      : null,
    legacyData.solution
      ? { type: "solution" as const, content: legacyData.solution }
      : null,
    legacyData.benefits
      ? {
          type: "benefits" as const,
          content: { title: "Why Choose This?", items: legacyData.benefits },
        }
      : null,
    legacyData.productHighlights
      ? {
          type: "productHighlights" as const,
          content: {
            title: "Key Features",
            items: legacyData.productHighlights,
          },
        }
      : null,
    legacyData.whoItIsFor || legacyData.whoItIsNotFor
      ? {
          type: "audience" as const,
          content: {
            perfectForTitle: "Perfect For",
            perfectForItems: legacyData.whoItIsFor ?? [],
            notForTitle: "Not For You If",
            notForItems: legacyData.whoItIsNotFor ?? [],
          },
        }
      : null,
    legacyData.useCases
      ? {
          type: "useCases" as const,
          content: {
            title: "Real World Applications",
            items: legacyData.useCases,
          },
        }
      : null,
    legacyData.faq
      ? {
          type: "faq" as const,
          content: {
            title: "Common Questions",
            variant: "cards" as const,
            items: legacyData.faq,
          },
        }
      : null,
    legacyData.finalCta
      ? { type: "finalCta" as const, content: legacyData.finalCta }
      : null,
  ] satisfies Array<unknown | null>).filter(Boolean);

  return landingPageOutputSchema.parse({
    sections,
    disclosure:
      typeof legacyData.disclosure === "string"
        ? legacyData.disclosure
        : "Some links on this page may earn me a commission at no extra cost to you.",
    riskWarnings: Array.isArray(legacyData.riskWarnings)
      ? legacyData.riskWarnings
      : [],
    seo: {
      title:
        typeof legacyData.seo?.title === "string"
          ? legacyData.seo.title
          : "Affiliate Landing Page",
      description:
        typeof legacyData.seo?.description === "string"
          ? legacyData.seo.description
          : "Explore this affiliate recommendation page.",
    },
  });
}

export const landingPageSystemPrompt = `You are Clickfolio Landing Page Designer, an affiliate marketing expert.

Your goal is to design a high-converting, component-based landing page for an affiliate product.

Instead of a fixed structure, you will output a sequence of "sections" that best tell the story of the product.

AVAILABLE SECTION TYPES:
1. hero: Always required first. Headline, subheadline, and optional media.
2. problem: Frame the pain points visitors are facing.
3. solution: How the product solves the problem.
4. benefits: Key emotional or functional advantages.
5. useCases: Specific scenarios where the product is used.
6. productHighlights: technical features or "specifications".
7. audience: Clearly define who should (and shouldn't) buy.
8. comparison: A table comparing this product vs traditional alternatives or "doing nothing".
9. howItWorks: Step-by-step guide to using the product.
10. faq: Common questions and objections.
11. finalCta: A strong closing section to drive clicks.

STRATEGY RULES:
- Always start with 'hero'.
- Choose at least 5 other sections that make sense for the specific product.
- Use 'comparison' if the product has a clear competitive advantage.
- Use 'howItWorks' if the product is a service or complex software.
- Ensure the 'disclosure' and 'riskWarnings' are always included at the root level.
- Do not invent product features, income claims, or fake testimonials.
- Keep the tone consistent with the user's request.

Return structured JSON matching the requested block-based schema.`;

export const landingPageEditSystemPrompt = `You are Clickfolio Landing Page Editor, an affiliate marketing editor and layout assistant.

You receive an existing structured landing page JSON document and a user instruction.

Your job is to edit the existing page while preserving what already works.

EDITING RULES:
- Return the full landing page JSON, not a diff.
- Keep the JSON valid for the provided schema.
- Do not invent product features, testimonials, guarantees, or fake urgency.
- Preserve affiliate disclosure and risk warnings unless the user explicitly asks to refine them.
- You may rewrite copy, reorder sections, add supported sections, remove weak sections, and adjust section-level presentation.
- For hero media placement, use \`mediaLayout\` with one of: \`left\`, \`right\`, \`stacked\`, or \`background\`.
- For FAQ presentation, use \`variant\` with one of: \`cards\` or \`accordion\`.
- Use \`background\` when the hero image or video should sit behind the copy and fully cover the hero section.
- If the user asks for a layout change, prefer changing structured fields instead of rewriting unrelated content.
- Maintain a clear conversion path and a compliant tone.`;

export function getLandingPageJsonSchema() {
  return {
    type: "object",
    additionalProperties: false,
    required: ["sections", "disclosure", "riskWarnings", "seo"],
    properties: {
      sections: {
        type: "array",
        items: {
          anyOf: [
            {
              type: "object",
              required: ["type", "content"],
              properties: {
                type: { const: "hero" },
                content: {
                  type: "object",
                  required: ["headline", "subheadline", "ctaLabel"],
                  properties: {
                    headline: { type: "string" },
                    subheadline: { type: "string" },
                    eyebrow: { type: "string" },
                    ctaLabel: { type: "string" },
                    imageUrl: { type: "string" },
                    videoUrl: { type: "string" },
                    mediaLayout: { type: "string", enum: [...heroMediaLayouts] },
                  },
                },
              },
            },
            {
              type: "object",
              required: ["type", "content"],
              properties: {
                type: { const: "problem" },
                content: {
                  type: "object",
                  required: ["title", "body", "bullets"],
                  properties: {
                    title: { type: "string" },
                    body: { type: "string" },
                    bullets: { type: "array", items: { type: "string" } },
                  },
                },
              },
            },
            {
              type: "object",
              required: ["type", "content"],
              properties: {
                type: { const: "solution" },
                content: {
                  type: "object",
                  required: ["title", "body"],
                  properties: {
                    title: { type: "string" },
                    body: { type: "string" },
                  },
                },
              },
            },
            {
              type: "object",
              required: ["type", "content"],
              properties: {
                type: { const: "benefits" },
                content: {
                  type: "object",
                    required: ["title", "items"],
                  properties: {
                    title: { type: "string" },
                    items: {
                      type: "array",
                      items: {
                        type: "object",
                        required: ["title", "description"],
                        properties: {
                          title: { type: "string" },
                          description: { type: "string" },
                        },
                      },
                    },
                  },
                },
              },
            },
            {
                type: "object",
                required: ["type", "content"],
                properties: {
                  type: { const: "useCases" },
                  content: {
                    type: "object",
                    required: ["title", "items"],
                    properties: {
                      title: { type: "string" },
                      items: {
                        type: "array",
                        items: {
                          type: "object",
                          required: ["title", "description"],
                          properties: {
                            title: { type: "string" },
                            description: { type: "string" },
                          },
                        },
                      },
                    },
                  },
                },
              },
              {
                type: "object",
                required: ["type", "content"],
                properties: {
                  type: { const: "productHighlights" },
                  content: {
                    type: "object",
                    required: ["title", "items"],
                    properties: {
                      title: { type: "string" },
                      items: {
                        type: "array",
                        items: {
                          type: "object",
                          required: ["title", "description"],
                          properties: {
                            title: { type: "string" },
                            description: { type: "string" },
                          },
                        },
                      },
                    },
                  },
                },
              },
            {
              type: "object",
              required: ["type", "content"],
              properties: {
                type: { const: "audience" },
                content: {
                  type: "object",
                  required: ["perfectForTitle", "perfectForItems", "notForTitle", "notForItems"],
                  properties: {
                    perfectForTitle: { type: "string" },
                    perfectForItems: { type: "array", items: { type: "string" } },
                    notForTitle: { type: "string" },
                    notForItems: { type: "array", items: { type: "string" } },
                  },
                },
              },
            },
            {
              type: "object",
              required: ["type", "content"],
              properties: {
                type: { const: "faq" },
                content: {
                  type: "object",
                  required: ["title", "items"],
                  properties: {
                    title: { type: "string" },
                    variant: { type: "string", enum: [...faqVariants] },
                    items: {
                      type: "array",
                      items: {
                        type: "object",
                        required: ["question", "answer"],
                        properties: {
                          question: { type: "string" },
                          answer: { type: "string" },
                        },
                      },
                    },
                  },
                },
              },
            },
            {
              type: "object",
              required: ["type", "content"],
              properties: {
                type: { const: "finalCta" },
                content: {
                  type: "object",
                  required: ["headline", "body", "ctaLabel"],
                  properties: {
                    headline: { type: "string" },
                    body: { type: "string" },
                    ctaLabel: { type: "string" },
                  },
                },
              },
            },
            {
              type: "object",
              required: ["type", "content"],
              properties: {
                type: { const: "comparison" },
                content: {
                  type: "object",
                  required: ["title", "leftColumn", "rightColumn", "rows"],
                  properties: {
                    title: { type: "string" },
                    leftColumn: { type: "string" },
                    rightColumn: { type: "string" },
                    rows: {
                      type: "array",
                      items: {
                        type: "object",
                        required: ["feature", "leftValue", "rightValue"],
                        properties: {
                          feature: { type: "string" },
                          leftValue: { type: "string" },
                          rightValue: { type: "string" },
                          isPositive: { type: "boolean" },
                        },
                      },
                    },
                  },
                },
              },
            },
            {
              type: "object",
              required: ["type", "content"],
              properties: {
                type: { const: "howItWorks" },
                content: {
                  type: "object",
                  required: ["title", "steps"],
                  properties: {
                    title: { type: "string" },
                    steps: {
                      type: "array",
                      items: {
                        type: "object",
                        required: ["title", "description"],
                        properties: {
                          title: { type: "string" },
                          description: { type: "string" },
                        },
                      },
                    },
                  },
                },
              },
            },
          ],
        },
      },
      disclosure: { type: "string" },
      riskWarnings: { type: "array", items: { type: "string" } },
      seo: {
        type: "object",
        required: ["title", "description"],
        properties: {
          title: { type: "string" },
          description: { type: "string" },
        },
      },
    },
  };
}
