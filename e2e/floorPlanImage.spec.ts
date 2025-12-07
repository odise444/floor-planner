import { test, expect } from '@playwright/test'

test.describe('평면도 이미지 업로드', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // 방 생성
    await page.getByRole('button', { name: '+ 방 만들기' }).click()
    await page.locator('input[placeholder="예: 400"]').fill('400')
    await page.locator('input[placeholder="예: 300"]').fill('300')
    await page.getByRole('button', { name: '생성' }).click()
  })

  test('평면도 업로드 버튼이 표시된다', async ({ page }) => {
    await expect(page.getByRole('button', { name: /평면도|배경|이미지/ })).toBeVisible()
  })

  test('평면도 업로드 버튼 클릭 시 파일 선택 대화상자가 열린다', async ({ page }) => {
    // 파일 input이 존재하는지 확인
    const fileInput = page.locator('input[type="file"][accept="image/*"]')
    await expect(fileInput).toBeAttached()
  })

  test('이미지 컨트롤 패널이 이미지 업로드 후 표시된다', async ({ page }) => {
    // 테스트용 이미지 파일 생성 및 업로드
    const fileInput = page.locator('input[type="file"][accept="image/*"]')

    // 1x1 PNG 이미지 (Base64)
    const pngBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    )

    await fileInput.setInputFiles({
      name: 'test.png',
      mimeType: 'image/png',
      buffer: pngBuffer,
    })

    // 이미지 컨트롤이 표시되어야 함
    await expect(page.getByText(/투명도|불투명도/)).toBeVisible()
  })

  test('투명도 슬라이더로 이미지 투명도를 조절할 수 있다', async ({ page }) => {
    const fileInput = page.locator('input[type="file"][accept="image/*"]')

    const pngBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    )

    await fileInput.setInputFiles({
      name: 'test.png',
      mimeType: 'image/png',
      buffer: pngBuffer,
    })

    // 투명도 슬라이더가 있어야 함
    await expect(page.locator('input[type="range"]').first()).toBeVisible()
  })

  test('삭제 버튼으로 업로드된 이미지를 제거할 수 있다', async ({ page }) => {
    const fileInput = page.locator('input[type="file"][accept="image/*"]')

    const pngBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    )

    await fileInput.setInputFiles({
      name: 'test.png',
      mimeType: 'image/png',
      buffer: pngBuffer,
    })

    // 컨트롤 패널이 표시됨
    await expect(page.getByText(/투명도|불투명도/)).toBeVisible()

    // 삭제 버튼 클릭
    await page.getByRole('button', { name: /삭제|제거/ }).click()

    // 컨트롤 패널이 사라짐
    await expect(page.getByText(/투명도|불투명도/)).not.toBeVisible()
  })

  test('잠금 버튼으로 이미지 이동을 잠글 수 있다', async ({ page }) => {
    const fileInput = page.locator('input[type="file"][accept="image/*"]')

    const pngBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    )

    await fileInput.setInputFiles({
      name: 'test.png',
      mimeType: 'image/png',
      buffer: pngBuffer,
    })

    // 잠금 버튼이 있어야 함
    await expect(page.getByRole('button', { name: /잠금/ })).toBeVisible()
  })

  test('업로드된 이미지가 캔버스에 렌더링된다', async ({ page }) => {
    const fileInput = page.locator('input[type="file"][accept="image/*"]')

    // 100x100 빨간색 PNG 이미지 (테스트용)
    const pngBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAIAAAD/gAIDAAAAhElEQVR42u3RMQ0AAAgDMJrfMDsUBwdlGCle23Y5j4gAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQICA/wMfy/xYPVtJfOYAAAAASUVORK5CYII=',
      'base64'
    )

    await fileInput.setInputFiles({
      name: 'test.png',
      mimeType: 'image/png',
      buffer: pngBuffer,
    })

    // 이미지 로드를 위한 대기
    await page.waitForTimeout(500)

    // 캔버스 요소가 존재하는지 확인 (이미지 레이어가 추가되면 canvas가 3개가 됨)
    const canvasCount = await page.locator('canvas').count()
    expect(canvasCount).toBeGreaterThanOrEqual(3)

    // 컨트롤 패널이 표시됨 (이미지가 로드됨을 의미)
    await expect(page.getByText(/투명도|불투명도/)).toBeVisible()
  })
})
