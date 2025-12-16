import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import AttributePanel from '~/components/panel/AttributePanel.vue'
import type { Furniture } from '~/types/furniture'
import type { Room } from '~/types/room'
import type { Door } from '~/types/door'

describe('AttributePanel', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  const mockRoom: Room = {
    id: 'room-1',
    x: 100,
    y: 100,
    width: 800,
    height: 600,
    widthCm: 400,
    heightCm: 300,
    opacity: 1,
    zIndex: 0,
  }

  const mockFurniture: Furniture = {
    id: 'furniture-1',
    name: 'Single Bed',
    x: 350,
    y: 300,
    width: 200,
    height: 150,
    color: '#8b5cf6',
    rotation: 0,
    zIndex: 1,
  }

  const mockDoor: Door = {
    id: 'door-1',
    x: 200,
    y: 100,
    width: 90,
    wall: 'top',
    openDirection: 'inside',
    hingeSide: 'left',
  }

  describe('basic rendering', () => {
    it('shows empty message when no object selected', () => {
      const wrapper = mount(AttributePanel, {
        props: {
          selectedFurniture: null,
          selectedDoor: null,
          room: mockRoom,
          scale: 2,
        },
      })

      expect(wrapper.text()).toContain('선택된 오브젝트 없음')
    })

    it('shows object name in header', () => {
      const wrapper = mount(AttributePanel, {
        props: {
          selectedFurniture: mockFurniture,
          selectedDoor: null,
          room: mockRoom,
          scale: 2,
        },
      })

      expect(wrapper.text()).toContain('Single Bed')
    })

    it('has toggle button', () => {
      const wrapper = mount(AttributePanel, {
        props: {
          selectedFurniture: mockFurniture,
          selectedDoor: null,
          room: mockRoom,
          scale: 2,
        },
      })

      expect(wrapper.find('[data-testid="toggle-panel"]').exists()).toBe(true)
    })
  })

  describe('furniture attributes', () => {
    it('shows basic info section', () => {
      const wrapper = mount(AttributePanel, {
        props: {
          selectedFurniture: mockFurniture,
          selectedDoor: null,
          room: mockRoom,
          scale: 2,
        },
      })

      expect(wrapper.text()).toContain('기본 정보')
      expect(wrapper.text()).toContain('Single Bed')
    })

    it('shows size section in cm', () => {
      const wrapper = mount(AttributePanel, {
        props: {
          selectedFurniture: mockFurniture,
          selectedDoor: null,
          room: mockRoom,
          scale: 2,
        },
      })

      expect(wrapper.text()).toContain('크기')
      expect(wrapper.find('[data-testid="size-width"]').text()).toContain('100')
      expect(wrapper.find('[data-testid="size-height"]').text()).toContain('75')
    })

    it('shows position section in cm', () => {
      const wrapper = mount(AttributePanel, {
        props: {
          selectedFurniture: mockFurniture,
          selectedDoor: null,
          room: mockRoom,
          scale: 2,
        },
      })

      expect(wrapper.text()).toContain('위치')
      expect(wrapper.find('[data-testid="position-x"]').text()).toContain('125')
      expect(wrapper.find('[data-testid="position-y"]').text()).toContain('100')
    })

    it('shows wall distance section', () => {
      const wrapper = mount(AttributePanel, {
        props: {
          selectedFurniture: mockFurniture,
          selectedDoor: null,
          room: mockRoom,
          scale: 2,
        },
      })

      expect(wrapper.text()).toContain('벽과의 거리')
      expect(wrapper.find('[data-testid="distance-top"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="distance-bottom"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="distance-left"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="distance-right"]').exists()).toBe(true)
    })

    it('shows rotation info', () => {
      const wrapper = mount(AttributePanel, {
        props: {
          selectedFurniture: mockFurniture,
          selectedDoor: null,
          room: mockRoom,
          scale: 2,
        },
      })

      expect(wrapper.text()).toContain('회전')
      expect(wrapper.find('[data-testid="rotation"]').text()).toContain('0')
    })
  })

  describe('door attributes', () => {
    it('shows door attributes when door selected', () => {
      const wrapper = mount(AttributePanel, {
        props: {
          selectedFurniture: null,
          selectedDoor: mockDoor,
          room: mockRoom,
          scale: 2,
        },
      })

      expect(wrapper.text()).toContain('문')
      expect(wrapper.text()).toContain('상단')
    })
  })

  describe('attribute editing', () => {
    it('emits update:furniture on name change', async () => {
      const wrapper = mount(AttributePanel, {
        props: {
          selectedFurniture: mockFurniture,
          selectedDoor: null,
          room: mockRoom,
          scale: 2,
        },
      })

      const nameInput = wrapper.find('[data-testid="input-name"]')
      await nameInput.setValue('Double Bed')
      await nameInput.trigger('change')

      expect(wrapper.emitted('update:furniture')).toBeTruthy()
      expect(wrapper.emitted('update:furniture')![0][0]).toMatchObject({
        name: 'Double Bed',
      })
    })

    it('emits update:furniture on width change', async () => {
      const wrapper = mount(AttributePanel, {
        props: {
          selectedFurniture: mockFurniture,
          selectedDoor: null,
          room: mockRoom,
          scale: 2,
        },
      })

      const widthInput = wrapper.find('[data-testid="input-width"]')
      await widthInput.setValue('120')
      await widthInput.trigger('change')

      expect(wrapper.emitted('update:furniture')).toBeTruthy()
      expect(wrapper.emitted('update:furniture')![0][0]).toMatchObject({
        width: 240,
      })
    })

    it('emits update:furniture on x change', async () => {
      const wrapper = mount(AttributePanel, {
        props: {
          selectedFurniture: mockFurniture,
          selectedDoor: null,
          room: mockRoom,
          scale: 2,
        },
      })

      const xInput = wrapper.find('[data-testid="input-x"]')
      await xInput.setValue('150')
      await xInput.trigger('change')

      expect(wrapper.emitted('update:furniture')).toBeTruthy()
      expect(wrapper.emitted('update:furniture')![0][0]).toMatchObject({
        x: 400,
      })
    })

    it('emits update:furniture on rotation change', async () => {
      const wrapper = mount(AttributePanel, {
        props: {
          selectedFurniture: mockFurniture,
          selectedDoor: null,
          room: mockRoom,
          scale: 2,
        },
      })

      const rotationInput = wrapper.find('[data-testid="input-rotation"]')
      await rotationInput.setValue('90')
      await rotationInput.trigger('change')

      expect(wrapper.emitted('update:furniture')).toBeTruthy()
      expect(wrapper.emitted('update:furniture')![0][0]).toMatchObject({
        rotation: 90,
      })
    })
  })

  describe('section collapse', () => {
    it('toggles section on header click', async () => {
      const wrapper = mount(AttributePanel, {
        props: {
          selectedFurniture: mockFurniture,
          selectedDoor: null,
          room: mockRoom,
          scale: 2,
        },
      })

      const sizeSection = wrapper.find('[data-testid="section-size"]')
      const sizeHeader = sizeSection.find('[data-testid="section-header"]')

      expect(sizeSection.find('[data-testid="section-content"]').exists()).toBe(true)

      await sizeHeader.trigger('click')
      expect(sizeSection.find('[data-testid="section-content"]').exists()).toBe(false)

      await sizeHeader.trigger('click')
      expect(sizeSection.find('[data-testid="section-content"]').exists()).toBe(true)
    })
  })
})
