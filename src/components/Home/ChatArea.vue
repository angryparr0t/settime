<template>
  <div class="chat-area">
    <div
      v-for="(msg, idx) in chatMessages"
      :key="idx"
      :class="[
        'chat-msg',
        msg.role,
        { error: msg.isError, loading: msg.isLoading },
      ]"
    >
      <span class="msg-role" v-if="msg.role === 'user'">我：</span>
      <!-- <span class="msg-role" v-else-if="msg.role === 'ai'">AI：</span> -->

      <template v-if="msg.role === 'user'">
        <span class="user-msg-card"
          ><span class="msg-content">{{ msg.content }}</span></span
        >
      </template>
      <template v-else>
        <!-- 如果是日程规划消息，显示日程卡片 -->
        <div v-if="msg.type === 'schedule'" class="schedule-message">
          <ScheduleCard
            :schedules="msg.schedules"
            @accept="handleScheduleAccept"
            @reject="handleScheduleReject"
          />
        </div>
        <!-- 普通文本消息 -->
        <div
          v-else
          class="msg-content"
          :class="{
            'error-text': msg.isError,
            'loading-text': msg.isLoading,
            'streaming-text': msg.isStreaming,
          }"
        >
          <div
            class="markdown-content"
            v-html="renderMarkdown(msg.content)"
          ></div>
          <span v-if="msg.isStreaming" class="cursor">|</span>
        </div>
      </template>
    </div>
  </div>
  <div class="input-section new-input-section">
    <!-- BV号导入区 -->
    <div class="bilibili-import">
      <input v-model="bvInput" placeholder="输入B站BV号" class="bv-input" />
      <button
        @click="handleImportBV"
        :disabled="isLoadingVideo"
        class="import-btn"
      >
        导入B站视频
      </button>
    </div>
    <div v-if="isLoadingVideo">正在加载视频信息...</div>
    <div v-if="videoError" class="error-text">{{ videoError }}</div>
    <VideoListCard
      v-if="videoList"
      :videoList="videoList"
      @add-to-schedule="handleAddToSchedule"
    />
    <div class="input-box">
      <textarea
        v-model="inputValue"
        ref="textareaRef"
        class="input main-input"
        placeholder="发送消息"
        @input="adjustHeight"
        @keydown.enter.prevent="handleEnterKey"
        rows="1"
      ></textarea>
      <div class="input-actions">
        <button
          class="input-btn send-btn"
          title="发送消息 (Enter发送，Shift+Enter换行)"
          @click="handleSend"
        >
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
import { defineProps, defineEmits, ref, watch, nextTick } from "vue";
import ScheduleCard from "./ScheduleCard.vue";
import { marked } from "marked";
import { getBilibiliVideoList } from "../../api/bilibili.js";
import VideoListCard from "./VideoListCard.vue";

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

const emits = defineEmits([
  "update:modelValue",
  "send",
  "scheduleAccept",
  "scheduleReject",
  "addVideoToSchedule",
]);

// 配置marked选项
marked.setOptions({
  breaks: true, // 支持换行
  gfm: true, // GitHub风格Markdown
  smartLists: true, // 智能列表
  smartypants: true, // 智能标点
});

// 安全的Markdown渲染函数
function renderMarkdown(text) {
  if (!text) return "";

  try {
    // 使用marked渲染Markdown
    return marked(text);
  } catch (error) {
    console.error("Markdown渲染错误:", error);
    // 如果渲染失败，返回原文本，但保留基本的格式化
    return text
      .replace(/\n/g, "<br>")
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>");
  }
}

const inputValue = ref(props.modelValue);
const textareaRef = ref(null);

const bvInput = ref("");
const videoList = ref(null);
const isLoadingVideo = ref(false);
const videoError = ref("");

async function handleImportBV() {
  if (!bvInput.value) return;
  isLoadingVideo.value = true;
  videoError.value = "";
  try {
    videoList.value = await getBilibiliVideoList(bvInput.value.trim());
  } catch (e) {
    videoError.value = e.message || "获取视频失败";
    videoList.value = null;
  } finally {
    isLoadingVideo.value = false;
  }
}

function handleAddToSchedule(pages) {
  // 支持批量添加，pages 可能为数组
  if (Array.isArray(pages)) {
    pages.forEach((page) => emits("addVideoToSchedule", page));
  } else {
    emits("addVideoToSchedule", pages);
  }
}

watch(
  () => props.modelValue,
  (val) => {
    inputValue.value = val;
  }
);
watch(inputValue, (val) => {
  emits("update:modelValue", val);
  // 当输入值改变时调整高度
  nextTick(() => {
    adjustHeight();
  });
});

// 自动调整textarea高度
function adjustHeight() {
  if (textareaRef.value) {
    const textarea = textareaRef.value;
    // 重置高度以获取正确的scrollHeight
    textarea.style.height = "auto";
    // 设置新高度，最大高度为120px
    const newHeight = Math.min(textarea.scrollHeight, 120);
    textarea.style.height = newHeight + "px";
  }
}

