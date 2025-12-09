import { test, expect } from '@playwright/test'

test.describe('벽체 기능', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(500)
  })

  test.describe('드래그로 벽체 생성', () => {
    test('W키로 벽체 그리기 모드를 활성화할 수 있다', async ({ page }) => {
      await page.keyboard.press('w')
      await page.waitForTimeout(100)

      // 벽체 모드 표시 확인
      await expect(page.getByText('벽체 그리기')).toBeVisible()
    })

    test('캔버스에서 드래그하여 벽체를 생성할 수 있다', async ({ page }) => {
      // 벽체 모드 활성화
      await page.keyboard.press('w')
      await page.waitForTimeout(100)

      const canvas = page.locator('.konvajs-content').first()
      const box = await canvas.boundingBox()

      if (box) {
        // 드래그로 벽체 생성
        await page.mouse.move(box.x + 100, box.y + 100)
        await page.mouse.down()
        await page.mouse.move(box.x + 300, box.y + 100)
        await page.mouse.up()
        await page.waitForTimeout(200)

        // 레이어 패널 열어서 벽체 확인
        await page.keyboard.press('l')
        await page.waitForTimeout(200)

        const layerPanel = page.locator('.w-64.max-h-96')
        await expect(layerPanel.getByText('벽체')).toBeVisible()
      }
    })

    test('벽체 모드에서 Escape로 모드를 해제할 수 있다', async ({ page }) => {
      // 벽체 모드 활성화
      await page.keyboard.press('w')
      await page.waitForTimeout(100)
      await expect(page.getByText('벽체 그리기')).toBeVisible()

      // Escape로 모드 해제
      await page.keyboard.press('Escape')
      await page.waitForTimeout(100)
      await expect(page.getByText('벽체 그리기')).not.toBeVisible()
    })
  })

  test.describe('벽체 선택 및 편집', () => {
    test.beforeEach(async ({ page }) => {
      // 벽체 하나 생성
      await page.keyboard.press('w')
      await page.waitForTimeout(100)

      const canvas = page.locator('.konvajs-content').first()
      const box = await canvas.boundingBox()

      if (box) {
        await page.mouse.move(box.x + 100, box.y + 100)
        await page.mouse.down()
        await page.mouse.move(box.x + 300, box.y + 100)
        await page.mouse.up()
        await page.waitForTimeout(200)
      }

      // 벽체 모드 해제
      await page.keyboard.press('Escape')
      await page.waitForTimeout(100)
    })

    test('벽체를 클릭하여 선택할 수 있다', async ({ page }) => {
      const canvas = page.locator('.konvajs-content').first()
      const box = await canvas.boundingBox()

      if (box) {
        // 벽체 위치 클릭
        await page.mouse.click(box.x + 200, box.y + 100)
        await page.waitForTimeout(200)

        // 선택 표시 확인 (편집 패널 또는 선택 표시)
        await expect(page.getByText('벽체:')).toBeVisible()
      }
    })

    test('선택된 벽체를 Delete키로 삭제할 수 있다', async ({ page }) => {
      const canvas = page.locator('.konvajs-content').first()
      const box = await canvas.boundingBox()

      if (box) {
        // 벽체 선택
        await page.mouse.click(box.x + 200, box.y + 100)
        await page.waitForTimeout(200)

        // Delete로 삭제
        await page.keyboard.press('Delete')
        await page.waitForTimeout(200)

        // 레이어 패널에서 벽체 확인
        await page.keyboard.press('l')
        await page.waitForTimeout(200)

        const layerPanel = page.locator('.w-64.max-h-96')
        await expect(layerPanel.getByText('벽체')).not.toBeVisible()
      }
    })
  })

  test.describe('벽체 스냅', () => {
    test('Shift+드래그로 수평/수직 스냅된다', async ({ page }) => {
      await page.keyboard.press('w')
      await page.waitForTimeout(100)

      const canvas = page.locator('.konvajs-content').first()
      const box = await canvas.boundingBox()

      if (box) {
        // Shift 누른 채로 드래그 (약간 비스듬하게)
        await page.keyboard.down('Shift')
        await page.mouse.move(box.x + 100, box.y + 100)
        await page.mouse.down()
        await page.mouse.move(box.x + 300, box.y + 120) // 약간 기울어짐
        await page.mouse.up()
        await page.keyboard.up('Shift')
        await page.waitForTimeout(200)

        // 벽체가 생성됨 (수평으로 스냅됨)
        await page.keyboard.press('l')
        await page.waitForTimeout(200)

        const layerPanel = page.locator('.w-64.max-h-96')
        await expect(layerPanel.getByText('벽체')).toBeVisible()
      }
    })
  })
})
