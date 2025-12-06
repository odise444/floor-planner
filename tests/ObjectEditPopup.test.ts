import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import FurnitureEditForm from '~/components/editor/FurnitureEditForm.vue'
import DoorEditForm from '~/components/editor/DoorEditForm.vue'

describe('FurnitureEditForm 컴포넌트', () => {
  const defaultFurniture = {
    id: 'test-1',
    name: '테스트 소파',
    x: 100,
    y: 100,
    width: 200,
    height: 90,
    color: '#6366f1',
    rotation: 0,
  }

  it('가구 정보를 표시한다', () => {
    const wrapper = mount(FurnitureEditForm, {
      props: { furniture: defaultFurniture },
    })

    expect(wrapper.find('input[type="text"]').element.value).toBe('테스트 소파')
    expect(wrapper.findAll('input[type="number"]')[0].element.value).toBe('200')
    expect(wrapper.findAll('input[type="number"]')[1].element.value).toBe('90')
  })

  it('이름 수정 후 적용 시 update 이벤트 발생', async () => {
    const wrapper = mount(FurnitureEditForm, {
      props: { furniture: defaultFurniture },
    })

    await wrapper.find('input[type="text"]').setValue('수정된 소파')
    await wrapper.find('button.bg-blue-500').trigger('click')

    expect(wrapper.emitted('update')).toBeTruthy()
    expect(wrapper.emitted('update')![0][0]).toMatchObject({
      name: '수정된 소파',
    })
  })

  it('크기 수정 후 적용 시 update 이벤트 발생', async () => {
    const wrapper = mount(FurnitureEditForm, {
      props: { furniture: defaultFurniture },
    })

    const widthInput = wrapper.findAll('input[type="number"]')[0]
    const heightInput = wrapper.findAll('input[type="number"]')[1]

    await widthInput.setValue(250)
    await heightInput.setValue(100)
    await wrapper.find('button.bg-blue-500').trigger('click')

    expect(wrapper.emitted('update')).toBeTruthy()
    expect(wrapper.emitted('update')![0][0]).toMatchObject({
      width: 250,
      height: 100,
    })
  })

  it('색상 수정 후 적용 시 update 이벤트 발생', async () => {
    const wrapper = mount(FurnitureEditForm, {
      props: { furniture: defaultFurniture },
    })

    await wrapper.find('input[type="color"]').setValue('#ff0000')
    await wrapper.find('button.bg-blue-500').trigger('click')

    expect(wrapper.emitted('update')).toBeTruthy()
    expect(wrapper.emitted('update')![0][0]).toMatchObject({
      color: '#ff0000',
    })
  })

  it('회전 선택 시 update 이벤트 발생', async () => {
    const wrapper = mount(FurnitureEditForm, {
      props: { furniture: defaultFurniture },
    })

    await wrapper.find('select').setValue('90')
    await wrapper.find('button.bg-blue-500').trigger('click')

    expect(wrapper.emitted('update')).toBeTruthy()
    expect(wrapper.emitted('update')![0][0]).toMatchObject({
      rotation: 90,
    })
  })

  it('삭제 버튼 클릭 시 delete 이벤트 발생', async () => {
    const wrapper = mount(FurnitureEditForm, {
      props: { furniture: defaultFurniture },
    })

    await wrapper.find('button.bg-red-500').trigger('click')

    expect(wrapper.emitted('delete')).toBeTruthy()
  })

  it('닫기 버튼 클릭 시 close 이벤트 발생', async () => {
    const wrapper = mount(FurnitureEditForm, {
      props: { furniture: defaultFurniture },
    })

    await wrapper.find('button.bg-gray-200').trigger('click')

    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('빈 이름 입력 시 에러 표시', async () => {
    const wrapper = mount(FurnitureEditForm, {
      props: { furniture: defaultFurniture },
    })

    await wrapper.find('input[type="text"]').setValue('')
    await wrapper.find('button.bg-blue-500').trigger('click')

    expect(wrapper.text()).toContain('이름을 입력해주세요')
    expect(wrapper.emitted('update')).toBeFalsy()
  })

  it('0 이하 크기 입력 시 에러 표시', async () => {
    const wrapper = mount(FurnitureEditForm, {
      props: { furniture: defaultFurniture },
    })

    await wrapper.findAll('input[type="number"]')[0].setValue(0)
    await wrapper.find('button.bg-blue-500').trigger('click')

    expect(wrapper.text()).toContain('너비는 양수여야 합니다')
    expect(wrapper.emitted('update')).toBeFalsy()
  })
})

describe('DoorEditForm 컴포넌트', () => {
  const defaultDoor = {
    id: 'door-1',
    x: 100,
    y: 0,
    width: 90,
    wall: 'bottom' as const,
    openDirection: 'inside' as const,
    hingeSide: 'left' as const,
  }

  it('문 정보를 표시한다', () => {
    const wrapper = mount(DoorEditForm, {
      props: { door: defaultDoor },
    })

    expect(wrapper.find('input[type="number"]').element.value).toBe('90')
  })

  it('너비 수정 후 적용 시 update 이벤트 발생', async () => {
    const wrapper = mount(DoorEditForm, {
      props: { door: defaultDoor },
    })

    await wrapper.find('input[type="number"]').setValue(100)
    await wrapper.find('button.bg-blue-500').trigger('click')

    expect(wrapper.emitted('update')).toBeTruthy()
    expect(wrapper.emitted('update')![0][0]).toMatchObject({
      width: 100,
    })
  })

  it('열림 방향 변경 시 update 이벤트 발생', async () => {
    const wrapper = mount(DoorEditForm, {
      props: { door: defaultDoor },
    })

    // 바깥쪽 라디오 버튼 클릭
    const outsideRadio = wrapper.findAll('input[type="radio"]').find(
      input => input.element.value === 'outside'
    )
    await outsideRadio?.setValue(true)
    await wrapper.find('button.bg-blue-500').trigger('click')

    expect(wrapper.emitted('update')).toBeTruthy()
    expect(wrapper.emitted('update')![0][0]).toMatchObject({
      openDirection: 'outside',
    })
  })

  it('경첩 위치 변경 시 update 이벤트 발생', async () => {
    const wrapper = mount(DoorEditForm, {
      props: { door: defaultDoor },
    })

    // 오른쪽 라디오 버튼 클릭
    const rightRadio = wrapper.findAll('input[type="radio"]').find(
      input => input.element.value === 'right'
    )
    await rightRadio?.setValue(true)
    await wrapper.find('button.bg-blue-500').trigger('click')

    expect(wrapper.emitted('update')).toBeTruthy()
    expect(wrapper.emitted('update')![0][0]).toMatchObject({
      hingeSide: 'right',
    })
  })

  it('삭제 버튼 클릭 시 delete 이벤트 발생', async () => {
    const wrapper = mount(DoorEditForm, {
      props: { door: defaultDoor },
    })

    await wrapper.find('button.bg-red-500').trigger('click')

    expect(wrapper.emitted('delete')).toBeTruthy()
  })

  it('닫기 버튼 클릭 시 close 이벤트 발생', async () => {
    const wrapper = mount(DoorEditForm, {
      props: { door: defaultDoor },
    })

    await wrapper.find('button.bg-gray-200').trigger('click')

    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('0 이하 너비 입력 시 에러 표시', async () => {
    const wrapper = mount(DoorEditForm, {
      props: { door: defaultDoor },
    })

    await wrapper.find('input[type="number"]').setValue(0)
    await wrapper.find('button.bg-blue-500').trigger('click')

    expect(wrapper.text()).toContain('너비는 양수여야 합니다')
    expect(wrapper.emitted('update')).toBeFalsy()
  })
})
