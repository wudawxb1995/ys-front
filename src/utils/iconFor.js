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
  [/录入|目录|资源|归集|入库|汇聚/, 'database'],
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

export function iconFor(item = {}) {
  if (byId[item.id]) return byId[item.id]
  const name = `${item.name || ''}${item.id || ''}`
  if (item.id === 'home') return 'home'
  for (const [re, icon] of rules) {
    if (re.test(name)) return icon
  }
  return item.icon || 'layers'
}
