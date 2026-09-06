// -----------------------------------------------------------------------------
// Image storage — the ONE place in the app that knows how to save an
// uploaded file somewhere and hand back a public URL for it.
// -----------------------------------------------------------------------------
// Every admin "upload an image" form (products, gallery, consultation
// reference photos) calls `saveUploadedImage()` below and stores the URL it
// returns in the database. No other file touches the filesystem directly.
//
// This uploads to Cloudinary and returns its CDN `secure_url`. Reads config
// from the CLOUDINARY_URL env var (cloudinary://<key>:<secret>@<cloud_name>)
// — the SDK picks that up automatically, no explicit config() call needed.
// See .env.example for how to set it.
// -----------------------------------------------------------------------------

import { v2 as cloudinary } from "cloudinary";
import { randomUUID } from "crypto";

/**
 * Saves an uploaded file (as received from a <form encType="multipart/form-data">
 * via a Server Action's FormData) and returns the URL to use as an <img src>.
 */
export async function saveUploadedImage(file: File): Promise<string> {
  const fileContents = Buffer.from(await file.arrayBuffer());

  const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "tolu-kifa",
        public_id: randomUUID(),
        // Uploads can be a product photo, a gallery photo, or a consultation
        // reference photo — resource_type "auto" lets Cloudinary handle
        // whatever image format shows up without us sniffing it ourselves.
        resource_type: "auto",
      },
      (error, uploadResult) => {
        if (error || !uploadResult) {
          reject(error ?? new Error("Cloudinary upload returned no result"));
          return;
        }
        resolve(uploadResult);
      }
    );
    uploadStream.end(fileContents);
  });

  return result.secure_url;
}
