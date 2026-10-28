import { reactive } from 'vue'
import { tank99aIndicators } from './tank99a'

export const postTrialState = reactive({
  generated: true,
  currentVersion: 'V1（初稿）',
  selectedChapter: '符合性判定',
  activeIssueId: 7,
  reviewProcessed: 5,
  reviewAccepted: 5,
  archived: true,
  archiveTime: '2026-10-22 16:38',
})

export const postTrialMaterials = [
  { id: 'rule', name: '指标树判据', meta: '指标树 V1.0 · 44 项', source: '试验指标树（Part1）', status: '已关联', tone: 'blue' },
  { id: 'data', name: '精度试验数据汇总', meta: 'D-07 · 30 发回传 + 1 组复测', source: '精度试验数据回传接入 T01', status: '已汇集', tone: 'blue' },
  { id: 'event', name: '第19发超差事件解读报告', meta: '温补失效根因 · 温补校准后复测', source: '探针设计与智能定位平台', status: '已引用', tone: 'blue' },
]

export const postTrialOutline = [
  { no: '1', name: '试验任务概述', source: '标准模板', children: ['任务来源', '鉴定目的', '受试对象'] },
  { no: '2', name: '试验依据', source: '指标树 V1.0', children: ['引用标准', '判定规则', '版本说明'] },
  { no: '3', name: '试验条件', source: '数据汇总表', children: ['环境条件', '设备与保障', '人员分工'] },
  { no: '4', name: '试验实施', source: '试验记录', children: ['样本与工况', '实施过程', '数据质量'] },
  { no: '5', name: '试验结果', source: '精度试验数据回传 T01', children: ['原始结果', '统计结果', '图表汇总'] },
  { no: '6', name: '符合性判定', source: '指标树 + D-07 汇总', children: ['44项指标判定', '复测结论', '判据引用'] },
  { no: '7', name: '异常事件与处置', source: '第19发超差事件解读报告', children: ['超差现象', '根因定位', '校准与复测'] },
  { no: '8', name: '结论与建议', source: '自动装配', children: ['鉴定结论', '遗留事项', '后续建议'] },
]

function measuredValue(item) {
  if (item.code === 'HC-007') return '首测 0.42 / 复测 0.18 m'
  const text = String(item.criteria || '')
  const upper = text.match(/^[≤<]\s*([\d.]+)/)
  if (upper) {
    const n = Number(upper[1])
    const next = n >= 10 ? Math.round(n * 0.92 * 10) / 10 : Math.round(n * 0.9 * 100) / 100
    return text.replace(/[\d.]+/, String(next)).replace(/^[≤<]\s*/, '')
  }
  const lower = text.match(/^[≥>]\s*([\d.]+)/)
  if (lower) {
    const n = Number(lower[1])
    const next = n >= 10 ? Math.round(n * 1.06 * 10) / 10 : Math.round(n * 1.08 * 100) / 100
    return text.replace(/[\d.]+/, String(next)).replace(/^[≥>]\s*/, '')
  }
  return text
}

export const postTrialMetrics = tank99aIndicators.map((item, index) => ({
  no: index + 1,
  code: item.code,
  name: item.name,
  criterion: item.criteria,
  value: measuredValue(item),
  conclusion: item.code === 'HC-007' ? '复测后符合' : '符合',
  source: '指标树 V1.0',
  event: item.code === 'HC-007' ? '关联第19发超差事件 EVT-001' : '',
  linkedShot: item.code === 'HC-007' ? 19 : null,
}))

export const reviewTasks = [
  // name/target 由 PostTrial 按 demo-store.draftReport 动态覆盖，保证与生成报告名联动
  { id: 'review-v1', name: '某型性能鉴定试验报告V1审查', target: '某型性能鉴定试验报告 V1', rules: '鉴定报告综合审查规则集 V2.4', issues: 7, status: '已完成', time: '2026-10-22 15:46' },
  { id: 'review-outline', name: '试验提纲一致性复核', target: '性能试验提纲 V4', rules: '提纲完整性规则集 V1.8', issues: 2, status: '已完成', time: '2026-10-21 17:20' },
  { id: 'review-record', name: '原始记录规范性检查', target: '第1～30发原始记录', rules: '记录表规范规则集 V1.3', issues: 4, status: '待复核', time: '2026-10-22 14:08' },
]

