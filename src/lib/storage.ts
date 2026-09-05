// -----------------------------------------------------------------------------
// Image storage — the ONE place in the app that knows how to save an
// uploaded file somewhere and hand back a public URL for it.
// -----------------------------------------------------------------------------
// Every admin "upload an image" form (products, gallery, consultation
// reference photos) calls `saveUploadedImage()` below and stores the URL it
// returns in the database. No other file touches the filesystem directly.
//
// Right now this saves files onto local disk, inside /public/uploads/.
// That's genuinely fine for local development and for hosting on a normal
// always-on Node server (a VPS, Railway, Render, etc.).
//
// ⚠️ IMPORTANT if you deploy to Vercel (or any serverless host): serverless
// functions get a fresh, READ-ONLY filesystem on every request, so anything
// written to disk here would vanish immediately. Before going live on a
// platform like that, replace the inside of `saveUploadedImage` with a call
// to an image host such as Cloudinary or S3 (both have a generous free
// tier and a simple upload API). Because every caller only ever imports this
// one function, that's the ONLY file you'd need to change — nothing else in
// the app needs to know or care where images physically live.
// -----------------------------------------------------------------------------

import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

/**
 * Saves an uploaded file (as received from a <form encType="multipart/form-data">
 * via a Server Action's FormData) and returns the URL to use as an <img src>.
 */
export async function saveUploadedImage(file: File): Promise<string> {
  // Make sure the folder exists — it's git-ignored (see .gitignore) so it
  // won't exist yet on a freshly cloned copy of the project.
  await mkdir(UPLOAD_DIR, { recursive: true });

  const originalExtension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const safeFilename = `${randomUUID()}.${originalExtension}`;

  const fileContents = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOAD_DIR, safeFilename), fileContents);

  // Anything inside /public is served by Next.js at the matching URL path,
  // so this is exactly the address the browser will load the image from.
  return `/uploads/${safeFilename}`;
}
