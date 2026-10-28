<template>
  <div class="m02-page">
    <!-- ═══ 第二级：抽取结果详情（白底整卡 + 虚线框分段） ═══ -->
    <div v-if="detail" class="m02-detail-shell">
      <div class="m02-topbar">
        <button type="button" class="m02-back" @click="closeDetail">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          返回任务列表
        </button>
        <span class="m02-sep">|</span>
        <span class="m02-title">{{ detail.name }}</span>
        <span class="badge on"><i></i>抽取完成</span>
      </div>

      <!-- 文档概览 -->
      <div class="m02-dash">
        <h3 class="m02-dash-title"><i></i>文档概览</h3>
        <div class="m02-doc-row">
          <div class="m02-doc-ico" :class="detail.iconKind">{{ detail.iconText }}</div>
          <div class="m02-doc-meta">
            <div class="m02-doc-name">{{ detail.doc }}</div>
            <div class="m02-doc-sub">来源文档：{{ detail.name }}　抽取完成：{{ detail.finishedAt }}</div>
          </div>
        </div>
      </div>

      <div class="m02-dash m02-table-panel">
        <div class="m02-sumbar">
          <div class="m02-sum">
            <span>共 <b>{{ resultRows.length }}</b> 项指标</span>
            <span class="gold">标黄待审定 <b>{{ goldPending }}</b> 项</span>
            <span>待审定 <b>{{ pendingCount }}</b> 项</span>
          </div>
          <div class="m02-sum-actions">
            <el-button type="primary" @click="confirmAudit">审核</el-button>
            <el-button :loading="treeLoading" @click="goMetricTree">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 3v6M8 21h8M12 9l-4 4M12 9l4 4M8 13v8M16 13v8"/></svg>
              生成指标树
            </el-button>
          </div>
        </div>
        <div class="m02-table-scroll">
          <table class="m02-table">
            <thead>
              <tr>
                <th class="col-idx">#</th>
                <th>性能域/指标类</th>
                <th>指标名称</th>
                <th>判据</th>
                <th class="center">置信度</th>
                <th class="center">出处</th>
                <th class="center">审定状态</th>
                <th class="center">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(row, idx) in resultRows"
                :key="row.id"
                :class="{ 'm02-gold-row': row.conf < 0.8 && row.status === '待审核' }"
              >
                <td class="col-idx muted">{{ idx + 1 }}</td>
                <td class="klass">{{ row.klass }}</td>
                <td class="name">{{ row.name }}</td>
                <td class="mono">{{ row.criteria }}</td>
                <td class="center" :class="{ 'conf-low': row.conf < 0.8 }">{{ row.conf.toFixed(2) }}</td>
                <td class="center muted">P{{ row.srcPage }}</td>
                <td class="center">
                  <span class="badge" :class="row.status === '已确认' ? 'on' : row.status === '已驳回' ? 'hold' : 'warn'"><i></i>{{ row.status }}</span>
                </td>
                <td class="center">
                  <div class="ops">
                    <a @click="openEdit(row)">修改</a>
                    <a @click="openTrace(row)">一键溯源</a>
                  </div>
                </td>
              </tr>
              <tr v-if="!resultRows.length" class="empty-row">
                <td colspan="8" class="empty">当前来源文档暂无抽取结果</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ═══ 第一级：任务列表 ═══ -->
    <div v-else class="crud-body m02-list-card">
      <div class="toolbar">
        <el-button type="primary" @click="openCreate">＋ 新建抽取任务</el-button>
        <span class="spacer" />
        <el-input v-model="filterDoc" clearable placeholder="按来源文档筛选…" style="width: 240px" />
        <span class="hint">共 {{ filteredTasks.length }} 个任务</span>
      </div>
      <div class="table-inner">
        <table>
          <thead>
            <tr>
              <th>任务名称</th>
              <th>来源文档</th>
              <th class="center">抽取指标数</th>
              <th class="center">状态</th>
              <th>完成时间</th>
              <th class="center op">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="task in filteredTasks"
              :key="task.key || task.name"
              :class="{ clickable: task.status === '已完成' }"
              @click="task.status === '已完成' && openDetail(task)"
            >
              <td class="name">{{ task.name }}</td>
              <td class="doc">{{ task.doc }}</td>
              <td class="center count">{{ task.count || '—' }}</td>
              <td class="center">
                <span class="badge" :class="task.status === '已完成' ? 'on' : task.status === '进行中' ? 'warn' : 'hold'"><i></i>{{ task.status }}</span>
              </td>
              <td class="time">{{ task.finishedAt || '—' }}</td>
              <td class="center" @click.stop>
                <button v-if="task.status === '已完成'" type="button" class="btn-link" @click="openDetail(task)">查看结果</button>
                <span v-else class="dash">—</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 新建抽取任务 -->
    <el-dialog
      v-model="createVisible"
      title="新建抽取任务"
      width="560px"
      align-center
      destroy-on-close
      :close-on-click-modal="false"
      class="m02-create-dlg"
    >
      <el-form label-width="7.2em" require-asterisk-position="right" class="m02-create-form">
        <el-form-item label="任务名称" required>
          <el-input v-model="createForm.name" maxlength="80" placeholder="如 某型装备研制总要求 · 指标抽取" />
        </el-form-item>
        <el-form-item label="来源文档" required>
          <el-select
            v-model="createForm.srcName"
            placeholder="请选择已解析资源"
            filterable
            style="width:100%"
            @change="onSrcChange"
          >
            <el-option
              v-for="op in srcOptions"
              :key="op.value"
              :label="op.label"
              :value="op.value"
            >
              <span>{{ op.label }}</span>
              <span class="m02-opt-meta">{{ op.status }} · 预计 {{ op.count }} 项</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="性能域" required>
          <div class="m02-create-domains">
            <button
              v-for="d in domains"
              :key="d"
              type="button"
              class="m02-domain-tag"
              :class="{ on: createForm.domains.includes(d) }"
              @click="toggleCreateDomain(d)"
            >{{ d }}</button>
          </div>
          <div class="m02-create-hint">勾选性能域后，预估抽取条数自动联动</div>
        </el-form-item>
        <el-form-item label="预估条数">
          <div class="m02-count-box">
            <span class="m02-count-num">{{ createPreviewCount }}</span>
            <span class="m02-count-unit">项</span>
            <span class="m02-count-tip">由来源文档 × 所选性能域估算</span>
          </div>
        </el-form-item>
        <el-form-item label="抽取模式">
          <el-radio-group v-model="createForm.mode">
            <el-radio value="全量抽取">全量抽取</el-radio>
            <el-radio value="定向抽取">定向抽取</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="createForm.remark"
            type="textarea"
            :rows="2"
            maxlength="120"
            show-word-limit
            placeholder="可选，说明本任务抽取范围或关注点"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createVisible = false">取消</el-button>
        <el-button type="primary" @click="submitCreate">开始抽取</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="editVisible"
      title="编辑指标属性"
      width="520px"
      align-center
      destroy-on-close
      :close-on-click-modal="false"
    >
      <el-form label-width="7.2em" require-asterisk-position="right" class="m02-create-form">
        <el-form-item label="指标名称" required>
          <el-input v-model="editForm.name" maxlength="40" />
        </el-form-item>
        <el-form-item label="判据" required>
          <el-input v-model="editForm.criteria" maxlength="60" placeholder="如 ≤0.30 m" />
        </el-form-item>
        <el-form-item label="判据类型" required>
          <el-select v-model="editForm.criteriaType" style="width:100%">
            <el-option v-for="op in criteriaOptions" :key="op" :label="op" :value="op" />
          </el-select>
        </el-form-item>
        <el-form-item label="考核方式" required>
          <el-select v-model="editForm.examMethod" style="width:100%">
            <el-option v-for="op in examOptions" :key="op" :label="op" :value="op" />
          </el-select>
        </el-form-item>
        <el-form-item label="来源章节">
          <el-input v-model="editForm.srcSection" maxlength="80" />
        </el-form-item>
        <el-form-item label="原文页码">
          <el-input-number v-model="editForm.srcPage" :min="1" :max="999" controls-position="right" style="width:100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editVisible = false">取消</el-button>
        <el-button type="primary" @click="saveEdit">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="traceVisible"
      width="520px"
      align-center
      destroy-on-close
      class="m02-trace-dialog"
    >
      <template #header>
        <div v-if="traceRow" class="m02-trace-title">
          <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 1.5h6.2L13 5v9.5h-9.5v-13z" /><path d="M9.5 1.5V5H13" /></svg>
          <b>{{ traceRow.name }}</b>
          <span>置信度 {{ Number(traceRow.conf || 0).toFixed(2) }}</span>
        </div>
      </template>
      <div v-if="traceRow" class="m02-trace">
        <div class="m02-trace-quote">
          <div class="m02-trace-loc">原文同步定位 · 《{{ traceDocTitle(traceRow) }}》第 {{ traceRow.srcPage }} 页</div>
          <p>......{{ traceSentence(traceRow) }}.......<mark>{{ traceMark(traceRow) }}</mark></p>
        </div>
        <div class="m02-trace-judge">
          <span>抽取判据：</span>
          <b>{{ traceRow.criteria }}</b>
        </div>
      </div>
      <template #footer>
        <button type="button" class="m02-act m02-act-ok" @click="confirmTrace">
          <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.2 8.2 6.3 11.2 12.8 4.6" /></svg>确认
        </button>
        <button type="button" class="m02-act m02-act-edit" @click="reviseTrace">
          <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M9.2 3.2 12.8 6.8 6.2 13.4H2.6V9.8z" /><path d="M8.2 4.2 11.8 7.8" /></svg>修正
        </button>
        <button type="button" class="m02-act m02-act-no" @click="rejectTrace">
          <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4.2 4.2 11.8 11.8M11.8 4.2 4.2 11.8" /></svg>驳回
        </button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElLoading } from 'element-plus'
