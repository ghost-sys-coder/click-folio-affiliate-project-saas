import { createHash } from "node:crypto";

export type CloudinaryUploadConfig = {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
  folder: string;
  uploadPreset: string;
};

export type CloudinaryUploadSignature = {
  cloudName: string;
  apiKey: string;
  folder: string;
  uploadPreset: string;
  timestamp: number;
  signature: string;
};

export type CloudinarySignatureParams = Record<
  string,
  string | number | undefined
>;

type CloudinaryEnv = Record<string, string | undefined>;

export function getCloudinaryUploadConfig(
  env: CloudinaryEnv = process.env as CloudinaryEnv
): CloudinaryUploadConfig {
  const cloudName = env.CLOUDINARY_CLOUD_NAME;
  const apiKey = env.CLOUDINARY_API_KEY;
  const apiSecret = env.CLOUDINARY_API_SECRET;
  const folder = env.CLOUDINARY_FOLDER_NAME;
  const uploadPreset = env.CLOUDINARY_UPLOAD_PRESET_NAME;

  if (!cloudName || !apiKey || !apiSecret || !folder || !uploadPreset) {
    throw new Error("Missing Cloudinary upload configuration.");
  }

  return {
    cloudName,
    apiKey,
    apiSecret,
    folder,
    uploadPreset,
  };
}

export function buildCloudinaryUploadSignature(
  params: CloudinarySignatureParams,
  apiSecret: string
) {
  const payload = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== "")
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  return createHash("sha1")
    .update(`${payload}${apiSecret}`)
    .digest("hex");
}
