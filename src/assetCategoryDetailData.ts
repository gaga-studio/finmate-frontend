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
    eyebrow: '입출금 1',
    total: 15302004,
    totalLabel: '15,302,004원',
    statRows: [
      { label: '주 용도', value: '독립 준비 자금 + 생활비 관리' },
      { label: '연결된 결제수단', value: '간편결제 3개' },
    ],
    items: [
      { id: 'checking-1', name: 'KB Star 청춘통장', amountLabel: '15,302,004원' },
    ],
  },
  deposit: {
    id: 'deposit',
    categoryLabel: '청약',
    eyebrow: '청약 1',
    total: 1234965,
    totalLabel: '1,234,965원',
    statRows: [{ label: '월 납입액', value: '110,000원' }],
    sectionTitle: '주택청약',
    items: [
      { id: 'deposit-1', name: '청년 주택청약 통장', amountLabel: '1,234,965원' },
    ],
  },
  savings: {
    id: 'savings',
    categoryLabel: '적금',
    eyebrow: '적금 1',
    total: 5422480,
    totalLabel: '5,422,480원',
    statRows: [{ label: '월 자동이체', value: '620,000원' }],
    sectionTitle: '적금',
    items: [
      { id: 'savings-1', name: '자유적립 저축계좌', amountLabel: '5,422,480원' },
    ],
  },
  investment: {
    id: 'investment',
    categoryLabel: '투자',
    eyebrow: '투자 6',
    total: 4135251,
    totalLabel: '4,135,251원',
    statRows: [
      { label: '수익 금액 (수익률)', value: '▲ 98,977원 (+3.7%)', tone: 'up' },
      { label: '투자중인 금액', value: '2,753,977원' },
      { label: '예수금', value: '1,381,274원' },
    ],
    tabs: [
      {
        id: 'stock',
        label: '주식',
        groupLabel: '개별주식',
        items: [
          { id: 'stock-1', name: 'SK하이닉스', amountLabel: '534,797원', deltaLabel: '▲ 54,797원 (11.4%)', deltaTone: 'up' },
          { id: 'stock-2', name: '삼성전자', amountLabel: '426,732원', deltaLabel: '▲ 46,732원 (12.3%)', deltaTone: 'up' },
          { id: 'stock-3', name: 'LG에너지솔루션', amountLabel: '712,614원', deltaLabel: '▲ 12,614원 (1.8%)', deltaTone: 'up' },
        ],
      },
      {
        id: 'etf',
        label: 'ETF',
        groupLabel: '국내/해외 ETF',
        items: [
          { id: 'etf-1', name: 'KODEX 코스닥150', amountLabel: '668,914원', deltaLabel: '▲ 5,914원 (0.9%)', deltaTone: 'up' },
          { id: 'etf-2', name: 'KODEX 반도체', amountLabel: '161,440원', deltaLabel: '▼ 18,560원 (-10.3%)', deltaTone: 'down' },
          { id: 'etf-3', name: 'KODEX 미국나스닥100TR', amountLabel: '249,481원', deltaLabel: '▼ 2,519원 (-1.0%)', deltaTone: 'down' },
        ],
      },
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
