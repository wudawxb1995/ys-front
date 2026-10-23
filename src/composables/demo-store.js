/**
 * demo-store.js
 * 跨部分演示数据共享层（sessionStorage 持久化）
 *
 * 串联点一览：
 *  Part1 → Part3 : 指标树版本（metricTreeVersion）、条目数（metricTreeCount）
 *  Part2 → Part3 : 根因采纳（confirmedRootCause）、解读报告归档（reportArchived）
 *  Part2 → Part3 : 在用探针数（activeProbeCount）
 *  Part3 → Part4 : 试验报告V2归档（trialReportV2Archived）
 *  Part3 → Part4 : 归档时间（trialReportArchivedAt）
 */

import { reactive, watch } from 'vue'

// ── 默认初始值（与各部分 mock 数据保持一致）─────────────────────────────
const DEFAULTS = {
  // Part1
  metricTreeVersion: 'V1.0',
  metricTreeCount: 28,

  // Part2 — 探针平台
  activeProbeCount: 12,  // 12个探针全部启用

  // Part2 — 根因分析（m19）：用户点击"采纳根因"后写入
  confirmedRootCause: {
    name: '定位定向系统温补失效',
    confidence: 0.86,
    eventId: 'EVT-001',
    eventName: '第19发超差事件',
    shotNo: 19,
    confirmedAt: '2026-10-22 11:05',
  },

  // Part2 — 解读报告（m22）：用户点击"归档"后写入
  reportArchived: {
    id: 'RPT-001',
    title: '第19发超差事件解读报告',
    version: 'V1.1',
    source: '探针平台',
    archivedAt: '2026-10-22 11:12',
    rootCause: '定位定向系统温补失效',
    retest: '复测值 0.18 mil，符合 ≤0.30 mil',
  },

  // Part3 — 试验报告定稿归集后写入（finalizeArchive 调用时）
  trialReportV2Archived: true,
  trialReportArchivedAt: '2026-10-22 16:38',

  // Part4 — 研判平台使用（从 Part3 归档结论派生）
  judgeInputReportTitle: '某型性能鉴定试验报告 V2',
  judgeInputArchivedAt: '2026-10-22 16:38',

  // 演示指认缓存（sessionStorage）
  lastM02Task: '',
  lastM02IndicatorId: '',
  lastDeviationId: '',
  deviationViewedIds: [],
}

// ── sessionStorage 读写工具 ───────────────────────────────────────────────
const STORAGE_KEY = 'ys_demo_store'

function loadFromStorage() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULTS }
    return { ...DEFAULTS, ...JSON.parse(raw) }
  } catch {
    return { ...DEFAULTS }
  }
}

function saveToStorage(state) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // sessionStorage 写失败时静默降级，不影响页面功能
  }
}

// ── 响应式状态（单例）────────────────────────────────────────────────────
const store = reactive(loadFromStorage())

// 任意字段变化时自动持久化
watch(store, (val) => saveToStorage({ ...val }), { deep: true })

// ── 对外 API ─────────────────────────────────────────────────────────────

/**
 * Part1：指标树版本更新
 * 在 CrudPage 或 RichPage 指标树编辑后调用
 */
export function updateMetricTree(version, count) {
  store.metricTreeVersion = version
  store.metricTreeCount = count
}

/**
 * Part2 m14：探针启用状态变更
 */
export function updateActiveProbeCount(count) {
  store.activeProbeCount = count
}

/**
 * Part2 m19：用户采纳候选根因
 * @param {object} candidate  来自 candidates mock 的行对象 { name, confidence }
 * @param {object} event      来自 m19Events 的行对象 { name, id }
 */
export function confirmRootCause(candidate, event) {
  store.confirmedRootCause = {
    name: candidate.name,
    confidence: candidate.confidence,
    eventId: event.id,
    eventName: event.name,
    shotNo: 19,
    confirmedAt: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
  }
}

/**
 * Part2 m22：解读报告归档
 * @param {object} report  报告行对象
 */
export function archiveInterpretReport(report) {
  store.reportArchived = {
    id: report.id,
    title: report.title,
    version: 'V1.1',
    source: '探针平台',
    archivedAt: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
    rootCause: store.confirmedRootCause?.name || '定位定向系统温补失效',
    retest: '复测值 0.18 mil，符合 ≤0.30 mil',
  }
}

/**
 * Part3：定稿归集（finalizeArchive 时调用）
 */
export function finalizeTrialReport() {
  store.trialReportV2Archived = true
  store.trialReportArchivedAt = new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')
  store.judgeInputReportTitle = '某型性能鉴定试验报告 V2'
  store.judgeInputArchivedAt = store.trialReportArchivedAt
}

/**
 * 正偏离汇总页：记录指认条目
 */
export function markDeviationViewed(id) {
  store.lastDeviationId = id
  if (!Array.isArray(store.deviationViewedIds)) store.deviationViewedIds = []
  if (!store.deviationViewedIds.includes(id)) {
    store.deviationViewedIds = [...store.deviationViewedIds, id]
  }
}

/**
 * 重置所有状态为默认值（演示重置按钮用）
 */
export function resetDemoStore() {
  Object.assign(store, { ...DEFAULTS, deviationViewedIds: [] })
  sessionStorage.removeItem(STORAGE_KEY)
}

/**
 * 只读访问整个 store（响应式）
 */
export function useDemoStore() {
  return store
}
