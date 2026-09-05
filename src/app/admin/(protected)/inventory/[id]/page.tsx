import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { toMajorUnits } from "@/lib/currency";
import { STANDARD_SIZE_LABELS } from "@/lib/constants";
import { SmartImage } from "@/components/site/SmartImage";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { updateProduct, deleteProductImage, deleteProduct } from "../actions";

export const dynamic = "force-dynamic";

const inputClasses =
  "w-full border border-olive/25 bg-cream px-4 py-2.5 text-sm text-olive-dark focus:border-olive-dark focus:outline-none";
const labelClasses = "mb-1.5 block text-sm text-olive-dark/70";

// Note this page has NO "use client" and no useState anywhere — a form
// that calls a Server Action which doesn't need to show inline validation
// state (like this one) works perfectly well as a plain Server Component.
// Compare with new/NewProductForm.tsx, which DOES need "use client" because
// it uses useActionState to show error messages without a full page reload.
export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      sizes: true,
    },
  });

  if (!product) notFound();

  const stockByLabel = new Map(product.sizes.map((size) => [size.label, size.stock]));
  const updateProductWithId = updateProduct.bind(null, product.id);
  const deleteProductWithId = deleteProduct.bind(null, product.id);

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl text-olive-dark">{product.name}</h1>
      <p className="text-sm text-olive-dark/60">/shop/{product.slug} (URL can&apos;t be changed here)</p>

      {/* See the comment in consult/ConsultForm.tsx for why there's no
          encType attribute here despite the file input below. */}
      <form action={updateProductWithId} className="mt-6 space-y-6">
        <div>
          <label htmlFor="name" className={labelClasses}>Product name</label>
          <input id="name" name="name" defaultValue={product.name} required className={inputClasses} />
        </div>

        <div>
          <label htmlFor="description" className={labelClasses}>Description</label>
          <textarea
            id="description"
            name="description"
            defaultValue={product.description}
            required
            rows={4}
            className={inputClasses}
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="price" className={labelClasses}>Price (Naira)</label>
            <input
              id="price"
              name="price"
              type="number"
              min="0"
              step="1"
              defaultValue={toMajorUnits(product.priceInMinorUnits)}
              required
              className={inputClasses}
            />
          </div>
          <div>
            <label htmlFor="category" className={labelClasses}>Category</label>
            <input id="category" name="category" defaultValue={product.category} required className={inputClasses} />
          </div>
        </div>

        <div>
          <label htmlFor="sizeChartCategory" className={labelClasses}>Size chart</label>
          <select
            id="sizeChartCategory"
            name="sizeChartCategory"
            defaultValue={product.sizeChartCategory}
            className={inputClasses}
          >
            <option value="TOPS">Tops / Dresses / Suits (bust, waist, hip)</option>
            <option value="PANTS">Pants / Skirts (waist, hip)</option>
          </select>
        </div>

        <fieldset>
          <legend className={labelClasses}>Stock per size</legend>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
            {STANDARD_SIZE_LABELS.map((label) => (
              <div key={label}>
                <label htmlFor={`stock-${label}`} className="mb-1 block text-xs text-olive-dark/60">
                  UK {label}
                </label>
                <input
                  id={`stock-${label}`}
                  name={`stock-${label}`}
                  type="number"
                  min="0"
                  defaultValue={stockByLabel.get(label) ?? 0}
                  className={inputClasses}
                />
              </div>
            ))}
          </div>
        </fieldset>

        <div>
          <label htmlFor="images" className={labelClasses}>Add more photos</label>
          <input id="images" name="images" type="file" accept="image/*" multiple className="text-sm text-olive-dark/80" />
        </div>

        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm text-olive-dark">
            <input type="checkbox" name="isFeatured" defaultChecked={product.isFeatured} className="h-4 w-4" />
            Feature on homepage
          </label>
          <label className="flex items-center gap-2 text-sm text-olive-dark">
            <input type="checkbox" name="isActive" defaultChecked={product.isActive} className="h-4 w-4" />
            Visible in shop
          </label>
        </div>

        <button
          type="submit"
          className="bg-olive-dark px-8 py-3 font-heading text-sm uppercase tracking-[0.15em] text-cream hover:bg-olive"
        >
          Save changes
        </button>
      </form>

      {/* Existing photos — each has its own tiny delete form */}
      <div className="mt-10">
        <h2 className="font-heading text-sm uppercase tracking-[0.15em] text-olive-dark/60">
          Current photos
        </h2>
        <div className="mt-3 grid grid-cols-3 gap-4 sm:grid-cols-4">
          {product.images.map((image) => {
            const deleteImageWithId = deleteProductImage.bind(null, image.id);
            return (
              <div key={image.id} className="space-y-2">
                <div className="relative aspect-[4/5] overflow-hidden bg-cream-dark">
                  <SmartImage src={image.url} alt={product.name} fill sizes="150px" className="object-cover" />
                </div>
                <form action={deleteImageWithId}>
                  <DeleteButton
                    confirmMessage="Remove this photo?"
                    className="w-full text-xs uppercase tracking-wide text-red-700 underline underline-offset-4"
                  >
                    Remove
                  </DeleteButton>
                </form>
              </div>
            );
          })}
          {product.images.length === 0 && (
            <p className="text-sm text-olive-dark/50">No photos yet — using a placeholder on the site.</p>
          )}
        </div>
      </div>

      {/* Danger zone */}
      <div className="mt-12 border border-red-200 bg-red-50 p-5">
        <h2 className="font-heading text-sm uppercase tracking-[0.15em] text-red-800">Danger zone</h2>
        <p className="mt-1 text-sm text-red-800/80">
          Deleting a product removes it from the shop and gallery permanently, but past orders that
          included it are unaffected.
        </p>
        <form action={deleteProductWithId} className="mt-3">
          <DeleteButton
            confirmMessage={`Delete "${product.name}"? This can't be undone.`}
            className="bg-red-700 px-5 py-2 text-sm text-white hover:bg-red-800"
          >
            Delete product
          </DeleteButton>
        </form>
      </div>
    </div>
  );
}
