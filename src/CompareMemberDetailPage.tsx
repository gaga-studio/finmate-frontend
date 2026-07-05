import { useEffect, useState } from 'react'
import { api } from './api'
import { describeError } from './errors'
import type { Navigate } from './navigation'
import type { AppItem, AppScreenResponse, ProfileFinancialFacts } from './types'
import { profileFactsFromItem } from './profileFacts'
import { anonymousAvatarGlyph, anonymousAvatarStyle } from './anonymousAvatar'
import { AppSectionCard, EmptyState, SectionHeading } from './AppComponents'
import { IconButton, StatusBar } from './uiPrimitives'
import './detailedProfile.css'

const SPENDING_RAMP = ['var(--teal)', 'var(--teal-200)', 'var(--teal-100)', 'var(--ink-300)']

type AssetCategoryEntry = {
  id: string
  label: string
  amountLabel: string
  sharePercent: number
  note: string
}

type LoadState =
  | { status: 'loading' }
  | { status: 'ready'; item: AppItem }
  | { status: 'error'; message: string }

/**
 * 그룹 리포트의 "이 조건에 맞는 사용자" 목록에서 진입하는 익명 프로필 상세 화면.
 * DetailedProfilePage(본인 프로필)와 같은 시각 언어(히어로·배지·소비 도넛)를 쓰되,
 * anonymous scope로 공개된 데이터만 다룬다 — 본인 전용 AI 코치 리포트/미션/보험 등은
 * 다른 사람의 데이터가 아니므로 이 화면에는 아예 넣지 않는다.
 */
export function CompareMemberDetailPage({ memberId, navigate }: { memberId: string; navigate: Navigate }) {
  const [state, setState] = useState<LoadState>({ status: 'loading' })

  useEffect(() => {
    let active = true
    setState({ status: 'loading' })
    api.getAppCompareMemberDetail(memberId)
      .then((screen: AppScreenResponse) => {
        if (!active) return
        const item = screen.sections.find((section) => section.kind === 'compareMemberDetail')?.items?.[0]
        if (item) {
          setState({ status: 'ready', item })
        } else {
          setState({ status: 'error', message: '프로필을 찾을 수 없어요.' })
        }
      })
      .catch((error: unknown) => {
        if (active) setState({ status: 'error', message: describeError(error) })
      })
    return () => {
      active = false
    }
  }, [memberId])

  const goBack = () => {
    if (window.history.length > 1) {
      window.history.back()
      return
    }
    navigate('/compare')
  }

  return (
    <div className="screen screen-compare compare-member-detail-screen">
      <StatusBar time="9:41" />
      <header className="app-header">
        <div className="header-side">
          <IconButton icon="back" label="뒤로" onClick={goBack} />
        </div>
        <h1>익명 프로필</h1>
        <div className="header-side right" />
      </header>

      {state.status === 'loading' ? (
        <EmptyState title="프로필을 불러오는 중이에요" subtitle="공개된 익명 데이터를 가져오고 있어요." icon="search" />
      ) : null}
      {state.status === 'error' ? (
        <EmptyState title="프로필을 불러오지 못했어요" subtitle={state.message} icon="search" />
      ) : null}

      {state.status === 'ready' ? (
        <MemberDetailBody item={state.item} memberId={memberId} navigate={navigate} />
      ) : null}
    </div>
  )
}

function MemberDetailBody({ item, memberId, navigate }: { item: AppItem; memberId: string; navigate: Navigate }) {
  const facts = profileFactsFromItem(item)
  return (
    <>
      <MemberHero facts={facts} />
      <MemberSummaryBadges facts={facts} />
      <section className="screen-stack">
        <MemberAssetsSection item={item} />
        <MemberSpendingSection facts={facts} />
        {facts.productActions?.length ? <MemberTagsSection facts={facts} /> : null}
        <p className="pd-insight">
          공개 동의된 익명 데이터예요 · AI 분석 리포트는 본인 프로필에서만 제공돼요.
        </p>
        <button
          className="app-button primary compare-member-versus-cta"
          type="button"
          onClick={() => navigate(`/compare/members/${memberId}/start`)}
        >
          1:1 비교하기
        </button>
      </section>
    </>
  )
}

function MemberHero({ facts }: { facts: ProfileFinancialFacts }) {
  const avatarStyle = anonymousAvatarStyle(facts.anonymousAvatarSeed)
  const metaLine = [facts.ageBand, facts.jobCategory, facts.incomeBand].filter(Boolean).join(' · ')
  const subLine = [facts.area, facts.moneyStyle].filter(Boolean).join(' · ')

  return (
    <section className="pd-hero">
      <div className="pd-avatar-wrap">
        <span className="pd-avatar" style={avatarStyle} aria-hidden="true">
          {facts.anonymousAvatarSeed ? anonymousAvatarGlyph(facts.anonymousAvatarSeed) : null}
        </span>
        <span className="pd-avatar-badge">익명 프로필</span>
      </div>
      <strong className="pd-nickname">{facts.displayName}</strong>
      {metaLine ? <p className="pd-subinfo">{metaLine}</p> : null}
      {subLine ? <p className="pd-subinfo">{subLine}</p> : null}
    </section>
  )
}

