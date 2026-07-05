import type { ProfileFinancialFacts, ProfileScope } from '../types'
import { IconBadge } from '../uiPrimitives'
import { anonymousAvatarGlyph, anonymousAvatarStyle } from '../anonymousAvatar'
import { visibleProfileFields } from './profileScopeGuard'

const scopeBadge: Record<ProfileScope, { label: string; tone: 'teal' | 'muted' | 'red' }> = {
  anonymous: { label: '익명 프로필', tone: 'muted' },
  'group-anon': { label: '내 그룹', tone: 'teal' },
  follow: { label: '실친', tone: 'muted' },
  'group-follow': { label: '팔로우 그룹', tone: 'red' },
}

export function ProfileCard({
  scope,
  facts,
  onClick,
}: {
  scope: ProfileScope
  facts: ProfileFinancialFacts
  onClick?: () => void
}) {
  const visible = visibleProfileFields(scope)
  const badge = scopeBadge[scope]
  const metaLine = [facts.ageBand, facts.jobCategory, facts.incomeBand].filter(Boolean).join(' · ')
  const avatarStyle = anonymousAvatarStyle(facts.anonymousAvatarSeed)

  const body = (
    <>
      <div className="pf-card-head">
        <span className="pf-card-avatar" style={avatarStyle} aria-hidden="true">
          {facts.anonymousAvatarSeed ? anonymousAvatarGlyph(facts.anonymousAvatarSeed) : <IconBadge icon="profile" tone={badge.tone} />}
        </span>
        <div className="pf-card-name">
          <strong>{facts.displayName}</strong>
          {metaLine ? <span>{metaLine}</span> : null}
        </div>
        <span className={`pf-scope-badge pf-scope-${badge.tone}`}>{badge.label}</span>
      </div>

      {/* 행동/상품 여부: 모든 scope 공통 공개 가능 항목 */}
      {visible.showBehaviorTags && facts.productActions?.length ? (
        <div className="pf-card-tags" aria-label="금융 행동/상품 태그">
          {facts.productActions.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      ) : null}

      {/* group-follow: 개인 금액 대신 비율/순위만 */}
      {visible.showRankOnly ? (
        <div className="pf-card-rank">
          {facts.rankLabel ? <span>{facts.rankLabel}</span> : null}
          {facts.participationRateLabel ? <strong>{facts.participationRateLabel}</strong> : null}
        </div>
      ) : null}

      {/* anonymous / group-anon 전용: 카테고리 단위 정확 금액 (가맹점 단위는 절대 금지) */}
      {visible.showExactAmounts && facts.categorySpending?.length ? (
        <div className="pf-card-amounts">
          {facts.categorySpending.map((row) => (
            <div className="pf-card-amount-row" key={row.category}>
              <span>{row.category}</span>
              <b className="num">{row.amountLabel}</b>
            </div>
          ))}
        </div>
      ) : null}

      {visible.showExactAmounts && (facts.netWorthLabel || facts.savingsLabel || facts.investmentLabel) ? (
        <div className="pf-card-summary">
          {facts.netWorthLabel ? <span><small>자산 총액</small><b className="num">{facts.netWorthLabel}</b></span> : null}
          {facts.savingsLabel ? <span><small>예적금</small><b className="num">{facts.savingsLabel}</b></span> : null}
          {facts.investmentLabel ? <span><small>투자</small><b className="num">{facts.investmentLabel}</b></span> : null}
        </div>
      ) : null}

      {/* 현금흐름 시점: anonymous / group-anon 전용 */}
      {visible.showCashflowTiming && facts.cashflowPattern ? (
        <p className="pf-card-cashflow">{facts.cashflowPattern}</p>
      ) : null}
    </>
  )

  if (onClick) {
    return (
      <button className="pf-card" type="button" data-scope={scope} onClick={onClick}>
        {body}
      </button>
    )
  }

  return (
    <article className="pf-card" data-scope={scope}>
      {body}
    </article>
  )
}
