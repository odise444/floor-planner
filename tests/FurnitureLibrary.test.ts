import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import FurnitureLibrary from '~/components/sidebar/FurnitureLibrary.vue'
import * as customFurnitureModule from '~/utils/customFurniture'

// localStorage mock
let store: Record<string, string> = {}

vi.stubGlobal('localStorage', {
  getItem: (key: string) => store[key] || null,
  setItem: (key: string, value: string) => { store[key] = value },
  removeItem: (key: string) => { delete store[key] },
  clear: () => { store = {} },
})

describe('FurnitureLibrary 컴포넌트', () => {
  beforeEach(() => {
    store = {}
  })

  it('기본 가구 목록을 렌더링한다', () => {
    const wrapper = mount(FurnitureLibrary)

    expect(wrapper.text()).toContain('소파')
    expect(wrapper.text()).toContain('싱글 침대')
    expect(wrapper.text()).toContain('책상')
  })

  it('"내 가구 추가" 버튼이 있다', () => {
    const wrapper = mount(FurnitureLibrary)

    expect(wrapper.text()).toContain('내 가구 추가')
  })

  it('"내 가구 추가" 클릭 시 모달이 열린다', async () => {
    const wrapper = mount(FurnitureLibrary)

    // 모달이 처음에는 없음
    expect(wrapper.find('.fixed').exists()).toBe(false)

    // 버튼 클릭
    const addButton = wrapper.findAll('.border-dashed').find(el => el.text().includes('내 가구 추가'))
    await addButton?.trigger('click')

    // 모달이 열림
    expect(wrapper.find('.fixed').exists()).toBe(true)
    expect(wrapper.text()).toContain('이름')
    expect(wrapper.text()).toContain('너비 (cm)')
    expect(wrapper.text()).toContain('높이 (cm)')
  })

  it('모달에서 취소 버튼 클릭 시 모달이 닫힌다', async () => {
    const wrapper = mount(FurnitureLibrary)

    // 모달 열기
    const addButton = wrapper.findAll('.border-dashed').find(el => el.text().includes('내 가구 추가'))
    await addButton?.trigger('click')
    expect(wrapper.find('.fixed').exists()).toBe(true)

    // 취소 버튼 클릭
    const cancelButton = wrapper.findAll('button').find(el => el.text() === '취소')
    await cancelButton?.trigger('click')

    // 모달이 닫힘
    expect(wrapper.find('.fixed').exists()).toBe(false)
  })

  it('유효한 가구 정보 입력 후 추가하면 목록에 표시된다', async () => {
    const wrapper = mount(FurnitureLibrary)

    // 모달 열기
    const addButton = wrapper.findAll('.border-dashed').find(el => el.text().includes('내 가구 추가'))
    await addButton?.trigger('click')

    // 입력
    const inputs = wrapper.findAll('input')
    const nameInput = inputs[0]
    const widthInput = inputs[1]
    const heightInput = inputs[2]

    await nameInput.setValue('테스트 책상')
    await widthInput.setValue(120)
    await heightInput.setValue(60)

    // 추가 버튼 클릭
    const submitButton = wrapper.findAll('button').find(el => el.text() === '추가')
    await submitButton?.trigger('click')
    await nextTick()

    // 목록에 표시됨
    expect(wrapper.text()).toContain('테스트 책상')
    expect(wrapper.text()).toContain('120 × 60 cm')
  })

  it('이름 없이 추가하면 에러 메시지가 표시된다', async () => {
    const wrapper = mount(FurnitureLibrary)

    // 모달 열기
    const addButton = wrapper.findAll('.border-dashed').find(el => el.text().includes('내 가구 추가'))
    await addButton?.trigger('click')

    // 이름 없이 추가 시도
    const submitButton = wrapper.findAll('button').find(el => el.text() === '추가')
    await submitButton?.trigger('click')

    // 에러 메시지 표시
    expect(wrapper.text()).toContain('이름을 입력해주세요')
  })

  it('크기가 범위를 벗어나면 에러 메시지가 표시된다', async () => {
    const wrapper = mount(FurnitureLibrary)

    // 모달 열기
    const addButton = wrapper.findAll('.border-dashed').find(el => el.text().includes('내 가구 추가'))
    await addButton?.trigger('click')

    // 입력
    const inputs = wrapper.findAll('input')
    await inputs[0].setValue('테스트')
    await inputs[1].setValue(5)  // 최소값(10) 미만
    await inputs[2].setValue(600)  // 최대값(500) 초과

    // 추가 시도
    const submitButton = wrapper.findAll('button').find(el => el.text() === '추가')
    await submitButton?.trigger('click')

    // 에러 메시지 표시
    expect(wrapper.text()).toContain('너비는 10cm 이상이어야 합니다')
    expect(wrapper.text()).toContain('높이는 500cm 이하이어야 합니다')
  })

  it('커스텀 가구 삭제 버튼 클릭 시 목록에서 제거된다', async () => {
    // 미리 가구 저장
    const furniture = customFurnitureModule.createCustomFurniture({
      name: '삭제할 가구',
      width: 100,
      height: 50,
    })
    customFurnitureModule.saveCustomFurniture(furniture)

    const wrapper = mount(FurnitureLibrary)
    await nextTick()

    // 가구가 표시됨
    expect(wrapper.text()).toContain('삭제할 가구')

    // 삭제 버튼 클릭
    const deleteButton = wrapper.find('button[title="삭제"]')
    await deleteButton.trigger('click')
    await nextTick()

    // 목록에서 제거됨
    expect(wrapper.text()).not.toContain('삭제할 가구')
  })

  it('가구를 드래그할 수 있다', async () => {
    const wrapper = mount(FurnitureLibrary)

    // 소파 아이템 찾기
    const sofaItem = wrapper.findAll('[draggable="true"]').find(el => el.text().includes('소파'))
    expect(sofaItem).toBeDefined()

    // 드래그 이벤트 시뮬레이션
    const dataTransfer = {
      setData: vi.fn(),
      effectAllowed: '',
    }

    await sofaItem?.trigger('dragstart', { dataTransfer })

    expect(dataTransfer.setData).toHaveBeenCalledWith(
      'application/json',
      expect.stringContaining('소파')
    )
  })
})
