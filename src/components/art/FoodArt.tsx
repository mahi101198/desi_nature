import { useId } from "react";

/**
 * Illustrated artwork for the foods. Used until the owner adds real
 * photographs (see components/Visual.tsx). Each piece fills its box.
 */
export type ArtKind = "ghee" | "honey" | "grains" | "field" | "kitchen";

export function FoodArt({ kind, title, className }: { kind: ArtKind; title: string; className?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg
      viewBox="0 0 400 400"
      className={className}
      preserveAspectRatio="xMidYMid slice"
      {...(title ? { role: "img", "aria-label": title } : { "aria-hidden": true })}
    >
      {title && <title>{title}</title>}
      {kind === "ghee" && <Ghee id={id} />}
      {kind === "honey" && <Honey id={id} />}
      {kind === "grains" && <Grains id={id} />}
      {kind === "field" && <Field id={id} />}
      {kind === "kitchen" && <Kitchen id={id} />}
    </svg>
  );
}

function Ghee({ id }: { id: string }) {
  return (
    <g>
      <defs>
        <linearGradient id={`${id}bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fdf1d8" />
          <stop offset="1" stopColor="#f3d79a" />
        </linearGradient>
        <linearGradient id={`${id}ghee`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f7cf6c" />
          <stop offset="1" stopColor="#e2a032" />
        </linearGradient>
        <linearGradient id={`${id}glass`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.1" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0.35" />
        </linearGradient>
      </defs>
      <rect width="400" height="400" fill={`url(#${id}bg)`} />
      <circle cx="320" cy="80" r="120" fill="#fff" opacity="0.35" />
      <ellipse cx="200" cy="338" rx="130" ry="18" fill="#b07a1e" opacity="0.18" />
      {/* jar */}
      <rect x="118" y="120" width="164" height="214" rx="34" fill="#fff7e6" />
      <rect x="128" y="168" width="144" height="156" rx="26" fill={`url(#${id}ghee)`} />
      <path d="M128 182 q72 -18 144 0 v-8 q-72 -14 -144 0z" fill="#fbe2a0" />
      {[...Array(22)].map((_, i) => (
        <circle key={i} cx={142 + ((i * 41) % 118)} cy={196 + ((i * 29) % 116)} r={1.6 + (i % 3) * 0.6} fill="#fff1c4" opacity="0.8" />
      ))}
      <rect x="118" y="120" width="164" height="214" rx="34" fill={`url(#${id}glass)`} />
      <rect x="112" y="92" width="176" height="40" rx="12" fill="#123c2e" />
      <rect x="112" y="122" width="176" height="10" rx="4" fill="#0c2c21" />
      {/* label */}
      <rect x="150" y="222" width="100" height="62" rx="10" fill="#fffdf8" />
      <path d="M200 234c5 5.5 7.5 9.4 7.5 12.8a7.5 7.5 0 0 1-15 0c0-3.4 2.5-7.3 7.5-12.8Z" fill="#e9a93b" />
      <rect x="170" y="258" width="60" height="5" rx="2.5" fill="#123c2e" />
      <rect x="180" y="269" width="40" height="4" rx="2" fill="#8a8075" />
      {/* spoon */}
      <g transform="rotate(-22 322 300)">
        <rect x="314" y="170" width="11" height="126" rx="5.5" fill="#b9bcbf" />
        <ellipse cx="319.5" cy="314" rx="22" ry="30" fill="#cfd2d4" />
        <ellipse cx="319.5" cy="312" rx="14" ry="20" fill="#eef0f1" />
      </g>
      {/* leaves */}
      <path d="M64 330c10-40 40-62 80-66-8 38-38 62-80 66Z" fill="#2f7a55" />
      <path d="M64 330c22-24 44-40 72-58" stroke="#1b5541" strokeWidth="3" fill="none" strokeLinecap="round" />
    </g>
  );
}

function Honey({ id }: { id: string }) {
  return (
    <g>
      <defs>
        <linearGradient id={`${id}bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fbe7cf" />
          <stop offset="1" stopColor="#efc28c" />
        </linearGradient>
        <linearGradient id={`${id}honey`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f0a83e" />
          <stop offset="1" stopColor="#b9631a" />
        </linearGradient>
      </defs>
      <rect width="400" height="400" fill={`url(#${id}bg)`} />
      {/* honeycomb */}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const x = 40 + (i % 3) * 46 + (Math.floor(i / 3) % 2) * 23;
        const y = 50 + Math.floor(i / 3) * 40;
        return (
          <path
            key={i}
            d={`M${x} ${y}l20-12 20 12v24l-20 12-20-12z`}
            fill={i % 2 ? "#f4c06a" : "#e9a93b"}
            opacity="0.55"
          />
        );
      })}
      <ellipse cx="200" cy="340" rx="125" ry="16" fill="#8a4a10" opacity="0.18" />
      <path d="M122 150 q0-34 34-34 h88 q34 0 34 34 l8 160 q0 26-26 26 h-120 q-26 0-26-26z" fill="#fff4e3" />
      <path d="M128 186 h144 l6 122 q0 20-20 20 h-116 q-20 0-20-20z" fill={`url(#${id}honey)`} />
      <path d="M128 186 h144 l1 18 q-72 14-146 0z" fill="#f7c573" />
      <rect x="140" y="92" width="120" height="30" rx="10" fill="#123c2e" />
      <rect x="160" y="226" width="80" height="54" rx="10" fill="#fffaf2" />
      <path d="M186 248l14-8 14 8v16l-14 8-14-8z" fill="#e9a93b" />
      {/* dipper */}
      <g transform="rotate(28 310 150)">
        <rect x="302" y="30" width="13" height="180" rx="6.5" fill="#8a5a2b" />
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x="288" y={196 + i * 15} width="41" height="10" rx="5" fill="#a86d33" />
        ))}
      </g>
      <path d="M314 262 q-4 30 0 62" stroke="#c8741c" strokeWidth="9" fill="none" strokeLinecap="round" />
      <circle cx="314" cy="330" r="7" fill="#c8741c" />
    </g>
  );
}

