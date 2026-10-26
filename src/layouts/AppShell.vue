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
      <nav class="topnav" :class="{ 'train-nav': platform.id === 'train' || platform.id === 'agent' }">
        <a
          v-for="sys in platform.systems"
          :key="sys.id"
          :class="{ active: sys.id === system.id }"
          :title="sys.name"
          @click="openSystem(sys)"
        >{{ platform.id === 'train' ? trainSystemName(sys.id) : sys.name }}</a>
      </nav>
      <div class="topbar-right">
        <button class="icon-btn bell" title="通知" @click="showNotice = !showNotice">
          <Icon name="bell" />
        </button>
        <div class="admin">
          <div class="avatar">管</div>
          <span>管理员</span>
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
        <template v-for="item in sidebarMenus" :key="item.id">
          <div
            v-if="item.children"
            class="menu-item parent"
            :class="{ open: open[item.id], 'child-on': childOn(item) }"
            @click="toggleMenu(item)"
          >
            <Icon class="mi" :name="iconFor(item)" />
            <span>{{ sidebarName(item.name) }}</span>
            <svg class="arrow" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 6l6 6-6 6"/></svg>
          </div>
          <div v-if="item.children" v-show="open[item.id]" class="submenu">
            <div
              v-for="child in item.children"
              :key="child.id"
              class="menu-item"
              :class="{ active: child.id === menu.id && (!child.sid || child.sid === system.id) }"
              @click="go(child.id, child.sid)"
            >
              <span>{{ sidebarName(child.name) }}</span>
            </div>
          </div>
          <div
            v-else
            class="menu-item leaf"
            :class="{ active: (item.mid || item.id) === menu.id && (!item.sid || item.sid === system.id) }"
            @click="go(item.mid || item.id, item.sid)"
          >
            <Icon class="mi" :name="iconFor(item)" />
            <span>{{ sidebarName(item.name) }}</span>
          </div>
        </template>
      </aside>
      <main class="main">
        <div class="crumb">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 10.5 12 4l8 6.5V20H4z"/></svg>
          <template v-if="crumbParent">
            <span>{{ sidebarName(crumbParent) }}</span>
            <span class="sep">/</span>
          </template>
          <span class="current">{{ sidebarName(menu.name) }}</span>
        </div>
        <nav v-if="platform.id === 'doc' && chainIndex >= 0" class="demo-chain" aria-label="报告流程">
          <button
            v-for="(step, index) in docChain"
            :key="step.mid"
            type="button"
            :class="{ on: chainIndex === index, done: chainIndex > index }"
            @click="goChain(step)"
          ><b>{{ index + 1 }}</b>{{ step.label }}</button>
        </nav>
        <button
          v-if="platform.id === 'train'"
          type="button"
          class="train-screen-btn"
          title="进入态势大屏"
          @click="router.push({ name: 'train-board' })"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <rect x="3" y="4" width="18" height="12" rx="1.5"/>
            <path d="M8 20h8M12 16v4"/>
            <path d="M8 9.5 10.2 11 12 8.5 15.5 12"/>
          </svg>
        </button>
        <PageHost :page="menu.page" :title="sidebarName(menu.name)" />
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
const sidebarName = (name = '') => name.replace(/(?:模块|功能)$/, '')
const trainSystemNames = {
  pretrain: '实验判定专域预训练',
  conf: '实验判定领域大模型置信度评估',
  lora: '细粒度实验判定知识微调',
  mgr: '实验判定大模型管理',
  quant: '实验判定领域模型量化推理',
  prompt: '智能提示模版生成',
  eval: '模型评估与调试',
}
const trainSystemName = (id) => trainSystemNames[id] || id

const located = computed(() => {
  const platform = getPlatform(route.params.pid)
  const found = findMenu(platform, route.params.sid, route.params.mid)
  return { platform, ...found }
})
const platform = computed(() => located.value.platform)
const system = computed(() => located.value.system)
const menu = computed(() => located.value.menu)
const sidebarMenus = computed(() => platform.value?.id === 'train'
  ? (system.value?.menus || []).filter(item => item.id.startsWith('bid-'))
  : system.value?.menus || [])
