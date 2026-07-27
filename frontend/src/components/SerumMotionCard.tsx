import { useEffect, useState } from 'react'

const SCENE_BOUNDARIES = [2500, 5000]
const TOTAL_DURATION_MS = 5000

export function SerumMotionCard() {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const start = Date.now()
    const timer = setInterval(() => {
      setElapsed((Date.now() - start) % TOTAL_DURATION_MS)
    }, 80)
    return () => clearInterval(timer)
  }, [])

  const scene = elapsed < SCENE_BOUNDARIES[0] ? 0 : 1

  return (
    <div className="mb-8 flex flex-col items-center gap-5 rounded-xl border border-gray-200 bg-white p-6 sm:flex-row sm:items-center">
      <div
        className="relative h-[420px] w-[280px] shrink-0 overflow-hidden rounded-lg"
        style={{ background: 'linear-gradient(160deg, #eaf6fb 0%, #cfe9f5 55%, #a9d6ec 100%)' }}
      >
        <p className="absolute inset-x-0 top-4 text-center text-[10px] font-semibold tracking-[0.3em] text-sky-900/50">
          MODU LAB SERUM
        </p>

        {scene === 0 && (
          <div key="cut1" className="animate-scene-fade-in absolute inset-0 flex flex-col items-center justify-center">
            {/* 얇은 반사 리본 위에 놓인 세럼 병 */}
            <div className="relative flex flex-col items-center">
              <div className="h-6 w-9 rounded-t-sm bg-gradient-to-b from-slate-500 to-slate-700" />
              <div className="flex h-36 w-16 items-center justify-center rounded-md bg-gradient-to-b from-sky-100/90 to-sky-300/70 shadow-[0_0_30px_rgba(125,190,225,0.5)] ring-1 ring-white/70">
                <span className="rotate-90 whitespace-nowrap text-[7px] font-semibold tracking-wide text-sky-900/60">
                  2% HYALURONIC
                </span>
              </div>
              <div className="mt-4 h-1 w-40 rounded-full bg-gradient-to-r from-transparent via-white to-transparent shadow-[0_0_12px_2px_rgba(255,255,255,0.9)]" />
            </div>
          </div>
        )}

        {scene === 1 && (
          <div key="cut2" className="animate-scene-fade-in absolute inset-0 flex flex-col items-center justify-center">
            {/* 매크로 드로퍼 샷 - 물방울이 떨어져 표면에 파문이 생긴다 */}
            <div className="relative flex flex-col items-center">
              <div className="h-20 w-3 rounded-b-full bg-gradient-to-b from-slate-400 to-slate-600" />
              <div className="relative h-3 w-3">
                <div className="animate-droplet-fall absolute left-1/2 top-0 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-sky-200" />
              </div>
              <div className="relative mt-14 h-2 w-28">
                <div className="animate-ripple-expand absolute inset-0 rounded-full border border-sky-400/70" />
                <div className="absolute inset-x-4 top-0 h-px bg-sky-900/10" />
              </div>
            </div>
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-white/90 via-white/40 to-transparent px-4 pb-4 pt-10">
          <p className="text-xs leading-relaxed text-sky-950/70">
            {scene === 0
              ? '반사 리본 위에 균형을 잡은 세럼, 부드러운 블루 그라데이션'
              : '드로퍼 끝에서 떨어지는 한 방울, 표면 위로 번지는 잔잔한 파문'}
          </p>
        </div>

        <div className="absolute right-3 top-3 flex gap-1">
          {[0, 1].map((i) => (
            <span
              key={i}
              className={`h-1 rounded-full transition-all ${i === scene ? 'w-4 bg-sky-500' : 'w-1 bg-sky-900/20'}`}
            />
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-medium tracking-widest text-gray-400">MODU LAB SERUM</p>
        <p className="mt-2 text-lg font-bold text-gray-900">맑고 투명한 순간, 2% 히알루론산</p>
        <p className="mt-2 text-sm leading-relaxed text-gray-600">
          배리어를 채우는 산뜻한 세럼. 화장품/미용 카테고리에서 MODU가 엄선한 스킨케어
          아이템으로 맑은 피부 결을 완성해보세요.
        </p>
      </div>
    </div>
  )
}
