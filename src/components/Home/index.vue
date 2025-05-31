<template>
  <div class="schedule-app">
    <!-- 左侧导航栏 -->
    <aside class="sidebar">
      <div class="logo-title">
        <img src="@/assets/logo.png" class="logo" alt="logo" />
        <div class="title">日程日管理软件</div>
      </div>
      <div class="input-section">
        <input
          v-model="input1"
          class="input"
          placeholder="在此输入你的日程安排需求"
        />
        <input
          v-model="input2"
          class="input"
          placeholder="在此输入你的日程安排需求"
        />
        <button class="ai-btn" @click="handleAI">AI</button>
      </div>
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
        <!-- <div class="calendar-header">
          <div v-for="(day, idx) in weekDays" :key="idx" class="calendar-cell header">{{ day }}</div>
        </div>
        <div class="calendar-body">
          <div
            v-for="(cell, idx) in calendarData"
            :key="idx"
            class="calendar-cell"
            :class="cell.color"
          >
            <span>{{ cell.day }}</span>
            <span v-if="cell.label" class="cell-label">{{ cell.label }}</span>
          </div>
        </div> -->
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
const input1 = ref("");
const input2 = ref("");
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
  initialEvents: [], // alternatively, use the `events` setting to fetch from a feed
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
function handleAI() {
  // 这里可以集成AI对话逻辑
  alert("AI 安排日程功能待接入");
}
function handleWeekendsToggle() {
  this.calendarOptions.weekends = !this.calendarOptions.weekends; // update a property
}
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
</script>

<style scoped>
.schedule-app {
  display: flex;
  height: 100vh;
  background: #f7f8fa;
}
.sidebar {
  width: 320px;
  background: #2d323a;
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 0 0 0;
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
.input-section {
  width: 80%;
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.input {
  padding: 12px 16px;
  border-radius: 8px;
  border: none;
  font-size: 16px;
  margin-bottom: 0;
}
.ai-btn {
  margin-top: 12px;
  background: #2979ff;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 12px 0;
  font-size: 18px;
  cursor: pointer;
  transition: background 0.2s;
}
.ai-btn:hover {
  background: #1565c0;
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
</style>
