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
          @mousedown="onRoomMouseDown"
          @click="onRoomClick"
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
          @dblclick="openDoorEditForm(door)"
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
          <!-- 문 크기 표시 -->
          <v-text
            :config="{
              text: `${door.width}`,
              fontSize: 10,
              fill: '#374151',
              x: door.wall === 'top' || door.wall === 'bottom' ? (door.width * scale) / 2 - 10 : -15,
              y: door.wall === 'left' || door.wall === 'right' ? (door.width * scale) / 2 - 5 : -15,
            }"
          />
        </v-group>
      </v-layer>

      <!-- 가구 레이어 -->
      <v-layer ref="furnitureLayerRef">
        <v-group
          v-for="furniture in furnitureList"
          :key="furniture.id"
          :ref="(el: any) => setFurnitureRef(furniture.id, el)"
          :config="{
            x: furniture.x + (furniture.width * scale) / 2,
            y: furniture.y + (furniture.height * scale) / 2,
            offsetX: (furniture.width * scale) / 2,
            offsetY: (furniture.height * scale) / 2,
            rotation: furniture.rotation,
            draggable: true,
            name: `furniture-${furniture.id}`,
          }"
          @dragmove="onFurnitureDragMove(furniture, $event)"
          @dragend="onFurnitureDragEnd(furniture, $event)"
          @click="selectFurniture(furniture)"
          @dblclick="openFurnitureEditForm(furniture)"
          @transformend="onFurnitureTransformEnd(furniture, $event)"
        >
          <!-- 사각형 (기본) -->
          <v-rect
            v-if="!furniture.shape || furniture.shape === 'rect'"
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
          <!-- 원형 -->
          <v-circle
            v-else-if="furniture.shape === 'circle'"
            :config="{
              x: (furniture.width * scale) / 2,
              y: (furniture.height * scale) / 2,
              radius: Math.min(furniture.width, furniture.height) * scale / 2,
              fill: furniture.color,
              stroke:
                selectedFurniture?.id === furniture.id ? '#3b82f6' : '#374151',
              strokeWidth: selectedFurniture?.id === furniture.id ? 3 : 1,
            }"
          />
          <!-- 타원형 -->
          <v-ellipse
            v-else-if="furniture.shape === 'ellipse'"
            :config="{
              x: (furniture.width * scale) / 2,
              y: (furniture.height * scale) / 2,
              radiusX: (furniture.width * scale) / 2,
              radiusY: (furniture.height * scale) / 2,
              fill: furniture.color,
              stroke:
                selectedFurniture?.id === furniture.id ? '#3b82f6' : '#374151',
              strokeWidth: selectedFurniture?.id === furniture.id ? 3 : 1,
            }"
          />
          <!-- L자형 -->
          <v-line
            v-else-if="furniture.shape === 'l-shape'"
            :config="getLShapeConfig(furniture)"
          />
          <!-- 가구 이름 -->
          <v-text
            :config="getFurnitureTextConfig(furniture)"
          />
          <!-- 가로 치수 (상단 내부 테두리) -->
          <v-text
            :config="{
              text: `${furniture.width}cm`,
              fontSize: 10,
              fill: '#374151',
              x: (furniture.width * scale) / 2,
              y: 4,
              offsetX: 15,
            }"
          />
          <!-- 세로 치수 (좌측 내부 테두리) -->
          <v-text
            :config="{
              text: `${furniture.height}cm`,
              fontSize: 10,
              fill: '#374151',
              x: 4,
              y: (furniture.height * scale) / 2,
              rotation: -90,
              offsetX: 15,
            }"
          />
        </v-group>
        <!-- 리사이즈 트랜스포머 (선택된 가구에 표시) -->
        <v-transformer
          v-if="selectedFurniture"
          ref="transformerRef"
          :config="{
            rotateEnabled: false,
            keepRatio: false,
            enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'top-center', 'bottom-center', 'middle-left', 'middle-right'],
            boundBoxFunc: boundBoxFunc,
            anchorSize: 10,
            anchorCornerRadius: 2,
            borderStroke: '#3b82f6',
            anchorStroke: '#3b82f6',
            anchorFill: '#ffffff',
          }"
        />
        <!-- L자형 비율 조절 핸들 (가로 방향) -->
        <v-rect
          v-if="selectedFurniture?.shape === 'l-shape'"
          :config="getLShapeHandleHorizontal(selectedFurniture)"
          @dragmove="onLShapeHandleDragH(selectedFurniture, $event)"
        />
        <!-- L자형 비율 조절 핸들 (세로 방향) -->
        <v-rect
          v-if="selectedFurniture?.shape === 'l-shape'"
          :config="getLShapeHandleVertical(selectedFurniture)"
          @dragmove="onLShapeHandleDragV(selectedFurniture, $event)"
        />
      </v-layer>

      <!-- 거리 표시 레이어 (선택된 가구가 있을 때만) -->
      <v-layer v-if="selectedFurniture && room">
        <!-- 벽/가구까지의 거리선 -->
        <template v-for="dist in distanceLines" :key="dist.id">
          <!-- 거리선 -->
          <v-line
            :config="{
              points: dist.points,
              stroke: dist.color,
              strokeWidth: 1,
              dash: [4, 4],
            }"
          />
          <!-- 거리 텍스트 -->
          <v-text
            :config="{
              text: `${dist.distance}cm`,
              fontSize: 11,
              fill: dist.color,
              fontStyle: 'bold',
              x: dist.textX,
              y: dist.textY,
              offsetX: dist.offsetX || 0,
              offsetY: dist.offsetY || 0,
            }"
          />
        </template>
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


    <!-- 선택된 문 편집 폼 (더블클릭 시 표시) -->
    <div v-if="selectedDoor && showEditForm" class="absolute top-4 left-4">
      <DoorEditForm
        :door="selectedDoor"
        @update="onDoorUpdate"
        @delete="deleteDoor"
        @close="closeEditForm"
      />
    </div>

    <!-- 선택된 가구 편집 폼 (더블클릭 시 표시) -->
    <div v-if="selectedFurniture && showEditForm" class="absolute top-4 left-4">
      <FurnitureEditForm
        :furniture="selectedFurniture"
        @update="onFurnitureUpdate"
        @delete="deleteFurniture"
        @close="closeEditForm"
      />
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
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from "vue";
import { getDoorArcConfig as getDoorArcConfigUtil } from "~/utils/door";
import { applyFurnitureEdit, applyDoorEdit, type FurnitureEditData, type DoorEditData } from "~/utils/objectEdit";
import { saveFloorPlan, loadFloorPlan, exportToJson } from "~/utils/floorPlanStorage";
import FurnitureEditForm from "~/components/editor/FurnitureEditForm.vue";
import DoorEditForm from "~/components/editor/DoorEditForm.vue";
import type { Furniture, FurnitureShape, LShapeDirection } from "~/types/furniture";

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

