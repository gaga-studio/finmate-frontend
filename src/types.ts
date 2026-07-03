export type FieldError = {
  field: string
  message: string
}

export type ErrorResponse = {
  code: string
  message: string
  fieldErrors?: FieldError[]
}

export type UserMeResponse = {
  userId: string
  email: string
  displayName: string
  onboardingCompleted: boolean
  pointBalance: number
  virtualMoneyBalance: number
}

export type AuthResponse = {
  user: UserMeResponse
  accessToken: string
  expiresAt: string
}

export type ProductPrivacyConsentPayload = {
  anonymousPortfolioOptIn: boolean
  friendShareDefault: string
  exposedFields: string[]
  privacyConsentVersion: string
}

export type ProductMyDataConsentPayload = {
  mydataConsentVersion: string
  mydataScopes: string[]
}

export type ProductBudgetTargets = {
  monthlySavingsGoal: number
  spendingCap: number
  investmentRatio: number
}

export type ProductOnboardingRequest = {
  ageBand: string
  incomeBand: string
  jobCategory: string
  householdType: string
  moneyStyle: string
  area: string
  goalType: string
  painPoint: string
  riskProfile: string
  lifeTags: string[]
  snsIntent: string
  privacyLevel: string
  budgetTargets: ProductBudgetTargets
  privacyConsent: ProductPrivacyConsentPayload
  mydataConsent: ProductMyDataConsentPayload
}

export type AppCompareSearchRequest = {
  ageBand: string
  incomeBand: string
  jobCategory: string
  moneyStyle: string
  area: string
  householdType: string
  assetRange: string
}

export type AppScreenResponse = {
  screenId: string
  title: string
  tab: 'home' | 'compare' | 'mission' | 'records' | 'profile'
  statusBarTime: string
  heroAsset?: string | null
  sections: AppSection[]
  meta: Record<string, unknown>
}

export type AppSection = {
  id: string
  kind: string
  title: string
  subtitle?: string | null
  detailPath?: string | null
  heroAsset?: string | null
  metrics?: AppMetric[] | null
  items?: AppItem[] | null
  actions?: AppAction[] | null
  data?: Record<string, unknown> | null
}

export type AppMetric = {
  label: string
  value: string
  caption?: string | null
  tone?: string | null
  progress?: number | null
}

export type AppItem = {
  id: string
  title: string
  subtitle?: string | null
  value?: string | null
  caption?: string | null
  icon?: string | null
  tone?: string | null
  detailPath?: string | null
  data?: Record<string, unknown> | null
}

export type AppAction = {
  label: string
  path: string
  method: 'GET' | 'POST'
  tone: string
  intent?: string | null
}

export type AppActionResultResponse = {
  status: string
  title: string
  message: string
  nextPath: string
  data: Record<string, unknown>
}

/**
 * UI.md 6장 — 개인정보 공개 범위.
 * 보호 기준은 "금액을 보여주냐"가 아니라 "그 사람이 특정되냐"이다.
 *  - anonymous:     모르는 익명 개인 — 정확 금액·시점 공개 O
 *  - group-anon:    익명 기반 그룹 리포트 — 평균/수익률 포함 공개 O
 *  - follow:        실친(팔로우/팔로워) 개인 — 금액·시점 숨김, 행동/상품 여부만 O
 *  - group-follow:  팔로우 집단(20명+) — 개인 금액 숨김, 비율/순위만 O
 */
export type ProfileScope = 'anonymous' | 'group-anon' | 'follow' | 'group-follow'

/**
 * 사람/그룹 하나에 대해 화면에 그릴 수 있는 "원본" 금융 사실 전체.
 * ProfileCard는 scope에 따라 이 중 일부 필드를 아예 렌더하지 않는다(렌더 단계 가드).
 */
export type ProfileFinancialFacts = {
  displayName: string
  ageBand?: string | null
  jobCategory?: string | null
  moneyStyle?: string | null
  area?: string | null
  incomeBand?: string | null
  /** 카테고리 단위 정확 금액만 허용(가맹점 단위 절대 금지). anonymous/group-anon 전용. */
  categorySpending?: Array<{ category: string; amountLabel: string }> | null
  /** "월급날 25일" 같은 현금흐름 시점. anonymous/group-anon 전용. */
  cashflowPattern?: string | null
  /** 자산/예적금/투자 총액류 정확 수치. anonymous/group-anon 전용. */
  netWorthLabel?: string | null
  savingsLabel?: string | null
  investmentLabel?: string | null
  /** "청약 시작", "ETF 경험 있음" 같은 행동/상품 여부 — 모든 scope에서 공개 가능. */
  productActions?: string[] | null
  /** group-follow 전용: 개인 금액 대신 비율/순위. */
  rankLabel?: string | null
  participationRateLabel?: string | null
}
