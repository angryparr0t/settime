<template>
  <div v-if="videoList" class="video-list-card">
    <div class="video-header">
      <img :src="videoList.cover" class="video-cover" alt="cover" />
      <div class="video-title ellipsis">{{ videoList.title }}</div>
    </div>
    <div class="video-pages">
      <div
        v-for="(page, idx) in videoList.pages"
        :key="page.cid"
        class="video-page-item"
      >
        <input
          type="checkbox"
          :value="page"
          v-model="selectedPages"
          class="page-checkbox"
        />
        <span class="page-title ellipsis">{{ idx + 1 }}. {{ page.title }}</span>
        <span class="page-duration">({{ formatDuration(page.duration) }})</span>
      </div>
    </div>
    <button
      class="add-btn batch-add-btn"
      :disabled="selectedPages.length === 0"
      @click="handleBatchAdd"
    >
      添加
    </button>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, ref } from "vue";
 defineProps({
  videoList: {
    type: Object,
    required: true,
  },
});
const emit = defineEmits(["add-to-schedule"]);
const selectedPages = ref([]);

function handleBatchAdd() {
  emit("add-to-schedule", selectedPages.value);
}
function formatDuration(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
</script>

<style scoped>
.video-list-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px #0001;
  padding: 18px;
  margin: 12px 0;
  max-width: 420px;
  min-width: 260px;
}
.video-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
}
.video-cover {
  width: 80px;
  height: 50px;
  object-fit: cover;
  border-radius: 8px;
}
.video-title {
  font-size: 18px;
  font-weight: bold;
  max-width: 260px;
}
.video-pages {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.video-page-item {
  display: flex;
  align-items: center;
  gap: 12px;
}
.page-title {
  flex: 1;
  max-width: 180px;
}
.page-duration {
  color: #888;
  font-size: 13px;
}
.add-btn {
  background: #2979ff;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 4px 12px;
  cursor: pointer;
  font-size: 14px;
}
.add-btn:hover {
  background: #1565c0;
}
.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
}
.batch-add-btn {
  margin-top: 16px;
  width: 100%;
}
.page-checkbox {
  margin-right: 8px;
}
</style>
