import { useRef } from 'react'
import type { Navigate } from './navigation'
import { AppSectionCard, SectionHeading } from './AppComponents'
import { BigNumber, CoachBubble, MissionCard } from './components'
import { IconButton, MiniLineChart, StatusBar } from './uiPrimitives'
import { detailedProfile, type AssetCategory, type SavingsTrendPoint, type SpendingCategory } from './detailedProfileData'
import './detailedProfile.css'

/** 안정→공격 순 틸 램프. 브랜드 규칙상 다색 대신 틸 단일톤 시퀀스만 사용한다(DESIGN.md 데이터비즈). */
const TEAL_RAMP = ['var(--teal-900)', 'var(--teal-700)', 'var(--teal-600)', 'var(--teal)', 'var(--teal-400)', 'var(--teal-200)', 'var(--teal-100)', 'var(--teal-50)']
const PROFILE_AVATAR_SRC = `${import.meta.env.BASE_URL}assets/characters/finmate-growth.png`

/**
 * FinMate 상세 개인 프로필 — 익명 기반 "내 금융 스냅샷 + 개인 분석" 화면.
 * 또래 비교·FOMO 요소는 넣지 않는다(비교는 '비교' 탭이 담당). navigation.ts의
 * profile-detail 라우트에서만 진입하는 독립 화면 — 기존 ProfileSections/screenRenderer와 분리.
 */
export function DetailedProfilePage({ navigate }: { navigate: Navigate }) {
  const missionRef = useRef<HTMLDivElement>(null)
  const incomeRef = useRef<HTMLDivElement>(null)
  const assetsRef = useRef<HTMLDivElement>(null)
  const spendingRef = useRef<HTMLDivElement>(null)

  const scrollTo = (ref: { current: HTMLDivElement | null }) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="screen screen-profile-detail">
      <StatusBar time="9:41" />
      <header className="app-header">
        <div className="header-side">
          <IconButton icon="back" label="뒤로" onClick={() => navigate('/profile')} />
        </div>
        <h1>프로필</h1>
        <div className="header-side right">
          <button className="text-link" type="button" onClick={() => navigate('/settings/privacy')}>설정</button>
        </div>
      </header>

      <ProfileHero />
      <SummaryBadges onSelect={(key) => scrollTo(key === 'income' ? incomeRef : key === 'assets' ? assetsRef : spendingRef)} />

      <section className="screen-stack">
        <MonthlyReportSection />
        <div ref={missionRef}>
          <MissionsSection />
        </div>
        <div ref={incomeRef}>
          <IncomeSection />
        </div>
        <div ref={assetsRef}>
          <AssetsSection navigate={navigate} />
        </div>
        <div ref={spendingRef}>
          <SpendingSection onStartMission={() => scrollTo(missionRef)} />
        </div>
        <IncomeSavingsSection />
        <InsuranceSection />
      </section>
    </div>
  )
}

function ProfileHero() {
  const { header } = detailedProfile
  return (
    <section className="pd-hero">
      <div className="pd-avatar-wrap">
        <img className="pd-avatar" src={PROFILE_AVATAR_SRC} alt="" aria-hidden="true" />
        <span className="pd-avatar-badge">{header.gradeBadge}</span>
      </div>
      <strong className="pd-nickname">{header.nickname}</strong>
      <p className="pd-subinfo">{header.ageBand} · {header.jobStatus}</p>
      <div className="pd-follow-row">
        <span>Followers <b>{header.followers}</b></span>
        <span>Following <b>{header.following}</b></span>
      </div>
    </section>
  )
}

function SummaryBadges({ onSelect }: { onSelect: (key: 'income' | 'assets' | 'spending') => void }) {
  const { summaryBadges } = detailedProfile
  return (
    <div className="pd-summary-badges">
      <button className="pd-summary-badge" type="button" onClick={() => onSelect('income')}>
        <span>{summaryBadges.annualIncome.label}</span>
        <strong>{summaryBadges.annualIncome.amountLabel}</strong>
      </button>
      <button className="pd-summary-badge" type="button" onClick={() => onSelect('assets')}>
        <span>{summaryBadges.totalAssets.label}</span>
        <strong>{summaryBadges.totalAssets.amountLabel}</strong>
      </button>
      <button className="pd-summary-badge" type="button" onClick={() => onSelect('spending')}>
        <span>{summaryBadges.monthlySpending.label}</span>
        <strong>{summaryBadges.monthlySpending.amountLabel}</strong>
      </button>
    </div>
  )
}

