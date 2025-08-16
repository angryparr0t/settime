<template>
  <div class="schedule-app">
    <!-- 左侧导航栏 -->
    <aside class="sidebar">
      <!-- 聊天区 -->
      <ChatArea
        :chat-messages="chatMessages"
        v-model="chatInput"
        @send="sendChat"
        @scheduleAccept="handleScheduleAccept"
        @scheduleReject="handleScheduleReject"
        @addVideoToSchedule="handleAddVideoToSchedule"
      />
    </aside>

    <!-- 右侧主内容 -->
    <main class="main-content">
      <div class="header">
        <div class="main-title">日程 管理软件</div>
        <div class="header-actions">
          <button class="export-btn">导入视频列表</button>
          <img class="avatar" :src="userAvatar" alt="avatar" />
        </div>
      </div>
      <div class="calendar-controls">
        <button class="export-btn small">导出日程表</button>
      </div>
      <div class="calendar">
        <FullCalendar
          ref="calendarRef"
          class="demo-app-calendar"
          :options="calendarOptions"
        >
          <template v-slot:eventContent="arg">
            <b>{{ arg.timeText }}</b>
            <i>{{ arg.event.title }}</i>
          </template>
        </FullCalendar>
      </div>
    </main>

    <CommonDialog
      v-model="showDialog"
      :type="dialogType"
      :eventTitle="eventToDelete?.title"
      :selectedDateInfo="selectedDateInfo"
      :title="dialogType === 'add' ? '添加新日程' : '删除日程'"
      :confirmText="dialogType === 'add' ? '确认' : '确认删除'"
      @confirm="handleDialogConfirm"
    />
  </div>
</template>

<script setup>
import { defineComponent, ref, onMounted } from "vue";
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
// import InputSection from "./inputSection.vue";
import ChatArea from "./ChatArea.vue";
import CommonDialog from "./CommonDialog.vue";
import aiService from "../../api/ai.js";
import { AI_CONFIG } from "../../config/ai-config.js";
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
  initialEvents: [], // 启动时不插入测试事件，由本地持久化数据加载
  editable: true,
  selectable: true,
  selectMirror: true,
  dayMaxEvents: true,
  weekends: true,
  select: handleDateSelect,
  eventClick: handleEventClick,
  eventsSet: handleEvents,
  eventChange: handleEventChange, // 新增：拖拽/编辑日程后持久化
  /* you can update a remote database when these fire:
        eventAdd:
        eventChange:
        eventRemove:
        */
};

// 添加日历实例引用
const calendarRef = ref(null);
defineComponent({
  components: {
    FullCalendar,
  },
});

const showDialog = ref(false);
const dialogType = ref("add");
const selectedDateInfo = ref(null);
const eventToDelete = ref(null);

function handleDateSelect(selectInfo) {
  selectedDateInfo.value = selectInfo;
  dialogType.value = "add";
  showDialog.value = true;
}

function handleEventClick(clickInfo) {
  eventToDelete.value = clickInfo.event;
  dialogType.value = "delete";
  showDialog.value = true;
}

// 启动时加载本地 schedule 数据
onMounted(async () => {
  if (!window.electronAPI) return;
  const { success, data } = await window.electronAPI.loadSchedule();
  if (success && Array.isArray(data) && data.length > 0) {
    calendarOptions.initialEvents = data;
    if (calendarRef.value) {
      const calendarApi =
        calendarRef.value.getApi?.() || calendarRef.value.calendarApi;
      if (calendarApi) {
        data.forEach((event) => calendarApi.addEvent(event));
      }
    }
  }
});

// 保存日程到本地
function saveSchedule() {
  if (!window.electronAPI) return;
  let events = [];
  if (calendarRef.value) {
    const calendarApi =
      calendarRef.value.getApi?.() || calendarRef.value.calendarApi;
    if (calendarApi) {
      events = calendarApi.getEvents().map((e) => ({
        id: e.id,
        title: e.title,
        start: e.start,
        end: e.end,
        allDay: e.allDay,
        description: e.extendedProps?.description,
        extendedProps: e.extendedProps,
      }));
    }
  }
  window.electronAPI.saveSchedule(events);
}

