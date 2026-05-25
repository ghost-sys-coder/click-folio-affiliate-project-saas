import test from "node:test";
import assert from "node:assert/strict";

import {
  buildLandingPageEditPrompt,
} from "../lib/ai-landing-pages.ts";
import {
  getHeroMediaLayoutMode,
  landingPageOutputSchema,
  normalizeLandingPageOutput,
} from "../lib/landing-pages.ts";

test("landing page schema supports editable hero media layout", () => {
  const parsed = landingPageOutputSchema.parse({
    sections: [
      {
        type: "hero",
        content: {
          headline: "Work smarter",
          subheadline: "A better creator workflow",
          ctaLabel: "View offer",
          imageUrl: "https://example.com/hero.png",
          mediaLayout: "left",
        },
      },
      {
        type: "problem",
        content: {
          title: "Too many tools",
          body: "You keep switching tabs all day.",
          bullets: ["Too much context switching"],
        },
      },
      {
        type: "finalCta",
        content: {
          headline: "Try it today",
          body: "See if it fits your workflow.",
          ctaLabel: "Get started",
        },
      },
    ],
    disclosure: "Affiliate disclosure text",
    riskWarnings: ["Confirm pricing before buying."],
    seo: {
      title: "Workflow page",
      description: "A creator workflow page.",
    },
  });

  const hero = parsed.sections[0];
  assert.equal(hero.type, "hero");
  assert.equal(hero.content.mediaLayout, "left");
});

test("landing page schema supports background hero media layout", () => {
  const parsed = landingPageOutputSchema.parse({
    sections: [
      {
        type: "hero",
        content: {
          headline: "Immersive hero",
          subheadline: "Text can sit over full-bleed media",
          ctaLabel: "Watch now",
          videoUrl: "https://example.com/hero.mp4",
          mediaLayout: "background",
        },
      },
      {
        type: "problem",
        content: {
          title: "Static layouts feel limited",
          body: "You cannot turn the hero media into a full section background.",
          bullets: ["Needs more art direction flexibility"],
        },
      },
      {
        type: "finalCta",
        content: {
          headline: "Make it cinematic",
          body: "Use the background layout when you need atmosphere.",
          ctaLabel: "Create page",
        },
      },
    ],
    disclosure: "Affiliate disclosure text",
    riskWarnings: ["Check the product page for final details."],
    seo: {
      title: "Background hero page",
      description: "A page with full-bleed hero media.",
    },
  });

  const hero = parsed.sections[0];
  assert.equal(hero.type, "hero");
  assert.equal(hero.content.mediaLayout, "background");
});

test("normalizes legacy landing page output into section-based output", () => {
  const normalized = normalizeLandingPageOutput({
    hero: {
      headline: "Legacy headline",
      subheadline: "Legacy subheadline",
      ctaLabel: "Legacy CTA",
      imageUrl: "https://example.com/legacy.png",
    },
    problem: {
      title: "Legacy problem",
      body: "Legacy body",
      bullets: ["Legacy bullet"],
    },
    finalCta: {
      headline: "Legacy final CTA",
      body: "Legacy CTA body",
      ctaLabel: "Buy now",
    },
    disclosure: "Legacy disclosure",
    riskWarnings: ["Legacy risk warning"],
    seo: {
      title: "Legacy SEO",
      description: "Legacy SEO description",
    },
  });

  assert.equal(normalized.sections.length >= 3, true);
  assert.equal(normalized.sections[0]?.type, "hero");
  assert.equal(
    normalized.sections[0]?.type === "hero"
      ? normalized.sections[0].content.mediaLayout
      : undefined,
    "right"
  );
});

test("background hero layout uses overlay mode instead of side-by-side media", () => {
  assert.deepEqual(getHeroMediaLayoutMode("background", true), {
    backgroundLayout: true,
    stackedLayout: false,
    mediaFirst: false,
    showMediaPanel: false,
  });
});

test("builds an AI edit prompt from current output and requested change", () => {
  const prompt = buildLandingPageEditPrompt({
    instructions: "Move the hero image to the left and tighten the headline.",
    currentOutput: normalizeLandingPageOutput({
      sections: [
        {
          type: "hero",
          content: {
            headline: "Current headline",
            subheadline: "Current subheadline",
            ctaLabel: "View offer",
            imageUrl: "https://example.com/hero.png",
            mediaLayout: "right",
          },
        },
        {
          type: "problem",
          content: {
            title: "Problem",
            body: "Problem body",
            bullets: ["One", "Two"],
          },
        },
        {
          type: "finalCta",
          content: {
            headline: "Final CTA",
            body: "Final CTA body",
            ctaLabel: "Try it",
          },
        },
      ],
      disclosure: "Disclosure",
      riskWarnings: ["Confirm pricing."],
      seo: {
        title: "SEO title",
        description: "SEO description",
      },
    }),
    profile: {
      displayName: "Ghost Man",
      username: "ghostman",
      bio: "I share practical creator tools.",
      targetAudience: "affiliate creators",
      disclosureText: "Some links may earn me a commission.",
    },
    link: {
      title: "Workflow Kit",
      description: "A dashboard for organizing creator tools.",
      destinationUrl: "https://example.com/workflow",
    },
  });

  assert.match(prompt.userPrompt, /Move the hero image to the left/);
  assert.match(prompt.userPrompt, /Current headline/);
  assert.match(prompt.userPrompt, /mediaLayout/);
  assert.match(prompt.systemPrompt, /editor/i);
  assert.match(prompt.systemPrompt, /background/);
});
