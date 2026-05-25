import { createHash } from "node:crypto";

import type { LandingPageView, LinkClick } from "@/db/schema";

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

export type LandingPageTrackingIdentity = {
  landingPageId: string;
  affiliateLinkId: string;
  profileId: string;
  userId: string | null;
};

type TrackingHeaderSource = Pick<Headers, "get" | "has">;

const trackedUtmKeys = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;

export async function buildClickTrackingInput(
  request: Request,
  link: ClickTrackingLinkIdentity
): Promise<ClickTrackingInput> {
  const url = new URL(request.url);
  const timestamp = new Date();
  const trackingContext = await buildBaseTrackingContext({
    headers: request.headers,
    searchParams: Object.fromEntries(url.searchParams.entries()),
    timestamp,
  });

  return {
    affiliateLinkId: link.affiliateLinkId,
    profileId: link.profileId,
    userId: link.userId,
    ...trackingContext,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export type LandingPageTrackingInput = Omit<LandingPageView, "id">;

export async function buildLandingPageTrackingInput(
  request: {
    headers: Headers;
    searchParams?: TrackingSearchParams;
  },
  landingPage: LandingPageTrackingIdentity
): Promise<LandingPageTrackingInput> {
  const timestamp = new Date();
  const trackingContext = await buildBaseTrackingContext({
    headers: request.headers,
    searchParams: request.searchParams,
    timestamp,
  });

  return {
    landingPageId: landingPage.landingPageId,
    affiliateLinkId: landingPage.affiliateLinkId,
    profileId: landingPage.profileId,
    userId: landingPage.userId,
    ...trackingContext,
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
  const params = buildTrackedUtmSearchParams(searchParams);

  const queryString = params.toString();

  return queryString ? `/go/${linkId}?${queryString}` : `/go/${linkId}`;
}

export function isTrackingPrefetchRequest(request: Request) {
  return hasTrackingPrefetchHeaders(request.headers);
}

export function hasTrackingPrefetchHeaders(headers: TrackingHeaderSource) {
  const purpose = headers.get("purpose")?.toLowerCase();
  const secPurpose = headers.get("sec-purpose")?.toLowerCase();

  return headers.has("next-router-prefetch") || purpose === "prefetch" || secPurpose === "prefetch";
}

export async function hashIpAddress(ipAddress: string) {
  const salt = process.env.CLICK_TRACKING_IP_SALT ?? "";

  return createHash("sha256").update(`${salt}:${ipAddress}`).digest("hex");
}

async function buildBaseTrackingContext(input: {
  headers: Headers;
  searchParams?: TrackingSearchParams;
  timestamp: Date;
}) {
  const { headers, searchParams = {} } = input;
  const userAgent = headers.get("user-agent");
  const ipAddress = getForwardedIpAddress(headers);
  const utmParams = getTrackedUtmValues(searchParams);

  return {
    referer: headers.get("referer"),
    userAgent,
    ipAddressHash: ipAddress ? await hashIpAddress(ipAddress) : null,
    country: getCountryCode(headers),
    deviceType: parseDeviceType(userAgent),
    browser: parseBrowser(userAgent),
    os: parseOperatingSystem(userAgent),
    source: utmParams.utm_source,
    medium: utmParams.utm_medium,
    campaign: utmParams.utm_campaign,
    content: utmParams.utm_content,
    term: utmParams.utm_term,
  };
}

function buildTrackedUtmSearchParams(searchParams: TrackingSearchParams = {}) {
  const params = new URLSearchParams();

  for (const key of trackedUtmKeys) {
    const value = normalizeTrackingParamValue(searchParams[key]);

    if (value) {
      params.set(key, value);
    }
  }

  return params;
}

function getTrackedUtmValues(searchParams: TrackingSearchParams = {}) {
  return {
    utm_source: normalizeTrackingParamValue(searchParams.utm_source),
    utm_medium: normalizeTrackingParamValue(searchParams.utm_medium),
    utm_campaign: normalizeTrackingParamValue(searchParams.utm_campaign),
    utm_content: normalizeTrackingParamValue(searchParams.utm_content),
    utm_term: normalizeTrackingParamValue(searchParams.utm_term),
  };
}

function normalizeTrackingParamValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? null : value ?? null;
}

function getForwardedIpAddress(headers: TrackingHeaderSource) {
  const forwardedFor = headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || null;
  }

  return (
    headers.get("x-real-ip") ??
    headers.get("cf-connecting-ip") ??
    null
  );
}

function getCountryCode(headers: TrackingHeaderSource) {
  return (
    headers.get("x-vercel-ip-country") ??
    headers.get("cf-ipcountry") ??
    null
  );
}
