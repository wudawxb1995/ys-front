import { reactive, watch } from 'vue'
import { postTrialMetrics } from '@/data/postTrial'
import { shots30 } from '@/data/mock'

export const reportTemplates = [
  { id: 'qualification', name: '性能鉴定试验报告', description: '覆盖试验概述、实施条件、数据汇总、符合性判定及异常处置，适用于完整批次报告。', chapters: ['试验概述', '试验依据与条件', '试验实施情况', '试验数据汇总', '符合性判定', '异常与处置', '结论', '附件'] },
  { id: 'analysis', name: '专项试验分析报告', description: '围绕试验结果、异常证据和处置情况组织正文，适用于单项或专项试验复盘。', chapters: ['试验任务与依据', '试验条件与实施', '试验数据汇总', '试验结果与判定', '异常定位与根因分析', '结论与建议'] },
]
export const reviewRulePacks = ['术语规范', '数据勾稽', '判据引用']
export const cloneReportData = (value) => JSON.parse(JSON.stringify(value))
export const workflowTime = () => new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Shanghai', hour12: false })
const storageKey = 'ys-report-workflow-v1'
let saved
try { saved = JSON.parse(sessionStorage.getItem(storageKey) || 'null') } catch { saved = null }
export const reportWorkflow = reactive(saved && Array.isArray(saved.reports) && Array.isArray(saved.reviews) ? saved : { reports: [], reviews: [], seeded: false })
watch(reportWorkflow, (value) => {
  try { sessionStorage.setItem(storageKey, JSON.stringify(value)) } catch { /* Keep this session usable if storage is full. */ }
}, { deep: true })

export function collectReportMaterials(tree, store) {
  const dock = store.trialDataDock || {}
  const shot = { shotNo: 19, firstDh: 0.42, retestDh: 0.18, criterion: 0.3, unit: 'mil', ...(dock.shot19 || {}) }
  const metrics = cloneReportData(postTrialMetrics).slice(0, Number(tree.count) || 28).map((row) => ({ ...row, source: tree.version }))
  const anomaly = metrics.find((row) => row.linkedShot === shot.shotNo)
  if (anomaly) {
    anomaly.value = `首测 ${shot.firstDh} / 复测 ${shot.retestDh} ${shot.unit}`
    anomaly.criterion = `≤ ${shot.criterion.toFixed(2)} ${shot.unit}`
    anomaly.conclusion = shot.retestDh <= shot.criterion ? '复测后符合' : '复测不符合'
  }
  return cloneReportData({
    tree, metrics, shot, shots: shots30, batch: dock.batch || 'D-07', shotCount: dock.shotCount || 30,
    sourceName: dock.taskName || '精度试验数据回传接入', taskId: dock.taskId || 'T01',
    outline: store.matchContext?.schemeName || '某型装备性能鉴定试验大纲 V4',
    eventId: store.confirmedRootCause?.eventId || 'EVT-001',
    cause: store.confirmedRootCause?.name || '定位定向系统温补失效', confidence: store.confirmedRootCause?.confidence || 0.86,
    analysisTitle: store.reportArchived?.title || '第19发超差事件解读报告', analysisVersion: store.reportArchived?.version || 'V1.1',
    linkedAt: workflowTime(),
  })
}

