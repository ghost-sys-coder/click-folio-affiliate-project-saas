"use client";

import Link from "next/link";
import { useActionState } from "react";
import { ExternalLink, Save } from "lucide-react";

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
  const values = state.values;

  return (
    <form action={formAction} className="grid gap-4">
      <Card className="border-border/70">
        <CardHeader className="border-b border-border/70">
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <FieldGroup key={JSON.stringify(values)}>
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
                  defaultValue={values.title}
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
                  defaultValue={values.destinationUrl}
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
                defaultValue={values.description}
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
                <Input
                  id="imageUrl"
                  name="imageUrl"
                  type="url"
                  defaultValue={values.imageUrl}
                  aria-invalid={Boolean(state.errors?.imageUrl)}
                  placeholder="https://example.com/product.png"
                />
                <FieldError>{state.errors?.imageUrl}</FieldError>
              </Field>

              <Field>
                <FieldLabel htmlFor="buttonLabel">Button label</FieldLabel>
                <Input
                  id="buttonLabel"
                  name="buttonLabel"
                  defaultValue={values.buttonLabel}
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
                  defaultValue={values.category}
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
                  defaultValue={values.network}
                  aria-invalid={Boolean(state.errors?.network)}
                  placeholder="Impact, PartnerStack"
                />
                <FieldError>{state.errors?.network}</FieldError>
              </Field>

              <Field data-invalid={state.errors?.status ? true : undefined}>
                <FieldLabel htmlFor="status">Status</FieldLabel>
                <Select
                  name="status"
                  defaultValue={values.status}
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
                  defaultValue={values.commissionType}
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
                  defaultValue={values.commissionValue}
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
                  defaultValue={values.price}
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
                  defaultValue={values.currency}
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
                defaultValue={values.sortOrder}
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
