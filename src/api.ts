import type {
  AuthResponse,
  AppActionResultResponse,
  AppCompareSearchRequest,
  AppScreenResponse,
  ErrorResponse,
  ProductOnboardingRequest,
  UserMeResponse,
} from './types'
import { accessToken } from './session'
import { mockApi } from './mockApi'

export const DUMMY_MODE = (import.meta.env.VITE_DUMMY_MODE ?? 'true') !== 'false'

type BirthdayContributionPayload = {
  amount: number
  message: string
  anonymous: boolean
}

export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'
).replace(/\/$/, '')

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH'
  token?: string
  body?: unknown
  idempotencyKey?: string
}

export class ApiError extends Error {
  status: number
  code: string
  fieldErrors: ErrorResponse['fieldErrors']

  constructor(status: number, body: ErrorResponse) {
    super(body.message)
    this.name = 'ApiError'
    this.status = status
    this.code = body.code
    this.fieldErrors = body.fieldErrors
  }
}

function parseJson(text: string): unknown {
  if (!text.trim()) {
    return null
  }
  try {
    return JSON.parse(text)
  } catch {
    return {
      code: 'INVALID_RESPONSE',
      message: '서버 응답을 읽을 수 없습니다.',
    } satisfies ErrorResponse
  }
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers({
    Accept: 'application/json',
  })

  if (options.body !== undefined) {
    headers.set('Content-Type', 'application/json')
  }
  const bearer = options.token ?? accessToken()
  if (bearer) {
    headers.set('Authorization', `Bearer ${bearer}`)
  }
  if (options.idempotencyKey) {
    headers.set('Idempotency-Key', options.idempotencyKey)
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers,
    credentials: 'include',
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  })
  const text = await response.text()
  const data = parseJson(text)

  if (response.ok && data && typeof data === 'object' && (data as ErrorResponse).code === 'INVALID_RESPONSE') {
    throw new ApiError(response.status, data as ErrorResponse)
  }

  if (!response.ok) {
    const body =
      data && typeof data === 'object'
        ? (data as ErrorResponse)
        : {
            code: 'HTTP_ERROR',
            message: `HTTP ${response.status}`,
          }
    throw new ApiError(response.status, body)
  }

  return data as T
}

