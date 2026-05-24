"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { Loader2, Upload, Video, Image as ImageIcon, X } from "lucide-react";

import { createCloudinaryUploadSignature } from "@/actions/cloudinary";
import { Button } from "@/components/ui/button";
import { uploadFileToCloudinary } from "@/lib/cloudinary-upload";
import { Input } from "../ui/input";

type LandingPageMediaUploaderProps = {
  type: "image" | "video";
  onUpload: (url: string) => void;
  error?: string;
};

const maxImageSize = 5 * 1024 * 1024; // 5 MB
const maxVideoSize = 20 * 1024 * 1024; // 20 MB

export function LandingPageMediaUploader({
  type,
  onUpload,
  error,
}: LandingPageMediaUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const maxSize = type === "video" ? maxVideoSize : maxImageSize;
    const maxSizeLabel = type === "video" ? "20 MB" : "5 MB";

    if (type === "image" && !file.type.startsWith("image/")) {
      setUploadError("Choose an image file.");
      return;
    }

    if (type === "video" && !file.type.startsWith("video/")) {
      setUploadError("Choose a video file.");
      return;
    }

    if (file.size > maxSize) {
      setUploadError(`Keep uploads under ${maxSizeLabel}.`);
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      // Save in organized subfolders
      const subfolder = type === "video" ? "landing-page-videos" : "landing-page-images";
      const signature = await createCloudinaryUploadSignature(subfolder);
      const upload = await uploadFileToCloudinary(file, signature);
      onUpload(upload.secureUrl);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed.";
      setUploadError(message);
    } finally {
      setUploading(false);
      if (event.target) {
        event.target.value = "";
      }
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-9 w-full justify-start"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
      >
        {uploading ? (
          <Loader2 className="mr-2 size-4 animate-spin" />
        ) : type === "video" ? (
          <Video className="mr-2 size-4" />
        ) : (
          <ImageIcon className="mr-2 size-4" />
        )}
        {uploading ? "Uploading..." : `Upload ${type === "video" ? "Video" : "Image"}`}
      </Button>
      <Input
        ref={inputRef}
        type="file"
        accept={type === "video" ? "video/*" : "image/*"}
        className="hidden"
        onChange={handleFileChange}
      />
      {uploadError || error ? (
        <p className="text-[0.7rem] font-medium text-destructive">
          {uploadError ?? error}
        </p>
      ) : null}
    </div>
  );
}
