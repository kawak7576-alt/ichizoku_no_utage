interface PhantomThiefIconProps {
  className?: string;
  size?: number;
}

export function PhantomThiefIcon({ className = 'w-5 h-5 text-amber-300' }: PhantomThiefIconProps) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="怪盗"
    >
      <defs>
        <linearGradient id="ptHatGrad" x1="12" y1="5" x2="28" y2="20" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3b0764" />
          <stop offset="1" stopColor="#150522" />
        </linearGradient>
        <linearGradient id="ptGold" x1="10" y1="17" x2="30" y2="17" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fbbf24" />
          <stop offset="0.5" stopColor="#f59e0b" />
          <stop offset="1" stopColor="#d97706" />
        </linearGradient>
        <linearGradient id="ptMaskGrad" x1="8" y1="21" x2="32" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1e1026" />
          <stop offset="1" stopColor="#0a050f" />
        </linearGradient>
      </defs>

      {/* Gentleman Silk Top Hat Body */}
      <path
        d="M13 18 L15 6 C15 5 16 4 17 4 L23 4 C24 4 25 5 25 6 L27 18 Z"
        fill="url(#ptHatGrad)"
        stroke="#caa44f"
        strokeWidth="1"
      />

      {/* Top Hat Gold Ribbon */}
      <path
        d="M13.2 15.5 L26.8 15.5 L27 18 L13 18 Z"
        fill="url(#ptGold)"
        stroke="#78350f"
        strokeWidth="0.5"
      />

      {/* Silk Hat Brim (Curved) */}
      <path
        d="M7 19.5 C13 17 27 17 33 19.5 C34.5 20.2 33 21.5 31 21 C25 19.5 15 19.5 9 21 C7 21.5 5.5 20.2 7 19.5 Z"
        fill="#180426"
        stroke="#caa44f"
        strokeWidth="1"
      />

      {/* Phantom Thief Masquerade Mask */}
      <path
        d="M9 25 C10.5 22.5 15 22 18 23.5 C19.2 24.2 20.8 24.2 22 23.5 C25 22 29.5 22.5 31 25 C32 26.8 30.5 30 26.5 30 C23 30 21 27.5 20 27.5 C19 27.5 17 30 13.5 30 C9.5 30 8 26.8 9 25 Z"
        fill="url(#ptMaskGrad)"
        stroke="#caa44f"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />

      {/* Mask Eye Slits - Sharp Mysterious Gaze */}
      <path
        d="M13 25.5 Q15.5 24.5 17 26.2 Q15 27 13 25.5 Z"
        fill="#fbbf24"
      />
      <path
        d="M27 25.5 Q24.5 24.5 23 26.2 Q25 27 27 25.5 Z"
        fill="#fbbf24"
      />

      {/* Monocle chain / jewel accent on right eye */}
      <circle cx="25" cy="25.8" r="3.2" stroke="#f59e0b" strokeWidth="0.8" fill="none" />
      <path d="M28.2 25.8 Q32 29 33 34" stroke="#f59e0b" strokeWidth="0.8" strokeDasharray="1.2 1" fill="none" />

      {/* Collar / Tie peek */}
      <polygon points="18,33 20,36 22,33" fill="#caa44f" />
    </svg>
  );
}
