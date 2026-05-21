import test from "node:test";
import assert from "node:assert/strict";

import {
  buildClerkUserDelete,
  buildClerkUserWrite,
} from "../lib/clerk-user-data.ts";

test("buildClerkUserWrite maps Clerk user data for database writes", () => {
  const result = buildClerkUserWrite({
    id: "user_123",
    first_name: "Ada",
    last_name: "Lovelace",
    image_url: "https://example.com/avatar.png",
    primary_email_address_id: "email_primary",
    email_addresses: [
      { id: "email_secondary", email_address: "secondary@example.com" },
      { id: "email_primary", email_address: "ada@example.com" },
    ],
  });

  assert.deepEqual(result, {
    clerkUserId: "user_123",
    email: "ada@example.com",
    firstName: "Ada",
    lastName: "Lovelace",
    imageUrl: "https://example.com/avatar.png",
    isDeleted: false,
    deletedAt: null,
  });
});

test("buildClerkUserWrite falls back to the first email address", () => {
  const result = buildClerkUserWrite({
    id: "user_123",
    email_addresses: [{ id: "email_1", email_address: "first@example.com" }],
  });

  assert.equal(result.email, "first@example.com");
});

test("buildClerkUserWrite rejects Clerk users without an email", () => {
  assert.throws(
    () =>
      buildClerkUserWrite({
        id: "user_123",
        email_addresses: [],
      }),
    /email address/
  );
});

test("buildClerkUserDelete maps Clerk delete data for soft deletion", () => {
  const result = buildClerkUserDelete({ id: "user_123" });

  assert.equal(result.clerkUserId, "user_123");
  assert.equal(result.isDeleted, true);
  assert.ok(result.deletedAt instanceof Date);
});
