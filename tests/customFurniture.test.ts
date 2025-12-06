import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  createCustomFurniture,
  validateFurnitureDimensions,
  getCustomFurnitureList,
  saveCustomFurniture,
  deleteCustomFurniture,
  STORAGE_KEY,
} from '~/utils/customFurniture'

describe('커스텀 가구 생성', () => {
  it('유효한 입력으로 커스텀 가구를 생성할 수 있다', () => {
    const furniture = createCustomFurniture({
      name: '내 책상',
      width: 150,
      height: 80,
      color: '#ff5733',
    })

    expect(furniture.id).toBeDefined()
    expect(furniture.id).toMatch(/^custom-/)
    expect(furniture.name).toBe('내 책상')
    expect(furniture.width).toBe(150)
    expect(furniture.height).toBe(80)
    expect(furniture.color).toBe('#ff5733')
    expect(furniture.isCustom).toBe(true)
  })

  it('색상을 지정하지 않으면 기본 색상이 적용된다', () => {
    const furniture = createCustomFurniture({
      name: '테스트 가구',
      width: 100,
      height: 50,
    })

    expect(furniture.color).toBe('#9ca3af') // 기본 회색
  })

  it('각 가구는 고유한 ID를 가진다', () => {
    const furniture1 = createCustomFurniture({ name: '가구1', width: 100, height: 50 })
    const furniture2 = createCustomFurniture({ name: '가구2', width: 100, height: 50 })

    expect(furniture1.id).not.toBe(furniture2.id)
  })
})

describe('가구 크기 유효성 검사', () => {
  it('유효한 크기는 통과한다', () => {
    const result = validateFurnitureDimensions(100, 50)
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('너비가 최소값(10cm) 미만이면 에러', () => {
    const result = validateFurnitureDimensions(5, 50)
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('너비는 10cm 이상이어야 합니다')
  })

  it('높이가 최소값(10cm) 미만이면 에러', () => {
    const result = validateFurnitureDimensions(100, 5)
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('높이는 10cm 이상이어야 합니다')
  })

  it('너비가 최대값(500cm) 초과이면 에러', () => {
    const result = validateFurnitureDimensions(600, 50)
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('너비는 500cm 이하이어야 합니다')
  })

  it('높이가 최대값(500cm) 초과이면 에러', () => {
    const result = validateFurnitureDimensions(100, 600)
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('높이는 500cm 이하이어야 합니다')
  })

  it('숫자가 아닌 값은 에러', () => {
    const result = validateFurnitureDimensions(NaN, 50)
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('유효한 숫자를 입력해주세요')
  })

  it('여러 에러가 동시에 발생할 수 있다', () => {
    const result = validateFurnitureDimensions(5, 600)
    expect(result.valid).toBe(false)
    expect(result.errors.length).toBeGreaterThanOrEqual(2)
  })
})

describe('커스텀 가구 저장/불러오기 (localStorage)', () => {
  // localStorage mock
  let store: Record<string, string> = {}

  beforeEach(() => {
    store = {}
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => { store[key] = value },
      removeItem: (key: string) => { delete store[key] },
      clear: () => { store = {} },
    })
  })

  it('빈 상태에서 목록을 불러오면 빈 배열 반환', () => {
    const list = getCustomFurnitureList()
    expect(list).toEqual([])
  })

  it('커스텀 가구를 저장할 수 있다', () => {
    const furniture = createCustomFurniture({
      name: '내 소파',
      width: 200,
      height: 100,
    })

    saveCustomFurniture(furniture)

    const list = getCustomFurnitureList()
    expect(list).toHaveLength(1)
    expect(list[0].name).toBe('내 소파')
  })

  it('여러 커스텀 가구를 저장할 수 있다', () => {
    const furniture1 = createCustomFurniture({ name: '가구1', width: 100, height: 50 })
    const furniture2 = createCustomFurniture({ name: '가구2', width: 150, height: 80 })

    saveCustomFurniture(furniture1)
    saveCustomFurniture(furniture2)

    const list = getCustomFurnitureList()
    expect(list).toHaveLength(2)
  })

  it('커스텀 가구를 삭제할 수 있다', () => {
    const furniture = createCustomFurniture({
      name: '삭제할 가구',
      width: 100,
      height: 50,
    })

    saveCustomFurniture(furniture)
    expect(getCustomFurnitureList()).toHaveLength(1)

    deleteCustomFurniture(furniture.id)
    expect(getCustomFurnitureList()).toHaveLength(0)
  })

  it('존재하지 않는 ID로 삭제해도 에러가 발생하지 않는다', () => {
    expect(() => deleteCustomFurniture('non-existent-id')).not.toThrow()
  })

  it('같은 ID의 가구를 저장하면 덮어쓰기 된다', () => {
    const furniture = createCustomFurniture({
      name: '원본',
      width: 100,
      height: 50,
    })

    saveCustomFurniture(furniture)

    const updated = { ...furniture, name: '수정됨' }
    saveCustomFurniture(updated)

    const list = getCustomFurnitureList()
    expect(list).toHaveLength(1)
    expect(list[0].name).toBe('수정됨')
  })
})
