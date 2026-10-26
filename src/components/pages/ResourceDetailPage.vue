<template>
  <div class="res-detail">
    <div class="detail-topbar">
      <button type="button" class="back-btn" @click="emit('back')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        返回资源列表
      </button>
      <span class="sep">/</span>
      <span class="detail-breadcrumb">{{ detail.name }}</span>
    </div>

    <div class="dash-frame file-frame">
      <h3><i></i>资源概览</h3>
      <div class="file-infobar">
        <span class="file-ico" :class="iconKind(detail.fmt)">{{ iconText(detail.fmt) }}</span>
        <div class="fi-meta">
          <div class="fi-name">{{ detail.name }}</div>
          <div class="fi-attrs">
            <span>{{ detail.fmt }}</span>
            <span class="dot">·</span>
            <span>{{ detail.pages }} 页</span>
            <span class="dot">·</span>
            <span>{{ detail.size }}</span>
            <span class="dot">·</span>
            <span>解析完成：{{ detail.parsedAt }}</span>
          </div>
        </div>
        <div class="fi-actions">
          <el-button v-if="detail.fileUrl" @click="openOriginal">打开原文</el-button>
          <el-button @click="goParseTask">查看解析日志</el-button>
          <el-button type="primary" :loading="extracting" @click="goExtract">发起指标抽取</el-button>
        </div>
      </div>
    </div>

    <div class="dash-frame parse-frame">
      <h3><i></i>解析结果</h3>
      <div class="parse-split">
        <div class="chapter-pane">
          <div class="chapter-head">
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
        <div class="origin-pane">
          <iframe
            v-if="detail.fileUrl && /PDF/i.test(detail.fmt || '')"
            class="pdf-frame"
            :src="detail.fileUrl"
            :title="detail.name"
          />
          <div v-else class="origin-empty">
            <p>暂无原文预览</p>
            <el-button v-if="detail.fileUrl" @click="openOriginal">打开原文</el-button>
          </div>
        </div>
      </div>
    </div>

    <div class="detail-body">
      <div class="dash-frame stat-frame">
        <h3><i></i>解析统计</h3>
          <div class="stat-row">
            <div class="stat">
              <div class="stat-ico all">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
              </div>
              <div>
                <div class="stat-label">表格识别</div>
                <div class="stat-value all">{{ detail.tableCount }} <small>项</small></div>
              </div>
            </div>
            <div class="stat">
              <div class="stat-ico done">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/></svg>
              </div>
              <div>
                <div class="stat-label">图片提取</div>
                <div class="stat-value done">{{ detail.imageCount }} <small>项</small></div>
              </div>
            </div>
            <div class="stat">
              <div class="stat-ico run">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 6h16M4 10h16M4 14h10M4 18h7"/></svg>
              </div>
              <div>
                <div class="stat-label">段落识别</div>
                <div class="stat-value run">{{ detail.paraCount }} <small>项</small></div>
              </div>
            </div>
          </div>
      </div>

      <div class="dash-frame index-frame">
          <h3><i></i>语义索引</h3>
          <div class="index-card" :class="{ built: detail.indexStatus === '已建立' }">
            <div class="index-status-row">
              <span class="dot-status" :class="detail.indexStatus === '已建立' ? 'ok' : 'wait'"><i></i>{{ detail.indexStatus }}</span>
              <span class="index-badge" v-if="detail.indexStatus === '已建立'">可检索</span>
            </div>
            <div class="index-meta">
              <div><span class="meta-key">索引库</span><span class="meta-val">{{ detail.indexName }}</span></div>
              <div><span class="meta-key">建立时间</span><span class="meta-val">{{ detail.indexAt }}</span></div>
            </div>
            <div class="index-actions">
              <el-button @click="goVecSearch">语义检索</el-button>
              <el-button @click="goVecTask">查看向量化</el-button>
            </div>
          </div>
      </div>

      <div class="dash-frame entity-frame">
          <h3><i></i>实体识别概况</h3>
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
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElLoading } from 'element-plus'
import { useUi } from '@/composables/ui'

const props = defineProps({
  detail: { type: Object, required: true },
})
const emit = defineEmits(['back'])
const { toast } = useUi()
const route = useRoute()
const router = useRouter()
const extracting = ref(false)

