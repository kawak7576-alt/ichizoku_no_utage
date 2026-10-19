import React, { useState, useEffect } from 'react';
import { CharacterId } from '../types/game.ts';
import { useCharacterAvatars } from '../hooks/useCharacterAvatars.ts';

export type AvatarVariant =
  | CharacterId
  | 'head'
  | 'sickroom'
  | 'phantom_thief'
  | 'kitsune'
  | 'grandfather'
  | 'unknown';

interface CharacterAvatarProps {
  variant: AvatarVariant;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showNameplate?: boolean;
  nameplateText?: string;
  subText?: string;
  isHost?: boolean;
  isConnected?: boolean;
  isReady?: boolean;
  isSelected?: boolean;
  className?: string;
}

// Color schemes matching the 9 character medallions
const AVATAR_CONFIGS: Record<
  AvatarVariant,
  {
    bgGradient: string;
    silhouetteColor: string;
    skinColor: string;
    accentColor: string;
    defaultName: string;
    defaultSub: string;
    iconType: string;
  }
> = {
  head: {
    bgGradient: 'from-amber-700 via-yellow-900 to-stone-950',
    silhouetteColor: '#382a17',
    skinColor: '#edd8c7',
    accentColor: '#fbbf24',
    defaultName: '当主',
    defaultSub: '一族の主',
    iconType: 'mustache_head',
  },
  grandfather: {
    bgGradient: 'from-amber-700 via-yellow-900 to-stone-950',
    silhouetteColor: '#382a17',
    skinColor: '#edd8c7',
    accentColor: '#fbbf24',
    defaultName: '当主',
    defaultSub: '一族の主',
    iconType: 'mustache_head',
  },
  eldest_son: {
    bgGradient: 'from-emerald-800 via-teal-950 to-stone-950',
    silhouetteColor: '#173623',
    skinColor: '#f5dfd2',
    accentColor: '#34d399',
    defaultName: '長男',
    defaultSub: '',
    iconType: 'vest_male',
  },
  eldest_daughter: {
    bgGradient: 'from-rose-900 via-pink-950 to-stone-950',
    silhouetteColor: '#3d1622',
    skinColor: '#f7e5d8',
    accentColor: '#f43f5e',
    defaultName: '長女',
    defaultSub: '',
    iconType: 'updo_pearls',
  },
  second_son: {
    bgGradient: 'from-blue-900 via-sky-950 to-stone-950',
    silhouetteColor: '#162846',
    skinColor: '#eed7c5',
    accentColor: '#60a5fa',
    defaultName: '次男',
    defaultSub: '',
    iconType: 'suit_male',
  },
  second_daughter: {
    bgGradient: 'from-purple-900 via-violet-950 to-stone-950',
    silhouetteColor: '#33183d',
    skinColor: '#f5e3d4',
    accentColor: '#c084fc',
    defaultName: '次女',
    defaultSub: '',
    iconType: 'wavy_brooch',
  },
  third_son: {
    bgGradient: 'from-amber-950 via-yellow-950 to-stone-950',
    silhouetteColor: '#3a2b15',
    skinColor: '#edd5c1',
    accentColor: '#f59e0b',
    defaultName: '三男',
    defaultSub: '',
    iconType: 'bowtie_male',
  },
  third_daughter: {
    bgGradient: 'from-teal-900 via-emerald-950 to-stone-950',
    silhouetteColor: '#133333',
    skinColor: '#f6e4d7',
    accentColor: '#2dd4bf',
    defaultName: '三女',
    defaultSub: '',
    iconType: 'twintail_ribbon',
  },
  phantom_thief: {
    bgGradient: 'from-purple-900 via-stone-950 to-black',
    silhouetteColor: '#2b1338',
    skinColor: '#f0e0d6',
    accentColor: '#d8b4fe',
    defaultName: '怪盗',
    defaultSub: '変装者',
    iconType: 'mask_hat',
  },
  kitsune: {
    bgGradient: 'from-orange-950 via-red-950 to-stone-950',
    silhouetteColor: '#421f14',
    skinColor: '#fcebe1',
    accentColor: '#f97316',
    defaultName: '妖狐',
    defaultSub: '妖異',
    iconType: 'kitsune_ears',
  },
  sickroom: {
    bgGradient: 'from-stone-900 via-stone-950 to-black',
    silhouetteColor: '#262626',
    skinColor: '#d6cfc7',
    accentColor: '#9ca3af',
    defaultName: '療養室',
    defaultSub: '休んでいる人物',
    iconType: 'blanket_resting',
  },
  unknown: {
    bgGradient: 'from-stone-900 via-stone-950 to-black',
    silhouetteColor: '#262626',
    skinColor: '#ded8d3',
    accentColor: '#a8a29e',
    defaultName: '未割当',
    defaultSub: '客人',
    iconType: 'silhouette',
  },
};