// L자형 가구 config 생성
const getLShapeConfig = (furniture: Furniture) => {
  const w = furniture.width * scale;
  const h = furniture.height * scale;
  const ratioW = furniture.lShapeRatioW ?? furniture.lShapeRatio ?? 0.5;
  const ratioH = furniture.lShapeRatioH ?? furniture.lShapeRatio ?? 0.5;
  const direction = furniture.lShapeDirection || 'bottom-right';

  // L자 모양의 점들 계산 (닫힌 다각형)
  let points: number[] = [];
  const cutW = w * ratioW;
  const cutH = h * ratioH;

  switch (direction) {
    case 'bottom-right': // └ 모양 (왼쪽 위 잘림)
      points = [0, cutH, cutW, cutH, cutW, 0, w, 0, w, h, 0, h];
      break;
    case 'bottom-left': // ┘ 모양 (오른쪽 위 잘림)
      points = [0, 0, w - cutW, 0, w - cutW, cutH, w, cutH, w, h, 0, h];
      break;
    case 'top-right': // ┌ 모양 (왼쪽 아래 잘림)
      points = [0, 0, w, 0, w, h - cutH, w - cutW, h - cutH, w - cutW, h, 0, h];
      break;
    case 'top-left': // ┐ 모양 (오른쪽 아래 잘림)
      points = [0, 0, w, 0, w, h, cutW, h, cutW, h - cutH, 0, h - cutH];
      break;
  }

  return {
    points,
    fill: furniture.color,
    stroke: selectedFurniture.value?.id === furniture.id ? '#3b82f6' : '#374151',
    strokeWidth: selectedFurniture.value?.id === furniture.id ? 3 : 1,
    closed: true,
  };
};

// 가구 이름 텍스트 config
const getFurnitureTextConfig = (furniture: Furniture) => {
  const w = furniture.width * scale;
  const h = furniture.height * scale;

  // L자형이 아닌 경우 기본 중앙 정렬
  if (furniture.shape !== 'l-shape') {
    return {
      text: furniture.name,
      fontSize: 12,
      fill: '#ffffff',
      width: w,
      height: h,
      align: 'center',
      verticalAlign: 'middle',
      padding: 4,
    };
  }

  // L자형: 넓은 영역에 텍스트 배치
  const ratioW = furniture.lShapeRatioW ?? furniture.lShapeRatio ?? 0.5;
  const ratioH = furniture.lShapeRatioH ?? furniture.lShapeRatio ?? 0.5;
  const direction = furniture.lShapeDirection || 'bottom-right';
  const cutW = w * ratioW;
  const cutH = h * ratioH;

  // L자형의 두 영역 중 더 넓은 곳 (하단 또는 우측 막대)
  let textX = 0;
  let textY = 0;
  let textW = w;
  let textH = h;

  switch (direction) {
    case 'bottom-right': // └ 모양 - 하단 막대가 넓음
      textX = 0;
      textY = cutH;
      textW = w;
      textH = h - cutH;
      break;
    case 'bottom-left': // ┘ 모양 - 하단 막대
      textX = 0;
      textY = cutH;
      textW = w;
      textH = h - cutH;
      break;
    case 'top-right': // ┌ 모양 - 상단 막대
      textX = 0;
      textY = 0;
      textW = w;
      textH = h - cutH;
      break;
    case 'top-left': // ┐ 모양 - 상단 막대
      textX = 0;
      textY = 0;
      textW = w;
      textH = h - cutH;
      break;
  }

  return {
    text: furniture.name,
    fontSize: 12,
    fill: '#ffffff',
    x: textX,
    y: textY,
    width: textW,
    height: textH,
    align: 'center',
    verticalAlign: 'middle',
    padding: 4,
  };
};

