import { recordUsageEvent as dbRecordUsageEvent, getMonthlyUsageCount } from "@/db/usage";
import { getAffiliateLinksForWorkspace } from "@/db/affiliate-links";
import { getPublishedLandingPagesCount } from "@/db/landing-pages";

export type UsageSummary = {
    monthlyContentGenerations: number;
    totalAffiliateLinks: number;
    monthlyLandingPageGenerations: number;
    monthlyLandingPageAiEdits: number;
    publishedLandingPages: number;
};

export async function recordUsageEvent(
    userId: string,
    eventType:
      | "content_generation"
      | "affiliate_link_created"
      | "affiliate_link_imported"
      | "campaign_url_generated"
      | "landing_page_generated"
      | "landing_page_ai_edit",
    metadata?: Record<string, unknown>
) {
    return dbRecordUsageEvent({ userId, eventType, metadata });
}

export async function getMonthlyContentGenerationCount(userId: string) {
    return getMonthlyUsageCount(userId, "content_generation");
}

export async function getMonthlyLandingPageGenerationCount(userId: string) {
    return getMonthlyUsageCount(userId, "landing_page_generated");
}

export async function getMonthlyLandingPageAiEditCount(userId: string) {
    return getMonthlyUsageCount(userId, "landing_page_ai_edit");
}

export async function getUsageSummary(userId: string) {
    const [
        monthlyContentGenerations,
        monthlyLandingPageGenerations,
        monthlyLandingPageAiEdits,
        publishedLandingPages,
        linksResult,
    ] = await Promise.all([
        getMonthlyContentGenerationCount(userId),
        getMonthlyLandingPageGenerationCount(userId),
        getMonthlyLandingPageAiEditCount(userId),
        getPublishedLandingPagesCount(userId),
        getAffiliateLinksForWorkspace(userId),
    ]);
    const totalAffiliateLinks = Array.isArray(linksResult) ? linksResult.length : 0;

    return {
        monthlyContentGenerations,
        totalAffiliateLinks,
        monthlyLandingPageGenerations,
        monthlyLandingPageAiEdits,
        publishedLandingPages,
    } satisfies UsageSummary;
}
