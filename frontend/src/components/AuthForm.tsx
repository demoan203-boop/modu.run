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

type Mode = 'login' | 'register' | 'forgot'
type SubmitStatus = 'idle' | 'loading' | 'success' | 'error'

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

// 서버가 로그인 자체와 무관한 인프라 상태(DB/키 미설정)를 알려주는 경우, 내부 사정을
// 그대로 노출하지 않고 사용자에게는 일반적인 안내만 보여준다.
function toFriendlyErrorMessage(raw: string): string {
  if (raw.includes('DATABASE_URL') || raw.includes('JWT_SECRET_KEY')) {
    return '일시적인 서버 문제로 로그인할 수 없습니다. 잠시 후 다시 시도해주세요.'
  }
  return raw
}

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4">
      <path d="M3 3l18 18" />
      <path d="M10.6 5.2A10.9 10.9 0 0 1 12 5c6.5 0 10 7 10 7a15.4 15.4 0 0 1-3.4 4.2M6.5 6.6C4 8.3 2 12 2 12s3.5 7 10 7c1.4 0 2.6-.3 3.7-.8" />
      <path d="M9.9 10a3 3 0 0 0 4.1 4.1" />
    </svg>
  )
}

function SpinnerIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 animate-spin">
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2.5" opacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  )
}

const inputClass =
  'w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 transition focus:border-blue-400/60 focus:bg-white/[0.06] focus:outline-none focus:ring-2 focus:ring-blue-400/20 disabled:cursor-not-allowed disabled:opacity-50'

