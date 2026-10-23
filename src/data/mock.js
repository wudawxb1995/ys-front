const resources = [
  ['某型装备研制总要求（D-01）', '定型资料', 'PDF', '文本', '12.4 MB', '48', '已解析', '张明远', '2026-10-08 09:24'],
  ['雷沃谷神4LZ-8谷物联合收割机鉴定大纲', '定型资料', 'PDF', '文本', '18.2 MB', '86', '已解析', '李慧敏', '2026-10-09 10:11'],
  ['NY/T 2090-2025 农业机械试验鉴定通则', '标准规范', 'PDF', '文本', '6.8 MB', '42', '已解析', '王建国', '2026-09-28 14:02'],
  ['2BMQ-6气力式免耕播种机田间试验数据', '历史试验数据', 'XLSX', '表格', '12.4 MB', '—', '解析中', '陈思远', '2026-10-14 16:40'],
  ['五征4YZP-4自走式玉米收获机可靠性试验报告', '定型资料', 'DOCX', '文本', '41.7 MB', '152', '已解析', '张明远', '2026-10-05 11:32'],
  ['约翰迪尔S770联合收割机对比试验影像', '历史试验数据', 'MP4', '音视频', '486 MB', '—', '已解析', '刘志强', '2026-10-11 15:20'],
  ['《农业机械试验鉴定办法》2025年修订版', '标准规范', 'PDF', '文本', '4.2 MB', '28', '暂存', '李慧敏', '2026-10-15 09:05'],
  ['旋耕机刀片磨损试验扫描件（1987年归档）', '历史试验数据', 'JPG', '图像', '96.3 MB', '—', '解析失败', '赵雪梅', '2026-10-13 10:47'],
  ['大马力拖拉机PTO功率测试原始记录', '历史试验数据', 'XLSX', '表格', '8.9 MB', '—', '暂存', '陈思远', '2026-10-16 14:18'],
  ['植保无人飞机作业性能测试数据集', '历史试验数据', 'CSV', '表格', '15.6 MB', '—', '已解析', '刘志强', '2026-10-12 09:44'],
  ['农业机械智能化技术发展综述（2025）', '专业文献', 'PDF', '文本', '9.4 MB', '56', '已解析', '赵雪梅', '2026-09-30 16:22'],
  ['DG/T 001-2025 农业轮式拖拉机鉴定技术规范', '标准规范', 'PDF', '文本', '7.5 MB', '48', '已解析', '王建国', '2026-10-02 10:36'],
]

function resourceRow([name, cat, fmt, modal, size, pages, status, by, time]) {
  return { name, cat, fmt, modal, size, pages, status, by, time }
}

