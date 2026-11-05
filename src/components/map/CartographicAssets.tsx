import React from "react";

export function CartographicDefs() {
  return (
    <defs>
      {/* Antique Parchment Stipple / Noise Filter */}
      <filter id="parchment-stipple" x="0%" y="0%" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="4" result="noise" />
        <feColorMatrix
          type="matrix"
          values="0.33 0.33 0.33 0 0
                  0.33 0.33 0.33 0 0
                  0.33 0.33 0.33 0 0
                  0 0 0 0.12 0"
        />
        <feComposite in2="SourceGraphic" in="glint" operator="over" />
      </filter>

      {/* Antique Drop Shadow */}
      <filter id="carto-shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="2" dy="3" stdDeviation="3" floodColor="#2a1a12" floodOpacity="0.4" />
      </filter>

      {/* Waypoint Glow Filter */}
      <filter id="waypoint-glow" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="4" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>

      {/* Mountain Ridge Cluster */}
      <g id="mountain-cluster">
        {/* Mountain 1 */}
        <polygon points="0,-40 -35,15 35,15" fill="#e8dac1" stroke="#3d291d" strokeWidth="2.5" />
        <path d="M0,-40 L-10,15" stroke="#3d291d" strokeWidth="1.5" />
        <path d="M-8,-15 L-25,15 M-4,-25 L-18,15 M-1,-32 L-10,15" stroke="#4a3525" strokeWidth="1" opacity="0.7" />
        {/* Mountain 2 (Behind left) */}
        <polygon points="-30,-28 -55,15 -5,15" fill="#ded0b6" stroke="#3d291d" strokeWidth="2" />
        <path d="M-30,-28 L-36,15" stroke="#3d291d" strokeWidth="1.5" />
        {/* Mountain 3 (Behind right) */}
        <polygon points="25,-32 2,15 50,15" fill="#ded0b6" stroke="#3d291d" strokeWidth="2" />
        <path d="M25,-32 L20,15" stroke="#3d291d" strokeWidth="1.5" />
      </g>

      {/* Forest Grove */}
      <g id="forest-grove">
        {/* Tree 1 */}
        <path d="M-15,10 C-20,0 -15,-15 -5,-15 C5,-15 10,0 5,10 Z" fill="#4d5945" stroke="#25301f" strokeWidth="1.8" />
        <line x1="-5" y1="5" x2="-5" y2="14" stroke="#25301f" strokeWidth="2" />
        {/* Tree 2 */}
        <path d="M0,14 C-8,5 -3,-10 8,-10 C18,-10 24,5 16,14 Z" fill="#58664f" stroke="#25301f" strokeWidth="1.8" />
        <line x1="8" y1="10" x2="8" y2="18" stroke="#25301f" strokeWidth="2" />
        {/* Tree 3 */}
        <path d="M-28,15 C-34,8 -30,-6 -20,-6 C-10,-6 -6,8 -12,15 Z" fill="#3f4a38" stroke="#25301f" strokeWidth="1.8" />
        <line x1="-20" y1="10" x2="-20" y2="19" stroke="#25301f" strokeWidth="2" />
      </g>

      {/* Citadel Fortress */}
      <g id="citadel-fortress" filter="url(#carto-shadow)">
        {/* Castle Base */}
        <rect x="-35" y="-15" width="70" height="40" fill="#f0e2cc" stroke="#3d291d" strokeWidth="2.5" />
        {/* Battlements */}
        <path d="M-35,-15 L-35,-25 L-25,-25 L-25,-15 L-15,-15 L-15,-25 L-5,-25 L-5,-15 L5,-15 L5,-25 L15,-25 L15,-15 L25,-15 L25,-25 L35,-25 L35,-15" fill="#f0e2cc" stroke="#3d291d" strokeWidth="2" />
        {/* Central Spire */}
        <polygon points="0,-50 -14,-25 14,-25" fill="#53234f" stroke="#3d291d" strokeWidth="2" />
        {/* Grand Portcullis Gate */}
        <path d="M-10,25 C-10,12 10,12 10,25 Z" fill="#2d1c13" stroke="#3d291d" strokeWidth="2" />
        {/* Gold Finial */}
        <circle cx="0" cy="-52" r="3" fill="#ebcb7a" stroke="#3d291d" strokeWidth="1" />
      </g>

      {/* Waypoint Rune Stone Base */}
      <g id="waypoint-rune">
        <circle cx="0" cy="0" r="18" fill="#f4ebd9" stroke="#3d291d" strokeWidth="2.5" filter="url(#carto-shadow)" />
        <circle cx="0" cy="0" r="14" fill="none" stroke="#8b5a2b" strokeWidth="1" strokeDasharray="3 2" />
      </g>

      {/* Compass Rose */}
      <g id="compass-rose" filter="url(#carto-shadow)">
        <circle cx="0" cy="0" r="60" fill="none" stroke="#3d291d" strokeWidth="2" />
        <circle cx="0" cy="0" r="54" fill="none" stroke="#8b5a2b" strokeWidth="1" strokeDasharray="2 3" />
        <circle cx="0" cy="0" r="48" fill="#f5ede0" stroke="#3d291d" strokeWidth="1.5" opacity="0.9" />

        {/* 16-point star */}
        {/* Major North */}
        <polygon points="0,-55 7,-10 0,0" fill="#8b2500" stroke="#3d291d" strokeWidth="1" />
        <polygon points="0,-55 -7,-10 0,0" fill="#f5ede0" stroke="#3d291d" strokeWidth="1" />
        {/* Major South */}
        <polygon points="0,55 7,10 0,0" fill="#f5ede0" stroke="#3d291d" strokeWidth="1" />
        <polygon points="0,55 -7,10 0,0" fill="#3d291d" stroke="#3d291d" strokeWidth="1" />
        {/* Major East */}
        <polygon points="55,0 10,7 0,0" fill="#f5ede0" stroke="#3d291d" strokeWidth="1" />
        <polygon points="55,0 10,-7 0,0" fill="#3d291d" stroke="#3d291d" strokeWidth="1" />
        {/* Major West */}
        <polygon points="-55,0 -10,7 0,0" fill="#f5ede0" stroke="#3d291d" strokeWidth="1" />
        <polygon points="-55,0 -10,-7 0,0" fill="#3d291d" stroke="#3d291d" strokeWidth="1" />

        {/* Minor diagonals */}
        <polygon points="38,-38 10,-3 0,0" fill="#3d291d" opacity="0.7" />
        <polygon points="-38,-38 -10,-3 0,0" fill="#8b5a2b" opacity="0.7" />
        <polygon points="38,38 10,3 0,0" fill="#8b5a2b" opacity="0.7" />
        <polygon points="-38,38 -10,3 0,0" fill="#3d291d" opacity="0.7" />

        {/* Cardinal Lettering */}
        <text x="0" y="-62" textAnchor="middle" fontFamily="Cinzel, serif" fontWeight="bold" fontSize="16" fill="#8b2500">N</text>
        <text x="0" y="74" textAnchor="middle" fontFamily="Cinzel, serif" fontWeight="bold" fontSize="13" fill="#3d291d">S</text>
        <text x="68" y="5" textAnchor="middle" fontFamily="Cinzel, serif" fontWeight="bold" fontSize="13" fill="#3d291d">E</text>
        <text x="-68" y="5" textAnchor="middle" fontFamily="Cinzel, serif" fontWeight="bold" fontSize="13" fill="#3d291d">W</text>

        {/* Center brass pin */}
        <circle cx="0" cy="0" r="5" fill="#ebcb7a" stroke="#3d291d" strokeWidth="1.5" />
      </g>

      {/* Sea Monster Watermark */}
      <g id="sea-monster" opacity="0.6">
        <path
          d="M-40,10 C-30,-15 -10,-10 0,5 C10,-15 30,-10 40,10 C25,2 15,18 0,8 C-15,18 -25,2 -40,10 Z"
          fill="none"
          stroke="#5a6978"
          strokeWidth="2"
        />
        <path d="M-15,5 Q0,-8 15,5" fill="none" stroke="#5a6978" strokeWidth="1.5" strokeDasharray="2 3" />
        <text x="0" y="24" textAnchor="middle" fontFamily="IM Fell English, serif" fontStyle="italic" fontSize="10" fill="#5a6978">
          Hic Sunt Dracones
        </text>
      </g>
    </defs>
  );
}

