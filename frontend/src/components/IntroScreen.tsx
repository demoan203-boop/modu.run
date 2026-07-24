import introBg from '../assets/intro-banner.png'

export function IntroScreen({ onEnter }: { onEnter: () => void }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-end overflow-hidden bg-black text-white">
      {/* 배경 - MODU.RUN 광고 이미지 (숨쉬듯 서서히 확대) */}
      <div
        className="animate-intro-face-breathe absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${introBg})` }}
        role="img"
        aria-label="MODU.RUN 온라인쇼핑의 혁명 광고 이미지"
      />

      {/* 하단 가독성을 위한 어두운 그라데이션 스크림 */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

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