import { useUi } from '@/composables/ui'
import { useRows } from '@/composables/tables'
import { useDemoStore } from '@/composables/demo-store'
import { m02Domains, getM02RowsForDoc, getM02CountForDoc } from '@/data/m02-indicators'
import { isTank99aDoc } from '@/data/tank99a'

defineProps({ page: Object, title: String })
const { toast, confirm } = useUi()
const route = useRoute()
const router = useRouter()
const demoStore = useDemoStore()

const resources = useRows('resources')
const filterDoc = ref('')
const detail = ref(null)
const resultRows = ref([])
const domains = m02Domains
const criteriaOptions = ['定量', '定性', '阈值', '阈值+定量']
const examOptions = ['实测', '试验', '检验', '测试', '统计', '仿真', '查验']
const treeLoading = ref(false)

/** 本页新建的抽取任务（覆盖同源文档的资源派生行） */
const localTasks = ref([])
const createVisible = ref(false)
const createForm = reactive({
  name: '',
  srcName: '',
  domains: [...m02Domains],
  mode: '全量抽取',
  remark: '',
})

function extOf(name = '') {
  const i = String(name).lastIndexOf('.')
  return i >= 0 ? String(name).slice(i + 1).toUpperCase() : ''
}

function resolveFmt(res) {
  const fromFmt = String(res?.fmt || '').toUpperCase()
  if (fromFmt && fromFmt !== '—' && fromFmt !== 'FILE') return fromFmt
  return extOf(res?.name) || 'FILE'
}

