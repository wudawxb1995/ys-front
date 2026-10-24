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

const probeList = ref(probes.map((p) => ({
  ...p,
  enabled: true,
  lastTrigger: '—', // 待检测：尚无触发
})))
const m14Detail = ref(null)   // null=列表页；Object=详情页
const m14PageNo = ref(1)
const m14PageSize = 10
const m14Search = ref('')
const m14Query = ref('')
/** 列表勾选 id */
const m14CheckedIds = ref([])
const m14CreateVisible = ref(false)
/** null=新建；探针 id=编辑配置 */
const m14EditingId = ref(null)
const m14CreateForm = reactive({
  name: '',
  obj: '',
  criteria: '',
  srcNode: '散布精度指标',
  metrics: 3,
  dataSrc: '弹道测量文件',
  bindParam: '',
})
const m14DialogTitle = computed(() => (m14EditingId.value ? '编辑探针配置' : '新建探针'))

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
  m14CreateForm.obj = p?.obj || m14ObjOpts[0]
  m14CreateForm.criteria = p?.criteria || ''
  m14CreateForm.srcNode = p?.srcNode || m14SrcNodeOpts[0]
  m14CreateForm.metrics = Number(p?.metrics) || 3
  m14CreateForm.dataSrc = p?.dataSrc || '弹道测量文件'
  m14CreateForm.bindParam = p?.bindParam || (p?.obj === '立靶偏差' ? '立靶高低偏差' : (p?.obj || ''))
}

function openCreateProbe() {
  m14EditingId.value = null
  fillProbeForm(null)
  m14CreateForm.obj = m14ObjOpts[0]
  m14CreateForm.srcNode = m14SrcNodeOpts[0]
  m14CreateForm.metrics = 3
  m14CreateForm.dataSrc = '弹道测量文件'
  m14CreateVisible.value = true
}

/** 列表「配置」：打开与新建相同弹窗，编辑该探针 */
function openEditProbe(p) {
  if (!p) return
  m14EditingId.value = p.id
  fillProbeForm(p)
  m14CreateVisible.value = true
}

function todayStr() {
  const today = new Date()
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
}

function submitCreateProbe() {
  const name = m14CreateForm.name.trim()
  const obj = m14CreateForm.obj.trim()
  const criteria = m14CreateForm.criteria.trim()
  if (!name) { toast('请填写探针名称', 'warning'); return }
  if (!obj) { toast('请选择监测对象', 'warning'); return }
  if (!criteria) { toast('请填写判据阈值', 'warning'); return }

  const editingId = m14EditingId.value
  if (probeList.value.some((p) => p.name === name && p.id !== editingId)) {
    toast('探针名称已存在', 'warning')
    return
  }

  const patch = {
    name,
    obj,
    criteria,
    srcNode: m14CreateForm.srcNode || '散布精度指标',
    metrics: Number(m14CreateForm.metrics) || 1,
    bindParam: m14CreateForm.bindParam.trim() || (obj === '立靶偏差' ? '立靶高低偏差' : obj),
    dataSrc: m14CreateForm.dataSrc || '弹道测量文件',
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
  m14CreateVisible.value = false
  m14PageNo.value = 1
  syncActiveProbeCount()
  toast(`已新建探针「${name}」`, 'success')
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

<h2>2 异常特征</h2>
<p>第 19 发立靶高低偏差 <b>+0.42 mil</b>，超出判据阈值 ≤0.30 mil（超出 40%），触发立靶精度探针 P01 告警，判定为异常发次。同批次前 18 发偏差均在 ±0.25 mil 以内，排除弹药批次因素。</p>
<p><b>探针告警记录：</b></p>
<ul>
<li>P01 立靶精度告警（2024-10-18 14:32:07）：高低偏差 +0.42 mil，超出判据 ≤0.30 mil，触发一级告警</li>
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

<h2>4 结论与处置建议</h2>
<div class="box"><b>结论：</b>本批次弹道试验共 30 发，第 19 发出现弹着点散布异常（超判据 40%），根因推断为定位定向系统温补系数失效（置信度 0.86），前 18 发均正常，排除弹药批次性因素。</div>
<div class="warn"><b>核心建议：</b>建议对定位定向系统执行温补校准后，复测第 19 发工况，以验证温补系数修正效果。</div>
<p><b>详细处置步骤：</b></p>
<ol>
<li>对该定位定向系统重新进行温补系数标定，参照出厂校准规程执行；</li>
<li>扩大 TH-03 传感器检测范围，在现有采样基础上增加温度梯度采样点（建议不少于 3 个）；</li>
<li>下批次试验前完成上述修正后，在相同工况下对第 19 发场景执行复测验证；</li>
<li>复测结果纳入 D-07 批次试验数据库，更新探针 P01 判据基线。</li>
</ol>

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
    m14EditingId,
    m14CreateForm,
    m14DialogTitle,
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
