import type { AppItem, ProfileFinancialFacts } from './types'

/**
 * 필터링 조회 / 그룹 구성원 리스트에서 나오는 개인은 anonymous scope다.
 * 이름은 익명 닉네임, 금액은 가까운 만원 단위 display label만 사용한다.
 */
export function profileFactsFromItem(item: AppItem): ProfileFinancialFacts {
  return {
    displayName: item.title,
    anonymousAvatarSeed: dataText(item, 'anonymousAvatarSeed'),
    ageBand: dataText(item, 'ageBand'),
    jobCategory: dataText(item, 'jobCategory'),
    incomeBand: dataText(item, 'incomeBand'),
    area: dataText(item, 'area'),
    moneyStyle: dataText(item, 'moneyStyle'),
    monthlyIncomeLabel: dataText(item, 'monthlyIncomeLabel'),
    monthlySavingsLabel: dataText(item, 'monthlySavingsLabel'),
    monthlySpendingLabel: dataText(item, 'monthlySpendingLabel'),
    totalAssetsLabel: dataText(item, 'totalAssetsLabel'),
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