// L자형 가로 핸들 (cutW 조절)
const getLShapeHandleHorizontal = (furniture: Furniture) => {
  const w = furniture.width * scale;
  const h = furniture.height * scale;
  const ratioW = furniture.lShapeRatioW ?? furniture.lShapeRatio ?? 0.5;
  const ratioH = furniture.lShapeRatioH ?? furniture.lShapeRatio ?? 0.5;
  const direction = furniture.lShapeDirection || 'bottom-right';
  const cutW = w * ratioW;
  const cutH = h * ratioH;

  let x = 0;
  let y = 0;

  switch (direction) {
    case 'bottom-right':
      x = furniture.x + cutW;
      y = furniture.y + cutH / 2;
      break;
    case 'bottom-left':
      x = furniture.x + w - cutW;
      y = furniture.y + cutH / 2;
      break;
    case 'top-right':
      x = furniture.x + w - cutW;
      y = furniture.y + h - cutH / 2;
      break;
    case 'top-left':
      x = furniture.x + cutW;
      y = furniture.y + h - cutH / 2;
      break;
  }

  return {
    x: x - 5,
    y: y - 8,
    width: 10,
    height: 16,
    fill: '#3b82f6',
    stroke: '#ffffff',
    strokeWidth: 2,
    cornerRadius: 3,
    draggable: true,
    hitStrokeWidth: 10,
  };
};

// L자형 세로 핸들 (cutH 조절)
const getLShapeHandleVertical = (furniture: Furniture) => {
  const w = furniture.width * scale;
  const h = furniture.height * scale;
  const ratioW = furniture.lShapeRatioW ?? furniture.lShapeRatio ?? 0.5;
  const ratioH = furniture.lShapeRatioH ?? furniture.lShapeRatio ?? 0.5;
  const direction = furniture.lShapeDirection || 'bottom-right';
  const cutW = w * ratioW;
  const cutH = h * ratioH;

  let x = 0;
  let y = 0;

  switch (direction) {
    case 'bottom-right':
      x = furniture.x + cutW / 2;
      y = furniture.y + cutH;
      break;
    case 'bottom-left':
      x = furniture.x + w - cutW / 2;
      y = furniture.y + cutH;
      break;
    case 'top-right':
      x = furniture.x + w - cutW / 2;
      y = furniture.y + h - cutH;
      break;
    case 'top-left':
      x = furniture.x + cutW / 2;
      y = furniture.y + h - cutH;
      break;
  }

  return {
    x: x - 8,
    y: y - 5,
    width: 16,
    height: 10,
    fill: '#3b82f6',
    stroke: '#ffffff',
    strokeWidth: 2,
    cornerRadius: 3,
    draggable: true,
    hitStrokeWidth: 10,
  };
};

// L자형 가로 핸들 드래그
const onLShapeHandleDragH = (furniture: Furniture, e: any) => {
  const node = e.target;
  const w = furniture.width * scale;
  const direction = furniture.lShapeDirection || 'bottom-right';

  const handleX = node.x() + 5;
  const localX = handleX - furniture.x;

  let newRatio = 0.5;
  switch (direction) {
    case 'bottom-right':
    case 'top-left':
      newRatio = localX / w;
      break;
    case 'bottom-left':
    case 'top-right':
      newRatio = (w - localX) / w;
      break;
  }

  furniture.lShapeRatioW = Math.max(0.2, Math.min(0.8, Math.round(newRatio * 100) / 100));
};

// L자형 세로 핸들 드래그
const onLShapeHandleDragV = (furniture: Furniture, e: any) => {
  const node = e.target;
  const h = furniture.height * scale;
  const direction = furniture.lShapeDirection || 'bottom-right';

  const handleY = node.y() + 5;
  const localY = handleY - furniture.y;

  let newRatio = 0.5;
  switch (direction) {
    case 'bottom-right':
    case 'bottom-left':
      newRatio = localY / h;
      break;
    case 'top-right':
    case 'top-left':
      newRatio = (h - localY) / h;
      break;
  }

  furniture.lShapeRatioH = Math.max(0.2, Math.min(0.8, Math.round(newRatio * 100) / 100));
};

