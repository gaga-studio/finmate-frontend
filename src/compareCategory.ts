import type { AppItem } from './types'
import { MY_BASELINE } from './compareOneOnOne'

/**
 * 1:1 비교 — "카테고리 선택 → 카테고리별 결과" 흐름의 데이터.
 * compareOneOnOne.ts의 전체 6개 지표 비교("전체 비교하기")와 별개로,
 * 카테고리 하나(소비/주식/보험/상품/대출/자산)만 골라 깊게 비교할 때 쓴다.
 */

export type OneOnOneCategoryId = 'spending' | 'stock' | 'insurance' | 'products' | 'loan' | 'assets'

export type CategoryMeta = {
  id: OneOnOneCategoryId
  label: string
  description: string
  chip: string | null
  icon: string
}

export const CATEGORY_LIST: CategoryMeta[] = [
  { id: 'spending', label: '소비(카드)', description: '지출 패턴, 소비 비중, 절약 추천', chip: '소비(카드)', icon: 'spend' },
  { id: 'stock', label: '주식 투자', description: '투자 성향, 보유 종목, 수익률', chip: '주식', icon: 'stocks' },
  { id: 'insurance', label: '보험', description: '보장 현황, 보험료, 보장 수준', chip: '보험', icon: 'saving' },
  { id: 'products', label: '금융 상품 (예·적금/펀드/ISA)', description: '보유 상품, 금리, 수익률', chip: '상품', icon: 'fund' },
  { id: 'loan', label: '대출/부채', description: '대출 한도, 상환 비율', chip: null, icon: 'debt' },
  { id: 'assets', label: '자산 전체', description: '자산 구성, 순자산, 미래 자산 예측', chip: null, icon: 'chart' },
]

export type CategoryStat = { label: string; myLabel: string; peerLabel: string; diffLabel: string; diffTone: 'up' | 'down' | 'flat' }
export type CategoryBreakdownItem = { label: string; myPercent: number; peerPercent: number }

export type CategoryComparison = {
  categoryLabel: string
  headline: string
  stats: CategoryStat[]
  breakdownTitle: string
  breakdown: CategoryBreakdownItem[]
  patternNote: string
  insights: string[]
}

export function buildCategoryComparison(categoryId: OneOnOneCategoryId, item: AppItem): CategoryComparison {
  const idx = memberIndex(item)
  switch (categoryId) {
    case 'spending':
      return buildSpendingComparison(item, idx)
    case 'stock':
      return buildStockComparison(item, idx)
    case 'insurance':
      return buildInsuranceComparison(idx)
    case 'products':
      return buildProductsComparison(item, idx)
    case 'loan':
      return buildLoanComparison(idx)
    case 'assets':
      return buildAssetsComparison(item, idx)
  }
}

function memberIndex(item: AppItem): number {
  const match = item.id.match(/(\d+)$/)
  return match ? Number(match[0]) : 0
}

function numberFromData(item: AppItem, key: string, fallback: number): number {
  const value = item.data?.[key]
  return typeof value === 'number' ? value : fallback
}

function moneyFromData(item: AppItem, key: string, fallback: number): number {
  const label = item.data?.[`${key}Label`]
  if (typeof label === 'string') {
    const match = label.match(/[\d,]+/)
    if (match) {
      const value = Number(match[0].replace(/,/g, ''))
      if (Number.isFinite(value)) return label.includes('만원') ? value * 10_000 : value
    }
  }
  return numberFromData(item, key, fallback)
}

function won(value: number): string {
  return `${Math.round(value / 10_000).toLocaleString('ko-KR')}만원`
}

function percent(value: number): string {
  return `${Math.round(value)}%`
}

