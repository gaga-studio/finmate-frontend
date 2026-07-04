import { useEffect, useRef, useState } from 'react'
import { api } from './api'
import { describeError } from './errors'
import type { Navigate } from './navigation'
import { saveSession, type FinMateSession } from './session'
import type { ProductBudgetTargets, ProductOnboardingRequest } from './types'
import { AppIcon, Chevron, IconBadge, StatusBar } from './uiPrimitives'
import { AppSectionCard, ConsentRow, SectionHeading } from './AppComponents'
import { CompareGauge, Logo } from './components'

type OnboardingStepIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7

type SurveyState = {
  ageBand: string
  incomeBand: string
  jobCategory: string
  householdType: string
  moneyStyle: string
  area: string
  goalType: string
  painPoint: string
  riskProfile: string
  snsIntent: string
  privacyLevel: string
}

type SurveyField = keyof SurveyState

type SurveyOption = {
  value: string
  title: string
  detail: string
  badge?: string
}

type SurveyGroup = {
  field: SurveyField
  title: string
  description: string
  options: SurveyOption[]
}

const onboardingSteps = ['생활 맥락', '돈 고민', '목표·위험성향', '생활 태그', 'SNS·공개범위', '목표치', '마이데이터 연결', '시작 준비']

const defaultSurvey: SurveyState = {
  ageBand: '20대 후반',
  incomeBand: '3,000만원 ~ 4,000만원',
  jobCategory: '직장인',
  householdType: '1인가구',
  moneyStyle: '안정 추구형',
  area: '서울',
  goalType: 'EMERGENCY_FUND',
  painPoint: 'SAVE_CONSISTENTLY',
  riskProfile: 'STABLE',
  snsIntent: 'COMPARISON',
  privacyLevel: 'FRIENDS_ONLY',
}

const defaultBudgetTargets: ProductBudgetTargets = {
  monthlySavingsGoal: 300000,
  spendingCap: 1000000,
  investmentRatio: 10,
}

