import { recordUsageEvent as dbRecordUsageEvent, getMonthlyUsageCount } from "@/db/usage";
import { getAffiliateLinksForWorkspace } from "@/db/affiliate-links";

export async function recordUsageEvent(userId: string, eventType: "content_generation" | "affiliate_link_created" | "affiliate_link_imported" | "campaign_url_generated" | "landing_page_generated", metadata?: Record<string, unknown>) {
    return dbRecordUsageEvent({ userId, eventType, metadata });
}

export async function getMonthlyContentGenerationCount(userId: string) {
    return getMonthlyUsageCount(userId, "content_generation");
}

export async function getUsageSummary(userId: string) {
    const monthlyContentGenerations = await getMonthlyContentGenerationCount(userId);
    const linksResult = await getAffiliateLinksForWorkspace(userId);
    const totalAffiliateLinks = Array.isArray(linksResult) ? linksResult.length : 0;

    return {
        monthlyContentGenerations,
        totalAffiliateLinks,
    };
}
