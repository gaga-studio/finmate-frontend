import { useEffect, useState } from 'react'
import { api } from './api'
import { describeError } from './errors'
import type { Navigate } from './navigation'
import type { AppCompareSearchRequest, AppItem, AppScreenResponse } from './types'
import { Chevron, IconBadge, IconButton, StatusBar } from './uiPrimitives'
import { ErrorScreen, LoadingScreen } from './screenRenderer'
import { BottomSheet, EmptyState, ScreenLead, SectionHeading } from './AppComponents'
import { ProfileCard } from './components'
import { profileFactsFromItem } from './profileFacts'

type FilterKey = 'jobCategory' | 'incomeBand' | 'ageBand' | 'moneyStyle' | 'area' | 'householdType' | 'assetRange'

type LoadState =
  | { status: 'loading' }
  | { status: 'ready'; screen: AppScreenResponse; filters: AppCompareSearchRequest; options: Record<string, string[]>; notice?: string; isStale?: boolean }
  | { status: 'error'; message: string }

const filterOrder: Array<{ key: FilterKey; label: string }> = [
  { key: 'jobCategory', label: '업종' },
  { key: 'incomeBand', label: '연소득' },
  { key: 'ageBand', label: '나이' },
  { key: 'moneyStyle', label: '성향' },
  { key: 'area', label: '생활권' },
  { key: 'householdType', label: '가구' },
  { key: 'assetRange', label: '자산' },
]

const fallbackFilters: AppCompareSearchRequest = {
  ageBand: '전체',
  incomeBand: '전체',
  jobCategory: '전체',
  moneyStyle: '전체',
  area: '전체',
  householdType: '전체',
  assetRange: '전체',
}

const MIN_RECOMMENDED_SAMPLE_SIZE = 5
const sensitiveFilterKeys: FilterKey[] = ['incomeBand', 'assetRange']

