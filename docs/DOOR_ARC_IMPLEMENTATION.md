# 문(Door) 호(Arc) 구현 문서

## 개요

평면도 에디터에서 문의 열림 방향을 시각적으로 표시하기 위해 호(arc)를 사용합니다.
이 문서는 문 호의 구현 로직과 Konva Arc의 동작 방식을 설명합니다.

## Konva Arc 동작 방식

Konva의 `Arc` 컴포넌트는 다음과 같이 동작합니다:

- `rotation`: 호가 시작되는 각도 (도 단위)
- `angle`: 호가 그려지는 범위
- `clockwise`: 호 그리기 방향 (기본값: `true` = 시계방향)

**중요:** 이 프로젝트에서는 `clockwise: false`를 사용하여 **반시계 방향**으로 호를 그립니다.

### 각도 기준

```
          -90° (위)
             |
180° (왼쪽) ─┼─ 0° (오른쪽)
             |
          90° (아래)
```

- `rotation=0`: 오른쪽(+x)에서 시작
- `rotation=90`: 아래(+y)에서 시작
- `rotation=180`: 왼쪽(-x)에서 시작
- `rotation=-90` (또는 270): 위(-y)에서 시작

## 벽별 문 열림 방향

### 가로 벽 (top/bottom)

| 벽 | 열림 방향 | 경첩 | 호 방향 | rotation |
|---|---|---|---|---|
| top | inside (아래) | left | 오른쪽→아래 | 0 |
| top | inside (아래) | right | 아래→왼쪽 | 90 |
| top | outside (위) | left | 왼쪽→위 | 180 |
| top | outside (위) | right | 아래→왼쪽 | 90 |
| bottom | inside (위) | left | 위→오른쪽 | -90 |
| bottom | inside (위) | right | 왼쪽→위 | 180 |
| bottom | outside (아래) | left | 오른쪽→아래 | 0 |
| bottom | outside (아래) | right | 위→오른쪽 | -90 |

### 세로 벽 (left/right)

세로 벽에서 `left` = 위쪽 경첩, `right` = 아래쪽 경첩

| 벽 | 열림 방향 | 경첩 | 호 방향 | rotation |
|---|---|---|---|---|
| left | inside (오른쪽) | left (위) | 아래→오른쪽 | 0 |
| left | inside (오른쪽) | right (아래) | 위→오른쪽 | -90 |
| left | outside (왼쪽) | left (위) | 아래→왼쪽 | 180 |
| left | outside (왼쪽) | right (아래) | 위→왼쪽 | -90 |
| right | inside (왼쪽) | left (위) | 아래→왼쪽 | 90 |
| right | inside (왼쪽) | right (아래) | 위→왼쪽 | 180 |
| right | outside (오른쪽) | left (위) | 아래→오른쪽 | 0 |
| right | outside (오른쪽) | right (아래) | 위→오른쪽 | -90 |

## 파일 구조

```
app/
├── utils/
│   └── door.ts          # 문 관련 유틸리티 함수
└── components/
    └── editor/
        └── FloorPlanCanvas.vue  # 캔버스 컴포넌트

tests/
└── door.test.ts         # 문 유틸리티 테스트
```

## 주요 함수

### `getDoorArcConfig(wall, openDirection, hingeSide, doorWidthPx)`

문 호의 위치와 회전 각도를 계산합니다.

**매개변수:**
- `wall`: 벽 위치 (`'top' | 'bottom' | 'left' | 'right'`)
- `openDirection`: 열림 방향 (`'inside' | 'outside'`)
- `hingeSide`: 경첩 위치 (`'left' | 'right'`)
- `doorWidthPx`: 문 너비 (픽셀)

**반환값:**
```typescript
{
  x: number,       // 경첩 x 위치 (그룹 내 로컬 좌표)
  y: number,       // 경첩 y 위치 (그룹 내 로컬 좌표)
  rotation: number // 호 시작 각도
}
```

## TDD 적용

이 기능은 TDD(테스트 주도 개발) 원칙에 따라 구현되었습니다:

1. **Red**: 실패하는 테스트 먼저 작성
2. **Green**: 테스트를 통과하는 최소 코드 구현
3. **Refactor**: 코드 정리

### 테스트 실행

```bash
npm run test:run  # 1회 실행
npm test          # watch 모드
```

## 키보드 단축키

문이 선택된 상태에서:
- `D`: 열림 방향 전환 (inside ↔ outside)
- `H`: 경첩 위치 전환 (left ↔ right)
- `Delete`: 문 삭제
