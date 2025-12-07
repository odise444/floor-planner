import { test, expect } from '@playwright/test'

test.describe('사용자 정의 가구 기능', () => {
  test.beforeEach(async ({ page }) => {
    // localStorage 초기화
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
    await page.reload()
  })

  test('페이지 로드 시 "내 가구 추가" 버튼이 보인다', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('내 가구 추가')).toBeVisible()
  })

  test('"내 가구 추가" 클릭 시 모달이 열린다', async ({ page }) => {
    await page.goto('/')

    // 버튼 클릭
    await page.getByText('내 가구 추가').click()

    // 모달 확인
    await expect(page.getByRole('heading', { name: '내 가구 추가' })).toBeVisible()
    await expect(page.getByPlaceholder('예: 내 책상')).toBeVisible()
    await expect(page.getByPlaceholder('100')).toBeVisible()
    await expect(page.getByPlaceholder('60')).toBeVisible()
  })

  test('유효한 정보 입력 후 가구가 추가된다', async ({ page }) => {
    await page.goto('/')

    // 모달 열기
    await page.getByText('내 가구 추가').click()

    // 정보 입력
    await page.getByPlaceholder('예: 내 책상').fill('테스트 소파')
    await page.getByPlaceholder('100').fill('180')
    await page.getByPlaceholder('60').fill('90')

    // 추가 버튼 클릭
    await page.getByRole('button', { name: '추가' }).click()

    // 모달이 닫히고 목록에 추가됨
    await expect(page.getByRole('heading', { name: '내 가구 추가' })).not.toBeVisible()
    await expect(page.getByText('테스트 소파')).toBeVisible()
    await expect(page.getByText('180 × 90 cm')).toBeVisible()
  })

  test('이름 없이 추가하면 에러 메시지가 표시된다', async ({ page }) => {
    await page.goto('/')

    // 모달 열기
    await page.getByText('내 가구 추가').click()

    // 이름 없이 추가 시도
    await page.getByRole('button', { name: '추가' }).click()

    // 에러 메시지 확인
    await expect(page.getByText('이름을 입력해주세요')).toBeVisible()
  })

  test('크기가 범위를 벗어나면 에러 메시지가 표시된다', async ({ page }) => {
    await page.goto('/')

    // 모달 열기
    await page.getByText('내 가구 추가').click()

    // 잘못된 크기 입력
    await page.getByPlaceholder('예: 내 책상').fill('테스트')
    await page.getByPlaceholder('100').fill('5')  // 최소값 미만
    await page.getByPlaceholder('60').fill('600')  // 최대값 초과

    await page.getByRole('button', { name: '추가' }).click()

    // 에러 메시지 확인
    await expect(page.getByText('너비는 10cm 이상이어야 합니다')).toBeVisible()
    await expect(page.getByText('높이는 500cm 이하이어야 합니다')).toBeVisible()
  })

  test('취소 버튼 클릭 시 모달이 닫힌다', async ({ page }) => {
    await page.goto('/')

    // 모달 열기
    await page.getByText('내 가구 추가').click()
    await expect(page.getByRole('heading', { name: '내 가구 추가' })).toBeVisible()

    // 취소 클릭 (정확히 일치)
    await page.getByRole('button', { name: '취소', exact: true }).click()

    // 모달이 닫힘
    await expect(page.getByRole('heading', { name: '내 가구 추가' })).not.toBeVisible()
  })

  test('추가한 가구를 삭제할 수 있다', async ({ page }) => {
    await page.goto('/')

    // 가구 추가
    await page.getByText('내 가구 추가').click()
    await page.getByPlaceholder('예: 내 책상').fill('삭제할 가구')
    await page.getByPlaceholder('100').fill('100')
    await page.getByPlaceholder('60').fill('50')
    await page.getByRole('button', { name: '추가' }).click()

    // 가구가 추가됨
    await expect(page.getByText('삭제할 가구')).toBeVisible()

    // 삭제 버튼 클릭 (hover 시 나타남)
    const furnitureItem = page.locator('.bg-blue-50').filter({ hasText: '삭제할 가구' })
    await furnitureItem.hover()
    await furnitureItem.getByRole('button', { name: '✕' }).click()

    // 가구가 삭제됨
    await expect(page.getByText('삭제할 가구')).not.toBeVisible()
  })

  test('추가한 가구를 캔버스에 드래그 앤 드롭할 수 있다', async ({ page }) => {
    await page.goto('/')

    // 가구 추가
    await page.getByText('내 가구 추가').click()
    await page.getByPlaceholder('예: 내 책상').fill('드래그용가구')
    await page.getByPlaceholder('100').fill('120')
    await page.getByPlaceholder('60').fill('60')
    await page.getByRole('button', { name: '추가' }).click()

    // 사이드바에 가구가 추가됨
    const sidebar = page.getByRole('complementary')
    await expect(sidebar.getByText('드래그용가구')).toBeVisible()

    // 가구 드래그 앤 드롭
    const furnitureItem = sidebar.locator('.bg-blue-50').filter({ hasText: '드래그용가구' })
    const canvas = page.locator('.konvajs-content').first()

    await furnitureItem.dragTo(canvas)

    // 가구가 배치되면 자동 선택됨, Enter 키로 편집 폼 열기
    await page.keyboard.press('Enter')
    await expect(page.getByText('📝 가구 편집')).toBeVisible()
    // 편집 폼 내 이름 입력란에 가구 이름이 표시됨
    await expect(page.locator('input[type="text"]').first()).toHaveValue('드래그용가구')
  })

  test('페이지 새로고침 후에도 저장된 가구가 유지된다', async ({ page }) => {
    await page.goto('/')

    // 가구 추가
    await page.getByText('내 가구 추가').click()
    await page.getByPlaceholder('예: 내 책상').fill('저장 테스트')
    await page.getByPlaceholder('100').fill('150')
    await page.getByPlaceholder('60').fill('80')
    await page.getByRole('button', { name: '추가' }).click()

    await expect(page.getByText('저장 테스트')).toBeVisible()

    // 페이지 새로고침
    await page.reload()

    // 가구가 여전히 표시됨
    await expect(page.getByText('저장 테스트')).toBeVisible()
    await expect(page.getByText('150 × 80 cm')).toBeVisible()
  })
})
