import type {
  ContentStudioOutput,
  ContentStudioProvider,
} from "@/lib/content-studio";

export type ContentStudioLinkOption = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  network: string | null;
};

export type GeneratedContentResult = {
  id: string;
  provider?: ContentStudioProvider;
  output: ContentStudioOutput;
  generatedText: string;
  createdAt: string;
};

export type RecentGenerationItem = {
  id: string;
  linkTitle: string;
  platform: string;
  goal: string;
  audience: string;
  tone: string;
  generatedText: string;
  createdAt: string;
};

export type GeneratedContentSection = {
  title: string;
  content: string;
};