export const datasets = {
  resources: {
    filters: [
      { key: 'name', label: '资源名称', type: 'search' },
      { key: 'cat', label: '资源类别', options: ['定型资料', '历史试验数据', '标准规范', '专业文献'] },
      { key: 'status', label: '解析状态', options: ['已解析', '解析中', '暂存', '解析失败'] },
      { key: 'modal', label: '数据模态', options: ['文本', '图像', '表格', '音视频'] },
    ],
    columns: [
      { key: 'name', label: '资源名称' },
      { key: 'cat', label: '类别' },
      { key: 'fmt', label: '格式' },
      { key: 'modal', label: '模态' },
      { key: 'size', label: '大小' },
      { key: 'pages', label: '页数' },
      { key: 'status', label: '状态', kind: 'badge' },
      { key: 'by', label: '录入人' },
      { key: 'time', label: '录入时间' },
    ],
    rows: resources.map(resourceRow),
    ops: ['详情', '解析', '删除'],
  },
  parseTasks: {
    filters: [
      { key: 'name', label: '任务名称', type: 'search' },
      { key: 'status', label: '状态', options: ['已完成', '进行中', '排队中'] },
      { key: 'mode', label: '解析模式', options: ['即时解析', '暂存后解析', '批量调度'] },
    ],
    columns: [
      { key: 'name', label: '任务名称' },
      { key: 'mode', label: '解析模式' },
      { key: 'engine', label: '解析引擎' },
      { key: 'progress', label: '进度', kind: 'progress' },
      { key: 'count', label: '数据项' },
      { key: 'status', label: '状态', kind: 'badge' },
      { key: 'cost', label: '耗时' },
      { key: 'time', label: '创建时间' },
    ],
    rows: [
      { name: '某型装备研制总要求（D-01）全文解析', mode: '即时解析', engine: '领域多模态大模型', progress: 100, count: '1286/1286', status: '已完成', cost: '156s', time: '2026-10-08 09:24' },
      { name: '雷沃谷神4LZ-8鉴定大纲解析', mode: '即时解析', engine: '文档OCR识别引擎', progress: 100, count: '642/642', status: '已完成', cost: '98s', time: '2026-10-09 10:11' },
      { name: '2BMQ-6免耕播种机田间数据解析', mode: '批量调度', engine: '表格结构识别引擎', progress: 64, count: '328/512', status: '进行中', cost: '—', time: '2026-10-14 16:41' },
      { name: '播种机历史影像资料批量解析', mode: '批量调度', engine: '语音转写ASR引擎', progress: 0, count: '0/96', status: '排队中', cost: '—', time: '2026-10-16 11:05' },
      { name: '标准规范双栏版式批量解析', mode: '暂存后解析', engine: '文档OCR识别引擎', progress: 100, count: '210/210', status: '已完成', cost: '74s', time: '2026-10-02 11:02' },
    ],
    ops: ['详情', '日志', '删除'],
  },
  parseRules: {
    filters: [
      { key: 'name', label: '规则名称', type: 'search' },
      { key: 'status', label: '状态', options: ['启用', '停用'] },
    ],
    columns: [
      { key: 'name', label: '规则名称' },
      { key: 'mode', label: '切分方式' },
      { key: 'grain', label: '切分粒度' },
      { key: 'layout', label: '版式模式' },
      { key: 'order', label: '阅读顺序还原' },
      { key: 'status', label: '状态', kind: 'badge' },
      { key: 'time', label: '创建时间' },
    ],
    rows: [
      { name: '定型资料章节切分规则', mode: '按章节', grain: '—', layout: '自动识别', order: '开启', status: '启用', time: '2026-09-20 10:12' },
      { name: '长报告定长切分规则', mode: '按字符数', grain: '1200字', layout: '单栏', order: '开启', status: '启用', time: '2026-09-25 15:40' },
      { name: '扫描版鉴定大纲切分规则', mode: '按页码', grain: '—', layout: '双栏', order: '关闭', status: '停用', time: '2026-10-06 09:28' },
      { name: '标准条文条款切分规则', mode: '按章节', grain: '条款', layout: '单栏', order: '开启', status: '启用', time: '2026-10-01 08:40' },
    ],
    ops: ['编辑', '停用', '删除'],
  },
  entities: {
    filters: [
      { key: 'text', label: '实体文本', type: 'search' },
      { key: 'type', label: '实体类型', options: ['农业机械型号', '性能指标', '指标数值', '试验项目', '标准编号', '部件名称', '试验机构'] },
      { key: 'src', label: '标注来源', options: ['自动识别', '手动标注'] },
    ],
    columns: [
      { key: 'text', label: '实体文本' },
      { key: 'type', label: '实体类型' },
      { key: 'res', label: '所属资源' },
      { key: 'src', label: '来源' },
      { key: 'page', label: '页码' },
      { key: 'score', label: '置信度' },
    ],
    rows: [
      { text: '东方红-LF2204', type: '农业机械型号', res: '东方红-LF2204定型试验报告', src: '自动识别', page: 'P.3', score: '98%' },
      { text: '发动机标定功率', type: '性能指标', res: '东方红-LF2204定型试验报告', src: '自动识别', page: 'P.17', score: '96%' },
      { text: '162 kW', type: '指标数值', res: '东方红-LF2204定型试验报告', src: '自动识别', page: 'P.17', score: '99%' },
      { text: '动力输出轴标定转速', type: '性能指标', res: '东方红-LF2204定型试验报告', src: '自动识别', page: 'P.22', score: '97%' },
      { text: '540 / 1000 r/min', type: '指标数值', res: '东方红-LF2204定型试验报告', src: '手动标注', page: 'P.22', score: '100%' },
      { text: '牵引性能试验', type: '试验项目', res: '东方红-LF2204定型试验报告', src: '自动识别', page: 'P.35', score: '95%' },
      { text: '最大牵引力', type: '性能指标', res: '东方红-LF2204定型试验报告', src: '自动识别', page: 'P.36', score: '96%' },
      { text: '38.6 kN', type: '指标数值', res: '东方红-LF2204定型试验报告', src: '自动识别', page: 'P.36', score: '98%' },
      { text: 'DG/T 001-2025', type: '标准编号', res: '农业轮式拖拉机鉴定技术规范', src: '自动识别', page: 'P.1', score: '99%' },
      { text: '雷沃谷神4LZ-8', type: '农业机械型号', res: '雷沃谷神4LZ-8鉴定大纲', src: '手动标注', page: 'P.2', score: '100%' },
      { text: '洛阳拖拉机试验鉴定站', type: '试验机构', res: '东方红-LF2204定型试验报告', src: '自动识别', page: 'P.1', score: '94%' },
      { text: '滑转率', type: '性能指标', res: '2BMQ-6田间试验数据', src: '自动识别', page: '—', score: '93%' },
    ],
    ops: ['修订', '追溯', '删除'],
  },
  vecTasks: {
    filters: [
      { key: 'name', label: '数据资源', type: 'search' },
      { key: 'status', label: '状态', options: ['已完成', '进行中'] },
    ],
    columns: [
      { key: 'name', label: '数据资源' },
      { key: 'progress', label: '进度', kind: 'progress' },
      { key: 'status', label: '状态', kind: 'badge' },
      { key: 'dim', label: '向量维度' },
      { key: 'chunks', label: '分块数' },
      { key: 'cost', label: '耗时' },
      { key: 'ok', label: '是否达标' },
      { key: 'time', label: '创建时间' },
    ],
    rows: [
      { name: '某型装备研制总要求（D-01）', progress: 100, status: '已完成', dim: '1024', chunks: '96', cost: '11.2s', ok: '达标（≤15s）', time: '2026-10-09 14:20' },
      { name: '雷沃谷神4LZ-8谷物联合收割机鉴定大纲', progress: 100, status: '已完成', dim: '1024', chunks: '64', cost: '8.6s', ok: '达标', time: '2026-10-10 09:32' },
      { name: 'NY/T 2090-2025 农业机械试验鉴定通则', progress: 100, status: '已完成', dim: '1024', chunks: '32', cost: '5.1s', ok: '达标', time: '2026-10-10 10:15' },
      { name: '五征4YZP-4可靠性试验报告', progress: 46, status: '进行中', dim: '1024', chunks: '—', cost: '—', ok: '—', time: '2026-10-16 15:02' },
    ],
    ops: ['详情', '重跑'],
  },
  vecChunks: {
    filters: [{ key: 'res', label: '所属资源', type: 'search' }],
    columns: [
      { key: 'res', label: '所属资源' },
      { key: 'no', label: '分块号' },
      { key: 'text', label: '文本片段' },
      { key: 'vec', label: '向量预览' },
      { key: 'dim', label: '维度' },
      { key: 'time', label: '生成时间' },
    ],
    rows: [
      { res: 'NY/T 2090-2025', no: '#005', text: '可靠性试验累计作业时间不少于规定值，MTBF 作为定型判定依据。', vec: '[0.12, -0.08, 0.44, 0.19]', dim: '1024', time: '2026-10-10 10:15' },
      { res: '东方红-LF2204报告', no: '#017', text: '发动机标定功率 162 kW，动力输出轴输出功率 138.5 kW。', vec: '[0.31, 0.02, -0.17, 0.55]', dim: '1024', time: '2026-10-09 14:21' },
      { res: '东方红-LF2204报告', no: '#036', text: '混凝土路面最大牵引力 38.6 kN，对应滑转率 8.2%。', vec: '[0.22, 0.41, 0.06, -0.13]', dim: '1024', time: '2026-10-09 14:21' },
      { res: '雷沃谷神4LZ-8大纲', no: '#008', text: '总损失率、含杂率、破碎率作为收获性能核心指标。', vec: '[-0.05, 0.28, 0.33, 0.11]', dim: '1024', time: '2026-10-10 09:33' },
    ],
    ops: ['查看向量'],
  },
  exports: {
    filters: [
      { key: 'name', label: '任务名称', type: 'search' },
      { key: 'fmt', label: '目标格式', options: ['JSON', 'DOCX', 'Markdown', 'PDF', 'TXT'] },
    ],
    columns: [
      { key: 'name', label: '任务名称' },
      { key: 'fmt', label: '目标格式' },
      { key: 'count', label: '文档数' },
      { key: 'status', label: '状态', kind: 'badge' },
      { key: 'time', label: '完成时间' },
    ],
    rows: [
      { name: '某型装备研制总要求解析成果', fmt: 'JSON', count: '1', status: '已完成', time: '2026-10-10 11:22' },
      { name: '标准规范类资源批量导出', fmt: 'Markdown', count: '6', status: '已完成', time: '2026-10-12 16:08' },
      { name: '历史试验表格结构化导出', fmt: 'TXT', count: '4', status: '进行中', time: '—' },
    ],
    ops: ['下载', '删除'],
  },
  indicators: {
    filters: [
      { key: 'name', label: '指标名称', type: 'search' },
      { key: 'machine', label: '机型', options: ['东方红-LF2204', '雷沃谷神4LZ-8', '五征4YZP-4', '2BMQ-6'] },
      { key: 'status', label: '审核状态', options: ['待审核', '已确认', '已修改'] },
    ],
    columns: [
      { key: 'name', label: '指标名称' },
      { key: 'value', label: '抽取值' },
      { key: 'unit', label: '单位' },
      { key: 'machine', label: '机型' },
      { key: 'source', label: '来源文档' },
      { key: 'page', label: '页码' },
      { key: 'score', label: '置信度' },
      { key: 'status', label: '状态', kind: 'badge' },
    ],
    rows: [
      { name: '发动机标定功率', value: '162', unit: 'kW', machine: '东方红-LF2204', source: '定型试验报告', page: 'P.17', score: '96%', status: '已确认' },
      { name: '动力输出轴功率', value: '138.5', unit: 'kW', machine: '东方红-LF2204', source: '定型试验报告', page: 'P.17', score: '97%', status: '已确认' },
      { name: '最大牵引力', value: '38.6', unit: 'kN', machine: '东方红-LF2204', source: '定型试验报告', page: 'P.36', score: '98%', status: '已确认' },
      { name: '滑转率', value: '8.2', unit: '%', machine: '东方红-LF2204', source: '定型试验报告', page: 'P.36', score: '95%', status: '待审核' },
      { name: 'PTO标定转速', value: '540/1000', unit: 'r/min', machine: '东方红-LF2204', source: '定型试验报告', page: 'P.22', score: '99%', status: '已修改' },
      { name: '总损失率', value: '1.15', unit: '%', machine: '雷沃谷神4LZ-8', source: '鉴定大纲', page: 'P.21', score: '93%', status: '待审核' },
      { name: '含杂率', value: '1.4', unit: '%', machine: '雷沃谷神4LZ-8', source: '鉴定大纲', page: 'P.22', score: '91%', status: '待审核' },
      { name: 'MTBF', value: '375', unit: 'h', machine: '五征4YZP-4', source: '可靠性试验报告', page: 'P.64', score: '94%', status: '已确认' },
      { name: '播种合格率', value: '92.6', unit: '%', machine: '2BMQ-6', source: '田间试验数据', page: '—', score: '88%', status: '待审核' },
    ],
    ops: ['审核', '追溯', '编辑'],
  },
  preferences: {
    filters: [{ key: 'name', label: '偏好名称', type: 'search' }],
    columns: [
      { key: 'name', label: '配置名称' },
      { key: 'kb', label: '知识库' },
      { key: 'intent', label: '推断意图' },
      { key: 'modal', label: '模态侧重' },
      { key: 'status', label: '状态', kind: 'badge' },
      { key: 'time', label: '更新时间' },
    ],
    rows: [
      { name: '轮式拖拉机定型解析偏好', kb: '定型资料库', intent: '抽取动力、牵引、可靠性指标', modal: '文本要点+表格数值', status: '启用', time: '2026-10-08' },
      { name: '收获机械鉴定解析偏好', kb: '定型资料库', intent: '抽取损失率、含杂率、破碎率', modal: '文本+图像铭牌', status: '启用', time: '2026-10-09' },
      { name: '通用鉴定解析模板', kb: '领域通识库', intent: '无法判断意图时的默认策略', modal: '跨模态对照', status: '启用', time: '2026-09-18' },
      { name: '试验影像事件导览偏好', kb: '试验资料库', intent: '提取作业过程事件与异常片段', modal: '视频事件导览', status: '启用', time: '2026-10-11' },
    ],
    ops: ['编辑', '设为默认'],
  },
  categories: {
    filters: [{ key: 'name', label: '分类名称', type: 'search' }],
    columns: [
      { key: 'name', label: '分类名称' },
      { key: 'scope', label: '适用范围' },
      { key: 'rule', label: '打标规则' },
      { key: 'count', label: '已打标章节' },
      { key: 'status', label: '状态', kind: 'badge' },
    ],
    rows: [
      { name: '动力性能', scope: '拖拉机定型报告', rule: '章节标题含功率、转速、油耗', count: '42', status: '启用' },
      { name: '牵引性能', scope: '拖拉机定型报告', rule: '牵引力、滑转率、牵引功率', count: '28', status: '启用' },
      { name: '可靠性', scope: '全机型', rule: 'MTBF、故障、有效度', count: '36', status: '启用' },
      { name: '收获质量', scope: '收获机械', rule: '损失率、含杂率、破碎率', count: '19', status: '启用' },
      { name: '安全与环保', scope: '全机型', rule: '噪声、制动、排放', count: '15', status: '启用' },
    ],
    ops: ['编辑', '审核打标', '删除'],
  },
  dataModels: {
    filters: [{ key: 'name', label: '模型名称', type: 'search' }],
    columns: [
      { key: 'name', label: '数据模型' },
      { key: 'std', label: '依据标准' },
      { key: 'fields', label: '字段数' },
      { key: 'code', label: '分类编码' },
      { key: 'status', label: '状态', kind: 'badge' },
    ],
    rows: [
      { name: '轮式拖拉机性能指标模型', std: 'DG/T 001-2025', fields: '46', code: 'AM-TR-01', status: '启用' },
      { name: '谷物联合收割机指标模型', std: 'DG/T 015-2024', fields: '38', code: 'AM-HV-02', status: '启用' },
      { name: '播种机作业质量模型', std: 'NY/T 1642', fields: '27', code: 'AM-SD-03', status: '启用' },
      { name: '试验报告元数据模型', std: 'NY/T 2090-2025', fields: '22', code: 'META-RPT', status: '启用' },
    ],
    ops: ['字段', '标注', '编辑'],
  },
  lifecycle: {
    filters: [
      { key: 'machine', label: '机型', type: 'search' },
      { key: 'stage', label: '阶段', options: ['研发设计', '性能试验设计', '性能试验鉴定', '成果验收'] },
    ],
    columns: [
      { key: 'machine', label: '农业机械' },
      { key: 'stage', label: '生命周期阶段' },
      { key: 'docs', label: '归集资料' },
      { key: 'state', label: '技术状态' },
      { key: 'updated', label: '最近更新' },
    ],
    rows: [
      { machine: '东方红-LF2204', stage: '性能试验鉴定', docs: '定型报告、大纲、原始记录', state: '定型试验完成', updated: '2026-10-08' },
      { machine: '东方红-LF2204', stage: '研发设计', docs: '设计任务书、总布置图', state: '设计冻结 B2', updated: '2025-11-02' },
      { machine: '雷沃谷神4LZ-8', stage: '性能试验设计', docs: '试验总案、大纲草案', state: '大纲评审中', updated: '2026-10-09' },
      { machine: '五征4YZP-4', stage: '成果验收', docs: '可靠性报告、验收意见', state: '建议通过', updated: '2026-10-05' },
      { machine: '2BMQ-6', stage: '性能试验鉴定', docs: '田间数据、影像', state: '数据解析中', updated: '2026-10-14' },
    ],
    ops: ['查看履历', '归类'],
  },
  events: {
    filters: [
      { key: 'machine', label: '机型', type: 'search' },
      { key: 'type', label: '事件类型', options: ['技术状态', '性能变更', '问题归零', '关键事件'] },
    ],
    columns: [
      { key: 'time', label: '时间' },
      { key: 'machine', label: '机型' },
      { key: 'type', label: '类型' },
      { key: 'title', label: '事件' },
      { key: 'result', label: '结果' },
      { key: 'status', label: '状态', kind: 'badge' },
    ],
    rows: [
      { time: '2026-03-12', machine: '东方红-LF2204', type: '性能变更', title: 'PTO传动比调整，标定转速覆盖 540/1000', result: '已写入技术状态 B2', status: '已确认' },
      { time: '2026-06-18', machine: '东方红-LF2204', type: '问题归零', title: '牵引试验滑转率偏高', result: '配重方案调整后复测合格', status: '已确认' },
      { time: '2026-08-02', machine: '五征4YZP-4', type: '关键事件', title: '可靠性试验 750 h 节点', result: '一般故障 2 次，MTBF 375 h', status: '已确认' },
      { time: '2026-10-09', machine: '雷沃谷神4LZ-8', type: '技术状态', title: '割台损失测点布置变更', result: '大纲升版 V1.3', status: '待审核' },
    ],
    ops: ['详情', '编辑'],
  },
  nodeTypes: {
    filters: [{ key: 'name', label: '类型名称', type: 'search' }],
    columns: [
      { key: 'name', label: '节点类型' },
      { key: 'attrs', label: '属性' },
      { key: 'color', label: '颜色' },
      { key: 'icon', label: '图标' },
      { key: 'count', label: '实例数' },
    ],
    rows: [
      { name: '农业机械', attrs: '型号、类别、生产企业', color: '藏青', icon: '农机', count: '128' },
      { name: '性能指标', attrs: '名称、单位、阈值', color: '金', icon: '仪表', count: '860' },
      { name: '试验', attrs: '项目、场地、时间', color: '蓝', icon: '烧杯', count: '342' },
      { name: '事件', attrs: '类型、时间、结论', color: '橙', icon: '旗帜', count: '219' },
      { name: '标准规范', attrs: '编号、名称、版本', color: '绿', icon: '书', count: '76' },
    ],
    ops: ['属性', '编辑'],
  },
  relTypes: {
    filters: [{ key: 'name', label: '关系名称', type: 'search' }],
    columns: [
      { key: 'name', label: '关系类型' },
      { key: 'from', label: '起点' },
      { key: 'to', label: '终点' },
      { key: 'kind', label: '语义' },
      { key: 'builtin', label: '来源' },
    ],
    rows: [
      { name: '具备指标', from: '农业机械', to: '性能指标', kind: '组成', builtin: '内置' },
      { name: '开展试验', from: '农业机械', to: '试验', kind: '组成', builtin: '内置' },
      { name: '产生事件', from: '试验', to: '事件', kind: '因果', builtin: '内置' },
      { name: '依据标准', from: '试验', to: '标准规范', kind: '条件', builtin: '内置' },
      { name: '导致变更', from: '事件', to: '技术状态', kind: '因果', builtin: '自定义' },
    ],
    ops: ['编辑', '删除'],
  },
  probes: {
    filters: [
      { key: 'name', label: '探针名称', type: 'search' },
      { key: 'scope', label: '应用范围', options: ['动力性能', '牵引性能', '收获质量', '可靠性', '安全环保'] },
    ],
    columns: [
      { key: 'name', label: '探针名称' },
      { key: 'scope', label: '应用范围' },
      { key: 'dim', label: '定位维度' },
      { key: 'signals', label: '关注信号' },
      { key: 'status', label: '状态', kind: 'badge' },
    ],
    rows: [
      { name: '标定功率偏离探针', scope: '动力性能', dim: '指标值 / 标准限值', signals: '功率、转速、油耗', status: '启用' },
      { name: 'PTO转速符合性探针', scope: '动力性能', dim: '指标值', signals: '540/1000 r/min', status: '启用' },
      { name: '牵引力滑转耦合探针', scope: '牵引性能', dim: '指标关系', signals: '牵引力、滑转率', status: '启用' },
      { name: '牵引功率不足探针', scope: '牵引性能', dim: '异常模式', signals: '牵引功率', status: '启用' },
      { name: '收获总损失探针', scope: '收获质量', dim: '指标值', signals: '总损失率', status: '启用' },
      { name: '籽粒破碎探针', scope: '收获质量', dim: '指标值', signals: '破碎率', status: '启用' },
      { name: '含杂超限探针', scope: '收获质量', dim: '合规风险', signals: '含杂率', status: '启用' },
      { name: '可靠性MTBF探针', scope: '可靠性', dim: '试验结果', signals: '故障次数、作业时间', status: '启用' },
      { name: '早期故障聚集探针', scope: '可靠性', dim: '时序异常', signals: '故障间隔', status: '启用' },
      { name: '制动距离探针', scope: '安全环保', dim: '合规风险', signals: '制动距离', status: '启用' },
      { name: '驾驶员耳旁噪声探针', scope: '安全环保', dim: '指标值', signals: '噪声 dB(A)', status: '启用' },
      { name: '排放烟度探针', scope: '安全环保', dim: '标准符合性', signals: '烟度、NOx', status: '启用' },
    ],
    ops: ['编辑', '定位', '删除'],
  },
  syncTasks: {
    filters: [{ key: 'name', label: '任务名称', type: 'search' }],
    columns: [
      { key: 'name', label: '对接任务' },
      { key: 'source', label: '来源' },
      { key: 'mode', label: '同步方式' },
      { key: 'incr', label: '增量' },
      { key: 'status', label: '状态', kind: 'badge' },
      { key: 'time', label: '最近执行' },
    ],
    rows: [
      { name: '资源库试验数据实时同步', source: '领域资源库', mode: '实时', incr: '是', status: '启用', time: '2026-10-19 18:02' },
      { name: '再造平台解析成果定时回流', source: '数据智能再造平台', mode: '定时 02:00', incr: '是', status: '启用', time: '2026-10-19 02:00' },
      { name: '标准规范周增量', source: '标准规范库', mode: '定时 每周一', incr: '是', status: '启用', time: '2026-10-13 02:10' },
    ],
    ops: ['立即同步', '编辑', '日志'],
  },
  algorithms: {
    filters: [],
    columns: [
      { key: 'name', label: '算法' },
      { key: 'scene', label: '用途' },
      { key: 'acc', label: '近期准确率' },
      { key: 'status', label: '状态', kind: 'badge' },
    ],
    rows: [
      { name: '领域分词', scene: '试验文本分词', acc: '96.2%', status: '启用' },
      { name: '实体识别', scene: '指标、机型、标准', acc: '87.4%', status: '启用' },
      { name: '语义标注', scene: '章节与指标语义', acc: '84.1%', status: '启用' },
      { name: '关系抽取', scene: '实体事件关系', acc: '78.6%', status: '启用' },
      { name: '特征嵌入', scene: '多模态向量', acc: '—', status: '启用' },
      { name: '异常模式匹配', scene: '探针信号对齐', acc: '82.0%', status: '启用' },
    ],
    ops: ['评估', '配置'],
  },
  trialData: {
    filters: [
      { key: 'name', label: '关键词', type: 'search' },
      { key: 'type', label: '数据类型', options: ['CSV', 'TXT', 'PDF', 'Word', '图像'] },
      { key: 'scene', label: '试验场景', options: ['牵引试验', 'PTO试验', '田间收获', '可靠性', '安全'] },
    ],
    columns: [
      { key: 'name', label: '数据名称' },
      { key: 'type', label: '类型' },
      { key: 'scene', label: '试验场景' },
      { key: 'time', label: '试验时间' },
      { key: 'machine', label: '机型' },
    ],
    rows: [
      { name: 'LF2204混凝土路面牵引曲线', type: 'CSV', scene: '牵引试验', time: '2026-06-02', machine: '东方红-LF2204' },
      { name: 'LF2204 PTO功率试验记录', type: 'Word', scene: 'PTO试验', time: '2026-05-28', machine: '东方红-LF2204' },
      { name: '4LZ-8小麦收获损失抽样', type: 'PDF', scene: '田间收获', time: '2026-06-16', machine: '雷沃谷神4LZ-8' },
      { name: '4YZP-4可靠性故障台账', type: 'TXT', scene: '可靠性', time: '2026-08-02', machine: '五征4YZP-4' },
      { name: '制动距离试验照片', type: '图像', scene: '安全', time: '2026-07-11', machine: '东方红-LF2204' },
    ],
    ops: ['导出', '对接', '解析'],
  },
  schemes: {
    filters: [
      { key: 'name', label: '方案名称', type: 'search' },
      { key: 'status', label: '状态', options: ['草稿', '校核中', '已定稿'] },
    ],
    columns: [
      { key: 'name', label: '试验方案' },
      { key: 'machine', label: '机型' },
      { key: 'factors', label: '因子数' },
      { key: 'tpl', label: '模板' },
      { key: 'ver', label: '版本' },
      { key: 'status', label: '状态', kind: 'badge' },
      { key: 'time', label: '更新时间' },
    ],
    rows: [
      { name: 'LF2204轮式拖拉机定型试验方案', machine: '东方红-LF2204', factors: '24', tpl: '轮拖定型模板', ver: 'V1.2', status: '已定稿', time: '2026-04-18' },
      { name: '4LZ-8收获性能试验方案', machine: '雷沃谷神4LZ-8', factors: '21', tpl: '联合收割模板', ver: 'V0.9', status: '校核中', time: '2026-10-12' },
      { name: '2BMQ-6免耕播种田间方案', machine: '2BMQ-6', factors: '18', tpl: '播种机模板', ver: 'V0.4', status: '草稿', time: '2026-10-15' },
    ],
    ops: ['编辑', '优化', '版本'],
  },
  cases: {
    filters: [{ key: 'name', label: '关键词', type: 'search' }],
    columns: [
      { key: 'name', label: '案例 / 资源' },
      { key: 'kind', label: '类型' },
      { key: 'machine', label: '机型' },
      { key: 'ver', label: '版本' },
      { key: 'time', label: '入库时间' },
    ],
    rows: [
      { name: '2024年大马力轮拖定型案例', kind: '历史案例', machine: '东方红-LX2204', ver: 'V3', time: '2025-01-12' },
      { name: '洛阳牵引试验场负荷车资源', kind: '试验资源', machine: '通用', ver: 'V2', time: '2026-03-02' },
      { name: '电涡流测功机操作参数包', kind: '试验资源', machine: '通用', ver: 'V5', time: '2026-05-19' },
      { name: '小麦收获对比试验案例', kind: '历史案例', machine: '雷沃谷神4LZ-8', ver: 'V1', time: '2025-07-22' },
    ],
    ops: ['查阅', '历史版本'],
  },
  schemeTpls: {
    filters: [],
    columns: [
      { key: 'name', label: '模板名称' },
      { key: 'scene', label: '适用场景' },
      { key: 'factors', label: '建议因子' },
      { key: 'ver', label: '版本' },
      { key: 'status', label: '状态', kind: 'badge' },
    ],
    rows: [
      { name: '轮式拖拉机定型试验方案模板', scene: '定型鉴定', factors: '22', ver: 'V2.1', status: '启用' },
      { name: '联合收割机性能试验模板', scene: '性能鉴定', factors: '20', ver: 'V1.4', status: '启用' },
      { name: '可靠性试验方案模板', scene: '可靠性', factors: '12', ver: 'V1.0', status: '启用' },
    ],
    ops: ['更新', '删除'],
  },
  codes: {
    filters: [{ key: 'name', label: '任务', type: 'search' }],
    columns: [
      { key: 'name', label: '编码任务' },
      { key: 'lang', label: '语言' },
      { key: 'scene', label: '试验' },
      { key: 'status', label: '状态', kind: 'badge' },
      { key: 'time', label: '生成时间' },
    ],
    rows: [
      { name: 'PTO功率曲线计算', lang: 'Python', scene: '动力输出轴试验', status: '已完成', time: '2026-10-11 09:20' },
      { name: '牵引滑转率拟合', lang: 'MATLAB', scene: '牵引性能试验', status: '已完成', time: '2026-10-11 10:02' },
      { name: '负荷车闭环控制骨架', lang: 'C++', scene: '牵引试验', status: '纠错中', time: '2026-10-16 14:12' },
    ],
    ops: ['查看', '纠错', '注释'],
  },
  testRes: {
    filters: [
      { key: 'name', label: '资源名称', type: 'search' },
      { key: 'cat', label: '类别', options: ['试验设备', '场地', '仪器', '人员', '工况'] },
    ],
    columns: [
      { key: 'name', label: '资源' },
      { key: 'cat', label: '类别' },
      { key: 'spec', label: '规格' },
      { key: 'use', label: '用途' },
      { key: 'cluster', label: '聚类' },
      { key: 'status', label: '状态', kind: 'badge' },
    ],
    rows: [
      { name: '300 kN 负荷车', cat: '试验设备', spec: '最大负荷 300 kN', use: '牵引试验', cluster: '牵引加载', status: '可用' },
      { name: '电涡流测功机', cat: '仪器', spec: '0–250 kW', use: 'PTO功率', cluster: '功率测量', status: '可用' },
      { name: '洛阳混凝土试验跑道', cat: '场地', spec: '1.2 km', use: '牵引与制动', cluster: '标准路面', status: '可用' },
      { name: '田间损失采样框', cat: '仪器', spec: '1 m²', use: '收获损失', cluster: '收获计量', status: '可用' },
      { name: '噪声频谱仪', cat: '仪器', spec: '1级', use: '耳旁噪声', cluster: '安全环保', status: '校准中' },
    ],
    ops: ['详情', '更新', '删除'],
  },
  recommends: {
    filters: [{ key: 'task', label: '试验任务', type: 'search' }],
    columns: [
      { key: 'task', label: '新试验任务' },
      { key: 'res', label: '推荐资源' },
      { key: 'method', label: '相似度算法' },
      { key: 'score', label: '相似度' },
      { key: 'caseName', label: '溯源案例' },
    ],
    rows: [
      { task: 'LF2204补充牵引试验', res: '300 kN 负荷车 + 混凝土跑道', method: '余弦相似度', score: '0.93', caseName: '2024年大马力轮拖定型案例' },
      { task: 'LF2204补充牵引试验', res: '电涡流测功机', method: '欧氏距离', score: '0.81', caseName: 'PTO功率测试案例' },
      { task: '4LZ-8小麦收获试验', res: '田间损失采样框', method: '余弦相似度', score: '0.88', caseName: '小麦收获对比试验案例' },
    ],
    ops: ['对比', '溯源', '采纳'],
  },
  samples: {
    filters: [{ key: 'name', label: '样本集', type: 'search' }],
    columns: [
      { key: 'name', label: '样本集' },
      { key: 'n', label: '样本量' },
      { key: 'bias', label: '偏差判断' },
      { key: 'miss', label: '缺失率' },
      { key: 'advice', label: '研判建议' },
      { key: 'status', label: '状态', kind: 'badge' },
    ],
    rows: [
      { name: 'LF2204牵引重复试验', n: '18', bias: '滑转率方差偏大', miss: '2%', advice: '补测低速档 4 组', status: '待处理' },
      { name: '4LZ-8损失抽样', n: '36', bias: '正常', miss: '0%', advice: '可进入方案', status: '已确认' },
      { name: '植保无人机喷幅', n: '9', bias: '数量不足', miss: '11%', advice: '生成补全样本并人工核验', status: '增强中' },
    ],
    ops: ['分析', '增强'],
  },
  documents: {
    filters: [
      { key: 'name', label: '文档名称', type: 'search' },
      { key: 'type', label: '类型', options: ['Word', 'PDF', 'WPS', '图片', '扫描件', '压缩包'] },
    ],
    columns: [
      { key: 'name', label: '文档' },
      { key: 'type', label: '格式' },
      { key: 'cls', label: '智能分类' },
      { key: 'tags', label: '标签' },
      { key: 'time', label: '归集时间' },
    ],
    rows: [
      { name: 'LF2204研制总要求', type: 'Word', cls: '研制总要求', tags: '轮拖,动力,牵引', time: '2026-02-11' },
      { name: 'LF2204试验总案', type: 'PDF', cls: '试验总案', tags: '定型,大纲上游', time: '2026-03-02' },
      { name: 'LF2204性能试验大纲', type: 'WPS', cls: '性能试验大纲', tags: 'PTO,牵引', time: '2026-03-20' },
      { name: 'LF2204性能试验报告', type: 'PDF', cls: '性能试验报告', tags: '已鉴定', time: '2026-07-18' },
      { name: 'LF2204可靠性试验大纲', type: 'Word', cls: '性能试验大纲', tags: '可靠性', time: '2026-04-02' },
      { name: '制动试验现场扫描件', type: '扫描件', cls: '原始记录', tags: 'OCR已还原', time: '2026-07-11' },
      { name: '鉴定资料压缩包-批次A', type: '压缩包', cls: '资料包', tags: '待拆分', time: '2026-10-01' },
    ],
    ops: ['检索', 'OCR', '打开'],
  },
  ontology: {
    filters: [],
    columns: [
      { key: 'name', label: '概念' },
      { key: 'attrs', label: '属性' },
      { key: 'rel', label: '关系' },
      { key: 'doc', label: '关联文书' },
    ],
    rows: [
      { name: '战技指标', attrs: '名称、数值、单位、允差', rel: '被大纲引用、被报告验证', doc: '总要求 / 大纲 / 报告' },
      { name: '试验项目', attrs: '名称、方法、样本量', rel: '验证指标、使用资源', doc: '大纲 / 报告' },
      { name: '时间节点', attrs: '计划、实际', rel: '约束项目', doc: '总案 / 大纲' },
      { name: '标准条款', attrs: '编号、正文', rel: '作为审查依据', doc: '标准规范' },
    ],
    ops: ['编辑', '关系'],
  },
  terms: {
    filters: [{ key: 'name', label: '术语', type: 'search' }],
    columns: [
      { key: 'name', label: '规范术语' },
      { key: 'alias', label: '同义表述' },
      { key: 'lib', label: '术语库类型' },
      { key: 'status', label: '状态', kind: 'badge' },
    ],
    rows: [
      { name: '动力输出轴功率', alias: 'PTO功率；输出轴功率', lib: '动力性能', status: '启用' },
      { name: '滑转率', alias: '打滑率；滑转系数', lib: '牵引性能', status: '启用' },
      { name: '总损失率', alias: '收获总损失', lib: '收获质量', status: '启用' },
      { name: '平均故障间隔时间', alias: 'MTBF', lib: '可靠性', status: '启用' },
      { name: '定型鉴定', alias: '定型试验鉴定', lib: '鉴定通识', status: '启用' },
    ],
    ops: ['映射', '编辑'],
  },
  reviewRules: {
    filters: [
      { key: 'name', label: '规则', type: 'search' },
      { key: 'level', label: '级别', options: ['强制', '建议', '提示'] },
    ],
    columns: [
      { key: 'name', label: '审查规则' },
      { key: 'type', label: '规则类型' },
      { key: 'cls', label: '农业分类' },
      { key: 'level', label: '级别' },
      { key: 'ver', label: '版本' },
      { key: 'status', label: '状态', kind: 'badge' },
    ],
    rows: [
      { name: '大纲指标不得低于研制总要求', type: '跨文档一致性', cls: '拖拉机', level: '强制', ver: 'V1.4', status: '启用' },
      { name: '报告指标数值须回链大纲', type: '数据一致性', cls: '拖拉机', level: '强制', ver: 'V1.2', status: '启用' },
      { name: '必需要素章节完整性', type: '标准符合性', cls: '收获机械', level: '强制', ver: 'V2.0', status: '启用' },
      { name: '术语前后一致', type: '术语一致性', cls: '通用', level: '建议', ver: 'V1.0', status: '启用' },
      { name: '错别字与标点', type: '语言语法', cls: '通用', level: '提示', ver: 'V3.1', status: '启用' },
      { name: '时间节点因果闭环', type: '逻辑性', cls: '播种机械', level: '建议', ver: 'V1.1', status: '启用' },
    ],
    ops: ['编辑', '版本', '停用'],
  },
  reviewIssues: {
    filters: [
      { key: 'doc', label: '文档', type: 'search' },
      { key: 'level', label: '等级', options: ['高', '中', '低'] },
    ],
    columns: [
      { key: 'doc', label: '文档' },
      { key: 'issue', label: '问题' },
      { key: 'level', label: '等级', kind: 'badge' },
      { key: 'basis', label: '依据' },
      { key: 'advice', label: '修改建议' },
      { key: 'status', label: '整改', kind: 'badge' },
    ],
    rows: [
      { doc: 'LF2204性能试验报告', issue: '最大牵引力 36.2 kN 与大纲 38 kN 不一致', level: '高', basis: '跨文档一致性规则', advice: '核对原始记录后回写', status: '待审核' },
      { doc: 'LF2204性能试验大纲', issue: '未单列环境条件章节', level: '中', basis: 'DG/T 001 章节完整性', advice: '补充试验环境', status: '待审核' },
      { doc: '4LZ-8鉴定大纲', issue: '“总损失”与“收获总损失率”混用', level: '低', basis: '术语一致性', advice: '统一为总损失率', status: '已确认' },
    ],
    ops: ['定位', '批注', '建议'],
  },
  reports: {
    filters: [{ key: 'name', label: '报告', type: 'search' }],
    columns: [
      { key: 'name', label: '评审报告' },
      { key: 'scene', label: '场景' },
      { key: 'tpl', label: '模板' },
      { key: 'issues', label: '问题数' },
      { key: 'status', label: '状态', kind: 'badge' },
      { key: 'time', label: '生成时间' },
    ],
    rows: [
      { name: 'LF2204定型文件一致性审查报告', scene: '跨文档审查', tpl: '鉴定审查报告模板', issues: '7', status: '已完成', time: '2026-10-17 11:20' },
      { name: '4LZ-8大纲合规预审报告', scene: '单文档审查', tpl: '大纲预审模板', issues: '3', status: '校核中', time: '2026-10-18 09:40' },
    ],
    ops: ['预览', '导出Word', '导出PDF'],
  },
  papers: {
    filters: [{ key: 'name', label: '文献', type: 'search' }],
    columns: [
      { key: 'name', label: '文献' },
      { key: 'type', label: '类型' },
      { key: 'field', label: '领域' },
      { key: 'innov', label: '创新点数' },
      { key: 'status', label: '状态', kind: 'badge' },
    ],
    rows: [
      { name: '大马力拖拉机无级变速牵引特性研究', type: '试验论文', field: '拖拉机', innov: '4', status: '已抽取' },
      { name: '气力式排种器均匀性改进课题报告', type: '课题成果', field: '播种机械', innov: '3', status: '已抽取' },
      { name: '玉米收获机剥皮机构鉴定技术分析', type: '技术鉴定文件', field: '收获机械', innov: '2', status: '解析中' },
      { name: '植保无人机变量施药试验', type: '试验论文', field: '植保机械', innov: '3', status: '已抽取' },
    ],
    ops: ['抽取', 'JSON', '打开'],
  },
  innovations: {
    filters: [
      { key: 'title', label: '创新点', type: 'search' },
      { key: 'field', label: '领域', options: ['拖拉机', '播种机械', '收获机械', '植保机械'] },
    ],
    columns: [
      { key: 'title', label: '创新点' },
      { key: 'subject', label: '主体' },
      { key: 'action', label: '动作' },
      { key: 'detail', label: '技术细节' },
      { key: 'effect', label: '目标效果' },
      { key: 'level', label: '程度' },
      { key: 'cluster', label: '聚类' },
    ],
    rows: [
      { title: '双行星排无级变速匹配牵引工况', subject: '传动系统', action: '匹配优化', detail: '按滑转率分区调节传动比', effect: '牵引功率提高 6%', level: '显著', cluster: '传动控制' },
      { title: '正压气送排种均匀性补偿', subject: '排种器', action: '结构改进', detail: '增加二次匀种腔', effect: '合格指数 +3.1%', level: '改进', cluster: '排种气力' },
      { title: '剥皮辊间隙自适应', subject: '剥皮机构', action: '控制方法', detail: '基于果穗直径反馈', effect: '籽粒损失下降', level: '改进', cluster: '收获损失' },
      { title: '多光谱变量施药决策', subject: '施药系统', action: '决策模型', detail: '冠层指数映射喷量', effect: '药液减量 12%', level: '显著', cluster: '变量作业' },
    ],
    ops: ['图谱', 'JSON'],
  },
  dupChecks: {
    filters: [{ key: 'name', label: '项目', type: 'search' }],
    columns: [
      { key: 'name', label: '待查项目' },
      { key: 'hit', label: '相似立项' },
      { key: 'dim', label: '最高相似维度' },
      { key: 'score', label: '综合相似度' },
      { key: 'judge', label: '判定' },
    ],
    rows: [
      { name: '大马力拖拉机智能牵引控制', hit: '无级变速牵引特性研究', dim: '技术路线 0.86', score: '0.74', judge: '部分重合，建议说明差异' },
      { name: '气送式播种监测', hit: '气力式排种器均匀性改进', dim: '研究内容 0.81', score: '0.69', judge: '创新点可区分' },
      { name: '玉米机低损剥皮', hit: '剥皮机构鉴定技术分析', dim: '技术指标 0.77', score: '0.62', judge: '场景不同' },
    ],
    ops: ['六维明细', '溯源立项', '导出'],
  },
  trainSets: {
    filters: [{ key: 'name', label: '数据集', type: 'search' }],
    columns: [
      { key: 'name', label: '数据集' },
      { key: 'modal', label: '模态' },
      { key: 'files', label: '文件数' },
      { key: 'task', label: '关联训练任务' },
      { key: 'status', label: '状态', kind: 'badge' },
    ],
    rows: [
      { name: '定型报告语料-2026Q3', modal: 'pdf/docx/txt', files: '1860', task: '鉴定领域继续预训练', status: '已清洗' },
      { name: '指标抽取指令集', modal: 'json', files: '5200', task: '指标抽取SFT', status: '可训练' },
      { name: '标准条款问答对', modal: 'json/csv', files: '3400', task: '—', status: '标注中' },
      { name: '试验现场图像', modal: 'jpg/png', files: '960', task: '多模态对齐', status: '已解析' },
    ],
    ops: ['预览', '删除项', '绑定任务'],
  },
  inferTasks: {
    filters: [{ key: 'name', label: '任务', type: 'search' }],
    columns: [
      { key: 'name', label: '推理任务' },
      { key: 'status', label: '状态', kind: 'badge' },
      { key: 'by', label: '创建人' },
      { key: 'members', label: '可见成员' },
      { key: 'src', label: '来源' },
      { key: 'audit', label: '审核进度' },
      { key: 'tags', label: '标签' },
      { key: 'time', label: '创建时间' },
    ],
    rows: [
      { name: '拖拉机指标问答抽检', status: '已完成', by: '李慧敏', members: '鉴定一组', src: '指标抽取SFT', audit: '100%', tags: '拖拉机,问答', time: '2026-10-12' },
      { name: '大纲条款改写评估', status: '进行中', by: '王建国', members: '文档组', src: '条款问答对', audit: '46%', tags: '大纲', time: '2026-10-18' },
    ],
    ops: ['标签', '删除'],
  },
  confidence: {
    filters: [],
    columns: [
      { key: 'model', label: '模型' },
      { key: 'scene', label: '场景' },
      { key: 'sample', label: '多次采样一致性' },
      { key: 'ensemble', label: '集成准确率' },
      { key: 'ctx', label: '上下文一致性' },
      { key: 'score', label: '综合置信度' },
      { key: 'side', label: '强弱项' },
    ],
    rows: [
      { model: '鉴定领域-Qwen32B-SFT', scene: '指标抽取', sample: '0.91', ensemble: '0.88', ctx: '0.86', score: '0.89', side: '强：数值抽取 / 弱：跨文档推理' },
      { model: '鉴定领域-GLM32B-SFT', scene: '条款审查', sample: '0.84', ensemble: '0.82', ctx: '0.90', score: '0.85', side: '强：长文一致 / 弱：表格' },
      { model: '基座Qwen2.5-32B', scene: '开放问答', sample: '0.73', ensemble: '0.70', ctx: '0.75', score: '0.72', side: '强：通识 / 弱：标准编号' },
    ],
    ops: ['报告', '可视化'],
  },
  loraJobs: {
    filters: [],
    columns: [
      { key: 'name', label: '微调任务' },
      { key: 'base', label: '基座' },
      { key: 'params', label: '参数量' },
      { key: 'epoch', label: '轮次' },
      { key: 'lr', label: '学习率' },
      { key: 'bs', label: '批大小' },
      { key: 'eta', label: '耗时预估' },
      { key: 'status', label: '状态', kind: 'badge' },
    ],
    rows: [
      { name: '指标抽取增量微调', base: 'Qwen2.5-32B', params: '32B', epoch: '3', lr: '1e-4', bs: '16', eta: '18 h', status: '已完成' },
      { name: '审查规则对齐', base: 'GLM-4-32B', params: '32B', epoch: '2', lr: '8e-5', bs: '8', eta: '22 h', status: '排队中' },
      { name: '文献创新点抽取', base: 'Qwen2.5-32B', params: '32B', epoch: '2', lr: '1e-4', bs: '8', eta: '14 h', status: '进行中' },
    ],
    ops: ['启动', '监控', '日志'],
  },
  llmModels: {
    filters: [
      { key: 'name', label: '模型', type: 'search' },
      { key: 'kind', label: '类型', options: ['开源基座', '微调模型'] },
    ],
    columns: [
      { key: 'name', label: '模型' },
      { key: 'kind', label: '类型' },
      { key: 'family', label: '家族' },
      { key: 'ver', label: '版本' },
      { key: 'deploy', label: '部署' },
      { key: 'status', label: '状态', kind: 'badge' },
    ],
    rows: [
      { name: 'Qwen2.5-32B-Instruct', kind: '开源基座', family: 'Qwen', ver: 'base', deploy: 'vLLM', status: '在线' },
      { name: 'GLM-4-32B', kind: '开源基座', family: 'GLM', ver: 'base', deploy: 'vLLM', status: '在线' },
      { name: '鉴定-Qwen32B-SFT-v3', kind: '微调模型', family: 'Qwen', ver: 'v3', deploy: 'vLLM', status: '在线' },
      { name: '鉴定-GLM32B-SFT-v1', kind: '微调模型', family: 'GLM', ver: 'v1', deploy: '未部署', status: '已评估' },
    ],
    ops: ['部署', '回滚', '调试'],
  },
  quants: {
    filters: [],
    columns: [
      { key: 'model', label: '模型' },
      { key: 'quant', label: '量化' },
      { key: 'bleu', label: 'BLEU' },
      { key: 'rouge', label: 'ROUGE-L' },
      { key: 'speed', label: 'token/s' },
      { key: 'advice', label: '建议' },
    ],
    rows: [
      { model: '鉴定-Qwen32B', quant: 'FP16', bleu: '41.2', rouge: '52.6', speed: '18', advice: '质量优先' },
      { model: '鉴定-Qwen32B', quant: 'AWQ-4bit', bleu: '39.4', rouge: '50.1', speed: '36', advice: '算力受限时推荐' },
      { model: '鉴定-Qwen32B', quant: 'GPTQ-8bit', bleu: '40.6', rouge: '51.8', speed: '24', advice: '均衡' },
    ],
    ops: ['对比图', '选用'],
  },
  prompts: {
    filters: [{ key: 'name', label: '模板', type: 'search' }],
    columns: [
      { key: 'name', label: '提示模板' },
      { key: 'cat', label: '分类' },
      { key: 'scene', label: '场景' },
      { key: 'ver', label: '版本' },
      { key: 'status', label: '状态', kind: 'badge' },
    ],
    rows: [
      { name: '定型指标抽取提示', cat: '抽取', scene: '关键指标', ver: 'v4', status: '启用' },
      { name: '跨文档冲突审查提示', cat: '审查', scene: '大纲-报告', ver: 'v2', status: '启用' },
      { name: '试验方案起草提示', cat: '生成', scene: '方案设计', ver: 'v3', status: '启用' },
      { name: '创新点结构化提示', cat: '抽取', scene: '文献', ver: 'v1', status: '启用' },
    ],
    ops: ['复用', '优化', '入库'],
  },
  metrics: {
    filters: [],
    columns: [
      { key: 'name', label: '指标名称' },
      { key: 'type', label: '类型' },
      { key: 'domain', label: '适用领域' },
      { key: 'api', label: '指标API' },
      { key: 'ver', label: '版本' },
      { key: 'time', label: '最后更新' },
    ],
    rows: [
      { name: 'ROUGE', type: '生成', domain: '摘要/报告', api: '/metrics/rouge', ver: '1.2.0', time: '2026-08-01' },
      { name: 'BLEU', type: '生成', domain: '翻译式改写', api: '/metrics/bleu', ver: '1.0.3', time: '2026-08-01' },
      { name: 'BERTScore', type: '生成', domain: '语义相似', api: '/metrics/bertscore', ver: '1.1.0', time: '2026-09-12' },
      { name: 'Accuracy', type: '分类', domain: '抽取判定', api: '/metrics/acc', ver: '1.0.0', time: '2026-07-02' },
      { name: 'F1', type: '分类', domain: '实体抽取', api: '/metrics/f1', ver: '1.3.0', time: '2026-09-20' },
      { name: '指标数值精确匹配', type: '自定义', domain: '试验鉴定', api: '/metrics/value-em', ver: '0.9.0', time: '2026-10-08' },
    ],
    ops: ['编辑', '版本'],
  },
  agents: {
    filters: [{ key: 'name', label: '智能体', type: 'search' }],
    columns: [
      { key: 'name', label: '智能体' },
      { key: 'flow', label: '工作流' },
      { key: 'model', label: '大模型' },
      { key: 'status', label: '状态', kind: 'badge' },
      { key: 'qps', label: '当前并发' },
    ],
    rows: [
      { name: '指标抽取智能体', flow: '解析-抽取-溯源', model: '鉴定-Qwen32B-v3', status: '在线', qps: '4/10' },
      { name: '跨文档审查智能体', flow: '实体对齐-冲突-建议', model: '鉴定-GLM32B-v1', status: '在线', qps: '2/10' },
      { name: '探针根因智能体', flow: '定位-图谱-报告', model: '鉴定-Qwen32B-v3', status: '下线', qps: '0/10' },
    ],
    ops: ['上线', '下线', '调用说明'],
  },
  plugins: {
    filters: [{ key: 'name', label: '插件', type: 'search' }],
    columns: [
      { key: 'name', label: '插件' },
      { key: 'lang', label: '语言' },
      { key: 'proto', label: '协议' },
      { key: 'scope', label: '可见范围' },
      { key: 'status', label: '状态', kind: 'badge' },
    ],
    rows: [
      { name: '标准条款检索', lang: 'Python', proto: 'MCP', scope: '文档平台', status: '上线' },
      { name: 'OCR版式服务', lang: 'Java', proto: 'HTTP', scope: '再造平台', status: '上线' },
      { name: '试验设备台账', lang: 'Python', proto: 'HTTP', scope: '设计平台', status: '审核中' },
      { name: '时序库读取', lang: 'Java', proto: 'TCP', scope: '探针平台', status: '下线' },
    ],
    ops: ['调试', '审核', '权限'],
  },
  modules: {
    filters: [],
    columns: [
      { key: 'name', label: '模块' },
      { key: 'desc', label: '说明' },
      { key: 'in', label: '输入' },
      { key: 'out', label: '返回' },
      { key: 'scene', label: '场景' },
    ],
    rows: [
      { name: '文档解析模块', desc: '版式还原与结构化', in: 'fileId', out: 'blocks', scene: '再造 / 审查' },
      { name: '指标抽取模块', desc: '按配置抽取指标', in: 'docId, schema', out: 'indicators', scene: '再造' },
      { name: '冲突比对模块', desc: '跨文档实体比对', in: 'docIds', out: 'conflicts', scene: '审校' },
      { name: '图谱检索模块', desc: '实体关系召回', in: 'query', out: 'triples', scene: '问答' },
    ],
    ops: ['嵌套', '参数映射'],
  },
  kb: {
    filters: [{ key: 'name', label: '知识库', type: 'search' }],
    columns: [
      { key: 'name', label: '知识库' },
      { key: 'cat', label: '领域分类' },
      { key: 'docs', label: '文档数' },
      { key: 'owner', label: '归属' },
      { key: 'ver', label: '版本' },
      { key: 'status', label: '状态', kind: 'badge' },
    ],
    rows: [
      { name: '领域通识库', cat: '领域通识', docs: '2400', owner: '平台', ver: 'v6', status: '启用' },
      { name: '定型资料库', cat: '农业机械定型资料', docs: '8600', owner: '鉴定处', ver: 'v12', status: '启用' },
      { name: '试验资料库', cat: '试验资料', docs: '5100', owner: '试验室', ver: 'v8', status: '启用' },
      { name: '研究成果库', cat: '试验鉴定研究成果', docs: '1320', owner: '研究室', ver: 'v4', status: '启用' },
      { name: '个人-李慧敏', cat: '个人知识库', docs: '86', owner: '李慧敏', ver: 'v3', status: '启用' },
    ],
    ops: ['导入', '权限', '版本'],
  },
  qa: {
    filters: [{ key: 'q', label: '问题', type: 'search' }],
    columns: [
      { key: 'q', label: '问题' },
      { key: 'a', label: '答案摘要' },
      { key: 'src', label: '来源' },
      { key: 'status', label: '回流审核', kind: 'badge' },
    ],
    rows: [
      { q: 'LF2204发动机标定功率是多少？', a: '162 kW，见定型报告第17页。', src: '定型报告', status: '已确认' },
      { q: '牵引试验滑转率合格如何判定？', a: '按 DG/T 001 对应工况限值。', src: 'DG/T 001-2025', status: '待审核' },
      { q: '可靠性试验 MTBF 怎么计算？', a: '累计作业时间 / 故障次数。', src: 'NY/T 2090', status: '已确认' },
    ],
    ops: ['编辑', '审核'],
  },
  licenses: {
    filters: [],
    columns: [
      { key: 'name', label: '许可证' },
      { key: 'owner', label: '使用单位' },
      { key: 'start', label: '生效' },
      { key: 'end', label: '到期' },
      { key: 'status', label: '状态', kind: 'badge' },
    ],
    rows: [
      { name: '综合服务平台-生产许可', owner: '农业机械试验鉴定总站', start: '2026-01-01', end: '2027-12-31', status: '已激活' },
      { name: '训推资源包-32B', owner: '模型组', start: '2026-06-01', end: '2027-05-31', status: '已激活' },
    ],
    ops: ['续期', '变更'],
  },
  stdDocs: {
    filters: [{ key: 'name', label: '文档', type: 'search' }],
    columns: [
      { key: 'name', label: '文档' },
      { key: 'kind', label: '标准类型' },
      { key: 'machine', label: '机型' },
      { key: 'rel', label: '关联' },
      { key: 'status', label: '状态', kind: 'badge' },
    ],
    rows: [
      { name: 'LF2204试验总案', kind: '试验总案', machine: '东方红-LF2204', rel: '大纲、报告', status: '在库' },
      { name: 'LF2204性能试验大纲', kind: '大纲', machine: '东方红-LF2204', rel: '总案、报告', status: '在库' },
      { name: 'LF2204性能试验报告', kind: '报告', machine: '东方红-LF2204', rel: '大纲', status: '在库' },
      { name: '4LZ-8试验总案', kind: '试验总案', machine: '雷沃谷神4LZ-8', rel: '大纲草案', status: '在库' },
    ],
    ops: ['关联', '追溯'],
  },
}

