export type PlanKey = "trial" | "starter" | "pro" | "creator_plus";
export type AnalyticsLevel = "basic" | "advanced" | "premium";

interface PlanLimits {
    label: string;
    trialDays?: number;
    priceMonthly?: number;
    maxProfiles: number;
    maxAffiliateLinks: number | null; // null means unlimited
    maxImportRowsPerUpload: number;
    maxContentGenerations: number;
    campaignUrlBuilder: boolean;
    analyticsLevel: AnalyticsLevel;
    clickHistoryDays: number | string; // number of days or "unlimited"
    customThemes: boolean;
    removeBranding: boolean;
    analyticsExport: boolean;
    prioritySupport: boolean;
    earlyAccessFeatures: boolean;
    futureCreativeTools: boolean;
}


export const plans: Record<PlanKey, PlanLimits> = {
    trial: {
        label: "Trial",
        trialDays: 7,
        maxProfiles: 1,
        maxAffiliateLinks: 10,
        maxImportRowsPerUpload: 50,
        maxContentGenerations: 25,
        campaignUrlBuilder: true,
        analyticsLevel: "basic",
        clickHistoryDays: 7,
        customThemes: false,
        removeBranding: false,
        analyticsExport: false,
        prioritySupport: false,
        earlyAccessFeatures: false,
        futureCreativeTools: false,
    },
    starter: {
        label: "Starter",
        priceMonthly: 9,
        maxProfiles: 1,
        maxAffiliateLinks: 25,
        maxImportRowsPerUpload: 100,
        maxContentGenerations: 25,
        campaignUrlBuilder: true,
        analyticsLevel: "basic",
        clickHistoryDays: 30,
        customThemes: false,
        removeBranding: false,
        analyticsExport: false,
        prioritySupport: false,
        earlyAccessFeatures: false,
        futureCreativeTools: false,
    },
    pro: {
        label: "Pro",
        priceMonthly: 29,
        maxProfiles: 1,
        maxAffiliateLinks: null,
        maxImportRowsPerUpload: 500,
        maxContentGenerations: 150,
        campaignUrlBuilder: true,
        analyticsLevel: "advanced",
        clickHistoryDays: 365,
        customThemes: true,
        removeBranding: true,
        analyticsExport: false,
        prioritySupport: false,
        earlyAccessFeatures: false,
        futureCreativeTools: false,
    },
    creator_plus: {
        label: "Creator Plus",
        priceMonthly: 59,
        maxProfiles: 1,
        maxAffiliateLinks: null,
        maxImportRowsPerUpload: 1000,
        maxContentGenerations: 500,
        campaignUrlBuilder: true,
        analyticsLevel: "premium",
        clickHistoryDays: "unlimited",
        customThemes: true,
        removeBranding: true,
        analyticsExport: true,
        prioritySupport: true,
        earlyAccessFeatures: true,
        futureCreativeTools: true,
    }
}


