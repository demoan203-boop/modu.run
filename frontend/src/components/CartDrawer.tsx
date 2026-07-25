import { useCart } from '../context/CartContext'

export function CartDrawer({ onClose }: { onClose: () => void }) {
  const { items, isLoading, removeItem } = useCart()
  const total = items.reduce((sum, item) => sum + item.price, 0)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="flex max-h-[80vh] w-full max-w-md flex-col rounded-lg bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">장바구니</h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading && <p className="py-8 text-center text-sm text-gray-500">불러오는 중...</p>}

          {!isLoading && items.length === 0 && (
            <p className="py-8 text-center text-sm text-gray-500">장바구니가 비어있어요.</p>
          )}

          {!isLoading && items.length > 0 && (
            <ul className="flex flex-col gap-3">
              {items.map((item) => (
                <li key={item.id} className="flex items-center gap-3">
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md bg-gray-100">
                    {item.image_url && (
                      <img src={item.image_url} alt={item.title} className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-gray-700">{item.title}</p>
                    <p className="text-sm font-bold text-indigo-600">
                      {item.price.toLocaleString('ko-KR')}원
                    </p>
                    <p className="text-xs text-gray-400">{item.mall_name}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.link)}
                    className="shrink-0 text-xs text-gray-400 hover:text-red-500"
                  >
                    삭제
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
            <span className="text-sm text-gray-500">합계</span>
            <span className="text-lg font-bold text-gray-900">{total.toLocaleString('ko-KR')}원</span>
          </div>
        )}
      </div>
    </div>
  )
}
