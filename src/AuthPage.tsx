import { useState } from 'react'
import { api } from './api'
import type { Navigate } from './navigation'
import { clearSession, type FinMateSession } from './session'
import { describeError } from './errors'
import { StatusBar } from './uiPrimitives'
import { AppSectionCard, ScreenLead, SectionHeading } from './AppComponents'

export function AuthPage({
  mode,
  onAuth,
  navigate,
  session,
}: {
  mode: 'login' | 'signup'
  onAuth: (session: FinMateSession, target: string) => void
  navigate: Navigate
  session: FinMateSession
}) {
  const [email, setEmail] = useState(mode === 'signup' ? '' : 'p001@synthetic.finmate.local')
  const [password, setPassword] = useState(mode === 'signup' ? '' : 'password123!')
  const [displayName, setDisplayName] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isSignup = mode === 'signup'

  const submit = async () => {
    setBusy(true)
    setError(null)
    try {
      const response = isSignup
        ? await api.signup(email, password, displayName)
        : await api.login(email, password)
      onAuth(
        { accessToken: response.accessToken, expiresAt: response.expiresAt, user: response.user },
        response.user.onboardingCompleted ? '/home' : '/onboarding',
      )
    } catch (caught) {
      setError(describeError(caught))
    } finally {
      setBusy(false)
    }
  }

  if (!isSignup && session.accessToken && session.user) {
    return (
      <div className="screen auth-screen">
        <StatusBar time="9:41" />
        <div className="auth-shell">
          <ScreenLead eyebrow="FinMate" title={`${session.user.displayName}님, 이어서 볼까요?`} subtitle="미션, 기록, 포인트, 친구 금융 생활이 이 계정에 저장되어 있어요." />
          <AppSectionCard className="auth-returning-panel">
            <SectionHeading eyebrow="저장된 세션" title="이 계정으로 계속 진행" subtitle="온보딩 완료 여부에 맞춰 바로 이어집니다." />
            <div className="auth-actions">
              <button className="app-button primary" type="button" onClick={() => navigate(session.user?.onboardingCompleted ? '/home' : '/onboarding')}>앱으로 돌아가기</button>
              <button className="app-button secondary" type="button" onClick={() => { clearSession(); navigate('/login') }}>다른 계정으로 로그인</button>
            </div>
          </AppSectionCard>
        </div>
      </div>
    )
  }

  return (
    <div className="screen auth-screen">
      <StatusBar time="9:41" />
      <div className="auth-shell">
        <ScreenLead
          eyebrow="FinMate"
          title={isSignup ? '나와 비슷한 사람들의 금융 루틴을 비교해보세요' : '금융 루틴으로 다시 들어가기'}
          subtitle={isSignup ? '계정 생성 후 공개 범위와 연결 범위를 차례로 정리해요.' : '오늘의 예산, 미션, 친구 금융 근황을 바로 확인할 수 있어요.'}
        />
        <form className="auth-form auth-form-card" onSubmit={(event) => { event.preventDefault(); void submit() }}>
          <SectionHeading eyebrow={isSignup ? '회원가입' : '로그인'} title={isSignup ? '계정 정보' : '로그인 정보'} subtitle={isSignup ? '이름과 이메일만 먼저 확인합니다.' : '합성 데모 계정이 기본으로 입력되어 있어요.'} />
          {isSignup ? (
            <label className="auth-form-field">
              이름
              <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} autoComplete="name" />
            </label>
          ) : null}
          <label className="auth-form-field">
            이메일
            <input value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" inputMode="email" />
          </label>
          <label className="auth-form-field">
            비밀번호
            <input value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={isSignup ? 'new-password' : 'current-password'} type="password" />
          </label>
          {error ? <p className="error-copy">{error}</p> : null}
          <button className="app-button primary" type="submit" disabled={busy}>
            {busy ? '처리 중' : isSignup ? '회원가입' : '로그인'}
          </button>
        </form>
        <button className="text-link" type="button" onClick={() => navigate(isSignup ? '/login' : '/signup')}>
          {isSignup ? '이미 계정이 있어요' : '처음이라면 회원가입'}
        </button>
      </div>
    </div>
  )
}
