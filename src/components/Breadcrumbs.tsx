import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { breadcrumbJsonLd, type Crumb } from "@/lib/seo";
import { JsonLd } from "./JsonLd";

export function Breadcrumbs({ items, light = false }: { items: Crumb[]; light?: boolean }) {
  return (
    <>
      <nav aria-label="Breadcrumb" className={`text-sm font-semibold ${light ? "text-white/70" : "text-ink-3"}`}>
        <ol className="flex flex-wrap items-center gap-1.5">
          {items.map((c, i) => {
            const last = i === items.length - 1;
            return (
              <li key={c.path} className="flex items-center gap-1.5">
                {last ? (
                  <span aria-current="page" className={`line-clamp-1 ${light ? "text-white" : "text-ink"}`}>
                    {c.name}
                  </span>
                ) : (
                  <>
                    <Link href={c.path} className={`transition-colors ${light ? "hover:text-white" : "hover:text-forest"}`}>
                      {c.name}
                    </Link>
                    <ChevronRight className="size-3.5 opacity-60" aria-hidden="true" />
                  </>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      <JsonLd data={breadcrumbJsonLd(items)} />
    </>
  );
}
