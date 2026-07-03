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
  pointBalance: 857,
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
  const names = ['민지', '도윤', '서연', '지호', '하은', '유준', '채원', '태윤', '수아', '건우']
  const jobs = ['IT/개발', '마케팅', '금융', '디자인', '대학생/취준']
  const areas = ['서울 강남권', '서울 강북권', '경기권', '인천권', '부산권']
  const styles = ['절약형', '저축형', '투자형', '안정 추구형']
  return Array.from({ length: count }, (_, index) => {
    const stockSignal = index % 3 === 0
    const savingSignal = index % 2 === 0
    const pensionSignal = index % 4 === 0
    return {
      id: `compare-profile-${index + 1}`,
      title: names[index % names.length],
      subtitle: jobs[index % jobs.length],
      value: undefined,
      caption: undefined,
      icon: 'profile',
      tone: 'purple',
      detailPath: null,
      data: {
        ageBand: '20대 후반',
        jobCategory: jobs[index % jobs.length],
        incomeBand: '3,000만원 ~ 4,000만원',
        area: areas[index % areas.length],
        moneyStyle: styles[index % styles.length],
        stockSignal,
        savingSignal,
        pensionSignal,
      },
    }
  })
}

function buildPeople(count: number, relation: 'following' | 'followers'): AppItem[] {
  const names = ['민지', '도윤', '서연', '지호', '하은', '유준', '채원', '태윤']
  return Array.from({ length: count }, (_, index) => ({
    id: `${relation}-${index + 1}`,
    title: names[index % names.length],
    subtitle: '공개 금융 루틴 진행 중',
    value: `${(index + 1) * 2}개 공개`,
    caption: null,
    icon: 'profile',
    tone: 'purple',
    detailPath: null,
    data: { publicSignalCount: (index + 1) * 2 },
  }))
}

function buildActivity(count: number): AppItem[] {
  const activities = [
    { title: '적금 자동이체 시작', caption: 'SAVING' },
    { title: '주식 포트폴리오 공개', caption: 'INVESTMENT' },
    { title: '오늘의 미션 완료', caption: 'MISSION' },
    { title: '비상금 목표 달성', caption: 'SAVING' },
    { title: '펀드 투자 시작', caption: 'INVESTMENT' },
  ]
  return Array.from({ length: count }, (_, index) => ({
    id: `activity-${index + 1}`,
    title: activities[index % activities.length].title,
    subtitle: '공개 활동 요약, 금액은 비공개',
    value: null,
    caption: activities[index % activities.length].caption,
    icon: null,
    tone: 'purple',
    detailPath: null,
    data: null,
  }))
}

