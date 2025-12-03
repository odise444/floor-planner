<template>
  <div
    ref="containerRef"
    class="flex-1 bg-gray-200 overflow-hidden relative"
    @drop="onDrop"
    @dragover.prevent
    @dragenter.prevent
  >
    <v-stage
      ref="stageRef"
      :config="stageConfig"
      @wheel="onWheel"
      @mousedown="onMouseDown"
      @mousemove="onMouseMove"
      @mouseup="onMouseUp"
    >
      <!-- 그리드 레이어 (고정, 스테이지 변환 무시) -->
      <v-layer :config="{ listening: false }" v-if="false">
        <v-line v-for="line in gridLines" :key="line.id" :config="line" />
      </v-layer>

      <!-- 방/벽 레이어 -->
      <v-layer>
        <v-rect
          v-if="room"
          :config="{
            x: room.x,
            y: room.y,
            width: room.width,
            height: room.height,
            fill: '#ffffff',
            stroke: '#374151',
            strokeWidth: 3,
          }"
        />
        <!-- 치수선 표시 -->
        <template v-if="room">
          <!-- 가로 치수 -->
          <v-text
            :config="{
              x: room.x + room.width / 2,
              y: room.y - 25,
              text: `${Math.round(room.width / scale)}cm`,
              fontSize: 14,
              fill: '#374151',
              align: 'center',
              offsetX: 25,
            }"
          />
          <!-- 세로 치수 -->
          <v-text
            :config="{
              x: room.x - 25,
              y: room.y + room.height / 2,
              text: `${Math.round(room.height / scale)}cm`,
              fontSize: 14,
              fill: '#374151',
              align: 'center',
              rotation: -90,
              offsetX: 25,
            }"
          />
        </template>

        <!-- 문 렌더링 -->
        <v-group
          v-for="door in doorList"
          :key="door.id"
          :config="getDoorGroupConfig(door)"
          @click="selectDoor(door)"
          @dragend="onDoorDragEnd(door, $event)"
        >
          <!-- 문 프레임 (벽 끊김 표시) -->
          <v-rect
            :config="{
              width: door.wall === 'top' || door.wall === 'bottom' ? door.width * scale : 10,
              height: door.wall === 'left' || door.wall === 'right' ? door.width * scale : 10,
              fill: '#ffffff',
              stroke: selectedDoor?.id === door.id ? '#3b82f6' : '#374151',
              strokeWidth: selectedDoor?.id === door.id ? 2 : 1,
            }"
          />
          <!-- 문 열림 호 (arc) -->
          <v-arc
            :config="getDoorArcConfig(door)"
          />
          <!-- 문 패널 -->
          <v-line
            :config="getDoorPanelConfig(door)"
          />
        </v-group>
      </v-layer>

      <!-- 가구 레이어 -->
      <v-layer>
        <v-group
          v-for="furniture in furnitureList"
          :key="furniture.id"
          :config="{
            x: furniture.x,
            y: furniture.y,
            rotation: furniture.rotation,
            draggable: true,
          }"
          @dragmove="onFurnitureDragMove(furniture, $event)"
          @dragend="onFurnitureDragEnd(furniture, $event)"
          @click="selectFurniture(furniture)"
        >
          <v-rect
            :config="{
              width: furniture.width * scale,
              height: furniture.height * scale,
              fill: furniture.color,
              stroke:
                selectedFurniture?.id === furniture.id ? '#3b82f6' : '#374151',
              strokeWidth: selectedFurniture?.id === furniture.id ? 3 : 1,
              cornerRadius: 4,
            }"
          />
          <v-text
            :config="{
              text: furniture.name,
              fontSize: 12,
              fill: '#ffffff',
              width: furniture.width * scale,
              height: furniture.height * scale,
              align: 'center',
              verticalAlign: 'middle',
              padding: 4,
            }"
          />
        </v-group>
      </v-layer>
    </v-stage>

    <!-- 줌 컨트롤 -->
    <div class="absolute bottom-4 right-4 flex flex-col gap-2">
      <button
        class="w-10 h-10 bg-white rounded-lg shadow flex items-center justify-center hover:bg-gray-50"
        @click="zoomIn"
      >
        +
      </button>
      <button
        class="w-10 h-10 bg-white rounded-lg shadow flex items-center justify-center hover:bg-gray-50"
        @click="zoomOut"
      >
        -
      </button>
      <button
        class="w-10 h-10 bg-white rounded-lg shadow flex items-center justify-center hover:bg-gray-50 text-xs"
        @click="resetView"
      >
        리셋
      </button>
    </div>

    <!-- 방 생성 버튼 -->
    <div v-if="!room" class="absolute top-4 left-4">
      <button
        class="px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600"
        @click="showRoomModal = true"
      >
        + 방 만들기
      </button>
    </div>


    <!-- 선택된 문 정보 -->
    <div v-if="selectedDoor" class="absolute top-4 left-4 bg-white rounded-lg shadow p-3 text-sm">
      <div class="font-medium mb-2">문 설정</div>
      <div class="text-gray-600 text-xs space-y-1">
        <div>D: 열림 방향 ({{ selectedDoor.openDirection === 'inside' ? '안쪽' : '바깥쪽' }})</div>
        <div>H: 경첩 위치 ({{ selectedDoor.hingeSide === 'left' ? '왼쪽' : '오른쪽' }})</div>
        <div>Delete: 삭제</div>
      </div>
    </div>

    <!-- 선택된 가구 정보 -->
    <div v-if="selectedFurniture" class="absolute top-4 left-4 bg-white rounded-lg shadow p-3 text-sm">
      <div class="font-medium mb-2">{{ selectedFurniture.name }}</div>
      <div class="text-gray-600 text-xs space-y-1">
        <div>{{ selectedFurniture.width }} × {{ selectedFurniture.height }} cm</div>
        <div>R: 회전 ({{ selectedFurniture.rotation }}°)</div>
        <div>Delete: 삭제</div>
      </div>
    </div>

    <!-- 방 생성 모달 -->
    <div
      v-if="showRoomModal"
      class="absolute inset-0 bg-black/50 flex items-center justify-center"
    >
      <div class="bg-white rounded-xl p-6 w-80 shadow-xl">
        <h3 class="text-lg font-semibold mb-4">방 크기 입력</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm text-gray-600 mb-1">가로 (cm)</label>
            <input
              v-model.number="roomWidth"
              type="number"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="예: 400"
            />
          </div>
          <div>
            <label class="block text-sm text-gray-600 mb-1">세로 (cm)</label>
            <input
              v-model.number="roomHeight"
              type="number"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="예: 300"
            />
          </div>
          <div class="flex gap-2">
            <button
              class="flex-1 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              @click="showRoomModal = false"
            >
              취소
            </button>
            <button
              class="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              @click="createRoom"
            >
              생성
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 문 추가 모달 -->
    <div
      v-if="showDoorModal"
      class="absolute inset-0 bg-black/50 flex items-center justify-center"
    >
      <div class="bg-white rounded-xl p-6 w-80 shadow-xl">
        <h3 class="text-lg font-semibold mb-4">문 추가</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm text-gray-600 mb-1">벽 선택</label>
            <select
              v-model="doorWall"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="top">위쪽 벽</option>
              <option value="bottom">아래쪽 벽</option>
              <option value="left">왼쪽 벽</option>
              <option value="right">오른쪽 벽</option>
            </select>
          </div>
          <div>
            <label class="block text-sm text-gray-600 mb-1">
              위치 ({{ doorWall === 'top' || doorWall === 'bottom' ? '왼쪽에서' : '위에서' }} cm)
            </label>
            <input
              v-model.number="doorPosition"
              type="number"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="예: 100"
            />
          </div>
          <div>
            <label class="block text-sm text-gray-600 mb-1">문 너비 (cm)</label>
            <input
              v-model.number="doorWidth"
              type="number"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="예: 90"
            />
          </div>
          <div class="flex gap-2">
            <button
              class="flex-1 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              @click="showDoorModal = false"
            >
              취소
            </button>
            <button
              class="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              @click="createDoor"
            >
              추가
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { getDoorArcConfig as getDoorArcConfigUtil } from "~/utils/door";

