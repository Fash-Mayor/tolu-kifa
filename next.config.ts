import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pins the project root explicitly. Without this, Turbopack walks up the
  // folder tree looking for a workspace root and can get confused by an
  // unrelated package.json higher up (e.g. in a OneDrive-synced folder
  // structure like this one) — you'd see a build warning about a
  // "package.json ... outside the current Git repository" without it.
  turbopack: {
    root: __dirname,
  },
  images: {
    // If/when you switch src/lib/storage.ts over to Cloudinary, S3, or any
    // other external image host (see the big comment at the top of that
    // file), add its hostname here — next/image refuses to optimize images
    // from a host that isn't explicitly allow-listed, as a security
    // measure. Local images (from /public, including uploads saved by
    // saveUploadedImage) don't need an entry here since they're same-origin.
    //
    // Example, if you moved to Cloudinary:
    // remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }],
    remotePatterns: [],
  },
};

export default nextConfig;
