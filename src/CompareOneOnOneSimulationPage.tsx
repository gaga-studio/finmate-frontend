import { useEffect, useState } from 'react'
import { api } from './api'
import { describeError } from './errors'
import type { Navigate } from './navigation'
import type { AppItem, AppScreenResponse } from './types'
import { computeOneOnOneComparison, formatGapValue, type GapItem } from './compareOneOnOne'
import { EmptyState } from './AppComponents'
import { IconButton, StatusBar } from './uiPrimitives'
import './detailedProfile.css'

const MONTHLY_ADDITIONAL_SAVING = 100_000
const PERIOD_MONTHS = 3

type LoadState =
  | { status: 'loading' }
  | { status: 'ready'; item: AppItem }
  | { status: 'error'; message: string }

/** 1:1 비교의 주요 격차를 골라 3개월 행동 변화 예시를 보여준다. */
export function CompareOneOnOneSimulationPage({ memberId, navigate }: { memberId: string; navigate: Navigate }) {
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

  const goBack = () => navigate(`/compare/members/${memberId}/versus`)

  return (
    <div className="screen screen-compare compare-flow-screen compare-report-screen">
      <StatusBar time="9:41" />
      <header className="compare-flow-header">
        <IconButton icon="back" label="뒤로" onClick={goBack} />
        <h1>3개월 시뮬레이션</h1>
        <span aria-hidden="true" />
      </header>

      {state.status === 'loading' ? (
        <EmptyState title="변화를 계산하는 중이에요" subtitle="3개월 뒤 예상 변화를 만들고 있어요." icon="search" />
      ) : null}
      {state.status === 'error' ? (
        <EmptyState title="계산하지 못했어요" subtitle={state.message} icon="search" />
      ) : null}

      {state.status === 'ready' ? (
        <SimulationBody item={state.item} navigate={navigate} />
      ) : null}
    </div>
  )
}

function SimulationBody({ item, navigate }: { item: AppItem; navigate: Navigate }) {
  const comparison = computeOneOnOneComparison(item)
  // 소득 격차는 저축 습관으로 바로 줄일 수 없으니, 그 다음으로 실천 가능한 항목을 시뮬레이션 대상으로 삼는다.
  const target = comparison.mainGap.type === 'income'
    ? comparison.gapItems.find((gapItem) => gapItem.type !== 'income') ?? comparison.mainGap
    : comparison.mainGap
  const afterValue = projectAfterValue(target)
  const beforeLabel = target.myLabel
  const afterLabel = formatGapValue(afterValue, target.unit)
  const additionalTotal = MONTHLY_ADDITIONAL_SAVING * PERIOD_MONTHS
  const monthlyAdditionalLabel = formatGapValue(MONTHLY_ADDITIONAL_SAVING, 'won')
  const additionalTotalLabel = formatGapValue(additionalTotal, 'won')

  return (
    <>
      <section className="compare-flow-body compare-report-body">
        <section className="compare-report-summary-panel">
          <strong>매달 {monthlyAdditionalLabel} 추가 저축 시나리오</strong>
          <p>{PERIOD_MONTHS}개월 동안 이어가면 {target.label}이 어떻게 바뀌는지 보여드려요.</p>
        </section>

        <section className="compare-report-metric-grid">
          <div className="compare-report-metric-card">
            <span>지금</span>
            <strong>{beforeLabel}</strong>
          </div>
          <div className="compare-report-metric-card">
            <span>{PERIOD_MONTHS}개월 후</span>
            <strong>{afterLabel}</strong>
          </div>
        </section>

        <p className="pd-insight">
          {PERIOD_MONTHS}개월 동안 매월 {monthlyAdditionalLabel}(총 {additionalTotalLabel})을 추가로 저축하면
          {' '}{target.label}이 {beforeLabel}에서 {afterLabel}로 올라가요.
        </p>

        <p className="compare-personal-disclaimer">
          이 시뮬레이션은 합성 데이터 기반 가정이며 금융상품 권유나 수익 보장이 아닙니다.
        </p>
      </section>

      <div className="compare-report-sticky-cta">
        <button className="app-button primary compare-flow-primary" type="button" onClick={() => navigate('/missions/add')}>
          오늘의 미션 만들기
        </button>
      </div>
    </>
  )
}

function projectAfterValue(gapItem: GapItem): number {
  const additional = MONTHLY_ADDITIONAL_SAVING * PERIOD_MONTHS
  if (gapItem.type === 'emergencyFund') {
    return Math.round((gapItem.myValue + additional / 780_000) * 10) / 10
  }
  if (gapItem.type === 'savings' || gapItem.type === 'assets') {
    return gapItem.myValue + additional
  }
  if (gapItem.type === 'investmentRatio') {
    return Math.min(100, gapItem.myValue + 3)
  }
  return gapItem.myValue
}
