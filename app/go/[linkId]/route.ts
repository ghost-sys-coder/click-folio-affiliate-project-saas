import { NextResponse, type NextRequest } from "next/server";

import { getAffiliateLinkForRedirect, createLinkClick } from "@/db/click-tracking";
import {
  buildClickTrackingInput,
  isTrackingPrefetchRequest,
} from "@/lib/click-tracking";

export const dynamic = "force-dynamic";

type GoRouteContext = {
  params: Promise<{ linkId: string }>;
};

export async function GET(request: NextRequest, context: GoRouteContext) {
  if (isTrackingPrefetchRequest(request)) {
    return new NextResponse(null, { status: 204 });
  }

  const { linkId } = await context.params;
  const link = await getAffiliateLinkForRedirect(linkId).catch(() => null);

  if (!link) {
    return NextResponse.redirect(new URL("/go/unavailable", request.url));
  }

  if (link.status !== "active") {
    return NextResponse.redirect(new URL(`/u/${link.profileUsername}`, request.url));
  }

  try {
    await createLinkClick(
      await buildClickTrackingInput(request, {
        affiliateLinkId: link.id,
        profileId: link.profileId,
        userId: link.userId,
      })
    );
  } catch {
    // Tracking must never block the visitor from reaching the affiliate offer.
  }

  return NextResponse.redirect(link.destinationUrl);
}