// 在日程变动后保存
function handleDialogConfirm(value) {
  if (dialogType.value === "add" && selectedDateInfo.value) {
    let calendarApi = selectedDateInfo.value.view.calendar;
    calendarApi.unselect();
    calendarApi.addEvent({
      id: Date.now(),
      title: value,
      start: selectedDateInfo.value.startStr,
      end: selectedDateInfo.value.endStr,
      allDay: selectedDateInfo.value.allDay,
    });
  } else if (dialogType.value === "delete" && eventToDelete.value) {
    eventToDelete.value.remove();
    eventToDelete.value = null;
  }
  saveSchedule();
}

function handleEvents(events) {
  this.currentEvents = events;
}

function handleEventChange() {
  saveSchedule();
}

const chatMessages = ref([
  // { role: 'user', content: '你好' },
  // { role: 'ai', content: '你好，我是AI，有什么可以帮您？' }
]);
const chatInput = ref("");
const isAILoading = ref(false);

async function sendChat() {
  const content = chatInput.value.trim();
  if (!content) return;

  // 添加用户消息
  chatMessages.value.push({ role: "user", content });
  chatInput.value = "";

  // 显示AI正在思考
  isAILoading.value = true;
  chatMessages.value.push({
    role: "ai",
    content: "🤔 正在思考中...",
    isLoading: true,
  });

  try {
    // 移除加载状态的消息
    chatMessages.value.pop();

    // 创建AI回复消息
    const aiMessageIndex = chatMessages.value.length;
    chatMessages.value.push({
      role: "ai",
      content: "",
      isStreaming: true,
    });

    // 根据配置决定是否使用流式输出
    let response;
    if (AI_CONFIG.ENABLE_STREAMING) {
      // 调用AI服务（流式）
      response = await aiService.sendMessageStream(
        content,
        (chunk, fullResponse) => {
          // 更新AI回复内容
          chatMessages.value[aiMessageIndex].content = fullResponse;
        }
      );
    } else {
      // 调用AI服务（非流式）
      response = await aiService.sendMessage(content);
      // 直接设置完整内容
      chatMessages.value[aiMessageIndex].content = response.content;
    }

    if (response.success) {
      // 完成流式输出，移除流式标记
      chatMessages.value[aiMessageIndex].isStreaming = false;
      chatMessages.value[aiMessageIndex].usage = response.usage;

      // 如果是日程规划，设置相应的类型和数据
      if (response.type === "schedule") {
        chatMessages.value[aiMessageIndex].type = "schedule";
        chatMessages.value[aiMessageIndex].schedules = response.schedules;
      }
    } else {
      // 添加错误消息
      chatMessages.value[aiMessageIndex] = {
        role: "ai",
        content: response.content,
        isError: true,
      };
    }
  } catch (error) {
    console.error("AI调用错误:", error);
    // 移除加载状态的消息
    chatMessages.value.pop();

    // 添加错误消息
    chatMessages.value.push({
      role: "ai",
      content: "抱歉，发生了错误，请稍后重试。",
      isError: true,
    });
  } finally {
    isAILoading.value = false;
  }
}

