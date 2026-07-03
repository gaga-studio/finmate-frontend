import { useState } from 'react'
import { api } from './api'
import type { Navigate } from './navigation'
import { cleanProductCopy } from './productCopy'
import { numberFromData } from './screenData'
import { clearSession } from './session'
import type { AppAction, AppItem, AppMetric, AppSection } from './types'
import { Chevron, IconBadge, ProgressLine, type IconName } from './uiPrimitives'

type ProfileSectionProps = {
  section: AppSection
  navigate: Navigate
}

type ProfileSignal = {
  id: string
  title: string
  subtitle?: string | null
  value?: string | null
  caption?: string | null
  icon: IconName
  tone: string
  progress: number
  detailPath?: string | null
}

export function ProfileSegmentedControl({ section, navigate }: ProfileSectionProps) {
  const active = stringFromData(section.data, 'active')

  return (
    <nav className="profile-component profile-tabs-control" aria-label={cleanCopy(section.title)}>
      {section.items?.map((item) => {
        const inferredId = item.id.replace('-tab', '')
        const isActive = Boolean(item.caption) || active === inferredId
        return (
          <button
            className={`profile-tab-button ${isActive ? 'is-active' : ''}`}
            type="button"
            aria-current={isActive ? 'page' : undefined}
            onClick={() => item.detailPath && navigate(item.detailPath)}
            key={item.id}
          >
            <span>{cleanCopy(item.title)}</span>
            {item.subtitle ? <strong>{cleanCopy(item.subtitle)}</strong> : null}
          </button>
        )
      })}
    </nav>
  )
}

export function ProfileRelationshipSummary({ section, navigate }: ProfileSectionProps) {
  const followerMetric = section.metrics?.find((metric) => metric.label.includes('팔로워'))
  const followingMetric = section.metrics?.find((metric) => metric.label.includes('팔로잉')) ?? section.metrics?.[0]

  return (
    <article className="profile-component profile-relationship-card profile-trust-card">
      <div className="profile-relationship-main">
        <span className="profile-status-pill">
          <IconBadge icon="check-square" tone="green" />
          공개 미리보기 안전
        </span>
        <strong>친구에게 보이는 내 공개 상태</strong>
        <p>정확한 금액, 잔액, 거래처는 숨기고 공개 동의한 금융 행동만 보여줘요.</p>
      </div>
      <div className="profile-public-preview" aria-label="공개 상태 요약">
        <span>
          <small>보이는 정보</small>
          <b>연령대, 목표, 미션 상태</b>
        </span>
        <span>
          <small>숨기는 정보</small>
          <b>금액, 잔액, 거래처</b>
        </span>
      </div>
      <button className="profile-privacy-cta" type="button" onClick={() => navigate('/settings/privacy')}>
        공개 범위 확인
        <Chevron />
      </button>
      <div className="profile-relationship-metrics profile-social-strip" aria-label="관계 요약">
        {followingMetric ? (
          <span className="profile-relationship-metric" data-tone={followingMetric.tone ?? 'purple'}>
            <small>{cleanCopy(followingMetric.label)}</small>
            <b>{cleanCopy(followingMetric.value)}</b>
          </span>
        ) : null}
        {followerMetric ? (
          <span className="profile-relationship-metric" data-tone={followerMetric.tone ?? 'green'}>
            <small>{cleanCopy(followerMetric.label)}</small>
            <b>{cleanCopy(followerMetric.value)}</b>
          </span>
        ) : null}
      </div>
    </article>
  )
}

export function ProfileRelationshipList({ section, navigate }: ProfileSectionProps) {
  const items = section.items ?? []
  const isEmpty = items.length === 0 || items.every((item) => Boolean(item.data?.empty) || item.id.includes('empty'))
  const relation = stringFromData(section.data, 'relation')
  const countMetric = section.metrics?.[0]

  return (
    <article className={`profile-component profile-section-card profile-people-section profile-section-${section.id}`}>
      <ProfileSectionHeader section={section} navigate={navigate} />
      {section.subtitle ? <p className="profile-section-subtitle">{cleanCopy(section.subtitle)}</p> : null}
      {countMetric ? (
        <div className="profile-people-summary" data-relation={relation ?? 'following'}>
          <span>{cleanCopy(countMetric.label)}</span>
          <strong>{cleanCopy(countMetric.value)}</strong>
          {countMetric.caption ? <small>{cleanCopy(countMetric.caption)}</small> : null}
        </div>
      ) : null}
      {isEmpty ? (
        <ProfileEmptyState title={items[0]?.title ?? section.title} subtitle={items[0]?.subtitle ?? section.subtitle} />
      ) : (
        <div className="profile-people-list">
          {items.map((item) => (
            <ProfilePersonRow item={item} navigate={navigate} key={item.id} />
          ))}
        </div>
      )}
    </article>
  )
}

