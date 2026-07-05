import { useState } from 'react'
import type { Navigate } from './navigation'
import { BigNumber } from './components'
import { IconButton, StatusBar } from './uiPrimitives'
import { assetCategoryDetails, type AccountLineItem, type InvestmentTab, type StatRow } from './assetCategoryDetailData'
import { detailedProfile } from './detailedProfileData'
import './detailedProfile.css'

/**
 * 상세 프로필 '금융자산' 카드(입출금/예금/적금/투자/대출) → 계좌·상품 목록 화면.
 * navigation.ts의 profile-detail-asset 라우트에서만 진입하는 독립 화면.
 */
export function AssetCategoryDetailPage({ categoryId, navigate }: { categoryId: string; navigate: Navigate }) {
  const detail = assetCategoryDetails[categoryId] ?? assetCategoryDetails.checking
  const [activeTab, setActiveTab] = useState(detail.tabs?.[0]?.id ?? '')
  const activeTabData = detail.tabs?.find((tab) => tab.id === activeTab)

  return (
    <div className="screen screen-profile-detail-asset">
      <StatusBar time="9:41" />
      <header className="app-header">
        <div className="header-side">
          <IconButton icon="back" label="뒤로" onClick={() => navigate('/profile/detail')} />
        </div>
        <h1>{detailedProfile.header.nickname}</h1>
        <div className="header-side right" />
      </header>

      <section className="pd-detail-hero">
        <span className="pd-detail-eyebrow">{detail.eyebrow}</span>
        <BigNumber value={manwonValue(detail.total)} unit="만원" size="l" />
      </section>

      {detail.statRows ? <StatRows rows={detail.statRows} /> : null}

      {detail.tabs ? (
        <InvestmentTabs tabs={detail.tabs} activeTab={activeTab} activeTabData={activeTabData} onChange={setActiveTab} />
      ) : (
        <>
          {detail.sectionTitle ? <p className="pd-detail-section-title">{detail.sectionTitle}</p> : null}
          <AccountList items={detail.items ?? []} />
        </>
      )}
    </div>
  )
}

function manwonValue(value: number): number {
  return Math.round(value / 10_000)
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

function InvestmentTabs({
  tabs,
  activeTab,
  activeTabData,
  onChange,
}: {
  tabs: InvestmentTab[]
  activeTab: string
  activeTabData?: InvestmentTab
  onChange: (id: string) => void
}) {
  return (
    <>
      <div className="pd-detail-tabs" role="tablist" aria-label="투자 종류">
        {tabs.map((tab) => (
          <button
            className={tab.id === activeTab ? 'is-active' : ''}
            type="button"
            role="tab"
            aria-selected={tab.id === activeTab}
            onClick={() => onChange(tab.id)}
            key={tab.id}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {activeTabData?.groupLabel ? <p className="pd-detail-section-title">{activeTabData.groupLabel}</p> : null}
      {activeTabData?.items.length ? (
        <AccountList items={activeTabData.items} />
      ) : (
        <p className="pd-detail-empty">{activeTabData?.emptyLabel ?? '내역이 없어요'}</p>
      )}
    </>
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
