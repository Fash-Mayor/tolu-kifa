import Link from "next/link";
import { SmartImage } from "./SmartImage";
import { Price } from "./Price";

// The minimum shape a product needs to be shown as a card. Kept as a plain
// object type (not imported from Prisma) so this component doesn't care
// whether the data came straight from the database or was shaped first.
export type ProductCardData = {
  slug: string;
  name: string;
  category: string;
  priceInMinorUnits: number;
  imageUrl: string;
};

export function ProductCard({ product }: { product: ProductCardData }) {
  return (
    <Link href={`/shop/${product.slug}`} className="group block">
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-cream-dark">
        <SmartImage
          src={product.imageUrl}
          alt={product.name}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
      </div>
      <div className="mt-3 space-y-1">
        <p className="font-heading text-xs uppercase tracking-[0.15em] text-olive/70">
          {product.category}
        </p>
        <h3 className="font-display text-lg text-olive-dark">{product.name}</h3>
        <p className="text-sm text-olive-dark/80">
          <Price amountInMinorUnits={product.priceInMinorUnits} />
        </p>
      </div>
    </Link>
  );
}
