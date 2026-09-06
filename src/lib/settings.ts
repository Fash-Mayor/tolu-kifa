import { prisma } from "@/lib/prisma";

const SINGLETON_ID = "singleton";

// Used by the landing page whenever the founder hasn't uploaded a hero
// photo yet (including right after a fresh `db:seed`).
export const DEFAULT_HERO_IMAGE_URL = "/placeholders/hero.svg";

/**
 * Reads the one-and-only SiteSettings row, creating it on first use so
 * every caller can assume it always exists (no null-checking a "has
 * anyone saved settings yet?" case everywhere).
 */
export async function getSiteSettings() {
  return prisma.siteSettings.upsert({
    where: { id: SINGLETON_ID },
    update: {},
    create: { id: SINGLETON_ID },
  });
}

export async function updateHeroImageUrl(heroImageUrl: string) {
  return prisma.siteSettings.upsert({
    where: { id: SINGLETON_ID },
    update: { heroImageUrl },
    create: { id: SINGLETON_ID, heroImageUrl },
  });
}
