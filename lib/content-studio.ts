import { z } from "zod";

export const contentStudioPlatforms = [
  "TikTok",
  "Instagram",
  "Facebook",
  "X",
  "LinkedIn",
  "YouTube Shorts",
  "WhatsApp",
  "Email",
] as const;

export const contentStudioGoals = [
  "Drive clicks",
  "Explain the product",
  "Compare alternatives",
  "Share a personal recommendation",
  "Promote a limited campaign",
  "Educate before selling",
] as const;

export const contentStudioTones = [
  "Direct",
  "Educational",
  "Friendly",
  "Professional",
  "Bold",
  "Story driven",
] as const;

export const contentStudioAudienceAngles = [
  "Beginners",
  "Busy professionals",
  "Small business owners",
  "Creators",
  "Developers",
  "Students",
  "Budget conscious buyers",
  "Advanced users",
  "Custom",
] as const;

export const contentStudioRequestSchema = z.object({
  linkId: z.string().uuid("Select a valid affiliate link."),
  platform: z.enum(contentStudioPlatforms),
  goal: z.enum(contentStudioGoals),
  audience: z.string().trim().min(2, "Audience is required.").max(120),
  tone: z.enum(contentStudioTones),
  extraContext: z
    .string()
    .trim()
    .max(600, "Use 600 characters or fewer.")
    .optional()
    .transform((value) => value || undefined),
});

const stringListSchema = z.array(z.string().trim().min(1)).min(1);

export const standardContentOutputSchema = z.object({
  hooks: stringListSchema,
  mainPost: z.string().trim().min(1),
  shortCaption: z.string().trim().min(1),
  ctaOptions: stringListSchema,
  disclosureVersion: z.string().trim().min(1),
  hashtagsOrKeywords: stringListSchema,
  platformNotes: stringListSchema,
  riskWarnings: stringListSchema,
});

export const videoContentOutputSchema = z.object({
  hooks: stringListSchema,
  sceneOutline: z
    .array(
      z.object({
        scene: z.string().trim().min(1),
        visual: z.string().trim().min(1),
        voiceover: z.string().trim().min(1),
        onScreenText: z.string().trim().min(1),
      })
    )
    .min(1),
  caption: z.string().trim().min(1),
  ctaOptions: stringListSchema,
  disclosureVersion: z.string().trim().min(1),
  hashtagsOrKeywords: stringListSchema,
  platformNotes: stringListSchema,
  riskWarnings: stringListSchema,
});

export const whatsAppContentOutputSchema = z.object({
  statusPost: z.string().trim().min(1),
  dmMessage: z.string().trim().min(1),
  followUpMessage: z.string().trim().min(1),
  ctaOptions: stringListSchema,
  disclosureVersion: z.string().trim().min(1),
  riskWarnings: stringListSchema,
});

export const emailContentOutputSchema = z.object({
  subjectLines: stringListSchema,
  previewText: z.string().trim().min(1),
  emailBody: z.string().trim().min(1),
  ctaOptions: stringListSchema,
  disclosureVersion: z.string().trim().min(1),
  riskWarnings: stringListSchema,
});

export type ContentStudioRequest = z.infer<typeof contentStudioRequestSchema>;
export type StandardContentOutput = z.infer<typeof standardContentOutputSchema>;
export type VideoContentOutput = z.infer<typeof videoContentOutputSchema>;
export type WhatsAppContentOutput = z.infer<typeof whatsAppContentOutputSchema>;
export type EmailContentOutput = z.infer<typeof emailContentOutputSchema>;
export type ContentStudioOutput =
  | StandardContentOutput
  | VideoContentOutput
  | WhatsAppContentOutput
  | EmailContentOutput;

export type ContentStudioProvider = "openai" | "gemini";
export type GeneratedContentSection = {
  title: string;
  content: string;
};

export type ContentStudioProfileContext = {
  username: string;
  displayName: string;
  bio: string | null;
  niche: string | null;
  targetAudience: string;
  contentTone: string;
  primaryGoal: string;
  disclosureText: string;
};

export type ContentStudioAffiliateLinkContext = {
  title: string;
  description: string | null;
  destinationUrl: string;
  category: string | null;
  network: string | null;
  price: string | null;
  currency: string;
  buttonLabel: string;
};

export const contentStudioSystemPrompt = `You are Clickfolio Content Studio, an affiliate marketing content assistant.

Your job is to create practical, platform specific promotional content for affiliate marketers.

You must use only the product and profile information provided. Do not invent product features, discounts, testimonials, earnings, personal experience, scarcity, or performance claims.

Write content that is clear, useful, and conversion aware without sounding spammy.

Always include an affiliate disclosure where appropriate.

Avoid exaggerated claims. Avoid guaranteed outcomes. Avoid fake urgency.

Return structured JSON only.`;

