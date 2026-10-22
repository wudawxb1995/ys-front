<template>
  <div class="m01-detail">
    <!-- 顶部返回条 -->
    <div class="detail-topbar">
      <button class="back-btn" @click="emit('back')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        返回资源列表
      </button>
      <span class="sep">|</span>
      <span class="detail-breadcrumb">{{ detail.name }}</span>
    </div>

    <!-- 文件信息条 -->
    <div class="file-infobar">
      <div class="fi-fmt" :class="fmtClass(detail.fmt)">{{ detail.fmt }}</div>
      <div class="fi-meta">
        <div class="fi-name">{{ detail.name }}</div>
        <div class="fi-attrs">
          <span>{{ detail.pages }} 页</span>
          <span class="dot">·</span>
          <span>{{ detail.size }}</span>
          <span class="dot">·</span>
          <span>解析完成：{{ detail.parsedAt }}</span>
        </div>
      </div>
      <div class="fi-actions">
        <button class="act-btn" @click="goParseTask">查看解析日志</button>
        <button class="act-btn primary" @click="goExtract">发起指标抽取</button>
      </div>
    </div>

    <!-- 主体：左侧章节树 + 右侧统计/索引 -->
    <div class="detail-body">
      <!-- 左：章节结构树 -->
      <div class="chapter-panel">
        <div class="panel-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 6h16M4 10h16M4 14h10M4 18h7"/></svg>
          章节结构
          <span class="chapter-count">{{ flatChapters.length }} 节</span>
        </div>
        <div class="chapter-tree">
          <div
            v-for="item in treeItems"
            :key="item.id"
            class="chap-item"
            :class="[item.level === 1 ? 'lv1' : 'lv2', { open: item.expandable && expanded[item.id], active: activeChap === item.id }]"
            @click="item.expandable ? toggleChap(item) : (activeChap = item.id)"
          >
            <svg v-if="item.expandable" class="chap-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
              <path d="M9 6l6 6-6 6"/>
            </svg>
            <svg v-else class="chap-dot" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="3"/></svg>
            <span>{{ item.title }}</span>
          </div>
        </div>
      </div>

      <!-- 右：统计卡片 + 语义索引 -->
      <div class="detail-right">
        <!-- 解析统计 -->
        <div class="stat-section">
          <div class="section-title">解析统计</div>
          <div class="stat-cards">
            <div class="stat-card">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
              </svg>
              <div>
                <div class="stat-val">{{ detail.tableCount }}</div>
                <div class="stat-lbl">表格识别</div>
              </div>
            </div>
            <div class="stat-card">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/><circle cx="12" cy="12" r="2" fill="currentColor" stroke="none"/>
              </svg>
              <div>
                <div class="stat-val">{{ detail.imageCount }}</div>
                <div class="stat-lbl">图片提取</div>
              </div>
            </div>
            <div class="stat-card">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
                <path d="M4 6h16M4 10h16M4 14h10M4 18h7"/>
              </svg>
              <div>
                <div class="stat-val">{{ detail.paraCount }}</div>
                <div class="stat-lbl">段落识别</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 语义索引状态 -->
        <div class="index-section">
          <div class="section-title">语义索引</div>
          <div class="index-card" :class="{ built: detail.indexStatus === '已建立' }">
            <div class="index-status-row">
              <span class="index-dot"></span>
              <span class="index-status-text">{{ detail.indexStatus }}</span>
              <span class="index-badge" v-if="detail.indexStatus === '已建立'">可检索</span>
            </div>
            <div class="index-meta">
              <div><span class="meta-key">索引库</span><span class="meta-val">{{ detail.indexName }}</span></div>
              <div><span class="meta-key">建立时间</span><span class="meta-val">{{ detail.indexAt }}</span></div>
            </div>
            <div class="index-actions">
              <button class="act-btn" @click="goVecSearch">语义检索</button>
              <button class="act-btn" @click="goVecTask">查看向量化</button>
            </div>
          </div>
        </div>

        <!-- 实体识别概况 -->
        <div class="entity-section">
          <div class="section-title">实体识别概况</div>
          <div class="entity-list">
            <div v-for="ent in entitySummary" :key="ent.type" class="ent-row">
              <span class="ent-type" :class="ent.cls">{{ ent.type }}</span>
              <div class="ent-bar-wrap">
                <div class="ent-bar" :style="{ width: (ent.count / maxEntCount * 100) + '%' }"></div>
              </div>
              <span class="ent-count">{{ ent.count }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUi } from '@/composables/ui'

const props = defineProps({
  detail: { type: Object, required: true },
})
const emit = defineEmits(['back'])
const { toast } = useUi()
const route = useRoute()
const router = useRouter()

// ── 路由跳转函数 ──────────────────────────────────────────────────────

// 查看解析日志 → 解析任务管理（parse-task），同系统
function goParseTask() {
  router.push({ name: 'app', params: { pid: route.params.pid, sid: route.params.sid, mid: 'parse-task' } })
}

