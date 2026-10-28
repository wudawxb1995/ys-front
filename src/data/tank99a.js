/** 《99A式主战坦克研制总案》章节取自 PDF 目录，指标取自配套分类抽取 Markdown。 */

export const TANK99A_SAMPLE_URL = '/samples/99A式主战坦克研制总案-模拟数据.pdf'
export const TANK99A_SAMPLE_NAME = '99A式主战坦克研制总案-模拟数据.pdf'

export function isTank99aDoc(name = '') {
  const text = String(name)
  return /99A/.test(text) && /研制总案/.test(text)
}

export const tank99aChapters = [
  {
    id: 'c1',
    title: '1 总述',
    level: 1,
    page: 5,
    children: [
      { id: 'c1-1', title: '1.1 编制目的', level: 2, page: 5 },
      { id: 'c1-2', title: '1.2 适用范围', level: 2, page: 5 },
      { id: 'c1-3', title: '1.3 仿真数据声明', level: 2, page: 5 },
    ],
  },
  {
    id: 'c2',
    title: '2 研制目标与基本要求',
    level: 1,
    page: 5,
    children: [
      { id: 'c2-1', title: '2.1 总体研制目标', level: 2, page: 5 },
      { id: 'c2-2', title: '2.2 能力要求', level: 2, page: 6 },
      { id: 'c2-3', title: '2.3 基本约束', level: 2, page: 6 },
    ],
  },
  {
    id: 'c3',
    title: '3 系统组成与功能要求',
    level: 1,
    page: 6,
    children: [
      { id: 'c3-1', title: '3.1 系统组成', level: 2, page: 6 },
      { id: 'c3-2', title: '3.2 接口与状态要求', level: 2, page: 7 },
      { id: 'c3-3', title: '3.3 指标分解原则', level: 2, page: 7 },
    ],
  },
  {
    id: 'c4',
    title: '4 关键技术指标',
    level: 1,
    page: 7,
    children: [
      { id: 'c4-1', title: '4.1 总体与机动指标', level: 2, page: 7 },
      { id: 'c4-2', title: '4.2 火力与火控指标', level: 2, page: 8 },
      { id: 'c4-3', title: '4.3 防护与告警指标', level: 2, page: 8 },
      { id: 'c4-4', title: '4.4 信息系统与软件指标', level: 2, page: 8 },
      { id: 'c4-5', title: '4.5 可靠性、维修性与保障指标', level: 2, page: 9 },
      { id: 'c4-6', title: '4.6 环境适应性与电磁兼容指标', level: 2, page: 9 },
    ],
  },
  {
    id: 'c5',
    title: '5 试验验证与状态鉴定要求',
    level: 1,
    page: 10,
    children: [
      { id: 'c5-1', title: '5.1 验证总体要求', level: 2, page: 10 },
      { id: 'c5-2', title: '5.2 指标—试验项目关联矩阵', level: 2, page: 10 },
      { id: 'c5-3', title: '5.3 鉴定判定规则', level: 2, page: 10 },
      { id: 'c5-4', title: '5.4 仿真试验数据记录', level: 2, page: 11 },
    ],
  },
  {
    id: 'c6',
    title: '6 研制阶段与技术状态管理',
    level: 1,
    page: 11,
    children: [
      { id: 'c6-1', title: '6.1 阶段安排', level: 2, page: 11 },
      { id: 'c6-2', title: '6.2 技术状态控制', level: 2, page: 11 },
    ],
  },
  {
    id: 'c7',
    title: '7 质量与可靠性管理',
    level: 1,
    page: 11,
    children: [
      { id: 'c7-1', title: '7.1 质量控制', level: 2, page: 11 },
      { id: 'c7-2', title: '7.2 可靠性与维修性数据', level: 2, page: 12 },
      { id: 'c7-3', title: '7.3 软件与仿真模型质量', level: 2, page: 12 },
    ],
  },
  {
    id: 'c8',
    title: '8 交付物与验收',
    level: 1,
    page: 12,
    children: [
      { id: 'c8-1', title: '8.1 交付物清单', level: 2, page: 12 },
      { id: 'c8-2', title: '8.2 验收准则', level: 2, page: 12 },
    ],
  },
  {
    id: 'ca',
    title: '附录A 指标抽取字段与统计口径',
    level: 1,
    page: 13,
    children: [
      { id: 'ca-1', title: 'A.1 推荐抽取字段', level: 2, page: 13 },
      { id: 'ca-2', title: 'A.2 指标数量校验', level: 2, page: 13 },
      { id: 'ca-3', title: 'A.3 立靶指标口径说明', level: 2, page: 13 },
    ],
  },
  {
    id: 'cb',
    title: '附录B 仿真试验记录样例',
    level: 1,
    page: 14,
    children: [
      { id: 'cb-1', title: 'B.1 单项结果记录', level: 2, page: 14 },
      { id: 'cb-2', title: 'B.2 数据一致性要求', level: 2, page: 14 },
    ],
  },
]