export function ProfileSignalDeck({ section, navigate }: ProfileSectionProps) {
  const signals = profileSignals(section)
  const isEmpty = signals.length === 0 || signals.every((signal) => signal.id.includes('empty'))
  const isDistribution = section.kind === 'distribution'
  const activeSignals = signals.filter((signal) => signal.progress > 0)

  return (
    <article className={`profile-component profile-section-card profile-signal-section ${isDistribution ? 'profile-insight-section' : ''} profile-section-${section.id}`}>
      <ProfileSectionHeader section={section} navigate={navigate} />
      {section.subtitle ? <p className="profile-section-subtitle">{cleanCopy(section.subtitle)}</p> : null}
      {isEmpty ? (
        <ProfileEmptyState title={signals[0]?.title ?? section.title} subtitle={signals[0]?.subtitle ?? section.subtitle} />
      ) : isDistribution ? (
        <>
          <div className="profile-insight-summary">
            <IconBadge icon="chart" tone="green" />
            <div>
              <strong>{activeSignals.length}개 공개 신호가 확인됐어요</strong>
              <span>친구들의 정확한 금액이 아니라 시작한 행동 여부만 요약합니다.</span>
            </div>
          </div>
          <div className="profile-insight-list">
            {signals.map((signal) => (
              <ProfileInsightRow signal={signal} key={signal.id} />
            ))}
          </div>
        </>
      ) : (
        <div className="profile-signal-grid profile-signal-list">
          {signals.map((signal) => (
            <ProfileSignalCard signal={signal} navigate={navigate} key={signal.id} />
          ))}
        </div>
      )}
    </article>
  )
}

export function ProfileActivityList({ section, navigate }: ProfileSectionProps) {
  const items = section.items ?? []
  const isEmpty = items.length === 0 || items.every((item) => item.id.includes('empty'))

  return (
    <article className={`profile-component profile-section-card profile-activity-section profile-section-${section.id}`}>
      <ProfileSectionHeader section={section} navigate={navigate} />
      {section.subtitle ? <p className="profile-section-subtitle">{cleanCopy(section.subtitle)}</p> : null}
      {isEmpty ? (
        <ProfileEmptyState title={items[0]?.title ?? section.title} subtitle={items[0]?.subtitle ?? section.subtitle} />
      ) : (
        <div className="profile-activity-list">
          {items.map((item, index) => (
            <ProfileActivityRow item={item} rank={section.kind === 'rankList' ? index + 1 : null} navigate={navigate} key={item.id} />
          ))}
        </div>
      )}
    </article>
  )
}

export function ProfileAccountPanel({ section, navigate }: ProfileSectionProps) {
  const [busyPath, setBusyPath] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const handleAction = async (action: AppAction) => {
    setNotice(null)
    setBusyPath(action.path)
    try {
      if (action.method === 'GET') {
        navigate(action.path)
        return
      }
      if (action.intent === 'logout') {
        await api.logout()
        clearSession()
        navigate('/login')
        return
      }
      navigate(action.path)
    } catch {
      setNotice('요청을 처리하지 못했어요. 잠시 후 다시 시도해주세요.')
    } finally {
      setBusyPath(null)
    }
  }

  return (
    <article className="profile-component profile-account-panel">
      <ProfileSectionHeader section={section} navigate={navigate} />
      {section.subtitle ? <p className="profile-section-subtitle">{cleanCopy(section.subtitle)}</p> : null}
      <div className="profile-wallet-strip">
        <IconBadge icon="spark" tone="purple" />
        <div>
          <span>{cleanCopy(section.metrics?.[0]?.label ?? '포인트')}</span>
          <strong>{cleanCopy(section.metrics?.[0]?.value ?? '0P')}</strong>
          {section.metrics?.[0]?.caption ? <small>{cleanCopy(section.metrics[0].caption)}</small> : null}
        </div>
      </div>
      <div className="profile-account-actions">
        {section.actions?.map((action) => (
          <button
            className={`profile-action-button ${action.tone}`}
            type="button"
            disabled={busyPath !== null}
            aria-busy={busyPath === action.path}
            onClick={() => { void handleAction(action) }}
            key={`${action.label}-${action.path}`}
          >
            <span>{busyPath === action.path ? '처리 중' : cleanCopy(action.label)}</span>
            <Chevron />
          </button>
        ))}
      </div>
      {notice ? <p className="inline-notice profile-action-notice" role="alert">{notice}</p> : null}
    </article>
  )
}

