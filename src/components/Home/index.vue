<template>
  <div class="schedule-app">
    <!-- 左侧导航栏 -->
    <aside class="sidebar">
      <!-- 聊天区 -->
      <ChatArea
        :chat-messages="chatMessages"
        v-model="chatInput"
        @send="sendChat"
      />
    </aside>

    <!-- 右侧主内容 -->
    <main class="main-content">
      <div class="header">
        <div class="main-title">日程 管理软件</div>
        <div class="header-actions">
          <button class="export-btn">导出日程表</button>
          <img class="avatar" :src="userAvatar" alt="avatar" />
        </div>
      </div>
      <div class="calendar-controls">
        <span class="year">二〇二四年四月</span>
        <span class="range">9 16-18jo / 5 字-14po</span>
        <span class="font">字体 14-16po</span>
        <button class="export-btn small">导出日程表</button>
      </div>
      <div class="calendar">
        <FullCalendar class="demo-app-calendar" :options="calendarOptions">
          <template v-slot:eventContent="arg">
            <b>{{ arg.timeText }}</b>
            <i>{{ arg.event.title }}</i>
          </template>
        </FullCalendar>
      </div>
    </main>
  </div>
</template>

<script setup>
import { defineComponent, ref } from "vue";
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
// import InputSection from "./inputSection.vue";
import ChatArea from "./ChatArea.vue";
// const input1 = ref("");
const userAvatar = ref("https://randomuser.me/api/portraits/men/32.jpg"); // mock头像

const calendarOptions = {
  plugins: [
    dayGridPlugin,
    timeGridPlugin,
    interactionPlugin, // needed for dateClick
  ],
  headerToolbar: {
    left: "prev,next today",
    center: "title",
    right: "dayGridMonth,timeGridWeek,timeGridDay",
  },
  initialView: "dayGridMonth",
  initialEvents: [
    {
      id: 1,
      title: "All-day event",
      start: new Date().toISOString().replace(/T.*$/, ""),
    },
    {
      id: 2,
      title: "Timed event",
      start: new Date().toISOString().replace(/T.*$/, "") + "T12:00:00",
    },
  ], // alternatively, use the `events` setting to fetch from a feed
  editable: true,
  selectable: true,
  selectMirror: true,
  dayMaxEvents: true,
  weekends: true,
  select: handleDateSelect,
  eventClick: handleEventClick,
  eventsSet: handleEvents,
  /* you can update a remote database when these fire:
        eventAdd:
        eventChange:
        eventRemove:
        */
};
defineComponent({
  components: {
    FullCalendar,
  },
});
function handleDateSelect(selectInfo) {
  let title = prompt("Please enter a new title for your event");
  let calendarApi = selectInfo.view.calendar;

  calendarApi.unselect(); // clear date selection

  if (title) {
    calendarApi.addEvent({
      id: 1,
      title,
      start: selectInfo.startStr,
      end: selectInfo.endStr,
      allDay: selectInfo.allDay,
    });
  }
}
function handleEventClick(clickInfo) {
  if (
    confirm(
      `Are you sure you want to delete the event '${clickInfo.event.title}'`
    )
  ) {
    clickInfo.event.remove();
  }
}
function handleEvents(events) {
  this.currentEvents = events;
}

const chatMessages = ref([
  // { role: 'user', content: '你好' },
  // { role: 'ai', content: '你好，我是AI，有什么可以帮您？' }
]);
const chatInput = ref("");
function sendChat() {
  const content = chatInput.value.trim();
  if (!content) return;
  chatMessages.value.push({ role: "user", content });
  chatInput.value = "";
  // mock AI回复
  setTimeout(() => {
    chatMessages.value.push({
      role: "ai",
      content: "你好，我是AI，有什么可以帮您？",
    });
  }, 600);
}
</script>

