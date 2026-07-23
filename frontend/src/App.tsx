import { useState } from 'react'
import { searchProducts } from './api/client'
import { SearchBar } from './components/SearchBar'
import { LoadingState } from './components/LoadingState'
import { ProductList } from './components/ProductList'
import { AuthForm } from './components/AuthForm'
import { SearchHistoryPanel } from './components/SearchHistoryPanel'
import { IntroScreen } from './components/IntroScreen'
import { useAuth } from './context/AuthContext'
import type { Product } from './types/product'

function App() {
  const { user, isLoading: isAuthLoading, logout } = useAuth()
  const [hasEntered, setHasEntered] = useState(false)
  const [query, setQuery] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [summary, setSummary] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)
  const [showAuthForm, setShowAuthForm] = useState(false)
  const [historyRefreshTrigger, setHistoryRefreshTrigger] = useState(0)

  async function handleSearch(searchQuery: string) {
    setQuery(searchQuery)
    setIsLoading(true)
    setError(null)
    setHasSearched(true)
    try {
      const result = await searchProducts(searchQuery)
      setSummary(result.ai_summary)
      setProducts(result.products)
      if (user) setHistoryRefreshTrigger((n) => n + 1)
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.')
      setProducts([])
      setSummary('')
    } finally {
      setIsLoading(false)
    }
  }

  if (!hasEntered) {
    return <IntroScreen onEnter={() => setHasEntered(true)} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white py-6">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4">
          <div>
            <h1 className="text-2xl font-bold text-indigo-600">MODU</h1>
            <p className="mt-1 text-sm text-gray-500">
              AI 쇼핑 동반자 &mdash; 원하는 걸 말하면 최저가를 찾아드려요
            </p>
          </div>

          {!isAuthLoading && (
            <div>
              {user ? (
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-gray-600">{user.email}</span>
                  <button
                    type="button"
                    onClick={() => logout()}
                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-gray-700 transition hover:bg-gray-50"
                  >
                    로그아웃
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowAuthForm(true)}
                  className="rounded-lg bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-indigo-700"
                >
                  로그인
                </button>
              )}
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        {user && <SearchHistoryPanel onSelect={handleSearch} refreshTrigger={historyRefreshTrigger} />}

        <SearchBar query={query} onQueryChange={setQuery} onSearch={handleSearch} isLoading={isLoading} />

        {isLoading && <LoadingState />}

        {!isLoading && error && (
          <p className="mt-8 rounded-lg bg-red-50 p-4 text-center text-red-600">{error}</p>
        )}

        {!isLoading && !error && hasSearched && (
          <div className="mt-8">
            {summary && (
              <div className="mb-6 rounded-lg bg-indigo-50 p-4 text-indigo-800">{summary}</div>
            )}
            <ProductList products={products} />
          </div>
        )}
      </main>

      {showAuthForm && <AuthForm onClose={() => setShowAuthForm(false)} />}
    </div>
  )
}

export default App
