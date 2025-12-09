# 벽체(Wall) 기능 명세서

## 개요
캔버스에 벽체를 자유롭게 드래그하여 생성하고, 방의 각 변에 벽체를 추가하여 평면도의 벽 두께를 표현하는 기능

## 현재 상태
- 방은 단순 사각형으로 표현 (테두리만 존재)
- 벽 두께 개념 없음
- 문은 벽에 배치되나 벽 두께와 무관하게 렌더링

## 목표
- **드래그로 자유 벽체 생성** (방과 독립적)
- 방의 각 변에 독립적인 벽체 추가/제거
- 벽체 두께 설정 가능
- 문이 벽체와 연동되어 표시
- 내벽/외벽 구분 가능

---

## 기능 상세

### 1. 벽체 데이터 구조

#### Wall 인터페이스 (자유 벽체)
```typescript
interface Wall {
  id: string
  // 위치 및 크기
  startX: number           // 시작점 X (cm)
  startY: number           // 시작점 Y (cm)
  endX: number             // 끝점 X (cm)
  endY: number             // 끝점 Y (cm)
  thickness: number        // 벽 두께 (cm)
  // 속성
  isExterior: boolean      // 외벽 여부
  color: string            // 벽체 색상
  zIndex: number           // 레이어 순서
  // 연결 정보 (선택)
  roomId?: string          // 연결된 방 ID (방 벽인 경우)
  side?: 'top' | 'bottom' | 'left' | 'right'  // 방 벽 위치
}
```

#### Room 인터페이스 확장
```typescript
interface Room {
  // 기존 속성
  id: string
  x: number
  y: number
  width: number
  height: number
  // 벽체 관련 추가
  walls: Wall[]
}
```

#### 자유 벽체 vs 방 벽체
| 구분 | 자유 벽체 | 방 벽체 |
|------|-----------|---------|
| 생성 | 드래그로 생성 | 방 생성 시 자동 |
| 위치 | 자유 배치 | 방 테두리에 고정 |
| roomId | null | 방 ID |
| 이동 | 독립 이동 | 방과 함께 이동 |

### 2. 벽체 렌더링

#### 벽체 표시 방식
```
┌────────────────────────────────────┐
│ ████████████████████████████████████│ ← 상단 벽체 (thickness: 15cm)
│ █                                  █│
│ █         방 내부 공간              █│ ← 좌/우 벽체
│ █                                  █│
│ ████████████████████████████████████│ ← 하단 벽체
└────────────────────────────────────┘
```

