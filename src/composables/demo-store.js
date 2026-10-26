/**
 * demo-store.js
 * 跨部分演示数据共享层（sessionStorage 持久化）
 *
 * 串联点一览：
 *  Part1 → Part3 : 指标树版本（metricTreeVersion）、条目数（metricTreeCount）
 *  Part1 → Part3 : 定稿大纲上下文（matchContext → 提纲 V4）
 *  Part2 → Part3 : 精度数据回传（trialDataDock / T01 · D-07 · 30发）
 *  Part2 → Part3 : 根因采纳（confirmedRootCause / 第19发超差事件）
 *  Part2 → Part3 : 解读报告归档（reportArchived）
 *  Part2 → Part3 : 在用探针数（activeProbeCount）
 *  Part3 → Part4 : 试验报告V2归档（trialReportV2Archived）
 *  Part3 → Part4 : 归档时间（trialReportArchivedAt）
 *  Part4 m30 → m31 : 图谱浏览方向（graphBrowseDirection）驱动研判对象与模板推荐
 *  Part4 m31       : 已生成研判报告列表（judgeGeneratedReports）
 */

import { reactive, watch } from 'vue'

// ── 默认初始值（与各部分 mock 数据保持一致）─────────────────────────────
const M03_LIST_SEED = [
  { id: 'v1', version: '指标树 V1.0', srcDoc: 'D-01《某型研制总要求》', count: 28, status: '已发布', publishedAt: '2026-10-08 09:24' },
  { id: 'v2', version: '指标树 V0.9', srcDoc: 'D-01《某型研制总要求》', count: 24, status: '草稿', publishedAt: null },
]

const M08_LIST_SEED = [
  {
    id: 'm1',
    name: '某型装备性能鉴定试验大纲 V4',
    ver: 'V4',
    treeVer: '指标树 V1.0',
    status: '已定稿',
    updatedAt: '2026-10-08 10:42',
    template: '性能鉴定试验大纲模板',
    caseName: '寒区电磁兼容历史案例',
    domains: ['机动', '火力', '环境适应性', '电磁兼容'],
    remark: '定型性能鉴定主路径，含寒区与 EMC',
  },
  {
    id: 'm2',
    name: '某型装备性能鉴定试验大纲 V3',
    ver: 'V3',
    treeVer: '指标树 V0.9',
    status: '已归档',
    updatedAt: '2026-10-06 15:20',
    template: '环境适应性试验大纲模板',
    caseName: '湿热环境长时考核案例',
    domains: ['环境适应性', '可靠性'],
    remark: '归档快照，湿热长时考核',
  },
  {
    id: 'm3',
    name: '某型装备性能鉴定试验大纲 V1',
    ver: 'V1',
    treeVer: '指标树 V0.9',
    status: '草稿',
    updatedAt: '2026-10-04 09:11',
    template: '性能鉴定试验大纲模板',
    caseName: '某型定型性能鉴定案例（2024）',
    remark: '',
  },
]

