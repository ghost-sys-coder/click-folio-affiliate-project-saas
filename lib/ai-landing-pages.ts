import {
  getLandingPageJsonSchema,
  landingPageOutputSchema,
  landingPageSystemPrompt,
  type LandingPageGenerationInput,
  type LandingPageOutput,
} from "./landing-pages";

export type LandingPageAIProvider = "openai" | "gemini";

export function getLandingPageAIProviderOrder(
  env: Record<string, string | undefined> = process.env
): LandingPageAIProvider[] {
  const preferredProvider =
    env.LANDING_PAGE_AI_PROVIDER === "gemini" ||
    env.LANDING_PAGE_AI_PROVIDER === "openai"
      ? env.LANDING_PAGE_AI_PROVIDER
      : env.AI_PROVIDER === "gemini" || env.AI_PROVIDER === "openai"
        ? env.AI_PROVIDER
        : "openai";
  const availableProviders: LandingPageAIProvider[] = [];

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

export async function generateLandingPageContent(input: {
  request: LandingPageGenerationInput;
  profile: {
    displayName: string;
    username: string;
    bio: string | null;
    targetAudience: string;
    disclosureText: string;
  };
  link: {
    title: string;
    description: string | null;
    destinationUrl: string;
  };
}) {
  const prompt = buildLandingPagePrompt(input);
  const providers = getLandingPageAIProviderOrder();
  let lastError: unknown = null;

  if (providers.length === 0) {
    throw new Error("No landing page AI provider is configured.");
  }

  for (const provider of providers) {
    try {
      const rawJson =
        provider === "openai"
          ? await callOpenAILandingPage(prompt)
          : await callGeminiLandingPage(prompt);

      return {
        provider,
        output: parseLandingPageJson(rawJson),
      };
    } catch (error) {
      console.error(`Landing page generation with ${provider} failed`, error);
      lastError = error;
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Landing page generation failed.");
}

function buildLandingPagePrompt(input: {
  request: LandingPageGenerationInput;
  profile: {
    displayName: string;
    username: string;
    bio: string | null;
    targetAudience: string;
    disclosureText: string;
  };
  link: {
    title: string;
    description: string | null;
    destinationUrl: string;
  };
}) {
  const { request, profile, link } = input;

  return {
    systemPrompt: landingPageSystemPrompt,
    userPrompt: [
      "Generate a high-converting affiliate landing page draft from the data below.",
      "",
      "Profile Context:",
      `- Display name: ${profile.displayName}`,
      `- Username: @${profile.username}`,
      profile.bio ? `- Bio: ${profile.bio}` : null,
      `- Default target audience: ${profile.targetAudience}`,
      `- Standard disclosure: ${profile.disclosureText}`,
      "",
      "Product/Offer Details:",
      `- Product Title: ${link.title}`,
      link.description ? `- Description: ${link.description}` : null,
      `- Destination Host: ${new URL(link.destinationUrl).host}`,
      "",
      "Uploaded Media (optional):",
      request.imageUrl ? `- Hero Image URL: ${request.imageUrl}` : null,
      request.videoUrl ? `- Hero Video URL: ${request.videoUrl}` : null,
      "",
      "Generation Settings:",
      `- Target Audience: ${request.audience === "Use profile audience" ? profile.targetAudience : request.audience}`,
      request.customAudience ? `- Custom Audience Detail: ${request.customAudience}` : null,
      `- Page Goal: ${request.pageGoal}`,
      `- Desired Tone: ${request.tone}`,
      request.extraContext ? `- Extra Product Context: ${request.extraContext}` : null,
      request.avoidClaims ? `- Claims to Avoid: ${request.avoidClaims}` : null,
      "",
      "Constraints:",
      "1. Use only the provided product data. Do not invent features or testimonials.",
      "2. Focus on clear problem/solution framing.",
      "3. Ensure the copy is conversion-focused but transparent.",
      "4. Include mandatory affiliate disclosure.",
      "5. If product data is weak, include a risk warning section.",
      "6. Use the provided Uploaded Media URLs in the hero section if they are present. If both image and video are provided, you can use both or prioritize the one that fits your copy best.",
      "7. Return structured JSON matching the requested schema.",
    ]
      .filter(Boolean)
      .join("\n"),
  };
}

async function callOpenAILandingPage(prompt: { systemPrompt: string; userPrompt: string }) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OpenAI API key missing.");

  // Matching pattern from lib/content-studio.ts
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-5-mini",
      input: [
        { role: "system", content: prompt.systemPrompt },
        { role: "user", content: prompt.userPrompt },
      ],
      max_output_tokens: 3000,
      text: {
        format: {
          type: "json_schema",
          name: "landing_page_generation",
          strict: true,
          schema: getLandingPageJsonSchema(),
        },
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI error: ${response.statusText}`);
  }

  return extractOpenAIText(await response.json());
}

async function callGeminiLandingPage(prompt: { systemPrompt: string; userPrompt: string }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Gemini API key missing.");

  // Matching pattern from lib/content-studio.ts
  const model = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: `${prompt.systemPrompt}\n\n${prompt.userPrompt}` }],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          responseJsonSchema: getLandingPageJsonSchema(),
        },
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini error: ${response.statusText}`);
  }

  return extractGeminiText(await response.json());
}

function parseLandingPageJson(value: string): LandingPageOutput {
  try {
    const parsed = JSON.parse(value);
    return landingPageOutputSchema.parse(parsed);
  } catch (error) {
    console.error("Failed to parse landing page AI output", error);
    throw new Error("AI output validation failed.");
  }
}

function extractOpenAIText(response: unknown) {
  if (response && typeof response === "object" && "output_text" in response && typeof response.output_text === "string") {
    return response.output_text;
  }

  if (!response || typeof response !== "object" || !("output" in response) || !Array.isArray(response.output)) {
    throw new Error("OpenAI response did not include output text.");
  }

  for (const item of response.output) {
    if (!item || typeof item !== "object" || !("content" in item) || !Array.isArray(item.content)) {
      continue;
    }

    for (const content of item.content) {
      if (content && typeof content === "object" && "text" in content && typeof content.text === "string") {
        return content.text;
      }
    }
  }

  throw new Error("OpenAI response did not include output text.");
}

function extractGeminiText(response: unknown) {
  if (!response || typeof response !== "object" || !("candidates" in response) || !Array.isArray(response.candidates)) {
    throw new Error("Gemini response did not include candidates.");
  }

  const [candidate] = response.candidates;

  if (!candidate || typeof candidate !== "object" || !("content" in candidate)) {
    throw new Error("Gemini response did not include content.");
  }

  const content = candidate.content;
  if (!content || typeof content !== "object" || !("parts" in content)) {
      throw new Error("Gemini response did not include parts.");
  }

  const parts = content.parts;

  if (!Array.isArray(parts)) {
    throw new Error("Gemini response did not include parts.");
  }

  for (const part of parts) {
    if (part && typeof part === "object" && "text" in part && typeof part.text === "string") {
      return part.text;
    }
  }

  throw new Error("Gemini response did not include text.");
}
