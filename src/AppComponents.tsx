import type { CSSProperties, ReactNode } from 'react'
import type { AppItem, AppMetric } from './types'
import type { Navigate } from './navigation'
import { cleanProductCopy } from './productCopy'
import { Chevron, IconBadge, ProgressLine, type IconName } from './uiPrimitives'

type Tone = 'purple' | 'green' | 'warning' | 'danger' | 'muted' | string

export function ScreenLead({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow: string
  title: string
  subtitle?: string | null
  children?: ReactNode
}) {
  return (
    <section className="app-lead-panel">
      <span>{cleanCaption(eyebrow)}</span>
      <h1>{cleanCaption(title)}</h1>
      {subtitle ? <p>{cleanCaption(subtitle)}</p> : null}
      {children}
    </section>
  )
}

export function AppSectionCard({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return <article className={`app-section-card ${className ?? ''}`}>{children}</article>
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  actionLabel = '보기',
  onAction,
}: {
  eyebrow?: string | null
  title: string
  subtitle?: string | null
  actionLabel?: string
  onAction?: () => void
}) {
  return (
    <div className="app-section-heading">
      <div>
        {eyebrow ? <span>{cleanCaption(eyebrow)}</span> : null}
        <h2>{cleanCaption(title)}</h2>
        {subtitle ? <p>{cleanCaption(subtitle)}</p> : null}
      </div>
      {onAction ? (
        <button className="app-section-link" type="button" onClick={onAction}>
          {cleanCaption(actionLabel)}
          <Chevron />
        </button>
      ) : null}
    </div>
  )
}

export function FinanceMetricCard({ metric }: { metric: AppMetric }) {
  return (
    <div className="finance-metric-card" data-tone={metric.tone ?? 'default'}>
      <span>{cleanCaption(metric.label)}</span>
      <strong>{cleanCaption(metric.value)}</strong>
      {metric.caption ? <small>{cleanCaption(metric.caption)}</small> : null}
      {typeof metric.progress === 'number' ? (
        <ProgressLine value={metric.progress} tone={metric.tone === 'green' ? 'green' : 'purple'} />
      ) : null}
    </div>
  )
}

export function SignalCard({
  title,
  subtitle,
  value,
  caption,
  icon,
  tone = 'purple',
  progress,
  onClick,
}: {
  title: string
  subtitle?: string | null
  value?: string | null
  caption?: string | null
  icon: IconName | string
  tone?: Tone
  progress?: number | null
  onClick?: () => void
}) {
  const body = (
    <>
      <div className="signal-card-head">
        <IconBadge icon={icon} tone={tone} />
        {caption ? <span>{cleanCaption(caption)}</span> : null}
      </div>
      <div className="signal-card-copy">
        <strong>{cleanCaption(title)}</strong>
        {subtitle ? <small>{cleanCaption(subtitle)}</small> : null}
      </div>
      {value || typeof progress === 'number' ? (
        <div className="signal-card-value">
          {value ? <b>{cleanCaption(value)}</b> : null}
          {typeof progress === 'number' ? <ProgressLine value={progress} tone={tone === 'green' ? 'green' : 'purple'} /> : null}
        </div>
      ) : null}
    </>
  )

  if (onClick) {
    return (
      <button className="signal-card" type="button" data-tone={tone} onClick={onClick}>
        {body}
      </button>
    )
  }

  return <article className="signal-card" data-tone={tone}>{body}</article>
}

export function ActivityRow({
  item,
  navigate,
  rank,
  icon,
  tone,
  actionLabel,
  disabled,
  busy,
  onClick,
}: {
  item: AppItem
  navigate?: Navigate
  rank?: number | null
  icon?: string
  tone?: string
  actionLabel?: string | null
  disabled?: boolean
  busy?: boolean
  onClick?: () => void
}) {
  const rowIcon = icon ?? item.icon ?? inferIcon(`${item.title} ${item.subtitle} ${item.caption}`)
  const rowTone = tone ?? item.tone ?? 'purple'
  const click = onClick ?? (item.detailPath && navigate ? () => navigate(item.detailPath ?? '/') : undefined)
  const body = (
    <>
      {rank ? <span className="activity-rank">{rank}</span> : <IconBadge icon={rowIcon} tone={rowTone} />}
      <div className="activity-copy">
        <strong>{cleanCaption(item.title)}</strong>
        {item.subtitle ? <small>{cleanCaption(item.subtitle)}</small> : null}
      </div>
      {(item.value || item.caption || actionLabel || item.detailPath) ? (
        <span className="activity-trailing">
          {item.value ? <b>{cleanCaption(item.value)}</b> : null}
          {item.caption ? <em>{cleanCaption(item.caption)}</em> : null}
          {actionLabel ? <i>{busy ? '처리 중' : actionLabel}</i> : null}
          {item.detailPath || actionLabel ? <Chevron /> : null}
        </span>
      ) : null}
    </>
  )

  if (click) {
    return (
      <button className="activity-row" type="button" disabled={disabled} aria-busy={busy} onClick={click}>
        {body}
      </button>
    )
  }

  return <article className="activity-row">{body}</article>
}

