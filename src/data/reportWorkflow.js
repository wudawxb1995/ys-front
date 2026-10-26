import { reactive, watch } from 'vue'
import { postTrialMetrics } from '@/data/postTrial'
import { shots30 } from '@/data/mock'

export const reportTemplates = [
  { id: 'qualification', name: '性能鉴定试验报告', description: '8 章 · 概述、条件、数据、判定、异常、结论', chapters: ['试验概述', '试验依据与条件', '试验实施情况', '试验数据汇总', '符合性判定', '异常与处置', '结论', '附件'] },
  { id: 'analysis', name: '专项试验分析报告', description: '6 章 · 单项复盘，含异常定位与根因', chapters: ['试验任务与依据', '试验条件与实施', '试验数据汇总', '试验结果与判定', '异常定位与根因分析', '结论与建议'] },
  { id: 'databook', name: '试验数据汇总报告', description: '5 章 · 样本与实测对照，适合数据复核', chapters: ['数据来源与样本', '原始记录汇总', '指标实测对照', '异常样本说明', '汇总结论'] },
  { id: 'event', name: '异常事件复盘报告', description: '5 章 · 超差事实、证据、复测与处置', chapters: ['事件概况', '超差事实', '根因与证据', '复测闭环', '处置建议'] },
  { id: 'brief', name: '鉴定结论简报', description: '4 章 · 压缩判定与异常闭环，便于会签', chapters: ['鉴定范围', '主要判定', '异常闭环', '结论'] },
  { id: 'env', name: '环境适应性试验报告', description: '6 章 · 高低温工况分列与判定', chapters: ['试验概述', '环境条件与测点', '低温工况结果', '高温工况结果', '符合性判定', '结论'] },
  { id: 'precision', name: '精度指标复核报告', description: '5 章 · 逐项实测对照与超差复核', chapters: ['复核任务与依据', '样本与数据来源', '逐项实测对照', '超差发次复核', '复核结论'] },
  { id: 'zeroing', name: '异常归零报告', description: '4 章 · 问题、原因、措施验证与归零', chapters: ['问题描述', '原因分析', '措施与验证', '归零结论'] },
  { id: 'compliance', name: '大纲符合性核查报告', description: '6 章 · 核查范围、依据、差异与结论', chapters: ['核查范围', '依据文件', '核查项与结论', '差异说明', '核查结论', '附件'] },
]
export const reviewRulePacks = ['术语规范', '数据勾稽', '判据引用']
export const reviewTypes = ['全部', '语义规则', '核文勘误', '跨文档联合', '本体逻辑', '标准符合性']
export const cloneReportData = (value) => JSON.parse(JSON.stringify(value))
export const workflowTime = () => new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Shanghai', hour12: false })
const storageKey = 'ys-report-workflow-v3'
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
  dict['环境条件与测点'] = `给出 -41℃ / 常温 / +55℃ 温度点、保温要求和测点布置。条件偏差不超过 ±2℃，测点位移后须重新核对可比性。`
  dict['低温工况结果'] = `低温工况完成冷启动、显示操控与供电续航科目，重点记录电池电压下降和响应变慢。低温数据与常温基线分开存放。`
  dict['高温工况结果'] = `高温工况连续通电 4 h，按小时记录温漂与解算偏差。结果满足判据，并与常温数据对照说明趋势。`
  dict['复核任务与依据'] = `说明复核对象、基线 ${m.tree.version} 和样本范围（${m.shotCount} 发 + 1 发复测）。复核只做比对与追溯，不改写原始记录。`
  dict['样本与数据来源'] = `样本来自 ${m.sourceName}（${m.taskId}），批次 ${m.batch}。正式样本与复测样本分开编号，缺失项不补造。`
  dict['逐项实测对照'] = `按判据逐项列出实测值与判定，${m.metrics.length} 项中 ${passed} 项直接符合、${retested} 项复测后符合。表格保留首测与复测两个值。`
  dict['超差发次复核'] = `复核第 ${m.shot.shotNo} 发首测 ${m.shot.firstDh} ${m.shot.unit}、复测 ${m.shot.retestDh} ${m.shot.unit}，核对证据链与处置记录是否闭合。`
  dict['复核结论'] = `复核结论与判定表一致：${passed} 项直接符合、${retested} 项复测后符合，单发超差已闭环，不外推为批次共性问题。`
  dict['问题描述'] = `写清第 ${m.shot.shotNo} 发超差事实、触发判据和影响范围，事件编号 ${m.eventId}。同发其他指标未同步异常。`
  dict['原因分析'] = `首位候选根因「${m.cause}」置信度 ${m.confidence}，证据来自姿态、温度与标定资料。置信度只用于排序，不作唯一定性。`
  dict['措施与验证'] = `处置为温补重新标定并复检回路，复测 ${m.shot.retestDh} ${m.shot.unit} 满足判据，其余发次回溯未见同类特征。`
  dict['归零结论'] = `按技术归零要求收口：事实清楚、原因定位、措施有效、复测闭环，首测记录保留，后续批次纳入班前自检项。`
  dict['核查范围'] = `核查 ${m.metrics.length} 项判定的科目覆盖、样本数量与判据引用完整性，范围限于本批次报告正文及其引用材料。`
  dict['依据文件'] = `列出研制总要求、${m.tree.version} 与 ${m.outline}，并说明版本基线与差异处理原则。`
  dict['核查项与结论'] = `核查项逐条对应判据与实测值，${passed} 项直接符合、${retested} 项复测后符合，未发现无依据判定。`
  dict['差异说明'] = `说明报告与大纲的术语和数值差异：术语需统一，数值与原始记录逐发一致，复测值不替代首测值。`
  dict['核查结论'] = `核查通过，报告可作为定稿基线；术语差异在定稿前统一，指标树升版时重新核对引用。`
  return template.chapters.map((title, index) => dict[title] || `第 ${index + 1} 章按「${template.name}」写入已关联的 ${m.metrics.length} 项结果，并注明可回溯来源。`)
}

