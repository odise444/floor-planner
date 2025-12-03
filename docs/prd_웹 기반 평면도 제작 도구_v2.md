# PRD: 이사할 때 (가칭)

## 1. TL;DR

**"내 가구, 새 집에 들어갈까?"**

이사를 앞둔 사람들이 **기존에 가진 가구**가 새 집에 맞는지 확인하고, 최적의 배치를 찾을 수 있는 도구입니다. 한국 아파트 평형 DB와 국내 가구 브랜드 실측 데이터를 기반으로, 이사 전 불확실성을 제거합니다.

### 왜 우리인가?

| 기존 서비스 | 우리 서비스 |
|-------------|-------------|
| 빈 캔버스에서 시작 | 아파트 검색하면 도면 자동 로드 |
| 가상의 가구 배치 | **내가 가진 가구** 등록 후 배치 |
| 혼자 작업 | 가족과 **실시간 동시 편집** |
| 글로벌/범용 가구 | 한샘, 이케아 코리아, 일룸 등 **국내 가구 실측 DB** |

---

## 2. 문제 정의

### 해결하려는 핵심 문제

이사할 때 가장 흔한 실수:
1. "소파가 안 들어가네..." (새 집 문/복도 크기 미확인)
2. "여기 놓으니까 동선이 막히네..." (배치 시뮬레이션 부재)
3. "이 가구 버릴까 가져갈까..." (판단 근거 부족)
4. "여보, 거실에 뭐 놓을지 얘기 좀 하자" (비동기 소통의 한계)

### 기존 솔루션의 한계

**Floorplanner, 오늘의집 3D 등**
- 도면을 직접 그려야 함 → 대부분 포기
- 가구 라이브러리가 "비슷한 것"일 뿐, **내 가구의 정확한 사이즈**가 아님
- 공유는 되지만 **동시 편집**은 안 됨

**아키스케치**
- 전문가 타겟, 일반인에게 과한 기능
- 구매할 가구 중심, 이미 가진 가구 관리 어려움

---

## 3. 타겟 사용자

### Primary: 이사 예정자 (전/월세, 매매 모두)

**페르소나: 김민수 (35세, 맞벌이 신혼부부)**
> "다음 달에 24평 아파트로 이사하는데, 지금 쓰는 소파랑 식탁이 들어갈지 모르겠어요. 
> 아내랑 주말에 같이 배치 고민하고 싶은데, 둘 다 바빠서 시간 맞추기 힘들어요."

**핵심 니즈**
- 새 집 도면을 쉽게 얻고 싶다
- 내 가구 사이즈로 시뮬레이션하고 싶다
- 배우자와 비동기로 의견 나누고 싶다

### Secondary: 가구 재배치 고민자

**페르소나: 이영희 (42세, 주부)**
> "아이가 커서 방 구조를 바꾸려는데, 기존 가구를 어떻게 재배치할지 고민이에요."

---

## 4. 핵심 가치 제안 (Why Us)

### 4.1. 한국 아파트 평형 DB

- 전국 아파트 단지/평형별 도면 사전 등록
- "래미안 XX단지 24평 A타입" 검색 → 즉시 도면 로드
- 사용자가 도면을 그릴 필요 없음

**데이터 확보 전략**
1. 분양 공고 크롤링 (공개 정보)
2. 사용자 기여 (도면 업로드 시 프리미엄 기능 제공)
3. 부동산 플랫폼 API 연동 (직방, 다방 등)

### 4.2. 내 가구 인벤토리

- "내 가구" 등록: 이름, 가로×세로×높이
- 사진 촬영 → AI 사이즈 추정 (보조 기능)
- 한번 등록하면 모든 프로젝트에서 재사용
- "이 가구 가져갈까?" 체크리스트 기능

### 4.3. 국내 가구 실측 DB

| 브랜드 | 데이터 |
|--------|--------|
| 이케아 코리아 | 공식 API 또는 크롤링 |
| 한샘 | 제품 페이지 크롤링 |
| 일룸 | 제품 페이지 크롤링 |
| 당근마켓 인기 가구 | 커뮤니티 기여 |