// ── 路由跳转函数 ──────────────────────────────────────────────────────

function openOriginal() {
  if (!props.detail.fileUrl) {
    toast('暂无原文文件', 'warning')
    return
  }
  window.open(props.detail.fileUrl, '_blank')
}

// 查看解析日志 → 解析任务管理（parse-task），同系统
function goParseTask() {
  router.push({ name: 'app', params: { pid: route.params.pid, sid: route.params.sid, mid: 'parse-task' } })
}

// 发起指标抽取 → 关键指标抽取 / 指标数据提取
function goExtract() {
  if (extracting.value) return
  extracting.value = true
  const loading = ElLoading.service({
    lock: true,
    text: '正在发起指标抽取…',
    background: 'rgba(255, 255, 255, 0.72)',
  })
  setTimeout(() => {
    loading.close()
    extracting.value = false
    router.push({ name: 'app', params: { pid: route.params.pid, sid: 'extract', mid: 'ind-data' } })
  }, 5000)
}

// 语义检索 → 向量化任务（vec-task），按当前资源名称筛选
function goVecSearch() {
  router.push({
    name: 'app',
    params: { pid: route.params.pid, sid: route.params.sid, mid: 'vec-task' },
    query: { name: props.detail.name },
  })
}

// 查看向量化 → 向量成果管理（vec-chunks），按所属资源带入筛选
function goVecTask() {
  router.push({
    name: 'app',
    params: { pid: route.params.pid, sid: route.params.sid, mid: 'vec-chunks' },
    query: { res: props.detail.name },
  })
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

function iconKind(fmt) {
  if (/DOC/.test(fmt)) return 'word'
  if (/XLS|CSV/.test(fmt)) return 'excel'
  if (/PDF/.test(fmt)) return 'pdf'
  if (/PNG|JPE?G|TIF|BMP/.test(fmt)) return 'img'
  if (/MP4|MP3/.test(fmt)) return 'media'
  return 'file'
}
function iconText(fmt = '') {
  if (/DOC/.test(fmt)) return 'W'
  if (/XLS/.test(fmt)) return 'X'
  if (/PDF/.test(fmt)) return 'A'
  if (/CSV/.test(fmt)) return 'C'
  return String(fmt).slice(0, 1) || 'F'
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
.res-detail {
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 20px 22px 16px;
  box-shadow: 0 6px 18px rgba(15, 55, 95, .04);
}
.detail-topbar {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13.5px;
  color: #7c8fa2;
}
.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: none;
  border: none;
  color: #1668a8;
  font-size: 13.5px;
  cursor: pointer;
  padding: 0;
}
.back-btn:hover { text-decoration: underline; }
.back-btn svg { width: 14px; height: 14px; }
.sep { color: #b6c4d2; }
.detail-breadcrumb { color: #0d4e83; font-weight: 600; }

.dash-frame {
  border: 1.5px dashed #b7d4ee;
  border-radius: 12px;
  padding: 16px;
  background: #fff;
}
.dash-frame h3 {
  font-size: 16px;
  color: var(--navy-2);
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}
.dash-frame h3 i {
  width: 4px; height: 16px; background: var(--blue); border-radius: 2px; display: inline-block;
}

.file-infobar { display: flex; align-items: center; gap: 14px; }
.file-ico {
  width: 36px; height: 36px; border-radius: 6px;
  display: grid; place-items: center;
  color: #fff; font-size: 13px; font-weight: 700; flex: 0 0 auto;
}
.file-ico.word { background: #2b7cd3; }
.file-ico.excel { background: #217346; }
.file-ico.pdf { background: #e2574c; }
.file-ico.img { background: #7b6bb0; }
.file-ico.media { background: #6b46c1; }
.file-ico.file { background: #7c8fa2; }
.fi-meta { flex: 1; min-width: 0; }
.fi-name { font-size: 16px; font-weight: 600; color: #1a3a5a; }
.fi-attrs { font-size: 13px; color: #8a99a8; margin-top: 4px; }
.fi-attrs .dot { margin: 0 5px; }
.fi-actions { display: flex; gap: 8px; flex: 0 0 auto; }

.parse-split {
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr);
  gap: 12px;
  height: min(62vh, 640px);
  min-height: 420px;
}
.chapter-pane {
  display: flex;
  flex-direction: column;
  min-height: 0;
  border: 1px solid #e6eef6;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
}
.chapter-head {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-bottom: 1px solid #eef3f8;
  font-size: 13.5px;
  font-weight: 600;
  color: #1f3d5a;
}
.origin-pane {
  min-width: 0;
  min-height: 0;
  border: 1px solid #e0eaf3;
  border-radius: 8px;
  overflow: hidden;
  background: #525659;
}
.pdf-frame {
  width: 100%;
  height: 100%;
  border: 0;
  background: #fff;
}
.origin-empty {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: #f4f7fa;
  color: #8a99a8;
}

.detail-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.entity-frame { display: flex; flex-direction: column; }
.chapter-count {
  margin-left: auto;
  font-size: 12px;
  font-weight: 400;
  color: #8a99a8;
  background: #f0f4f8;
  padding: 2px 8px;
  border-radius: 9px;
}
.chapter-tree {
  flex: 1 1 auto;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  padding: 2px 4px 4px 0;
}
.chap-item {
  display: flex; align-items: center; gap: 7px;
  padding: 8px 8px; cursor: pointer; font-size: 13.5px; color: #3e5163;
  border-radius: 6px;
}
.chap-item:hover { background: #f4f8fc; }
.chap-item.active { background: #e8f2fb; color: #1668a8; font-weight: 600; }
.chap-item.lv2 { padding-left: 28px; font-size: 13px; color: #55677a; }
.chap-item.lv2.active { color: #1668a8; font-weight: 600; }
.chap-arrow { width: 13px; height: 13px; color: #8a99a8; flex: none; transition: transform .15s; }
.chap-item.open .chap-arrow { transform: rotate(90deg); }
.chap-dot { width: 13px; height: 13px; color: #c5d4e0; flex: none; }

.stat-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.stat {
  background: #f7fbfe;
  border: 1px solid #e6eef6;
  border-radius: 10px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}
.stat-ico {
  width: 40px; height: 40px; border-radius: 50%;
  display: grid; place-items: center; flex: 0 0 auto;
}
.stat-ico svg { width: 20px; height: 20px; }
.stat-ico.all { background: #e8f2fb; color: #1668a8; }
.stat-ico.done { background: #e8f7ec; color: #2f9e62; }
.stat-ico.run { background: #fff6e6; color: #d48806; }
.stat-label { color: #6d8092; font-size: 13px; }
.stat-value { margin-top: 2px; font-size: 24px; font-weight: 700; line-height: 1.2; }
.stat-value small { font-size: 12px; font-weight: 500; color: #8a99a8; }
.stat-value.all { color: #1668a8; }
.stat-value.done { color: #2f9e62; }
.stat-value.run { color: #d48806; }

.index-card {
  border: 1px solid #e6eef6;
  border-radius: 10px;
  padding: 14px 16px;
  background: #f7fbfe;
}
.index-card.built { border-color: #cfe8d6; background: #f4faf3; }
.index-status-row { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
.dot-status { display: inline-flex; align-items: center; gap: 6px; font-size: 14px; font-weight: 600; }
.dot-status i { width: 7px; height: 7px; border-radius: 50%; }
.dot-status.ok { color: #2f9e62; } .dot-status.ok i { background: #2fbf4a; }
.dot-status.wait { color: #d4380d; } .dot-status.wait i { background: #f5222d; }
.index-badge {
  margin-left: auto; font-size: 12px; padding: 1px 8px; border-radius: 9px;
  background: #e4f6e8; color: #22913c;
}
.index-meta { display: flex; flex-direction: column; gap: 5px; margin-bottom: 12px; font-size: 13px; }
.index-meta > div { display: flex; gap: 8px; }
.meta-key { color: #8a99a8; min-width: 56px; }
.meta-val { color: #3f5062; }
.index-actions { display: flex; gap: 8px; }

.entity-list { display: flex; flex-direction: column; gap: 8px; flex: 1; }
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
