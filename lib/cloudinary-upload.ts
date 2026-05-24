import type { CloudinaryUploadSignature } from "./cloudinary.ts";

export type CloudinaryUploadResult = {
  secureUrl: string;
};

export async function uploadFileToCloudinary(
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

  const resourceType = file.type.startsWith("video/") ? "video" : "image";

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${signature.cloudName}/${resourceType}/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || "Cloudinary upload failed.");
  }

  const payload = (await response.json()) as { secure_url?: string };

  if (!payload.secure_url) {
    throw new Error(`Cloudinary did not return a ${resourceType} URL.`);
  }

  return {
    secureUrl: payload.secure_url,
  };
}

/**
 * @deprecated Use uploadFileToCloudinary instead
 */
export async function uploadImageToCloudinary(
  file: File,
  signature: CloudinaryUploadSignature
): Promise<CloudinaryUploadResult> {
  return uploadFileToCloudinary(file, signature);
}
