"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";

import { createCloudinaryUploadSignature } from "@/actions/cloudinary";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { uploadImageToCloudinary } from "@/lib/cloudinary-upload";
import { Input } from "../ui/input";

type ImageUploaderProps = {
  name: "avatarUrl" | "coverImageUrl";
  label: string;
  description: string;
  initialUrl: string;
  error?: string;
  aspect: "avatar" | "cover";
};

const maxImageSize = 5 * 1024 * 1024;

export function ImageUploader({
  name,
  label,
  description,
  initialUrl,
  error,
  aspect,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [imageUrl, setImageUrl] = useState(initialUrl);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setUploadError("Choose an image file.");
      return;
    }

    if (file.size > maxImageSize) {
      setUploadError("Keep uploads under 5 MB.");
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      const signature = await createCloudinaryUploadSignature();
      const upload = await uploadImageToCloudinary(file, signature);
      setImageUrl(upload.secureUrl);
    } catch {
      setUploadError("Upload failed. Please try another image.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  return (
    <Field>
      <FieldLabel>{label}</FieldLabel>
      <input type="hidden" name={name} value={imageUrl} />
      <div
        className={
          aspect === "cover"
            ? "relative flex aspect-16/7 overflow-hidden rounded-lg border border-border bg-surface-soft"
            : "relative flex aspect-square w-32 overflow-hidden rounded-full border border-border bg-surface-soft"
        }
      >
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <ImagePlus className="size-6" />
          </div>
        )}
        {uploading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-background/70">
            <Loader2 className="size-5 animate-spin text-primary" />
          </div>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          <ImagePlus />
          Upload
        </Button>
        {imageUrl ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={uploading}
            onClick={() => setImageUrl("")}
          >
            <X />
            Remove
          </Button>
        ) : null}
      </div>
      <Input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={handleFileChange}
      />
      <FieldDescription>{description}</FieldDescription>
      <FieldError>{uploadError ?? error}</FieldError>
    </Field>
  );
}