export function getContentStudioOutputSchema(
  platform: ContentStudioRequest["platform"]
) {
  if (platform === "TikTok" || platform === "YouTube Shorts") {
    return videoContentOutputSchema;
  }

  if (platform === "WhatsApp") {
    return whatsAppContentOutputSchema;
  }

  if (platform === "Email") {
    return emailContentOutputSchema;
  }

  return standardContentOutputSchema;
}

export function getContentStudioProviderOrder(
  env: Record<string, string | undefined> = process.env
): ContentStudioProvider[] {
  const preferredProvider =
    env.CONTENT_STUDIO_AI_PROVIDER === "gemini" ||
    env.CONTENT_STUDIO_AI_PROVIDER === "openai"
      ? env.CONTENT_STUDIO_AI_PROVIDER
      : env.AI_PROVIDER === "gemini" || env.AI_PROVIDER === "openai"
        ? env.AI_PROVIDER
        : "openai";
  const availableProviders: ContentStudioProvider[] = [];

  if (env.OPENAI_API_KEY) {
    availableProviders.push("openai");
  }

  if (env.GEMINI_API_KEY) {
    availableProviders.push("gemini");
  }

  return availableProviders.sort((provider) =>
    provider === preferredProvider ? -1 : 1
  );
}

export async function generateContentStudioOutput(input: {
  request: ContentStudioRequest;
  profile: ContentStudioProfileContext;
  link: ContentStudioAffiliateLinkContext;
}) {
  const prompt = buildContentStudioPrompt(input);
  const providers = getContentStudioProviderOrder();
  let lastError: unknown = null;

  if (providers.length === 0) {
    throw new Error("No content studio AI provider is configured.");
  }

  for (const provider of providers) {
    try {
      const rawJson =
        provider === "openai"
          ? await callOpenAIContentStudio({
              prompt,
              platform: input.request.platform,
            })
          : await callGeminiContentStudio({
              prompt,
              platform: input.request.platform,
            });

      return {
        provider,
        output: parseGeneratedContentJson(rawJson, input.request.platform),
      };
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Content generation failed.");
}

export function buildContentStudioPrompt(input: {
  request: ContentStudioRequest;
  profile: ContentStudioProfileContext;
  link: ContentStudioAffiliateLinkContext;
}) {
  const { request, profile, link } = input;

  return {
    systemPrompt: contentStudioSystemPrompt,
    userPrompt: [
      "Create a structured affiliate promotional content pack from the known data below.",
      "",
      "Profile:",
      `- Display name: ${profile.displayName}`,
      `- Username: @${profile.username}`,
      profile.bio ? `- Bio: ${profile.bio}` : null,
      profile.niche ? `- Niche: ${profile.niche}` : null,
      `- Target audience: ${profile.targetAudience}`,
      `- Existing content tone: ${profile.contentTone}`,
      `- Profile goal: ${profile.primaryGoal}`,
      `- Existing disclosure: ${profile.disclosureText}`,
      "",
      "Affiliate link:",
      `- Product/title: ${link.title}`,
      link.description ? `- Description: ${link.description}` : null,
      link.category ? `- Category: ${link.category}` : null,
      link.network ? `- Affiliate network: ${link.network}` : null,
      link.price ? `- Listed price: ${link.currency} ${link.price}` : null,
      `- Destination host: ${safeUrlHost(link.destinationUrl)}`,
      `- Button label: ${link.buttonLabel}`,
      "",
      "Generation settings:",
      `- Platform: ${request.platform}`,
      `- Promotion goal: ${request.goal}`,
      `- Audience: ${request.audience}`,
      `- Tone: ${request.tone}`,
      request.extraContext ? `- Extra context: ${request.extraContext}` : null,
      "",
      "Quality constraints:",
      "- Do not invent product features.",
      "- Do not invent discounts, testimonials, scarcity, earnings, or personal experience.",
      "- Do not make medical, financial, or legal claims.",
      "- Do not say best unless proof is explicitly provided above.",
      "- Keep claims specific and defensible.",
      "- Include practical platform-specific guidance.",
      "- Include an affiliate disclosure.",
    ]
      .filter(Boolean)
      .join("\n"),
  };
}

export function stringifyGeneratedContent(output: ContentStudioOutput) {
  if ("sceneOutline" in output) {
    return [
      output.hooks.join("\n"),
      output.sceneOutline
        .map(
          (scene) =>
            `${scene.scene}\nVisual: ${scene.visual}\nVoiceover: ${scene.voiceover}\nOn-screen: ${scene.onScreenText}`
        )
        .join("\n\n"),
      output.caption,
      output.ctaOptions.join("\n"),
      output.disclosureVersion,
      output.hashtagsOrKeywords.join(" "),
      output.platformNotes.join("\n"),
      output.riskWarnings.join("\n"),
    ].join("\n\n");
  }

  if ("statusPost" in output) {
    return [
      output.statusPost,
      output.dmMessage,
      output.followUpMessage,
      output.ctaOptions.join("\n"),
      output.disclosureVersion,
      output.riskWarnings.join("\n"),
    ].join("\n\n");
  }

  if ("emailBody" in output) {
    return [
      output.subjectLines.join("\n"),
      output.previewText,
      output.emailBody,
      output.ctaOptions.join("\n"),
      output.disclosureVersion,
      output.riskWarnings.join("\n"),
    ].join("\n\n");
  }

  return [
    output.hooks.join("\n"),
    output.mainPost,
    output.shortCaption,
    output.ctaOptions.join("\n"),
    output.disclosureVersion,
    output.hashtagsOrKeywords.join(" "),
    output.platformNotes.join("\n"),
    output.riskWarnings.join("\n"),
  ].join("\n\n");
}

export function buildGeneratedContentSections(
  output: ContentStudioOutput
): GeneratedContentSection[] {
  if ("sceneOutline" in output) {
    return [
      { title: "Hooks", content: output.hooks.join("\n") },
      {
        title: "Scene outline",
        content: output.sceneOutline
          .map(
            (scene) =>
              `${scene.scene}\nVisual: ${scene.visual}\nVoiceover: ${scene.voiceover}\nOn-screen text: ${scene.onScreenText}`
          )
          .join("\n\n"),
      },
      { title: "Caption", content: output.caption },
      { title: "CTA options", content: output.ctaOptions.join("\n") },
      { title: "Disclosure", content: output.disclosureVersion },
      {
        title: "Hashtags or keywords",
        content: output.hashtagsOrKeywords.join(" "),
      },
      { title: "Platform notes", content: output.platformNotes.join("\n") },
      { title: "Risk warnings", content: output.riskWarnings.join("\n") },
    ];
  }

  if ("statusPost" in output) {
    return [
      { title: "Status post", content: output.statusPost },
      { title: "DM message", content: output.dmMessage },
      { title: "Follow-up message", content: output.followUpMessage },
      { title: "CTA options", content: output.ctaOptions.join("\n") },
      { title: "Disclosure", content: output.disclosureVersion },
      { title: "Risk warnings", content: output.riskWarnings.join("\n") },
    ];
  }

  if ("emailBody" in output) {
    return [
      { title: "Subject lines", content: output.subjectLines.join("\n") },
      { title: "Preview text", content: output.previewText },
      { title: "Email body", content: output.emailBody },
      { title: "CTA options", content: output.ctaOptions.join("\n") },
      { title: "Disclosure", content: output.disclosureVersion },
      { title: "Risk warnings", content: output.riskWarnings.join("\n") },
    ];
  }

  return [
    { title: "Hooks", content: output.hooks.join("\n") },
    { title: "Main post", content: output.mainPost },
    { title: "Short caption", content: output.shortCaption },
    { title: "CTA options", content: output.ctaOptions.join("\n") },
    { title: "Disclosure", content: output.disclosureVersion },
    {
      title: "Hashtags or keywords",
      content: output.hashtagsOrKeywords.join(" "),
    },
    { title: "Platform notes", content: output.platformNotes.join("\n") },
    { title: "Risk warnings", content: output.riskWarnings.join("\n") },
  ];
}

function safeUrlHost(value: string) {
  try {
    return new URL(value).host;
  } catch {
    return value;
  }
}

async function callOpenAIContentStudio({
  prompt,
  platform,
}: {
  prompt: ReturnType<typeof buildContentStudioPrompt>;
  platform: ContentStudioRequest["platform"];
}) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OpenAI API key is not configured.");
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-5-mini",
      input: [
        {
          role: "system",
          content: prompt.systemPrompt,
        },
        {
          role: "user",
          content: prompt.userPrompt,
        },
      ],
      max_output_tokens: 2500,
      text: {
        format: {
          type: "json_schema",
          name: "clickfolio_content_pack",
          strict: true,
          schema: getContentStudioJsonSchema(platform),
        },
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI generation failed with status ${response.status}.`);
  }

  return extractOpenAIText(await response.json());
}

async function callGeminiContentStudio({
  prompt,
  platform,
}: {
  prompt: ReturnType<typeof buildContentStudioPrompt>;
  platform: ContentStudioRequest["platform"];
}) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("Gemini API key is not configured.");
  }

  const model = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `${prompt.systemPrompt}\n\n${prompt.userPrompt}`,
              },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          responseJsonSchema: getContentStudioJsonSchema(platform),
        },
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini generation failed with status ${response.status}.`);
  }

  return extractGeminiText(await response.json());
}