export function CompareFilterPage({ navigate, embedded = false }: { navigate: Navigate; embedded?: boolean }) {
  const [state, setState] = useState<LoadState>({ status: 'loading' })
  const [activeFilter, setActiveFilter] = useState<FilterKey | null>(null)
  const [searchingKey, setSearchingKey] = useState<FilterKey | null>(null)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    let active = true
    api.getAppCompareFilter()
      .then((screen) => {
        if (!active) {
          return
        }
        setState({
          status: 'ready',
          screen,
          filters: filtersFromMeta(screen),
          options: optionsFromMeta(screen),
        })
      })
      .catch((error: unknown) => {
        if (active) {
          setState({ status: 'error', message: describeError(error) })
        }
      })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!activeFilter) {
      return undefined
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveFilter(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeFilter])

  if (state.status === 'loading') {
    return embedded
      ? (
        <div className="compare-filter-embedded">
          <EmptyState title="필터를 불러오는 중이에요" subtitle="조건과 공개 프로필을 준비하고 있어요." icon="spark" />
        </div>
      )
      : <LoadingScreen />
  }
  if (state.status === 'error') {
    return embedded
      ? (
        <div className="compare-filter-embedded">
          <EmptyState title="필터를 불러오지 못했어요" subtitle={state.message} icon="search" />
        </div>
      )
      : <ErrorScreen message={state.message} navigate={navigate} />
  }

  const resultCount = numberFromMeta(state.screen.meta.resultCount)
  const profiles = state.screen.sections.find((section) => section.id === 'profiles')?.items ?? []
  const activeFilterConfig = activeFilter ? filterOrder.find((filter) => filter.key === activeFilter) : undefined
  const selectedFilters = filterOrder.filter((filter) => state.filters[filter.key] !== '전체')
  const hasSmallSample = resultCount > 0 && resultCount < MIN_RECOMMENDED_SAMPLE_SIZE
  const hasSensitiveNarrowing = selectedFilters.filter((filter) => sensitiveFilterKeys.includes(filter.key)).length >= 2
  const ctaDisabled = resultCount === 0 || creating || searchingKey !== null || state.isStale === true

  const selectFilterValue = async (key: FilterKey, value: string) => {
    const nextFilters = { ...state.filters, [key]: value }
    setActiveFilter(null)
    setSearchingKey(key)
    setState({ ...state, notice: undefined, isStale: false })
    try {
      const screen = await api.searchAppCompareFilter(nextFilters)
      setState({ status: 'ready', screen, filters: nextFilters, options: optionsFromMeta(screen), notice: undefined, isStale: false })
    } catch (error: unknown) {
      setState({
        ...state,
        notice: `${describeError(error)} 이전 성공 결과를 보여주고 있어요. 검색이 다시 성공할 때까지 비교 그룹 생성은 잠시 막았어요.`,
        isStale: true,
      })
    } finally {
      setSearchingKey(null)
    }
  }

  const createGroup = async () => {
    if (ctaDisabled) {
      return
    }
    setCreating(true)
    try {
      const result = await api.createAppCompareGroup(state.filters)
      if (result.status === 'CREATED') {
        navigate(result.nextPath)
        return
      }
      setState({ ...state, notice: result.message, isStale: false })
    } catch (error: unknown) {
      setState({ ...state, notice: describeError(error), isStale: false })
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className={embedded ? 'compare-filter-embedded' : 'screen screen-compare screen-compare-filter'}>
      {embedded ? null : (
        <>
          <StatusBar time={state.screen.statusBarTime} />
          <header className="app-header">
            <div className="header-side">
              <IconButton icon="back" label="뒤로" onClick={() => navigate('/compare')} />
            </div>
            <h1>필터링 조회</h1>
            <div className="header-side right">
              <IconButton icon="sliders" label="필터" />
            </div>
          </header>
        </>
      )}

      {embedded ? null : (
        <ScreenLead eyebrow="직접 비교" title="비교할 그룹을 정교하게 고르세요" subtitle="조건을 하나씩 조정하면 공개 금융 루틴이 비슷한 사람만 모아볼 수 있어요.">
          <div className="compare-filter-summary">
            <span>{selectedFilters.length === 0 ? '전체 조건' : `${selectedFilters.length}개 조건 적용`}</span>
            <strong>{resultCount}명</strong>
          </div>
        </ScreenLead>
      )}

      <section className="compare-filter-panel" aria-label="비교 필터">
        {embedded ? (
          <div className="compare-filter-summary">
            <span>{selectedFilters.length === 0 ? '전체 조건' : `${selectedFilters.length}개 조건 적용`}</span>
            <strong>{resultCount}명</strong>
          </div>
        ) : null}
        <SectionHeading eyebrow="필터" title="비교 조건" subtitle="필요한 기준만 골라서 결과를 좁혀요." />
        <div className="compare-filter-chips">
          {filterOrder.map((filter) => (
            <button
              className={activeFilter === filter.key ? 'is-open' : ''}
              type="button"
              aria-haspopup="dialog"
              aria-expanded={activeFilter === filter.key}
              aria-busy={searchingKey === filter.key}
              disabled={searchingKey !== null || creating}
              onClick={() => setActiveFilter(filter.key)}
              key={filter.key}
            >
              <span>{filter.label}</span>
              <strong>{searchingKey === filter.key ? '조회 중' : state.filters[filter.key]}</strong>
              <Chevron />
            </button>
          ))}
        </div>
        {hasSmallSample || hasSensitiveNarrowing ? (
          <div className="compare-safety-notices" aria-live="polite">
            {hasSmallSample ? <p>표본이 {resultCount}명이라 리포트는 참고용으로만 보여드려요. 조건을 하나 넓히면 더 안정적인 비교가 돼요.</p> : null}
            {hasSensitiveNarrowing ? <p>연소득과 자산을 동시에 좁히면 민감한 조합이 될 수 있어요. 필요하면 둘 중 하나를 전체로 완화해보세요.</p> : null}
          </div>
        ) : null}
      </section>

      <section className="compare-filter-results">
        <div className="compare-result-header">
          <SectionHeading eyebrow="검색 결과" title={`검색 결과 ${resultCount}명`} subtitle="선택한 조건에 맞는 공개 프로필이에요." />
          {selectedFilters.length > 0 ? (
            <div className="compare-active-filters" aria-label="선택된 필터">
              {selectedFilters.map((filter) => (
                <span key={filter.key}>{filter.label} {state.filters[filter.key]}</span>
              ))}
            </div>
          ) : null}
        </div>
        {profiles.length > 0 ? (
          <div className="compare-profile-list">
            {profiles.map((item) => (
              <CompareProfileCard item={item} key={item.id} />
            ))}
          </div>
        ) : (
          <EmptyState title="조건에 맞는 비교 친구가 없어요" subtitle="필터를 하나씩 넓히면 더 많은 금융 루틴을 볼 수 있어요." icon="search" />
        )}
      </section>

      {state.notice ? <p className="inline-notice" role="alert">{state.notice}</p> : null}
      <div className="compare-filter-action">
        {state.isStale ? <p>마지막 검색이 실패해 이전 결과를 표시 중이에요. 조건을 다시 선택해 최신 결과를 확인해주세요.</p> : null}
        <button className="app-button primary" type="button" disabled={ctaDisabled} onClick={() => { void createGroup() }}>
          {creating
            ? '비교 그룹 준비 중'
            : state.isStale
              ? '검색 성공 후 비교하기'
              : resultCount === 0
                ? '조건을 넓혀주세요'
                : `이 조건으로 비교하기 (${resultCount}명)`}
        </button>
      </div>

      {activeFilterConfig ? (
        <FilterBottomSheet
          filter={activeFilterConfig}
          currentValue={state.filters[activeFilterConfig.key]}
          values={filterOptionsFor(state.options, activeFilterConfig.key)}
          onClose={() => setActiveFilter(null)}
          onSelect={(value) => { void selectFilterValue(activeFilterConfig.key, value) }}
        />
      ) : null}
    </div>
  )
}

