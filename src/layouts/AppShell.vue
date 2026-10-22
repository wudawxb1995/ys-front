<template>
  <div class="app-shell" :class="{ 'doc-platform': platform?.id === 'doc' }" v-if="platform">
    <header class="topbar">
      <!-- 装饰图层 -->
      <img class="topbar-bg" src="@/assets/topbar-bg.png" alt="" aria-hidden="true" />
      <div class="brand" @click="$router.push('/')">
        <div class="emblem"><Mark /></div>
        <div class="brand-text">
          <h1>{{ platform.name }}</h1>
        </div>
      </div>
      <nav class="topnav">
        <a
          v-for="sys in platform.systems"
          :key="sys.id"
          :class="{ active: sys.id === system.id }"
          @click="openSystem(sys)"
        >{{ sys.name }}</a>
      </nav>
      <div class="topbar-right">
        <button class="icon-btn bell" title="通知" @click="showNotice = !showNotice">
          <Icon name="bell" />
        </button>
        <div class="admin">
          <div class="avatar">M</div>
          <span>Mona</span>
          <div v-if="showNotice" class="notice-pop">
            <h4>通知</h4>
            <ul>
              <li>LF2204 定型报告解析完成，待审核 12 条指标。<span>10 分钟前</span></li>
              <li>4LZ-8 大纲一致性审查发现 3 处差异。<span>今天 09:40</span></li>
              <li>鉴定-Qwen32B 量化对比任务已出结果。<span>昨天</span></li>
            </ul>
          </div>
        </div>
      </div>
    </header>
    <div class="layout">
      <aside class="sidebar">
        <template v-for="item in system.menus" :key="item.id">
          <div
            v-if="item.children"
            class="menu-item parent"
            :class="{ open: open[item.id], 'child-on': childOn(item) }"
            @click="open[item.id] = !open[item.id]"
          >
            <Icon class="mi" :name="iconFor(item)" />
            <span>{{ item.name }}</span>
            <svg class="arrow" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 6l6 6-6 6"/></svg>
          </div>
          <div v-if="item.children" v-show="open[item.id]" class="submenu">
            <div
              v-for="child in item.children"
              :key="child.id"
              class="menu-item"
              :class="{ active: child.id === menu.id }"
              @click="go(child.id)"
            >
              <span>{{ child.name }}</span>
            </div>
          </div>
          <div
            v-else
            class="menu-item leaf"
            :class="{ active: item.id === menu.id }"
            @click="go(item.id)"
          >
            <Icon class="mi" :name="iconFor(item)" />
            <span>{{ item.name }}</span>
          </div>
        </template>
      </aside>
      <main class="main">
        <div class="crumb">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 10.5 12 4l8 6.5V20H4z"/></svg>
          <template v-if="groupName !== menu.name">
            <span>{{ groupName }}</span>
            <span class="sep">/</span>
          </template>
          <span class="current">{{ menu.name }}</span>
        </div>
        <PageHost :page="menu.page" :title="menu.name" />
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Icon from '@/components/Icon.vue'
import Mark from '@/components/Mark.vue'
import PageHost from '@/views/PageHost.vue'
import { findMenu, getPlatform } from '@/data/catalog'
import { iconFor } from '@/utils/iconFor'

const route = useRoute()
const router = useRouter()
const open = reactive({})
const showNotice = ref(false)

const located = computed(() => {
  const platform = getPlatform(route.params.pid)
  const found = findMenu(platform, route.params.sid, route.params.mid)
  return { platform, ...found }
})
const platform = computed(() => located.value.platform)
const system = computed(() => located.value.system)
const menu = computed(() => located.value.menu)
const groupName = computed(() => located.value.groupName || menu.value?.name || '')

watch(system, (sys) => {
  if (!sys) return
  sys.menus.forEach((item) => {
    if (item.children) open[item.id] = item.children.some((c) => c.id === menu.value?.id) || !!open[item.id]
  })
}, { immediate: true })

function go(mid) {
  router.push({ name: 'app', params: { pid: platform.value.id, sid: system.value.id, mid } })
}
function openSystem(sys) {
  const first = sys.menus[0].page ? sys.menus[0] : sys.menus[0].children[0]
  router.push({ name: 'app', params: { pid: platform.value.id, sid: sys.id, mid: first.id } })
}
function childOn(item) {
  return item.children?.some((c) => c.id === menu.value?.id)
}
function closeNotice(event) {
  if (!event.target.closest('.admin') && !event.target.closest('.bell')) showNotice.value = false
}
onMounted(() => document.addEventListener('click', closeNotice))
onBeforeUnmount(() => document.removeEventListener('click', closeNotice))
</script>
