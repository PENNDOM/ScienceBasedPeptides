import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // Monorepo / multi-lockfile: keep Turbopack rooted in this app so content paths and Tailwind resolve correctly.
  turbopack: {
    root: projectRoot,
  },
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost", pathname: "/**" },
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
    ],
    formats: ["image/webp", "image/avif"],
  },
};

export default nextConfig;
