import { useCallback, useEffect, useState } from 'react'
import { api } from './api'
import { clearSession, getSession, saveSession } from './session'
import { cleanProductCopy } from './productCopy'
import { describeError } from './errors'
import type { AppAction, AppCompareSearchRequest, AppItem, AppMetric, AppScreenResponse, AppSection } from './types'
import type { Navigate } from './navigation'
import {
  Chevron,
  IconBadge,
  IconButton,
  Legend,
  MiniLineChart,
  ProgressLine,
  StatusBar,
  type IconName,
} from './uiPrimitives'
import { arrayFromData, numberFromData } from './screenData'
import {
  ProfileAccountPanel,
  ProfileActivityList,
  ProfileRelationshipList,
  ProfileRelationshipSummary,
  ProfileSegmentedControl,
  ProfileSignalDeck,
} from './ProfileSections'
import {
  ActionPanel,
  ActivityRow,
  AppSectionCard,
  CompareActionPanel,
  EmptyState,
  FinanceMetricCard,
  RecommendationRow,
  ScreenLead,
  SegmentedControl,
  SectionHeading,
  SignalCard,
} from './AppComponents'
import {
  BigNumber,
  CoachBubble,
  CompareGauge,
  FomoCard,
  Logo,
  MissionCard,
  ParticipationBar,
  PointBadge,
  PointWallet,
  ProfileCard,
  ReportCard,
  type ReportKind,
  type ReportStages,
} from './components'
import { CompareFilterPage } from './CompareFilterPage'
import { profileFactsFromItem } from './profileFacts'

type SectionProps = {
  section: AppSection
  navigate: Navigate
}

type CompareMainTab = 'group' | 'filter' | 'friends'

type InlineScreenState =
  | { status: 'loading' }
  | { status: 'ready'; screen: AppScreenResponse }
  | { status: 'error'; message: string }

export function ScreenRenderer({ screen, navigate }: { screen: AppScreenResponse; navigate: Navigate }) {
  const canGoBack = !['home', 'compare', 'missions', 'records:2026-06', 'profile'].includes(screen.screenId)
  const screenTitle = screen.screenId === 'profile' ? '내 공개 상태' : screen.title
  const sections = profileTrustFirstSections(screen)

  if (screen.screenId === 'home') {
    return <HomeScreen screen={screen} navigate={navigate} />
  }

  if (screen.screenId === 'compare') {
    return <CompareMainScreen screen={screen} navigate={navigate} />
  }

  if (screen.screenId === 'profile') {
    return <ProfileMainScreen screen={screen} navigate={navigate} />
  }

  if (screen.screenId === 'profile:privacy') {
    return <PrivacyTrustCenterScreen screen={screen} navigate={navigate} />
  }

  return (
    <div className={`screen screen-${screen.tab} ${screenClass(screen.screenId)}`}>
      <StatusBar time={screen.statusBarTime} />
      <header className="app-header">
        <div className="header-side">
          {canGoBack ? (
            <IconButton icon="back" label="뒤로" onClick={() => window.history.back()} />
          ) : null}
        </div>
        <h1>{screenTitle}</h1>
        <div className="header-side right">
          <PointBadge balance={getSession().user?.pointBalance ?? 0} />
          <IconButton icon={headerIcon(screen)} label="메뉴" onClick={() => navigate(headerPath(screen))} />
        </div>
      </header>

      <section className="screen-stack">
        {isMonthlyRecordsScreen(screen) ? <RecordsOverviewPanel screen={screen} navigate={navigate} /> : null}
        {sections.map((section) => (
          <SectionRenderer section={section} navigate={navigate} screen={screen} key={section.id} />
        ))}
      </section>
    </div>
  )
}

function profileTrustFirstSections(screen: AppScreenResponse) {
  if (screen.screenId !== 'profile') {
    return screen.sections
  }
  const trustSection = screen.sections.find((section) => section.kind === 'profileFollowingHero')
  if (!trustSection) {
    return screen.sections
  }
  return [
    trustSection,
    ...screen.sections.filter((section) => section !== trustSection),
  ]
}

function HomeScreen({ screen, navigate }: { screen: AppScreenResponse; navigate: Navigate }) {
  const greeting = screen.sections.find((section) => section.kind === 'greeting')
  const fomoSignal = screen.sections.find((section) => section.kind === 'signalGrid')
  const content = screen.sections.filter((section) => section.kind !== 'greeting' && section !== fomoSignal)
  const pointBalance = getSession().user?.pointBalance ?? 0

  return (
    <div className={`screen screen-home screen-home-reference ${screenClass(screen.screenId)}`}>
      <StatusBar time={screen.statusBarTime} />
      <header className="home-top-bar">
        <Logo size={28} />
        <PointWallet balance={pointBalance} onClick={() => navigate('/missions')} />
      </header>
      <header className="home-app-header">
        <div>
          <h1>{greeting?.title ?? '좋은 아침이에요'}</h1>
          {greeting?.subtitle ? <p>{greeting.subtitle}</p> : null}
        </div>
      </header>
      <section className="home-stack">
        {content.map((section) => (
          <HomeSection section={section} navigate={navigate} key={section.id} />
        ))}
        {fomoSignal ? <HomeFomoPanel section={fomoSignal} navigate={navigate} /> : null}
      </section>
    </div>
  )
}

function HomeFomoPanel({ section, navigate }: SectionProps) {
  const participants = numberFromData(section.data, 'participants') ?? 0
  const total = numberFromData(section.data, 'total') ?? 0
  const fomoLabel = stringFromData(section.data, 'fomoLabel')

  return (
    <button className="home-card home-fomo-card" type="button" onClick={() => navigate(section.detailPath ?? '/compare')}>
      <div className="home-fomo-copy">
        <HomeCardHeader section={section} navigate={navigate} />
        {section.subtitle ? <p>{section.subtitle}</p> : null}
        <ParticipationBar label={section.metrics?.[0]?.label ?? '이번 주 미션 완료'} participants={participants} total={total} fomoLabel={fomoLabel} />
      </div>
    </button>
  )
}

function HomeSection({ section, navigate }: SectionProps) {
  if (section.kind === 'missionHero') {
    return <HomeMissionCard section={section} navigate={navigate} />
  }
  if (section.kind === 'budget') {
    return <HomeBudgetCard section={section} navigate={navigate} />
  }
  if (section.kind === 'spendingGrid') {
    return <HomeSpendingCard section={section} navigate={navigate} />
  }
  if (section.kind === 'asset') {
    return <HomeAssetCard section={section} navigate={navigate} />
  }
  if (section.kind === 'actionCard' && section.id === 'birthday-alert') {
    return <HomeBirthdayCard section={section} navigate={navigate} />
  }
  if (section.kind === 'actionCard') {
    return <HomeEmptyCard section={section} navigate={navigate} />
  }
  return <SectionRenderer section={section} navigate={navigate} />
}

function HomeMissionCard({ section, navigate }: SectionProps) {
  const metric = section.metrics?.[0]
  const rewardPoints = numberFromData(section.data, 'rewardPoints') ?? 0
  const status = metric?.progress === 100 ? 'done' : 'in_progress'
  return (
    <button className="home-card home-mission-card" type="button" onClick={() => goDetail(section, navigate)}>
      <div className="home-card-head home-mission-head">
        <span><IconBadge icon="check-square" tone="teal" />오늘의 미션</span>
        <Chevron />
      </div>
      <MissionCard
        title={section.title}
        rewardPoints={rewardPoints}
        status={status}
        progressPercent={metric?.progress ?? 0}
        progressLabel={metric?.caption}
      />
    </button>
  )
}

function HomeBudgetCard({ section, navigate }: SectionProps) {
  const remaining = numberFromData(section.data, 'remaining') ?? 0
  const todayBudget = numberFromData(section.data, 'todayBudget') ?? 0
  const todaySpent = numberFromData(section.data, 'todaySpent') ?? 0
  const progress = numberFromData(section.data, 'progress') ?? 0
  return (
    <article className="home-card home-budget-card">
      <HomeCardHeader section={section} navigate={navigate} />
      <BigNumber value={remaining} unit="원" size="l" caption={`예산 ${todayBudget.toLocaleString('ko-KR')}원 남음`} />
      <ProgressLine value={progress} tone="teal" />
      <span className="home-budget-spent-note">오늘 {todaySpent.toLocaleString('ko-KR')}원 사용</span>
    </article>
  )
}

function HomeSpendingCard({ section, navigate }: SectionProps) {
  const todaySpent = numberFromData(section.data, 'todaySpent') ?? 0
  return (
    <article className="home-card home-spending-card">
      <HomeCardHeader section={section} navigate={navigate} />
      <BigNumber value={todaySpent} unit="원" size="l" />
      <div className="home-spending-grid">
        {section.items?.slice(0, 4).map((item) => (
          <button type="button" onClick={() => item.detailPath && navigate(item.detailPath)} key={item.id}>
            <IconBadge icon={(item.icon ?? 'more') as IconName} tone={item.tone ?? 'warning'} />
            <strong>{item.title}</strong>
            {item.value ? <b>{item.value}</b> : null}
          </button>
        ))}
      </div>
    </article>
  )
}

