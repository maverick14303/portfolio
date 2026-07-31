import type { NextConfig } from "next";

// STATIC_EXPORT=1 produces a plain static site in out/ for hosts without a
// Next.js runtime (the Cloudflare Pages mirror). Vercel builds without it and
// keeps image optimization. Every route here is already static, so the only
// cost of exporting is unoptimized images — the photos are pre-sized webp.
const staticExport = process.env.STATIC_EXPORT === "1";

const nextConfig: NextConfig = staticExport
  ? { output: "export", images: { unoptimized: true } }
  : {};

export default nextConfig;
