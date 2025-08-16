<template>
  <div class="schedule-card">
    <div class="card-header">
      <div class="card-icon">📅</div>
      <div class="card-title">日程规划</div>
    </div>

    <div class="card-content">
      <!-- 按天分组显示日程 -->
      <div
        v-for="(dayGroup, dayIndex) in groupedSchedules"
        :key="dayIndex"
        class="day-group"
      >
        <div class="day-header" v-if="dayGroup.day">
          <span class="day-icon">📅</span>
          <span class="day-title">{{ dayGroup.day }}</span>
        </div>

        <div
          class="schedule-item"
          v-for="(schedule, index) in dayGroup.schedules"
          :key="index"
        >
          <div class="schedule-time">
            <span class="time-icon">🕐</span>
            <span class="time-text">{{ schedule.time }}</span>
          </div>
          <div class="schedule-title">{{ schedule.title }}</div>
          <div class="schedule-description" v-if="schedule.description">
            {{ schedule.description }}
          </div>
          <!-- 显示额外信息 -->
          <div
            class="schedule-extras"
            v-if="schedule.priority || schedule.tool || schedule.memory_tip"
          >
            <span v-if="schedule.priority" class="priority-tag">{{
              schedule.priority
            }}</span>
            <span v-if="schedule.tool" class="tool-tag"
              >🛠️ {{ schedule.tool }}</span
            >
            <span v-if="schedule.memory_tip" class="tip-tag"
              >💡 {{ schedule.memory_tip }}</span
            >
          </div>
        </div>
      </div>
    </div>

    <div class="card-actions" v-if="!hasResponded">
      <button
        class="action-btn accept-btn"
        @click="handleAccept"
        :disabled="isProcessing"
      >
        <span class="btn-icon">✅</span>
        <span class="btn-text">接受</span>
      </button>
      <button
        class="action-btn reject-btn"
        @click="handleReject"
        :disabled="isProcessing"
      >
        <span class="btn-icon">❌</span>
        <span class="btn-text">拒绝</span>
      </button>
    </div>

    <!-- 显示响应状态 -->
    <div class="response-status" v-if="hasResponded">
      <div class="status-message" :class="responseType">
        <span class="status-icon">{{
          responseType === "accepted" ? "✅" : "❌"
        }}</span>
        <span class="status-text">{{
          responseType === "accepted" ? "已接受" : "已拒绝"
        }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits, computed } from "vue";

const props = defineProps({
  schedules: {
    type: Array,
    required: true,
    default: () => [],
  },
});

const emits = defineEmits(["accept", "reject"]);

const isProcessing = ref(false);
const hasResponded = ref(false);
const responseType = ref("");

// 计算属性：将日程按天分组
const groupedSchedules = computed(() => {
  const groups = {};

  props.schedules.forEach((schedule) => {
    const day = schedule.day || "今天";
    if (!groups[day]) {
      groups[day] = {
        day: day,
        schedules: [],
      };
    }
    groups[day].schedules.push(schedule);
  });

  return Object.values(groups);
});

const handleAccept = async () => {
  isProcessing.value = true;
  try {
    await emits("accept", props.schedules);
    hasResponded.value = true;
    responseType.value = "accepted";
  } finally {
    isProcessing.value = false;
  }
};

const handleReject = async () => {
  isProcessing.value = true;
  try {
    await emits("reject");
    hasResponded.value = true;
    responseType.value = "rejected";
  } finally {
    isProcessing.value = false;
  }
};
</script>

<style scoped>
.schedule-card {
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e1e5e9;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  margin: 8px 0;
  overflow: hidden;
  transition: all 0.3s ease;
}

.schedule-card:hover {
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.card-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.card-icon {
  font-size: 20px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
}

.card-content {
  padding: 20px;
}

.schedule-item {
  margin-bottom: 16px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #667eea;
}

.schedule-item:last-child {
  margin-bottom: 0;
}

.schedule-time {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.time-icon {
  font-size: 14px;
}

.time-text {
  font-size: 14px;
  color: #667eea;
  font-weight: 500;
}

.schedule-title {
  font-size: 15px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 4px;
}

.schedule-description {
  font-size: 13px;
  color: #6c757d;
  line-height: 1.4;
}

.day-group {
  margin-bottom: 20px;
}

.day-group:last-child {
  margin-bottom: 0;
}

.day-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  padding: 8px 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
}

.day-icon {
  font-size: 16px;
}

.day-title {
  font-size: 14px;
  font-weight: 600;
}

.schedule-extras {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}

.priority-tag,
.tool-tag,
.tip-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
}

.priority-tag {
  background: #ff6b6b;
  color: white;
}

.tool-tag {
  background: #4ecdc4;
  color: white;
}

.tip-tag {
  background: #ffe66d;
  color: #2c3e50;
}

.response-status {
  padding: 16px 20px;
  background: #f8f9fa;
  border-top: 1px solid #e1e5e9;
}

.status-message {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
}

.status-message.accepted {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.status-message.rejected {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.status-icon {
  font-size: 16px;
}

.status-text {
  font-size: 14px;
  font-weight: 500;
}

/* 添加淡入动画 */
.response-status {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card-actions {
  display: flex;
  gap: 12px;
  padding: 16px 20px;
  background: #f8f9fa;
  border-top: 1px solid #e1e5e9;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.accept-btn {
  background: #28a745;
  color: white;
}

.accept-btn:hover:not(:disabled) {
  background: #218838;
  transform: translateY(-1px);
}

.reject-btn {
  background: #dc3545;
  color: white;
}

.reject-btn:hover:not(:disabled) {
  background: #c82333;
  transform: translateY(-1px);
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-icon {
  font-size: 16px;
}

.btn-text {
  font-size: 14px;
}

@media (max-width: 480px) {
  .card-header {
    padding: 12px 16px;
  }

  .card-content {
    padding: 16px;
  }

  .card-actions {
    padding: 12px 16px;
    flex-direction: column;
  }

  .action-btn {
    padding: 10px 12px;
  }
}
</style>
