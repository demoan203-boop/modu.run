import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { requestPasswordReset } from '../api/client'

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string
            callback: (response: { credential: string }) => void
          }) => void
          renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void
        }
      }
    }
    Kakao?: {
      init: (key: string) => void
      isInitialized: () => boolean
      Auth: {
        login: (options: {
          success: (authObj: { access_token: string }) => void
          fail: (err: unknown) => void
          scope?: string
        }) => void
      }
    }
  }
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
const KAKAO_JS_KEY = import.meta.env.VITE_KAKAO_JS_KEY

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve()
      return
    }
    const script = document.createElement('script')
    script.src = src
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error(`${src} 로드에 실패했습니다.`))
    document.head.appendChild(script)
  })
}

export function AuthForm({ onClose }: { onClose: () => void }) {
  const { login, register, loginWithGoogle, loginWithKakao } = useAuth()
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const googleButtonRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (GOOGLE_CLIENT_ID) {
      loadScript('https://accounts.google.com/gsi/client')
        .then(() => {
          if (!window.google || !googleButtonRef.current) return
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: (response) => {
              loginWithGoogle(response.credential).then(onClose).catch((err) => {
                setError(err instanceof Error ? err.message : '구글 로그인에 실패했습니다.')
              })
            },
          })
          window.google.accounts.id.renderButton(googleButtonRef.current, {
            theme: 'outline',
            size: 'large',
            width: 320,
          })
        })
        .catch(() => {})
    }

    if (KAKAO_JS_KEY) {
      loadScript('https://developers.kakao.com/sdk/js/kakao.js')
        .then(() => {
          if (window.Kakao && !window.Kakao.isInitialized()) {
            window.Kakao.init(KAKAO_JS_KEY)
          }
        })
        .catch(() => {})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleKakaoLogin() {
    if (!window.Kakao) return
    window.Kakao.Auth.login({
      scope: 'account_email',
      success: (authObj) => {
        loginWithKakao(authObj.access_token).then(onClose).catch((err) => {
          setError(err instanceof Error ? err.message : '카카오 로그인에 실패했습니다.')
        })
      },
      fail: () => setError('카카오 로그인에 실패했습니다.'),
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      if (mode === 'login') {
        await login(email, password)
        onClose()
      } else if (mode === 'register') {
        await register(email, password)
        onClose()
      } else {
        await requestPasswordReset(email)
        setMessage('입력하신 이메일로 재설정 링크를 보냈어요. 메일함을 확인해주세요.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  function switchMode(next: 'login' | 'register' | 'forgot') {
    setMode(next)
    setError(null)
    setMessage(null)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">
            {mode === 'login' && '로그인'}
            {mode === 'register' && '회원가입'}
            {mode === 'forgot' && '비밀번호 찾기'}
          </h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>

        {message ? (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-gray-600">{message}</p>
            <button
              type="button"
              onClick={() => switchMode('login')}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
            >
              로그인으로 돌아가기
            </button>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input
                type={mode === 'login' ? 'text' : 'email'}
                required
                placeholder="이메일"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
              />
              {mode !== 'forgot' && (
                <input
                  type="password"
                  required
                  minLength={mode === 'register' ? 8 : undefined}
                  placeholder={mode === 'register' ? '비밀번호 (8자 이상)' : '비밀번호'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                />
              )}

              {error && <p className="text-sm text-red-600">{error}</p>}

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-1 rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {mode === 'login' && '로그인'}
                {mode === 'register' && '가입하기'}
                {mode === 'forgot' && '재설정 링크 보내기'}
              </button>
            </form>

            {mode === 'login' && (
              <button
                type="button"
                onClick={() => switchMode('forgot')}
                className="mt-3 w-full text-center text-xs text-gray-400 hover:underline"
              >
                비밀번호를 잊으셨나요?
              </button>
            )}

            {mode !== 'forgot' && (GOOGLE_CLIENT_ID || KAKAO_JS_KEY) && (
              <div className="mt-4 flex flex-col items-center gap-2 border-t border-gray-100 pt-4">
                {GOOGLE_CLIENT_ID && <div ref={googleButtonRef} />}
                {KAKAO_JS_KEY && (
                  <button
                    type="button"
                    onClick={handleKakaoLogin}
                    className="w-full rounded-lg bg-[#FEE500] px-4 py-2 text-sm font-medium text-[#191919] transition hover:brightness-95"
                  >
                    카카오로 계속하기
                  </button>
                )}
              </div>
            )}

            {mode === 'forgot' ? (
              <button
                type="button"
                onClick={() => switchMode('login')}
                className="mt-4 w-full text-center text-sm text-indigo-600 hover:underline"
              >
                로그인으로 돌아가기
              </button>
            ) : (
              <button
                type="button"
                onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
                className="mt-4 w-full text-center text-sm text-indigo-600 hover:underline"
              >
                {mode === 'login' ? '계정이 없으신가요? 회원가입' : '이미 계정이 있으신가요? 로그인'}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
