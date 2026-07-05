import type {
  AppActionResultResponse,
  AppCompareSearchRequest,
  AppItem,
  AppScreenResponse,
  AppSection,
  AuthResponse,
  ProductOnboardingRequest,
  UserMeResponse,
} from './types'

function wait<T>(value: T, ms = 220): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

function futureIso(hours = 1): string {
  return new Date(Date.now() + hours * 60 * 60 * 1000).toISOString()
}

const mockUser: UserMeResponse = {
  userId: 'mock-p001',
  email: 'p001@synthetic.finmate.local',
  displayName: '하민',
  onboardingCompleted: true,
  pointBalance: 2450,
  virtualMoneyBalance: 100000,
}

function authResponse(user: UserMeResponse = mockUser): AuthResponse {
  return {
    user,
    accessToken: 'mock-access-token',
    expiresAt: futureIso(),
  }
}

function screen(partial: Partial<AppScreenResponse> & Pick<AppScreenResponse, 'screenId' | 'title' | 'tab' | 'sections'>): AppScreenResponse {
  return {
    statusBarTime: '9:41',
    heroAsset: null,
    meta: {},
    ...partial,
  }
}

function buildCompareProfiles(count: number): AppItem[] {
  const names = ['단단한고래3396', '야무진구름2841', '반짝이는조약돌1170', '차분한나침반6032', '성실한별빛7425', '담백한바람9184', '유연한파도2507', '튼튼한새싹4861', '선명한달빛7720', '고요한숲길1358']
  const jobs = ['IT/개발', '마케팅', '금융', '디자인', '대학생/취준']
  const areas = ['서울 강남권', '서울 강북권', '경기권', '인천권', '부산권']
  const styles = ['절약형', '저축형', '투자형', '안정 추구형']
  return Array.from({ length: count }, (_, index) => {
    const userId = `mock-p${String(index + 1).padStart(3, '0')}`
    const stockSignal = index % 3 === 0
    const savingSignal = index % 2 === 0
    const pensionSignal = index % 4 === 0
    const monthlyIncome = 3_200_000 + index * 90_000
    const monthlySavings = 280_000 + index * 22_000
    const monthlySpending = 710_000 + index * 31_000
    const totalAssets = 8_900_000 + index * 720_000
    const investmentRatio = stockSignal ? 16 + (index % 5) * 3 : 5 + (index % 3) * 2
    const emergencyFundMonths = Math.round((1.4 + (index % 6) * 0.35) * 10) / 10
    const foodSpend = 210000 + index * 8300
    const cafeSpend = 42000 + index * 1900
    return {
      id: userId,
      title: names[index % names.length],
      subtitle: jobs[index % jobs.length],
      value: undefined,
      caption: undefined,
      icon: 'profile',
      tone: 'teal',
      detailPath: `/compare/members/${userId}`,
      data: {
        isAnonymous: true,
        actualNameHidden: true,
        anonymousAvatarSeed: userId,
        ageBand: '20대 후반',
        jobCategory: jobs[index % jobs.length],
        incomeBand: '3,000만원 ~ 4,000만원',
        area: areas[index % areas.length],
        moneyStyle: styles[index % styles.length],
        score: 68 + (index % 8),
        stockSignal,
        savingSignal,
        pensionSignal,
        subscriptionSignal: index % 5 === 0,
        monthlyIncome,
        monthlySavings,
        monthlySpending,
        totalAssets,
        investmentRatio,
        emergencyFundMonths,
        // anonymous scope 전용 — 카테고리 단위 정확 금액 (가맹점 단위 절대 금지)
        categorySpending: [
          { category: '식비', amountLabel: `${foodSpend.toLocaleString('ko-KR')}원` },
          { category: '카페·간식', amountLabel: `${cafeSpend.toLocaleString('ko-KR')}원` },
          { category: '교통', amountLabel: `${(68000 + index * 2100).toLocaleString('ko-KR')}원` },
          { category: '쇼핑', amountLabel: `${(86000 + index * 4300).toLocaleString('ko-KR')}원` },
        ],
        assetCategories: [
          {
            id: 'savings',
            label: '예적금',
            amountLabel: `${Math.round(totalAssets * 0.64).toLocaleString('ko-KR')}원`,
            sharePercent: 64,
            note: '현금성 자산 중심',
          },
          {
            id: 'invest',
            label: '투자',
            amountLabel: `${Math.round(totalAssets * (investmentRatio / 100)).toLocaleString('ko-KR')}원`,
            sharePercent: investmentRatio,
            note: stockSignal ? '투자성 자산 보유' : '투자 비중 낮음',
          },
        ],
        cashflowPattern: '월급날 25일 · 급여 직후 3일 지출 집중',
        savingsLabel: savingSignal ? `${(320 + index * 12).toLocaleString('ko-KR')}만원` : null,
        productActions: [
          stockSignal ? 'ETF 투자중' : '',
          savingSignal ? '청년미래적금 가입' : '',
          pensionSignal ? '연금 준비중' : '',
        ].filter(Boolean),
      },
    }
  })
}

const friendProductActionPool = ['청약 시작', '청년미래적금 가입', 'ETF 경험 있음', '비상금 통장 개설', '연금 준비중', '적금 자동이체 시작']

function buildPeople(count: number, relation: 'following' | 'followers'): AppItem[] {
  const names = ['단단한고래3396', '야무진구름2841', '반짝이는조약돌1170', '차분한나침반6032', '성실한별빛7425', '담백한바람9184', '유연한파도2507', '튼튼한새싹4861']
  return Array.from({ length: count }, (_, index) => ({
    id: `${relation}-${index + 1}`,
    title: names[index % names.length],
    subtitle: '공개 금융 루틴 진행 중',
    value: `${(index + 1) * 2}개 공개`,
    caption: null,
    icon: 'profile',
    tone: 'teal',
    detailPath: null,
    // follow scope: 금액·시점은 절대 숨기고, "뭘 하는지"만 공개(UI.md 6장)
    data: {
      isAnonymous: true,
      actualNameHidden: true,
      anonymousAvatarSeed: `${relation}-${index + 1}`,
      publicSignalCount: (index + 1) * 2,
      productActions: [friendProductActionPool[index % friendProductActionPool.length], friendProductActionPool[(index + 2) % friendProductActionPool.length]],
    },
  }))
}

function buildActivity(count: number): AppItem[] {
  const activities = [
    { title: '단단한고래3396', subtitle: '적금 · 연금', value: '2개 공개' },
    { title: '야무진구름2841', subtitle: '주식', value: '1개 공개' },
    { title: '반짝이는조약돌1170', subtitle: '적금 · 펀드', value: '2개 공개' },
    { title: '차분한나침반6032', subtitle: '주식', value: '1개 공개' },
    { title: '성실한별빛7425', subtitle: '적금', value: '1개 공개' },
  ] as const
  return Array.from({ length: count }, (_, index) => ({
    id: `activity-${index + 1}`,
    title: activities[index % activities.length].title,
    subtitle: activities[index % activities.length].subtitle,
    value: activities[index % activities.length].value,
    caption: null,
    icon: null,
    tone: 'teal',
    detailPath: null,
    data: null,
  }))
}

function buildParticipants(count: number): AppItem[] {
  const names = ['단단한고래3396', '야무진구름2841', '반짝이는조약돌1170', '차분한나침반6032', '성실한별빛7425']
  return Array.from({ length: count }, (_, index) => ({
    id: `participant-${index + 1}`,
    title: names[index % names.length],
    subtitle: '축하 메시지 공개',
    value: null,
    caption: '참여 완료',
    icon: 'profile',
    tone: 'teal',
    detailPath: null,
    data: {
      isAnonymous: true,
      actualNameHidden: true,
      anonymousAvatarSeed: `participant-${index + 1}`,
    },
  }))
}

