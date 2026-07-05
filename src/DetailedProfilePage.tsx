import { useEffect, useMemo, useRef, useState } from 'react'
import { api } from './api'
import { describeError } from './errors'
import type { Navigate } from './navigation'
import type { AppItem, AppMetric, AppScreenResponse, AppSection } from './types'
import { AppSectionCard, EmptyState, SectionHeading } from './AppComponents'
import { BigNumber, CoachBubble, MissionCard, type MissionStatus } from './components'
import { IconBadge, IconButton, MiniLineChart, StatusBar } from './uiPrimitives'
import { anonymousAvatarGlyph, anonymousAvatarStyle } from './anonymousAvatar'
import './detailedProfile.css'

/** 안정→공격 순 틸 램프. 브랜드 규칙상 다색 대신 틸 단일톤 시퀀스만 사용한다(DESIGN.md 데이터비즈). */
const TEAL_RAMP = ['var(--teal-900)', 'var(--teal-700)', 'var(--teal-600)', 'var(--teal)', 'var(--teal-400)', 'var(--teal-200)', 'var(--teal-100)', 'var(--teal-50)']

type LoadState =
  | { status: 'loading' }
  | { status: 'ready'; screen: AppScreenResponse }
  | { status: 'error'; message: string }

type AmountBadge = {
  label: string
  amountLabel: string
  amountValue: number
}

type MissionSummary = {
  id: string
  title: string
  rewardPoints: number
  status: MissionStatus
  progressLabel?: string | null
  progressPercent?: number | null
}

type AssetCategory = {
  id: string
  label: string
  sharePercent: number
  amountLabel: string
  note: string
  isLiability?: boolean
  detailPath?: string | null
}

type SpendingCategory = {
  id: string
  emoji: string
  label: string
  amountLabel: string
  sharePercent: number
  deltaLabel: string
  deltaTone: 'up' | 'down' | 'flat'
}

type SavingsTrendPoint = {
  label: string
  ratePercent: number
}

type ProfileDetailModel = {
  title: string
  isSelf: boolean
  header: {
    nickname: string
    gradeBadge: string
    subinfo: string
    followers: string
    following: string
    anonymousAvatarSeed?: string | null
  }
  summaryBadges: {
    annualIncome: AmountBadge
    totalAssets: AmountBadge
    monthlySpending: AmountBadge
  }
  missions: MissionSummary[]
  income: {
    amountLabel: string
    amountValue: number
    caption?: string | null
    insight: string
    yearly: Array<{ year: number; amount: number; amountLabel: string }>
  }
  assets: {
    totalLabel: string
    totalValue: number
    categories: AssetCategory[]
    styleInsight: string
  }
  spending: {
    totalLabel: string
    totalValue: number
    comparisonNote?: string | null
    categories: SpendingCategory[]
    insight: string
    coachMessage?: string | null
  }
  incomeSavings: {
    avgIncomeLabel: string
    avgSpendingLabel: string
    avgSavingsLabel: string
    savingsRateLabel: string
    insight: string
    trend: SavingsTrendPoint[]
  }
  monthlyReport: {
    insights: string[]
    recommendedMissions: string[]
  } | null
  insurance: {
    monthlyPremiumLabel: string
    productCount: string
  }
}

/**
 * FinMate 상세 개인 프로필 — 기존 화면 구조는 유지하되 AppScreenResponse를 source of truth로 사용한다.
 * 본인 화면은 미션/리포트를 포함하고, 타인 화면은 서버의 익명 닉네임과 만원 단위 표시값만 렌더한다.
 */