function Grains({ id }: { id: string }) {
  return (
    <g>
      <defs>
        <linearGradient id={`${id}bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#eef3e4" />
          <stop offset="1" stopColor="#d9e5c6" />
        </linearGradient>
        <linearGradient id={`${id}sack`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d2ad6d" />
          <stop offset="1" stopColor="#a8803f" />
        </linearGradient>
      </defs>
      <rect width="400" height="400" fill={`url(#${id}bg)`} />
      <circle cx="80" cy="80" r="90" fill="#fff" opacity="0.45" />
      <ellipse cx="190" cy="346" rx="130" ry="16" fill="#3b5a2a" opacity="0.16" />
      <path d="M88 160 q-6-34 34-42 h136 q40 8 34 42 l18 150 q4 32-30 34 h-150 q-34-2-30-34z" fill={`url(#${id}sack)`} />
      {[...Array(8)].map((_, i) => (
        <path key={i} d={`M98 ${170 + i * 20} q102 6 204 0`} stroke="#94702f" strokeWidth="2" fill="none" opacity="0.5" />
      ))}
      <ellipse cx="190" cy="124" rx="98" ry="24" fill="#f1dfb0" />
      {[...Array(46)].map((_, i) => {
        const cx = 104 + ((i * 37) % 172);
        const cy = 112 + ((i * 13) % 26);
        return <ellipse key={i} cx={cx} cy={cy} rx="5.5" ry="3.2" fill={i % 3 ? "#e3c682" : "#c9a259"} transform={`rotate(${(i * 31) % 180} ${cx} ${cy})`} />;
      })}
      <rect x="150" y="214" width="84" height="50" rx="10" fill="#fffaf0" opacity="0.92" />
      <rect x="166" y="232" width="52" height="5" rx="2.5" fill="#123c2e" />
      <rect x="174" y="244" width="36" height="4" rx="2" fill="#8a8075" />
      {[0, 1, 2].map((s) => (
        <g key={s} transform={`translate(${300 + s * 20} ${36 + s * 10}) rotate(${10 + s * 8})`}>
          <rect x="-1.75" y="44" width="3.5" height="200" rx="1.75" fill="#b68f45" />
          {[...Array(8)].map((__, i) => (
            <g key={i}>
              <ellipse cx="-7" cy={50 + i * 13} rx="6" ry="10.5" fill="#e9b649" transform={`rotate(-26 -7 ${50 + i * 13})`} />
              <ellipse cx="7" cy={50 + i * 13} rx="6" ry="10.5" fill="#d79c32" transform={`rotate(26 7 ${50 + i * 13})`} />
            </g>
          ))}
        </g>
      ))}
    </g>
  );
}

function Field({ id }: { id: string }) {
  return (
    <g>
      <defs>
        <linearGradient id={`${id}sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fbd99a" />
          <stop offset="0.55" stopColor="#fbeacb" />
          <stop offset="1" stopColor="#f6f0e2" />
        </linearGradient>
        <linearGradient id={`${id}land`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2f7a55" />
          <stop offset="1" stopColor="#123c2e" />
        </linearGradient>
      </defs>
      <rect width="400" height="400" fill={`url(#${id}sky)`} />
      <circle cx="270" cy="150" r="54" fill="#f2a63a" />
      <circle cx="270" cy="150" r="80" fill="#f2a63a" opacity="0.18" />
      <path d="M0 210 q100-40 200-12 t200-14 v216 h-400z" fill="#7fa86a" />
      <path d="M0 240 q120-36 240-6 t160-10 v176 h-400z" fill={`url(#${id}land)`} />
      {[...Array(9)].map((_, r) => (
        <path
          key={r}
          d={`M${-40 + r * 10} ${262 + r * 17} q220 ${-12 - r} 480 ${-6 + r}`}
          stroke={r % 2 ? "#4c9466" : "#3a8458"}
          strokeWidth={4 + r * 0.6}
          fill="none"
          strokeDasharray={`${6 + r} ${8 + r}`}
          strokeLinecap="round"
        />
      ))}
      <path d="M40 210 c6-24 18-34 30-36 -2 20-14 32-30 36Z" fill="#1b5541" />
      <rect x="66" y="192" width="4" height="30" fill="#5b3f26" />
      <circle cx="68" cy="186" r="20" fill="#2f7a55" />
      <circle cx="84" cy="194" r="14" fill="#2f7a55" />
    </g>
  );
}

function Kitchen({ id }: { id: string }) {
  return (
    <g>
      <defs>
        <linearGradient id={`${id}wall`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f6efe2" />
          <stop offset="1" stopColor="#ecdfc8" />
        </linearGradient>
      </defs>
      <rect width="400" height="400" fill={`url(#${id}wall)`} />
      <rect x="0" y="250" width="400" height="150" fill="#c9a77a" />
      <rect x="0" y="250" width="400" height="12" fill="#b08d5f" />
      <rect x="40" y="120" width="320" height="10" rx="5" fill="#9c7a52" />
      {[
        { x: 60, h: 70, c: "#e9a93b", l: "#123c2e" },
        { x: 140, h: 86, c: "#c8741c", l: "#2b2622" },
        { x: 226, h: 62, c: "#e3c682", l: "#1b5541" },
        { x: 296, h: 78, c: "#e9a93b", l: "#123c2e" },
      ].map((j, i) => (
        <g key={i}>
          <rect x={j.x} y={120 - j.h} width="50" height={j.h} rx="10" fill="#fffaf0" />
          <rect x={j.x + 5} y={120 - j.h + 18} width="40" height={j.h - 24} rx="7" fill={j.c} />
          <rect x={j.x - 2} y={120 - j.h - 8} width="54" height="14" rx="5" fill={j.l} />
        </g>
      ))}
      <rect x="120" y="190" width="160" height="70" rx="14" fill="#2b2622" />
      <ellipse cx="200" cy="190" rx="86" ry="14" fill="#3b342d" />
      <path d="M170 168 q-10-20 6-34 M200 160 q-12-22 4-38 M230 168 q-10-20 6-34" stroke="#fff" strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.7" />
    </g>
  );
}
