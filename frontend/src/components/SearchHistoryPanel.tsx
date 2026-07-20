import { useEffect, useState } from 'react'
import { getSearchHistory } from '../api/client'
import type { SearchHistoryItem } from '../types/auth'

interface SearchHistoryPanelProps {
  onSelect: (query: string) => void
  refreshTrigger: number
}

export function SearchHistoryPanel({ onSelect, refreshTrigger }: SearchHistoryPanelProps) {
  const [history, setHistory] = useState<SearchHistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getSearchHistory()
      .then(setHistory)
      .catch(() => setHistory([]))
      .finally(() => setIsLoading(false))
  }, [refreshTrigger])

  if (isLoading) return null
  if (history.length === 0) return null

  return (
    <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4">
      <h3 className="mb-2 text-sm font-semibold text-gray-500">최근 검색 기록</h3>
      <ul className="flex flex-wrap gap-2">
        {history.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => onSelect(item.query)}
              className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm text-gray-700 transition hover:border-indigo-300 hover:bg-indigo-50"
            >
              {item.query}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