<style scoped>
.schedule-app {
  display: flex;
  height: 100vh;
  background: #f7f8fa;
}
.sidebar {
  width: 320px;
  background: #ffffff;
  color: #222;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 0 0 0;
  height: 100vh;
  box-sizing: border-box;
}
.logo-title {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 60px;
}
.logo {
  width: 48px;
  height: 48px;
  margin-bottom: 16px;
}
.title {
  font-size: 22px;
  font-weight: bold;
  letter-spacing: 2px;
}
.main-content {
  flex: 1;
  padding: 48px 48px 0 48px;
  display: flex;
  flex-direction: column;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.main-title {
  font-size: 32px;
  font-weight: bold;
  color: #222;
}
.header-actions {
  display: flex;
  align-items: center;
  gap: 18px;
}
.export-btn {
  background: #fff;
  color: #2979ff;
  border: 1px solid #2979ff;
  border-radius: 8px;
  padding: 8px 18px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
.export-btn:hover {
  background: #2979ff;
  color: #fff;
}
.export-btn.small {
  padding: 4px 10px;
  font-size: 14px;
  margin-left: 18px;
}
.avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  object-fit: cover;
}
.calendar-controls {
  margin: 32px 0 18px 0;
  display: flex;
  align-items: center;
  gap: 24px;
  font-size: 16px;
  color: #888;
}
.calendar {
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 2px 12px #0001;
  padding: 32px 24px;
  height: calc(100vh - 200px); /* 调整高度以适应容器 */
  overflow: hidden; /* 防止内容溢出 */
}
.calendar-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 8px;
}
.calendar-body {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
}
.calendar-cell {
  min-height: 56px;
  background: #f5f7fa;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  padding: 8px 10px;
  font-size: 18px;
  position: relative;
}
.calendar-cell.header {
  background: none;
  color: #888;
  font-weight: bold;
  font-size: 16px;
  justify-content: center;
  align-items: center;
}
.calendar-cell.blue {
  background: #2979ff;
  color: #fff;
}
.calendar-cell.green {
  background: #8bc34a;
  color: #fff;
}
.calendar-cell.orange {
  background: #ff9800;
  color: #fff;
}
.calendar-cell.red {
  background: #f44336;
  color: #fff;
}
.calendar-cell.gray {
  background: #bdbdbd;
  color: #fff;
}
.cell-label {
  font-size: 12px;
  margin-top: 4px;
  color: #fff9;
}

/* 添加 FullCalendar 相关样式 */
:deep(.demo-app-calendar) {
  height: 100%;
}

:deep(.fc) {
  height: 100%;
}

:deep(.fc-view-harness) {
  height: 100% !important;
}

:deep(.fc-scrollgrid) {
  height: 100%;
}

:deep(.fc-scroller) {
  overflow: auto !important;
}

/* 新输入区域整体样式 */
.new-input-section {
  width: 90%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 12px;
  margin-top: auto;
  margin-bottom: 24px;
}

/* 输入框和按钮的白色圆角容器 */
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

/* 附件按钮 */
.attach-btn {
  margin-right: 8px;
}

/* 主输入框 */
.main-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 16px;
  background: transparent;
  padding: 8px 0;
  color: #222;
}

/* 右侧按钮组 */
.input-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 8px;
}

/* 所有小按钮统一样式 */
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

/* 发送按钮特殊高亮 */
.send-btn svg {
  filter: drop-shadow(0 2px 4px #2979ff22);
}
.send-btn:hover {
  background: #2979ff22;
}

/* 下方按钮组 */
.input-bottom-btns {
  display: flex;
  gap: 12px;
  margin-top: 4px;
  margin-left: 44px; /* 与输入框左侧对齐 */
}

/* 下方功能按钮样式 */
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

/* 响应式适配 */
@media (max-width: 500px) {
  .new-input-section {
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
.chat-input-section {
  width: 80%;
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
}
.chat-input {
  flex: 1;
  border-radius: 8px;
  border: none;
  padding: 10px 12px;
  font-size: 15px;
  outline: none;
}
.chat-send-btn {
  background: #2979ff;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0 18px;
  font-size: 15px;
  cursor: pointer;
  transition: background 0.2s;
}
.chat-send-btn:hover {
  background: #1565c0;
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
</style>
