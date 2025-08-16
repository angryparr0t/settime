<template>
  <div v-if="modelValue" class="dialog-overlay" @click="handleOverlayClick">
    <div class="dialog-content" @click.stop>
      <h3 class="dialog-title">{{ title }}</h3>
      <div class="dialog-body">
        <p v-if="type === 'delete'" class="confirm-message">
          确定要删除日程 "{{ eventTitle }}" 吗？
        </p>
        <template v-else>
          <h4 class="dialog-subtitle" v-if="selectedDateInfo">
            {{ eventTime }}
          </h4>
          <input
            v-model="inputValue"
            type="text"
            class="event-input"
            :placeholder="placeholder"
            @keyup.enter="handleConfirm"
          />
        </template>
      </div>
      <div class="dialog-footer">
        <button class="dialog-btn cancel" @click="handleCancel">取消</button>
        <button
          class="dialog-btn confirm"
          :class="{ delete: type === 'delete' }"
          @click="handleConfirm"
        >
          {{ confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, defineProps, defineEmits, computed } from "vue";

const props = defineProps({
  modelValue: Boolean,
  type: {
    type: String,
    default: "add",
    validator: (value) => ["add", "delete"].includes(value),
  },
  title: {
    type: String,
    default: "添加新日程",
  },
  eventTitle: String,
  selectedDateInfo: Object,
  placeholder: {
    type: String,
    default: "请输入日程标题",
  },
  confirmText: {
    type: String,
    default: "确认",
  },
});

const emit = defineEmits(["update:modelValue", "confirm", "cancel"]);

const inputValue = ref("");

watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal) {
      inputValue.value = "";
    }
  }
);

const handleConfirm = () => {
  if (props.type === "delete" || inputValue.value.trim()) {
    emit("confirm", props.type === "add" ? inputValue.value : undefined);
    emit("update:modelValue", false);
  }
};

const handleCancel = () => {
  emit("cancel");
  emit("update:modelValue", false);
};

const handleOverlayClick = () => {
  handleCancel();
};

const eventTime = computed(() => {
  if (props.selectedDateInfo.allDay) {
    return props.selectedDateInfo.startStr;
  } else {
     const formatTime = (date) => {
      const hours = date.getHours();
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    };

    return (
      props.selectedDateInfo.start.getMonth() +
      1 +
      "月" +
      props.selectedDateInfo.start.getDate() +
      "日" +
      " " +
      formatTime(props.selectedDateInfo.start) +
      " - " +
      formatTime(props.selectedDateInfo.end)
    );
  }
});
</script>

<style scoped>
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog-content {
  background: white;
  border-radius: 12px;
  padding: 24px;
  width: 400px;
  max-width: 90%;
}

.dialog-title {
  margin: 0 0 20px 0;
  font-size: 20px;
  color: #222;
}

.dialog-subtitle {
  margin: 0 0 16px 0;
  font-size: 16px;
  color: #666;
}

.dialog-body {
  margin-bottom: 24px;
}

.confirm-message {
  font-size: 16px;
  color: #666;
  margin: 0;
}

.event-input {
  width: 80%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  outline: none;
  transition: border-color 0.2s;
}

.event-input:focus {
  border-color: #2979ff;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.dialog-btn {
  padding: 8px 20px;
  border-radius: 6px;
  font-size: 15px;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.dialog-btn.cancel {
  background: #f5f5f5;
  color: #666;
}

.dialog-btn.cancel:hover {
  background: #e0e0e0;
}

.dialog-btn.confirm {
  background: #2979ff;
  color: white;
}

.dialog-btn.confirm:hover {
  background: #1565c0;
}

.dialog-btn.confirm.delete {
  background: #ff4d4f;
}

.dialog-btn.confirm.delete:hover {
  background: #ff7875;
}
</style>