function diffOf(myValue: number, peerValue: number, unit: 'won' | 'percent'): { diffLabel: string; diffTone: 'up' | 'down' | 'flat' } {
  const delta = peerValue - myValue
  if (Math.abs(delta) < (unit === 'won' ? 1000 : 1)) {
    return { diffLabel: '거의 같아요', diffTone: 'flat' }
  }
  const formatted = unit === 'won' ? won(Math.abs(delta)) : percent(Math.abs(delta))
  if (unit === 'won') {
    return delta > 0
      ? { diffLabel: `상대가 약 ${formatted} 높아요`, diffTone: 'up' }
      : { diffLabel: `내가 약 ${formatted} 높아요`, diffTone: 'down' }
  }
  return delta > 0 ? { diffLabel: `+${formatted}`, diffTone: 'up' } : { diffLabel: `-${formatted}`, diffTone: 'down' }
}

function biggestGapLabel(breakdown: CategoryBreakdownItem[]): string {
  return breakdown.reduce((max, current) => (
    Math.abs(current.myPercent - current.peerPercent) > Math.abs(max.myPercent - max.peerPercent) ? current : max
  ), breakdown[0]).label
}

function normalize(weights: number[]): number[] {
  const total = weights.reduce((sum, weight) => sum + weight, 0)
  return weights.map((weight) => Math.round((weight / total) * 100))
}

function buildSpendingComparison(item: AppItem, idx: number): CategoryComparison {
  const myMonthlySpending = MY_BASELINE.monthlySpending
  const myMonthlySavings = MY_BASELINE.monthlySavings
  const peerMonthlySpending = moneyFromData(item, 'monthlySpending', myMonthlySpending)
  const peerMonthlySavings = moneyFromData(item, 'monthlySavings', myMonthlySavings)

  const myShares = [35, 20, 15, 30]
  const peerShares = normalize([29 + (idx % 3) * 2, 20 + (idx % 2) * 3, 15 + (idx % 4) * 4, 22 + (idx % 3)])
  const labels = ['식비', '교통', '쇼핑', '기타']
  const breakdown = labels.map((label, index) => ({ label, myPercent: myShares[index], peerPercent: peerShares[index] }))

  return {
    categoryLabel: '소비(카드)',
    headline: `소비 습관이 비슷하지만, ${biggestGapLabel(breakdown)}에서 차이가 있어요!`,
    stats: [
      {
        label: '월 평균 소비',
        myLabel: won(myMonthlySpending),
        peerLabel: won(peerMonthlySpending),
        ...diffOf(myMonthlySpending, peerMonthlySpending, 'won'),
      },
      {
        label: '저축 가능 금액',
        myLabel: won(myMonthlySavings),
        peerLabel: won(peerMonthlySavings),
        ...diffOf(myMonthlySavings, peerMonthlySavings, 'won'),
      },
    ],
    breakdownTitle: '소비 비중 TOP 4',
    breakdown,
    patternNote: item.data?.cashflowPattern as string ?? '월급날 이후 3일간 소비가 집중돼요',
    insights: [
      '식비 비중이 비슷해 서로의 절약 팁이 잘 맞을 확률이 높아요.',
      '쇼핑 비중 차이가 커서, 계획 소비 습관을 참고하면 도움이 될 거예요.',
    ],
  }
}

function buildStockComparison(item: AppItem, idx: number): CategoryComparison {
  const myHolding = 2_400_000
  const myReturnRate = 6.4
  const peerHolding = item.data?.stockSignal ? 1_600_000 + idx * 210_000 : 400_000 + idx * 60_000
  const peerReturnRate = 2 + (idx % 6)

  const myShares = [45, 30, 20, 5]
  const peerShares = normalize([30 + (idx % 4) * 5, 35 + (idx % 3) * 4, 20 + (idx % 2) * 3, 10])
  const labels = ['국내 주식', '해외 주식', 'ETF', '현금성']
  const breakdown = labels.map((label, index) => ({ label, myPercent: myShares[index], peerPercent: peerShares[index] }))

  return {
    categoryLabel: '주식 투자',
    headline: `투자 스타일은 다르지만, ${biggestGapLabel(breakdown)} 비중에서 가장 차이가 나요!`,
    stats: [
      { label: '보유 평가금액', myLabel: won(myHolding), peerLabel: won(peerHolding), ...diffOf(myHolding, peerHolding, 'won') },
      { label: '연 수익률', myLabel: percent(myReturnRate), peerLabel: percent(peerReturnRate), ...diffOf(myReturnRate, peerReturnRate, 'percent') },
    ],
    breakdownTitle: '보유 종목 비중',
    breakdown,
    patternNote: '장 마감 직전에 매수·매도가 몰려요',
    insights: [
      '해외 주식 비중 차이가 커서, 환율 노출 정도를 한 번 점검해볼 만해요.',
      'ETF 비중이 비슷해 분산 투자 성향은 서로 닮아 있어요.',
    ],
  }
}

