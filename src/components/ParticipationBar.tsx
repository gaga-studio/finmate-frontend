import { useInView } from './useInView'

const FOMO_THRESHOLD = 60

/**
 * 시그니처 컴포넌트 4.3 — 참여율 바, 핵심 FOMO 장치.
 * 60% 이상이면 레드 강조 + "너만 안 하고 있어?" 톤 라벨을 켤 수 있다.
 */
export function ParticipationBar({
  label,
  participants,
  total,
  fomoLabel,
  showAvatars = true,
}: {
  label: string
  participants: number
  total: number
  fomoLabel?: string | null
  showAvatars?: boolean
}) {
  const [ref, inView] = useInView<HTMLDivElement>()
  const pct = total > 0 ? Math.round((participants / total) * 100) : 0
  const isFomo = pct >= FOMO_THRESHOLD
  const avatarCount = Math.min(participants, 6)

  return (
    <div className={`fm-participation ${isFomo ? 'fm-participation-fomo' : ''}`} ref={ref}>
      <div className="fm-participation-head">
        <span>{label}</span>
        <strong className="num">{participants} / {total} <em>({pct}%)</em></strong>
      </div>
      <div className="fm-participation-track">
        <span className="fm-participation-fill" style={{ width: inView ? `${pct}%` : '0%' }} />
      </div>
      {showAvatars ? (
        <div className="fm-participation-avatars" aria-hidden="true">
          {Array.from({ length: avatarCount }, (_, index) => (
            <span className="fm-participation-avatar" key={index} />
          ))}
          {participants > avatarCount ? <span className="fm-participation-avatar-more">+{participants - avatarCount}</span> : null}
        </div>
      ) : null}
      {isFomo ? <p className="fm-participation-fomo-label">{fomoLabel ?? '너만 안 하고 있어?'}</p> : null}
    </div>
  )
}