function HomeAssetCard({ section, navigate }: SectionProps) {
  const sparkline = arrayFromData(section.data, 'sparkline')
  const netWorth = numberFromData(section.data, 'netWorth') ?? 0
  return (
    <article className="home-card home-asset-card">
      <HomeCardHeader section={section} navigate={navigate} />
      <div className="home-asset-layout">
        <BigNumber value={netWorth} unit="원" size="l" caption={section.subtitle} />
        {sparkline.length >= 2 ? <MiniLineChart values={sparkline} /> : <ChartEmptyLabel />}
      </div>
    </article>
  )
}

function HomeBirthdayCard({ section, navigate }: SectionProps) {
  return (
    <article className="home-card home-birthday-card">
      <div className="home-birthday-layout">
        <div className="home-birthday-icon" aria-hidden="true">
          <IconBadge icon="gift" tone="teal" />
        </div>
        <div className="home-birthday-copy">
          <HomeCardHeader section={section} navigate={navigate} />
          {section.subtitle ? <p>{section.subtitle}</p> : null}
        </div>
      </div>
      <div className="home-birthday-metrics">
        {section.metrics?.map((metric) => <MetricView metric={metric} key={metric.label} />)}
      </div>
      {section.metrics?.[0]?.progress ? <ProgressLine value={section.metrics[0].progress ?? 0} tone="teal" /> : null}
      <ActionButtons actions={section.actions} navigate={navigate} />
    </article>
  )
}

function HomeEmptyCard({ section, navigate }: SectionProps) {
  return (
    <article className="home-card home-empty-card">
      <HomeCardHeader section={section} navigate={navigate} />
      {section.subtitle ? <p>{section.subtitle}</p> : null}
      {section.metrics?.[0]?.caption ? <small>{section.metrics[0].caption}</small> : null}
      <ActionButtons actions={section.actions} navigate={navigate} />
    </article>
  )
}

function CompareMainScreen({ screen, navigate }: { screen: AppScreenResponse; navigate: Navigate }) {
  const [activeTab, setActiveTab] = useState<CompareMainTab>('group')
  const recommended = screen.sections.find((section) => section.kind === 'compareGroupRail')
  const saved = screen.sections.find((section) => section.kind === 'savedCompareGroups')
  const rest = screen.sections.filter((section) => ![recommended, saved].includes(section))

  return (
    <div className={`screen screen-compare screen-tab-main screen-compare-main ${screenClass(screen.screenId)}`}>
      <StatusBar time={screen.statusBarTime} />
      <TabMainHeader
        title="나와 비슷한 사람들은 어떻게 관리하고 있을까?"
        subtitle="정확한 금액이 아니라 공개 동의된 집계와 시작한 행동만 비교해요."
        icon="sliders"
        iconLabel="필터"
        onIconClick={() => navigate('/compare/filter')}
      />
      <SegmentedControl
        activeId={activeTab}
        onChange={(id) => setActiveTab(id as CompareMainTab)}
        ariaLabel="비교 방식"
        panelPrefix="compare-main"
        items={[
          { id: 'group', label: '그룹 비교' },
          { id: 'filter', label: '필터 조회' },
          { id: 'friends', label: '친구 비교' },
        ]}
      />
      <section
        className="screen-stack tab-main-stack compare-main-stack"
        role="tabpanel"
        id={`compare-main-panel-${activeTab}`}
        aria-labelledby={`compare-main-tab-${activeTab}`}
      >
        {activeTab === 'group' ? (
          <>
            {recommended ? <CompareGroupRailSection section={recommended} navigate={navigate} /> : null}
            {saved ? <SavedCompareGroupsSection section={saved} navigate={navigate} /> : null}
            {rest.map((section) => <SectionRenderer section={section} navigate={navigate} screen={screen} key={section.id} />)}
          </>
        ) : null}
        {activeTab === 'filter' ? <CompareFilterPage navigate={navigate} embedded /> : null}
        {activeTab === 'friends' ? <CompareFriendsPanel navigate={navigate} /> : null}
      </section>
    </div>
  )
}

function CompareFriendsPanel({ navigate }: { navigate: Navigate }) {
  const loadFriends = useCallback(() => api.getAppProfileSection('following'), [])
  const state = useInlineScreen('profile-following', loadFriends)

  if (state.status !== 'ready') {
    return <InlineTabState state={state} loadingTitle="친구 공개 활동을 불러오는 중이에요" />
  }

  const relationshipList = state.screen.sections.find((section) => section.kind === 'relationshipList')

  return (
    <div className="inline-tab-panel compare-friends-panel">
      {relationshipList ? <ProfileRelationshipList section={relationshipList} navigate={navigate} /> : <EmptyInlineTab title="공개 친구 활동이 아직 없어요" />}
    </div>
  )
}

function ProfileMainScreen({ screen, navigate }: { screen: AppScreenResponse; navigate: Navigate }) {
  const trust = screen.sections.find((section) => section.kind === 'profileFollowingHero')
  const distribution = screen.sections.find((section) => section.kind === 'distribution')
  const activity = screen.sections.find((section) => section.kind === 'rankList')
  const account = screen.sections.find((section) => section.id === 'profile-settings')
  const safeAccount = redactProfileAccountSection(account)
  const rest = screen.sections.filter((section) => ![
    trust,
    distribution,
    activity,
    account,
    screen.sections.find((candidate) => candidate.kind === 'profileSegmented'),
  ].includes(section))

  return (
    <div className={`screen screen-profile screen-tab-main screen-profile-main ${screenClass(screen.screenId)}`}>
      <StatusBar time={screen.statusBarTime} />
      <ProfileHeroPanel trust={trust} account={safeAccount} />
      <ProfileShortcutGrid navigate={navigate} />
      <section className="screen-stack tab-main-stack profile-main-stack">
        {distribution ? <ProfileSignalDeck section={distribution} navigate={navigate} /> : null}
        {activity ? <ProfileActivityList section={activity} navigate={navigate} /> : null}
        {rest.map((section) => <SectionRenderer section={section} navigate={navigate} screen={screen} key={section.id} />)}
      </section>
    </div>
  )
}

function ProfileHeroPanel({ trust, account }: { trust?: AppSection; account?: AppSection }) {
  const name = profileNameFromAccount(account)
  const points = account?.metrics?.[0]?.value ?? '0P'
  const progress = Math.max(12, Math.min(100, Math.round(parseMoney(points) / 20)))

  return (
    <section className="profile-main-hero">
      <div className="profile-main-identity">
        <IconBadge icon="profile" tone="teal" />
        <div>
          <h1>{name}</h1>
          <p>공개 미리보기 안전 · 금융 습관 맞춤 중</p>
          <span>{points}</span>
        </div>
      </div>
      <ProgressLine value={progress} tone="teal" />
      <div className="profile-main-public-note">
        <strong>{trust?.title ?? '친구에게 보이는 내 공개 상태'}</strong>
        <span>정확한 금액, 잔액, 거래처는 숨깁니다.</span>
      </div>
    </section>
  )
}

function ProfileShortcutGrid({ navigate }: { navigate: Navigate }) {
  const shortcuts = [
    { id: 'info', label: '내 정보', icon: 'profile', path: '/settings/privacy' },
    { id: 'report', label: '내 리포트', icon: 'chart', path: '/compare/coach' },
    { id: 'points', label: '포인트', icon: 'spark', path: '/profile/points' },
    { id: 'friends', label: '친구', icon: 'profile', path: '/profile/following' },
  ] as const

  return (
    <nav className="profile-shortcut-grid" aria-label="프로필 바로가기">
      {shortcuts.map((shortcut) => (
        <button type="button" onClick={() => navigate(shortcut.path)} key={shortcut.id}>
          <IconBadge icon={shortcut.icon} tone="teal" />
          <span>{shortcut.label}</span>
        </button>
      ))}
    </nav>
  )
}

function TabMainHeader({
  title,
  subtitle,
  icon,
  iconLabel,
  onIconClick,
}: {
  title: string
  subtitle?: string
  icon: IconName
  iconLabel: string
  onIconClick: () => void
}) {
  return (
    <header className="tab-main-header">
      <div>
        <h1>{title}</h1>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      <IconButton icon={icon} label={iconLabel} onClick={onIconClick} />
    </header>
  )
}

function useInlineScreen(key: string, loadScreen: () => Promise<AppScreenResponse>): InlineScreenState {
  const [state, setState] = useState<InlineScreenState>({ status: 'loading' })

  useEffect(() => {
    let active = true
    setState({ status: 'loading' })
    loadScreen()
      .then((nextScreen) => {
        if (active) {
          setState({ status: 'ready', screen: nextScreen })
        }
      })
      .catch((error: unknown) => {
        if (active) {
          setState({ status: 'error', message: describeError(error) })
        }
      })
    return () => {
      active = false
    }
  }, [key, loadScreen])

  return state
}

