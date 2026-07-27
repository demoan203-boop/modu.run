import { useEffect, useState } from 'react'

const SCENE_BOUNDARIES = [2000, 4000, 6000, 8000, 10000, 12000, 14000, 16000]
const TOTAL_DURATION_MS = 16000

const CAPTIONS = [
  '물속에서 서서히 떠오르는 MODU',
  '수면을 향해, 가볍게 차오르는 순간',
  '드로퍼 끝에 맺히는 한 방울',
  '고요한 수면 위로 번지는 파문',
  '손끝에서 시작되는 스킨케어',
  '빛을 따라 은은하게 회전하는 로고',
  '다시 물속으로, 우아한 스플래시',
  'MODU — 맑음이 완성되는 순간',
]

// 병 디자인은 씬 전체에서 절대 바뀌지 않는다 (캡/보디/라벨 위치·타이포·색상 고정).
// 투명 유리 안에 블루 리퀴드가 비치는 형태 + 크롬 드로퍼 캡 (참고 이미지 스타일 반영).
function ModuBottle({ className = '' }: { className?: string }) {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* 크롬 드로퍼 캡 */}
      <div className="relative h-7 w-8 rounded-t-md bg-gradient-to-b from-gray-100 via-gray-400 to-gray-600 shadow-inner">
        <div className="absolute inset-x-1.5 top-1 h-1 rounded-full bg-white/70" />
      </div>
      {/* 드로퍼 튜브 (유리) */}
      <div className="h-3 w-1.5 bg-gradient-to-b from-white/70 to-sky-200/40" />
      {/* 투명 유리 보디 + 내부 블루 리퀴드 */}
      <div className="relative h-32 w-14 overflow-hidden rounded-md border border-white/70 bg-white/10 shadow-[0_0_22px_rgba(125,190,225,0.45)]">
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

function Bubbles({ count = 6 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className="animate-bubble-rise absolute rounded-full bg-white/50"
          style={{
            left: `${18 + ((i * 11) % 64)}%`,
            bottom: `${10 + ((i * 7) % 20)}%`,
            width: `${4 + (i % 3) * 2}px`,
            height: `${4 + (i % 3) * 2}px`,
            animationDelay: `${i * 0.4}s`,
          }}
        />
      ))}
    </>
  )
}

export function SerumMotionCard() {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const start = Date.now()
    const timer = setInterval(() => {
      setElapsed((Date.now() - start) % TOTAL_DURATION_MS)
    }, 80)
    return () => clearInterval(timer)
  }, [])

  const scene = SCENE_BOUNDARIES.findIndex((boundary) => elapsed < boundary)

  return (
    <div className="mb-8 overflow-hidden rounded-xl border border-gray-200 bg-white">
      <p className="border-b border-gray-100 px-4 py-2 text-xs font-semibold tracking-widest text-gray-400">
        MODU UNDERWATER FILM
      </p>

      <div
        className="relative h-[420px] w-full overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #dff2fb 0%, #a9d6ec 55%, #6fb3d9 100%)' }}
      >
        {/* Scene 0 - 검은 화면에서 맑은 물속, 병이 서서히 떠오른다 */}
        {scene === 0 && (
          <div key="s0" className="animate-scene-fade-in absolute inset-0 flex items-end justify-center pb-10">
            <Bubbles count={7} />
            <ModuBottle className="translate-y-2 opacity-90" />
          </div>
        )}

        {/* Scene 1 - 수면을 향해 떠오르며 굴절되는 빛 */}
        {scene === 1 && (
          <div key="s1" className="animate-scene-fade-in absolute inset-0 flex items-center justify-center">
            <Bubbles count={7} />
            <div className="absolute inset-x-0 top-1/3 h-10 -translate-y-1/2 bg-gradient-to-b from-white/40 to-transparent blur-sm" />
            <ModuBottle className="-translate-y-4" />
          </div>
        )}

        {/* Scene 2 - 매크로 드로퍼, 방울이 맺힌다 */}
        {scene === 2 && (
          <div key="s2" className="animate-scene-fade-in absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-[#eaf6fb] to-[#bfe1f2]">
            <div className="h-20 w-3 rounded-b-full bg-gradient-to-b from-slate-400 to-slate-600" />
            <div className="relative h-3 w-3">
              <div className="absolute left-1/2 top-0 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-sky-200 opacity-90" />
            </div>
          </div>
        )}

        {/* Scene 3 - 방울이 떨어져 수면에 파문이 인다 */}
        {scene === 3 && (
          <div key="s3" className="animate-scene-fade-in absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-[#eaf6fb] to-[#bfe1f2]">
            <div className="h-16 w-3 rounded-b-full bg-gradient-to-b from-slate-400 to-slate-600" />
            <div className="relative h-3 w-3">
              <div className="animate-droplet-fall absolute left-1/2 top-0 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-sky-200" />
            </div>
            <div className="relative mt-14 h-2 w-28">
              <div className="animate-ripple-expand absolute inset-0 rounded-full border border-sky-500/70" />
              <div className="absolute inset-x-4 top-0 h-px bg-sky-900/10" />
            </div>
          </div>
        )}

        {/* Scene 4 - 손이 들어와 병을 들어올린다 (추상적인 형태로 표현) */}
        {scene === 4 && (
          <div key="s4" className="animate-scene-fade-in absolute inset-0 flex items-center justify-center">
            <div className="absolute bottom-0 h-24 w-40 rounded-t-full bg-gradient-to-t from-[#e8b79a]/80 to-transparent" />
            <ModuBottle className="-translate-y-6" />
          </div>
        )}

        {/* Scene 5 - 병이 살짝 회전하며 로고가 선명하게 보인다 */}
        {scene === 5 && (
          <div key="s5" className="animate-scene-fade-in absolute inset-0 flex items-center justify-center">
            <ModuBottle className="animate-bottle-rotate -translate-y-6" />
          </div>
        )}

        {/* Scene 6 - 다시 물속으로 떨어지며 스플래시가 튄다 */}
        {scene === 6 && (
          <div key="s6" className="animate-scene-fade-in absolute inset-0 flex items-center justify-center">
            <ModuBottle className="translate-y-4" />
            <div className="absolute bottom-[34%] left-1/2 -translate-x-1/2">
              {Array.from({ length: 8 }).map((_, i) => {
                const angle = (i / 8) * Math.PI * 2
                const dx = `${Math.cos(angle) * 40}px`
                const dy = `${Math.sin(angle) * 24 - 10}px`
                return (
                  <span
                    key={i}
                    className="animate-particle-burst absolute h-1.5 w-1.5 rounded-full bg-white/80"
                    style={{ '--dx': dx, '--dy': dy, animationDelay: `${i * 0.05}s` } as React.CSSProperties}
                  />
                )
              })}
            </div>
          </div>
        )}

        {/* Scene 7 - 최종 히어로 샷, 로고가 중앙에 고정된다 */}
        {scene === 7 && (
          <div key="s7" className="animate-scene-fade-in absolute inset-0 flex items-center justify-center">
            <Bubbles count={8} />
            <ModuBottle />
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-white/85 via-white/30 to-transparent px-4 pb-4 pt-10">
          <p className="text-xs leading-relaxed text-sky-950/75">{CAPTIONS[scene]}</p>
        </div>

        <div className="absolute right-3 top-3 flex gap-1">
          {CAPTIONS.map((_, i) => (
            <span
              key={i}
              className={`h-1 rounded-full transition-all ${i === scene ? 'w-3 bg-sky-600' : 'w-1 bg-sky-900/20'}`}
            />
          ))}
        </div>
      </div>

      <div className="p-6">
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
