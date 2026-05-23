import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { createAffiliateLink } from "@/actions/affiliate-links";
import { AffiliateLinkImportHandler } from "@/components/admin/affiliate-link-import-handler";
import { getAffiliateLinkWorkspaceByClerkUserId } from "@/db/affiliate-links";
import { getDefaultAffiliateLinkValues } from "@/lib/affiliate-links";

export const dynamic = "force-dynamic";

export default async function NewAffiliateLinkPage() {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    redirect("/sign-in?redirect_url=/admin/links/new");
  }

  const workspace = await getAffiliateLinkWorkspaceByClerkUserId(clerkUserId);

  if (!workspace) {
    redirect("/onboarding");
  }

  return (
    <div className="mx-auto grid w-full max-w-4xl gap-5">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          New affiliate link
        </h1>
        <p className="text-sm text-muted-foreground">
          Add one or more offer links to your workspace.
        </p>
      </div>
      <AffiliateLinkImportHandler
        createAction={createAffiliateLink}
        initialValues={getDefaultAffiliateLinkValues(
          workspace.defaultButtonLabel
        )}
      />
    </div>
  );
}
