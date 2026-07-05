import { useEffect, useState } from 'react'
import { api } from './api'
import { describeError } from './errors'
import type { Navigate } from './navigation'
import type { AppItem, AppScreenResponse, AppSection } from './types'
import { EmptyState } from './AppComponents'
import { BigNumber } from './components'
import { IconButton, StatusBar } from './uiPrimitives'
import './detailedProfile.css'

type AccountLineItem = {
  id: string
  name: string
  amountLabel: string
  rateLabel?: string | null
  deltaLabel?: string | null
  deltaTone?: 'up' | 'down' | null
}

type StatRow = {
  label: string
  value: string
  tone?: 'up' | 'down'
}

type AssetDetailModel = {
  ownerName: string
  categoryLabel: string
  eyebrow: string
  totalLabel: string
  totalValue: number
  statRows: StatRow[]
  sectionTitle: string
  items: AccountLineItem[]
  backPath: string
}

type LoadState =
  | { status: 'loading' }
  | { status: 'ready'; screen: AppScreenResponse }
  | { status: 'error'; message: string }

/**
 * 상세 프로필 '금융자산' 카드 → 계좌·상품 목록 화면.
 * 백엔드 AppScreenResponse를 그대로 변환하며 계좌번호/카드번호/거래번호는 렌더하지 않는다.
 */
export function AssetCategoryDetailPage({
  categoryId,
  targetUserId,
  navigate,
}: {
  categoryId: string
  targetUserId?: string
  navigate: Navigate
}) {
  const [state, setState] = useState<LoadState>({ status: 'loading' })

  useEffect(() => {
    let active = true
    setState({ status: 'loading' })
    api.getAppProfileAssetDetail(categoryId, targetUserId)
      .then((screen) => {
        if (active) setState({ status: 'ready', screen })
      })
      .catch((error: unknown) => {
        if (active) setState({ status: 'error', message: describeError(error) })
      })
    return () => {
      active = false
    }
  }, [categoryId, targetUserId])

  const model = state.status === 'ready' ? toAssetDetailModel(state.screen) : null

  return (
    <div className="screen screen-profile-detail-asset">
      <StatusBar time="9:41" />
      <header className="app-header">
        <div className="header-side">
          <IconButton icon="back" label="뒤로" onClick={() => navigate(model?.backPath ?? '/profile/detail')} />
        </div>
        <h1>{model?.ownerName ?? '자산 상세'}</h1>
        <div className="header-side right" />
      </header>

      {state.status === 'loading' ? (
        <EmptyState title="자산 상세를 불러오는 중이에요" subtitle="식별자는 숨기고 요약만 정리하고 있어요." icon="search" />
      ) : null}
      {state.status === 'error' ? (
        <EmptyState title="자산 상세를 불러오지 못했어요" subtitle={state.message} icon="search" />
      ) : null}
      {model ? <AssetDetailBody model={model} /> : null}
    </div>
  )
}

function AssetDetailBody({ model }: { model: AssetDetailModel }) {
  return (
    <>
      <section className="pd-detail-hero">
        <span className="pd-detail-eyebrow">{model.eyebrow}</span>
        <BigNumber value={model.totalValue} unit="만원" size="l" />
      </section>

      {model.statRows.length ? <StatRows rows={model.statRows} /> : null}
      {model.sectionTitle ? <p className="pd-detail-section-title">{model.sectionTitle}</p> : null}
      <AccountList items={model.items} />
    </>
  )
}

function StatRows({ rows }: { rows: StatRow[] }) {
  return (
    <div className="pd-detail-stat-rows">
      {rows.map((row) => (
        <div className="pd-detail-stat-row" key={row.label}>
          <span>{row.label}</span>
          <strong className={row.tone ?? ''}>{row.value}</strong>
        </div>
      ))}
    </div>
  )
}

function AccountList({ items }: { items: AccountLineItem[] }) {
  return (
    <div className="pd-detail-list">
      {items.map((item) => (
        <div className="pd-detail-row" key={item.id}>
          <span className="pd-detail-row-name">{item.name}</span>
          <span className="pd-detail-row-trailing">
            <b>{item.amountLabel}</b>
            {item.rateLabel ? <em className="rate">{item.rateLabel}</em> : null}
            {item.deltaLabel ? <em className={item.deltaTone ?? ''}>{item.deltaLabel}</em> : null}
          </span>
        </div>
      ))}
    </div>
  )
}

function toAssetDetailModel(screen: AppScreenResponse): AssetDetailModel {
  const hero = sectionByKind(screen, 'profileAssetDetailHero')
  const list = sectionByKind(screen, 'profileAssetDetailList')
  const metric = hero?.metrics?.[0]
  const targetUserId = typeof screen.meta.targetUserId === 'string' ? screen.meta.targetUserId : undefined
  const assetId = typeof screen.meta.assetId === 'string' ? screen.meta.assetId : undefined
  return {
    ownerName: ownerNameFromHero(hero),
    categoryLabel: hero?.title ?? screen.title,
    eyebrow: `${hero?.title ?? screen.title} ${list?.items?.length ?? 0}`,
    totalLabel: metric?.value ?? '0만원',
    totalValue: labelToManwon(metric?.value),
    statRows: [
      { label: '설명', value: metric?.caption ?? hero?.subtitle ?? '연결 상품 요약' },
      { label: '공개 정책', value: '식별자 숨김' },
    ],
    sectionTitle: list?.title ?? '연결 상품',
    items: (list?.items ?? []).map(toLineItem),
    backPath: targetUserId && assetId ? `/profile/detail/${targetUserId}` : '/profile/detail',
  }
}

function sectionByKind(screen: AppScreenResponse, kind: string): AppSection | undefined {
  return screen.sections.find((section) => section.kind === kind)
}

function ownerNameFromHero(hero: AppSection | undefined): string {
  if (!hero?.subtitle) return '자산 상세'
  return hero.subtitle.replace(/님의 .+$/, '')
}

function toLineItem(item: AppItem): AccountLineItem {
  return {
    id: item.id,
    name: item.title,
    amountLabel: item.value ?? '금액 미제공',
    rateLabel: item.caption?.includes('%') ? item.caption : null,
    deltaLabel: item.caption && !item.caption.includes('%') ? item.caption : null,
    deltaTone: item.tone === 'warning' ? 'down' : item.tone === 'green' ? 'up' : null,
  }
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
