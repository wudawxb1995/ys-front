const byId = {
  'doc-collect': 'archive',
  'doc-classify': 'tag',
  'ontology-model': 'ontology',
  'doc-transfer': 'transfer',
  'entity-extract': 'extract',
  'entity-constraint': 'link',
  'term-map': 'swap',
  'review-policy': 'sliders',
  'model-validate': 'eye',
  'knowledge-asset': 'database',
  'knowledge-service': 'api',
}

const rules = [
  [/首页|综合态势/, 'home'],
  [/工作台/, 'chart'],
  [/知识卡片|卡片/, 'card'],
  [/专题|提纲|公文|文书|报告/, 'doc'],
  [/问答|对话|调试/, 'chat'],
  [/检索|搜索|查重/, 'search'],
  [/图谱|关系|融合/, 'graph'],
  [/推理|思维|流程|编排/, 'flow'],
  [/挖掘|创新|要素/, 'spark'],
  [/聚类|分类|标签/, 'cluster'],
  [/统计|图表|研判|雷达|能力/, 'chart'],
  [/资源管理|资源归集|资源入库|数据资源/, 'database'],
  [/录入|目录|归集|入库|汇聚/, 'database'],
  [/解析|抽取|识别/, 'parse'],
  [/清洗|去噪|归一/, 'clean'],
  [/审核|审查|批注|校核/, 'audit'],
  [/向量|量化|语义/, 'semantic'],
  [/导出|存储|下载|转换/, 'export'],
  [/探针|定位|异常/, 'target'],
  [/编码|代码|注释/, 'code'],
  [/模板|规范|标准|术语/, 'book'],
  [/规则|策略|本体|约束/, 'rule'],
  [/模型|微调|训练|数据集/, 'model'],
  [/插件|接口|技能/, 'plugin'],
  [/权限|许可|角色/, 'shield'],
  [/追溯|时间|履历|历程|轨迹/, 'timeline'],
  [/对比|阶段|版本/, 'compare'],
  [/方案|设计/, 'scheme'],
  [/样本|分析/, 'chart'],
  [/用户|运营/, 'user'],
]

/** 小尺寸下外形接近的 glyph，同一 tab 内按同一族去重 */
const LOOKALIKE = {
  vector: 'graph',
  transfer: 'graph',
  filter: 'clean',
  box: 'model',
}

function iconFamily(name) {
  return LOOKALIKE[name] || name
}

/** 同一 tab 内可轮换的互异形状；不同 tab 可复用同一套 */
export const ICON_POOL = [
  'home', 'folder', 'parse', 'list', 'clean', 'layout', 'eye', 'plugin', 'globe',
  'audit', 'edit', 'hash', 'semantic', 'export', 'database', 'chart', 'tag',
  'book', 'cards', 'extract', 'cluster', 'sliders', 'table', 'timeline', 'model',
  'layers', 'graph', 'report', 'transfer', 'compass', 'spark', 'shield', 'flag',
  'ontology', 'link', 'radar', 'flow', 'search', 'chat', 'swap', 'code', 'target',
  'scheme', 'compare', 'signal', 'task', 'clock', 'image', 'wrench', 'api',
  'archive', 'card', 'rule', 'train', 'user', 'box', 'filter',
]

export function iconFor(item = {}) {
  if (item.icon) return item.icon
  if (byId[item.id]) return byId[item.id]
  if (item.id === 'home') return 'home'
  const name = `${item.name || ''}${item.id || ''}`
  for (const [re, icon] of rules) {
    if (re.test(name)) return icon
  }
  return 'layers'
}

/** 保证同一 system.menus 一级目录图标不重复；不同 system 可一致 */
export function uniquifySystemMenuIcons(systems = []) {
  return systems.map((sys) => {
    const used = new Set()
    const menus = (sys.menus || []).map((item) => {
      let icon = iconFor(item)
      if (used.has(iconFamily(icon))) {
        icon = ICON_POOL.find((name) => !used.has(iconFamily(name))) || icon
      }
      used.add(iconFamily(icon))
      return { ...item, icon }
    })
    return { ...sys, menus }
  })
}