function buildInsuranceComparison(idx: number): CategoryComparison {
  const myPremium = 85_000
  const myCoverageScore = 72
  const peerPremium = 45_000 + idx * 4_500
  const peerCoverageScore = 55 + (idx % 5) * 6

  const myShares = [40, 30, 20, 10]
  const peerShares = normalize([30 + (idx % 3) * 5, 30 + (idx % 4) * 3, 25, 15])
  const labels = ['생명', '건강', '상해', '저축성']
  const breakdown = labels.map((label, index) => ({ label, myPercent: myShares[index], peerPercent: peerShares[index] }))

  return {
    categoryLabel: '보험',
    headline: `보장 구성은 비슷하지만, ${biggestGapLabel(breakdown)} 비중에서 차이가 있어요!`,
    stats: [
      { label: '월 보험료', myLabel: won(myPremium), peerLabel: won(peerPremium), ...diffOf(myPremium, peerPremium, 'won') },
      { label: '보장 수준 점수', myLabel: percent(myCoverageScore), peerLabel: percent(peerCoverageScore), ...diffOf(myCoverageScore, peerCoverageScore, 'percent') },
    ],
    breakdownTitle: '보장 구성 비중',
    breakdown,
    patternNote: '반기마다 보장 내용을 점검해보면 좋아요',
    insights: [
      '건강보험 비중이 높은 편이라 실손 특약을 함께 점검해볼 만해요.',
      '보험료 차이가 커서, 중복 보장이 있는지 확인해보면 좋아요.',
    ],
  }
}

function buildProductsComparison(item: AppItem, idx: number): CategoryComparison {
  const myCount = 3
  const myAvgRate = 3.1
  const signals = [item.data?.savingSignal, item.data?.pensionSignal, item.data?.subscriptionSignal].filter(Boolean).length
  const peerCount = Math.max(1, signals)
  const peerAvgRate = 2.5 + (idx % 4) * 0.4

  const myShares = [35, 30, 20, 15]
  const peerShares = normalize([30 + (idx % 3) * 4, 25 + (idx % 2) * 5, 25, 20])
  const labels = ['예금', '적금', '펀드', 'ISA']
  const breakdown = labels.map((label, index) => ({ label, myPercent: myShares[index], peerPercent: peerShares[index] }))

  return {
    categoryLabel: '금융 상품',
    headline: `보유 상품 성향은 비슷하지만, ${biggestGapLabel(breakdown)} 비중에서 차이가 있어요!`,
    stats: [
      { label: '보유 상품 수', myLabel: `${myCount}개`, peerLabel: `${peerCount}개`, ...diffOf(myCount, peerCount, 'percent') },
      { label: '평균 금리', myLabel: percent(myAvgRate), peerLabel: percent(peerAvgRate), ...diffOf(myAvgRate, peerAvgRate, 'percent') },
    ],
    breakdownTitle: '상품 구성 비중',
    breakdown,
    patternNote: '만기가 몰리지 않게 상품별로 시기를 나눠보면 좋아요',
    insights: [
      'ISA 비중 차이가 커서, 비과세 한도를 더 활용할 여지가 있어요.',
      '적금 비중이 비슷해 정기 저축 습관은 서로 닮아 있어요.',
    ],
  }
}

