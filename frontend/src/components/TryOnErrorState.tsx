export function TryOnErrorState({
  message,
  onRetry,
  onChangePhoto,
  onChangeProduct,
}: {
  message: string
  onRetry: () => void
  onChangePhoto: () => void
  onChangeProduct: () => void
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 rounded-lg bg-black/40 px-6 py-8 text-center backdrop-blur-md"
    >
      <p className="text-sm font-medium text-red-300">
        가상 착용 결과를 생성하지 못했습니다. 잠시 후 다시 시도해 주세요.
      </p>
      <p className="text-xs text-white/50">{message}</p>
      <div className="mt-2 flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={onRetry}
          className="rounded-full bg-amber-300 px-4 py-1.5 text-xs font-semibold text-black transition hover:bg-amber-200"
        >
          다시 시도
        </button>
        <button
          type="button"
          onClick={onChangePhoto}
          className="rounded-full border border-white/20 px-4 py-1.5 text-xs text-white/80 transition hover:bg-white/10"
        >
          다른 사진 선택
        </button>
        <button
          type="button"
          onClick={onChangeProduct}
          className="rounded-full border border-white/20 px-4 py-1.5 text-xs text-white/80 transition hover:bg-white/10"
        >
          다른 상품 선택
        </button>
      </div>
    </div>
  )
}
