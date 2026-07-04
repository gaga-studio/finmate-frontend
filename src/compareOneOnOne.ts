import type { AppItem } from './types'

/**
 * finmate 레거시 P0 스펙(EXP-04 "1:1 비교")의 개념 — mainGap(가장 큰 격차) + similarityScore(유사도) +
 * gapItems(항목별 비교) — 을 그대로 가져와, "나" vs 필터 조회에서 선택한 특정 개인을 비교한다.
 * "나"의 기준값은 그룹 비교(나와의 비교) 플로우와 동일한 숫자를 써서 앱 전체에서 일관되게 보인다.
 */

export type GapMetricType = 'income' | 'savings' | 'spending' | 'assets' | 'investmentRatio' | 'emergencyFund'
export type GapUnit = 'won' | 'percent' | 'months'

export type GapItem = {
  type: GapMetricType
  label: string
  myValue: number
  peerValue: number
  unit: GapUnit
  myLabel: string
  peerLabel: string
  normalizedGap: number
}

export type OneOnOneComparison = {
  peerName: string
  similarityScore: number
  mainGap: GapItem
  gapItems: GapItem[]
}

export const MY_BASELINE = {
  monthlyIncome: 3_600_000,
  monthlySavings: 420_000,
  monthlySpending: 780_000,
  totalAssets: 11_800_000,
  investmentRatio: 18,
  emergencyFundMonths: 2.6,
}

export function formatGapValue(value: number, unit: GapUnit): string {
  if (unit === 'won') return `${Math.round(value).toLocaleString('ko-KR')}원`
  if (unit === 'percent') return `${Math.round(value)}%`
  return `${value.toFixed(1)}개월`
}

export function computeOneOnOneComparison(item: AppItem): OneOnOneComparison {
  const peer = {
    monthlyIncome: numberFromData(item.data, 'monthlyIncome', MY_BASELINE.monthlyIncome),
    monthlySavings: numberFromData(item.data, 'monthlySavings', MY_BASELINE.monthlySavings),
    monthlySpending: numberFromData(item.data, 'monthlySpending', MY_BASELINE.monthlySpending),
    totalAssets: numberFromData(item.data, 'totalAssets', MY_BASELINE.totalAssets),
    investmentRatio: numberFromData(item.data, 'investmentRatio', MY_BASELINE.investmentRatio),
    emergencyFundMonths: numberFromData(item.data, 'emergencyFundMonths', MY_BASELINE.emergencyFundMonths),
  }

  const gapItems: GapItem[] = [
    buildGapItem('income', '월 소득', MY_BASELINE.monthlyIncome, peer.monthlyIncome, 'won'),
    buildGapItem('savings', '월 평균 저축액', MY_BASELINE.monthlySavings, peer.monthlySavings, 'won'),
    buildGapItem('spending', '월 평균 소비액', MY_BASELINE.monthlySpending, peer.monthlySpending, 'won'),
    buildGapItem('assets', '총 자산', MY_BASELINE.totalAssets, peer.totalAssets, 'won'),
    buildGapItem('investmentRatio', '투자 비중', MY_BASELINE.investmentRatio, peer.investmentRatio, 'percent'),
    buildGapItem('emergencyFund', '비상금 개월 수', MY_BASELINE.emergencyFundMonths, peer.emergencyFundMonths, 'months'),
  ]

  const mainGap = gapItems.reduce((max, current) => (current.normalizedGap > max.normalizedGap ? current : max), gapItems[0])
  const averageGap = gapItems.reduce((sum, current) => sum + current.normalizedGap, 0) / gapItems.length
  const similarityScore = Math.round(Math.max(0, 1 - averageGap) * 100)

  return { peerName: item.title, similarityScore, mainGap, gapItems }
}

function buildGapItem(type: GapMetricType, label: string, myValue: number, peerValue: number, unit: GapUnit): GapItem {
  const denominator = Math.max(Math.abs(myValue), Math.abs(peerValue), 1)
  return {
    type,
    label,
    myValue,
    peerValue,
    unit,
    myLabel: formatGapValue(myValue, unit),
    peerLabel: formatGapValue(peerValue, unit),
    normalizedGap: Math.abs(myValue - peerValue) / denominator,
  }
}

function numberFromData(data: Record<string, unknown> | null | undefined, key: string, fallback: number): number {
  const value = data?.[key]
  return typeof value === 'number' ? value : fallback
}