function InlineTabState({ state, loadingTitle }: { state: Exclude<InlineScreenState, { status: 'ready' }>; loadingTitle: string }) {
  return state.status === 'loading'
    ? <EmptyInlineTab title={loadingTitle} subtitle="잠시만 기다려주세요." icon="spark" />
    : <EmptyInlineTab title="내용을 불러오지 못했어요" subtitle={state.message} icon="search" />
}

function EmptyInlineTab({ title, subtitle, icon = 'spark' }: { title: string; subtitle?: string; icon?: string }) {
  return (
    <div className="inline-tab-panel">
      <EmptyState title={title} subtitle={subtitle ?? '조건을 바꾸거나 잠시 후 다시 시도해주세요.'} icon={icon} />
    </div>
  )
}

function HomeCardHeader({ section, navigate }: { section: AppSection; navigate: Navigate }) {
  return (
    <div className="home-section-header">
      <h2>{section.title}</h2>
      {section.detailPath ? (
        <button type="button" onClick={() => navigate(section.detailPath ?? '/home')}>
          자세히 보기 <Chevron />
        </button>
      ) : null}
    </div>
  )
}

export function LoadingScreen() {
  return (
    <div className="screen center-screen">
      <StatusBar time="9:41" />
      <div className="loader" />
      <p>화면을 불러오고 있어요</p>
    </div>
  )
}

export function ErrorScreen({ message, navigate }: { message: string; navigate: Navigate }) {
  return (
    <div className="screen center-screen">
      <StatusBar time="9:41" />
      <IconBadge icon="help" tone="danger" />
      <h1>화면을 불러오지 못했어요</h1>
      <p>{message}</p>
      <button className="app-button primary" type="button" onClick={() => navigate('/home')}>홈으로</button>
    </div>
  )
}

export function NotFoundPage({ navigate }: { navigate: Navigate }) {
  return (
    <div className="screen center-screen">
      <StatusBar time="9:41" />
      <IconBadge icon="search" tone="teal" />
      <h1>없는 화면이에요</h1>
      <p>다시 홈에서 시작해볼게요.</p>
      <button className="app-button primary" type="button" onClick={() => navigate('/home')}>홈으로</button>
    </div>
  )
}

function headerIcon(screen: AppScreenResponse): IconName {
  if (screen.tab === 'records') {
    return 'chart'
  }
  if (screen.tab === 'mission') {
    return 'gift'
  }
  if (screen.tab === 'profile') {
    return 'settings'
  }
  if (screen.tab === 'compare') {
    return 'sliders'
  }
  return 'bell'
}

function headerPath(screen: AppScreenResponse): string {
  if (screen.tab === 'records') {
    return '/records/stats'
  }
  if (screen.tab === 'mission') {
    return '/missions/next-goals'
  }
  if (screen.tab === 'profile') {
    return '/settings/privacy'
  }
  if (screen.tab === 'compare') {
    return '/compare/filter'
  }
  return '/birthdays'
}

function SectionRenderer({ section, navigate, screen }: { section: AppSection; navigate: Navigate; screen?: AppScreenResponse }) {
  const isProfileScreen = screen?.tab === 'profile'
  const isRecordsScreen = screen?.tab === 'records'
  const isMissionScreen = screen?.tab === 'mission'

  if (section.kind === 'greeting' || section.kind === 'lead') {
    return <LeadSection section={section} />
  }
  if (section.kind === 'comparePrompt') {
    return <ComparePromptSection section={section} navigate={navigate} />
  }
  if (section.kind === 'friendSignals') {
    return <FriendSignalsSection section={section} navigate={navigate} />
  }
  if (section.kind === 'compareGroupRail') {
    return <CompareGroupRailSection section={section} navigate={navigate} />
  }
  if (section.kind === 'savedCompareGroups') {
    return <SavedCompareGroupsSection section={section} navigate={navigate} />
  }
  if (section.kind === 'compareProfileList') {
    return <CompareProfileListSection section={section} navigate={navigate} />
  }
  if (section.kind === 'compareGroupMembers') {
    return <CompareGroupMembersSection section={section} navigate={navigate} />
  }
  if (section.kind === 'profileSegmented') {
    return <ProfileSegmentedControl section={section} navigate={navigate} />
  }
  if (section.kind === 'profileFollowingHero') {
    return <ProfileRelationshipSummary section={section} navigate={navigate} />
  }
  if (isProfileScreen && section.kind === 'relationshipList') {
    return <ProfileRelationshipList section={section} navigate={navigate} />
  }
  if (isProfileScreen && (section.kind === 'signalGrid' || section.kind === 'distribution')) {
    return <ProfileSignalDeck section={section} navigate={navigate} />
  }
  if (isProfileScreen && (section.kind === 'rankList' || section.id === 'feed')) {
    return <ProfileActivityList section={section} navigate={navigate} />
  }
  if (isProfileScreen && section.kind === 'actionCard' && section.id === 'profile-settings') {
    return <ProfileAccountPanel section={section} navigate={navigate} />
  }
  if (section.kind === 'missionHero') {
    return <MissionHero section={section} navigate={navigate} />
  }
  if (isMissionScreen && section.kind === 'loop') {
    return <MissionLoopSection />
  }
  if (isMissionScreen && section.kind === 'list') {
    return <MissionListSection section={section} navigate={navigate} />
  }
  if (isRecordsScreen && section.kind === 'budget') {
    return <RecordBudgetPanel section={section} navigate={navigate} screen={screen} />
  }
  if (section.kind === 'budget') {
    return <BudgetSection section={section} navigate={navigate} />
  }
  if (screen?.tab === 'compare' && section.kind === 'scoreGrid') {
    return <CompareScoreSummarySection section={section} screen={screen} />
  }
  if (isRecordsScreen && section.kind === 'spendingGrid') {
    return <RecordJournalSection section={section} navigate={navigate} />
  }
  if (section.kind === 'spendingGrid' || section.kind === 'signalGrid' || section.kind === 'scoreGrid') {
    return <GridSection section={section} navigate={navigate} />
  }
  if (section.kind === 'asset') {
    return <AssetSection section={section} navigate={navigate} />
  }
  if (section.kind === 'compareBars' || section.kind === 'distribution') {
    return <CompareBarsSection section={section} navigate={navigate} />
  }
  if (section.kind === 'report') {
    return <ReportSection section={section} navigate={navigate} />
  }
  if (section.kind === 'calendar') {
    return <CalendarSection section={section} navigate={navigate} />
  }
  if (screen?.screenId.startsWith('birthday') && (section.id.includes('participants') || section.id.includes('messages'))) {
    return <BirthdayParticipantsSection section={section} />
  }
  if (section.kind === 'birthday') {
    return <BirthdayEventSection section={section} navigate={navigate} screen={screen} />
  }
  if (screen?.screenId.startsWith('birthday-funds') && section.kind === 'coach') {
    return <BirthdayCompleteSection section={section} navigate={navigate} />
  }
  if (section.kind === 'coach') {
    return <CoachSection section={section} navigate={navigate} />
  }
  if (section.kind === 'points' || section.kind === 'profileHero' || section.kind === 'actionCard') {
    return <MetricCardSection section={section} navigate={navigate} />
  }
  if (section.kind === 'chipGroup') {
    return <ChipSection section={section} />
  }
  if (isRecordsScreen && section.kind === 'list') {
    return <RecordEventListSection section={section} navigate={navigate} />
  }
  return <ListSection section={section} navigate={navigate} />
}

function LeadSection({ section }: { section: AppSection }) {
  return <ScreenLead eyebrow={section.kind === 'greeting' ? '오늘의 금융 루틴' : '비교 리포트'} title={section.title} subtitle={section.subtitle} />
}

