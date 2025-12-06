import { test, expect } from '@playwright/test'

test.describe('오브젝트 편집 기능', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // 방 생성
    await page.getByRole('button', { name: '+ 방 만들기' }).click()
    await page.locator('input[placeholder="예: 400"]').fill('400')
    await page.locator('input[placeholder="예: 300"]').fill('300')
    await page.getByRole('button', { name: '생성' }).click()
  })

  test.describe('가구 편집', () => {
    test.beforeEach(async ({ page }) => {
      // 가구 배치 (드롭 후 자동 선택됨)
      const sidebar = page.getByRole('complementary')
      const sofa = sidebar.locator('[draggable="true"]').filter({ hasText: '소파' }).first()
      const canvas = page.locator('.konvajs-content').first()
      await sofa.dragTo(canvas)

      // Enter 키로 편집 폼 열기 (가구가 이미 선택된 상태)
      await page.keyboard.press('Enter')
    })

    test('Enter 키로 편집 폼이 표시된다', async ({ page }) => {
      await expect(page.getByText('📝 가구 편집')).toBeVisible()
    })

    test('가구 이름을 수정할 수 있다', async ({ page }) => {
      // 이름 수정
      const nameInput = page.locator('input[type="text"]').first()
      await nameInput.fill('수정된 소파')

      // 적용
      await page.getByRole('button', { name: '적용' }).click()

      // 폼에서 이름이 변경됨 확인
      await expect(nameInput).toHaveValue('수정된 소파')
    })

    test('가구 크기를 수정할 수 있다', async ({ page }) => {
      // 크기 수정
      const widthInput = page.locator('input[type="number"]').first()
      const heightInput = page.locator('input[type="number"]').nth(1)

      await widthInput.fill('300')
      await heightInput.fill('150')

      // 적용
      await page.getByRole('button', { name: '적용' }).click()

      // 폼이 업데이트됨 (다시 클릭해서 확인)
      await expect(widthInput).toHaveValue('300')
      await expect(heightInput).toHaveValue('150')
    })

    test('가구 색상을 수정할 수 있다', async ({ page }) => {
      // 색상 수정 (텍스트 입력)
      const colorTextInput = page.locator('input[type="text"]').nth(1)
      await colorTextInput.fill('#ff0000')

      // 적용
      await page.getByRole('button', { name: '적용' }).click()

      // 색상이 변경됨
      await expect(colorTextInput).toHaveValue('#ff0000')
    })

    test('가구 회전을 수정할 수 있다', async ({ page }) => {
      // 회전 수정 (첫 번째 select가 회전)
      const rotationSelect = page.locator('select').first()
      await rotationSelect.selectOption('90')

      // 적용
      await page.getByRole('button', { name: '적용' }).click()

      // 회전이 변경됨
      await expect(rotationSelect).toHaveValue('90')
    })

    test('삭제 버튼으로 가구를 삭제할 수 있다', async ({ page }) => {
      // 삭제
      await page.getByRole('button', { name: '삭제' }).click()

      // 편집 폼이 사라짐
      await expect(page.getByText('📝 가구 편집')).not.toBeVisible()
    })

    test('닫기 버튼으로 폼을 닫을 수 있다', async ({ page }) => {
      // 닫기
      await page.getByRole('button', { name: '닫기' }).click()

      // 편집 폼이 사라짐
      await expect(page.getByText('📝 가구 편집')).not.toBeVisible()
    })

    test('빈 이름 입력 시 에러 표시', async ({ page }) => {
      // 이름 지우기
      const nameInput = page.locator('input[type="text"]').first()
      await nameInput.fill('')

      // 적용 시도
      await page.getByRole('button', { name: '적용' }).click()

      // 에러 메시지 표시
      await expect(page.getByText('이름을 입력해주세요')).toBeVisible()
    })

    test('0 이하 크기 입력 시 에러 표시', async ({ page }) => {
      // 크기를 0으로
      const widthInput = page.locator('input[type="number"]').first()
      await widthInput.fill('0')

      // 적용 시도
      await page.getByRole('button', { name: '적용' }).click()

      // 에러 메시지 표시
      await expect(page.getByText('너비는 양수여야 합니다')).toBeVisible()
    })

    test('Escape 키로 편집 폼을 닫을 수 있다', async ({ page }) => {
      // 편집 폼이 보이는지 확인
      await expect(page.getByText('📝 가구 편집')).toBeVisible()

      // Escape 키 누르기
      await page.keyboard.press('Escape')

      // 편집 폼이 사라짐
      await expect(page.getByText('📝 가구 편집')).not.toBeVisible()
    })

    test('회전 선택으로 90도 단위 회전이 가능하다', async ({ page }) => {
      // 현재 회전 값 확인 (첫 번째 select가 회전)
      const rotationSelect = page.locator('select').first()
      await expect(rotationSelect).toHaveValue('0')

      // 모든 회전 옵션 확인
      const options = await rotationSelect.locator('option').allTextContents()
      expect(options).toContain('0°')
      expect(options).toContain('90°')
      expect(options).toContain('180°')
      expect(options).toContain('270°')

      // 270도로 변경
      await rotationSelect.selectOption('270')
      await page.getByRole('button', { name: '적용' }).click()

      // 값이 변경됨
      await expect(rotationSelect).toHaveValue('270')
    })
  })

  test.describe('문 편집', () => {
    test.beforeEach(async ({ page }) => {
      // 문 추가 (추가 후 자동 선택됨)
      await page.getByText('문 추가').click()
      await page.getByRole('button', { name: '추가' }).click()

      // Enter 키로 편집 폼 열기 (문이 이미 선택된 상태)
      await page.keyboard.press('Enter')
    })

    test('Enter 키로 편집 폼이 표시된다', async ({ page }) => {
      await expect(page.getByText('🚪 문 편집')).toBeVisible()
    })

    test('문 너비를 수정할 수 있다', async ({ page }) => {
      // 너비 수정
      const widthInput = page.locator('input[type="number"]').first()
      await widthInput.fill('100')

      // 적용
      await page.getByRole('button', { name: '적용' }).click()

      // 값이 업데이트됨
      await expect(widthInput).toHaveValue('100')
    })

    test('문 열림 방향을 변경할 수 있다', async ({ page }) => {
      // 바깥쪽 선택
      await page.getByLabel('바깥쪽').check()

      // 적용
      await page.getByRole('button', { name: '적용' }).click()

      // 바깥쪽이 선택됨
      await expect(page.getByLabel('바깥쪽')).toBeChecked()
    })

    test('문 경첩 위치를 변경할 수 있다', async ({ page }) => {
      // 오른쪽 선택
      await page.getByLabel('오른쪽').check()

      // 적용
      await page.getByRole('button', { name: '적용' }).click()

      // 오른쪽이 선택됨
      await expect(page.getByLabel('오른쪽')).toBeChecked()
    })

    test('삭제 버튼으로 문을 삭제할 수 있다', async ({ page }) => {
      // 삭제
      await page.getByRole('button', { name: '삭제' }).click()

      // 편집 폼이 사라짐
      await expect(page.getByText('🚪 문 편집')).not.toBeVisible()
    })

    test('닫기 버튼으로 폼을 닫을 수 있다', async ({ page }) => {
      // 닫기
      await page.getByRole('button', { name: '닫기' }).click()

      // 편집 폼이 사라짐
      await expect(page.getByText('🚪 문 편집')).not.toBeVisible()
    })

    test('0 이하 너비 입력 시 에러 표시', async ({ page }) => {
      // 너비를 0으로
      const widthInput = page.locator('input[type="number"]').first()
      await widthInput.fill('0')

      // 적용 시도
      await page.getByRole('button', { name: '적용' }).click()

      // 에러 메시지 표시
      await expect(page.getByText('너비는 양수여야 합니다')).toBeVisible()
    })
  })
})
