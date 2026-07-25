import { useMemo, useRef, useState, type ReactNode } from 'react'
import type { CartItem } from '../types/cart'
import { useVirtualTryOn } from '../hooks/useVirtualTryOn'
import { TryOnProgress } from './TryOnProgress'
import { TryOnResultViewer } from './TryOnResultViewer'
import { TryOnErrorState } from './TryOnErrorState'
import { PrivacyNotice } from './PrivacyNotice'

function OuterIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M8 4l4 3 4-3 4 4-3 3v10H7V11L4 8z" />
    </svg>
  )
}
function TopIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M9 4L4 7l2 3 3-1.5V20h6V8.5L18 10l2-3-5-3-1.5 1.5a2 2 0 0 1-3 0z" />
    </svg>
  )
}
function BottomIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M8 3h8l1 8-2 10h-2l-1-9-1 9H9L7 11z" />
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
function BagIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="4" y="9" width="16" height="11" rx="2" />
      <path d="M8 9V7a4 4 0 0 1 8 0v2" />
    </svg>
  )
}
function AccessoryIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="10" width="18" height="4" rx="1" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  )
}
function EyewearIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="6.5" cy="12" r="3.5" />
      <circle cx="17.5" cy="12" r="3.5" />
      <path d="M10 12h4M3 12l1-3M21 12l-1-3" />
    </svg>
  )
}
function JewelryIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 4l3 5-3 11-3-11z" />
      <path d="M9 9h6" />
    </svg>
  )
}

const CATEGORIES: { label: string; icon: ReactNode; keywords: string[] }[] = [
  { label: '아우터', icon: <OuterIcon />, keywords: ['재킷', '자켓', '코트', '아우터', '점퍼', '패딩', '가디건'] },
  { label: '상의', icon: <TopIcon />, keywords: ['티셔츠', '니트', '블라우스', '셔츠', '상의', '맨투맨', '후드'] },
  { label: '하의', icon: <BottomIcon />, keywords: ['바지', '팬츠', '스커트', '청바지', '하의', '슬랙스', '치마'] },
  { label: '신발', icon: <ShoesIcon />, keywords: ['신발', '운동화', '구두', '스니커즈', '샌들', '부츠', '슬리퍼'] },
  { label: '가방', icon: <BagIcon />, keywords: ['가방', '백팩', '파우치', '클러치', '숄더백'] },
  { label: '액세서리', icon: <AccessoryIcon />, keywords: ['액세서리', '벨트', '스카프', '모자', '장갑'] },
  { label: '안경', icon: <EyewearIcon />, keywords: ['안경', '선글라스', '고글'] },
  { label: '주얼리', icon: <JewelryIcon />, keywords: ['목걸이', '귀걸이', '팔찌', '반지', '주얼리'] },
]

const BACKGROUNDS: { label: string; value: string }[] = [
  { label: '블랙', value: '#0a0a0a' },
  { label: '그레이', value: '#4b4b4b' },
  { label: '화이트', value: '#f5f5f5' },
  { label: '베이지', value: '#ded2bd' },
]

function categoryOf(item: CartItem): string {
  const text = `${item.title} ${item.category}`
  for (const cat of CATEGORIES) {
    if (cat.keywords.some((k) => text.includes(k))) return cat.label
  }
  return '기타'
}

