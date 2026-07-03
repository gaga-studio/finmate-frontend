/**
 * 시그니처 컴포넌트 4.4 — FOMO 카드.
 * 한 화면에 최대 1개만 사용한다(UI.md 2장 "대담함은 한 곳에만").
 */
export function FomoCard({
  message,
  ctaLabel,
  onCta,
}: {
  message: string
  ctaLabel: string
  onCta: () => void
}) {
  return (
    <div className="fm-fomo-card">
      <p>{message}</p>
      <button className="fm-fomo-cta" type="button" onClick={onCta}>
        {ctaLabel}
      </button>
    </div>
  )
}
