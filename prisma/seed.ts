// =============================================================================
// DATABASE SEED SCRIPT
// =============================================================================
// Fills a freshly-created database with everything needed to actually look
// at and click through the site: the founder's admin login, the digitized
// size charts, a handful of sample products, and some gallery photos — all
// using the placeholder images in /public/placeholders (see
// src/lib/storage.ts for how real uploads replace them later).
//
// Run it with:
//   npm run db:seed
//
// It's safe to run more than once — it clears out and re-creates the
// *catalog* data (products, size charts, gallery) each time, but never
// touches real orders, consultation requests, or existing admin sessions.
// =============================================================================

import { PrismaClient, SizeChartCategory } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function seedAdminUser() {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!email || !password) {
    console.warn(
      "⚠️  SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD are not set in .env — skipping admin user creation. Copy .env.example to .env and fill these in, then re-run `npm run db:seed`."
    );
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.adminUser.upsert({
    where: { email },
    update: { passwordHash }, // re-running the seed with a new password updates it
    create: { email, passwordHash },
  });

  console.log(`✔ Admin user ready: ${email}`);
}

async function seedSizeCharts() {
  // Digitized from the founder's original chart images:
  //   stitch_integrated_fashion_retail_platform/tksccd.png (tops/dresses/suits)
  //   stitch_integrated_fashion_retail_platform/tkscp.png  (pants)
  await prisma.sizeChartRow.deleteMany();

  const topsRows = [
    { ukSize: "6", usSize: "4", bustInches: 34, waistInches: 26, hipInches: 36 },
    { ukSize: "8", usSize: "6", bustInches: 36, waistInches: 28, hipInches: 38 },
    { ukSize: "10", usSize: "8", bustInches: 38, waistInches: 30, hipInches: 40 },
    { ukSize: "12", usSize: "10", bustInches: 40, waistInches: 32, hipInches: 42 },
    { ukSize: "14", usSize: "12", bustInches: 42, waistInches: 34, hipInches: 44 },
    { ukSize: "16", usSize: "14", bustInches: 44, waistInches: 36, hipInches: 46 },
    { ukSize: "18", usSize: "16", bustInches: 46, waistInches: 38, hipInches: 48 },
    { ukSize: "20", usSize: "18", bustInches: 48, waistInches: 40, hipInches: 50 },
    { ukSize: "22", usSize: "20", bustInches: 50, waistInches: 42, hipInches: 52 },
  ];

  const pantsRows = [
    { ukSize: "6", usSize: "4", waistInches: 26, hipInches: 36 },
    { ukSize: "8", usSize: "6", waistInches: 28, hipInches: 38 },
    { ukSize: "10", usSize: "8", waistInches: 30, hipInches: 40 },
    { ukSize: "12", usSize: "10", waistInches: 32, hipInches: 42 },
    { ukSize: "14", usSize: "12", waistInches: 34, hipInches: 44 },
    { ukSize: "16", usSize: "14", waistInches: 36, hipInches: 46 },
    { ukSize: "18", usSize: "16", waistInches: 38, hipInches: 48 },
    { ukSize: "20", usSize: "18", waistInches: 40, hipInches: 50 },
    { ukSize: "22", usSize: "20", waistInches: 42, hipInches: 52 },
  ];

  await prisma.sizeChartRow.createMany({
    data: [
      ...topsRows.map((row, index) => ({
        ...row,
        category: SizeChartCategory.TOPS,
        sortOrder: index,
      })),
      ...pantsRows.map((row, index) => ({
        ...row,
        category: SizeChartCategory.PANTS,
        bustInches: null,
        sortOrder: index,
      })),
    ],
  });

  console.log(`✔ Size charts seeded (${topsRows.length} tops rows, ${pantsRows.length} pants rows)`);
}