// 发起指标抽取 → S2 系统（extract）的结果预览与审核（preview = 镜头二）
function goExtract() {
  router.push({ name: 'app', params: { pid: route.params.pid, sid: 'extract', mid: 'preview' } })
}

// 语义检索 → 向量化任务（vec-task，已向量化的资源才可检索）
function goVecSearch() {
  router.push({ name: 'app', params: { pid: route.params.pid, sid: route.params.sid, mid: 'vec-task' } })
}

// 查看向量化 → 向量成果管理（vec-chunks，查看分块文本与向量预览）
function goVecTask() {
  router.push({ name: 'app', params: { pid: route.params.pid, sid: route.params.sid, mid: 'vec-chunks' } })
}

// 章节展开状态，默认全部展开
const expanded = reactive({})
props.detail.chapters?.forEach((c) => { expanded[c.id] = true })
const activeChap = ref(props.detail.chapters?.[0]?.id || '')

const flatChapters = computed(() => {
  const result = []
  ;(props.detail.chapters || []).forEach((c) => {
    result.push(c)
    if (c.children) result.push(...c.children)
  })
  return result
})

// 压平为可直接 v-for 的一维列表，包含展开状态
const treeItems = computed(() => {
  const result = []
  ;(props.detail.chapters || []).forEach((c) => {
    result.push({ ...c, expandable: !!(c.children?.length) })
    if (c.children?.length && expanded[c.id]) {
      c.children.forEach((sub) => result.push({ ...sub, expandable: false }))
    }
  })
  return result
})

function toggleChap(item) {
  expanded[item.id] = !expanded[item.id]
  activeChap.value = item.id
}

function fmtClass(fmt) {
  const map = { PDF: 'fmt-pdf', DOCX: 'fmt-docx', XLSX: 'fmt-xlsx', MP4: 'fmt-mp4', JPG: 'fmt-jpg', CSV: 'fmt-csv' }
  return map[fmt] || 'fmt-other'
}

// 实体识别数据（与资源绑定的 mock 统计）
const entitySummary = [
  { type: '农业机械型号', count: 8,  cls: 'ent-model' },
  { type: '性能指标',    count: 26, cls: 'ent-ind' },
  { type: '指标数值',    count: 34, cls: 'ent-val' },
  { type: '试验项目',    count: 12, cls: 'ent-item' },
  { type: '标准编号',    count: 6,  cls: 'ent-std' },
  { type: '试验机构',    count: 3,  cls: 'ent-org' },
]
const maxEntCount = computed(() => Math.max(...entitySummary.map((e) => e.count)))
</script>

<style scoped>
.m01-detail { display: flex; flex-direction: column; gap: 14px; }