function homeScreen(): AppScreenResponse {
  const sections: AppSection[] = [
    { id: 'greeting', kind: 'greeting', title: '좋은 아침이에요, 하민님', subtitle: '오늘의 예산과 미션을 확인해보세요.' },
    {
      id: 'mission-today',
      kind: 'missionHero',
      title: '점심 지출 3만원 이하로 기록하기',
      subtitle: '진행 중',
      detailPath: '/missions/mission-lunch',
      metrics: [{ label: '진행률', value: '66%', progress: 66, caption: '2/3 완료' }],
      data: {
        todayReason: '점심 지출을 기록하면 오늘 미션이 완료돼요.',
        statusLabel: '진행 중',
        evaluationStatus: 'IN_PROGRESS',
        rewardPoints: 80,
      },
    },
    {
      id: 'budget-today',
      kind: 'budget',
      title: '오늘 예산',
      detailPath: '/records',
      metrics: [
        { label: '오늘 예산', value: '32,000원' },
        { label: '사용 금액', value: '19,600원' },
        { label: '남은 예산', value: '12,400원', progress: 61 },
      ],
      data: { todayBudget: 32000, todaySpent: 19600, remaining: 12400, progress: 61 },
    },
    {
      id: 'spending-summary',
      kind: 'spendingGrid',
      title: '오늘 지출',
      items: [
        { id: 'spend-food', title: '식비', value: '12,000원', caption: '점심/저녁', icon: 'spend', tone: 'warning', detailPath: '/records/2026-06-12' },
        { id: 'spend-cafe', title: '카페', value: '4,600원', caption: '아메리카노 등', icon: 'more', tone: 'teal', detailPath: '/records/2026-06-12' },
        { id: 'spend-transport', title: '교통', value: '3,000원', caption: '버스/지하철', icon: 'spark', tone: 'muted', detailPath: '/records/2026-06-12' },
        { id: 'spend-etc', title: '기타', value: '0원', caption: '기록 없음', icon: 'more', tone: 'muted', detailPath: '/records/2026-06-12' },
      ],
      data: { todaySpent: 19600 },
    },
    {
      id: 'asset-status',
      kind: 'asset',
      title: '자산 현황',
      subtitle: '최근 7일 추세',
      detailPath: '/profile',
      metrics: [{ label: '총 자산', value: '8,420,000원' }],
      data: { sparkline: [812, 815, 819, 817, 822, 838, 842], netWorth: 8420000 },
    },
    {
      id: 'following-summary',
      kind: 'signalGrid',
      title: '팔로잉 금융 근황',
      subtitle: '나만 안 하고 있는 건 아닌지 확인해보세요.',
      detailPath: '/compare',
      metrics: [{ label: '이번 주 비상금 미션 완료', value: '3명', tone: 'red' }],
      data: { participants: 3, total: 4, fomoLabel: '친구들은 벌써 비상금을 시작했어요' },
    },
    {
      id: 'birthday-alert',
      kind: 'actionCard',
      title: '지우의 생일펀드',
      subtitle: '친구들과 함께 축하 펀드를 채워보세요.',
      metrics: [{ label: '모금 현황', value: '62%', progress: 62 }],
      actions: [{ label: '펀드 보기', path: '/birthdays', method: 'GET', tone: 'primary' }],
    },
  ]
  return screen({ screenId: 'home', title: '홈', tab: 'home', sections })
}

function homeDetailScreen(detail: string): AppScreenResponse {
  const detailKindMap: Record<string, AppSection['kind']> = {
    mission: 'missionHero',
    budget: 'budget',
    spending: 'spendingGrid',
    asset: 'asset',
    following: 'signalGrid',
  }
  const kind = detailKindMap[detail] ?? 'budget'
  const source = homeScreen().sections.find((section) => section.kind === kind) ?? homeScreen().sections[1]
  return screen({ screenId: `home:${detail}`, title: source.title, tab: 'home', sections: [source] })
}

function compareScreen(): AppScreenResponse {
  const sections: AppSection[] = [
    {
      id: 'compare-prompt',
      kind: 'comparePrompt',
      title: '비교하고 싶은 그룹을 선택해보세요',
      subtitle: '나와 비슷한 사람들의 공개 금융 데이터를 기준으로 평균을 계산해요.',
      detailPath: '/compare/filter',
    },
    {
      id: 'recommended',
      kind: 'compareGroupRail',
      title: 'AI 추천 그룹',
      subtitle: '나이, 직업, 소득, 생활권이 가까운 합성 사용자를 묶었어요.',
      items: [
        {
          id: 'rec-1',
          title: '20대 · IT/개발 · 서울 강남권',
          subtitle: '월 소득 300만~400만 원',
          value: '1,246명',
          caption: '공개 금융 루틴이 가까워요',
          icon: 'stocks',
          tone: 'teal',
          detailPath: '/compare/groups/rec-1/preview',
          data: {
            ageBand: '20대',
            incomeBand: '3,000만원 ~ 4,000만원',
            jobCategory: 'IT/개발',
            moneyStyle: '안정 추구형',
            area: '서울 강남권',
            householdType: '전체',
            assetRange: '전체',
          },
        },
        {
          id: 'rec-2',
          title: '또래 직장인 평균 그룹',
          subtitle: '월 소득 300만~400만 원',
          value: '842명',
          caption: '전반적인 평균 흐름을 보기 좋아요',
          icon: 'saving',
          tone: 'teal',
          detailPath: '/compare/groups/rec-2/preview',
          data: {
            ageBand: '전체',
            incomeBand: '전체',
            jobCategory: '전체',
            moneyStyle: '전체',
            area: '전체',
            householdType: '전체',
            assetRange: '전체',
          },
        },
      ],
    },
    {
      id: 'my-groups',
      kind: 'savedCompareGroups',
      title: '내 그룹 비교',
      subtitle: '저장한 그룹은 다시 비교할 수 있어요.',
      items: [
        {
          id: 'cmp-001',
          title: '20대 · IT/개발 · 서울 강남권',
          subtitle: '저장한 비교 그룹',
          value: '1,246명',
          caption: '최근 저장',
          icon: 'profile',
          tone: 'teal',
          detailPath: '/compare/results/cmp-001',
          data: null,
        },
        {
          id: 'cmp-002',
          title: '또래 직장인 평균 그룹',
          subtitle: '전반 비교용 그룹',
          value: '842명',
          caption: '다시 보기',
          icon: 'profile',
          tone: 'teal',
          detailPath: '/compare/results/cmp-002',
          data: null,
        },
      ],
      actions: [{ label: '+ 직접 만들기', path: '/compare/filter', method: 'GET', tone: 'secondary' }],
      data: { empty: false },
    },
  ]
  return screen({ screenId: 'compare', title: '그룹 비교', tab: 'compare', sections, meta: { savedGroupCount: 2 } })
}

function compareFilterOptions(): Record<string, string[]> {
  return {
    ageBand: ['20대 초반', '20대 후반', '30대 초반', '30대 후반'],
    incomeBand: ['3,000만원 미만', '3,000만원 ~ 4,000만원', '4,000만원 ~ 5,000만원', '5,000만원 이상'],
    jobCategory: ['IT/개발', '마케팅', '금융', '디자인', '대학생/취준'],
    moneyStyle: ['절약형', '저축형', '투자형', '안정 추구형'],
    area: ['서울 강남권', '서울 강북권', '경기권', '인천권', '부산권'],
    householdType: ['1인가구', '2인가구', '3인 이상 가구'],
    assetRange: ['1,000만원 미만', '1,000만원 ~ 3,000만원', '3,000만원 이상'],
  }
}

const defaultCompareFilters: AppCompareSearchRequest = {
  ageBand: '전체',
  incomeBand: '전체',
  jobCategory: '전체',
  moneyStyle: '전체',
  area: '전체',
  householdType: '전체',
  assetRange: '전체',
}

function compareFilterScreen(filters: AppCompareSearchRequest = defaultCompareFilters): AppScreenResponse {
  const nonDefault = Object.values(filters).filter((value) => value !== '전체').length
  const resultCount = Math.max(0, 1246 - nonDefault * 188)
  const pool = buildCompareProfiles(8)
  const profiles = pool.slice(0, Math.min(pool.length, resultCount === 0 ? 0 : Math.max(1, Math.round(resultCount / 6))))
  return screen({
    screenId: 'compare:filter',
    title: '필터링 조회',
    tab: 'compare',
    sections: [{ id: 'profiles', kind: 'compareProfileList', title: '검색 결과', items: profiles }],
    meta: { filters, filterOptions: compareFilterOptions(), resultCount },
  })
}

function compareMemberDetailScreen(memberId: string): AppScreenResponse {
  const member = buildCompareProfiles(12).find((item) => item.id === memberId) ?? buildCompareProfiles(1)[0]
  return screen({
    screenId: `compare:member:${memberId}`,
    title: '익명 프로필',
    tab: 'compare',
    sections: [
      {
        id: 'member',
        kind: 'compareMemberDetail',
        title: member.title,
        subtitle: member.subtitle,
        items: [member],
        data: { memberId: member.id, privacy: 'anonymous-public-summary' },
      },
    ],
    meta: { memberId: member.id },
  })
}

