import { useState } from 'react'
import { api } from './api'
import { describeError } from './errors'
import type { Navigate } from './navigation'
import { IconButton, StatusBar } from './uiPrimitives'
import { AmountSelector, AppSectionCard, ConsentRow, ScreenLead, SectionHeading } from './AppComponents'

export function BirthdayContributionPage({ fundId, navigate }: { fundId: string; navigate: Navigate }) {
  const [amount, setAmount] = useState(10000)
  const [message, setMessage] = useState('생일 축하해!')
  const [anonymous, setAnonymous] = useState(false)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

  const submit = async () => {
    setNotice(null)
    setBusy(true)
    try {
      await api.contributeBirthdayFund(fundId, { amount, message, anonymous })
      navigate(`/birthday-funds/${fundId}/complete`)
    } catch (error: unknown) {
      setNotice(describeError(error))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="screen contribution-screen">
      <StatusBar time="9:41" />
      <header className="app-header">
        <div className="header-side"><IconButton icon="back" label="뒤로" onClick={() => navigate('/birthdays')} /></div>
        <h1>참여하기</h1>
        <div className="header-side right"><IconButton icon="bell" label="알림" /></div>
      </header>
      <section className="screen-stack">
        <ScreenLead eyebrow="생일 펀드" title="부담 없는 금액으로 참여해요" subtitle="친구에게 보일 메시지와 공개 방식을 확인한 뒤 다음 단계로 넘어갑니다." />
        <AppSectionCard className="form-card birthday-contribution-panel">
          <SectionHeading eyebrow="참여 금액" title="금액을 선택해주세요" subtitle="이번 단계에서는 결제 없이 참여 흐름만 확인합니다." />
          <div className="contribution-flow">
            <section className="contribution-step contribution-amount-step" aria-label="참여 금액 선택">
              <span className="contribution-step-index">1</span>
              <div>
                <small>참여 금액</small>
                <div className="amount-display">₩{amount.toLocaleString('ko-KR')}</div>
                <AmountSelector values={[5000, 10000, 20000]} value={amount} disabled={busy} onChange={setAmount} />
              </div>
            </section>
            <section className="contribution-step" aria-label="축하 메시지 입력">
              <span className="contribution-step-index">2</span>
              <div className="birthday-message-card">
                <label className="field-label" htmlFor="birthday-message">축하 메시지</label>
                <textarea id="birthday-message" value={message} disabled={busy} onChange={(event) => setMessage(event.target.value)} />
              </div>
            </section>
            <section className="contribution-step" aria-label="공개 방식 선택">
              <span className="contribution-step-index">3</span>
              <div className="contribution-privacy-step">
                <ConsentRow checked={anonymous} disabled={busy} title="익명으로 참여하기" subtitle="친구 피드에는 개인별 금액이 보이지 않아요." onChange={setAnonymous} />
                <div className="birthday-visibility-preview">
                  <strong>친구에게 보이는 방식</strong>
                  <span>{anonymous ? '익명 참여 · 메시지 선택 공개 · 개인별 금액 비공개' : '이름과 메시지 표시 · 개인별 금액 비공개'}</span>
                </div>
              </div>
            </section>
          </div>
          {notice ? <p className="inline-notice" role="alert">{notice}</p> : null}
          <div className="contribution-submit-row">
            <span>결제 없이 참여 흐름만 확인해요</span>
            <button className="app-button primary" type="button" disabled={busy} onClick={() => { void submit() }}>
              {busy ? '참여 중' : '다음'}
            </button>
          </div>
        </AppSectionCard>
      </section>
    </div>
  )
}
