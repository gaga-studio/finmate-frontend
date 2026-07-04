import { expect, test, type Page } from '@playwright/test'

test('full synthetic dataset renders core logged-in routes without mutating DB', async ({ page }) => {
  await loginAsP001(page)

  await expect(page).toHaveURL(/\/home/)
  await expect(page.getByRole('heading', { name: /좋은 아침/ })).toBeVisible()
  await expect(page.getByRole('heading', { name: '오늘의 예산' })).toBeVisible()
  await expect(page.getByText('친구 5명의 공개 금융 활동 기준')).toBeVisible()

  await page.goto('/compare')
  await expect(page.getByRole('heading', { name: '나와 비슷한 사람들은 어떻게 관리하고 있을까?' })).toBeVisible()
  await expect(page.getByRole('tab', { name: '그룹 비교', exact: true })).toHaveAttribute('aria-selected', 'true')
  await expect(page.getByRole('heading', { name: 'AI 추천 그룹' })).toBeVisible()
  await expect(page.getByRole('button', { name: /미리보기/ }).first()).toBeVisible()

  await page.goto('/records')
  await expect(page.getByRole('heading', { name: '기록', exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: '2026년 6월', exact: true })).toBeVisible()
  await expect(page.getByText('37,800')).toBeVisible()
  await expect(page.getByText('₩27,100')).toBeVisible()
  await expect(page.getByText('₩34,000')).toBeVisible()

  await page.goto('/compare/filter')
  await expect(page.getByRole('heading', { name: '필터링 조회' })).toBeVisible()
  await expect(page.getByText('전체 조건')).toBeVisible()
  await expect(page.getByRole('heading', { name: '검색 결과 199명' })).toBeVisible()
  await expect(page.locator('body')).not.toContainText('검색 결과 1명')

  await page.goto('/compare/results/cmp-001')
  await expect(page.getByRole('heading', { name: '그룹 리포트' })).toBeVisible()
  await expect(page.getByText('그룹 주요 특징')).toBeVisible()
  await expect(page.getByText('소비 성향 요약')).toBeVisible()
  await expect(page.getByRole('button', { name: '나와 비교하기' })).toBeVisible()

  await page.goto('/profile/detail')
  await expect(page.getByRole('heading', { name: '내 프로필 상세' })).toBeVisible()
  await expect(page.getByText('연 소득')).toBeVisible()
  await expect(page.getByText('총 금융자산')).toBeVisible()
  await expect(page.getByRole('heading', { name: '금융자산' })).toBeVisible()

  await page.goto('/profile/detail/synthetic-P002')
  await expect(page.getByRole('heading', { name: '프로필 상세' })).toBeVisible()
  await expect(page.getByText('실명, 계좌번호, 거래번호는 숨겨져요.')).toBeVisible()
  await expect(page.locator('body')).not.toContainText('지우')

  await page.goto('/profile/detail/synthetic-P002/assets/investment')
  await expect(page.getByRole('heading', { name: '투자' })).toBeVisible()
  await expect(page.getByText('연결 상품')).toBeVisible()
  await expect(page.locator('body')).not.toContainText(/accountNumber|cardNumber|transactionId|account_number|card_number|transaction_id/)

  await page.goto('/profile')
  await expect(page.getByRole('heading', { name: '하민', exact: true })).toBeVisible()
  await expect(page.getByRole('navigation', { name: '프로필 바로가기' })).toBeVisible()
  await expect(page.getByRole('button', { name: '상세 프로필' })).toBeVisible()
  await expect(page.getByRole('button', { name: '친구' })).toBeVisible()
  await expect(page.getByRole('heading', { name: '금융 생활 분포' })).toBeVisible()
  await expect(page.getByRole('heading', { name: '팔로잉 TOP 5 금융 활동' })).toBeVisible()

  await page.goto('/profile/following')
  await expect(page.getByRole('heading', { name: '팔로잉', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: '팔로잉 5명', exact: true })).toHaveClass(/is-active/)
  await expect(page.getByRole('heading', { name: '내가 팔로우한 사람' })).toBeVisible()
  await expect(page.getByRole('button', { name: /실친/ }).first()).toBeVisible()

  await page.goto('/profile/followers')
  await expect(page.getByRole('heading', { name: '팔로워', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: '팔로워 14명', exact: true })).toHaveClass(/is-active/)
  await expect(page.getByRole('heading', { name: '나를 팔로우한 사람' })).toBeVisible()
  await expect(page.getByRole('button', { name: /실친/ }).first()).toBeVisible()
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