export function cloneRows(id) {
  return (datasets[id]?.rows || []).map((row) => ({ ...row }))
}

// ── 镜头一：资源处理结果详情（key = 资源名称）────────────────────────
export const resourceDetails = {
  '某型装备研制总要求（D-01）': {
    name: '某型装备研制总要求（D-01）',
    fmt: 'PDF', size: '12.4 MB', pages: 48,
    parsedAt: '2026-10-08 09:26:47',
    tableCount: 12, imageCount: 9, paraCount: 326,
    indexStatus: '已建立', indexName: 'idx-d01-20261008', indexAt: '2026-10-08 09:27:03',
    entities: [
      { label: '农业机械型号', count: 8 },
      { label: '性能指标', count: 26 },
      { label: '指标数值', count: 34 },
      { label: '试验项目', count: 12 },
      { label: '标准编号', count: 6 },
      { label: '试验机构', count: 3 },
    ],
    chapters: [
      { id: 'c1', title: '1 总则', level: 1, children: [
        { id: 'c1-1', title: '1.1 任务来源', level: 2 },
        { id: 'c1-2', title: '1.2 研制依据', level: 2 },
      ]},
      { id: 'c2', title: '2 战术技术指标', level: 1, children: [
        { id: 'c2-1', title: '2.1 机动性能', level: 2 },
        { id: 'c2-2', title: '2.2 火力性能', level: 2 },
        { id: 'c2-3', title: '2.3 防护性能', level: 2 },
      ]},
      { id: 'c3', title: '3 可靠性与维修性', level: 1, children: [
        { id: 'c3-1', title: '3.1 可靠性指标', level: 2 },
        { id: 'c3-2', title: '3.2 维修性指标', level: 2 },
      ]},
      { id: 'c4', title: '4 环境适应性', level: 1 },
      { id: 'c5', title: '5 电磁兼容性', level: 1 },
      { id: 'c6', title: '6 信息能力', level: 1 },
      { id: 'c7', title: '附录 A 指标汇总表', level: 1 },
    ],
  },
  '雷沃谷神4LZ-8谷物联合收割机鉴定大纲': {
    name: '雷沃谷神4LZ-8谷物联合收割机鉴定大纲',
    fmt: 'PDF', size: '18.2 MB', pages: 86,
    parsedAt: '2026-10-09 10:12:40',
    tableCount: 8, imageCount: 5, paraCount: 214,
    indexStatus: '已建立', indexName: 'idx-4lz8-20261009', indexAt: '2026-10-09 10:13:02',
    entities: [
      { label: '农业机械型号', count: 5 },
      { label: '性能指标', count: 18 },
      { label: '指标数值', count: 29 },
      { label: '试验项目', count: 22 },
      { label: '标准编号', count: 9 },
      { label: '试验机构', count: 2 },
    ],
    chapters: [
      { id: 'c1', title: '1 适用范围', level: 1 },
      { id: 'c2', title: '2 规范性引用文件', level: 1 },
      { id: 'c3', title: '3 术语与定义', level: 1 },
      { id: 'c4', title: '4 试验条件', level: 1 },
      { id: 'c5', title: '5 试验项目与方法', level: 1, children: [
        { id: 'c5-1', title: '5.1 收获性能试验', level: 2 },
        { id: 'c5-2', title: '5.2 可靠性试验', level: 2 },
        { id: 'c5-3', title: '5.3 安全性检查', level: 2 },
      ]},
      { id: 'c6', title: '6 判定规则', level: 1 },
    ],
  },
  'NY/T 2090-2025 农业机械试验鉴定通则': {
    name: 'NY/T 2090-2025 农业机械试验鉴定通则',
    fmt: 'PDF', size: '6.8 MB', pages: 42,
    parsedAt: '2026-09-28 14:03:31',
    tableCount: 4, imageCount: 2, paraCount: 118,
    indexStatus: '已建立', indexName: 'idx-nyt2090-20260928', indexAt: '2026-09-28 14:03:52',
    entities: [
      { label: '农业机械型号', count: 3 },
      { label: '性能指标', count: 11 },
      { label: '指标数值', count: 16 },
      { label: '试验项目', count: 8 },
      { label: '标准编号', count: 14 },
      { label: '试验机构', count: 1 },
    ],
    chapters: [
      { id: 'c1', title: '1 范围', level: 1 },
      { id: 'c2', title: '2 规范性引用文件', level: 1 },
      { id: 'c3', title: '3 术语和定义', level: 1 },
      { id: 'c4', title: '4 基本要求', level: 1 },
      { id: 'c5', title: '5 鉴定程序', level: 1, children: [
        { id: 'c5-1', title: '5.1 申请与受理', level: 2 },
        { id: 'c5-2', title: '5.2 试验实施', level: 2 },
        { id: 'c5-3', title: '5.3 结果评定', level: 2 },
      ]},
      { id: 'c6', title: '附录 A 鉴定数据记录表', level: 1 },
    ],
  },
}

