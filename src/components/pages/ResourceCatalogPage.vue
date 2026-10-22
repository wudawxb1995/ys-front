<template>
  <div class="m01-wrap">
    <!-- 页头 -->
    <div class="page-head">
      <h2>{{ title }}</h2>
      <p>{{ page.desc }}</p>
    </div>

    <div class="m01-body">
      <!-- 左侧：分类目录树 -->
      <aside class="m01-sidebar">
        <div class="cat-title">资料分类</div>
        <div
          v-for="cat in catTree"
          :key="cat.key"
          class="cat-item"
          :class="{ active: activeCat === cat.key }"
          @click="activeCat = cat.key"
        >
          <span class="cat-icon"><Icon :name="cat.icon" /></span>
          <span class="cat-name">{{ cat.label }}</span>
          <span class="cat-badge">{{ cat.count }}</span>
        </div>
      </aside>

      <!-- 右侧：资料列表 -->
      <div class="m01-main">
        <!-- 搜索栏 -->
        <div class="m01-search-bar">
          <div class="search-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/></svg>
            <input v-model="keyword" placeholder="按名称搜索资料…" />
          </div>
          <div class="status-filter">
            <button
              v-for="s in statusOptions"
              :key="s.key"
              class="sf-btn"
              :class="{ active: activeStatus === s.key }"
              @click="activeStatus = s.key"
            >{{ s.label }}</button>
          </div>
          <button class="btn btn-primary import-btn" @click="goResAdd">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            导入资料
          </button>
        </div>

        <!-- 工具栏：批量操作 -->
        <div class="res-toolbar">
          <button
            class="btn btn-danger batch-del-btn"
            :disabled="!checkedNames.size"
            @click="batchDelete"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="width:14px;height:14px"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
            批量删除
          </button>
          <span v-if="checkedNames.size" class="sel-hint">已选 {{ checkedNames.size }} 条</span>
          <span v-else class="sel-hint muted">勾选条目后可执行批量删除</span>
        </div>

        <!-- 资料列表 -->
        <div class="res-list">
          <div
            v-for="row in filtered"
            :key="row.name"
            class="res-item"
            :class="{ checked: checkedNames.has(row.name) }"
          >
            <!-- checkbox 列：阻止冒泡，只处理勾选 -->
            <label class="res-cb" @click.stop>
              <input
                type="checkbox"
                :checked="checkedNames.has(row.name)"
                @change="toggleRow(row.name)"
              />
            </label>

            <!-- 格式图标 + 资源信息：点击进详情 -->
            <div class="res-clickable" @click="openDetail(row)">
              <div class="res-fmt-icon" :class="fmtClass(row.fmt)">
                {{ row.fmt }}
              </div>
              <div class="res-info">
                <div class="res-name">{{ row.name }}</div>
                <div class="res-meta">
                  <span>{{ row.cat }}</span>
                  <span class="dot">·</span>
                  <span>{{ row.modal }}</span>
                  <span class="dot">·</span>
                  <span>{{ row.size }}</span>
                  <template v-if="row.pages !== '—'">
                    <span class="dot">·</span>
                    <span>{{ row.pages }} 页</span>
                  </template>
                  <span class="dot">·</span>
                  <span>{{ row.by }} 录入于 {{ row.time }}</span>
                </div>
              </div>
            </div>

            <div class="res-status">
              <span class="badge" :class="badgeKind(row.status)"><i></i>{{ row.status }}</span>
            </div>
            <div class="res-actions">
              <button class="act-btn" @click="openDetail(row)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>
                处理结果
              </button>
              <button
                v-if="row.status === '暂存' || row.status === '解析失败'"
                class="act-btn primary"
                @click="toast('已加入解析队列：' + row.name)"
              >发起解析</button>
              <button class="act-btn danger" @click="deleteRow(row)">删除</button>
            </div>
          </div>

          <div v-if="!filtered.length" class="empty-tip">
            没有符合条件的资料，可调整分类或搜索关键词
          </div>
        </div>

        <!-- 统计条 -->
        <div class="res-foot">
          共 {{ filtered.length }} 条资料
          <span v-if="activeCat !== 'all'">（{{ catTree.find(c => c.key === activeCat)?.label }}）</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUi } from '@/composables/ui'
