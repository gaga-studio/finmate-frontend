import type { Navigate } from './navigation'
import { AppSectionCard, SectionHeading } from './AppComponents'
import type { AppItem, AppScreenResponse } from './types'
import { IconButton, StatusBar } from './uiPrimitives'
import './detailedProfile.css'

export function AssetCategoryDetailPage({
  screen,
  backPath,
  navigate,
}: {
  screen: AppScreenResponse
  backPath: string
  navigate: Navigate
}) {
  const hero = screen.sections.find((section) => section.kind === 'profileAssetDetailHero')
  const list = screen.sections.find((section) => section.kind === 'profileAssetDetailList')
  const metric = hero?.metrics?.[0]

  return (
    <div className="screen screen-profile-detail-asset">
      <StatusBar time={screen.statusBarTime} />
      <header className="app-header">
        <div className="header-side">
          <IconButton icon="back" label="뒤로" onClick={() => navigate(backPath)} />
        </div>
        <h1>{screen.title}</h1>
        <div className="header-side right" />
      </header>

      <section className="pd-detail-hero">
        {hero?.subtitle ? <span className="pd-detail-eyebrow">{hero.subtitle}</span> : null}
        <strong className="pd-big-value">{metric?.value ?? '0원'}</strong>
        {metric?.caption ? <small>{metric.caption}</small> : null}
      </section>

      <AppSectionCard>
        <SectionHeading title={list?.title ?? '연결 상품'} subtitle={list?.subtitle} />
        <div className="pd-detail-list">
          {(list?.items ?? []).map((item) => (
            <AssetRow item={item} key={item.id} />
          ))}
        </div>
        {list?.data?.identifiersHidden ? (
          <p className="pd-insight">계좌번호, 카드번호, 거래번호는 저장되어도 화면에는 표시하지 않아요.</p>
        ) : null}
      </AppSectionCard>
    </div>
  )
}

function AssetRow({ item }: { item: AppItem }) {
  return (
    <div className="pd-detail-row">
      <span className="pd-detail-row-name">
        {item.title}
        {item.subtitle ? <small>{item.subtitle}</small> : null}
      </span>
      <span className="pd-detail-row-trailing">
        {item.value ? <b>{item.value}</b> : null}
        {item.caption ? <em className={item.tone === 'warning' ? 'down' : 'rate'}>{item.caption}</em> : null}
      </span>
    </div>
  )
}