function RecordsOverviewPanel({ screen, navigate }: { screen: AppScreenResponse; navigate: Navigate }) {
  const calendar = screen.sections.find((section) => section.kind === 'calendar')
  const budget = screen.sections.find((section) => section.kind === 'budget')
  const calendarItems = (calendar?.items ?? []).filter((item) => Number.isInteger(Number(item.title)) && item.value)
  const successCount = calendarItems.filter((item) => item.tone === 'success' || item.tone === 'selected').length
  const overCount = calendarItems.filter((item) => item.tone === 'over').length
  const recordedCount = calendarItems.length
  const stability = recordedCount > 0 ? Math.round((successCount / recordedCount) * 100) : 0
  const hasBudgetMetric = Boolean(budget?.metrics?.length)
  const nextMission = overCount > 0 ? '예산 초과일을 줄이는 3분 미션' : '성공한 예산 흐름을 유지하는 루틴'

  return (
    <AppSectionCard className="record-overview-panel">
      <SectionHeading
        eyebrow="월간 회고"
        title="이번 달 실천 증거를 먼저 볼게요"
        subtitle="캘린더는 날짜 선택 도구이고, 위 요약은 이번 달 행동이 어디로 흐르는지 보여줍니다."
      />
      <div className="record-overview-list">
        <div className="record-overview-row">
          <IconBadge icon="chart" tone="teal" />
          <div>
            <strong>이번 달 발견한 패턴</strong>
            <span>{recordedCount}일 중 {successCount}일은 예산 안, {overCount}일은 조정이 필요해요.</span>
          </div>
        </div>
        <div className="record-overview-row">
          <IconBadge icon="check-square" tone="teal" />
          <div>
            <strong>다음 미션 후보</strong>
            <span>{nextMission}</span>
          </div>
        </div>
        <div className="record-overview-row">
          <IconBadge icon="saving" tone="teal" />
          <div>
            <strong>예산 안정도 {stability}%</strong>
            <span>{hasBudgetMetric ? '오늘 사용 금액도 예산 안에서 관리 중입니다.' : '실제 지출이 쌓이면 안정도를 더 정확히 볼 수 있어요.'}</span>
          </div>
          <ProgressLine value={stability} tone="teal" />
        </div>
      </div>
      <ActionPanel className="record-overview-actions">
        <button className="app-button primary" type="button" onClick={() => navigate('/missions')}>다음 미션 보기</button>
        <button className="app-button secondary" type="button" onClick={() => navigate('/records/history')}>실천 기록 보기</button>
      </ActionPanel>
    </AppSectionCard>
  )
}

function RecordBudgetPanel({ section, navigate, screen }: { section: AppSection; navigate: Navigate; screen?: AppScreenResponse }) {
  const progress = numberFromData(section.data, 'progress') ?? section.metrics?.find((metric) => typeof metric.progress === 'number')?.progress ?? 0
  const isDateDetail = Boolean(screen?.meta?.date)
  return (
    <AppSectionCard className={`record-evidence-panel ${isDateDetail ? 'record-day-panel' : 'record-month-budget-panel'}`}>
      <SectionHeading
        eyebrow={isDateDetail ? '하루 증거' : '예산 안정도'}
        title={section.title}
        subtitle={section.subtitle ?? (isDateDetail ? '오늘의 예산, 사용 금액, 포인트 근거를 한 줄 흐름으로 봅니다.' : '오늘 예산이 월간 기록에서 어떤 상태인지 확인합니다.')}
        onAction={section.detailPath ? () => navigate(section.detailPath ?? '/records') : undefined}
      />
      <div className="record-budget-strip">
        {section.metrics?.map((metric) => (
          <div className="record-budget-cell" data-tone={metric.tone ?? 'default'} key={metric.label}>
            <span>{cleanCaption(metric.label)}</span>
            <strong>{cleanCaption(metric.value)}</strong>
            {metric.caption ? <small>{cleanCaption(metric.caption)}</small> : null}
          </div>
        ))}
      </div>
      <ProgressLine value={progress} tone="teal" />
      <p className="record-evidence-note">
        {progress <= 100 ? '예산 안에서 끝난 날은 미션 성공 증거로 기록됩니다.' : '초과한 날도 다음 미션 후보를 고르는 근거로 남겨둡니다.'}
      </p>
      <ActionButtons actions={section.actions} navigate={navigate} />
    </AppSectionCard>
  )
}

function RecordJournalSection({ section, navigate }: SectionProps) {
  const items = [...(section.items ?? [])].sort((a, b) => Math.abs(parseMoney(b.value)) - Math.abs(parseMoney(a.value)))
  const total = items.reduce((sum, item) => sum + Math.abs(parseMoney(item.value)), 0)
  return (
    <AppSectionCard className="record-journal-panel">
      <SectionHeading eyebrow="지출 기록" title={section.title} subtitle={section.subtitle ?? '카테고리별 지출을 카드 타일 대신 기록 행으로 정리했어요.'} />
      <BigNumber value={total} unit="원" size="l" caption="카테고리 단위 기록 · 가맹점명은 표시하지 않아요" />
      <div className="record-journal-list">
        {items.map((item) => {
          const amount = Math.abs(parseMoney(item.value))
          const progress = parsePercent(item.caption) ?? (total > 0 ? Math.round((amount / total) * 100) : 0)
          return (
            <button className="record-journal-row" type="button" onClick={() => item.detailPath && navigate(item.detailPath)} key={item.id}>
              <IconBadge icon={item.icon ?? 'spend'} tone={item.tone ?? 'warning'} />
              <div className="record-journal-copy">
                <strong>{cleanCaption(item.title)}</strong>
                <span>{item.value ? cleanCaption(item.value) : '기록 대기'}</span>
                <ProgressLine value={progress} tone="teal" />
              </div>
              <em>{progress}%</em>
            </button>
          )
        })}
      </div>
    </AppSectionCard>
  )
}

function RecordEventListSection({ section, navigate }: SectionProps) {
  const isPoint = section.id.includes('point')
  const eyebrow = isPoint ? '포인트 증거' : section.id.includes('mission') ? '미션 증거' : '기록 내역'
  return (
    <AppSectionCard className={`record-event-panel section-${section.id}`}>
      <SectionHeading
        eyebrow={eyebrow}
        title={section.title}
        subtitle={section.subtitle ?? (isPoint ? '보상 흐름을 날짜별로 확인합니다.' : '오늘 행동이 어떤 미션 근거로 남았는지 확인합니다.')}
      />
      <div className="record-event-list activity-list">
        {section.items?.map((item, index) => (
          <ActivityRow
            item={{ ...item, title: cleanCaption(item.title), subtitle: item.subtitle ? cleanCaption(item.subtitle) : item.subtitle, value: item.value ? cleanCaption(item.value) : item.value, caption: item.caption ? cleanCaption(item.caption) : item.caption }}
            navigate={navigate}
            icon={item.icon ?? (isPoint ? 'saving' : 'check-square')}
            tone={item.tone ?? 'teal'}
            rank={section.kind === 'rankList' ? index + 1 : null}
            key={item.id}
          />
        ))}
      </div>
      <ActionButtons actions={section.actions} navigate={navigate} />
    </AppSectionCard>
  )
}

function PrivacyTrustCenterScreen({ screen, navigate }: { screen: AppScreenResponse; navigate: Navigate }) {
  const visibleLabels = privacyLabelsFromScreen(screen, 'visible')
  const hiddenLabels = privacyLabelsFromScreen(screen, 'hidden')
  const logoutActions = screen.sections.flatMap((section) => section.actions ?? []).filter((action) => action.intent === 'logout')

  return (
    <div className={`screen screen-${screen.tab} ${screenClass(screen.screenId)} privacy-trust-screen`}>
      <StatusBar time={screen.statusBarTime} />
      <header className="app-header">
        <div className="header-side">
          <IconButton icon="back" label="뒤로" onClick={() => window.history.back()} />
        </div>
        <h1>{screen.title}</h1>
        <div className="header-side right">
          <IconButton icon="profile" label="프로필" onClick={() => navigate('/profile')} />
        </div>
      </header>

      <section className="screen-stack">
        <ScreenLead
          eyebrow="신뢰 센터"
          title="내 공개 상태를 직접 확인해요"
          subtitle="친구에게는 시작한 행동과 공개 동의한 요약만 보이고, 정확한 금액과 거래처는 숨깁니다."
        />
        <AppSectionCard className="privacy-preview-panel">
          <SectionHeading eyebrow="친구에게 보이는 예시" title="행동 여부 중심으로 보여요" subtitle="프로필 상단의 공개 미리보기와 같은 기준으로 표시됩니다." />
          <div className="privacy-preview-card">
            <IconBadge icon="profile" tone="teal" />
            <div>
              <strong>나의 공개 미리보기</strong>
              <span>{visibleLabels.slice(0, 4).join(', ')}</span>
              <small>정확한 금액, 잔액, 거래처는 표시하지 않음</small>
            </div>
          </div>
        </AppSectionCard>
        <AppSectionCard className="privacy-data-panel">
          <SectionHeading eyebrow="공개 범위" title="보이는 데이터와 숨기는 데이터를 분리했어요" subtitle="소셜 자극은 유지하되 민감한 금융 정보는 개인 화면 안에만 둡니다." />
          <div className="privacy-trust-list">
            <PrivacyTrustRow icon="check" tone="teal" title="친구에게 보이는 정보" labels={visibleLabels} />
            <PrivacyTrustRow icon="settings" tone="muted" title="항상 숨기는 정보" labels={hiddenLabels} />
            <PrivacyTrustRow icon="spark" tone="teal" title="AI 코치가 보는 데이터" labels={['익명화된 지출 패턴', '미션 달성 상태', '비교 그룹 집계']} />
          </div>
        </AppSectionCard>
        <AppSectionCard className="privacy-action-panel">
          <SectionHeading eyebrow="연결과 세션" title="언제든 공개 범위를 다시 확인할 수 있어요" subtitle="데이터 연결 해제나 로그아웃은 계정 관리에서 분리해 보여줍니다." />
          <ActionPanel className="privacy-action-row">
            <button className="app-button secondary" type="button" onClick={() => navigate('/profile')}>프로필로 돌아가기</button>
            {logoutActions.map((action) => <ActionButton action={action} navigate={navigate} key={`${action.label}-${action.path}`} />)}
          </ActionPanel>
        </AppSectionCard>
      </section>
    </div>
  )
}

