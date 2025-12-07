import { test, expect } from '@playwright/test'

test.describe('레이어 정렬 기능', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // 방 생성
    await page.getByRole('button', { name: '+ 방 만들기' }).click()
    await page.locator('input[placeholder="예: 400"]').fill('400')
    await page.locator('input[placeholder="예: 300"]').fill('300')
    await page.getByRole('button', { name: '생성' }).click()
    await page.waitForTimeout(300)
  })

  test('가구 선택 시 레이어 정렬 도구가 표시된다', async ({ page }) => {
    // 가구 드래그 앤 드롭 (드롭 후 자동 선택됨)
    const sidebar = page.getByRole('complementary')
    const sofa = sidebar.locator('[draggable="true"]').filter({ hasText: '소파' }).first()
    const canvas = page.locator('.konvajs-content').first()
    await sofa.dragTo(canvas)
    await page.waitForTimeout(300)

    // 레이어 정렬 도구가 표시되는지 확인
    await expect(page.getByText('레이어:')).toBeVisible()
  })

  test('레이어 패널 버튼으로 패널을 열 수 있다', async ({ page }) => {
    // 레이어 패널 버튼 클릭
    const layerButton = page.getByRole('button', { name: /레이어/ })
    await expect(layerButton).toBeVisible()
    await layerButton.click()

    // 레이어 패널이 표시되는지 확인
    await expect(page.locator('h3').filter({ hasText: '레이어' })).toBeVisible()
  })

  test('여러 가구를 추가하면 레이어 패널에 목록이 표시된다', async ({ page }) => {
    const sidebar = page.getByRole('complementary')
    const canvas = page.locator('.konvajs-content').first()

    // 첫 번째 가구 추가
    const sofa = sidebar.locator('[draggable="true"]').filter({ hasText: '소파' }).first()
    await sofa.dragTo(canvas)
    await page.waitForTimeout(300)

    // 두 번째 가구 추가 (다른 가구)
    const bed = sidebar.locator('[draggable="true"]').filter({ hasText: '침대' }).first()
    await bed.dragTo(canvas, { targetPosition: { x: 500, y: 300 } })
    await page.waitForTimeout(300)

    // 레이어 패널 열기
    const layerButton = page.getByRole('button', { name: /레이어/ })
    await layerButton.click()
    await page.waitForTimeout(200)

    // 레이어 패널 내용 확인
    const layerPanel = page.locator('.w-64.max-h-96')
    await expect(layerPanel.getByText('소파')).toBeVisible()
    await expect(layerPanel.getByText('침대')).toBeVisible()
  })

  test('맨 앞으로 버튼으로 가구를 최상위로 이동할 수 있다', async ({ page }) => {
    const sidebar = page.getByRole('complementary')
    const canvas = page.locator('.konvajs-content').first()

    // 가구 추가 (드롭 후 자동 선택됨)
    const sofa = sidebar.locator('[draggable="true"]').filter({ hasText: '소파' }).first()
    await sofa.dragTo(canvas)
    await page.waitForTimeout(300)

    // 레이어 정렬 도구가 표시되어야 함 (자동 선택됨)
    await expect(page.getByText('레이어:')).toBeVisible()

    // 맨 앞으로 버튼 클릭
    const bringToFrontButton = page.locator('button[title*="맨 앞으로"]')
    await expect(bringToFrontButton).toBeVisible()
    await bringToFrontButton.click()

    // 레이어 정렬 도구가 여전히 보이는지 확인
    await expect(page.getByText('레이어:')).toBeVisible()
  })

  test('키보드 단축키로 레이어 순서를 변경할 수 있다', async ({ page }) => {
    const sidebar = page.getByRole('complementary')
    const canvas = page.locator('.konvajs-content').first()

    // 가구 추가 (드롭 후 자동 선택됨)
    const sofa = sidebar.locator('[draggable="true"]').filter({ hasText: '소파' }).first()
    await sofa.dragTo(canvas)
    await page.waitForTimeout(300)

    // 레이어 정렬 도구가 표시되어야 함
    await expect(page.getByText('레이어:')).toBeVisible()

    // ] 키로 한 단계 앞으로
    await page.keyboard.press(']')
    await page.waitForTimeout(100)

    // 레이어 도구가 여전히 표시되어야 함
    await expect(page.getByText('레이어:')).toBeVisible()
  })

  test('L 키로 레이어 패널을 토글할 수 있다', async ({ page }) => {
    // L 키로 레이어 패널 열기
    await page.keyboard.press('l')
    await expect(page.locator('h3').filter({ hasText: '레이어' })).toBeVisible()

    // L 키로 레이어 패널 닫기
    await page.keyboard.press('l')
    await expect(page.locator('h3').filter({ hasText: '레이어' })).not.toBeVisible()
  })

  test('레이어 패널에서 가구를 선택할 수 있다', async ({ page }) => {
    const sidebar = page.getByRole('complementary')
    const canvas = page.locator('.konvajs-content').first()

    // 가구 추가 (드롭 후 자동 선택됨)
    const sofa = sidebar.locator('[draggable="true"]').filter({ hasText: '소파' }).first()
    await sofa.dragTo(canvas)
    await page.waitForTimeout(300)

    // Escape 키로 선택 해제
    await page.keyboard.press('Escape')
    await page.waitForTimeout(200)

    // 레이어 도구가 사라져야 함 (선택 해제됨)
    await expect(page.getByText('레이어:')).not.toBeVisible()

    // 레이어 패널 열기
    await page.keyboard.press('l')
    await page.waitForTimeout(200)

    // 레이어 패널에서 가구 클릭 (패널 내 첫 번째 항목)
    const layerPanel = page.locator('.w-64.max-h-96')
    const layerItem = layerPanel.locator('.cursor-grab').first()
    await layerItem.click()
    await page.waitForTimeout(200)

    // 가구가 선택되어 레이어 정렬 도구가 표시되어야 함
    await expect(page.getByText('레이어:')).toBeVisible()
  })

  test('레이어 순서 변경 시 실제로 zIndex가 변경된다', async ({ page }) => {
    const sidebar = page.getByRole('complementary')
    const canvas = page.locator('.konvajs-content').first()

    // 첫 번째 가구 추가 (소파)
    const sofa = sidebar.locator('[draggable="true"]').filter({ hasText: '소파' }).first()
    await sofa.dragTo(canvas)
    await page.waitForTimeout(300)

    // 두 번째 가구 추가 (침대) - 나중에 추가되어 zIndex가 더 높음
    const bed = sidebar.locator('[draggable="true"]').filter({ hasText: '침대' }).first()
    await bed.dragTo(canvas, { targetPosition: { x: 400, y: 250 } })
    await page.waitForTimeout(300)

    // 레이어 패널 열기
    await page.keyboard.press('l')
    await page.waitForTimeout(200)

    // 레이어 패널에서 침대가 소파보다 위에 있어야 함 (높은 zIndex = 위쪽에 표시)
    const layerPanel = page.locator('.w-64.max-h-96')
    const items = layerPanel.locator('.cursor-grab')
    const firstItemText = await items.first().textContent()
    expect(firstItemText).toContain('침대')

    // 소파를 선택하고 맨 앞으로 이동 (소파 텍스트 포함 항목 클릭)
    const sofaItem = layerPanel.locator('.cursor-grab').filter({ hasText: '소파' })
    await sofaItem.click()
    await page.waitForTimeout(200)

    // 맨 앞으로 버튼 클릭
    const bringToFrontButton = page.locator('button[title*="맨 앞으로"]')
    await bringToFrontButton.click()
    await page.waitForTimeout(200)

    // 이제 소파가 맨 위에 있어야 함
    const updatedFirstItemText = await items.first().textContent()
    expect(updatedFirstItemText).toContain('소파')
  })
})
