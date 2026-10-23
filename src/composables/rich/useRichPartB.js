/**
 * Rich 页演示镜头（m14 / m15 / m19 / m22 / m29–m32）
 */
import { computed, nextTick, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { useDemoStore, confirmRootCause, archiveInterpretReport, updateActiveProbeCount } from '@/composables/demo-store'
import { deviationTotal } from '@/data/deviations'
import {
  judgeInnovations, techTree as judgeTree,
  judgeTemplates, judgeReports, judgeReportSections,
  innovBarData, trendLineData,
  trainTask, lossChartData, evalChartData, gpuChartData, memChartData,
  agentTemplates, resourceKpis as judgeResourceKpis, resGrowthData,
  probes, shots30, dockTasks, causeChain, evidence, candidates,
} from '@/data/mock'
import * as echarts from 'echarts'

let pendingM22ReportId = null

export function buildRichPartB({ toast, router, route, props, bag }) {
// ── M14 探针配置管理 ────────────────────────────────────────────────────

const probeList = ref(probes.map((p) => ({ ...p, enabled: true })))
const m14Detail = ref(null)   // null=列表页；Object=详情页
const m14PageNo = ref(1)
const m14PageSize = 10

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
function enableAllProbes() {
  probeList.value.forEach((p) => { p.enabled = true })
  const count = syncActiveProbeCount()
  toast(`已批量启用全部探针（在用 ${count}）`)
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
  const yData = shots30.map(s => s.v0)
  v0Chart.setOption({
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross', lineStyle: { color: '#1668a8', width: 1 } },
      formatter: (params) => {
        const p = params[0]
        const shot = shots30[p.dataIndex]
        const color = shot.anomaly ? '#d4380d' : '#1668a8'
        return `<div style="font-size:13px">
          <b style="color:${color}">第 ${shot.id} 发</b><br/>
          初速：<b style="color:${color}">${shot.v0} m/s</b><br/>
          高低偏：${shot.dH > 0 ? '+' : ''}${shot.dH} mil<br/>
          方向偏：${shot.dL > 0 ? '+' : ''}${shot.dL} mil
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
      type: 'line', data: yData,
      lineStyle: { color: '#1668a8', width: 2 },
      symbol: 'circle', symbolSize: 4,
      itemStyle: { color: '#1668a8' },
      markLine: {
        silent: true,
        lineStyle: { color: '#d4380d', type: 'dashed', width: 1.2, opacity: 0.6 },
        data: [{ yAxis: 820, label: { formatter: '820', color: '#d4380d', fontSize: 11 } }],
      },
      markPoint: {
        data: [{ coord: [18, 818.3] }],
        symbol: 'circle', symbolSize: 14,
        itemStyle: { color: '#d4380d' },
        label: { formatter: '818.3', color: '#d4380d', fontSize: 12, fontWeight: 'bold', position: 'top' },
      },
    }],
  })
}

function startScan() {
  if (scanCol.value >= 0) return
  scanCol.value = 0
  scanTimer = setInterval(() => {
    scanCol.value++
    if (scanCol.value >= 6) {
      clearInterval(scanTimer)
      scanTimer = null
      alertVisible.value = true
    }
  }, 800)
}

function m15Open(task) {
  m15Detail.value = task
  scanCol.value = -1
  alertVisible.value = false
  nextTick(() => initV0Chart())
}

// ── M19 根因分析工作台 ──────────────────────────────────────────────────
const m19Detail      = ref(null)
const focusShotId    = ref(19)
const m19ActiveNode  = ref('C6')
const focusEvidence  = ref(null)
const m19FilterName   = ref('')
const m19FilterProbe  = ref('')
const m19FilterStatus = ref('')

// ── demo-store 接入 ──────────────────────────────────────────────────────
const demoStore = useDemoStore()

// m19：采纳根因 + 触发解读报告生成 → 写入 demo-store
function goRootCause() {
  router.push({ name: 'app', params: { pid: 'probe', sid: 'probe-interpret', mid: 'cause-list' } })
}

function doM19ConfirmRootCause() {
  const top = candidates.find(c => c.rank === 1) || candidates[0]
  const evt = m19Detail.value || { id: 'EVT-001', name: '第19发超差事件' }
  confirmRootCause(top, evt)
  pendingM22ReportId = 'RPT-001'
  toast('根因已采纳，正在打开解读报告')
  router.push({ name: 'app', params: { pid: 'probe', sid: 'probe-interpret', mid: 'report-list' } })
}

function goProjectDup() {
  router.push({ name: 'app', params: { pid: 'insight', sid: 'judge', mid: 'dup' } })
}

// m22：归档解读报告 → 写入 demo-store
function doM22Archive(report) {
  if (!report) return
  archiveInterpretReport(report)
  toast('报告已归档，可在第三部分试验后阶段作为素材引用')
}

// m19 三图 ECharts
const pitchChartEl   = ref(null)
const scatterChartEl = ref(null)
const tempChartEl    = ref(null)
let pitchChart = null, scatterChart = null, tempChart = null

function initM19Charts() {
  nextTick(() => {
    // ① 姿态角 pitch 时序
    if (pitchChartEl.value) {
      pitchChart && pitchChart.dispose()
      pitchChart = echarts.init(pitchChartEl.value)
      const pitchData = Array.from({length:30}, (_,i) => {
        if (i === 18) return [i+1, 0.38]
        return [i+1, +(Math.sin(i*0.8)*0.06 + 0.04).toFixed(3)]
      })
      pitchChart.setOption({
        grid: { top:28, right:16, bottom:28, left:44 },
        tooltip: { trigger:'axis', formatter: p => `第 ${p[0].data[0]} 发<br/>pitch偏差：<b>${p[0].data[1]}°</b>` },
        xAxis: { type:'value', min:1, max:30, name:'发次', nameLocation:'end', nameGap:6,
          nameTextStyle:{color:'#8a99a8',fontSize:11}, axisLabel:{color:'#8a99a8',fontSize:11},
          axisLine:{lineStyle:{color:'#dce8f2'}}, axisTick:{show:false}, splitLine:{show:false} },
        yAxis: { type:'value', name:'°', nameLocation:'end', nameGap:6,
          nameTextStyle:{color:'#8a99a8',fontSize:11}, axisLabel:{color:'#8a99a8',fontSize:11},
          axisLine:{show:false}, axisTick:{show:false}, splitLine:{lineStyle:{color:'#eef3f8'}} },
        series:[{
          type:'line', data: pitchData,
          lineStyle:{color:'#1668a8',width:1.8}, symbol:'none',
          markLine:{ silent:true, lineStyle:{color:'#d4380d',type:'dashed',width:1,opacity:.6},
            data:[{yAxis:0.20, label:{formatter:'阈值0.20°',color:'#d4380d',fontSize:10}}] },
          markPoint:{ data:[{coord:[19,0.38]}], symbol:'circle', symbolSize:10,
            itemStyle:{color:'#d4380d'},
            label:{formatter:'漂移起点',color:'#d4380d',fontSize:10,fontWeight:'bold',position:'top'} },
        }],
      })
    }
    // ② 身管温度与初速散点
    if (scatterChartEl.value) {
      scatterChart && scatterChart.dispose()
      scatterChart = echarts.init(scatterChartEl.value)
      const normalData = shots30.filter(s=>!s.anomaly).map(s=>[s.id, s.v0])
      const anomalyData = shots30.filter(s=>s.anomaly).map(s=>[s.id, s.v0])
      scatterChart.setOption({
        grid:{ top:28, right:16, bottom:28, left:44 },
        tooltip:{ trigger:'item', formatter:p=>`第 ${p.data[0]} 发<br/>初速：<b>${p.data[1]} m/s</b>` },
        xAxis:{ type:'value', min:1, max:30, name:'发次', nameLocation:'end', nameGap:6,
          nameTextStyle:{color:'#8a99a8',fontSize:11}, axisLabel:{color:'#8a99a8',fontSize:11},
          axisLine:{lineStyle:{color:'#dce8f2'}}, axisTick:{show:false}, splitLine:{show:false} },
        yAxis:{ type:'value', min:815, max:830, name:'m/s', nameLocation:'end', nameGap:6,
          nameTextStyle:{color:'#8a99a8',fontSize:11}, axisLabel:{color:'#8a99a8',fontSize:11},
          axisLine:{show:false}, axisTick:{show:false}, splitLine:{lineStyle:{color:'#eef3f8'}} },
        series:[
          { type:'scatter', data:normalData, symbolSize:6, itemStyle:{color:'#1668a8',opacity:.7} },
          { type:'scatter', data:anomalyData, symbolSize:10, itemStyle:{color:'#d4380d'},
            label:{show:true, formatter:'818.3', color:'#d4380d', fontSize:10, fontWeight:'bold', position:'top'} },
        ],
      })
    }
    // ③ 定位定向系统内部温度
    if (tempChartEl.value) {
      tempChart && tempChart.dispose()
      tempChart = echarts.init(tempChartEl.value)
      const tempData = [
        [0,23.1],[1,23.2],[2,23.1],[3,23.2],[4.2,25.3],[5,25.1],[6,25.2],[7,25.1],[8,25.2],[9,25.1],
      ]
      tempChart.setOption({
        grid:{ top:28, right:16, bottom:28, left:44 },
        tooltip:{ trigger:'axis', formatter: p=>`T+${p[0].data[0]}s<br/>温度：<b>${p[0].data[1]}℃</b>` },
        xAxis:{ type:'value', name:'秒', nameLocation:'end', nameGap:6,
          nameTextStyle:{color:'#8a99a8',fontSize:11}, axisLabel:{color:'#8a99a8',fontSize:11},
          axisLine:{lineStyle:{color:'#dce8f2'}}, axisTick:{show:false}, splitLine:{show:false} },
        yAxis:{ type:'value', min:22, max:27, name:'℃', nameLocation:'end', nameGap:6,
          nameTextStyle:{color:'#8a99a8',fontSize:11}, axisLabel:{color:'#8a99a8',fontSize:11},
          axisLine:{show:false}, axisTick:{show:false}, splitLine:{lineStyle:{color:'#eef3f8'}} },
        series:[{
          type:'line', data:tempData,
          lineStyle:{color:'#1668a8',width:1.8}, symbol:'none',
          markPoint:{ data:[{coord:[4.2,25.3]}], symbol:'circle', symbolSize:10,
            itemStyle:{color:'#d4380d'},
            label:{formatter:'T+4.2s\n+2.1℃',color:'#d4380d',fontSize:10,fontWeight:'bold',position:'top'} },
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

// ── M22 智能解读报告 ────────────────────────────────────────────────────
const m22Detail      = ref(null)
const activeSection  = ref(1)
const m22FilterName  = ref('')
const m22FilterStatus = ref('')

const m22Reports = [
  { id:'RPT-001', title:'第19发超差事件解读报告', event:'第19发超差事件', statusLabel:'已归档·待试验后引用', statusClass:'archive', batch:'D-07', time:'2024-10-18' },
  { id:'RPT-002', title:'D-06批次例行报告',        event:'D-06批次例行分析',  statusLabel:'草稿',               statusClass:'hold',    batch:'D-06', time:'2024-10-17' },
]
if (pendingM22ReportId) {
  m22Detail.value = m22Reports.find((r) => r.id === pendingM22ReportId) || m22Reports[0]
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
const m29ExpandedId      = ref('INN-001')
const m29FilterDirection = ref('')
const m29FilterSource    = ref('')
const m29DirectionOpts   = ['全部方向', '定位定向技术', '弹道修正技术', '惯导技术', '遥测技术', '气象修正', '信号处理']

// 首条来源动态反映 Part3 归档的试验报告标题（来自 demo-store）
const m29Innovations = computed(() => judgeInnovations.map(inn => {
  if (inn.id !== 'INN-001') return inn
  const archivedTitle = demoStore.judgeInputReportTitle
  const archivedAt    = demoStore.judgeInputArchivedAt
  return {
    ...inn,
    source: archivedAt
      ? `3篇（含${archivedTitle}，${archivedAt.slice(0, 10)}归档）`
      : inn.source,
  }
}))

const m29Filtered = computed(() => m29Innovations.value.filter(inn => {
  if (m29FilterDirection.value && m29FilterDirection.value !== '全部方向' && inn.direction !== m29FilterDirection.value) return false
  if (m29FilterSource.value && !inn.source.includes(m29FilterSource.value)) return false
  return true
}))

// ── M30 技术体系知识图谱 ────────────────────────────────────────────────
const m30Tree        = judgeTree
const m30ExpandedDir = ref('定位定向技术')

// ── M31 技术研判报告 ────────────────────────────────────────────────────
const m31Detail           = ref(null)
const m31SelectedTpl      = ref('TPL-01')
const activeReportSection = ref(1)
const m31FilterDirection  = ref('')
const m31Templates        = judgeTemplates
const m31Reports          = judgeReports
const m31Sections         = judgeReportSections
const m31FilteredReports  = computed(() => {
  const q = (m31FilterDirection.value || '').trim()
  if (!q) return m31Reports
  return m31Reports.filter((r) => r.title.includes(q) || r.direction.includes(q))
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
      innovBarChart.setOption({
        grid: { top: 28, right: 20, bottom: 48, left: 48 },
        tooltip: { trigger: 'axis' },
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
        series: [{
          type: 'bar', data: innovBarData.yData,
          itemStyle: {
            color: (p) => p.dataIndex === 0 ? '#d0ab68' : '#1668a8',
            borderRadius: [3, 3, 0, 0],
          },
          barWidth: '50%',
        }],
      })
    }
    if (trendLineEl.value) {
      if (trendLineChart) { trendLineChart.dispose(); trendLineChart = null }
      trendLineChart = echarts.init(trendLineEl.value)
      trendLineChart.setOption({
        grid: { top: 28, right: 20, bottom: 28, left: 48 },
        tooltip: { trigger: 'axis' },
        xAxis: {
          type: 'category', data: trendLineData.xData,
          axisLabel: { color: '#8a99a8', fontSize: 12 },
          axisLine: { lineStyle: { color: '#dce8f2' } },
          axisTick: { show: false },
        },
        yAxis: {
          type: 'value', name: '个',
          nameTextStyle: { color: '#8a99a8', fontSize: 11 },
          axisLabel: { color: '#8a99a8', fontSize: 12 },
          splitLine: { lineStyle: { color: '#eef3f8' } },
          axisLine: { show: false },
          axisTick: { show: false },
        },
        series: [{
          type: 'line', data: trendLineData.yData,
          lineStyle: { color: '#1668a8', width: 2 },
          symbol: 'circle', symbolSize: 6,
          itemStyle: { color: '#1668a8' },
          areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(22,104,168,.18)' }, { offset: 1, color: 'rgba(22,104,168,0)' }] } },
        }],
      })
    }
  })
}

function m31SelectTemplate(tpl) {
  m31SelectedTpl.value = tpl.id
}

function m31OpenReport(rpt) {
  if (!rpt) return
  m31Detail.value = rpt
  activeReportSection.value = 1
  nextTick(() => initM31Charts())
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
    // 滚动到目标节
    const el = document.getElementById(`m31sec${no}`)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    // 切换到第2节或第3节时初始化图表
    if (no === 2 || no === 3) {
      nextTick(() => initM31Charts())
    }
  })
}

// ── M32 管理端底座 ──────────────────────────────────────────────────────
const m32Stage       = ref('home')
function goDeviationSummary() {
  router.push({ name: 'app', params: { pid: 'cockpit', sid: 'cockpit-main', mid: 'deviations' } })
}
const m32Agents      = agentTemplates
const m32ResourceKpis = computed(() =>
  judgeResourceKpis.map((kpi) =>
    kpi.label === '探针模型'
      ? { ...kpi, value: demoStore.activeProbeCount }
      : kpi,
  ),
)

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
    // 训练损失曲线
    if (lossChartEl.value) {
      if (lossChart) { lossChart.dispose(); lossChart = null }
      lossChart = echarts.init(lossChartEl.value)
      lossChart.setOption({
        grid: { top: 24, right: 16, bottom: 28, left: 48 },
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: lossChartData.xData, axisLabel: { color: '#8a99a8', fontSize: 11 }, axisLine: { lineStyle: { color: '#dce8f2' } }, axisTick: { show: false } },
        yAxis: { type: 'value', name: 'Loss', nameTextStyle: { color: '#8a99a8', fontSize: 11 }, ...chartAxisStyle },
        series: [{ type: 'line', data: lossChartData.yData, lineStyle: { color: '#1668a8', width: 2 }, symbol: 'circle', symbolSize: 5, itemStyle: { color: '#1668a8' } }],
      })
    }
    // 评估指标（准确率+召回率双折线）
    if (evalChartEl.value) {
      if (evalChart) { evalChart.dispose(); evalChart = null }
      evalChart = echarts.init(evalChartEl.value)
      evalChart.setOption({
        grid: { top: 32, right: 16, bottom: 28, left: 48 },
        tooltip: { trigger: 'axis' },
        legend: { top: 4, right: 8, textStyle: { fontSize: 11, color: '#7a8b9a' }, itemWidth: 12, itemHeight: 8 },
        xAxis: { type: 'category', data: evalChartData.xData, axisLabel: { color: '#8a99a8', fontSize: 11 }, axisLine: { lineStyle: { color: '#dce8f2' } }, axisTick: { show: false } },
        yAxis: { type: 'value', min: 0.6, max: 1.0, axisLabel: { color: '#8a99a8', fontSize: 11, formatter: v => v.toFixed(2) }, ...chartAxisStyle },
        series: [
          { name: '准确率', type: 'line', data: evalChartData.accuracy, lineStyle: { color: '#1668a8', width: 2 }, symbol: 'circle', symbolSize: 5, itemStyle: { color: '#1668a8' } },
          { name: '召回率', type: 'line', data: evalChartData.recall,   lineStyle: { color: '#d0ab68', width: 2 }, symbol: 'circle', symbolSize: 5, itemStyle: { color: '#d0ab68' } },
        ],
      })
    }
    // GPU 利用率
    if (gpuChartEl.value) {
      if (gpuChart) { gpuChart.dispose(); gpuChart = null }
      gpuChart = echarts.init(gpuChartEl.value)
      gpuChart.setOption({
        grid: { top: 24, right: 16, bottom: 28, left: 48 },
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: gpuChartData.xData, axisLabel: { color: '#8a99a8', fontSize: 11 }, axisLine: { lineStyle: { color: '#dce8f2' } }, axisTick: { show: false } },
        yAxis: { type: 'value', min: 70, max: 100, name: '%', nameTextStyle: { color: '#8a99a8', fontSize: 11 }, ...chartAxisStyle },
        series: [{ type: 'bar', data: gpuChartData.yData, itemStyle: { color: '#1668a8', borderRadius: [3, 3, 0, 0] }, barWidth: '50%' }],
      })
    }
    // 显存占用
    if (memChartEl.value) {
      if (memChart) { memChart.dispose(); memChart = null }
      memChart = echarts.init(memChartEl.value)
      memChart.setOption({
        grid: { top: 24, right: 16, bottom: 28, left: 48 },
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: memChartData.xData, axisLabel: { color: '#8a99a8', fontSize: 11 }, axisLine: { lineStyle: { color: '#dce8f2' } }, axisTick: { show: false } },
        yAxis: { type: 'value', name: 'GB', nameTextStyle: { color: '#8a99a8', fontSize: 11 }, ...chartAxisStyle },
        series: [{ type: 'line', data: memChartData.yData, lineStyle: { color: '#22913c', width: 2 }, symbol: 'circle', symbolSize: 5, itemStyle: { color: '#22913c' } }],
      })
    }
  })
}

function initM32ResourceChart() {
  nextTick(() => {
    if (resGrowthEl.value) {
      if (resGrowthChart) { resGrowthChart.dispose(); resGrowthChart = null }
      resGrowthChart = echarts.init(resGrowthEl.value)
      resGrowthChart.setOption({
        grid: { top: 28, right: 20, bottom: 36, left: 52 },
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: resGrowthData.xData, axisLabel: { color: '#8a99a8', fontSize: 11, rotate: 20 }, axisLine: { lineStyle: { color: '#dce8f2' } }, axisTick: { show: false } },
        yAxis: { type: 'value', name: '资产数', nameTextStyle: { color: '#8a99a8', fontSize: 11 }, axisLabel: { color: '#8a99a8', fontSize: 11 }, axisLine: { show: false }, axisTick: { show: false }, splitLine: { lineStyle: { color: '#eef3f8' } } },
        series: [{
          type: 'line', data: resGrowthData.yData,
          lineStyle: { color: '#1668a8', width: 2 }, symbol: 'circle', symbolSize: 5,
          itemStyle: { color: '#1668a8' },
          areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(22,104,168,.18)' }, { offset: 1, color: 'rgba(22,104,168,0)' }] } },
        }],
      })
    }
  })
}

onBeforeUnmount(() => {
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
    m14Detail,
    m14PageNo,
    m14PageSize,
    syncActiveProbeCount,
    toggleProbe,
    enableAllProbes,
    m15Detail,
    scanCol,
    alertVisible,
    m15FilterBatch,
    m15FilterStatus,
    scanTimer,
    v0ChartEl,
    v0Chart,
    initV0Chart,
    startScan,
    m15Open,
    m19Detail,
    focusShotId,
    m19ActiveNode,
    focusEvidence,
    m19FilterName,
    m19FilterProbe,
    m19FilterStatus,
    demoStore,
    doM19ConfirmRootCause,
    doM22Archive,
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
    m30Tree,
    m30ExpandedDir,
    m31Detail,
    m31SelectedTpl,
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
    m31OpenReport,
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
