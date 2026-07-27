import { useEffect, useState } from 'react'

// 0~2s: 빠른 3단 점프컷 줌인 (강한 비트에 맞춘 전환). 2~5s: 슬로우모션 캡 리빌 + 파티클.
const CUT_BOUNDARIES = [700, 1400, 2000]
const TOTAL_DURATION_MS = 5000
const CUT_SCALES = [0.7, 0.95, 1.2]

function HypeBottle({ scale, slowmo }: { scale: number; slowmo: boolean }) {
  return (
    <div className="flex flex-col items-center" style={{ transform: `scale(${scale})` }}>
      <div className={`relative h-7 w-8 rounded-t-md bg-gradient-to-b from-gray-100 via-gray-400 to-gray-600 shadow-inner ${slowmo ? 'animate-cap-lift' : ''}`}>
        <div className="absolute inset-x-1.5 top-1 h-1 rounded-full bg-white/70" />
      </div>
      <div className="h-3 w-1.5 bg-gradient-to-b from-white/70 to-sky-200/40" />
      <div className="relative h-32 w-14 overflow-hidden rounded-md border border-white/70 bg-white/10 shadow-[0_0_26px_rgba(125,190,225,0.5)]">
        <div className="absolute inset-x-0 bottom-0 h-[76%] bg-gradient-to-b from-sky-300/90 via-sky-400/85 to-sky-500/90" />
        <div className="absolute inset-x-0 bottom-[76%] h-[3px] bg-white/50" />
        <div className="absolute left-1 top-1 h-full w-2 rounded-full bg-white/40 blur-[1px]" />
        <span className="absolute inset-0 flex items-center justify-center rotate-90 whitespace-nowrap text-[8px] font-bold tracking-wide text-white drop-shadow-sm">
          MODU
        </span>
      </div>
    </div>
  )
}

export function SerumHypeReel() {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const start = Date.now()
    const timer = setInterval(() => {
      setElapsed((Date.now() - start) % TOTAL_DURATION_MS)
    }, 50)
    return () => clearInterval(timer)
  }, [])

  const cutIndex = CUT_BOUNDARIES.findIndex((b) => elapsed < b)
  const isIntro = cutIndex !== -1
  const scale = isIntro ? CUT_SCALES[cutIndex] : 1.2

  return (
    <div className="mb-8 overflow-hidden rounded-xl border border-gray-200 bg-white">
      <p className="border-b border-gray-100 px-4 py-2 text-xs font-semibold tracking-widest text-gray-400">
        MODU HYPE REEL
      </p>

      <div
        className="relative flex h-[420px] w-full items-center justify-center overflow-hidden"
        style={{ background: 'radial-gradient(circle at 50% 40%, #cfe9f5 0%, #6fb3d9 70%, #4a90c2 100%)' }}
      >
        {isIntro && (
          <div key={`flash-${cutIndex}`} className="animate-hit-flash pointer-events-none absolute inset-0 bg-white" />
        )}

        <div key={isIntro ? `cut-${cutIndex}` : 'reveal'} className="animate-hype-zoom-in">
          <HypeBottle scale={scale} slowmo={!isIntro} />
        </div>

        {!isIntro && (
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            {Array.from({ length: 10 }).map((_, i) => {
              const angle = (i / 10) * Math.PI * 2
              const dx = `${Math.cos(angle) * 70}px`
              const dy = `${Math.sin(angle) * 70}px`
              return (
                <span
                  key={i}
                  className="animate-particle-burst absolute h-1.5 w-1.5 rounded-full bg-white/90"
                  style={{ '--dx': dx, '--dy': dy, animationDelay: `${i * 0.06}s`, animationDuration: '1.4s' } as React.CSSProperties}
                />
              )
            })}
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent px-4 pb-4 pt-14 text-center">
          <p className="text-sm font-bold tracking-wide text-white">
            {isIntro ? 'MODU' : '확실한 케어의 시작'}
          </p>
        </div>
      </div>

      <div className="p-6">
        <p className="text-sm font-medium tracking-widest text-gray-400">MODU LAB SERUM</p>
        <p className="mt-2 text-lg font-bold text-gray-900">임팩트 있는 한 방울, 확실한 변화</p>
        <p className="mt-2 text-sm leading-relaxed text-gray-600">
          빠른 비트에 맞춘 강렬한 오프닝, 그리고 슬로우모션으로 완성되는 클로즈업. 화장품/미용
          카테고리에서 MODU의 임팩트를 확인해보세요.
        </p>
      </div>
    </div>
  )
}