function compareGroupPreviewScreen(recommendationId: string): AppScreenResponse {
  const previewById: Record<string, { title: string; subtitle: string; memberCount: number; filters: AppCompareSearchRequest; features: AppItem[] }> = {
    'rec-1': {
      title: '20대 · IT/개발 · 서울 강남권',
      subtitle: '월 소득 300만~400만 원',
      memberCount: 1246,
      filters: {
        ageBand: '20대',
        incomeBand: '3,000만원 ~ 4,000만원',
        jobCategory: 'IT/개발',
        moneyStyle: '안정 추구형',
        area: '서울 강남권',
        householdType: '전체',
        assetRange: '전체',
      },
      features: [
        { id: 'feature-1', title: '소비 흐름이 비슷해요', subtitle: '식비와 카페 비중이 안정적으로 유지돼요.', icon: 'spend', tone: 'teal' },
        { id: 'feature-2', title: '저축 루틴이 꾸준해요', subtitle: '월 평균 저축액이 35만~40만 원 수준이에요.', icon: 'saving', tone: 'teal' },
        { id: 'feature-3', title: '투자 비중은 아직 낮은 편이에요', subtitle: '현금성 자산 비중이 상대적으로 높아요.', icon: 'stocks', tone: 'teal' },
      ],
    },
    'rec-2': {
      title: '또래 직장인 평균 그룹',
      subtitle: '월 소득 300만~400만 원',
      memberCount: 842,
      filters: {
        ageBand: '전체',
        incomeBand: '전체',
        jobCategory: '전체',
        moneyStyle: '전체',
        area: '전체',
        householdType: '전체',
        assetRange: '전체',
      },
      features: [
        { id: 'feature-4', title: '전반적인 금융 평균을 보기 좋아요', subtitle: '저축, 소비, 투자 흐름을 넓게 비교할 수 있어요.', icon: 'chart', tone: 'teal' },
        { id: 'feature-5', title: '무난한 저축 루틴이 강해요', subtitle: '정기 저축과 비상금 준비 비율이 안정적이에요.', icon: 'saving', tone: 'teal' },
        { id: 'feature-6', title: '큰 편차 없이 고르게 분포돼요', subtitle: '극단적인 소비/투자 성향보다 평균 흐름에 가까워요.', icon: 'check', tone: 'teal' },
      ],
    },
  }

  const preview = previewById[recommendationId] ?? previewById['rec-1']

  return screen({
    screenId: `compare:group-preview:${recommendationId}`,
    title: '그룹 미리보기',
    tab: 'compare',
    sections: [
      {
        id: 'preview-identity',
        kind: 'compareGroupPreviewHero',
        title: preview.title,
        subtitle: `${preview.subtitle} | ${preview.memberCount.toLocaleString('ko-KR')}명`,
        metrics: [{ label: '그룹 인원', value: `${preview.memberCount.toLocaleString('ko-KR')}명`, caption: '공개 프로필 기준', tone: 'teal' }],
        data: { icon: 'profile', memberCount: preview.memberCount },
      },
      {
        id: 'preview-features',
        kind: 'compareGroupPreviewFeatures',
        title: '이 그룹의 핵심 특징',
        items: preview.features,
      },
    ],
    meta: {
      recommendationId,
      filters: preview.filters,
      memberCount: preview.memberCount,
      groupTitle: preview.title,
    },
  })
}

function compareResultScreen(comparisonId: string): AppScreenResponse {
  const sections: AppSection[] = [
    {
      id: 'report-hero',
      kind: 'compareReportHero',
      title: comparisonId === 'cmp-002' ? '또래 직장인 평균 그룹' : '20대 · IT/개발 · 서울 강남권',
      subtitle: comparisonId === 'cmp-002' ? '월 소득 300만~400만 원 | 842명' : '월 소득 300만~400만 원 | 1,246명',
      metrics: [{ label: '표본 수', value: comparisonId === 'cmp-002' ? '842명' : '1,246명', caption: '익명 집계 기준', tone: 'teal' }],
      data: { icon: 'profile', memberCount: comparisonId === 'cmp-002' ? 842 : 1246 },
    },
    {
      id: 'report-summary',
      kind: 'compareReportSummary',
      title: '한 줄 요약',
      subtitle: comparisonId === 'cmp-002'
        ? '이 그룹은 소비와 저축 흐름이 전반적으로 균형적이고, 투자 비중은 과하지 않은 평균형이에요.'
        : '이 그룹은 저축 루틴이 안정적이고, 투자 비중은 비교적 낮은 편이에요.',
    },
    {
      id: 'report-metrics',
      kind: 'compareReportMetricGrid',
      title: '그룹 주요 특징',
      metrics: [
        { label: '평균 월 소득', value: '340만 원' },
        { label: '평균 저축액', value: '35만 원' },
        { label: '평균 자산', value: '960만 원' },
        { label: '저축 / 투자 비율', value: '12% / 8%' },
      ],
    },
    {
      id: 'report-distribution',
      kind: 'compareSpendingDistribution',
      title: '소비 성향 요약',
      items: [
        { id: 'dist-food', title: '식비', value: '32%', caption: '32%', data: { percent: 32 } },
        { id: 'dist-home', title: '주거·생활', value: '27%', caption: '27%', data: { percent: 27 } },
        { id: 'dist-transport', title: '교통', value: '11%', caption: '11%', data: { percent: 11 } },
        { id: 'dist-saving', title: '저축·투자', value: '18%', caption: '18%', data: { percent: 18 } },
        { id: 'dist-etc', title: '기타', value: '12%', caption: '12%', data: { percent: 12 } },
      ],
    },
    {
      id: 'compare-members',
      kind: 'compareGroupMembers',
      title: '그룹에 포함된 사용자',
      subtitle: `${comparisonId === 'cmp-002' ? 842 : 1246}명의 공개 금융 프로필입니다.`,
      items: buildCompareProfiles(12).map((item, index) => ({
        ...item,
        data: {
          ...item.data,
          ageBand: '20대 후반',
          jobCategory: ['IT/개발', '디자인', '마케팅', '금융'][index % 4],
          incomeBand: '3,000만원 ~ 4,000만원',
          score: 68 + (index % 8),
        },
      })),
      data: { pageSize: 6, initialVisible: 6, total: comparisonId === 'cmp-002' ? 842 : 1246 },
    },
  ]
  return screen({
    screenId: `compare:${comparisonId}`,
    title: '그룹 비교',
    tab: 'compare',
    sections,
    meta: { comparisonId, memberCount: comparisonId === 'cmp-002' ? 842 : 1246 },
  })
}

function comparePersonalFlowScreen(comparisonId: string): AppScreenResponse {
  return screen({
    screenId: `compare:personal:${comparisonId}`,
    title: '나와의 비교',
    tab: 'compare',
    sections: [
      {
        id: 'personal-summary',
        kind: 'comparePersonalSummary',
        title: '나와의 비교',
        subtitle: '그룹과 나의 주요 지표를 한눈에 비교해요.',
        items: [
          { id: 'summary-income', title: '월 소득', value: '360만 원', caption: '340만 원', data: { category: '현금 흐름' } },
          { id: 'summary-saving', title: '월 평균 저축액', value: '42만 원', caption: '35만 원', data: { category: '현금 흐름' } },
          { id: 'summary-spending', title: '월 평균 소비액', value: '78만 원', caption: '81만 원', data: { category: '현금 흐름' } },
          { id: 'summary-asset', title: '총 자산', value: '1,180만 원', caption: '960만 원', data: { category: '자산' } },
          { id: 'summary-invest', title: '투자 비중', value: '18%', caption: '12%', data: { category: '자산' } },
          { id: 'summary-emergency', title: '비상금 개월 수', value: '2.6개월', caption: '1.9개월', data: { category: '자산' } },
        ],
        data: {
          summary: '저축과 자산 규모는 그룹보다 높지만, 투자 비중은 아직 보수적인 편이에요.',
        },
      },
      {
        id: 'personal-insights',
        kind: 'comparePersonalInsights',
        title: '이 그룹에서 얻을 수 있는 인사이트',
        subtitle: '그룹의 강점과 내 개선 포인트를 요약했어요.',
        items: [
          { id: 'insight-saving', title: '저축 루틴은 강점이에요', subtitle: '월 평균 저축액이 그룹 평균보다 7만 원 높아요.', icon: 'saving', tone: 'teal' },
          { id: 'insight-invest', title: '투자 비중을 조금 더 넓혀볼 수 있어요', subtitle: '현금 비중이 높아 자산 성장 속도가 느릴 수 있어요.', icon: 'stocks', tone: 'teal' },
          { id: 'insight-fixed', title: '고정 지출 점검이 다음 행동이에요', subtitle: '구독과 반복 결제를 줄이면 절감 여지가 커요.', icon: 'check-square', tone: 'teal' },
        ],
      },
      {
        id: 'personal-improvements',
        kind: 'comparePersonalImprovements',
        title: '나의 개선 포인트 TOP 3',
        items: [
          { id: 'improvement-1', title: '고정 지출 5% 줄이기', data: { rank: 1 } },
          { id: 'improvement-2', title: '투자 비중 점검하기', data: { rank: 2 } },
          { id: 'improvement-3', title: '비상금 자동이체 10만 원 설정하기', data: { rank: 3 } },
        ],
      },
      {
        id: 'personal-recommendations',
        kind: 'comparePersonalRecommendations',
        title: '추천 금융',
        subtitle: '이 그룹을 참고해 지금 시작하기 좋은 행동 후보예요.',
        items: [
          {
            id: 'recommend-fixed',
            title: '고정 지출 5% 줄이기',
            subtitle: '구독과 반복 결제를 점검해 다음 달 현금흐름을 가볍게 만들어요.',
            detailPath: '/missions/mission-fixed-cost',
            data: { rank: 1, tags: ['지출 점검', '현금흐름 개선'] },
          },
          {
            id: 'recommend-invest',
            title: '투자 비중 점검하기',
            subtitle: '이번 달 매수 금액과 현금 비중을 함께 확인해요.',
            detailPath: '/missions/mission-invest',
            data: { rank: 2, tags: ['자산 배분', '투자 체크'] },
          },
          {
            id: 'recommend-emergency',
            title: '이번 달 비상금 자동이체 10만 원 설정하기',
            subtitle: '월급이나 용돈이 들어온 다음 날 비상금 계좌로 10만 원 자동이체를 예약합니다.',
            detailPath: '/missions/mission-auto-transfer-small',
            data: { rank: 3, tags: ['비상금', '자동이체'] },
          },
        ],
        data: { disclaimer: '상품 가입 권유가 아니라 금융 행동 후보입니다.' },
      },
      {
        id: 'personal-save',
        kind: 'comparePersonalSave',
        title: '리포트 저장 완료',
        subtitle: '언제든 마이 리포트에서 다시 확인할 수 있어요.',
        metrics: [
          { label: '그룹', value: comparisonId === 'cmp-002' ? '또래 직장인 평균 그룹' : '20대 · IT/개발 · 서울 강남권', caption: `표본 ${comparisonId === 'cmp-002' ? 842 : 1246}명` },
          { label: '저장일', value: '2026-06-12', caption: '내 리포트 기준' },
        ],
      },
    ],
    meta: {
      comparisonId,
      groupTitle: comparisonId === 'cmp-002' ? '또래 직장인 평균 그룹' : '20대 · IT/개발 · 서울 강남권',
      memberCount: comparisonId === 'cmp-002' ? 842 : 1246,
    },
  })
}

