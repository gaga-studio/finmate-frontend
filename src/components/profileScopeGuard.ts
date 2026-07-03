import type { ProfileScope } from '../types'

export type VisibleProfileFields = {
  showExactAmounts: boolean
  showCashflowTiming: boolean
  showRankOnly: boolean
  showBehaviorTags: boolean
}

/**
 * UI.md 6장 표를 그대로 코드로 강제하는 순수 함수.
 * scope별로 "무엇을 렌더해도 되는지"만 결정한다 — 실제 마스킹은 ProfileCard가
 * 이 결과를 보고 해당 JSX 블록 자체를 만들지 않는 방식으로 수행한다(문자열로도 노출 금지).
 */
export function visibleProfileFields(scope: ProfileScope): VisibleProfileFields {
  switch (scope) {
    case 'anonymous':
    case 'group-anon':
      return { showExactAmounts: true, showCashflowTiming: true, showRankOnly: false, showBehaviorTags: true }
    case 'group-follow':
      return { showExactAmounts: false, showCashflowTiming: false, showRankOnly: true, showBehaviorTags: true }
    case 'follow':
      return { showExactAmounts: false, showCashflowTiming: false, showRankOnly: false, showBehaviorTags: true }
  }
}