function iconKindOf(fmt = '') {
  if (/DOC/.test(fmt)) return 'word'
  if (/XLS|CSV/.test(fmt)) return 'excel'
  if (/PDF/.test(fmt)) return 'pdf'
  if (/PNG|JPE?G|TIF|BMP/.test(fmt)) return 'img'
  if (/MP4|MP3|AVI/.test(fmt)) return 'media'
  return 'file'
}

function iconTextOf(fmt = '') {
  if (/DOCX?/.test(fmt)) return 'DOCX'
  if (/XLS/.test(fmt)) return 'XLS'
  if (/PDF/.test(fmt)) return 'PDF'
  if (/CSV/.test(fmt)) return 'CSV'
  return String(fmt).slice(0, 4) || 'FILE'
}

function nowText() {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}

function taskFromResource(res) {
  const taskStatus = res.status === '已解析' ? '已完成' : res.status === '解析中' ? '进行中' : '排队中'
  const fmt = resolveFmt(res)
  return {
    key: `res:${res.name}`,
    name: res.name,
    doc: res.name,
    count: taskStatus === '已完成' ? getM02CountForDoc(res.name) : 0,
    status: taskStatus,
    finishedAt: taskStatus === '已完成' ? res.time : null,
    fmt,
    iconKind: iconKindOf(fmt),
    iconText: iconTextOf(fmt),
    domains: [...m02Domains],
  }
}

const srcOptions = computed(() =>
  resources
    .filter((r) => r.status === '已解析' || r.status === '解析中')
    .map((r) => ({
      value: r.name,
      label: r.name,
      status: r.status,
      count: getM02CountForDoc(r.name),
    })),
)

