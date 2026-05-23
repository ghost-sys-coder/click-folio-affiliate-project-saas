"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { Loader2, Upload } from "lucide-react";

import { createCloudinaryUploadSignature } from "@/actions/cloudinary";
import { Button } from "@/components/ui/button";
import { uploadImageToCloudinary } from "@/lib/cloudinary-upload";

type ProductImageUploaderProps = {
  onUpload: (url: string) => void;
  error?: string;
};

const maxImageSize = 5 * 1024 * 1024;

export function ProductImageUploader({
  onUpload,
  error,
}: ProductImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
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
      // Save images in the link-images subfolder
      const signature = await createCloudinaryUploadSignature("link-images");
      const upload = await uploadImageToCloudinary(file, signature);
      onUpload(upload.secureUrl);
    } catch {
      setUploadError("Upload failed. Please try another image.");
    } finally {
      setUploading(false);
      if (event.target) {
        event.target.value = "";
      }
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-10"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
      >
        {uploading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Upload className="size-4" />
        )}
        {uploading ? "Uploading..." : "Upload Image"}
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      {uploadError || error ? (
        <p className="text-[0.8rem] font-medium text-destructive">
          {uploadError ?? error}
        </p>
      ) : null}
    </div>
  );
}