function buildLoanComparison(idx: number): CategoryComparison {
  const myBalance = 4_200_000
  const myRepaymentRatio = 18
  const peerBalance = idx % 3 === 0 ? 0 : 1_500_000 + idx * 320_000
  const peerRepaymentRatio = idx % 3 === 0 ? 0 : 10 + (idx % 5) * 3

  const myShares = [50, 30, 15, 5]
  const peerShares = peerBalance === 0 ? [0, 0, 0, 100] : normalize([40 + (idx % 3) * 5, 30, 20, 10])
  const labels = ['신용대출', '전세자금', '학자금', '기타']
  const breakdown = labels.map((label, index) => ({ label, myPercent: myShares[index], peerPercent: peerShares[index] }))

  return {
    categoryLabel: '대출/부채',
    headline: peerBalance === 0
      ? '상대는 대출이 없어요! 나는 상환 계획을 조금 더 점검해볼 만해요.'
      : `상환 비율은 비슷하지만, ${biggestGapLabel(breakdown)} 비중에서 차이가 있어요!`,
    stats: [
      { label: '대출 잔액', myLabel: won(myBalance), peerLabel: won(peerBalance), ...diffOf(myBalance, peerBalance, 'won') },
      { label: '월 상환 비율', myLabel: percent(myRepaymentRatio), peerLabel: percent(peerRepaymentRatio), ...diffOf(myRepaymentRatio, peerRepaymentRatio, 'percent') },
    ],
    breakdownTitle: '대출 구성 비중',
    breakdown,
    patternNote: '금리가 높은 대출부터 먼저 갚으면 이자 부담이 줄어요',
    insights: [
      '상환 비율이 소득 대비 크지 않은 편이라 여유가 있는 편이에요.',
      '대출 구성이 다르면 금리 조건도 다를 수 있으니 한 번 비교해보면 좋아요.',
    ],
  }
}

function buildAssetsComparison(item: AppItem, idx: number): CategoryComparison {
  const myTotal = MY_BASELINE.totalAssets
  const myInvestRatio = MY_BASELINE.investmentRatio
  const peerTotal = moneyFromData(item, 'totalAssets', myTotal)
  const peerInvestRatio = numberFromData(item, 'investmentRatio', myInvestRatio)

  const myShares = [52, 18, 20, 10]
  const assetCategories = Array.isArray(item.data?.assetCategories) ? item.data?.assetCategories as Array<{ id: string; sharePercent: number }> : []
  const findShare = (id: string) => assetCategories.find((category) => category.id === id)?.sharePercent ?? 0
  const peerShares = normalize([
    findShare('savings') || 40 + idx,
    findShare('invest') || 15,
    findShare('pension') || 15,
    findShare('subscription') || 10,
  ])
  const labels = ['예적금', '투자', '연금', '청약']
  const breakdown = labels.map((label, index) => ({ label, myPercent: myShares[index], peerPercent: peerShares[index] }))

  return {
    categoryLabel: '자산 전체',
    headline: `자산 규모는 다르지만, ${biggestGapLabel(breakdown)} 비중에서 가장 차이가 나요!`,
    stats: [
      { label: '총 자산', myLabel: won(myTotal), peerLabel: won(peerTotal), ...diffOf(myTotal, peerTotal, 'won') },
      { label: '투자 비중', myLabel: percent(myInvestRatio), peerLabel: percent(peerInvestRatio), ...diffOf(myInvestRatio, peerInvestRatio, 'percent') },
    ],
    breakdownTitle: '자산 구성 비중',
    breakdown,
    patternNote: '이 속도로 저축하면 미래 자산이 꾸준히 늘어나요',
    insights: [
      '예적금 비중이 높은 편이라 안정적이지만, 투자 비중을 조금 넓혀볼 수 있어요.',
      '자산 구성이 다르면 목표 시점도 다를 수 있으니 참고만 해보세요.',
    ],
  }
}
