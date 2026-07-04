import { useState } from 'react'
import { api } from './api'
import { birthdayFundScenario, birthdayOptionPriceLabel, birthdayWishlistOptions, getBirthdayWishlistOption } from './birthdayFundData'
import { describeError } from './errors'
import type { Navigate } from './navigation'
import { IconButton, StatusBar } from './uiPrimitives'
import { AppSectionCard, ConsentRow, ScreenLead, SectionHeading } from './AppComponents'

export function BirthdayContributionPage({ fundId, navigate }: { fundId: string; navigate: Navigate }) {
  const defaultOption = getBirthdayWishlistOption(birthdayFundScenario.featuredOptionId)
  const [selectedOptionId, setSelectedOptionId] = useState(defaultOption.id)
  const [message, setMessage] = useState('생일 축하해!')
  const [anonymous, setAnonymous] = useState(false)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const selectedOption = getBirthdayWishlistOption(selectedOptionId)
  const amount = selectedOption.price

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
        <ScreenLead eyebrow="생일 펀드" title={`${birthdayFundScenario.friendName}의 위시리스트에 금액을 보태요`} subtitle="선물 대신 원하는 금액 카드를 골라서 친구가 직접 위시리스트를 살 수 있게 도와주세요." />
        <AppSectionCard className="form-card birthday-contribution-panel">
          <SectionHeading eyebrow="참여 금액" title="어떤 선물 대신 보탤지 골라주세요" subtitle="이번 단계에서는 결제 없이 참여 흐름만 확인합니다." />
          <div className="contribution-flow">
            <section className="contribution-step contribution-amount-step" aria-label="참여 금액 선택">
              <span className="contribution-step-index">1</span>
              <div>
                <small>선물 대신 보탤 금액</small>
                <div className="birthday-contribution-hero">
                  <strong>{selectedOption.title}</strong>
                  <span>{birthdayOptionPriceLabel(amount)}을 함께 보태요</span>
                </div>
                <div className="birthday-option-grid" role="list" aria-label="생일 위시리스트 참여 금액 선택">
                  {birthdayWishlistOptions.map((option) => (
                    <button
                      className={`birthday-option-tile ${option.id === selectedOptionId ? 'is-selected' : ''}`}
                      type="button"
                      role="listitem"
                      disabled={busy}
                      onClick={() => setSelectedOptionId(option.id)}
                      key={option.id}
                    >
                      <span className="birthday-option-emoji" aria-hidden="true">{option.emoji}</span>
                      <strong>{option.title}</strong>
                      <em>{birthdayOptionPriceLabel(option.price)}</em>
                    </button>
                  ))}
                </div>
              </div>
            </section>
            <section className="contribution-step" aria-label="축하 메시지 입력">
              <span className="contribution-step-index">2</span>
              <div className="birthday-message-card">
                <label className="field-label" htmlFor="birthday-message">축하 메시지</label>
                <p className="birthday-helper-copy">{selectedOption.title} {birthdayOptionPriceLabel(amount)}을 보태며 남길 메시지예요.</p>
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
            <span>{birthdayFundScenario.friendName}가 위시리스트를 직접 살 수 있도록 금액을 보태는 흐름이에요</span>
            <button className="app-button primary" type="button" disabled={busy} onClick={() => { void submit() }}>
              {busy ? '보태는 중' : `${birthdayOptionPriceLabel(amount)} 보태기`}
            </button>
          </div>
        </AppSectionCard>
      </section>
    </div>
  )
}
