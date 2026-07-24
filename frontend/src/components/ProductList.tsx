import { useEffect, useState } from 'react'
import type { Product } from '../types/product'
import { ProductCard } from './ProductCard'

export function ProductList({ products }: { products: Product[] }) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  useEffect(() => {
    setSelectedCategory(null)
  }, [products])

  if (products.length === 0) {
    return <p className="py-16 text-center text-gray-500">조건에 맞는 상품을 찾지 못했어요.</p>
  }

  const categories = Array.from(new Set(products.map((p) => p.category).filter(Boolean))).sort()

  const filteredProducts = selectedCategory
    ? products.filter((p) => p.category === selectedCategory)
    : products

  return (
    <div>
      {categories.length > 1 && (
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSelectedCategory(null)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              selectedCategory === null
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            전체 {products.length}
          </button>
          {categories.map((category) => {
            const count = products.filter((p) => p.category === category).length
            return (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                  selectedCategory === category
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {category} {count}
              </button>
            )
          })}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {filteredProducts.map((product, index) => (
          <ProductCard key={`${product.link}-${index}`} product={product} />
        ))}
      </div>
    </div>
  )
}
