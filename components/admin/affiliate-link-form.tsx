"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { ExternalLink, Save, X } from "lucide-react";

import { ProductImageUploader } from "@/components/admin/product-image-uploader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  affiliateLinkStatuses,
  type AffiliateLinkFormState,
  type AffiliateLinkValues,
} from "@/lib/affiliate-links";

type AffiliateLinkFormAction = (
  state: AffiliateLinkFormState,
  formData: FormData
) => Promise<AffiliateLinkFormState>;

type AffiliateLinkFormProps = {
  action: AffiliateLinkFormAction;
  enableJsonImport?: boolean;
  initialValues: AffiliateLinkValues;
  submitLabel: string;
  title: string;
};

export function AffiliateLinkForm({
  action,
  initialValues,
  submitLabel,
  title,
}: AffiliateLinkFormProps) {
  const [state, formAction, pending] = useActionState(action, {
    values: initialValues,
  });
  const [values, setValues] = useState(initialValues);

  // Update local values if initialValues change (e.g. from an import)
  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  function updateValue(field: keyof AffiliateLinkValues, value: string) {
    setValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));
  }

  return (
    <form action={formAction} className="grid gap-4">
      <Card className="border-border/70">
        <CardHeader className="border-b border-border/70">
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            {state.message ? (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {state.message}
              </div>
            ) : null}

            <div className="grid gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="title">Title</FieldLabel>
                <Input
                  id="title"
                  name="title"
                  value={values.title}
                  onChange={(event) => updateValue("title", event.target.value)}
                  aria-invalid={Boolean(state.errors?.title)}
                  placeholder="Creator tool bundle"
                />
                <FieldError>{state.errors?.title}</FieldError>
              </Field>

              <Field>
                <FieldLabel htmlFor="destinationUrl">
                  Destination URL
                </FieldLabel>
                <Input
                  id="destinationUrl"
                  name="destinationUrl"
                  type="url"
                  value={values.destinationUrl}
                  onChange={(event) =>
                    updateValue("destinationUrl", event.target.value)
                  }
                  aria-invalid={Boolean(state.errors?.destinationUrl)}
                  placeholder="https://example.com/deal"
                />
                <FieldError>{state.errors?.destinationUrl}</FieldError>
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="description">Description</FieldLabel>
              <Textarea
                id="description"
                name="description"
                value={values.description}
                onChange={(event) =>
                  updateValue("description", event.target.value)
                }
                aria-invalid={Boolean(state.errors?.description)}
                placeholder="Short context for why this offer is useful."
              />
              <FieldDescription>
                Optional. Keep it concise for future public profile rendering.
              </FieldDescription>
              <FieldError>{state.errors?.description}</FieldError>
            </Field>

            <div className="grid gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="imageUrl">Image URL</FieldLabel>
                <div className="flex flex-col gap-3">
                  {values.imageUrl ? (
                    <div className="group relative aspect-square w-24 overflow-hidden rounded-lg border border-border bg-muted/30">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={values.imageUrl}
                        alt="Product preview"
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://placehold.co/400x400?text=Invalid+Image";
                        }}
                      />
                      <button
                        type="button"
                        className="absolute right-1 top-1 rounded-full bg-destructive p-1 text-destructive-foreground opacity-0 shadow-sm transition-opacity hover:bg-destructive/90 group-hover:opacity-100"
                        onClick={() => updateValue("imageUrl", "")}
                        aria-label="Remove image"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  ) : null}
                  <div className="flex flex-col gap-2">
                    <Input
                      id="imageUrl"
                      name="imageUrl"
                      type="url"
                      value={values.imageUrl}
                      onChange={(event) =>
                        updateValue("imageUrl", event.target.value)
                      }
                      aria-invalid={Boolean(state.errors?.imageUrl)}
                      placeholder="https://example.com/product.png"
                    />
                    <ProductImageUploader
                      onUpload={(url) => updateValue("imageUrl", url)}
                      error={state.errors?.imageUrl}
                    />
                  </div>
                </div>
                <FieldError>{state.errors?.imageUrl}</FieldError>
              </Field>

              <Field>
                <FieldLabel htmlFor="buttonLabel">Button label</FieldLabel>
                <Input
                  id="buttonLabel"
                  name="buttonLabel"
                  value={values.buttonLabel}
                  onChange={(event) =>
                    updateValue("buttonLabel", event.target.value)
                  }
                  aria-invalid={Boolean(state.errors?.buttonLabel)}
                  placeholder="View Deal"
                />
                <FieldError>{state.errors?.buttonLabel}</FieldError>
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Field>
                <FieldLabel htmlFor="category">Category</FieldLabel>
                <Input
                  id="category"
                  name="category"
                  value={values.category}
                  onChange={(event) =>
                    updateValue("category", event.target.value)
                  }
                  aria-invalid={Boolean(state.errors?.category)}
                  placeholder="Creator tools"
                />
                <FieldError>{state.errors?.category}</FieldError>
              </Field>

              <Field>
                <FieldLabel htmlFor="network">Network</FieldLabel>
                <Input
                  id="network"
                  name="network"
                  value={values.network}
                  onChange={(event) =>
                    updateValue("network", event.target.value)
                  }
                  aria-invalid={Boolean(state.errors?.network)}
                  placeholder="Impact, PartnerStack"
                />
                <FieldError>{state.errors?.network}</FieldError>
              </Field>

              <Field data-invalid={state.errors?.status ? true : undefined}>
                <FieldLabel htmlFor="status">Status</FieldLabel>
                <Select
                  name="status"
                  value={values.status}
                  onValueChange={(value) => updateValue("status", value)}
                >
                  <SelectTrigger
                    id="status"
                    className="w-full"
                    aria-invalid={Boolean(state.errors?.status)}
                  >
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {affiliateLinkStatuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status === "archive" ? "Archived" : titleCase(status)}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FieldError>{state.errors?.status}</FieldError>
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <Field>
                <FieldLabel htmlFor="commissionType">
                  Commission type
                </FieldLabel>
                <Input
                  id="commissionType"
                  name="commissionType"
                  value={values.commissionType}
                  onChange={(event) =>
                    updateValue("commissionType", event.target.value)
                  }
                  aria-invalid={Boolean(state.errors?.commissionType)}
                  placeholder="CPA, recurring"
                />
                <FieldError>{state.errors?.commissionType}</FieldError>
              </Field>

              <Field>
                <FieldLabel htmlFor="commissionValue">
                  Commission value
                </FieldLabel>
                <Input
                  id="commissionValue"
                  name="commissionValue"
                  inputMode="decimal"
                  value={values.commissionValue}
                  onChange={(event) =>
                    updateValue("commissionValue", event.target.value)
                  }
                  aria-invalid={Boolean(state.errors?.commissionValue)}
                  placeholder="25.00"
                />
                <FieldError>{state.errors?.commissionValue}</FieldError>
              </Field>

              <Field>
                <FieldLabel htmlFor="price">Price</FieldLabel>
                <Input
                  id="price"
                  name="price"
                  inputMode="decimal"
                  value={values.price}
                  onChange={(event) => updateValue("price", event.target.value)}
                  aria-invalid={Boolean(state.errors?.price)}
                  placeholder="99.00"
                />
                <FieldError>{state.errors?.price}</FieldError>
              </Field>

              <Field>
                <FieldLabel htmlFor="currency">Currency</FieldLabel>
                <Input
                  id="currency"
                  name="currency"
                  value={values.currency}
                  onChange={(event) =>
                    updateValue("currency", event.target.value)
                  }
                  aria-invalid={Boolean(state.errors?.currency)}
                  placeholder="USD"
                />
                <FieldError>{state.errors?.currency}</FieldError>
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="sortOrder">Sort order</FieldLabel>
              <Input
                id="sortOrder"
                name="sortOrder"
                type="number"
                min={0}
                step={1}
                value={values.sortOrder}
                onChange={(event) =>
                  updateValue("sortOrder", event.target.value)
                }
                aria-invalid={Boolean(state.errors?.sortOrder)}
              />
              <FieldDescription>
                Lower numbers appear first in your admin list.
              </FieldDescription>
              <FieldError>{state.errors?.sortOrder}</FieldError>
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button asChild variant="outline">
          <Link href="/admin/links">Cancel</Link>
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? (
            <>
              <ExternalLink className="size-4 animate-pulse" />
              Saving
            </>
          ) : (
            <>
              <Save className="size-4" />
              {submitLabel}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

function titleCase(value: string) {
  return value.slice(0, 1).toUpperCase() + value.slice(1);
}
