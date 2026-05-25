import { getDb } from "@/db/drizzle";
import { landingPageViewsTable } from "@/db/schema";
import type { LandingPageTrackingInput } from "@/lib/click-tracking";

export async function createLandingPageView(input: LandingPageTrackingInput) {
  const [view] = await getDb()
    .insert(landingPageViewsTable)
    .values(input)
    .returning({ id: landingPageViewsTable.id });

  return view;
}