function compareCoachScreen(comparisonId: string): AppScreenResponse {
  return screen({
    screenId: 'compare:coach-flow',
    title: 'AI 코치 분석',
    tab: 'compare',
    sections: [
      {
        id: 'summary',
        kind: 'coach',
        title: '하민님, 잘하고 있어요!',
        subtitle: '또래보다 자동 저축을 잘하고 있고 소비도 안정적이에요. 다만 투자가 너무 적어서 자산 성장 속도가 느릴 수 있어요.',
      },
      {
        id: 'insights',
        kind: 'checkList',
        title: '핵심 요약',
        items: [
          { id: 'coach-insight-1', title: '저축 루틴은 안정적이에요', subtitle: '정기 저축 흐름이 그룹 평균보다 앞서 있어요.', icon: 'saving', tone: 'teal' },
          { id: 'coach-insight-2', title: '투자 비중은 더 점검해볼 수 있어요', subtitle: '현금 비중이 높아 성장 기회가 줄어들 수 있어요.', icon: 'stocks', tone: 'teal' },
          { id: 'coach-insight-3', title: '고정 지출 점검이 바로 다음 행동이에요', subtitle: '구독과 반복 결제를 줄이면 절감 효과가 커요.', icon: 'check', tone: 'teal' },
        ],
      },
      {
        id: 'actions',
        kind: 'actionList',
        title: '추천 행동 TOP 3',
        items: [
          { id: 'coach-action-1', title: '고정 지출 5% 줄이기', subtitle: '구독 점검으로 절약 금액을 바로 비상금으로 연결해보세요.', caption: '+180P', icon: 'target', tone: 'teal', detailPath: '/missions/mission-fixed-cost' },
          { id: 'coach-action-2', title: '투자 비중 점검하기', subtitle: '이번 달 매수 금액과 현금 비중을 함께 확인해요.', caption: '+150P', icon: 'target', tone: 'teal', detailPath: '/missions/mission-invest' },
          { id: 'coach-action-3', title: '이번 달 비상금 자동이체 10만 원 설정하기', subtitle: '작은 자동화부터 시작해보세요.', caption: '+100P', icon: 'target', tone: 'teal', detailPath: '/missions/mission-auto-transfer-small' },
        ],
        actions: [{ label: '계획 세우기', path: '/missions/mission-fixed-cost', method: 'GET', tone: 'primary' }],
      },
    ],
    meta: { comparisonId },
  })
}

function missionsScreen(): AppScreenResponse {
  const sections: AppSection[] = [
    {
      id: 'mission-today',
      kind: 'missionHero',
      title: '이번 달 비상금 자동이체 10만 원 설정하기',
      subtitle: '오늘의 미션',
      detailPath: '/missions/mission-auto-transfer-small',
      metrics: [{ label: '진행률', value: '0%', progress: 0, caption: '100P 보상' }],
      data: {
        todayReason: '오늘 기록에서 이어서 확인할 실천 목표예요.',
        statusLabel: '오늘의 미션',
        evaluationStatus: 'CREATED',
        rewardPoints: 100,
      },
    },
    {
      id: 'points',
      kind: 'points',
      title: '나의 포인트',
      metrics: [{ label: '보유 포인트', value: '857P', caption: '오늘 미션 보상은 100P 보상입니다.', progress: 35 }],
    },
    {
      id: 'mission-loop',
      kind: 'loop',
      title: '미션 루프',
    },
    {
      id: 'active',
      kind: 'list',
      title: '진행 중인 미션',
      subtitle: '오늘의 미션을 제외한 나머지 진행 중 목표예요.',
      items: [
        {
          id: 'mission-fixed-cost',
          title: '고정 지출 5% 줄이기',
          subtitle: '구독과 반복 결제를 점검해 다음 달 현금흐름을 가볍게 만들어요.',
          value: '45%',
          caption: '+180P',
          icon: 'check-square',
          tone: 'warning',
          detailPath: '/missions/mission-fixed-cost',
          data: null,
        },
        {
          id: 'mission-invest',
          title: '투자 비중 점검하기',
          subtitle: '이번 달 매수 금액과 현금 비중을 함께 확인해요.',
          value: '15%',
          caption: '+150P',
          icon: 'check-square',
          tone: 'warning',
          detailPath: '/missions/mission-invest',
          data: null,
        },
      ],
    },
    {
      id: 'completed',
      kind: 'list',
      title: '완료',
      items: [
        { id: 'mission-food', title: '내일 식비 10,000원 이하 사용하기', subtitle: '하루 식비 10,000원 이하', value: '완료', caption: '+120P', icon: 'food', tone: 'teal', detailPath: '/missions/mission-food', data: null },
        { id: 'mission-saving', title: '저축하기 습관 만들기', subtitle: '비상금 100,000원 이상 저축', value: '완료', caption: '+200P', icon: 'saving', tone: 'teal', detailPath: '/missions/mission-saving', data: null },
      ],
    },
  ]
  return screen({ screenId: 'missions', title: '미션', tab: 'mission', sections })
}

function missionNextGoalsScreen(): AppScreenResponse {
  const missionSections = missionsScreen().sections
  const todayMission = missionSections.find((section) => section.id === 'mission-today')
  const activeSection = missionSections.find((section) => section.id === 'active')
  const nextGoalItems: AppItem[] = [
    ...((activeSection?.items ?? []).map((item) => ({
      ...item,
      icon: item.id === 'mission-invest' ? 'stocks' : (item.icon ?? 'check-square'),
      tone: item.tone ?? 'teal',
    }))),
    {
      id: 'next-auto-transfer',
      title: todayMission?.title ?? '이번 달 비상금 자동이체 10만 원 설정하기',
      subtitle: '월급이나 용돈이 들어온 다음 날 비상금 계좌로 10만 원 자동이체를 예약합니다.',
      value: '0%',
      caption: '+100P',
      icon: 'saving',
      tone: 'teal',
      detailPath: todayMission?.detailPath ?? '/missions/mission-auto-transfer-small',
      data: null,
    },
  ]

  return screen({
    screenId: 'missions:next-goals',
    title: '다음 목표 제안',
    tab: 'mission',
    sections: [
      {
        id: 'coach',
        kind: 'coach',
        title: '다음 행동으로 이어가볼까요?',
        subtitle: '완료한 미션 다음에 이어서 하기 좋은 목표를 골랐어요.',
      },
      {
        id: 'next',
        kind: 'list',
        title: '추천 다음 목표',
        items: nextGoalItems,
        actions: [{ label: '미션 탭으로 돌아가기', path: '/missions', method: 'GET', tone: 'primary' }],
      },
    ],
    meta: { completedMissionId: 'mission-food' },
  })
}

