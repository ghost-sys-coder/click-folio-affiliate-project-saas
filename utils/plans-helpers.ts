import { PlanKey, plans } from "@/lib/plans";

export function getPlanLimits(planKey: PlanKey) {
    return plans[planKey] ?? plans.trial; // Fallback to trial limits if planKey is invalid
}

export function isUnlimited(value: number | null): boolean {
    return value === null;
}

export function canCreateAffiliateLink(params: { plan: PlanKey, currentAffiliateLinkCount: number }) {
    const limits = getPlanLimits(params.plan);

    if (limits.maxAffiliateLinks === null) {
        return {
            allowed: true,
            limit: null,
            remaining: null,
        }
    }

    const remaining = Math.max(limits.maxAffiliateLinks - params.currentAffiliateLinkCount, 0);

    return {
        allowed: params.currentAffiliateLinkCount < limits.maxAffiliateLinks,
        limit: limits.maxAffiliateLinks,
        remaining,
    }
};

export function canImportRows(params: { plan: PlanKey, rowCount: number }) {
    const limits = getPlanLimits(params.plan);

    return {
        allowed: params.rowCount <= limits.maxImportRowsPerUpload,
        limit: limits.maxImportRowsPerUpload,
        remaining: Math.max(limits.maxImportRowsPerUpload - params.rowCount, 0),
    }
}

export function canGenerateContent(params: {plan: PlanKey, currentMonthlyGenerationCount: number}) {
    const limits = getPlanLimits(params.plan);

    const remaining = Math.max(limits.maxContentGenerations - params.currentMonthlyGenerationCount, 0);

    return {
        allowed: params.currentMonthlyGenerationCount < limits.maxContentGenerations,
        limit: limits.maxContentGenerations,
        remaining,
    }
}

export function getAnalyticsLevel(planKey: PlanKey) {
    const limits = getPlanLimits(planKey);

    return limits.analyticsLevel;
}

export function hasCustomThemes(planKey: PlanKey) {
    const limits = getPlanLimits(planKey);
    return limits.customThemes;
}

export function hasRemoveBranding(planKey: PlanKey) {
    const limits = getPlanLimits(planKey);
    return limits.removeBranding;
}


export function hasAnalyticsExport(planKey: PlanKey) {
  return getPlanLimits(planKey).analyticsExport;
}

export function hasPrioritySupport(planKey: PlanKey) {
  return getPlanLimits(planKey).prioritySupport;
}

export function hasEarlyAccessFeatures(planKey: PlanKey) {
  return getPlanLimits(planKey).earlyAccessFeatures;
}

export function hasFutureCreativeTools(planKey: PlanKey) {
  return getPlanLimits(planKey).futureCreativeTools;
}

export function canUseCampaignUrlBuilder(planKey: PlanKey) {
  return getPlanLimits(planKey).campaignUrlBuilder;
}