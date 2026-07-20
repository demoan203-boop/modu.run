import type { Product } from '../types/product'
import { ProductCard } from './ProductCard'

export function ProductList({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return <p className="py-16 text-center text-gray-500">조건에 맞는 상품을 찾지 못했어요.</p>
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
      {products.map((product, index) => (
        <ProductCard key={`${product.link}-${index}`} product={product} />
      ))}
    </div>
  )
}
