import { useEffect, useState } from 'react'
import type { TryOnStatus } from '../hooks/useVirtualTryOn'

const STEPS = ['사진 확인 중', '상품 분석 중', '스타일 적용 중', '결과 이미지 생성 중']

export function TryOnProgress({ status }: { status: TryOnStatus }) {
  const [stepIndex, setStepIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % STEPS.length)
    }, 900)
    return () => clearInterval(timer)
  }, [])

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center gap-3 rounded-lg bg-black/40 px-6 py-8 text-center backdrop-blur-md"
    >
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-amber-300" />
      <p className="text-sm font-medium text-white">{STEPS[stepIndex]}</p>
      <p className="text-xs text-white/50">
        {status === 'uploading' || status === 'queued'
          ? '선택한 상품을 자연스럽게 적용하고 있습니다.'
          : '잠시 후 착용 결과를 확인할 수 있습니다.'}
      </p>
    </div>
  )
}
