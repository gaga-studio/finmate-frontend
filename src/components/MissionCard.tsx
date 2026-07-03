export type MissionStatus = 'todo' | 'in_progress' | 'done'

/**
 * 시그니처 컴포넌트 4.5 — 미션 카드.
 * 좌: 진행 인디케이터, 중: 미션명+보상 포인트, 우: [수행] 버튼(pill, 틸).
 */
export function MissionCard({
  title,
  rewardPoints,
  status,
  progressLabel,
  progressPercent,
  ctaLabel = '수행',
  onCta,
  busy,
}: {
  title: string
  rewardPoints: number
  status: MissionStatus
  progressLabel?: string | null
  progressPercent?: number | null
  ctaLabel?: string
  onCta?: () => void
  busy?: boolean
}) {
  return (
    <div className={`fm-mission-card fm-mission-${status}`}>
      <span className="fm-mission-indicator" aria-hidden="true">
        {status === 'done' ? <CheckMark /> : typeof progressPercent === 'number' ? (
          <RingProgress percent={progressPercent} />
        ) : (
          <span className="fm-mission-dot" />
        )}
      </span>
      <div className="fm-mission-body">
        <strong>{title}</strong>
        <div className="fm-mission-meta">
          <span className={`fm-mission-points ${status === 'done' ? 'fm-mission-points-earned' : ''}`}>
            {status === 'done' ? '+' : ''}{rewardPoints.toLocaleString('ko-KR')}P
          </span>
          {progressLabel ? <em>{progressLabel}</em> : null}
        </div>
      </div>
      {status !== 'done' && onCta ? (
        <button className="fm-mission-cta" type="button" disabled={busy} aria-busy={busy} onClick={onCta}>
          {busy ? '처리 중' : ctaLabel}
        </button>
      ) : null}
      {status === 'done' ? <span className="fm-mission-done-label">완료</span> : null}
    </div>
  )
}

function CheckMark() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m5 13 4 4L19 7" />
    </svg>
  )
}

function RingProgress({ percent }: { percent: number }) {
  const clamped = Math.max(0, Math.min(100, percent))
  const circumference = 2 * Math.PI * 9
  const offset = circumference * (1 - clamped / 100)
  return (
    <svg width="22" height="22" viewBox="0 0 22 22">
      <circle cx="11" cy="11" r="9" fill="none" stroke="var(--line)" strokeWidth="3" />
      <circle
        cx="11"
        cy="11"
        r="9"
        fill="none"
        stroke="var(--teal)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform="rotate(-90 11 11)"
      />
    </svg>
  )
}
