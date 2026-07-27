import { useState } from 'react'

interface CampaignScene {
  background: string
  dark: boolean
  caption: string
}

const SCENES: CampaignScene[] = [
  {
    background: 'linear-gradient(160deg, #120a0c 0%, #2b1418 60%, #120a0c 100%)',
    dark: true,
    caption: '어둠 속에서 맞닿은 두 손, 로즈 골드 하이라이트',
  },
  {
    background: 'linear-gradient(135deg, #3a2a28 0%, #6b4a44 100%)',
    dark: true,
    caption: '실루엣 속에 번지는 은은한 잔향',
  },
  {
    background: 'linear-gradient(160deg, #caa06a 0%, #e8c9a0 100%)',
    dark: false,
    caption: '피부 위에 스며드는 따뜻한 골드',
  },
  {
    background: 'linear-gradient(160deg, #f1d9c9 0%, #f7e6da 100%)',
    dark: false,
    caption: '손끝에서 완성되는 미니멀 럭셔리',
  },
  {
    background: 'linear-gradient(160deg, #f3d6c4 0%, #f9e8dc 100%)',
    dark: false,
    caption: '어깨 위에 머무는 부드러운 빛',
  },
  {
    background: 'linear-gradient(160deg, #efe0d3 0%, #f8f1e9 100%)',
    dark: false,
    caption: '두 손 안에 담긴 우아함',
  },
  {
    background: 'linear-gradient(160deg, #f7ece4 0%, #fbf5f0 100%)',
    dark: false,
    caption: '가장 단순한 순간, 가장 완벽한 향',
  },
  {
    background: 'linear-gradient(160deg, #f6d9d9 0%, #fbeaea 100%)',
    dark: false,
    caption: '두 손 사이, 은은하게 떠오르는 로즈',
  },
]

function ModuRoseBottle({ dark }: { dark: boolean }) {
  return (
    <div className="flex flex-col items-center drop-shadow-2xl">
      <div className="h-9 w-16 rounded-t-sm bg-gradient-to-b from-gray-200 via-gray-400 to-gray-500 shadow-inner" />
      <div className="relative flex h-48 w-24 items-center justify-center rounded-2xl bg-gradient-to-b from-[#f6dade] to-[#eec3c9] shadow-lg">
        <span
          className={`text-xl italic tracking-wide ${dark ? 'text-white/95' : 'text-white'}`}
          style={{ writingMode: 'vertical-rl', fontFamily: 'Georgia, "Times New Roman", serif' }}
        >
          Modu
        </span>
      </div>
    </div>
  )
}

export function BeautyCampaignCarousel() {
  const [index, setIndex] = useState(0)
  const scene = SCENES[index]

  function goPrev() {
    setIndex((i) => (i - 1 + SCENES.length) % SCENES.length)
  }
  function goNext() {
    setIndex((i) => (i + 1) % SCENES.length)
  }

  return (
    <div className="mb-8 overflow-hidden rounded-xl border border-gray-200">
      <p className="border-b border-gray-100 bg-white px-4 py-2 text-xs font-semibold tracking-widest text-gray-400">
        MODU ROSE CAMPAIGN
      </p>

      <div
        className="relative flex aspect-square w-full items-center justify-center sm:aspect-[4/3]"
        style={{ background: scene.background }}
      >
        <ModuRoseBottle dark={scene.dark} />

        <button
          type="button"
          onClick={goPrev}
          aria-label="이전 캠페인 컷"
          className={`absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-lg backdrop-blur-sm transition hover:scale-105 ${
            scene.dark ? 'bg-white/15 text-white' : 'bg-black/10 text-gray-800'
          }`}
        >
          ‹
        </button>
        <button
          type="button"
          onClick={goNext}
          aria-label="다음 캠페인 컷"
          className={`absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-lg backdrop-blur-sm transition hover:scale-105 ${
            scene.dark ? 'bg-white/15 text-white' : 'bg-black/10 text-gray-800'
          }`}
        >
          ›
        </button>

        <div className="absolute inset-x-0 bottom-0 p-4">
          <p className={`text-xs leading-relaxed ${scene.dark ? 'text-white/85' : 'text-gray-700'}`}>
            {scene.caption}
          </p>
        </div>
      </div>

      <div className="flex justify-center gap-1.5 bg-white py-3">
        {SCENES.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`${i + 1}번째 캠페인 컷으로 이동`}
            onClick={() => setIndex(i)}
            className={`h-1.5 rounded-full transition-all ${i === index ? 'w-5 bg-rose-400' : 'w-1.5 bg-gray-200'}`}
          />
        ))}
      </div>
    </div>
  )
}