"이케아 KALLAX 4×4" 검색 → 정확한 사이즈로 배치

### 4.4. 실시간 동시 편집

- Figma 스타일 멀티 커서
- 가족 구성원 초대 → 동시에 가구 배치
- 댓글/이모지 리액션
- "여보, 소파 여기 어때?" → 실시간 확인

### 4.5. 이사 체크리스트 연동

- 배치 완료된 가구 → "가져갈 가구" 목록 자동 생성
- 배치 안 된 가구 → "처분 검토" 목록
- 이사 업체 견적용 가구 리스트 PDF 출력

---

## 5. 기능 요구사항

### Phase 1: MVP (3개월)

**핵심 기능 (Must Have)**

| 기능 | 설명 | 우선순위 |
|------|------|----------|
| 아파트 도면 검색 | 단지명/평형으로 검색, 도면 자동 로드 | P0 |
| 내 가구 등록 | 이름, 사이즈(W×D×H), 색상, 사진 | P0 |
| 드래그 앤 드롭 배치 | 2D 평면도에 가구 배치 | P0 |
| 충돌 감지 | 가구 겹침, 문 열림 방해 경고 | P0 |
| 치수 표시 | 가구 간 거리, 벽까지 거리 | P0 |
| 프로젝트 저장 | 클라우드 저장, 여러 프로젝트 관리 | P0 |
| 이미지 내보내기 | PNG/PDF 다운로드 | P0 |

**초기 데이터**
- 수도권 주요 아파트 단지 500개 도면
- 이케아 코리아 전 제품 사이즈 DB

### Phase 2: 협업 & 확장 (6개월)

| 기능 | 설명 |
|------|------|
| 실시간 동시 편집 | WebSocket 기반 멀티 커서 |
| 댓글 & 리액션 | 특정 위치에 댓글 |
| 국내 가구 브랜드 DB | 한샘, 일룸, 리바트 등 |
| 3D 미리보기 | 간단한 3D 뷰 (워크스루는 아님) |
| 모바일 뷰어 | 편집은 데스크톱, 확인은 모바일 |

### Phase 3: 플랫폼화 (12개월)

| 기능 | 설명 |
|------|------|
| 이사 체크리스트 | 가져갈/버릴 가구 목록 |
| 이사 업체 연동 | 가구 리스트 기반 견적 요청 |
| 중고 가구 마켓 연동 | 당근마켓 사이즈 정보 연동 |
| AI 배치 제안 | "이 가구들로 최적 배치 추천해줘" |
| 커뮤니티 갤러리 | 같은 평형 배치 사례 공유 |

---

## 6. 기술 아키텍처

### 프론트엔드

```
Vue 3 + TypeScript
├── 프레임워크: Nuxt 3 (SSR/SEO 대응)
├── 2D 렌더링: vue-konva (Konva.js 공식 Vue 래퍼)
├── 실시간 협업: Yjs + y-websocket
├── 상태 관리: Pinia
├── 스타일링: Tailwind CSS
└── 3D (Phase 2): TresJS (Vue용 Three.js)
```

**vue-konva 선택 이유**
- Vue 템플릿 문법으로 캔버스 구조를 선언적으로 표현
- `<v-rect>`, `<v-group>` 등 컴포넌트 기반 개발
- 드래그/회전/스케일 등 가구 조작에 필요한 기능 내장

### 백엔드

```
Node.js + NestJS
├── DB: PostgreSQL + PostGIS (도면 좌표/공간 쿼리)
├── 실시간: Socket.io (Yjs 백엔드)
├── 파일 저장: S3 호환 스토리지 (Cloudflare R2 추천)
├── 검색: Meilisearch (아파트/가구 검색, 한글 형태소 지원)
└── 캐시: Redis
```