function FilterBottomSheet({
  filter,
  currentValue,
  values,
  onClose,
  onSelect,
}: {
  filter: { key: FilterKey; label: string }
  currentValue: string
  values: string[]
  onClose: () => void
  onSelect: (value: string) => void
}) {
  return (
    <BottomSheet title={`${filter.label} 선택`} onClose={onClose}>
      <div className="filter-sheet-options">
        {values.map((value) => {
          const selected = value === currentValue
          return (
            <button
              className={selected ? 'filter-sheet-option is-active' : 'filter-sheet-option'}
              type="button"
              aria-pressed={selected}
              onClick={() => onSelect(value)}
              key={value}
            >
              <span>{value}</span>
              {selected ? <IconBadge icon="check" tone="teal" /> : null}
            </button>
          )
        })}
      </div>
    </BottomSheet>
  )
}

function CompareProfileCard({ item }: { item: AppItem }) {
  return <ProfileCard scope="anonymous" facts={profileFactsFromItem(item)} />
}

function filtersFromMeta(screen: AppScreenResponse): AppCompareSearchRequest {
  const filters = screen.meta.filters
  if (!filters || typeof filters !== 'object') {
    return fallbackFilters
  }
  const map = filters as Record<string, unknown>
  return {
    ageBand: stringValue(map.ageBand),
    incomeBand: stringValue(map.incomeBand),
    jobCategory: stringValue(map.jobCategory),
    moneyStyle: stringValue(map.moneyStyle),
    area: stringValue(map.area),
    householdType: stringValue(map.householdType),
    assetRange: stringValue(map.assetRange),
  }
}

function optionsFromMeta(screen: AppScreenResponse): Record<string, string[]> {
  const raw = screen.meta.filterOptions
  if (!raw || typeof raw !== 'object') {
    return {}
  }
  return Object.fromEntries(
    Object.entries(raw as Record<string, unknown>).map(([key, value]) => [
      key,
      Array.isArray(value) ? value.map((item) => String(item)) : ['전체'],
    ]),
  )
}

function filterOptionsFor(options: Record<string, string[]>, key: FilterKey): string[] {
  const values = options[key] ?? []
  const uniqueValues = Array.from(new Set(['전체', ...values.filter((value) => value.length > 0)]))
  return uniqueValues.length > 0 ? uniqueValues : ['전체']
}

function stringValue(value: unknown): string {
  return typeof value === 'string' && value.length > 0 ? value : '전체'
}

function numberFromMeta(value: unknown): number {
  return typeof value === 'number' ? value : 0
}