/* 返回条 */
.detail-topbar {
  display: flex; align-items: center; gap: 10px;
  font-size: 13.5px; color: #7c8fa2;
}
.back-btn {
  display: inline-flex; align-items: center; gap: 5px;
  background: none; border: none; color: #1668a8;
  font-size: 13.5px; cursor: pointer; padding: 0;
}
.back-btn:hover { text-decoration: underline; }
.back-btn svg { width: 14px; height: 14px; }
.sep { color: #d0dce8; }
.detail-breadcrumb { color: #3f5062; font-weight: 500; }

/* 文件信息条 */
.file-infobar {
  display: flex; align-items: center; gap: 14px;
  background: #fff; border: 1px solid #e4ecf4; border-radius: 8px;
  padding: 14px 18px;
}
.fi-fmt {
  width: 48px; height: 48px; border-radius: 8px; flex: 0 0 48px;
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 700; color: #fff; letter-spacing: .5px;
}
.fmt-pdf  { background: linear-gradient(135deg, #e53e3e, #c53030); }
.fmt-docx { background: linear-gradient(135deg, #2b6cb0, #1668a8); }
.fmt-xlsx { background: linear-gradient(135deg, #2f855a, #276749); }
.fmt-mp4  { background: linear-gradient(135deg, #6b46c1, #553c9a); }
.fmt-jpg  { background: linear-gradient(135deg, #d48806, #b7791f); }
.fmt-other{ background: linear-gradient(135deg, #4a5568, #2d3748); }

.fi-meta { flex: 1; min-width: 0; }
.fi-name { font-size: 16px; font-weight: 600; color: #1a3a5a; }
.fi-attrs { font-size: 13px; color: #8a99a8; margin-top: 4px; }
.fi-attrs .dot { margin: 0 5px; }
.fi-actions { display: flex; gap: 8px; flex: 0 0 auto; }
.act-btn {
  height: 32px; padding: 0 14px; border-radius: 6px; border: 1px solid #d5e0ea;
  background: #fff; color: #3f5062; font-size: 13.5px; cursor: pointer;
  display: inline-flex; align-items: center; gap: 5px; transition: all .12s;
}
.act-btn:hover { border-color: #9ec8e8; color: #1668a8; }
.act-btn.primary { background: linear-gradient(#14639f, #0d4e83); color: #fff; border-color: #0d4e83; }
.act-btn.primary:hover { filter: brightness(1.06); }

/* 主体 */
.detail-body {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 14px;
  align-items: start;
}

/* 章节树面板 */
.chapter-panel {
  background: #fff; border: 1px solid #e4ecf4; border-radius: 8px;
  overflow: hidden;
}
.panel-title {
  display: flex; align-items: center; gap: 6px;
  padding: 12px 14px; border-bottom: 1px solid #eef3f8;
  font-size: 14px; font-weight: 600; color: #0d4e83;
}
.panel-title svg { width: 15px; height: 15px; color: #0d4e83; }
.chapter-count {
  margin-left: auto; font-size: 12px; font-weight: 400;
  color: #8a99a8; background: #f0f4f8; padding: 2px 8px; border-radius: 9px;
}
.chapter-tree { padding: 6px 0 10px; }
.chap-item {
  display: flex; align-items: center; gap: 7px;
  padding: 7px 14px; cursor: pointer; font-size: 13.5px; color: #3e5163;
  transition: background .1s;
}
.chap-item:hover { background: #f4f8fc; }
.chap-item.active { background: #e8f2fb; color: #1668a8; font-weight: 600; }
.chap-item.lv2 { padding-left: 30px; font-size: 13px; color: #55677a; }
.chap-item.lv2.active { color: #1668a8; font-weight: 600; }
.chap-arrow { width: 13px; height: 13px; color: #8a99a8; flex: none; transition: transform .15s; }
.chap-item.open .chap-arrow { transform: rotate(90deg); }
.chap-dot { width: 13px; height: 13px; color: #c5d4e0; flex: none; }

/* 右侧区域 */
.detail-right { display: flex; flex-direction: column; gap: 14px; }

.section-title {
  font-size: 13.5px; font-weight: 600; color: #0d4e83;
  margin-bottom: 10px; padding-left: 2px;
}

/* 统计卡片 */
.stat-section {
  background: #fff; border: 1px solid #e4ecf4; border-radius: 8px; padding: 14px 16px;
}
.stat-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.stat-card {
  display: flex; align-items: center; gap: 12px;
  background: #f5f8fb; border-radius: 8px; padding: 12px 14px;
}
.stat-card svg { width: 28px; height: 28px; color: #d0ab68; flex: none; }
.stat-val { font-size: 26px; font-weight: 700; color: #0d4e83; line-height: 1.1; font-family: "DIN Alternate", "Segoe UI", sans-serif; }
.stat-lbl { font-size: 12.5px; color: #8a99a8; margin-top: 2px; }

/* 语义索引 */
.index-section {
  background: #fff; border: 1px solid #e4ecf4; border-radius: 8px; padding: 14px 16px;
}
.index-card {
  border: 1px solid #e4ecf4; border-radius: 8px; padding: 14px;
  background: #fafcfe;
}
.index-card.built { border-color: #b3d9a8; background: #f4faf3; }
.index-status-row {
  display: flex; align-items: center; gap: 8px; margin-bottom: 10px;
}
.index-dot {
  width: 9px; height: 9px; border-radius: 50%;
  background: #a7b7c6;
}
.index-card.built .index-dot { background: #2fbf4a; box-shadow: 0 0 0 3px rgba(47,191,74,.15); }
.index-status-text { font-size: 15px; font-weight: 600; color: #33506a; }
.index-card.built .index-status-text { color: #22913c; }
.index-badge {
  margin-left: auto; font-size: 12px; padding: 1px 8px; border-radius: 9px;
  background: #e4f6e8; color: #22913c;
}
.index-meta { display: flex; flex-direction: column; gap: 5px; margin-bottom: 12px; font-size: 13px; }
.index-meta > div { display: flex; gap: 8px; }
.meta-key { color: #8a99a8; min-width: 56px; }
.meta-val { color: #3f5062; }
.index-actions { display: flex; gap: 8px; }

/* 实体识别概况 */
.entity-section {
  background: #fff; border: 1px solid #e4ecf4; border-radius: 8px; padding: 14px 16px;
}
.entity-list { display: flex; flex-direction: column; gap: 8px; }
.ent-row { display: grid; grid-template-columns: 90px 1fr 36px; align-items: center; gap: 10px; font-size: 13px; }
.ent-type {
  display: inline-flex; align-items: center; height: 20px; padding: 0 8px;
  border-radius: 4px; font-size: 12px; font-weight: 500;
}
.ent-model { background: #e3eefa; color: #1668a8; }
.ent-ind   { background: rgba(208,171,104,.18); color: #7a622e; }
.ent-val   { background: #e4f6e8; color: #22913c; }
.ent-item  { background: #f1e8f8; color: #7a4bb5; }
.ent-std   { background: #e0f3f5; color: #138a96; }
.ent-org   { background: #f3e2e2; color: #b04545; }
.ent-bar-wrap { height: 6px; background: #eef3f8; border-radius: 3px; overflow: hidden; }
.ent-bar { height: 100%; background: linear-gradient(90deg, #1668a8, #3f88bd); border-radius: 3px; }
.ent-count { color: #5d7388; text-align: right; font-weight: 600; }
</style>
