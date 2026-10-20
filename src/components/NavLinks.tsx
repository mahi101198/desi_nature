"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Item = { href: string; label: string };

export function NavLinks({ items }: { items: Item[] }) {
  const pathname = usePathname();
  return (
    <ul className="flex flex-wrap items-center gap-x-6 gap-y-1 t-body">
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`link no-underline hover:underline ${active ? "text-accent underline" : ""}`}
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