**Meilisearch 선택 이유**
- Elasticsearch 대비 가볍고 셀프호스팅 쉬움
- 한글 검색/오타 교정 기본 지원
- "래미안 원베일리" → "래미안원베일리" 퍼지 매칭

### 인프라

```
Cloudflare + Fly.io (또는 AWS)
├── 프론트엔드: Cloudflare Pages (Nuxt SSR)
├── 백엔드: Fly.io (NestJS 컨테이너)
├── DB: Supabase (PostgreSQL + PostGIS)
├── 파일: Cloudflare R2
├── 실시간: Fly.io (y-websocket 서버)
└── CI/CD: GitHub Actions
```

**Cloudflare + Fly.io 선택 이유**
- 초기 비용 최소화 (대부분 무료 티어로 시작)
- 한국 리전 지원으로 낮은 레이턴시
- Supabase로 PostGIS 즉시 사용 가능

### 주요 기술 결정

| 결정 포인트 | 선택 | 대안 | 이유 |
|-------------|------|------|------|
| 프론트 프레임워크 | Vue 3 + Nuxt 3 | React + Next.js | 팀 숙련도, Composition API 생산성 |
| 2D 라이브러리 | vue-konva | Fabric.js | Vue 통합 우수, 선언적 템플릿 |
| 실시간 협업 | Yjs + y-websocket | Liveblocks | 오픈소스, CRDT 기반 충돌 해결 |
| 검색 엔진 | Meilisearch | Elasticsearch | 경량, 한글 지원, 쉬운 운영 |
| 3D (Phase 2) | TresJS | Three.js 직접 | Vue 생태계 통합, 선언적 문법 |

### 핵심 코드 구조 (프론트엔드)

```
src/
├── components/
│   ├── editor/
│   │   ├── FloorPlanCanvas.vue    # vue-konva 메인 캔버스
│   │   ├── FurnitureItem.vue      # 개별 가구 컴포넌트
│   │   ├── WallLayer.vue          # 벽/문/창문 레이어
│   │   └── MeasurementLayer.vue   # 치수선 레이어
│   ├── sidebar/
│   │   ├── FurnitureLibrary.vue   # 가구 DB 검색/선택
│   │   └── MyFurnitureList.vue    # 내 가구 목록
│   └── collaboration/
│       ├── CursorOverlay.vue      # 다른 사용자 커서
│       └── CommentThread.vue      # 댓글 스레드
├── composables/
│   ├── useFloorPlan.ts            # 도면 상태 관리
│   ├── useFurniture.ts            # 가구 CRUD
│   ├── useCollaboration.ts        # Yjs 실시간 동기화
│   └── useCollision.ts            # 충돌 감지 로직
├── stores/
│   ├── project.ts                 # 프로젝트 Pinia 스토어
│   └── user.ts                    # 사용자 인증 상태
└── utils/
    ├── geometry.ts                # 좌표/충돌 계산
    └── export.ts                  # PNG/PDF 내보내기
```

### vue-konva 사용 예시

```vue
<template>
  <v-stage ref="stageRef" :config="stageConfig">
    <v-layer>
      <!-- 방 배경 -->
      <v-rect :config="roomConfig" />
      
      <!-- 벽 -->
      <v-line
        v-for="wall in walls"
        :key="wall.id"
        :config="wall"
      />
      
      <!-- 가구들 -->
      <v-group
        v-for="item in furniture"
        :key="item.id"
        :config="{ x: item.x, y: item.y, rotation: item.rotation }"
        :draggable="!isViewOnly"
        @dragstart="onDragStart(item)"
        @dragend="onDragEnd(item, $event)"
        @transformend="onTransformEnd(item, $event)"
      >
        <v-rect :config="getFurnitureStyle(item)" />
        <v-text :config="{ text: item.name, fontSize: 11 }" />
      </v-group>
      
      <!-- 다른 사용자 커서 (협업) -->
      <v-circle
        v-for="cursor in remoteCursors"
        :key="cursor.odclientId"
        :config="{ x: cursor.x, y: cursor.y, radius: 5, fill: cursor.color }"
      />
    </v-layer>
    
    <!-- 치수선 레이어 -->
    <v-layer>
      <MeasurementLayer :selected="selectedFurniture" />
    </v-layer>
  </v-stage>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useFloorPlan } from '@/composables/useFloorPlan'
import { useCollaboration } from '@/composables/useCollaboration'
import { useCollision } from '@/composables/useCollision'

const { walls, furniture, selectedFurniture } = useFloorPlan()
const { remoteCursors, syncPosition } = useCollaboration()
const { checkCollision } = useCollision()

const onDragEnd = (item: Furniture, e: KonvaEventObject) => {
  const newPos = { x: e.target.x(), y: e.target.y() }
  
  // 충돌 감지
  const collision = checkCollision(item, newPos)
  if (collision) {
    // 경고 표시 또는 원위치
    showCollisionWarning(collision)
    return
  }
  
  // 실시간 동기화
  syncPosition(item.id, newPos)
}
</script>
```