export function CharacterAvatar({
  variant,
  size = 'md',
  showNameplate = true,
  nameplateText,
  subText,
  isHost = false,
  isConnected,
  isReady,
  isSelected = false,
  className = '',
}: CharacterAvatarProps) {
  const { avatars } = useCharacterAvatars();
  const [imgLoadFailed, setImgLoadFailed] = useState(false);

  const config = AVATAR_CONFIGS[variant] || AVATAR_CONFIGS.unknown;

  // Check if we have a cropped custom image for this variant
  const customImg = !imgLoadFailed ? (avatars[variant] || (variant === 'grandfather' ? avatars['head'] : undefined)) : undefined;

  useEffect(() => {
    setImgLoadFailed(false);
  }, [variant, avatars]);

  const sizeClasses = {
    xs: { circle: 'w-9 h-9', plate: 'text-[9px] px-1 py-0.2 min-w-[54px]' },
    sm: { circle: 'w-12 h-12', plate: 'text-[10px] px-1.5 py-0.5 min-w-[64px]' },
    md: { circle: 'w-16 h-16 sm:w-20 sm:h-20', plate: 'text-xs px-2 py-0.5 min-w-[80px]' },
    lg: { circle: 'w-24 h-24 sm:w-28 sm:h-28', plate: 'text-xs px-2.5 py-1 min-w-[96px]' },
    xl: { circle: 'w-32 h-32 sm:w-36 sm:h-36', plate: 'text-sm px-3 py-1 min-w-[120px]' },
  }[size];

  const displayName = nameplateText ?? config.defaultName;
  const displaySub = subText ?? config.defaultSub;

  return (
    <div className={`inline-flex flex-col items-center select-none ${className}`}>
      {/* Circular Avatar Frame */}
      <div className="relative group">
        {/* Outer Glow when selected */}
        {isSelected && (
          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 blur-sm opacity-80 animate-pulse" />
        )}

        {/* The Golden Border Circle with Ornate Victorian Trim */}
        <div
          className={`relative ${sizeClasses.circle} rounded-full overflow-hidden p-[2px] box-border flex items-center justify-center transition-transform duration-200 ${
            isSelected ? 'scale-105' : ''
          }`}
          style={{
            background:
              'linear-gradient(135deg, #fce085 0%, #caa44f 35%, #593c12 70%, #f0d57e 100%)',
            boxShadow: isSelected
              ? '0 0 16px rgba(234, 179, 8, 0.7), inset 0 1px 2px rgba(255, 255, 255, 0.5)'
              : '0 4px 12px rgba(0, 0, 0, 0.8), inset 0 1px 2px rgba(255, 255, 255, 0.3)',
          }}
        >
          {/* Inner Colored Stage or Cropped Image */}
          {customImg ? (
            <div className="w-full h-full rounded-full overflow-hidden bg-stone-950 flex items-center justify-center">
              <img
                src={customImg}
                alt={displayName}
                referrerPolicy="no-referrer"
                onError={() => setImgLoadFailed(true)}
                className="w-full h-full object-cover object-center block"
              />
            </div>
          ) : (
            <div
              className={`w-full h-full rounded-full bg-gradient-to-b ${config.bgGradient} flex items-center justify-center relative overflow-hidden`}
            >
              {/* Ambient radial glow inside portrait */}
              <div
                className="absolute inset-0 opacity-40 pointer-events-none"
                style={{
                  background: `radial-gradient(circle at 50% 30%, ${config.accentColor}, transparent 70%)`,
                }}
              />

              {/* Vector Faceless Silhouette Artwork - Centered & Calibrated */}
              <svg
                viewBox="0 0 100 100"
                className="w-full h-full pointer-events-none"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Torso / Clothing */}
                <path
                  d="M15 100 C15 73, 32 69, 50 69 C68 69, 85 73, 85 100 Z"
                  fill={config.silhouetteColor}
                />
                {/* Collar */}
                <path
                  d="M38 71 L50 83 L62 71 L55 69 L50 73 L45 69 Z"
                  fill="#121212"
                  stroke="#caa44f"
                  strokeWidth="1"
                />
                {/* Neck */}
                <path
                  d="M45 56 L45 71 C47 73, 53 73, 55 71 L55 56 Z"
                  fill={config.skinColor}
                />
                {/* Faceless Head Shape (目や口のない顔) */}
                <ellipse
                  cx="50"
                  cy="46"
                  rx="17"
                  ry="21"
                  fill={config.skinColor}
                  stroke="#614a34"
                  strokeWidth="0.75"
                />

                {/* Character-specific hairstyles and props - Exactly Centered */}
                {config.iconType === 'vest_male' && (
                  <>
                    {/* Eldest Son - Parted hair & green waistcoat */}
                    <path
                      d="M29 44 C29 23, 71 23, 71 44 C67 30, 58 26, 50 26 C42 26, 33 30, 29 44 Z"
                      fill="#3d2a1b"
                    />
                    <path d="M42 69 L50 77 L58 69 Z" fill="#1b4d2e" stroke="#caa44f" strokeWidth="0.8" />
                  </>
                )}

                {config.iconType === 'suit_male' && (
                  <>
                    {/* Second Son - Neat dark hair, suit & red tie */}
                    <path
                      d="M28 43 C28 23, 72 23, 72 43 C67 29, 59 26, 50 26 C41 26, 33 29, 28 43 Z"
                      fill="#191919"
                    />
                    <path d="M48 71 L52 71 L51.5 86 L48.5 86 Z" fill="#b91c1c" />
                  </>
                )}

                {config.iconType === 'updo_pearls' && (
                  <>
                    {/* Eldest Daughter - High updo bun & pearl necklace */}
                    <ellipse cx="50" cy="23" rx="13" ry="10" fill="#2d1c15" />
                    <path
                      d="M29 44 C27 30, 35 25, 50 25 C65 25, 73 30, 71 44 C68 35, 58 31, 50 31 C42 31, 32 35, 29 44 Z"
                      fill="#2d1c15"
                    />
                    {/* Pearl necklace centered */}
                    <ellipse cx="44" cy="65" rx="2" ry="2" fill="#fff" />
                    <ellipse cx="50" cy="66" rx="2.2" ry="2.2" fill="#fff" />
                    <ellipse cx="56" cy="65" rx="2" ry="2" fill="#fff" />
                  </>
                )}

                {config.iconType === 'wavy_brooch' && (
                  <>
                    {/* Second Daughter - Long wavy auburn hair & brooch */}
                    <path
                      d="M26 48 C24 32, 32 24, 50 24 C68 24, 76 32, 74 48 C72 62, 76 74, 78 84 C72 82, 68 70, 66 60 C64 36, 58 32, 50 32 C42 32, 36 36, 34 60 C32 70, 28 82, 22 84 C24 74, 28 62, 26 48 Z"
                      fill="#4a2518"
                    />
                    <circle cx="50" cy="72" r="3" fill="#caa44f" stroke="#8b5cf6" strokeWidth="1" />
                  </>
                )}

                {config.iconType === 'mustache_head' && (
                  <>
                    {/* Head / 当主 - Combed back white hair & prominent white handlebar mustache */}
                    <path
                      d="M28 44 C28 23, 72 23, 72 44 C67 26, 58 24, 50 24 C42 24, 33 26, 28 44 Z"
                      fill="#e2e8f0"
                    />
                    {/* White Handlebar Mustache - Perfectly Symmetrical */}
                    <path
                      d="M50 49 C46 47, 34 46, 34 52 C32 55, 36 57, 40 54 C46 51, 48 50, 50 52 C52 50, 54 51, 60 54 C64 57, 68 55, 66 52 C66 46, 54 47, 50 49 Z"
                      fill="#f8fafc"
                      stroke="#94a3b8"
                      strokeWidth="0.6"
                    />
                    {/* Pocket watch chain */}
                    <path d="M35 84 Q50 92 65 84" stroke="#d4af37" strokeWidth="1.2" fill="none" />
                  </>
                )}

                {config.iconType === 'bowtie_male' && (
                  <>
                    {/* Third Son - Youthful parted dark hair, vest & gold bowtie */}
                    <path
                      d="M29 43 C29 23, 71 23, 71 43 C67 29, 58 25, 50 25 C42 25, 33 29, 29 43 Z"
                      fill="#2a1f18"
                    />
                    {/* Gold bowtie centered */}
                    <polygon points="44,70 50,72 44,74" fill="#caa44f" />
                    <polygon points="56,70 50,72 56,74" fill="#caa44f" />
                    <circle cx="50" cy="72" r="1.5" fill="#f59e0b" />
                    <path d="M48 76 L52 76 L51.5 90 L48.5 90 Z" fill="#78350f" />
                  </>
                )}

                {config.iconType === 'twintail_ribbon' && (
                  <>
                    {/* Third Daughter - Twin ribbons, soft bangs & emerald brooches */}
                    <path
                      d="M28 44 C26 30, 34 24, 50 24 C66 24, 74 30, 72 44 C70 36, 58 32, 50 32 C42 32, 30 36, 28 44 Z"
                      fill="#1f2937"
                    />
                    {/* Left & right hair ribbons symmetrical */}
                    <polygon points="26,42 20,38 24,46" fill="#2dd4bf" stroke="#caa44f" strokeWidth="0.6" />
                    <polygon points="74,42 80,38 76,46" fill="#2dd4bf" stroke="#caa44f" strokeWidth="0.6" />
                    {/* Small emerald brooch */}
                    <circle cx="50" cy="68" r="2.5" fill="#14b8a6" stroke="#caa44f" strokeWidth="0.8" />
                  </>
                )}

                {config.iconType === 'blanket_resting' && (
                  <>
                    <path
                      d="M32 40 C32 26, 68 26, 68 40 C66 32, 58 30, 50 30 C42 30, 34 32, 32 40 Z"
                      fill="#1f1f1f"
                    />
                    <rect x="36" y="41" width="28" height="6" rx="2" fill="#3f3f46" stroke="#9ca3af" strokeWidth="0.75" />
                  </>
                )}

                {config.iconType === 'mask_hat' && (
                  <>
                    <path
                      d="M20 32 C35 15, 65 15, 80 32 L70 30 C58 24, 42 24, 30 30 Z"
                      fill="#1e1026"
                      stroke="#caa44f"
                      strokeWidth="0.8"
                    />
                    <path
                      d="M34 43 C38 41, 46 41, 49 45 L50 45 L51 45 C54 41, 62 41, 66 43 C64 47, 57 48, 50 48 C43 48, 36 47, 34 43 Z"
                      fill="#0f0714"
                      stroke="#caa44f"
                      strokeWidth="1"
                    />
                  </>
                )}

                {config.iconType === 'kitsune_ears' && (
                  <>
                    <polygon points="34,26 38,10 48,22" fill="#5c2616" stroke="#caa44f" strokeWidth="0.8" />
                    <polygon points="66,26 62,10 52,22" fill="#5c2616" stroke="#caa44f" strokeWidth="0.8" />
                    <polygon points="36,24 39,14 45,22" fill="#f97316" />
                    <polygon points="64,24 61,14 55,22" fill="#f97316" />
                  </>
                )}

                {config.iconType === 'silhouette' && (
                  <path
                    d="M32 40 C32 24, 68 24, 68 40 C66 30, 58 28, 50 28 C42 28, 34 30, 32 40 Z"
                    fill="#292524"
                  />
                )}
              </svg>
            </div>
          )}
        </div>

        {/* Status Badges */}
        {isHost && (
          <div
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-stone-950 border border-amber-400 flex items-center justify-center shadow-md text-[10px]"
            title="ホスト"
          >
            👑
          </div>
        )}
        {isConnected === false && (
          <div
            className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-red-600 border border-stone-900 flex items-center justify-center shadow"
            title="切断中"
          >
            <span className="w-1.5 h-1.5 bg-white rounded-full" />
          </div>
        )}
        {isReady && (
          <div
            className="absolute -bottom-1 -left-1 w-4 h-4 rounded-full bg-emerald-600 border border-stone-900 flex items-center justify-center shadow text-[9px] text-white font-bold"
            title="準備完了"
          >
            ✓
          </div>
        )}
      </div>

      {/* Black Nameplate with Fine Gold Border (黒いネームプレート) */}
      {showNameplate && (
        <div
          className={`mt-1.5 ${sizeClasses.plate} bg-stone-950/95 border border-amber-500/70 rounded-md shadow-md text-center flex flex-col items-center justify-center leading-tight`}
          style={{
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(234, 179, 8, 0.2)',
          }}
        >
          <span className="font-serif font-bold text-amber-200 tracking-wider truncate max-w-full">
            {displayName}
          </span>
          {displaySub && (
            <span className="text-[10px] text-stone-400 font-sans tracking-tight truncate max-w-full">
              {displaySub}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
