import { getSiteSettings, DEFAULT_HERO_IMAGE_URL } from "@/lib/settings";
import { SmartImage } from "@/components/site/SmartImage";
import { updateHeroImage } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();
  const heroImageUrl = settings.heroImageUrl ?? DEFAULT_HERO_IMAGE_URL;

  return (
    <div className="max-w-xl">
      <h1 className="font-display text-2xl text-olive-dark">Settings</h1>
      <p className="mt-1 text-sm text-olive-dark/60">
        Site-wide settings that don&apos;t belong to any one product or page.
      </p>

      <section className="mt-6 border border-olive/15 bg-cream p-5">
        <h2 className="font-heading text-sm uppercase tracking-[0.15em] text-olive-dark/60">
          Homepage hero photo
        </h2>
        <p className="mt-1 text-sm text-olive-dark/70">
          The large photo behind the headline at the top of the landing page.
        </p>

        <div className="relative mt-4 aspect-[16/9] w-full overflow-hidden bg-cream-dark">
          <SmartImage
            src={heroImageUrl}
            alt="Current hero photo"
            fill
            sizes="576px"
            className="object-cover"
          />
        </div>

        {/* See the comment in consult/ConsultForm.tsx for why there's no
            encType attribute here despite the file input below. */}
        <form action={updateHeroImage} className="mt-4 flex items-end gap-4">
          <div className="flex-1">
            <label htmlFor="heroImage" className="mb-1.5 block text-sm text-olive-dark/70">
              Replace with a new photo
            </label>
            <input
              id="heroImage"
              name="heroImage"
              type="file"
              accept="image/*"
              required
              className="w-full text-sm text-olive-dark/80"
            />
          </div>
          <button
            type="submit"
            className="bg-olive-dark px-6 py-2.5 font-heading text-sm uppercase tracking-[0.15em] text-cream hover:bg-olive"
          >
            Save
          </button>
        </form>
      </section>
    </div>
  );
}
