import { eq } from "drizzle-orm";

import { getDb } from "@/db/drizzle";
import { usersTable } from "@/db/schema";
import {
  buildClerkUserDelete,
  buildClerkUserWrite,
  type ClerkUserDeleteSource,
  type ClerkUserWriteSource,
} from "@/lib/clerk-user-data";

export async function upsertClerkUser(user: ClerkUserWriteSource) {
  const data = buildClerkUserWrite(user);
  const now = new Date();

  await getDb()
    .insert(usersTable)
    .values({
      ...data,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: usersTable.clerkUserId,
      set: {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        imageUrl: data.imageUrl,
        isDeleted: false,
        deletedAt: null,
        updatedAt: now,
      },
    });
}

export async function updateClerkUser(user: ClerkUserWriteSource) {
  const data = buildClerkUserWrite(user);

  await getDb()
    .update(usersTable)
    .set({
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      imageUrl: data.imageUrl,
      isDeleted: false,
      deletedAt: null,
      updatedAt: new Date(),
    })
    .where(eq(usersTable.clerkUserId, data.clerkUserId));
}

export async function softDeleteClerkUser(user: ClerkUserDeleteSource) {
  const data = buildClerkUserDelete(user);

  await getDb()
    .update(usersTable)
    .set({
      isDeleted: data.isDeleted,
      deletedAt: data.deletedAt,
      updatedAt: data.deletedAt,
    })
    .where(eq(usersTable.clerkUserId, data.clerkUserId));
}
