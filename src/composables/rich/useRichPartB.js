/**
 * Rich 页演示镜头（m14 / m15 / m19 / m22 / m29–m32）
 */
import { computed, nextTick, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { useDemoStore, confirmRootCause, archiveInterpretReport, updateActiveProbeCount, syncTrialDataDock, setGraphBrowse, getPersistedM03List } from '@/composables/demo-store'
import { getM02RowsForDoc } from '@/data/m02-indicators'
import { insightMineItems } from '@/data/insightMine'
import { deviationTotal } from '@/data/deviations'
import { nowText } from '@/utils/format'
import {
  judgeInnovations, techTree as judgeTree,
  judgeTemplates, judgeReportSections, judgeBasisReports,
  innovBarData, trendLineData,
  trainTask, lossChartData, evalChartData, gpuChartData, memChartData,
  agentTemplates, resourceKpis as judgeResourceKpis, resGrowthData,
  probes, shots30, dockTasks as dockTasksSeed, causeChain, evidence, candidates,
} from '@/data/mock'
import * as echarts from 'echarts'

let pendingM22ReportId = null
let pendingM19EventId = null
let m19GenerationTimer = null

export function buildRichPartB({ toast, router, route, props, bag }) {
// ── M14 探针配置管理 ────────────────────────────────────────────────────

const probeDisplay = {
  P01: { bindParam: '立靶高低中间偏差', dataSrc: '弹道测量文件', sampleMode: '逐发触发', alarmLevel: '告警' },
  P02: { bindParam: '炮口初速', dataSrc: '弹道测量文件', sampleMode: '逐发触发', alarmLevel: '告警' },
  P03: { bindParam: '飞行姿态角', dataSrc: '弹道测量文件', sampleMode: '逐发触发', alarmLevel: '告警' },
  P04: { bindParam: '身管温度', dataSrc: '遥测数据流', sampleMode: '定时采集', alarmLevel: '提示' },
  P05: { bindParam: '定位定向温补', dataSrc: '遥测数据流', sampleMode: '定时采集', alarmLevel: '告警' },
  P06: { bindParam: '气象修正有效性', dataSrc: '气象保障数据', sampleMode: '逐发触发', alarmLevel: '提示' },
  P07: { bindParam: '遥测链路', dataSrc: '遥测数据流', sampleMode: '实时模式', alarmLevel: '提示' },
  P08: { bindParam: '方位定向', dataSrc: '遥测数据流', sampleMode: '逐发触发', alarmLevel: '告警' },
  P09: { bindParam: '时间同步', dataSrc: '遥测数据流', sampleMode: '逐发触发', alarmLevel: '提示' },
  P10: { bindParam: '惯导漂移', dataSrc: '遥测数据流', sampleMode: '逐发触发', alarmLevel: '告警' },
  P11: { bindParam: '弹载供电', dataSrc: '遥测数据流', sampleMode: '定时采集', alarmLevel: '提示' },
  P12: { bindParam: '弹道CEP', dataSrc: '弹道测量文件', sampleMode: '逐发触发', alarmLevel: '告警' },
}
const probeList = ref(probes.map((p) => ({
  ...p,
  ...(probeDisplay[p.id] || {}),
  treeVer: '指标树 V1.0',
  enabled: true,
  lastTrigger: '—',
})))
const m14Stats = computed(() => ({
  total: probeList.value.length,
  enabled: probeList.value.filter((p) => p.enabled).length,
  alarming: probeList.value.some((p) => p.id === 'P01' && p.enabled) ? 1 : 0,
  nodes: 822,
}))
const m14Detail = ref(null)   // null=列表页；Object=详情页
const m14PageNo = ref(1)
const m14PageSize = 10
const m14Search = ref('')
const m14Query = ref('')
/** 列表勾选 id */
const m14CheckedIds = ref([])
const m14CreateVisible = ref(false)
/** 新建/编辑探针配置页（三栏），替代弹窗 */
const m14Wizard = ref(false)
const m14TreeOpen = ref(false)
/** null=新建；探针 id=编辑配置 */
const m14EditingId = ref(null)
const m14CreateForm = reactive({
  name: '',
  obj: '',
  criteria: '',
  srcNode: '散布精度指标',
  metrics: 1,
  dataSrc: '弹道测量文件',
  bindParam: '',
  treeVer: '',
  indicatorId: '',
  sampleMode: '逐发触发',
  alarmLevel: '告警',
  autoCause: true,
})
const m14SampleOpts = ['逐发触发', '定时采集', '连续采样']
const m14DataSrcOpts = ['弹道测量文件', '遥测数据流', '气象保障数据']
const m14AlarmOpts = ['提示', '告警', '严重']
const m14DialogTitle = computed(() => (m14EditingId.value ? '编辑探针配置' : '新建探针'))
const m14TreeOptions = computed(() => {
  const list = getPersistedM03List()
  const published = list.filter((row) => row.status === '已发布')
  return (published.length ? published : list).map((row) => ({
    value: row.version,
    label: `${row.version} · ${row.count} 项`,
    count: Number(row.count) || 44,
    srcDoc: row.srcDoc || '',
  }))
})
const m14TreeIndicators = computed(() => {
  const ver = m14CreateForm.treeVer
  if (!ver) return []
  const tree = m14TreeOptions.value.find((row) => row.value === ver)
  const rows = getM02RowsForDoc(tree?.srcDoc || '某型装备研制总要求')
  const n = tree?.count && tree.count < rows.length ? tree.count : rows.length
  return rows.slice(0, n)
})
const m14PickedIndicator = computed(() => m14TreeIndicators.value.find((row) => row.id === m14CreateForm.indicatorId) || null)

const m14SrcNodeOpts = [
  '散布精度指标', '初速指标', '姿态稳定性', '热变形指标',
  '温补系数', '气象修正', '信号完整性', '定向精度',
  '时间同步', '惯导误差', '供电指标', '弹道偏差',
]
const m14ObjOpts = [
  '立靶偏差', '炮口初速', '飞行姿态角', '身管温度',
  '定位定向温补', '气象修正有效性', '遥测链路', '方位定向',
  '时间同步', '惯导漂移', '弹载供电', '弹道CEP',
]

const m14FilteredList = computed(() => {
  const q = m14Query.value.trim()
  if (!q) return probeList.value
  return probeList.value.filter((p) =>
    p.name.includes(q) || p.obj.includes(q) || p.id.includes(q)
  )
})

function applyM14Search() {
  m14Query.value = m14Search.value
  m14PageNo.value = 1
  // 筛选变化后清理不在结果内的勾选
  const keep = new Set(m14FilteredList.value.map((p) => p.id))
  m14CheckedIds.value = m14CheckedIds.value.filter((id) => keep.has(id))
}

function syncActiveProbeCount() {
  const count = probeList.value.filter((p) => p.enabled).length
  updateActiveProbeCount(count)
  return count
}
function toggleProbe(p) {
  p.enabled = !p.enabled
  const count = syncActiveProbeCount()
  toast(p.enabled ? `已启用：${p.name}（在用 ${count}）` : `已停用：${p.name}（在用 ${count}）`)
}

function m14IsChecked(id) {
  return m14CheckedIds.value.includes(id)
}
function m14ToggleOne(id, on) {
  const set = new Set(m14CheckedIds.value)
  if (on) set.add(id)
  else set.delete(id)
  m14CheckedIds.value = [...set]
}
function m14PageIds() {
  const start = (m14PageNo.value - 1) * m14PageSize
  return m14FilteredList.value.slice(start, start + m14PageSize).map((p) => p.id)
}
function m14AllPageChecked() {
  const ids = m14PageIds()
  return ids.length > 0 && ids.every((id) => m14CheckedIds.value.includes(id))
}
function m14SomePageChecked() {
  const ids = m14PageIds()
  const n = ids.filter((id) => m14CheckedIds.value.includes(id)).length
  return n > 0 && n < ids.length
}
function m14ToggleAllPage(on) {
  const pageIds = m14PageIds()
  const set = new Set(m14CheckedIds.value)
  if (on) pageIds.forEach((id) => set.add(id))
  else pageIds.forEach((id) => set.delete(id))
  m14CheckedIds.value = [...set]
}

function enableSelectedProbes() {
  if (!m14CheckedIds.value.length) {
    toast('请先勾选要启用的探针', 'warning')
    return
  }
  const set = new Set(m14CheckedIds.value)
  let n = 0
  probeList.value.forEach((p) => {
    if (set.has(p.id) && !p.enabled) {
      p.enabled = true
      n += 1
    }
  })
  const count = syncActiveProbeCount()
  toast(n ? `已批量启用 ${n} 个探针（在用 ${count}）` : `所选探针均已启用（在用 ${count}）`)
}
function disableSelectedProbes() {
  if (!m14CheckedIds.value.length) {
    toast('请先勾选要停用的探针', 'warning')
    return
  }
  const set = new Set(m14CheckedIds.value)
  let n = 0
  probeList.value.forEach((p) => {
    if (set.has(p.id) && p.enabled) {
      p.enabled = false
      n += 1
    }
  })
  const count = syncActiveProbeCount()
  toast(n ? `已批量停用 ${n} 个探针（在用 ${count}）` : `所选探针均已停用（在用 ${count}）`)
}

/** @deprecated 保留别名，避免旧引用报错 */
function enableAllProbes() {
  enableSelectedProbes()
}

function fillProbeForm(p) {
  m14CreateForm.name = p?.name || ''
  m14CreateForm.obj = p?.obj || ''
  m14CreateForm.criteria = p?.criteria || ''
  m14CreateForm.srcNode = p?.srcNode || ''
  m14CreateForm.metrics = Number(p?.metrics) || 1
  m14CreateForm.dataSrc = p?.dataSrc || '弹道测量文件'
  m14CreateForm.bindParam = p?.bindParam || ''
  m14CreateForm.treeVer = p?.treeVer || ''
  m14CreateForm.indicatorId = p?.indicatorId || ''
  m14CreateForm.sampleMode = p?.sampleMode || '逐发触发'
  m14CreateForm.alarmLevel = p?.alarmLevel || '告警'
  m14CreateForm.autoCause = p?.autoCause !== false
  m14TreeOpen.value = !!(p?.treeVer || p?.indicatorId)
}

function m14PickTree(ver) {
  m14CreateForm.treeVer = ver
  m14CreateForm.indicatorId = ''
  m14CreateForm.criteria = ''
  m14CreateForm.bindParam = ''
  m14CreateForm.obj = ''
}

function m14PickIndicator(id) {
  m14CreateForm.indicatorId = id
  const row = m14TreeIndicators.value.find((item) => item.id === id)
  if (!row) return
  m14CreateForm.bindParam = row.name
  m14CreateForm.criteria = row.criteria
  m14CreateForm.obj = row.name
  m14CreateForm.srcNode = row.klass
  if (!m14CreateForm.name.trim()) m14CreateForm.name = `${row.name}探针`
}

function openCreateProbe() {
  m14EditingId.value = null
  m14Detail.value = null
  fillProbeForm(null)
  m14CreateForm.metrics = 1
  m14CreateForm.dataSrc = '弹道测量文件'
  m14CreateForm.sampleMode = '逐发触发'
  m14CreateForm.alarmLevel = '告警'
  m14CreateForm.autoCause = true
  m14TreeOpen.value = false
  m14Wizard.value = true
}

/** 列表「配置」：打开与新建相同弹窗，编辑该探针 */
function openEditProbe(p) {
  if (!p) return
  m14EditingId.value = p.id
  m14Detail.value = null
  fillProbeForm(p)
  if (!m14CreateForm.treeVer) {
    const published = m14TreeOptions.value[0]
    m14CreateForm.treeVer = published?.value || '指标树 V1.0'
  }
  if (!m14CreateForm.indicatorId && m14CreateForm.bindParam) {
    const hit = m14TreeIndicators.value.find((row) => row.name === m14CreateForm.bindParam || row.name === m14CreateForm.obj)
    if (hit) m14CreateForm.indicatorId = hit.id
  }
  m14TreeOpen.value = true
  m14Wizard.value = true
}

function closeProbeWizard() {
  m14Wizard.value = false
  m14EditingId.value = null
}

function todayStr() {
  const today = new Date()
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
}

function submitCreateProbe() {
  const name = m14CreateForm.name.trim()
  const criteria = m14CreateForm.criteria.trim()
  if (!name) { toast('请填写探针名称', 'warning'); return }
  if (!m14CreateForm.treeVer) { toast('请先选择指标树', 'warning'); return }
  if (!m14CreateForm.indicatorId) { toast('请选择指标树下的指标', 'warning'); return }
  if (!criteria) { toast('请选择指标以生成判据', 'warning'); return }

  const editingId = m14EditingId.value
  if (probeList.value.some((p) => p.name === name && p.id !== editingId)) {
    toast('探针名称已存在', 'warning')
    return
  }

  const obj = (m14CreateForm.obj || m14CreateForm.bindParam || '').trim()
  const patch = {
    name,
    obj,
    criteria,
    srcNode: m14CreateForm.srcNode || '散布精度指标',
    metrics: 1,
    bindParam: m14CreateForm.bindParam.trim() || obj,
    dataSrc: m14CreateForm.dataSrc || '弹道测量文件',
    treeVer: m14CreateForm.treeVer,
    indicatorId: m14CreateForm.indicatorId,
    sampleMode: m14CreateForm.sampleMode || '逐发触发',
    alarmLevel: m14CreateForm.alarmLevel || '告警',
    autoCause: m14CreateForm.autoCause !== false,
    updated: todayStr(),
  }

  if (editingId) {
    const hit = probeList.value.find((p) => p.id === editingId)
    if (!hit) {
      toast('探针不存在或已删除', 'error')
      return
    }
    Object.assign(hit, patch)
    if (m14Detail.value?.id === editingId) Object.assign(m14Detail.value, patch)
    m14Wizard.value = false
    m14CreateVisible.value = false
    m14EditingId.value = null
    toast(`已更新探针「${name}」配置`, 'success')
    return
  }

  const maxNum = probeList.value.reduce((m, p) => {
    const n = Number(String(p.id || '').replace(/\D/g, ''))
    return Number.isFinite(n) ? Math.max(m, n) : m
  }, 0)
  const row = {
    id: `P${String(maxNum + 1).padStart(2, '0')}`,
    ...patch,
    lastTrigger: '—',
    enabled: true,
  }
  probeList.value = [row, ...probeList.value]
  m14Wizard.value = false
  m14CreateVisible.value = false
  m14PageNo.value = 1
  syncActiveProbeCount()
  toast(`已保存探针「${name}」，已加入探针列表`, 'success')
}
function previewProbeCite(node) {
  toast(`预览：${node || '指标项'} → 试验大纲第3章相关条款（录屏示意）`)
}

// ── M15 数据对接与融合监测 ──────────────────────────────────────────────
const m15Detail    = ref(null)  // null=列表页；Object=融合监测视图
const scanCol      = ref(-1)    // -1=未开始；0~5=当前扫描列；6=完成
const alertVisible = ref(false)
const m15FilterBatch  = ref('')
const m15FilterStatus = ref('')
let scanTimer = null

// echarts 初速时序曲线
const v0ChartEl = ref(null)
let v0Chart = null

function initV0Chart() {
  if (!v0ChartEl.value) return
  if (v0Chart) { v0Chart.dispose(); v0Chart = null }
  v0Chart = echarts.init(v0ChartEl.value)
  const xData = shots30.map(s => s.id)
  const yData = shots30.map((s) => ({
    value: s.v0,
    itemStyle: s.anomaly
      ? {
          color: '#fff',
          borderColor: '#d4380d',
          borderWidth: 2.5,
          shadowBlur: 6,
          shadowColor: 'rgba(212,56,13,.28)',
        }
      : { color: '#1668a8' },
    symbolSize: s.anomaly ? 12 : 4,
  }))
  v0Chart.setOption({
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross', lineStyle: { color: '#1668a8', width: 1 } },
      formatter: (params) => {
        const p = params[0]
        const shot = shots30[p.dataIndex]
        const color = shot.anomaly ? '#d4380d' : '#1668a8'
        return `<div style="font-size:13px">
          <b style="color:${color}">第 ${shot.id} 发</b>${shot.anomaly ? ' · 异常' : ''}<br/>
          初速：<b style="color:${color}">${shot.v0} m/s</b><br/>
          高低偏：${shot.dH > 0 ? '+' : ''}${shot.dH} m<br/>
          方向偏：${shot.dL > 0 ? '+' : ''}${shot.dL} m<br/>
          身管温度：${shot.barrelTemp ?? '—'} ℃
        </div>`
      },
    },
    grid: { top: 36, right: 60, bottom: 36, left: 52 },
    xAxis: {
      type: 'category', data: xData,
      name: '发次', nameLocation: 'end', nameGap: 8,
      nameTextStyle: { color: '#8a99a8', fontSize: 12 },
      axisLine: { lineStyle: { color: '#dce8f2' } },
      axisTick: { show: false },
      axisLabel: { color: '#8a99a8', fontSize: 12,
        interval: (i) => [0,5,10,15,18,20,25,29].includes(i),
        formatter: (v) => v,
      },
      splitLine: { show: false },
    },
    yAxis: {
      type: 'value', min: 815, max: 830,
      name: 'm/s', nameLocation: 'end', nameGap: 8,
      nameTextStyle: { color: '#8a99a8', fontSize: 12 },
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#8a99a8', fontSize: 12 },
      splitLine: { lineStyle: { color: '#eef3f8' } },
    },
    series: [{
      type: 'line', data: yData, smooth: 0.15,
      lineStyle: { color: '#1668a8', width: 2 },
      symbol: 'circle',
      areaStyle: {
        color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(22,104,168,.12)' }, { offset: 1, color: 'rgba(22,104,168,0)' }] },
      },
      markLine: {
        silent: true,
        lineStyle: { color: '#d4380d', type: 'dashed', width: 1.2, opacity: 0.7 },
        data: [
          { yAxis: 820, label: { formatter: '下限 820', color: '#d4380d', fontSize: 11 } },
          { yAxis: 822.1, label: { formatter: '均值', color: '#8a99a8', fontSize: 10 }, lineStyle: { color: '#8a99a8', type: 'dotted', opacity: 0.8 } },
        ],
      },
      markArea: {
        silent: true,
        itemStyle: { color: 'rgba(212,56,13,.045)' },
        data: [[{ xAxis: '18' }, { xAxis: '20' }]],
      },
    }],
  })
}

function startScan() {
  if (scanCol.value >= 0) return
  scanCol.value = 0
  const maxCol = m15ViewKind.value === 'ballistic' ? 6 : 4
  scanTimer = setInterval(() => {
    scanCol.value++
    if (scanCol.value >= maxCol) {
      clearInterval(scanTimer)
      scanTimer = null
      alertVisible.value = true
    }
  }, 700)
}

/** 对接任务详情类型：精度弹道 / 气象 / 标定 */
const m15ViewKind = computed(() => {
  const t = m15Detail.value
  if (!t) return 'ballistic'
  if (t.id === 'T02' || /气象/.test(t.name || '') || /气象/.test(t.srcType || '')) return 'weather'
  if (t.id === 'T03' || /标定/.test(t.name || '') || /标定/.test(t.srcType || '')) return 'calib'
  return 'ballistic'
})

const m15DetailMeta = computed(() => {
  const t = m15Detail.value || {}
  const kind = m15ViewKind.value
  if (kind === 'weather') {
    return {
      summary: `${t.count || '30组'} · ${String(t.time || '').slice(0, 10) || '2024-10-18'} · 全部合格`,
      scanLabel: '启动气象校核',
      scanDone: '校核完成',
      scanRun: '校核中…',
      alertTitle: '提示 · 气象窗口校核通过',
      alertBody: '温湿度、风速均在试验窗口内，可支撑精度试验数据融合。',
      alertSub: '校核时间：08:00:12　建议：继续执行弹道数据对接任务',
      showRootCause: false,
    }
  }
  if (kind === 'calib') {
    return {
      summary: `${t.count || '12项'} · ${String(t.time || '').slice(0, 10) || '2024-10-17'} · 1项关注`,
      scanLabel: '启动标定复核',
      scanDone: '复核完成',
      scanRun: '复核中…',
      alertTitle: '关注 · 温补系数偏差偏大',
      alertBody: '温补系数相对出厂值偏差 4.8%，仍在容差 5% 内，建议记录并跟踪。',
      alertSub: '复核时间：16:20:33　建议：归档标定报告，供根因分析引用',
      showRootCause: false,
    }
  }
  return {
    summary: '30发 · 2024-10-18 · 异常1发',
    scanLabel: '启动智能检测',
    scanDone: '检测完成',
    scanRun: '检测中…',
    alertTitle: '告警 · 第 19 发 · 立靶高低中间偏差超限',
    alertBody: '探针：弹着点散布探针 P01　检测值：+0.42 m（判据：≤0.30 m）',
    alertSub: '触发时间：11:22:07　建议：标记为异常，进入根因分析流程',
    showRootCause: true,
  }
})

/** 气象 30 组（T02） */
const weather30 = Array.from({ length: 30 }, (_, i) => {
  const n = i + 1
  const temp = +(18.2 + Math.sin(n * 0.35) * 1.6 + (n % 5) * 0.08).toFixed(1)
  const humidity = Math.round(42 + Math.cos(n * 0.28) * 6 + (n % 3))
  const wind = +(2.1 + Math.sin(n * 0.5) * 0.8 + (n % 4) * 0.1).toFixed(1)
  const pressure = +(1012 + Math.sin(n * 0.2) * 1.2).toFixed(1)
  return {
    id: n,
    ts: `07:${String(40 + Math.floor(n / 2)).padStart(2, '0')}:${String((n * 7) % 60).padStart(2, '0')}`,
    temp,
    humidity,
    wind,
    pressure,
    anomaly: false,
  }
})

/** 标定台 12 项（T03） */
const calib12 = [
  { id: 1, name: '温补系数 K0', value: '1.024', unit: '—', criterion: '1.000±0.050', result: '合格', watch: false },
  { id: 2, name: '温补系数 K1', value: '0.048', unit: '1/℃', criterion: '≤0.050', result: '关注', watch: true },
  { id: 3, name: '零位偏置', value: '0.12', unit: 'mil', criterion: '≤0.20', result: '合格', watch: false },
  { id: 4, name: '标度因数', value: '0.998', unit: '—', criterion: '0.995~1.005', result: '合格', watch: false },
  { id: 5, name: '横滚安装角', value: '0.08', unit: '°', criterion: '≤0.15', result: '合格', watch: false },
  { id: 6, name: '俯仰安装角', value: '0.06', unit: '°', criterion: '≤0.15', result: '合格', watch: false },
  { id: 7, name: '陀螺漂移', value: '0.32', unit: '°/h', criterion: '≤0.50', result: '合格', watch: false },
  { id: 8, name: '加速度计偏置', value: '0.8', unit: 'mg', criterion: '≤1.5', result: '合格', watch: false },
  { id: 9, name: '时间同步偏差', value: '6', unit: 'μs', criterion: '≤10', result: '合格', watch: false },
  { id: 10, name: '电源纹波', value: '28', unit: 'mV', criterion: '≤50', result: '合格', watch: false },
  { id: 11, name: '通信误码率', value: '0', unit: '—', criterion: '=0', result: '合格', watch: false },
  { id: 12, name: '自检总项', value: '12/12', unit: '项', criterion: '全部完成', result: '合格', watch: false },
]

function initWeatherChart() {
  if (!v0ChartEl.value) return
  if (v0Chart) { v0Chart.dispose(); v0Chart = null }
  v0Chart = echarts.init(v0ChartEl.value)
  v0Chart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['气温℃', '风速m/s'], top: 4, textStyle: { color: '#8a99a8', fontSize: 11 } },
    grid: { top: 36, right: 48, bottom: 36, left: 44 },
    xAxis: {
      type: 'category',
      data: weather30.map((r) => r.id),
      name: '组次',
      nameTextStyle: { color: '#8a99a8', fontSize: 11 },
      axisLabel: { color: '#8a99a8', fontSize: 11, interval: 4 },
      axisLine: { lineStyle: { color: '#dce8f2' } },
      axisTick: { show: false },
    },
    yAxis: [
      {
        type: 'value', name: '℃', min: 15, max: 22,
        nameTextStyle: { color: '#8a99a8', fontSize: 11 },
        axisLabel: { color: '#8a99a8', fontSize: 11 },
        splitLine: { lineStyle: { color: '#eef3f8' } },
        axisLine: { show: false }, axisTick: { show: false },
      },
      {
        type: 'value', name: 'm/s', min: 0, max: 5,
        nameTextStyle: { color: '#8a99a8', fontSize: 11 },
        axisLabel: { color: '#8a99a8', fontSize: 11 },
        splitLine: { show: false },
        axisLine: { show: false }, axisTick: { show: false },
      },
    ],
    series: [
      {
        name: '气温℃', type: 'line', data: weather30.map((r) => r.temp), smooth: true,
        lineStyle: { color: '#1668a8', width: 2 }, symbol: 'circle', symbolSize: 4, itemStyle: { color: '#1668a8' },
        areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(22,104,168,.14)' }, { offset: 1, color: 'rgba(22,104,168,0)' }] } },
      },
      {
        name: '风速m/s', type: 'line', yAxisIndex: 1, data: weather30.map((r) => r.wind), smooth: true,
        lineStyle: { color: '#22913c', width: 2 }, symbol: 'none', itemStyle: { color: '#22913c' },
      },
    ],
  })
}

