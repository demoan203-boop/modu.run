export interface User {
  id: number
  email: string
}

export interface SearchHistoryItem {
  id: number
  query: string
  ai_summary: string
  created_at: string
}