export function createWorkflowReport(title, templateId, materials) {
  return {
    id: `REPORT-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, title: title.trim(), templateId,
    materials: cloneReportData(materials), stage: 'materials', createdAt: workflowTime(), updatedAt: workflowTime(),
    sections: [], version: 1,
  }
}

// Both the draft and the review render these same structured sections.
export function generateReportSections(report) {
  const m = report.materials
  const template = reportTemplates.find((item) => item.id === report.templateId) || reportTemplates[0]
  const count = m.metrics.length
  const retested = m.metrics.filter((row) => row.conclusion === '复测后符合').length
  const passed = m.metrics.filter((row) => row.conclusion === '符合').length
  const p = (id, text, source) => ({ id, text, source, kind: 'paragraph' })
  const summary = [
    p('overview-scope', `本报告对 ${m.batch} 批次 ${count} 项指标的试验结果进行汇总与判定。试验依据《某型装备研制总要求》及审定大纲组织实施，指标名称、判据和结果以本次选择的${m.tree.version}为基线。报告覆盖指标完成情况、原始记录、异常处置与复测结果。`, '指标树判据、试验结果汇总'),
    p('overview-samples', `本批次精度试验取得 ${m.shotCount} 发正式试验记录。第 ${m.shot.shotNo} 发高低偏差出现超限，处置后另行形成 1 发复测记录；原始异常值与复测值分别保留，保证异常过程可回溯。`, `${m.sourceName} · ${m.taskId}`),
    p('overview-purpose', `报告用于记录本批次试验事实和支持后续审校。${passed} 项指标直接判定符合，${retested} 项经复测后符合；正式结论以完成审查及签署后的版本为准。`, '试验结果汇总'),
  ]
  const basis = [
    p('basis-documents', `试验依据为《某型装备研制总要求》、${m.tree.version}及${m.outline}。本次使用已发布指标树，判据调整须保留版本记录，并核对其与审定大纲的对应关系。`, `${m.tree.version} · ${m.tree.srcDoc || '研制总要求'}`),
    p('basis-environment', '试验条件按审定大纲执行，环境适应性指标覆盖低温与高温工况。设备状态、气象条件与测量链路由试验记录登记，报告判定应与各项指标实际采用的条件一致。', '试验大纲、条件记录'),
    p('basis-method', '试验记录按发次编号关联测量结果，指标结果按名称与判据进行逐项核对。测量链路、数据处理方法和报告内的计量单位保持一致，原始记录与统计汇总分别留存。', '试验结果汇总'),
  ]
  const execution = [
    p('execution-process', `试验按审定科目顺序实施，共形成 ${count} 项结果记录。数据经测量链路回传后进行编号核对、字段完整性检查及指标匹配，再进入符合性判定。异常记录保留原发次，不以复测值覆盖首测记录。`, `${m.sourceName} · ${m.taskId}`),
    p('execution-event', `第 ${m.shot.shotNo} 发触发高低偏差告警，实测 ${m.shot.firstDh} ${m.shot.unit}，超过判据 ≤${m.shot.criterion.toFixed(2)} ${m.shot.unit}。现场形成异常事件 ${m.eventId}，并关联《${m.analysisTitle}》用于记录定位和处置过程。`, '试验原始数据、异常分析报告'),
  ]
  const data = [
    p('data-fields', `${m.shotCount} 发正式试验原始数据与 1 发复测数据汇总成表，逐发记录高低偏差、方向偏差、炮口初速等测量参数。第 ${m.shot.shotNo} 发首测 ${m.shot.firstDh} ${m.shot.unit}、复测 ${m.shot.retestDh} ${m.shot.unit}，两条记录均可按发次及事件编号检索。`, `${m.sourceName} · ${m.taskId}`),
    p('data-statistics', '本报告按指标汇总试验结果，并保留第19发原始与复测记录。各项汇总值应能回溯到对应原始数据，避免将单发异常与批次统计量混用。', '试验结果汇总'),
    p('data-quality', `数据完整性检查覆盖 ${m.shotCount} 发正式记录与独立复测记录。当前判定使用关联材料中的实测值，不依据报告措辞改写原始结果；后续修订应同步注明原因、来源和版本。`, '数据回传任务'),
  ]
  const judgment = [
    p('judgment-method', `依据${m.tree.version}逐项比对实测值与判据，本次 ${count} 项结果中 ${passed} 项符合、${retested} 项复测后符合。复测判定与原始异常同时列示，不能将复测后符合改写为首测符合。`, '指标树判据、试验结果汇总'),
    { id: 'judgment-table', kind: 'metrics', text: `${count}项符合性判定表，判据来源：${m.tree.version}。`, source: m.tree.version, rows: cloneReportData(m.metrics) },
  ]
  const abnormal = [
    p('anomaly-facts', `异常事件 ${m.eventId} 对应第 ${m.shot.shotNo} 发高低偏差 ${m.shot.firstDh} ${m.shot.unit}。异常分析报告将“${m.cause}”列为首位候选根因，置信度 ${m.confidence}；分析使用姿态角、温度变化及标定资料作为证据。置信度为候选排序信息，不能替代复测结论。`, `《${m.analysisTitle}》`),
    p('anomaly-retest', `完成处置后组织复验，立靶高低偏差为 ${m.shot.retestDh} ${m.shot.unit}，满足 ≤${m.shot.criterion.toFixed(2)} ${m.shot.unit} 的判据。异常记录与复测记录共同构成此次闭环材料，后续归档时应核对处置单和原始记录的对应关系。`, '异常分析报告、复测记录'),
  ]
  const conclusion = [
    p('conclusion-result', `综合本批次 ${count} 项指标结果，${passed} 项直接符合，${retested} 项复测后符合。第 ${m.shot.shotNo} 发原始超差事实予以保留，报告结论同时引用原始值 ${m.shot.firstDh} ${m.shot.unit} 与复测值 ${m.shot.retestDh} ${m.shot.unit}，便于复核处置效果。`, '符合性判定表、异常与处置章节'),
    p('conclusion-scope', `上述结论适用于本报告所述 ${m.batch} 批次及既定试验条件。正式定稿前应完成判据引用、数据勾稽和术语规范审查；后续新增样本或更新判据时，需重新核对结论并保留修订轨迹。`, '本报告判定范围'),
  ]
  const attachments = [
    p('attachments-list', `随报告归集的材料包括：${m.tree.version}判据集、${count} 项结果汇总、${m.shotCount} 发正式试验记录、1 发复测记录及《${m.analysisTitle}》。附件用于复核正文中的实测值、异常处置和结论。`, '自动关联材料'),
    p('attachments-index', '附件应建立文档编号、版本、记录位置与正文引用的对应关系，保证审查人员能够从结论回溯到原始证据。', '附件目录'),
  ]
  const groups = template.id === 'analysis'
    ? [[...summary, basis[0]], [...basis.slice(1), ...execution], data, judgment, abnormal, [...conclusion, ...attachments]]
    : [summary, basis, execution, data, judgment, abnormal, conclusion, attachments]
  return template.chapters.map((title, index) => ({ id: `chapter-${index + 1}`, title, number: index + 1, blocks: groups[index] }))
}

export function inspectReport(report, packs) {
  const sections = cloneReportData(report.sections)
  const issues = []
  const add = (pack, type, severity, blockId, title, basis, suggestion, replacement) => {
    if (!packs.includes(pack)) return
    const section = sections.find((s) => s.blocks.some((b) => b.id === blockId))
    const block = section?.blocks.find((b) => b.id === blockId)
    if (!block || block.text === replacement) return
    issues.push({ id: `issue-${issues.length + 1}`, pack, type, severity, blockId, title, basis, suggestion, replacement, originalText: block.text, location: `第${section.number}章 ${section.title} · 第${section.blocks.indexOf(block) + 1}段`, status: '待处理' })
  }
  const text = (id) => sections.flatMap((s) => s.blocks).find((b) => b.id === id)?.text || ''
  if (text('data-fields').includes('炮口初速')) add('术语规范', '核文勘误', '一般', 'data-fields', '同一测量参数的术语需要统一', '当前报告模板术语规范：测量参数统一使用“弹丸初速”。', '将“炮口初速”统一为“弹丸初速”，保留实测值和计量单位。', text('data-fields').replaceAll('炮口初速', '弹丸初速'))
  if (text('anomaly-retest').includes('复验')) add('术语规范', '语义规则', '一般', 'anomaly-retest', '处置后的重复测量称谓不一致', '试验结果汇总使用“复测后符合”，正文应使用相同术语。', '将“复验”统一为“复测”，与结果汇总表保持一致。', text('anomaly-retest').replaceAll('复验', '复测'))
  if (!text('data-statistics').includes('不并入')) add('数据勾稽', '本体逻辑', '重要', 'data-statistics', '未明确复测样本是否并入正式样本统计', `关联数据包含 ${report.materials.shotCount} 发正式记录及 1 发复测记录，样本口径应分别说明。`, '补充正式样本与复测样本的统计口径。', text('data-statistics') + ` 正式试验统计以 ${report.materials.shotCount} 发为基数，1 发复测记录单独列示，不并入正式样本统计。`)
  if (!text('anomaly-facts').includes(report.materials.analysisVersion)) add('判据引用', '跨文档联合', '重要', 'anomaly-facts', '异常分析报告引用缺少版本', `已关联的异常分析报告版本为 ${report.materials.analysisVersion}，事件编号为 ${report.materials.eventId}。`, '补充已关联报告的版本与事件编号，形成唯一引用。', text('anomaly-facts') + ` 引用版本：${report.materials.analysisVersion}；事件编号：${report.materials.eventId}。`)
  if (!text('judgment-table').includes('逐项条款')) add('判据引用', '标准符合性', '重要', 'judgment-table', '指标判定表尚缺逐项判据条款定位', `判定表已列出${report.materials.tree.version}及实测值，尚未提供各项指标对应的原文条款号。`, '核对指标树原文后补充逐项条款号；当前材料没有条款号，不自动编造。', null)
  if (!text('basis-environment').includes('记录编号')) add('判据引用', '标准符合性', '重要', 'basis-environment', '试验条件缺少原始记录定位', '当前段落仅概述环境和设备条件，未给出对应条件记录的编号及记录位置。', '补充实际条件记录编号、日期及测量设备校准记录，由编写人员核实后修订。', null)
  return { id: `REVIEW-${Date.now()}`, reportId: report.id, reportTitle: report.title, version: report.version, sections, packs: [...packs], issues, createdAt: workflowTime(), status: '已完成' }
}

export function seedWorkflow(store) {
  if (reportWorkflow.seeded) return
  const tree = (store.m03List || []).find((row) => row.status === '已发布')
  if (tree) {
    const report = createWorkflowReport('某型装备性能鉴定试验报告（D-07）', 'qualification', collectReportMaterials(tree, store))
    report.sections = generateReportSections(report)
    report.stage = 'draft'
    reportWorkflow.reports.push(report)
  }
  reportWorkflow.seeded = true
}
