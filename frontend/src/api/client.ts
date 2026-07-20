import type { SearchResponse } from '../types/product'
import type { SearchHistoryItem, User } from '../types/auth'

// 로컬 개발: 비워두면 Vite 프록시가 처리하는 상대 경로(/api/...) 그대로 사용.
// 프로덕션: 프런트/백엔드가 다른 도메인이므로 Vercel에 VITE_API_URL(예: https://api.moda.run)을 설정.
const API_BASE = import.meta.env.VITE_API_URL ?? ''

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  if (!response.ok) {
    const detail = await response.json().catch(() => null)
    throw new Error(detail?.detail ?? '요청 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.')
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json()
}

export function searchProducts(query: string): Promise<SearchResponse> {
  return request('/api/search', { method: 'POST', body: JSON.stringify({ query }) })
}

export function register(email: string, password: string): Promise<User> {
  return request('/api/auth/register', { method: 'POST', body: JSON.stringify({ email, password }) })
}

export function login(email: string, password: string): Promise<User> {
  return request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
}

export function logout(): Promise<void> {
  return request('/api/auth/logout', { method: 'POST' })
}

export function getMe(): Promise<User> {
  return request('/api/auth/me')
}

export function getSearchHistory(): Promise<SearchHistoryItem[]> {
  return request('/api/search/history')
}
