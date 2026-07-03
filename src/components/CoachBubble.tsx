/**
 * 시그니처 컴포넌트 4.8 — AI 코치 말풍선.
 * 분석기가 아니라 행동 추천기 — 항상 미션 CTA로 끝난다.
 */
export function CoachBubble({
  message,
  ctaLabel,
  onCta,
}: {
  message: string
  ctaLabel: string
  onCta: () => void
}) {
  return (
    <div className="fm-coach-row">
      <span className="fm-coach-avatar" aria-hidden="true">
        <CoachMark />
      </span>
      <div className="fm-coach-bubble">
        <p>{message}</p>
        <button className="fm-coach-cta" type="button" onClick={onCta}>
          {ctaLabel}
        </button>
      </div>
    </div>
  )
}

/** 이모지/제네릭 로봇 대신 심플한 기하 마스코트. */
function CoachMark() {
  return (
    <svg width="26" height="26" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect x="4" y="4" width="24" height="24" rx="8" fill="var(--teal)" />
      <circle cx="12.5" cy="15" r="2.2" fill="var(--surface)" />
      <circle cx="19.5" cy="15" r="2.2" fill="var(--surface)" />
      <path d="M11 21c1.4 1.2 3 1.8 5 1.8s3.6-.6 5-1.8" stroke="var(--surface)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
