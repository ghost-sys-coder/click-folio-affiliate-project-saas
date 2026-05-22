import test from "node:test";
import assert from "node:assert/strict";

import {
  buildCloudinaryUploadSignature,
  getCloudinaryUploadConfig,
} from "../lib/cloudinary.ts";

test("getCloudinaryUploadConfig reads required upload values from env", () => {
  const env = {
    CLOUDINARY_CLOUD_NAME: "demo-cloud",
    CLOUDINARY_API_KEY: "12345",
    CLOUDINARY_API_SECRET: "secret",
    CLOUDINARY_FOLDER_NAME: "clickfolio",
    CLOUDINARY_UPLOAD_PRESET_NAME: "signed-preset",
  };

  assert.deepEqual(getCloudinaryUploadConfig(env), {
    cloudName: "demo-cloud",
    apiKey: "12345",
    apiSecret: "secret",
    folder: "clickfolio",
    uploadPreset: "signed-preset",
  });
});

test("buildCloudinaryUploadSignature creates a stable sha1 signature", () => {
  const signature = buildCloudinaryUploadSignature(
    {
      folder: "clickfolio",
      timestamp: 1710000000,
      upload_preset: "signed-preset",
    },
    "secret"
  );

  assert.equal(signature, "08dfa54dcad7af7dc409943b7081ff0883442948");
});

test("getCloudinaryUploadConfig throws when a required env value is missing", () => {
  assert.throws(
    () =>
      getCloudinaryUploadConfig({
        CLOUDINARY_CLOUD_NAME: "demo-cloud",
      }),
    /Missing Cloudinary upload configuration/
  );
});