// ── D-08：探针配置包（12个探针，全部已启用） ──────────────────────────
export const probes = [
  { id:'P01', name:'弹着点散布探针',   obj:'立靶偏差',      criteria:'|dH|≤0.30mil & |dL|≤0.30mil', srcNode:'散布精度指标', metrics:5, updated:'2024-10-10' },
  { id:'P02', name:'初速一致性探针',   obj:'炮口初速',      criteria:'v0 ≥ 820 m/s',                 srcNode:'初速指标',     metrics:3, updated:'2024-10-10' },
  { id:'P03', name:'姿态角漂移探针',   obj:'飞行姿态角',    criteria:'|Δpitch|≤0.20°',              srcNode:'姿态稳定性',   metrics:4, updated:'2024-10-10' },
  { id:'P04', name:'身管温度探针',     obj:'身管温度',      criteria:'ΔT≤15℃',                      srcNode:'热变形指标',   metrics:2, updated:'2024-10-10' },
  { id:'P05', name:'温补系数探针',     obj:'定位定向温补',  criteria:'偏差≤5%',                      srcNode:'温补系数',     metrics:2, updated:'2024-10-10' },
  { id:'P06', name:'气象修正探针',     obj:'气象修正有效性',criteria:'修正残差≤0.05mil',              srcNode:'气象修正',     metrics:3, updated:'2024-10-11' },
  { id:'P07', name:'遥测信号探针',     obj:'遥测链路',      criteria:'丢包率≤0.1%',                  srcNode:'信号完整性',   metrics:3, updated:'2024-10-11' },
  { id:'P08', name:'定向精度探针',     obj:'方位定向',      criteria:'方位误差≤0.15mil',             srcNode:'定向精度',     metrics:3, updated:'2024-10-11' },
  { id:'P09', name:'时统精度探针',     obj:'时间同步',      criteria:'时差≤10μs',                   srcNode:'时间同步',     metrics:2, updated:'2024-10-11' },
  { id:'P10', name:'惯导精度探针',     obj:'惯导漂移',      criteria:'漂移≤0.01°/h',                srcNode:'惯导误差',     metrics:4, updated:'2024-10-12' },
  { id:'P11', name:'供电稳定性探针',   obj:'弹载供电',      criteria:'电压波动≤±5%',                 srcNode:'供电指标',     metrics:2, updated:'2024-10-12' },
  { id:'P12', name:'弹道偏差探针',     obj:'弹道CEP',       criteria:'CEP≤0.50mil',                  srcNode:'弹道偏差',     metrics:4, updated:'2024-10-12' },
]

