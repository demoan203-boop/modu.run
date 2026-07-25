import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import * as api from '../api/client'
import type { CartItem } from '../types/cart'
import type { Product } from '../types/product'
import { useAuth } from './AuthContext'

interface CartContextValue {
  items: CartItem[]
  isLoading: boolean
  isInCart: (link: string) => boolean
  addItem: (product: Product) => Promise<void>
  removeItem: (link: string) => Promise<void>
  toggleItem: (product: Product) => Promise<void>
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setItems([])
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    api
      .getCart()
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setIsLoading(false))
  }, [user])

  function isInCart(link: string) {
    return items.some((item) => item.link === link)
  }

  async function addItem(product: Product) {
    const created = await api.addToCart(product)
    setItems((prev) => (prev.some((item) => item.id === created.id) ? prev : [created, ...prev]))
  }

  async function removeItem(link: string) {
    const item = items.find((i) => i.link === link)
    if (!item) return
    await api.removeFromCart(item.id)
    setItems((prev) => prev.filter((i) => i.id !== item.id))
  }

  async function toggleItem(product: Product) {
    if (isInCart(product.link)) {
      await removeItem(product.link)
    } else {
      await addItem(product)
    }
  }

  return (
    <CartContext.Provider value={{ items, isLoading, isInCart, addItem, removeItem, toggleItem }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart는 CartProvider 내부에서만 사용할 수 있습니다.')
  }
  return context
}
