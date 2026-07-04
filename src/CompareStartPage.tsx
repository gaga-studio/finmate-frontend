import { useEffect, useState } from 'react'
import { api } from './api'
import { describeError } from './errors'
import { getSession } from './session'
import type { Navigate } from './navigation'
import type { AppItem, AppScreenResponse } from './types'
import { profileFactsFromItem } from './profileFacts'
import { EmptyState } from './AppComponents'
import { BottomNav, IconBadge, IconButton, StatusBar } from './uiPrimitives'

type LoadState =
  | { status: 'loading' }
  | { status: 'ready'; item: AppItem }
  | { status: 'error'; message: string }

/** 1:1 비교 1단계 — 비교 시작. 나 vs 상대를 보여주고 비교 시작 여부를 확인한다. */
export function CompareStartPage({ memberId, navigate }: { memberId: string; navigate: Navigate }) {
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

  return (
    <div className="screen screen-compare compare-flow-screen">
      <StatusBar time="9:41" />
      <header className="compare-flow-header">
        <IconButton icon="back" label="뒤로" onClick={() => navigate(`/compare/members/${memberId}`)} />
        <h1>1:1 비교</h1>
        <span aria-hidden="true" />
      </header>

      {state.status === 'loading' ? (
        <EmptyState title="불러오는 중이에요" subtitle="비교할 프로필을 준비하고 있어요." icon="search" />
      ) : null}
      {state.status === 'error' ? (
        <EmptyState title="불러오지 못했어요" subtitle={state.message} icon="search" />
      ) : null}

      {state.status === 'ready' ? (
        <StartBody item={state.item} memberId={memberId} navigate={navigate} />
      ) : null}
    </div>
  )
}

function StartBody({ item, memberId, navigate }: { item: AppItem; memberId: string; navigate: Navigate }) {
  const facts = profileFactsFromItem(item)
  const myName = getSession().user?.displayName ?? '나'

  return (
    <>
      <section className="compare-flow-body">
        <div className="onon-vs-lead">
          <h2>나와 비슷한 사람과<br />1:1 금융 생활을 비교해볼까요?</h2>
        </div>

        <div className="onon-vs-row">
          <div className="onon-vs-person">
            <IconBadge icon="profile" tone="teal" />
            <strong>나</strong>
            <span>{myName}</span>
          </div>
          <span className="onon-vs-badge">VS</span>
          <div className="onon-vs-person">
            <IconBadge icon="profile" tone="danger" />
            <strong>상대</strong>
            <span>{facts.moneyStyle ?? item.title}</span>
          </div>
        </div>

        <section className="compare-preview-feature-card">
          <h2>이런 사람을 비교해요</h2>
          <ul className="onon-check-list">
            <li>비슷한 나이대의 직장인</li>
            <li>월 소득 구간 유사</li>
            <li>소비 성향이 비슷한 사람</li>
          </ul>
        </section>

        <section className="onon-benefit-card">
          <p className="onon-benefit-title">💡 비교를 통해 얻을 수 있어요</p>
          <ul className="onon-check-list">
            <li>나의 강점과 약점 발견</li>
            <li>더 나은 금융 습관 인사이트</li>
            <li>맞춤형 개선 추천</li>
          </ul>
        </section>
      </section>

      <div className="compare-flow-bottom-cta">
        <button
          className="app-button primary compare-flow-primary"
          type="button"
          onClick={() => navigate(`/compare/members/${memberId}/categories`)}
        >
          비교 시작하기
        </button>
        <button className="app-button secondary" type="button" onClick={() => navigate('/compare/filter')}>
          다른 사람 선택하기
        </button>
      </div>
      <BottomNav active="compare" navigate={navigate} />
    </>
  )
}
