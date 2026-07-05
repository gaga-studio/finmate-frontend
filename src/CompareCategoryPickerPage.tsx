import { useEffect, useState } from 'react'
import { api } from './api'
import { describeError } from './errors'
import type { Navigate } from './navigation'
import type { AppItem, AppScreenResponse } from './types'
import { CATEGORY_LIST } from './compareCategory'
import { EmptyState } from './AppComponents'
import { Chevron, IconBadge, IconButton, StatusBar } from './uiPrimitives'

type LoadState =
  | { status: 'loading' }
  | { status: 'ready'; item: AppItem }
  | { status: 'error'; message: string }

const CHIPS = ['전체', '소비(카드)', '주식', '보험', '상품']

/** 1:1 비교 2단계 — 비교하고 싶은 금융 카테고리를 고른다. */
export function CompareCategoryPickerPage({ memberId, navigate }: { memberId: string; navigate: Navigate }) {
  const [state, setState] = useState<LoadState>({ status: 'loading' })
  const [activeChip, setActiveChip] = useState('전체')

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

  const visibleCategories = activeChip === '전체'
    ? CATEGORY_LIST
    : CATEGORY_LIST.filter((category) => category.chip === activeChip)

  return (
    <div className="screen screen-compare compare-flow-screen">
      <StatusBar time="9:41" />
      <header className="compare-flow-header">
        <IconButton icon="back" label="뒤로" onClick={() => navigate(`/compare/members/${memberId}/start`)} />
        <h1>카테고리 선택</h1>
        <span aria-hidden="true" />
      </header>

      {state.status === 'loading' ? (
        <EmptyState title="불러오는 중이에요" subtitle="비교 카테고리를 준비하고 있어요." icon="search" />
      ) : null}
      {state.status === 'error' ? (
        <EmptyState title="불러오지 못했어요" subtitle={state.message} icon="search" />
      ) : null}

      {state.status === 'ready' ? (
        <>
          <section className="compare-flow-body">
            <div className="onon-vs-lead">
              <h2>어떤 항목을 비교하고 싶나요?</h2>
            </div>

            <div className="compare-filter-chips" role="tablist" aria-label="카테고리 그룹">
              {CHIPS.map((chip) => (
                <button
                  className={chip === activeChip ? 'is-open' : ''}
                  type="button"
                  role="tab"
                  aria-selected={chip === activeChip}
                  onClick={() => setActiveChip(chip)}
                  key={chip}
                >
                  <span>{chip}</span>
                </button>
              ))}
            </div>

            <div className="onon-category-list">
              {visibleCategories.map((category) => (
                <button
                  className="onon-category-row"
                  type="button"
                  onClick={() => navigate(`/compare/members/${memberId}/categories/${category.id}`)}
                  key={category.id}
                >
                  <IconBadge icon={category.icon} tone="teal" />
                  <span className="onon-category-copy">
                    <strong>{category.label}</strong>
                    <small>{category.description}</small>
                  </span>
                  <Chevron />
                </button>
              ))}
            </div>

            <p className="onon-category-hint">
              모든 카테고리를 비교하고 싶다면?<br />전체 비교를 선택해보세요!
            </p>
          </section>

          <div className="compare-flow-bottom-cta">
            <button
              className="app-button primary compare-flow-primary"
              type="button"
              onClick={() => navigate(`/compare/members/${memberId}/versus`)}
            >
              전체 비교하기
            </button>
          </div>
        </>
      ) : null}
    </div>
  )
}
