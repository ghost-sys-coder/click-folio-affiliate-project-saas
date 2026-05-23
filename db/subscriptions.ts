import { eq } from "drizzle-orm";
import { getDb } from "@/db/drizzle";
import { subscriptionsTable } from "@/db/schema";

export async function getSubscriptionByUserId(userId: string) {
  const [subscription] = await getDb()
    .select()
    .from(subscriptionsTable)
    .where(eq(subscriptionsTable.userId, userId))
    .limit(1);

  return subscription ?? null;
}

export async function createTrialSubscription(userId: string) {
  const now = new Date();
  const trialEndsAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [subscription] = await getDb()
    .insert(subscriptionsTable)
    .values({
      userId,
      plan: "trial",
      status: "trialing",
      trialStartedAt: now,
      trialEndsAt: trialEndsAt,
      amount: "0",
      currency: "USD",
    })
    .onConflictDoUpdate({
        target: subscriptionsTable.userId,
        set: { updatedAt: now } // Simple idempotent check
    })
    .returning();

  return subscription;
}
