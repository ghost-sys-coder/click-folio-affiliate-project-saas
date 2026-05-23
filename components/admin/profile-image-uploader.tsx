"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { ImagePlus, Loader2, X, Upload } from "lucide-react";

import { createCloudinaryUploadSignature } from "@/actions/cloudinary";
import { Button } from "@/components/ui/button";
import { uploadImageToCloudinary } from "@/lib/cloudinary-upload";

type ProfileImageUploaderProps = {
  label: string;
  value: string;
  onChange: (url: string) => void;
  aspect: "avatar" | "cover";
  subfolder?: string;
};

const maxImageSize = 5 * 1024 * 1024;

export function ProfileImageUploader({
  label,
  value,
  onChange,
  aspect,
  subfolder = "profile-images",
}: ProfileImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    if (file.size > maxImageSize) {
      setError("Images must be smaller than 5MB.");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const signature = await createCloudinaryUploadSignature(subfolder);
      const upload = await uploadImageToCloudinary(file, signature);
      onChange(upload.secureUrl);
    } catch (err) {
      setError("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
      if (event.target) {
        event.target.value = "";
      }
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">{label}</label>
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => onChange("")}
          >
            <X className="mr-2 size-3" />
            Remove
          </Button>
        )}
      </div>

      <div
        className={`relative overflow-hidden border border-border bg-muted/30 transition-all ${
          aspect === "cover"
            ? "aspect-[16/7] w-full rounded-xl"
            : "aspect-square w-32 rounded-full"
        }`}
      >
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt={label} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground">
            <ImagePlus className="size-6 opacity-40" />
            <span className="text-[10px] uppercase tracking-wider font-semibold opacity-60">
              No Image
            </span>
          </div>
        )}

        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm">
            <Loader2 className="size-6 animate-spin text-primary" />
          </div>
        )}

        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity hover:opacity-100 bg-black/20">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="shadow-lg"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
          >
            <Upload className="mr-2 size-3" />
            {value ? "Change" : "Upload"}
          </Button>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {error && <p className="text-xs font-medium text-destructive">{error}</p>}
    </div>
  );
}
