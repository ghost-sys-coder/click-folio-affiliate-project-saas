import { createHash } from "node:crypto";

import type { LinkClick } from "@/db/schema";

export type ClickTrackingLinkIdentity = {
  affiliateLinkId: string;
  profileId: string;
  userId: string | null;
};

export type ClickTrackingInput = Omit<
  LinkClick,
  "id" | "country" | "browser" | "os"
>;

export async function buildClickTrackingInput(
  request: Request,
  link: ClickTrackingLinkIdentity
): Promise<ClickTrackingInput> {
  const url = new URL(request.url);
  const userAgent = request.headers.get("user-agent");
  const ipAddress = getForwardedIpAddress(request);
  const timestamp = new Date();

  return {
    affiliateLinkId: link.affiliateLinkId,
    profileId: link.profileId,
    userId: link.userId,
    referer: request.headers.get("referer"),
    userAgent,
    ipAddressHash: ipAddress ? await hashIpAddress(ipAddress) : null,
    deviceType: parseDeviceType(userAgent),
    source: url.searchParams.get("utm_source"),
    medium: url.searchParams.get("utm_medium"),
    campaign: url.searchParams.get("utm_campaign"),
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function parseDeviceType(userAgent: string | null) {
  if (!userAgent) {
    return "unknown";
  }

  const normalizedUserAgent = userAgent.toLowerCase();

  if (/ipad|tablet|kindle|silk/.test(normalizedUserAgent)) {
    return "tablet";
  }

  if (/mobile|iphone|ipod|android|blackberry|phone/.test(normalizedUserAgent)) {
    return "mobile";
  }

  return "desktop";
}

export async function hashIpAddress(ipAddress: string) {
  const salt = process.env.CLICK_TRACKING_IP_SALT ?? "";

  return createHash("sha256").update(`${salt}:${ipAddress}`).digest("hex");
}

function getForwardedIpAddress(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || null;
  }

  return (
    request.headers.get("x-real-ip") ??
    request.headers.get("cf-connecting-ip") ??
    null
  );
}
