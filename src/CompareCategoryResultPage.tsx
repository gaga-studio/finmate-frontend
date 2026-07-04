import { useEffect, useState } from 'react'
import { api } from './api'
import { describeError } from './errors'
import type { Navigate } from './navigation'
import type { AppItem, AppScreenResponse } from './types'
import { buildCategoryComparison, CATEGORY_LIST, type CategoryComparison, type OneOnOneCategoryId } from './compareCategory'
import { EmptyState } from './AppComponents'
import { BottomNav, IconBadge, IconButton, StatusBar } from './uiPrimitives'
import './detailedProfile.css'

type LoadState =
  | { status: 'loading' }
  | { status: 'ready'; item: AppItem }
  | { status: 'error'; message: string }

type ResultTab = 'summary' | 'detail' | 'insight'

const DONUT_COLORS = ['var(--teal)', 'var(--teal-200)', 'var(--teal-100)', 'var(--ink-300)']

/** 1:1 비교 3단계 — 고른 카테고리의 비교 결과. 요약/상세 비교/인사이트 탭으로 나뉜다. */
export function CompareCategoryResultPage({
  memberId,
  categoryId,
  navigate,
}: {
  memberId: string
  categoryId: OneOnOneCategoryId
  navigate: Navigate
}) {
  const [state, setState] = useState<LoadState>({ status: 'loading' })
  const [tab, setTab] = useState<ResultTab>('summary')

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

  const categoryLabel = CATEGORY_LIST.find((category) => category.id === categoryId)?.label ?? '비교'

  return (
    <div className="screen screen-compare compare-flow-screen compare-report-screen">
      <StatusBar time="9:41" />
      <header className="compare-flow-header">
        <IconButton icon="back" label="뒤로" onClick={() => navigate(`/compare/members/${memberId}/categories`)} />
        <h1>{categoryLabel} 비교 결과</h1>
        <span aria-hidden="true" />
      </header>

      <div className="onon-result-tabs" role="tablist" aria-label="비교 결과 탭">
        {(['summary', 'detail', 'insight'] as ResultTab[]).map((tabKey) => (
          <button
            className={tab === tabKey ? 'is-active' : ''}
            type="button"
            role="tab"
            aria-selected={tab === tabKey}
            onClick={() => setTab(tabKey)}
            key={tabKey}
          >
            {tabKey === 'summary' ? '요약' : tabKey === 'detail' ? '상세 비교' : '인사이트'}
          </button>
        ))}
      </div>

      {state.status === 'loading' ? (
        <EmptyState title="비교하는 중이에요" subtitle="두 사람의 데이터를 견주고 있어요." icon="search" />
      ) : null}
      {state.status === 'error' ? (
        <EmptyState title="불러오지 못했어요" subtitle={state.message} icon="search" />
      ) : null}

      {state.status === 'ready' ? (
        <ResultBody item={state.item} categoryId={categoryId} tab={tab} memberId={memberId} navigate={navigate} />
      ) : null}
    </div>
  )
}

function ResultBody({
  item,
  categoryId,
  tab,
  memberId,
  navigate,
}: {
  item: AppItem
  categoryId: OneOnOneCategoryId
  tab: ResultTab
  memberId: string
  navigate: Navigate
}) {
  const comparison = buildCategoryComparison(categoryId, item)

  return (
    <>
      <section className="compare-flow-body compare-report-body">
        {tab === 'summary' ? <SummaryTab comparison={comparison} peerName={item.title} /> : null}
        {tab === 'detail' ? <DetailTab comparison={comparison} peerName={item.title} /> : null}
        {tab === 'insight' ? <InsightTab comparison={comparison} /> : null}
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
      <BottomNav active="compare" navigate={navigate} />
    </>
  )
}

function SummaryTab({ comparison, peerName }: { comparison: CategoryComparison; peerName: string }) {
  return (
    <>
      <div className="onon-headline-banner">
        <p>{comparison.headline}</p>
      </div>

      <div className="onon-vs-row compact">
        <div className="onon-vs-person">
          <IconBadge icon="profile" tone="teal" />
          <strong>나</strong>
        </div>
        <div className="onon-vs-person">
          <IconBadge icon="profile" tone="danger" />
          <strong>{peerName}</strong>
        </div>
      </div>

      <div className="onon-stat-grid">
        {comparison.stats.map((stat) => (
          <div className="onon-stat-card" key={stat.label}>
            <span>{stat.label}</span>
            <div className="onon-stat-values">
              <b>{stat.myLabel}</b>
              <b className="peer">{stat.peerLabel}</b>
            </div>
            <em className={stat.diffTone}>{stat.diffLabel}</em>
          </div>
        ))}
      </div>

      <section className="compare-report-section">
        <h2>{comparison.breakdownTitle}</h2>
        <div className="onon-dual-donut-row">
          <DonutMini title="나" items={comparison.breakdown.map((entry) => ({ label: entry.label, percent: entry.myPercent }))} />
          <DonutMini title={peerName} items={comparison.breakdown.map((entry) => ({ label: entry.label, percent: entry.peerPercent }))} />
        </div>
        <div className="onon-breakdown-legend">
          {comparison.breakdown.map((entry, index) => (
            <div className="onon-breakdown-legend-row" key={entry.label}>
              <span className="onon-breakdown-dot" style={{ background: DONUT_COLORS[index % DONUT_COLORS.length] }} />
              <span>{entry.label}</span>
              <b>나 {entry.myPercent}%</b>
              <b className="peer">상대 {entry.peerPercent}%</b>
            </div>
          ))}
        </div>
      </section>

      <section className="compare-report-section">
        <h2>{comparison.categoryLabel} 패턴 한눈에 보기</h2>
        <p className="pd-insight">{comparison.patternNote}</p>
      </section>
    </>
  )
}

function DetailTab({ comparison, peerName }: { comparison: CategoryComparison; peerName: string }) {
  return (
    <section className="compare-personal-table">
      <h3>{comparison.categoryLabel} 상세 비교</h3>
      <div className="compare-personal-table-head" aria-hidden="true">
        <span />
        <b>나</b>
        <b>{peerName}</b>
      </div>
      {comparison.stats.map((stat) => (
        <div className="compare-personal-row" key={stat.label}>
          <span>{stat.label}</span>
          <strong>{stat.myLabel}</strong>
          <strong>{stat.peerLabel}</strong>
        </div>
      ))}
      {comparison.breakdown.map((entry) => (
        <div className="compare-personal-row" key={entry.label}>
          <span>{entry.label} 비중</span>
          <strong>{entry.myPercent}%</strong>
          <strong>{entry.peerPercent}%</strong>
        </div>
      ))}
    </section>
  )
}

function InsightTab({ comparison }: { comparison: CategoryComparison }) {
  return (
    <div className="compare-personal-insight-list">
      {comparison.insights.map((text) => (
        <article className="compare-personal-insight-card" key={text}>
          <IconBadge icon="spark" tone="teal" />
          <div>
            <p>{text}</p>
          </div>
        </article>
      ))}
    </div>
  )
}

function DonutMini({ title, items }: { title: string; items: Array<{ label: string; percent: number }> }) {
  let cursor = 0
  const stops = items.map((entry, index) => {
    const start = cursor
    cursor += entry.percent
    return `${DONUT_COLORS[index % DONUT_COLORS.length]} ${start}% ${cursor}%`
  })

  return (
    <div className="onon-donut-mini">
      <div className="onon-donut-circle" style={{ background: `conic-gradient(${stops.join(', ')})` }} role="img" aria-label={`${title} 비중`}>
        <span />
      </div>
      <strong>{title}</strong>
    </div>
  )
}