function initCalibChart() {
  if (!v0ChartEl.value) return
  if (v0Chart) { v0Chart.dispose(); v0Chart = null }
  v0Chart = echarts.init(v0ChartEl.value)
  const rows = calib12.filter((r) => r.unit !== '项' && r.name !== '自检总项').slice(0, 8)
  v0Chart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { top: 28, right: 16, bottom: 52, left: 48 },
    xAxis: {
      type: 'category',
      data: rows.map((r) => r.name.replace(/系数|偏置|安装角/, '')),
      axisLabel: { color: '#8a99a8', fontSize: 10, rotate: 28, interval: 0 },
      axisLine: { lineStyle: { color: '#dce8f2' } },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value', name: '相对达标度', max: 100, min: 60,
      nameTextStyle: { color: '#8a99a8', fontSize: 11 },
      axisLabel: { color: '#8a99a8', fontSize: 11, formatter: '{value}%' },
      splitLine: { lineStyle: { color: '#eef3f8' } },
      axisLine: { show: false }, axisTick: { show: false },
    },
    series: [{
      type: 'bar',
      barWidth: 18,
      data: rows.map((r) => ({
        value: r.watch ? 82 : 90 + (r.id % 7),
        itemStyle: {
          color: r.watch
            ? { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#e8b84a' }, { offset: 1, color: '#d0ab68' }] }
            : { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#5aa6de' }, { offset: 1, color: '#1668a8' }] },
          borderRadius: [3, 3, 0, 0],
        },
      })),
    }],
  })
}