function MissionsSection() {
  return (
    <AppSectionCard>
      <SectionHeading eyebrow="게임화" title="진행 중인 미션" />
      <div className="pd-mission-stack">
        {detailedProfile.missions.map((mission) => (
          <MissionCard
            key={mission.id}
            title={mission.title}
            rewardPoints={mission.rewardPoints}
            status={mission.status}
            progressLabel={mission.progressLabel}
            progressPercent={mission.progressPercent}
          />
        ))}
      </div>
    </AppSectionCard>
  )
}

function IncomeSection() {
  const { income } = detailedProfile
  return (
    <AppSectionCard>
      <SectionHeading eyebrow="소득" title="올해 소득" />
      <BigNumber value={detailedProfile.summaryBadges.annualIncome.amount} unit="원" size="l" />
      <IncomeBarChart yearly={income.yearly} />
      <p className="pd-insight">{income.insight}</p>
    </AppSectionCard>
  )
}

function IncomeBarChart({ yearly }: { yearly: typeof detailedProfile.income.yearly }) {
  const max = Math.max(...yearly.map((point) => point.amount))
  const currentYear = Math.max(...yearly.map((point) => point.year))
  return (
    <div className="pd-bar-chart" role="img" aria-label="연도별 소득 추이">
      {yearly.map((point) => (
        <div className={`pd-bar-chart-col ${point.year === currentYear ? 'is-current' : ''}`} key={point.year}>
          <span className="pd-bar-chart-value">{point.amountLabel}</span>
          <span className="pd-bar-chart-bar" style={{ height: `${Math.max(4, Math.round((point.amount / max) * 100))}%` }} />
          <span className="pd-bar-chart-year">{point.year}</span>
        </div>
      ))}
    </div>
  )
}

function AssetsSection({ navigate }: { navigate: Navigate }) {
  const { assets } = detailedProfile
  const colorById = buildCategoryColorMap(assets.categories)

  return (
    <AppSectionCard>
      <SectionHeading eyebrow="금융자산" title="총 금융자산" />
      <BigNumber value={assets.total} unit="원" size="l" />
      <div className="pd-asset-stack-bar" role="img" aria-label="자산 구성 비중">
        {assets.categories.map((category) => (
          <span
            className="pd-asset-stack-seg"
            key={category.id}
            style={{ width: `${category.sharePercent}%`, background: colorById.get(category.id) }}
          />
        ))}
      </div>
      <div className="pd-asset-grid">
        {assets.categories.map((category) => (
          <button
            className="pd-asset-card"
            type="button"
            key={category.id}
            onClick={() => navigate(`/profile/detail/assets/${category.id}`)}
          >
            <span className="pd-asset-card-head">
              <i style={{ background: colorById.get(category.id) }} />
              {category.label} {category.sharePercent}%
            </span>
            <strong>{category.amountLabel}</strong>
            <small>{category.note}</small>
          </button>
        ))}
      </div>
      <p className="pd-insight">{assets.styleInsight}</p>
    </AppSectionCard>
  )
}

function SpendingSection({ onStartMission }: { onStartMission: () => void }) {
  const { spending } = detailedProfile
  const colorById = buildCategoryColorMap(spending.categories)

  return (
    <AppSectionCard>
      <SectionHeading eyebrow="소비 패턴" title="이번 달 소비" />
      <BigNumber value={spending.total} unit="원" size="l" caption={spending.comparisonNote} />
      <SpendingDonut categories={spending.categories} colorById={colorById} totalLabel={spending.totalLabel} />
      <div className="pd-category-list">
        {spending.categories.map((category) => (
          <div className="pd-category-row" key={category.id}>
            <span className="pd-category-dot" style={{ background: colorById.get(category.id) }} />
            <span className="pd-category-copy">
              {category.emoji} {category.label}
              <small>{category.sharePercent}%</small>
            </span>
            <span className="pd-category-trailing">
              <b>{category.amountLabel}</b>
              <em className={category.deltaTone}>{category.deltaLabel}</em>
            </span>
          </div>
        ))}
      </div>
      <p className="pd-insight">{spending.insight}</p>
      <CoachBubble message={spending.coachMessage} ctaLabel="미션 시작하기" onCta={onStartMission} />
    </AppSectionCard>
  )
}