function missionAddScreen(): AppScreenResponse {
  return screen({
    screenId: 'missions:add',
    title: '미션 추가',
    tab: 'mission',
    sections: [
      {
        id: 'templates',
        kind: 'list',
        title: '추천 미션',
        items: [
          { id: 'tmpl-1', title: '이번 주 카페 2회 이하 이용하기', subtitle: '카페 결제를 줄이고 남은 금액을 비상금으로 옮기는 소비 루틴입니다.', value: null, caption: '+100P', icon: 'cafe', tone: 'warning', detailPath: null, data: { templateId: 'MISSION_CAFE_LIMIT_WEEKLY' } },
          { id: 'tmpl-2', title: '교통비 하루 예산 지키기', subtitle: '이동 경로를 미리 정해 택시와 즉흥 이동 지출을 줄입니다.', value: null, caption: '+120P', icon: 'transport', tone: 'teal', detailPath: null, data: { templateId: 'MISSION_TRANSPORT_BUDGET' } },
          { id: 'tmpl-3', title: '이번 달 비상금 자동이체 10만 원 설정하기', subtitle: '월급이나 용돈이 들어온 다음 날 비상금 계좌로 10만 원 자동이체를 예약합니다.', value: null, caption: '+100P', icon: 'saving', tone: 'teal', detailPath: null, data: { templateId: 'MISSION_AUTO_TRANSFER_SMALL' } },
        ],
      },
    ],
  })
}

function missionDetailScreen(missionId: string): AppScreenResponse {
  const detail = missionDetailById(missionId)
  return screen({
    screenId: `missions:${missionId}`,
    title: detail.title,
    tab: 'mission',
    sections: [
      {
        id: 'mission-detail',
        kind: 'missionHero',
        title: detail.title,
        subtitle: detail.statusLabel,
        metrics: [{ label: '진행률', value: detail.progressValue, progress: detail.progress, caption: detail.progressCaption }],
        data: {
          todayReason: detail.reason,
          statusLabel: detail.statusLabel,
          evaluationStatus: detail.evaluationStatus,
        },
      },
      {
        id: 'evidence',
        kind: 'checkList',
        title: '완료 조건과 근거',
        subtitle: '미션은 버튼이 아니라 행동 데이터가 조건을 만족할 때 자동 완료돼요.',
        items: [
          { id: 'condition', title: '완료 조건', subtitle: detail.completionRule, icon: 'check', tone: 'teal', data: null },
          { id: 'period', title: '평가 기간', subtitle: detail.evaluationWindow, icon: 'calendar', tone: 'teal', data: null },
          { id: 'status', title: '현재 판정', subtitle: detail.evaluationText, caption: detail.evaluationCaption, icon: 'check-square', tone: detail.evaluationTone, data: null },
          { id: 'evidence', title: '근거 데이터', subtitle: detail.proofSubtitle, icon: 'calendar', tone: 'teal', data: null },
        ],
      },
    ],
  })
}