// Vintage Map Border with Latitude/Longitude Graticules
export function CartographicBorder({ width, height }: { width: number; height: number }) {
  const x0 = -width / 2;
  const y0 = -height / 2;
  return (
    <g className="cartographic-border pointer-events-none" aria-hidden="true">
      {/* Outer border */}
      <rect x={x0} y={y0} width={width} height={height} fill="none" stroke="#3d291d" strokeWidth="6" />
      {/* Inner ornamental hairline */}
      <rect x={x0 + 12} y={y0 + 12} width={width - 24} height={height - 24} fill="none" stroke="#8b5a2b" strokeWidth="1.5" />
      {/* Corner corner-pieces */}
      <circle cx={x0 + 12} cy={y0 + 12} r="6" fill="#ebcb7a" stroke="#3d291d" strokeWidth="2" />
      <circle cx={x0 + width - 12} cy={y0 + 12} r="6" fill="#ebcb7a" stroke="#3d291d" strokeWidth="2" />
      <circle cx={x0 + 12} cy={y0 + height - 12} r="6" fill="#ebcb7a" stroke="#3d291d" strokeWidth="2" />
      <circle cx={x0 + width - 12} cy={y0 + height - 12} r="6" fill="#ebcb7a" stroke="#3d291d" strokeWidth="2" />
    </g>
  );
}

