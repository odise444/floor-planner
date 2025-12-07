import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  validateImageFile,
  createImageDataUrl,
  parseImageDimensions,
  createFloorPlanImage,
  type FloorPlanImage,
} from '../app/utils/floorPlanImage'

describe('floorPlanImage', () => {
  describe('validateImageFile', () => {
    it('유효한 이미지 파일을 허용한다 (PNG)', () => {
      const file = new File([''], 'test.png', { type: 'image/png' })
      const result = validateImageFile(file)
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('유효한 이미지 파일을 허용한다 (JPEG)', () => {
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' })
      const result = validateImageFile(file)
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('유효한 이미지 파일을 허용한다 (GIF)', () => {
      const file = new File([''], 'test.gif', { type: 'image/gif' })
      const result = validateImageFile(file)
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('유효한 이미지 파일을 허용한다 (WebP)', () => {
      const file = new File([''], 'test.webp', { type: 'image/webp' })
      const result = validateImageFile(file)
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('지원하지 않는 파일 형식을 거부한다', () => {
      const file = new File([''], 'test.pdf', { type: 'application/pdf' })
      const result = validateImageFile(file)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('지원하지 않는 파일 형식입니다. (PNG, JPEG, GIF, WebP)')
    })

    it('너무 큰 파일을 거부한다 (10MB 초과)', () => {
      const largeContent = new Array(11 * 1024 * 1024).fill('a').join('')
      const file = new File([largeContent], 'large.png', { type: 'image/png' })
      const result = validateImageFile(file)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('파일 크기가 10MB를 초과합니다.')
    })

    it('10MB 이하 파일을 허용한다', () => {
      const content = new Array(5 * 1024 * 1024).fill('a').join('')
      const file = new File([content], 'medium.png', { type: 'image/png' })
      const result = validateImageFile(file)
      expect(result.valid).toBe(true)
    })
  })

  describe('parseImageDimensions', () => {
    it('이미지 크기를 파싱한다', () => {
      const result = parseImageDimensions(800, 600)
      expect(result.width).toBe(800)
      expect(result.height).toBe(600)
      expect(result.aspectRatio).toBeCloseTo(800 / 600)
    })

    it('정사각형 이미지를 처리한다', () => {
      const result = parseImageDimensions(500, 500)
      expect(result.aspectRatio).toBe(1)
    })

    it('세로가 긴 이미지를 처리한다', () => {
      const result = parseImageDimensions(400, 800)
      expect(result.aspectRatio).toBeCloseTo(0.5)
    })
  })

  describe('createFloorPlanImage', () => {
    it('평면도 이미지 객체를 생성한다', () => {
      const dataUrl = 'data:image/png;base64,abc123'
      const result = createFloorPlanImage(dataUrl, 800, 600, 'test.png')

      expect(result.id).toBeDefined()
      expect(result.dataUrl).toBe(dataUrl)
      expect(result.width).toBe(800)
      expect(result.height).toBe(600)
      expect(result.originalName).toBe('test.png')
      expect(result.x).toBe(0)
      expect(result.y).toBe(0)
      expect(result.scale).toBe(1)
      expect(result.opacity).toBe(0.5)
      expect(result.locked).toBe(false)
    })

    it('고유한 ID를 생성한다', () => {
      const img1 = createFloorPlanImage('data:1', 100, 100, 'a.png')
      const img2 = createFloorPlanImage('data:2', 100, 100, 'b.png')
      expect(img1.id).not.toBe(img2.id)
    })
  })

  describe('FloorPlanImage 타입', () => {
    it('모든 필수 속성을 가진다', () => {
      const image: FloorPlanImage = {
        id: 'test-id',
        dataUrl: 'data:image/png;base64,abc',
        width: 800,
        height: 600,
        originalName: 'floor.png',
        x: 100,
        y: 50,
        scale: 0.8,
        opacity: 0.7,
        locked: true,
      }

      expect(image.id).toBe('test-id')
      expect(image.x).toBe(100)
      expect(image.y).toBe(50)
      expect(image.scale).toBe(0.8)
      expect(image.opacity).toBe(0.7)
      expect(image.locked).toBe(true)
    })
  })
})
