/** 《某型装备研制总要求》解析详情（与 public/samples PDF 章节对齐） */

export const EQUIPMENT_REQ_SAMPLE_URL = '/samples/某型装备研制总要求.pdf'
export const EQUIPMENT_REQ_SAMPLE_NAME = '某型装备研制总要求.pdf'

export const equipmentReqChapters = [
  {
    id: 'c1',
    title: '1 范围',
    level: 1,
    children: [
      { id: 'c1-1', title: '1.1 主题内容', level: 2 },
      { id: 'c1-2', title: '1.2 适用范围', level: 2 },
      { id: 'c1-3', title: '1.3 文件效力', level: 2 },
    ],
  },
  {
    id: 'c2',
    title: '2 引用文件',
    level: 1,
  },
  {
    id: 'c3',
    title: '3 术语、定义和缩略语',
    level: 1,
    children: [
      { id: 'c3-1', title: '3.1 术语和定义', level: 2 },
      { id: 'c3-2', title: '3.2 缩略语', level: 2 },
    ],
  },
  {
    id: 'c4',
    title: '4 总则',
    level: 1,
    children: [
      { id: 'c4-1', title: '4.1 研制目标', level: 2 },
      { id: 'c4-2', title: '4.2 指导思想', level: 2 },
      { id: 'c4-3', title: '4.3 基本原则', level: 2 },
    ],
  },
  {
    id: 'c5',
    title: '5 任务与使用要求',
    level: 1,
    children: [
      { id: 'c5-1', title: '5.1 使命任务', level: 2 },
      { id: 'c5-2', title: '5.3 典型任务剖面', level: 2 },
    ],
  },
  {
    id: 'c6',
    title: '6 系统组成与总体方案',
    level: 1,
  },
  {
    id: 'c7',
    title: '7 主要战术技术指标',
    level: 1,
    children: [
      { id: 'c7-1', title: '7.1 指标总表', level: 2 },
      { id: 'c7-2', title: '7.4 作业性能指标细化', level: 2 },
    ],
  },
  {
    id: 'c8',
    title: '8 功能要求',
    level: 1,
  },
  {
    id: 'c9',
    title: '9 性能要求',
    level: 1,
  },
  {
    id: 'c10',
    title: '10 五性要求',
    level: 1,
    children: [
      { id: 'c10-1', title: '10.1 可靠性', level: 2 },
      { id: 'c10-2', title: '10.2 维修性', level: 2 },
      { id: 'c10-3', title: '10.5 安全性', level: 2 },
    ],
  },
  {
    id: 'c11',
    title: '11 环境适应性与电磁兼容性',
    level: 1,
  },
  {
    id: 'c12',
    title: '12 信息化与软件要求',
    level: 1,
  },
  {
    id: 'c13',
    title: '13 人机工程与标准化',
    level: 1,
  },
  {
    id: 'c14',
    title: '14 质量保证与风险管理',
    level: 1,
  },
  {
    id: 'c15',
    title: '15 试验与鉴定要求',
    level: 1,
  },
  {
    id: 'c16',
    title: '16 研制阶段与进度节点',
    level: 1,
  },
  {
    id: 'c17',
    title: '17 附录',
    level: 1,
    children: [
      { id: 'c17-a', title: '附录 A 指标验证方法对照', level: 2 },
      { id: 'c17-b', title: '附录 B 文档与规则映射', level: 2 },
    ],
  },
]

export function isEquipmentReqDoc(name = '') {
  const n = String(name)
  return /某型装备研制总要求/.test(n) || /某型研制总要求/.test(n)
}

export function buildEquipmentReqDetail(row = {}) {
  const name = row.name || EQUIPMENT_REQ_SAMPLE_NAME
  const time = row.time || row.parsedAt || '—'
  return {
    name,
    fmt: row.fmt || 'PDF',
    size: row.size || '0.35 MB',
    pages: row.pages && row.pages !== '—' ? Number(row.pages) || row.pages : 48,
    parsedAt: time,
    tableCount: 17,
    imageCount: 0,
    paraCount: 286,
    indexStatus: '已建立',
    indexName: `idx-zbzy-${String(Date.now()).slice(-8)}`,
    indexAt: time,
    fileUrl: row.fileUrl || EQUIPMENT_REQ_SAMPLE_URL,
    chapters: equipmentReqChapters,
  }
}