function missionDetailById(missionId: string) {
  if (missionId === 'mission-fixed-cost') {
    return {
      title: '고정 지출 5% 줄이기',
      statusLabel: '진행 중',
      evaluationStatus: 'IN_PROGRESS',
      progress: 45,
      progressValue: '45%',
      progressCaption: '+180P',
      reason: '오늘 또는 이번 주 행동 데이터로 상태를 판정할 수 있어요.',
      completionRule: '반복 결제 금액이 지난달 대비 5% 이상 감소',
      completionHint: '구독 해지 또는 자동결제 조정 확인',
      evaluationWindow: '이번 달',
      evaluationHint: '월말 정산 기준',
      evaluationText: '진행 중',
      evaluationCaption: '이번 달 자동결제 점검을 이어가고 있어요',
      evaluationTone: 'teal',
      evidenceNote: '반복 결제 데이터가 충분히 쌓여야 이번 달 고정비 절감 여부를 안전하게 판정할 수 있어요.',
      proofSubtitle: '자동결제와 구독 점검 행동만 요약하고, 개별 거래처명은 노출하지 않습니다.',
      recordPath: '/records/2026-06-12',
      proofItems: [
        { id: 'proof-fixed-1', title: '최근 3개월 자동결제 항목 점검 필요', subtitle: '사용 빈도가 낮은 구독부터 확인해요.', value: '대기', caption: '데이터 부족', icon: 'check-square', tone: 'muted', detailPath: '/records/2026-06-12', data: null },
        { id: 'proof-fixed-2', title: '이번 달 반복 결제 비교 준비 중', subtitle: '전월 대비 절감액을 계산할 데이터가 더 필요해요.', value: '준비 중', caption: '월말 판정', icon: 'saving', tone: 'warning', detailPath: '/records/2026-06-12', data: null },
      ] satisfies AppItem[],
    }
  }

  if (missionId === 'mission-food') {
    return {
      title: '내일 식비 10,000원 이하 사용하기',
      statusLabel: '완료',
      evaluationStatus: 'COMPLETED',
      progress: 100,
      progressValue: '78%',
      progressCaption: '+120P',
      reason: '비교와 시뮬레이션 결과에서 만든 미션입니다.',
      completionRule: '하루 식비 10,000원 이하 유지',
      completionHint: '식비 카테고리 합산 기준',
      evaluationWindow: '내일 하루',
      evaluationHint: '00:00 ~ 23:59',
      evaluationText: '성공',
      evaluationCaption: '식비 예산 안에서 완료했어요',
      evaluationTone: 'teal',
      evidenceNote: '카페 대신 물이나 사무실 커피를 선택한 행동도 함께 참고해 실천 흐름을 봅니다.',
      proofSubtitle: '식비 카테고리 기록과 절약 행동이 함께 미션 성공 근거가 됩니다.',
      recordPath: '/records/2026-06-12',
      proofItems: [
        { id: 'proof-food-1', title: '점심 메뉴를 미리 정했어요', subtitle: '예상 지출 6,000원', value: '성공', caption: '식비 계획', icon: 'check-square', tone: 'teal', detailPath: '/records/2026-06-12', data: null },
        { id: 'proof-food-2', title: '카페 대신 물을 선택했어요', subtitle: '예상 절약 4,500원', value: '절약', caption: '대체 행동', icon: 'saving', tone: 'teal', detailPath: '/records/2026-06-12', data: null },
      ] satisfies AppItem[],
    }
  }

  if (missionId === 'mission-record') {
    return {
      title: '하루 지출 기록하기',
      statusLabel: '완료',
      evaluationStatus: 'COMPLETED',
      progress: 100,
      progressValue: '100%',
      progressCaption: '기록 완료',
      reason: '오늘 지출 기록을 남겨 미션이 성공 처리됐어요.',
      completionRule: '하루 지출 1회 이상 기록',
      completionHint: '카테고리 기준으로 기록되면 성공',
      evaluationWindow: '오늘 하루',
      evaluationHint: '00:00 ~ 23:59',
      evaluationText: '성공',
      evaluationCaption: '오늘 1회 기록 완료',
      evaluationTone: 'teal',
      evidenceNote: '성공 이벤트는 포인트와 기록 화면에만 남고, 추가됨 상태는 별도로 남기지 않아요.',
      proofSubtitle: '오늘 남긴 기록이 바로 미션 성공 근거가 됩니다.',
      recordPath: '/records/2026-06-12',
      proofItems: [
        { id: 'proof-record-1', title: '생활비 기록 1건 저장', subtitle: '카테고리 기준 기록 완료', value: '오늘 1회', caption: '09:12', icon: 'check-square', tone: 'teal', detailPath: '/records/2026-06-12', data: null },
        { id: 'proof-record-2', title: '포인트 적립 예정', subtitle: '행동 검증 후 자동 적립', value: '+30P', caption: '성공 반영', icon: 'spark', tone: 'teal', detailPath: '/records/2026-06-12', data: null },
      ] satisfies AppItem[],
    }
  }

  if (missionId === 'mission-water') {
    return {
      title: '커피 대신 물 마시기',
      statusLabel: '진행 중',
      evaluationStatus: 'IN_PROGRESS',
      progress: 40,
      progressValue: '40%',
      progressCaption: '2/5 달성',
      reason: '카페 지출을 줄이는 행동이 쌓이면 자동으로 판정돼요.',
      completionRule: '카페/간식 지출 5회 중 3회 줄이기',
      completionHint: '기준 주간 대비 소비 빈도 감소',
      evaluationWindow: '이번 주',
      evaluationHint: '월요일 ~ 일요일',
      evaluationText: '진행 중',
      evaluationCaption: '3회 더 확인 필요',
      evaluationTone: 'teal',
      evidenceNote: '카페 결제 빈도와 대체 행동 기록을 함께 봐서 일시적인 절약인지 아닌지 구분합니다.',
      proofSubtitle: '개별 매장명 대신 행동 변화만 요약해 보여줍니다.',
      recordPath: '/records/2026-06-12',
      proofItems: [
        { id: 'proof-water-1', title: '카페 결제 1회 감소 확인', subtitle: '지난주 같은 요일 대비 -1회', value: '감소', caption: '주간 비교', icon: 'saving', tone: 'teal', detailPath: '/records/2026-06-12', data: null },
        { id: 'proof-water-2', title: '생활 기록 2건 누적', subtitle: '대체 소비 행동 추적 중', value: '2건', caption: '오늘 기준', icon: 'check-square', tone: 'teal', detailPath: '/records/2026-06-12', data: null },
      ] satisfies AppItem[],
    }
  }

  if (missionId === 'mission-auto-transfer-small' || missionId === 'tmpl-emergency') {
    return {
      title: '이번 달 비상금 자동이체 10만 원 설정하기',
      statusLabel: '데이터가 더 필요',
      evaluationStatus: 'DATA_NEEDED',
      progress: 8,
      progressValue: '0%',
      progressCaption: '새 행동 데이터 대기',
      reason: '미션 추가 이후 새 행동 데이터가 아직 없어요.',
      completionRule: '미션 추가 이후 저축 거래 합계 10만 원 이상',
      completionHint: '과거 거래는 판정에 포함하지 않음',
      evaluationWindow: '미션 추가 이후 이번 달',
      evaluationHint: '새로 발생한 저축 행동만 반영',
      evaluationText: '데이터가 더 필요',
      evaluationCaption: '새 저축 거래가 필요해요',
      evaluationTone: 'danger',
      evidenceNote: '과거 저축 기록으로 즉시 성공 처리하지 않고, 미션 추가 뒤 새로 들어온 행동만 근거로 씁니다.',
      proofSubtitle: '아직 새 근거가 없어 첫 행동 데이터를 기다리는 상태예요.',
      recordPath: '/records/2026-06-12',
      proofItems: [
        { id: 'proof-emergency-1', title: '미션 추가 완료', subtitle: '자동이체 설정 또는 새 저축 거래를 기다리는 중', value: '대기', caption: '방금 추가', icon: 'spark', tone: 'warning', detailPath: '/records/2026-06-12', data: null },
        { id: 'proof-emergency-2', title: '새 행동 데이터 없음', subtitle: '미션 추가 이전 거래는 제외', value: '0건', caption: '판정 보류', icon: 'check-square', tone: 'muted', detailPath: '/records/2026-06-12', data: null },
      ] satisfies AppItem[],
    }
  }

  if (missionId === 'mission-saving') {
    return {
      title: '저축하기 습관 만들기',
      statusLabel: '완료',
      evaluationStatus: 'COMPLETED',
      progress: 66,
      progressValue: '2 / 3',
      progressCaption: '+200P',
      reason: '오늘 성공하면 연속 기록이 완성돼요.',
      completionRule: '3일 연속 저축 성공',
      completionHint: '저축 카테고리 거래 기준',
      evaluationWindow: '최근 3일',
      evaluationHint: '연속성 확인',
      evaluationText: '성공',
      evaluationCaption: '3일 연속 저축 완료',
      evaluationTone: 'teal',
      evidenceNote: '연속 저축은 하루 건너뛰면 다시 계산되기 때문에 최근 흐름을 함께 보여줍니다.',
      proofSubtitle: '저축 거래 연속성이 미션 성공 근거로 기록됩니다.',
      recordPath: '/records/2026-06-12',
      proofItems: [
        { id: 'proof-saving-1', title: '비상금 자동이체 확인', subtitle: '최근 3일 중 2일 저축 성공', value: '2 / 3', caption: '연속 저축', icon: 'saving', tone: 'teal', detailPath: '/records/2026-06-12', data: null },
        { id: 'proof-saving-2', title: '오늘 저축까지 반영 완료', subtitle: '연속 실천 기록이 완성됐어요.', value: '완료', caption: '성공 반영', icon: 'check-square', tone: 'teal', detailPath: '/records/2026-06-12', data: null },
      ] satisfies AppItem[],
    }
  }

  if (missionId === 'mission-cafe-limit-weekly') {
    return {
      title: '이번 주 카페 2회 이하 이용하기',
      statusLabel: '진행 중',
      evaluationStatus: 'IN_PROGRESS',
      progress: 50,
      progressValue: '1 / 2',
      progressCaption: '+100P',
      reason: '카페 결제를 줄이고 남은 금액을 비상금으로 옮기는 소비 루틴입니다.',
      completionRule: '이번 주 카페 결제 2회 이하 유지',
      completionHint: '주간 카페 카테고리 거래 수 기준',
      evaluationWindow: '이번 주',
      evaluationHint: '월요일 ~ 일요일',
      evaluationText: '진행 중',
      evaluationCaption: '1회만 더 이용 가능해요',
      evaluationTone: 'teal',
      evidenceNote: '카페 결제 횟수만 세고, 금액 자체보다 반복 빈도를 먼저 봅니다.',
      proofSubtitle: '카페 이용 횟수가 주간 미션의 핵심 근거입니다.',
      recordPath: '/records/2026-06-12',
      proofItems: [
        { id: 'proof-cafe-1', title: '이번 주 카페 결제 1회', subtitle: '목표 범위 안에서 유지 중', value: '1 / 2', caption: '주간 누적', icon: 'cafe', tone: 'warning', detailPath: '/records/2026-06-12', data: null },
        { id: 'proof-cafe-2', title: '남은 금액은 비상금으로 이동 추천', subtitle: '소비를 저축 행동으로 연결해요.', value: '추천', caption: '다음 행동', icon: 'saving', tone: 'teal', detailPath: '/records/2026-06-12', data: null },
      ] satisfies AppItem[],
    }
  }

  if (missionId === 'mission-invest-check' || missionId === 'mission-invest') {
    return {
      title: '투자 비중 점검하기',
      statusLabel: '진행 중',
      evaluationStatus: 'IN_PROGRESS',
      progress: 15,
      progressValue: '15%',
      progressCaption: '+150P',
      reason: '이번 달 매수 금액과 현금 비중을 함께 확인해요.',
      completionRule: '이번 달 투자 비중과 현금 비중 점검 완료',
      completionHint: '월간 자산 배분 확인 기준',
      evaluationWindow: '이번 달',
      evaluationHint: '월말 정리 전 점검',
      evaluationText: '진행 중',
      evaluationCaption: '투자 비중 점검이 더 필요해요',
      evaluationTone: 'teal',
      evidenceNote: '매수 금액과 현금성 자산 비중을 함께 보면서 과한 쏠림이 없는지 확인합니다.',
      proofSubtitle: '이번 달 투자/현금 비중 점검 기록이 미션 근거로 남아요.',
      recordPath: '/records/2026-06-12',
      proofItems: [
        { id: 'proof-invest-1', title: '이번 달 매수 금액 확인', subtitle: '투자 자산 흐름을 점검 중이에요.', value: '진행 중', caption: '월간 확인', icon: 'stocks', tone: 'teal', detailPath: '/records/2026-06-12', data: null },
        { id: 'proof-invest-2', title: '현금 비중 함께 확인', subtitle: '비상금과 투자금 비중을 같이 봐요.', value: '15%', caption: '현재 기준', icon: 'saving', tone: 'teal', detailPath: '/records/2026-06-12', data: null },
      ] satisfies AppItem[],
    }
  }

  if (missionId === 'mission-transport-budget') {
    return {
      title: '교통비 하루 예산 지키기',
      statusLabel: '진행 중',
      evaluationStatus: 'IN_PROGRESS',
      progress: 35,
      progressValue: '35%',
      progressCaption: '+120P',
      reason: '이동 경로를 미리 정해 택시와 즉흥 이동 지출을 줄입니다.',
      completionRule: '하루 교통비 예산 안에서 마무리',
      completionHint: '대중교통/택시 카테고리 합산 기준',
      evaluationWindow: '오늘 하루',
      evaluationHint: '00:00 ~ 23:59',
      evaluationText: '진행 중',
      evaluationCaption: '이동 지출 추적 중',
      evaluationTone: 'teal',
      evidenceNote: '즉흥 이동과 택시 이용을 줄이는 패턴을 보기 위해 교통비 카테고리만 따로 집계합니다.',
      proofSubtitle: '교통비 카테고리 기록이 이 미션의 핵심 근거입니다.',
      recordPath: '/records/2026-06-12',
      proofItems: [
        { id: 'proof-transport-1', title: '오늘 교통비 사용 추적 중', subtitle: '대중교통 중심 이동 유지', value: '진행 중', caption: '실시간 반영', icon: 'transport', tone: 'teal', detailPath: '/records/2026-06-12', data: null },
      ] satisfies AppItem[],
    }
  }

  return {
    title: '고정 지출 5% 줄이기',
    statusLabel: '데이터가 더 필요',
    evaluationStatus: 'DATA_NEEDED',
    progress: 20,
    progressValue: '20%',
    progressCaption: '+180P',
    reason: '구독과 자동결제를 점검해 이번 달 고정비를 낮춰요.',
    completionRule: '반복 결제 금액이 지난달 대비 5% 이상 감소',
    completionHint: '구독 해지 또는 자동결제 조정 확인',
    evaluationWindow: '이번 달',
    evaluationHint: '월말 정산 기준',
    evaluationText: '데이터가 더 필요',
    evaluationCaption: '반복 결제 데이터가 최소 2개월치 필요해요',
    evaluationTone: 'danger',
    evidenceNote: '반복 결제 데이터가 충분히 쌓여야 이번 달 고정비 절감 여부를 안전하게 판정할 수 있어요.',
    proofSubtitle: '자동결제와 구독 점검 행동만 요약하고, 개별 거래처명은 노출하지 않습니다.',
    recordPath: '/records/2026-06-12',
    proofItems: [
      { id: 'proof-fixed-1', title: '최근 3개월 자동결제 항목 점검 필요', subtitle: '사용 빈도가 낮은 구독부터 확인해요.', value: '대기', caption: '데이터 부족', icon: 'check-square', tone: 'muted', detailPath: '/records/2026-06-12', data: null },
      { id: 'proof-fixed-2', title: '이번 달 반복 결제 비교 준비 중', subtitle: '전월 대비 절감액을 계산할 데이터가 더 필요해요.', value: '준비 중', caption: '월말 판정', icon: 'saving', tone: 'warning', detailPath: '/records/2026-06-12', data: null },
    ] satisfies AppItem[],
  }
}

