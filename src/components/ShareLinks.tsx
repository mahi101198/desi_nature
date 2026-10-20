/** Plain share links: no third-party scripts, no tracking pixels. */
export function ShareLinks({ url, title }: { url: string; title: string }) {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  const links = [
    { label: "WhatsApp", href: `https://wa.me/?text=${t}%20${u}` },
    { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${u}` },
    { label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}` },
    { label: "X", href: `https://x.com/intent/post?url=${u}&text=${t}` },
    { label: "Email", href: `mailto:?subject=${t}&body=${u}` },
  ];
  return (
    <div className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-2 t-small">
      <span className="italic">Share this guide</span>
      {links.map((l) => (
        <a key={l.label} href={l.href} className="link" target="_blank" rel="noopener noreferrer">
          {l.label}
        </a>
      ))}
    </div>
  );
}
