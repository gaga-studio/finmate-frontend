import type { Navigate } from './navigation'
import { AppSectionCard, SectionHeading } from './AppComponents'
import type { AppItem, AppMetric, AppScreenResponse, AppSection } from './types'
import { IconButton, ProgressLine, StatusBar } from './uiPrimitives'
import './detailedProfile.css'

export function DetailedProfilePage({
  screen,
  navigate,
}: {
  screen: AppScreenResponse
  navigate: Navigate
}) {
  const hero = sectionByKind(screen, 'profileDetailHero')
  const summary = sectionByKind(screen, 'profileDetailSummary')
  const missions = sectionByKind(screen, 'profileDetailMissions')
  const income = sectionByKind(screen, 'profileDetailIncome')
  const assets = sectionByKind(screen, 'profileDetailAssets')
  const spending = sectionByKind(screen, 'profileDetailSpending')
  const report = sectionByKind(screen, 'profileDetailReport')
  const insurance = sectionByKind(screen, 'profileDetailInsurance')
  const isSelf = Boolean(screen.meta?.isSelf)

  return (
    <div className="screen screen-profile-detail">
      <StatusBar time={screen.statusBarTime} />
      <header className="app-header">
        <div className="header-side">
          <IconButton icon="back" label="뒤로" onClick={() => navigate('/profile')} />
        </div>
        <h1>{screen.title}</h1>
        <div className="header-side right">
          {isSelf ? (
            <button className="text-link" type="button" onClick={() => navigate('/settings/privacy')}>
              설정
            </button>
          ) : null}
        </div>
      </header>

      {hero ? <ProfileHero section={hero} /> : null}
      {summary ? <SummaryBadges section={summary} /> : null}

      <section className="screen-stack">
        {missions ? <ItemSection section={missions} /> : null}
        {income ? <MetricSection section={income} /> : null}
        {assets ? <AssetsSection section={assets} navigate={navigate} /> : null}
        {spending ? <ItemSection section={spending} /> : null}
        {report ? <ItemSection section={report} /> : null}
        {insurance ? <MetricSection section={insurance} /> : null}
      </section>
    </div>
  )
}

function ProfileHero({ section }: { section: AppSection }) {
  const avatarSeed = stringData(section.data, 'anonymousAvatarSeed')
  const hidden = Boolean(section.data?.actualNameHidden)
  return (
    <section className="pd-hero">
      <div className={`pd-avatar-seed ${avatarTone(avatarSeed ?? section.title)}`} aria-hidden="true">
        {avatarInitial(section.title)}
      </div>
      <strong className="pd-nickname">{section.title}</strong>
      {section.subtitle ? <p className="pd-subinfo">{section.subtitle}</p> : null}
      {hidden ? <p className="pd-privacy-note">실명, 계좌번호, 거래번호는 숨겨져요.</p> : null}
      {section.metrics?.length ? (
        <div className="pd-follow-row">
          {section.metrics.map((metric) => (
            <span key={metric.label}>
              {metric.label} <b>{metric.value}</b>
            </span>
          ))}
        </div>
      ) : null}
    </section>
  )
}

function SummaryBadges({ section }: { section: AppSection }) {
  const metrics = section.metrics ?? []
  if (!metrics.length) {
    return null
  }
  return (
    <div className="pd-summary-badges">
      {metrics.map((metric) => (
        <div className="pd-summary-badge" key={metric.label}>
          <span>{metric.label}</span>
          <strong>{metric.value}</strong>
          {metric.caption ? <small>{metric.caption}</small> : null}
        </div>
      ))}
    </div>
  )
}

function MetricSection({ section }: { section: AppSection }) {
  const metrics = section.metrics ?? []
  return (
    <AppSectionCard>
      <SectionHeading title={section.title} subtitle={section.subtitle} />
      <div className="pd-stat-grid">
        {metrics.map((metric) => (
          <MetricCell metric={metric} key={metric.label} />
        ))}
      </div>
      {section.data?.empty ? <p className="pd-insight">연결된 상세 데이터가 준비되면 이곳에 표시됩니다.</p> : null}
    </AppSectionCard>
  )
}

function AssetsSection({ section, navigate }: { section: AppSection; navigate: Navigate }) {
  const total = firstMetric(section.metrics)
  const items = section.items ?? []
  return (
    <AppSectionCard>
      <SectionHeading title={section.title} subtitle={section.subtitle} />
      {total ? (
        <div className="pd-detail-hero">
          <span className="pd-detail-eyebrow">{total.label}</span>
          <strong className="pd-big-value">{total.value}</strong>
          {total.caption ? <small>{total.caption}</small> : null}
        </div>
      ) : null}
      <div className="pd-asset-grid">
        {items.map((item) => (
          <button
            className="pd-asset-card"
            type="button"
            key={item.id}
            onClick={() => item.detailPath && navigate(item.detailPath)}
            disabled={!item.detailPath}
          >
            <span className="pd-asset-card-head">
              <i />
              {item.title}
            </span>
            <strong>{item.value ?? '-'}</strong>
            <small>{item.subtitle ?? item.caption ?? '상세 없음'}</small>
            {item.caption ? <em>{item.caption}</em> : null}
          </button>
        ))}
      </div>
    </AppSectionCard>
  )
}

function MetricCell({ metric }: { metric: AppMetric }) {
  return (
    <div className="pd-stat-cell">
      <span>{metric.label}</span>
      <strong>{metric.value}</strong>
      {metric.caption ? <small>{metric.caption}</small> : null}
      {typeof metric.progress === 'number' ? <ProgressLine value={metric.progress} tone="teal" /> : null}
    </div>
  )
}

function ItemSection({ section }: { section: AppSection }) {
  const items = section.items ?? []
  return (
    <AppSectionCard>
      <SectionHeading title={section.title} subtitle={section.subtitle} />
      <div className="pd-category-list">
        {items.map((item) => (
          <ItemRow item={item} key={item.id} />
        ))}
      </div>
    </AppSectionCard>
  )
}

function ItemRow({ item }: { item: AppItem }) {
  const share = numericData(item.data, 'sharePercent')
  return (
    <div className="pd-category-row">
      <span className="pd-category-dot" />
      <span className="pd-category-copy">
        {item.title}
        {item.subtitle ? <small>{item.subtitle}</small> : null}
      </span>
      <span className="pd-category-trailing">
        {item.value ? <b>{item.value}</b> : null}
        {item.caption ? <em>{item.caption}</em> : null}
      </span>
      {typeof share === 'number' ? <ProgressLine value={share} tone="teal" /> : null}
    </div>
  )
}

function sectionByKind(screen: AppScreenResponse, kind: string) {
  return screen.sections.find((section) => section.kind === kind)
}

function firstMetric(metrics?: AppMetric[] | null) {
  return metrics?.[0] ?? null
}

function avatarInitial(title: string) {
  return title.replace(/\d/g, '').trim().slice(0, 1) || 'F'
}

function avatarTone(seed: string) {
  const code = Array.from(seed).reduce((total, char) => total + char.charCodeAt(0), 0)
  return `tone-${code % 6}`
}

function stringData(data: AppSection['data'], key: string) {
  const value = data?.[key]
  return typeof value === 'string' ? value : null
}

function numericData(data: AppItem['data'], key: string) {
  const value = data?.[key]
  return typeof value === 'number' ? value : null
}