interface Furniture {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  rotation: number;
}

interface Room {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Door {
  id: string;
  x: number;
  y: number;
  width: number; // 문 너비 (cm)
  wall: "top" | "bottom" | "left" | "right"; // 어느 벽에 배치
  openDirection: "inside" | "outside"; // 안쪽/바깥쪽 열림
  hingeSide: "left" | "right"; // 경첩 위치
}

// 1cm = 2px 스케일
const scale = 2;

const containerRef = ref<HTMLElement | null>(null);
const stageRef = ref<any>(null);

const stageConfig = ref({
  width: 800,
  height: 600,
  x: 0,
  y: 0,
  scaleX: 1,
  scaleY: 1,
});

// 방 상태
const room = ref<Room | null>(null);
const showRoomModal = ref(false);
const roomWidth = ref(400);
const roomHeight = ref(300);

// 문 모달 상태
const showDoorModal = ref(false);
const doorWall = ref<Door["wall"]>("bottom");
const doorPosition = ref(100);
const doorWidth = ref(90);

// 가구 상태
const furnitureList = ref<Furniture[]>([]);
const selectedFurniture = ref<Furniture | null>(null);

// 문 상태
const doorList = ref<Door[]>([]);
const selectedDoor = ref<Door | null>(null);

// 패닝 상태
const isPanning = ref(false);
const lastPointerPos = ref({ x: 0, y: 0 });

// 그리드 라인 생성 (스테이지 변환을 고려하여 화면에 맞게 그리드 생성)
const gridLines = computed(() => {
  const lines: any[] = [];
  const gridSize = 50; // 월드 좌표 기준 50px = 25cm
  const { x: offsetX, y: offsetY, scaleX, width, height } = stageConfig.value;

  // 화면 좌표를 월드 좌표로 변환
  const worldLeft = -offsetX / scaleX;
  const worldTop = -offsetY / scaleX;
  const worldRight = (width - offsetX) / scaleX;
  const worldBottom = (height - offsetY) / scaleX;

  // 그리드 시작/끝 지점 계산 (그리드 크기에 맞춰 정렬)
  const startX = Math.floor(worldLeft / gridSize) * gridSize;
  const endX = Math.ceil(worldRight / gridSize) * gridSize;
  const startY = Math.floor(worldTop / gridSize) * gridSize;
  const endY = Math.ceil(worldBottom / gridSize) * gridSize;

  // 세로선 (화면 좌표로 변환)
  for (let x = startX; x <= endX; x += gridSize) {
    const screenX = x * scaleX + offsetX;
    lines.push({
      id: `v-${x}`,
      points: [screenX, 0, screenX, height],
      stroke: x === 0 ? "#9ca3af" : "#d1d5db",
      strokeWidth: x === 0 ? 1 : 0.5,
    });
  }

  // 가로선 (화면 좌표로 변환)
  for (let y = startY; y <= endY; y += gridSize) {
    const screenY = y * scaleX + offsetY;
    lines.push({
      id: `h-${y}`,
      points: [0, screenY, width, screenY],
      stroke: y === 0 ? "#9ca3af" : "#d1d5db",
      strokeWidth: y === 0 ? 1 : 0.5,
    });
  }

  return lines;
});

// 줌 인
const zoomIn = () => {
  const newScale = Math.min(stageConfig.value.scaleX * 1.2, 3);
  stageConfig.value.scaleX = newScale;
  stageConfig.value.scaleY = newScale;
};

// 줌 아웃
const zoomOut = () => {
  const newScale = Math.max(stageConfig.value.scaleX / 1.2, 0.3);
  stageConfig.value.scaleX = newScale;
  stageConfig.value.scaleY = newScale;
};

// 뷰 리셋
const resetView = () => {
  stageConfig.value.scaleX = 1;
  stageConfig.value.scaleY = 1;
  stageConfig.value.x = stageConfig.value.width / 2;
  stageConfig.value.y = stageConfig.value.height / 2;
};

// 마우스 휠 줌
const onWheel = (e: any) => {
  e.evt.preventDefault();

  const scaleBy = 1.1;
  const stage = e.target.getStage();
  const oldScale = stageConfig.value.scaleX;

  const pointer = stage.getPointerPosition();
  const mousePointTo = {
    x: (pointer.x - stageConfig.value.x) / oldScale,
    y: (pointer.y - stageConfig.value.y) / oldScale,
  };

  const direction = e.evt.deltaY > 0 ? -1 : 1;
  const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;
  const clampedScale = Math.max(0.3, Math.min(3, newScale));

  stageConfig.value.scaleX = clampedScale;
  stageConfig.value.scaleY = clampedScale;
  stageConfig.value.x = pointer.x - mousePointTo.x * clampedScale;
  stageConfig.value.y = pointer.y - mousePointTo.y * clampedScale;
};

// 패닝
const onMouseDown = (e: any) => {
  if (e.target === e.target.getStage()) {
    isPanning.value = true;
    const pos = e.target.getStage().getPointerPosition();
    lastPointerPos.value = { x: pos.x, y: pos.y };
    // 빈 공간 클릭 시 선택 해제
    selectedFurniture.value = null;
    selectedDoor.value = null;
  }
};

const onMouseMove = (e: any) => {
  if (!isPanning.value) return;

  const pos = e.target.getStage().getPointerPosition();
  const dx = pos.x - lastPointerPos.value.x;
  const dy = pos.y - lastPointerPos.value.y;

  stageConfig.value.x += dx;
  stageConfig.value.y += dy;
  lastPointerPos.value = { x: pos.x, y: pos.y };
};

const onMouseUp = () => {
  isPanning.value = false;
};

// 방 생성
const createRoom = () => {
  const margin = 50; // 화면 가장자리 여백
  room.value = {
    x: 0,
    y: 0,
    width: roomWidth.value * scale,
    height: roomHeight.value * scale,
  };
  // 방의 왼쪽 상단이 화면 왼쪽 상단(여백 포함)에 오도록 뷰 위치 조정
  stageConfig.value.x = margin;
  stageConfig.value.y = margin;
  stageConfig.value.scaleX = 1;
  stageConfig.value.scaleY = 1;
  showRoomModal.value = false;
};

// 가구 드롭
const onDrop = (event: DragEvent) => {
  event.preventDefault();

  const data = event.dataTransfer?.getData("application/json");
  if (!data) return;

  const item = JSON.parse(data);
  const rect = containerRef.value?.getBoundingClientRect();
  if (!rect) return;

  const x = event.clientX - rect.left - stageConfig.value.x;
  const y = event.clientY - rect.top - stageConfig.value.y;

  const newFurniture: Furniture = {
    id: `${item.id}-${Date.now()}`,
    name: item.name,
    x: x / stageConfig.value.scaleX,
    y: y / stageConfig.value.scaleY,
    width: item.width,
    height: item.height,
    color: item.color,
    rotation: 0,
  };

  furnitureList.value.push(newFurniture);
  selectedFurniture.value = newFurniture;
};

// 스냅 거리 (px)
const SNAP_THRESHOLD = 15;

// 회전된 가구의 실제 바운딩 박스 계산
const getFurnitureBounds = (
  x: number,
  y: number,
  furniture: Furniture
): { left: number; top: number; right: number; bottom: number; width: number; height: number } => {
  const w = furniture.width * scale;
  const h = furniture.height * scale;
  const rotation = furniture.rotation;

  // 회전 각도에 따른 바운딩 박스 계산
  // Konva는 왼쪽 상단을 원점으로 회전
  switch (rotation) {
    case 90:
      // 90도 회전: 원점 기준 시계방향 회전
      return {
        left: x - h,
        top: y,
        right: x,
        bottom: y + w,
        width: h,
        height: w,
      };
    case 180:
      // 180도 회전
      return {
        left: x - w,
        top: y - h,
        right: x,
        bottom: y,
        width: w,
        height: h,
      };
    case 270:
      // 270도 회전
      return {
        left: x,
        top: y - w,
        right: x + h,
        bottom: y,
        width: h,
        height: w,
      };
    default:
      // 0도 (회전 없음)
      return {
        left: x,
        top: y,
        right: x + w,
        bottom: y + h,
        width: w,
        height: h,
      };
  }
};

// 벽과 다른 가구에 스냅 계산
const snapToAll = (
  x: number,
  y: number,
  furniture: Furniture
): { x: number; y: number } => {
  const bounds = getFurnitureBounds(x, y, furniture);
  let deltaX = 0;
  let deltaY = 0;
  let minDistX = SNAP_THRESHOLD;
  let minDistY = SNAP_THRESHOLD;

  // 벽에 스냅
  if (room.value) {
    const r = room.value;

    // 왼쪽 벽
    const distLeftWall = Math.abs(bounds.left - r.x);
    if (distLeftWall < minDistX) {
      minDistX = distLeftWall;
      deltaX = r.x - bounds.left;
    }
    // 오른쪽 벽
    const distRightWall = Math.abs(bounds.right - (r.x + r.width));
    if (distRightWall < minDistX) {
      minDistX = distRightWall;
      deltaX = r.x + r.width - bounds.right;
    }
    // 위쪽 벽
    const distTopWall = Math.abs(bounds.top - r.y);
    if (distTopWall < minDistY) {
      minDistY = distTopWall;
      deltaY = r.y - bounds.top;
    }
    // 아래쪽 벽
    const distBottomWall = Math.abs(bounds.bottom - (r.y + r.height));
    if (distBottomWall < minDistY) {
      minDistY = distBottomWall;
      deltaY = r.y + r.height - bounds.bottom;
    }
  }

  // 다른 가구에 스냅
  for (const other of furnitureList.value) {
    if (other.id === furniture.id) continue;

    const otherBounds = getFurnitureBounds(other.x, other.y, other);

    // 가로 방향 스냅 (좌우)
    // 내 왼쪽 → 상대 오른쪽
    const distLeftToRight = Math.abs(bounds.left - otherBounds.right);
    if (distLeftToRight < minDistX) {
      minDistX = distLeftToRight;
      deltaX = otherBounds.right - bounds.left;
    }
    // 내 오른쪽 → 상대 왼쪽
    const distRightToLeft = Math.abs(bounds.right - otherBounds.left);
    if (distRightToLeft < minDistX) {
      minDistX = distRightToLeft;
      deltaX = otherBounds.left - bounds.right;
    }
    // 내 왼쪽 → 상대 왼쪽 (정렬)
    const distLeftToLeft = Math.abs(bounds.left - otherBounds.left);
    if (distLeftToLeft < minDistX) {
      minDistX = distLeftToLeft;
      deltaX = otherBounds.left - bounds.left;
    }
    // 내 오른쪽 → 상대 오른쪽 (정렬)
    const distRightToRight = Math.abs(bounds.right - otherBounds.right);
    if (distRightToRight < minDistX) {
      minDistX = distRightToRight;
      deltaX = otherBounds.right - bounds.right;
    }

    // 세로 방향 스냅 (상하)
    // 내 위쪽 → 상대 아래쪽
    const distTopToBottom = Math.abs(bounds.top - otherBounds.bottom);
    if (distTopToBottom < minDistY) {
      minDistY = distTopToBottom;
      deltaY = otherBounds.bottom - bounds.top;
    }
    // 내 아래쪽 → 상대 위쪽
    const distBottomToTop = Math.abs(bounds.bottom - otherBounds.top);
    if (distBottomToTop < minDistY) {
      minDistY = distBottomToTop;
      deltaY = otherBounds.top - bounds.bottom;
    }
    // 내 위쪽 → 상대 위쪽 (정렬)
    const distTopToTop = Math.abs(bounds.top - otherBounds.top);
    if (distTopToTop < minDistY) {
      minDistY = distTopToTop;
      deltaY = otherBounds.top - bounds.top;
    }
    // 내 아래쪽 → 상대 아래쪽 (정렬)
    const distBottomToBottom = Math.abs(bounds.bottom - otherBounds.bottom);
    if (distBottomToBottom < minDistY) {
      minDistY = distBottomToBottom;
      deltaY = otherBounds.bottom - bounds.bottom;
    }
  }

  return { x: x + deltaX, y: y + deltaY };
};

// 가구 드래그 중 (스냅 적용)
const onFurnitureDragMove = (furniture: Furniture, e: any) => {
  const node = e.target;
  const { x, y } = snapToAll(node.x(), node.y(), furniture);
  node.x(x);
  node.y(y);
};

// 가구 드래그 종료
const onFurnitureDragEnd = (furniture: Furniture, e: any) => {
  const node = e.target;
  const { x, y } = snapToAll(node.x(), node.y(), furniture);
  furniture.x = x;
  furniture.y = y;
};

// 가구 선택
const selectFurniture = (furniture: Furniture) => {
  selectedFurniture.value = furniture;
  selectedDoor.value = null;
};

// 문 그룹 설정 (위치 + 드래그)
const getDoorGroupConfig = (door: Door) => {
  if (!room.value) return { x: 0, y: 0, draggable: true };
  const r = room.value;

  let x = 0;
  let y = 0;

  switch (door.wall) {
    case "top":
      x = r.x + door.x * scale;
      y = r.y - 5;
      break;
    case "bottom":
      x = r.x + door.x * scale;
      y = r.y + r.height - 5;
      break;
    case "left":
      x = r.x - 5;
      y = r.y + door.y * scale;
      break;
    case "right":
      x = r.x + r.width - 5;
      y = r.y + door.y * scale;
      break;
  }

  return { x, y, draggable: true };
};

// 문을 가장 가까운 벽에 스냅
const snapDoorToWall = (
  worldX: number,
  worldY: number,
  dw: number
): { wall: Door["wall"]; x: number; y: number } => {
  if (!room.value) return { wall: "bottom", x: 0, y: 0 };
  const r = room.value;

  // 각 벽까지의 거리 계산
  const distTop = Math.abs(worldY - r.y);
  const distBottom = Math.abs(worldY - (r.y + r.height));
  const distLeft = Math.abs(worldX - r.x);
  const distRight = Math.abs(worldX - (r.x + r.width));

  const minDist = Math.min(distTop, distBottom, distLeft, distRight);

  if (minDist === distTop) {
    const posX = Math.max(0, Math.min((r.width - dw) / scale, (worldX - r.x) / scale));
    return { wall: "top", x: posX, y: 0 };
  } else if (minDist === distBottom) {
    const posX = Math.max(0, Math.min((r.width - dw) / scale, (worldX - r.x) / scale));
    return { wall: "bottom", x: posX, y: 0 };
  } else if (minDist === distLeft) {
    const posY = Math.max(0, Math.min((r.height - dw) / scale, (worldY - r.y) / scale));
    return { wall: "left", x: 0, y: posY };
  } else {
    const posY = Math.max(0, Math.min((r.height - dw) / scale, (worldY - r.y) / scale));
    return { wall: "right", x: 0, y: posY };
  }
};

// 문 드래그 종료
const onDoorDragEnd = (door: Door, e: any) => {
  if (!room.value) return;
  const node = e.target;
  const dw = door.width * scale;

  // 드래그된 위치 (월드 좌표)
  const worldX = node.x();
  const worldY = node.y();

  // 가장 가까운 벽에 스냅
  const snapped = snapDoorToWall(worldX, worldY, dw);
  door.wall = snapped.wall;
  door.x = snapped.x;
  door.y = snapped.y;
};

// 문 열림 호(arc) 설정 - 테스트된 유틸 함수 사용
const getDoorArcConfig = (door: Door) => {
  const dw = door.width * scale;
  const config = getDoorArcConfigUtil(door.wall, door.openDirection, door.hingeSide, dw);

  return {
    x: config.x,
    y: config.y,
    innerRadius: 0,
    outerRadius: dw,
    angle: 90,
    rotation: config.rotation,
    fill: "transparent",
    stroke: "#6b7280",
    strokeWidth: 1,
    dash: [4, 4],
  };
};

// 문 패널(열린 문) 설정 - arc와 동일한 중심점에서 45도 방향
const getDoorPanelConfig = (door: Door) => {
  const dw = door.width * scale;
  const arcConfig = getDoorArcConfig(door);

  // arc의 중심점(경첩 위치)
  const cx = arcConfig.x;
  const cy = arcConfig.y;

  // arc의 rotation + 45도 방향으로 선 그리기
  const angleRad = ((arcConfig.rotation + 45) * Math.PI) / 180;
  const endX = cx + dw * Math.cos(angleRad);
  const endY = cy + dw * Math.sin(angleRad);

  return {
    points: [cx, cy, endX, endY],
    stroke: "#374151",
    strokeWidth: 2,
  };
};

// 문 선택
const selectDoor = (door: Door) => {
  selectedDoor.value = door;
  selectedFurniture.value = null;
};

// 문 추가 (모달에서 호출)
const createDoor = () => {
  const newDoor: Door = {
    id: `door-${Date.now()}`,
    x: doorWall.value === "top" || doorWall.value === "bottom" ? doorPosition.value : 0,
    y: doorWall.value === "left" || doorWall.value === "right" ? doorPosition.value : 0,
    width: doorWidth.value,
    wall: doorWall.value,
    openDirection: "inside",
    hingeSide: "left",
  };
  doorList.value.push(newDoor);
  selectedDoor.value = newDoor;
  showDoorModal.value = false;
};

// 키보드 이벤트
const onKeyDown = (e: KeyboardEvent) => {
  // 가구 삭제
  if (e.key === "Delete" && selectedFurniture.value) {
    furnitureList.value = furnitureList.value.filter(
      (f) => f.id !== selectedFurniture.value?.id
    );
    selectedFurniture.value = null;
  }

  // 가구 회전
  if (e.key === "r" && selectedFurniture.value) {
    selectedFurniture.value.rotation =
      (selectedFurniture.value.rotation + 90) % 360;
  }

  // 문 삭제
  if (e.key === "Delete" && selectedDoor.value) {
    doorList.value = doorList.value.filter(
      (d) => d.id !== selectedDoor.value?.id
    );
    selectedDoor.value = null;
  }

  // 문 열림 방향 전환 (D키)
  if (e.key === "d" && selectedDoor.value) {
    selectedDoor.value.openDirection =
      selectedDoor.value.openDirection === "inside" ? "outside" : "inside";
  }

  // 문 경첩 위치 전환 (H키)
  if (e.key === "h" && selectedDoor.value) {
    selectedDoor.value.hingeSide =
      selectedDoor.value.hingeSide === "left" ? "right" : "left";
  }
};

// 컨테이너 리사이즈 핸들링
const updateSize = () => {
  if (containerRef.value) {
    stageConfig.value.width = containerRef.value.clientWidth;
    stageConfig.value.height = containerRef.value.clientHeight;
  }
};

onMounted(() => {
  updateSize();
  window.addEventListener("resize", updateSize);
  window.addEventListener("keydown", onKeyDown);

  // 초기 뷰 위치를 중앙으로
  stageConfig.value.x = stageConfig.value.width / 2;
  stageConfig.value.y = stageConfig.value.height / 2;
});

onUnmounted(() => {
  window.removeEventListener("resize", updateSize);
  window.removeEventListener("keydown", onKeyDown);
});

// 외부에서 접근 가능하도록 노출
defineExpose({
  room,
  showDoorModal,
  doorWall,
  doorPosition,
  doorWidth,
  createDoor,
});
</script>
