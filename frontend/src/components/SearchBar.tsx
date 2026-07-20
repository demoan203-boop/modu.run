interface SearchBarProps {
  query: string
  onQueryChange: (query: string) => void
  onSearch: (query: string) => void
  isLoading: boolean
}

export function SearchBar({ query, onQueryChange, onSearch, isLoading }: SearchBarProps) {
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = query.trim()
    if (trimmed) onSearch(trimmed)
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full gap-2">
      <input
        type="text"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder="예: 10만원 이하 무선 이어폰, 배터리 오래가는 걸로"
        className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-base focus:border-indigo-500 focus:outline-none"
      />
      <button
        type="submit"
        disabled={isLoading || !query.trim()}
        className="rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        검색
      </button>
    </form>
  )
}
