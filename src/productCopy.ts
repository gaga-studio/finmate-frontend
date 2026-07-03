const productFieldLabels: Record<string, string> = {
  ageBand: '연령대',
  goalType: '금융 목표',
  financialSummary: '금융 요약',
  missionStatus: '미션 달성 상태',
  jobCategory: '직업군',
  incomeBand: '소득 구간',
  moneyStyle: '금융 성향',
  householdType: '가구 형태',
  assetRange: '자산 구간',
  cardLast4: '카드 끝자리',
  transactionTime: '거래 시각',
  exactTransactionTime: '정확한 거래 시각',
  merchantName: '거래처명',
  accountNumber: '계좌번호',
  exposedFields: '공개 항목',
  hiddenFields: '숨김 항목',
  anonymousPortfolioOptIn: '익명 공개 동의',
  friendShareDefault: '친구 공개 기본값',
  privacyConsentVersion: '공개 범위 동의 버전',
  mydataConsentVersion: '데이터 연결 동의 버전',
  mydataScopes: '데이터 연결 범위',
  ownPortfolioId: '내 공개 프로필',
  portfolioId: '공개 프로필',
  consentVersion: '동의 버전',
  FRIENDS_ONLY: '친구에게만 공개',
  MISSION_ONLY: '미션 근거만 공개',
  NONE: '공개 안 함',
  routineCards: '루틴 카드',
  EMERGENCY_FUND: '비상금 목표',
  SAVE_CONSISTENTLY: '꾸준히 모으기',
  CONTROL_SPENDING: '지출 줄이기',
  START_INVESTING: '투자 시작',
  DATA_NEEDED: '데이터 확인 필요',
  IN_PROGRESS: '진행 중',
  COMPLETED: '완료',
  CREATED: '생성됨',
  INVESTMENT: '투자 활동',
  SAVING: '저축 활동',
}

export function cleanProductCopy(value: string): string {
  if (/RULE_BASED|FALLBACK|SOURCE|DEMO|MOCK/i.test(value)) {
    return '코치 분석'
  }
  return Object.entries(productFieldLabels).reduce((text, [key, label]) => (
    text.replace(new RegExp(`\\b${key}\\b`, 'g'), label)
  ), value)
}