export function DetailedProfilePage({ targetUserId, navigate }: { targetUserId?: string; navigate: Navigate }) {
  const [state, setState] = useState<LoadState>({ status: 'loading' })

  useEffect(() => {
    let active = true
    setState({ status: 'loading' })
    api.getAppProfileDetail(targetUserId)
      .then((screen) => {
        if (active) setState({ status: 'ready', screen })
      })
      .catch((error: unknown) => {
        if (active) setState({ status: 'error', message: describeError(error) })
      })
    return () => {
      active = false
    }
  }, [targetUserId])

  const goBack = () => {
    if (window.history.length > 1) {
      window.history.back()
      return
    }
    navigate('/profile')
  }

  const title = state.status === 'ready' ? state.screen.title : '프로필'
  const isSelf = state.status === 'ready' ? dataBool(state.screen.meta, 'isSelf', true) : true

  return (
    <div className="screen screen-profile-detail">
      <StatusBar time="9:41" />
      <header className="app-header">
        <div className="header-side">
          <IconButton icon="back" label="뒤로" onClick={goBack} />
        </div>
        <h1>{title}</h1>
        <div className="header-side right">
          {isSelf ? (
            <button className="text-link" type="button" onClick={() => navigate('/settings/privacy')}>설정</button>
          ) : null}
        </div>
      </header>

      {state.status === 'loading' ? (
        <EmptyState title="프로필을 불러오는 중이에요" subtitle="연결된 금융 요약을 정리하고 있어요." icon="search" />
      ) : null}
      {state.status === 'error' ? (
        <EmptyState title="프로필을 불러오지 못했어요" subtitle={state.message} icon="search" />
      ) : null}
      {state.status === 'ready' ? <ProfileDetailBody screen={state.screen} navigate={navigate} /> : null}
    </div>
  )
}

function ProfileDetailBody({ screen, navigate }: { screen: AppScreenResponse; navigate: Navigate }) {
  const model = useMemo(() => toProfileDetailModel(screen), [screen])
  const missionRef = useRef<HTMLDivElement>(null)
  const incomeRef = useRef<HTMLDivElement>(null)
  const assetsRef = useRef<HTMLDivElement>(null)
  const spendingRef = useRef<HTMLDivElement>(null)

  const scrollTo = (ref: { current: HTMLDivElement | null }) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <>
      <ProfileHero model={model} />
      <SummaryBadges model={model} onSelect={(key) => scrollTo(key === 'income' ? incomeRef : key === 'assets' ? assetsRef : spendingRef)} />

      <section className="screen-stack">
        {model.missions.length ? (
          <div ref={missionRef}>
            <MissionsSection missions={model.missions} />
          </div>
        ) : null}
        <div ref={incomeRef}>
          <IncomeSection model={model} />
        </div>
        <div ref={assetsRef}>
          <AssetsSection model={model} navigate={navigate} />
        </div>
        <div ref={spendingRef}>
          <SpendingSection model={model} onStartMission={() => scrollTo(missionRef)} />
        </div>
        <IncomeSavingsSection model={model} />
        {model.monthlyReport ? <MonthlyReportSection model={model} /> : null}
        <InsuranceSection model={model} />
      </section>
    </>
  )
}

function ProfileHero({ model }: { model: ProfileDetailModel }) {
  const seed = model.header.anonymousAvatarSeed
  return (
    <section className="pd-hero">
      <div className="pd-avatar-wrap">
        {seed ? (
          <span className="pd-avatar" style={anonymousAvatarStyle(seed)} aria-hidden="true">
            {anonymousAvatarGlyph(seed)}
          </span>
        ) : (
          <span className="pd-avatar pd-avatar-icon" aria-hidden="true">
            <IconBadge icon="profile" tone="teal" />
          </span>
        )}
        <span className="pd-avatar-badge">{model.header.gradeBadge}</span>
      </div>
      <strong className="pd-nickname">{model.header.nickname}</strong>
      {model.header.subinfo ? <p className="pd-subinfo">{model.header.subinfo}</p> : null}
      <div className="pd-follow-row">
        <span>Followers <b>{model.header.followers}</b></span>
        <span>Following <b>{model.header.following}</b></span>
      </div>
    </section>
  )
}