// ── D-07：精度试验数据集（30发弹道数据，第19发预置异常） ────────────────
export const shots30 = [
  { id:1,  ts:'09:04:12', v0:822.1, dH: 0.08, dL:-0.05, anomaly:false },
  { id:2,  ts:'09:06:38', v0:821.8, dH:-0.11, dL: 0.03, anomaly:false },
  { id:3,  ts:'09:09:15', v0:823.4, dH: 0.14, dL:-0.08, anomaly:false },
  { id:4,  ts:'09:12:02', v0:820.9, dH:-0.07, dL: 0.12, anomaly:false },
  { id:5,  ts:'09:15:44', v0:822.6, dH: 0.19, dL:-0.10, anomaly:false },
  { id:6,  ts:'09:19:31', v0:821.3, dH:-0.15, dL: 0.08, anomaly:false },
  { id:7,  ts:'09:23:07', v0:823.1, dH: 0.22, dL:-0.14, anomaly:false },
  { id:8,  ts:'09:27:52', v0:820.5, dH:-0.09, dL: 0.06, anomaly:false },
  { id:9,  ts:'09:32:18', v0:822.8, dH: 0.17, dL:-0.11, anomaly:false },
  { id:10, ts:'09:36:44', v0:821.6, dH:-0.13, dL: 0.09, anomaly:false },
  { id:11, ts:'09:41:29', v0:823.0, dH: 0.20, dL:-0.07, anomaly:false },
  { id:12, ts:'09:46:03', v0:820.7, dH:-0.18, dL: 0.15, anomaly:false },
  { id:13, ts:'09:51:37', v0:822.3, dH: 0.12, dL:-0.09, anomaly:false },
  { id:14, ts:'09:56:12', v0:821.1, dH:-0.21, dL: 0.13, anomaly:false },
  { id:15, ts:'10:02:44', v0:823.7, dH: 0.25, dL:-0.06, anomaly:false },
  { id:16, ts:'10:08:19', v0:820.4, dH:-0.10, dL: 0.17, anomaly:false },
  { id:17, ts:'10:14:55', v0:822.5, dH: 0.16, dL:-0.12, anomaly:false },
  { id:18, ts:'10:21:08', v0:821.9, dH:-0.23, dL: 0.10, anomaly:false },
  { id:19, ts:'11:22:07', v0:818.3, dH: 0.42, dL: 0.18, anomaly:true  },
  { id:20, ts:'11:28:41', v0:822.0, dH:-0.08, dL: 0.05, anomaly:false },
  { id:21, ts:'11:34:16', v0:821.4, dH: 0.13, dL:-0.10, anomaly:false },
  { id:22, ts:'11:40:52', v0:823.2, dH:-0.17, dL: 0.08, anomaly:false },
  { id:23, ts:'11:47:28', v0:820.8, dH: 0.21, dL:-0.13, anomaly:false },
  { id:24, ts:'11:54:03', v0:822.7, dH:-0.12, dL: 0.16, anomaly:false },
  { id:25, ts:'12:01:39', v0:821.5, dH: 0.18, dL:-0.07, anomaly:false },
  { id:26, ts:'12:08:14', v0:823.3, dH:-0.14, dL: 0.11, anomaly:false },
  { id:27, ts:'12:15:50', v0:820.6, dH: 0.09, dL:-0.15, anomaly:false },
  { id:28, ts:'12:23:26', v0:822.4, dH:-0.20, dL: 0.07, anomaly:false },
  { id:29, ts:'12:31:01', v0:821.2, dH: 0.15, dL:-0.09, anomaly:false },
  { id:30, ts:'14:05:44', v0:821.5, dH:-0.07, dL: 0.04, anomaly:false },
]

