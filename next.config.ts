import type { NextConfig } from "next";

// Static export: `next build` writes plain HTML/JS/CSS to `out/`, which is uploaded to Hostinger.
// Cache Components needs a Node server, so it stays off here.
const nextConfig: NextConfig = {
  output: "export",
  // /plan -> /plan/index.html so Apache serves every page without rewrites.
  trailingSlash: true,
  images: { unoptimized: true },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
