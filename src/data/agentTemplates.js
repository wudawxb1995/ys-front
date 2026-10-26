export const agentTemplates = [
  { id: 'extract', name: '关键指标抽取', category: '资料再造', kind: '工作流', icon: 'DataAnalysis', tone: 'blue', brief: '从定型资料抽取指标、单位和原文位置，校验后回写资料再造指标表。', nodes: 6, uses: '2.4k', owner: '平台预置', featured: true },
  { id: 'review', name: '试验文档辅助审查', category: '文书审校', kind: '工作流', icon: 'DocumentChecked', tone: 'violet', brief: '对照试验大纲与标准条款生成审查意见，精确定位报告正文。', nodes: 6, uses: '1.8k', owner: '平台预置', featured: true },
  { id: 'qa', name: '试验鉴定知识问答', category: '知识问答', kind: 'CHATFLOW', icon: 'ChatDotRound', tone: 'cyan', brief: '检索标准条款和历史结论，生成附有原文出处的鉴定业务回答。', nodes: 6, uses: '3.1k', owner: '平台预置', featured: true },
  { id: 'outline', name: '试验大纲智能生成', category: '方案编制', kind: '工作流', icon: 'Notebook', tone: 'amber', brief: '结合任务书、鉴定依据和历史大纲，自动组织试验项目与章节结构。', nodes: 5, uses: '986', owner: '平台预置' },
  { id: 'scheme', name: '试验方案编制助手', category: '方案编制', kind: '工作流', icon: 'EditPen', tone: 'mint', brief: '匹配标准模板和设备资源，生成含试验因子、方法与判据的方案初稿。', nodes: 5, uses: '1.2k', owner: '平台预置' },
  { id: 'report', name: '鉴定报告生成', category: '报告生成', kind: '工作流', icon: 'Document', tone: 'rose', brief: '汇总试验记录、审查结论和证据链，按鉴定报告模板生成章节内容。', nodes: 5, uses: '764', owner: '平台预置' },
  { id: 'compare', name: '跨文书一致性核查', category: '文书审校', kind: '工作流', icon: 'Connection', tone: 'indigo', brief: '比对任务书、大纲、方案和报告中的指标、条件及结论，发现冲突遗漏。', nodes: 5, uses: '1.6k', owner: '平台预置' },
  { id: 'clause', name: '标准条款智能检索', category: '知识问答', kind: 'CHATFLOW', icon: 'Search', tone: 'blue', brief: '按试验对象和条件查找适用标准，返回条款摘要、版本及页码。', nodes: 5, uses: '2.1k', owner: '平台预置' },
  { id: 'risk', name: '试验风险研判', category: '数据分析', kind: '工作流', icon: 'Warning', tone: 'amber', brief: '关联历史异常和环境条件，识别高风险试验环节并给出处置建议。', nodes: 5, uses: '638', owner: '平台预置' },
  { id: 'record', name: '试验记录智能归档', category: '资料再造', kind: '工作流', icon: 'FolderChecked', tone: 'cyan', brief: '自动识别试验记录的对象、日期和项目，分类入库并建立溯源索引。', nodes: 5, uses: '892', owner: '平台预置' },
  { id: 'trend', name: '性能数据趋势分析', category: '数据分析', kind: '工作流', icon: 'TrendCharts', tone: 'violet', brief: '清洗多批次性能数据，识别异常波动并形成趋势摘要与图表说明。', nodes: 5, uses: '517', owner: '平台预置' },
  { id: 'meeting', name: '评审会议纪要整理', category: '报告生成', kind: 'CHATFLOW', icon: 'Tickets', tone: 'mint', brief: '从会议记录提炼决议、责任人和待办事项，生成结构化评审纪要。', nodes: 5, uses: '1.0k', owner: '平台预置' },
]

export const agentCategories = ['全部模板', '我的模板', '资料再造', '文书审校', '知识问答', '方案编制', '报告生成', '数据分析']