/** 叶子挂在分组下时始终展示分组名（允许同名：技术研判报告生成/技术研判报告生成） */
const crumbParent = computed(() => {
  const group = located.value.groupName || ''
  const current = menu.value?.name || ''
  if (!group) return ''
  const underGroup = system.value?.menus?.some(
    (m) => m.children?.some((c) => c.id === menu.value?.id),
  )
  if (underGroup) return group
  return group !== current ? group : ''
})
const docChain = [
  { label: '报告生成', sid: 'write', mid: 'generate-requirement' },
  { label: '智能审查', sid: 'review', mid: 'run' },
  { label: '定稿归集', sid: 'collect', mid: 'document-type-archive' },
]
const demoEntry = {
  'knowledge-generate': 'generate-requirement',
  'strategy-review': 'run',
  'doc-collect': 'document-type-archive',
}
const chainIndex = computed(() => {
  const sid = route.params.sid
  const mid = route.params.mid
  const index = docChain.findIndex((step) => step.sid === sid && step.mid === mid)
  if (index >= 0) return index
  if (sid === 'review' && mid === 'issues') return 1
  if (sid === 'write' && (mid === 'outline' || mid === 'trace' || mid === 'draft' || mid === 'generate-requirement')) return 0
  return -1
})

function expandCurrent() {
  const mid = menu.value?.id
  if (!mid) return
  sidebarMenus.value.forEach((item) => {
    if (item.children?.some((c) => c.id === mid && (!c.sid || c.sid === system.value?.id))) open[item.id] = true
  })
}
watch(system, (sys) => {
  if (!sys) return
  sidebarMenus.value.forEach((item) => {
    if (item.children) open[item.id] = item.children.some((c) => c.id === menu.value?.id && (!c.sid || c.sid === sys.id)) || !!open[item.id]
  })
}, { immediate: true })
watch(() => menu.value?.id, expandCurrent, { immediate: true })

function go(mid, sid = system.value.id) {
  router.push({ name: 'app', params: { pid: platform.value.id, sid, mid: mid || 'home' } })
}
function toggleMenu(item) {
  const target = platform.value?.id === 'doc' ? demoEntry[item.id] : null
  if (target) {
    open[item.id] = true
    go(target)
    return
  }
  open[item.id] = !open[item.id]
}
function goChain(step) {
  router.push({ name: 'app', params: { pid: 'doc', sid: step.sid, mid: step.mid } })
}
function openSystem(sys) {
  const first = sys.menus[0].page ? sys.menus[0] : sys.menus[0].children[0]
  router.push({ name: 'app', params: { pid: platform.value.id, sid: sys.id, mid: first.id } })
}
function childOn(item) {
  return item.children?.some((c) => c.id === menu.value?.id && (!c.sid || c.sid === system.value?.id))
}
function closeNotice(event) {
  if (!event.target.closest('.admin') && !event.target.closest('.bell')) showNotice.value = false
}
onMounted(() => document.addEventListener('click', closeNotice))
onBeforeUnmount(() => document.removeEventListener('click', closeNotice))
</script>

<style scoped>
.train-screen-btn {
  position: absolute;
  top: 10px;
  right: 18px;
  z-index: 6;
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  border: 1px solid #d5e3f0;
  border-radius: 8px;
  background: #fff;
  color: #1668a8;
  box-shadow: 0 6px 16px rgba(15, 55, 95, .12);
  cursor: pointer;
}
.train-screen-btn:hover { border-color: #1668a8; background: #f3f8fd; }
.train-screen-btn svg { width: 18px; height: 18px; }
.topnav.train-nav { overflow-x: auto; scrollbar-width: none; }
.topnav.train-nav::-webkit-scrollbar { display: none; }
</style>