function recordsScreen(): AppScreenResponse {
  const calendarItems: AppItem[] = Array.from({ length: 30 }, (_, index) => {
    const day = index + 1
    const tone = day % 7 === 0 ? 'over' : day <= 12 ? 'success' : 'empty'
    return {
      id: `record-day-${day}`,
      title: String(day),
      value: day <= 12 ? `${(day * 3.2).toFixed(0)}천원` : null,
      caption: null,
      icon: null,
      tone,
      detailPath: `/records/2026-06-${String(day).padStart(2, '0')}`,
      data: null,
    }
  })
  const sections: AppSection[] = [
    { id: 'calendar', kind: 'calendar', title: '2026년 6월', items: calendarItems },
    {
      id: 'month-budget',
      kind: 'budget',
      title: '이번 달 예산 안정도',
      metrics: [
        { label: '이번 달 예산', value: '960,000원' },
        { label: '사용 금액', value: '612,000원' },
        { label: '안정도', value: '82%', progress: 82 },
      ],
      data: { progress: 82 },
    },
    {
      id: 'point-ledger',
      kind: 'list',
      title: '포인트 내역',
      items: [
        { id: 'point-1', title: '미션 완료 보상', subtitle: '커피 대신 물 마시기', value: '+50P', caption: '06-11', icon: 'saving', tone: 'teal', detailPath: null, data: null },
        { id: 'point-2', title: '기록 완료 보상', subtitle: '하루 지출 기록하기', value: '+30P', caption: '06-10', icon: 'check-square', tone: 'teal', detailPath: null, data: null },
      ],
    },
  ]
  return screen({ screenId: 'records:2026-06', title: '기록', tab: 'records', sections })
}

function recordDetailScreen(date: string): AppScreenResponse {
  const sections: AppSection[] = [
    {
      id: 'day-budget',
      kind: 'budget',
      title: `${date} 예산`,
      metrics: [
        { label: '오늘 예산', value: '32,000원' },
        { label: '사용 금액', value: '19,600원' },
        { label: '남은 예산', value: '12,400원', progress: 61 },
      ],
      data: { progress: 61 },
    },
    {
      id: 'day-spending',
      kind: 'spendingGrid',
      title: '지출 기록',
      items: [
        { id: 'expense-1', title: '점심', value: '-9,000원', caption: '47%', icon: 'spend', tone: 'warning', detailPath: null, data: null },
        { id: 'expense-2', title: '카페', value: '-4,600원', caption: '24%', icon: 'more', tone: 'teal', detailPath: null, data: null },
        { id: 'expense-3', title: '저녁', value: '-6,000원', caption: '29%', icon: 'spend', tone: 'warning', detailPath: null, data: null },
      ],
    },
    {
      id: 'mission-log',
      kind: 'list',
      title: '미션 기록',
      items: [
        { id: 'mission-log-1', title: '점심 지출 기록 완료', subtitle: '오늘의 미션', value: null, caption: '+20P', icon: 'check-square', tone: 'teal', detailPath: null, data: null },
      ],
    },
  ]
  return screen({ screenId: `records:date:${date}`, title: date, tab: 'records', sections, meta: { date } })
}

function profileScreen(): AppScreenResponse {
  const sections: AppSection[] = [
    {
      id: 'profile-following-hero',
      kind: 'profileFollowingHero',
      title: '내 팔로워 128명',
      subtitle: '함께 성장하고 있는 금융 생활을 확인해보세요!',
      metrics: [
        { label: '팔로워', value: '128명', caption: '최근 30일' },
      ],
    },
    {
      id: 'signals',
      kind: 'distribution',
      title: '금융 생활 분포',
      items: [
        { id: 'stocks', title: '주식 투자', value: '43%', caption: '55명', icon: 'stocks', tone: 'teal', detailPath: null, data: { progress: 43 } },
        { id: 'saving', title: '적금 가입', value: '78%', caption: '100명', icon: 'saving', tone: 'teal', detailPath: null, data: { progress: 78 } },
        { id: 'fund', title: '펀드 투자', value: '28%', caption: '36명', icon: 'fund', tone: 'teal', detailPath: null, data: { progress: 28 } },
        { id: 'pension', title: '연금 준비', value: '35%', caption: '45명', icon: 'pension', tone: 'teal', detailPath: null, data: { progress: 35 } },
        { id: 'study', title: '재테크 공부', value: '62%', caption: '79명', icon: 'study', tone: 'teal', detailPath: null, data: { progress: 62 } },
      ],
    },
    { id: 'following-top', kind: 'rankList', title: '팔로잉 TOP 5 금융 활동', items: buildActivity(5) },
    {
      id: 'profile-settings',
      kind: 'actionCard',
      title: '공개 범위 확인',
      subtitle: '하민님의 공개 상태와 포인트를 관리해요.',
      metrics: [{ label: '포인트', value: '2,450P', caption: '이번 주 +450P' }],
      actions: [
        { label: '공개 설정 보기', path: '/settings/privacy', method: 'GET', tone: 'secondary' },
        { label: '로그아웃', path: '/login', method: 'POST', tone: 'danger', intent: 'logout' },
      ],
    },
  ]
  return screen({ screenId: 'profile', title: '프로필', tab: 'profile', sections })
}

function profileSectionScreen(section: string): AppScreenResponse {
  if (section === 'privacy') {
    return screen({
      screenId: 'profile:privacy',
      title: '공개 범위',
      tab: 'profile',
      sections: [
        {
          id: 'visible',
          kind: 'chipGroup',
          title: '보이는 정보',
          items: [
            { id: 'age', title: '연령대', tone: 'teal' },
            { id: 'income', title: '소득 구간', tone: 'teal' },
            { id: 'goal', title: '금융 목표', tone: 'teal' },
            { id: 'summary', title: '금융 요약', tone: 'teal' },
          ],
        },
        {
          id: 'hidden',
          kind: 'chipGroup',
          title: '숨겨지는 정보',
          items: [
            { id: 'name', title: '이름', tone: 'muted' },
            { id: 'account', title: '계좌번호', tone: 'muted' },
            { id: 'merchant', title: '거래처', tone: 'muted' },
            { id: 'time', title: '정확한 거래 시간', tone: 'muted' },
          ],
        },
        {
          id: 'profile-settings',
          kind: 'actionCard',
          title: '계정',
          actions: [{ label: '로그아웃', path: '/login', method: 'POST', tone: 'danger', intent: 'logout' }],
        },
      ],
    })
  }
  const relation = section === 'followers' ? 'followers' : 'following'
  if (section === 'activities') {
    return screen({
      screenId: 'profile:activities',
      title: '금융 활동 TOP',
      tab: 'profile',
      sections: [
        {
          id: 'activity',
          kind: 'rankList',
          title: '팔로잉 TOP 5 금융 활동',
          items: buildActivity(5),
        },
      ],
    })
  }
  return screen({
    screenId: `profile:section:${section}`,
    title: relation === 'followers' ? '팔로워 금융 현황' : '팔로잉',
    tab: 'profile',
    sections: [
      {
        id: `relation-${relation}`,
        kind: 'relationshipList',
        title: relation === 'followers' ? '함께 성장 중인 팔로워' : '내가 보고 있는 금융 루틴',
        data: { relation },
        metrics: [{ label: relation === 'followers' ? '팔로워' : '팔로잉', value: `${relation === 'followers' ? 128 : 3}명` }],
        items: buildPeople(relation === 'followers' ? 5 : 3, relation),
      },
    ],
  })
}

