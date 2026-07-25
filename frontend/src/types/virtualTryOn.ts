export type TryOnJobStatus = 'queued' | 'processing' | 'succeeded' | 'failed'

export interface VirtualTryOnJob {
  id: string
  status: TryOnJobStatus
  product_title: string
  category: string
  provider: string
  result_image_url: string | null
  error_message: string | null
  created_at: string
}
