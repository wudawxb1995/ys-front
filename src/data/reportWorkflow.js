import { reactive, watch } from 'vue'
import { postTrialMetrics } from '@/data/postTrial'
import { shots30 } from '@/data/mock'

export const reportTemplates = [
  { id: 'qualification', name: '性能鉴定试验报告', description: '完整批次：概述、条件、数据、判定、异常与结论。', chapters: ['试验概述', '试验依据与条件', '试验实施情况', '试验数据汇总', '符合性判定', '异常与处置', '结论', '附件'] },
  { id: 'analysis', name: '专项试验分析报告', description: '单项复盘：任务、实施、数据、判定与根因。', chapters: ['试验任务与依据', '试验条件与实施', '试验数据汇总', '试验结果与判定', '异常定位与根因分析', '结论与建议'] },
  { id: 'databook', name: '试验数据汇总报告', description: '以样本和实测对照为主，适合数据复核。', chapters: ['数据来源与样本', '原始记录汇总', '指标实测对照', '异常样本说明', '汇总结论'] },
  { id: 'event', name: '异常事件复盘报告', description: '围绕超差发次写清事实、证据、复测和处置。', chapters: ['事件概况', '超差事实', '根因与证据', '复测闭环', '处置建议'] },
  { id: 'brief', name: '鉴定结论简报', description: '压缩范围、主要判定和异常闭环，便于会签。', chapters: ['鉴定范围', '主要判定', '异常闭环', '结论'] },
]
export const reviewRulePacks = ['术语规范', '数据勾稽', '判据引用']
export const reviewTypes = ['全部', '核文勘误', '语义规则', '跨文档联合', '本体逻辑', '标准符合性']
export const cloneReportData = (value) => JSON.parse(JSON.stringify(value))
export const workflowTime = () => new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Shanghai', hour12: false })
const storageKey = 'ys-report-workflow-v2'
let saved
try { saved = JSON.parse(sessionStorage.getItem(storageKey) || 'null') } catch { saved = null }
const initial = saved && Array.isArray(saved.reports) && Array.isArray(saved.reviews) ? saved : { reports: [], reviews: [], seeded: false }
initial.pendingReviewReportId = initial.pendingReviewReportId || ''
initial.activeReviewId = initial.activeReviewId || ''
initial.openReportId = initial.openReportId || ''
export const reportWorkflow = reactive(initial)
watch(reportWorkflow, (value) => {
  try { sessionStorage.setItem(storageKey, JSON.stringify(value)) } catch { /* 存储满时仍保持本次会话可用 */ }
}, { deep: true })

export function resultSummary(materials) {
  const passed = materials.metrics.filter((row) => row.conclusion === '符合').length
  const retested = materials.metrics.filter((row) => row.conclusion === '复测后符合').length
  return `${passed}项符合 · ${retested}项复测后符合`
}

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
    analysisTitle: store.reportArchived?.title || `第${shot.shotNo}发立靶高低偏差异常解读报告`,
    analysisVersion: store.reportArchived?.version || 'V1.1',
    linkedAt: workflowTime(),
  })
}