#### 벽체 색상
- 외벽: 진한 회색 (#4B5563)
- 내벽: 연한 회색 (#9CA3AF)
- 개방 (벽 없음): 표시 안함

### 3. 벽체 편집 UI

#### 방 선택 시 벽체 도구 표시
```
┌─────────────────────────────────┐
│ 🧱 벽체 설정                     │
├─────────────────────────────────┤
│                                 │
│     [상단 벽: 15cm ▼]           │
│                                 │
│ [좌측    [  방  ]    [우측      │
│  벽:              ]   벽:       │
│  15cm]            ]   15cm]     │
│                                 │
│     [하단 벽: 15cm ▼]           │
│                                 │
├─────────────────────────────────┤
│ 기본 벽 두께: [15] cm           │
│ □ 모든 벽에 적용                │
├─────────────────────────────────┤
│ [적용]           [닫기]         │
└─────────────────────────────────┘
```

#### 개별 벽 설정 팝업
```
┌─────────────────────────┐
│ 상단 벽 설정             │
├─────────────────────────┤
│ ☑ 벽체 있음              │
│ 두께: [15] cm           │
│ ○ 내벽  ● 외벽           │
├─────────────────────────┤
│ [적용]  [제거]  [닫기]   │
└─────────────────────────┘
```

### 4. 드래그로 벽체 생성

#### 생성 모드 활성화
- 툴바의 "벽체 그리기" 버튼 클릭
- 또는 단축키 `W` 누르기

#### 드래그 생성 흐름
```
1. 벽체 모드 활성화
   ↓
2. 캔버스에서 마우스 다운 (시작점)
   ↓
3. 드래그 중 미리보기 표시 (점선)
   ↓
4. 마우스 업 (끝점)
   ↓
5. 벽체 생성 완료
```

#### 드래그 UI
```
      시작점 (mousedown)
         ●━━━━━━━━━━━━━━━━━━━━━● 끝점 (mouseup)
         ↑                    ↑
      startX, startY      endX, endY

      드래그 중: 점선으로 미리보기
      완료 후: 실선으로 벽체 렌더링
```

#### 스냅 기능
- **그리드 스냅**: 10cm 단위로 스냅
- **각도 스냅**: Shift 누르면 수평/수직/45° 스냅
- **벽체 연결 스냅**: 기존 벽체 끝점에 자동 스냅 (10px 이내)

#### 벽체 편집
- 클릭으로 벽체 선택
- 끝점 드래그로 길이/방향 조절
- 중앙 드래그로 위치 이동
- Delete키로 삭제

### 5. 키보드 단축키

| 키 | 동작 |
|----|------|
| W | 벽체 그리기 모드 토글 |
| Shift+드래그 | 수평/수직/45° 각도 스냅 |
| Escape | 벽체 모드 해제 / 선택 해제 |
| Delete | 선택된 벽체 삭제 |

---

## TDD 구현 계획

### Phase 1: 테스트 작성 (RED)

#### 1.1 단위 테스트 (app/utils/wall.spec.ts)

```typescript
// 테스트 케이스 목록

describe('Wall 유틸리티', () => {
  describe('createWall', () => {
    test('시작점과 끝점으로 벽체 생성', () => {})
    test('기본 두께 15cm 적용', () => {})
    test('외벽으로 벽체 생성', () => {})
    test('커스텀 두께로 벽체 생성', () => {})
  })

  describe('createWallFromDrag', () => {
    test('드래그 좌표로 벽체 생성', () => {})
    test('최소 길이 미만 시 null 반환', () => {})
    test('그리드 스냅 적용', () => {})
  })

  describe('snapToAngle', () => {
    test('수평 각도 스냅 (0°)', () => {})
    test('수직 각도 스냅 (90°)', () => {})
    test('45° 각도 스냅', () => {})
    test('스냅 없이 자유 각도', () => {})
  })

  describe('snapToExistingWall', () => {
    test('기존 벽체 끝점에 스냅', () => {})
    test('스냅 거리 초과 시 원래 좌표 반환', () => {})
  })

  describe('getWallLength', () => {
    test('수평 벽체 길이 계산', () => {})
    test('수직 벽체 길이 계산', () => {})
    test('대각선 벽체 길이 계산', () => {})
  })

  describe('getWallAngle', () => {
    test('벽체 각도 계산 (라디안)', () => {})
  })

  describe('getWallRenderRect', () => {
    test('벽체 두께 포함 렌더링 사각형 계산', () => {})
  })

  describe('createDefaultWalls', () => {
    test('방 생성 시 4개 벽체 자동 생성', () => {})
    test('모든 벽체가 기본 두께를 가짐', () => {})
  })

  describe('updateWallThickness', () => {
    test('특정 벽체 두께 변경', () => {})
    test('0 이하 두께는 에러', () => {})
  })

  describe('getWallWithDoor', () => {
    test('문이 있는 벽체에서 문 영역 제외', () => {})
    test('문이 없는 벽체는 전체 렌더링', () => {})
  })
})
```

#### 1.2 E2E 테스트 (e2e/wall.spec.ts)

```typescript
describe('벽체 기능', () => {
  describe('드래그로 벽체 생성', () => {
    test('W키로 벽체 그리기 모드를 활성화할 수 있다', async () => {})
    test('캔버스에서 드래그하여 벽체를 생성할 수 있다', async () => {})
    test('드래그 중 미리보기가 표시된다', async () => {})
    test('Shift+드래그로 수평/수직 스냅된다', async () => {})
    test('최소 길이 미만 드래그는 벽체가 생성되지 않는다', async () => {})
    test('벽체 모드에서 Escape로 모드를 해제할 수 있다', async () => {})
  })

  describe('벽체 선택 및 편집', () => {
    test('벽체를 클릭하여 선택할 수 있다', async () => {})
    test('선택된 벽체를 드래그하여 이동할 수 있다', async () => {})
    test('선택된 벽체의 끝점을 드래그하여 길이를 조절할 수 있다', async () => {})
    test('선택된 벽체를 Delete키로 삭제할 수 있다', async () => {})
  })

  describe('벽체 스냅', () => {
    test('기존 벽체 끝점에 자동 스냅된다', async () => {})
    test('그리드에 스냅된다', async () => {})
  })

  describe('방 벽체 자동 생성', () => {
    test('방 생성 시 기본 벽체가 함께 생성된다', async () => {})
    test('벽체가 방 테두리에 표시된다', async () => {})
  })

  describe('벽체 설정 패널', () => {
    test('벽체 선택 후 설정 패널이 표시된다', async () => {})
    test('벽체 두께를 변경할 수 있다', async () => {})
    test('외벽/내벽을 전환할 수 있다', async () => {})
  })

  describe('벽체 렌더링', () => {
    test('벽체 두께에 따라 캔버스에 표시된다', async () => {})
    test('외벽과 내벽이 다른 색상으로 표시된다', async () => {})
  })

  describe('문과 벽체 연동', () => {
    test('문이 있는 위치의 벽체가 잘려서 표시된다', async () => {})
    test('문 이동 시 벽체도 함께 업데이트된다', async () => {})
  })

  describe('저장/불러오기', () => {
    test('벽체 정보가 저장된다', async () => {})
    test('저장된 벽체가 올바르게 불러와진다', async () => {})
  })
})
```

### Phase 2: 최소 구현 (GREEN)

#### 2.1 유틸리티 함수 구현
**파일**: `app/utils/wall.ts`

```typescript
// 구현 순서
1. Wall 인터페이스 정의
2. createWall() - 시작점/끝점으로 벽체 생성
3. createWallFromDrag() - 드래그 좌표로 벽체 생성
4. snapToAngle() - 각도 스냅 (0°, 45°, 90°)
5. snapToGrid() - 그리드 스냅
6. snapToExistingWall() - 기존 벽체 끝점 스냅
7. getWallLength() - 벽체 길이 계산
8. getWallAngle() - 벽체 각도 계산
9. getWallRenderRect() - 렌더링 사각형 계산
10. createDefaultWalls() - 방 생성 시 4벽 자동 생성
11. updateWallThickness() - 두께 변경
12. getWallWithDoor() - 문 영역 제외 계산
```

#### 2.2 컴포넌트 구현

**파일**: `app/components/editor/WallToolbar.vue`
```typescript
// 벽체 그리기 도구 버튼
- 벽체 모드 활성화/비활성화 토글
- 현재 모드 표시 (아이콘 강조)
```

**파일**: `app/components/editor/WallSettingsPanel.vue`
```typescript
// 기본 기능만 구현
- 두께 입력 필드
- 외벽/내벽 선택
- 색상 선택
- 적용/삭제/닫기 버튼
```

#### 2.3 캔버스 렌더링
**파일**: `app/components/editor/FloorPlanCanvas.vue`

```typescript
// 추가할 내용
- 벽체 그리기 모드 상태 (isWallDrawMode)
- 드래그 중 미리보기 렌더링
- Wall 레이어 추가 (Room 레이어 위)
- v-line 또는 v-rect로 각 벽체 렌더링
- 벽체 선택 및 편집 핸들러
- 끝점 드래그 핸들 표시
- 문 위치에서 벽체 분리 처리
```

#### 2.4 이벤트 핸들러
```typescript
// 드래그 생성 핸들러
- onWallDrawStart(e) - mousedown: 시작점 저장
- onWallDrawMove(e) - mousemove: 미리보기 업데이트, 스냅 적용
- onWallDrawEnd(e) - mouseup: 벽체 생성, 최소 길이 검증

// 벽체 편집 핸들러
- onWallSelect(wall) - 벽체 선택
- onWallDrag(e) - 벽체 이동
- onWallEndpointDrag(e, endpoint) - 끝점 조절
- onWallDelete() - 삭제
```

### Phase 3: 리팩토링 (REFACTOR)

#### 3.1 코드 최적화
- 벽체 계산 로직 메모이제이션
- 불필요한 리렌더링 방지

#### 3.2 UX 개선
- 벽체 호버 시 하이라이트
- 두께 조절 슬라이더 추가
- 드래그로 벽 두께 조절

---

## 구현 체크리스트

### 테스트 파일 생성
- [ ] `app/utils/wall.spec.ts` 생성
- [ ] `e2e/wall.spec.ts` 생성

### 핵심 구현 (드래그 생성)
- [ ] `app/utils/wall.ts` - Wall 인터페이스 정의
- [ ] `createWall()` - 기본 벽체 생성
- [ ] `createWallFromDrag()` - 드래그 좌표로 생성
- [ ] `snapToAngle()` - 각도 스냅
- [ ] `snapToGrid()` - 그리드 스냅
- [ ] `snapToExistingWall()` - 기존 벽체 끝점 스냅
- [ ] `getWallLength()`, `getWallAngle()` - 계산 함수
- [ ] `getWallRenderRect()` - 렌더링 좌표

### UI 구현
- [ ] 툴바에 벽체 그리기 버튼 추가
- [ ] `app/components/editor/WallSettingsPanel.vue`
- [ ] FloorPlanCanvas.vue에 벽체 레이어 추가
- [ ] 드래그 미리보기 렌더링
- [ ] 벽체 선택 핸들러
- [ ] 끝점 드래그 핸들
- [ ] 키보드 단축키 (W, Escape, Delete)

### 방 벽체 연동
- [ ] `createDefaultWalls()` - 방 생성 시 4벽 자동 생성
- [ ] Room 타입에 walls 속성 추가
- [ ] 방 이동 시 벽체 함께 이동

### 문 연동
- [ ] 문과 벽체 연동 처리
- [ ] `getWallWithDoor()` - 문 영역 제외 계산

### 저장/불러오기
- [ ] `app/utils/floorPlanStorage.ts` - Wall 저장 로직 추가
- [ ] 저장/불러오기 동작 확인

---

## 기술적 고려사항

### 1. 벽체 렌더링 순서
```
1. 평면도 이미지 (최하단)
2. 방 영역 (배경)
3. 벽체
4. 문
5. 가구 (최상단)
```

### 2. 문과 벽체 연동
- 문의 위치(x, y)와 너비(width)를 기준으로 벽체 분리
- 문 이동 시 벽체 재계산 필요

### 3. 성능 최적화
- 벽체 좌표는 computed로 캐싱
- 문 변경 시에만 재계산

---

## 우선순위

### P0 (필수) - 드래그 생성 핵심
- **드래그로 자유 벽체 생성**
- 벽체 렌더링 (선 또는 사각형)
- 벽체 선택 및 삭제
- Shift 각도 스냅 (수평/수직)

### P1 (중요) - 편집 기능
- 끝점 드래그로 길이 조절
- 벽체 이동
- 벽체 두께 설정 UI
- 그리드 스냅
- 기존 벽체 끝점 스냅

### P2 (방 연동)
- 방 생성 시 기본 벽체 생성
- 문과 벽체 연동
- 외벽/내벽 구분
- 저장/불러오기

### P3 (개선)
- 드래그로 두께 조절
- 벽체 패턴/텍스처
- 단열재 표시
- 치수 표시

---

## 구현 단계

| 단계 | 작업 |
|------|------|
| 1 | 단위 테스트 케이스 작성 (wall.spec.ts) |
| 2 | Wall 인터페이스 및 기본 유틸리티 구현 |
| 3 | 스냅 함수 구현 (각도, 그리드, 벽체) |
| 4 | E2E 테스트 케이스 작성 (wall.spec.ts) |
| 5 | 툴바 벽체 버튼 추가 |
| 6 | 캔버스 드래그 생성 핸들러 구현 |
| 7 | 벽체 렌더링 및 미리보기 |
| 8 | 벽체 선택/이동/삭제 |
| 9 | 끝점 드래그 편집 |
| 10 | WallSettingsPanel 컴포넌트 |
| 11 | 저장/불러오기 연동 |
| 12 | 방 벽체 자동 생성 |
| 13 | 문-벽체 연동 |
| 14 | E2E 테스트 통과 확인 |

---

## 참고

### 관련 파일
- [Room 인터페이스](../app/utils/door.ts)
- [FloorPlanCanvas](../app/components/editor/FloorPlanCanvas.vue)
- [저장 로직](../app/utils/floorPlanStorage.ts)

### 관련 기능
- 문(Door) 기능 - 벽체와 연동 필요
- 레이어 순서 - 벽체 zIndex 설정
