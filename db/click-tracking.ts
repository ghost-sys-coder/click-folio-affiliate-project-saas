import { eq } from "drizzle-orm";

import { getDb } from "@/db/drizzle";
import {
  affiliateLinksTable,
  linkClicksTable,
  profilesTable,
} from "@/db/schema";
import type { ClickTrackingInput } from "@/lib/click-tracking";

export async function getAffiliateLinkForRedirect(linkId: string) {
  const [link] = await getDb()
    .select({
      id: affiliateLinksTable.id,
      profileId: affiliateLinksTable.profileId,
      userId: affiliateLinksTable.userId,
      destinationUrl: affiliateLinksTable.destinationUrl,
      status: affiliateLinksTable.status,
      profileUsername: profilesTable.username,
    })
    .from(affiliateLinksTable)
    .innerJoin(profilesTable, eq(profilesTable.id, affiliateLinksTable.profileId))
    .where(eq(affiliateLinksTable.id, linkId))
    .limit(1);

  return link ?? null;
}

export async function createLinkClick(input: ClickTrackingInput) {
  const [click] = await getDb()
    .insert(linkClicksTable)
    .values(input)
    .returning({ id: linkClicksTable.id });

  return click;
}
