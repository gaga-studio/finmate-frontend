import { useEffect, useState } from 'react'
import { api } from './api'
import { describeError } from './errors'
import type { Navigate } from './navigation'
import type { AppItem, AppScreenResponse } from './types'
import { computeOneOnOneComparison } from './compareOneOnOne'
import { EmptyState } from './AppComponents'
import { IconButton, StatusBar } from './uiPrimitives'

type LoadState =
  | { status: 'loading' }
  | { status: 'ready'; item: AppItem }
  | { status: 'error'; message: string }

/** 필터 조회에서 고른 익명 프로필과 내 공개 기준값을 1:1로 비교한다. */
export function CompareOneOnOnePage({ memberId, navigate }: { memberId: string; navigate: Navigate }) {
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

  const goBack = () => navigate(`/compare/members/${memberId}`)

  return (
    <div className="screen screen-compare compare-flow-screen compare-report-screen">
      <StatusBar time="9:41" />
      <header className="compare-flow-header">
        <IconButton icon="back" label="뒤로" onClick={goBack} />
        <h1>1:1 비교</h1>
        <span aria-hidden="true" />
      </header>

      {state.status === 'loading' ? (
        <EmptyState title="비교하는 중이에요" subtitle="내 데이터와 이 프로필을 비교하고 있어요." icon="search" />
      ) : null}
      {state.status === 'error' ? (
        <EmptyState title="비교하지 못했어요" subtitle={state.message} icon="search" />
      ) : null}

      {state.status === 'ready' ? (
        <OneOnOneBody item={state.item} memberId={memberId} navigate={navigate} />
      ) : null}
    </div>
  )
}

function OneOnOneBody({ item, memberId, navigate }: { item: AppItem; memberId: string; navigate: Navigate }) {
  const comparison = computeOneOnOneComparison(item)

  return (
    <>
      <section className="compare-flow-body compare-report-body">
        <section className="compare-report-summary-panel">
          <strong>{comparison.peerName}님과 나 · 유사도 {comparison.similarityScore}%</strong>
          <p>공개된 지표를 기준으로 항목별로 얼마나 다른지 비교해봤어요.</p>
        </section>

        <section className="one-on-one-gap-panel">
          <h2>가장 큰 차이 · {comparison.mainGap.label}</h2>
          <div className="one-on-one-gap-row">
            <span>나</span>
            <strong>{comparison.mainGap.myLabel}</strong>
          </div>
          <div className="one-on-one-gap-row">
            <span>{comparison.peerName}</span>
            <strong>{comparison.mainGap.peerLabel}</strong>
          </div>
        </section>

        <section className="compare-personal-table">
          <h3>전체 지표 비교</h3>
          <div className="compare-personal-table-head" aria-hidden="true">
            <span />
            <b>나</b>
            <b>{comparison.peerName}</b>
          </div>
          {comparison.gapItems.map((gapItem) => (
            <div className="compare-personal-row" key={gapItem.type}>
              <span>{gapItem.label}</span>
              <strong>{gapItem.myLabel}</strong>
              <strong>{gapItem.peerLabel}</strong>
            </div>
          ))}
        </section>

        <p className="compare-personal-note">
          공개 동의된 익명 데이터 기준 비교이며, 실제 계좌·거래 내역과는 다를 수 있어요.
        </p>
      </section>

      <div className="compare-report-sticky-cta">
        <button
          className="app-button primary compare-flow-primary"
          type="button"
          onClick={() => navigate(`/compare/members/${memberId}/simulation`)}
        >
          3개월 시뮬레이션 보기
        </button>
      </div>
    </>
  )
}
