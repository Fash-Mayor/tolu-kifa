import Image from "next/image";

// -----------------------------------------------------------------------------
// A drop-in stand-in for next/image that also handles our seed placeholder
// graphics (which are plain .svg files).
// -----------------------------------------------------------------------------
// next/image's built-in optimizer resizes and re-compresses raster photos
// (.jpg/.png) on the fly — exactly what we want once the founder uploads
// real product/gallery photos through the admin panel. It deliberately does
// NOT do the same for .svg files unless you turn on extra security config
// (an SVG can contain script, so Next.js is cautious by default), and there
// would be no benefit to "optimizing" a simple vector placeholder anyway.
//
// So: every place in the app that shows a product/gallery photo renders it
// through THIS component instead of next/image directly. It picks a plain
// <img> for .svg sources (i.e. today's placeholders) and next/image for
// everything else (i.e. real uploaded photos) — automatically, with no
// extra work needed anywhere the image is used.
// -----------------------------------------------------------------------------

type SmartImageProps = {
  src: string;
  alt: string;
  className?: string;
} & (
  | { fill: true; sizes: string; width?: never; height?: never }
  | { fill?: false; sizes?: never; width: number; height: number }
);

export function SmartImage(props: SmartImageProps) {
  const { src, alt, className } = props;
  const isPlaceholderSvg = src.endsWith(".svg");

  if (isPlaceholderSvg) {
    if (props.fill) {
      return (
        // eslint-disable-next-line @next/next/no-img-element -- intentional fallback for unoptimized placeholder SVGs, see file comment
        <img
          src={src}
          alt={alt}
          className={`absolute inset-0 h-full w-full object-cover ${className ?? ""}`}
        />
      );
    }
    return (
      // eslint-disable-next-line @next/next/no-img-element -- intentional fallback for unoptimized placeholder SVGs, see file comment
      <img
        src={src}
        alt={alt}
        width={props.width}
        height={props.height}
        className={className}
      />
    );
  }

  if (props.fill) {
    return (
      <Image src={src} alt={alt} fill sizes={props.sizes} className={className} />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={props.width}
      height={props.height}
      className={className}
    />
  );
}