### 실시간 협업 구현 (Yjs)

```typescript
// composables/useCollaboration.ts
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import { ref, onMounted, onUnmounted } from 'vue'

export function useCollaboration(projectId: string) {
  const ydoc = new Y.Doc()
  const provider = ref<WebsocketProvider | null>(null)
  const remoteCursors = ref<Map<string, CursorState>>(new Map())
  
  // 가구 위치를 Y.Map으로 공유
  const furnitureMap = ydoc.getMap<FurnitureState>('furniture')
  // 커서 위치를 Awareness로 공유
  
  onMounted(() => {
    provider.value = new WebsocketProvider(
      'wss://your-yjs-server.fly.dev',
      projectId,
      ydoc
    )
    
    // Awareness: 실시간 커서 위치
    provider.value.awareness.on('change', () => {
      const states = provider.value!.awareness.getStates()
      remoteCursors.value = new Map(
        [...states.entries()]
          .filter(([id]) => id !== ydoc.clientID)
          .map(([id, state]) => [id, state.cursor])
      )
    })
  })
  
  const syncPosition = (furnitureId: string, position: Position) => {
    furnitureMap.set(furnitureId, {
      ...furnitureMap.get(furnitureId),
      ...position,
      updatedBy: ydoc.clientID,
      updatedAt: Date.now()
    })
  }
  
  const updateCursor = (x: number, y: number) => {
    provider.value?.awareness.setLocalStateField('cursor', {
      x, y,
      color: getUserColor(),
      name: getCurrentUserName()
    })
  }
  
  onUnmounted(() => {
    provider.value?.destroy()
    ydoc.destroy()
  })
  
  return { remoteCursors, syncPosition, updateCursor, furnitureMap }
}
```

---

## 7. 비즈니스 모델

### Freemium

| 플랜 | 가격 | 기능 |
|------|------|------|
| Free | ₩0 | 프로젝트 3개, 기본 가구 DB, 이미지 내보내기 |
| Pro | ₩4,900/월 | 무제한 프로젝트, 전체 가구 DB, 실시간 협업, 3D 뷰 |
| Team | ₩9,900/월 | Pro + 팀 관리, 브랜딩 제거, API 접근 |

### B2B 화이트라벨

- 부동산 중개 플랫폼 (직방, 다방)
- 가구 브랜드 (한샘 매장용 시뮬레이터)
- 이사 업체 (견적 도구로 활용)

---

## 8. 성공 지표

### North Star Metric

**"이사 완료 후 만족도"**
- 이사 후 설문: "가구 배치가 예상대로였나요?"
- 목표: 80% 이상 "예"

### 단계별 KPI

**Phase 1 (MVP)**
| 지표 | 목표 |
|------|------|
| 가입 전환율 | 방문자 → 가입 10% |
| 프로젝트 완료율 | 가구 5개 이상 배치 60% |
| 도면 검색 성공률 | 원하는 아파트 찾음 70% |

