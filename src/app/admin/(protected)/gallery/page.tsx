import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { SmartImage } from "@/components/site/SmartImage";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { uploadGalleryImages, deleteGalleryImage, moveGalleryImage } from "./actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Gallery" };

const inputClasses =
  "w-full border border-olive/25 bg-cream px-4 py-2.5 text-sm text-olive-dark focus:border-olive-dark focus:outline-none";

export default async function AdminGalleryPage() {
  const images = await prisma.galleryImage.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div>
      <h1 className="font-display text-2xl text-olive-dark">Gallery (Archive)</h1>
      <p className="mt-1 text-sm text-olive-dark/60">
        These photos appear on the public &quot;Archive&quot; page, grouped by collection tag.
      </p>

      {/* See the comment in consult/ConsultForm.tsx for why there's no
          encType attribute here despite the file input below. */}
      <form
        action={uploadGalleryImages}
        className="mt-6 grid gap-4 border border-olive/15 bg-cream p-5 sm:grid-cols-[1fr_1fr_auto_auto]"
      >
        <input name="caption" placeholder="Caption (optional)" className={inputClasses} />
        <input name="collectionTag" placeholder="Collection tag, e.g. AW24 Collection (optional)" className={inputClasses} />
        <input name="images" type="file" accept="image/*" multiple required className="text-sm text-olive-dark/80 sm:self-center" />
        <button
          type="submit"
          className="bg-olive-dark px-5 py-2.5 font-heading text-sm uppercase tracking-[0.15em] text-cream hover:bg-olive"
        >
          Upload
        </button>
      </form>

      <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((image, index) => {
          const deleteWithId = deleteGalleryImage.bind(null, image.id);
          const moveUpWithId = moveGalleryImage.bind(null, image.id, "up");
          const moveDownWithId = moveGalleryImage.bind(null, image.id, "down");

          return (
            <div key={image.id} className="space-y-2 border border-olive/15 bg-cream p-3">
              <div className="relative aspect-[4/5] overflow-hidden bg-cream-dark">
                <SmartImage
                  src={image.url}
                  alt={image.caption ?? "Gallery photo"}
                  fill
                  sizes="200px"
                  className="object-cover"
                />
              </div>
              {image.caption && <p className="text-xs text-olive-dark/70">{image.caption}</p>}
              {image.collectionTag && (
                <p className="text-xs uppercase tracking-wide text-olive-dark/50">{image.collectionTag}</p>
              )}

              <div className="flex items-center justify-between text-xs">
                <div className="flex gap-2">
                  <form action={moveUpWithId}>
                    <button
                      type="submit"
                      disabled={index === 0}
                      className="text-olive-dark/70 underline underline-offset-4 disabled:opacity-30"
                    >
                      Move up
                    </button>
                  </form>
                  <form action={moveDownWithId}>
                    <button
                      type="submit"
                      disabled={index === images.length - 1}
                      className="text-olive-dark/70 underline underline-offset-4 disabled:opacity-30"
                    >
                      Move down
                    </button>
                  </form>
                </div>
                <form action={deleteWithId}>
                  <DeleteButton
                    confirmMessage="Remove this photo from the archive?"
                    className="text-red-700 underline underline-offset-4"
                  >
                    Remove
                  </DeleteButton>
                </form>
              </div>
            </div>
          );
        })}
        {images.length === 0 && (
          <p className="col-span-full text-sm text-olive-dark/50">No photos yet — upload some above.</p>
        )}
      </div>
    </div>
  );
}
