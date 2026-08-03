import React from 'react';

export function HeroRaio({ expressao, size }) {
  const s = size || 180;
  const boca = expressao === "feliz" ? "M-14,8 Q0,20 14,8" : expressao === "susto" ? "M-8,8 Q0,18 8,8 Q0,28 -8,8" : "M-10,10 Q0,7 10,10";
  const sb1 = expressao === "susto" ? "M-16,-54 L-8,-50" : "M-16,-54 Q-12,-59 -8,-54";
  const sb2 = expressao === "susto" ? "M8,-50 L16,-54" : "M8,-54 Q12,-59 16,-54";
  return (
    <svg width={s} height={s} viewBox="-55 -85 110 165">
      <path d="M-26,22 Q-36,58 -30,88 Q0,68 30,88 Q36,58 26,22 Z" fill="#ff9f43" stroke="#c86000" strokeWidth="1.5"/>
      <path d="M-26,22 Q-16,48 0,38 Q16,48 26,22 Z" fill="#ffd166"/>
      <rect x="-24" y="2" width="48" height="62" rx="11" fill="#ffd166" stroke="#c89000" strokeWidth="1.5"/>
      <polygon points="0,-6 -7,8 -2,8 -7,22 7,6 2,6 7,-6" fill="#ff5500" stroke="#aa2200" strokeWidth="0.5" transform="translate(0,26)"/>
      <rect x="-9" y="-9" width="18" height="13" rx="5" fill="#ffe0a0" stroke="#c89000" strokeWidth="1"/>
      <ellipse cx="0" cy="-42" rx="28" ry="30" fill="#ffe0a0" stroke="#c89000" strokeWidth="1.5"/>
      <path d="M-28,-44 Q-28,-76 0,-78 Q28,-76 28,-44 Q19,-58 0,-60 Q-19,-58 -28,-44 Z" fill="#ffd166" stroke="#c89000" strokeWidth="1.5"/>
      <path d="M-30,-44 Q0,-54 30,-44" fill="none" stroke="#c89000" strokeWidth="2"/>
      <polygon points="0,-74 -4,-64 -1,-64 -5,-52 5,-59 2,-59 5,-74" fill="#ff5500" stroke="#aa2200" strokeWidth="0.5"/>
      <circle cx="-11" cy="-44" r="7" fill="white" stroke="#555" strokeWidth="1"/>
      <circle cx="11" cy="-44" r="7" fill="white" stroke="#555" strokeWidth="1"/>
      <circle cx="-10" cy="-43" r="4" fill="#333"/>
      <circle cx="12" cy="-43" r="4" fill="#333"/>
      <circle cx="-9" cy="-45" r="1.5" fill="white"/>
      <circle cx="13" cy="-45" r="1.5" fill="white"/>
      <path d={sb1} fill="none" stroke="#444" strokeWidth="2.5" strokeLinecap="round"/>
      <path d={sb2} fill="none" stroke="#444" strokeWidth="2.5" strokeLinecap="round"/>
      <path d={boca} fill="none" stroke="#c05000" strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx="-19" cy="-38" r="6" fill="#ffb3b3" opacity="0.45"/>
      <circle cx="19" cy="-38" r="6" fill="#ffb3b3" opacity="0.45"/>
      <rect x="-46" y="5" width="20" height="12" rx="6" fill="#ffd166" stroke="#c89000" strokeWidth="1.5" transform="rotate(-18 -36,11)"/>
      <rect x="26" y="5" width="20" height="12" rx="6" fill="#ffd166" stroke="#c89000" strokeWidth="1.5" transform="rotate(18 36,11)"/>
      <circle cx="-48" cy="14" r="9" fill="#ff9f43" stroke="#c86000" strokeWidth="1.5"/>
      <circle cx="48" cy="14" r="9" fill="#ff9f43" stroke="#c86000" strokeWidth="1.5"/>
      <polygon points="-48,7 -51,13 -49,13 -52,19 -44,14 -46,14 -43,7" fill="white" opacity="0.9"/>
      <polygon points="48,7 45,13 47,13 44,19 52,14 50,14 53,7" fill="white" opacity="0.9"/>
      <rect x="-20" y="62" width="16" height="28" rx="7" fill="#ff9f43" stroke="#c86000" strokeWidth="1.5"/>
      <rect x="4" y="62" width="16" height="28" rx="7" fill="#ff9f43" stroke="#c86000" strokeWidth="1.5"/>
      <ellipse cx="-12" cy="92" rx="12" ry="7" fill="#c06000" stroke="#9a4000" strokeWidth="1.5"/>
      <ellipse cx="12" cy="92" rx="12" ry="7" fill="#c06000" stroke="#9a4000" strokeWidth="1.5"/>
    </svg>
  );
}