const realApi = {
  health: () => request<{ status: string }>('/health'),
  signup: (email: string, password: string, displayName: string) =>
    request<AuthResponse>('/api/auth/signup', {
      method: 'POST',
      body: { email, password, displayName },
    }),
  login: (email: string, password: string) =>
    request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: { email, password },
    }),
  refresh: () =>
    request<AuthResponse>('/api/auth/refresh', {
      method: 'POST',
    }),
  logout: () =>
    request<{ status: string }>('/api/auth/logout', {
      method: 'POST',
    }),
  me: () => request<UserMeResponse>('/api/users/me'),
  completeOnboarding: (body: ProductOnboardingRequest) =>
    request<UserMeResponse>('/api/users/me/onboarding', {
      method: 'POST',
      body,
    }),
  getAppHome: (token?: string) =>
    request<AppScreenResponse>('/api/app/home', { token }),
  getAppHomeDetail: (detail: string, token?: string) =>
    request<AppScreenResponse>(`/api/app/home/${detail}`, { token }),
  getAppCompare: (token?: string) =>
    request<AppScreenResponse>('/api/app/compare', { token }),
  getAppCompareFilter: (token?: string) =>
    request<AppScreenResponse>('/api/app/compare/filter', { token }),
  searchAppCompareFilter: (body: AppCompareSearchRequest, token?: string) =>
    request<AppScreenResponse>('/api/app/compare/filter/search', {
      method: 'POST',
      token,
      body,
    }),
  createAppCompareGroup: (body: AppCompareSearchRequest, token?: string) =>
    request<AppActionResultResponse>('/api/app/compare/groups', {
      method: 'POST',
      token,
      body,
    }),
  getAppCompareGroupPreview: (recommendationId: string, token?: string) =>
    request<AppScreenResponse>(`/api/app/compare/groups/${recommendationId}/preview`, {
      token,
    }),
  getAppCompareResult: (comparisonId = 'cmp-001', token?: string) =>
    request<AppScreenResponse>(`/api/app/compare/results/${comparisonId}`, {
      token,
    }),
  getAppCompareMemberDetail: (memberId: string, token?: string) =>
    request<AppScreenResponse>(`/api/app/compare/members/${memberId}`, {
      token,
    }),
  getAppComparePersonalFlow: (comparisonId = 'cmp-001', token?: string) =>
    request<AppScreenResponse>(`/api/app/compare/results/${comparisonId}/me`, {
      token,
    }),
  saveAppCompareReport: (comparisonId = 'cmp-001', token?: string) =>
    request<AppActionResultResponse>(`/api/app/compare/results/${comparisonId}/save`, {
      method: 'POST',
      token,
    }),
  getAppCoachFlow: (comparisonId = 'cmp-001', token?: string) =>
    request<AppScreenResponse>(`/api/app/compare/${comparisonId}/coach-flow`, {
      token,
    }),
  getAppMissions: (token?: string) =>
    request<AppScreenResponse>('/api/app/missions', { token }),
  getAppMissionAdd: (token?: string) =>
    request<AppScreenResponse>('/api/app/missions/add', { token }),
  getAppMission: (missionId: string, token?: string) =>
    request<AppScreenResponse>(`/api/app/missions/${missionId}`, { token }),
  addAppMissionFromTemplate: (templateId: string, token?: string) =>
    request<AppActionResultResponse>(`/api/app/missions/add/${templateId}`, {
      method: 'POST',
      token,
    }),
  getAppRecords: (month = '2026-06', token?: string) =>
    request<AppScreenResponse>(`/api/app/records?month=${month}`, { token }),
  getAppRecordDetail: (date: string, token?: string) =>
    request<AppScreenResponse>(`/api/app/records/${date}`, { token }),
  getAppProfile: (token?: string) =>
    request<AppScreenResponse>('/api/app/profile', { token }),
  getAppProfileSection: (section: string, token?: string) =>
    request<AppScreenResponse>(`/api/app/profile/sections/${section}`, { token }),
  getAppBirthdays: (token?: string) =>
    request<AppScreenResponse>('/api/app/birthdays', { token }),
  getAppBirthdayFlow: (birthdayId: string, token?: string) =>
    request<AppScreenResponse>(`/api/app/birthdays/${birthdayId}/flow`, { token }),
  contributeBirthdayFund: (
    fundId: string,
    payload: BirthdayContributionPayload = {
      amount: 10000,
      message: '생일 축하해!',
      anonymous: false,
    },
    token?: string,
  ) =>
    request<AppActionResultResponse>(`/api/app/birthday-funds/${fundId}/contributions`, {
      method: 'POST',
      token,
      body: payload,
    }),
  getBirthdayContributionComplete: (fundId: string, token?: string) =>
    request<AppScreenResponse>(`/api/app/birthday-funds/${fundId}/complete`, {
      token,
    }),
  getMyBirthdayFundOpenScreen: (token?: string) =>
    request<AppScreenResponse>('/api/app/birthday-funds/me/open', { token }),
  openMyBirthdayFund: (token?: string) =>
    request<AppActionResultResponse>('/api/app/birthday-funds/me/open', {
      method: 'POST',
      token,
    }),
  getMyBirthdayFundShareScreen: (token?: string) =>
    request<AppScreenResponse>('/api/app/birthday-funds/me/share', { token }),
  shareMyBirthdayFund: (token?: string) =>
    request<AppActionResultResponse>('/api/app/birthday-funds/me/share', {
      method: 'POST',
      token,
    }),
  getMyBirthdayFundStatus: (token?: string) =>
    request<AppScreenResponse>('/api/app/birthday-funds/me/status', { token }),
}

export const api = DUMMY_MODE ? mockApi : realApi
