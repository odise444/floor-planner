import type { Furniture } from '~/types/furniture'
import type { Door } from '~/utils/objectEdit'

// 방 타입
export interface Room {
  x: number
  y: number
  width: number
  height: number
  opacity: number
}

// 평면도 데이터 타입
export interface FloorPlanData {
  version: string
  room: Room | null
  furnitureList: Furniture[]
  doorList: Door[]
  savedAt: string
}

const STORAGE_KEY = 'floor-plan-data'
const CURRENT_VERSION = '1.0'

// 평면도 데이터 저장
export function saveFloorPlan(data: Omit<FloorPlanData, 'version' | 'savedAt'>): void {
  const saveData: FloorPlanData = {
    version: CURRENT_VERSION,
    ...data,
    savedAt: new Date().toISOString(),
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData))
}

// 평면도 데이터 불러오기
export function loadFloorPlan(): FloorPlanData | null {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (!saved) return null

  try {
    const data = JSON.parse(saved) as FloorPlanData
    return data
  } catch {
    return null
  }
}

// 평면도 데이터 삭제
export function clearFloorPlan(): void {
  localStorage.removeItem(STORAGE_KEY)
}

// 저장된 데이터 있는지 확인
export function hasFloorPlanData(): boolean {
  return localStorage.getItem(STORAGE_KEY) !== null
}

// JSON 파일로 내보내기
export function exportToJson(data: Omit<FloorPlanData, 'version' | 'savedAt'>): void {
  const exportData: FloorPlanData = {
    version: CURRENT_VERSION,
    ...data,
    savedAt: new Date().toISOString(),
  }

  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `floor-plan-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

// JSON 파일에서 불러오기
export function importFromJson(file: File): Promise<FloorPlanData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string) as FloorPlanData
        resolve(data)
      } catch {
        reject(new Error('잘못된 파일 형식입니다.'))
      }
    }
    reader.onerror = () => reject(new Error('파일을 읽을 수 없습니다.'))
    reader.readAsText(file)
  })
}