export function HeroEscudo({ expressao, size }) {
  const s = size || 180;
  const boca = expressao === "feliz" ? "M-13,6 Q0,18 13,6" : expressao === "bravo" ? "M-10,12 Q0,8 10,12" : "M-10,8 Q0,5 10,8";
  const sb1 = expressao === "bravo" ? "M-16,-54 L-8,-50" : "M-16,-54 Q-12,-58 -8,-54";
  const sb2 = expressao === "bravo" ? "M8,-50 L16,-54" : "M8,-54 Q12,-58 16,-54";
  return (
    <svg width={s} height={s} viewBox="-55 -85 110 165">
      <path d="M-25,22 Q-35,56 -30,88 Q0,70 30,88 Q35,56 25,22 Z" fill="#0288d1" stroke="#015090" strokeWidth="1.5"/>
      <path d="M-25,22 Q-15,50 0,40 Q15,50 25,22 Z" fill="#4fc3f7"/>
      <rect x="-23" y="3" width="46" height="60" rx="11" fill="#4fc3f7" stroke="#0288d1" strokeWidth="1.5"/>
      <path d="M0,10 L-12,15 L-12,30 Q-12,42 0,47 Q12,42 12,30 L12,15 Z" fill="#0288d1" stroke="#004d80" strokeWidth="1"/>
      <path d="M0,17 L-7,21 L-7,30 Q-7,38 0,42 Q7,38 7,30 L7,21 Z" fill="#29b6f6"/>
      <text x="0" y="34" textAnchor="middle" fontSize="11" fill="white" fontWeight="900">★</text>
      <rect x="-8" y="-8" width="16" height="13" rx="5" fill="#b3e5fc" stroke="#0288d1" strokeWidth="1"/>
      <ellipse cx="0" cy="-42" rx="27" ry="29" fill="#b3e5fc" stroke="#0288d1" strokeWidth="1.5"/>
      <path d="M-27,-44 Q-25,-76 0,-78 Q25,-76 27,-44 Q18,-57 0,-59 Q-18,-57 -27,-44 Z" fill="#4fc3f7" stroke="#0288d1" strokeWidth="1.5"/>
      <path d="M-29,-44 Q0,-54 29,-44" fill="none" stroke="#0288d1" strokeWidth="2"/>
      <text x="0" y="-62" textAnchor="middle" fontSize="13" fill="#0288d1" fontWeight="900">★</text>
      <ellipse cx="-10" cy="-44" rx="7" ry="7" fill="white" stroke="#555" strokeWidth="1"/>
      <ellipse cx="10" cy="-44" rx="7" ry="7" fill="white" stroke="#555" strokeWidth="1"/>
      <circle cx="-9" cy="-43" r="4" fill="#0d47a1"/>
      <circle cx="11" cy="-43" r="4" fill="#0d47a1"/>
      <circle cx="-8" cy="-45" r="1.5" fill="white"/>
      <circle cx="12" cy="-45" r="1.5" fill="white"/>
      <path d={sb1} fill="none" stroke="#333" strokeWidth="2.5" strokeLinecap="round"/>
      <path d={sb2} fill="none" stroke="#333" strokeWidth="2.5" strokeLinecap="round"/>
      <path d={boca} fill="none" stroke="#0d6090" strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx="-18" cy="-38" r="6" fill="#90caf9" opacity="0.5"/>
      <circle cx="18" cy="-38" r="6" fill="#90caf9" opacity="0.5"/>
      <rect x="-44" y="6" width="22" height="12" rx="6" fill="#4fc3f7" stroke="#0288d1" strokeWidth="1.5" transform="rotate(-14 -33,12)"/>
      <rect x="22" y="6" width="22" height="12" rx="6" fill="#4fc3f7" stroke="#0288d1" strokeWidth="1.5" transform="rotate(14 33,12)"/>
      <circle cx="-49" cy="15" r="9" fill="#0288d1" stroke="#004d80" strokeWidth="1.5"/>
      <text x="-49" y="19" textAnchor="middle" fontSize="9" fill="white" fontWeight="900">★</text>
      <circle cx="49" cy="15" r="9" fill="#0288d1" stroke="#004d80" strokeWidth="1.5"/>
      <text x="49" y="19" textAnchor="middle" fontSize="9" fill="white" fontWeight="900">★</text>
      <rect x="-19" y="61" width="15" height="28" rx="7" fill="#0288d1" stroke="#004d80" strokeWidth="1.5"/>
      <rect x="4" y="61" width="15" height="28" rx="7" fill="#0288d1" stroke="#004d80" strokeWidth="1.5"/>
      <ellipse cx="-11" cy="91" rx="12" ry="7" fill="#004d80" stroke="#002d50" strokeWidth="1.5"/>
      <ellipse cx="11" cy="91" rx="12" ry="7" fill="#004d80" stroke="#002d50" strokeWidth="1.5"/>
    </svg>
  );
}

