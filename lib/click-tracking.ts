import { createHash } from "node:crypto";

import type { LinkClick } from "@/db/schema";

export type ClickTrackingLinkIdentity = {
  affiliateLinkId: string;
  profileId: string;
  userId: string | null;
};

export type ClickTrackingInput = Omit<
  LinkClick,
  "id"
>;

export type TrackingSearchParams = Record<
  string,
  string | string[] | undefined
>;

const trackedUtmKeys = ["utm_source", "utm_medium", "utm_campaign"] as const;

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
    country: getCountryCode(request),
    deviceType: parseDeviceType(userAgent),
    browser: parseBrowser(userAgent),
    os: parseOperatingSystem(userAgent),
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

export function parseBrowser(userAgent: string | null) {
  if (!userAgent) {
    return "unknown";
  }

  const normalizedUserAgent = userAgent.toLowerCase();

  if (normalizedUserAgent.includes("edg/")) {
    return "Edge";
  }

  if (normalizedUserAgent.includes("opr/") || normalizedUserAgent.includes("opera")) {
    return "Opera";
  }

  if (normalizedUserAgent.includes("firefox/")) {
    return "Firefox";
  }

  if (
    normalizedUserAgent.includes("chrome/") ||
    normalizedUserAgent.includes("crios/")
  ) {
    return "Chrome";
  }

  if (
    normalizedUserAgent.includes("safari/") &&
    normalizedUserAgent.includes("version/")
  ) {
    return "Safari";
  }

  return "unknown";
}

export function parseOperatingSystem(userAgent: string | null) {
  if (!userAgent) {
    return "unknown";
  }

  const normalizedUserAgent = userAgent.toLowerCase();

  if (normalizedUserAgent.includes("android")) {
    return "Android";
  }

  if (
    normalizedUserAgent.includes("iphone") ||
    normalizedUserAgent.includes("ipad") ||
    normalizedUserAgent.includes("ipod")
  ) {
    return "iOS";
  }

  if (normalizedUserAgent.includes("mac os x") || normalizedUserAgent.includes("macintosh")) {
    return "macOS";
  }

  if (normalizedUserAgent.includes("windows nt")) {
    return "Windows";
  }

  if (normalizedUserAgent.includes("linux")) {
    return "Linux";
  }

  return "unknown";
}

export function buildTrackedGoHref(
  linkId: string,
  searchParams: TrackingSearchParams = {}
) {
  const params = new URLSearchParams();

  for (const key of trackedUtmKeys) {
    const value = searchParams[key];
    const normalizedValue = Array.isArray(value) ? value[0] : value;

    if (normalizedValue) {
      params.set(key, normalizedValue);
    }
  }

  const queryString = params.toString();

  return queryString ? `/go/${linkId}?${queryString}` : `/go/${linkId}`;
}

export function isTrackingPrefetchRequest(request: Request) {
  const purpose = request.headers.get("purpose")?.toLowerCase();
  const secPurpose = request.headers.get("sec-purpose")?.toLowerCase();

  return (
    request.headers.has("next-router-prefetch") ||
    purpose === "prefetch" ||
    secPurpose === "prefetch"
  );
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

function getCountryCode(request: Request) {
  return (
    request.headers.get("x-vercel-ip-country") ??
    request.headers.get("cf-ipcountry") ??
    null
  );
}
