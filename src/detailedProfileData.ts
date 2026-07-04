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
    nickname: '연애하는백만장자791',
    gradeBadge: '습관성장 중',
    ageBand: '20대',
    jobStatus: '직업 확인중',
    followers: 0,
    following: 1,
  },
  summaryBadges: {
    annualIncome: { label: '연 소득', amount: 26700000, amountLabel: '26,700,000원' },
    totalAssets: { label: '총 금융자산', amount: 18502340, amountLabel: '18,502,340원' },
    monthlySpending: { label: '이번 달 소비', amount: 1283900, amountLabel: '1,283,900원' },
  },
  missions: [
    {
      id: 'mission-cafe',
      title: '이번 주 카페 지출 5,000원 줄이기',
      rewardPoints: 50,
      status: 'in_progress',
      progressLabel: '진행 3/7일',
      progressPercent: Math.round((3 / 7) * 100),
    },
    {
      id: 'mission-nospend',
      title: '무소비 미션',
      rewardPoints: 30,
      status: 'in_progress',
      progressLabel: '무소비 3번 성공',
      progressPercent: 60,
    },
  ] satisfies MissionSummary[],
  income: {
    currentYearLabel: '26,700,000원',
    insight: '최근 3년간 소득이 꾸준히 늘고 있어요 (2년 연속 상승)',
    yearly: [
      { year: 2022, amount: 31100000, amountLabel: '31,100,000원' },
      { year: 2023, amount: 19700000, amountLabel: '19,700,000원' },
      { year: 2024, amount: 20800000, amountLabel: '20,800,000원' },
      { year: 2025, amount: 22900000, amountLabel: '22,900,000원' },
    ] satisfies IncomeYearPoint[],
  },
  assets: {
    total: 18502340,
    totalLabel: '18,502,340원',
    styleInsight: '예·적금 비중이 49%로 높은 안정형이에요',
    categories: [
      { id: 'checking', label: '입출금', sharePercent: 18, amountLabel: '3,320,150원', note: '계좌 5개 사용 중' },
      { id: 'deposit', label: '예금', sharePercent: 22, amountLabel: '4,080,000원', note: '이번 달 300,000원 저금' },
      { id: 'savings', label: '적금', sharePercent: 27, amountLabel: '5,000,000원', note: '만기 D-124' },
      { id: 'investment', label: '투자', sharePercent: 25, amountLabel: '4,622,190원', note: '▲ 318,540원 (+7.4%)' },
      { id: 'loan', label: '대출', sharePercent: 8, amountLabel: '-1,520,000원', note: '지금까지 40% 갚는 중', isLiability: true },
    ] satisfies AssetCategory[],
  },
  spending: {
    total: 1283900,
    totalLabel: '1,283,900원',
    comparisonNote: '지난달(1,238,700원)보다 45,200원 더 썼어요',
    insight: '식비가 전체의 35%로 가장 큰 지출이에요. 카페·간식은 지난달보다 늘었어요.',
    categories: [
      { id: 'food', emoji: '🍚', label: '식비', amountLabel: '452,300원', sharePercent: 35.2, deltaLabel: '▲ 12,000원', deltaTone: 'up' },
      { id: 'shopping', emoji: '🛍️', label: '쇼핑·의류', amountLabel: '210,000원', sharePercent: 16.4, deltaLabel: '▲ 38,000원', deltaTone: 'up' },
      { id: 'cafe', emoji: '☕', label: '카페·간식', amountLabel: '128,400원', sharePercent: 10.0, deltaLabel: '▲ 15,300원', deltaTone: 'up' },
      { id: 'etc', emoji: '💸', label: '기타', amountLabel: '219,800원', sharePercent: 17.1, deltaLabel: '▼ 5,000원', deltaTone: 'down' },
      { id: 'culture', emoji: '🎬', label: '문화·여가', amountLabel: '95,000원', sharePercent: 7.4, deltaLabel: '▲ 8,000원', deltaTone: 'up' },
      { id: 'transport', emoji: '🚌', label: '교통', amountLabel: '88,500원', sharePercent: 6.9, deltaLabel: '▼ 3,000원', deltaTone: 'down' },
      { id: 'telecom', emoji: '📞', label: '통신', amountLabel: '55,000원', sharePercent: 4.3, deltaLabel: '—', deltaTone: 'flat' },
      { id: 'subscription', emoji: '📱', label: '구독 서비스', amountLabel: '34,900원', sharePercent: 2.7, deltaLabel: '▲ 4,900원', deltaTone: 'up' },
    ] satisfies SpendingCategory[],
    coachMessage:
      '이번 달 카페·간식 지출이 지난달보다 15,300원 늘었어요. 쇼핑·의류도 증가해서 총 소비가 소폭 올랐어요. 이번 주는 \'카페 지출 5,000원 줄이기\' 미션부터 시작해볼까요?',
  },
  incomeSavings: {
    avgIncomeLabel: '2,225,000원',
    avgSpendingLabel: '1,283,900원',
    avgSavingsLabel: '620,000원',
    savingsRateLabel: '27.9%',
    insight: '저축률이 지난달(24.6%)보다 3.3%p 올랐어요. 상승 흐름이에요.',
    trend: [
      { label: '1월', ratePercent: 21 },
      { label: '2월', ratePercent: 23 },
      { label: '3월', ratePercent: 22 },
      { label: '4월', ratePercent: 24.6 },
      { label: '5월', ratePercent: 26 },
      { label: '6월', ratePercent: 27.9 },
    ] satisfies SavingsTrendPoint[],
  },
  monthlyReport: {
    insights: [
      '이번 달 소비는 지난달보다 45,200원 증가, 주 원인은 쇼핑·의류',
      '저축률은 27.9%로 상승세, 좋은 흐름 유지 중',
      '카페·간식이 3개월 연속 증가 → 관리 포인트',
    ],
    recommendedMissions: ['카페 지출 5,000원 줄이기', '이번 주 무지출 데이 1회'],
  },
  insurance: {
    monthlyPremiumLabel: '월 32,000원 내는 중',
    productCount: 2,
  },
}