const surveyGroups: SurveyGroup[] = [
  {
    field: 'ageBand',
    title: '연령대',
    description: '비교군을 잡을 때 가장 먼저 보는 기준이에요.',
    options: [
      { value: '20대 초반', title: '20대 초반', detail: '사회 초년 · 자립 준비' },
      { value: '20대 후반', title: '20대 후반', detail: '커리어 성장기', badge: '기본' },
      { value: '30대 초반', title: '30대 초반', detail: '안정기 진입' },
      { value: '30대 후반', title: '30대 후반', detail: '자산 형성기' },
    ],
  },
  {
    field: 'jobCategory',
    title: '현재 하는 일',
    description: '또래 비교 그룹을 잡을 때 가장 먼저 보는 기준이에요.',
    options: [
      { value: '직장인', title: '직장인', detail: '월급 기반 루틴' },
      { value: '학생·취준', title: '학생·취준', detail: '생활비 중심' },
      { value: '프리랜서', title: '프리랜서', detail: '월별 수입 변동' },
    ],
  },
  {
    field: 'incomeBand',
    title: '연 소득대',
    description: '정확한 금액 대신 구간만 사용해요.',
    options: [
      { value: '2,000만원 ~ 3,000만원', title: '2,000~3,000만원', detail: '초기 자립 구간' },
      { value: '3,000만원 ~ 4,000만원', title: '3,000~4,000만원', detail: '균형 예산 구간', badge: '기본' },
      { value: '4,000만원 ~ 5,000만원', title: '4,000~5,000만원', detail: '저축 여력 구간' },
    ],
  },
  {
    field: 'householdType',
    title: '생활 형태',
    description: '고정 지출과 비상금 목표를 잡는 데 사용해요.',
    options: [
      { value: '1인가구', title: '1인가구', detail: '월세·생활비 직접 관리' },
      { value: '부모와 거주', title: '부모와 거주', detail: '고정비 부담 적음' },
      { value: '신혼', title: '신혼', detail: '부부 공동 지출 관리' },
      { value: '자녀 있음', title: '자녀 있음', detail: '양육비 반영 필요' },
    ],
  },
  {
    field: 'moneyStyle',
    title: '소비 성향',
    description: '미션 난이도와 코칭 톤을 맞춰요.',
    options: [
      { value: '안정 추구형', title: '안정 추구형', detail: '비상금과 저축 우선' },
      { value: '균형형', title: '균형형', detail: '저축과 소비 균형' },
      { value: '투자 적극형', title: '투자 적극형', detail: '자산 성장 관심' },
    ],
  },
  {
    field: 'goalType',
    title: '가장 중요한 재무 목표',
    description: '첫 미션과 홈 우선순위, 코칭 방향에 반영돼요.',
    options: [
      { value: 'EMERGENCY_FUND', title: '비상금 만들기', detail: '1개월 생활비 준비', badge: '기본' },
      { value: 'INDEPENDENCE', title: '독립 준비', detail: '보증금과 고정비 점검' },
      { value: 'HOUSING_SUBSCRIPTION', title: '청약 준비', detail: '주택청약 자격·납입 관리' },
      { value: 'INVESTMENT_GROWTH', title: '투자 확대', detail: 'ETF·주식 비중 늘리기' },
      { value: 'DEBT_REPAYMENT', title: '빚 상환', detail: '대출·카드빚 정리' },
    ],
  },
  {
    field: 'riskProfile',
    title: '투자 위험 성향',
    description: '투자 추천 톤과 비교 대상을 이 기준으로 잡아요.',
    options: [
      { value: 'STABLE', title: '안정형', detail: '원금 보전 우선' },
      { value: 'NEUTRAL', title: '중립형', detail: '위험과 수익 균형' },
      { value: 'AGGRESSIVE', title: '공격형', detail: '고수익·고위험 선호' },
    ],
  },
  {
    field: 'painPoint',
    title: '요즘 가장 어려운 점',
    description: 'AI 코치가 먼저 볼 문제를 정해요.',
    options: [
      { value: 'SAVE_CONSISTENTLY', title: '꾸준히 모으기', detail: '저축 루틴 만들기' },
      { value: 'CONTROL_SPENDING', title: '지출 줄이기', detail: '식비·카페비 관리' },
      { value: 'START_INVESTING', title: '투자 시작', detail: '소액 투자 습관' },
    ],
  },
  {
    field: 'snsIntent',
    title: 'FinMate를 쓰는 이유',
    description: '홈과 피드에서 어떤 정보를 먼저 보여줄지 정해요.',
    options: [
      { value: 'COMPARISON', title: '비교 위주', detail: '또래와 내 위치 확인', badge: '추천' },
      { value: 'RECORD', title: '기록 위주', detail: '내 소비·자산 트래킹' },
      { value: 'MOTIVATION', title: '동기부여 위주', detail: '미션과 성취감' },
      { value: 'ANONYMOUS_PREF', title: '익명 선호', detail: '드러내지 않고 참여' },
    ],
  },
  {
    field: 'privacyLevel',
    title: '공개 범위',
    description: '친구·그룹에게 어디까지 보여줄지 정해요. 나중에 프로필에서 언제든 바꿀 수 있어요.',
    options: [
      { value: 'PRIVATE', title: '비공개', detail: '나만 볼 수 있어요' },
      { value: 'FRIENDS_ONLY', title: '친구만 공개', detail: '팔로우한 친구에게만', badge: '추천' },
      { value: 'ANONYMOUS_STATS_ONLY', title: '익명 통계만 공개', detail: '누군지 모르게 수치만' },
      { value: 'PARTIAL_METRICS', title: '일부 지표만 공개', detail: '목표·미션 여부 정도만' },
    ],
  },
]

const lifeContextGroups = surveyGroups.filter((group) => (
  ['ageBand', 'jobCategory', 'incomeBand', 'householdType'].includes(group.field)
))

const concernGroups = surveyGroups.filter((group) => (
  ['moneyStyle', 'painPoint'].includes(group.field)
))

const goalRiskGroups = surveyGroups.filter((group) => (
  ['goalType', 'riskProfile'].includes(group.field)
))

