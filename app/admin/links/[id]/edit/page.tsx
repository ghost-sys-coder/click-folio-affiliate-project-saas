import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";

import { updateAffiliateLink } from "@/actions/affiliate-links";
import { AffiliateLinkForm } from "@/components/admin/affiliate-link-form";
import {
  getAffiliateLinkForWorkspace,
  getAffiliateLinkWorkspaceByClerkUserId,
} from "@/db/affiliate-links";
import {
  affiliateLinkIdSchema,
  affiliateLinkToFormValues,
} from "@/lib/affiliate-links";

export const dynamic = "force-dynamic";

export default async function EditAffiliateLinkPage({
  params,
}: PageProps<"/admin/links/[id]/edit">) {
  const { id } = await params;
  const idValidation = affiliateLinkIdSchema.safeParse({ id });

  if (!idValidation.success) {
    notFound();
  }

  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    redirect("/sign-in?redirect_url=/admin/links");
  }

  const workspace = await getAffiliateLinkWorkspaceByClerkUserId(clerkUserId);

  if (!workspace) {
    redirect("/onboarding");
  }

  const link = await getAffiliateLinkForWorkspace(
    workspace.userId,
    idValidation.data.id
  );

  if (!link) {
    notFound();
  }

  return (
    <div className="mx-auto grid w-full max-w-4xl gap-5">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Edit affiliate link
        </h1>
        <p className="text-sm text-muted-foreground">
          Update offer details, status, and ordering for this workspace link.
        </p>
      </div>
      <AffiliateLinkForm
        action={updateAffiliateLink.bind(null, link.id)}
        initialValues={affiliateLinkToFormValues(link)}
        submitLabel="Save changes"
        title={link.title}
      />
    </div>
  );
}
