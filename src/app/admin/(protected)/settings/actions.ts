"use server";

import { refresh } from "next/cache";
import { saveUploadedImage } from "@/lib/storage";
import { updateHeroImageUrl } from "@/lib/settings";

export async function updateHeroImage(formData: FormData) {
  const file = formData.get("heroImage");
  if (!(file instanceof File) || file.size === 0) return;

  const url = await saveUploadedImage(file);
  await updateHeroImageUrl(url);

  // Without this the settings page would keep showing the old hero photo
  // until the next real navigation — see the comment in
  // admin/(protected)/orders/[id]/actions.ts for why.
  refresh();
}