const snsPrivacyGroups = surveyGroups.filter((group) => (
  ['snsIntent', 'privacyLevel'].includes(group.field)
))

const areaOptions: SurveyOption[] = [
  { value: '서울', title: '서울', detail: '수도권 중심 비교군', badge: '기본' },
  { value: '경기', title: '경기', detail: '수도권 외곽 비교군' },
  { value: '부산', title: '부산', detail: '영남권 비교군' },
  { value: '기타', title: '그 외 지역', detail: '지방 광역시·기타' },
]

const lifeTagOptions: SurveyOption[] = [
  { value: 'COST_EFFECTIVE', title: '가성비', detail: '실속 있는 소비를 선호해요' },
  { value: 'DINING_OUT', title: '외식 잦음', detail: '식비 중 외식 비중이 높아요' },
  { value: 'MANY_SUBSCRIPTIONS', title: '구독 많음', detail: 'OTT·앱 구독을 여러 개 써요' },
  { value: 'CAR_OWNER', title: '차량 보유', detail: '차량 유지비가 있어요' },
  { value: 'PET_OWNER', title: '반려동물', detail: '반려동물 양육비가 있어요' },
]

const mydataScopes = [
  { value: 'ACCOUNT_SUMMARY', title: '계좌 요약', detail: '잔액과 입출금 흐름' },
  { value: 'CARD_SPENDING', title: '카드 소비', detail: '식비, 교통, 구독 지출' },
  { value: 'INVESTMENT_SUMMARY', title: '투자 요약', detail: '보유 종목과 평가금액' },
  { value: 'ELECTRONIC_FINANCE', title: '간편결제', detail: '선불·포인트 사용 흐름' },
]

const privacyLevelPreview: Record<string, { visible: string; hidden: string }> = {
  PRIVATE: { visible: '없음 (나만 확인 가능)', hidden: '연령대, 목표, 자산 요약, 미션 상태 전부' },
  FRIENDS_ONLY: { visible: '목표, 미션 달성 상태, 가입한 상품 여부', hidden: '정확한 금액, 급여일 같은 시점 정보' },
  ANONYMOUS_STATS_ONLY: { visible: '연령대, 목표, 카테고리별 정확 금액, 자산 요약(익명)', hidden: '실명, 이메일 등 신원 정보' },
  PARTIAL_METRICS: { visible: '목표, 미션 달성 상태 정도만', hidden: '금액, 자산 요약, 시점 정보' },
}

function privacyExposedFieldsFor(level: string): string[] {
  switch (level) {
    case 'PRIVATE':
      return []
    case 'FRIENDS_ONLY':
      return ['goalType', 'missionStatus', 'productActions']
    case 'ANONYMOUS_STATS_ONLY':
      return ['ageBand', 'goalType', 'financialSummary', 'missionStatus']
    case 'PARTIAL_METRICS':
      return ['goalType', 'missionStatus']
    default:
      return []
  }
}

function readyGaugeFor(goalType: string): { category: string; meValue: number; otherValue: number; unit: string } {
  switch (goalType) {
    case 'INVESTMENT_GROWTH':
      return { category: '투자 비중', meValue: 18, otherValue: 24, unit: '%' }
    case 'DEBT_REPAYMENT':
      return { category: '부채 상환 비율', meValue: 12, otherValue: 20, unit: '%' }
    case 'HOUSING_SUBSCRIPTION':
      return { category: '청약 준비율', meValue: 40, otherValue: 55, unit: '%' }
    case 'INDEPENDENCE':
      return { category: '고정비 비중', meValue: 35, otherValue: 42, unit: '%' }
    default:
      return { category: '저축률', meValue: 32, otherValue: 25, unit: '%' }
  }
}