export function ActionPanel({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={`action-panel ${className ?? ''}`}>{children}</div>
}

export function BottomSheet({
  title,
  onClose,
  children,
}: {
  title: string
  onClose: () => void
  children: ReactNode
}) {
  const titleId = `bottom-sheet-${title.replace(/\s+/g, '-')}`
  return (
    <div className="filter-sheet" role="presentation">
      <button className="filter-sheet-backdrop" type="button" aria-label="선택 닫기" onClick={onClose} />
      <section className="filter-sheet-panel" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <div className="filter-sheet-handle" aria-hidden="true" />
        <header className="filter-sheet-header">
          <h2 id={titleId}>{title}</h2>
          <button className="filter-sheet-close" type="button" onClick={onClose}>닫기</button>
        </header>
        {children}
      </section>
    </div>
  )
}

export function EmptyState({
  title,
  subtitle,
  icon = 'spark',
}: {
  title: string
  subtitle?: string | null
  icon?: string
}) {
  return (
    <div className="empty-state-panel">
      <IconBadge icon={icon} tone="muted" />
      <div>
        <strong>{cleanCaption(title)}</strong>
        {subtitle ? <p>{cleanCaption(subtitle)}</p> : null}
      </div>
    </div>
  )
}

export function SegmentedControl({
  items,
}: {
  items: Array<{ id: string; label: string; value?: string; active?: boolean; onClick?: () => void }>
}) {
  return (
    <div className="segmented-control">
      {items.map((item) => (
        <button className={item.active ? 'is-active' : ''} type="button" aria-pressed={item.active} onClick={item.onClick} key={item.id}>
          <span>{item.label}</span>
          {item.value ? <strong>{item.value}</strong> : null}
        </button>
      ))}
    </div>
  )
}

export function AmountSelector({
  values,
  value,
  disabled,
  onChange,
}: {
  values: number[]
  value: number
  disabled?: boolean
  onChange: (value: number) => void
}) {
  return (
    <div className="amount-selector">
      {values.map((option) => (
        <button className={option === value ? 'is-selected' : ''} type="button" disabled={disabled} onClick={() => onChange(option)} key={option}>
          +{option.toLocaleString('ko-KR')}
        </button>
      ))}
    </div>
  )
}

export function ConsentRow({
  checked,
  disabled,
  title,
  subtitle,
  onChange,
}: {
  checked: boolean
  disabled?: boolean
  title: string
  subtitle?: string
  onChange: (checked: boolean) => void
}) {
  return (
    <label className={`consent-row ${checked ? 'is-checked' : ''}`}>
      <span>
        <strong>{title}</strong>
        {subtitle ? <small>{subtitle}</small> : null}
      </span>
      <input type="checkbox" checked={checked} disabled={disabled} onChange={(event) => onChange(event.target.checked)} />
      <i aria-hidden="true" />
    </label>
  )
}

export function RecommendationRow({
  item,
  disabled,
  busy,
  actionLabel = '바로 비교',
  onClick,
}: {
  item: AppItem
  disabled?: boolean
  busy?: boolean
  actionLabel?: string
  onClick: () => void
}) {
  const meta = item.subtitle ? cleanCaption(item.subtitle) : '조건 기반 추천'
  const reason = busy ? '비교 그룹을 준비하고 있어요' : cleanCaption(item.caption ?? '공개 금융 루틴이 가까워요')

  return (
    <button className="recommendation-row" type="button" disabled={disabled} aria-busy={busy} onClick={onClick}>
      <IconBadge icon={item.icon ?? 'profile'} tone={item.tone ?? 'purple'} />
      <span className="recommendation-row-copy">
        <strong>{cleanCaption(item.title)}</strong>
        <span>{item.value ? `${cleanCaption(item.value)} · ${meta}` : meta}</span>
        <small>{reason}</small>
      </span>
      <span className="recommendation-row-action">
        <b>{busy ? '준비 중' : actionLabel}</b>
        <Chevron />
      </span>
    </button>
  )
}

export function ProfileSignalChips({
  signals,
  label = '금융 신호',
}: {
  signals: Array<{ active: boolean; label: string; icon: IconName | string }>
  label?: string
}) {
  return (
    <div className="compare-profile-signals" aria-label={label}>
      {signals.map((signal) => (
        <span className={signal.active ? 'active' : ''} key={signal.label}>
          <IconBadge icon={signal.icon} tone={signal.active ? 'purple' : 'muted'} />
          <b>{signal.label}</b>
          <i aria-hidden="true" />
        </span>
      ))}
    </div>
  )
}

export function CompareReportRow({
  item,
  onClick,
}: {
  item: AppItem
  onClick?: () => void
}) {
  const mine = numberFromItemData(item, 'mine') ?? numberFromItemData(item, 'progress') ?? 50
  const group = numberFromItemData(item, 'group') ?? 0
  const minePosition = clampPercent(numberFromItemData(item, 'minePosition') ?? mine)
  const rawGroupPosition = numberFromItemData(item, 'groupPosition') ?? group
  const groupPosition = clampPercent(rawGroupPosition === 0 ? 50 : rawGroupPosition)
  const deltaLabel = stringFromItemData(item, 'deltaLabel') ?? '그룹과 비교 중이에요'
  const deltaDirection = stringFromItemData(item, 'deltaDirection') ?? 'same'
  const gaugeStyle = {
    '--mine-position': `${minePosition}%`,
    '--group-position': `${groupPosition}%`,
    '--diff-start': `${Math.min(minePosition, groupPosition)}%`,
    '--diff-width': `${Math.abs(minePosition - groupPosition)}%`,
  } as CSSProperties

  const body = (
    <>
      <IconBadge icon={item.icon ?? 'saving'} tone={item.tone ?? 'purple'} />
      <div className="compare-report-copy">
        <div className="compare-report-heading">
          <div>
            <strong>{cleanCaption(item.title)}</strong>
            {item.subtitle ? <span>{cleanCaption(item.subtitle)}</span> : null}
          </div>
          <div className="compare-report-value">
            {item.value ? <b>{cleanCaption(item.value)}</b> : null}
            {item.caption ? <small>{cleanCaption(item.caption)}</small> : null}
          </div>
        </div>
        <div className={`compare-report-gauge ${deltaDirection}`} style={gaugeStyle}>
          <div className="compare-report-track" aria-label="그룹 평균 대비 내 위치">
            <span className="compare-report-fill" />
            <span className="compare-report-baseline"><b>그룹 평균</b></span>
            <span className="compare-report-marker"><b>나</b></span>
          </div>
          <div className="compare-report-scale" aria-hidden="true">
            <span>낮음</span>
            <span>높음</span>
          </div>
        </div>
        <span className={`compare-report-pill ${deltaDirection}`}>{cleanCaption(deltaLabel)}</span>
      </div>
    </>
  )

  if (onClick) {
    return (
      <button className="compare-report-row" type="button" onClick={onClick}>
        {body}
      </button>
    )
  }

  return <article className="compare-report-row">{body}</article>
}

export function CompareActionPanel({
  title,
  subtitle,
  children,
  className,
}: {
  title: string
  subtitle?: string | null
  children: ReactNode
  className?: string
}) {
  return (
    <section className={`compare-action-panel ${className ?? ''}`}>
      <div className="compare-action-panel-copy">
        <strong>{title}</strong>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      <div className="compare-action-panel-actions">
        {children}
      </div>
    </section>
  )
}

function inferIcon(text: string): string {
  if (text.includes('식비') || text.includes('카페') || text.includes('지출')) {
    return 'spend'
  }
  if (text.includes('저축') || text.includes('적금') || text.includes('비상금')) {
    return 'saving'
  }
  if (text.includes('투자') || text.includes('주식')) {
    return 'stocks'
  }
  if (text.includes('연금')) {
    return 'pension'
  }
  if (text.includes('생일') || text.includes('펀드')) {
    return 'gift'
  }
  if (text.includes('기록')) {
    return 'calendar'
  }
  return 'check'
}

function cleanCaption(caption: string) {
  return cleanProductCopy(caption)
}

function numberFromItemData(item: AppItem, key: string): number | null {
  const value = item.data?.[key]
  return typeof value === 'number' ? value : null
}

function stringFromItemData(item: AppItem, key: string): string | null {
  const value = item.data?.[key]
  return typeof value === 'string' && value.length > 0 ? value : null
}

function clampPercent(value: number): number {
  return Math.max(0, Math.min(100, value))
}