const createPreviewCount = computed(() => {
  if (!createForm.srcName || !createForm.domains.length) return 0
  const rows = getM02RowsForDoc(createForm.srcName)
  return rows.filter((r) => createForm.domains.includes(r.domain)).length
})

const tasks = computed(() => {
  const localByDoc = new Map(localTasks.value.map((t) => [t.doc, t]))
  const fromRes = resources
    .map(taskFromResource)
    .filter((t) => !localByDoc.has(t.doc))
  return [...localTasks.value, ...fromRes]
})

const filteredTasks = computed(() =>
  tasks.value.filter((t) => !filterDoc.value || t.doc.includes(filterDoc.value) || t.name.includes(filterDoc.value)),
)

const pendingCount = computed(() => resultRows.value.filter((r) => r.status === '待审核').length)
const goldPending = computed(() => resultRows.value.filter((r) => r.status === '待审核' && r.conf < 0.8).length)

const editVisible = ref(false)
const editingId = ref('')
const editForm = reactive({
  name: '',
  criteria: '',
  criteriaType: '定量',
  examMethod: '实测',
  srcSection: '',
  srcPage: 12,
})
const traceVisible = ref(false)
const traceRow = ref(null)
const traceSentences = {
  i01: '在标准气象条件下，立靶高低偏差应不大于0.30 mil，方向偏差应不大于0.30 mil',
  i08: '最大膛压不大于315 MPa',
}

function traceDocTitle(row) {
  const raw = String(row?.srcDoc || detail.value?.doc || '某型装备研制总要求')
  if (/研制总要求/.test(raw)) return '某型装备研制总要求'
  return raw.replace(/^D-\d+/, '').replace(/[《》]/g, '').trim() || raw
}

function traceSentence(row) {
  if (!row) return ''
  if (row.quote) return row.quote
  if (traceSentences[row.id]) return traceSentences[row.id]
  const criteria = String(row.criteria || '')
  if (/^[≤<]/.test(criteria)) return `${row.name}不大于${criteria.replace(/^[≤<]\s*/, '')}`
  if (/^[≥>]/.test(criteria)) return `${row.name}不小于${criteria.replace(/^[≥>]\s*/, '')}`
  return `${row.name}应满足${criteria}`
}

function traceMark(row) {
  const criteria = String(row?.criteria || '')
  const hit = criteria.match(/^[≤≥<>±]*\s*[\d.]+/)
  return hit ? hit[0].replace(/\s+/g, '') : criteria
}

function openDetail(task) {
  detail.value = task
  const rows = getM02RowsForDoc(task.doc || task.name)
  const domainSet = task.domains?.length ? new Set(task.domains) : null
  const list = domainSet ? rows.filter((r) => domainSet.has(r.domain)) : rows
  resultRows.value = list.map((r) => ({ ...r, status: '待审核' }))
  demoStore.lastM02Task = task.doc || task.name
}
function openFromQuery() {
  const doc = String(route.query.doc || '')
  if (!doc) return
  if (detail.value && (detail.value.doc === doc || detail.value.name === doc)) return
  const task = tasks.value.find((item) => item.doc === doc || item.name === doc)
    || tasks.value.find((item) => isTank99aDoc(doc) && isTank99aDoc(item.doc || item.name))
  if (task?.status === '已完成') openDetail(task)
}
onMounted(openFromQuery)
watch(() => route.query.doc, openFromQuery)
function closeDetail() {
  detail.value = null
  resultRows.value = []
}
function confirmAudit() {
  if (!resultRows.value.length) {
    toast('暂无指标可审核', 'warning')
    return
  }
  confirm('是否确认全部指标项？确认后，审定状态将全部改为「已确认」。', () => {
    resultRows.value.forEach((row) => { row.status = '已确认' })
    toast('已确认全部指标项', 'success')
  }, false)
}
function goMetricTree() {
  if (treeLoading.value) return
  treeLoading.value = true
  const loading = ElLoading.service({
    lock: true,
    text: '正在生成指标树…',
    background: 'rgba(255, 255, 255, 0.72)',
  })
  window.setTimeout(() => {
    loading.close()
    treeLoading.value = false
    router.push({
      name: 'app',
      params: { pid: route.params.pid, sid: route.params.sid, mid: 'models' },
      query: { published: '1' },
    })
  }, 1600)
}
function openEdit(row) {
  editingId.value = row.id
  editForm.name = row.name
  editForm.criteria = row.criteria
  editForm.criteriaType = row.criteriaType || '定量'
  editForm.examMethod = row.examMethod || '实测'
  editForm.srcSection = row.srcSection || row.klass || ''
  editForm.srcPage = row.srcPage || 12
  editVisible.value = true
}
function saveEdit() {
  const row = resultRows.value.find((item) => item.id === editingId.value)
  if (!row) return
  if (!editForm.name?.trim()) {
    toast('指标名称不能为空', 'error')
    return
  }
  if (!editForm.criteria?.trim()) {
    toast('判据不能为空', 'error')
    return
  }
  row.name = editForm.name.trim()
  row.criteria = editForm.criteria.trim()
  row.value = row.criteria
  row.criteriaType = editForm.criteriaType
  row.examMethod = editForm.examMethod
  row.srcSection = editForm.srcSection?.trim() || row.srcSection
  row.srcPage = Number(editForm.srcPage) || row.srcPage || 12
  row.highlight = row.criteria
  row.srcText = `${row.klass}\n「${row.name}」判据为 ${row.criteria}。`
  editVisible.value = false
  toast('指标属性已更新', 'success')
}
function openTrace(row) {
  traceRow.value = row
  demoStore.lastM02IndicatorId = row.id
  traceVisible.value = true
}