// D-07：对接任务列表（3条）
export const dockTasks = [
  { id:'T01', name:'精度试验数据回传接入', srcType:'弹道测量+遥测文件', count:'30发', status:'成功', time:'2024-10-18 14:30' },
  { id:'T02', name:'气象数据同步接入',     srcType:'气象站接口',         count:'30组', status:'成功', time:'2024-10-18 08:00' },
  { id:'T03', name:'标定台检测数据接入',   srcType:'标定台导出文件',     count:'12项', status:'成功', time:'2024-10-17 16:20' },
]

// ── D-11：异常事件与证据链 ──────────────────────────────────────────────
export const causeChain = [
  { id:'C1', level:0, label:'弹着点散布异常',       type:'effect',       confidence:0.86, detail:'第19发立靶高低偏差+0.42 mil，触发弹着点散布探针P01告警' },
  { id:'C2', level:1, label:'立靶高低偏差超限',     type:'feature',      confidence:0.86, detail:'偏差值+0.42 mil，超判据≤0.30 mil，超出40%' },
  { id:'C3', level:1, label:'初速偏低',             type:'feature',      confidence:0.72, detail:'初速818.3 m/s，低于下限820 m/s' },
  { id:'C4', level:2, label:'姿态角pitch漂移',      type:'intermediate', confidence:0.86, detail:'飞行段pitch偏差+0.38°，超阈值0.20°' },
  { id:'C5', level:2, label:'温度传感器跳变',       type:'intermediate', confidence:0.86, detail:'TH-03在T+4.2s出现+2.1℃跳变' },
  { id:'C6', level:3, label:'定位定向系统温补失效', type:'root',         confidence:0.86, detail:'温补系数与出厂标定值偏差12.4%，超容差5%' },
]

