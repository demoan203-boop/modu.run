export function CategoryMoodPanel() {
  return (
    <div className="mb-8 flex flex-col items-center gap-5 rounded-xl border border-gray-200 bg-white p-6 sm:flex-row sm:items-center">
      <div className="relative h-[420px] w-[280px] shrink-0 overflow-hidden rounded-lg bg-black">
        <div className="animate-mood-sweep pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(255,255,255,0.4),transparent_60%)]" />

        <div className="absolute inset-0 flex items-center justify-center">
          <svg
            className="animate-intro-face-breathe h-20 w-20 text-white/80"
            viewBox="0 0 64 64"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.3"
          >
            <rect x="23" y="27" width="18" height="27" rx="2.5" />
            <path d="M28 27v-6a4 4 0 0 1 4-4h0a4 4 0 0 1 4 4v6" />
            <rect x="29" y="12" width="6" height="6" rx="1" />
            <line x1="23" y1="38" x2="41" y2="38" strokeWidth="0.8" opacity="0.6" />
          </svg>
        </div>

        <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm">
          <div className="ml-0.5 h-0 w-0 border-y-[5px] border-l-[8px] border-y-transparent border-l-white/90" />
        </div>

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/70 to-transparent px-5 pb-5 pt-14">
          <p className="text-[10px] tracking-[0.3em] text-white/60">MODU BEAUTY EDIT</p>
          <p className="mt-1 text-lg font-semibold text-white">화장품 · 미용</p>
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
