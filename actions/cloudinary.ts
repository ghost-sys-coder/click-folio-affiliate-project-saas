"use server";

import {
  buildCloudinaryUploadSignature,
  getCloudinaryUploadConfig,
  type CloudinaryUploadSignature,
} from "@/lib/cloudinary";

export async function createCloudinaryUploadSignature(): Promise<CloudinaryUploadSignature> {
  const config = getCloudinaryUploadConfig();
  const timestamp = Math.round(Date.now() / 1000);
  const signature = buildCloudinaryUploadSignature(
    {
      folder: config.folder,
      timestamp,
      upload_preset: config.uploadPreset,
    },
    config.apiSecret
  );

  return {
    cloudName: config.cloudName,
    apiKey: config.apiKey,
    folder: config.folder,
    uploadPreset: config.uploadPreset,
    timestamp,
    signature,
  };
}
