const CATEGORIES = [
  { label: '패션의류', emoji: '👗' },
  { label: '패션잡화', emoji: '👜' },
  { label: '화장품/미용', emoji: '💄' },
  { label: '디지털/가전', emoji: '📱' },
  { label: '가구/인테리어', emoji: '🛋️' },
  { label: '출산/육아', emoji: '🍼' },
  { label: '식품', emoji: '🍎' },
  { label: '스포츠/레저', emoji: '⚽' },
  { label: '생활/건강', emoji: '🧴' },
  { label: '여가/생활편의', emoji: '🎡' },
]

export function CategoryGrid({ onSelect }: { onSelect: (category: string) => void }) {
  return (
    <div className="mb-8 grid grid-cols-3 gap-3 sm:grid-cols-5">
      {CATEGORIES.map((category) => (
        <button
          key={category.label}
          type="button"
          onClick={() => onSelect(category.label)}
          className="flex flex-col items-center gap-2 rounded-xl border border-gray-200 bg-white py-4 transition hover:border-indigo-300 hover:bg-indigo-50"
        >
          <span className="text-2xl">{category.emoji}</span>
          <span className="text-sm font-medium text-gray-700">{category.label}</span>
        </button>
      ))}
    </div>
  )
}