function SpendingDonut({
  categories,
  colorById,
  totalLabel,
}: {
  categories: SpendingCategory[]
  colorById: Map<string, string>
  totalLabel: string
}) {
  let cursor = 0
  const stops = categories.map((category) => {
    const start = cursor
    cursor += category.sharePercent
    return `${colorById.get(category.id)} ${start}% ${cursor}%`
  })

  return (
    <div className="pd-donut-wrap">
      <div className="pd-donut" style={{ background: `conic-gradient(${stops.join(', ')})` }} role="img" aria-label="카테고리별 소비 비중">
        <div className="pd-donut-hole">
          <span>이번 달 소비</span>
          <strong>{totalLabel}</strong>
        </div>
      </div>
    </div>
  )
}

function IncomeSavingsSection() {
  const { incomeSavings } = detailedProfile
  return (
    <AppSectionCard>
      <SectionHeading eyebrow="개인 분석" title="소득·저축 패턴" />
      <div className="pd-stat-grid">
        <div className="pd-stat-cell">
          <span>월 평균 소득</span>
          <strong>{incomeSavings.avgIncomeLabel}</strong>
        </div>
        <div className="pd-stat-cell">
          <span>월 평균 소비</span>
          <strong>{incomeSavings.avgSpendingLabel}</strong>
        </div>
        <div className="pd-stat-cell">
          <span>월 평균 저축</span>
          <strong>{incomeSavings.avgSavingsLabel}</strong>
        </div>
        <div className="pd-stat-cell">
          <span>저축률</span>
          <strong>{incomeSavings.savingsRateLabel}</strong>
        </div>
      </div>
      <SavingsTrendChart trend={incomeSavings.trend} />
      <p className="pd-insight">{incomeSavings.insight}</p>
    </AppSectionCard>
  )
}

function SavingsTrendChart({ trend }: { trend: SavingsTrendPoint[] }) {
  return (
    <div className="pd-trend-wrap">
      <MiniLineChart values={trend.map((point) => point.ratePercent)} />
      <div className="pd-trend-labels">
        {trend.map((point) => <span key={point.label}>{point.label}</span>)}
      </div>
    </div>
  )
}

function MonthlyReportSection() {
  const { monthlyReport } = detailedProfile
  return (
    <AppSectionCard>
      <SectionHeading eyebrow="AI 코치 요약" title="이번 달 분석 리포트" />
      <ul className="pd-report-list">
        {monthlyReport.insights.map((line) => <li key={line}>💡 {line}</li>)}
      </ul>
      <div className="pd-mission-chip-row">
        {monthlyReport.recommendedMissions.map((mission) => (
          <span className="pd-mission-chip" key={mission}>✅ {mission}</span>
        ))}
      </div>
    </AppSectionCard>
  )
}

function InsuranceSection() {
  const { insurance } = detailedProfile
  return (
    <AppSectionCard>
      <SectionHeading eyebrow="보험" title="가입 현황" />
      <div className="pd-insurance-row">
        <div>
          <strong>{insurance.monthlyPremiumLabel}</strong>
          <small>총 {insurance.productCount}개</small>
        </div>
      </div>
    </AppSectionCard>
  )
}

function buildCategoryColorMap(categories: Array<AssetCategory | SpendingCategory>): Map<string, string> {
  const liabilities = categories.filter((category) => 'isLiability' in category && category.isLiability)
  const ranked = categories
    .filter((category) => !('isLiability' in category && category.isLiability))
    .slice()
    .sort((a, b) => b.sharePercent - a.sharePercent)

  const colorById = new Map<string, string>()
  ranked.forEach((category, index) => {
    colorById.set(category.id, TEAL_RAMP[Math.min(index, TEAL_RAMP.length - 1)])
  })
  liabilities.forEach((category) => colorById.set(category.id, '#D7DEDB'))
  return colorById
}
