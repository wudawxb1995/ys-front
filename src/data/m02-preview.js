/** 解析结果预览工作台（对齐原型 5.2.5.2.9） */

export const PREVIEW_EQUIP_OPTS = ['战斗机', '发动机', '雷达', '导弹', '综合']
export const PREVIEW_CAT_OPTS = ['定型资料', '试验报告', '技术规格书', '技术手册', '设计说明']
export const PREVIEW_STATUS_OPTS = ['已解析', '待审核', '解析异常']

const BASE_DOCS = [
  { name: '某型战斗机定型技术资料.docx', cat: '定型资料', equip: '战斗机', status: '已解析', fmt: 'DOCX', pages: 12, date: '2026-10-08' },
  { name: '某型发动机试验报告.pdf', cat: '试验报告', equip: '发动机', status: '已解析', fmt: 'PDF', pages: 18, date: '2026-10-09' },
  { name: '某型雷达系统性能说明.pdf', cat: '试验报告', equip: '雷达', status: '已解析', fmt: 'PDF', pages: 14, date: '2026-10-09' },
  { name: '飞行试验数据汇总.pdf', cat: '试验报告', equip: '战斗机', status: '待审核', fmt: 'PDF', pages: 22, date: '2026-10-10' },
  { name: '某型导弹技术规格书.docx', cat: '技术规格书', equip: '导弹', status: '已解析', fmt: 'DOCX', pages: 16, date: '2026-10-11' },
  { name: '环境适应性试验报告.pdf', cat: '试验报告', equip: '综合', status: '已解析', fmt: 'PDF', pages: 11, date: '2026-10-11' },
  { name: '某型维护手册.docx', cat: '技术手册', equip: '综合', status: '已解析', fmt: 'DOCX', pages: 40, date: '2026-10-12' },
  { name: '可靠性试验报告.pdf', cat: '试验报告', equip: '战斗机', status: '待审核', fmt: 'PDF', pages: 9, date: '2026-10-12' },
  { name: '某型发动机设计说明.docx', cat: '设计说明', equip: '发动机', status: '已解析', fmt: 'DOCX', pages: 20, date: '2026-10-13' },
  { name: '电磁兼容性试验报告.pdf', cat: '试验报告', equip: '雷达', status: '已解析', fmt: 'PDF', pages: 8, date: '2026-10-13' },
]

const EXTRA = [
  '某型战斗机飞行品质评估.docx', '某型雷达校准记录.pdf', '导弹导引头试验纪要.pdf',
  '发动机台架试验数据.xlsx', '某型战斗机结构强度报告.pdf', '航电接口符合性说明.docx',
  '某型环境摸底试验.pdf', '战斗机外挂适配性报告.pdf', '雷达抗干扰试验报告.pdf',
  '导弹贮存环境适应性.pdf', '发动机滑油系统说明.docx', '某型战斗机电磁兼容复测.pdf',
  '飞行包线扩展试验.pdf', '某型雷达天线方向图.pdf', '导弹战斗部安全试验.pdf',
  '综合保障大纲摘录.docx', '某型战斗机试飞问题清单.pdf', '发动机振动频谱分析.pdf',
]

export const previewDocs = [
  ...BASE_DOCS.map((d, i) => ({ id: i + 1, ...d })),
  ...EXTRA.map((name, i) => {
    const fmt = name.endsWith('.docx') ? 'DOCX' : name.endsWith('.xlsx') ? 'XLSX' : 'PDF'
    const cat = fmt === 'DOCX' ? '设计说明' : '试验报告'
    const status = i === 2 ? '待审核' : '已解析'
    return {
      id: BASE_DOCS.length + i + 1,
      name,
      cat,
      equip: PREVIEW_EQUIP_OPTS[i % PREVIEW_EQUIP_OPTS.length],
      status,
      fmt,
      pages: 6 + (i % 9),
      date: `2026-10-${String(14 + (i % 8)).padStart(2, '0')}`,
    }
  }),
]