const roleOf = {
  '试验概述': 'overview', '鉴定范围': 'overview', '事件概况': 'overview', '数据来源与样本': 'overview',
  '试验依据与条件': 'basis', '试验任务与依据': 'basis', '复核任务与依据': 'recheck', '依据文件': 'basis',
  '试验实施情况': 'execution', '试验条件与实施': 'execution', '超差事实': 'execution',
  '试验数据汇总': 'data', '原始记录汇总': 'data', '样本与数据来源': 'data',
  '符合性判定': 'judgment', '试验结果与判定': 'judgment', '指标实测对照': 'judgment', '主要判定': 'judgment', '逐项实测对照': 'judgment', '核查项与结论': 'judgment',
  '异常与处置': 'abnormal', '异常定位与根因分析': 'abnormal', '异常样本说明': 'abnormal', '根因与证据': 'abnormal', '复测闭环': 'abnormal', '异常闭环': 'abnormal', '超差发次复核': 'abnormal', '原因分析': 'abnormal',
  '结论': 'conclusion', '结论与建议': 'conclusion', '汇总结论': 'conclusion', '处置建议': 'conclusion', '复核结论': 'conclusion', '归零结论': 'conclusion', '核查结论': 'conclusion',
  '附件': 'attachments',
  '环境条件与测点': 'env', '低温工况结果': 'cold', '高温工况结果': 'hot',
  '问题描述': 'facts', '措施与验证': 'retest', '核查范围': 'scope', '差异说明': 'diff',
}