function PrivacyTrustRow({ icon, tone, title, labels }: { icon: string; tone: string; title: string; labels: string[] }) {
  return (
    <article className="privacy-trust-row">
      <IconBadge icon={icon} tone={tone} />
      <div>
        <strong>{title}</strong>
        <div className="privacy-chip-list">
          {labels.map((label) => <span key={label}>{label}</span>)}
        </div>
      </div>
    </article>
  )
}

function BirthdayEventSection({ section, navigate, screen }: { section: AppSection; navigate: Navigate; screen?: AppScreenResponse }) {
  const isComplete = screen?.screenId.includes(':status') || section.id === 'complete'
  const collected = numberFromData(section.data, 'collectedAmount')
  const goal = numberFromData(section.data, 'goalAmount')
  const participants = numberFromData(section.data, 'participants')
  const totalFriends = numberFromData(section.data, 'totalFriends')

  return (
    <AppSectionCard className={`birthday-event-panel section-${section.id}`}>
      <SectionHeading
        eyebrow={isComplete ? '참여 완료' : '금융 이벤트'}
        title={section.title}
        subtitle={section.subtitle ?? '친구 기반으로 돈이 모이는 경험을 가볍게 확인합니다.'}
        onAction={section.detailPath ? () => navigate(section.detailPath ?? '/birthdays') : undefined}
      />
      {typeof collected === 'number' ? (
        <BigNumber value={collected} unit="원" size="l" caption={goal ? `목표 ${goal.toLocaleString('ko-KR')}원` : null} />
      ) : null}
      <p className="birthday-privacy-note">참여자별 금액은 공개하지 않아요 — 참여 여부와 메시지 중심으로만 보여요.</p>
      {typeof participants === 'number' && typeof totalFriends === 'number' ? (
        <ParticipationBar label="친구 참여" participants={participants} total={totalFriends} showAvatars />
      ) : null}
      {section.items?.length ? <BirthdayParticipantRows items={section.items} /> : null}
      <ActionButtons actions={section.actions} navigate={navigate} />
    </AppSectionCard>
  )
}

function BirthdayCompleteSection({ section, navigate }: SectionProps) {
  return (
    <AppSectionCard className="birthday-complete-panel">
      <SectionHeading eyebrow="참여 완료" title={section.title} subtitle={section.subtitle ?? '축하 흐름이 완료됐습니다.'} />
      <div className="birthday-receipt-list">
        <div>
          <span>친구에게 보이는 방식</span>
          <strong>참여 여부와 메시지 중심</strong>
        </div>
        <div>
          <span>숨기는 정보</span>
          <strong>개인별 참여 금액</strong>
        </div>
        <div>
          <span>다음 행동</span>
          <strong>내 비상금 미션으로 이어가기</strong>
        </div>
      </div>
      <ActionPanel className="birthday-complete-actions">
        <button className="app-button primary" type="button" onClick={() => navigate('/missions')}>비상금 미션 보기</button>
        <button className="app-button secondary" type="button" onClick={() => navigate('/birthdays')}>이벤트로 돌아가기</button>
      </ActionPanel>
    </AppSectionCard>
  )
}

function BirthdayParticipantsSection({ section }: { section: AppSection }) {
  return (
    <AppSectionCard className="birthday-participant-panel">
      <SectionHeading eyebrow="참여 현황" title={section.title} subtitle={section.subtitle ?? '개인별 금액 없이 축하 메시지와 참여 상태만 보여줍니다.'} />
      <BirthdayParticipantRows items={section.items ?? []} />
    </AppSectionCard>
  )
}

function BirthdayParticipantRows({ items }: { items: AppItem[] }) {
  return (
    <div className="birthday-participant-list">
      {items.map((item, index) => (
        <article className="birthday-participant-row" key={item.id}>
          <IconBadge icon={item.icon ?? 'profile'} tone={item.tone ?? 'teal'} />
          <div>
            <strong>{item.title === '나' ? '나의 참여' : `참여자 ${index + 1}`}</strong>
            <span>{item.subtitle ? cleanCaption(item.subtitle) : '축하 메시지 있음'}</span>
          </div>
          <em>참여 완료</em>
        </article>
      ))}
    </div>
  )
}

function MissionHero({ section, navigate }: SectionProps) {
  const metric = section.metrics?.[0]
  const todayReason = stringFromData(section.data, 'todayReason')
  const statusLabel = stringFromData(section.data, 'statusLabel') ?? section.subtitle ?? '진행 중'
  const evaluationStatus = stringFromData(section.data, 'evaluationStatus') ?? 'IN_PROGRESS'
  return (
    <AppSectionCard className="mission-focus-panel">
      <button className="mission-focus-hero" type="button" onClick={() => goDetail(section, navigate)}>
        <div>
          <span className="mission-state-chip" data-state={evaluationStatus}>{statusLabel}</span>
          <strong>{section.title}</strong>
          {todayReason ? <p>{todayReason}</p> : null}
        </div>
        {metric ? (
          <span className="mission-focus-meter">
            <small>{metric.label}</small>
            <b>{metric.value}</b>
            <em>{metric.caption ?? '진행 중'}</em>
          </span>
        ) : <Chevron />}
      </button>
      <ProgressLine value={metric?.progress ?? 0} tone="teal" />
      <ActionButtons actions={section.actions} navigate={navigate} />
    </AppSectionCard>
  )
}

/** UI.md 7장 핵심 루프 — 진짜 순서가 있는 흐름이라 넘버링/화살표 시각화를 허용한다. */
function MissionLoopSection() {
  const steps = ['미션', '포인트', '리포트 열람', '비교/FOMO', '행동 추천', '다시 미션']
  return (
    <AppSectionCard className="mission-loop-panel">
      <SectionHeading eyebrow="핵심 루프" title="미션이 이렇게 이어져요" subtitle="완료하면 포인트가 쌓이고, 포인트로 리포트를 열람하고, 다시 다음 미션으로 이어집니다." />
      <div className="onboarding-flow-row mission-loop-row" aria-label="미션 경제 루프">
        {steps.map((step, index) => (
          <span key={step}>
            {step}
            {index < steps.length - 1 ? <Chevron /> : null}
          </span>
        ))}
      </div>
    </AppSectionCard>
  )
}

function MissionListSection({ section, navigate }: SectionProps) {
  const isCompleted = section.id === 'completed'
  const [pendingId, setPendingId] = useState<string | null>(null)

  const handleStart = async (item: AppItem) => {
    if (!item.detailPath) {
      return
    }
    setPendingId(item.id)
    try {
      navigate(item.detailPath)
    } finally {
      setPendingId(null)
    }
  }

  return (
    <AppSectionCard className={`mission-list-panel section-${section.id}`}>
      <SectionHeading eyebrow={isCompleted ? '완료' : '진행 중'} title={section.title} subtitle={section.subtitle} />
      <div className="fm-mission-list">
        {section.items?.map((item) => (
          <MissionCard
            key={item.id}
            title={cleanCaption(item.title)}
            rewardPoints={parsePointCaption(item.caption)}
            status={isCompleted ? 'done' : 'todo'}
            progressLabel={item.subtitle ? cleanCaption(item.subtitle) : null}
            busy={pendingId === item.id}
            onCta={isCompleted ? undefined : () => { void handleStart(item) }}
          />
        ))}
      </div>
    </AppSectionCard>
  )
}

function parsePointCaption(caption?: string | null): number {
  const match = caption?.match(/\d+/)
  return match ? Number.parseInt(match[0], 10) : 0
}

function BudgetSection({ section, navigate }: SectionProps) {
  const progress = numberFromData(section.data, 'progress') ?? section.metrics?.[1]?.progress ?? 0
  return (
    <AppSectionCard className="budget-card finance-section-card">
      <SectionHeading title={section.title} subtitle={section.subtitle} onAction={section.detailPath ? () => navigate(section.detailPath ?? '/home') : undefined} actionLabel="자세히" />
      <div className="finance-metric-grid">
        {section.metrics?.map((metric) => (
          <FinanceMetricCard metric={metric} key={metric.label} />
        ))}
      </div>
      <ProgressLine value={progress} tone="teal" />
    </AppSectionCard>
  )
}