export const parseRowsByDoc = {
  1: [
    { id: 'p01', name: '最大飞行速度', value: '≥ 2.0', unit: 'Ma', loc: '第2页 2.1.1', page: 2, quote: '最大飞行速度：不低于 2.0 Ma。' },
    { id: 'p02', name: '作战半径', value: '≥ 1200', unit: 'km', loc: '第2页 2.1.2', page: 2, quote: '作战半径：不小于 1200 km。' },
    { id: 'p03', name: '最大起飞重量', value: '≤ 28000', unit: 'kg', loc: '第2页 2.1.3', page: 2, quote: '最大起飞重量：不大于 28000 kg。' },
    { id: 'p04', name: '实用升限', value: '≥ 16000', unit: 'm', loc: '第2页 2.1.4', page: 2, quote: '实用升限：不小于 16000 m。' },
    { id: 'p05', name: '最大过载', value: '≥ 9', unit: 'g', loc: '第2页 2.1.5', page: 2, quote: '最大过载：不小于 9 g。' },
    { id: 'p06', name: '发动机类型', value: '涡扇发动机', unit: '—', loc: '第2页 2.2.1', page: 2, quote: '动力装置采用涡扇发动机。' },
    { id: 'p07', name: '最大推力', value: '≥ 120', unit: 'kN', loc: '第2页 2.2.2', page: 2, quote: '单台最大推力不低于 120 kN。' },
    { id: 'p08', name: '机身长度', value: '≤ 14.0', unit: 'm', loc: '第2页 2.2.2', page: 2, quote: '机身长度不大于 14.0 m。' },
    { id: 'p09', name: '翼展', value: '≤ 14.0', unit: 'm', loc: '第3页 3.1.2', page: 3, quote: '翼展不大于 14.0 m。' },
    { id: 'p10', name: '最大航程', value: '≥ 3500', unit: 'km', loc: '第3页 3.1.3', page: 3, quote: '最大航程不小于 3500 km。' },
    { id: 'p11', name: '起飞滑跑距离', value: '≤ 500', unit: 'm', loc: '第3页 3.2.1', page: 3, quote: '起飞滑跑距离不大于 500 m。' },
    { id: 'p12', name: '着陆滑跑距离', value: '≤ 650', unit: 'm', loc: '第3页 3.2.2', page: 3, quote: '着陆滑跑距离不大于 650 m。' },
  ],
}

const FIGHTER_CORE = [
  {
    no: 1,
    title: '封面 / 概述',
    html: `<h4>某型战斗机定型技术资料</h4><p>1 总体要求</p><p>1.1 本标准规定了某型战斗机的总体技术要求、性能指标、试验方法和检验规则。</p><p>1.2 其应满足高机动性要求，具备良好的飞行性能、机动性能和环境适应性。</p>`,
  },
  {
    no: 2,
    title: '主要性能指标',
    html: `<h4>某型战斗机定型技术资料</h4><p>2 主要性能指标</p><p>2.1 飞行性能</p><p>2.1.1 最大飞行速度：不低于 2.0 Ma；</p><p>2.1.2 作战半径：不小于 1200 km；</p><p>2.1.3 最大起飞重量：不大于 28000 kg；</p><p>2.1.4 实用升限：不小于 16000 m；</p><p>2.1.5 最大过载：不小于 9 g。</p><p>2.2 动力系统</p><p>动力装置采用涡扇发动机，单台最大推力不低于 120 kN；机身长度不大于 14.0 m。</p>`,
  },
  {
    no: 3,
    title: '几何与起降',
    html: `<h4>某型战斗机定型技术资料</h4><p>3.1 几何尺寸</p><p>3.1.2 翼展不大于 14.0 m。</p><p>3.1.3 最大航程不小于 3500 km。</p><p>3.2 起降性能</p><p>3.2.1 起飞滑跑距离不大于 500 m。</p><p>3.2.2 着陆滑跑距离不大于 650 m。</p>`,
  },
]

export const DOC_PAGES = {
  1: [
    ...FIGHTER_CORE,
    ...Array.from({ length: 9 }, (_, i) => ({
      no: i + 4,
      title: `附录 ${i + 1}`,
      html: `<h4>某型战斗机定型技术资料</h4><p>第 ${i + 4} 页 · 附录与试验方法摘录。</p><p>本页给出检验项目、试验条件与判定准则，供解析结果对照原文使用。</p>`,
    })),
  ],
}

export function pagesOf(doc) {
  if (DOC_PAGES[doc?.id]) return DOC_PAGES[doc.id]
  const n = Math.min(doc?.pages || 3, 8)
  return Array.from({ length: n }, (_, i) => ({
    no: i + 1,
    title: `第 ${i + 1} 页`,
    html: `<h4>${doc?.name || '文档'}</h4><p>第 ${i + 1} 页内容摘录。资料类别：${doc?.cat || '—'}。类型：${doc?.equip || '—'}。</p><p>解析状态：${doc?.status || '—'}。</p>`,
  }))
}

export function rowsOf(doc) {
  if (parseRowsByDoc[doc?.id]) return parseRowsByDoc[doc.id]
  const n = 6 + ((doc?.id || 1) % 5)
  return Array.from({ length: n }, (_, i) => ({
    id: `d${doc.id}-${i}`,
    name: `解析指标 ${i + 1}`,
    value: `${10 + i * 3}`,
    unit: i % 2 ? 'km' : 'm',
    loc: `第${1 + (i % 3)}页 ${i + 1}.1`,
    page: 1 + (i % 3),
    quote: `从《${doc.name}》抽取的第 ${i + 1} 项指标。`,
  }))
}
