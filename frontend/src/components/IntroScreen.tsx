export function IntroScreen({ onEnter }: { onEnter: () => void }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-between overflow-hidden bg-[#120c2e] text-white">
      {/* 배경 - 대각선 색면 블로킹 */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-1/3 top-0 h-full w-[65%] -skew-x-12 bg-gradient-to-b from-[#6d28d9] via-[#4c1d95] to-[#120c2e] opacity-70" />
        <div className="absolute -right-1/4 top-0 h-[60%] w-[60%] skew-x-12 bg-gradient-to-bl from-[#f59e0b] via-[#f97316]/70 to-transparent opacity-60" />
        <div className="absolute bottom-0 left-0 h-[35%] w-full bg-gradient-to-t from-[#0ea5a4]/30 to-transparent" />
      </div>

      {/* 추상 초상 - 색면 슬라이스 얼굴 */}
      <div className="relative mt-14 flex flex-1 items-center justify-center sm:mt-16">
        <svg
          viewBox="0 0 300 360"
          className="h-72 w-60 drop-shadow-2xl sm:h-[26rem] sm:w-80"
          role="img"
          aria-label="MODU 추상 초상"
        >
          <defs>
            <clipPath id="portrait">
              <ellipse cx="150" cy="140" rx="105" ry="135" />
              <path d="M 60 240 L 240 240 L 210 340 L 90 340 Z" />
            </clipPath>
          </defs>

          <g clipPath="url(#portrait)">
            <rect x="0" y="0" width="300" height="65" fill="#fef3c7" />
            <rect x="0" y="65" width="300" height="60" fill="#2e2a5c" transform="skewY(-4)" />
            <rect x="0" y="125" width="300" height="70" fill="#fef3c7" transform="skewY(3)" />
            <rect x="0" y="195" width="300" height="40" fill="#f97316" transform="skewY(-3)" />
            <rect x="0" y="235" width="300" height="50" fill="#fef3c7" />
            <rect x="0" y="285" width="300" height="75" fill="#0ea5a4" transform="skewY(4)" />
          </g>

          {/* 눈 */}
          <ellipse cx="107" cy="158" rx="30" ry="18" fill="#fef3c7" stroke="#120c2e" strokeWidth="2" />
          <ellipse cx="193" cy="158" rx="30" ry="18" fill="#fef3c7" stroke="#120c2e" strokeWidth="2" />
          <circle cx="112" cy="158" r="11" fill="#6d28d9" />
          <circle cx="188" cy="158" r="11" fill="#f97316" />

          {/* 입술 */}
          <path
            d="M 105 252 Q 150 242 195 252 Q 150 270 105 252 Z"
            fill="#e11d48"
          />
        </svg>
      </div>

      {/* 하단: 로고 + Enter 버튼 */}
      <div className="relative z-10 mb-12 flex flex-col items-center gap-6 px-4 text-center sm:mb-16">
        <p className="text-sm tracking-[0.3em] text-white/70">AI SHOPPING COMPANION</p>
        <h1 className="text-6xl font-black tracking-tight sm:text-7xl">MODU</h1>

        <button
          type="button"
          onClick={onEnter}
          className="mt-4 flex h-16 w-16 items-center justify-center rounded-full bg-white text-sm font-bold tracking-widest text-[#120c2e] shadow-lg transition hover:scale-105 hover:bg-amber-100 active:scale-95"
        >
          ENTER
        </button>
      </div>
    </div>
  )
}