export function OnboardingPage({ navigate, session }: { navigate: Navigate; session: FinMateSession }) {
  const [step, setStep] = useState<OnboardingStepIndex>(0)
  const [survey, setSurvey] = useState<SurveyState>(defaultSurvey)
  const [lifeTags, setLifeTags] = useState<string[]>([])
  const [budgetTargets, setBudgetTargets] = useState<ProductBudgetTargets>(defaultBudgetTargets)
  const [privacyAgreed, setPrivacyAgreed] = useState(false)
  const [mydataAgreed, setMydataAgreed] = useState(false)
  const [selectedScopes, setSelectedScopes] = useState<string[]>(['ACCOUNT_SUMMARY', 'CARD_SPENDING', 'INVESTMENT_SUMMARY'])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const name = session.user?.displayName ?? 'FinMate'
  const shellRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    shellRef.current?.scrollTo({ top: 0 })
  }, [step])

  const updateSurvey = (field: SurveyField, value: string) => {
    setSurvey((current) => ({ ...current, [field]: value }))
  }

  const toggleLifeTag = (tag: string) => {
    setLifeTags((current) => (
      current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag]
    ))
  }

  const toggleScope = (scope: string) => {
    setSelectedScopes((current) => (
      current.includes(scope)
        ? current.filter((item) => item !== scope)
        : [...current, scope]
    ))
  }

  const payload = (): ProductOnboardingRequest => ({
    ...survey,
    lifeTags,
    budgetTargets,
    privacyConsent: {
      anonymousPortfolioOptIn: privacyAgreed,
      friendShareDefault: survey.privacyLevel,
      exposedFields: privacyExposedFieldsFor(survey.privacyLevel),
      privacyConsentVersion: 'privacy-v2',
    },
    mydataConsent: {
      mydataConsentVersion: 'synthetic-mydata-v1.5',
      mydataScopes: selectedScopes,
    },
  })

  const finish = async () => {
    if (!privacyAgreed || !mydataAgreed || selectedScopes.length === 0) {
      setError('필수 동의와 연결 범위를 확인해주세요.')
      return
    }
    setBusy(true)
    setError(null)
    try {
      const user = await api.completeOnboarding(payload())
      saveSession({ user })
      navigate('/home')
    } catch (caught) {
      setError(describeError(caught))
    } finally {
      setBusy(false)
    }
  }

  const canGoNext =
    step === 0 ||
    step === 1 ||
    step === 2 ||
    step === 3 ||
    (step === 4 && privacyAgreed) ||
    step === 5 ||
    (step === 6 && mydataAgreed && selectedScopes.length > 0) ||
    step === 7

  const goNext = () => {
    setError(null)
    if (!canGoNext) {
      setError(step === 4 ? '공개 범위 동의가 필요해요.' : '마이데이터 제공 동의와 연결 범위를 확인해주세요.')
      return
    }
    if (step < 7) {
      setStep((step + 1) as OnboardingStepIndex)
      return
    }
    void finish()
  }

  return (
    <div className="screen onboarding-screen">
      <StatusBar time="9:41" />
      <header className="onboarding-top">
        <Logo size={28} />
        <span>FinMate 시작 설정</span>
        <strong>{onboardingSteps[step]}</strong>
        {step === 0 ? <p>{name}님에게 맞는 비교군, 공개 범위, 첫 미션을 차례로 정리해요.</p> : null}
      </header>
      <div className="onboarding-progress" aria-label="온보딩 진행 단계">
        {onboardingSteps.map((label, index) => (
          <b
            className={index <= step ? 'active' : ''}
            aria-label={`${index + 1}단계 ${label}${index === step ? ' (현재 단계)' : ''}`}
            aria-current={index === step ? 'step' : undefined}
            key={label}
          >
            {index + 1}
          </b>
        ))}
      </div>
      <div className="onboarding-shell" ref={shellRef}>
        {step === 0 ? <LifeContextStep survey={survey} updateSurvey={updateSurvey} /> : null}
        {step === 1 ? <MoneyConcernStep survey={survey} updateSurvey={updateSurvey} /> : null}
        {step === 2 ? <GoalRiskStep survey={survey} updateSurvey={updateSurvey} /> : null}
        {step === 3 ? <LifeTagsStep lifeTags={lifeTags} toggleLifeTag={toggleLifeTag} /> : null}
        {step === 4 ? (
          <SnsPrivacyStep survey={survey} updateSurvey={updateSurvey} agreed={privacyAgreed} setAgreed={setPrivacyAgreed} />
        ) : null}
        {step === 5 ? (
          <BudgetTargetsStep budgetTargets={budgetTargets} setBudgetTargets={setBudgetTargets} />
        ) : null}
        {step === 6 ? (
          <ConnectionMissionStep
            agreed={mydataAgreed}
            setAgreed={setMydataAgreed}
            selectedScopes={selectedScopes}
            toggleScope={toggleScope}
          />
        ) : null}
        {step === 7 ? (
          <ReadyStep survey={survey} selectedScopes={selectedScopes} budgetTargets={budgetTargets} />
        ) : null}
      </div>
      {error ? <p className="error-copy">{error}</p> : null}
      <div className="onboarding-actions">
        {step > 0 ? (
          <button className="app-button secondary" type="button" onClick={() => setStep((step - 1) as OnboardingStepIndex)} disabled={busy}>이전</button>
        ) : null}
        <button className="app-button primary" type="button" onClick={goNext} disabled={busy || !canGoNext}>
          {step === 7 ? (busy ? '저장 중' : 'FinMate 시작하기') : '다음'}
        </button>
      </div>
    </div>
  )
}