function birthdaysScreen(): AppScreenResponse {
  return screen({
    screenId: 'birthdays',
    title: '생일펀드',
    tab: 'home',
    sections: [
      {
        id: 'upcoming',
        kind: 'birthday',
        title: '다가오는 생일펀드',
        subtitle: '친구 지우의 생일이 3일 남았어요.',
        metrics: [{ label: '모금 현황', value: '62%', progress: 62 }],
        detailPath: '/birthdays/birthday-jiwoo',
        actions: [{ label: '참여하기', path: '/birthday-funds/fund-001/contribute', method: 'GET', tone: 'primary' }],
      },
    ],
  })
}

function birthdayFlowScreen(birthdayId: string): AppScreenResponse {
  return screen({
    screenId: `birthday:${birthdayId}`,
    title: '생일펀드',
    tab: 'home',
    sections: [
      {
        id: 'event',
        kind: 'birthday',
        title: '지우의 생일펀드',
        subtitle: '친구들과 함께 축하 펀드를 채워보세요.',
        metrics: [
          { label: '모금 현황', value: '62%', progress: 62 },
          { label: '참여 인원', value: '8명' },
        ],
        data: { collectedAmount: 62000, goalAmount: 100000, participants: 8, totalFriends: 15 },
        items: buildParticipants(5),
        actions: [{ label: '참여하기', path: '/birthday-funds/fund-001/contribute', method: 'GET', tone: 'primary' }],
      },
    ],
  })
}

function birthdayCompleteScreen(fundId: string): AppScreenResponse {
  return screen({
    screenId: `birthday-funds:${fundId}:complete`,
    title: '참여 완료',
    tab: 'home',
    sections: [
      {
        id: 'complete',
        kind: 'coach',
        title: '축하 메시지가 전달됐어요',
        subtitle: '참여해주셔서 감사해요!',
        actions: [{ label: '홈으로', path: '/home', method: 'GET', tone: 'primary' }],
      },
    ],
  })
}

function birthdayOpenScreen(): AppScreenResponse {
  return screen({
    screenId: 'birthday-funds:me:open',
    title: '내 생일펀드',
    tab: 'home',
    sections: [
      {
        id: 'open',
        kind: 'birthday',
        title: '내 생일펀드 오픈하기',
        subtitle: '친구들에게 공개하고 축하를 받아보세요.',
        actions: [{ label: '오픈하기', path: '/birthday-funds/me/open', method: 'POST', tone: 'primary' }],
      },
    ],
  })
}

function birthdayShareScreen(): AppScreenResponse {
  return screen({
    screenId: 'birthday-funds:me:share',
    title: '공유하기',
    tab: 'home',
    sections: [
      {
        id: 'share',
        kind: 'birthday',
        title: '친구들에게 공유하기',
        subtitle: '링크를 공유하면 펀드 참여를 받을 수 있어요.',
        actions: [{ label: '공유하기', path: '/birthday-funds/me/share', method: 'POST', tone: 'primary' }],
      },
    ],
  })
}

function birthdayStatusScreen(): AppScreenResponse {
  return screen({
    screenId: 'birthday-funds:me:status',
    title: '내 생일펀드 현황',
    tab: 'home',
    sections: [
      {
        id: 'status',
        kind: 'birthday',
        title: '내 생일펀드 현황',
        subtitle: '현재까지 모인 금액과 참여자를 확인해요.',
        metrics: [
          { label: '모금 현황', value: '45%', progress: 45 },
          { label: '참여 인원', value: '5명' },
        ],
        data: { collectedAmount: 45000, goalAmount: 100000, participants: 5, totalFriends: 15 },
        items: buildParticipants(5),
      },
    ],
  })
}

export const mockApi = {
  health: () => wait({ status: 'ok (dummy)' }),
  signup: (_email: string, _password: string, displayName: string) =>
    wait(authResponse({ ...mockUser, displayName: displayName || mockUser.displayName, onboardingCompleted: false })),
  login: (_email: string, _password: string) => wait(authResponse()),
  refresh: () => wait(authResponse()),
  logout: () => wait({ status: 'ok' }),
  me: () => wait(mockUser),
  completeOnboarding: (_body: ProductOnboardingRequest) => wait({ ...mockUser, onboardingCompleted: true }),
  getAppHome: () => wait(homeScreen()),
  getAppHomeDetail: (detail: string) => wait(homeDetailScreen(detail)),
  getAppCompare: () => wait(compareScreen()),
  getAppCompareFilter: () => wait(compareFilterScreen()),
  searchAppCompareFilter: (body: AppCompareSearchRequest) => wait(compareFilterScreen(body)),
  createAppCompareGroup: (_body: AppCompareSearchRequest): Promise<AppActionResultResponse> =>
    wait({ status: 'CREATED', title: '비교 그룹 생성 완료', message: '1,246명의 공개 금융 데이터 평균과 비교합니다.', nextPath: '/compare/results/cmp-001', data: { comparisonId: 'cmp-001', memberCount: 1246, reused: false } }),
  getAppCompareGroupPreview: (recommendationId: string) => wait(compareGroupPreviewScreen(recommendationId)),
  getAppCompareResult: (comparisonId = 'cmp-001') => wait(compareResultScreen(comparisonId)),
  getAppComparePersonalFlow: (comparisonId = 'cmp-001') => wait(comparePersonalFlowScreen(comparisonId)),
  getAppCompareMemberDetail: (memberId: string) => wait(compareMemberDetailScreen(memberId)),
  saveAppCompareReport: (comparisonId = 'cmp-001'): Promise<AppActionResultResponse> =>
    wait({ status: 'SAVED', title: '리포트가 저장되었어요!', message: '마이 리포트에서 언제든 다시 확인할 수 있어요.', nextPath: '/profile', data: { comparisonId } }),
  getAppCoachFlow: (comparisonId = 'cmp-001') => wait(compareCoachScreen(comparisonId)),
  getAppMissions: () => wait(missionsScreen()),
  getAppMissionAdd: () => wait(missionAddScreen()),
  getAppMission: (missionId: string) => wait(missionId === 'next-goals' ? missionNextGoalsScreen() : missionDetailScreen(missionId)),
  addAppMissionFromTemplate: (templateId: string): Promise<AppActionResultResponse> =>
    wait({
      status: 'ADDED',
      title: '미션 추가 완료',
      message: '오늘의 미션에 추가됐어요.',
      nextPath:
        templateId === 'MISSION_CAFE_LIMIT_WEEKLY'
          ? '/missions/mission-cafe-limit-weekly'
          : templateId === 'MISSION_TRANSPORT_BUDGET'
            ? '/missions/mission-transport-budget'
            : templateId === 'MISSION_AUTO_TRANSFER_SMALL'
              ? '/missions/mission-auto-transfer-small'
              : templateId === 'tmpl-water'
                ? '/missions/mission-water'
                : templateId === 'tmpl-record'
                  ? '/missions/mission-record'
            : '/missions/mission-auto-transfer-small',
      data: { templateId },
    }),
  getAppRecords: (_month = '2026-06') => wait(recordsScreen()),
  getAppRecordDetail: (date: string) => wait(recordDetailScreen(date)),
  getAppProfile: () => wait(profileScreen()),
  getAppProfileSection: (section: string) => wait(profileSectionScreen(section)),
  getAppBirthdays: () => wait(birthdaysScreen()),
  getAppBirthdayFlow: (birthdayId: string) => wait(birthdayFlowScreen(birthdayId)),
  contributeBirthdayFund: (fundId: string): Promise<AppActionResultResponse> =>
    wait({ status: 'CONTRIBUTED', title: '참여 완료', message: '생일펀드 참여가 완료됐어요.', nextPath: `/birthday-funds/${fundId}/complete`, data: {} }),
  getBirthdayContributionComplete: (fundId: string) => wait(birthdayCompleteScreen(fundId)),
  getMyBirthdayFundOpenScreen: () => wait(birthdayOpenScreen()),
  openMyBirthdayFund: (): Promise<AppActionResultResponse> =>
    wait({ status: 'OPENED', title: '펀드 오픈', message: '내 생일펀드를 오픈했어요.', nextPath: '/birthday-funds/me/share', data: {} }),
  getMyBirthdayFundShareScreen: () => wait(birthdayShareScreen()),
  shareMyBirthdayFund: (): Promise<AppActionResultResponse> =>
    wait({ status: 'SHARED', title: '공유 완료', message: '친구들에게 공유했어요.', nextPath: '/birthday-funds/me/status', data: {} }),
  getMyBirthdayFundStatus: () => wait(birthdayStatusScreen()),
}