function GridSection({ section, navigate }: SectionProps) {
  const isScore = section.kind === 'scoreGrid'
  const hasMetricTiles = !isScore && section.metrics && section.metrics.length > 0
  return (
    <AppSectionCard className={isScore ? 'score-card finance-section-card' : 'signal-section-card'}>
      <SectionHeading title={section.title} subtitle={section.subtitle} onAction={section.detailPath ? () => navigate(section.detailPath ?? '/home') : undefined} actionLabel="보기" />
      {isScore ? (
        <div className="finance-metric-grid compact">
          {section.metrics?.map((metric) => <FinanceMetricCard metric={metric} key={metric.label} />)}
        </div>
      ) : hasMetricTiles ? (
        <div className="signal-card-grid">
          {section.metrics?.map((metric) => (
            <SignalCard
              title={metric.label}
              value={metric.value}
              caption={metric.caption}
              icon={metric.label.includes('주식') ? 'stocks' : metric.label.includes('적금') ? 'saving' : metric.label.includes('펀드') ? 'fund' : 'pension'}
              tone={metric.tone ?? 'teal'}
              progress={metric.progress}
              key={metric.label}
            />
          ))}
        </div>
      ) : (
        <div className="signal-card-grid">
          {section.items?.map((item) => (
            <SignalCard
              title={item.title}
              subtitle={item.subtitle}
              value={item.value}
              caption={item.caption}
              icon={item.icon ?? 'more'}
              tone={item.tone ?? 'teal'}
              progress={numberFromData(item.data, 'progress')}
              onClick={item.detailPath ? () => navigate(item.detailPath ?? '/home') : undefined}
              key={item.id}
            />
          ))}
        </div>
      )}
    </AppSectionCard>
  )
}

function AssetSection({ section, navigate }: SectionProps) {
  const sparkline = arrayFromData(section.data, 'sparkline')
  return (
    <AppSectionCard className="asset-card finance-section-card">
      <SectionHeading title={section.title} subtitle={section.subtitle} onAction={section.detailPath ? () => navigate(section.detailPath ?? '/home') : undefined} actionLabel="보기" />
      <div className="asset-layout">
        <div>
          {section.metrics?.map((metric) => (
            <FinanceMetricCard metric={metric} key={metric.label} />
          ))}
        </div>
        {sparkline.length >= 2 ? <MiniLineChart values={sparkline} /> : <ChartEmptyLabel />}
      </div>
    </AppSectionCard>
  )
}

function ChartEmptyLabel() {
  return <span className="chart-empty-label">추세 데이터 부족</span>
}

function CompareScoreSummarySection({ section, screen }: { section: AppSection; screen?: AppScreenResponse }) {
  const memberCount = numberFromData(screen?.meta, 'memberCount')
  const meScore = numberFromData(section.data, 'meScore') ?? 0
  const groupScore = numberFromData(section.data, 'groupScore') ?? 0

  return (
    <AppSectionCard className="compare-score-summary compare-section-card">
      <SectionHeading eyebrow="리포트 요약" title={section.title} subtitle={section.subtitle ?? '내 점수와 그룹 평균을 한눈에 확인해요.'} />
      <CompareGauge category="금융 점수" meValue={meScore} otherValue={groupScore} otherName="그룹 평균" unit="점" />
      {memberCount ? <p className="compare-sample-note">표본 {memberCount}명 · 공개 프로필 기준</p> : null}
    </AppSectionCard>
  )
}

function CompareBarsSection({ section, navigate }: SectionProps) {
  return (
    <AppSectionCard className="compare-card compare-report-panel">
      <SectionHeading eyebrow="항목별 비교" title={section.title} subtitle={section.subtitle} onAction={section.detailPath ? () => navigate(section.detailPath ?? '/compare') : undefined} actionLabel="보기" />
      <div className="fm-gauge-stack">
        {section.items?.map((item) => (
          <CompareGauge
            key={item.id}
            category={item.title}
            meValue={numberFromData(item.data, 'mine') ?? 0}
            otherValue={numberFromData(item.data, 'group') ?? 0}
            unit={stringFromData(item.data, 'unit') ?? '%'}
          />
        ))}
      </div>
      <ActionButtons actions={section.actions} navigate={navigate} />
    </AppSectionCard>
  )
}

function ReportSection({ section, navigate }: SectionProps) {
  const pointCost = numberFromData(section.data, 'pointCost') ?? 30
  const kind = (stringFromData(section.data, 'reportKind') as ReportKind | null) ?? 'other-group'
  const [locked, setLocked] = useState(true)

  const unlock = () => {
    const session = getSession()
    const balance = session.user?.pointBalance ?? 0
    if (balance < pointCost || !session.user) {
      return
    }
    saveSession({ user: { ...session.user, pointBalance: balance - pointCost } })
    setLocked(false)
  }

  return (
    <ReportCard
      kind={kind}
      title={section.title}
      locked={locked}
      pointCost={pointCost}
      onUnlock={unlock}
      stages={locked ? undefined : reportStagesFor(kind, navigate)}
    />
  )
}

/**
 * 6단계 리포트 콘텐츠. group-follow(팔로우 그룹)는 4단계에 비율만,
 * my-group/other-group(익명 기반)은 4단계에 정확 금액을 담아 6장 규칙을 지킨다.
 */
function reportStagesFor(kind: ReportKind, navigate: Navigate): ReportStages {
  if (kind === 'follow-group') {
    return {
      summary: '내 팔로우 그룹은 저축·적금 실천 비율이 높은 편이에요.',
      traits: ['꾸준한 저축형', '고정지출 관리형'],
      behaviors: ['적금 자동이체', '비상금 통장 개설', '청약 알아보기'],
      stageFour: {
        kind: 'ratio',
        rows: [
          { label: '적금 실천 비율', value: '64%' },
          { label: '비상금 준비 비율', value: '48%' },
        ],
      },
      gapWithMe: '이 그룹은 너보다 비상금 준비율이 높아요.',
      nextAction: {
        label: '이번 주 비상금 3만원 만들기 미션을 추천해요.',
        ctaLabel: '미션 시작',
        onCta: () => navigate('/missions/mission-water'),
      },
    }
  }
  return {
    summary: kind === 'my-group' ? '내 그룹은 안정 추구형이 많아요.' : '투자 비중이 높은 공격형 스타일 그룹이에요.',
    traits: kind === 'my-group' ? ['안정 추구형', '저축 우선형'] : ['투자 적극형', '정보 탐색형'],
    behaviors: ['ETF 정기매수', 'ISA 개설', '정기예금 가입'],
    stageFour: {
      kind: 'amounts',
      rows: [
        { label: '삼성전자', amountLabel: '평균 128만원' },
        { label: 'TIGER 미국S&P500', amountLabel: '평균 96만원' },
      ],
    },
    gapWithMe: '이 그룹은 너보다 투자 비중이 18%p 높아요.',
    nextAction: {
      label: 'ISA 계좌를 알아보는 미션을 추천해요.',
      ctaLabel: '미션 시작',
      onCta: () => navigate('/missions/mission-record'),
    },
  }
}

function CalendarSection({ section, navigate }: SectionProps) {
  const calendarItems = (section.items ?? []).filter((item) => Number.isInteger(Number(item.title)))
  const itemByDay = new Map(calendarItems.map((item) => [Number(item.title), item]))
  const days = calendarItems.length
    ? calendarItems
    : Array.from({ length: 30 }, (_, index) => itemByDay.get(index + 1) ?? {
        id: `record-empty-${index + 1}`,
        title: String(index + 1),
        tone: 'empty',
      })

  return (
    <AppSectionCard className="calendar-block journal-calendar-panel">
      <div className="month-heading">
        <Chevron direction="left" />
        <h1>{section.title}</h1>
        <Chevron />
      </div>
      <div className="weekdays">
        {['일', '월', '화', '수', '목', '금', '토'].map((day) => <span key={day}>{day}</span>)}
      </div>
      <div className="calendar-grid">
        {days.map((item) => (
          <button
            className={`calendar-cell ${item.tone ?? 'empty'}`}
            type="button"
            onClick={() => item.detailPath && navigate(item.detailPath)}
            key={item.id}
          >
            <strong>{item.title}</strong>
            {item.value ? <small>{item.value}</small> : null}
            <i />
          </button>
        ))}
      </div>
      <div className="legend-row">
        <Legend tone="success" label="미션 성공" />
        <Legend tone="over" label="예산 초과" />
        <Legend tone="none" label="기록 없음" />
      </div>
      <ActionButtons actions={section.actions} navigate={navigate} />
    </AppSectionCard>
  )
}

function CoachSection({ section, navigate }: SectionProps) {
  const missionAction = section.actions?.[0]
  return (
    <AppSectionCard className={`coach-card section-${section.id}`}>
      <SectionHeading eyebrow="코치 요약" title={section.title} />
      <CoachBubble
        message={section.subtitle ?? '오늘 데이터를 보고 있어요.'}
        ctaLabel={missionAction?.label ?? '미션 시작'}
        onCta={() => navigate(missionAction?.path ?? '/missions')}
      />
      {section.metrics?.[0]?.progress ? (
        <ProgressLine value={section.metrics[0].progress ?? 0} tone="teal" />
      ) : null}
    </AppSectionCard>
  )
}