function LifeContextStep({ survey, updateSurvey }: { survey: SurveyState; updateSurvey: (field: SurveyField, value: string) => void }) {
  return (
    <div className="onboarding-content">
      <section className="onboarding-card intro-card">
        <IconBadge icon="spark" tone="teal" />
        <div>
          <SectionHeading title="생활 맥락 만들기" subtitle="정확한 계좌 연결 전에도 나와 비슷한 또래를 찾을 수 있도록 생활 기준만 먼저 잡아요." />
        </div>
      </section>
      {lifeContextGroups.map((group) => (
        <AppSectionCard className="survey-group" key={group.field}>
          <div className="survey-heading">
            <h2>{group.title}</h2>
            <p>{group.description}</p>
          </div>
          <div className="option-grid">
            {group.options.map((option) => (
              <OptionCard
                key={option.value}
                option={option}
                selected={survey[group.field] === option.value}
                onSelect={() => updateSurvey(group.field, option.value)}
              />
            ))}
          </div>
        </AppSectionCard>
      ))}
      <AppSectionCard className="survey-group">
        <div className="survey-heading">
          <h2>생활권</h2>
          <p>소비 패턴 비교에 쓰이는 대략적인 지역이에요. 세부 주소는 받지 않아요.</p>
        </div>
        <div className="option-grid">
          {areaOptions.map((option) => (
            <OptionCard
              key={option.value}
              option={option}
              selected={survey.area === option.value}
              onSelect={() => updateSurvey('area', option.value)}
            />
          ))}
        </div>
      </AppSectionCard>
    </div>
  )
}

function MoneyConcernStep({ survey, updateSurvey }: { survey: SurveyState; updateSurvey: (field: SurveyField, value: string) => void }) {
  return (
    <div className="onboarding-content">
      <section className="onboarding-card intro-card">
        <IconBadge icon="saving" tone="teal" />
        <div>
          <SectionHeading title="요즘 돈 고민" subtitle="AI 코치가 처음 해석할 문제와 미션 난이도를 이 기준으로 맞춰요." />
        </div>
      </section>
      {concernGroups.map((group) => (
        <AppSectionCard className="survey-group" key={group.field}>
          <div className="survey-heading">
            <h2>{group.title}</h2>
            <p>{group.description}</p>
          </div>
          <div className="option-grid">
            {group.options.map((option) => (
              <OptionCard
                key={option.value}
                option={option}
                selected={survey[group.field] === option.value}
                onSelect={() => updateSurvey(group.field, option.value)}
              />
            ))}
          </div>
        </AppSectionCard>
      ))}
    </div>
  )
}

