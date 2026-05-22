import test from "node:test";
import assert from "node:assert/strict";

import {
  buildContentStudioPrompt,
  contentStudioRequestSchema,
  getContentStudioOutputSchema,
  getContentStudioProviderOrder,
  stringifyGeneratedContent,
} from "../lib/content-studio.ts";

test("validates content studio generation requests", () => {
  const parsed = contentStudioRequestSchema.parse({
    linkId: "00000000-0000-4000-8000-000000000001",
    platform: "Instagram",
    goal: "Drive clicks",
    audience: "Creators",
    tone: "Friendly",
    extraContext: "Mention this is for a comparison post.",
  });

  assert.equal(parsed.platform, "Instagram");
  assert.equal(parsed.goal, "Drive clicks");
});

test("rejects unsupported content studio options", () => {
  const result = contentStudioRequestSchema.safeParse({
    linkId: "00000000-0000-4000-8000-000000000001",
    platform: "Pinterest",
    goal: "Drive clicks",
    audience: "Creators",
    tone: "Friendly",
  });

  assert.equal(result.success, false);
});

test("uses video output schema for TikTok and standard schema for LinkedIn", () => {
  const videoResult = getContentStudioOutputSchema("TikTok").parse({
    hooks: ["Stop scrolling if you need a cleaner workflow."],
    sceneOutline: [
      {
        scene: "Open with the problem",
        visual: "Show a cluttered desk",
        voiceover: "If your tools are scattered, this can help you compare options.",
        onScreenText: "Too many tools?",
      },
    ],
    caption: "A practical look at one tool worth reviewing.",
    ctaOptions: ["Review the details"],
    disclosureVersion: "Affiliate link disclosure: I may earn a commission.",
    hashtagsOrKeywords: ["affiliate", "tools"],
    platformNotes: ["Keep the first hook short."],
    riskWarnings: ["Confirm pricing on the partner site."],
  });

  const standardResult = getContentStudioOutputSchema("LinkedIn").parse({
    hooks: ["A practical tool to review this week."],
    mainPost: "Here is why this tool may be useful for creators.",
    shortCaption: "Worth reviewing if you manage affiliate workflows.",
    ctaOptions: ["Compare the details"],
    disclosureVersion: "Affiliate disclosure: I may earn a commission.",
    hashtagsOrKeywords: ["affiliate", "creator-tools"],
    platformNotes: ["Keep the tone professional."],
    riskWarnings: ["Do not imply guaranteed outcomes."],
  });

  assert.equal(videoResult.sceneOutline.length, 1);
  assert.equal(standardResult.mainPost.includes("creators"), true);
});

test("builds a constrained prompt from known profile and affiliate link data", () => {
  const prompt = buildContentStudioPrompt({
    request: {
      linkId: "00000000-0000-4000-8000-000000000001",
      platform: "Instagram",
      goal: "Educate before selling",
      audience: "Beginners",
      tone: "Educational",
      extraContext: "Focus on setup simplicity.",
    },
    profile: {
      username: "ghostman",
      displayName: "Ghost Man",
      bio: "I share practical affiliate tools.",
      niche: "creator-tools",
      targetAudience: "new affiliate marketers",
      contentTone: "direct",
      primaryGoal: "organize my links",
      disclosureText: "Some links may earn me a commission.",
    },
    link: {
      title: "Workflow Kit",
      description: "A dashboard for organizing affiliate links.",
      destinationUrl: "https://example.com/workflow",
      category: "Productivity",
      network: "PartnerStack",
      price: "29.00",
      currency: "USD",
      buttonLabel: "View Deal",
    },
  });

  assert.match(prompt.userPrompt, /Workflow Kit/);
  assert.match(prompt.userPrompt, /A dashboard for organizing affiliate links/);
  assert.match(prompt.systemPrompt, /Do not invent product features/);
  assert.match(prompt.userPrompt, /Focus on setup simplicity/);
});

test("stringifies generated content for database preview storage", () => {
  const text = stringifyGeneratedContent({
    hooks: ["Hook one", "Hook two"],
    mainPost: "Main post body.",
    shortCaption: "Short caption.",
    ctaOptions: ["Click through"],
    disclosureVersion: "Affiliate disclosure.",
    hashtagsOrKeywords: ["affiliate"],
    platformNotes: ["Use a clear CTA."],
    riskWarnings: ["No unsupported claims."],
  });

  assert.match(text, /Hook one/);
  assert.match(text, /Main post body/);
  assert.match(text, /Affiliate disclosure/);
});

test("orders configured AI providers with OpenAI as default and Gemini fallback", () => {
  assert.deepEqual(
    getContentStudioProviderOrder({
      OPENAI_API_KEY: "openai-key",
      GEMINI_API_KEY: "gemini-key",
    }),
    ["openai", "gemini"]
  );

  assert.deepEqual(
    getContentStudioProviderOrder({
      CONTENT_STUDIO_AI_PROVIDER: "gemini",
      OPENAI_API_KEY: "openai-key",
      GEMINI_API_KEY: "gemini-key",
    }),
    ["gemini", "openai"]
  );

  assert.deepEqual(
    getContentStudioProviderOrder({
      GEMINI_API_KEY: "gemini-key",
    }),
    ["gemini"]
  );
});
