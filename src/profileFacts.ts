import type { AppItem, ProfileFinancialFacts } from './types'

/**
 * 필터링 조회 / 그룹 구성원 리스트에서 나오는 개인은 UI.md 6장의
 * `anonymous`(모르는 익명 개인) scope다 — 카테고리 단위 정확 금액과
 * 현금흐름 패턴까지 공개 가능하다.
 */
export function profileFactsFromItem(item: AppItem): ProfileFinancialFacts {
  return {
    displayName: item.title,
    ageBand: dataText(item, 'ageBand'),
    jobCategory: dataText(item, 'jobCategory'),
    incomeBand: dataText(item, 'incomeBand'),
    area: dataText(item, 'area'),
    moneyStyle: dataText(item, 'moneyStyle'),
    categorySpending: Array.isArray(item.data?.categorySpending)
      ? (item.data?.categorySpending as ProfileFinancialFacts['categorySpending'])
      : null,
    cashflowPattern: dataText(item, 'cashflowPattern'),
    savingsLabel: dataText(item, 'savingsLabel'),
    productActions: Array.isArray(item.data?.productActions) ? (item.data?.productActions as string[]) : null,
  }
}

function dataText(item: AppItem, key: string): string | null {
  const value = item.data?.[key]
  return typeof value === 'string' && value.length > 0 ? value : null
}