const domainOf = {
  火力性能: '火力',
  机动性能: '机动',
  防护性能: '防护',
  探测性能: '信息能力',
  通信性能: '信息能力',
  可靠性: '可靠性',
  环境适应性: '环境适应性',
}

function indicator(partial) {
  const criteria = partial.criteria
  const domain = partial.code === 'HJ-006' ? '电磁兼容' : domainOf[partial.domain]
  return {
    id: partial.code,
    code: partial.code,
    klass: `${partial.domain} / ${partial.klass}`,
    name: partial.name,
    criteria,
    value: criteria,
    unit: partial.unit,
    domain,
    conf: partial.conf,
    status: '待审核',
    criteriaType: /^[≤≥<>+\-0-9]/.test(String(criteria)) ? '定量' : '定性',
    examMethod: partial.examMethod,
    srcSection: partial.srcSection,
    srcPage: partial.srcPage,
    highlight: criteria,
    quote: partial.quote || '',
    srcText: `${partial.code} ${partial.name}，判据 ${criteria}，${partial.examMethod}，${partial.srcSection}。`,
  }
}

/** 与 Markdown《99A式主战坦克关键技术指标分类抽取》一一对应，共 44 项。 */
export const tank99aIndicators = [
  indicator({ code: 'HC-001', domain: '火力性能', klass: '火控与目标处理', name: '火控系统反应时间', criteria: '≤6 s', unit: 's', examMethod: '模拟目标流程试验', srcSection: '第4.2节', srcPage: 8, conf: 0.94 }),
  indicator({ code: 'HC-004', domain: '火力性能', klass: '火控与目标处理', name: '目标自动跟踪保持时间', criteria: '≥30 s', unit: 's', examMethod: '目标跟踪试验', srcSection: '第4.2节', srcPage: 8, conf: 0.92 }),
  indicator({ code: 'HC-005', domain: '火力性能', klass: '火控与目标处理', name: '多目标切换时间', criteria: '≤4 s', unit: 's', examMethod: '多目标流程试验', srcSection: '第4.2节', srcPage: 8, conf: 0.91 }),
  indicator({ code: 'HC-002', domain: '火力性能', klass: '射击验证与立靶精度', name: '首发命中概率', criteria: '≥85 %', unit: '%', examMethod: '规定仿真工况统计试验', srcSection: '第4.2节', srcPage: 8, conf: 0.9 }),
  indicator({ code: 'HC-003', domain: '火力性能', klass: '射击验证与立靶精度', name: '动对动射击验证距离', criteria: '≥2000 m', unit: 'm', examMethod: '规定仿真工况射击试验', srcSection: '第4.2节', srcPage: 8, conf: 0.93 }),
  indicator({ code: 'HC-006', domain: '火力性能', klass: '射击验证与立靶精度', name: '主武器弹药基数', criteria: '≥40 发', unit: '发', examMethod: '装载配置核查', srcSection: '第4.2节', srcPage: 8, conf: 0.95 }),
  indicator({ code: 'HC-007', domain: '火力性能', klass: '射击验证与立靶精度', name: '立靶高低中间偏差', criteria: '≤0.30 m', unit: 'm', examMethod: '1000 m立靶、10发统计试验', srcSection: '第4.2节；附录A.3', srcPage: 8, conf: 0.86, quote: '1000 m立靶、停车射击、规定仿真弹种、10发样本，立靶高低中间偏差应不大于0.30 m' }),
  indicator({ code: 'HC-008', domain: '火力性能', klass: '射击验证与立靶精度', name: '立靶方向中间偏差', criteria: '≤0.30 m', unit: 'm', examMethod: '1000 m立靶、10发统计试验', srcSection: '第4.2节；附录A.3', srcPage: 8, conf: 0.86, quote: '1000 m立靶、停车射击、规定仿真弹种、10发样本，立靶方向中间偏差应不大于0.30 m' }),
  indicator({ code: 'ZB-001', domain: '机动性能', klass: '总体与构型', name: '战斗全重', criteria: '≤58.0 t', unit: 't', examMethod: '称重与配置核查', srcSection: '第4.1节', srcPage: 7, conf: 0.96 }),
  indicator({ code: 'ZB-002', domain: '机动性能', klass: '总体与构型', name: '乘员工位数量', criteria: '3 个', unit: '个', examMethod: '构型检查', srcSection: '第4.1节', srcPage: 7, conf: 0.88 }),
  indicator({ code: 'ZB-003', domain: '机动性能', klass: '行驶与通过性', name: '最大公路速度', criteria: '≥70 km/h', unit: 'km/h', examMethod: '规定道路行驶试验', srcSection: '第4.1节', srcPage: 7, conf: 0.95 }),
  indicator({ code: 'ZB-004', domain: '机动性能', klass: '行驶与通过性', name: '越野平均速度', criteria: '≥40 km/h', unit: 'km/h', examMethod: '规定越野路线试验', srcSection: '第4.1节', srcPage: 7, conf: 0.93 }),
  indicator({ code: 'ZB-005', domain: '机动性能', klass: '行驶与通过性', name: '最大行驶里程', criteria: '≥450 km', unit: 'km', examMethod: '持续行驶与油耗核算', srcSection: '第4.1节', srcPage: 7, conf: 0.92 }),
  indicator({ code: 'ZB-006', domain: '机动性能', klass: '行驶与通过性', name: '0～32 km/h加速时间', criteria: '≤10 s', unit: 's', examMethod: '起步加速试验', srcSection: '第4.1节', srcPage: 7, conf: 0.94 }),
  indicator({ code: 'ZB-007', domain: '机动性能', klass: '行驶与通过性', name: '最大爬坡度', criteria: '≥60 %', unit: '%', examMethod: '标准坡道通过试验', srcSection: '第4.1节', srcPage: 7, conf: 0.93 }),
  indicator({ code: 'ZB-008', domain: '机动性能', klass: '行驶与通过性', name: '越壕宽度', criteria: '≥2.7 m', unit: 'm', examMethod: '壕沟通过试验', srcSection: '第4.1节', srcPage: 7, conf: 0.91 }),
  indicator({ code: 'ZB-009', domain: '机动性能', klass: '行驶与通过性', name: '垂直越障高度', criteria: '≥0.8 m', unit: 'm', examMethod: '垂直障碍通过试验', srcSection: '第4.1节', srcPage: 7, conf: 0.9 }),
  indicator({ code: 'ZB-010', domain: '机动性能', klass: '行驶与通过性', name: '无准备涉水深度', criteria: '≥1.2 m', unit: 'm', examMethod: '涉水试验', srcSection: '第4.1节', srcPage: 7, conf: 0.92 }),
  indicator({ code: 'FH-001', domain: '防护性能', klass: '防护响应与三防', name: '灭火抑爆系统响应时间', criteria: '≤150 ms', unit: 'ms', examMethod: '模拟触发响应试验', srcSection: '第4.3节', srcPage: 8, conf: 0.94 }),
  indicator({ code: 'FH-002', domain: '防护性能', klass: '防护响应与三防', name: '三防系统超压建立时间', criteria: '≤60 s', unit: 's', examMethod: '密闭与超压试验', srcSection: '第4.3节', srcPage: 8, conf: 0.91 }),
  indicator({ code: 'FH-004', domain: '防护性能', klass: '防护响应与三防', name: '烟幕释放响应时间', criteria: '≤2 s', unit: 's', examMethod: '模拟指令响应试验', srcSection: '第4.3节', srcPage: 8, conf: 0.9 }),
  indicator({ code: 'FH-003', domain: '探测性能', klass: '告警与定位', name: '激光告警方位覆盖', criteria: '360 °', unit: '°', examMethod: '方位覆盖检查', srcSection: '第4.3节', srcPage: 8, conf: 0.89 }),
  indicator({ code: 'FH-005', domain: '探测性能', klass: '告警与定位', name: '核生化告警响应时间', criteria: '≤5 s', unit: 's', examMethod: '模拟信号注入试验', srcSection: '第4.3节', srcPage: 8, conf: 0.87 }),
  indicator({ code: 'XX-004', domain: '探测性能', klass: '告警与定位', name: '开阔环境定位误差', criteria: '≤10 m', unit: 'm', examMethod: '定位比对试验', srcSection: '第4.4节', srcPage: 9, conf: 0.92 }),
  indicator({ code: 'XX-001', domain: '通信性能', klass: '车际通信', name: '车际数据链节点接入数量', criteria: '≥16 个', unit: '个', examMethod: '多节点接入试验', srcSection: '第4.4节', srcPage: 8, conf: 0.93 }),
  indicator({ code: 'XX-003', domain: '通信性能', klass: '车际通信', name: '指挥报文平均传输时延', criteria: '≤500 ms', unit: 'ms', examMethod: '报文传输统计试验', srcSection: '第4.4节', srcPage: 8, conf: 0.91 }),
  indicator({ code: 'XX-002', domain: '通信性能', klass: '信息与网络', name: '态势信息更新周期', criteria: '≤2 s', unit: 's', examMethod: '态势刷新时延试验', srcSection: '第4.4节', srcPage: 8, conf: 0.9 }),
  indicator({ code: 'XX-005', domain: '通信性能', klass: '信息与网络', name: '车内骨干网络带宽', criteria: '≥1 Gbit/s', unit: 'Gbit/s', examMethod: '网络吞吐试验', srcSection: '第4.4节', srcPage: 9, conf: 0.88 }),
  indicator({ code: 'XX-008', domain: '通信性能', klass: '信息与网络', name: '车内时钟同步误差', criteria: '≤1 ms', unit: 'ms', examMethod: '时钟比对试验', srcSection: '第4.4节', srcPage: 9, conf: 0.86 }),
  indicator({ code: 'XX-006', domain: '通信性能', klass: '系统与记录', name: '信息系统启动时间', criteria: '≤60 s', unit: 's', examMethod: '冷启动计时试验', srcSection: '第4.4节', srcPage: 9, conf: 0.92 }),
  indicator({ code: 'XX-007', domain: '通信性能', klass: '系统与记录', name: '任务数据记录容量', criteria: '≥2 TB', unit: 'TB', examMethod: '存储配置核查', srcSection: '第4.4节', srcPage: 9, conf: 0.9 }),
  indicator({ code: 'KX-001', domain: '可靠性', klass: '可靠性', name: '平均故障间隔里程', criteria: '≥500 km', unit: 'km', examMethod: '可靠性行驶统计', srcSection: '第4.5节', srcPage: 9, conf: 0.84 }),
  indicator({ code: 'KX-002', domain: '可靠性', klass: '可靠性', name: '平均严重故障间隔里程', criteria: '≥1200 km', unit: 'km', examMethod: '可靠性行驶统计', srcSection: '第4.5节', srcPage: 9, conf: 0.82 }),
  indicator({ code: 'KX-003', domain: '可靠性', klass: '可靠性', name: '任务可靠度', criteria: '≥0.90', unit: '无量纲', examMethod: '任务成功率统计', srcSection: '第4.5节', srcPage: 9, conf: 0.76 }),
  indicator({ code: 'KX-004', domain: '可靠性', klass: '维修与保障', name: '平均修复时间', criteria: '≤2.5 h', unit: 'h', examMethod: '维修性演示与统计', srcSection: '第4.5节', srcPage: 9, conf: 0.88 }),
  indicator({ code: 'KX-005', domain: '可靠性', klass: '维修与保障', name: '故障检测覆盖率', criteria: '≥90 %', unit: '%', examMethod: '故障注入测试', srcSection: '第4.5节', srcPage: 9, conf: 0.85 }),
  indicator({ code: 'KX-006', domain: '可靠性', klass: '维修与保障', name: '故障隔离到可更换单元比例', criteria: '≥85 %', unit: '%', examMethod: '故障隔离测试', srcSection: '第4.5节', srcPage: 9, conf: 0.83 }),
  indicator({ code: 'KX-007', domain: '可靠性', klass: '维修与保障', name: '备件满足率', criteria: '≥95 %', unit: '%', examMethod: '保障资源配置核算', srcSection: '第4.5节', srcPage: 9, conf: 0.81 }),
  indicator({ code: 'HJ-001', domain: '环境适应性', klass: '环境试验', name: '工作温度范围', criteria: '-40～+55 ℃', unit: '℃', examMethod: '高低温工作试验', srcSection: '第4.6节', srcPage: 9, conf: 0.93 }),
  indicator({ code: 'HJ-002', domain: '环境适应性', klass: '环境试验', name: '贮存温度范围', criteria: '-45～+65 ℃', unit: '℃', examMethod: '高低温贮存试验', srcSection: '第4.6节', srcPage: 9, conf: 0.92 }),
  indicator({ code: 'HJ-003', domain: '环境适应性', klass: '环境试验', name: '湿热试验持续时间', criteria: '≥96 h', unit: 'h', examMethod: '湿热环境试验', srcSection: '第4.6节', srcPage: 9, conf: 0.9 }),
  indicator({ code: 'HJ-004', domain: '环境适应性', klass: '环境试验', name: '振动试验持续时间', criteria: '≥8 h', unit: 'h', examMethod: '规定谱振动试验', srcSection: '第4.6节', srcPage: 9, conf: 0.89 }),
  indicator({ code: 'HJ-005', domain: '环境适应性', klass: '环境试验', name: '盐雾试验持续时间', criteria: '≥48 h', unit: 'h', examMethod: '盐雾环境试验', srcSection: '第4.6节', srcPage: 9, conf: 0.88 }),
  indicator({ code: 'HJ-006', domain: '环境适应性', klass: '电磁兼容', name: '电磁兼容仿真试验等级', criteria: 'E2 级', unit: '级', examMethod: '电磁兼容仿真试验', srcSection: '第4.6节', srcPage: 9, conf: 0.74 }),
]

export function tank99aIndicatorRows(docName = '') {
  const srcDoc = docName || TANK99A_SAMPLE_NAME
  return tank99aIndicators.map((row) => ({ ...row, srcDoc }))
}

export function buildTank99aDetail(row = {}) {
  const name = row.name || TANK99A_SAMPLE_NAME
  const time = row.time || row.parsedAt || '2026-10-28 16:11'
  return {
    name,
    fmt: row.fmt || 'PDF',
    size: row.size && row.size !== '—' ? row.size : '0.32 MB',
    pages: 14,
    parsedAt: time,
    tableCount: 13,
    imageCount: 0,
    paraCount: 96,
    indexStatus: '已建立',
    indexName: 'idx-99a-yfza',
    indexAt: time,
    fileUrl: row.fileUrl || TANK99A_SAMPLE_URL,
    chapters: tank99aChapters,
  }
}
