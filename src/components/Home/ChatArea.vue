<template>
  <div class="chat-area">
    <div
      v-for="(msg, idx) in chatMessages"
      :key="idx"
      :class="['chat-msg', msg.role]"
    >
      <span class="msg-role" v-if="msg.role === 'user'">我：</span>
      <template v-if="msg.role === 'user'">
        <span class="user-msg-card"
          ><span class="msg-content">{{ msg.content }}</span></span
        >
      </template>
      <template v-else>
        <span class="msg-content">{{ msg.content }}</span>
      </template>
    </div>
  </div>
  <div class="input-section new-input-section">
    <div class="input-box">
      <input
        v-model="inputValue"
        class="input main-input"
        placeholder="发送消息"
        @keyup.enter="handleSend"
      />
      <div class="input-actions">
        <button class="input-btn send-btn" title="发送" @click="handleSend">
          <svg width="20" height="20" viewBox="0 0 20 20">
            <path d="M3 10l14-6-6 14-2-6-6-2z" fill="#2979ff" />
          </svg>
        </button>
      </div>
    </div>
    <div class="input-bottom-btns">
      <button class="bottom-btn think-btn">🧠 深度思考</button>
      <button class="bottom-btn skill-btn">🧩 技能</button>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, ref, watch } from "vue";
const props = defineProps({
  chatMessages: {
    type: Array,
    required: true,
  },
  modelValue: {
    type: String,
    default: "",
  },
});

const emits = defineEmits(["update:modelValue", "send"]);
const inputValue = ref(props.modelValue);

watch(
  () => props.modelValue,
  (val) => {
    inputValue.value = val;
  }
);
watch(inputValue, (val) => {
  emits("update:modelValue", val);
});

function handleSend() {
  emits("send", inputValue.value);
  // 可选：发送后清空输入框
  // inputValue.value = '';
}
</script>

<style scoped>
.chat-area {
  width: 80%;
  flex: 1;
  min-height: 0;
  max-height: none;
  overflow-y: auto;
  background: #f7f8fa;
  border-radius: 12px;
  margin-bottom: 18px;
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.chat-msg {
  font-size: 15px;
  line-height: 1.6;
  word-break: break-all;
  display: flex;
  align-items: flex-start;
}
.chat-msg.user .msg-role {
  color: #2979ff;
  font-weight: bold;
}
.chat-msg.ai .msg-role {
  color: #8bc34a;
  font-weight: bold;
}
.msg-content {
  margin-left: 4px;
  color: #222;
}
.user-msg-card {
  display: inline-block;
  background: #fff;
  color: #222;
  border-radius: 10px;
  padding: 8px 14px;
  margin-left: 4px;
  box-shadow: 0 2px 8px #2979ff22;
  max-width: 220px;
  word-break: break-all;
}
.input-section {
  width: 90%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  margin: 40px;
  gap: 12px;
}
.input-box {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 24px;
  box-shadow: 0 2px 8px #0001;
  padding: 8px 16px;
  position: relative;
  min-height: 48px;
}
.main-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 16px;
  background: transparent;
  padding: 8px 0;
  color: #222;
}
.input-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 8px;
}
.input-btn {
  background: none;
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;
  padding: 0;
}
.input-btn:hover {
  background: #f0f4fa;
}
.send-btn svg {
  filter: drop-shadow(0 2px 4px #2979ff22);
}
.send-btn:hover {
  background: #2979ff22;
}
.input-bottom-btns {
  display: flex;
  gap: 12px;
  margin-top: 4px;
  margin-left: 44px;
}
.bottom-btn {
  background: #f5f7fa;
  color: #2979ff;
  border: none;
  border-radius: 12px;
  padding: 6px 18px;
  font-size: 15px;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
  display: flex;
  align-items: center;
  gap: 4px;
}
.bottom-btn:hover {
  background: #2979ff;
  color: #fff;
}
@media (max-width: 500px) {
  .input-section {
    margin-top: 16px;
  }
  .input-box {
    padding: 6px 8px;
    min-height: 40px;
  }
  .input-bottom-btns {
    margin-left: 0;
    gap: 8px;
  }
  .bottom-btn {
    padding: 4px 10px;
    font-size: 13px;
  }
}
</style>