const containerRef = ref<HTMLElement | null>(null);
const stageRef = ref<any>(null);
const furnitureLayerRef = ref<any>(null);
const transformerRef = ref<any>(null);
const furnitureRefs = ref<Map<string, any>>(new Map());

// 가구 그룹 ref 설정
const setFurnitureRef = (id: string, el: any) => {
  if (el) {
    furnitureRefs.value.set(id, el);
  } else {
    furnitureRefs.value.delete(id);
  }
};

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

// 편집 폼 표시 상태 (더블클릭 시 true)
const showEditForm = ref(false);

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

// 선택된 가구와 벽/다른 가구 사이의 거리 계산
interface DistanceLine {
  id: string;
  points: number[];
  distance: number;
  textX: number;
  textY: number;
  offsetX?: number;
  offsetY?: number;
  color: string;
}

// 거리 표시 색상
const WALL_DISTANCE_COLOR = '#3b82f6';     // 파란색 (벽까지 거리)
const FURNITURE_DISTANCE_COLOR = '#f97316'; // 주황색 (가구까지 거리)

const distanceLines = computed((): DistanceLine[] => {
  if (!selectedFurniture.value || !room.value) return [];

  const lines: DistanceLine[] = [];
  const f = selectedFurniture.value;
  const r = room.value;
  const bounds = getFurnitureBounds(f.x, f.y, f);

  // 벽까지의 거리
  // 왼쪽 벽
  const distLeft = bounds.left - r.x;
  if (distLeft > 0) {
    const midY = (bounds.top + bounds.bottom) / 2;
    lines.push({
      id: 'wall-left',
      points: [r.x, midY, bounds.left, midY],
      distance: Math.round(distLeft / scale),
      textX: r.x + distLeft / 2,
      textY: midY - 8,
      offsetX: 12,
      color: WALL_DISTANCE_COLOR,
    });
  }

  // 오른쪽 벽
  const distRight = (r.x + r.width) - bounds.right;
  if (distRight > 0) {
    const midY = (bounds.top + bounds.bottom) / 2;
    lines.push({
      id: 'wall-right',
      points: [bounds.right, midY, r.x + r.width, midY],
      distance: Math.round(distRight / scale),
      textX: bounds.right + distRight / 2,
      textY: midY - 8,
      offsetX: 12,
      color: WALL_DISTANCE_COLOR,
    });
  }

  // 위쪽 벽
  const distTop = bounds.top - r.y;
  if (distTop > 0) {
    const midX = (bounds.left + bounds.right) / 2;
    lines.push({
      id: 'wall-top',
      points: [midX, r.y, midX, bounds.top],
      distance: Math.round(distTop / scale),
      textX: midX + 4,
      textY: r.y + distTop / 2,
      offsetY: 5,
      color: WALL_DISTANCE_COLOR,
    });
  }

  // 아래쪽 벽
  const distBottom = (r.y + r.height) - bounds.bottom;
  if (distBottom > 0) {
    const midX = (bounds.left + bounds.right) / 2;
    lines.push({
      id: 'wall-bottom',
      points: [midX, bounds.bottom, midX, r.y + r.height],
      distance: Math.round(distBottom / scale),
      textX: midX + 4,
      textY: bounds.bottom + distBottom / 2,
      offsetY: 5,
      color: WALL_DISTANCE_COLOR,
    });
  }

  // 다른 가구까지의 거리
  for (const other of furnitureList.value) {
    if (other.id === f.id) continue;

    const otherBounds = getFurnitureBounds(other.x, other.y, other);

    // Y축이 겹치는 경우 (좌우 거리)
    const yOverlap = !(bounds.bottom <= otherBounds.top || bounds.top >= otherBounds.bottom);
    if (yOverlap) {
      // 다른 가구가 오른쪽에 있는 경우
      if (otherBounds.left > bounds.right) {
        const dist = otherBounds.left - bounds.right;
        const midY = Math.max(bounds.top, otherBounds.top) +
          (Math.min(bounds.bottom, otherBounds.bottom) - Math.max(bounds.top, otherBounds.top)) / 2;
        lines.push({
          id: `furniture-right-${other.id}`,
          points: [bounds.right, midY, otherBounds.left, midY],
          distance: Math.round(dist / scale),
          textX: bounds.right + dist / 2,
          textY: midY - 8,
          offsetX: 12,
          color: FURNITURE_DISTANCE_COLOR,
        });
      }
      // 다른 가구가 왼쪽에 있는 경우
      if (otherBounds.right < bounds.left) {
        const dist = bounds.left - otherBounds.right;
        const midY = Math.max(bounds.top, otherBounds.top) +
          (Math.min(bounds.bottom, otherBounds.bottom) - Math.max(bounds.top, otherBounds.top)) / 2;
        lines.push({
          id: `furniture-left-${other.id}`,
          points: [otherBounds.right, midY, bounds.left, midY],
          distance: Math.round(dist / scale),
          textX: otherBounds.right + dist / 2,
          textY: midY - 8,
          offsetX: 12,
          color: FURNITURE_DISTANCE_COLOR,
        });
      }
    }

    // X축이 겹치는 경우 (상하 거리)
    const xOverlap = !(bounds.right <= otherBounds.left || bounds.left >= otherBounds.right);
    if (xOverlap) {
      // 다른 가구가 아래에 있는 경우
      if (otherBounds.top > bounds.bottom) {
        const dist = otherBounds.top - bounds.bottom;
        const midX = Math.max(bounds.left, otherBounds.left) +
          (Math.min(bounds.right, otherBounds.right) - Math.max(bounds.left, otherBounds.left)) / 2;
        lines.push({
          id: `furniture-bottom-${other.id}`,
          points: [midX, bounds.bottom, midX, otherBounds.top],
          distance: Math.round(dist / scale),
          textX: midX + 4,
          textY: bounds.bottom + dist / 2,
          offsetY: 5,
          color: FURNITURE_DISTANCE_COLOR,
        });
      }
      // 다른 가구가 위에 있는 경우
      if (otherBounds.bottom < bounds.top) {
        const dist = bounds.top - otherBounds.bottom;
        const midX = Math.max(bounds.left, otherBounds.left) +
          (Math.min(bounds.right, otherBounds.right) - Math.max(bounds.left, otherBounds.left)) / 2;
        lines.push({
          id: `furniture-top-${other.id}`,
          points: [midX, otherBounds.bottom, midX, bounds.top],
          distance: Math.round(dist / scale),
          textX: midX + 4,
          textY: otherBounds.bottom + dist / 2,
          offsetY: 5,
          color: FURNITURE_DISTANCE_COLOR,
        });
      }
    }
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
    // 빈 공간 클릭 시 선택 및 편집 폼 해제
    selectedFurniture.value = null;
    selectedDoor.value = null;
    showEditForm.value = false;
  }
};

// 방 클릭 시 패닝 시작
const onRoomMouseDown = (e: any) => {
  isPanning.value = true;
  const pos = e.target.getStage().getPointerPosition();
  lastPointerPos.value = { x: pos.x, y: pos.y };
};

// 방 클릭 시 선택 및 편집 폼 해제
const onRoomClick = () => {
  selectedFurniture.value = null;
  selectedDoor.value = null;
  showEditForm.value = false;
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
    shape: item.shape,
    lShapeDirection: item.lShapeDirection,
    lShapeRatio: item.lShapeRatio,
  };

  furnitureList.value.push(newFurniture);
  selectedFurniture.value = newFurniture;
};

