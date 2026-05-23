"use server";

import {
  buildCloudinaryUploadSignature,
  getCloudinaryUploadConfig,
  type CloudinaryUploadSignature,
} from "@/lib/cloudinary";

export async function createCloudinaryUploadSignature(
  subfolder?: string
): Promise<CloudinaryUploadSignature> {
  const config = getCloudinaryUploadConfig();
  const folder = subfolder ? `${config.folder}/${subfolder}` : config.folder;
  const timestamp = Math.round(Date.now() / 1000);
  const signature = buildCloudinaryUploadSignature(
    {
      folder,
      timestamp,
      upload_preset: config.uploadPreset,
    },
    config.apiSecret
  );

  return {
    cloudName: config.cloudName,
    apiKey: config.apiKey,
    folder,
    uploadPreset: config.uploadPreset,
    timestamp,
    signature,
  };
}
