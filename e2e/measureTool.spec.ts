import { test, expect } from '@playwright/test'

test.describe('측정 도구', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // 방 생성
    await page.getByRole('button', { name: '+ 방 만들기' }).click()
    await page.locator('input[placeholder="예: 400"]').fill('400')
    await page.locator('input[placeholder="예: 300"]').fill('300')
    await page.getByRole('button', { name: '생성' }).click()
  })

  test('측정 도구 버튼이 표시된다', async ({ page }) => {
    await expect(page.getByRole('button', { name: /측정/ })).toBeVisible()
  })

  test('측정 모드를 활성화할 수 있다', async ({ page }) => {
    // 측정 버튼 클릭
    await page.getByRole('button', { name: /측정/ }).click()

    // 측정 모드 활성화 표시 확인
    await expect(page.getByText('측정 모드')).toBeVisible()
  })

  test('측정 모드에서 캔버스를 클릭하면 시작점이 설정된다', async ({ page }) => {
    // 측정 모드 활성화
    await page.getByRole('button', { name: /측정/ }).click()

    // 캔버스 클릭
    const canvas = page.locator('.konvajs-content').first()
    await canvas.click({ position: { x: 100, y: 100 } })

    // 시작점 표시 확인 (점 또는 "시작점 설정됨" 메시지)
    await expect(page.getByText(/시작점|클릭하여/)).toBeVisible()
  })

  test('측정 모드에서 M키로 토글할 수 있다', async ({ page }) => {
    // M키로 측정 모드 활성화
    await page.keyboard.press('m')
    await expect(page.getByText('측정 모드')).toBeVisible()

    // M키로 측정 모드 비활성화
    await page.keyboard.press('m')
    await expect(page.getByText('측정 모드')).not.toBeVisible()
  })

  test('Escape 키로 측정 모드를 종료할 수 있다', async ({ page }) => {
    // 측정 모드 활성화
    await page.getByRole('button', { name: /측정/ }).click()
    await expect(page.getByText('측정 모드')).toBeVisible()

    // Escape 키 누르기
    await page.keyboard.press('Escape')

    // 측정 모드 종료 확인
    await expect(page.getByText('측정 모드')).not.toBeVisible()
  })

  test('측정 결과를 삭제할 수 있다', async ({ page }) => {
    // 측정 모드 활성화 후 측정 수행
    await page.getByRole('button', { name: /측정/ }).click()

    const canvas = page.locator('.konvajs-content').first()
    await canvas.click({ position: { x: 100, y: 100 } })
    await canvas.click({ position: { x: 200, y: 100 } })

    // 측정 완료 후 초기화 버튼이 표시되어야 함
    await expect(page.getByRole('button', { name: /초기화/ })).toBeVisible()

    // 측정 초기화 버튼 클릭
    await page.getByRole('button', { name: /초기화/ }).click()

    // 초기화 버튼이 사라짐 확인 (측정이 없으면 버튼도 숨김)
    await expect(page.getByRole('button', { name: /초기화/ })).not.toBeVisible()
  })
})
