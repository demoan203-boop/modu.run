import { useEffect, useState } from 'react'
import introBg from '../assets/intro-banner.png'
import slideBlackSuit from '../assets/intro-slides/slide-black-suit.png'
import slideBeigeSuit from '../assets/intro-slides/slide-beige-suit.png'
import slideRimless from '../assets/intro-slides/slide-rimless-closeup.png'
import slideWraparound from '../assets/intro-slides/slide-wraparound-closeup.png'
import slideClubmaster from '../assets/intro-slides/slide-clubmaster-closeup.png'

const SLIDES = [introBg, slideBlackSuit, slideBeigeSuit, slideRimless, slideWraparound, slideClubmaster]
const SLIDE_INTERVAL_MS = 4500

export function IntroScreen({ onEnter }: { onEnter: () => void }) {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % SLIDES.length)
    }, SLIDE_INTERVAL_MS)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-end overflow-hidden bg-black text-white">
      {/* 배경 - 슬라이드쇼 (자동 크로스페이드) */}
      {SLIDES.map((slide, index) => (
        <div
          key={slide}
          className={`animate-intro-face-breathe absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out ${
            index === activeIndex ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ backgroundImage: `url(${slide})` }}
          role="img"
          aria-label="MODU.RUN 온라인쇼핑의 혁명 광고 이미지"
        />
      ))}

      {/* 하단 가독성을 위한 어두운 그라데이션 스크림 */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

      {/* 슬라이드 인디케이터 */}
      <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
        {SLIDES.map((slide, index) => (
          <span
            key={slide}
            className={`h-1.5 rounded-full transition-all ${
              index === activeIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/40'
            }`}
          />
        ))}
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
