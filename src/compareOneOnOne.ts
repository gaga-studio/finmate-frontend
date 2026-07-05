import type { AppItem } from './types'

/** 필터 조회에서 선택한 익명 프로필과 내 기준값을 비교하기 위한 표시용 계산 helper. */

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
  if (unit === 'won') return manwon(value)
  if (unit === 'percent') return `${Math.round(value)}%`
  return `${value.toFixed(1)}개월`
}

export function computeOneOnOneComparison(item: AppItem): OneOnOneComparison {
  const peer = {
    monthlyIncome: moneyValueFromData(item.data, 'monthlyIncomeLabel', MY_BASELINE.monthlyIncome),
    monthlySavings: moneyValueFromData(item.data, 'monthlySavingsLabel', MY_BASELINE.monthlySavings),
    monthlySpending: moneyValueFromData(item.data, 'monthlySpendingLabel', MY_BASELINE.monthlySpending),
    totalAssets: moneyValueFromData(item.data, 'totalAssetsLabel', MY_BASELINE.totalAssets),
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

function moneyValueFromData(data: Record<string, unknown> | null | undefined, key: string, fallback: number): number {
  const label = data?.[key]
  if (typeof label === 'string') return parseMoneyLabel(label, fallback)
  const legacyNumeric = data?.[key.replace('Label', '')]
  return typeof legacyNumeric === 'number' ? legacyNumeric : fallback
}

function parseMoneyLabel(label: string, fallback: number): number {
  const match = label.match(/[\d,]+/)
  if (!match) return fallback
  const value = Number(match[0].replace(/,/g, ''))
  if (!Number.isFinite(value)) return fallback
  return label.includes('만원') ? value * 10_000 : value
}

function manwon(value: number): string {
  return `${Math.round(value / 10_000).toLocaleString('ko-KR')}만원`
}
