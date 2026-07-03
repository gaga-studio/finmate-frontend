import { useEffect, useRef, useState } from 'react'

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true
}

/**
 * 스크롤 인 시 1회 카운트업(300~600ms) 하는 숫자 애니메이션.
 * prefers-reduced-motion이면 즉시 최종값을 보여준다(UI.md 3.5 / 11장).
 */
export function useCountUp(target: number, durationMs = 480): number {
  const [value, setValue] = useState(() => (prefersReducedMotion() ? target : 0))
  const frame = useRef<number | null>(null)

  useEffect(() => {
    if (prefersReducedMotion()) {
      setValue(target)
      return
    }
    const start = performance.now()
    const from = 0
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / durationMs)
      const eased = 1 - (1 - progress) * (1 - progress)
      setValue(Math.round(from + (target - from) * eased))
      if (progress < 1) {
        frame.current = requestAnimationFrame(tick)
      }
    }
    frame.current = requestAnimationFrame(tick)
    return () => {
      if (frame.current !== null) {
        cancelAnimationFrame(frame.current)
      }
    }
  }, [target, durationMs])

  return value
}
