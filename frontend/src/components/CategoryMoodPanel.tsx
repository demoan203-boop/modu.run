import { useEffect, useState } from 'react'
import slideClubmaster from '../assets/intro-slides/slide-clubmaster-closeup.png'

const SCENE_BOUNDARIES = [2000, 4000, 7000, 9000]
const TOTAL_DURATION_MS = 9000

const ACCESSORY_CYCLE = [
  { label: '디자이너 선글라스', icon: '🕶️', color: '#f59e0b' },
  { label: '럭셔리 핸드백', icon: '👜', color: '#ec4899' },
  { label: '프리미엄 시계', icon: '⌚', color: '#38bdf8' },
  { label: '네크리스', icon: '💎', color: '#a78bfa' },
  { label: '비즈니스 수트', icon: '🧥', color: '#34d399' },
  { label: '슈즈', icon: '👞', color: '#f87171' },
]

const MOCK_PRODUCT_CARDS = [
  { icon: '🕶️', name: '디자이너 선글라스', brand: 'MODU SELECT', price: '328,000원', discount: '30%' },
  { icon: '👜', name: '럭셔리 핸드백', brand: 'MODU SELECT', price: '1,240,000원', discount: '15%' },
  { icon: '⌚', name: '프리미엄 시계', brand: 'MODU SELECT', price: '890,000원', discount: null },
]

export function CategoryMoodPanel() {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const start = Date.now()
    const timer = setInterval(() => {
      setElapsed((Date.now() - start) % TOTAL_DURATION_MS)
    }, 80)
    return () => clearInterval(timer)
  }, [])

  const scene = SCENE_BOUNDARIES.findIndex((boundary) => elapsed < boundary)
  const accessoryIndex = Math.floor(elapsed / 330) % ACCESSORY_CYCLE.length
  const accessory = ACCESSORY_CYCLE[accessoryIndex]
  const productIndex = Math.floor(((elapsed - 4000) / 1000) % MOCK_PRODUCT_CARDS.length)

  return (
    <div className="mb-8 flex flex-col items-center gap-5 rounded-xl border border-gray-200 bg-white p-6 sm:flex-row sm:items-center">
      <div className="relative h-[420px] w-[280px] shrink-0 overflow-hidden rounded-lg bg-black">
        {scene === 0 && (
          <div className="animate-scene-fade-in absolute inset-0">
            <img
              src={slideClubmaster}
              alt="디자이너 선글라스를 착용한 럭셔리 모델"
              className="h-full w-full object-cover"
            />
            <span className="absolute bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-black/70 px-4 py-1 text-[10px] tracking-[0.2em] text-white">
              DESIGNER SUNGLASSES
            </span>
          </div>
        )}

        {scene === 1 && (
          <div className="animate-scene-fade-in absolute inset-0 flex items-center justify-center overflow-hidden bg-black">
            <div
              key={accessoryIndex}
              className="animate-circle-pulse absolute h-56 w-56 rounded-full"
              style={{ backgroundColor: accessory.color }}
            />
            <div className="relative z-10 flex flex-col items-center gap-2 text-white">
              <span className="text-6xl">{accessory.icon}</span>
              <span className="text-xs font-semibold tracking-widest">{accessory.label}</span>
            </div>
          </div>
        )}

        {scene === 2 && (
          <div className="animate-scene-fade-in absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black px-6">
            <p className="mb-1 text-[10px] tracking-[0.35em] text-amber-300/80">AI TRY ON</p>
            {MOCK_PRODUCT_CARDS.map((item, index) => {
              const isSelected = index === productIndex
              return (
                <div
                  key={item.name}
                  className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2 transition-all ${
                    isSelected
                      ? 'scale-105 border-amber-300 bg-white/10 shadow-[0_0_16px_rgba(252,211,77,0.5)]'
                      : 'border-white/10 bg-white/5'
                  }`}
                >
                  <span className="text-2xl">{item.icon}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] text-white/60">{item.brand}</p>
                    <p className="truncate text-xs font-medium text-white">{item.name}</p>
                    <p className="text-xs font-semibold text-amber-300">{item.price}</p>
                  </div>
                  {item.discount && (
                    <span className="rounded-full bg-red-500/90 px-2 py-0.5 text-[10px] font-bold text-white">
                      -{item.discount}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {scene === 3 && (
          <div className="animate-scene-fade-in absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-b from-black to-gray-900 text-center">
            <p className="text-2xl font-black tracking-tight text-white">WWW.MODU.RUN</p>
            <p className="text-xs tracking-[0.3em] text-amber-300">온라인 쇼핑의 혁명</p>
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 flex justify-center gap-1.5 bg-gradient-to-t from-black/60 to-transparent pb-2 pt-6">
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className={`h-1 rounded-full transition-all ${
                scene === i ? 'w-5 bg-amber-300' : 'w-1 bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-medium tracking-widest text-gray-400">MODU BEAUTY EDIT</p>
        <p className="mt-2 text-lg font-bold text-gray-900">절제된 아름다움, 미니멀한 무드</p>
        <p className="mt-2 text-sm leading-relaxed text-gray-600">
          과하지 않은 절제, 남는 여운. 화장품/미용 카테고리에서 MODU가 엄선한 아이템으로
          당신만의 무드를 완성해보세요.
        </p>
      </div>
    </div>
  )
}
