// 평면도 이미지 타입
export interface FloorPlanImage {
  id: string
  dataUrl: string
  width: number
  height: number
  originalName: string
  x: number
  y: number
  scale: number
  opacity: number
  locked: boolean
  zIndex: number
}

// 이미지 크기 정보 타입
export interface ImageDimensions {
  width: number
  height: number
  aspectRatio: number
}

// 유효성 검사 결과 타입
export interface ValidationResult {
  valid: boolean
  errors: string[]
}

// 지원하는 이미지 형식
const SUPPORTED_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp']

// 최대 파일 크기 (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024

/**
 * 이미지 파일 유효성 검사
 */
export function validateImageFile(file: File): ValidationResult {
  const errors: string[] = []

  // 파일 형식 검사
  if (!SUPPORTED_TYPES.includes(file.type)) {
    errors.push('지원하지 않는 파일 형식입니다. (PNG, JPEG, GIF, WebP)')
  }

  // 파일 크기 검사
  if (file.size > MAX_FILE_SIZE) {
    errors.push('파일 크기가 10MB를 초과합니다.')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * File을 Data URL로 변환
 */
export function createImageDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('파일을 읽는 중 오류가 발생했습니다.'))
    reader.readAsDataURL(file)
  })
}

/**
 * 이미지 크기 파싱
 */
export function parseImageDimensions(width: number, height: number): ImageDimensions {
  return {
    width,
    height,
    aspectRatio: width / height,
  }
}

/**
 * Data URL에서 이미지 크기 가져오기
 */
export function getImageDimensionsFromDataUrl(dataUrl: string): Promise<ImageDimensions> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      resolve(parseImageDimensions(img.width, img.height))
    }
    img.onerror = () => reject(new Error('이미지를 로드하는 중 오류가 발생했습니다.'))
    img.src = dataUrl
  })
}

/**
 * 평면도 이미지 객체 생성
 */
export function createFloorPlanImage(
  dataUrl: string,
  width: number,
  height: number,
  originalName: string
): FloorPlanImage {
  return {
    id: `floor-plan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    dataUrl,
    width,
    height,
    originalName,
    x: 0,
    y: 0,
    scale: 1,
    opacity: 0.5,
    locked: false,
    zIndex: -1, // 기본적으로 가구보다 아래에 위치
  }
}

/**
 * 파일에서 평면도 이미지 객체 생성 (전체 프로세스)
 */
export async function loadFloorPlanImageFromFile(file: File): Promise<FloorPlanImage> {
  // 유효성 검사
  const validation = validateImageFile(file)
  if (!validation.valid) {
    throw new Error(validation.errors.join(', '))
  }

  // Data URL 생성
  const dataUrl = await createImageDataUrl(file)

  // 이미지 크기 가져오기
  const dimensions = await getImageDimensionsFromDataUrl(dataUrl)

  // 평면도 이미지 객체 생성
  return createFloorPlanImage(dataUrl, dimensions.width, dimensions.height, file.name)
}