function buildParticipants(count: number): AppItem[] {
  const names = ['민지', '도윤', '서연', '지호', '하은']
  return Array.from({ length: count }, (_, index) => ({
    id: `participant-${index + 1}`,
    title: names[index % names.length],
    subtitle: '축하해요! 🎉',
    value: null,
    caption: '참여 완료',
    icon: 'profile',
    tone: 'green',
    detailPath: null,
    data: null,
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
      data: { todayReason: '점심 지출을 기록하면 오늘 미션이 완료돼요.', statusLabel: '진행 중', evaluationStatus: 'IN_PROGRESS' },
    },
    {
      id: 'budget-today',
      kind: 'budget',
      title: '오늘의 예산',
      detailPath: '/records',
      metrics: [
        { label: '오늘 예산', value: '32,000원' },
        { label: '사용 금액', value: '19,600원' },
        { label: '남은 예산', value: '12,400원', progress: 61 },
      ],
      data: { progress: 61 },
    },
    {
      id: 'spending-summary',
      kind: 'spendingGrid',
      title: '지출 요약',
      items: [
        { id: 'spend-food', title: '식비', value: '12,000원', caption: '점심/저녁', icon: 'spend', tone: 'warning', detailPath: '/records/2026-06-12' },
        { id: 'spend-cafe', title: '카페', value: '4,600원', caption: '아메리카노 등', icon: 'more', tone: 'purple', detailPath: '/records/2026-06-12' },
        { id: 'spend-transport', title: '교통', value: '3,000원', caption: '버스/지하철', icon: 'spark', tone: 'muted', detailPath: '/records/2026-06-12' },
        { id: 'spend-etc', title: '기타', value: '0원', caption: '기록 없음', icon: 'more', tone: 'muted', detailPath: '/records/2026-06-12' },
      ],
    },
    {
      id: 'asset-status',
      kind: 'asset',
      title: '자산 현황',
      subtitle: '최근 7일 추세',
      detailPath: '/profile',
      metrics: [{ label: '총 자산', value: '8,420,000원' }],
      data: { sparkline: [812, 815, 819, 817, 822, 838, 842] },
    },
    {
      id: 'following-summary',
      kind: 'signalGrid',
      title: '팔로잉 금융 근황',
      subtitle: '친구들의 공개된 금융 활동이에요.',
      metrics: [
        { label: '주식 시작', value: '3명', tone: 'purple' },
        { label: '적금 가입', value: '5명', tone: 'green' },
        { label: '펀드 투자', value: '2명', tone: 'purple' },
        { label: '저축 목표 달성', value: '4명', tone: 'green' },
      ],
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
      title: '나와 비슷한 또래와 비교해보세요',
      subtitle: '조건을 고르거나 추천 그룹으로 바로 비교할 수 있어요.',
      detailPath: '/compare/filter',
    },
    {
      id: 'compare-recommended',
      kind: 'compareGroupRail',
      title: 'AI 추천 비교 그룹',
      subtitle: '내 온보딩 정보를 기반으로 추천된 그룹이에요.',
      detailPath: '/compare/filter',
      items: [
        {
          id: 'rec-1',
          title: '20대 초반 · IT 직군',
          subtitle: '비슷한 소비 패턴',
          value: '42명',
          caption: null,
          icon: 'stocks',
          tone: 'purple',
          detailPath: '/compare/filter',
          data: {
            ageBand: '20대 초반',
            incomeBand: '3,000만원 ~ 4,000만원',
            jobCategory: 'IT/개발',
            moneyStyle: '절약형',
            area: '서울 강남권',
            householdType: '1인가구',
            assetRange: '1,000만원 미만',
          },
        },
        {
          id: 'rec-2',
          title: '사회초년생 저축러',
          subtitle: '적금 중심',
          value: '58명',
          caption: null,
          icon: 'saving',
          tone: 'green',
          detailPath: '/compare/filter',
          data: {
            ageBand: '전체',
            incomeBand: '전체',
            jobCategory: '전체',
            moneyStyle: '저축형',
            area: '전체',
            householdType: '전체',
            assetRange: '전체',
          },
        },
      ],
    },
    {
      id: 'compare-saved',
      kind: 'savedCompareGroups',
      title: '저장된 비교',
      subtitle: '최근에 비교했던 그룹이에요.',
      detailPath: '/compare/filter',
      items: [
        { id: 'saved-1', title: '수도권 20대 비교', subtitle: '3일 전', value: '42명', caption: null, icon: 'profile', tone: 'purple', detailPath: '/compare/results/cmp-001' },
      ],
    },
  ]
  return screen({ screenId: 'compare', title: '비교', tab: 'compare', sections })
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
  const resultCount = Math.max(0, 42 - nonDefault * 8)
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

function compareResultScreen(comparisonId: string): AppScreenResponse {
  const sections: AppSection[] = [
    {
      id: 'score-summary',
      kind: 'scoreGrid',
      title: '금융 점수 비교',
      metrics: [
        { label: '내 점수', value: '78점', tone: 'purple' },
        { label: '그룹 평균', value: '71점', tone: 'muted' },
      ],
    },
    {
      id: 'compare-bars',
      kind: 'compareBars',
      title: '항목별 비교',
      items: [
        { id: 'bar-saving', title: '저축률', subtitle: '나 32% · 그룹 평균 25%', value: '+7%p', caption: null, icon: 'saving', tone: 'green', detailPath: null, data: null },
        { id: 'bar-spend', title: '소비 비중', subtitle: '나 48% · 그룹 평균 55%', value: '-7%p', caption: null, icon: 'spend', tone: 'purple', detailPath: null, data: null },
      ],
    },
    {
      id: 'compare-members',
      kind: 'compareGroupMembers',
      title: '그룹 구성원',
      items: buildCompareProfiles(12),
      data: { pageSize: 5, initialVisible: 5 },
    },
  ]
  return screen({ screenId: `compare:result:${comparisonId}`, title: '비교 결과', tab: 'compare', sections, meta: { memberCount: 42 } })
}

function compareCoachScreen(comparisonId: string): AppScreenResponse {
  return screen({
    screenId: `compare:coach:${comparisonId}`,
    title: 'AI 코치',
    tab: 'compare',
    sections: [
      {
        id: 'coach-summary',
        kind: 'coach',
        title: 'AI 코치 해석',
        subtitle: '저축률이 그룹 평균보다 높아요! 이 흐름을 유지해보세요.',
        metrics: [{ label: '코칭 포인트', value: '저축 루틴 유지', caption: '다음 3일 동안 이어가면 배지를 받아요', progress: 70 }],
        actions: [{ label: '홈으로', path: '/home', method: 'GET', tone: 'primary' }],
      },
    ],
  })
}

function missionsScreen(): AppScreenResponse {
  const sections: AppSection[] = [
    {
      id: 'mission-today',
      kind: 'missionHero',
      title: '점심 지출 3만원 이하로 기록하기',
      subtitle: '진행 중',
      detailPath: '/missions/mission-lunch',
      metrics: [{ label: '진행률', value: '66%', progress: 66, caption: '2/3 완료' }],
      data: { todayReason: '점심 지출을 기록하면 오늘 미션이 완료돼요.', statusLabel: '진행 중', evaluationStatus: 'IN_PROGRESS' },
      actions: [{ label: '미션 추가', path: '/missions/add', method: 'GET', tone: 'secondary' }],
    },
    {
      id: 'active',
      kind: 'list',
      title: '진행 중',
      items: [
        { id: 'mission-water', title: '커피 대신 물 마시기', subtitle: '카페 지출 줄이기', value: null, caption: '+50P', icon: 'saving', tone: 'green', detailPath: '/missions/mission-water', data: null },
      ],
    },
    {
      id: 'completed',
      kind: 'list',
      title: '완료',
      items: [
        { id: 'mission-record', title: '하루 지출 기록하기', subtitle: '기록 습관 만들기', value: null, caption: '+30P', icon: 'check-square', tone: 'purple', detailPath: '/missions/mission-record', data: null },
      ],
    },
  ]
  return screen({ screenId: 'missions', title: '미션', tab: 'mission', sections })
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
        title: '추천 미션 추가',
        items: [
          { id: 'tmpl-1', title: '커피 대신 물 마시기', subtitle: '카페 지출 줄이기', value: null, caption: '+50P', icon: 'saving', tone: 'green', detailPath: null, data: { templateId: 'tmpl-water' } },
          { id: 'tmpl-2', title: '하루 지출 기록하기', subtitle: '기록 습관 만들기', value: null, caption: '+30P', icon: 'check-square', tone: 'purple', detailPath: null, data: { templateId: 'tmpl-record' } },
          { id: 'tmpl-3', title: '비상금 5만원 모으기', subtitle: '저축 루틴 시작', value: null, caption: '+80P', icon: 'saving', tone: 'green', detailPath: null, data: { templateId: 'tmpl-emergency' } },
        ],
      },
    ],
  })
}