export const evidence = [
  { id:'E1', text:'第19发飞行段pitch角偏差0.38°，超出阈值0.20°', source:'遥测通道T-07',    relNode:'C4' },
  { id:'E2', text:'温度传感器TH-03在T+4.2s后出现2.1℃跳变',      source:'弹载记录仪',      relNode:'C5' },
  { id:'E3', text:'温补系数与出厂标定值偏差12.4%，超出容差5%',   source:'标定台检测报告',  relNode:'C6' },
  { id:'E4', text:'2019年同型装备某次试验同类温补失效案例',       source:'历史案例库D-06 · 某型装甲车A精度试验2019',  relNode:'C6' },
]

export const candidates = [
  { rank:1, name:'定位定向系统温补失效', confidence:0.86, basis:'温度跳变记录+姿态角时序异常+历史案例吻合' },
  { rank:2, name:'火控解算软件异常',     confidence:0.41, basis:'姿态角偏差但无温度异常支撑' },
  { rank:3, name:'气象修正误差',         confidence:0.22, basis:'前18发正常，排除批次因素' },
]

// ════════════════════════════════════════════════════════════════════
// 第四部分：研判平台 Mock 数据（D-15 ～ D-19）
// ════════════════════════════════════════════════════════════════════

// ── D-16 创新点列表（研判平台用，6条） ──────────────────────────────
export const judgeInnovations = [
  {
    id: 'INN-001',
    name: '定位定向系统温补技术',
    source: '3篇（含试验报告V2）',
    direction: '定位定向技术',
    confidence: 0.93,
    q: '某型鉴定试验第19发立靶高低偏差0.42 mil超判据（≤0.30 mil），根因定位定向系统温补失效。',
    qRef: '原文P.23',
    p: '温补系数自校准算法，基于温度梯度采样动态修正定向角偏差。',
    pRef: '原文P.24',
    i: '提出自适应温补系数分级修正方法，结合历史温漂模式预测当前发次修正量，抗温度突变鲁棒性强。',
    iRef: '原文P.24-25',
    e: '在3型装备定型试验中验证，定向角精度提升约38%，异常发次检出率从72%提升至91%。',
    eRef: '原文P.31',
  },
  {
    id: 'INN-002',
    name: '弹着点散布修正方法',
    source: '2篇',
    direction: '弹道修正技术',
    confidence: 0.87,
    q: '弹着点散布超限问题在多型装备试验中反复出现，缺乏系统化修正手段。',
    qRef: '原文P.12',
    p: '基于弹道残差补偿模型，融合气象参数与弹体姿态实时修正弹着点偏差。',
    pRef: '原文P.13',
    i: '提出分层递进式散布修正策略，先补偿系统性偏差再消除随机散布。',
    iRef: '原文P.14',
    e: '在某型装备定型试验中，散布圆概率偏差降低约24%。',
    eRef: '原文P.16',
  },
  {
    id: 'INN-003',
    name: '惯导初始对准快速收敛算法',
    source: '2篇',
    direction: '惯导技术',
    confidence: 0.85,
    q: '惯导初始对准耗时长，影响试验效率和装备快速响应能力。',
    qRef: '原文P.08',
    p: '基于多位置观测与卡尔曼滤波融合的快速对准方法，利用先验误差模型加速收敛。',
    pRef: '原文P.09',
    i: '提出自适应加权多位置对准策略，根据环境噪声动态调整观测权重。',
    iRef: '原文P.10',
    e: '对准时间从传统方法12分钟缩短至4分钟，精度不降低。',
    eRef: '原文P.11',
  },
  {
    id: 'INN-004',
    name: '遥测信号自适应降噪方法',
    source: '1篇',
    direction: '遥测技术',
    confidence: 0.81,
    q: '复杂电磁环境下遥测信号信噪比低，关键数据丢失风险高。',
    qRef: '原文P.45',
    p: '基于小波包分解与深度学习联合降噪框架，自适应识别并抑制多类噪声。',
    pRef: '原文P.46',
    i: '提出噪声类型自动判别机制，按噪声特性选择最优降噪策略组合。',
    iRef: '原文P.47',
    e: '在强干扰环境下遥测数据完整率从85%提升至97%。',
    eRef: '原文P.48',
  },
  {
    id: 'INN-005',
    name: '气象参数实时修正模型',
    source: '2篇',
    direction: '气象修正',
    confidence: 0.79,
    q: '传统气象修正在高低温差大时残差超标，影响弹道解算精度。',
    qRef: '原文P.31',
    p: '建立温度-气压-风速三维耦合修正模型，实时插值计算弹道气象偏差。',
    pRef: '原文P.32',
    i: '提出基于实测气象梯度的动态修正权重分配方法，高温差场景修正残差显著降低。',
    iRef: '原文P.33',
    e: '修正残差从0.08 mil降至0.03 mil，满足0.05 mil判据要求。',
    eRef: '原文P.34',
  },
  {
    id: 'INN-006',
    name: '多源信号融合处理架构',
    source: '3篇',
    direction: '信号处理',
    confidence: 0.76,
    q: '弹道测量、遥测、光测多源数据异构，融合效率低。',
    qRef: '原文P.56',
    p: '基于联邦滤波框架的多源异步数据融合架构，统一时空基准后加权融合。',
    pRef: '原文P.57',
    i: '提出基于数据质量评估的自适应融合权重动态调整机制。',
    iRef: '原文P.58',
    e: '融合后弹道参数估计精度提升约15%，处理延迟降低40%。',
    eRef: '原文P.59',
  },
]