function MemberSummaryBadges({ facts }: { facts: ProfileFinancialFacts }) {
  return (
    <div className="pd-summary-badges">
      {facts.monthlySpendingLabel ? (
        <span className="pd-summary-badge">
          <span>이번 달 소비</span>
          <strong>{facts.monthlySpendingLabel}</strong>
        </span>
      ) : null}
      {facts.savingsLabel ? (
        <span className="pd-summary-badge">
          <span>예적금</span>
          <strong>{facts.savingsLabel}</strong>
        </span>
      ) : null}
      {facts.moneyStyle ? (
        <span className="pd-summary-badge">
          <span>소비 성향</span>
          <strong>{facts.moneyStyle}</strong>
        </span>
      ) : null}
    </div>
  )
}

function MemberAssetsSection({ item }: { item: AppItem }) {
  const categories = assetCategoriesFromItem(item)
  if (categories.length === 0) return null
  const totalAssetsLabel = dataText(item, 'totalAssetsLabel')

  return (
    <AppSectionCard>
      <SectionHeading eyebrow="금융자산" title="자산 구성" />
      {totalAssetsLabel ? (
        <div className="pd-public-amount">
          <span>총 금융자산</span>
          <strong>{totalAssetsLabel}</strong>
        </div>
      ) : null}
      <div className="pd-asset-stack-bar" role="img" aria-label="자산 구성 비중">
        {categories.map((category, index) => (
          <span
            className="pd-asset-stack-seg"
            key={category.id}
            style={{ width: `${category.sharePercent}%`, background: SPENDING_RAMP[index % SPENDING_RAMP.length] }}
          />
        ))}
      </div>
      <div className="pd-asset-grid">
        {categories.map((category, index) => (
          <div className="pd-asset-card" key={category.id}>
            <span className="pd-asset-card-head">
              <i style={{ background: SPENDING_RAMP[index % SPENDING_RAMP.length] }} />
              {category.label} {category.sharePercent}%
            </span>
            <strong>{category.amountLabel}</strong>
            <small>{category.note}</small>
          </div>
        ))}
      </div>
    </AppSectionCard>
  )
}

function assetCategoriesFromItem(item: AppItem): AssetCategoryEntry[] {
  const raw = item.data?.assetCategories
  return Array.isArray(raw) ? (raw as AssetCategoryEntry[]) : []
}

function MemberSpendingSection({ facts }: { facts: ProfileFinancialFacts }) {
  const categories = facts.categorySpending ?? []
  const shares = categories.map((category) => safeShare(category.sharePercent))
  const hasShares = shares.some((share) => share > 0)

  return (
    <AppSectionCard>
      <SectionHeading eyebrow="소비 패턴" title="카테고리별 소비" />
      {facts.monthlySpendingLabel ? (
        <div className="pd-public-amount">
          <span>이번 달 소비</span>
          <strong>{facts.monthlySpendingLabel}</strong>
        </div>
      ) : null}
      {hasShares ? (
        <MemberSpendingDonut categories={categories} shares={shares} totalLabel={facts.monthlySpendingLabel ?? '만원 단위'} />
      ) : null}
      <div className="pd-category-list">
        {categories.map((category, index) => (
          <div className="pd-category-row" key={category.category}>
            <span className="pd-category-dot" style={{ background: SPENDING_RAMP[index % SPENDING_RAMP.length] }} />
            <span className="pd-category-copy">{category.category}</span>
            <span className="pd-category-trailing">
              <b>{category.amountLabel}</b>
            </span>
          </div>
        ))}
      </div>
      {facts.cashflowPattern ? <p className="pd-insight">{facts.cashflowPattern}</p> : null}
    </AppSectionCard>
  )
}

function MemberSpendingDonut({
  categories,
  shares,
  totalLabel,
}: {
  categories: Array<{ category: string; amountLabel: string; sharePercent?: number }>
  shares: number[]
  totalLabel: string
}) {
  let cursor = 0
  const stops = categories.map((_category, index) => {
    const start = cursor
    const share = shares[index] ?? 0
    cursor += share
    return `${SPENDING_RAMP[index % SPENDING_RAMP.length]} ${start}% ${cursor}%`
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

function MemberTagsSection({ facts }: { facts: ProfileFinancialFacts }) {
  return (
    <AppSectionCard>
      <SectionHeading eyebrow="공개 정보" title="금융 행동 태그" />
      <div className="pf-card-tags">
        {facts.productActions?.map((tag) => <span key={tag}>{tag}</span>)}
      </div>
    </AppSectionCard>
  )
}

function safeShare(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, value) : 0
}

function dataText(item: AppItem, key: string): string | null {
  const value = item.data?.[key]
  return typeof value === 'string' && value.length > 0 ? value : null
}
