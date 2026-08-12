import React from 'react';

interface UniversityLogoProps {
  universityId: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const UniversityLogo: React.FC<UniversityLogoProps> = ({
  universityId,
  className = '',
  size = 'md',
}) => {
  const normalizedId = universityId.toLowerCase();

  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  }[size];

  // UMaT (University of Mines and Technology) Official Crest
  if (normalizedId === 'umat') {
    return (
      <svg
        viewBox="0 0 300 360"
        className={`${sizeClasses} ${className}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="UMaT Crest"
      >
        {/* Outer Shield Outline */}
        <path
          d="M 50 35 L 250 35 C 250 180 230 250 150 290 C 70 250 50 180 50 35 Z"
          fill="#FFFFFF"
          stroke="#000000"
          strokeWidth="6"
        />
        <path
          d="M 60 45 L 240 45 C 240 175 222 240 150 278 C 78 240 60 175 60 45 Z"
          fill="#FFFFFF"
          stroke="#E4002B"
          strokeWidth="4"
        />
        {/* Top Sky Section */}
        <path
          d="M 68 53 L 232 53 C 232 150 225 160 150 160 C 75 160 68 150 68 53 Z"
          fill="#87CEEB"
        />
        {/* Sunburst */}
        <circle cx="150" cy="120" r="30" fill="#FFD700" />
        <g stroke="#FFC72C" strokeWidth="4">
          <line x1="150" y1="75" x2="150" y2="85" />
          <line x1="120" y1="90" x2="128" y2="97" />
          <line x1="180" y1="90" x2="172" y2="97" />
          <line x1="105" y1="120" x2="115" y2="120" />
          <line x1="195" y1="120" x2="185" y2="120" />
          <line x1="115" y1="145" x2="123" y2="138" />
          <line x1="185" y1="145" x2="177" y2="138" />
        </g>
        {/* Open Book */}
        <path
          d="M 100 135 Q 125 125 150 135 Q 175 125 200 135 L 195 165 Q 172 155 150 165 Q 128 155 105 165 Z"
          fill="#FFFFFF"
          stroke="#000000"
          strokeWidth="3"
        />
        <line x1="150" y1="135" x2="150" y2="165" stroke="#000000" strokeWidth="3" />

        {/* Bottom Green Field */}
        <path
          d="M 68 160 C 72 205 100 245 150 270 C 200 245 228 205 232 160 Z"
          fill="#008751"
        />

        {/* Mining Pickaxes (Left) */}
        <g stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round">
          <line x1="95" y1="185" x2="125" y2="215" />
          <line x1="125" y1="185" x2="95" y2="215" />
          <path d="M 90 180 Q 110 185 130 180" fill="none" />
        </g>

        {/* Gear / Cog Wheel (Right) */}
        <circle cx="180" cy="200" r="14" fill="none" stroke="#FFFFFF" strokeWidth="3" />
        <circle cx="180" cy="200" r="5" fill="#FFFFFF" />
        <g stroke="#FFFFFF" strokeWidth="3">
          <line x1="180" y1="182" x2="180" y2="218" />
          <line x1="162" y1="200" x2="198" y2="200" />
          <line x1="167" y1="187" x2="193" y2="213" />
          <line x1="167" y1="213" x2="193" y2="187" />
        </g>

        {/* Bottom Gold Ribbon with Motto */}
        <path
          d="M 40 260 L 70 245 L 80 270 L 220 270 L 230 245 L 260 260 L 245 310 L 210 295 L 150 315 L 90 295 L 55 310 Z"
          fill="#FFC72C"
          stroke="#000000"
          strokeWidth="3"
        />
        <path d="M 40 260 L 70 280 L 55 310 Z" fill="#008751" />
        <path d="M 260 260 L 230 280 L 245 310 Z" fill="#008751" />
        <text
          x="150"
          y="298"
          fill="#000000"
          fontSize="11"
          fontWeight="900"
          fontFamily="sans-serif"
          textAnchor="middle"
        >
          KNOWLEDGE, TRUTH AND EXCELLENCE
        </text>
      </svg>
    );
  }

  // UCC (University of Cape Coast) Official Crest
  if (normalizedId === 'ucc') {
    return (
      <svg
        viewBox="0 0 300 360"
        className={`${sizeClasses} ${className}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="UCC Crest"
      >
        {/* Main Shield Outer */}
        <path
          d="M 60 40 L 240 40 L 240 180 C 240 240 190 280 150 295 C 110 280 60 240 60 180 Z"
          fill="#FFFFFF"
          stroke="#000000"
          strokeWidth="5"
        />

        {/* Top Red Section with Flying Eagle */}
        <path
          d="M 64 44 L 236 44 L 236 115 L 64 115 Z"
          fill="#D0021B"
        />
        {/* Soaring Golden Eagle */}
        <path
          d="M 150 70 Q 180 50 220 58 Q 190 70 170 80 Q 150 82 130 80 Q 110 70 80 58 Q 120 50 150 70 Z"
          fill="#FFD700"
          stroke="#000000"
          strokeWidth="1.5"
        />
        {/* Eagle Head & Tail */}
        <path d="M 150 70 L 155 60 L 145 65 Z" fill="#FFD700" />
        <path d="M 150 82 L 140 100 L 160 100 Z" fill="#FFD700" />

        {/* Bottom Section: White background with Blue Ocean Waves */}
        <path
          d="M 64 115 L 236 115 L 236 180 C 236 237 188 275 150 290 C 112 275 64 237 64 180 Z"
          fill="#0033A0"
        />
        {/* White Waves */}
        <path
          d="M 64 135 Q 90 120 115 135 Q 140 150 165 135 Q 190 120 236 135 L 236 150 Q 190 135 165 150 Q 140 165 115 150 Q 90 135 64 150 Z"
          fill="#FFFFFF"
        />
        <path
          d="M 64 175 Q 90 160 115 175 Q 140 190 165 175 Q 190 160 236 175 L 236 190 Q 190 175 165 190 Q 140 205 115 190 Q 90 175 64 190 Z"
          fill="#FFFFFF"
        />

        {/* Center Golden Medallion with Red Adinkra Emblem */}
        <circle cx="150" cy="190" r="32" fill="#FFD700" stroke="#000000" strokeWidth="2" />
        {/* Gye Nyame / Okodee Symbol */}
        <path
          d="M 140 175 C 130 185 130 200 142 205 C 150 208 152 195 150 190 C 148 185 160 185 160 195 C 160 205 145 208 140 202 C 135 195 135 180 150 175 Z"
          fill="#D0021B"
        />
        <path
          d="M 160 205 C 170 195 170 180 158 175 C 150 172 148 185 150 190 C 152 195 140 195 140 185 C 140 175 155 172 160 178 C 165 185 165 200 150 205 Z"
          fill="#D0021B"
        />

        {/* Bottom Red Scroll Ribbon */}
        <path
          d="M 50 280 Q 150 330 250 280 L 260 310 Q 150 360 40 310 Z"
          fill="#D0021B"
          stroke="#000000"
          strokeWidth="2"
        />
        <path d="M 50 280 L 70 300 L 40 310 Z" fill="#900010" />
        <path d="M 250 280 L 230 300 L 260 310 Z" fill="#900010" />
        <text
          x="150"
          y="318"
          fill="#FFFFFF"
          fontSize="12"
          fontWeight="900"
          fontFamily="serif"
          textAnchor="middle"
          letterSpacing="1"
        >
          VERITAS NOBIS LUMEN
        </text>
      </svg>
    );
  }

  // UG (University of Ghana, Legon) Official Crest
  if (normalizedId === 'ug' || normalizedId === 'legon') {
    return (
      <svg
        viewBox="0 0 300 360"
        className={`${sizeClasses} ${className}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="University of Ghana Crest"
      >
        {/* Royal Blue Shield */}
        <path
          d="M 50 35 L 250 35 C 250 180 230 250 150 290 C 70 250 50 180 50 35 Z"
          fill="#002147"
          stroke="#D4AF37"
          strokeWidth="6"
        />
        {/* Golden Star at Top */}
        <polygon
          points="150,55 158,78 182,78 163,92 170,115 150,100 130,115 137,92 118,78 142,78"
          fill="#FFD700"
        />
        {/* Open Book in Center */}
        <path
          d="M 90 140 Q 120 130 150 140 Q 180 130 210 140 L 205 180 Q 175 170 150 180 Q 125 170 95 180 Z"
          fill="#FFFFFF"
          stroke="#D4AF37"
          strokeWidth="3"
        />
        <line x1="150" y1="140" x2="150" y2="180" stroke="#002147" strokeWidth="3" />

        {/* Cocoa Pod / Adinkra Emblem */}
        <path
          d="M 150 200 C 130 210 130 240 150 250 C 170 240 170 210 150 200 Z"
          fill="#FFD700"
          stroke="#FFFFFF"
          strokeWidth="2"
        />

        {/* Golden Scroll Ribbon */}
        <path
          d="M 45 275 Q 150 320 255 275 L 265 305 Q 150 350 35 305 Z"
          fill="#D4AF37"
          stroke="#000000"
          strokeWidth="2"
        />
        <text
          x="150"
          y="312"
          fill="#002147"
          fontSize="12"
          fontWeight="900"
          fontFamily="serif"
          textAnchor="middle"
        >
          INTEGRI PROCEDAMUS
        </text>
      </svg>
    );
  }

  // KNUST (Kwame Nkrumah University of Science and Technology)
  if (normalizedId === 'knust') {
    return (
      <svg
        viewBox="0 0 300 360"
        className={`${sizeClasses} ${className}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="KNUST Crest"
      >
        {/* Shield */}
        <path
          d="M 50 35 L 250 35 C 250 180 230 250 150 290 C 70 250 50 180 50 35 Z"
          fill="#006837"
          stroke="#FFD700"
          strokeWidth="6"
        />
        {/* Top Section: Stool / Golden Emblem */}
        <path
          d="M 100 65 Q 150 50 200 65 L 190 90 Q 150 80 110 90 Z"
          fill="#FFD700"
        />
        <rect x="140" y="90" width="20" height="30" fill="#FFD700" />
        <rect x="120" y="120" width="60" height="10" fill="#FFD700" />

        {/* Center: Calipers & Gear */}
        <circle cx="150" cy="185" r="28" stroke="#FFD700" strokeWidth="4" fill="#002147" />
        <line x1="130" y1="165" x2="170" y2="205" stroke="#FFFFFF" strokeWidth="4" />
        <line x1="170" y1="165" x2="130" y2="205" stroke="#FFFFFF" strokeWidth="4" />

        {/* Golden Ribbon */}
        <path
          d="M 40 275 Q 150 320 260 275 L 270 305 Q 150 350 30 305 Z"
          fill="#FFD700"
          stroke="#000000"
          strokeWidth="2"
        />
        <text
          x="150"
          y="312"
          fill="#000000"
          fontSize="10"
          fontWeight="900"
          fontFamily="sans-serif"
          textAnchor="middle"
        >
          NYANSAPO WOSANE NO BADWENMA
        </text>
      </svg>
    );
  }

  // Ashesi University
  if (normalizedId === 'ashesi') {
    return (
      <svg
        viewBox="0 0 300 360"
        className={`${sizeClasses} ${className}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Ashesi Crest"
      >
        <path
          d="M 50 35 L 250 35 C 250 180 230 250 150 290 C 70 250 50 180 50 35 Z"
          fill="#800020"
          stroke="#D4AF37"
          strokeWidth="6"
        />
        <circle cx="150" cy="140" r="45" fill="none" stroke="#FFD700" strokeWidth="5" />
        <path d="M 125 140 L 150 100 L 175 140 L 150 180 Z" fill="#FFFFFF" />
        <path
          d="M 45 275 Q 150 320 255 275 L 265 305 Q 150 350 35 305 Z"
          fill="#D4AF37"
        />
        <text
          x="150"
          y="312"
          fill="#800020"
          fontSize="9"
          fontWeight="900"
          fontFamily="sans-serif"
          textAnchor="middle"
        >
          SCHOLARSHIP • LEADERSHIP • CITIZENSHIP
        </text>
      </svg>
    );
  }

  // Default / UENR Fallback Crest
  return (
    <svg
      viewBox="0 0 300 360"
      className={`${sizeClasses} ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="University Crest"
    >
      <path
        d="M 50 35 L 250 35 C 250 180 230 250 150 290 C 70 250 50 180 50 35 Z"
        fill="#1B4D3E"
        stroke="#F4C430"
        strokeWidth="6"
      />
      <circle cx="150" cy="130" r="35" fill="#F4C430" />
      <path d="M 120 180 L 150 140 L 180 180 Z" fill="#FFFFFF" />
      <path
        d="M 45 275 Q 150 320 255 275 L 265 305 Q 150 350 35 305 Z"
        fill="#F4C430"
      />
      <text
        x="150"
        y="312"
        fill="#1B4D3E"
        fontSize="10"
        fontWeight="900"
        fontFamily="sans-serif"
        textAnchor="middle"
      >
        KNOWLEDGE FOR DEVELOPMENT
      </text>
    </svg>
  );
};