export const reviewIssues = reactive([
  { id: 1, type: '术语规范', title: '“实验”应统一为“试验”', location: '1.2 鉴定目的，第2段', basis: '跨文书术语映射 TERM-001', suggestion: '将“实验”替换为“试验”。', status: '已采纳', handler: '陈工', time: '2026-10-22 16:01', snippet: '本次实验用于验证在规定工况下的性能。' },
  { id: 2, type: '术语规范', title: '型号书写格式不统一', location: '3.1 受试对象，第1段', basis: '型号术语库 V3.2', suggestion: '统一采用“某型 A01”。', status: '已采纳', handler: '陈工', time: '2026-10-22 16:03', snippet: '受试对象为某型A-01。' },
  { id: 3, type: '术语规范', title: '“校准后复验”建议改为“校准后复测”', location: '7.3 校准与复测，第1段', basis: '鉴定业务术语映射 TERM-028', suggestion: '与试验记录及处置单保持一致。', status: '已采纳', handler: '李工', time: '2026-10-22 16:05', snippet: '完成温补校准后组织复验。' },
  { id: 4, type: '数据勾稽', title: '结论章样本量与实施章不一致：30/29', location: '8.1 鉴定结论，第1段', basis: '跨章节数据勾稽规则 DATA-014', suggestion: '结论章样本量更新为30发，并补充1组复测数据说明。', status: '已采纳', handler: '王工', time: '2026-10-22 16:11', snippet: '本次共完成29发有效样本测试。' },
  { id: 5, type: '数据勾稽', title: '复测数据未计入结果汇总表统计说明', location: '5.3 图表汇总，表5-2', basis: '结果汇总完整性规则 DATA-021', suggestion: '增加“复测数据单列、不重复计入30发统计量”说明。', status: '已采纳', handler: '王工', time: '2026-10-22 16:14', snippet: '表5-2 汇总30发原始试验数据。' },
  { id: 6, type: '判据引用', title: '定位精度判据缺少条款号', location: '6.1 符合性判定，第18项', basis: '引用完整性规则 CITE-009', suggestion: '补充指标树条款 6.4.2。', status: '采纳中', handler: '赵工', time: '2026-10-22 16:21', snippet: '定位精度判据为不大于0.5m。' },
  { id: 7, type: '判据引用', title: '越壕宽判据引用版本为V0.9，应更新为V1.0', location: '6.1 符合性判定，第9项', basis: '判据版本校验规则 CITE-016', suggestion: '替换为指标树 V1.0 对应条款并保留修改记录。', status: '采纳中', handler: '赵工', time: '2026-10-22 16:24', snippet: '越壕宽应不小于1.8m（引自指标树V0.9）。' },
])

export const archiveRows = reactive([
  { id: 'RPT-2026-1022-001', name: '试验报告V2（定稿）', type: '性能鉴定试验报告', secret: '内部', version: 'V2', time: '2026-10-22 16:38', status: '已入库', owner: '试验鉴定一室', source: '试验报告V1审查任务' },
  { id: 'OUT-2026-1018-006', name: '性能试验提纲V4', type: '试验提纲', secret: '内部', version: 'V4', time: '2026-10-18 09:30', status: '已入库', owner: '试验鉴定一室', source: '试验设计阶段 · 大纲定稿' },
  { id: 'RPT-001', name: '第19发超差事件解读报告', type: '异常分析报告', secret: '内部', version: 'V1.1', time: '2026-10-22 11:12', status: '已入库', owner: '数据分析组', source: '探针设计与智能定位平台' },
])