export function AuthForm({ onClose }: { onClose: () => void }) {
  const { login, register, loginWithGoogle, loginWithKakao } = useAuth()
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [status, setStatus] = useState<SubmitStatus>('idle')
  const googleButtonRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 })
  const [isPressed, setIsPressed] = useState(false)
  const reducedMotionRef = useRef(false)
  const isSubmitting = status === 'loading'

  useEffect(() => {
    reducedMotionRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (GOOGLE_CLIENT_ID) {
      loadScript('https://accounts.google.com/gsi/client')
        .then(() => {
          if (!window.google || !googleButtonRef.current) return
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: (response) => {
              loginWithGoogle(response.credential)
                .then(onClose)
                .catch((err) => {
                  setError(toFriendlyErrorMessage(err instanceof Error ? err.message : '구글 로그인에 실패했습니다.'))
                })
            },
          })
          window.google.accounts.id.renderButton(googleButtonRef.current, {
            theme: 'filled_black',
            size: 'large',
            width: 320,
            shape: 'pill',
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
    if (!window.Kakao || isSubmitting) return
    window.Kakao.Auth.login({
      scope: 'account_email',
      success: (authObj) => {
        loginWithKakao(authObj.access_token)
          .then(onClose)
          .catch((err) => {
            setError(toFriendlyErrorMessage(err instanceof Error ? err.message : '카카오 로그인에 실패했습니다.'))
          })
      },
      fail: () => setError('카카오 로그인에 실패했습니다.'),
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isSubmitting) return
    setError(null)
    setStatus('loading')
    try {
      if (mode === 'login') {
        await login(email, password, remember)
        setStatus('success')
        window.setTimeout(onClose, 700)
      } else if (mode === 'register') {
        await register(email, password)
        onClose()
      } else {
        await requestPasswordReset(email)
        setMessage('입력하신 이메일로 재설정 링크를 보냈어요. 메일함을 확인해주세요.')
        setStatus('idle')
      }
    } catch (err) {
      setStatus('error')
      setError(toFriendlyErrorMessage(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.'))
      window.setTimeout(() => setStatus((prev) => (prev === 'error' ? 'idle' : prev)), 600)
    }
  }

  function switchMode(next: Mode) {
    setMode(next)
    setError(null)
    setMessage(null)
    setStatus('idle')
  }

  function handleButtonMouseMove(e: React.MouseEvent<HTMLButtonElement>) {
    if (reducedMotionRef.current || isSubmitting) return
    if (window.matchMedia('(pointer: coarse)').matches) return
    const rect = e.currentTarget.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width - 0.5
    const py = (e.clientY - rect.top) / rect.height - 0.5
    setTilt({ rx: py * -8, ry: px * 8 })
  }

  function resetTilt() {
    setTilt({ rx: 0, ry: 0 })
    setIsPressed(false)
  }

  const buttonScale = (isPressed ? 0.975 : 1) * (status === 'idle' && !isSubmitting ? 1 : 1)
  const buttonTransform = reducedMotionRef.current
    ? undefined
    : `perspective(600px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) scale(${buttonScale})`

  const buttonLabel =
    status === 'loading'
      ? mode === 'login'
        ? '로그인 중...'
        : mode === 'register'
          ? '가입 처리 중...'
          : '전송 중...'
      : status === 'success'
        ? '로그인되었습니다'
        : mode === 'login'
          ? '로그인'
          : mode === 'register'
            ? '가입하기'
            : '재설정 링크 보내기'

  const buttonBg =
    status === 'success'
      ? 'from-teal-500 to-emerald-500 shadow-[0_8px_28px_rgba(20,184,166,0.4)]'
      : 'from-blue-600 to-purple-600 shadow-[0_8px_28px_rgba(99,102,241,0.35)] hover:shadow-[0_10px_32px_rgba(99,102,241,0.5)]'

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gradient-to-b from-[#05070f] via-[#0a0e1a] to-black">
      <div
        aria-hidden
        className="pointer-events-none fixed -left-40 -top-40 h-96 w-96 rounded-full bg-blue-600/25 blur-[110px]"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed -bottom-40 -right-40 h-96 w-96 rounded-full bg-purple-600/25 blur-[110px]"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-[100px]"
      />

      <div className="relative flex min-h-dvh items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-[420px] rounded-2xl border border-white/10 bg-white/[0.06] p-6 shadow-2xl backdrop-blur-xl sm:p-8">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-lg font-black tracking-tight text-white">MODU</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="닫기"
              className="flex h-9 w-9 items-center justify-center rounded-full text-white/40 transition hover:bg-white/10 hover:text-white/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400"
            >
              ✕
            </button>
          </div>

          <h2 className="text-xl font-bold text-white">
            {mode === 'login' && '다시 오신 것을 환영합니다'}
            {mode === 'register' && '계정 만들기'}
            {mode === 'forgot' && '비밀번호 찾기'}
          </h2>
          <p className="mt-1 text-sm text-white/50">
            {mode === 'login' && '계속하려면 로그인해주세요.'}
            {mode === 'register' && 'MODU에서 나만의 쇼핑을 시작해보세요.'}
            {mode === 'forgot' && '가입하신 이메일로 재설정 링크를 보내드려요.'}
          </p>

          {message ? (
            <div className="mt-5 flex flex-col gap-3">
              <p className="text-sm text-white/60">{message}</p>
              <button
                type="button"
                onClick={() => switchMode('login')}
                className="min-h-[44px] rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 text-sm font-semibold text-white transition hover:brightness-110"
              >
                로그인으로 돌아가기
              </button>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4" noValidate>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="auth-email" className="text-xs font-medium tracking-wide text-white/50">
                    이메일
                  </label>
                  <input
                    id="auth-email"
                    type={mode === 'login' ? 'text' : 'email'}
                    autoComplete="email"
                    required
                    disabled={isSubmitting}
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                  />
                </div>

                {mode !== 'forgot' && (
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label htmlFor="auth-password" className="text-xs font-medium tracking-wide text-white/50">
                        비밀번호
                      </label>
                      {mode === 'login' && (
                        <button
                          type="button"
                          onClick={() => switchMode('forgot')}
                          className="text-xs text-white/40 transition hover:text-white/70"
                        >
                          비밀번호를 잊으셨나요?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        id="auth-password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                        required
                        minLength={mode === 'register' ? 8 : undefined}
                        disabled={isSubmitting}
                        placeholder={mode === 'register' ? '8자 이상' : '비밀번호'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`${inputClass} pr-10`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        disabled={isSubmitting}
                        aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 표시'}
                        className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-white/40 transition hover:text-white/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400 disabled:opacity-40"
                      >
                        <EyeIcon open={showPassword} />
                      </button>
                    </div>
                  </div>
                )}

                {mode === 'login' && (
                  <label className="flex min-h-[24px] cursor-pointer items-center gap-2 text-xs text-white/50">
                    <input
                      type="checkbox"
                      checked={remember}
                      disabled={isSubmitting}
                      onChange={(e) => setRemember(e.target.checked)}
                      className="h-4 w-4 rounded border-white/20 bg-white/5 accent-blue-500"
                    />
                    로그인 상태 유지
                  </label>
                )}

                {error && (
                  <p role="alert" aria-live="polite" className="text-sm text-red-400">
                    {error}
                  </p>
                )}

                <button
                  ref={buttonRef}
                  type="submit"
                  disabled={isSubmitting || status === 'success'}
                  aria-busy={isSubmitting}
                  onMouseMove={handleButtonMouseMove}
                  onMouseLeave={resetTilt}
                  onMouseDown={() => setIsPressed(true)}
                  onMouseUp={() => setIsPressed(false)}
                  style={{ transform: buttonTransform, transition: 'transform 150ms ease-out, background 300ms' }}
                  className={`mt-1 flex min-h-[46px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r px-4 text-sm font-semibold text-white transition-shadow will-change-transform disabled:cursor-not-allowed ${buttonBg}`}
                >
                  {status === 'loading' && <SpinnerIcon />}
                  {status === 'success' && <CheckIcon />}
                  {buttonLabel}
                </button>
              </form>

              {mode !== 'forgot' && (GOOGLE_CLIENT_ID || KAKAO_JS_KEY) && (
                <div className="mt-5">
                  <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-white/10" />
                    <span className="text-[11px] tracking-wide text-white/30">또는 다음으로 계속</span>
                    <div className="h-px flex-1 bg-white/10" />
                  </div>
                  <div
                    className={`mt-4 flex flex-col items-center gap-2 ${isSubmitting ? 'pointer-events-none opacity-50' : ''}`}
                  >
                    {GOOGLE_CLIENT_ID && <div ref={googleButtonRef} />}
                    {KAKAO_JS_KEY && (
                      <button
                        type="button"
                        onClick={handleKakaoLogin}
                        disabled={isSubmitting}
                        className="min-h-[44px] w-full rounded-full bg-[#FEE500] px-4 text-sm font-medium text-[#191919] transition hover:brightness-95 disabled:cursor-not-allowed"
                      >
                        카카오로 계속하기
                      </button>
                    )}
                  </div>
                </div>
              )}

              <div className="mt-5 text-center">
                {mode === 'forgot' ? (
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className="min-h-[36px] text-sm text-white/50 transition hover:text-white/80"
                  >
                    로그인으로 돌아가기
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
                    className="min-h-[36px] text-sm text-white/50 transition hover:text-white/80"
                  >
                    {mode === 'login' ? '계정이 없으신가요? 회원가입' : '이미 계정이 있으신가요? 로그인'}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