const DEFAULTS = {
  // Part1
  metricTreeVersion: 'V1.0',
  metricTreeCount: 28,
  /** 数据模型管理 · 指标树列表（sessionStorage，tab 关闭才清空） */
  m03List: M03_LIST_SEED.map((r) => ({ ...r })),
  /** 试验方案智能生成 · 方案列表 */
  m08List: M08_LIST_SEED.map((r) => ({ ...r })),

  // Part2 — 探针平台
  activeProbeCount: 12,  // 12个探针全部启用

  // Part2 — 精度试验数据回传（对接任务 T01 / D-07），Part3 素材卡与判定表引用
  trialDataDock: {
    taskId: 'T01',
    taskName: '精度试验数据回传接入',
    batch: 'D-07',
    shotCount: 30,
    status: '成功',
    dockedAt: '2024-10-18 14:30',
    srcType: '弹道测量+遥测文件',
    // 第19发首测超差 + 温补校准后复测（与 shots30 / 解读报告一致）
    shot19: {
      shotNo: 19,
      firstDh: 0.42,
      retestDh: 0.18,
      criterion: 0.30,
      unit: 'mil',
      conclusion: '复测后符合',
    },
  },

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
    source: '探针设计与智能定位平台',
    archivedAt: '2026-10-22 11:12',
    rootCause: '定位定向系统温补失效',
    retest: '复测值 0.18 mil，符合 ≤0.30 mil',
    eventId: 'EVT-001',
    eventName: '第19发超差事件',
  },

  // Part3 — 文档生成需求配置：默认勾选推荐素材（未确认前内容生成页不可装配）
  composeSelection: {
    ruleId: 'tree-v1',
    dataId: 'dock-t01',
    eventId: 'rpt-001',
    /** 用户自拟的报告题名（不含版本后缀） */
    reportTitle: '某型性能鉴定试验报告',
    confirmed: false,
  },

  // Part3 — 生成初稿后的报告身份（审查任务「审查对象」与之联动）
  draftReport: {
    title: '某型性能鉴定试验报告',
    version: 'V1',
    stage: '初稿',
    /** 完整显示名，如 某型性能鉴定试验报告 V1（初稿） */
    fullName: '某型性能鉴定试验报告 V1（初稿）',
    /** 审查对象短名，如 某型性能鉴定试验报告 V1 */
    reviewTarget: '某型性能鉴定试验报告 V1',
    generated: false,
    generatedAt: '',
  },

  // Part3 — 试验报告定稿归集后写入（finalizeArchive 调用时）
  trialReportV2Archived: true,
  trialReportArchivedAt: '2026-10-22 16:38',

  // Part4 — 研判平台使用（从 Part3 归档结论派生）
  judgeInputReportTitle: '某型性能鉴定试验报告 V2',
  judgeInputArchivedAt: '2026-10-22 16:38',

  /** 图谱浏览当前技术方向（m30 写入，m31 研判对象自动带入） */
  graphBrowseDirection: '定位定向技术',
  /** 图谱当前聚焦的三级子节点（可选） */
  graphBrowseSub: '',
  /** 已生成的研判报告（m31 生成写入；预置一条供分镜） */
  judgeGeneratedReports: [
    {
      id: 'RPT-J001',
      title: '定位定向技术发展方向研判报告',
      direction: '定位定向技术',
      time: '2024-10-18',
      status: '已生成',
      statusClass: 'on',
      tplId: 'TPL-01',
    },
  ],

  // 演示指认缓存（sessionStorage）
  lastM02Task: '',
  lastM02IndicatorId: '',
  lastDeviationId: '',
  deviationViewedIds: [],

  /** 试验方案 → 资源匹配：当前关联的定稿方案上下文 */
  matchContext: {
    schemeId: 'm1',
    schemeName: '某型装备性能鉴定试验大纲 V4',
    ver: 'V4',
    treeVer: '指标树 V1.0',
    template: '性能鉴定试验大纲模板',
    caseName: '某型定型性能鉴定案例（2024）',
    status: '已定稿',
    domains: [],
    factors: [],
    updatedAt: '',
  },
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

/** 读取指标树列表快照（供 Rich 重建时 hydration） */
export function getPersistedM03List() {
  if (Array.isArray(store.m03List) && store.m03List.length) {
    return store.m03List.map((r) => ({
      ...r,
      domains: Array.isArray(r.domains) ? [...r.domains] : r.domains,
    }))
  }
  return M03_LIST_SEED.map((r) => ({ ...r }))
}

/** 写回指标树列表并自动进 sessionStorage */
export function persistM03List(list) {
  store.m03List = (list || []).map((r) => ({
    ...r,
    domains: Array.isArray(r.domains) ? [...r.domains] : r.domains,
  }))
}

/** 读取试验方案列表快照 */
export function getPersistedM08List() {
  if (Array.isArray(store.m08List) && store.m08List.length) {
    return store.m08List.map((r) => ({ ...r }))
  }
  return M08_LIST_SEED.map((r) => ({ ...r }))
}

/** 写回试验方案列表 */
export function persistM08List(list) {
  store.m08List = (list || []).map((r) => ({ ...r }))
}

/**
 * Part2 m14：探针启用状态变更
 */
export function updateActiveProbeCount(count) {
  store.activeProbeCount = count
}

/**
 * 方案页「资源匹配」/ 匹配页切方案：写入关联上下文
 * @param {object} row m08 方案行
 */
export function setMatchContext(row) {
  if (!row) return
  const algo = store.matchContext?.algo
  store.matchContext = {
    schemeId: row.id || '',
    schemeName: row.name || '',
    ver: row.ver || '',
    treeVer: row.treeVer || '',
    template: row.template || '性能鉴定试验大纲模板',
    caseName: row.caseName || '某型定型性能鉴定案例（2024）',
    status: row.status || '',
    domains: Array.isArray(row.domains) ? [...row.domains] : [],
    factors: Array.isArray(row.factors) ? row.factors.map((f) => ({ ...f })) : [],
    updatedAt: row.updatedAt || '',
    ...(algo ? { algo } : {}),
  }
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
  const cause = store.confirmedRootCause || {}
  const shot = store.trialDataDock?.shot19
  const retest = shot
    ? `复测值 ${shot.retestDh} ${shot.unit}，符合 ≤${shot.criterion} ${shot.unit}`
    : '复测值 0.18 mil，符合 ≤0.30 mil'
  store.reportArchived = {
    id: report.id,
    title: report.title || '第19发超差事件解读报告',
    version: 'V1.1',
    source: '探针设计与智能定位平台',
    archivedAt: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
    rootCause: cause.name || '定位定向系统温补失效',
    retest,
    eventId: cause.eventId || 'EVT-001',
    eventName: cause.eventName || report.event || '第19发超差事件',
  }
}

