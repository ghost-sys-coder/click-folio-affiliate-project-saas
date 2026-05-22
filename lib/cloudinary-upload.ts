import type { CloudinaryUploadSignature } from "./cloudinary.ts";

export type CloudinaryUploadResult = {
  secureUrl: string;
};

export async function uploadImageToCloudinary(
  file: File,
  signature: CloudinaryUploadSignature
): Promise<CloudinaryUploadResult> {
  const formData = new FormData();

  formData.set("file", file);
  formData.set("api_key", signature.apiKey);
  formData.set("timestamp", String(signature.timestamp));
  formData.set("signature", signature.signature);
  formData.set("folder", signature.folder);
  formData.set("upload_preset", signature.uploadPreset);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${signature.cloudName}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error("Cloudinary upload failed.");
  }

  const payload = (await response.json()) as { secure_url?: string };

  if (!payload.secure_url) {
    throw new Error("Cloudinary did not return an image URL.");
  }

  return {
    secureUrl: payload.secure_url,
  };
}
