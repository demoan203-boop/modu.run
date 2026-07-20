import type { Product } from '../types/product'

export function ProductCard({ product }: { product: Product }) {
  return (
    <a
      href={product.link}
      target="_blank"
      rel="noreferrer"
      className="flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white transition hover:shadow-md"
    >
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
  )
}