export function HeroEstrela({ expressao, size }) {
  const s = size || 180;
  const boca = expressao === "feliz" ? "M-12,6 Q0,18 12,6" : "M-10,8 Q0,4 10,8";
  return (
    <svg width={s} height={s} viewBox="-55 -85 110 165">
      <path d="M-23,22 Q-34,56 -30,88 Q0,70 30,88 Q34,56 23,22 Z" fill="#9c27b0" stroke="#6a0080" strokeWidth="1.5"/>
      <path d="M-23,22 L-30,88 Q0,74 30,88 L23,22 Z" fill="#ce93d8"/>
      <text x="-12" y="52" textAnchor="middle" fontSize="9" fill="#ffd166" opacity="0.8">★</text>
      <text x="12" y="62" textAnchor="middle" fontSize="9" fill="#ffd166" opacity="0.8">★</text>
      <text x="0" y="42" textAnchor="middle" fontSize="9" fill="#ffd166" opacity="0.8">★</text>
      <rect x="-22" y="2" width="44" height="54" rx="11" fill="#ce93d8" stroke="#9c27b0" strokeWidth="1.5"/>
      <text x="0" y="33" textAnchor="middle" fontSize="16" fill="#ffd166" style={{ filter: "drop-shadow(0 0 3px gold)" }}>★</text>
      <rect x="-8" y="-8" width="16" height="12" rx="5" fill="#f8bbd0" stroke="#9c27b0" strokeWidth="1"/>
      <ellipse cx="0" cy="-42" rx="26" ry="29" fill="#f8bbd0" stroke="#e080a0" strokeWidth="1.5"/>
      <path d="M-26,-46 Q-28,-78 0,-80 Q28,-78 26,-46 Q18,-66 0,-68 Q-18,-66 -26,-46 Z" fill="#9c27b0" stroke="#6a0080" strokeWidth="1.5"/>
      <path d="M-26,-50 Q-34,-38 -30,-16 Q-27,-8 -28,10" fill="none" stroke="#9c27b0" strokeWidth="7" strokeLinecap="round"/>
      <path d="M26,-50 Q34,-38 30,-16 Q27,-8 28,10" fill="none" stroke="#9c27b0" strokeWidth="7" strokeLinecap="round"/>
      <path d="M-13,-70 Q-7,-78 0,-76 Q7,-78 13,-70 Q7,-67 0,-68 Q-7,-67 -13,-70 Z" fill="#ffd166" stroke="#c8900a" strokeWidth="1"/>
      <circle cx="0" cy="-69" r="4" fill="#ff9f43"/>
      <ellipse cx="-9" cy="-44" rx="7" ry="7.5" fill="white" stroke="#555" strokeWidth="1"/>
      <ellipse cx="9" cy="-44" rx="7" ry="7.5" fill="white" stroke="#555" strokeWidth="1"/>
      <circle cx="-8" cy="-43" r="4.5" fill="#6a1b9a"/>
      <circle cx="10" cy="-43" r="4.5" fill="#6a1b9a"/>
      <circle cx="-7" cy="-45" r="1.5" fill="white"/>
      <circle cx="11" cy="-45" r="1.5" fill="white"/>
      {[[ -13, -52 ], [ -10, -53 ], [ -7, -52 ]].map(([x, y], i) => (
        <line key={i} x1={x} y1={y} x2={x - 1} y2={y - 3} stroke="#555" strokeWidth="1.2" strokeLinecap="round"/>
      ))}
      {[[ 6, -52 ], [ 9, -53 ], [ 12, -52 ]].map(([x, y], i) => (
        <line key={i} x1={x} y1={y} x2={x + 1} y2={y - 3} stroke="#555" strokeWidth="1.2" strokeLinecap="round"/>
      ))}
      <path d="M-14,-52 Q-10,-56 -5,-52" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round"/>
      <path d="M5,-52 Q9,-56 14,-52" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round"/>
      <path d={boca} fill="none" stroke="#c2185b" strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx="-17" cy="-38" r="7" fill="#f48fb1" opacity="0.5"/>
      <circle cx="17" cy="-38" r="7" fill="#f48fb1" opacity="0.5"/>
      <rect x="-42" y="4" width="20" height="11" rx="5" fill="#ce93d8" stroke="#9c27b0" strokeWidth="1.5" transform="rotate(-12 -32,9)"/>
      <rect x="22" y="4" width="20" height="11" rx="5" fill="#ce93d8" stroke="#9c27b0" strokeWidth="1.5" transform="rotate(12 32,9)"/>
      <text x="-46" y="18" textAnchor="middle" fontSize="14" fill="#ffd166">★</text>
      <text x="46" y="18" textAnchor="middle" fontSize="14" fill="#ffd166">★</text>
      <rect x="-18" y="54" width="14" height="28" rx="7" fill="#9c27b0" stroke="#6a0080" strokeWidth="1.5"/>
      <rect x="4" y="54" width="14" height="28" rx="7" fill="#9c27b0" stroke="#6a0080" strokeWidth="1.5"/>
      <ellipse cx="-11" cy="84" rx="12" ry="7" fill="#6a0080" stroke="#4a0060" strokeWidth="1.5"/>
      <ellipse cx="11" cy="84" rx="12" ry="7" fill="#6a0080" stroke="#4a0060" strokeWidth="1.5"/>
    </svg>
  );
}

