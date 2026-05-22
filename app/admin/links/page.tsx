import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  Archive,
  AlertTriangle,
  CheckCircle2,
  Database,
  ExternalLink,
  Link2,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";

import {
  archiveAffiliateLink,
  deleteAffiliateLink,
  toggleAffiliateLinkStatus,
} from "@/actions/affiliate-links";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  getAffiliateLinkWorkspaceByClerkUserId,
  safeGetAffiliateLinksForWorkspace,
} from "@/db/affiliate-links";
import type { AffiliateLink } from "@/db/schema";

export const dynamic = "force-dynamic";

export default async function AdminLinksPage({
  searchParams,
}: PageProps<"/admin/links">) {
  const { userId: clerkUserId } = await auth();
  const params = await searchParams;
  const mutationFailed = params.mutation === "failed";
  const linkDeleted =
    params.linkDeleted === "success"
      ? "success"
      : params.linkDeleted === "failed"
        ? "failed"
        : null;

  if (!clerkUserId) {
    redirect("/sign-in?redirect_url=/admin/links");
  }

  const workspace = await getAffiliateLinkWorkspaceByClerkUserId(clerkUserId);

  if (!workspace) {
    redirect("/onboarding");
  }

  const linksResult = await safeGetAffiliateLinksForWorkspace(workspace.userId);

  if (!linksResult.ok) {
    return (
      <LinksReadErrorState
        kind={linksResult.kind}
      />
    );
  }

  const links = linksResult.links;
  const activeCount = links.filter((link) => link.status === "active").length;
  const inactiveCount = links.filter((link) => link.status === "inactive").length;
  const archivedCount = links.filter((link) => link.status === "archive").length;

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Affiliate links
          </h1>
          <p className="text-sm text-muted-foreground">
            {links.length} total - {activeCount} active - {inactiveCount} inactive -{" "}
            {archivedCount} archived
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/links/new">
            <Plus className="size-4" />
            New link
          </Link>
        </Button>
      </div>

      {mutationFailed ? (
        <FeedbackBanner
          tone="error"
          title="Link change not saved"
          message="Check the database setup and try again."
        />
      ) : null}

      {linkDeleted === "success" ? (
        <FeedbackBanner
          tone="success"
          title="Affiliate link deleted"
          message="The link was removed from your workspace."
        />
      ) : null}

      {linkDeleted === "failed" ? (
        <FeedbackBanner
          tone="error"
          title="Delete failed"
          message="The link could not be deleted. It may have already been removed, or the database request failed."
        />
      ) : null}

      {links.length === 0 ? (
        <Empty className="min-h-96 border border-border bg-card">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Link2 className="size-4" />
            </EmptyMedia>
            <EmptyTitle>No affiliate links yet</EmptyTitle>
            <EmptyDescription>
              Create your first offer link to start organizing your workspace.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild>
              <Link href="/admin/links/new">
                <Plus className="size-4" />
                New link
              </Link>
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="grid gap-3">
          {links.map((link) => (
            <AffiliateLinkCard key={link.id} link={link} />
          ))}
        </div>
      )}
    </div>
  );
}

function FeedbackBanner({
  tone,
  title,
  message,
}: {
  tone: "success" | "error";
  title: string;
  message: string;
}) {
  const Icon = tone === "success" ? CheckCircle2 : AlertTriangle;
  const className =
    tone === "success"
      ? "border-primary/30 bg-primary/10 text-foreground"
      : "border-destructive/30 bg-destructive/10 text-destructive";

  return (
    <div className={`flex gap-3 rounded-lg border px-3 py-2 text-sm ${className}`}>
      <Icon className="mt-0.5 size-4 shrink-0" />
      <div className="grid gap-0.5">
        <p className="font-medium">{title}</p>
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}

function LinksReadErrorState({
  kind,
}: {
  kind: "missing-table" | "unknown";
}) {
  const isMissingTable = kind === "missing-table";

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Affiliate links
          </h1>
          <p className="text-sm text-muted-foreground">
            {isMissingTable
              ? "The links database table is not ready yet."
              : "The workspace could not read link data right now."}
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/links">Refresh</Link>
        </Button>
      </div>

      <Empty className="min-h-80 border border-border bg-card">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            {isMissingTable ? (
              <Database className="size-4" />
            ) : (
              <AlertTriangle className="size-4" />
            )}
          </EmptyMedia>
          <EmptyTitle>
            {isMissingTable ? "Database setup required" : "Links unavailable"}
          </EmptyTitle>
          <EmptyDescription>
            {isMissingTable
              ? "Run the affiliate links migration before creating your first link."
              : "The request was protected, but the database read failed. Try again after checking the database connection."}
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <div className="w-full rounded-lg border bg-muted/30 px-3 py-2 text-left font-mono text-xs text-muted-foreground">
            {isMissingTable
              ? "npx drizzle-kit generate && npx drizzle-kit migrate"
              : "Check DATABASE_URL and the affiliate_links table permissions."}
          </div>
        </EmptyContent>
      </Empty>
    </div>
  );
}

