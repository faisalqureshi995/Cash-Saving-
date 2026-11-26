import React from 'react';
import { RankTierId } from '../types';

interface RankBadgeProps {
  rankId: RankTierId;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLocked?: boolean;
  isCurrent?: boolean;
  className?: string;
}

export const RankBadge: React.FC<RankBadgeProps> = ({
  rankId,
  size = 'md',
  isLocked = false,
  isCurrent = false,
  className = '',
}) => {
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-14 h-14',
    lg: 'w-20 h-20',
    xl: 'w-32 h-32',
  };

  const currentGlow = isCurrent
    ? 'drop-shadow-[0_0_18px_rgba(234,179,8,0.55)] scale-105'
    : '';
  const lockedStyle = isLocked ? 'opacity-35 grayscale contrast-75' : '';

  const renderBadgePath = () => {
    switch (rankId) {
      case 'bronze':
        return (
          <g>
            <defs>
              <linearGradient id="bronzeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#D97706" />
                <stop offset="50%" stopColor="#92400E" />
                <stop offset="100%" stopColor="#451A03" />
              </linearGradient>
              <linearGradient id="bronzeMetal" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FBBF24" />
                <stop offset="100%" stopColor="#78350F" />
              </linearGradient>
            </defs>
            {/* Shield Body */}
            <polygon points="50,6 90,20 84,72 50,96 16,72 10,20" fill="url(#bronzeGrad)" stroke="#B45309" strokeWidth="3" />
            <polygon points="50,14 82,26 78,68 50,88 22,68 18,26" fill="#78350F" opacity="0.6" />
            {/* Center Emblem: Bronze Hammer / Anvil symbol */}
            <path d="M40 32 L60 32 L56 42 L44 42 Z M47 42 L53 42 L52 70 L48 70 Z" fill="url(#bronzeMetal)" />
            {/* Chevron */}
            <path d="M30 65 L50 78 L70 65" fill="none" stroke="#FDE68A" strokeWidth="3" strokeLinecap="round" />
            {/* Star */}
            <polygon points="50,22 52,27 57,27 53,30 55,35 50,32 45,35 47,30 43,27 48,27" fill="#FDE68A" />
          </g>
        );

      case 'silver':
        return (
          <g>
            <defs>
              <linearGradient id="silverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#E2E8F0" />
                <stop offset="50%" stopColor="#94A3B8" />
                <stop offset="100%" stopColor="#475569" />
              </linearGradient>
              <linearGradient id="silverTrim" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="100%" stopColor="#64748B" />
              </linearGradient>
            </defs>
            {/* Shield with Winged notches */}
            <polygon points="50,4 92,18 84,55 72,75 50,96 28,75 16,55 8,18" fill="url(#silverGrad)" stroke="#CBD5E1" strokeWidth="3" />
            <polygon points="50,12 84,24 76,52 66,70 50,86 34,70 24,52 16,24" fill="#334155" opacity="0.5" />
            {/* Crossed silver daggers / dual wing blades */}
            <path d="M34 32 L66 64 M66 32 L34 64" stroke="url(#silverTrim)" strokeWidth="4" strokeLinecap="round" />
            <circle cx="50" cy="48" r="8" fill="#F8FAFC" stroke="#475569" strokeWidth="2" />
            {/* Stars */}
            <circle cx="34" cy="24" r="2.5" fill="#FFFFFF" />
            <circle cx="50" cy="20" r="3.5" fill="#FFFFFF" />
            <circle cx="66" cy="24" r="2.5" fill="#FFFFFF" />
          </g>
        );

      case 'gold':
        return (
          <g>
            <defs>
              <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FEF08A" />
                <stop offset="35%" stopColor="#F59E0B" />
                <stop offset="80%" stopColor="#B45309" />
                <stop offset="100%" stopColor="#78350F" />
              </linearGradient>
              <radialGradient id="goldSun" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FEF9C3" />
                <stop offset="100%" stopColor="#EAB308" />
              </radialGradient>
            </defs>
            {/* Radiant Sunburst points behind shield */}
            <polygon points="50,2 54,16 66,8 64,22 78,18 70,30 84,32 72,42 84,50 70,54 80,66 66,66 70,80 56,76 50,90 44,76 30,80 34,66 20,66 30,54 16,50 28,42 16,32 30,30 22,18 36,22 34,8 46,16" fill="#FBBF24" opacity="0.4" />
            {/* Main Gold Crest */}
            <polygon points="50,6 88,22 80,70 50,94 20,70 12,22" fill="url(#goldGrad)" stroke="#FEF08A" strokeWidth="3" />
            <polygon points="50,14 80,28 72,66 50,86 28,66 20,28" fill="#78350F" opacity="0.45" />
            {/* Golden Star Center */}
            <polygon points="50,30 55,42 68,43 57,51 61,64 50,56 39,64 43,51 32,43 45,42" fill="url(#goldSun)" stroke="#FFFBEB" strokeWidth="1.5" />
            <circle cx="50" cy="48" r="4" fill="#FFFFFF" />
          </g>
        );

      case 'platinum':
        return (
          <g>
            <defs>
              <linearGradient id="platGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#E0F2FE" />
                <stop offset="40%" stopColor="#38BDF8" />
                <stop offset="85%" stopColor="#0284C7" />
                <stop offset="100%" stopColor="#0C4A6E" />
              </linearGradient>
            </defs>
            {/* Geometric Futuristic Crest */}
            <polygon points="50,4 86,16 94,46 80,80 50,96 20,80 6,46 14,16" fill="url(#platGrad)" stroke="#BAE6FD" strokeWidth="3" />
            <polygon points="50,12 80,22 86,46 74,74 50,88 26,74 14,46 20,22" fill="#082F49" opacity="0.5" />
            {/* Platinum Diamond prism center */}
            <polygon points="50,24 68,42 50,74 32,42" fill="#E0F2FE" stroke="#38BDF8" strokeWidth="2" />
            <polygon points="50,24 50,74 32,42" fill="#7DD3FC" opacity="0.7" />
            <polygon points="50,24 68,42 50,74" fill="#BAE6FD" opacity="0.9" />
            <circle cx="50" cy="44" r="3" fill="#FFFFFF" />
          </g>
        );

      case 'diamond':
        return (
          <g>
            <defs>
              <linearGradient id="diamondGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#CFFAFE" />
                <stop offset="40%" stopColor="#06B6D4" />
                <stop offset="80%" stopColor="#0E7490" />
                <stop offset="100%" stopColor="#164E63" />
              </linearGradient>
              <linearGradient id="gemReflect" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ECFEFF" />
                <stop offset="100%" stopColor="#67E8F9" />
              </linearGradient>
            </defs>
            {/* Outer Diamond Wing Brackets */}
            <polygon points="50,2 96,38 78,88 50,98 22,88 4,38" fill="url(#diamondGrad)" stroke="#A5F3FC" strokeWidth="3" />
            {/* Brilliant Cut Gem Shape */}
            <polygon points="32,24 68,24 84,44 50,84 16,44" fill="url(#gemReflect)" stroke="#E0F2FE" strokeWidth="2" />
            {/* Facets */}
            <line x1="32" y1="24" x2="50" y2="44" stroke="#0891B2" strokeWidth="1.5" />
            <line x1="68" y1="24" x2="50" y2="44" stroke="#0891B2" strokeWidth="1.5" />
            <line x1="16" y1="44" x2="84" y2="44" stroke="#0891B2" strokeWidth="1.5" />
            <line x1="50" y1="44" x2="50" y2="84" stroke="#0891B2" strokeWidth="2" />
            <line x1="16" y1="44" x2="50" y2="44" stroke="#0891B2" strokeWidth="1.5" />
            <polygon points="44,24 56,24 50,44" fill="#FFFFFF" opacity="0.8" />
          </g>
        );

      case 'crown':
        return (
          <g>
            <defs>
              <linearGradient id="crownGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F3E8FF" />
                <stop offset="30%" stopColor="#A855F7" />
                <stop offset="80%" stopColor="#6B21A8" />
                <stop offset="100%" stopColor="#3B0764" />
              </linearGradient>
              <linearGradient id="goldCrownTrim" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#F59E0B" />
                <stop offset="50%" stopColor="#FDE047" />
                <stop offset="100%" stopColor="#F59E0B" />
              </linearGradient>
            </defs>
            {/* Regal Shield */}
            <polygon points="50,4 92,20 84,72 50,96 16,72 8,20" fill="url(#crownGrad)" stroke="#E9D5FF" strokeWidth="3" />
            <polygon points="50,14 84,28 76,66 50,86 24,66 16,28" fill="#3B0764" opacity="0.6" />
            {/* Grand Imperial Crown */}
            <polygon points="20,54 26,30 38,44 50,22 62,44 74,30 80,54" fill="url(#goldCrownTrim)" stroke="#FEF08A" strokeWidth="2" />
            <rect x="20" y="54" width="60" height="12" rx="3" fill="#D97706" stroke="#FEF08A" strokeWidth="1.5" />
            {/* Crown Jewels */}
            <circle cx="26" cy="30" r="3" fill="#EF4444" stroke="#FFFFFF" strokeWidth="1" />
            <circle cx="50" cy="22" r="4" fill="#3B82F6" stroke="#FFFFFF" strokeWidth="1.5" />
            <circle cx="74" cy="30" r="3" fill="#EF4444" stroke="#FFFFFF" strokeWidth="1" />
            <circle cx="35" cy="60" r="2.5" fill="#10B981" />
            <circle cx="50" cy="60" r="3" fill="#EC4899" />
            <circle cx="65" cy="60" r="2.5" fill="#10B981" />
          </g>
        );

      case 'ace':
        return (
          <g>
            <defs>
              <linearGradient id="aceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FECDD3" />
                <stop offset="35%" stopColor="#E11D48" />
                <stop offset="80%" stopColor="#9F1239" />
                <stop offset="100%" stopColor="#4C0519" />
              </linearGradient>
            </defs>
            {/* Aggressive Blade Crest */}
            <polygon points="50,2 96,16 88,48 76,78 50,98 24,78 12,48 4,16" fill="url(#aceGrad)" stroke="#FDA4AF" strokeWidth="3" />
            {/* Upright Blazing Broadsword */}
            <path d="M50 14 L54 62 L50 68 L46 62 Z" fill="#FFFFFF" stroke="#BE123C" strokeWidth="1" />
            <path d="M36 62 L64 62 L62 67 L38 67 Z" fill="#FBBF24" />
            <rect x="48" y="67" width="4" height="14" rx="1" fill="#78350F" />
            <circle cx="50" cy="83" r="3.5" fill="#FBBF24" />
            {/* Dual Fire Wings */}
            <path d="M50 38 Q74 24 82 46 Q68 56 50 62 Z" fill="#F43F5E" opacity="0.8" />
            <path d="M50 38 Q26 24 18 46 Q32 56 50 62 Z" fill="#F43F5E" opacity="0.8" />
            {/* Triple Ace Stars */}
            <polygon points="50,20 52,24 57,24 53,27 55,31 50,28 45,31 47,27 43,24 48,24" fill="#FEF08A" />
            <polygon points="34,34 35,37 39,37 36,39 37,42 34,40 31,42 32,39 29,37 33,37" fill="#FEF08A" />
            <polygon points="66,34 67,37 71,37 68,39 69,42 66,40 63,42 64,39 61,37 65,37" fill="#FEF08A" />
          </g>
        );

      case 'master':
        return (
          <g>
            <defs>
              <linearGradient id="masterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F5D0FE" />
                <stop offset="35%" stopColor="#A21CAF" />
                <stop offset="80%" stopColor="#701A75" />
                <stop offset="100%" stopColor="#4A044E" />
              </linearGradient>
              <linearGradient id="masterGold" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FEF08A" />
                <stop offset="100%" stopColor="#EAB308" />
              </linearGradient>
            </defs>
            {/* Hexagonal Master Sigil */}
            <polygon points="50,2 94,22 94,70 50,98 6,70 6,22" fill="url(#masterGrad)" stroke="#F0ABFC" strokeWidth="3" />
            <polygon points="50,10 86,28 86,66 50,90 14,66 14,28" fill="#3B0764" opacity="0.6" />
            {/* Mystic 8-Point Star */}
            <polygon points="50,18 57,35 74,32 63,46 75,58 58,58 50,74 42,58 25,58 37,46 26,32 43,35" fill="url(#masterGold)" stroke="#FFFFFF" strokeWidth="1.5" />
            <circle cx="50" cy="46" r="8" fill="#581C87" stroke="#FEF08A" strokeWidth="2" />
            <circle cx="50" cy="46" r="4" fill="#F43F5E" />
            {/* 4 corner orbs */}
            <circle cx="28" cy="28" r="3" fill="#FDE047" />
            <circle cx="72" cy="28" r="3" fill="#FDE047" />
            <circle cx="28" cy="66" r="3" fill="#FDE047" />
            <circle cx="72" cy="66" r="3" fill="#FDE047" />
          </g>
        );

      case 'conqueror':
        return (
          <g>
            <defs>
              <linearGradient id="conqGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FEF08A" />
                <stop offset="25%" stopColor="#F59E0B" />
                <stop offset="50%" stopColor="#EAB308" />
                <stop offset="75%" stopColor="#B45309" />
                <stop offset="100%" stopColor="#78350F" />
              </linearGradient>
              <linearGradient id="pureGold" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="30%" stopColor="#FDE047" />
                <stop offset="100%" stopColor="#CA8A04" />
              </linearGradient>
              <radialGradient id="conqHalo" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#EAB308" stopOpacity="0" />
              </radialGradient>
            </defs>
            {/* Glorious Halo */}
            <circle cx="50" cy="50" r="46" fill="url(#conqHalo)" />
            {/* Majestic Golden Laurel Wreath */}
            <path d="M12 50 C10 25, 30 10, 50 8 C70 10, 90 25, 88 50 C86 76, 68 94, 50 96 C32 94, 14 76, 12 50" fill="none" stroke="#FDE047" strokeWidth="3" strokeDasharray="4 3" />
            {/* Grand Mythic Crest */}
            <polygon points="50,4 95,20 86,72 50,96 14,72 5,20" fill="url(#conqGrad)" stroke="#FFFFFF" strokeWidth="3.5" />
            {/* Double Eagle Wings */}
            <path d="M50 36 C68 18 90 24 88 52 C72 58 58 64 50 78 C42 64 28 58 12 52 C10 24 32 18 50 36 Z" fill="url(#pureGold)" stroke="#78350F" strokeWidth="1.5" />
            {/* Center Conqueror Star */}
            <polygon points="50,28 54,38 65,39 56,46 59,57 50,51 41,57 44,46 35,39 46,38" fill="#FFFFFF" stroke="#D97706" strokeWidth="1.5" />
            <circle cx="50" cy="46" r="3.5" fill="#EF4444" stroke="#FFFFFF" strokeWidth="1" />
            {/* 100K Ribbon Banner */}
            <rect x="22" y="74" width="56" height="14" rx="4" fill="#991B1B" stroke="#FDE047" strokeWidth="2" />
            <text x="50" y="84" textAnchor="middle" fill="#FEF08A" fontSize="8" fontWeight="bold" fontFamily="sans-serif">
              100K
            </text>
          </g>
        );
    }
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 transition-all duration-300 ${sizeMap[size]} ${currentGlow} ${lockedStyle} ${className}`}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full overflow-visible filter drop-shadow-md"
      >
        {renderBadgePath()}
      </svg>
      {isCurrent && (
        <span
          className="absolute -top-1 -right-1 flex h-3 w-3"
          title="Current Rank"
        >
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
        </span>
      )}
    </div>
  );
};
