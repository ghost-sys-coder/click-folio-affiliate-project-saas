
export const PLAN_LIMITS = {
    free: {
        maxProfile: 1,
        maxAffiliateLinks: 5,
        maxImportRows: 15,
        monthlyContentGenerations: 10,
        analyticsLevel: 'basic',
        customThemes: false,
        removeBranding: false,
        prioritySupport: false,
    },
    pro: {
        maxProfile: 5,
        maxAffiliateLinks: null, // Unlimited
        maxImportRows: 250, 
        monthlyContentGenerations: 100,
        analyticsLevel: 'advanced',
        customThemes: true,
        removeBranding: true,
        prioritySupport: false,
    },
    creator_plus: {
        maxProfile: 1,
        maxAffiliateLinks: null, // Unlimited
        maxImportRows: 500, 
        monthlyContentGenerations: 300,
        analyticsLevel: 'advanced',
        customThemes: true,
        removeBranding: true,
        prioritySupport: true,
    }
}