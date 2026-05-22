/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import {
  ArrowUpRight,
  BadgeCheck,
  ExternalLink,
  ImageIcon,
  Link2,
  ShieldCheck,
  Sparkles,
  Tag,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { PublicAffiliateLink, PublicProfile } from "@/db/public-profiles";
import {
  buildTrackedGoHref,
  type TrackingSearchParams,
} from "@/lib/click-tracking";
import { appThemes, normalizeAppTheme, themeAttribute } from "@/lib/themes";

type PublishedProfile = NonNullable<PublicProfile>;

type PublicProfilePageProps = {
  links: PublicAffiliateLink[];
  profile: PublishedProfile;
  trackingParams?: TrackingSearchParams;
};

export function PublicProfilePage({
  links,
  profile,
  trackingParams,
}: PublicProfilePageProps) {
  const theme = normalizeAppTheme(profile.theme);
  const niche = formatLabel(profile.niche);

  return (
    <main
      {...themeAttribute(theme)}
      className="min-h-svh bg-background text-foreground"
    >
      <div className="mx-auto grid w-full max-w-4xl gap-6 px-4 py-4 sm:px-6 lg:py-8">
        <section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
          <div className="relative min-h-48 overflow-hidden bg-muted sm:min-h-64">
            {profile.coverImageUrl ? (
              <img
                src={profile.coverImageUrl}
                alt={`${profile.displayName} cover`}
                className="absolute inset-0 size-full object-cover"
              />
            ) : (
              <div className="theme-hero-glow absolute inset-0" />
            )}
            <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-background/85 to-transparent" />
          </div>

          <div className="grid gap-5 px-5 pb-6 sm:px-7">
            <div className="-mt-12 flex flex-col gap-4 sm:-mt-14 sm:flex-row sm:items-end sm:justify-between">
              <Avatar
                avatarUrl={profile.avatarUrl}
                displayName={profile.displayName}
              />
              <div className="flex flex-wrap gap-2 sm:justify-end">
                {niche ? (
                  <Badge variant="secondary" className="h-6">
                    <Sparkles className="size-3" />
                    {niche}
                  </Badge>
                ) : null}
                <Badge variant="outline" className="h-6 bg-surface">
                  <BadgeCheck className="size-3" />
                  Published affiliate page
                </Badge>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
              <div className="min-w-0 space-y-3">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    @{profile.username}
                  </p>
                  <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                    {profile.displayName}
                  </h1>
                </div>
                {profile.bio ? (
                  <p className="max-w-2xl text-base leading-7 text-muted-foreground">
                    {profile.bio}
                  </p>
                ) : (
                  <p className="max-w-2xl text-base leading-7 text-muted-foreground">
                    Curated affiliate recommendations with clear context before
                    you click.
                  </p>
                )}
              </div>

              <div className="rounded-xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground md:max-w-64">
                <div className="mb-1 flex items-center gap-2 font-medium text-foreground">
                  <ShieldCheck className="size-4 text-primary" />
                  Disclosure-first
                </div>
                Partner details can change. Confirm pricing and terms on the
                partner site before buying.
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold tracking-tight">
                Recommended resources
              </h2>
              <p className="text-sm leading-6 text-muted-foreground">
                These links may be affiliate offers. Use the notes on each card
                to decide what fits your workflow.
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              {links.length} active {links.length === 1 ? "link" : "links"}
            </p>
          </div>

          {links.length > 0 ? (
            <div className="grid gap-3">
              {links.map((link) => (
                <PublicAffiliateLinkCard
                  key={link.id}
                  link={link}
                  trackingParams={trackingParams}
                />
              ))}
            </div>
          ) : (
            <EmptyPublicLinksState displayName={profile.displayName} />
          )}
        </section>

        <AffiliateDisclosure
          disclosureText={profile.disclosureText}
          theme={theme}
        />
      </div>
    </main>
  );
}

function Avatar({
  avatarUrl,
  displayName,
}: {
  avatarUrl: string | null;
  displayName: string;
}) {
  return (
    <div className="relative flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-4 border-background bg-primary text-2xl font-semibold text-primary-foreground shadow-lg sm:size-28">
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={`${displayName} avatar`}
          className="size-full object-cover"
        />
      ) : (
        <span>{getInitials(displayName)}</span>
      )}
    </div>
  );
}

