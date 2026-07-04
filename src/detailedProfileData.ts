/**
 * FinMate 상세 개인 프로필 화면의 데모 데이터.
 * 익명 기반 "내 금융 스냅샷 + 개인 분석" 화면이라 또래 비교/FOMO 문구는 넣지 않는다.
 * 기존 mockApi/api 파이프라인과 분리된 독립 데이터 — 이 화면 전용.
 */

export type MissionSummary = {
  id: string
  title: string
  rewardPoints: number
  status: 'in_progress' | 'done'
  progressLabel?: string
  progressPercent?: number
}

export type IncomeYearPoint = {
  year: number
  amount: number
  amountLabel: string
}

export type AssetCategory = {
  id: string
  label: string
  sharePercent: number
  amountLabel: string
  note: string
  isLiability?: boolean
}

export type SpendingCategory = {
  id: string
  emoji: string
  label: string
  amountLabel: string
  sharePercent: number
  deltaLabel: string
  deltaTone: 'up' | 'down' | 'flat'
}

export type SavingsTrendPoint = {
  label: string
  ratePercent: number
}

export const detailedProfile = {
  header: {
    nickname: '연애하는백만장자',
    gradeBadge: '독립 준비 중',
    ageBand: '25세',
    jobStatus: '영업관리 사원',
    followers: 615,
    following: 6,
  },
  summaryBadges: {
    annualIncome: { label: '연 소득', amount: 43920000, amountLabel: '43,920,000원' },
    totalAssets: { label: '총 금융자산', amount: 26094699, amountLabel: '26,094,699원' },
    monthlySpending: { label: '이번 달 소비', amount: 2830000, amountLabel: '2,830,000원' },
  },
  missions: [
    {
      id: 'mission-lunch',
      title: '이번 주 점심 외식 2번 줄이기',
      rewardPoints: 40,
      status: 'in_progress',
      progressLabel: '현재 1/2회',
      progressPercent: 50,
    },
    {
      id: 'mission-cafe',
      title: '카페·간식 1만5천원 아끼기',
      rewardPoints: 40,
      status: 'in_progress',
      progressLabel: '현재 6,200원 절감',
      progressPercent: 41,
    },
  ] satisfies MissionSummary[],
  income: {
    currentYearLabel: '43,920,000원',
    insight: '월 급여 3,660,000원을 기준으로 연 소득은 43,920,000원 수준이에요. 사회초년생 구간에서 안정적으로 올라오고 있어요.',
    yearly: [
      { year: 2024, amount: 31200000, amountLabel: '31,200,000원' },
      { year: 2025, amount: 38400000, amountLabel: '38,400,000원' },
      { year: 2026, amount: 43920000, amountLabel: '43,920,000원' },
    ] satisfies IncomeYearPoint[],
  },
  assets: {
    total: 26094699,
    totalLabel: '26,094,699원',
    styleInsight: '독립 준비 중이라 현금성 자산 비중이 높아요. 생활비는 안정적으로 관리하면서 투자 비중은 천천히 키우는 편이에요.',
    categories: [
      { id: 'checking', label: '입출금', sharePercent: 58.6, amountLabel: '15,302,004원', note: '독립 준비 자금과 생활비를 함께 모으는 중' },
      { id: 'savings', label: '적금', sharePercent: 20.8, amountLabel: '5,422,480원', note: '매달 620,000원 자동이체로 꾸준히 적립' },
      { id: 'investment', label: '투자', sharePercent: 15.9, amountLabel: '4,135,251원', note: '▲ 98,977원 (+3.7%)' },
      { id: 'deposit', label: '청약', sharePercent: 4.7, amountLabel: '1,234,965원', note: '월 110,000원씩 꾸준히 납입 중' },
    ] satisfies AssetCategory[],
  },
  spending: {
    total: 2830000,
    totalLabel: '2,830,000원',
    comparisonNote: '지난달(2,910,000원)보다 80,000원 덜 썼어요',
    insight: '점심 외식이 잦아 식비 비중이 가장 높아요. 구독과 교통은 낮게 유지하고 있어 전반적으로는 무난한 편이에요.',
    categories: [
      { id: 'food', emoji: '🍚', label: '식비', amountLabel: '830,000원', sharePercent: 29.3, deltaLabel: '▲ 20,000원', deltaTone: 'up' },
      { id: 'education', emoji: '📚', label: '교육·학습', amountLabel: '470,000원', sharePercent: 16.6, deltaLabel: '▼ 15,000원', deltaTone: 'down' },
      { id: 'shopping', emoji: '🛍️', label: '쇼핑·패션', amountLabel: '360,000원', sharePercent: 12.7, deltaLabel: '▼ 28,000원', deltaTone: 'down' },
      { id: 'life', emoji: '🏠', label: '생활', amountLabel: '340,000원', sharePercent: 12.0, deltaLabel: '▲ 12,000원', deltaTone: 'up' },
      { id: 'culture', emoji: '🎬', label: '문화·여가', amountLabel: '220,000원', sharePercent: 7.8, deltaLabel: '▲ 9,000원', deltaTone: 'up' },
      { id: 'beauty', emoji: '💄', label: '뷰티·미용', amountLabel: '180,000원', sharePercent: 6.4, deltaLabel: '▼ 10,000원', deltaTone: 'down' },
      { id: 'cafe', emoji: '☕', label: '카페·간식', amountLabel: '155,000원', sharePercent: 5.5, deltaLabel: '▲ 6,000원', deltaTone: 'up' },
      { id: 'telecom', emoji: '📞', label: '통신', amountLabel: '120,000원', sharePercent: 4.2, deltaLabel: '—', deltaTone: 'flat' },
      { id: 'transport', emoji: '🚌', label: '교통', amountLabel: '110,000원', sharePercent: 3.9, deltaLabel: '▼ 4,000원', deltaTone: 'down' },
      { id: 'subscription', emoji: '📱', label: '구독 서비스', amountLabel: '45,000원', sharePercent: 1.6, deltaLabel: '—', deltaTone: 'flat' },
    ] satisfies SpendingCategory[],
    coachMessage:
      '목표 소비 283만 원 선을 잘 맞추고 있어요. 점심 외식과 카페만 조금 더 다듬으면 독립 준비 자금도 더 빠르게 모을 수 있어요.',
  },
  incomeSavings: {
    avgIncomeLabel: '3,660,000원',
    avgSpendingLabel: '2,830,000원',
    avgSavingsLabel: '730,000원',
    savingsRateLabel: '20.0%',
    insight: '주택청약과 적금으로 매달 730,000원을 꾸준히 저축하고 있어요. 목표 저축률 20%를 무리 없이 유지하는 패턴이에요.',
    trend: [
      { label: '1월', ratePercent: 18.4 },
      { label: '2월', ratePercent: 19.1 },
      { label: '3월', ratePercent: 19.7 },
      { label: '4월', ratePercent: 20.2 },
      { label: '5월', ratePercent: 20.3 },
      { label: '6월', ratePercent: 20.0 },
    ] satisfies SavingsTrendPoint[],
  },
  monthlyReport: {
    insights: [
      '월 소득 366만 원 대비 소비는 283만 원 수준으로 관리되고 있어요',
      '저축 73만 원, 투자 40만 원대 흐름이 이어져 독립 준비용 자산이 차곡차곡 쌓이는 중이에요',
      '점심 외식과 카페 지출만 조금 더 다듬으면 체감 저축 속도가 더 빨라질 수 있어요',
    ],
    recommendedMissions: ['점심 외식 2번 줄이기', '카페·간식 1만5천원 아끼기'],
  },
  insurance: {
    monthlyPremiumLabel: '월 15,000원 내는 중',
    productCount: 1,
  },
}