function SummaryBadges({ model, onSelect }: { model: ProfileDetailModel; onSelect: (key: 'income' | 'assets' | 'spending') => void }) {
  const { summaryBadges } = model
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

function MissionsSection({ missions }: { missions: MissionSummary[] }) {
  return (
    <AppSectionCard>
      <SectionHeading eyebrow="게임화" title="진행 중인 미션" />
      <div className="pd-mission-stack">
        {missions.map((mission) => (
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

function IncomeSection({ model }: { model: ProfileDetailModel }) {
  return (
    <AppSectionCard>
      <SectionHeading eyebrow="소득" title="소득과 저축" />
      <BigNumber value={model.income.amountValue} unit="만원" size="l" caption={model.income.caption} />
      {model.income.yearly.length ? <IncomeBarChart yearly={model.income.yearly} /> : null}
      <p className="pd-insight">{model.income.insight}</p>
    </AppSectionCard>
  )
}

function IncomeBarChart({ yearly }: { yearly: Array<{ year: number; amount: number; amountLabel: string }> }) {
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

function AssetsSection({ model, navigate }: { model: ProfileDetailModel; navigate: Navigate }) {
  const { assets } = model
  const colorById = buildCategoryColorMap(assets.categories)

  return (
    <AppSectionCard>
      <SectionHeading eyebrow="금융자산" title="총 금융자산" />
      <BigNumber value={assets.totalValue} unit="만원" size="l" />
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
            onClick={() => navigate(category.detailPath ?? '/profile/detail')}
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

function SpendingSection({ model, onStartMission }: { model: ProfileDetailModel; onStartMission: () => void }) {
  const { spending } = model
  const colorById = buildCategoryColorMap(spending.categories)

  return (
    <AppSectionCard>
      <SectionHeading eyebrow="소비 패턴" title="이번 달 소비" />
      <BigNumber value={spending.totalValue} unit="만원" size="l" caption={spending.comparisonNote} />
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
      {model.isSelf && spending.coachMessage ? (
        <CoachBubble message={spending.coachMessage} ctaLabel="미션 시작하기" onCta={onStartMission} />
      ) : null}
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

function IncomeSavingsSection({ model }: { model: ProfileDetailModel }) {
  const { incomeSavings } = model
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
      {incomeSavings.trend.length ? <SavingsTrendChart trend={incomeSavings.trend} /> : null}
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

function MonthlyReportSection({ model }: { model: ProfileDetailModel }) {
  const monthlyReport = model.monthlyReport
  if (!monthlyReport) return null
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

function InsuranceSection({ model }: { model: ProfileDetailModel }) {
  const { insurance } = model
  return (
    <AppSectionCard>
      <SectionHeading eyebrow="보험" title="가입 현황" />
      <div className="pd-insurance-row">
        <div>
          <strong>{insurance.monthlyPremiumLabel}</strong>
          <small>{insurance.productCount}</small>
        </div>
      </div>
    </AppSectionCard>
  )
}

function toProfileDetailModel(screen: AppScreenResponse): ProfileDetailModel {
  const hero = sectionByKind(screen, 'profileDetailHero')
  const summary = sectionByKind(screen, 'profileDetailSummary')
  const missions = sectionByKind(screen, 'profileDetailMissions')
  const income = sectionByKind(screen, 'profileDetailIncome')
  const assets = sectionByKind(screen, 'profileDetailAssets')
  const spending = sectionByKind(screen, 'profileDetailSpending')
  const report = sectionByKind(screen, 'profileDetailReport')
  const insurance = sectionByKind(screen, 'profileDetailInsurance')
  const isSelf = dataBool(screen.meta, 'isSelf', dataBool(hero?.data, 'isSelf', false))
  const rawSeed = dataText(hero?.data, 'anonymousAvatarSeed')
  const seed = isSelf ? null : rawSeed
  const annualIncome = metricAt(summary, 0, '연 소득', '0만원')
  const totalAssets = metricAt(summary, 1, '총 금융자산', '0만원')
  const monthlySpending = metricAt(summary, 2, '이번 달 소비', '0만원')
  const incomeMetric = metricAt(income, 0, '월 소득', annualIncome.value)
  const savingsMetric = metricAt(income, 1, '월 저축', '0만원')
  const assetMetric = metricAt(assets, 0, '총 자산', totalAssets.value)
  const spendingMetric = metricAt(spending, 0, '총 소비', monthlySpending.value)
  const savingsRateLabel = savingsMetric.caption?.replace(/^저축률\s*/, '') ?? `${metricProgress(savingsMetric)}%`

  return {
    title: screen.title,
    isSelf,
    header: {
      nickname: hero?.title ?? screen.title,
      gradeBadge: seed ? '익명 프로필' : '내 프로필',
      subinfo: hero?.subtitle ?? '',
      followers: metricByLabel(hero, '팔로워')?.value ?? '-',
      following: metricByLabel(hero, '팔로잉')?.value ?? '-',
      anonymousAvatarSeed: seed,
    },
    summaryBadges: {
      annualIncome: amountBadge(annualIncome),
      totalAssets: amountBadge(totalAssets),
      monthlySpending: amountBadge(monthlySpending),
    },
    missions: (missions?.items ?? []).map(toMissionSummary),
    income: {
      amountLabel: incomeMetric.value,
      amountValue: labelToManwon(incomeMetric.value),
      caption: incomeMetric.caption,
      insight: income?.subtitle ?? '월 소득과 저축 흐름을 기준으로 봅니다.',
      yearly: [],
    },
    assets: {
      totalLabel: assetMetric.value,
      totalValue: labelToManwon(assetMetric.value),
      categories: (assets?.items ?? []).map(toAssetCategory),
      styleInsight: assets?.subtitle ?? '계좌와 투자 상품을 카테고리별로 봅니다.',
    },
    spending: {
      totalLabel: spendingMetric.value,
      totalValue: labelToManwon(spendingMetric.value),
      comparisonNote: spendingMetric.caption,
      categories: (spending?.items ?? []).map(toSpendingCategory),
      insight: spending?.subtitle ?? '개별 거래는 숨기고 카테고리 합계만 보여줍니다.',
      coachMessage: isSelf ? '이번 달 소비 흐름을 보고 바로 실천할 미션을 골라보세요.' : null,
    },
    incomeSavings: {
      avgIncomeLabel: incomeMetric.value,
      avgSpendingLabel: monthlySpending.value,
      avgSavingsLabel: savingsMetric.value,
      savingsRateLabel,
      insight: income?.subtitle ?? '소득과 저축을 월 단위로 확인합니다.',
      trend: [],
    },
    monthlyReport: report ? {
      insights: (report.items ?? []).map((item) => `${item.title}: ${item.subtitle ?? ''}`.trim()),
      recommendedMissions: (report.items ?? []).map((item) => item.title),
    } : null,
    insurance: {
      monthlyPremiumLabel: metricAt(insurance, 0, '보험 데이터', '미연결').value,
      productCount: metricAt(insurance, 0, '보험 데이터', '미연결').caption ?? '후속 MyData 범위',
    },
  }
}

function sectionByKind(screen: AppScreenResponse, kind: string): AppSection | undefined {
  return screen.sections.find((section) => section.kind === kind)
}

function metricAt(section: AppSection | undefined, index: number, fallbackLabel: string, fallbackValue: string): AppMetric {
  return section?.metrics?.[index] ?? { label: fallbackLabel, value: fallbackValue, caption: null, tone: null, progress: null }
}

function metricByLabel(section: AppSection | undefined, label: string): AppMetric | undefined {
  return section?.metrics?.find((metric) => metric.label === label)
}

function amountBadge(metric: AppMetric): AmountBadge {
  return {
    label: metric.label,
    amountLabel: metric.value,
    amountValue: labelToManwon(metric.value),
  }
}

function toMissionSummary(item: AppItem): MissionSummary {
  return {
    id: item.id,
    title: item.title,
    rewardPoints: dataNumberOr(item.data, 'rewardPoints', parseNumber(item.value ?? item.caption ?? '0')),
    status: missionStatus(item),
    progressLabel: item.caption ?? item.subtitle,
    progressPercent: dataOptionalNumber(item.data, 'progressPercent') ?? dataOptionalNumber(item.data, 'progress'),
  }
}

function missionStatus(item: AppItem): MissionStatus {
  const rawStatus = dataText(item.data, 'status')?.toLowerCase()
  const rawEvaluation = dataText(item.data, 'evaluationStatus')?.toLowerCase()
  const text = `${rawStatus ?? ''} ${rawEvaluation ?? ''} ${item.caption ?? ''}`
  if (text.includes('done') || text.includes('complete') || text.includes('success') || text.includes('완료')) return 'done'
  if (text.includes('progress') || text.includes('진행')) return 'in_progress'
  return 'todo'
}

function toAssetCategory(item: AppItem): AssetCategory {
  return {
    id: item.id,
    label: item.title,
    sharePercent: dataNumberOr(item.data, 'sharePercent', parsePercent(item.caption)),
    amountLabel: item.value ?? '0만원',
    note: item.subtitle ?? '',
    isLiability: item.tone === 'muted',
    detailPath: item.detailPath,
  }
}

function toSpendingCategory(item: AppItem): SpendingCategory {
  return {
    id: item.id,
    emoji: emojiForIcon(item.icon),
    label: item.title,
    amountLabel: item.value ?? '0만원',
    sharePercent: dataNumberOr(item.data, 'sharePercent', parsePercent(item.caption)),
    deltaLabel: item.caption ?? '카테고리 합계',
    deltaTone: 'flat',
  }
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
  liabilities.forEach((category) => colorById.set(category.id, 'var(--ink-300)'))
  return colorById
}

function labelToManwon(label?: string | null): number {
  if (!label) return 0
  const normalized = label.replace(/,/g, '')
  const match = normalized.match(/-?\d+(?:\.\d+)?/)
  if (!match) return 0
  const value = Number(match[0])
  if (!Number.isFinite(value)) return 0
  if (normalized.includes('억원')) return Math.round(value * 10_000)
  if (normalized.includes('만원')) return Math.round(value)
  if (normalized.includes('원')) return Math.round(value / 10_000)
  return Math.round(value)
}

function parseNumber(label: string): number {
  const match = label.replace(/,/g, '').match(/-?\d+(?:\.\d+)?/)
  return match ? Number(match[0]) : 0
}

function parsePercent(label?: string | null): number {
  if (!label) return 0
  return Math.max(0, Math.min(100, Math.round(parseNumber(label))))
}

function metricProgress(metric: AppMetric): number {
  return typeof metric.progress === 'number' ? Math.round(metric.progress) : parsePercent(metric.caption)
}

function dataText(data: Record<string, unknown> | null | undefined, key: string): string | null {
  const value = data?.[key]
  return typeof value === 'string' && value.trim() ? value : null
}

function dataBool(data: Record<string, unknown> | null | undefined, key: string, fallback: boolean): boolean {
  const value = data?.[key]
  return typeof value === 'boolean' ? value : fallback
}

function dataOptionalNumber(data: Record<string, unknown> | null | undefined, key: string): number | null {
  const value = data?.[key]
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function dataNumberOr(data: Record<string, unknown> | null | undefined, key: string, fallback: number): number {
  return dataOptionalNumber(data, key) ?? fallback
}

function emojiForIcon(icon?: string | null): string {
  switch (icon) {
    case 'spend':
      return '🍚'
    case 'transport':
      return '🚌'
    case 'stocks':
      return '📈'
    case 'saving':
      return '💰'
    case 'wallet':
      return '👛'
    default:
      return '•'
  }
}
