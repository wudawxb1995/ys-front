<template>
  <div class="m02-page">
    <div class="entry-title">
      <h2>{{ title || '解析结果预览' }}</h2>
      <p>{{ page?.desc || '提供解析结果的预览查看，支持按文档、类型等条件筛选，展示系统自动解析的结构化结果及原文内容。' }}</p>
    </div>

    <div class="mode-row">
      <button type="button" :class="{ on: mode === 'preview' }" @click="mode = 'preview'">预览模式</button>
      <button type="button" :class="{ on: mode === 'audit' }" @click="mode = 'audit'">审核模式</button>
    </div>

    <el-form class="filter-form" label-position="top" @submit.prevent="applyQuery">
      <el-form-item label="文档名称">
        <el-input v-model="draft.name" clearable placeholder="请输入文档名称" />
      </el-form-item>
      <el-form-item label="类型">
        <select-field v-model="draft.equip" :options="equipOpts" placeholder="全部" clearable />
      </el-form-item>
      <el-form-item label="资料类别">
        <select-field v-model="draft.cat" :options="catOpts" placeholder="全部" clearable />
      </el-form-item>
      <el-form-item label="解析状态">
        <select-field v-model="draft.status" :options="statusOpts" placeholder="全部" clearable />
      </el-form-item>
      <el-form-item label="时间范围" class="range-item">
        <div class="range">
          <date-field v-model="draft.start" placeholder="开始日期" clearable />
          <span class="range-sep">-</span>
          <date-field v-model="draft.end" placeholder="结束日期" clearable />
        </div>
      </el-form-item>
      <div class="filter-actions">
        <el-button type="primary" :icon="Search" @click="applyQuery">查询</el-button>
        <el-button @click="resetQuery">重置</el-button>
      </div>
    </el-form>

    <div class="stat-row">
      <div class="stat" v-for="s in stats" :key="s.key">
        <div class="stat-ico" :class="s.tone">
          <svg v-if="s.tone === 'all'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/></svg>
          <svg v-else-if="s.tone === 'done'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="8.2"/><path d="M8.2 12.4 10.8 15l5-5.2"/></svg>
          <svg v-else-if="s.tone === 'run'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="8.2"/><path d="M12 8v4.4l3 1.8"/></svg>
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="8.2"/><path d="M12 8v8M8 12h8"/></svg>
        </div>
        <div>
          <div class="stat-label">{{ s.label }}</div>
          <div class="stat-value" :class="s.tone">{{ s.value }} <small>{{ s.unit }}</small></div>
        </div>
      </div>
    </div>

    <div class="work-grid">
      <section class="pane">
        <h3><i></i>文档列表（{{ filtered.length }}）</h3>
        <div class="table-wrap doc-table">
          <table>
            <thead>
              <tr>
                <th class="col-cb"></th>
                <th>文档名称</th>
                <th>资料类别</th>
                <th>解析状态</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!pageDocs.length">
                <td colspan="4" class="empty">没有符合条件的文档</td>
              </tr>
              <tr
                v-for="row in pageDocs"
                :key="row.id"
                :class="{ on: current?.id === row.id }"
                @click="selectDoc(row)"
              >
                <td class="col-cb" @click.stop>
                  <el-checkbox :model-value="checked.has(row.id)" @change="(v) => toggle(row.id, v)" />
                </td>
                <td>
                  <div class="file-cell">
                    <span class="file-ico" :class="iconKind(row.fmt)">{{ iconText(row.fmt) }}</span>
                    <span class="file-name">{{ row.name }}</span>
                  </div>
                </td>
                <td>{{ row.cat }}</td>
                <td>
                  <span class="dot-status" :class="statusClass(row.status)"><i></i>{{ row.status }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="pane-foot">
          <span>共 {{ filtered.length }} 条</span>
          <el-pagination
            v-model:current-page="docPage"
            :page-size="docSize"
            :total="filtered.length"
            layout="prev, pager, next"
            background
            small
          />
          <span class="size-lab">{{ docSize }}条/页</span>
        </div>
      </section>

      <section class="pane preview-pane">
        <h3>
          <span><i></i>源文档预览</span>
          <em v-if="pages.length">{{ pageNo }} / {{ pages.length }}</em>
        </h3>
        <div v-if="current" class="preview-body">
          <div class="thumbs">
            <button
              v-for="p in pages"
              :key="p.no"
              type="button"
              :class="{ on: pageNo === p.no }"
              @click="pageNo = p.no"
            >
              <b>{{ p.no }}</b>
            </button>
          </div>
          <div class="paper" v-html="currentPage?.html" />
        </div>
        <div v-else class="preview-empty">请在左侧选择文档后查看原文</div>
      </section>

      <section class="pane result-pane">
        <h3><i></i>结构化解析结果（{{ parseRows.length }}）</h3>
        <div class="table-wrap result-table">
          <table>
            <thead>
              <tr>
                <th class="col-idx">序号</th>
                <th>指标名称</th>
                <th>指标值</th>
                <th>单位</th>
                <th>来源位置</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!pageRows.length">
                <td colspan="5" class="empty">请选择已解析文档查看结果</td>
              </tr>
              <tr
                v-for="(row, idx) in pageRows"
                :key="row.id"
                :class="{ on: currentInd?.id === row.id }"
                @click="selectInd(row)"
              >
                <td class="col-idx">{{ (indPage - 1) * indSize + idx + 1 }}</td>
                <td>{{ row.name }}</td>
                <td class="mono">{{ row.value }}</td>
                <td>{{ row.unit }}</td>
                <td>{{ row.loc }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="pane-foot">
          <span>共 {{ parseRows.length }} 条</span>
          <el-pagination
            v-model:current-page="indPage"
            :page-size="indSize"
            :total="parseRows.length"
            layout="prev, pager, next"
            background
            small
          />
          <span class="size-lab">{{ indSize }}条/页</span>
        </div>

        <div class="detail-box">
          <h4><i></i>指标详情</h4>
          <template v-if="currentInd">
            <div class="kv"><span>指标名称</span><b>{{ currentInd.name }}</b></div>
            <div class="kv"><span>指标值</span><b>{{ currentInd.value }}</b></div>
            <div class="kv"><span>指标单位</span><b>{{ currentInd.unit }}</b></div>
            <div class="kv"><span>来源位置</span><b>{{ currentInd.loc }}</b></div>
            <div class="kv block"><span>原文内容</span><p>{{ currentInd.quote }}</p></div>
            <div v-if="mode === 'audit'" class="detail-actions">
              <el-button @click="toast('已退回该指标，待重新解析', 'error')">退回</el-button>
              <el-button type="primary" @click="toast('已确认该指标', 'success')">通过</el-button>
            </div>
          </template>
          <p v-else class="detail-empty">点击上方指标查看详情</p>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Search } from '@element-plus/icons-vue'
import { useUi } from '@/composables/ui'
import { useDemoStore } from '@/composables/demo-store'
import SelectField from '@/components/SelectField.vue'
import DateField from '@/components/DateField.vue'
import {
  previewDocs,
  PREVIEW_EQUIP_OPTS,
  PREVIEW_CAT_OPTS,
  PREVIEW_STATUS_OPTS,
  pagesOf,
  rowsOf,
} from '@/data/m02-preview'

const props = defineProps({ page: Object, title: String })
const route = useRoute()
const { toast } = useUi()
const demoStore = useDemoStore()

const mode = ref(route.params.mid === 'preview' ? 'preview' : 'audit')
watch(() => route.params.mid, (mid) => {
  mode.value = mid === 'preview' ? 'preview' : 'audit'
})

const emptyQuery = () => ({ name: '', equip: '', cat: '', status: '', start: '', end: '' })
const draft = reactive(emptyQuery())
const applied = reactive(emptyQuery())
const checked = ref(new Set())
const currentId = ref(previewDocs[0]?.id || 0)
const currentIndId = ref('')
const docPage = ref(1)
const docSize = 10
const indPage = ref(1)
const indSize = 10
const pageNo = ref(1)

const equipOpts = PREVIEW_EQUIP_OPTS
const catOpts = PREVIEW_CAT_OPTS
const statusOpts = PREVIEW_STATUS_OPTS

const filtered = computed(() => previewDocs.filter((d) => {
  if (applied.name && !d.name.includes(applied.name)) return false
  if (applied.equip && d.equip !== applied.equip) return false
  if (applied.cat && d.cat !== applied.cat) return false
  if (applied.status && d.status !== applied.status) return false
  if (applied.start && d.date < applied.start) return false
  if (applied.end && d.date > applied.end) return false
  return true
}))

const pageDocs = computed(() => {
  const start = (docPage.value - 1) * docSize
  return filtered.value.slice(start, start + docSize)
})

const current = computed(() => filtered.value.find((d) => d.id === currentId.value) || pageDocs.value[0] || null)
const pages = computed(() => pagesOf(current.value))
const currentPage = computed(() => pages.value.find((p) => p.no === pageNo.value) || pages.value[0])
const parseRows = computed(() => (current.value ? rowsOf(current.value) : []))
const pageRows = computed(() => {
  const start = (indPage.value - 1) * indSize
  return parseRows.value.slice(start, start + indSize)
})
const currentInd = computed(() => parseRows.value.find((r) => r.id === currentIndId.value) || pageRows.value[0] || null)

const stats = computed(() => [
  { key: 'all', label: '文档总数', tone: 'all', value: previewDocs.length, unit: '份' },
  { key: 'done', label: '已解析', tone: 'done', value: previewDocs.filter((d) => d.status === '已解析').length, unit: '份' },
  { key: 'run', label: '待审核', tone: 'run', value: previewDocs.filter((d) => d.status === '待审核').length, unit: '份' },
  { key: 'wait', label: '解析异常', tone: 'wait', value: previewDocs.filter((d) => d.status === '解析异常').length, unit: '份' },
])

watch(filtered, (list) => {
  if (!list.some((d) => d.id === currentId.value)) currentId.value = list[0]?.id || 0
  const max = Math.max(1, Math.ceil(list.length / docSize))
  if (docPage.value > max) docPage.value = max
})
watch(current, (doc) => {
  pageNo.value = 1
  indPage.value = 1
  currentIndId.value = rowsOf(doc)[0]?.id || ''
  if (doc) demoStore.lastM02Task = doc.name
}, { immediate: true })
watch(currentInd, (row) => {
  if (row?.page) pageNo.value = row.page
  if (row) demoStore.lastM02IndicatorId = row.id
})

function applyQuery() {
  Object.assign(applied, { ...draft })
  docPage.value = 1
}
function resetQuery() {
  Object.assign(draft, emptyQuery())
  Object.assign(applied, emptyQuery())
  docPage.value = 1
}
function selectDoc(row) {
  currentId.value = row.id
}
function selectInd(row) {
  currentIndId.value = row.id
}
function toggle(id, val) {
  const s = new Set(checked.value)
  if (val) s.add(id)
  else s.delete(id)
  checked.value = s
}
function iconKind(fmt) {
  if (/DOC/.test(fmt)) return 'word'
  if (/XLS|CSV/.test(fmt)) return 'excel'
  if (/PDF/.test(fmt)) return 'pdf'
  return 'file'
}
function iconText(fmt) {
  if (/DOC/.test(fmt)) return 'W'
  if (/XLS/.test(fmt)) return 'X'
  if (/PDF/.test(fmt)) return 'A'
  return 'F'
}
function statusClass(status) {
  if (status === '已解析') return 'ok'
  if (status === '待审核') return 'run'
  return 'wait'
}
</script>

<style scoped>
.m02-page {
  display: flex;
  flex-direction: column;
  gap: 14px;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 18px 20px 16px;
  box-shadow: 0 6px 18px rgba(15, 55, 95, .04);
  overflow: hidden;
}
.entry-title h2 { font-size: 20px; color: #0d4e83; font-weight: 700; }
.entry-title p { margin-top: 4px; color: #6d8092; font-size: 13.5px; line-height: 1.6; }

.mode-row { display: flex; gap: 0; }
.mode-row button {
  height: 34px;
  padding: 0 18px;
  border: 1px solid #8eb4d4;
  background: #fff;
  color: #1668a8;
  font-size: 13.5px;
  font-weight: 600;
}
.mode-row button:first-child { border-radius: 6px 0 0 6px; }
.mode-row button:last-child { border-radius: 0 6px 6px 0; margin-left: -1px; }
.mode-row button.on {
  background: linear-gradient(#14639f, #0d4e83);
  border-color: #0d4e83;
  color: #fff;
}

.filter-form {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr 0.9fr 0.9fr 1.6fr auto;
  gap: 8px 12px;
  align-items: end;
}
.filter-form :deep(.el-form-item) { margin-bottom: 0; }
.filter-form :deep(.el-form-item__label) {
  font-size: 13px;
  color: #4a5a6a;
  font-weight: 600;
  line-height: 1.2;
  margin-bottom: 6px;
  justify-content: flex-start;
}
.range { display: flex; align-items: center; gap: 8px; min-width: 0; }
.range :deep(.date-field) { flex: 1; min-width: 0; }
.range-sep { color: #8a99a8; flex: 0 0 auto; }
.filter-actions { display: flex; align-items: center; gap: 8px; padding-bottom: 2px; }
.filter-actions :deep(.el-button + .el-button) { margin-left: 0; }

.stat-row { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
.stat {
  background: #f7fbfe;
  border: 1px solid #e6eef6;
  border-radius: 10px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}
.stat-ico {
  width: 40px; height: 40px; border-radius: 50%;
  display: grid; place-items: center; flex: 0 0 auto;
}
.stat-ico svg { width: 20px; height: 20px; }
.stat-ico.all { background: #e8f2fb; color: #1668a8; }
.stat-ico.done { background: #e8f7ec; color: #2f9e62; }
.stat-ico.run { background: #e8f2fb; color: #1668a8; }
.stat-ico.wait { background: #fdeceb; color: #d4380d; }
.stat-label { color: #6d8092; font-size: 13px; }
.stat-value { margin-top: 2px; font-size: 24px; font-weight: 700; line-height: 1.2; }
.stat-value small { font-size: 13px; font-weight: 500; color: #8a99a8; }
.stat-value.all { color: #1668a8; }
.stat-value.done { color: #2f9e62; }
.stat-value.run { color: #1668a8; }
.stat-value.wait { color: #d4380d; }

.work-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(0, 1.2fr) minmax(0, 1.15fr);
  gap: 12px;
  min-width: 0;
  align-items: stretch;
}
.pane {
  border: 1.5px dashed #b7d4ee;
  border-radius: 12px;
  padding: 12px 12px 8px;
  min-width: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: #fff;
}
.pane h3 {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-size: 15px;
  color: var(--navy-2);
  margin-bottom: 10px;
}
.pane h3 i, .detail-box h4 i {
  width: 4px; height: 14px; background: var(--blue); border-radius: 2px; display: inline-block; margin-right: 8px;
}
.pane h3 > span { display: inline-flex; align-items: center; }
.pane h3 em { font-style: normal; color: #8a99a8; font-size: 13px; font-weight: 500; }

.table-wrap {
  border: 0;
  box-shadow: none;
  overflow: auto;
  min-width: 0;
  flex: 1;
}
.doc-table, .result-table { min-height: 280px; }
.pane table { width: 100%; table-layout: fixed; }
.pane th, .pane td { font-size: 13px; padding: 8px 6px; }
.file-cell { display: flex; align-items: center; gap: 8px; min-width: 0; }
.file-name { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.file-ico {
  width: 22px; height: 22px; border-radius: 4px; flex: 0 0 auto;
  display: grid; place-items: center; color: #fff; font-size: 10px; font-weight: 700;
}
.file-ico.word { background: #2b7cd3; }
.file-ico.excel { background: #217346; }
.file-ico.pdf { background: #e2574c; }
.file-ico.file { background: #7c8fa2; }
tr.on td { background: #eef6fc; }
tr.on .file-name { color: #1668a8; font-weight: 600; }
.dot-status { display: inline-flex; align-items: center; gap: 5px; white-space: nowrap; }
.dot-status i { width: 7px; height: 7px; border-radius: 50%; }
.dot-status.ok { color: #2f9e62; } .dot-status.ok i { background: #2fbf4a; }
.dot-status.run { color: #d48806; } .dot-status.run i { background: #faad14; }
.dot-status.wait { color: #d4380d; } .dot-status.wait i { background: #f5222d; }
.mono { font-family: ui-monospace, Consolas, monospace; color: #0d4e83; font-weight: 600; }

.pane-foot {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-top: 8px;
  color: #7c8fa2;
  font-size: 12.5px;
  flex-wrap: wrap;
}
.pane-foot .size-lab { margin-left: auto; }
.pane-foot :deep(.el-pagination) { margin-left: auto; }

.preview-body {
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr);
  gap: 8px;
  min-height: 360px;
  min-width: 0;
  flex: 1;
}
.thumbs {
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow: auto;
}
.thumbs button {
  height: 56px;
  border: 1px solid #d5e0ea;
  border-radius: 6px;
  background: #f4f8fc;
  color: #5d7388;
  font-weight: 700;
}
.thumbs button.on { border-color: #1668a8; background: #e8f2fb; color: #0d4e83; }
.paper {
  border: 1px solid #e2ebf3;
  border-radius: 8px;
  background: #fff;
  padding: 14px 16px;
  overflow: auto;
  min-width: 0;
  font-size: 13px;
  line-height: 1.75;
  color: #3f5062;
}
.paper :deep(h4) { color: #0d4e83; font-size: 15px; margin-bottom: 8px; }
.paper :deep(p) { margin: 0 0 6px; }
.preview-empty {
  flex: 1;
  min-height: 280px;
  display: grid;
  place-items: center;
  color: #9fb0c0;
  font-size: 13.5px;
}

.detail-box {
  margin-top: 10px;
  border-top: 1px dashed #d5e0ea;
  padding-top: 10px;
}
.detail-box h4 {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #0d4e83;
  margin-bottom: 8px;
}
.kv {
  display: grid;
  grid-template-columns: 5.5em 1fr;
  gap: 6px;
  font-size: 13px;
  margin-bottom: 6px;
}
.kv span { color: #7c8fa2; }
.kv b { color: #1f3d5a; font-weight: 600; }
.kv.block { align-items: start; }
.kv p { margin: 0; color: #3f5062; line-height: 1.6; }
.detail-empty { color: #9fb0c0; font-size: 13px; }
.detail-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px; }

@media (max-width: 1180px) {
  .filter-form { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .range-item, .filter-actions { grid-column: auto; }
  .filter-actions { justify-content: flex-end; }
}
</style>