/**
 * Part2 数据对接成功后刷新 Part3 可引用的回传摘要（演示默认已写入）
 */
export function syncTrialDataDock(task) {
  if (!task) return
  store.trialDataDock = {
    ...store.trialDataDock,
    taskId: task.id || store.trialDataDock.taskId,
    taskName: task.name || store.trialDataDock.taskName,
    shotCount: Number(String(task.count || '').replace(/\D/g, '')) || store.trialDataDock.shotCount,
    status: task.status || store.trialDataDock.status,
    dockedAt: task.time || store.trialDataDock.dockedAt,
    srcType: task.srcType || store.trialDataDock.srcType,
  }
}

const DEFAULT_REPORT_TITLE = '某型性能鉴定试验报告'

function normalizeReportTitle(title) {
  const t = String(title || '').trim().replace(/\s+/g, '')
  return t || DEFAULT_REPORT_TITLE
}

/**
 * Part3：文档生成需求配置 — 确认选用的素材与报告命名后进入内容生成
 * @param {{ ruleId: string, dataId: string, eventId: string, reportTitle?: string }} sel
 */
export function confirmComposeSelection(sel) {
  const reportTitle = normalizeReportTitle(sel?.reportTitle || store.composeSelection?.reportTitle)
  store.composeSelection = {
    ruleId: sel?.ruleId || '',
    dataId: sel?.dataId || '',
    eventId: sel?.eventId || '',
    reportTitle,
    confirmed: Boolean(sel?.ruleId && sel?.dataId && sel?.eventId),
  }
  // 预写入题名（尚未生成版本），审查页在生成前也能看到拟定名称
  store.draftReport = {
    ...store.draftReport,
    title: reportTitle,
    version: 'V1',
    stage: '初稿',
    fullName: `${reportTitle} V1（初稿）`,
    reviewTarget: `${reportTitle} V1`,
    generated: false,
    generatedAt: '',
  }
}

/**
 * Part3：生成初稿 — 按需求配置中的题名落版本，供审查任务「审查对象」联动
 */
export function markDraftReportGenerated() {
  const at = new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')
  const title = normalizeReportTitle(store.composeSelection?.reportTitle || store.draftReport?.title)
  store.draftReport = {
    title,
    version: 'V1',
    stage: '初稿',
    fullName: `${title} V1（初稿）`,
    reviewTarget: `${title} V1`,
    generated: true,
    generatedAt: at,
  }
  // 新生成 V1 后，定稿归档标记回到未定稿（演示闭环）
  store.trialReportV2Archived = false
  store.trialReportArchivedAt = ''
}

/**
 * Part4 m30：图谱浏览方向同步（供 m31 自动带入研判对象）
 */
export function setGraphBrowse(direction, sub = '') {
  store.graphBrowseDirection = direction || '定位定向技术'
  store.graphBrowseSub = sub || ''
}

/**
 * Part3：定稿归集（finalizeArchive 时调用）
 */
export function finalizeTrialReport() {
  const at = new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')
  const title = normalizeReportTitle(store.draftReport?.title || store.composeSelection?.reportTitle)
  store.trialReportV2Archived = true
  store.trialReportArchivedAt = at
  store.draftReport = {
    title,
    version: 'V2',
    stage: '定稿',
    fullName: `${title} V2（定稿）`,
    reviewTarget: `${title} V2`,
    generated: true,
    generatedAt: store.draftReport?.generatedAt || at,
  }
  store.judgeInputReportTitle = `${title} V2`
  store.judgeInputArchivedAt = at
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
  Object.assign(store, {
    ...DEFAULTS,
    m03List: M03_LIST_SEED.map((r) => ({ ...r })),
    m08List: M08_LIST_SEED.map((r) => ({ ...r })),
    deviationViewedIds: [],
    matchContext: { ...DEFAULTS.matchContext },
    trialDataDock: {
      ...DEFAULTS.trialDataDock,
      shot19: { ...DEFAULTS.trialDataDock.shot19 },
    },
    confirmedRootCause: { ...DEFAULTS.confirmedRootCause },
    reportArchived: { ...DEFAULTS.reportArchived },
    composeSelection: { ...DEFAULTS.composeSelection },
    draftReport: { ...DEFAULTS.draftReport },
    judgeGeneratedReports: DEFAULTS.judgeGeneratedReports.map((r) => ({ ...r })),
  })
  sessionStorage.removeItem(STORAGE_KEY)
}

/**
 * 只读访问整个 store（响应式）
 */
export function useDemoStore() {
  return store
}