function confirmTrace() {
  const row = traceRow.value
  if (!row) return
  row.status = '已确认'
  traceVisible.value = false
  toast(`已确认「${row.name}」`, 'success')
}

function rejectTrace() {
  const row = traceRow.value
  if (!row) return
  row.status = '已驳回'
  traceVisible.value = false
  toast(`已驳回「${row.name}」`, 'warning')
}

function reviseTrace() {
  const row = traceRow.value
  traceVisible.value = false
  if (row) openEdit(row)
}

function openCreate() {
  createForm.name = ''
  createForm.srcName = srcOptions.value[0]?.value || ''
  createForm.domains = [...m02Domains]
  createForm.mode = '全量抽取'
  createForm.remark = ''
  if (createForm.srcName) onSrcChange(createForm.srcName)
  createVisible.value = true
}

function onSrcChange(name) {
  if (!createForm.name?.trim()) {
    createForm.name = `${name} · 指标抽取`
  }
}

function toggleCreateDomain(d) {
  const i = createForm.domains.indexOf(d)
  if (i >= 0) createForm.domains.splice(i, 1)
  else createForm.domains.push(d)
}

function submitCreate() {
  if (!createForm.name?.trim()) {
    toast('请填写任务名称', 'warning')
    return
  }
  if (!createForm.srcName) {
    toast('请选择来源文档', 'warning')
    return
  }
  if (!createForm.domains.length) {
    toast('请至少选择一个性能域', 'warning')
    return
  }

  const res = resources.find((r) => r.name === createForm.srcName)
  const fmt = resolveFmt(res || { name: createForm.srcName })
  const key = `local:${createForm.srcName}:${Date.now()}`
  const task = {
    key,
    name: createForm.name.trim(),
    doc: createForm.srcName,
    count: 0,
    status: '进行中',
    finishedAt: null,
    fmt,
    iconKind: iconKindOf(fmt),
    iconText: iconTextOf(fmt),
    domains: [...createForm.domains],
    mode: createForm.mode,
    remark: createForm.remark,
  }

  // 同源文档只保留最新一条本地任务
  localTasks.value = [task, ...localTasks.value.filter((t) => t.doc !== task.doc)]
  createVisible.value = false
  toast('抽取任务已启动', 'success')

  const preview = createPreviewCount.value
  window.setTimeout(() => {
    const hit = localTasks.value.find((t) => t.key === key)
    if (!hit) return
    hit.status = '已完成'
    hit.count = preview || getM02CountForDoc(hit.doc)
    hit.finishedAt = nowText()
    if (res && res.status !== '已解析') {
      res.status = '已解析'
      res.time = hit.finishedAt
    }
    toast(`「${hit.name}」抽取完成，共 ${hit.count} 项`, 'success')
  }, 1200)
}
</script>

<style scoped>
.m02-page { min-width: 0; max-width: 100%; }

