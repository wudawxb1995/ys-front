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
        <el-button type="primary" class="m02-submit" @click="toast('已提交审核，进入人工核验队列')">提交审核</el-button>
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

      <!-- 性能域筛选 + 统计 -->
      <div class="m02-dash">
        <h3 class="m02-dash-title"><i></i>性能域筛选</h3>
        <div class="m02-domain-row">
          <button
            v-for="d in domains"
            :key="d"
            type="button"
            class="m02-domain-tag"
            :class="{ on: activeDomains.has(d) }"
            @click="toggleDomain(d)"
          >{{ d }}</button>
          <span class="m02-domain-split" aria-hidden="true" />
          <button type="button" class="m02-act-btn primary" @click="activeDomains = new Set(domains)">全选</button>
          <button type="button" class="m02-act-btn ghost" @click="activeDomains = new Set()">清空</button>
        </div>
        <div class="m02-stat-row">
          <div class="m02-stat">
            <div class="m02-stat-n">{{ visibleRows.length }}</div>
            <div class="m02-stat-u">项指标</div>
          </div>
          <div class="m02-stat">
            <div class="m02-stat-n">{{ activeDomains.size }}</div>
            <div class="m02-stat-u">个性能域</div>
          </div>
          <div class="m02-stat">
            <div class="m02-stat-n gold">{{ pendingCount }}</div>
            <div class="m02-stat-u">项待人工审核</div>
          </div>
          <div class="m02-stat-legend">
            <span class="lab">置信度</span>
            <span class="lg b1" /><span>≥0.90</span>
            <span class="lg b2" /><span>0.80–0.90</span>
            <span class="lg b3" /><span>&lt;0.80</span>
          </div>
        </div>
      </div>

      <!-- 抽取结果 + 原文溯源 -->
      <div class="m02-result-layout" :class="{ split: !!selected }">
        <div class="m02-dash m02-table-panel">
          <h3 class="m02-dash-title">
            <i></i>抽取结果
            <span class="m02-hint">共 <b>{{ visibleRows.length }}</b> 项</span>
          </h3>
          <div class="m02-table-scroll">
            <table class="m02-table">
              <thead>
                <tr>
                  <th class="col-idx">序号</th>
                  <th>指标名称</th>
                  <th>指标值</th>
                  <th>单位</th>
                  <th>判据</th>
                  <th>所属性能域</th>
                  <th>置信度</th>
                  <th>状态</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(row, idx) in visibleRows"
                  :key="row.id"
                  :class="{ 'm02-gold-row': row.conf < 0.80, selected: selected?.id === row.id }"
                  @click="openSource(row)"
                >
                  <td class="col-idx muted">{{ idx + 1 }}</td>
                  <td class="name">{{ row.name }}</td>
                  <td class="mono">{{ row.value }}</td>
                  <td class="nowrap muted2">{{ row.unit }}</td>
                  <td class="ellipsis" :title="row.criteria">{{ row.criteria }}</td>
                  <td class="center"><span class="m02-domain-pill">{{ row.domain }}</span></td>
                  <td>
                    <div class="conf">
                      <div class="conf-bar"><div :style="{ width: (row.conf * 100).toFixed(0) + '%', background: confColor(row.conf) }" /></div>
                      <span :style="{ color: confText(row.conf) }">{{ (row.conf * 100).toFixed(0) }}%</span>
                    </div>
                  </td>
                  <td class="center">
                    <span class="badge" :class="row.status === '已确认' ? 'on' : row.status === '待审核' ? 'warn' : 'hold'"><i></i>{{ row.status }}</span>
                  </td>
                </tr>
                <tr v-if="!visibleRows.length" class="empty-row">
                  <td colspan="8" class="empty">当前性能域筛选下无数据</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <aside v-if="selected" class="m02-dash m02-source-panel">
          <h3 class="m02-dash-title">
            <i></i>原文溯源
            <button type="button" class="m02-close" @click="selected = null">×</button>
          </h3>
          <div class="m02-source-sub">{{ selected.srcDoc }} · 第 {{ selected.srcPage }} 页</div>
          <div class="m02-source-ind">
            <div class="ind-name">{{ selected.name }}</div>
            <div class="ind-val">{{ selected.value }}{{ selected.unit ? ' ' + selected.unit : '' }}</div>
          </div>
          <div class="m02-source-body">
            <div class="page-tag">第 {{ selected.srcPage }} 页</div>
            <p class="src-text" v-html="highlightedHtml" />
          </div>
          <div class="m02-source-foot">点击表格其他行可切换溯源位置 · 高亮句为抽取依据</div>
        </aside>
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
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useUi } from '@/composables/ui'
import { useRows } from '@/composables/tables'
import { useDemoStore } from '@/composables/demo-store'
import { m02Domains, getM02RowsForDoc, getM02CountForDoc } from '@/data/m02-indicators'

defineProps({ page: Object, title: String })
const { toast } = useUi()
const demoStore = useDemoStore()

const resources = useRows('resources')
const filterDoc = ref('')
const detail = ref(null)
const selected = ref(null)
const domains = m02Domains
const activeDomains = ref(new Set(domains))

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

const detailRows = computed(() => {
  if (!detail.value) return []
  const rows = getM02RowsForDoc(detail.value.doc || detail.value.name)
  const domainSet = detail.value.domains?.length ? new Set(detail.value.domains) : null
  if (!domainSet) return rows
  return rows.filter((r) => domainSet.has(r.domain))
})
const visibleRows = computed(() => detailRows.value.filter((r) => activeDomains.value.has(r.domain)))
const pendingCount = computed(() => visibleRows.value.filter((r) => r.status === '待审核').length)

const highlightedHtml = computed(() => {
  if (!selected.value?.srcText) return ''
  const phrase = selected.value.highlight || ''
  const escaped = selected.value.srcText
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/\n/g, '<br/>')
  if (!phrase) return escaped
  const safe = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return escaped.replace(new RegExp(safe, 'g'), `<mark class="hl">${phrase}</mark>`)
})

function confColor(c) {
  return c >= 0.90 ? '#1668a8' : c >= 0.80 ? '#a8c8e8' : '#d0ab68'
}
function confText(c) {
  return c >= 0.90 ? '#1668a8' : c >= 0.80 ? '#4a7fa8' : '#c8902a'
}
function toggleDomain(d) {
  const s = new Set(activeDomains.value)
  s.has(d) ? s.delete(d) : s.add(d)
  activeDomains.value = s
}
function openDetail(task) {
  detail.value = task
  selected.value = null
  const ds = task.domains?.length ? task.domains : domains
  activeDomains.value = new Set(ds)
  demoStore.lastM02Task = task.doc || task.name
}
function closeDetail() {
  detail.value = null
  selected.value = null
}
function openSource(row) {
  selected.value = row
  demoStore.lastM02IndicatorId = row.id
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
.m02-submit { margin-left: auto; height: 32px; }

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
