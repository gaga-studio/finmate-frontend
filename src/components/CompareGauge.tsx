import { useCountUp } from './useCountUp'
import { useInView } from './useInView'

/**
 * 시그니처 컴포넌트 4.1 — 비교 게이지, 앱의 얼굴.
 * "나=틸 / 비교 대상=레드" 매핑은 앱 전체에서 절대 고정.
 */
export function CompareGauge({
  category,
  meValue,
  otherValue,
  otherName = '그룹',
  unit = '원',
  interpretation,
}: {
  category: string
  meValue: number
  otherValue: number
  otherName?: string
  unit?: string
  interpretation?: string | null
}) {
  const [ref, inView] = useInView<HTMLDivElement>()
  const animatedMe = useCountUp(inView ? meValue : 0, 520)
  const max = Math.max(meValue, otherValue, 1)
  const mePct = Math.round((meValue / max) * 100)
  const otherPct = Math.round((otherValue / max) * 100)
  const diffPct = meValue === 0 ? 0 : Math.round(((meValue - otherValue) / Math.max(otherValue, 1)) * 100)
  const gapCaption = interpretation ?? (
    diffPct === 0
      ? `${otherName}과 비슷한 수준이에요`
      : diffPct > 0
        ? `${otherName}보다 ${Math.abs(diffPct)}% 높아요`
        : `${otherName}보다 ${Math.abs(diffPct)}% 낮아요`
  )

  return (
    <div className="fm-gauge" ref={ref}>
      <span className="fm-gauge-label">{category}</span>
      <span className="fm-gauge-value num">
        {animatedMe.toLocaleString('ko-KR')}
        <em>{unit}</em>
      </span>
      <div className="fm-gauge-track" role="img" aria-label={`나 ${meValue.toLocaleString('ko-KR')}${unit}, ${otherName} ${otherValue.toLocaleString('ko-KR')}${unit}`}>
        <span className="fm-gauge-fill fm-gauge-fill-me" style={{ width: inView ? `${mePct}%` : '0%' }} />
        <span className="fm-gauge-fill fm-gauge-fill-other" style={{ width: inView ? `${otherPct}%` : '0%' }} />
      </div>
      <div className="fm-gauge-legend">
        <span className="fm-gauge-legend-me"><i />나 {meValue.toLocaleString('ko-KR')}{unit}</span>
        <span className="fm-gauge-legend-other"><i />{otherName} {otherValue.toLocaleString('ko-KR')}{unit}</span>
      </div>
      <p className="fm-gauge-caption">{gapCaption}</p>
    </div>
  )
}
