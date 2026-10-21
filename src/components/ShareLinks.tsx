import { Mail, MessageCircle } from "lucide-react";

/** Brand marks as plain letters: lucide no longer ships brand icons. */
function Glyph({ text }: { text: string }) {
  return <span className="text-[0.8rem] font-extrabold leading-none">{text}</span>;
}

/** Plain share links: no third-party scripts, no tracking pixels. */
export function ShareLinks({ url, title }: { url: string; title: string }) {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  const links = [
    { label: "WhatsApp", icon: MessageCircle, href: `https://wa.me/?text=${t}%20${u}` },
    { label: "Facebook", icon: () => <Glyph text="f" />, href: `https://www.facebook.com/sharer/sharer.php?u=${u}` },
    { label: "LinkedIn", icon: () => <Glyph text="in" />, href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}` },
    { label: "X", icon: () => <Glyph text="X" />, href: `https://x.com/intent/post?url=${u}&text=${t}` },
    { label: "Email", icon: Mail, href: `mailto:?subject=${t}&body=${u}` },
  ];
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 text-sm font-bold text-ink-2">Share</span>
      {links.map(({ label, icon: Icon, href }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Share on ${label}`}
          className="flex size-10 items-center justify-center rounded-full border border-line bg-white text-ink-2 transition-colors hover:border-forest hover:bg-forest hover:text-white"
        >
          <span aria-hidden="true" className="flex"><Icon className="size-4" /></span>
        </a>
      ))}
    </div>
  );
}