// ── M30 三级技术体系树 ──────────────────────────────────────────────
export const techTree = {
  name: '试验鉴定技术',
  children: [
    {
      name: '定位定向技术',
      children: [
        { name: '温补技术', highlight: true, caseLabel: '第19发超差事件·温补失效案例', caseBadge: '本次试验沉淀' },
        { name: '定向精度校准' },
        { name: '初始对准' },
      ],
    },
    {
      name: '弹道修正技术',
      children: [
        { name: '散布修正' },
        { name: '弹道参数辨识' },
        { name: '弹道一致性' },
      ],
    },
    {
      name: '惯导技术',
      children: [
        { name: '初始对准快速收敛' },
        { name: '惯导误差补偿' },
        { name: '组合导航' },
      ],
    },
    {
      name: '遥测技术',
      children: [
        { name: '自适应降噪' },
        { name: '信号增强' },
        { name: '链路冗余' },
      ],
    },
    {
      name: '气象修正',
      children: [
        { name: '实时修正模型' },
        { name: '气象参数估计' },
        { name: '弹道气象修正' },
      ],
    },
    {
      name: '信号处理',
      children: [
        { name: '多源融合架构' },
        { name: '特征提取' },
        { name: '异常检测' },
      ],
    },
  ],
}

// ── D-17 研判模板 ───────────────────────────────────────────────────
export const judgeTemplates = [
  { id: 'TPL-01', name: '技术发展方向研判', recommended: true },
  { id: 'TPL-02', name: '创新点态势分析', recommended: false },
  { id: 'TPL-03', name: '技术成熟度评估', recommended: false },
]

// ── D-18 研判报告 ──────────────────────────────────────────────────
export const judgeReports = [
  { id: 'RPT-J001', title: '定位定向技术发展方向研判报告', direction: '定位定向技术', time: '2024-10-18', status: '已生成', statusClass: 'on' },
]

export const judgeReportSections = [
  { no: 1, title: '技术现状综述' },
  { no: 2, title: '创新点分布分析' },
  { no: 3, title: '技术发展趋势研判' },
  { no: 4, title: '建议方向与对策' },
]

// ECharts: 创新点分布柱状图数据
export const innovBarData = {
  xData: ['定位定向技术', '弹道修正技术', '惯导技术', '遥测技术', '气象修正', '信号处理'],
  yData: [12, 9, 8, 11, 7, 11],
}

// ECharts: 近5年趋势折线图数据
export const trendLineData = {
  xData: ['2020', '2021', '2022', '2023', '2024'],
  yData: [6, 9, 12, 15, 16],
}

// ── D-19 管理端数据 ────────────────────────────────────────────────
export const trainTask = {
  name: '试验鉴定领域大模型SFT-V3',
  statusLabel: '训练中·第8/12轮',
}

export const lossChartData = {
  xData: ['E1','E2','E3','E4','E5','E6','E7','E8'],
  yData: [2.84, 2.21, 1.76, 1.42, 1.18, 1.02, 0.91, 0.83],
}

export const evalChartData = {
  xData: ['E1','E2','E3','E4','E5','E6','E7','E8'],
  accuracy: [0.72, 0.76, 0.79, 0.82, 0.84, 0.86, 0.87, 0.88],
  recall:   [0.68, 0.71, 0.74, 0.77, 0.80, 0.82, 0.83, 0.85],
}

export const gpuChartData = {
  xData: ['GPU0','GPU1','GPU2','GPU3','GPU4','GPU5','GPU6','GPU7'],
  yData: [87, 92, 85, 89, 91, 84, 88, 86],
}

export const memChartData = {
  xData: ['E1','E2','E3','E4','E5','E6','E7','E8'],
  yData: [38, 41, 43, 42, 44, 43, 45, 44],
}

export const agentTemplates = [
  { id: 'AGT-01', name: '关键指标抽取智能体', scene: '第一部分·资料再造业务', runs: 247 },
  { id: 'AGT-02', name: '试验文档辅助审查智能体', scene: '第三部分·文书审校业务', runs: 183 },
  { id: 'AGT-03', name: '试验鉴定知识问答智能体', scene: '面向鉴定业务咨询', runs: 92 },
]

export const resourceKpis = [
  { label: '数据集', value: 14 },
  { label: '探针模型', value: 12 },
  { label: '文书', value: 38 },
  { label: '文献', value: 326 },
  { label: '创新点', value: 58 },
  { label: '图谱节点', value: 247 },
]

export const resGrowthData = {
  xData: ['10-1','10-3','10-5','10-7','10-9','10-11','10-13','10-15','10-17','10-19','10-21','10-23','10-25','10-27','10-29'],
  yData: [520, 538, 551, 569, 582, 598, 615, 631, 648, 664, 681, 697, 714, 732, 751],
}