function ProfileSectionHeader({ section, navigate }: ProfileSectionProps) {
  return (
    <div className="profile-section-heading">
      <div>
        <span>{profileSectionEyebrow(section)}</span>
        <h2>{cleanCopy(section.title)}</h2>
      </div>
      {section.detailPath ? (
        <button className="profile-section-action" type="button" onClick={() => navigate(section.detailPath ?? '/profile')}>
          보기
          <Chevron />
        </button>
      ) : null}
    </div>
  )
}

function profileSectionEyebrow(section: AppSection): string {
  if (section.kind === 'relationshipList') {
    return stringFromData(section.data, 'relation') === 'followers' ? '팔로워 목록' : '팔로잉 목록'
  }
  if (section.id === 'following-top') {
    return 'TOP 5 활동'
  }
  if (section.kind === 'distribution') {
    return '분포'
  }
  return '프로필'
}

function ProfilePersonRow({ item, navigate }: { item: AppItem; navigate: Navigate }) {
  const signalCount = numberFromData(item.data, 'publicSignalCount') ?? 0
  const rowBody = (
    <>
      <IconBadge icon={toProfileIcon(item.icon, item.title)} tone={item.tone ?? 'purple'} />
      <div className="profile-person-copy">
        <strong>{cleanCopy(item.title)}</strong>
        {item.subtitle ? <small>{cleanCopy(item.subtitle)}</small> : null}
      </div>
      <span className="profile-person-status">
        <b>{item.value ? cleanCopy(item.value) : signalCount > 0 ? `${signalCount}개 공개` : '공개 신호 대기'}</b>
        {item.caption ? <em>{cleanCopy(item.caption)}</em> : null}
      </span>
    </>
  )

  if (item.detailPath) {
    return (
      <button className="profile-person-row" type="button" onClick={() => navigate(item.detailPath ?? '/profile')}>
        {rowBody}
      </button>
    )
  }

  return <article className="profile-person-row">{rowBody}</article>
}

function ProfileSignalCard({ signal, navigate }: { signal: ProfileSignal; navigate: Navigate }) {
  const content = (
    <>
      <div className="profile-signal-icon-row">
        <IconBadge icon={signal.icon} tone={signal.tone} />
      </div>
      <div className="profile-signal-copy">
        <strong>{cleanCopy(signal.title)}</strong>
        {signal.subtitle ? <small>{cleanCopy(signal.subtitle)}</small> : null}
      </div>
      <div className="profile-signal-value">
        {signal.value ? <b>{cleanCopy(signal.value)}</b> : null}
        {signal.caption ? <span>{cleanCopy(signal.caption)}</span> : null}
      </div>
      <div className="profile-signal-progress">
        <ProgressLine value={signal.progress} tone={signal.tone === 'green' ? 'green' : 'purple'} />
      </div>
    </>
  )

  if (signal.detailPath) {
    return (
      <button className="profile-signal-card profile-signal-row profile-signal-clickable" type="button" data-tone={signal.tone} onClick={() => navigate(signal.detailPath ?? '/profile')}>
        {content}
      </button>
    )
  }

  return <article className="profile-signal-card profile-signal-row" data-tone={signal.tone}>{content}</article>
}

function ProfileActivityRow({ item, rank, navigate }: { item: AppItem; rank: number | null; navigate: Navigate }) {
  const icon = toProfileIcon(item.icon, `${item.title} ${item.subtitle} ${item.caption}`)
  const tone = item.tone ?? 'purple'
  const activityLabel = activityTypeLabel(item.caption, item.subtitle)
  const rowBody = (
    <>
      {rank ? <span className="profile-rank-badge">{rank}</span> : <IconBadge icon={icon} tone={tone} />}
      <div className="profile-activity-copy">
        <strong>{cleanCopy(item.title)}</strong>
        {item.subtitle ? <small>{activitySubtitle(item.subtitle)}</small> : null}
      </div>
      <span className="profile-activity-meta">
        <b>{activityLabel}</b>
        <em>공개 활동</em>
      </span>
    </>
  )

  if (item.detailPath) {
    return (
      <button className="profile-activity-row" type="button" onClick={() => navigate(item.detailPath ?? '/profile')}>
        {rowBody}
      </button>
    )
  }

  return <article className="profile-activity-row">{rowBody}</article>
}