export function HeroDoutor({ expressao, size }) {
  const s = size || 180;
  const boca = expressao === "feliz" ? "M-13,8 Q0,20 13,8" : expressao === "surpreso" ? "M-6,8 Q0,16 6,8 Q0,24 -6,8" : "M-10,9 Q0,6 10,9";
  const olhoE = expressao === "surpreso" ? 8 : 6;
  const olhoD = expressao === "surpreso" ? 8 : 6;
  return (
    <svg width={s} height={s} viewBox="-55 -85 110 165">
      <path d="M-24,20 Q-34,55 -28,88 Q0,68 28,88 Q34,55 24,20 Z" fill="#00796b" stroke="#004d40" strokeWidth="1.5"/>
      <rect x="-22" y="2" width="44" height="60" rx="11" fill="#00c9b1" stroke="#009980" strokeWidth="1.5"/>
      <rect x="-6" y="14" width="12" height="28" rx="3" fill="white" opacity="0.9"/>
      <rect x="-14" y="22" width="28" height="10" rx="3" fill="white" opacity="0.9"/>
      <circle cx="0" cy="42" r="7" fill="#e53935" stroke="#b71c1c" strokeWidth="1"/>
      <line x1="0" y1="38" x2="0" y2="46" stroke="white" strokeWidth="2"/>
      <line x1="-4" y1="42" x2="4" y2="42" stroke="white" strokeWidth="2"/>
      <rect x="-8" y="-8" width="16" height="13" rx="5" fill="#b2dfdb" stroke="#009980" strokeWidth="1"/>
      <ellipse cx="0" cy="-42" rx="27" ry="29" fill="#b2dfdb" stroke="#009980" strokeWidth="1.5"/>
      <path d="M-27,-44 Q-26,-76 0,-78 Q26,-76 27,-44 Q18,-57 0,-59 Q-18,-57 -27,-44 Z" fill="#00c9b1" stroke="#009980" strokeWidth="1.5"/>
      <path d="M-29,-44 Q0,-53 29,-44" fill="none" stroke="#009980" strokeWidth="2"/>
      <text x="0" y="-62" textAnchor="middle" fontSize="12" fill="#004d40" fontWeight="900">🔬</text>
      <circle cx="-32" cy="-40" r="5" fill="#00c9b1" stroke="#009980" strokeWidth="1" opacity="0.7"/>
      <circle cx="32" cy="-40" r="5" fill="#00c9b1" stroke="#009980" strokeWidth="1" opacity="0.7"/>
      <ellipse cx="-10" cy="-44" rx={olhoE} ry="7" fill="white" stroke="#555" strokeWidth="1"/>
      <ellipse cx="10" cy="-44" rx={olhoD} ry="7" fill="white" stroke="#555" strokeWidth="1"/>
      <circle cx="-9" cy="-43" r="4" fill="#004d40"/>
      <circle cx="11" cy="-43" r="4" fill="#004d40"/>
      <circle cx="-8" cy="-45" r="1.5" fill="white"/>
      <circle cx="12" cy="-45" r="1.5" fill="white"/>
      <path d="M-15,-52 Q-10,-57 -6,-52" fill="none" stroke="#333" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M6,-52 Q10,-57 15,-52" fill="none" stroke="#333" strokeWidth="2.5" strokeLinecap="round"/>
      <path d={boca} fill="none" stroke="#00796b" strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx="-18" cy="-38" r="6" fill="#80cbc4" opacity="0.5"/>
      <circle cx="18" cy="-38" r="6" fill="#80cbc4" opacity="0.5"/>
      <rect x="-44" y="5" width="22" height="12" rx="6" fill="#00c9b1" stroke="#009980" strokeWidth="1.5" transform="rotate(-14 -33,11)"/>
      <rect x="22" y="5" width="22" height="12" rx="6" fill="#00c9b1" stroke="#009980" strokeWidth="1.5" transform="rotate(14 33,11)"/>
      <circle cx="-49" cy="14" r="8" fill="#00796b" stroke="#004d40" strokeWidth="1.5"/>
      <text x="-49" y="18" textAnchor="middle" fontSize="9" fill="white">🔬</text>
      <circle cx="49" cy="14" r="8" fill="#00796b" stroke="#004d40" strokeWidth="1.5"/>
      <text x="49" y="18" textAnchor="middle" fontSize="9" fill="white">⚗️</text>
      <rect x="-18" y="60" width="15" height="28" rx="7" fill="#00796b" stroke="#004d40" strokeWidth="1.5"/>
      <rect x="3" y="60" width="15" height="28" rx="7" fill="#00796b" stroke="#004d40" strokeWidth="1.5"/>
      <ellipse cx="-10" cy="90" rx="12" ry="7" fill="#004d40" stroke="#003030" strokeWidth="1.5"/>
      <ellipse cx="10" cy="90" rx="12" ry="7" fill="#004d40" stroke="#003030" strokeWidth="1.5"/>
    </svg>
  );
}