export function FittingRoom({ items, onOpenCart }: { items: CartItem[]; onOpenCart: () => void }) {
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [background, setBackground] = useState(BACKGROUNDS[0].value)
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0].label)
  const [selections, setSelections] = useState<Record<string, CartItem>>({})
  const [privacyAgreed, setPrivacyAgreed] = useState(false)
  const [triedItem, setTriedItem] = useState<CartItem | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const tryOn = useVirtualTryOn()

  const grouped = useMemo(() => {
    const map = new Map<string, CartItem[]>()
    for (const item of items) {
      const cat = categoryOf(item)
      map.set(cat, [...(map.get(cat) ?? []), item])
    }
    return map
  }, [items])

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (photoUrl) URL.revokeObjectURL(photoUrl)
    setPhotoFile(file)
    setPhotoUrl(URL.createObjectURL(file))
    tryOn.reset()
  }

  function selectItem(category: string, item: CartItem) {
    setSelections((prev) => {
      if (prev[category]?.id === item.id) {
        const next = { ...prev }
        delete next[category]
        return next
      }
      return { ...prev, [category]: item }
    })
  }

  const activeItems = grouped.get(activeCategory) ?? []
  const selectedList = Object.entries(selections)
  const selectedItem = selections[activeCategory] ?? null

  const isBusy = ['validating', 'uploading', 'queued', 'processing'].includes(tryOn.status)

  function handleStartTryOn() {
    if (!photoFile || !selectedItem || !privacyAgreed) return
    setTriedItem(selectedItem)
    tryOn.start(photoFile, selectedItem.id)
  }

  let tryOnHint: string | null = null
  if (!photoFile) tryOnHint = '먼저 내 사진을 업로드해주세요.'
  else if (!selectedItem) tryOnHint = '적용할 상품을 선택해 주세요.'
  else if (!privacyAgreed) tryOnHint = '이미지 이용 안내에 동의해주세요.'

  return (
    <div className="mb-8 overflow-hidden rounded-xl bg-black text-white">
      <div className="flex items-center justify-between px-5 pt-5">
        <div>
          <p className="text-[10px] tracking-[0.35em] text-amber-300/70">AI PERSONAL STYLIST</p>
          <p className="text-lg font-semibold">가상 피팅룸</p>
        </div>
        <div className="flex gap-1.5">
          {BACKGROUNDS.map((bg) => (
            <button
              key={bg.value}
              type="button"
              aria-label={`배경 ${bg.label}`}
              onClick={() => setBackground(bg.value)}
              className={`h-6 w-6 rounded-full border-2 transition ${
                background === bg.value ? 'border-amber-300' : 'border-white/20'
              }`}
              style={{ backgroundColor: bg.value }}
            />
          ))}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 lg:grid-cols-[1fr_320px]">
        <div
          className={`relative flex min-h-[460px] flex-col transition-colors ${
            tryOn.status === 'succeeded' && tryOn.resultImageUrl ? 'justify-center p-4' : 'items-center justify-center'
          }`}
          style={{ backgroundColor: background }}
        >
          {tryOn.status === 'succeeded' && tryOn.resultImageUrl && photoUrl ? (
            <TryOnResultViewer
              originalUrl={photoUrl}
              resultUrl={tryOn.resultImageUrl}
              isDemo={tryOn.provider === 'mock'}
              productTitle={triedItem?.title ?? ''}
              onApplyAnother={() => tryOn.reset()}
              onOpenCart={onOpenCart}
              onBuyNow={() => triedItem && window.open(triedItem.link, '_blank', 'noreferrer')}
            />
          ) : tryOn.status === 'failed' ? (
            <TryOnErrorState
              message={tryOn.errorMessage ?? '가상 착용 결과를 생성하지 못했습니다.'}
              onRetry={handleStartTryOn}
              onChangePhoto={() => fileInputRef.current?.click()}
              onChangeProduct={() => tryOn.reset()}
            />
          ) : isBusy ? (
            <TryOnProgress status={tryOn.status} />
          ) : photoUrl ? (
            <img src={photoUrl} alt="업로드한 사진" className="h-full max-h-[460px] w-auto object-contain" />
          ) : (
            <div className="flex flex-col items-center gap-3 text-white/40">
              <svg viewBox="0 0 100 220" fill="none" stroke="currentColor" strokeWidth="2" className="h-56 w-24">
                <circle cx="50" cy="30" r="20" />
                <path d="M20 205 L30 90 Q50 75 70 90 L80 205" />
              </svg>
              <p className="text-xs">사진을 업로드해보세요</p>
              <ul className="mt-1 space-y-0.5 text-center text-[10px] leading-relaxed text-white/30">
                <li>정면을 바라보는 사진 · 신체가 가려지지 않은 사진</li>
                <li>밝고 선명한 사진 · 단색 배경 권장 · 한 명만 포함된 사진</li>
              </ul>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handlePhotoChange}
            className="hidden"
          />

          {!isBusy && tryOn.status !== 'succeeded' && tryOn.status !== 'failed' && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-4 left-1/2 min-h-[44px] -translate-x-1/2 rounded-full bg-white/10 px-4 py-2 text-xs font-medium text-white backdrop-blur-md transition hover:bg-white/20"
            >
              {photoUrl ? '사진 변경' : '내 사진 선택하기'}
            </button>
          )}

          {!isBusy && tryOn.status === 'idle' && selectedList.length > 0 && (
            <div className="absolute left-4 top-4 flex flex-col gap-2">
              {selectedList.map(([category, item]) => (
                <div
                  key={category}
                  className="flex items-center gap-2 rounded-lg border border-amber-300/70 bg-black/50 px-2 py-1.5 backdrop-blur-md"
                >
                  <div className="h-8 w-8 overflow-hidden rounded bg-white/10">
                    {item.image_url && (
                      <img src={item.image_url} alt={item.title} className="h-full w-full object-cover" />
                    )}
                  </div>
                  <span className="max-w-[120px] truncate text-[11px] text-white/80">{item.title}</span>
                </div>
              ))}
            </div>
          )}

          {tryOn.status === 'idle' && (
            <p className="absolute bottom-1 right-2 text-[9px] text-white/25">
              사진은 브라우저에만 표시되며 저장되지 않습니다
            </p>
          )}
        </div>

        <div className="flex flex-col bg-white/5 backdrop-blur-md">
          <div className="flex flex-wrap gap-1 border-b border-white/10 p-2">
            {CATEGORIES.map((cat) => {
              const count = grouped.get(cat.label)?.length ?? 0
              const isActive = activeCategory === cat.label
              return (
                <button
                  key={cat.label}
                  type="button"
                  onClick={() => setActiveCategory(cat.label)}
                  className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] transition ${
                    isActive ? 'bg-amber-300/90 text-black' : 'text-white/70 hover:bg-white/10'
                  }`}
                >
                  <span className="h-3.5 w-3.5">{cat.icon}</span>
                  {cat.label}
                  {count > 0 && <span className="opacity-60">{count}</span>}
                </button>
              )
            })}
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            {activeItems.length === 0 ? (
              <p className="py-10 text-center text-xs text-white/40">
                장바구니에 담긴 {activeCategory} 아이템이 없어요.
                <br />
                검색해서 담아보세요.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {activeItems.map((item) => {
                  const isSelected = selections[activeCategory]?.id === item.id
                  return (
                    <button
                      key={item.id}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => selectItem(activeCategory, item)}
                      className={`relative overflow-hidden rounded-lg border bg-white/5 text-left transition ${
                        isSelected ? 'border-amber-300 ring-1 ring-amber-300' : 'border-white/10 hover:border-white/30'
                      }`}
                    >
                      {isSelected && (
                        <span className="absolute right-1.5 top-1.5 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-amber-300 text-[10px] font-bold text-black">
                          ✓
                        </span>
                      )}
                      <div className="aspect-square w-full bg-white/10">
                        {item.image_url && (
                          <img src={item.image_url} alt={item.title} className="h-full w-full object-cover" />
                        )}
                      </div>
                      <div className="p-1.5">
                        <p className="line-clamp-1 text-[10px] text-white/70">{item.title}</p>
                        <p className="text-[11px] font-semibold text-amber-300">
                          {item.price.toLocaleString('ko-KR')}원
                        </p>
                        {isSelected && <p className="text-[9px] text-amber-300/80">선택됨</p>}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 border-t border-white/10 p-3">
            <PrivacyNotice agreed={privacyAgreed} onAgreedChange={setPrivacyAgreed} />

            {tryOnHint && tryOn.status === 'idle' && (
              <p role="alert" className="text-center text-[11px] text-amber-300/80">
                {tryOnHint}
              </p>
            )}

            <button
              type="button"
              onClick={handleStartTryOn}
              disabled={!photoFile || !selectedItem || !privacyAgreed || isBusy}
              className="min-h-[44px] w-full rounded-lg bg-amber-300 text-sm font-semibold text-black transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/40"
            >
              AI로 착용해 보기
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
