import { useCountUp } from './useCountUp'

export type BigNumberDelta = {
  label: string
  tone: 'good' | 'bad'
}

/**
 * 시그니처 컴포넌트 4.2 — 오버사이즈 숫자 블록.
 * Paperlogy Display, tabular-nums. 단위는 숫자보다 작게(0.4배) 붙인다.
 */
export function BigNumber({
  value,
  unit,
  size = 'xl',
  delta,
  caption,
}: {
  value: number
  unit?: string
  size?: 'xl' | 'l'
  delta?: BigNumberDelta | null
  caption?: string | null
}) {
  const animated = useCountUp(value)

  return (
    <div className={`fm-bignumber fm-bignumber-${size}`}>
      {delta ? (
        <span className={`fm-bignumber-delta fm-bignumber-delta-${delta.tone}`}>{delta.label}</span>
      ) : null}
      <span className="fm-bignumber-value num">
        {animated.toLocaleString('ko-KR')}
        {unit ? <em>{unit}</em> : null}
      </span>
      {caption ? <small className="fm-bignumber-caption">{caption}</small> : null}
    </div>
  )
}
