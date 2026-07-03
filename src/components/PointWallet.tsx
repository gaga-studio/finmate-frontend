/**
 * 시그니처 컴포넌트 4.6 — 포인트 배지/지갑.
 * 앱바 우측 상시 노출. "미션 완료 → 포인트 적립 → 리포트 열람" 경제 루프의 화폐.
 */
export function PointBadge({ balance }: { balance: number }) {
  return (
    <span className="fm-point-badge">
      <CoinIcon />
      <b className="num">{balance.toLocaleString('ko-KR')}</b>
    </span>
  )
}

export function PointWallet({ balance, onClick, justEarned }: { balance: number; onClick?: () => void; justEarned?: number | null }) {
  const content = (
    <>
      <CoinIcon />
      <span className="fm-wallet-copy">
        <small>포인트</small>
        <b className="num">{balance.toLocaleString('ko-KR')}P</b>
      </span>
      {justEarned ? <span className="fm-wallet-earned num">+{justEarned}</span> : null}
    </>
  )

  if (onClick) {
    return (
      <button className="fm-point-wallet" type="button" onClick={onClick}>
        {content}
      </button>
    )
  }

  return <div className="fm-point-wallet">{content}</div>
}

function CoinIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="var(--teal-50)" stroke="var(--teal-600)" strokeWidth="2" />
      <path d="M12 8v8M9.5 10.2c0-1.2 1.1-2 2.5-2s2.5.8 2.5 1.9c0 2.7-5 1.4-5 4.1 0 1.1 1.1 1.9 2.5 1.9s2.5-.8 2.5-2" stroke="var(--teal-600)" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}
