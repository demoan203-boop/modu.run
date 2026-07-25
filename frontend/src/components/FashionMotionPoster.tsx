import { useEffect, useState } from 'react'
import slideRimless from '../assets/intro-slides/slide-rimless-closeup.png'

type TransitionStyle = 'circle' | 'block' | 'stripe'

const ITEMS: { label: string; icon: string; color: string; transition: TransitionStyle }[] = [
  { label: '루이지 선글라스', icon: '🕶️', color: '#facc15', transition: 'circle' },
  { label: '립 컬러', icon: '💋', color: '#3b82f6', transition: 'stripe' },
  { label: '이어링', icon: '💎', color: '#ef4444', transition: 'block' },
  { label: '헤어스타일', icon: '💇‍♀️', color: '#111827', transition: 'stripe' },
  { label: '럭셔리 핸드백', icon: '👜', color: '#facc15', transition: 'circle' },
  { label: '디자이너 재킷', icon: '🧥', color: '#f97316', transition: 'block' },
  { label: '프리미엄 슈즈', icon: '👞', color: '#ef4444', transition: 'circle' },
]

const ITEM_DURATION_MS = 500

export function FashionMotionPoster() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % ITEMS.length)
    }, ITEM_DURATION_MS)
    return () => clearInterval(timer)
  }, [])

  const item = ITEMS[index]

  return (
    <div className="mb-8 flex flex-col items-center gap-5 rounded-xl border border-gray-200 bg-white p-6 sm:flex-row sm:items-center">
      <div className="relative h-[420px] w-[280px] shrink-0 overflow-hidden rounded-lg bg-white">
        <img src={slideRimless} alt="럭셔리 선글라스를 착용한 패션 모델" className="h-full w-full object-cover" />

        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
          <div>
            <p className="text-sm font-black leading-none tracking-tight text-black">AI FASHION</p>
            <p className="text-sm font-black leading-none tracking-tight text-black">COMMERCE</p>
          </div>
          <p className="text-[8px] font-semibold tracking-[0.3em] text-black/60">MOTION POSTER</p>
        </div>

        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {item.transition === 'circle' && (
            <div
              key={`circle-${index}`}
              className="animate-circle-pulse absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full mix-blend-multiply"
              style={{ backgroundColor: item.color }}
            />
          )}
          {item.transition === 'block' && (
            <div
              key={`block-${index}`}
              className="animate-fashion-block-slide absolute inset-y-0 left-0 w-full mix-blend-multiply"
              style={{ backgroundColor: item.color }}
            />
          )}
          {item.transition === 'stripe' && (
            <div
              key={`stripe-${index}`}
              className="animate-fashion-stripe-wipe absolute inset-0 mix-blend-multiply"
              style={{ backgroundColor: item.color }}
            />
          )}
        </div>

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/60 to-transparent px-4 pb-4 pt-14">
          <div key={`label-${index}`} className="animate-scene-fade-in flex items-center gap-2">
            <span className="text-2xl">{item.icon}</span>
            <span className="text-sm font-bold tracking-wide text-white">{item.label}</span>
          </div>
        </div>

        <div className="absolute right-3 top-14 flex flex-col gap-1">
          {ITEMS.map((_, i) => (
            <span
              key={i}
              className={`h-1 w-1 rounded-full transition-all ${i === index ? 'w-3 bg-black' : 'bg-black/25'}`}
            />
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-medium tracking-widest text-gray-400">MODU FASHION EDIT</p>
        <p className="mt-2 text-lg font-bold text-gray-900">스타일은 빠르게, 취향은 정확하게</p>
        <p className="mt-2 text-sm leading-relaxed text-gray-600">
          선글라스부터 슈즈까지, 패션잡화 카테고리에서 MODU가 엄선한 아이템으로 매거진
          커버 같은 룩을 완성해보세요.
        </p>
      </div>
    </div>
  )
}
