/**
 * M02 关键指标抽取结果：与 99A 研制总案分类抽取稿同源，共 44 项。
 * 列表「抽取指标数」必须与 getM02RowsForDoc(name).length 一致。
 * domain 仍用七域口径，供新建任务筛选；klass 为详情表「性能域/指标类」。
 */
import { isTank99aDoc, tank99aIndicatorRows, tank99aIndicators } from './tank99a'
export const m02Domains = ['机动', '火力', '防护', '可靠性', '环境适应性', '电磁兼容', '信息能力']

/** 非研制总要求类文档的抽取条数（详情用切片，数量与列表联动） */
export const m02CountMap = {
  '雷沃谷神4LZ-8谷物联合收割机鉴定大纲': 15,
  'NY/T 2090-2025 ZB试验鉴定通则': 21,
  '五征4YZP-4自走式玉米收获机可靠性试验报告': 18,
  '约翰迪尔S770联合收割机对比试验影像': 9,
  'ZB智能化技术发展综述（2025）': 7,
  'DG/T 001-2025 农业轮式拖拉机鉴定技术规范': 12,
  '植保无人飞机作业性能测试数据集': 6,
}

export function isM02MasterDoc(name = '') {
  return /某型装备研制总要求|某型研制总要求/.test(String(name))
}

function row(partial) {
  const criteria = partial.criteria
  const name = partial.name
  const klass = partial.klass
  return {
    unit: '',
    value: criteria,
    status: '待审核',
    criteriaType: /^[≤≥<>+\-0-9]/.test(String(criteria)) ? '定量' : '定性',
    examMethod: '实测',
    srcDoc: 'D-01《某型研制总要求》',
    srcSection: klass,
    highlight: criteria,
    srcText: `${klass}\n「${name}」判据为 ${criteria}。`,
    ...partial,
  }
}

export const m02IndRows = tank99aIndicators.map((item) => row({
  ...item,
  srcDoc: '《99A式主战坦克研制总案》',
  srcText: item.srcText || `${item.klass}\n「${item.name}」判据为 ${item.criteria}。`,
}))

function copyMasterRows(name) {
  return m02IndRows.map((r) => ({
    ...r,
    srcDoc: name && name.includes('.pdf') ? name : r.srcDoc,
  }))
}

/** 按来源文档取抽取结果行；列表 count 与详情共用此函数，保证联动。未单独配置条数的文档沿用 44 项样例。 */
export function getM02RowsForDoc(docName = '') {
  const name = String(docName || '')
  if (!name) return []
  if (isTank99aDoc(name)) return tank99aIndicatorRows(name)
  const mapped = m02CountMap[name]
  if (mapped != null && !isM02MasterDoc(name)) {
    const n = Math.min(mapped, m02IndRows.length)
    return m02IndRows.slice(0, n).map((r, i) => ({
      ...r,
      id: `${name}-i${i + 1}`,
      srcDoc: name,
    }))
  }
  return copyMasterRows(name)
}

export function getM02CountForDoc(docName = '') {
  return getM02RowsForDoc(docName).length
}
