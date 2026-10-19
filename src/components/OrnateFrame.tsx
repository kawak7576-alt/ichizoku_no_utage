import React from 'react';

/**
 * Victorian corner flourish SVG component
 * Replicates the ornamental antique gold corners from classic mystery adventure frames.
 */
export function OrnateCorner({
  className = 'w-5 h-5 text-amber-500/80',
  position = 'top-left',
}: {
  className?: string;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}) {
  const rotationClass = {
    'top-left': '',
    'top-right': 'rotate-90',
    'bottom-right': 'rotate-180',
    'bottom-left': '-rotate-90',
  }[position];

  return (
    <svg
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} ${rotationClass} pointer-events-none select-none`}
    >
      {/* Outer corner lines */}
      <path
        d="M2 26V9C2 5.134 5.134 2 9 2H26"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      {/* Inner hairline corner */}
      <path
        d="M5 26V11C5 7.686 7.686 5 11 5H26"
        stroke="currentColor"
        strokeWidth="0.8"
        strokeOpacity="0.6"
        strokeLinecap="round"
      />
      {/* Corner diagonal knot & diamond */}
      <path
        d="M2 2L8 8"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <polygon
        points="10,6 12,8 10,10 8,8"
        fill="currentColor"
      />
      {/* Delicate Victorian spiral loops */}
      <path
        d="M2 16C4 16 5.5 14.5 5.5 12.5C5.5 10.5 3.5 9.5 3 9.5"
        stroke="currentColor"
        strokeWidth="0.9"
        strokeLinecap="round"
      />
      <path
        d="M16 2C16 4 14.5 5.5 12.5 5.5C10.5 5.5 9.5 3.5 9.5 3"
        stroke="currentColor"
        strokeWidth="0.9"
        strokeLinecap="round"
      />
      <circle cx="3.5" cy="3.5" r="1" fill="currentColor" />
    </svg>
  );
}

/**
 * Ornate Horizontal Flourish Divider
 */
export function OrnateDivider({
  className = 'my-2',
  symbol = '⚜',
}: {
  className?: string;
  symbol?: string;
}) {
  return (
    <div
      className={`flex items-center justify-center gap-2 select-none pointer-events-none ${className}`}
    >
      <span className="h-[1px] bg-gradient-to-r from-transparent via-amber-600/50 to-amber-500/80 flex-1 max-w-[120px]" />
      <span className="text-amber-500/90 text-xs font-serif scale-110 tracking-widest px-1">
        {symbol}
      </span>
      <span className="h-[1px] bg-gradient-to-l from-transparent via-amber-600/50 to-amber-500/80 flex-1 max-w-[120px]" />
    </div>
  );
}

interface OrnatePanelProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'gold' | 'purple' | 'amber' | 'emerald' | 'subtle';
  showCorners?: boolean;
  innerBorder?: boolean;
}

/**
 * OrnatePanel Component
 * Wraps content in a dark antique panel with Victorian double borders and corner flourishes.
 */
export function OrnatePanel({
  children,
  variant = 'gold',
  showCorners = true,
  innerBorder = true,
  className = '',
  ...props
}: OrnatePanelProps) {
  const variantStyles = {
    gold: {
      border: 'border-amber-600/60 shadow-[0_10px_35px_-5px_rgba(0,0,0,0.85)]',
      inner: 'border-amber-500/20',
      corner: 'text-amber-400/90',
      bg: 'bg-stone-950/90',
    },
    purple: {
      border: 'border-purple-600/60 shadow-[0_10px_35px_-5px_rgba(20,0,30,0.85)]',
      inner: 'border-purple-500/25',
      corner: 'text-purple-400/90',
      bg: 'bg-stone-950/90',
    },
    amber: {
      border: 'border-amber-500/70 shadow-[0_10px_35px_-5px_rgba(30,15,0,0.85)]',
      inner: 'border-amber-400/25',
      corner: 'text-amber-300/90',
      bg: 'bg-stone-950/90',
    },
    emerald: {
      border: 'border-emerald-600/60 shadow-[0_10px_35px_-5px_rgba(0,25,15,0.85)]',
      inner: 'border-emerald-500/25',
      corner: 'text-emerald-400/90',
      bg: 'bg-stone-950/90',
    },
    subtle: {
      border: 'border-stone-800 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.8)]',
      inner: 'border-stone-800/60',
      corner: 'text-amber-600/50',
      bg: 'bg-stone-950/80',
    },
  }[variant];

  return (
    <div
      className={`relative rounded-xl border backdrop-blur-md transition-all ${variantStyles.border} ${variantStyles.bg} ${className}`}
      {...props}
    >
      {/* Inner hairline border */}
      {innerBorder && (
        <div
          className={`absolute inset-[3px] rounded-lg border pointer-events-none ${variantStyles.inner}`}
        />
      )}

      {/* Victorian corner flourishes */}
      {showCorners && (
        <>
          <div className="absolute top-1 left-1 pointer-events-none">
            <OrnateCorner position="top-left" className={`w-4 h-4 sm:w-5 sm:h-5 ${variantStyles.corner}`} />
          </div>
          <div className="absolute top-1 right-1 pointer-events-none">
            <OrnateCorner position="top-right" className={`w-4 h-4 sm:w-5 sm:h-5 ${variantStyles.corner}`} />
          </div>
          <div className="absolute bottom-1 left-1 pointer-events-none">
            <OrnateCorner position="bottom-left" className={`w-4 h-4 sm:w-5 sm:h-5 ${variantStyles.corner}`} />
          </div>
          <div className="absolute bottom-1 right-1 pointer-events-none">
            <OrnateCorner position="bottom-right" className={`w-4 h-4 sm:w-5 sm:h-5 ${variantStyles.corner}`} />
          </div>
        </>
      )}

      {/* Children content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