function GoalRiskStep({ survey, updateSurvey }: { survey: SurveyState; updateSurvey: (field: SurveyField, value: string) => void }) {
  return (
    <div className="onboarding-content">
      <section className="onboarding-card intro-card">
        <IconBadge icon="chart" tone="teal" />
        <div>
          <SectionHeading title="목표와 투자 성향" subtitle="홈, 비교 리포트, 미션 추천이 하나의 행동으로 이어지도록 기준을 정해요." />
        </div>
      </section>
      {goalRiskGroups.map((group) => (
        <AppSectionCard className="survey-group" key={group.field}>
          <div className="survey-heading">
            <h2>{group.title}</h2>
            <p>{group.description}</p>
          </div>
          <div className={`option-grid ${group.field === 'goalType' ? 'option-grid-wide' : ''}`}>
            {group.options.map((option) => (
              <OptionCard
                key={option.value}
                option={option}
                selected={survey[group.field] === option.value}
                onSelect={() => updateSurvey(group.field, option.value)}
              />
            ))}
          </div>
        </AppSectionCard>
      ))}
      <AppSectionCard className="onboarding-loop-card">
        <SectionHeading eyebrow="첫 루프" title="홈에서 이렇게 이어져요" subtitle="친구와 또래가 시작한 행동을 보고, 비교 리포트에서 이유를 확인한 뒤, 오늘 미션으로 바로 옮겨요." />
        <div className="onboarding-flow-row" aria-label="FinMate 핵심 사용 흐름">
          <span>친구 신호</span>
          <Chevron />
          <span>비교 리포트</span>
          <Chevron />
          <span>오늘 미션</span>
        </div>
      </AppSectionCard>
    </div>
  )
}

function LifeTagsStep({ lifeTags, toggleLifeTag }: { lifeTags: string[]; toggleLifeTag: (tag: string) => void }) {
  return (
    <div className="onboarding-content">
      <section className="onboarding-card intro-card">
        <IconBadge icon="cart" tone="teal" />
        <div>
          <SectionHeading title="생활 태그" subtitle="마이데이터 거래 내역만으로는 초반에 잘 안 잡히는 생활 패턴이에요. 해당하는 만큼만 골라요 (선택 사항)." />
        </div>
      </section>
      <AppSectionCard className="scope-card">
        <SectionHeading eyebrow="복수 선택 가능" title="나에게 해당하는 태그" />
        <div className="scope-list">
          {lifeTagOptions.map((tag) => {
            const selected = lifeTags.includes(tag.value)
            return (
              <button className={`scope-row ${selected ? 'selected' : ''}`} type="button" onClick={() => toggleLifeTag(tag.value)} key={tag.value}>
                <span><AppIcon name={selected ? 'check' : 'more'} /></span>
                <div>
                  <strong>{tag.title}</strong>
                  <small>{tag.detail}</small>
                </div>
              </button>
            )
          })}
        </div>
      </AppSectionCard>
    </div>
  )
}

function SnsPrivacyStep({ survey, updateSurvey, agreed, setAgreed }: {
  survey: SurveyState
  updateSurvey: (field: SurveyField, value: string) => void
  agreed: boolean
  setAgreed: (agreed: boolean) => void
}) {
  const preview = privacyLevelPreview[survey.privacyLevel]
  return (
    <div className="onboarding-content">
      <section className="onboarding-card intro-card">
        <IconBadge icon="profile" tone="teal" />
        <div>
          <SectionHeading title="사용 의도와 공개 범위" subtitle="이 서비스를 어떻게 쓸지, 친구·그룹에게 어디까지 보여줄지 함께 정해요." />
        </div>
      </section>
      {snsPrivacyGroups.map((group) => (
        <AppSectionCard className="survey-group" key={group.field}>
          <div className="survey-heading">
            <h2>{group.title}</h2>
            <p>{group.description}</p>
          </div>
          <div className="option-grid">
            {group.options.map((option) => (
              <OptionCard
                key={option.value}
                option={option}
                selected={survey[group.field] === option.value}
                onSelect={() => updateSurvey(group.field, option.value)}
              />
            ))}
          </div>
        </AppSectionCard>
      ))}
      <AppSectionCard className="consent-preview-card">
        <SectionHeading eyebrow="공개 미리보기" title="친구·그룹에게 보이는 정보" />
        <div className="preview-profile">
          <IconBadge icon="profile" tone="teal" />
          <div>
            <strong>{survey.ageBand} · {survey.jobCategory}</strong>
            <span>선택한 공개 범위에 따라 아래처럼 보여요</span>
          </div>
        </div>
        <div className="privacy-list">
          <span>공개</span>
          <p>{preview.visible}</p>
          <span>비공개</span>
          <p>{preview.hidden}</p>
        </div>
      </AppSectionCard>
      <ConsentRow checked={agreed} title="선택한 공개 범위로 친구·그룹에게 노출하는 데 동의해요" onChange={setAgreed} />
    </div>
  )
}