function AffiliateLinkCard({ link }: { link: AffiliateLink }) {
  const nextStatus = link.status === "active" ? "inactive" : "active";

  return (
    <Card className="border-border/70 bg-card">
      <CardHeader className="gap-3 sm:grid-cols-[1fr_auto]">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={getStatusBadgeVariant(link.status)}>
              {link.status === "archive" ? "Archived" : titleCase(link.status)}
            </Badge>
            {link.category ? <Badge variant="outline">{link.category}</Badge> : null}
            {link.network ? <Badge variant="secondary">{link.network}</Badge> : null}
          </div>
          <CardTitle className="truncate text-lg">{link.title}</CardTitle>
          <p className="truncate text-sm text-muted-foreground">
            {getUrlHost(link.destinationUrl)}
          </p>
        </div>
        <CardAction className="flex flex-wrap justify-end gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/admin/links/${link.id}/edit`}>
              <Pencil className="size-3.5" />
              Edit
            </Link>
          </Button>
          <Button asChild variant="ghost" size="icon-sm">
            <a
              href={link.destinationUrl}
              target="_blank"
              rel="noreferrer"
              aria-label={`Open ${link.title}`}
            >
              <ExternalLink className="size-3.5" />
            </a>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
        <div className="min-w-0 space-y-3">
          {link.description ? (
            <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
              {link.description}
            </p>
          ) : null}
          <div className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-4">
            <Metric label="Button" value={link.buttonLabel} />
            <Metric label="Order" value={String(link.sortOrder)} />
            <Metric label="Price" value={formatMoney(link.price, link.currency)} />
            <Metric
              label="Commission"
              value={formatCommission(
                link.commissionType,
                link.commissionValue,
                link.currency
              )}
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2 sm:justify-end">
          <form action={toggleAffiliateLinkStatus}>
            <input type="hidden" name="id" value={link.id} />
            <input type="hidden" name="status" value={nextStatus} />
            <Button type="submit" variant="outline" size="sm">
              <MoreHorizontal className="size-3.5" />
              {nextStatus === "active" ? "Activate" : "Pause"}
            </Button>
          </form>
          {link.status !== "archive" ? (
            <form action={archiveAffiliateLink}>
              <input type="hidden" name="id" value={link.id} />
              <Button type="submit" variant="outline" size="sm">
                <Archive className="size-3.5" />
                Archive
              </Button>
            </form>
          ) : null}
          <DeleteAffiliateLinkDialog link={link} />
        </div>
      </CardContent>
    </Card>
  );
}

function DeleteAffiliateLinkDialog({ link }: { link: AffiliateLink }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button type="button" variant="destructive" size="sm">
          <Trash2 className="size-3.5" />
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <Trash2 className="size-5" />
          </AlertDialogMedia>
          <AlertDialogTitle>Delete this affiliate link?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently remove {link.title} from your workspace. This
            action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel type="button">Cancel</AlertDialogCancel>
          <form action={deleteAffiliateLink}>
            <input type="hidden" name="id" value={link.id} />
            <AlertDialogAction type="submit" variant="destructive">
              Delete link
            </AlertDialogAction>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-lg border bg-muted/30 px-2.5 py-2">
      <p className="text-[0.7rem] uppercase text-muted-foreground">{label}</p>
      <p className="truncate text-sm text-foreground">{value}</p>
    </div>
  );
}

function getStatusBadgeVariant(status: AffiliateLink["status"]) {
  if (status === "active") {
    return "default";
  }

  if (status === "inactive") {
    return "secondary";
  }

  return "outline";
}

function getUrlHost(value: string) {
  try {
    return new URL(value).host;
  } catch {
    return value;
  }
}

function formatMoney(value: string | null, currency: string) {
  return value ? `${currency} ${value}` : "Not set";
}

function formatCommission(
  type: string | null,
  value: string | null,
  currency: string
) {
  if (!type && !value) {
    return "Not set";
  }

  if (!value) {
    return type ?? "Not set";
  }

  return type ? `${type} - ${currency} ${value}` : `${currency} ${value}`;
}

function titleCase(value: string) {
  return value.slice(0, 1).toUpperCase() + value.slice(1);
}