function missionDetailScreen(missionId: string): AppScreenResponse {
  return screen({
    screenId: `missions:detail:${missionId}`,
    title: '미션 상세',
    tab: 'mission',
    sections: [
      {
        id: 'mission-detail',
        kind: 'missionHero',
        title: '점심 지출 3만원 이하로 기록하기',
        subtitle: '진행 중',
        metrics: [{ label: '진행률', value: '66%', progress: 66, caption: '2/3 완료' }],
        data: { todayReason: '점심 지출을 기록하면 오늘 미션이 완료돼요.', statusLabel: '진행 중', evaluationStatus: 'IN_PROGRESS' },
      },
    ],
  })
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
        { id: 'point-1', title: '미션 완료 보상', subtitle: '커피 대신 물 마시기', value: '+50P', caption: '06-11', icon: 'saving', tone: 'green', detailPath: null, data: null },
        { id: 'point-2', title: '기록 완료 보상', subtitle: '하루 지출 기록하기', value: '+30P', caption: '06-10', icon: 'check-square', tone: 'purple', detailPath: null, data: null },
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
        { id: 'expense-2', title: '카페', value: '-4,600원', caption: '24%', icon: 'more', tone: 'purple', detailPath: null, data: null },
        { id: 'expense-3', title: '저녁', value: '-6,000원', caption: '29%', icon: 'spend', tone: 'warning', detailPath: null, data: null },
      ],
    },
    {
      id: 'mission-log',
      kind: 'list',
      title: '미션 기록',
      items: [
        { id: 'mission-log-1', title: '점심 지출 기록 완료', subtitle: '오늘의 미션', value: null, caption: '+20P', icon: 'check-square', tone: 'purple', detailPath: null, data: null },
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
      title: '공개 상태',
      metrics: [
        { label: '팔로잉', value: '12명' },
        { label: '팔로워', value: '9명' },
      ],
    },
    {
      id: 'profile-tabs',
      kind: 'profileSegmented',
      title: '탭',
      data: { active: 'following' },
      items: [
        { id: 'following-tab', title: '팔로잉', subtitle: '12', value: null, caption: null, icon: null, tone: null, detailPath: '/profile/following', data: null },
        { id: 'followers-tab', title: '팔로워', subtitle: '9', value: null, caption: null, icon: null, tone: null, detailPath: '/profile/followers', data: null },
      ],
    },
    {
      id: 'following-list',
      kind: 'relationshipList',
      title: '팔로잉',
      subtitle: '내가 팔로우하는 친구들의 공개 금융 루틴이에요.',
      data: { relation: 'following' },
      metrics: [{ label: '팔로잉', value: '12명' }],
      items: buildPeople(5, 'following'),
    },
    {
      id: 'signals',
      kind: 'distribution',
      title: '친구들의 금융 신호 분포',
      items: [
        { id: 'signal-stock', title: '주식', value: '38%', caption: null, icon: 'stocks', tone: 'purple', detailPath: null, data: { progress: 38 } },
        { id: 'signal-saving', title: '적금', value: '54%', caption: null, icon: 'saving', tone: 'green', detailPath: null, data: { progress: 54 } },
        { id: 'signal-pension', title: '연금', value: '21%', caption: null, icon: 'pension', tone: 'purple', detailPath: null, data: { progress: 21 } },
      ],
    },
    { id: 'following-top', kind: 'rankList', title: 'TOP 5 활동', items: buildActivity(5) },
    {
      id: 'profile-settings',
      kind: 'actionCard',
      title: '계정',
      metrics: [{ label: '포인트', value: '857P' }],
      actions: [
        { label: '공개 범위 설정', path: '/settings/privacy', method: 'GET', tone: 'secondary' },
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
      title: '내 공개 상태',
      tab: 'profile',
      sections: [
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
  return screen({
    screenId: `profile:section:${section}`,
    title: relation === 'followers' ? '팔로워' : '팔로잉',
    tab: 'profile',
    sections: [
      {
        id: `relation-${relation}`,
        kind: 'relationshipList',
        title: relation === 'followers' ? '팔로워' : '팔로잉',
        data: { relation },
        metrics: [{ label: relation === 'followers' ? '팔로워' : '팔로잉', value: `${relation === 'followers' ? 9 : 12}명` }],
        items: buildPeople(relation === 'followers' ? 9 : 12, relation),
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
    wait({ status: 'CREATED', title: '비교 그룹 생성 완료', message: '비교 그룹이 만들어졌어요.', nextPath: '/compare/results/cmp-001', data: {} }),
  getAppCompareResult: (comparisonId = 'cmp-001') => wait(compareResultScreen(comparisonId)),
  getAppCoachFlow: (comparisonId = 'cmp-001') => wait(compareCoachScreen(comparisonId)),
  getAppMissions: () => wait(missionsScreen()),
  getAppMissionAdd: () => wait(missionAddScreen()),
  getAppMission: (missionId: string) => wait(missionDetailScreen(missionId)),
  addAppMissionFromTemplate: (templateId: string): Promise<AppActionResultResponse> =>
    wait({ status: 'ADDED', title: '미션 추가 완료', message: '오늘의 미션에 추가됐어요.', nextPath: '/missions', data: { templateId } }),
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