type AmountPresetGroupProps = {
  title: string
  description: string
  unit: string
  presets: Array<{ value: number; label: string }>
  value: number
  onChange: (value: number) => void
}

function AmountPresetGroup({ title, description, unit, presets, value, onChange }: AmountPresetGroupProps) {
  const isPresetValue = presets.some((preset) => preset.value === value)
  const [customMode, setCustomMode] = useState(!isPresetValue)

  return (
    <AppSectionCard className="survey-group">
      <div className="survey-heading">
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      <div className="option-grid">
        {presets.map((preset) => (
          <button
            key={preset.value}
            type="button"
            className={`option-card ${!customMode && value === preset.value ? 'selected' : ''}`}
            onClick={() => { setCustomMode(false); onChange(preset.value) }}
          >
            <span>{preset.label}</span>
            <strong>{unit}</strong>
          </button>
        ))}
        <button
          type="button"
          className={`option-card ${customMode ? 'selected' : ''}`}
          onClick={() => setCustomMode(true)}
        >
          <span>직접입력</span>
          <strong>다른 금액으로</strong>
        </button>
      </div>
      {customMode ? (
        <label className="auth-form-field">
          직접 입력 ({unit})
          <input
            type="number"
            inputMode="numeric"
            min={0}
            value={value || ''}
            onChange={(event) => onChange(Number(event.target.value) || 0)}
          />
        </label>
      ) : null}
    </AppSectionCard>
  )
}

function BudgetTargetsStep({ budgetTargets, setBudgetTargets }: {
  budgetTargets: ProductBudgetTargets
  setBudgetTargets: (updater: (current: ProductBudgetTargets) => ProductBudgetTargets) => void
}) {
  return (
    <div className="onboarding-content">
      <section className="onboarding-card intro-card">
        <IconBadge icon="saving" tone="teal" />
        <div>
          <SectionHeading title="초기 목표치" subtitle="나중에 실제 거래로 보정할 수 있어요. 지금은 대략적인 감으로 골라요 (선택 사항)." />
        </div>
      </section>
      <AmountPresetGroup
        title="월 저축 목표"
        description="이번 달에 얼마를 모으고 싶은지예요."
        unit="원"
        presets={[
          { value: 100000, label: '10만원' },
          { value: 300000, label: '30만원' },
          { value: 500000, label: '50만원' },
          { value: 1000000, label: '100만원+' },
        ]}
        value={budgetTargets.monthlySavingsGoal}
        onChange={(value) => setBudgetTargets((current) => ({ ...current, monthlySavingsGoal: value }))}
      />
      <AmountPresetGroup
        title="월 소비 상한"
        description="이 금액을 넘기지 않는 걸 목표로 잡아요."
        unit="원"
        presets={[
          { value: 500000, label: '50만원' },
          { value: 1000000, label: '100만원' },
          { value: 1500000, label: '150만원' },
          { value: 2000000, label: '200만원+' },
        ]}
        value={budgetTargets.spendingCap}
        onChange={(value) => setBudgetTargets((current) => ({ ...current, spendingCap: value }))}
      />
      <AmountPresetGroup
        title="투자 목표 비중"
        description="저축 중 투자로 돌릴 비중이에요."
        unit="%"
        presets={[
          { value: 5, label: '5%' },
          { value: 10, label: '10%' },
          { value: 20, label: '20%' },
          { value: 30, label: '30%+' },
        ]}
        value={budgetTargets.investmentRatio}
        onChange={(value) => setBudgetTargets((current) => ({ ...current, investmentRatio: value }))}
      />
    </div>
  )
}

