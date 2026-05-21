import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import {
  softDeleteClerkUser,
  updateClerkUser,
  upsertClerkUser,
} from "@/db/clerk-users";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    return new Response("Missing Clerk webhook secret", { status: 500 });
  }

  const headerPayload = await headers();

  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response("Missing Svix headers", { status: 400 });
  }

  const body = await req.text();

  const webhook = new Webhook(WEBHOOK_SECRET);

  let event: WebhookEvent;

  try {
    event = webhook.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as WebhookEvent;
  } catch (error) {
    console.error("Invalid Clerk webhook signature", error);

    return new Response("Invalid webhook signature", { status: 400 });
  }

  const eventType = event.type;

  try {
    if (eventType === "user.created") {
      await upsertClerkUser(event.data);
    }

    if (eventType === "user.updated") {
      await updateClerkUser(event.data);
    }

    if (eventType === "user.deleted") {
      await softDeleteClerkUser(event.data);
    }
  } catch (error) {
    console.error("Clerk webhook database sync failed", error);

    return new Response("Webhook database sync failed", { status: 500 });
  }

  return new Response("Webhook received", { status: 200 });
}