/* 白底整卡壳 —— 对齐指标树 / 方案生成详情 */
.m02-detail-shell {
  display: flex;
  flex-direction: column;
  gap: 14px;
  background: #fff;
  border: 1px solid var(--line, #e0eaf3);
  border-radius: 12px;
  padding: 18px 20px 16px;
  box-shadow: 0 6px 18px rgba(15, 55, 95, .04);
}
.m02-topbar {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 36px;
}
.m02-back {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border: 0;
  background: none;
  padding: 0;
  color: #1668a8;
  font-size: 13px;
  cursor: pointer;
}
.m02-back:hover { color: #0d4e83; }
.m02-back svg { width: 13px; height: 13px; }
.m02-sep { color: #d0dce8; }
.m02-title {
  font-weight: 700;
  font-size: 15px;
  color: #1f3d5a;
  max-width: 52%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.m02-sumbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 12px;
}
.m02-sum {
  display: flex;
  align-items: baseline;
  gap: 22px;
  font-size: 13.5px;
  color: #5c7084;
}
.m02-sum b { font-size: 18px; color: #0d4e83; margin: 0 2px; }
.m02-sum .gold, .m02-sum .gold b { color: #c8902a; }
.m02-sum-actions { display: flex; align-items: center; gap: 8px; flex: 0 0 auto; }
.m02-sum-actions svg { width: 14px; height: 14px; margin-right: 4px; vertical-align: -2px; }
.klass { color: #5c7084; white-space: nowrap; }
.conf-low { color: #c8902a; font-weight: 700; }
.m02-table .ops { display: inline-flex; gap: 10px; justify-content: center; }
.m02-table .ops a { color: #1668a8; cursor: pointer; }
.m02-table .ops a:hover { text-decoration: underline; }
.m02-table tbody tr { cursor: default; }
.m02-trace-title {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  padding-right: 28px;
}
.m02-trace-title svg {
  width: 16px;
  height: 16px;
  flex: 0 0 auto;
  fill: none;
  stroke: #1a3f66;
  stroke-width: 1.4;
  stroke-linejoin: round;
  stroke-linecap: round;
}
.m02-trace-title b {
  color: #1a3f66;
  font-size: 16px;
  font-weight: 700;
}
.m02-trace-title span {
  height: 22px;
  padding: 0 8px;
  border-radius: 4px;
  background: #f6edd6;
  color: #b08a3c;
  font-size: 12px;
  font-weight: 650;
  line-height: 22px;
}
.m02-trace-quote {
  padding: 14px 16px;
  border: 1px solid #e6ebf2;
  border-radius: 8px;
  background: #f7f9fb;
}
.m02-trace-loc {
  margin-bottom: 8px;
  color: #8b97a6;
  font-size: 13px;
}
.m02-trace-quote p {
  margin: 0;
  color: #3e4e60;
  font-size: 14px;
  line-height: 1.75;
}
.m02-trace-quote mark {
  padding: 0 4px;
  border-radius: 3px;
  background: #f3e4c0;
  color: #6a5630;
}
.m02-trace-judge {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-top: 16px;
  color: #8b97a6;
  font-size: 14px;
}
.m02-trace-judge b {
  color: #1668a8;
  font-size: 15px;
  font-weight: 700;
}
.m02-act {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 32px;
  padding: 0 14px;
  border-radius: 6px;
  background: #fff;
  font-size: 14px;
  cursor: pointer;
}
.m02-act svg {
  width: 14px;
  height: 14px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.6;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.m02-act-ok { border: 1px solid #b7dfc4; color: #1f9d55; }
.m02-act-edit { border: 1px solid #b7d4ee; color: #1668a8; }
.m02-act-no { border: 1px solid #f0c4b8; color: #d4380d; }
.m02-act-ok:hover { background: #f3faf5; }
.m02-act-edit:hover { background: #f4f9fd; }
.m02-act-no:hover { background: #fff6f3; }

/* 虚线分段面板 */
.m02-dash {
  border: 1.5px dashed #b7d4ee;
  border-radius: 12px;
  background: #fff;
  padding: 14px 16px 14px;
  overflow: hidden;
}
.m02-dash-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 12px;
  font-size: 15px;
  font-weight: 600;
  color: var(--navy-2, #1f3d5a);
}
.m02-dash-title > i {
  width: 4px;
  height: 14px;
  background: var(--blue, #1668a8);
  border-radius: 2px;
  display: inline-block;
  flex: 0 0 auto;
}
.m02-hint {
  margin-left: auto;
  font-size: 12.5px;
  font-weight: 400;
  color: #8a99a8;
}
.m02-hint b { color: #0d4e83; font-weight: 700; }

/* 文档概览 */
.m02-doc-row { display: flex; align-items: center; gap: 14px; }
.m02-doc-ico {
  width: 44px; height: 44px; border-radius: 9px; flex: 0 0 44px;
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 700; color: #fff;
  background: #7c8fa2;
}
.m02-doc-ico.word { background: linear-gradient(135deg, #2b7cd3, #1a5fa8); }
.m02-doc-ico.excel { background: linear-gradient(135deg, #2f9e62, #217346); }
.m02-doc-ico.pdf { background: linear-gradient(135deg, #e2574c, #c0392b); }
.m02-doc-ico.img { background: linear-gradient(135deg, #7b6bb0, #5b4d8a); }
.m02-doc-ico.media { background: linear-gradient(135deg, #6b46c1, #553c9a); }
.m02-doc-ico.file { background: #7c8fa2; }
.m02-doc-meta { flex: 1; min-width: 0; }
.m02-doc-name { font-size: 15px; font-weight: 600; color: #1a3a5a; }
.m02-doc-sub { font-size: 13px; color: #8a99a8; margin-top: 3px; }

/* 性能域 */
.m02-domain-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 14px;
}
.m02-domain-split {
  width: 1px;
  height: 18px;
  background: #d5e0ea;
  margin: 0 2px;
  flex: 0 0 auto;
}
.m02-act-btn {
  height: 28px;
  padding: 0 14px;
  border-radius: 14px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all .14s;
  line-height: 1;
}
.m02-act-btn.primary {
  border: 1px solid #9ec8e8;
  background: #e8f3fb;
  color: #1668a8;
}
.m02-act-btn.primary:hover {
  background: #1668a8;
  border-color: #1668a8;
  color: #fff;
}
.m02-act-btn.ghost {
  border: 1px solid #d5e0ea;
  background: #fff;
  color: #6d8092;
}
.m02-act-btn.ghost:hover {
  border-color: #c8902a;
  color: #c8902a;
  background: #fff8e8;
}

/* 浅色统计条（替代深色渐变条，贴合白壳） */
.m02-stat-row {
  display: flex;
  align-items: center;
  gap: 28px;
  padding: 12px 16px;
  background: #f4f8fc;
  border: 1px solid #e0eaf3;
  border-radius: 10px;
}
.m02-stat { display: flex; align-items: baseline; gap: 6px; }
.m02-stat-n { font-size: 24px; font-weight: 700; color: #0d4e83; line-height: 1; }
.m02-stat-n.gold { color: #c8902a; }
.m02-stat-u { font-size: 13px; color: #6d8092; }
.m02-stat-legend {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12.5px;
  color: #6d8092;
}
.m02-stat-legend .lab { margin-right: 4px; color: #8a99a8; }
.lg { display: inline-block; width: 26px; height: 7px; border-radius: 3px; }
.lg.b1 { background: #1668a8; }
.lg.b2 { background: #a8c8e8; }
.lg.b3 { background: #d0ab68; }

/* 结果区 */
.m02-result-layout { display: block; }
.m02-result-layout.split {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 14px;
  align-items: stretch;
}
.m02-table-panel {
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding-bottom: 8px;
}
.m02-table-scroll {
  overflow: auto;
  max-height: 460px;
  margin: 0 -4px;
  padding: 0 4px;
}
.m02-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13.5px;
}
.m02-table th {
  text-align: left;
  padding: 10px 12px;
  background: #f4f8fc;
  color: #5c7084;
  font-weight: 600;
  font-size: 12.5px;
  border-bottom: 1px solid #e0eaf3;
  position: sticky;
  top: 0;
  z-index: 1;
}
.m02-table td {
  padding: 11px 12px;
  border-bottom: 1px solid #eef3f8;
  color: #3f5062;
  vertical-align: middle;
}
.m02-table tbody tr { cursor: pointer; transition: background .12s; }
.m02-table tbody tr:hover { background: #f7fbfe; }
.m02-table tbody tr.selected { background: #eaf3fd; }
.m02-table tbody tr.m02-gold-row { background: #fff8e8; }
.m02-table tbody tr.m02-gold-row.selected { background: #fff0cc; }
.col-idx { width: 52px; text-align: center !important; }
.center { text-align: center; }
.op { width: 120px; }
.name { font-weight: 600; color: #1f3d5a; }
.doc { color: #5a6978; }
.count { font-weight: 600; color: #0d4e83; }
.time { color: #8a99a8; font-size: 13px; }
.dash { color: #b0bfc8; font-size: 13px; }
.clickable { cursor: pointer; }
.muted { color: #8a99a8; }
.muted2 { color: #6d8092; }
.nowrap { white-space: nowrap; }
.mono { font-family: ui-monospace, monospace; color: #0d4e83; font-weight: 600; }
.ellipsis {
  font-size: 13px; color: #5c7084; max-width: 200px;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.empty { text-align: center; color: #8a99a8; padding: 28px 12px !important; }
.conf { display: flex; align-items: center; gap: 6px; justify-content: center; }
.conf-bar {
  width: 64px; height: 7px; background: #e6eef5; border-radius: 4px;
  overflow: hidden; flex: 0 0 64px;
}
.conf-bar > div { height: 100%; border-radius: 4px; }
.conf span { font-size: 12.5px; font-weight: 600; min-width: 34px; text-align: right; }

/* 原文溯源 */
.m02-source-panel {
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.m02-close {
  margin-left: auto;
  width: 28px; height: 28px;
  border: 1px solid #d6e4f0; border-radius: 6px;
  background: #fff; color: #8a99a8; cursor: pointer; font-size: 18px; line-height: 1;
}
.m02-close:hover { color: #0d4e83; border-color: #9ec8e8; }
.m02-source-sub { font-size: 12.5px; color: #8a99a8; margin: -6px 0 12px; }
.m02-source-ind {
  display: flex; align-items: baseline; justify-content: space-between; gap: 10px;
  padding: 10px 12px; background: #f4f8fc; border-radius: 8px; margin-bottom: 12px;
  border: 1px solid #e8eef5;
}
.ind-name { font-size: 13.5px; font-weight: 600; color: #1f3d5a; }
.ind-val { font-size: 13px; font-weight: 700; color: #0d4e83; font-family: ui-monospace, monospace; }
.m02-source-body {
  border: 1px solid #e8eef5; border-radius: 8px; padding: 14px;
  background: #fafcfe; flex: 1; min-height: 160px;
}
.page-tag {
  display: inline-flex; font-size: 11.5px; color: #a36e0c; background: #fff5dc;
  border: 1px solid #efd291; border-radius: 4px; padding: 2px 7px; font-weight: 700; margin-bottom: 10px;
}
.src-text { font-size: 13.5px; line-height: 1.75; color: #3f5062; margin: 0; }
.src-text :deep(.hl) {
  background: #fff2c6; color: #8a6000; padding: 1px 3px; border-radius: 3px;
  box-shadow: inset 0 -2px 0 #d0ab68; font-weight: 600;
}
.m02-source-foot { margin-top: 12px; font-size: 12px; color: #8a99a8; }

.m02-list-card { background: #fff; }

/* 新建抽取任务弹窗 */
.m02-create-form :deep(.el-form-item__label) {
  text-align: left;
  justify-content: flex-start;
  white-space: nowrap;
}
.m02-opt-meta {
  float: right;
  margin-left: 12px;
  color: #8a99a8;
  font-size: 12px;
}
.m02-create-domains {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  width: 100%;
}
.m02-create-hint {
  margin-top: 8px;
  font-size: 12px;
  color: #8a99a8;
  line-height: 1.5;
}
.m02-count-box {
  display: flex;
  align-items: baseline;
  gap: 6px;
  width: 100%;
  min-height: 36px;
  padding: 6px 12px;
  background: #f4f8fc;
  border: 1px solid #e0eaf3;
  border-radius: 8px;
}
.m02-count-num {
  font-size: 22px;
  font-weight: 700;
  color: #c8902a;
  line-height: 1;
}
.m02-count-unit { font-size: 13px; color: #6d8092; }
.m02-count-tip { margin-left: 8px; font-size: 12px; color: #8a99a8; }

@media (max-width: 1200px) {
  .m02-result-layout.split { grid-template-columns: 1fr; }
  .m02-title { max-width: 40%; }
}
</style>

<style>
.m02-trace-dialog .el-dialog__body { padding-top: 4px; padding-bottom: 8px; }
.m02-trace-dialog .el-dialog__footer {
  border-top: 1px solid #e8edf3;
  padding-top: 14px;
}
</style>