function ConnectionMissionStep({ agreed, setAgreed, selectedScopes, toggleScope }: {
  agreed: boolean
  setAgreed: (agreed: boolean) => void
  selectedScopes: string[]
  toggleScope: (scope: string) => void
}) {
  return (
    <div className="onboarding-content">
      <section className="onboarding-card intro-card">
        <IconBadge icon="chart" tone="teal" />
        <div>
          <SectionHeading title="마이데이터 제공 동의" subtitle="지금은 실제 금융기관 연결이 아니라 합성/샘플 데이터로 앱 흐름을 검증하고, 첫 미션을 만들어요." />
        </div>
      </section>
      <AppSectionCard className="scope-card">
        <SectionHeading eyebrow="연결 범위" title="연결할 금융 요약 범위" />
        <div className="scope-list">
          {mydataScopes.map((scope) => {
            const selected = selectedScopes.includes(scope.value)
            return (
              <button className={`scope-row ${selected ? 'selected' : ''}`} type="button" onClick={() => toggleScope(scope.value)} key={scope.value}>
                <span><AppIcon name={selected ? 'check' : 'more'} /></span>
                <div>
                  <strong>{scope.title}</strong>
                  <small>{scope.detail}</small>
                </div>
              </button>
            )
          })}
        </div>
      </AppSectionCard>
      <ConsentRow checked={agreed} title="선택한 범위의 합성 금융 데이터를 FinMate 분석에 사용하는 데 동의해요" onChange={setAgreed} />
    </div>
  )
}

function ReadyStep({ survey, selectedScopes, budgetTargets }: {
  survey: SurveyState
  selectedScopes: string[]
  budgetTargets: ProductBudgetTargets
}) {
  const gauge = readyGaugeFor(survey.goalType)
  return (
    <div className="onboarding-content">
      <section className="onboarding-card ready-card">
        <IconBadge icon="check-square" tone="teal" />
        <h1>너와 비슷한 그룹을 찾았어</h1>
        <p>홈에서 오늘의 미션, 예산, 친구 금융 근황을 바로 확인할 수 있어요.</p>
      </section>
      <AppSectionCard className="ready-first-gauge">
        <SectionHeading eyebrow="첫 비교" title={`${gauge.category}로 먼저 감을 잡아봐요`} subtitle="비교 탭에서 카테고리별로 더 자세히 볼 수 있어요." />
        <CompareGauge category={gauge.category} meValue={gauge.meValue} otherValue={gauge.otherValue} otherName="그룹 평균" unit={gauge.unit} />
      </AppSectionCard>
      <AppSectionCard className="ready-summary">
        <SectionHeading eyebrow="요약" title="저장될 설정" />
        <dl>
          <div><dt>비교군</dt><dd>{survey.ageBand} · {survey.jobCategory} · {survey.incomeBand}</dd></div>
          <div><dt>목표</dt><dd>{surveyGroups.find((group) => group.field === 'goalType')?.options.find((option) => option.value === survey.goalType)?.title ?? survey.goalType}</dd></div>
          <div><dt>목표치</dt><dd>월 저축 {budgetTargets.monthlySavingsGoal.toLocaleString('ko-KR')}원 · 소비상한 {budgetTargets.spendingCap.toLocaleString('ko-KR')}원 · 투자비중 {budgetTargets.investmentRatio}%</dd></div>
          <div><dt>연결 범위</dt><dd>{selectedScopes.length}개 금융 요약</dd></div>
        </dl>
      </AppSectionCard>
    </div>
  )
}

function OptionCard({ option, selected, onSelect }: { option: SurveyOption; selected: boolean; onSelect: () => void }) {
  return (
    <button className={`option-card ${selected ? 'selected' : ''}`} type="button" onClick={onSelect}>
      <span>{option.title}</span>
      <strong>{option.detail}</strong>
      {option.badge ? <em>{option.badge}</em> : null}
    </button>
  )
}