**Phase 2 (협업)**
| 지표 | 목표 |
|------|------|
| 공유율 | 프로젝트 중 30% 공유 |
| 동시 편집 세션 | 공유된 프로젝트 중 50% |
| 유료 전환율 | MAU 중 5% |

**Phase 3 (플랫폼)**
| 지표 | 목표 |
|------|------|
| B2B 계약 | 3개 이상 플랫폼 연동 |
| 커뮤니티 게시물 | 월 1,000개 배치 공유 |
| NPS | 50 이상 |

---

## 9. 리스크 & 대응

| 리스크 | 영향 | 대응 |
|--------|------|------|
| 아파트 도면 확보 어려움 | 핵심 가치 훼손 | 사용자 기여 인센티브, 분양 공고 크롤링 우선 |
| 가구 사이즈 DB 구축 비용 | 초기 비용 증가 | 이케아만 우선, 이후 확장 |
| Floorplanner 등 대형 경쟁사 | 마케팅 열위 | 한국 특화로 니치 확보 |
| 실시간 협업 기술 난이도 | 개발 지연 | Phase 2로 분리, MVP는 링크 공유만 |

---

## 10. 마일스톤

```
Month 1-2: 핵심 개발
├── Nuxt 3 프로젝트 셋업
├── vue-konva 2D 에디터 기본 기능
├── 가구 CRUD (Pinia + Supabase)
├── 아파트 도면 DB 스키마 & 초기 데이터 100개
└── 사용자 인증 (Supabase Auth)

Month 3: MVP 출시
├── Meilisearch 도면 검색 & 로드
├── PNG/PDF 내보내기 기능
├── 랜딩 페이지 & 온보딩
└── 베타 사용자 100명 확보

Month 4-6: Phase 2
├── Yjs 실시간 협업
├── 가구 DB 확장 (한샘, 일룸)
├── 유료 플랜 도입
└── MAU 5,000명

Month 7-12: Phase 3
├── B2B 파트너십
├── 커뮤니티 기능
├── TresJS 3D 뷰어
├── AI 배치 제안
└── MAU 50,000명
```

---

## 11. 경쟁사 대비 포지셔닝

```
                    전문가용
                       ↑
                       │
        아키스케치 ●   │
                       │
    ───────────────────┼─────────────────→ 한국 특화
                       │              ●
        Floorplanner ● │          [우리 서비스]
                       │
        오늘의집 3D ●  │
                       │
                       ↓
                    일반인용
```

**우리의 위치**: 일반인용 + 한국 특화의 교차점

---

## 12. 팀 구성 (이상적)

| 역할 | 인원 | 핵심 역량 |
|------|------|-----------|
| PM | 1 | 부동산/인테리어 도메인 이해 |
| 프론트엔드 | 2 | Vue 3, Canvas/WebGL, 실시간 협업 경험 |
| 백엔드 | 1 | NestJS, 검색, 실시간 시스템 |
| 디자이너 | 1 | 에디터 UX |
| 데이터 | 1 (파트타임) | 크롤링, 데이터 정제 |

MVP는 풀스택 2-3명으로 시작 가능.

---

## 부록: 사용자 시나리오

### 시나리오 1: 이사 준비

1. 김민수, "래미안 원베일리 34평" 검색
2. A타입 도면 선택 → 자동 로드
3. "내 가구" 탭에서 현재 소파(2400×1000) 등록
4. 거실에 드래그 → "문 열림 방해" 경고
5. 위치 조정 → 성공
6. 아내에게 링크 공유
7. 아내가 식탁 위치 수정, 댓글: "여기가 낫지 않아?"
8. 최종 확정 → PDF 다운로드
9. 이사 당일, 계획대로 배치 완료

### 시나리오 2: 중고 가구 구매

1. 당근마켓에서 소파 발견
2. 판매자에게 사이즈 문의 → "2100×900"
3. 우리 서비스에서 해당 사이즈로 가상 배치
4. "들어가네!" 확인 후 구매 결정
