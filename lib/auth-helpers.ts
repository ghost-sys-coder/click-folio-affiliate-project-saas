import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserByClerkUserId } from "@/db/profiles";

/**
 * Resolves the authenticated local user from Clerk.
 * Redirects to sign-in if not authenticated.
 */
export async function requireAuthenticatedUser() {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    redirect("/sign-in");
  }

  const user = await getUserByClerkUserId(clerkUserId);

  if (!user) {
    // This handles the case where Clerk auth exists but local user record doesn't
    // which shouldn't happen after onboarding, but we handle it safely.
    redirect("/onboarding");
  }

  return user;
}