function ProfileInsightRow({ signal }: { signal: ProfileSignal }) {
  return (
    <article className="profile-insight-row" data-tone={signal.tone}>
      <span>{cleanCopy(signal.title)}</span>
      <strong>{signal.value ? cleanCopy(signal.value) : `${signal.progress}%`}</strong>
      <em>{signal.progress > 0 ? '시작한 친구 있음' : '아직 공개 신호 없음'}</em>
    </article>
  )
}

function ProfileEmptyState({ title, subtitle }: { title?: string | null; subtitle?: string | null }) {
  return (
    <div className="profile-empty-panel">
      <IconBadge icon="spark" tone="muted" />
      <div>
        <strong>{title ? cleanCopy(title) : ''}</strong>
        {subtitle ? <p>{cleanCopy(subtitle)}</p> : null}
      </div>
    </div>
  )
}

function profileSignals(section: AppSection): ProfileSignal[] {
  if (section.items?.length) {
    return section.items.map((item) => ({
      id: item.id,
      title: cleanCopy(item.title),
      subtitle: item.subtitle ? cleanCopy(item.subtitle) : item.subtitle,
      value: item.value ? cleanCopy(item.value) : item.value,
      caption: item.caption ? cleanCopy(item.caption) : item.caption,
      icon: toProfileIcon(item.icon, item.title),
      tone: item.tone ?? 'purple',
      progress: clampPercent(numberFromData(item.data, 'mine') ?? numberFromData(item.data, 'progress') ?? percentFromText(item.caption) ?? 0),
      detailPath: item.detailPath,
    }))
  }

  return (section.metrics ?? []).map((metric) => metricSignal(metric))
}

function metricSignal(metric: AppMetric): ProfileSignal {
  return {
    id: metric.label,
    title: cleanCopy(metric.label),
    value: cleanCopy(metric.value),
    caption: metric.caption ? cleanCopy(metric.caption) : metric.caption,
    icon: toProfileIcon(null, metric.label),
    tone: metric.tone ?? 'purple',
    progress: clampPercent(metric.progress ?? percentFromText(metric.caption) ?? 0),
  }
}

function toProfileIcon(icon: string | null | undefined, text: string): IconName {
  if (icon) {
    return icon as IconName
  }
  if (text.includes('주식') || text.includes('투자')) {
    return 'stocks'
  }
  if (text.includes('적금') || text.includes('저축')) {
    return 'saving'
  }
  if (text.includes('펀드')) {
    return 'fund'
  }
  if (text.includes('연금')) {
    return 'pension'
  }
  if (text.includes('공부')) {
    return 'study'
  }
  return 'chart'
}

function activityTypeLabel(caption?: string | null, subtitle?: string | null): string {
  const source = `${caption ?? ''} ${subtitle ?? ''}`
  if (/SAVING|저축|적금/.test(source)) {
    return '저축 활동'
  }
  if (/INVESTMENT|투자|포트폴리오/.test(source)) {
    return '투자 활동'
  }
  if (/MISSION|미션/.test(source)) {
    return '미션 활동'
  }
  return '공개 루틴'
}

function activitySubtitle(value: string): string {
  const copy = cleanCopy(value)
  if (/[+-]?\d[\d,]*원|₩[\d,]+/.test(copy)) {
    if (copy.includes('투자') || copy.includes('포트폴리오')) {
      return '포트폴리오 활동 요약, 금액은 비공개'
    }
    if (copy.includes('저축') || copy.includes('적금')) {
      return '저축 활동 요약, 금액은 비공개'
    }
    return '공개 활동 요약, 금액은 비공개'
  }
  return copy
}

function percentFromText(value?: string | null): number | null {
  const match = value?.match(/(\d+(?:\.\d+)?)%/)
  return match ? Number(match[1]) : null
}

function stringFromData(data: Record<string, unknown> | null | undefined, key: string): string | null {
  const value = data?.[key]
  return typeof value === 'string' && value.length > 0 ? value : null
}

function clampPercent(value: number): number {
  return Math.max(0, Math.min(100, value))
}

function cleanCopy(value: string): string {
  return cleanProductCopy(value)
}
