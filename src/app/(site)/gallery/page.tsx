import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { SmartImage } from "@/components/site/SmartImage";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Archive" };

export default async function GalleryPage() {
  const images = await prisma.galleryImage.findMany({
    orderBy: { sortOrder: "asc" },
  });

  // Group photos by their collectionTag (e.g. "AW24 Collection") so the
  // page reads as a set of little exhibits rather than one long grid.
  // Photos with no tag land in a single "Archive" group at the end.
  const groups = new Map<string, typeof images>();
  for (const image of images) {
    const key = image.collectionTag?.trim() || "Archive";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(image);
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="font-display text-3xl text-olive-dark">The Archive</h1>
      <p className="mt-2 max-w-lg text-sm text-olive-dark/70">
        A look back at collections, runway moments, and bespoke pieces we&apos;ve
        brought to life.
      </p>

      {images.length === 0 ? (
        <p className="mt-16 text-center text-olive-dark/60">
          Nothing in the archive yet — check back soon.
        </p>
      ) : (
        <div className="mt-10 space-y-14">
          {Array.from(groups.entries()).map(([groupName, groupImages]) => (
            <section key={groupName}>
              <h2 className="mb-4 font-heading text-sm uppercase tracking-[0.2em] text-olive-dark/70">
                {groupName}
              </h2>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                {groupImages.map((image) => (
                  <figure key={image.id} className="relative aspect-[4/5] overflow-hidden bg-cream-dark">
                    <SmartImage
                      src={image.url}
                      alt={image.caption ?? groupName}
                      fill
                      sizes="(min-width: 768px) 33vw, 50vw"
                      className="object-cover"
                    />
                    {image.caption && (
                      <figcaption className="absolute inset-x-0 bottom-0 bg-olive-dark/60 px-3 py-2 text-xs text-cream">
                        {image.caption}
                      </figcaption>
                    )}
                  </figure>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