async function seedProducts() {
  // Deleting products cascades to their ProductImage/ProductSize rows (see
  // `onDelete: Cascade` in schema.prisma) but leaves any OrderItem snapshots
  // untouched, since those store their own copy of the name/price.
  await prisma.product.deleteMany();

  const sampleProducts = [
    {
      name: "Adaeze Wrap Dress",
      slug: "adaeze-wrap-dress",
      description:
        "A fluid, bias-cut wrap dress in hand-dyed silk. Cinches at the waist and falls to a soft midi length — easy to dress up or down.",
      priceInMinorUnits: 8500000, // ₦85,000
      category: "Dresses",
      sizeChartCategory: SizeChartCategory.TOPS,
      isFeatured: true,
      sizes: ["10", "12", "14"],
      images: ["product-1.svg"],
    },
    {
      name: "Ìjẹ̀wọ́n Tailored Suit",
      slug: "ijewon-tailored-suit",
      description:
        "A sharply tailored two-piece suit in Italian wool blend. Structured shoulders, a nipped waist, and a matching straight-leg trouser.",
      priceInMinorUnits: 15000000, // ₦150,000
      category: "Suits",
      sizeChartCategory: SizeChartCategory.TOPS,
      isFeatured: true,
      sizes: ["8", "10", "12"],
      images: ["product-2.svg"],
    },
    {
      name: "Layo Silk Blouse",
      slug: "layo-silk-blouse",
      description:
        "A relaxed, lightweight silk blouse with a draped neckline and covered button placket. A quiet-luxury wardrobe staple.",
      priceInMinorUnits: 4500000, // ₦45,000
      category: "Tops",
      sizeChartCategory: SizeChartCategory.TOPS,
      isFeatured: false,
      sizes: ["8", "10", "12", "14"],
      images: ["product-3.svg"],
    },
    {
      name: "Kunle Wide-Leg Trousers",
      slug: "kunle-wide-leg-trousers",
      description:
        "High-waisted, wide-leg trousers cut from a heavyweight crepe that holds its drape beautifully in motion.",
      priceInMinorUnits: 6000000, // ₦60,000
      category: "Pants",
      sizeChartCategory: SizeChartCategory.PANTS,
      isFeatured: true,
      sizes: ["10", "12", "14"],
      images: ["product-4.svg"],
    },
    {
      name: "Bisi Pleated Skirt",
      slug: "bisi-pleated-skirt",
      description:
        "Knife-pleated midi skirt with a fitted waistband. Moves beautifully and pairs easily with almost anything in the collection.",
      priceInMinorUnits: 5200000, // ₦52,000
      category: "Skirts",
      sizeChartCategory: SizeChartCategory.PANTS,
      isFeatured: false,
      sizes: ["8", "10", "12"],
      images: ["product-5.svg"],
    },
    {
      name: "Femi Structured Shirt",
      slug: "femi-structured-shirt",
      description:
        "A crisp, structured cotton-poplin shirt with a sculpted collar and clean, architectural lines.",
      priceInMinorUnits: 4000000, // ₦40,000
      category: "Shirts",
      sizeChartCategory: SizeChartCategory.TOPS,
      isFeatured: false,
      sizes: ["12", "14", "16"],
      images: ["product-6.svg"],
    },
  ];

  for (const product of sampleProducts) {
    await prisma.product.create({
      data: {
        name: product.name,
        slug: product.slug,
        description: product.description,
        priceInMinorUnits: product.priceInMinorUnits,
        category: product.category,
        sizeChartCategory: product.sizeChartCategory,
        isFeatured: product.isFeatured,
        sizes: {
          create: product.sizes.map((label) => ({ label, stock: 5 })),
        },
        images: {
          create: product.images.map((filename, index) => ({
            url: `/placeholders/${filename}`,
            sortOrder: index,
          })),
        },
      },
    });
  }

  console.log(`✔ ${sampleProducts.length} sample products seeded`);
}

async function seedGallery() {
  await prisma.galleryImage.deleteMany();

  const galleryEntries = [
    { file: "gallery-1.svg", caption: "AW24 Runway — Look 01", collectionTag: "AW24 Collection" },
    { file: "gallery-2.svg", caption: "AW24 Runway — Look 02", collectionTag: "AW24 Collection" },
    { file: "gallery-3.svg", caption: "AW24 Runway — Look 03", collectionTag: "AW24 Collection" },
    { file: "gallery-4.svg", caption: "AW24 Runway — Look 04", collectionTag: "AW24 Collection" },
    { file: "gallery-5.svg", caption: "Bridal Edit — Look 01", collectionTag: "Bridal Edit" },
    { file: "gallery-6.svg", caption: "Bridal Edit — Look 02", collectionTag: "Bridal Edit" },
    { file: "gallery-7.svg", caption: "Studio Portrait 01", collectionTag: "Studio Portraits" },
    { file: "gallery-8.svg", caption: "Studio Portrait 02", collectionTag: "Studio Portraits" },
  ];

  await prisma.galleryImage.createMany({
    data: galleryEntries.map((entry, index) => ({
      url: `/placeholders/${entry.file}`,
      caption: entry.caption,
      collectionTag: entry.collectionTag,
      sortOrder: index,
    })),
  });

  console.log(`✔ ${galleryEntries.length} gallery images seeded`);
}

async function main() {
  await seedAdminUser();
  await seedSizeCharts();
  await seedProducts();
  await seedGallery();
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