// 스냅 거리 (px)
const SNAP_THRESHOLD = 15;

// 두 바운딩 박스가 겹치는지 확인
const isOverlapping = (
  a: { left: number; top: number; right: number; bottom: number },
  b: { left: number; top: number; right: number; bottom: number }
): boolean => {
  return !(a.right <= b.left || a.left >= b.right || a.bottom <= b.top || a.top >= b.bottom);
};

// 가구 이동 가능 여부 확인 (충돌 감지)
const canMoveFurniture = (
  furniture: Furniture,
  newX: number,
  newY: number
): boolean => {
  const newBounds = getFurnitureBounds(newX, newY, furniture);

  // 벽 충돌 확인
  if (room.value) {
    const r = room.value;
    if (newBounds.left < r.x || newBounds.right > r.x + r.width ||
        newBounds.top < r.y || newBounds.bottom > r.y + r.height) {
      return false;
    }
  }

  // 다른 가구와 충돌 확인
  for (const other of furnitureList.value) {
    if (other.id === furniture.id) continue;
    const otherBounds = getFurnitureBounds(other.x, other.y, other);
    if (isOverlapping(newBounds, otherBounds)) {
      return false;
    }
  }

  // 문과 충돌 확인
  for (const door of doorList.value) {
    const doorBounds = getDoorBounds(door);
    if (isOverlapping(newBounds, doorBounds)) {
      return false;
    }
  }

  return true;
};

// 문의 바운딩 박스 계산
const getDoorBounds = (door: Door): { left: number; top: number; right: number; bottom: number } => {
  if (!room.value) return { left: 0, top: 0, right: 0, bottom: 0 };
  const r = room.value;
  const dw = door.width * scale;

  switch (door.wall) {
    case "top":
      return {
        left: r.x + door.x * scale,
        top: r.y - 5,
        right: r.x + door.x * scale + dw,
        bottom: r.y + 5,
      };
    case "bottom":
      return {
        left: r.x + door.x * scale,
        top: r.y + r.height - 5,
        right: r.x + door.x * scale + dw,
        bottom: r.y + r.height + 5,
      };
    case "left":
      return {
        left: r.x - 5,
        top: r.y + door.y * scale,
        right: r.x + 5,
        bottom: r.y + door.y * scale + dw,
      };
    case "right":
      return {
        left: r.x + r.width - 5,
        top: r.y + door.y * scale,
        right: r.x + r.width + 5,
        bottom: r.y + door.y * scale + dw,
      };
  }
};

