/**
 * 상세 프로필 '금융자산' 카테고리 카드 → 계좌/상품 목록 상세 화면 데모 데이터.
 * 각 카테고리 총액은 detailedProfileData.ts의 assets.categories 금액과 정확히 일치한다.
 * 브랜드 규칙(DESIGN.md)상 실제 은행/증권사 로고·상품명은 쓰지 않고 일반화된 명칭만 사용.
 */

export type AccountLineItem = {
  id: string
  name: string
  amountLabel: string
  rateLabel?: string
  deltaLabel?: string
  deltaTone?: 'up' | 'down'
}

export type InvestmentTab = {
  id: string
  label: string
  groupLabel?: string
  items: AccountLineItem[]
  emptyLabel?: string
}

export type StatRow = {
  label: string
  value: string
  tone?: 'up' | 'down'
}

export type AssetCategoryDetail = {
  id: string
  categoryLabel: string
  eyebrow: string
  total: number
  totalLabel: string
  statRows?: StatRow[]
  sectionTitle?: string
  items?: AccountLineItem[]
  tabs?: InvestmentTab[]
}

export const assetCategoryDetails: Record<string, AssetCategoryDetail> = {
  checking: {
    id: 'checking',
    categoryLabel: '입출금',
    eyebrow: '입출금 5',
    total: 3320150,
    totalLabel: '3,320,150원',
    items: [
      { id: 'checking-1', name: '주거래 입출금통장', amountLabel: '2,150,000원' },
      { id: 'checking-2', name: '비상금 통장', amountLabel: '700,000원' },
      { id: 'checking-3', name: '자유입출금 통장', amountLabel: '300,000원' },
      { id: 'checking-4', name: '모임통장', amountLabel: '150,000원' },
      { id: 'checking-5', name: '저축예금', amountLabel: '20,150원' },
    ],
  },
  deposit: {
    id: 'deposit',
    categoryLabel: '예금',
    eyebrow: '예금 3',
    total: 4080000,
    totalLabel: '4,080,000원',
    statRows: [{ label: '이번 달 저금', value: '300,000원' }],
    sectionTitle: '예금',
    items: [
      { id: 'deposit-1', name: '1년 정기예금', amountLabel: '2,500,000원', rateLabel: '3.1%' },
      { id: 'deposit-2', name: '파킹형 예금', amountLabel: '1,080,000원', rateLabel: '2.8%' },
      { id: 'deposit-3', name: '회전식 정기예금', amountLabel: '500,000원', rateLabel: '2.6%' },
    ],
  },
  savings: {
    id: 'savings',
    categoryLabel: '적금',
    eyebrow: '적금 2',
    total: 5000000,
    totalLabel: '5,000,000원',
    statRows: [{ label: '만기까지', value: 'D-124' }],
    sectionTitle: '적금',
    items: [
      { id: 'savings-1', name: '자유적립식 적금', amountLabel: '3,200,000원', rateLabel: '4.2%' },
      { id: 'savings-2', name: '정액적립식 적금', amountLabel: '1,800,000원', rateLabel: '3.8%' },
    ],
  },
  investment: {
    id: 'investment',
    categoryLabel: '투자',
    eyebrow: '투자 3',
    total: 4622190,
    totalLabel: '4,622,190원',
    statRows: [
      { label: '수익 금액 (수익률)', value: '▲ 318,540원 (+7.4%)', tone: 'up' },
      { label: '투자중인 금액', value: '4,300,000원' },
      { label: '예수금', value: '322,190원' },
    ],
    tabs: [
      {
        id: 'stock',
        label: '주식',
        groupLabel: '국내주식',
        items: [
          { id: 'stock-1', name: '삼성전자', amountLabel: '2,200,000원', deltaLabel: '▲ 150,000원 (7.3%)', deltaTone: 'up' },
          { id: 'stock-2', name: 'TIGER 미국S&P500', amountLabel: '1,500,000원', deltaLabel: '▲ 120,000원 (8.7%)', deltaTone: 'up' },
          { id: 'stock-3', name: 'KODEX 200', amountLabel: '600,000원', deltaLabel: '▲ 48,540원 (8.8%)', deltaTone: 'up' },
        ],
      },
      { id: 'fund', label: '펀드', items: [], emptyLabel: '보유한 펀드가 없어요' },
      { id: 'etc', label: '기타', items: [], emptyLabel: '보유한 기타 자산이 없어요' },
    ],
  },
  loan: {
    id: 'loan',
    categoryLabel: '대출',
    eyebrow: '대출 2',
    total: -1520000,
    totalLabel: '-1,520,000원',
    statRows: [{ label: '상환율', value: '40%' }],
    sectionTitle: '대출',
    items: [
      { id: 'loan-1', name: '학자금 대출', amountLabel: '-1,000,000원' },
      { id: 'loan-2', name: '신용대출', amountLabel: '-520,000원' },
    ],
  },
}