function initM15Chart() {
  const kind = m15ViewKind.value
  if (kind === 'weather') initWeatherChart()
  else if (kind === 'calib') initCalibChart()
  else initV0Chart()
}

function m15Open(task) {
  m15Detail.value = task
  scanCol.value = -1
  alertVisible.value = false
  nextTick(() => {
    initM15Chart()
    requestAnimationFrame(() => initM15Chart())
  })
}

/** 对接任务列表（可新建） */
const dockTasks = ref(dockTasksSeed.map((t) => ({ ...t })))
const m15CreateVisible = ref(false)
const m15CreateForm = reactive({
  name: '精度试验数据对接 (30发)',
  treeVer: '',
  indicatorId: '',
  sources: [],
  count: '30发',
})
const m15SourceOpts = [
  '弹道测量文件（光测+雷达）',
  '遥测数据流（定位定向/温度/链路）',
  '气象保障数据',
]
const m15SrcTypeOpts = [
  '弹道测量+遥测文件',
  '气象站接口',
  '标定台导出文件',
  '雷达测速文件',
  '惯导遥测流',
]

const m15FilteredTasks = computed(() => {
  let list = dockTasks.value
  if (m15FilterStatus.value) {
    list = list.filter((t) => t.status === m15FilterStatus.value)
  }
  if (m15FilterBatch.value) {
    // 演示：批次筛选主要用于 T01/新建任务（带 batch 字段）
    list = list.filter((t) => !t.batch || t.batch === m15FilterBatch.value || t.id === 'T01')
  }
  return list
})

const m15TreeOptions = computed(() => {
  const list = getPersistedM03List()
  const published = list.filter((row) => row.status === '已发布')
  return (published.length ? published : list).map((row) => ({
    value: row.version,
    label: `${row.version} · ${row.count}项指标`,
    count: Number(row.count) || 44,
    srcDoc: row.srcDoc || '',
  }))
})
const m15TreeIndicators = computed(() => {
  const ver = m15CreateForm.treeVer
  if (!ver) return []
  const tree = m15TreeOptions.value.find((row) => row.value === ver)
  const rows = getM02RowsForDoc(tree?.srcDoc || '某型装备研制总要求')
  const n = tree?.count && tree.count < rows.length ? tree.count : rows.length
  return rows.slice(0, n)
})

function m15PickTree() {
  m15CreateForm.indicatorId = ''
  m15CreateForm.sources = []
}

function m15PickIndicator() {
  m15CreateForm.sources = []
}

function openCreateDockTask() {
  m15CreateForm.name = '精度试验数据对接 (30发)'
  m15CreateForm.treeVer = ''
  m15CreateForm.indicatorId = ''
  m15CreateForm.sources = []
  m15CreateForm.count = '30发'
  m15CreateVisible.value = true
}

function m15TaskMeta(task) {
  const countText = String(task?.count || '')
  const matched = countText.match(/(\d+)/)
  const total = matched ? Number(matched[1]) : 0
  const unit = countText.replace(/^\d+/, '') || '发'
  const received = task?.received != null ? task.received : (task?.status === '成功' ? total : 0)
  const label = task?.status === '成功' ? '已完成' : (task?.status === '暂存' ? '暂存' : (task?.status || '进行中'))
  return { total, unit, received, label }
}

function startDockReturn(task) {
  if (!task) return
  task.status = '进行中'
  toast(`已启动回传：${task.name}`, 'success')
}

function submitCreateDockTask() {
  const name = (m15CreateForm.name || '').trim()
  const sources = (m15CreateForm.sources || []).filter(Boolean)
  const indicator = m15TreeIndicators.value.find((row) => row.id === m15CreateForm.indicatorId)
  if (!name) {
    toast('请填写任务名称', 'warning')
    return
  }
  if (!m15CreateForm.treeVer) {
    toast('请选择指标树', 'warning')
    return
  }
  if (!indicator) {
    toast('请选择指标', 'warning')
    return
  }
  if (!sources.length) {
    toast('请至少勾选一项数据源', 'warning')
    return
  }
  if (dockTasks.value.some((t) => t.name === name)) {
    toast('任务名称已存在', 'warning')
    return
  }
  const maxNum = dockTasks.value.reduce((m, t) => {
    const n = Number(String(t.id || '').replace(/\D/g, ''))
    return Number.isFinite(n) ? Math.max(m, n) : m
  }, 0)
  const id = `T${String(maxNum + 1).padStart(2, '0')}`
  const row = {
    id,
    name,
    srcType: sources.join(' + '),
    sources: [...sources],
    treeVer: m15CreateForm.treeVer,
    indicatorId: indicator.id,
    indicatorName: indicator.name,
    count: m15CreateForm.count || '30发',
    received: 0,
    batch: 'D-07',
    status: '暂存',
    time: nowText(),
  }
  dockTasks.value.unshift(row)
  m15CreateVisible.value = false
  toast('对接任务已创建', 'success')
}

// ── M19 根因分析工作台 ──────────────────────────────────────────────────
const m19Detail      = ref(null)
const m19GenerationStatus = ref('idle')
const focusShotId    = ref(19)
const m19ActiveNode  = ref('C6')
const focusEvidence  = ref(null)
const m19FilterName   = ref('')
const m19FilterProbe  = ref('')
const m19FilterStatus = ref('')

// ── demo-store 接入 ──────────────────────────────────────────────────────
const demoStore = useDemoStore()

// Part2 对接任务 T01 → Part3 素材「精度试验数据回传」基线
const dockT01 = dockTasks.value.find((t) => t.id === 'T01') || dockTasks.value[0]
if (dockT01) syncTrialDataDock(dockT01)

// m19：采纳根因 + 触发解读报告生成 → 写入 demo-store
function goRootCause() {
  pendingM19EventId = 'EVT-001'
  router.push({ name: 'app', params: { pid: 'probe', sid: 'probe-interpret', mid: 'cause-list' } })
}

function doM19ConfirmRootCause() {
  if (m19GenerationStatus.value !== 'idle') return
  m19GenerationStatus.value = 'generating'
  const top = candidates.find(c => c.rank === 1) || candidates[0]
  const evt = m19Detail.value || { id: 'EVT-001', name: '第19发超差事件' }
  confirmRootCause(top, evt)
  m19GenerationTimer = setTimeout(() => {
    m19GenerationStatus.value = 'complete'
    m19GenerationTimer = setTimeout(() => {
      pendingM22ReportId = 'RPT-001'
      router.push({ name: 'app', params: { pid: 'probe', sid: 'probe-interpret', mid: 'report-list' } })
      m19GenerationStatus.value = 'idle'
      m19GenerationTimer = null
    }, 1000)
  }, 1400)
}

function goProjectDup() {
  router.push({ name: 'app', params: { pid: 'insight', sid: 'judge', mid: 'dup' } })
}

// m22：归档解读报告 → 写入 demo-store
function doM22Archive(report) {
  if (!report) return
  archiveInterpretReport(report)
  report.statusLabel = '已归档·待试验后引用'
  report.statusClass = 'archive'
  toast('报告已归档，可在第三部分试验后阶段作为素材引用')
}