// 处理回车键
function handleEnterKey(event) {
  if (event.shiftKey) {
    // Shift+Enter 换行 - 不阻止默认行为
    return;
  } else {
    // 普通Enter发送消息
    event.preventDefault(); // 阻止默认的换行行为
    handleSend();
  }
}

function handleSend() {
  emits("send", inputValue.value);
  // 发送后清空输入框并重置高度
  inputValue.value = "";
  nextTick(() => {
    if (textareaRef.value) {
      textareaRef.value.style.height = "auto";
    }
  });
}

// 处理日程接受
function handleScheduleAccept(schedules) {
  emits("scheduleAccept", schedules);
}

// 处理日程拒绝
function handleScheduleReject() {
  emits("scheduleReject");
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
.chat-msg.error .msg-role {
  color: #f44336;
  font-weight: bold;
}
.chat-msg.loading .msg-role {
  color: #ff9800;
  font-weight: bold;
}
.msg-content {
  margin-left: 4px;
  color: #222;
}
.error-text {
  color: #f44336;
  font-style: italic;
}
.loading-text {
  color: #ff9800;
  animation: pulse 1.5s ease-in-out infinite;
}
.streaming-text {
  color: #8bc34a;
}
.cursor {
  color: #8bc34a;
  animation: blink 1s infinite;
  font-weight: bold;
}
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
@keyframes blink {
  0%,
  50% {
    opacity: 1;
  }
  51%,
  100% {
    opacity: 0;
  }
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

.schedule-message {
  margin-left: 4px;
  max-width: 400px;
}

/* Markdown内容样式 */
.markdown-content {
  line-height: 1.6;
  word-break: break-word;
}

.markdown-content h1,
.markdown-content h2,
.markdown-content h3,
.markdown-content h4,
.markdown-content h5,
.markdown-content h6 {
  margin: 12px 0 8px 0;
  font-weight: 600;
  color: #2c3e50;
}

.markdown-content h1 {
  font-size: 18px;
}
.markdown-content h2 {
  font-size: 16px;
}
.markdown-content h3 {
  font-size: 15px;
}
.markdown-content h4 {
  font-size: 14px;
}
.markdown-content h5 {
  font-size: 13px;
}
.markdown-content h6 {
  font-size: 12px;
}

.markdown-content p {
  margin: 8px 0;
  line-height: 1.6;
}

.markdown-content ul,
.markdown-content ol {
  margin: 8px 0;
  padding-left: 20px;
}

.markdown-content li {
  margin: 4px 0;
  line-height: 1.5;
}

.markdown-content blockquote {
  margin: 12px 0;
  padding: 8px 12px;
  border-left: 4px solid #667eea;
  background: #f8f9fa;
  color: #6c757d;
  font-style: italic;
}

.markdown-content code {
  background: #f1f3f4;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: "Courier New", monospace;
  font-size: 0.9em;
  color: #e74c3c;
}

.markdown-content pre {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 6px;
  overflow-x: auto;
  margin: 12px 0;
  border: 1px solid #e9ecef;
}

.markdown-content pre code {
  background: none;
  padding: 0;
  color: inherit;
}

.markdown-content strong {
  font-weight: 600;
  color: #2c3e50;
}

.markdown-content em {
  font-style: italic;
  color: #6c757d;
}

.markdown-content a {
  color: #667eea;
  text-decoration: none;
}

.markdown-content a:hover {
  text-decoration: underline;
}

.markdown-content table {
  border-collapse: collapse;
  width: 100%;
  margin: 12px 0;
}

.markdown-content th,
.markdown-content td {
  border: 1px solid #dee2e6;
  padding: 8px 12px;
  text-align: left;
}

.markdown-content th {
  background: #f8f9fa;
  font-weight: 600;
}

.markdown-content hr {
  border: none;
  border-top: 1px solid #dee2e6;
  margin: 16px 0;
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
  resize: none;
  overflow: hidden;
  font-family: inherit;
  line-height: 1.5;
  min-height: 24px;
  max-height: 120px;
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
  position: relative;
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

/* 优化tooltip样式 */
.send-btn[title]:hover::after {
  content: attr(title);
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: #2c3e50;
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  white-space: nowrap;
  z-index: 1000;
  margin-bottom: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.send-btn[title]:hover::before {
  content: "";
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 6px solid transparent;
  border-top-color: #2c3e50;
  margin-bottom: 2px;
  z-index: 1000;
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
.bilibili-import {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}
.bv-input {
  flex: 1;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 15px;
}
.import-btn {
  background: #ff6699;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 6px 14px;
  font-size: 15px;
  cursor: pointer;
}
.import-btn:disabled {
  background: #fbb1c8;
  cursor: not-allowed;
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