function PublicAffiliateLinkCard({
  link,
  trackingParams,
}: {
  link: PublicAffiliateLink;
  trackingParams?: TrackingSearchParams;
}) {
  return (
    <Link
      href={buildTrackedGoHref(link.id, trackingParams)}
      className="group block rounded-xl focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <Card className="border-border/70 bg-card transition group-hover:-translate-y-0.5 group-hover:border-primary/40 group-hover:shadow-lg">
        <CardContent className="grid gap-4 p-4 sm:grid-cols-[7rem_1fr_auto] sm:items-center">
          <ProductImage imageUrl={link.imageUrl} title={link.title} />

          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              {link.category ? (
                <Badge variant="outline" className="bg-surface">
                  <Tag className="size-3" />
                  {link.category}
                </Badge>
              ) : null}
              {link.network ? (
                <Badge variant="secondary">{link.network}</Badge>
              ) : null}
              {link.price ? (
                <Badge variant="outline" className="bg-surface">
                  {formatMoney(link.price, link.currency)}
                </Badge>
              ) : null}
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-semibold leading-snug tracking-tight">
                {link.title}
              </h3>
              {link.description ? (
                <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
                  {link.description}
                </p>
              ) : (
                <p className="text-sm leading-6 text-muted-foreground">
                  Open this recommendation to review the current offer details.
                </p>
              )}
            </div>
          </div>

          <span className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground transition group-hover:bg-primary-hover">
            {link.buttonLabel || "View Deal"}
            <ArrowUpRight className="size-4" />
          </span>
        </CardContent>
      </Card>
    </Link>
  );
}

function ProductImage({
  imageUrl,
  title,
}: {
  imageUrl: string | null;
  title: string;
}) {
  return (
    <div className="flex aspect-4/3 w-full items-center justify-center overflow-hidden rounded-xl border border-border bg-muted text-muted-foreground sm:w-28">
      {imageUrl ? (
        <img src={imageUrl} alt={title} className="size-full object-cover" />
      ) : (
        <ImageIcon className="size-6" />
      )}
    </div>
  );
}

function EmptyPublicLinksState({ displayName }: { displayName: string }) {
  return (
    <Card className="border-dashed border-border/80 bg-card">
      <CardContent className="grid min-h-72 place-items-center p-6 text-center">
        <div className="grid max-w-md gap-3">
          <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-muted text-primary">
            <Link2 className="size-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-semibold">
              No active recommendations yet
            </h3>
            <p className="text-sm leading-6 text-muted-foreground">
              {displayName} has not published any active affiliate links on this
              page. Check back for a curated list of resources.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AffiliateDisclosure({
  disclosureText,
  theme,
}: {
  disclosureText: string;
  theme: string;
}) {
  return (
    <footer className="grid gap-3 rounded-2xl border border-border bg-surface px-5 py-4 text-sm leading-6 text-muted-foreground sm:grid-cols-[1fr_auto] sm:items-center">
      <div>
        <p className="font-medium text-foreground">Affiliate disclosure</p>
        <p>{disclosureText}</p>
      </div>
      <div className="inline-flex items-center gap-2 text-xs text-muted-foreground sm:justify-self-end">
        <ExternalLink className="size-3.5" />
        Powered by Clickfolio
        <span className="sr-only">
          using the {theme === appThemes.growthMint ? "Growth Mint" : "Signal Purple"} theme
        </span>
      </div>
    </footer>
  );
}

function getInitials(displayName: string) {
  const words = displayName.trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) {
    return "CF";
  }

  return words
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");
}

function formatLabel(value: string | null) {
  if (!value) {
    return "";
  }

  return value
    .split("-")
    .filter(Boolean)
    .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatMoney(value: string, currency: string) {
  return `${currency} ${value}`;
}