// 문 이동 가능 여부 확인
const canMoveDoor = (
  door: Door,
  newX: number,
  newY: number
): boolean => {
  if (!room.value) return false;

  // 임시 문 객체 생성
  const tempDoor = { ...door, x: newX, y: newY };
  const newBounds = getDoorBounds(tempDoor);

  // 다른 문과 충돌 확인
  for (const other of doorList.value) {
    if (other.id === door.id) continue;
    const otherBounds = getDoorBounds(other);
    if (isOverlapping(newBounds, otherBounds)) {
      return false;
    }
  }

  // 가구와 충돌 확인
  for (const furniture of furnitureList.value) {
    const furnitureBounds = getFurnitureBounds(furniture.x, furniture.y, furniture);
    if (isOverlapping(newBounds, furnitureBounds)) {
      return false;
    }
  }

  return true;
};

// 회전된 가구의 실제 바운딩 박스 계산 (중심점 기준 회전)
// Konva의 offset + rotation 동작 방식:
// 1. x, y는 그룹의 위치 (여기서는 furniture.x + w/2, furniture.y + h/2 = 중심점)
// 2. offsetX, offsetY로 원점을 중심으로 이동 (w/2, h/2)
// 3. rotation 적용 (중심 기준 회전)
// 결과: 회전 후에도 중심점은 동일한 위치 유지
const getFurnitureBounds = (
  x: number,
  y: number,
  furniture: Furniture
): { left: number; top: number; right: number; bottom: number; width: number; height: number } => {
  const w = furniture.width * scale;
  const h = furniture.height * scale;
  const rotation = furniture.rotation;

  // 90도/270도 회전 시 가로/세로가 바뀜
  const isRotated = rotation === 90 || rotation === 270;
  const boundW = isRotated ? h : w;
  const boundH = isRotated ? w : h;

  // 중심점 좌표 (furniture.x, y는 회전 전 왼쪽 상단 기준)
  const centerX = x + w / 2;
  const centerY = y + h / 2;

  // 회전 후 바운딩 박스 (중심점 기준)
  return {
    left: centerX - boundW / 2,
    top: centerY - boundH / 2,
    right: centerX + boundW / 2,
    bottom: centerY + boundH / 2,
    width: boundW,
    height: boundH,
  };
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

// 가구의 원래 크기 기준 왼쪽 상단 좌표로 변환 (중심점에서)
const centerToLeftTop = (centerX: number, centerY: number, furniture: Furniture) => {
  const w = furniture.width * scale;
  const h = furniture.height * scale;
  return {
    x: centerX - w / 2,
    y: centerY - h / 2,
  };
};

// 가구의 원래 크기 기준 왼쪽 상단에서 중심점으로 변환
const leftTopToCenter = (x: number, y: number, furniture: Furniture) => {
  const w = furniture.width * scale;
  const h = furniture.height * scale;
  return {
    x: x + w / 2,
    y: y + h / 2,
  };
};

// 가구 드래그 중 (스냅 적용) - 중심점 기준 회전에서 좌표 변환
const onFurnitureDragMove = (furniture: Furniture, e: any) => {
  const node = e.target;

  // 그룹 위치(중심점)에서 왼쪽 상단 좌표로 변환
  const leftTop = centerToLeftTop(node.x(), node.y(), furniture);

  const snapped = snapToAll(leftTop.x, leftTop.y, furniture);

  // 스냅된 왼쪽 상단 좌표를 다시 중심 좌표로 변환
  const center = leftTopToCenter(snapped.x, snapped.y, furniture);
  node.x(center.x);
  node.y(center.y);
};

// 가구 드래그 종료
const onFurnitureDragEnd = (furniture: Furniture, e: any) => {
  const node = e.target;

  // 그룹 위치(중심점)에서 왼쪽 상단 좌표로 변환
  const leftTop = centerToLeftTop(node.x(), node.y(), furniture);

  const snapped = snapToAll(leftTop.x, leftTop.y, furniture);
  furniture.x = snapped.x;
  furniture.y = snapped.y;
};

// 가구 선택 (클릭 - 선택만)
const selectFurniture = (furniture: Furniture) => {
  selectedFurniture.value = furniture;
  selectedDoor.value = null;
  showEditForm.value = false;
  updateTransformer();
};

// 가구 편집 폼 열기 (더블클릭)
const openFurnitureEditForm = (furniture: Furniture) => {
  selectedFurniture.value = furniture;
  selectedDoor.value = null;
  showEditForm.value = true;
  updateTransformer();
};

// 편집 폼 닫기
const closeEditForm = () => {
  showEditForm.value = false;
};

// Transformer 업데이트 (선택된 가구에 연결)
const updateTransformer = () => {
  nextTick(() => {
    if (!transformerRef.value || !selectedFurniture.value) return;

    const transformer = transformerRef.value.getNode();
    const furnitureGroup = furnitureRefs.value.get(selectedFurniture.value.id);

    if (transformer && furnitureGroup) {
      const node = furnitureGroup.getNode ? furnitureGroup.getNode() : furnitureGroup;
      transformer.nodes([node]);
      transformer.getLayer()?.batchDraw();
    }
  });
};

// 최소/최대 크기 제한 함수
const MIN_SIZE = 20 * scale; // 최소 20cm
const MAX_SIZE = 500 * scale; // 최대 500cm

const boundBoxFunc = (oldBox: any, newBox: any) => {
  // 최소 크기 제한
  if (newBox.width < MIN_SIZE || newBox.height < MIN_SIZE) {
    return oldBox;
  }
  // 최대 크기 제한
  if (newBox.width > MAX_SIZE || newBox.height > MAX_SIZE) {
    return oldBox;
  }
  return newBox;
};

// 가구 변환 완료 (리사이즈)
const onFurnitureTransformEnd = (furniture: Furniture, e: any) => {
  const node = e.target;

  // 스케일과 위치 가져오기
  const scaleX = node.scaleX();
  const scaleY = node.scaleY();

  // 새 크기 계산 (픽셀 -> cm)
  const newWidth = Math.round((furniture.width * scaleX));
  const newHeight = Math.round((furniture.height * scaleY));

  // 스케일 리셋 (크기 변환을 width/height로 적용)
  node.scaleX(1);
  node.scaleY(1);

  // 가구 크기 업데이트
  furniture.width = Math.max(10, Math.min(500, newWidth));
  furniture.height = Math.max(10, Math.min(500, newHeight));

  // 위치 업데이트 (중심점 기준)
  const leftTop = centerToLeftTop(node.x(), node.y(), furniture);
  furniture.x = leftTop.x;
  furniture.y = leftTop.y;

  // offset 업데이트
  node.offsetX((furniture.width * scale) / 2);
  node.offsetY((furniture.height * scale) / 2);

  // Transformer 다시 연결
  updateTransformer();
};

// selectedFurniture 변경 시 Transformer 업데이트
watch(selectedFurniture, () => {
  updateTransformer();
});

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
    clockwise: false, // 반시계방향으로 그림
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

// 문 선택 (클릭 - 선택만)
const selectDoor = (door: Door) => {
  selectedDoor.value = door;
  selectedFurniture.value = null;
  showEditForm.value = false;
};

// 문 편집 폼 열기 (더블클릭)
const openDoorEditForm = (door: Door) => {
  selectedDoor.value = door;
  selectedFurniture.value = null;
  showEditForm.value = true;
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

// 가구 업데이트
const onFurnitureUpdate = (editData: FurnitureEditData) => {
  if (!selectedFurniture.value) return;

  const index = furnitureList.value.findIndex(
    (f) => f.id === selectedFurniture.value?.id
  );
  const target = furnitureList.value[index];
  if (index !== -1 && target) {
    const updated = applyFurnitureEdit(target, editData);
    furnitureList.value[index] = updated;
    selectedFurniture.value = updated;
  }
};

// 가구 삭제
const deleteFurniture = () => {
  if (!selectedFurniture.value) return;
  furnitureList.value = furnitureList.value.filter(
    (f) => f.id !== selectedFurniture.value?.id
  );
  selectedFurniture.value = null;
};

// 문 업데이트
const onDoorUpdate = (editData: DoorEditData) => {
  if (!selectedDoor.value) return;

  const index = doorList.value.findIndex(
    (d) => d.id === selectedDoor.value?.id
  );
  const target = doorList.value[index];
  if (index !== -1 && target) {
    const updated = applyDoorEdit(target, editData);
    doorList.value[index] = updated;
    selectedDoor.value = updated;
  }
};

// 문 삭제
const deleteDoor = () => {
  if (!selectedDoor.value) return;
  doorList.value = doorList.value.filter(
    (d) => d.id !== selectedDoor.value?.id
  );
  selectedDoor.value = null;
};

// 키보드 이벤트
const onKeyDown = (e: KeyboardEvent) => {
  // input에 포커스가 있으면 무시
  if ((e.target as HTMLElement).tagName === 'INPUT' ||
      (e.target as HTMLElement).tagName === 'SELECT') {
    return;
  }

  // 가구 삭제
  if (e.key === "Delete" && selectedFurniture.value) {
    deleteFurniture();
  }

  // 가구 회전
  if (e.key === "r" && selectedFurniture.value) {
    selectedFurniture.value.rotation =
      (selectedFurniture.value.rotation + 90) % 360;
  }

  // Escape로 편집 폼 닫기 또는 선택 해제
  if (e.key === "Escape") {
    if (showEditForm.value) {
      showEditForm.value = false;
    } else {
      selectedFurniture.value = null;
      selectedDoor.value = null;
    }
  }

  // 문 삭제
  if (e.key === "Delete" && selectedDoor.value) {
    deleteDoor();
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

  // Enter로 편집 폼 열기
  if (e.key === "Enter") {
    if (selectedFurniture.value && !showEditForm.value) {
      showEditForm.value = true;
    } else if (selectedDoor.value && !showEditForm.value) {
      showEditForm.value = true;
    }
  }

  // 화살표 키로 가구 이동 (충돌 감지 적용)
  const MOVE_STEP = e.shiftKey ? 10 : 1; // Shift 누르면 10cm, 아니면 1cm
  if (selectedFurniture.value) {
    const f = selectedFurniture.value;
    let newX = f.x;
    let newY = f.y;

    if (e.key === "ArrowLeft") {
      e.preventDefault();
      newX = f.x - MOVE_STEP * scale;
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      newX = f.x + MOVE_STEP * scale;
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      newY = f.y - MOVE_STEP * scale;
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      newY = f.y + MOVE_STEP * scale;
    }

    // 충돌이 없을 때만 이동
    if (canMoveFurniture(f, newX, newY)) {
      f.x = newX;
      f.y = newY;
    }
  }

  // 화살표 키로 문 이동 (벽 따라, 충돌 감지 적용)
  if (selectedDoor.value) {
    const d = selectedDoor.value;
    const isHorizontalWall = d.wall === "top" || d.wall === "bottom";

    if (isHorizontalWall) {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        const newX = Math.max(0, d.x - MOVE_STEP);
        if (canMoveDoor(d, newX, d.y)) {
          d.x = newX;
        }
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        if (room.value) {
          const maxX = (room.value.width / scale) - d.width;
          const newX = Math.min(maxX, d.x + MOVE_STEP);
          if (canMoveDoor(d, newX, d.y)) {
            d.x = newX;
          }
        }
      }
    } else {
      if (e.key === "ArrowUp") {
        e.preventDefault();
        const newY = Math.max(0, d.y - MOVE_STEP);
        if (canMoveDoor(d, d.x, newY)) {
          d.y = newY;
        }
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        if (room.value) {
          const maxY = (room.value.height / scale) - d.width;
          const newY = Math.min(maxY, d.y + MOVE_STEP);
          if (canMoveDoor(d, d.x, newY)) {
            d.y = newY;
          }
        }
      }
    }
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

// 저장 기능
const saveToLocalStorage = () => {
  saveFloorPlan({
    room: room.value,
    furnitureList: furnitureList.value,
    doorList: doorList.value,
  });
};

// 뷰를 방 위치에 맞춰 조정
const resetViewToRoom = () => {
  if (!room.value) return;

  const padding = 50;
  stageConfig.value.x = padding - room.value.x + padding;
  stageConfig.value.y = padding - room.value.y + padding;
  stageConfig.value.scaleX = 1;
  stageConfig.value.scaleY = 1;
};

// 불러오기 기능
const loadFromLocalStorage = () => {
  const data = loadFloorPlan();
  if (data) {
    room.value = data.room;
    furnitureList.value = data.furnitureList || [];
    doorList.value = data.doorList || [];
    selectedFurniture.value = null;
    selectedDoor.value = null;
    nextTick(() => resetViewToRoom());
    return true;
  }
  return false;
};

// JSON 파일로 내보내기
const exportJson = () => {
  exportToJson({
    room: room.value,
    furnitureList: furnitureList.value,
    doorList: doorList.value,
  });
};

// 이미지로 내보내기
const exportImage = (format: 'png' | 'jpeg' = 'png') => {
  if (!stageRef.value || !room.value) return;

  const stage = stageRef.value.getNode();

  // 현재 상태 저장
  const oldPos = { x: stage.x(), y: stage.y() };
  const oldScale = { x: stage.scaleX(), y: stage.scaleY() };

  // 방 영역에 맞춰 설정 (여백 포함)
  const padding = 50;
  const r = room.value;

  stage.position({ x: padding - r.x, y: padding - r.y });
  stage.scale({ x: 1, y: 1 });

  // 이미지 생성
  const dataURL = stage.toDataURL({
    x: 0,
    y: 0,
    width: r.width + padding * 2,
    height: r.height + padding * 2,
    pixelRatio: 2,
    mimeType: format === 'jpeg' ? 'image/jpeg' : 'image/png',
    quality: 0.95,
  });

  // 상태 복원
  stage.position(oldPos);
  stage.scale(oldScale);

  // 다운로드
  const a = document.createElement('a');
  a.href = dataURL;
  a.download = `floor-plan-${new Date().toISOString().slice(0, 10)}.${format}`;
  a.click();
};

// 외부에서 접근 가능하도록 노출
defineExpose({
  room,
  furnitureList,
  doorList,
  showDoorModal,
  doorWall,
  doorPosition,
  doorWidth,
  createDoor,
  saveToLocalStorage,
  loadFromLocalStorage,
  exportJson,
  exportImage,
  resetViewToRoom,
});
</script>
