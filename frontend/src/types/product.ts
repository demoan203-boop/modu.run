export interface Product {
  title: string
  price: number
  mall_name: string
  image_url: string
  link: string
  category: string
}

export interface SearchResponse {
  ai_summary: string
  products: Product[]
}