export function createWorkflowReport(title, templateId, materials) {
  return {
    id: `REPORT-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, title: title.trim(), templateId,
    materials: cloneReportData(materials), stage: 'materials', status: '进行中', createdAt: workflowTime(), updatedAt: workflowTime(),
    sections: [], outlineNotes: [], version: 1,
  }
}

export function outlineBlurbs(template, materials) {
  const m = materials
  const passed = m.metrics.filter((row) => row.conclusion === '符合').length
  const retested = m.metrics.filter((row) => row.conclusion === '复测后符合').length
  const dict = {
    '试验概述': `交代鉴定目的、受试对象和样本规模。正式试验 ${m.shotCount} 发，第 ${m.shot.shotNo} 发高低偏差超限后另有 1 发复测；全文以 ${m.tree.version} 为判据基线。`,
    '试验依据与条件': `列明研制总要求、${m.tree.version} 与 ${m.outline}。环境、设备和测量链路按大纲执行，判据如有调整须保留版本。`,
    '试验实施情况': `按科目顺序形成 ${m.metrics.length} 项结果。第 ${m.shot.shotNo} 发告警后保留原发次，复测记录不覆盖首测。`,
    '试验数据汇总': `汇总 ${m.shotCount} 发正式记录与 1 发复测，逐发保留高低偏差、方向偏差和弹丸初速。正式样本与复测样本分开统计。`,
    '符合性判定': `${m.metrics.length} 项中 ${passed} 项直接符合、${retested} 项复测后符合。判定表回链 ${m.tree.version}，复测符合不改写为首测符合。`,
    '异常与处置': `事件 ${m.eventId} 的首位候选根因是「${m.cause}」，置信度 ${m.confidence}。复测 ${m.shot.retestDh} ${m.shot.unit} 与首测 ${m.shot.firstDh} ${m.shot.unit} 并列归档。`,
    '结论': `综合 ${passed} 项直接符合与 ${retested} 项复测后符合。结论同时引用首测和复测，适用范围限于 ${m.batch} 批次。`,
    '附件': `归集判据集、${m.metrics.length} 项汇总、${m.shotCount} 发原始记录、1 发复测和《${m.analysisTitle}》，保证结论能回到证据。`,
  }
  dict['试验任务与依据'] = dict['试验依据与条件']
  dict['试验条件与实施'] = dict['试验实施情况']
  dict['试验结果与判定'] = dict['符合性判定']
  dict['异常定位与根因分析'] = dict['异常与处置']
  dict['结论与建议'] = dict['结论']
  dict['数据来源与样本'] = dict['试验概述']
  dict['原始记录汇总'] = dict['试验数据汇总']
  dict['指标实测对照'] = dict['符合性判定']
  dict['异常样本说明'] = dict['异常与处置']
  dict['汇总结论'] = dict['结论']
  dict['事件概况'] = `记录事件 ${m.eventId}：第 ${m.shot.shotNo} 发立靶高低偏差首测 ${m.shot.firstDh} ${m.shot.unit}，超过 ≤${m.shot.criterion.toFixed(2)} ${m.shot.unit}。`
  dict['超差事实'] = dict['事件概况']
  dict['根因与证据'] = `首位候选根因是「${m.cause}」，置信度 ${m.confidence}。证据来自姿态、温度和标定资料，不能代替复测结论。`
  dict['复测闭环'] = `处置后复测为 ${m.shot.retestDh} ${m.shot.unit}，满足判据。首测记录继续保留，不回写为合格。`
  dict['处置建议'] = dict['结论']
  dict['鉴定范围'] = dict['试验概述']
  dict['主要判定'] = dict['符合性判定']
  dict['异常闭环'] = dict['异常与处置']
  return template.chapters.map((title, index) => dict[title] || `第 ${index + 1} 章按「${template.name}」写入已关联的 ${m.metrics.length} 项结果，并注明可回溯来源。`)
}

const roleOf = {
  '试验概述': 'overview', '鉴定范围': 'overview', '事件概况': 'overview', '数据来源与样本': 'overview',
  '试验依据与条件': 'basis', '试验任务与依据': 'basis',
  '试验实施情况': 'execution', '试验条件与实施': 'execution', '超差事实': 'execution',
  '试验数据汇总': 'data', '原始记录汇总': 'data',
  '符合性判定': 'judgment', '试验结果与判定': 'judgment', '指标实测对照': 'judgment', '主要判定': 'judgment',
  '异常与处置': 'abnormal', '异常定位与根因分析': 'abnormal', '异常样本说明': 'abnormal', '根因与证据': 'abnormal', '复测闭环': 'abnormal', '异常闭环': 'abnormal',
  '结论': 'conclusion', '结论与建议': 'conclusion', '汇总结论': 'conclusion', '处置建议': 'conclusion',
  '附件': 'attachments',
}

function buildBodies(m) {
  const count = m.metrics.length
  const retested = m.metrics.filter((row) => row.conclusion === '复测后符合')
  const passed = m.metrics.filter((row) => row.conclusion === '符合')
  const samples = passed.slice(0, 4).map((row) => `${row.name}（判据 ${row.criterion}，实测 ${row.value}，判定符合）`).join('；')
  const anomaly = m.metrics.find((row) => row.linkedShot) || retested[0]
  const p = (id, text, source) => ({ id, text, source, kind: 'paragraph' })
  return {
    overview: [
      p('overview-scope', `本次性能鉴定依据《某型装备研制总要求》和${m.outline}组织实施，受试对象为本批次定型样机。报告按${m.tree.version}汇总 ${count} 项试验结果，覆盖环境适应、机动性能、火控精度、供电通信和安全联锁。精度试验正式样本 ${m.shotCount} 发；第 ${m.shot.shotNo} 发立靶高低偏差超限后，另完成 1 发同工况复测。正式样本与复测样本分开编号，不在概述中把复测结果算进首测合格数。`, '指标树判据、试验结果汇总'),
      p('overview-samples', `样本来自${m.sourceName}（${m.taskId}），批次 ${m.batch}。${passed.length} 项指标在规定工况下直接判定符合，${retested.length} 项经复测后符合。第 ${m.shot.shotNo} 发首测高低偏差 ${m.shot.firstDh} ${m.shot.unit}，复测 ${m.shot.retestDh} ${m.shot.unit}，两条记录都保留，供后续审校核对处置是否闭环。`, `${m.sourceName} · ${m.taskId}`),
      p('overview-purpose', `本报告用于固定本批次试验事实，不替代签署后的正式结论。正文中的判据、实测值和异常根因均回链到已关联材料：${m.tree.version}、${count} 项结果汇总、${m.shotCount} 发原始记录和《${m.analysisTitle}》。`, '试验结果汇总'),
    ],
    basis: [
      p('basis-documents', `试验依据为《某型装备研制总要求》、${m.tree.version}以及${m.outline}。指标名称和判据以本次选择的已发布指标树为准，共 ${m.tree.count || count} 项。若大纲表述与指标树不一致，以已发布指标树的判据版本为准，并在修订记录中说明差异。`, `${m.tree.version} · ${m.tree.srcDoc || '研制总要求'}`),
      p('basis-environment', '试验条件按审定大纲执行。环境适应性覆盖低温与高温工况，机动、射击和精度科目使用大纲规定的场地、靶距和测量链路。设备状态、气象和校准情况记在试验条件记录中，正文判定应与各指标实际采用的条件一致。', '试验大纲、条件记录'),
      p('basis-method', '结果按指标名称与判据逐项比对。计量单位沿用指标树，不在报告中另行换算。原始记录按发次编号关联，统计汇总与单发异常分开存放，避免用批次均值掩盖第19发超差。', '试验结果汇总'),
    ],
    execution: [
      p('execution-process', `试验按审定科目顺序实施，形成 ${count} 项结果。数据经测量链路回传后，先核对发次编号和字段完整性，再与${m.tree.version}匹配。异常发次保留原始编号。复测使用独立记录，不覆盖首测字段，也不改变正式样本的发次顺序。`, `${m.sourceName} · ${m.taskId}`),
      p('execution-event', `第 ${m.shot.shotNo} 发触发立靶高低偏差告警，首测 ${m.shot.firstDh} ${m.shot.unit}，判据为 ≤${m.shot.criterion.toFixed(2)} ${m.shot.unit}。现场建立异常事件 ${m.eventId}，关联《${m.analysisTitle}》记录定位和处置。该发方向偏差、初速和其余批次指标仍按各自判据单独判定，不因这一发超差整批否决。`, '试验原始数据、异常分析报告'),
    ],
    data: [
      p('data-fields', `${m.shotCount} 发正式试验原始数据与 1 发复测数据汇总成表，逐发记录立靶高低偏差、方向偏差、炮口初速、膛压和射速。第 ${m.shot.shotNo} 发首测高低偏差 ${m.shot.firstDh} ${m.shot.unit}、复测 ${m.shot.retestDh} ${m.shot.unit}，均可按发次和事件 ${m.eventId} 检索。表中炮口初速取弹道测量文件，与指标树中的初速判据对应。`, `${m.sourceName} · ${m.taskId}`),
      p('data-statistics', `批次统计以 ${m.shotCount} 发正式记录为对象，第 ${m.shot.shotNo} 发的 1 条复测记录单独列表。高低偏差的批次分布不把复测值写回首测位置。各项汇总值应能回到对应发次，单发超差不并进“全部直接符合”的计数。`, '试验结果汇总'),
      p('data-quality', `完整性检查覆盖 ${m.shotCount} 发正式记录和独立复测记录，缺项不补造。当前判定使用关联材料中的实测值。若后续修订措辞，需同时注明原因、来源版本和修改时间，不能只改结论句。`, '数据回传任务'),
    ],
    judgment: [
      p('judgment-method', `依据${m.tree.version}逐项比对。${count} 项中 ${passed.length} 项符合、${retested.length} 项复测后符合。直接符合的包括：${samples}。${anomaly ? `${anomaly.name} 的结果记为「${anomaly.value}」，判定「${anomaly.conclusion}」，不能改成首测符合。` : ''}`, '指标树判据、试验结果汇总'),
      { id: 'judgment-table', kind: 'metrics', text: `${count} 项符合性判定表。判据来源：${m.tree.version}。复测项与直接符合项分列，表中保留首测和复测两个值。`, source: m.tree.version, rows: cloneReportData(m.metrics) },
    ],
    abnormal: [
      p('anomaly-facts', `异常事件 ${m.eventId} 对应第 ${m.shot.shotNo} 发立靶高低偏差 ${m.shot.firstDh} ${m.shot.unit}。分析报告将「${m.cause}」列为首位候选根因，置信度 ${m.confidence}。证据包括飞行段姿态角偏差、温度传感器跳变和标定台温补系数偏差。置信度只说明候选排序，不能替代复测结论，也不能写成已经定性的唯一原因。`, `《${m.analysisTitle}》`),
      p('anomaly-retest', `完成温补处置后组织复验，立靶高低偏差为 ${m.shot.retestDh} ${m.shot.unit}，满足 ≤${m.shot.criterion.toFixed(2)} ${m.shot.unit}。首测 ${m.shot.firstDh} ${m.shot.unit} 继续保留在原始记录和判定表中。异常记录、处置单和复测记录共同构成闭环，归档时核对三者的发次和事件编号一致。`, '异常分析报告、复测记录'),
    ],
    conclusion: [
      p('conclusion-result', `综合 ${count} 项结果：${passed.length} 项直接符合，${retested.length} 项复测后符合。第 ${m.shot.shotNo} 发原始超差予以保留，结论同时引用首测 ${m.shot.firstDh} ${m.shot.unit} 与复测 ${m.shot.retestDh} ${m.shot.unit}。本批次在复测闭环成立的前提下，判定该超差项复测后符合，其余已测指标按表列结论执行。`, '符合性判定表、异常与处置章节'),
      p('conclusion-scope', `上述结论只适用于 ${m.batch} 批次和大纲规定的试验条件。正式定稿前应完成判据引用、数据勾稽和术语规范审查。若新增样本或更新指标树版本，需重新核对结论并保留修订轨迹。`, '本报告判定范围'),
    ],
    attachments: [
      p('attachments-list', `随报告归集：${m.tree.version} 判据集、${count} 项结果汇总、${m.shotCount} 发正式试验记录、1 发复测记录，以及《${m.analysisTitle}》。附件用于复核正文里的实测值、异常处置和结论，不单独形成另一套判定。`, '自动关联材料'),
      p('attachments-index', '附件建立文档名称、版本、记录位置和正文引用的对应关系。审查时可以从结论句回到指标树版本、发次记录和异常事件编号。', '附件目录'),
    ],
  }
}

export function generateReportSections(report) {
  const template = reportTemplates.find((item) => item.id === report.templateId) || reportTemplates[0]
  const bodies = buildBodies(report.materials)
  const used = new Set()
  const fallback = ['overview', 'basis', 'execution', 'data', 'judgment', 'abnormal', 'conclusion', 'attachments']
  return template.chapters.map((title, index) => {
    const role = roleOf[title] || fallback[index % fallback.length]
    const suffix = used.has(role) ? `-c${index + 1}` : ''
    used.add(role)
    return {
      id: `chapter-${index + 1}`,
      title,
      number: index + 1,
      blocks: bodies[role].map((block) => ({ ...cloneReportData(block), id: `${block.id}${suffix}` })),
    }
  })
}

export function inspectReport(report, packs) {
  const sections = cloneReportData(report.sections)
  const issues = []
  const add = (pack, type, severity, blockId, title, basis, suggestion, replacement) => {
    if (!packs.includes(pack)) return
    const section = sections.find((item) => item.blocks.some((block) => block.id === blockId))
    const block = section?.blocks.find((item) => item.id === blockId)
    if (!block || (replacement && block.text === replacement)) return
    issues.push({
      id: `issue-${issues.length + 1}`, pack, type, severity, blockId, title, basis, suggestion, replacement,
      originalText: block.text, location: `第${section.number}章 ${section.title} · 第${section.blocks.indexOf(block) + 1}段`, status: '待处理',
    })
  }
  const text = (id) => sections.flatMap((section) => section.blocks).find((block) => block.id === id)?.text || ''
  const shot = report.materials.shot
  const delta = (shot.firstDh - shot.criterion).toFixed(2)
  if (text('data-fields').includes('炮口初速')) add('术语规范', '核文勘误', '一般', 'data-fields', '同一测量参数的术语不统一', '报告术语规范要求弹道速度统一写作「弹丸初速」。本段同时出现「炮口初速」，和指标树、判定表的叫法不一致。', '将「炮口初速」统一改为「弹丸初速」，实测值和单位保持不变。', text('data-fields').replaceAll('炮口初速', '弹丸初速'))
  if (text('anomaly-retest').includes('复验')) add('术语规范', '语义规则', '一般', 'anomaly-retest', '处置后的重复测量称谓不一致', '结果汇总和判定表使用「复测后符合」。本段写成「复验」，审校时无法与判定表直接对应。', '将「复验」统一为「复测」，与判定表用词一致。', text('anomaly-retest').replaceAll('复验', '复测'))
  if (!text('data-statistics').includes('不并入')) add('数据勾稽', '本体逻辑', '重要', 'data-statistics', '复测样本是否并入正式统计没有写清', `已关联数据是 ${report.materials.shotCount} 发正式记录加 1 发复测。本段只说单独列表，没有明确复测不进入正式样本基数。`, '写明正式统计基数，并声明复测记录不并入正式样本。', `${text('data-statistics')} 正式试验统计以 ${report.materials.shotCount} 发为基数，1 发复测记录单独列示，不并入正式样本统计。`)
  if (!text('anomaly-facts').includes(report.materials.analysisVersion)) add('判据引用', '跨文档联合', '重要', 'anomaly-facts', '异常分析报告引用缺少版本', `已关联的解读报告版本是 ${report.materials.analysisVersion}，事件编号是 ${report.materials.eventId}。本段只写了报告名称和根因，版本无法唯一对应。`, '补上已关联报告的版本和事件编号。', `${text('anomaly-facts')} 引用版本：${report.materials.analysisVersion}；事件编号：${report.materials.eventId}。`)
  if (!text('judgment-table').includes('逐项条款')) add('判据引用', '标准符合性', '重要', 'judgment-table', '判定表还没有逐项判据条款定位', `${report.materials.tree.version} 已给出判据和实测值，但表中没有每项指标对应的原文条款号。当前材料里没有条款号，不能自动编造。`, '核对指标树原文后补逐项条款号；没有出处的条款不要自行编号。', null)
  if (!text('conclusion-result').includes('不得将复测结果回写为首测合格')) add('数据勾稽', '跨文档联合', '严重', 'conclusion-result', '复测符合可能被读成首测合格', `第 ${shot.shotNo} 发首测 ${shot.firstDh} ${shot.unit} 已超过 ≤${shot.criterion.toFixed(2)} ${shot.unit}，复测 ${shot.retestDh} ${shot.unit} 才符合。结论段并列了两个值，但没有禁止把复测结果回写为首测合格。`, '在结论中明确：复测符合不能回写为首测合格，两套数值都要保留。', `${text('conclusion-result')} 不得将复测结果回写为首测合格。`)
  if (!text('execution-event').includes('超出判据')) add('数据勾稽', '本体逻辑', '严重', 'execution-event', '超差幅度没有单独写明，容易和复测值混读', `首测 ${shot.firstDh} ${shot.unit} 比判据 ${shot.criterion.toFixed(2)} ${shot.unit} 高出 ${delta} ${shot.unit}，复测已回到 ${shot.retestDh} ${shot.unit}。本段只并列了两个数，没有写出超差幅度。`, `补充超差幅度 ${delta} ${shot.unit}，并说明该幅度针对首测，不针对复测。`, `${text('execution-event')} 首测超出判据 ${delta} ${shot.unit}，该幅度只描述首测，复测值另行判定。`)
  return { id: `REVIEW-${Date.now()}`, reportId: report.id, reportTitle: report.title, version: report.version, sections, packs: [...packs], issues, createdAt: workflowTime(), status: '已完成' }
}

export function seedWorkflow(store) {
  if (reportWorkflow.seeded) return
  const tree = (store.m03List || []).find((row) => row.status === '已发布') || { id: 'v1', version: '指标树 V1.0', srcDoc: 'D-01《某型研制总要求》', count: 28, status: '已发布' }
  const materials = collectReportMaterials(tree, store)
  const make = (title, stage, status, time, withSections, index) => {
    const report = createWorkflowReport(title, 'qualification', materials)
    report.id = `REPORT-SEED-${index}`
    report.stage = stage
    report.status = status
    report.createdAt = time
    report.updatedAt = time
    report.outlineNotes = outlineBlurbs(reportTemplates[0], report.materials)
    if (withSections) report.sections = generateReportSections(report)
    return report
  }
  reportWorkflow.reports.push(
    make('某型装备性能鉴定试验报告（28项指标揭示）', 'draft', '进行中', '2026-10-26 20:46:03', true, 1),
    make('某型装备性能鉴定试验报告', 'materials', '进行中', '2026-10-26 16:16:09', false, 2),
    make('某型装备性能鉴定试验报告', 'draft', '已完成', '2026-10-26 12:44:47', true, 3),
    make('某型装备性能鉴定试验报告', 'draft', '进行中', '2026-10-26 12:43:02', true, 4),
  )
  reportWorkflow.seeded = true
}
