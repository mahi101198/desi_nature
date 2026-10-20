import Link from "next/link";
import { breadcrumbJsonLd, type Crumb } from "@/lib/seo";
import { JsonLd } from "./JsonLd";

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <>
      <nav aria-label="Breadcrumb" className="t-small text-muted">
        <ol className="flex flex-wrap gap-x-2">
          {items.map((c, i) => {
            const last = i === items.length - 1;
            return (
              <li key={c.path} className="flex gap-x-2">
                {last ? (
                  <span aria-current="page">{c.name}</span>
                ) : (
                  <>
                    <Link href={c.path} className="link">
                      {c.name}
                    </Link>
                    <span aria-hidden="true">/</span>
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
