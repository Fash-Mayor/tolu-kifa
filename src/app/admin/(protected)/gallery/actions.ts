"use server";

import { prisma } from "@/lib/prisma";
import { saveUploadedImage } from "@/lib/storage";

export async function uploadGalleryImages(formData: FormData) {
  const files = formData
    .getAll("images")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);

  if (files.length === 0) return;

  const caption = String(formData.get("caption") ?? "").trim() || null;
  const collectionTag = String(formData.get("collectionTag") ?? "").trim() || null;

  // New photos go to the end of the current order.
  const highestSortOrder = await prisma.galleryImage.aggregate({ _max: { sortOrder: true } });
  let nextSortOrder = (highestSortOrder._max.sortOrder ?? -1) + 1;

  for (const file of files) {
    const url = await saveUploadedImage(file);
    await prisma.galleryImage.create({
      data: { url, caption, collectionTag, sortOrder: nextSortOrder },
    });
    nextSortOrder += 1;
  }
}

export async function deleteGalleryImage(imageId: string) {
  await prisma.galleryImage.delete({ where: { id: imageId } });
}

/**
 * Swaps this image's position with its neighbor above/below in the
 * gallery order — the simplest possible "reordering" UI: no drag-and-drop
 * library needed, just two buttons per image.
 */
export async function moveGalleryImage(imageId: string, direction: "up" | "down") {
  const images = await prisma.galleryImage.findMany({ orderBy: { sortOrder: "asc" } });
  const currentIndex = images.findIndex((image) => image.id === imageId);
  if (currentIndex === -1) return;

  const swapWithIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
  if (swapWithIndex < 0 || swapWithIndex >= images.length) return; // already at the start/end

  const current = images[currentIndex];
  const neighbor = images[swapWithIndex];

  await prisma.$transaction([
    prisma.galleryImage.update({ where: { id: current.id }, data: { sortOrder: neighbor.sortOrder } }),
    prisma.galleryImage.update({ where: { id: neighbor.id }, data: { sortOrder: current.sortOrder } }),
  ]);
}
