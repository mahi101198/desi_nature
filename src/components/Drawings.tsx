/**
 * Flat drawings of the foods, in the page's palette. They stand in for product
 * photography until the owner supplies real photographs of real batches.
 */

type Kind = "ghee" | "honey" | "grains" | "field";

export function FoodDrawing({ kind, title, className }: { kind: Kind; title: string; className?: string }) {
  return (
    <svg viewBox="0 0 400 400" role="img" aria-label={title} className={className} preserveAspectRatio="xMidYMid slice">
      <title>{title}</title>
      {kind === "ghee" && <Ghee />}
      {kind === "honey" && <Honey />}
      {kind === "grains" && <Grains />}
      {kind === "field" && <Field />}
    </svg>
  );
}

function Ghee() {
  return (
    <g>
      <rect width="400" height="400" fill="#d9cfc9" />
      <rect y="300" width="400" height="100" fill="#b9aaa2" />
      {/* jar */}
      <rect x="110" y="110" width="170" height="210" rx="26" fill="#f2ece8" />
      <rect x="122" y="160" width="146" height="148" rx="18" fill="#e4b54e" />
      <rect x="122" y="160" width="146" height="26" fill="#f0cf7e" />
      {[...Array(18)].map((_, i) => (
        <circle key={i} cx={135 + ((i * 37) % 120)} cy={200 + ((i * 23) % 95)} r={2.2} fill="#f3d58f" />
      ))}
      <rect x="118" y="86" width="154" height="34" fill="#2f5d3a" />
      <rect x="118" y="114" width="154" height="8" fill="#244a2e" />
      {/* label */}
      <rect x="146" y="214" width="98" height="54" fill="#f7f3f1" />
      <rect x="160" y="230" width="70" height="6" fill="#2b2622" />
      <rect x="168" y="246" width="54" height="5" fill="#5c5450" />
      {/* steel spoon */}
      <g transform="rotate(-18 318 300)">
        <rect x="300" y="190" width="10" height="120" rx="5" fill="#9b9a98" />
        <ellipse cx="305" cy="320" rx="20" ry="28" fill="#b9b8b5" />
        <ellipse cx="305" cy="318" rx="13" ry="19" fill="#d6d5d2" />
      </g>
    </g>
  );
}

function Honey() {
  return (
    <g>
      <rect width="400" height="400" fill="#e1d4c2" />
      <rect y="300" width="400" height="100" fill="#c6b49c" />
      <path d="M120 130 Q120 100 150 100 L250 100 Q280 100 280 130 L290 300 Q290 322 268 322 L132 322 Q110 322 110 300 Z" fill="#f2ece8" />
      <path d="M124 170 L276 170 L284 298 Q284 314 266 314 L134 314 Q116 314 116 298 Z" fill="#c98a2b" />
      <path d="M124 170 L276 170 L278 196 L122 196 Z" fill="#dda64f" />
      <rect x="132" y="76" width="136" height="30" fill="#2b2622" />
      {/* dipper */}
      <g transform="rotate(24 300 160)">
        <rect x="292" y="40" width="12" height="170" rx="6" fill="#8a5a2b" />
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x="280" y={200 + i * 14} width="36" height="9" rx="4.5" fill="#a26b33" />
        ))}
      </g>
      <path d="M298 262 Q296 290 300 318" stroke="#c98a2b" strokeWidth="8" fill="none" strokeLinecap="round" />
    </g>
  );
}

function Grains() {
  return (
    <g>
      <rect width="400" height="400" fill="#d6cbbd" />
      <rect y="310" width="400" height="90" fill="#b9a993" />
      {/* jute sack */}
      <path d="M100 150 Q96 120 130 112 L270 112 Q304 120 300 150 L316 300 Q318 330 286 332 L114 332 Q82 330 84 300 Z" fill="#b8955e" />
      {[...Array(9)].map((_, i) => (
        <rect key={i} x="96" y={150 + i * 20} width="214" height="3" fill="#a5844f" />
      ))}
      <ellipse cx="200" cy="118" rx="96" ry="22" fill="#d6c39c" />
      {[...Array(40)].map((_, i) => (
        <ellipse
          key={i}
          cx={118 + ((i * 41) % 166)}
          cy={106 + ((i * 17) % 26)}
          rx="5"
          ry="3"
          fill={i % 3 === 0 ? "#c4a86d" : "#e4cf9e"}
          transform={`rotate(${(i * 29) % 180} ${118 + ((i * 41) % 166)} ${106 + ((i * 17) % 26)})`}
        />
      ))}
      {/* wheat ears */}
      {[0, 1, 2].map((s) => (
        <g key={s} transform={`translate(${290 + s * 22} ${40 + s * 8}) rotate(${12 + s * 8})`}>
          <rect x="-2" y="40" width="4" height="190" fill="#c4a86d" />
          {[...Array(7)].map((_, i) => (
            <g key={i}>
              <ellipse cx="-7" cy={48 + i * 13} rx="6" ry="10" fill="#e4b54e" transform={`rotate(-25 -7 ${48 + i * 13})`} />
              <ellipse cx="7" cy={48 + i * 13} rx="6" ry="10" fill="#d9a63c" transform={`rotate(25 7 ${48 + i * 13})`} />
            </g>
          ))}
        </g>
      ))}
    </g>
  );
}

function Field() {
  return (
    <g>
      <rect width="400" height="400" fill="#ece3d6" />
      <circle cx="300" cy="96" r="44" fill="#e4b54e" />
      <rect y="200" width="400" height="200" fill="#2f5d3a" />
      {[...Array(8)].map((_, r) => (
        <g key={r}>
          {[...Array(14)].map((_, c) => (
            <rect key={c} x={c * 30 + (r % 2) * 15 - 6} y={212 + r * 24} width="8" height={14 + (r % 3) * 2} fill={r % 2 ? "#4f8a52" : "#6a9e5c"} />
          ))}
        </g>
      ))}
      <rect y="186" width="400" height="16" fill="#8a6d4b" />
    </g>
  );
}