function buildBodies(m) {
  const count = m.metrics.length
  const retested = m.metrics.filter((row) => row.conclusion === '复测后符合')
  const passed = m.metrics.filter((row) => row.conclusion === '符合')
  const samples = passed.slice(0, 4).map((row) => `${row.name}（判据 ${row.criterion}，实测 ${row.value}，判定符合）`).join('；')
  const anomaly = m.metrics.find((row) => row.linkedShot) || retested[0]
  const others = Math.max(m.shotCount - 1, 1)
  const p = (id, text, source) => ({ id, text, source, kind: 'paragraph' })
  return {
    overview: [
      p('overview-scope', `本次性能鉴定依据《某型装备研制总要求》和${m.outline}组织实施，受试对象为本批次定型样机。报告按${m.tree.version}汇总 ${count} 项试验结果，覆盖环境适应、机动性能、火控精度、供电通信和安全联锁。精度试验正式样本 ${m.shotCount} 发；第 ${m.shot.shotNo} 发立靶高低偏差超限后，另完成 1 发同工况复测。正式样本与复测样本分开编号，不在概述中把复测结果算进首测合格数。`, '指标树判据、试验结果汇总'),
      p('overview-samples', `样本来自${m.sourceName}（${m.taskId}），批次 ${m.batch}。${passed.length} 项指标在规定工况下直接判定符合，${retested.length} 项经复测后符合。第 ${m.shot.shotNo} 发首测高低偏差 ${m.shot.firstDh} ${m.shot.unit}，复测 ${m.shot.retestDh} ${m.shot.unit}，两条记录都保留，供后续审校核对处置是否闭环。`, `${m.sourceName} · ${m.taskId}`),
      p('overview-organization', `鉴定工作由承试单位组织，使用单位派员见证，测量设备在检定有效期内使用。科目顺序、样本数量、暂停与恢复条件按${m.outline}执行；现场变更须经技术负责人确认并记入试验日志，避免后续用回忆或补记替代原始记录。`, '试验大纲、试验日志'),
      p('overview-purpose', `本报告用于固定本批次试验事实，不替代签署后的正式结论。正文中的判据、实测值和异常根因均回链到已关联材料：${m.tree.version}、${count} 项结果汇总、${m.shotCount} 发原始记录和《${m.analysisTitle}》。任一判定句都可以顺着发次编号回到源文件。`, '试验结果汇总'),
      p('overview-key-result', `结果提要：${count} 项中 ${passed.length} 项直接符合、${retested.length} 项复测后符合，无判定不符合项。第 ${m.shot.shotNo} 发首测超标属单发异常，已按事件 ${m.eventId} 完成定位、处置与复测，处置过程单独成章，不与批次统计混写。`, '符合性判定表'),
    ],
    basis: [
      p('basis-documents', `试验依据为《某型装备研制总要求》、${m.tree.version}以及${m.outline}。指标名称和判据以本次选择的已发布指标树为准，共 ${m.tree.count || count} 项。若大纲表述与指标树不一致，以已发布指标树的判据版本为准，并在修订记录中说明差异。`, `${m.tree.version} · ${m.tree.srcDoc || '研制总要求'}`),
      p('basis-version', `判据版本基线固定为${m.tree.version}，报告、判定表和原始记录引用同一版本。指标树在试验期间未发生升版；如后续升版，须重新核对已有判定并保留旧版判定痕迹，防止同一报告内出现两套判据。`, `${m.tree.version} 发布记录`),
      p('basis-environment', '试验条件按审定大纲执行。环境适应性覆盖低温与高温工况，机动、射击和精度科目使用大纲规定的场地、靶距和测量链路。设备状态、气象和校准情况记在试验条件记录中，正文判定应与各指标实际采用的条件一致。', '试验大纲、条件记录'),
      p('basis-method', '结果按指标名称与判据逐项比对。计量单位沿用指标树，不在报告中另行换算。原始记录按发次编号关联，统计汇总与单发异常分开存放，避免用批次均值掩盖第19发超差。', '试验结果汇总'),
      p('basis-boundary', '判据分为上限型、下限型和区间型三类，比对时按原判据方向取值，临界值按“等于判据即为符合”处理。区间型指标同时核对上下限，不因一侧满足就整体判符合；判定表中保留判据原文，便于校核人员复核取值方向。', '指标树判据、判定表'),
    ],
    execution: [
      p('execution-process', `试验按审定科目顺序实施，形成 ${count} 项结果。数据经测量链路回传后，先核对发次编号和字段完整性，再与${m.tree.version}匹配。异常发次保留原始编号。复测使用独立记录，不覆盖首测字段，也不改变正式样本的发次顺序。`, `${m.sourceName} · ${m.taskId}`),
      p('execution-event', `第 ${m.shot.shotNo} 发触发立靶高低偏差告警，首测 ${m.shot.firstDh} ${m.shot.unit}，判据为 ≤${m.shot.criterion.toFixed(2)} ${m.shot.unit}。现场建立异常事件 ${m.eventId}，关联《${m.analysisTitle}》记录定位和处置。该发方向偏差、初速和其余批次指标仍按各自判据单独判定，不因这一发超差整批否决。`, '试验原始数据、异常分析报告'),
      p('execution-records', `原始记录按“批次－科目－发次”三级编号，靶纸、测量文件与设备日志同号存放。记录现场填写、当场签字，涂改处保留原值并签注原因。汇总表的每一行都能反查到具体发次，复测记录使用独立编号，不与首测共用行。`, '试验原始数据、记录台账'),
      p('execution-quality', `过程质量控制包括班前设备自检、班中数据完整性抽查和班后交叉复核。温补处置后先做功能检查再进入复测，避免带故障状态继续取样。所有暂停、恢复和参数调整都记入试验日志，作为后续解释异常的依据。`, '试验日志、设备自检记录'),
    ],
    data: [
      p('data-fields', `${m.shotCount} 发正式试验原始数据与 1 发复测数据汇总成表，逐发记录立靶高低偏差、方向偏差、炮口初速、膛压和射速。第 ${m.shot.shotNo} 发首测高低偏差 ${m.shot.firstDh} ${m.shot.unit}、复测 ${m.shot.retestDh} ${m.shot.unit}，均可按发次和事件 ${m.eventId} 检索。表中炮口初速取弹道测量文件，与指标树中的初速判据对应。`, `${m.sourceName} · ${m.taskId}`),
      p('data-statistics', `批次统计以 ${m.shotCount} 发正式记录为对象，第 ${m.shot.shotNo} 发的 1 条复测记录单独列表。高低偏差的批次分布不把复测值写回首测位置。各项汇总值应能回到对应发次，单发超差不并进“全部直接符合”的计数。`, '试验结果汇总'),
      p('data-distribution', `剔除第 ${m.shot.shotNo} 发后，其余 ${others} 发高低偏差集中在 0.12～0.24 ${m.shot.unit} 区间，方向偏差波动更小，离散度未随发次顺序出现趋势性放大。第 ${m.shot.shotNo} 发 0.42 ${m.shot.unit} 作为离群点单独标注，复测 0.18 ${m.shot.unit} 回落到该区间内，说明偏差来源与单发状态有关，不具备批次共性。`, '试验原始数据、统计分析结果'),
      p('data-quality', `完整性检查覆盖 ${m.shotCount} 发正式记录和独立复测记录，缺项不补造。当前判定使用关联材料中的实测值。若后续修订措辞，需同时注明原因、来源版本和修改时间，不能只改结论句。`, '数据回传任务'),
    ],
    judgment: [
      p('judgment-method', `依据${m.tree.version}逐项比对。${count} 项中 ${passed.length} 项符合、${retested.length} 项复测后符合。直接符合的包括：${samples}。${anomaly ? `${anomaly.name} 的结果记为「${anomaly.value}」，判定「${anomaly.conclusion}」，不能改成首测符合。` : ''}`, '指标树判据、试验结果汇总'),
      p('judgment-retest', `复测后符合的判定口径：以处置完成后的同工况复测值对照原判据，首测值同步保留在判定表中。复测时间、处置内容和操作人员一并记录，判定结论注明“复测后符合”，不写成“符合”，以便校核人员识别处置过程。`, '复测记录、判定表'),
      { id: 'judgment-table', kind: 'metrics', text: `${count} 项符合性判定表。判据来源：${m.tree.version}。复测项与直接符合项分列，表中保留首测和复测两个值。`, source: m.tree.version, rows: cloneReportData(m.metrics) },
    ],
    abnormal: [
      p('anomaly-facts', `异常事件 ${m.eventId} 对应第 ${m.shot.shotNo} 发立靶高低偏差 ${m.shot.firstDh} ${m.shot.unit}。分析报告将「${m.cause}」列为首位候选根因，置信度 ${m.confidence}。证据包括飞行段姿态角偏差、温度传感器跳变和标定台温补系数偏差。置信度只说明候选排序，不能替代复测结论，也不能写成已经定性的唯一原因。`, `《${m.analysisTitle}》`),
      p('anomaly-evidence', `证据链分三层：原始层为靶纸、测量文件和设备日志；分析层为姿态角、温度与初速的时序对比；处置层为温补标定记录和处置前后的功能检查。三层证据按发次和事件编号串联，任一环节缺失都不能得出闭环结论。`, '异常分析报告、标定资料'),
      p('anomaly-retest', `完成温补处置后组织复验，立靶高低偏差为 ${m.shot.retestDh} ${m.shot.unit}，满足 ≤${m.shot.criterion.toFixed(2)} ${m.shot.unit}。首测 ${m.shot.firstDh} ${m.shot.unit} 继续保留在原始记录和判定表中。异常记录、处置单和复测记录共同构成闭环，归档时核对三者的发次和事件编号一致。`, '异常分析报告、复测记录'),
      p('anomaly-closure', `处置后对同批次其余发次做回溯排查，未发现同类温补漂移特征，判定为单发状态类异常。后续试验将温补系数检查纳入班前自检项，并在数据回传环节增加立靶偏差阈值提醒，避免类似偏差进入汇总表后才被发现。`, '异常分析报告、处置单'),
    ],
    conclusion: [
      p('conclusion-result', `综合 ${count} 项结果：${passed.length} 项直接符合，${retested.length} 项复测后符合。第 ${m.shot.shotNo} 发原始超差予以保留，结论同时引用首测 ${m.shot.firstDh} ${m.shot.unit} 与复测 ${m.shot.retestDh} ${m.shot.unit}。本批次在复测闭环成立的前提下，判定该超差项复测后符合，其余已测指标按表列结论执行。`, '符合性判定表、异常与处置章节'),
      p('conclusion-scope', `上述结论只适用于 ${m.batch} 批次和大纲规定的试验条件。正式定稿前应完成判据引用、数据勾稽和术语规范审查。若新增样本或更新指标树版本，需重新核对结论并保留修订轨迹。`, '本报告判定范围'),
      p('conclusion-advice', `建议后续批次把温补系数核查和立靶偏差阈值提醒固化到试验准备流程；指标树升版时同步更新判定表引用；对复测后符合的指标，在结论中始终并列首测与复测值，避免被读成首测合格。`, '本报告判定范围、异常与处置章节'),
    ],
    attachments: [
      p('attachments-list', `随报告归集：${m.tree.version} 判据集、${count} 项结果汇总、${m.shotCount} 发正式试验记录、1 发复测记录，以及《${m.analysisTitle}》。附件用于复核正文里的实测值、异常处置和结论，不单独形成另一套判定。`, '自动关联材料'),
      p('attachments-index', '附件建立文档名称、版本、记录位置和正文引用的对应关系。审查时可以从结论句回到指标树版本、发次记录和异常事件编号。', '附件目录'),
      p('attachments-version', `附件版本与报告版本同步固化，${m.analysisVersion} 为当前引用版本。定稿归档后新增材料以增补形式登记，不改写已归档的原始记录。`, `《${m.analysisTitle}》 ${m.analysisVersion}`),
    ],
    env: [
      p('env-conditions', `环境适应性试验按${m.outline}在高低温试验箱内实施，温度点覆盖 -41℃、常温与 +55℃，每个温度点保温至弹体温度稳定后开始测试。箱内温度、湿度与气压按 10 min 间隔记录，温度偏差不超过 ±2℃。`, '试验大纲、环境条件记录'),
      p('env-points', `测点布置在弹体前舱、控制器与电池舱三处，同步采集温度与供电电压。测点编号与线缆走向在布点图上固定，换装被测样机后重新核对，避免因测点位移导致数据不可比。`, '布点图、条件记录'),
    ],
    cold: [
      p('cold-items', `低温工况完成冷启动、显示与操控、供电续航和解锁时间等科目。样机在 -41℃ 保温结束后直接启动，各科目按大纲规定的间隔连续测试，记录启动次数与失败原因。`, '低温工况记录'),
      p('cold-records', `低温工况数据与常温基线对照，主要差异出现在电池电压下降和显示响应变慢，均在大纲允许范围内。低温记录与常温记录分开存放，不合并统计，避免掩盖温度带来的性能变化。`, '低温工况记录、试验结果汇总'),
    ],
    hot: [
      p('hot-items', `高温工况在 +55℃ 下完成连续工作与温漂检查，样机连续通电 4 h，按小时记录关键参数。高温工况重点核对火控解算与传感器零漂，防止温度累积造成判定偏差。`, '高温工况记录'),
      p('hot-records', `高温工况各项结果满足判据，温漂在处置阈值以内。高温与常温数据对比后未发现趋势性劣化，记录按温度点分别归档，作为后续批次复现的对照基线。`, '高温工况记录、试验结果汇总'),
    ],
    recheck: [
      p('recheck-task', `本次复核对象为本批次精度类指标实测结果，复核基线为${m.tree.version}。复核范围包括立靶高低偏差、方向偏差、初速与射速，样本为 ${m.shotCount} 发正式记录加 1 发复测记录。`, `${m.tree.version}、${m.sourceName}`),
      p('recheck-basis', `复核依据《某型装备研制总要求》、${m.outline}与已发布指标树。复核只对已有记录做比对和追溯，不重新取样，也不改写原始记录；如需补测，另立任务编号并单独说明。`, '研制总要求、试验大纲'),
    ],
    facts: [
      p('facts-event', `第 ${m.shot.shotNo} 发立靶高低偏差首测 ${m.shot.firstDh} ${m.shot.unit}，超过 ≤${m.shot.criterion.toFixed(2)} ${m.shot.unit} 的判据要求，触发异常事件 ${m.eventId}。同发方向偏差、初速与其他指标未出现同步异常，试验按预案暂停并转入定位流程。`, '试验原始数据、异常分析报告'),
      p('facts-impact', `该发异常影响本发次的高低偏差判定，不影响同批次其余发次的取样与统计。按判定口径，本发首测不合格、复测后符合，报告需同时体现两个值与处置过程，避免被读成首测合格。`, '符合性判定表'),
    ],
    retest: [
      p('retest-action', `处置措施为重新标定温补系数并复检传感器回路，处置前后各做一次功能检查。处置内容、执行人和时间记入处置单，与事件 ${m.eventId} 绑定，确保措施可复现。`, '处置单、标定资料'),
      p('retest-verify', `处置后按原工况复测，立靶高低偏差为 ${m.shot.retestDh} ${m.shot.unit}，满足判据要求。复测使用独立编号，首测记录保持原样；同时对其余发次做回溯排查，未发现同类特征，验证措施有效。`, '复测记录、异常分析报告'),
    ],
    scope: [
      p('scope-range', `核查范围为报告正文的全部 ${count} 项判定及其引用材料，重点核对科目覆盖是否完整、样本数量是否与大纲一致、判定是否逐项回链判据版本。`, `${m.tree.version}、试验大纲`),
      p('scope-samples', `样本核查确认 ${m.shotCount} 发正式记录齐备，另有 1 发复测记录单独编号。报告统计口径与原始记录一致，未发现以复测值替代首测值的情况。`, `${m.sourceName} · ${m.taskId}`),
    ],
    diff: [
      p('diff-terms', '报告与大纲在个别术语上存在表述差异，例如初速相关字段在大纲中写作“炮口初速”，指标树中写作“弹丸初速”。差异不影响实测值与判定方向，但需在定稿前统一表述并注明对应关系。', '试验大纲、指标树判据'),
      p('diff-figures', `数值方面，报告判定采用${m.tree.version}的判据与实测值，与原始记录逐发核对一致；第 ${m.shot.shotNo} 发首测与复测两个值均保留。未发现报告数值与原始记录不符的情况。`, '原始记录、判定表'),
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
  const makeReview = (report, index, time) => {
    const review = inspectReport(report, [...reviewRulePacks])
    review.id = `REVIEW-SEED-${index}`
    review.createdAt = time
    return review
  }
  const first = reportWorkflow.reports.find((row) => row.id === 'REPORT-SEED-1')
  const third = reportWorkflow.reports.find((row) => row.id === 'REPORT-SEED-3')
  if (third) reportWorkflow.reviews.push(makeReview(third, 1, '2026-10-26 12:43:18'))
  if (first) reportWorkflow.reviews.push(makeReview(first, 2, '2026-10-26 12:45:03'))
  reportWorkflow.seeded = true
}
