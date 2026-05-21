type ClerkEmailAddress = {
  id?: string | null;
  email_address?: string | null;
};

export type ClerkUserWriteSource = {
  id?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  image_url?: string | null;
  primary_email_address_id?: string | null;
  email_addresses?: ClerkEmailAddress[] | null;
};

export type ClerkUserDeleteSource = {
  id?: string | null;
};

export function buildClerkUserWrite(user: ClerkUserWriteSource) {
  const clerkUserId = requireClerkUserId(user);
  const email = getPrimaryEmail(user);

  return {
    clerkUserId,
    email,
    firstName: user.first_name ?? null,
    lastName: user.last_name ?? null,
    imageUrl: user.image_url ?? null,
    isDeleted: false,
    deletedAt: null,
  };
}

export function buildClerkUserDelete(user: ClerkUserDeleteSource) {
  return {
    clerkUserId: requireClerkUserId(user),
    isDeleted: true,
    deletedAt: new Date(),
  };
}

function requireClerkUserId(user: ClerkUserDeleteSource) {
  if (!user.id) {
    throw new Error("Clerk user id is required");
  }

  return user.id;
}

function getPrimaryEmail(user: ClerkUserWriteSource) {
  const emailAddresses = user.email_addresses ?? [];
  const primaryEmail = emailAddresses.find(
    (emailAddress) => emailAddress.id === user.primary_email_address_id
  );
  const email = primaryEmail?.email_address ?? emailAddresses[0]?.email_address;

  if (!email) {
    throw new Error("Clerk user email address is required");
  }

  return email;
}