/** 解读报告导出 Word（与方案页 m08ExportWord 同路径：HTML → .doc 下载） */
function m22ExportWord(report) {
  const r = report || m22Detail.value
  if (!r) {
    toast('请先打开或选择一份报告', 'warning')
    return
  }
  const title = r.title || '解读报告'
  const candRows = (candidates || []).map((c) => {
    const verdict = c.rank === 1 ? '采纳' : c.rank === 2 ? '参考' : '排除'
    return `<tr><td>${c.rank}</td><td>${c.name}</td><td>${c.confidence}</td><td>${verdict}</td></tr>`
  }).join('')
  const evidRows = (evidence || []).map((e) =>
    `<tr><td>${e.id}</td><td>${e.text}</td><td>${e.source}</td></tr>`
  ).join('')

  const html = `<!DOCTYPE html><html xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><title>${title}</title>
<!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View></w:WordDocument></xml><![endif]-->
<style>
body{font-family:SimSun,宋体,serif;font-size:12pt;line-height:1.8;color:#222}
h1{font-size:18pt;text-align:center;color:#0d4e83}
h2{font-size:14pt;color:#0d4e83;margin-top:1.2em;border-bottom:1px solid #ccc;padding-bottom:4px}
table{border-collapse:collapse;width:100%;margin:8px 0 14px}
th,td{border:1px solid #999;padding:6px 10px;text-align:left;vertical-align:top}
th{background:#f3f8fd}
.meta{color:#555;margin:8px 0 16px}
.box{background:#f4f8fc;padding:10px 12px;margin:8px 0}
.warn{background:#fff8e6;border-left:4px solid #d0ab68;padding:10px 12px;margin:8px 0}
</style></head><body>
<h1>${title}</h1>
<p class="meta">关联事件：${r.event || '—'}　批次：${r.batch || '—'}　状态：${r.statusLabel || '—'}　时间：${r.time || '—'}</p>
<hr/>

<h2>1 事件概述</h2>
<table>
<tr><th>型号</th><td>某型精度武器系统</td><th>试验批次</th><td>${r.batch || 'D-07'}</td></tr>
<tr><th>试验时间</th><td>${r.time || '2024-10-18'}</td><th>试验场地</th><td>某综合试验场寒区</td></tr>
<tr><th>总发次</th><td>30 发</td><th>异常发次</th><td>第 19 发</td></tr>
<tr><th>触发探针</th><td colspan="3">弹着点散布探针 P01</td></tr>
</table>
<p>本报告汇集 D-07 批次逐发测量、探针告警、遥测记录和标定资料，分析对象为第 19 发异常。判据引用指标树 V1.0；根因结论仍需复测验证。</p>

<h2>2 异常特征</h2>
<p>第 19 发立靶高低中间偏差 <b>+0.42 m</b>，超出判据阈值 ≤0.30 m（超出 40%），触发立靶精度探针 P01 告警。前 18 发偏差均在 ±0.25 m 以内，第 19 发呈孤立突增，降低了批次性因素的优先级，但仍需复测核查。</p>
<p>同发次初速 818.3 m/s，低于 820 m/s 下限；飞行段 pitch 偏差 +0.38°，TH-03 温度在 T+4.2s 跳变 +2.1℃。这些信号时间接近，支持继续追查定位定向系统，但时间相关性不能单独证明根因。</p>
<p><b>探针告警记录：</b></p>
<ul>
<li>P01 立靶精度告警（2024-10-18 14:32:07）：高低中间偏差 +0.42 m，超出判据 ≤0.30 m，触发一级告警</li>
<li>P04 身管温度预警（2024-10-18 14:31:52）：TH-03 传感器温度跳变 +2.1℃，触发预警</li>
<li>P07 遥测信号（2024-10-18 14:32:10）：姿态角 pitch 偏移 +0.38°，超出阈值 ±0.25°</li>
</ul>

<h2>3 根因分析过程</h2>
<p>推理思维链：弹着点散布异常 → 立靶偏差超限 → 姿态角漂移 + 温度跳变 → 温补系数失效（置信度 0.86）。</p>
<p><b>候选根因置信度排序</b></p>
<table>
<thead><tr><th>排名</th><th>候选根因</th><th>置信度</th><th>结论</th></tr></thead>
<tbody>${candRows}</tbody>
</table>
<p>温补失效获得姿态异常、温度跳变和标定偏差支持；火控解算软件异常缺少对应故障记录。历史案例仅作类比，不作为本次故障的直接证据。</p>

<h2>4 结论与处置建议</h2>
<div class="box"><b>结论：</b>本批次试验中，第 19 发立靶高低中间偏差超出判据 ≤0.30 m。现有证据最支持定位定向系统温补系数失效（候选置信度 0.86），最终结论仍需复测验证。</div>
<div class="warn"><b>核心建议：</b>建议对定位定向系统执行温补校准后，复测第 19 发工况，以验证温补系数修正效果。</div>
<p><b>详细处置步骤：</b></p>
<ol>
<li>对该定位定向系统重新进行温补系数标定，参照出厂校准规程执行；</li>
<li>扩大 TH-03 传感器检测范围，在现有采样基础上增加温度梯度采样点（建议不少于 3 个）；</li>
<li>下批次试验前完成上述修正后，在相同工况下对第 19 发场景执行复测验证；</li>
<li>复测结果纳入 D-07 批次试验数据库，更新探针 P01 判据基线。</li>
</ol>
<p>完成温补系数复核与修正后，使用相同测量链路复测对应工况；核对立靶高低中间偏差是否回到 ≤0.30 m，并确认姿态与温度曲线恢复稳定。若仍异常，应重新评估候选根因排序。</p>

<h2>5 证据清单</h2>
<table>
<thead><tr><th>编号</th><th>证据内容</th><th>来源</th></tr></thead>
<tbody>${evidRows}</tbody>
</table>
</body></html>`

  const blob = new Blob(['\ufeff', html], { type: 'application/msword;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${title}.doc`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  toast('已导出 Word 文档', 'success')
}

// m19 三图 ECharts
const pitchChartEl   = ref(null)
const scatterChartEl = ref(null)
const tempChartEl    = ref(null)
let pitchChart = null, scatterChart = null, tempChart = null

function initM19Charts() {
  nextTick(() => {
    // ① 姿态角 pitch 时序（与 shots30.pitch 对齐）
    if (pitchChartEl.value) {
      pitchChart && pitchChart.dispose()
      pitchChart = echarts.init(pitchChartEl.value)
      const pitchData = shots30.map((s) => [s.id, s.pitch ?? +(Math.sin(s.id * 0.8) * 0.06 + 0.04).toFixed(3)])
      pitchChart.setOption({
        grid: { top: 28, right: 16, bottom: 28, left: 44 },
        tooltip: { trigger: 'axis', formatter: (p) => `第 ${p[0].data[0]} 发<br/>pitch偏差：<b>${p[0].data[1]}°</b>` },
        xAxis: { type: 'value', min: 1, max: 30, name: '发次', nameLocation: 'end', nameGap: 6,
          nameTextStyle: { color: '#8a99a8', fontSize: 11 }, axisLabel: { color: '#8a99a8', fontSize: 11 },
          axisLine: { lineStyle: { color: '#dce8f2' } }, axisTick: { show: false }, splitLine: { show: false } },
        yAxis: { type: 'value', name: '°', nameLocation: 'end', nameGap: 6,
          nameTextStyle: { color: '#8a99a8', fontSize: 11 }, axisLabel: { color: '#8a99a8', fontSize: 11 },
          axisLine: { show: false }, axisTick: { show: false }, splitLine: { lineStyle: { color: '#eef3f8' } } },
        series: [{
          type: 'line', data: pitchData, smooth: true,
          lineStyle: { color: '#1668a8', width: 1.8 },
          symbol: (val) => (val[1] > 0.2 ? 'circle' : 'none'),
          symbolSize: 8,
          itemStyle: { color: (p) => (p.data[1] > 0.2 ? '#d4380d' : '#1668a8') },
          areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(22,104,168,.1)' }, { offset: 1, color: 'rgba(22,104,168,0)' }] } },
          markLine: { silent: true, lineStyle: { color: '#d4380d', type: 'dashed', width: 1, opacity: .6 },
            data: [{ yAxis: 0.20, label: { formatter: '阈值0.20°', color: '#d4380d', fontSize: 10 } }] },
        }],
      })
    }
    // ② 身管温度 × 初速散点（真实相关轴）
    if (scatterChartEl.value) {
      scatterChart && scatterChart.dispose()
      scatterChart = echarts.init(scatterChartEl.value)
      const normalData = shots30.filter((s) => !s.anomaly).map((s) => [s.barrelTemp, s.v0, s.id])
      const anomalyData = shots30.filter((s) => s.anomaly).map((s) => [s.barrelTemp, s.v0, s.id])
      scatterChart.setOption({
        grid: { top: 28, right: 16, bottom: 36, left: 48 },
        tooltip: { trigger: 'item', formatter: (p) => `第 ${p.data[2]} 发<br/>身管温度：<b>${p.data[0]} ℃</b><br/>初速：<b>${p.data[1]} m/s</b>` },
        xAxis: { type: 'value', name: '身管温度 ℃', nameLocation: 'middle', nameGap: 22,
          nameTextStyle: { color: '#8a99a8', fontSize: 11 }, axisLabel: { color: '#8a99a8', fontSize: 11 },
          axisLine: { lineStyle: { color: '#dce8f2' } }, axisTick: { show: false }, splitLine: { show: false } },
        yAxis: { type: 'value', min: 815, max: 830, name: 'm/s', nameLocation: 'end', nameGap: 6,
          nameTextStyle: { color: '#8a99a8', fontSize: 11 }, axisLabel: { color: '#8a99a8', fontSize: 11 },
          axisLine: { show: false }, axisTick: { show: false }, splitLine: { lineStyle: { color: '#eef3f8' } } },
        series: [
          { name: '正常发次', type: 'scatter', data: normalData, symbolSize: 8,
            itemStyle: { color: '#1668a8', opacity: .72 },
            emphasis: { scale: 1.3 } },
          { name: '异常发次', type: 'effectScatter', data: anomalyData, symbolSize: 14,
            rippleEffect: { scale: 2.4, brushType: 'stroke' },
            itemStyle: { color: '#d4380d' } },
        ],
      })
    }
    // ③ 定位定向系统内部温度（跳变区间高亮）
    if (tempChartEl.value) {
      tempChart && tempChart.dispose()
      tempChart = echarts.init(tempChartEl.value)
      const tempData = [
        [0, 23.1], [1, 23.2], [2, 23.1], [3, 23.2], [4.0, 23.4], [4.2, 25.3], [4.5, 25.2], [5, 25.1], [6, 25.2], [7, 25.1], [8, 25.2], [9, 25.1],
      ]
      tempChart.setOption({
        grid: { top: 28, right: 16, bottom: 28, left: 44 },
        tooltip: { trigger: 'axis', formatter: (p) => `T+${p[0].data[0]}s<br/>温度：<b>${p[0].data[1]}℃</b>` },
        xAxis: { type: 'value', name: '秒', nameLocation: 'end', nameGap: 6,
          nameTextStyle: { color: '#8a99a8', fontSize: 11 }, axisLabel: { color: '#8a99a8', fontSize: 11 },
          axisLine: { lineStyle: { color: '#dce8f2' } }, axisTick: { show: false }, splitLine: { show: false } },
        yAxis: { type: 'value', min: 22, max: 27, name: '℃', nameLocation: 'end', nameGap: 6,
          nameTextStyle: { color: '#8a99a8', fontSize: 11 }, axisLabel: { color: '#8a99a8', fontSize: 11 },
          axisLine: { show: false }, axisTick: { show: false }, splitLine: { lineStyle: { color: '#eef3f8' } } },
        series: [{
          type: 'line', data: tempData, smooth: true,
          lineStyle: { color: '#1668a8', width: 2 },
          symbol: 'circle',
          symbolSize: (val) => (val[0] >= 4 && val[0] <= 5 ? 8 : 4),
          itemStyle: {
            color: (p) => (p.data?.[0] >= 4 && p.data?.[0] <= 5 ? '#d4380d' : '#1668a8'),
          },
          areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(22,104,168,.16)' }, { offset: 1, color: 'rgba(22,104,168,0)' }] } },
          markArea: {
            silent: true,
            itemStyle: { color: 'rgba(212,56,13,.08)' },
            data: [[{ xAxis: 4.0 }, { xAxis: 5.0 }]],
          },
        }],
      })
    }
  })
}

function resizeM19Charts() {
  pitchChart?.resize()
  scatterChart?.resize()
  tempChart?.resize()
}

watch(m19Detail, (val) => {
  if (val) {
    initM19Charts()
    nextTick(() => {
      resizeM19Charts()
      requestAnimationFrame(() => resizeM19Charts())
      setTimeout(() => resizeM19Charts(), 80)
    })
    return
  }
  if (pitchChart) { pitchChart.dispose(); pitchChart = null }
  if (scatterChart) { scatterChart.dispose(); scatterChart = null }
  if (tempChart) { tempChart.dispose(); tempChart = null }
})

if (typeof window !== 'undefined') {
  window.addEventListener('resize', resizeM19Charts)
}

const m19Events = [
  { id:'EVT-001', name:'第19发超差事件',  probe:'弹着点散布探针 P01', time:'2024-10-18', status:'已分析', statusClass:'on'  },
  { id:'EVT-002', name:'信号偶发丢包',    probe:'遥测信号探针 P07',   time:'2024-10-18', status:'已关闭', statusClass:'hold' },
  { id:'EVT-003', name:'温度传感器跳变',  probe:'身管温度探针 P04',   time:'2024-10-18', status:'分析中', statusClass:'warn' },
]
if (pendingM19EventId) {
  m19Detail.value = m19Events.find((item) => item.id === pendingM19EventId) || m19Events[0]
  pendingM19EventId = null
}

// ── M22 智能解读报告 ────────────────────────────────────────────────────
const m22Detail      = ref(null)
const activeSection  = ref(1)
const m22FilterName  = ref('')
const m22FilterStatus = ref('')

const m22Reports = ref([
  { id:'RPT-001', title:'第19发超差事件解读报告', event:'第19发超差事件', statusLabel:demoStore.reportArchived?.id === 'RPT-001' ? '已归档·待试验后引用' : '待归档', statusClass:demoStore.reportArchived?.id === 'RPT-001' ? 'archive' : 'run', batch:'D-07', time:'2024-10-18' },
  { id:'RPT-002', title:'D-06批次例行报告',        event:'D-06批次例行分析',  statusLabel:'草稿',               statusClass:'hold',    batch:'D-06', time:'2024-10-17' },
])
if (pendingM22ReportId) {
  m22Detail.value = m22Reports.value.find((r) => r.id === pendingM22ReportId) || m22Reports.value[0]
  pendingM22ReportId = null
}

const m22Sections = [
  { no:1, title:'事件概述' },
  { no:2, title:'异常特征' },
  { no:3, title:'根因分析过程' },
  { no:4, title:'结论与处置建议' },
  { no:5, title:'证据清单' },
]

// ── M29 创新点抽取结果 ──────────────────────────────────────────────────
const m29ExpandedId      = ref(null)
const m29FilterDirection = ref('')
const m29FilterSource    = ref('')
const m29AppliedDirection = ref('')
const m29AppliedSource    = ref('')
const m29DirectionOpts = ['全部方向', ...new Set(insightMineItems.map((item) => item.directionName))]

const m29Innovations = computed(() => insightMineItems.map((item) => ({
  id: item.id,
  name: item.title,
  source: `${item.evidence}篇`,
  sourceText: item.source,
  direction: item.directionName,
  confidence: (item.innov / 100).toFixed(2),
  q: item.problem,
  qRef: item.code,
  p: item.principle,
  pRef: item.stage,
  i: item.content,
  iRef: item.tag || item.stage,
  e: item.value,
  eRef: `${item.evidence}份资料`,
  summary: item.summary,
  quote: item.quote,
  code: item.code,
  heat: item.heat,
  stage: item.stage,
  tag: item.tag,
})))

function m29OpenView(row) {
  if (!row?.id) return
  router.push({
    name: 'app',
    params: { pid: route.params.pid || 'insight', sid: route.params.sid || 'innov', mid: 'mine' },
    query: { id: row.id },
  })
}

const m29Filtered = computed(() => m29Innovations.value.filter(inn => {
  if (m29AppliedDirection.value && m29AppliedDirection.value !== '全部方向' && inn.direction !== m29AppliedDirection.value) return false
  if (m29AppliedSource.value && !inn.source.includes(m29AppliedSource.value)) return false
  return true
}))

function m29ApplyFilter() {
  m29AppliedDirection.value = m29FilterDirection.value
  m29AppliedSource.value = m29FilterSource.value
  m29ExpandedId.value = null
}

function m29ResetFilter() {
  m29FilterDirection.value = ''
  m29FilterSource.value = ''
  m29AppliedDirection.value = ''
  m29AppliedSource.value = ''
  m29ExpandedId.value = null
}

// ── M30 技术体系知识图谱 ────────────────────────────────────────────────
const m30Tree        = judgeTree
const m30ExpandedDir = ref(demoStore.graphBrowseDirection || '定位定向技术')
const m30FocusSub    = ref(demoStore.graphBrowseSub || null)

watch(m30ExpandedDir, (name) => {
  if (name) setGraphBrowse(name, m30FocusSub.value || '')
})
watch(m30FocusSub, (sub) => {
  setGraphBrowse(m30ExpandedDir.value || demoStore.graphBrowseDirection, sub || '')
})

// ── M31 技术研判报告 ────────────────────────────────────────────────────
const m31Detail           = ref(null)
const m31SelectedTpl      = ref('TPL-01')
const activeReportSection = ref(1)
const m31FilterDirection  = ref('')
const m31Sections         = judgeReportSections

/** 研判对象可选；默认定位定向技术（图谱方向仅作推荐参考） */
const m31DirectionOpts = computed(() =>
  (judgeTree.children || []).map((d) => d.name),
)
const m31Direction = ref('定位定向技术')

/** 依据文书：合并上游归档标题 + 预置可选列表，避免写死单一报告 */
const m31BasisOpts = computed(() => {
  const opts = []
  const seen = new Set()
  const push = (id, name, kind = '', tag = '') => {
    const n = String(name || '').trim()
    if (!n || seen.has(n)) return
    seen.add(n)
    opts.push({ value: id || n, label: n, kind, tag })
  }
  const archivedInterpret = demoStore.reportArchived?.title
  if (archivedInterpret) {
    push('BASIS-ARCH-INTERPRET', archivedInterpret, '解读报告', '已归档')
  }
  const judgeIn = demoStore.judgeInputReportTitle
  if (judgeIn) {
    push('BASIS-ARCH-JUDGE', judgeIn, '试验报告', '上游带入')
  }
  for (const b of judgeBasisReports) {
    push(b.id, b.name, b.kind, b.tag)
  }
  return opts
})

function m31DefaultBasisId() {
  const opts = m31BasisOpts.value
  if (!opts.length) return ''
  if (demoStore.reportArchived?.title) {
    const hit = opts.find((o) => o.label === demoStore.reportArchived.title)
    if (hit) return hit.value
  }
  if (demoStore.judgeInputReportTitle) {
    const hit = opts.find((o) => o.label === demoStore.judgeInputReportTitle)
    if (hit) return hit.value
  }
  return opts[0].value
}

const m31BasisId = ref('')
watch(m31BasisOpts, (opts) => {
  if (!opts.length) {
    m31BasisId.value = ''
    return
  }
  if (!opts.some((o) => o.value === m31BasisId.value)) {
    m31BasisId.value = m31DefaultBasisId()
  }
}, { immediate: true })

const m31BasisTitle = computed(() =>
  m31BasisOpts.value.find((o) => o.value === m31BasisId.value)?.label
  || demoStore.judgeInputReportTitle
  || '试验报告V2',
)

const m31Object = computed(() => {
  const direction = m31Direction.value || '定位定向技术'
  const dirNode = judgeTree.children.find((d) => d.name === direction) || judgeTree.children[0]
  const inns = judgeInnovations.filter((i) => i.direction === direction)
  // 与创新点分布柱状图 / 技术体系树 innovCount 口径对齐
  const barIdx = innovBarData.xData.indexOf(direction)
  const innovCount = barIdx >= 0
    ? innovBarData.yData[barIdx]
    : (dirNode?.innovCount || Math.max(inns.length, dirNode?.children?.length || 0))
  const confMean = inns.length
    ? (inns.reduce((s, i) => s + (i.confidence || 0), 0) / inns.length).toFixed(2)
    : '0.80'
  const fromGraph = direction === (demoStore.graphBrowseDirection || '')
  return {
    direction,
    source: fromGraph ? '与图谱浏览一致' : '手动选择',
    innovCount,
    confMean,
    children: (dirNode?.children || []).map((c) => ({
      name: c.name,
      innovCount: c.innovCount || 0,
      highlight: !!c.highlight,
      badge: c.caseBadge || (c.highlight ? '本次试验沉淀' : ''),
    })),
    archiveTitle: m31BasisTitle.value,
    archiveAt: demoStore.judgeInputArchivedAt || demoStore.reportArchived?.archivedAt || '',
  }
})

/** 模板可选；当前对象为定位定向时推荐「技术发展方向研判」 */
const m31Templates = computed(() =>
  judgeTemplates.map((t) => ({
    ...t,
    recommended: t.id === 'TPL-01' && m31Direction.value === '定位定向技术',
  })),
)

const m31SelectedTplName = computed(() =>
  m31Templates.value.find((t) => t.id === m31SelectedTpl.value)?.name || '',
)

const m31Reports = computed(() =>
  Array.isArray(demoStore.judgeGeneratedReports) ? demoStore.judgeGeneratedReports : [],
)

const m31FilteredReports = computed(() => {
  const q = (m31FilterDirection.value || '').trim()
  const list = m31Reports.value
  if (!q) return list
  return list.filter((r) => r.title.includes(q) || r.direction.includes(q))
})

const innovBarEl    = ref(null)
const trendLineEl   = ref(null)
let innovBarChart   = null
let trendLineChart  = null

function initM31Charts() {
  nextTick(() => {
    if (innovBarEl.value) {
      if (innovBarChart) { innovBarChart.dispose(); innovBarChart = null }
      innovBarChart = echarts.init(innovBarEl.value)
      const eng = innovBarData.engineering || innovBarData.yData
      const basic = innovBarData.basic || innovBarData.yData.map(() => 0)
      innovBarChart.setOption({
        grid: { top: 36, right: 16, bottom: 48, left: 44 },
        legend: { top: 2, right: 4, textStyle: { fontSize: 11, color: '#7a8b9a' }, itemWidth: 10, itemHeight: 8 },
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
          formatter: (params) => {
            const i = params[0]?.dataIndex ?? 0
            const total = (eng[i] || 0) + (basic[i] || 0)
            const note = (innovBarData.notes && innovBarData.notes[i]) || ''
            const rows = params.map((p) => `${p.marker}${p.seriesName}：<b>${p.value}</b>`).join('<br/>')
            return `<div style="font-size:12px"><b>${innovBarData.xData[i]}</b>（合计 ${total}）<br/>${rows}${note ? `<br/><span style="color:#8a6000">${note}</span>` : ''}</div>`
          },
        },
        xAxis: {
          type: 'category', data: innovBarData.xData,
          axisLabel: { color: '#8a99a8', fontSize: 11, rotate: 20 },
          axisLine: { lineStyle: { color: '#dce8f2' } },
          axisTick: { show: false },
        },
        yAxis: {
          type: 'value', name: '数量',
          nameTextStyle: { color: '#8a99a8', fontSize: 11 },
          axisLabel: { color: '#8a99a8', fontSize: 11 },
          splitLine: { lineStyle: { color: '#eef3f8' } },
          axisLine: { show: false },
          axisTick: { show: false },
        },
        series: [
          {
            name: '工程化', type: 'bar', stack: 'inn', data: eng, barWidth: '52%',
            itemStyle: {
              color: (p) => (p.dataIndex === 0
                ? { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#e8c878' }, { offset: 1, color: '#d0ab68' }] }
                : { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#3a8fd4' }, { offset: 1, color: '#1668a8' }] }),
              borderRadius: [0, 0, 0, 0],
            },
          },
          {
            name: '基础研究', type: 'bar', stack: 'inn', data: basic, barWidth: '52%',
            itemStyle: {
              color: (p) => (p.dataIndex === 0 ? 'rgba(208,171,104,.45)' : 'rgba(22,104,168,.35)'),
              borderRadius: [3, 3, 0, 0],
            },
            markLine: {
              silent: true,
              symbol: 'none',
              lineStyle: { color: '#d0ab68', type: 'dashed', width: 1.2 },
              data: [{ yAxis: 9.7, label: { formatter: '均值', color: '#8a6000', fontSize: 10 } }],
            },
          },
        ],
      })
    }
    if (trendLineEl.value) {
      if (trendLineChart) { trendLineChart.dispose(); trendLineChart = null }
      trendLineChart = echarts.init(trendLineEl.value)
      trendLineChart.setOption({
        grid: { top: 28, right: 52, bottom: 52, left: 44 },
        legend: {
          bottom: 2,
          left: 'center',
          itemGap: 18,
          textStyle: { fontSize: 11, color: '#7a8b9a' },
          itemWidth: 12,
          itemHeight: 8,
        },
        tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
        xAxis: {
          type: 'category', data: trendLineData.xData, boundaryGap: false,
          axisLabel: { color: '#8a99a8', fontSize: 12 },
          axisLine: { lineStyle: { color: '#dce8f2' } },
          axisTick: { show: false },
        },
        yAxis: [
          {
            type: 'value', name: '个', max: 70,
            nameTextStyle: { color: '#8a99a8', fontSize: 11 },
            axisLabel: { color: '#8a99a8', fontSize: 12 },
            splitLine: { lineStyle: { color: '#eef3f8' } },
            axisLine: { show: false },
            axisTick: { show: false },
          },
          {
            type: 'value', name: '工程化%', min: 30, max: 100,
            nameTextStyle: { color: '#8a99a8', fontSize: 11 },
            axisLabel: { color: '#8a99a8', fontSize: 11, formatter: '{value}%' },
            splitLine: { show: false },
            axisLine: { show: false },
            axisTick: { show: false },
          },
        ],
        series: [
          {
            name: '当年新增', type: 'bar', data: trendLineData.yData, barWidth: 18, yAxisIndex: 0,
            itemStyle: {
              color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#5aa6de' }, { offset: 1, color: '#1668a8' }] },
              borderRadius: [3, 3, 0, 0],
            },
          },
          {
            name: '累计创新点', type: 'line', data: trendLineData.cumulative || trendLineData.yData, yAxisIndex: 0,
            smooth: true, symbol: 'circle', symbolSize: 7,
            lineStyle: { color: '#d0ab68', width: 2.4 },
            itemStyle: { color: '#d0ab68' },
            areaStyle: {
              color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(208,171,104,.22)' }, { offset: 1, color: 'rgba(208,171,104,0)' }] },
            },
            markPoint: {
              data: [{ type: 'max', name: '峰值' }],
              symbol: 'circle',
              symbolSize: 28,
              symbolOffset: [0, -16],
              itemStyle: { color: '#d0ab68' },
              label: { fontSize: 10, color: '#fff', fontWeight: 600 },
            },
          },
          {
            name: '工程化占比', type: 'line', data: trendLineData.engRate || [], yAxisIndex: 1,
            smooth: true, symbol: 'diamond', symbolSize: 6,
            lineStyle: { color: '#22913c', width: 2, type: 'dashed' },
            itemStyle: { color: '#22913c' },
          },
        ],
      })
    }
  })
}

function m31SelectTemplate(tpl) {
  m31SelectedTpl.value = tpl.id
}

function m31ReportTitle(tplId, direction) {
  const map = {
    'TPL-01': `${direction}发展方向研判报告`,
    'TPL-02': `${direction}创新点态势分析报告`,
    'TPL-03': `${direction}技术成熟度评估报告`,
  }
  return map[tplId] || `${direction}研判报告`
}

function m31FormatStamp(d = new Date()) {
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
}

/** 按所选模板 + 研判对象生成报告；名称后附时间戳 */
function m31GenerateReport() {
  const tplId = m31SelectedTpl.value
  const tpl = judgeTemplates.find((t) => t.id === tplId)
  if (!tpl) {
    toast('请先选择研判模板', 'error')
    return
  }
  const direction = m31Direction.value
  if (!direction) {
    toast('请先选择研判对象', 'error')
    return
  }
  const now = new Date()
  const stamp = m31FormatStamp(now)
  const time = stamp.slice(0, 10)
  const title = `${m31ReportTitle(tplId, direction)} ${stamp}`
  const list = Array.isArray(demoStore.judgeGeneratedReports)
    ? [...demoStore.judgeGeneratedReports]
    : []
  if (!m31BasisId.value) {
    toast('请先选择依据报告', 'error')
    return
  }
  const rpt = {
    id: `RPT-J${Date.now()}`,
    title,
    direction,
    time,
    status: '已生成',
    statusClass: 'on',
    tplId,
    basisId: m31BasisId.value,
    basisTitle: m31BasisTitle.value,
  }
  demoStore.judgeGeneratedReports = [rpt, ...list]
  toast('研判报告已生成')
  m31OpenReport(rpt)
}

/** 各报告正文草稿（在线编辑可改，导出读此内容） */
const m31Editing = ref(false)
const m31DraftById = reactive({})
let m31EditSnapshot = null

function m31DefaultDraft(rpt) {
  const dir = rpt?.direction || '定位定向技术'
  const archive = rpt?.basisTitle || m31BasisTitle.value || demoStore.judgeInputReportTitle || '试验报告V2'
  const archiveAt = demoStore.judgeInputArchivedAt
    ? `${demoStore.judgeInputArchivedAt.slice(0, 10)}归档`
    : (demoStore.reportArchived?.archivedAt
      ? `${String(demoStore.reportArchived.archivedAt).slice(0, 10)}归档`
      : '已归档')
  return {
    s1p1: `${dir}是现代精确制导武器系统和试验鉴定领域的核心支撑技术之一。近年来，随着对精度要求的持续提高，该技术在温度补偿、初始对准、误差建模等方面取得了一系列进展。本报告基于收录的326篇科技文献（含${archive}，${archiveAt}），系统分析${dir}方向创新点的现状与趋势。`,
    s1p2: `当前该方向共收录创新点12个，覆盖温补技术、定向精密校准、初始对准三个三级方向。其中温补技术方向在近2年产出了5个创新点，是当前研究最活跃的子方向，与本次试验第19发超差事件的根因直接相关。`,
    s2p1: `58个技术创新点按6个技术方向分布如下图所示，其中${dir}方向创新点数量最多（12个），与本次试验异常事件直接相关。`,
    s3p1: '近5年技术创新点数量呈持续上升趋势，年均增长约2.5个，表明该领域研究热度持续攀升。',
    s3p2: '从发展脉络看，2020—2022年以基础算法创新为主（误差建模、温补系数优化）；2023—2024年工程化应用创新比例显著提升，温补技术与自校准算法融合成为热点方向。预计2025年该方向将持续保持6—8个新增创新点的增速。',
    tip1Title: '温补技术工程化改进',
    tip1Body: '推进低成本温补方案与自校准算法融合，形成可工程化复制的温补系数分级修正流程，重点解决高温差场景下的鲁棒性问题。',
    tip1Note: '实证支撑：第19发超差事件（D-07）· 定位定向系统温补失效根因分析',
    tip2: '初始对准快速收敛能力提升：结合多位置观测与卡尔曼滤波融合方法，将对准时间压缩至4分钟以内，提高快速反应能力。',
    tip3: '定向精度评估标准完善：建立涵盖温度、振动、电磁干扰多因素的综合评估体系，为后续型号定型试验提供判据依据。',
  }
}

function m31EnsureDraft(rpt) {
  if (!rpt?.id) return m31DefaultDraft(rpt)
  if (!m31DraftById[rpt.id]) {
    m31DraftById[rpt.id] = m31DefaultDraft(rpt)
  }
  return m31DraftById[rpt.id]
}

const m31Draft = computed(() => {
  const rpt = m31Detail.value
  if (!rpt) return m31DefaultDraft(null)
  return m31EnsureDraft(rpt)
})

function m31OpenReport(rpt) {
  if (!rpt) return
  m31Editing.value = false
  m31Detail.value = rpt
  m31EnsureDraft(rpt)
  activeReportSection.value = 1
  nextTick(() => {
    const scroller = document.querySelector('.m31-report-scroll')
    if (scroller) scroller.scrollTop = 0
    initM31Charts()
    // 图表在滚动容器内，稍后再 resize 一次
    setTimeout(() => initM31Charts(), 80)
  })
}

function m31StartEdit() {
  if (!m31Detail.value) return
  const draft = m31EnsureDraft(m31Detail.value)
  m31EditSnapshot = JSON.parse(JSON.stringify(draft))
  m31Editing.value = true
  activeReportSection.value = 1
  toast('已进入在线编辑，修改正文后请点击「完成编辑」')
}

function m31FinishEdit() {
  if (!m31Detail.value) return
  m31Editing.value = false
  m31EditSnapshot = null
  const id = m31Detail.value.id
  const list = Array.isArray(demoStore.judgeGeneratedReports)
    ? demoStore.judgeGeneratedReports.map((r) =>
      r.id === id ? { ...r, status: '已编辑', statusClass: 'on' } : r,
    )
    : []
  demoStore.judgeGeneratedReports = list
  const hit = list.find((r) => r.id === id)
  if (hit) m31Detail.value = hit
  toast('研判报告已保存', 'success')
}

function m31CancelEdit() {
  const id = m31Detail.value?.id
  if (id && m31EditSnapshot) {
    m31DraftById[id] = { ...m31EditSnapshot }
  }
  m31EditSnapshot = null
  m31Editing.value = false
  toast('已取消编辑')
}

function m31BuildExportHtml(rpt, draft) {
  const title = rpt.title || '技术研判报告'
  const dir = rpt.direction || '—'
  const time = rpt.time || '—'
  const d = draft || m31DefaultDraft(rpt)
  const barRows = (innovBarData.xData || []).map((name, i) => {
    const n = innovBarData.yData[i]
    const pct = ((n / 58) * 100).toFixed(1)
    return `<tr><td>${name}</td><td>${n}</td><td>${pct}%</td></tr>`
  }).join('')
  return `<!DOCTYPE html><html xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><title>${title}</title>
<!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View></w:WordDocument></xml><![endif]-->
<style>
body{font-family:SimSun,宋体,serif;font-size:12pt;line-height:1.8;color:#222}
h1{font-size:18pt;text-align:center;color:#0d4e83}
h2{font-size:14pt;color:#0d4e83;margin-top:1.2em;border-bottom:1px solid #ccc;padding-bottom:4px}
table{border-collapse:collapse;width:100%;margin:8px 0 14px}
th,td{border:1px solid #999;padding:6px 10px;text-align:left;vertical-align:top}
th{background:#f3f8fd}
.meta{color:#555;margin:8px 0 16px}
.warn{background:#fff8e6;border-left:4px solid #d0ab68;padding:10px 12px;margin:8px 0}
</style></head><body>
<h1>${title}</h1>
<p class="meta">研判方向：${dir}　生成时间：${time}　状态：${rpt.status || '已生成'}</p>
<hr/>
<h2>1 技术现状综述</h2>
<p>${d.s1p1}</p>
<p>${d.s1p2}</p>
<p><b>主要参考文献：</b>温补系数自校准方法研究（2023）；定向系统误差补偿综述（2022）；试验报告V2·第19发超差分析（2024）等。</p>
<h2>2 创新点分布分析</h2>
<p>${d.s2p1}</p>
<table><thead><tr><th>技术方向</th><th>创新点数量</th><th>占比</th></tr></thead><tbody>${barRows}</tbody></table>
<h2>3 技术发展趋势研判</h2>
<p>${d.s3p1}</p>
<p>${d.s3p2}</p>
<h2>4 建议方向与对策</h2>
<div class="warn"><b>首要建议 · ${d.tip1Title}</b><br/>${d.tip1Body}<br/><small>${d.tip1Note}</small></div>
<p><b>②</b> ${d.tip2}</p>
<p><b>③</b> ${d.tip3}</p>
</body></html>`
}

function m31SafeFileName(name) {
  return String(name || '技术研判报告').replace(/[\\/:*?"<>|]/g, '_').slice(0, 80)
}

function m31ExportWord() {
  const rpt = m31Detail.value
  if (!rpt) {
    toast('请先打开一份研判报告', 'warning')
    return
  }
  if (m31Editing.value) {
    toast('请先完成编辑再导出', 'warning')
    return
  }
  const draft = m31EnsureDraft(rpt)
  const html = m31BuildExportHtml(rpt, draft)
  const blob = new Blob(['\ufeff', html], { type: 'application/msword;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${m31SafeFileName(rpt.title)}.doc`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  toast('已导出 Word 文档', 'success')
}

function m31ExportPdf() {
  const rpt = m31Detail.value
  if (!rpt) {
    toast('请先打开一份研判报告', 'warning')
    return
  }
  if (m31Editing.value) {
    toast('请先完成编辑再导出', 'warning')
    return
  }
  const draft = m31EnsureDraft(rpt)
  const html = m31BuildExportHtml(rpt, draft)
  const w = window.open('', '_blank')
  if (!w) {
    toast('浏览器拦截了弹窗，请允许后重试', 'error')
    return
  }
  w.document.open()
  w.document.write(html)
  w.document.close()
  w.focus()
  setTimeout(() => {
    w.print()
    toast('已打开打印预览，可另存为 PDF', 'success')
  }, 300)
}

function m31Export(cmd) {
  if (cmd === 'pdf') m31ExportPdf()
  else m31ExportWord()
}

function m31ResetCharts() {
  if (innovBarChart)  { innovBarChart.dispose();  innovBarChart  = null }
  if (trendLineChart) { trendLineChart.dispose(); trendLineChart = null }
  innovBarEl.value  = null
  trendLineEl.value = null
}

function m31GoSection(no) {
  activeReportSection.value = no
  nextTick(() => {
    const el = document.getElementById(`m31sec${no}`)
    const scroller = el?.closest?.('.m31-report-scroll')
    if (el && scroller) {
      const top = el.offsetTop - scroller.offsetTop - 8
      scroller.scrollTo({ top: Math.max(0, top), behavior: 'smooth' })
    } else if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    initM31Charts()
  })
}

// ── M32 管理端底座 ──────────────────────────────────────────────────────
const m32Stage       = ref('home')
function goDeviationSummary() {
  router.push({ name: 'app', params: { pid: 'cockpit', sid: 'cockpit-main', mid: 'deviations' } })
}
const m32Agents = ref(agentTemplates.map((a) => ({ ...a })))
const m32ResourceKpis = computed(() =>
  judgeResourceKpis.map((kpi) =>
    kpi.label === '探针模型'
      ? { ...kpi, value: demoStore.activeProbeCount }
      : kpi,
  ),
)

/** 智能体模板：配置弹窗 */
const m32CfgVisible = ref(false)
const m32CfgSaving = ref(false)
const m32CfgForm = reactive({
  id: '',
  name: '',
  scene: '',
  model: '',
  temperature: 0.2,
  topP: 0.9,
  prompt: '',
  tools: '',
})
const m32RunningId = ref('')

function m32OpenConfig(agt) {
  if (!agt) return
  Object.assign(m32CfgForm, {
    id: agt.id,
    name: agt.name,
    scene: agt.scene,
    model: agt.model || 'Qwen2.5-32B',
    temperature: agt.temperature ?? 0.2,
    topP: agt.topP ?? 0.9,
    prompt: agt.prompt || '',
    tools: agt.tools || '',
  })
  m32CfgVisible.value = true
}

function m32SaveConfig() {
  const hit = m32Agents.value.find((a) => a.id === m32CfgForm.id)
  if (!hit) {
    toast('未找到智能体模板', 'error')
    return
  }
  m32CfgSaving.value = true
  setTimeout(() => {
    hit.model = m32CfgForm.model
    hit.temperature = Number(m32CfgForm.temperature) || 0.2
    hit.topP = Number(m32CfgForm.topP) || 0.9
    hit.prompt = (m32CfgForm.prompt || '').trim()
    hit.tools = (m32CfgForm.tools || '').trim()
    m32CfgSaving.value = false
    m32CfgVisible.value = false
    toast(`${hit.name} 配置已保存`, 'success')
  }, 280)
}

function m32RunAgent(agt) {
  if (!agt || m32RunningId.value) return
  m32RunningId.value = agt.id
  toast(`${agt.name} 正在运行…`)
  setTimeout(() => {
    const hit = m32Agents.value.find((a) => a.id === agt.id)
    if (hit) hit.runs = (hit.runs || 0) + 1
    m32RunningId.value = ''
    toast(`${agt.name} 运行完成（累计 ${hit?.runs || agt.runs} 次）`, 'success')
  }, 900)
}

const lossChartEl   = ref(null)
const evalChartEl   = ref(null)
const gpuChartEl    = ref(null)
const memChartEl    = ref(null)
const resGrowthEl   = ref(null)
let lossChart       = null
let evalChart       = null
let gpuChart        = null
let memChart        = null
let resGrowthChart  = null

const chartAxisStyle = {
  axisLabel: { color: '#8a99a8', fontSize: 11 },
  axisLine: { show: false },
  axisTick: { show: false },
  splitLine: { lineStyle: { color: '#eef3f8' } },
}

function initM32TrainCharts() {
  nextTick(() => {
    // 训练损失：train + val 双线 + 平滑面积
    if (lossChartEl.value) {
      if (lossChart) { lossChart.dispose(); lossChart = null }
      lossChart = echarts.init(lossChartEl.value)
      lossChart.setOption({
        grid: { top: 36, right: 16, bottom: 28, left: 48 },
        tooltip: { trigger: 'axis' },
        legend: { top: 2, right: 4, textStyle: { fontSize: 11, color: '#7a8b9a' }, itemWidth: 12, itemHeight: 8 },
        xAxis: { type: 'category', data: lossChartData.xData, boundaryGap: false, axisLabel: { color: '#8a99a8', fontSize: 11 }, axisLine: { lineStyle: { color: '#dce8f2' } }, axisTick: { show: false } },
        yAxis: { type: 'value', name: 'Loss', nameTextStyle: { color: '#8a99a8', fontSize: 11 }, ...chartAxisStyle },
        series: [
          {
            name: 'Train Loss', type: 'line', data: lossChartData.yData, smooth: true,
            lineStyle: { color: '#1668a8', width: 2.2 }, symbol: 'circle', symbolSize: 5, itemStyle: { color: '#1668a8' },
            areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(22,104,168,.2)' }, { offset: 1, color: 'rgba(22,104,168,0)' }] } },
          },
          {
            name: 'Val Loss', type: 'line', data: lossChartData.valLoss || lossChartData.yData, smooth: true,
            lineStyle: { color: '#d0ab68', width: 2, type: 'dashed' }, symbol: 'diamond', symbolSize: 5, itemStyle: { color: '#d0ab68' },
          },
        ],
      })
    }
    // 评估指标：准确率 + 召回率 + F1
    if (evalChartEl.value) {
      if (evalChart) { evalChart.dispose(); evalChart = null }
      evalChart = echarts.init(evalChartEl.value)
      evalChart.setOption({
        grid: { top: 36, right: 16, bottom: 28, left: 48 },
        tooltip: { trigger: 'axis', valueFormatter: (v) => Number(v).toFixed(3) },
        legend: { top: 2, right: 4, textStyle: { fontSize: 11, color: '#7a8b9a' }, itemWidth: 12, itemHeight: 8 },
        xAxis: { type: 'category', data: evalChartData.xData, boundaryGap: false, axisLabel: { color: '#8a99a8', fontSize: 11 }, axisLine: { lineStyle: { color: '#dce8f2' } }, axisTick: { show: false } },
        yAxis: { type: 'value', min: 0.6, max: 1.0, axisLabel: { color: '#8a99a8', fontSize: 11, formatter: (v) => v.toFixed(2) }, ...chartAxisStyle },
        series: [
          { name: '准确率', type: 'line', data: evalChartData.accuracy, smooth: true, lineStyle: { color: '#1668a8', width: 2 }, symbol: 'circle', symbolSize: 5, itemStyle: { color: '#1668a8' } },
          { name: '召回率', type: 'line', data: evalChartData.recall, smooth: true, lineStyle: { color: '#d0ab68', width: 2 }, symbol: 'circle', symbolSize: 5, itemStyle: { color: '#d0ab68' } },
          {
            name: 'F1', type: 'line', data: evalChartData.f1 || [], smooth: true,
            lineStyle: { color: '#22913c', width: 2.2 }, symbol: 'circle', symbolSize: 5, itemStyle: { color: '#22913c' },
            areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(34,145,60,.14)' }, { offset: 1, color: 'rgba(34,145,60,0)' }] } },
            markLine: {
              silent: true, symbol: 'none',
              lineStyle: { color: '#22913c', type: 'dashed', width: 1 },
              data: [{ yAxis: 0.85, label: { formatter: '目标 0.85', color: '#22913c', fontSize: 10 } }],
            },
          },
        ],
      })
    }
    // GPU 利用率：渐变柱 + 告警线 + 温度提示
    if (gpuChartEl.value) {
      if (gpuChart) { gpuChart.dispose(); gpuChart = null }
      gpuChart = echarts.init(gpuChartEl.value)
      gpuChart.setOption({
        grid: { top: 28, right: 16, bottom: 28, left: 48 },
        tooltip: {
          trigger: 'axis',
          formatter: (params) => {
            const i = params[0]?.dataIndex ?? 0
            const temp = (gpuChartData.temp && gpuChartData.temp[i]) || '—'
            const mem = (gpuChartData.memUsed && gpuChartData.memUsed[i]) || '—'
            return `${gpuChartData.xData[i]}<br/>利用率：<b>${params[0].value}%</b><br/>温度：${temp}℃<br/>显存：${mem} GB`
          },
        },
        xAxis: { type: 'category', data: gpuChartData.xData, axisLabel: { color: '#8a99a8', fontSize: 11 }, axisLine: { lineStyle: { color: '#dce8f2' } }, axisTick: { show: false } },
        yAxis: { type: 'value', min: 70, max: 100, name: '%', nameTextStyle: { color: '#8a99a8', fontSize: 11 }, ...chartAxisStyle },
        series: [{
          type: 'bar',
          data: gpuChartData.yData.map((v) => ({
            value: v,
            itemStyle: { color: v >= 90 ? '#d4380d' : v >= 88 ? '#d0ab68' : '#1668a8', borderRadius: [3, 3, 0, 0] },
          })),
          barWidth: '48%',
          markLine: {
            silent: true, symbol: 'none',
            lineStyle: { color: '#d4380d', type: 'dashed', width: 1.2 },
            data: [{ yAxis: 90, label: { formatter: '告警 90%', color: '#d4380d', fontSize: 10 } }],
          },
        }],
      })
    }
    // 显存：已用面积 + 预留虚线
    if (memChartEl.value) {
      if (memChart) { memChart.dispose(); memChart = null }
      memChart = echarts.init(memChartEl.value)
      memChart.setOption({
        grid: { top: 36, right: 16, bottom: 28, left: 48 },
        tooltip: { trigger: 'axis' },
        legend: { top: 2, right: 4, textStyle: { fontSize: 11, color: '#7a8b9a' }, itemWidth: 12, itemHeight: 8 },
        xAxis: { type: 'category', data: memChartData.xData, boundaryGap: false, axisLabel: { color: '#8a99a8', fontSize: 11 }, axisLine: { lineStyle: { color: '#dce8f2' } }, axisTick: { show: false } },
        yAxis: { type: 'value', name: 'GB', min: 30, max: 56, nameTextStyle: { color: '#8a99a8', fontSize: 11 }, ...chartAxisStyle },
        series: [
          {
            name: '已用显存', type: 'line', data: memChartData.yData, smooth: true,
            lineStyle: { color: '#22913c', width: 2.2 }, symbol: 'circle', symbolSize: 5, itemStyle: { color: '#22913c' },
            areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(34,145,60,.22)' }, { offset: 1, color: 'rgba(34,145,60,0)' }] } },
          },
          {
            name: '预留上限', type: 'line', data: memChartData.reserved || memChartData.yData.map(() => 48),
            lineStyle: { color: '#8a99a8', width: 1.5, type: 'dashed' }, symbol: 'none',
          },
        ],
      })
    }
  })
}

function hexToRgba(hex, alpha) {
  const h = String(hex || '#1668a8').replace('#', '')
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
  const n = parseInt(full, 16)
  const r = (n >> 16) & 255
  const g = (n >> 8) & 255
  const b = n & 255
  return `rgba(${r},${g},${b},${alpha})`
}

function initM32ResourceChart() {
  nextTick(() => {
    if (resGrowthEl.value) {
      if (resGrowthChart) { resGrowthChart.dispose(); resGrowthChart = null }
      resGrowthChart = echarts.init(resGrowthEl.value)
      const palette = {
        文献: '#1668a8', 文书: '#5aa6de', 创新点: '#d0ab68', 图谱节点: '#22913c', 数据集: '#8b6bb8', 探针模型: '#d4380d',
      }
      const stackSeries = resGrowthData.series
        ? Object.entries(resGrowthData.series).map(([name, data]) => {
            const c = palette[name] || '#1668a8'
            return {
              name, type: 'line', stack: 'total', data, smooth: true, symbol: 'none',
              lineStyle: { width: 1.6, color: c },
              itemStyle: { color: c },
              areaStyle: {
                color: {
                  type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
                  colorStops: [
                    { offset: 0, color: hexToRgba(c, 0.42) },
                    { offset: 0.55, color: hexToRgba(c, 0.16) },
                    { offset: 1, color: hexToRgba(c, 0.02) },
                  ],
                },
              },
              emphasis: { focus: 'series' },
            }
          })
        : [{
            name: '资产合计', type: 'line', data: resGrowthData.yData, smooth: true,
            lineStyle: { color: '#1668a8', width: 2 }, symbol: 'circle', symbolSize: 5, itemStyle: { color: '#1668a8' },
            areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(22,104,168,.18)' }, { offset: 1, color: 'rgba(22,104,168,0)' }] } },
          }]
      resGrowthChart.setOption({
        color: Object.values(palette),
        grid: { top: 44, right: 20, bottom: 36, left: 52 },
        tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
        legend: { top: 2, type: 'scroll', textStyle: { fontSize: 11, color: '#7a8b9a' }, itemWidth: 10, itemHeight: 8 },
        xAxis: { type: 'category', data: resGrowthData.xData, boundaryGap: false, axisLabel: { color: '#8a99a8', fontSize: 11, rotate: 20 }, axisLine: { lineStyle: { color: '#dce8f2' } }, axisTick: { show: false } },
        yAxis: { type: 'value', name: '资产数', nameTextStyle: { color: '#8a99a8', fontSize: 11 }, axisLabel: { color: '#8a99a8', fontSize: 11 }, axisLine: { show: false }, axisTick: { show: false }, splitLine: { lineStyle: { color: '#eef3f8' } } },
        series: stackSeries,
      })
    }
  })
}

onBeforeUnmount(() => {
  if (m19GenerationTimer) clearTimeout(m19GenerationTimer)
  if (typeof window !== 'undefined') window.removeEventListener('resize', resizeM19Charts)
  if (scanTimer) clearInterval(scanTimer)
  if (v0Chart) { v0Chart.dispose(); v0Chart = null }
  if (pitchChart)   { pitchChart.dispose();   pitchChart   = null }
  if (scatterChart) { scatterChart.dispose(); scatterChart = null }
  if (tempChart)    { tempChart.dispose();    tempChart    = null }
  // m31 charts
  if (innovBarChart)  { innovBarChart.dispose();  innovBarChart  = null }
  if (trendLineChart) { trendLineChart.dispose(); trendLineChart = null }
  // m32 charts
  if (lossChart)      { lossChart.dispose();      lossChart      = null }
  if (evalChart)      { evalChart.dispose();       evalChart      = null }
  if (gpuChart)       { gpuChart.dispose();        gpuChart       = null }
  if (memChart)       { memChart.dispose();        memChart       = null }
  if (resGrowthChart) { resGrowthChart.dispose();  resGrowthChart = null }
})



  Object.assign(bag, {
    probeList,
    m14Stats,
    m14Detail,
    m14PageNo,
    m14PageSize,
    m14Search,
    m14Query,
    m14CheckedIds,
    applyM14Search,
    m14IsChecked,
    m14ToggleOne,
    m14AllPageChecked,
    m14SomePageChecked,
    m14ToggleAllPage,
    m14CreateVisible,
    m14Wizard,
    m14TreeOpen,
    m14EditingId,
    m14CreateForm,
    m14DialogTitle,
    m14TreeOptions,
    m14TreeIndicators,
    m14PickedIndicator,
    m14SampleOpts,
    m14DataSrcOpts,
    m14AlarmOpts,
    m14PickTree,
    m14PickIndicator,
    closeProbeWizard,
    m14SrcNodeOpts,
    m14ObjOpts,
    m14FilteredList,
    syncActiveProbeCount,
    toggleProbe,
    enableAllProbes,
    enableSelectedProbes,
    disableSelectedProbes,
    openCreateProbe,
    openEditProbe,
    submitCreateProbe,
    previewProbeCite,
    m15Detail,
    m15ViewKind,
    m15DetailMeta,
    weather30,
    calib12,
    scanCol,
    alertVisible,
    m15FilterBatch,
    m15FilterStatus,
    m15CreateVisible,
    m15CreateForm,
    m15TreeOptions,
    m15TreeIndicators,
    m15PickTree,
    m15PickIndicator,
    m15SrcTypeOpts,
    m15SourceOpts,
    m15TaskMeta,
    startDockReturn,
    m15FilteredTasks,
    openCreateDockTask,
    submitCreateDockTask,
    scanTimer,
    v0ChartEl,
    v0Chart,
    initV0Chart,
    initM15Chart,
    startScan,
    m15Open,
    m19Detail,
    m19GenerationStatus,
    focusShotId,
    m19ActiveNode,
    focusEvidence,
    m19FilterName,
    m19FilterProbe,
    m19FilterStatus,
    demoStore,
    doM19ConfirmRootCause,
    doM22Archive,
    m22ExportWord,
    pitchChartEl,
    scatterChartEl,
    tempChartEl,
    pitchChart,
    initM19Charts,
    resizeM19Charts,
    m19Events,
    m22Detail,
    activeSection,
    m22FilterName,
    m22FilterStatus,
    m22Reports,
    m22Sections,
    m29ExpandedId,
    m29FilterDirection,
    m29FilterSource,
    m29DirectionOpts,
    m29Innovations,
    m29Filtered,
    m29OpenView,
    m29ApplyFilter,
    m29ResetFilter,
    m30Tree,
    m30ExpandedDir,
    m30FocusSub,
    m31Detail,
    m31SelectedTpl,
    m31SelectedTplName,
    m31Direction,
    m31DirectionOpts,
    m31BasisId,
    m31BasisOpts,
    m31BasisTitle,
    m31Object,
    activeReportSection,
    m31FilterDirection,
    m31Templates,
    m31Reports,
    m31FilteredReports,
    m31Sections,
    innovBarEl,
    trendLineEl,
    innovBarChart,
    trendLineChart,
    initM31Charts,
    m31SelectTemplate,
    m31GenerateReport,
    m31OpenReport,
    m31Editing,
    m31Draft,
    m31StartEdit,
    m31FinishEdit,
    m31CancelEdit,
    m31Export,
    m31ExportWord,
    m31ExportPdf,
    m31ResetCharts,
    m31GoSection,
    m32Stage,
    goDeviationSummary,
    goRootCause,
    goProjectDup,
    trainTask,
    innovBarData,
    trendLineData,
    nextTick,
    m32Agents,
    m32ResourceKpis,
    m32CfgVisible,
    m32CfgSaving,
    m32CfgForm,
    m32RunningId,
    m32OpenConfig,
    m32SaveConfig,
    m32RunAgent,
    lossChartEl,
    evalChartEl,
    gpuChartEl,
    memChartEl,
    resGrowthEl,
    lossChart,
    evalChart,
    gpuChart,
    memChart,
    resGrowthChart,
    chartAxisStyle,
    initM32TrainCharts,
    initM32ResourceChart,
    scatterChart,
    tempChart,
    candidates,
    causeChain,
    evidence,
    shots30,
    dockTasks,
    judgeTree,
    judgeInnovations,
    deviationTotal,
    scatterChart,
    tempChart
  })
}