// 处理日程接受
function handleScheduleAccept(schedules) {
  console.log("收到日程接受请求:", schedules);

  // 获取日历实例 - 尝试多种方式
  let calendarApi = null;

  if (calendarRef.value) {
    // 尝试不同的API获取方式
    calendarApi =
      calendarRef.value.getApi?.() ||
      calendarRef.value.calendarApi ||
      calendarRef.value.$el?.getApi?.();
  }

  if (!calendarApi) {
    console.error("日历实例不可用");
    console.log("calendarRef.value:", calendarRef.value);
    // 添加错误消息
    chatMessages.value.push({
      role: "ai",
      content: "❌ 抱歉，日历组件未准备好，无法添加日程。",
      type: "text",
    });
    return;
  }

  console.log("日历API可用:", calendarApi);

  // 将日程添加到日历
  schedules.forEach((schedule) => {
    try {
      // 解析时间
      const [startTime, endTime] = schedule.time.split("-");

      // 根据day信息计算日期
      let targetDate = new Date();
      if (schedule.day) {
        // 解析天数，例如"第1天"、"第2天"等
        const dayMatch = schedule.day.match(/第(\d+)天/);
        if (dayMatch) {
          const dayOffset = parseInt(dayMatch[1]) - 1; // 第1天就是今天
          targetDate.setDate(targetDate.getDate() + dayOffset);
        }
      }

      const startDate = new Date(targetDate);
      const endDate = new Date(targetDate);

      // 设置开始时间
      const [startHour, startMinute] = startTime.split(":").map(Number);
      startDate.setHours(startHour, startMinute, 0, 0);

      // 设置结束时间
      const [endHour, endMinute] = endTime.split(":").map(Number);
      endDate.setHours(endHour, endMinute, 0, 0);

      const newEvent = {
        id: Date.now() + Math.random(),
        title: schedule.title,
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        description: schedule.description,
        // 添加额外信息到事件扩展属性
        extendedProps: {
          day: schedule.day,
          priority: schedule.priority,
          tool: schedule.tool,
          memory_tip: schedule.memory_tip,
        },
      };

      console.log("准备添加事件:", newEvent);

      // 添加到日历
      try {
        calendarApi.addEvent(newEvent);
        console.log("成功添加日程:", newEvent);
      } catch (addError) {
        console.error("addEvent方法失败:", addError);

        // 备用方法：直接添加到事件列表
        try {
          if (calendarOptions.initialEvents) {
            calendarOptions.initialEvents.push(newEvent);
            console.log("通过备用方法添加日程:", newEvent);
          }
        } catch (backupError) {
          console.error("备用方法也失败:", backupError);
        }
      }
    } catch (error) {
      console.error("添加日程失败:", error);
    }
  });

  // 添加确认消息
  chatMessages.value.push({
    role: "ai",
    content: "✅ 日程已成功添加到您的日历中！",
    type: "text",
  });
  saveSchedule();
}

// 处理日程拒绝
function handleScheduleReject() {
  // 添加拒绝消息
  chatMessages.value.push({
    role: "ai",
    content: "好的，我重新为您规划日程。请告诉我您的具体需求。",
    type: "text",
  });
}

function handleAddVideoToSchedule(pages) {
  let calendarApi = null;
  if (calendarRef.value) {
    calendarApi =
      calendarRef.value.getApi?.() ||
      calendarRef.value.calendarApi ||
      calendarRef.value.$el?.getApi?.();
  }
  if (!calendarApi) {
    chatMessages.value.push({
      role: "ai",
      content: "❌ 日历组件未准备好，无法添加视频日程。",
      type: "text",
    });
    return;
  }
  // 支持批量添加
  let now = new Date();
  if (!Array.isArray(pages)) pages = [pages];
  pages.forEach((page) => {
    const start = new Date(now);
    const end = new Date(start.getTime() + page.duration * 1000);
    calendarApi.addEvent({
      id: Date.now() + Math.random(),
      title: page.title,
      start: start.toISOString(),
      end: end.toISOString(),
      description: "B站视频",
      extendedProps: { bvid: page.bvid, cid: page.cid },
    });
    now = end; // 下一个分P顺延
    chatMessages.value.push({
      role: "ai",
      content: `✅ 已将【${page.title}】加入日程表！`,
      type: "text",
    });
  });
  saveSchedule();
}
</script>

<style scoped>
.schedule-app {
  display: flex;
  height: 100vh;
  background: #f7f8fa;
}
.sidebar {
  width: 20vw;
  min-width: 320px;
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
  height: calc(100vh - 120px); /* 更高，底部更贴近页面底部 */
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