function MetricCardSection({ section, navigate }: SectionProps) {
  return (
    <AppSectionCard className={section.kind === 'points' ? 'points-card finance-section-card' : 'profile-summary-card finance-section-card'}>
      <SectionHeading title={section.title} subtitle={section.subtitle} onAction={section.detailPath ? () => navigate(section.detailPath ?? '/profile') : undefined} actionLabel="보기" />
      <div className="finance-metric-grid">
        {section.metrics?.map((metric) => (
          <FinanceMetricCard metric={metric} key={metric.label} />
        ))}
      </div>
      <ActionButtons actions={section.actions} navigate={navigate} />
    </AppSectionCard>
  )
}

function ChipSection({ section }: { section: AppSection }) {
  return (
    <AppSectionCard>
      <SectionHeading title={section.title} />
      <div className="chip-row">
        {section.items?.map((item) => (
          <span className={`chip ${item.tone ?? 'muted'}`} key={item.id}>{item.title}</span>
        ))}
      </div>
    </AppSectionCard>
  )
}

function ComparePromptSection({ section, navigate }: SectionProps) {
  return (
    <CompareActionPanel
      className="compare-direct-panel"
      title={section.title}
      subtitle={section.subtitle ?? '조건을 고르거나 추천 그룹으로 바로 비교할 수 있어요.'}
    >
      <button className="app-button primary" type="button" onClick={() => goDetail(section, navigate)}>
        직접 비교 시작
      </button>
    </CompareActionPanel>
  )
}

function FriendSignalsSection({ section, navigate }: SectionProps) {
  const items = section.items ?? []
  const highest = items.reduce<AppItem | null>((top, item) => {
    const rate = participationRate(item)
    const topRate = top ? participationRate(top) : -1
    return rate > topRate ? item : top
  }, null)
  const highestRate = highest ? participationRate(highest) : 0

  return (
    <AppSectionCard className="compare-friend-signals-section compare-section-card">
      <SectionHeading eyebrow="친구 근황" title={section.title} subtitle={section.subtitle} onAction={section.detailPath ? () => navigate(section.detailPath ?? '/profile') : undefined} actionLabel="친구 목록" />
      <div className="fm-participation-stack">
        {items.map((item) => (
          <ParticipationBar
            key={item.id}
            label={item.title}
            participants={numberFromData(item.data, 'participants') ?? 0}
            total={numberFromData(item.data, 'total') ?? 0}
            showAvatars={false}
          />
        ))}
      </div>
      {highest && highestRate >= 60 ? (
        <FomoCard
          message={`${cleanCaption(highest.title)}, 네 친구 중 ${highestRate}%가 하고 있어요.`}
          ctaLabel="비교 리포트 열람"
          onCta={() => navigate('/compare/results/cmp-001')}
        />
      ) : null}
    </AppSectionCard>
  )
}

function participationRate(item: AppItem): number {
  const participants = numberFromData(item.data, 'participants') ?? 0
  const total = numberFromData(item.data, 'total') ?? 0
  return total > 0 ? Math.round((participants / total) * 100) : 0
}

function CompareGroupRailSection({ section, navigate }: SectionProps) {
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const handleRecommendedGroupClick = async (item: AppItem) => {
    const filters = compareFiltersFromItem(item)
    if (!filters) {
      if (item.detailPath) {
        navigate(item.detailPath)
      }
      return
    }

    setPendingId(item.id)
    setNotice(null)
    try {
      const result = await api.createAppCompareGroup(filters)
      if (result.nextPath) {
        navigate(result.nextPath)
        return
      }
      setNotice(result.message)
    } catch {
      setNotice('추천 그룹을 불러오지 못했어요. 잠시 후 다시 시도해주세요.')
    } finally {
      setPendingId(null)
    }
  }

  return (
    <AppSectionCard className="compare-group-section compare-section-card">
      <SectionHeading eyebrow="추천 비교군" title={section.title} subtitle={section.subtitle} onAction={section.detailPath ? () => navigate(section.detailPath ?? '/compare') : undefined} />
      <div className="compare-group-rail">
        {section.items?.map((item) => (
          <RecommendationRow
            item={item}
            disabled={pendingId !== null}
            busy={pendingId === item.id}
            onClick={() => { void handleRecommendedGroupClick(item) }}
            key={item.id}
          />
        ))}
      </div>
      {notice ? <p className="inline-notice compare-group-notice">{notice}</p> : null}
    </AppSectionCard>
  )
}

function SavedCompareGroupsSection({ section, navigate }: SectionProps) {
  return (
    <AppSectionCard className="saved-compare-section compare-section-card">
      <SectionHeading eyebrow="내 비교" title={section.title} subtitle={section.subtitle} onAction={section.detailPath ? () => navigate(section.detailPath ?? '/compare/filter') : undefined} />
      <div className="saved-compare-list activity-list">
        {section.items?.map((item) => (
          <ActivityRow item={item} navigate={navigate} icon={item.icon ?? 'profile'} tone={item.tone ?? 'teal'} key={item.id} />
        ))}
      </div>
      <ActionButtons actions={section.actions} navigate={navigate} />
    </AppSectionCard>
  )
}

function CompareProfileListSection({ section, navigate }: SectionProps) {
  return (
    <AppSectionCard className="compare-profile-list-section compare-section-card">
      <SectionHeading eyebrow="비교 대상" title={section.title} subtitle={section.subtitle} />
      <div className="compare-profile-list">
        {section.items?.map((item) => (
          <button className="compare-profile-card" type="button" onClick={() => item.detailPath && navigate(item.detailPath)} key={item.id}>
            <IconBadge icon={item.icon ?? 'profile'} tone={item.tone ?? 'teal'} />
            <div className="compare-profile-copy">
              <strong>{item.title}</strong>
              {item.subtitle ? <span>{item.subtitle}</span> : null}
              {item.caption ? <small>{item.caption}</small> : null}
            </div>
            {item.value ? <b>{item.value}</b> : null}
          </button>
        ))}
      </div>
    </AppSectionCard>
  )
}

function CompareGroupMembersSection({ section, navigate }: SectionProps) {
  const items = section.items ?? []
  const pageSize = numberFromData(section.data, 'pageSize') ?? 5
  const initialVisible = numberFromData(section.data, 'initialVisible') ?? pageSize
  const [visibleCount, setVisibleCount] = useState(Math.min(items.length, initialVisible))
  const visibleItems = items.slice(0, visibleCount)
  const hasMore = visibleCount < items.length

  return (
    <AppSectionCard className="compare-profile-list-section compare-group-members-section compare-section-card">
      <SectionHeading eyebrow="비교 그룹" title={section.title} subtitle={section.subtitle} />
      <div className="compare-profile-list">
        {visibleItems.map((item) => (
          <CompareMemberCard item={item} key={item.id} />
        ))}
      </div>
      {hasMore ? (
        <button
          className="app-button secondary compare-members-more"
          type="button"
          onClick={() => setVisibleCount((count) => Math.min(items.length, count + pageSize))}
        >
          더보기 ({visibleCount}/{items.length})
        </button>
      ) : null}
      <CompareActionPanel
        className="compare-result-action-panel"
        title="다음에 볼 것"
        subtitle="조건을 다시 좁히거나 코치 해석으로 이어갈 수 있어요."
      >
        <button className="app-button primary" type="button" onClick={() => navigate('/compare/coach')}>
          코치 해석 보기
        </button>
        <button className="app-button secondary" type="button" onClick={() => navigate('/compare/filter')}>
          조건 다시 고르기
        </button>
      </CompareActionPanel>
    </AppSectionCard>
  )
}

function CompareMemberCard({ item }: { item: AppItem }) {
  // 그룹 구성원도 익명 개인 단위이므로 UI.md 6장 `anonymous` scope를 그대로 적용한다.
  return <ProfileCard scope="anonymous" facts={profileFactsFromItem(item)} />
}

function ListSection({ section, navigate }: SectionProps) {
  const eyebrow = section.kind === 'checkList'
    ? '확인 항목'
    : section.kind === 'actionList'
      ? '다음 행동'
      : section.id.includes('completed')
        ? '완료'
        : section.id.includes('active')
          ? '진행 중'
          : section.id.includes('feed')
            ? '활동'
            : '목록'

  return (
    <AppSectionCard className={`${section.id === 'feed' ? 'feed-card' : ''} section-${section.id} activity-section-card`}>
      <SectionHeading eyebrow={eyebrow} title={section.title} subtitle={section.subtitle} onAction={section.detailPath ? () => navigate(section.detailPath ?? '/home') : undefined} />
      <div className={section.kind === 'profileRail' ? 'profile-rail activity-list' : 'list-stack activity-list'}>
        {section.items?.map((item, index) => (
          <ListItem
            item={item}
            index={index}
            navigate={navigate}
            rank={section.kind === 'rankList'}
            variant={section.id}
            key={item.id}
          />
        ))}
      </div>
      <ActionButtons actions={section.actions} navigate={navigate} />
    </AppSectionCard>
  )
}

