import { useCallback, useEffect, useRef, useState } from 'react'
import { createVirtualTryOnJob, getVirtualTryOnStatus } from '../api/client'

export type TryOnStatus =
  | 'idle'
  | 'validating'
  | 'uploading'
  | 'queued'
  | 'processing'
  | 'succeeded'
  | 'failed'

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const MAX_FILE_BYTES = 10 * 1024 * 1024
const MIN_DIMENSION_PX = 200
const POLL_INTERVAL_MS = 2000
const MAX_POLL_ATTEMPTS = 30 // 2초 * 30 = 최대 약 60초까지만 폴링

function validateFileBasics(file: File): string | null {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return 'JPG, PNG, WEBP 형식의 이미지만 업로드할 수 있습니다.'
  }
  if (file.size > MAX_FILE_BYTES) {
    return '이미지 용량은 최대 10MB까지 업로드할 수 있습니다.'
  }
  return null
}

function checkImageDimensions(file: File): Promise<string | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      if (img.naturalWidth < MIN_DIMENSION_PX || img.naturalHeight < MIN_DIMENSION_PX) {
        resolve('이미지가 너무 작습니다. 더 선명한 사진을 선택해주세요.')
      } else {
        resolve(null)
      }
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      resolve('이미지를 읽을 수 없습니다. 다른 사진을 선택해주세요.')
    }
    img.src = url
  })
}

export function useVirtualTryOn() {
  const [status, setStatus] = useState<TryOnStatus>('idle')
  const [resultImageUrl, setResultImageUrl] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [provider, setProvider] = useState<string | null>(null)

  const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null)
  const abortController = useRef<AbortController | null>(null)
  const mounted = useRef(true)

  const stopPolling = useCallback(() => {
    if (pollTimer.current) {
      clearInterval(pollTimer.current)
      pollTimer.current = null
    }
    abortController.current?.abort()
    abortController.current = null
  }, [])

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
      stopPolling()
    }
  }, [stopPolling])

  const reset = useCallback(() => {
    stopPolling()
    setStatus('idle')
    setResultImageUrl(null)
    setErrorMessage(null)
    setProvider(null)
  }, [stopPolling])

  const start = useCallback(
    async (personFile: File, cartItemId: number) => {
      stopPolling()
      setResultImageUrl(null)
      setErrorMessage(null)

      setStatus('validating')
      const basicsError = validateFileBasics(personFile)
      if (basicsError) {
        setStatus('failed')
        setErrorMessage(basicsError)
        return
      }
      const dimensionError = await checkImageDimensions(personFile)
      if (!mounted.current) return
      if (dimensionError) {
        setStatus('failed')
        setErrorMessage(dimensionError)
        return
      }

      setStatus('uploading')
      let job
      try {
        job = await createVirtualTryOnJob(personFile, cartItemId)
      } catch (err) {
        if (!mounted.current) return
        setStatus('failed')
        setErrorMessage(err instanceof Error ? err.message : '가상 착용 결과를 생성하지 못했습니다.')
        return
      }
      if (!mounted.current) return

      setProvider(job.provider)
      setStatus(job.status === 'failed' ? 'failed' : 'queued')
      if (job.status === 'failed') {
        setErrorMessage(job.error_message ?? '가상 착용 결과를 생성하지 못했습니다.')
        return
      }

      let attempts = 0
      const controller = new AbortController()
      abortController.current = controller

      pollTimer.current = setInterval(async () => {
        attempts += 1
        if (attempts > MAX_POLL_ATTEMPTS) {
          stopPolling()
          if (mounted.current) {
            setStatus('failed')
            setErrorMessage('처리 시간이 너무 오래 걸립니다. 잠시 후 다시 시도해 주세요.')
          }
          return
        }

        try {
          const polled = await getVirtualTryOnStatus(job.id, controller.signal)
          if (!mounted.current) return

          if (polled.status === 'succeeded') {
            stopPolling()
            setStatus('succeeded')
            setResultImageUrl(polled.result_image_url)
          } else if (polled.status === 'failed') {
            stopPolling()
            setStatus('failed')
            setErrorMessage(polled.error_message ?? '가상 착용 결과를 생성하지 못했습니다.')
          } else {
            setStatus(polled.status)
          }
        } catch {
          // AbortError(정리) 등은 무시 - 다음 tick 혹은 언마운트 정리에서 처리됨
        }
      }, POLL_INTERVAL_MS)
    },
    [stopPolling],
  )

  return { status, resultImageUrl, errorMessage, provider, start, reset }
}
