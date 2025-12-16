import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  saveFloorPlan,
  loadFloorPlan,
  clearFloorPlan,
  hasFloorPlanData,
  importFromJson,
  type FloorPlanData,
  type Room,
} from '~/utils/floorPlanStorage'

// localStorage 모킹
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} },
  }
})()

Object.defineProperty(global, 'localStorage', { value: localStorageMock })

describe('floorPlanStorage', () => {
  const mockRoom: Room = {
    x: 100,
    y: 100,
    width: 800,
    height: 600,
  }

  const mockFurniture = [
    {
      id: 'bed-1',
      name: '침대',
      x: 150,
      y: 150,
      width: 200,
      height: 150,
      color: '#8b5cf6',
      rotation: 0,
    },
  ]

  const mockDoor = [
    {
      id: 'door-1',
      x: 200,
      y: 100,
      width: 90,
      wall: 'top' as const,
      openDirection: 'inside' as const,
      hingeSide: 'left' as const,
    },
  ]

  beforeEach(() => {
    localStorageMock.clear()
  })

  describe('saveFloorPlan', () => {
    it('평면도 데이터를 localStorage에 저장해야 함', () => {
      saveFloorPlan({
        room: mockRoom,
        furnitureList: mockFurniture,
        doorList: mockDoor,
      })

      const saved = localStorageMock.getItem('floor-plan-data')
      expect(saved).not.toBeNull()

      const parsed = JSON.parse(saved!)
      expect(parsed.version).toBe('1.1')
      expect(parsed.room).toEqual(mockRoom)
      expect(parsed.furnitureList).toEqual(mockFurniture)
      expect(parsed.doorList).toEqual(mockDoor)
      expect(parsed.savedAt).toBeDefined()
    })

    it('room이 null인 경우도 저장해야 함', () => {
      saveFloorPlan({
        room: null,
        furnitureList: [],
        doorList: [],
      })

      const saved = localStorageMock.getItem('floor-plan-data')
      const parsed = JSON.parse(saved!)
      expect(parsed.room).toBeNull()
    })
  })

  describe('loadFloorPlan', () => {
    it('저장된 데이터를 불러와야 함', () => {
      saveFloorPlan({
        room: mockRoom,
        furnitureList: mockFurniture,
        doorList: mockDoor,
      })

      const loaded = loadFloorPlan()
      expect(loaded).not.toBeNull()
      expect(loaded!.room).toEqual(mockRoom)
      expect(loaded!.furnitureList).toEqual(mockFurniture)
      expect(loaded!.doorList).toEqual(mockDoor)
    })

    it('저장된 데이터가 없으면 null을 반환해야 함', () => {
      const loaded = loadFloorPlan()
      expect(loaded).toBeNull()
    })

    it('잘못된 JSON이 저장된 경우 null을 반환해야 함', () => {
      localStorageMock.setItem('floor-plan-data', 'invalid json')
      const loaded = loadFloorPlan()
      expect(loaded).toBeNull()
    })
  })

  describe('clearFloorPlan', () => {
    it('저장된 데이터를 삭제해야 함', () => {
      saveFloorPlan({
        room: mockRoom,
        furnitureList: mockFurniture,
        doorList: mockDoor,
      })

      clearFloorPlan()

      const loaded = loadFloorPlan()
      expect(loaded).toBeNull()
    })
  })

  describe('hasFloorPlanData', () => {
    it('데이터가 있으면 true를 반환해야 함', () => {
      saveFloorPlan({
        room: mockRoom,
        furnitureList: [],
        doorList: [],
      })

      expect(hasFloorPlanData()).toBe(true)
    })

    it('데이터가 없으면 false를 반환해야 함', () => {
      expect(hasFloorPlanData()).toBe(false)
    })
  })

  describe('importFromJson', () => {
    it('유효한 JSON 파일을 파싱해야 함', async () => {
      const mockData: FloorPlanData = {
        version: '1.0',
        room: mockRoom,
        furnitureList: mockFurniture,
        doorList: mockDoor,
        savedAt: new Date().toISOString(),
      }

      const file = new File(
        [JSON.stringify(mockData)],
        'test.json',
        { type: 'application/json' }
      )

      const result = await importFromJson(file)
      expect(result.room).toEqual(mockRoom)
      expect(result.furnitureList).toEqual(mockFurniture)
      expect(result.doorList).toEqual(mockDoor)
    })

    it('잘못된 JSON 파일은 에러를 발생시켜야 함', async () => {
      const file = new File(
        ['invalid json'],
        'test.json',
        { type: 'application/json' }
      )

      await expect(importFromJson(file)).rejects.toThrow('잘못된 파일 형식입니다.')
    })
  })
})
