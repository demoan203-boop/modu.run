export function PrivacyNotice({ agreed, onAgreedChange }: { agreed: boolean; onAgreedChange: (v: boolean) => void }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-[11px] leading-relaxed text-white/60">
      <p className="mb-2 font-semibold text-white/80">이미지 이용 안내</p>
      <p>
        업로드한 사진은 AI 가상 착용 결과 생성 목적으로만 사용되며 서버에 저장되지 않습니다. 생성 결과는
        실제 상품의 색상과 핏과 차이가 있을 수 있습니다.
      </p>
      <label className="mt-2 flex min-h-[24px] cursor-pointer items-center gap-2">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => onAgreedChange(e.target.checked)}
          className="h-4 w-4"
        />
        <span className="text-white/70">안내를 확인했습니다</span>
      </label>
    </div>
  )
}
