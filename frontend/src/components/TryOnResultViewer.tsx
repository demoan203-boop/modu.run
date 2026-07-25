import { useState } from 'react'

interface TryOnResultViewerProps {
  originalUrl: string
  resultUrl: string
  isDemo: boolean
  productTitle: string
  onApplyAnother: () => void
  onOpenCart: () => void
  onBuyNow: () => void
}

export function TryOnResultViewer({
  originalUrl,
  resultUrl,
  isDemo,
  productTitle,
  onApplyAnother,
  onOpenCart,
  onBuyNow,
}: TryOnResultViewerProps) {
  const [viewMode, setViewMode] = useState<'compare' | 'original' | 'result'>('compare')
  const [comparePct, setComparePct] = useState(50)

  function handleDownload() {
    const link = document.createElement('a')
    link.href = resultUrl
    link.download = `modu-ai-try-on-${Date.now()}.jpg`
    document.body.appendChild(link)
    link.click()
    link.remove()
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-white">AI 착용 결과가 완성되었습니다.</p>
        {isDemo && (
          <span className="rounded-full border border-amber-300/60 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
            Demo Preview
          </span>
        )}
      </div>

      <div className="relative overflow-hidden rounded-lg bg-black">
        <img
          src={resultUrl}
          alt={`${productTitle} AI 가상 착용 결과`}
          className="max-h-[420px] w-full object-contain"
        />
        {viewMode === 'compare' && (
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ clipPath: `inset(0 ${100 - comparePct}% 0 0)` }}
          >
            <img
              src={originalUrl}
              alt="업로드한 원본 사진"
              className="h-full max-h-[420px] w-full object-contain"
            />
          </div>
        )}
        {viewMode === 'original' && (
          <img
            src={originalUrl}
            alt="업로드한 원본 사진"
            className="absolute inset-0 h-full max-h-[420px] w-full object-contain"
          />
        )}
      </div>

      <div className="flex gap-1 text-xs">
        {(
          [
            ['original', '원본 보기'],
            ['compare', '비교하기'],
            ['result', '결과 보기'],
          ] as const
        ).map(([mode, label]) => (
          <button
            key={mode}
            type="button"
            onClick={() => setViewMode(mode)}
            aria-pressed={viewMode === mode}
            className={`min-h-[36px] rounded-full px-3 transition ${
              viewMode === mode ? 'bg-white/20 text-white' : 'text-white/60 hover:bg-white/10'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {viewMode === 'compare' && (
        <input
          type="range"
          min={0}
          max={100}
          value={comparePct}
          onChange={(e) => setComparePct(Number(e.target.value))}
          aria-label="원본과 결과 비교 슬라이더"
          className="h-11 w-full accent-amber-300"
        />
      )}

      <p className="text-[11px] leading-relaxed text-white/40">
        AI 가상 착용 결과는 실제 상품의 색상, 질감 및 핏과 차이가 있을 수 있습니다.
      </p>

      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
        <button
          type="button"
          onClick={onApplyAnother}
          className="min-h-[44px] rounded-lg border border-white/20 px-3 text-xs font-medium text-white transition hover:bg-white/10"
        >
          다른 상품 적용하기
        </button>
        <button
          type="button"
          onClick={handleDownload}
          className="min-h-[44px] rounded-lg border border-white/20 px-3 text-xs font-medium text-white transition hover:bg-white/10"
        >
          결과 이미지 저장
        </button>
        <button
          type="button"
          onClick={onOpenCart}
          className="min-h-[44px] rounded-lg bg-white/10 px-3 text-xs font-medium text-white transition hover:bg-white/20"
        >
          장바구니 열기
        </button>
        <button
          type="button"
          onClick={onBuyNow}
          className="min-h-[44px] rounded-lg bg-amber-300 px-3 text-xs font-semibold text-black transition hover:bg-amber-200"
        >
          바로 구매
        </button>
      </div>
    </div>
  )
}
