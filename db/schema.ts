import { integer, text, boolean, pgTable, timestamp, uuid, numeric, json, pgEnum } from "drizzle-orm/pg-core";

// create user table
export const usersTable = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    clerkUserId: text("clerk_user_id").notNull().unique(),
    email: text("email").notNull().unique(),
    firstName: text("first_name"),
    lastName: text("last_name"),
    imageUrl: text("image_url"),
    isAdmin: boolean("is_admin").notNull().default(false),
    isDeleted: boolean("is_deleted").notNull().default(false),
    deletedAt: timestamp("deleted_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow()
});

export type User = typeof usersTable.$inferSelect;

// this is for the user onboarding flow
export const profilesTable = pgTable("profiles", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().unique().references(() => usersTable.id),
    username: text("username").notNull().unique(),
    displayName: text("display_name").notNull(),
    bio: text("bio"),
    niche: text("niche"),
    avatarUrl: text("avatar_url"),
    coverImageUrl: text("cover_image_url"),
    targetAudience: text("target_audience").notNull().default("Affiliate Marketers"),
    primaryPlatform: text("primary_platform").notNull().default("instagram"),
    contentTone: text("content_tone").notNull().default("direct"),
    primaryGoal: text("primary_goal").notNull().default("organize my links"),
    defaultButtonLabel: text("default_button_label").default("View Deal"),
    theme: text("theme").default("default"),
    disclosureText: text("disclosure_text").notNull().default("Some links on this page may earn me a commission at no extra cost to you."),
    isPublished: boolean("is_published").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow()
});

export type Profile = typeof profilesTable.$inferSelect;

// link status enum
export const affiliateLinkStatusEnum = pgEnum("link_status", [
    "active",
    "inactive",
    "archive",
]);

export const affiliateLinksTable = pgTable("affiliate_links", {
    id: uuid("id").primaryKey().defaultRandom(),
    profileId: uuid("profile_id").notNull().references(() => profilesTable.id),
    userId: uuid("user_id").notNull().references(() => usersTable.id),
    title: text("title").notNull(),
    description: text("description"),
    destinationUrl: text("destination_url").notNull(),
    trackingSlug: text("tracking_slug").unique(),
    imageUrl: text("image_url"),
    category: text("category"),
    network: text("network"),
    commissionType: text("commission_type"),
    commissionValue: numeric("commission_value", { precision: 10, scale: 2 }),
    price: numeric("price", { precision: 10, scale: 2 }),
    currency: text("currency").notNull().default("USD"),
    buttonLabel: text("button_label").notNull().default("Buy Now"),
    status: affiliateLinkStatusEnum("status").notNull().default("active"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow()
});

export type AffiliateLink = typeof affiliateLinksTable.$inferSelect;

// after MVP we can add tables for analytics, link clicks, etc.
export const linkClicksTable = pgTable("link_clicks", {
    id: uuid("id").primaryKey().defaultRandom(),
    affiliateLinkId: uuid("affiliate_link_id").notNull().references(() => affiliateLinksTable.id),
    profileId: uuid("profile_id").notNull().references(() => profilesTable.id),
    userId: uuid("user_id").references(() => usersTable.id),
    referer: text("referer"),
    userAgent: text("user_agent"),
    ipAddressHash: text("ip_address_hash"),
    country: text("country"),
    deviceType: text("device_type"),
    browser: text("browser"),
    os: text("os"),
    source: text("source"),
    medium: text("medium"),
    campaign: text("campaign"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow()
});

export type LinkClick = typeof linkClicksTable.$inferSelect;

export const campaignsTable = pgTable("campaigns", {
    id: uuid("id").primaryKey().defaultRandom(),
    profileId: uuid("profile_id").notNull().references(() => profilesTable.id),
    userId: uuid("user_id").notNull().references(() => usersTable.id),
    name: text("name").notNull(),
    platform: text("platform").notNull(),
    objective: text("objective").notNull(),
    startDate: timestamp("start_date").notNull(),
    endDate: timestamp("end_date").notNull(),
    status: text("status").default("active"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow()
});

export type Campaign = typeof campaignsTable.$inferSelect;

export const subscriptionsTable = pgTable("subscriptions", {
    id: uuid("id").primaryKey().defaultRandom(),
    profileId: uuid("profile_id").notNull().references(() => profilesTable.id),
    userId: uuid("user_id").notNull().references(() => usersTable.id),
    paymentProvider: text("payment_provider").notNull(),
    providerCustomerId: text("provider_customer_id"),
    providerSubscriptionId: text("provider_subscription_id"),
    plan: text("plan").notNull().default("free"),
    status: text("status").default("free"),
    currentPeriodEnd: timestamp("current_period_end"),
    amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
    currency: text("currency").default("USD"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow()
});

export type Subscription = typeof subscriptionsTable.$inferSelect;

// stores AI generated content for profiles, campaigns, etc. for future reference and to avoid regenerating the same content multiple times
export const aiContentTable = pgTable("ai_content", {
    id: uuid("id").primaryKey().defaultRandom(),
    profileId: uuid("profile_id").notNull().references(() => profilesTable.id),
    userId: uuid("user_id").notNull().references(() => usersTable.id),
    campaignId: uuid("campaign_id").references(() => campaignsTable.id),
    linkId: uuid("link_id").references(() => affiliateLinksTable.id),
    platform: text("platform").notNull(), // e.g. "instagram", "facebook", "twitter", etc.
    promptInput: json("prompt_input"), // store the input parameters used to generate the content for future reference
    generatedContent: text("generated_content").notNull(), // the actual AI generated content
    contentType: text("content_type").notNull(), // e.g. "link_description", "ad_copy", "profile_bio", etc.
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow()
});

export type AIContent = typeof aiContentTable.$inferSelect;

