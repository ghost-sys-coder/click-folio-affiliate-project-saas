import type { NextConfig } from "next";

// Vercel CLI 54.3.0 / @vercel/next 4.17.3 can crash before compilation when
// Preview Comments injection runs through Next 16.2.x's adapter modifyConfig
// hook, because that hook does not provide the projectDir value the Vercel
// adapter expects. Disable only that injection path; the app build/deploy still
// uses the Vercel adapter normally.
if (
  process.env.VERCEL === "1" &&
  process.env.VERCEL_PREVIEW_COMMENTS_ENABLED === "1"
) {
  process.env.VERCEL_PREVIEW_COMMENTS_ENABLED = "0";
}

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
