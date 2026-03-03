import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: 180, height: 180, display: "flex" }}>
        <svg width="180" height="180" viewBox="0 0 220 220" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF8040"/>
              <stop offset="50%" stopColor="#FF5566"/>
              <stop offset="100%" stopColor="#FF2880"/>
            </linearGradient>
            <linearGradient id="bag" x1="0%" y1="0%" x2="20%" y2="100%">
              <stop offset="0%" stopColor="#ffffff"/>
              <stop offset="100%" stopColor="#FFE8EC"/>
            </linearGradient>
            <linearGradient id="pin" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF8040"/>
              <stop offset="100%" stopColor="#FF2880"/>
            </linearGradient>
            <linearGradient id="handle" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff"/>
              <stop offset="100%" stopColor="#FFD0D8"/>
            </linearGradient>
          </defs>
          <rect width="220" height="220" rx="50" fill="url(#bg)"/>
          <rect width="220" height="110" rx="50" fill="rgba(255,255,255,0.12)"/>
          <path d="M 76 100 C 76 72 82 56 86 50 C 90 44 96 42 102 42 C 108 42 114 44 118 50 C 122 56 128 72 128 100"
            fill="none" stroke="url(#handle)" strokeWidth="10" strokeLinecap="round"/>
          <path d="M 80 100 C 80 74 85 59 89 53 C 92 47 97 45 102 45 C 107 45 112 47 115 53 C 119 59 124 74 124 100"
            fill="none" stroke="rgba(255,160,140,0.35)" strokeWidth="4" strokeLinecap="round"/>
          <path d="M 55 100 C 53 90 58 80 70 78 L 134 78 C 146 80 151 90 149 100 L 158 162 C 160 174 148 180 102 180 C 56 180 44 174 46 162 Z"
            fill="url(#bag)"/>
          <path d="M 63 97 L 141 97" stroke="rgba(255,100,120,0.2)" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="4 3"/>
          <circle cx="102" cy="122" r="22" fill="url(#pin)" opacity="0.15"/>
          <circle cx="102" cy="118" r="18" fill="url(#pin)"/>
          <circle cx="102" cy="118" r="8" fill="white"/>
          <circle cx="102" cy="118" r="3.5" fill="url(#pin)"/>
          <path d="M 90 130 Q 102 154 114 130 Q 108 142 102 152 Q 96 142 90 130 Z" fill="url(#pin)"/>
          <circle cx="97" cy="112" r="4" fill="rgba(255,255,255,0.65)"/>
        </svg>
      </div>
    ),
    { ...size }
  );
}
