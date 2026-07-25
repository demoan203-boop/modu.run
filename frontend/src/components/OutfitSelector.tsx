import { useState, type ReactNode } from 'react'

function SunglassesIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="6.5" cy="12" r="3.5" />
      <circle cx="17.5" cy="12" r="3.5" />
      <path d="M10 12h4M3 12l1-3M21 12l-1-3" />
    </svg>
  )
}

function EarringsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="9" r="4" />
      <path d="M12 13v5" />
    </svg>
  )
}

function JacketIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M8 4l4 3 4-3 4 4-3 3v10H7V11L4 8z" />
    </svg>
  )
}

function SkirtIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M9 4h6l2 16H7z" />
      <path d="M9 4L7 12M15 4l2 8" />
    </svg>
  )
}

function WatchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="5" />
      <path d="M12 9v3l2 2M9 3h6M9 21h6" />
    </svg>
  )
}

function BagIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="4" y="9" width="16" height="11" rx="2" />
      <path d="M8 9V7a4 4 0 0 1 8 0v2" />
    </svg>
  )
}

function ShoesIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 18v-3c2-1 3-2 4-4l3-1 8 4c2 1 3 2 3 4z" />
    </svg>
  )
}

const ITEMS: { label: string; icon: ReactNode }[] = [
  { label: '선글라스', icon: <SunglassesIcon /> },
  { label: '귀걸이', icon: <EarringsIcon /> },
  { label: '재킷', icon: <JacketIcon /> },
  { label: '스커트', icon: <SkirtIcon /> },
  { label: '시계', icon: <WatchIcon /> },
  { label: '가방', icon: <BagIcon /> },
  { label: '신발', icon: <ShoesIcon /> },
]

export function OutfitSelector({ onSearch }: { onSearch: (query: string) => void }) {
  const [selected, setSelected] = useState<string[]>([])
  const [active, setActive] = useState<string | null>(null)

  function toggleItem(label: string) {
    setActive(label)
    setSelected((prev) => (prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]))
  }

  const activeItem = ITEMS.find((item) => item.label === active)

  return (
    <div className="mb-8 overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="relative h-[420px] bg-black">
        <div className="absolute inset-0 flex items-center justify-center">
          <svg
            viewBox="0 0 100 220"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-72 w-32 text-white/15"
          >
            <circle cx="50" cy="30" r="20" />
            <path d="M20 205 L30 90 Q50 75 70 90 L80 205" />
          </svg>
        </div>

        {activeItem && (
          <div className="absolute left-1/2 top-8 -translate-x-1/2">
            <div key={active} className="animate-card-in w-44 rounded-lg bg-white/10 p-4 text-center backdrop-blur-md">
              <div className="mx-auto mb-2 h-10 w-10 text-white">{activeItem.icon}</div>
              <p className="text-sm font-medium text-white">{activeItem.label}</p>
              <p className="mt-1 text-xs text-white/60">
                {selected.includes(activeItem.label) ? '선택 완료' : '탭하여 선택'}
              </p>
            </div>
          </div>
        )}

        <div className="absolute inset-x-0 top-4 px-4">
          <p className="text-[10px] tracking-[0.3em] text-white/50">MODU OUTFIT SELECTOR</p>
        </div>

        <div className="absolute inset-y-0 right-0 flex w-32 flex-col justify-center gap-1 bg-black/50 p-2.5 backdrop-blur-sm sm:w-36">
          {ITEMS.map((item) => {
            const isSelected = selected.includes(item.label)
            const isActive = active === item.label
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => toggleItem(item.label)}
                className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition ${
                  isActive ? 'bg-amber-300/90 text-black' : 'text-white/80 hover:bg-white/10'
                }`}
              >
                <span className="h-4 w-4 shrink-0">{item.icon}</span>
                <span className="flex-1 truncate">{item.label}</span>
                {isSelected && <span>✓</span>}
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-600">
          {selected.length === 0
            ? '아이템을 눌러 나만의 코디를 만들어보세요.'
            : `${selected.length}개 아이템 선택됨 — ${selected.join(', ')}`}
        </p>
        <button
          type="button"
          disabled={selected.length === 0}
          onClick={() => onSearch(selected.join(' '))}
          className="shrink-0 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          이 코디로 상품 검색
        </button>
      </div>
    </div>
  )
}
