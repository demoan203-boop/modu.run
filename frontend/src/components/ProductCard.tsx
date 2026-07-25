import type { Product } from '../types/product'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

export function ProductCard({ product }: { product: Product }) {
  const { user, openAuthForm } = useAuth()
  const { isInCart, toggleItem } = useCart()
  const inCart = isInCart(product.link)

  function handleCartClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!user) {
      openAuthForm()
      return
    }
    toggleItem(product)
  }

  return (
    <div className="relative flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white transition hover:shadow-md">
      <button
        type="button"
        onClick={handleCartClick}
        aria-label={inCart ? '장바구니에서 빼기' : '장바구니에 담기'}
        className={`absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full shadow transition ${
          inCart ? 'bg-indigo-600 text-white' : 'bg-white/90 text-gray-500 hover:text-indigo-600'
        }`}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
          <rect x="4" y="9" width="16" height="11" rx="2" />
          <path d="M8 9V7a4 4 0 0 1 8 0v2" />
          {inCart && <path d="M9 13l2 2 4-4" />}
        </svg>
      </button>

      <a href={product.link} target="_blank" rel="noreferrer" className="flex flex-1 flex-col">
        <div className="aspect-square w-full bg-gray-100">
          {product.image_url && (
            <img
              src={product.image_url}
              alt={product.title}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          )}
        </div>
        <div className="flex flex-1 flex-col gap-1 p-3">
          <p className="line-clamp-2 text-sm text-gray-700">{product.title}</p>
          <p className="mt-auto text-lg font-bold text-indigo-600">
            {product.price.toLocaleString('ko-KR')}원
          </p>
          <p className="text-xs text-gray-400">{product.mall_name}</p>
        </div>
      </a>
    </div>
  )
}
