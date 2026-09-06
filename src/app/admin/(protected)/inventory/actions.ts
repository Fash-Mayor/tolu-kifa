"use server";

import { redirect } from "next/navigation";
import { refresh } from "next/cache";
import { prisma } from "@/lib/prisma";
import { saveUploadedImage } from "@/lib/storage";
import { toMinorUnits } from "@/lib/currency";
import { STANDARD_SIZE_LABELS } from "@/lib/constants";
import { SizeChartCategory } from "@prisma/client";

export type ProductFormState = {
  status: "idle" | "error";
  message: string;
};

/** Turns "Adaeze Wrap Dress" into "adaeze-wrap-dress" for use in the product URL. */
function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-+|-+$)/g, "");
}

/** Reads the shared "name / description / price / category / ..." fields any product form submits. */
function readCommonFields(formData: FormData) {
  return {
    name: String(formData.get("name") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    priceMajorUnits: Number(formData.get("price")),
    category: String(formData.get("category") ?? "").trim(),
    sizeChartCategory: formData.get("sizeChartCategory") as SizeChartCategory,
    isFeatured: formData.get("isFeatured") === "on",
    isActive: formData.get("isActive") === "on",
  };
}

/** Reads stock-per-size fields (named "stock-6", "stock-8", ...) into ProductSize rows. */
function readSizeStocks(formData: FormData) {
  return STANDARD_SIZE_LABELS.map((label) => ({
    label,
    stock: Math.max(0, Number(formData.get(`stock-${label}`)) || 0),
  }));
}

export async function createProduct(
  _previousState: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  const fields = readCommonFields(formData);

  if (!fields.name || !fields.description || !fields.category || Number.isNaN(fields.priceMajorUnits)) {
    return { status: "error", message: "Please fill in all required fields." };
  }

  const slug = slugify(fields.name);
  const existingProduct = await prisma.product.findUnique({ where: { slug } });
  if (existingProduct) {
    return {
      status: "error",
      message: `A product already exists with a very similar name (URL would be "/shop/${slug}"). Please tweak the name slightly.`,
    };
  }

  const imageFiles = formData
    .getAll("images")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);
  const imageUrls = await Promise.all(imageFiles.map((file) => saveUploadedImage(file)));
  // If the founder hasn't uploaded a photo yet, fall back to a placeholder
  // rather than leaving the product with no image at all.
  if (imageUrls.length === 0) imageUrls.push("/placeholders/product-1.svg");

  await prisma.product.create({
    data: {
      name: fields.name,
      slug,
      description: fields.description,
      priceInMinorUnits: toMinorUnits(fields.priceMajorUnits),
      category: fields.category,
      sizeChartCategory: fields.sizeChartCategory,
      isFeatured: fields.isFeatured,
      isActive: fields.isActive,
      sizes: { create: readSizeStocks(formData) },
      images: { create: imageUrls.map((url, index) => ({ url, sortOrder: index })) },
    },
  });

  redirect("/admin/inventory");
}

export async function updateProduct(productId: string, formData: FormData) {
  const fields = readCommonFields(formData);

  await prisma.$transaction([
    prisma.product.update({
      where: { id: productId },
      data: {
        name: fields.name,
        description: fields.description,
        priceInMinorUnits: toMinorUnits(fields.priceMajorUnits),
        category: fields.category,
        sizeChartCategory: fields.sizeChartCategory,
        isFeatured: fields.isFeatured,
        isActive: fields.isActive,
      },
    }),
    // Simplest correct way to update the size/stock rows: replace them all.
    // There are only ever 9 of them (see STANDARD_SIZE_LABELS), so this is
    // cheap, and it avoids the diffing logic a "smart" update would need.
    prisma.productSize.deleteMany({ where: { productId } }),
    prisma.productSize.createMany({
      data: readSizeStocks(formData).map((size) => ({ ...size, productId })),
    }),
  ]);

  // New photos uploaded from the edit page get appended after existing
  // ones. Deleting a photo is handled separately by deleteProductImage
  // below, so this action only ever adds.
  const imageFiles = formData
    .getAll("images")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);

  if (imageFiles.length > 0) {
    const existingImageCount = await prisma.productImage.count({ where: { productId } });
    const imageUrls = await Promise.all(imageFiles.map((file) => saveUploadedImage(file)));
    await prisma.productImage.createMany({
      data: imageUrls.map((url, index) => ({
        productId,
        url,
        sortOrder: existingImageCount + index,
      })),
    });
  }

  // Without this, the edit page stays on the pre-save values until the
  // next real navigation — see the comment in orders/[id]/actions.ts.
  refresh();
}

export async function deleteProductImage(imageId: string) {
  await prisma.productImage.delete({ where: { id: imageId } });
  refresh();
}

export async function deleteProduct(productId: string) {
  // This does NOT delete past orders that included this product — OrderItem
  // stores its own snapshot of the name/price and only loses the *link*
  // back to the product (see `onDelete: SetNull` on OrderItem.product in
  // schema.prisma), so historical orders still read correctly.
  await prisma.product.delete({ where: { id: productId } });
  redirect("/admin/inventory");
}