import { useRows } from '@/composables/tables'
import { badgeKind } from '@/utils/format'
import Icon from '@/components/Icon.vue'

const props = defineProps({ page: Object, title: String })
const emit = defineEmits(['open-detail'])
const { toast, confirm } = useUi()
const route = useRoute()
const router = useRouter()

const rows = useRows('resources')

// ── 筛选状态 ──────────────────────────────────────────────────────────
const keyword = ref('')
const activeCat = ref('all')
const activeStatus = ref('all')

const statusOptions = [
  { key: 'all', label: '全部' },
  { key: '已解析', label: '已解析' },
  { key: '解析中', label: '解析中' },
  { key: '暂存', label: '暂存' },
  { key: '解析失败', label: '解析失败' },
]

// ── 勾选状态 ──────────────────────────────────────────────────────────
const checkedNames = ref(new Set())

const isAllChecked = computed(
  () => filtered.value.length > 0 && filtered.value.every((r) => checkedNames.value.has(r.name))
)
const isSomeChecked = computed(() => filtered.value.some((r) => checkedNames.value.has(r.name)))

function toggleRow(name) {
  const s = new Set(checkedNames.value)
  s.has(name) ? s.delete(name) : s.add(name)
  checkedNames.value = s
}

function toggleAll(e) {
  const s = new Set(checkedNames.value)
  if (e.target.checked) {
    filtered.value.forEach((r) => s.add(r.name))
  } else {
    filtered.value.forEach((r) => s.delete(r.name))
  }
  checkedNames.value = s
}

// ── 删除逻辑 ──────────────────────────────────────────────────────────
function deleteRow(row) {
  confirm(`确认删除「${row.name}」？此操作不可撤销。`, () => {
    const idx = rows.findIndex((r) => r.name === row.name)
    if (idx !== -1) rows.splice(idx, 1)
    checkedNames.value.delete(row.name)
    toast(`已删除：${row.name}`)
  })
}

function batchDelete() {
  const names = [...checkedNames.value]
  if (!names.length) return
  confirm(`确认删除选中的 ${names.length} 条资料？此操作不可撤销。`, () => {
    names.forEach((name) => {
      const idx = rows.findIndex((r) => r.name === name)
      if (idx !== -1) rows.splice(idx, 1)
    })
    checkedNames.value = new Set()
    toast(`已删除 ${names.length} 条资料`)
  }, true)
}

// 分类目录树，带计数
const catTree = computed(() => {
  const cats = [
    { key: 'all', label: '全部资料', icon: 'folder' },
    { key: '定型资料', label: '定型资料', icon: 'doc' },
    { key: '历史试验数据', label: '历史试验数据', icon: 'chart' },
    { key: '标准规范', label: '标准规范', icon: 'book' },
    { key: '专业文献', label: '专业文献', icon: 'search' },
  ]
  return cats.map((c) => ({
    ...c,
    count: c.key === 'all' ? rows.length : rows.filter((r) => r.cat === c.key).length,
  }))
})

const filtered = computed(() => {
  return rows.filter((r) => {
    const matchCat = activeCat.value === 'all' || r.cat === activeCat.value
    const matchStatus = activeStatus.value === 'all' || r.status === activeStatus.value
    const matchKey = !keyword.value || r.name.includes(keyword.value)
    return matchCat && matchStatus && matchKey
  })
})

function fmtClass(fmt) {
  const map = { PDF: 'fmt-pdf', DOCX: 'fmt-docx', XLSX: 'fmt-xlsx', MP4: 'fmt-mp4', JPG: 'fmt-jpg', CSV: 'fmt-csv' }
  return map[fmt] || 'fmt-other'
}

