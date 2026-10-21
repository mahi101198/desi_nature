import fs from "node:fs";
import path from "node:path";
import Image from "next/image";
import { FoodArt, type ArtKind } from "./art/FoodArt";

const EXTENSIONS = ["webp", "jpg", "jpeg", "png", "avif"];

/** Finds public/images/<name>.<ext> at build time. */
function findPhoto(name: string): string | null {
  for (const ext of EXTENSIONS) {
    const rel = `/images/${name}.${ext}`;
    if (fs.existsSync(path.join(/*turbopackIgnore: true*/ process.cwd(), "public", rel))) return rel;
  }
  return null;
}

/**
 * A picture slot. If the owner has added a real photograph at
 * public/images/<photo>.(webp|jpg|png|avif) it is used; otherwise the
 * illustration stands in. Real photos should be at least 1600px wide.
 */
export function Visual({
  photo,
  art,
  alt,
  className = "",
  priority = false,
  sizes = "(min-width: 1024px) 50vw, 100vw",
}: {
  photo: string;
  art: ArtKind;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
}) {
  const src = findPhoto(photo);
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {src ? (
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
      ) : (
        <FoodArt kind={art} title={alt} className="absolute inset-0 h-full w-full" />
      )}
    </div>
  );
}