function MetricView({ metric }: { metric: AppMetric }) {
  return (
    <div className="metric" data-tone={metric.tone ?? 'default'}>
      <span>{metric.label}</span>
      <strong>{metric.value}</strong>
      {metric.caption ? <small>{metric.caption}</small> : null}
    </div>
  )
}

function ListItem({
  item,
  index,
  rank,
  variant,
  navigate,
}: {
  item: AppItem
  index: number
  rank: boolean
  variant?: string
  navigate: Navigate
}) {
  const inferred = inferItemPresentation(item, variant)
  const templateId = templateIdFromItem(item)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

  const handleClick = async () => {
    setNotice(null)
    setBusy(true)
    try {
      await handleListItemClick(item, navigate, templateId)
    } catch {
      setNotice(templateId ? '미션을 추가하지 못했어요. 잠시 후 다시 시도해주세요.' : '화면을 불러오지 못했어요.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <ActivityRow
        item={{ ...item, title: cleanCaption(item.title), subtitle: item.subtitle ? cleanCaption(item.subtitle) : item.subtitle, value: item.value ? cleanCaption(item.value) : item.value, caption: item.caption ? cleanCaption(item.caption) : item.caption }}
        navigate={navigate}
        rank={rank ? index + 1 : null}
        icon={inferred.icon}
        tone={inferred.tone}
        actionLabel={templateId ? '추가' : null}
        disabled={busy}
        busy={busy}
        onClick={() => { void handleClick() }}
      />
      {notice ? <p className="inline-notice list-item-notice" role="alert">{notice}</p> : null}
    </>
  )
}

async function handleListItemClick(item: AppItem, navigate: Navigate, templateId: string | null) {
  if (templateId) {
    const result = await api.addAppMissionFromTemplate(templateId)
    navigate(result.nextPath)
    return
  }
  if (item.detailPath) {
    navigate(item.detailPath)
  }
}

function templateIdFromItem(item: AppItem): string | null {
  const value = item.data?.templateId
  return typeof value === 'string' && value.length > 0 ? value : null
}

function compareFiltersFromItem(item: AppItem): AppCompareSearchRequest | null {
  if (!item.data) {
    return null
  }
  const hasCompareFilter =
    'ageBand' in item.data ||
    'incomeBand' in item.data ||
    'jobCategory' in item.data ||
    'moneyStyle' in item.data ||
    'area' in item.data ||
    'householdType' in item.data ||
    'assetRange' in item.data
  if (!hasCompareFilter) {
    return null
  }
  return {
    ageBand: stringFromData(item.data, 'ageBand') ?? '전체',
    incomeBand: stringFromData(item.data, 'incomeBand') ?? '전체',
    jobCategory: stringFromData(item.data, 'jobCategory') ?? '전체',
    moneyStyle: stringFromData(item.data, 'moneyStyle') ?? '전체',
    area: stringFromData(item.data, 'area') ?? '전체',
    householdType: stringFromData(item.data, 'householdType') ?? '전체',
    assetRange: stringFromData(item.data, 'assetRange') ?? '전체',
  }
}

function ActionButtons({ actions, navigate }: { actions?: AppAction[] | null; navigate: Navigate }) {
  if (!actions?.length) {
    return null
  }
  return (
    <ActionPanel className="action-row">
      {actions.map((action) => (
        <ActionButton action={action} navigate={navigate} key={`${action.label}-${action.path}`} />
      ))}
    </ActionPanel>
  )
}

function ActionButton({ action, navigate }: { action: AppAction; navigate: Navigate }) {
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

  const handleClick = async () => {
    setNotice(null)
    setBusy(true)
    try {
      if (action.method === 'GET') {
        navigate(action.path)
        return
      }
      if (action.intent === 'birthday-open') {
        await api.openMyBirthdayFund()
        navigate('/birthday-funds/me/status')
        return
      }
      if (action.intent === 'birthday-share') {
        await api.shareMyBirthdayFund()
        navigate('/birthday-funds/me/status')
        return
      }
      if (action.intent === 'mission-add') {
        const templateId = action.path.split('/').filter(Boolean).at(-1)
        if (templateId) {
          const result = await api.addAppMissionFromTemplate(templateId)
          navigate(result.nextPath)
        }
        return
      }
      if (action.intent === 'logout') {
        await api.logout()
        clearSession()
        navigate('/login')
        return
      }
      navigate(action.path)
    } catch {
      setNotice('요청을 처리하지 못했어요. 잠시 후 다시 시도해주세요.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <span className="action-button-shell">
      <button className={`app-button ${action.tone}`} type="button" disabled={busy} aria-busy={busy} onClick={() => { void handleClick() }}>
        {busy ? '처리 중' : action.label}
      </button>
      {notice ? <span className="inline-notice action-notice" role="alert">{notice}</span> : null}
    </span>
  )
}

function goDetail(section: AppSection, navigate: Navigate) {
  if (section.detailPath) {
    navigate(section.detailPath)
  }
}

function screenClass(screenId: string) {
  return `screen-${screenId.replace(/[^a-z0-9]+/gi, '-')}`
}

function isMonthlyRecordsScreen(screen: AppScreenResponse) {
  return screen.tab === 'records' && /^records:\d{4}-\d{2}$/.test(screen.screenId)
}

function cleanCaption(caption: string) {
  return cleanProductCopy(caption)
}

function stringFromData(data: Record<string, unknown> | null | undefined, key: string): string | null {
  const value = data?.[key]
  return typeof value === 'string' && value.length > 0 ? value : null
}

function parseMoney(value: string | null | undefined) {
  if (!value) {
    return 0
  }
  const numeric = value.replace(/[^\d-]/g, '')
  return Number.parseInt(numeric, 10) || 0
}

function profileNameFromAccount(account: AppSection | undefined) {
  const subtitle = account?.subtitle ?? ''
  const marker = '님의'
  const markerIndex = subtitle.indexOf(marker)
  if (markerIndex > 0) {
    return subtitle.slice(0, markerIndex)
  }
  return '내 프로필'
}

function redactProfileAccountSection(account: AppSection | undefined): AppSection | undefined {
  if (!account) {
    return undefined
  }
  return {
    ...account,
    metrics: account.metrics?.map((metric) => (
      metric.label.includes('포인트')
        ? { ...metric, caption: '가상머니는 공개 화면에서 숨김' }
        : metric
    )) ?? null,
  }
}

function parsePercent(value: string | null | undefined) {
  if (!value) {
    return null
  }
  const match = value.match(/-?\d+/)
  return match ? Math.max(0, Math.min(100, Number.parseInt(match[0], 10))) : null
}

function privacyLabelsFromScreen(screen: AppScreenResponse, target: 'visible' | 'hidden') {
  const targetText = target === 'visible' ? '공개' : '숨'
  const chipSection = screen.sections.find((section) => section.id === target)
  if (chipSection?.items?.length) {
    return chipSection.items.map((item) => cleanCaption(item.title))
  }
  const privacyItem = screen.sections
    .flatMap((section) => section.items ?? [])
    .find((item) => item.id === target || item.title.includes(targetText))
  const rawLabels = privacyItem?.subtitle ?? privacyItem?.value ?? ''
  const labels = splitPrivacyLabels(rawLabels)
  if (labels.length > 0) {
    return labels
  }
  return target === 'visible'
    ? ['연령대', '소득 구간', '금융 목표', '금융 요약']
    : ['계좌번호', '거래처명', '정확한 거래 시간', '카드 끝자리']
}

function splitPrivacyLabels(value: string) {
  return value
    .split(/[,/·\n]+/)
    .map((label) => cleanCaption(label.trim()))
    .filter(Boolean)
}

function inferItemPresentation(item: AppItem, variant?: string): { icon: string; tone: string } {
  if (variant === 'feed' || item.icon === 'feed') {
    const text = `${item.title} ${item.subtitle}`.toLowerCase()
    if (text.includes('펀드') || text.includes('생일')) {
      return { icon: 'gift', tone: 'teal' }
    }
    if (text.includes('저축') || text.includes('비상금')) {
      return { icon: 'saving', tone: 'teal' }
    }
    if (text.includes('투자') || text.includes('주식')) {
      return { icon: 'stocks', tone: 'teal' }
    }
    if (text.includes('지출') || text.includes('카페')) {
      return { icon: 'spend', tone: 'warning' }
    }
    return { icon: 'check', tone: 'teal' }
  }
  return { icon: (item.icon ?? 'check') as IconName, tone: item.tone ?? 'teal' }
}