function openDetail(row) {
  emit('open-detail', row)
}

// 导入资料 → 跳转到数据资源录入（res-add）
function goResAdd() {
  router.push({ name: 'app', params: { pid: route.params.pid, sid: route.params.sid, mid: 'res-add' } })
}
</script>

<style scoped>
.m01-wrap { display: flex; flex-direction: column; height: 100%; }

.m01-body {
  display: flex;
  gap: 16px;
  flex: 1;
  min-height: 0;
}

/* 左侧分类树 */
.m01-sidebar {
  width: 168px;
  flex: 0 0 168px;
  background: #fff;
  border: 1px solid #e4ecf4;
  border-radius: 8px;
  padding: 8px 0 16px;
  height: fit-content;
}
.cat-title {
  font-size: 12px;
  color: #8a99a8;
  font-weight: 600;
  letter-spacing: .8px;
  padding: 8px 16px 6px;
}
.cat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 40px;
  padding: 0 14px;
  cursor: pointer;
  color: #3e5163;
  font-size: 14px;
  transition: background .12s;
}
.cat-item:hover { background: #f4f8fc; }
.cat-item.active { background: #e8f2fb; color: #1668a8; font-weight: 600; }
.cat-icon { width: 16px; height: 16px; color: inherit; flex: 0 0 16px; }
.cat-icon :deep(svg) { width: 16px; height: 16px; }
.cat-name { flex: 1; }
.cat-badge {
  min-width: 20px;
  height: 18px;
  padding: 0 5px;
  border-radius: 9px;
  background: #eef3f8;
  color: #5d7388;
  font-size: 11px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.cat-item.active .cat-badge { background: #c8def4; color: #0d4e83; }

/* 右侧主区 */
.m01-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 搜索栏 */
.m01-search-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #fff;
  border: 1px solid #e4ecf4;
  border-radius: 8px;
  padding: 10px 14px;
}
.search-box {
  display: flex;
  align-items: center;
  gap: 6px;
  border: 1px solid #d5e0ea;
  border-radius: 6px;
  padding: 0 10px;
  height: 34px;
  background: #f9fbfd;
  flex: 0 0 260px;
}
.search-box svg { width: 15px; height: 15px; color: #8a99a8; flex: none; }
.search-box input {
  border: none; background: transparent; outline: none;
  font-size: 14px; color: #3f5062; width: 100%;
}
.status-filter { display: flex; gap: 4px; flex: 1; }
.sf-btn {
  height: 30px; padding: 0 12px; border-radius: 6px; border: 1px solid #e4ecf4;
  background: #f5f8fb; color: #5d7388; font-size: 13px; cursor: pointer;
  transition: all .12s;
}
.sf-btn:hover { border-color: #b9cee0; color: #1668a8; }
.sf-btn.active { background: #e8f2fb; border-color: #9ec8e8; color: #1668a8; font-weight: 600; }
.import-btn { height: 34px; gap: 5px; white-space: nowrap; }
.import-btn svg { width: 14px; height: 14px; }

/* 资料列表 */
.res-list {
  flex: 1;
  background: #fff;
  border: 1px solid #e4ecf4;
  border-radius: 8px;
  overflow: hidden;
}
.res-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  border-bottom: 1px solid #eef3f8;
  transition: background .12s;
}
.res-item:last-child { border-bottom: none; }
/* 可点击区域：格式图标 + 资源信息 */
.res-clickable {
  display: flex;
  align-items: center;
  gap: 14px;
  flex: 1;
  min-width: 0;
  cursor: pointer;
}
.res-clickable:hover .res-name { color: #1668a8; text-decoration: underline; }

/* 格式图标 */
.res-fmt-icon {
  width: 44px; height: 44px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 700; letter-spacing: .5px;
  flex: 0 0 44px; color: #fff;
}
.fmt-pdf  { background: linear-gradient(135deg, #e53e3e, #c53030); }
.fmt-docx { background: linear-gradient(135deg, #2b6cb0, #1668a8); }
.fmt-xlsx { background: linear-gradient(135deg, #2f855a, #276749); }
.fmt-mp4  { background: linear-gradient(135deg, #6b46c1, #553c9a); }
.fmt-jpg  { background: linear-gradient(135deg, #d48806, #b7791f); }
.fmt-csv  { background: linear-gradient(135deg, #2f855a, #276749); }
.fmt-other{ background: linear-gradient(135deg, #4a5568, #2d3748); }

.res-info { flex: 1; min-width: 0; }
.res-name {
  font-size: 15px; color: #1a3a5a; font-weight: 500;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.res-meta {
  font-size: 13px; color: #8a99a8; margin-top: 4px;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.res-meta .dot { margin: 0 4px; }

.res-status { flex: 0 0 auto; }
.badge { display: inline-flex; align-items: center; gap: 5px; height: 22px; padding: 0 9px; border-radius: 11px; font-size: 12.5px; }
.badge i { width: 6px; height: 6px; border-radius: 50%; display: block; }
.badge.on  { background: #e4f6e8; color: #22913c; } .badge.on i  { background: #2fbf4a; }
.badge.off { background: #fdeceb; color: #d4380d; } .badge.off i { background: #f5222d; }
.badge.run { background: #e3eefa; color: #1668a8; } .badge.run i { background: #3f88bd; }
.badge.hold{ background: #eef1f4; color: #7c8fa2; } .badge.hold i{ background: #a7b7c6; }
.badge.warn{ background: #fef3cd; color: #856404; } .badge.warn i{ background: #d48806; }

.res-actions { display: flex; gap: 6px; flex: 0 0 auto; }
.act-btn {
  height: 30px; padding: 0 12px; border-radius: 6px; border: 1px solid #d5e0ea;
  background: #fff; color: #3f5062; font-size: 13px; cursor: pointer;
  display: inline-flex; align-items: center; gap: 5px;
  transition: all .12s;
}
.act-btn svg { width: 13px; height: 13px; }
.act-btn:hover { border-color: #9ec8e8; color: #1668a8; }
.act-btn.primary { background: linear-gradient(#14639f, #0d4e83); color: #fff; border-color: #0d4e83; }
.act-btn.primary:hover { filter: brightness(1.06); }

.empty-tip { padding: 48px; text-align: center; color: #9fb0c0; font-size: 14px; }

.res-foot { font-size: 13.5px; color: #7c8fa2; padding: 2px 0; }

/* 工具栏 */
.res-toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 2px;
}
.cb-all {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  padding: 4px 2px;
}
.cb-all input { accent-color: #0d4e83; width: 15px; height: 15px; cursor: pointer; }
.batch-del-btn {
  height: 32px; padding: 0 14px; gap: 6px; font-size: 13.5px;
}
.batch-del-btn:disabled { opacity: .45; cursor: not-allowed; }
.sel-hint { font-size: 13px; color: #1668a8; font-weight: 500; }
.sel-hint.muted { color: #a0aab4; font-weight: 400; }

/* 列表行 checkbox */
.res-cb {
  display: inline-flex;
  align-items: center;
  flex: 0 0 auto;
  cursor: pointer;
  padding: 2px 0;
}
.res-cb input { accent-color: #0d4e83; width: 15px; height: 15px; cursor: pointer; }

/* 勾选行高亮 */
.res-item.checked { background: #eef6fc; }
.res-item.checked:hover { background: #e6f2f9; }

/* 删除按钮 */
.act-btn.danger {
  color: #d4380d;
  border-color: #f0c2b8;
}
.act-btn.danger:hover {
  background: #fdeceb;
  border-color: #f5a090;
  color: #b02a08;
}
</style>
