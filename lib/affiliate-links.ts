import { z } from "zod";

export const affiliateLinkStatuses = ["active", "inactive", "archive"] as const;

export type AffiliateLinkStatus = (typeof affiliateLinkStatuses)[number];

export type AffiliateLinkValues = {
  title: string;
  description: string;
  destinationUrl: string;
  imageUrl: string;
  category: string;
  network: string;
  buttonLabel: string;
  status: AffiliateLinkStatus;
  sortOrder: string;
  commissionType: string;
  commissionValue: string;
  price: string;
  currency: string;
};

export type AffiliateLinkErrors = Partial<
  Record<keyof AffiliateLinkValues | "id", string>
>;

export type AffiliateLinkFormState = {
  errors?: AffiliateLinkErrors;
  message?: string;
  values: AffiliateLinkValues;
};

const optionalText = (maxLength: number) =>
  z
    .string()
    .trim()
    .max(maxLength)
    .transform((value) => value || null);

const optionalDecimal = z
  .string()
  .trim()
  .max(20)
  .transform((value) => value || null)
  .refine((value) => value === null || /^\d+(\.\d{1,2})?$/.test(value), {
    message: "Use a positive amount with up to 2 decimal places.",
  });

const optionalImageUrl = z
  .string()
  .trim()
  .max(500)
  .transform((value) => value || null)
  .refine((value) => value === null || isValidHttpUrl(value), {
    message: "Enter a valid image URL.",
  });

export const affiliateLinkFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required.")
    .max(120, "Keep the title under 120 characters."),
  description: optionalText(300),
  destinationUrl: z
    .string()
    .trim()
    .min(1, "Destination URL is required.")
    .max(500, "Keep the destination URL under 500 characters.")
    .refine(isValidHttpUrl, "Enter a valid URL that starts with http or https."),
  imageUrl: optionalImageUrl,
  category: optionalText(80),
  network: optionalText(80),
  buttonLabel: z
    .string()
    .trim()
    .min(1, "Button label is required.")
    .max(32, "Keep the button label under 32 characters."),
  status: z.enum(affiliateLinkStatuses),
  sortOrder: z.coerce
    .number()
    .int("Sort order must be a whole number.")
    .min(0, "Sort order cannot be negative.")
    .max(9999, "Sort order is too large."),
  commissionType: optionalText(40),
  commissionValue: optionalDecimal,
  price: optionalDecimal,
  currency: z
    .string()
    .trim()
    .toUpperCase()
    .length(3, "Use a 3-letter currency code."),
});

export const affiliateLinkIdSchema = z.object({
  id: z.string().uuid("Invalid link id."),
});

export type ValidAffiliateLinkInput = z.infer<typeof affiliateLinkFormSchema>;

export function getDefaultAffiliateLinkValues(
  defaultButtonLabel = "View Deal"
): AffiliateLinkValues {
  return {
    title: "",
    description: "",
    destinationUrl: "",
    imageUrl: "",
    category: "",
    network: "",
    buttonLabel: defaultButtonLabel || "View Deal",
    status: "active",
    sortOrder: "0",
    commissionType: "",
    commissionValue: "",
    price: "",
    currency: "USD",
  };
}

export function getAffiliateLinkValuesFromFormData(
  formData: FormData
): AffiliateLinkValues {
  return {
    title: readFormValue(formData, "title"),
    description: readFormValue(formData, "description"),
    destinationUrl: readFormValue(formData, "destinationUrl"),
    imageUrl: readFormValue(formData, "imageUrl"),
    category: readFormValue(formData, "category"),
    network: readFormValue(formData, "network"),
    buttonLabel: readFormValue(formData, "buttonLabel"),
    status: normalizeStatus(readFormValue(formData, "status")),
    sortOrder: readFormValue(formData, "sortOrder") || "0",
    commissionType: readFormValue(formData, "commissionType"),
    commissionValue: readFormValue(formData, "commissionValue"),
    price: readFormValue(formData, "price"),
    currency: readFormValue(formData, "currency") || "USD",
  };
}

export function validateAffiliateLinkForm(formData: FormData) {
  const values = getAffiliateLinkValuesFromFormData(formData);
  const result = affiliateLinkFormSchema.safeParse(values);

  if (!result.success) {
    return {
      ok: false,
      errors: flattenFieldErrors(result.error.flatten().fieldErrors),
      values,
    } as const;
  }

  return {
    ok: true,
    data: result.data,
    values,
  } as const;
}

export function validateBulkAffiliateLinks(links: AffiliateLinkValues[]) {
  const results = links.map((values) => {
    const result = affiliateLinkFormSchema.safeParse(values);
    return {
      values,
      isValid: result.success,
      data: result.success ? result.data : null,
      errors: result.success ? {} : flattenFieldErrors(result.error.flatten().fieldErrors),
    };
  });

  const allValid = results.every((r) => r.isValid);
  const validData = results.filter((r) => r.isValid).map((r) => r.data as ValidAffiliateLinkInput);

  return {
    allValid,
    results,
    validData,
  };
}

export function affiliateLinkToFormValues(link: {
  title: string;
  description: string | null;
  destinationUrl: string;
  imageUrl: string | null;
  category: string | null;
  network: string | null;
  buttonLabel: string;
  status: AffiliateLinkStatus;
  sortOrder: number;
  commissionType: string | null;
  commissionValue: string | null;
  price: string | null;
  currency: string;
}): AffiliateLinkValues {
  return {
    title: link.title,
    description: link.description ?? "",
    destinationUrl: link.destinationUrl,
    imageUrl: link.imageUrl ?? "",
    category: link.category ?? "",
    network: link.network ?? "",
    buttonLabel: link.buttonLabel,
    status: link.status,
    sortOrder: String(link.sortOrder),
    commissionType: link.commissionType ?? "",
    commissionValue: link.commissionValue ?? "",
    price: link.price ?? "",
    currency: link.currency,
  };
}

function flattenFieldErrors(
  fieldErrors: Partial<Record<keyof AffiliateLinkValues, string[]>>
): AffiliateLinkErrors {
  return Object.fromEntries(
    Object.entries(fieldErrors).map(([field, errors]) => [field, errors?.[0]])
  ) as AffiliateLinkErrors;
}

function readFormValue(formData: FormData, key: keyof AffiliateLinkValues) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function normalizeStatus(value: string): AffiliateLinkStatus {
  return affiliateLinkStatuses.includes(value as AffiliateLinkStatus)
    ? (value as AffiliateLinkStatus)
    : "active";
}

function isValidHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}
