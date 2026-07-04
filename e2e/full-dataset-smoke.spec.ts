import { expect, test, type Page } from '@playwright/test'

test('full synthetic dataset renders core logged-in routes without mutating DB', async ({ page }) => {
  await loginAsP001(page)

  await expect(page).toHaveURL(/\/home/)
  await expect(page.getByText('하루 예산')).toBeVisible()
  await expect(page.getByText('₩34,000')).toBeVisible()
  await expect(page.getByText('친구 5명의 공개 금융 활동 기준')).toBeVisible()

  await page.goto('/compare')
  await expect(page.getByRole('heading', { name: '그룹 비교', exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'AI 추천 그룹' })).toBeVisible()
  await expect(page.getByRole('button', { name: /바로 비교/ }).first()).toBeVisible()
  await expect(page.getByRole('button', { name: '직접 비교 시작' })).toBeVisible()

  await page.goto('/records')
  await expect(page.getByRole('heading', { name: '기록', exact: true })).toBeVisible()
  await expect(page.getByText('2026년 6월')).toBeVisible()
  await expect(page.getByText('37,800')).toBeVisible()
  await expect(page.getByText('₩27,100')).toBeVisible()
  await expect(page.getByText('₩34,000')).toBeVisible()

  await page.goto('/compare/filter')
  await expect(page.getByRole('heading', { name: '필터링 조회' })).toBeVisible()
  await expect(page.getByText('전체 조건')).toBeVisible()
  await expect(page.getByRole('heading', { name: '검색 결과 199명' })).toBeVisible()
  await expect(page.locator('body')).not.toContainText('검색 결과 1명')

  await page.goto('/compare/results/cmp-001')
  await expect(page.getByRole('heading', { name: '그룹 비교', exact: true })).toBeVisible()
  await expect(page.getByText('리포트 요약')).toBeVisible()
  await expect(page.getByRole('heading', { name: '금융 점수' })).toBeVisible()
  await expect(page.getByText('표본 수')).toBeVisible()
  await expect(page.getByRole('heading', { name: '항목별 비교' })).toBeVisible()
  await expect(page.getByRole('button', { name: '코치 해석 보기' })).toBeVisible()

  await page.goto('/profile')
  await expect(page.getByRole('heading', { name: '내 공개 상태' })).toBeVisible()
  await expect(page.locator('.screen-stack > *').first()).toHaveClass(/profile-trust-card/)
  await expect(page.getByText('친구에게 보이는 내 공개 상태')).toBeVisible()
  await expect(page.locator('.profile-trust-card').getByRole('button', { name: '공개 범위 확인' })).toBeVisible()
  await expect(page.getByRole('button', { name: '팔로잉 5명', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: '팔로워 14명', exact: true })).toBeVisible()
  await page.locator('.profile-trust-card').getByRole('button', { name: '공개 범위 확인' }).click()
  await expect(page).toHaveURL(/\/settings\/privacy/)
  await expect(page.getByRole('heading', { name: '공개 범위 설정' })).toBeVisible()

  await page.goto('/profile/following')
  await expect(page.getByRole('heading', { name: '팔로잉', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: '팔로잉 5명', exact: true })).toHaveClass(/is-active/)
  await expect(page.getByRole('heading', { name: '내가 팔로우한 사람' })).toBeVisible()
  await expect(page.locator('.profile-person-row').first()).toContainText('내가 팔로잉')

  await page.goto('/profile/followers')
  await expect(page.getByRole('heading', { name: '팔로워', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: '팔로워 14명', exact: true })).toHaveClass(/is-active/)
  await expect(page.getByRole('heading', { name: '나를 팔로우한 사람' })).toBeVisible()
  await expect(page.locator('.profile-person-row').first()).toContainText('나를 팔로우')
})

test('failed compare filter search keeps the last verified results and filters', async ({ page }) => {
  await loginAsP001(page)
  await page.goto('/compare/filter')
  await expect(page.getByRole('heading', { name: '검색 결과 199명' })).toBeVisible()

  await page.route('**/api/app/compare/filter/search', async (route) => {
    await route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({
        code: 'SEARCH_UNAVAILABLE',
        message: '검색을 잠시 사용할 수 없어요.',
      }),
    })
  })

  await page.getByRole('button', { name: '업종 전체' }).click()
  const jobSheet = page.getByRole('dialog', { name: '업종 선택' })
  await expect(jobSheet).toBeVisible()
  await jobSheet.getByRole('button').nth(1).click()

  await expect(page.getByRole('alert')).toContainText('이전 성공 결과를 보여주고 있어요')
  await expect(page.getByRole('button', { name: '업종 전체' })).toBeVisible()
  await expect(page.getByRole('heading', { name: '검색 결과 199명' })).toBeVisible()
  await expect(page.getByText('마지막 검색이 실패해 이전 결과를 표시 중이에요')).toBeVisible()
  await expect(page.getByRole('button', { name: '검색 성공 후 비교하기' })).toBeDisabled()
})

async function loginAsP001(page: Page) {
  await page.goto('/login')
  await page.getByRole('textbox', { name: '이메일' }).fill('p001@synthetic.finmate.local')
  await page.getByRole('textbox', { name: '비밀번호' }).fill('password123!')
  await page.getByRole('button', { name: '로그인' }).click()
  await page.waitForURL(/\/home/)
}