function parseGeneratedContentJson(
  value: string,
  platform: ContentStudioRequest["platform"]
) {
  const parsedJson = JSON.parse(value);

  return getContentStudioOutputSchema(platform).parse(parsedJson);
}

function extractOpenAIText(response: unknown) {
  if (isRecord(response) && typeof response.output_text === "string") {
    return response.output_text;
  }

  if (!isRecord(response) || !Array.isArray(response.output)) {
    throw new Error("OpenAI response did not include output text.");
  }

  for (const item of response.output) {
    if (!isRecord(item) || !Array.isArray(item.content)) {
      continue;
    }

    for (const content of item.content) {
      if (isRecord(content) && typeof content.text === "string") {
        return content.text;
      }
    }
  }

  throw new Error("OpenAI response did not include output text.");
}

function extractGeminiText(response: unknown) {
  if (!isRecord(response) || !Array.isArray(response.candidates)) {
    throw new Error("Gemini response did not include candidates.");
  }

  const [candidate] = response.candidates;

  if (!isRecord(candidate) || !isRecord(candidate.content)) {
    throw new Error("Gemini response did not include content.");
  }

  const parts = candidate.content.parts;

  if (!Array.isArray(parts)) {
    throw new Error("Gemini response did not include parts.");
  }

  for (const part of parts) {
    if (isRecord(part) && typeof part.text === "string") {
      return part.text;
    }
  }

  throw new Error("Gemini response did not include text.");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getContentStudioJsonSchema(platform: ContentStudioRequest["platform"]) {
  if (platform === "TikTok" || platform === "YouTube Shorts") {
    return videoContentJsonSchema;
  }

  if (platform === "WhatsApp") {
    return whatsAppContentJsonSchema;
  }

  if (platform === "Email") {
    return emailContentJsonSchema;
  }

  return standardContentJsonSchema;
}

const stringArrayJsonSchema = {
  type: "array",
  items: { type: "string" },
  minItems: 1,
};

const standardContentJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "hooks",
    "mainPost",
    "shortCaption",
    "ctaOptions",
    "disclosureVersion",
    "hashtagsOrKeywords",
    "platformNotes",
    "riskWarnings",
  ],
  properties: {
    hooks: stringArrayJsonSchema,
    mainPost: { type: "string" },
    shortCaption: { type: "string" },
    ctaOptions: stringArrayJsonSchema,
    disclosureVersion: { type: "string" },
    hashtagsOrKeywords: stringArrayJsonSchema,
    platformNotes: stringArrayJsonSchema,
    riskWarnings: stringArrayJsonSchema,
  },
};

const videoContentJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "hooks",
    "sceneOutline",
    "caption",
    "ctaOptions",
    "disclosureVersion",
    "hashtagsOrKeywords",
    "platformNotes",
    "riskWarnings",
  ],
  properties: {
    hooks: stringArrayJsonSchema,
    sceneOutline: {
      type: "array",
      minItems: 1,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["scene", "visual", "voiceover", "onScreenText"],
        properties: {
          scene: { type: "string" },
          visual: { type: "string" },
          voiceover: { type: "string" },
          onScreenText: { type: "string" },
        },
      },
    },
    caption: { type: "string" },
    ctaOptions: stringArrayJsonSchema,
    disclosureVersion: { type: "string" },
    hashtagsOrKeywords: stringArrayJsonSchema,
    platformNotes: stringArrayJsonSchema,
    riskWarnings: stringArrayJsonSchema,
  },
};

const whatsAppContentJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "statusPost",
    "dmMessage",
    "followUpMessage",
    "ctaOptions",
    "disclosureVersion",
    "riskWarnings",
  ],
  properties: {
    statusPost: { type: "string" },
    dmMessage: { type: "string" },
    followUpMessage: { type: "string" },
    ctaOptions: stringArrayJsonSchema,
    disclosureVersion: { type: "string" },
    riskWarnings: stringArrayJsonSchema,
  },
};

const emailContentJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "subjectLines",
    "previewText",
    "emailBody",
    "ctaOptions",
    "disclosureVersion",
    "riskWarnings",
  ],
  properties: {
    subjectLines: stringArrayJsonSchema,
    previewText: { type: "string" },
    emailBody: { type: "string" },
    ctaOptions: stringArrayJsonSchema,
    disclosureVersion: { type: "string" },
    riskWarnings: stringArrayJsonSchema,
  },
};
