import { and, eq, gte, sql } from "drizzle-orm";
import { getDb } from "@/db/drizzle";
import { usageEventsTable } from "@/db/schema";

export async function recordUsageEvent(input: {
  userId: string;
  eventType: "content_generation" | "affiliate_link_created" | "affiliate_link_imported" | "campaign_url_generated" | "landing_page_generated";
  metadata?: Record<string, unknown>;
}) {
  return getDb()
    .insert(usageEventsTable)
    .values({
      userId: input.userId,
      eventType: input.eventType,
      metadata: input.metadata,
    })
    .returning();
}

export async function getMonthlyUsageCount(userId: string, eventType: string) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [result] = await getDb()
    .select({
      count: sql<number>`count(*)`,
    })
    .from(usageEventsTable)
    .where(
      and(
        eq(usageEventsTable.userId, userId),
        eq(usageEventsTable.eventType, eventType as "content_generation"),
        gte(usageEventsTable.createdAt, startOfMonth)
      )
    );

  return result?.count ?? 0;
}
