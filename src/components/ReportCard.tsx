import type { ReactNode } from 'react'

export type ReportKind = 'my-group' | 'other-group' | 'follow-group'

const kindBadge: Record<ReportKind, { label: string; tone: 'teal' | 'muted' | 'red' }> = {
  'my-group': { label: '내 그룹', tone: 'teal' },
  'other-group': { label: '다른 그룹', tone: 'muted' },
  'follow-group': { label: '친구 그룹', tone: 'red' },
}

export type ReportStageFour =
  | { kind: 'amounts'; rows: Array<{ label: string; amountLabel: string }> }
  | { kind: 'ratio'; rows: Array<{ label: string; value: string }> }

export type ReportStages = {
  summary: string
  traits: string[]
  behaviors: string[]
  stageFour: ReportStageFour
  gapWithMe: string
  nextAction: { label: string; ctaLabel: string; onCta: () => void }
}

/**
 * 시그니처 컴포넌트 4.7 — 리포트 카드.
 * 잠금 시 흐릿한 프리뷰 + 자물쇠. 열람 시 6단계 고정 구조(UI.md 5.3/7장).
 *
 * 공개 규칙(6장): follow-group(팔로우 집단) 리포트는 4단계에 개인 금액을 절대
 * 넣을 수 없다 — 호출부가 실수로 amounts를 넘겨도 이 컴포넌트가 비율/순위로 강제 전환한다.
 */
export function ReportCard({
  kind,
  title,
  locked,
  pointCost,
  onUnlock,
  stages,
}: {
  kind: ReportKind
  title: string
  locked: boolean
  pointCost?: number
  onUnlock?: () => void
  stages?: ReportStages
}) {
  const badge = kindBadge[kind]

  if (locked || !stages) {
    return (
      <div className="fm-report-card fm-report-locked">
        <span className={`fm-report-badge fm-report-badge-${badge.tone}`}>{badge.label}</span>
        <div className="fm-report-locked-preview" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <div className="fm-report-lock-row">
          <LockIcon />
          <strong>{title}</strong>
        </div>
        <button className="fm-report-unlock" type="button" onClick={onUnlock}>
          {typeof pointCost === 'number' ? `${pointCost.toLocaleString('ko-KR')}포인트로 열람` : '포인트로 열람'}
        </button>
      </div>
    )
  }

  // group-follow(팔로우 집단) 리포트는 개인 금액을 절대 노출하지 않는다 — 방어적 재확인.
  const isFollowGroup = kind === 'follow-group'
  const safeStageFour: ReportStageFour = isFollowGroup && stages.stageFour.kind === 'amounts'
    ? { kind: 'ratio', rows: stages.stageFour.rows.map((row) => ({ label: row.label, value: '비율만 공개' })) }
    : stages.stageFour

  return (
    <article className="fm-report-card fm-report-unlocked">
      <span className={`fm-report-badge fm-report-badge-${badge.tone}`}>{badge.label}</span>
      <strong className="fm-report-title">{title}</strong>

      <ReportStageBlock index={1} label="한 줄 요약">
        <p>{stages.summary}</p>
      </ReportStageBlock>

      <ReportStageBlock index={2} label="대표 특징">
        <ul className="fm-report-tag-list">
          {stages.traits.map((trait) => <li key={trait}>{trait}</li>)}
        </ul>
      </ReportStageBlock>

      <ReportStageBlock index={3} label="많이 하는 금융 행동">
        <ul className="fm-report-tag-list">
          {stages.behaviors.map((behavior) => <li key={behavior}>{behavior}</li>)}
        </ul>
      </ReportStageBlock>

      <ReportStageBlock index={4} label={safeStageFour.kind === 'amounts' ? '많이 쓰는 상품/자산' : '많이 하는 행동 비율'}>
        <div className="fm-report-stage-four">
          {safeStageFour.kind === 'amounts'
            ? safeStageFour.rows.map((row) => (
                <div className="fm-report-stage-four-row" key={row.label}>
                  <span>{row.label}</span>
                  <b className="num">{row.amountLabel}</b>
                </div>
              ))
            : safeStageFour.rows.map((row) => (
                <div className="fm-report-stage-four-row" key={row.label}>
                  <span>{row.label}</span>
                  <b className="num">{row.value}</b>
                </div>
              ))}
        </div>
      </ReportStageBlock>

      <ReportStageBlock index={5} label="나와의 차이">
        <p>{stages.gapWithMe}</p>
      </ReportStageBlock>

      <ReportStageBlock index={6} label="다음 행동 추천">
        <p>{stages.nextAction.label}</p>
        <button className="fm-report-next-cta" type="button" onClick={stages.nextAction.onCta}>
          {stages.nextAction.ctaLabel}
        </button>
      </ReportStageBlock>
    </article>
  )
}

function ReportStageBlock({ index, label, children }: { index: number; label: string; children: ReactNode }) {
  return (
    <section className="fm-report-stage">
      <span className="fm-report-stage-index">{index}</span>
      <div className="fm-report-stage-body">
        <small>{label}</small>
        {children}
      </div>
    </section>
  )
}

function LockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  )
}
