/**
 * M02 关键指标抽取结果（D-01 · 28 项）
 * srcPage / srcText / highlight：点击行后原文溯源高亮用
 */
export const m02Domains = ['机动', '火力', '防护', '可靠性', '环境适应性', '电磁兼容', '信息能力']

export const m02CountMap = {
  '某型装备研制总要求（D-01）': 28,
  '雷沃谷神4LZ-8谷物联合收割机鉴定大纲': 15,
  'NY/T 2090-2025 农业机械试验鉴定通则': 21,
  '五征4YZP-4自走式玉米收获机可靠性试验报告': 18,
  '约翰迪尔S770联合收割机对比试验影像': 9,
  '农业机械智能化技术发展综述（2025）': 7,
  'DG/T 001-2025 农业轮式拖拉机鉴定技术规范': 12,
  '植保无人飞机作业性能测试数据集': 6,
}

function row( partial) {
  return {
    unit: '',
    status: '已确认',
    srcDoc: 'D-01《某型装备研制总要求》',
    ...partial,
  }
}

export const m02IndRows = [
  row({ id: 'i01', name: '最大公路速度', value: '≥ 65', unit: 'km/h', criteria: '≥ 60 km/h（研制总要求 4.1.1）', domain: '机动', conf: 0.96, srcPage: 12, highlight: '最大公路速度不低于 65 km/h', srcText: '4.1.1 最大公路速度\n受试装备在硬路面直线路段的最大公路速度不低于 65 km/h，取三次测量均值作为判定值。' }),
  row({ id: 'i02', name: '最大越野速度', value: '≥ 35', unit: 'km/h', criteria: '≥ 30 km/h（研制总要求 4.1.2）', domain: '机动', conf: 0.94, srcPage: 12, highlight: '最大越野速度不低于 35 km/h', srcText: '4.1.2 最大越野速度\n砂石路面条件下，最大越野速度不低于 35 km/h。' }),
  row({ id: 'i03', name: '最大行程', value: '≥ 500', unit: 'km', criteria: '≥ 450 km（研制总要求 4.1.3）', domain: '机动', conf: 0.91, srcPage: 13, highlight: '最大行程不低于 500 km', srcText: '4.1.3 最大行程\n一次加注条件下最大行程不低于 500 km。' }),
  row({ id: 'i04', name: '爬坡度', value: '≥ 30', unit: '°', criteria: '≥ 25°（研制总要求 4.1.4）', domain: '机动', conf: 0.93, srcPage: 13, highlight: '爬坡度不低于 30°', srcText: '4.1.4 爬坡能力\n最大爬坡度不低于 30°。' }),
  row({ id: 'i05', name: '涉水深度', value: '≥ 1.2', unit: 'm', criteria: '≥ 1.0 m（研制总要求 4.1.5）', domain: '机动', conf: 0.88, srcPage: 14, highlight: '涉水深度不低于 1.2 m', srcText: '4.1.5 涉水能力\n静水涉水深度不低于 1.2 m。' }),
  row({ id: 'i06', name: '主炮口径', value: '125', unit: 'mm', criteria: '= 125 mm（研制总要求 5.1.1）', domain: '火力', conf: 0.99, srcPage: 18, highlight: '主炮口径为 125 mm', srcText: '5.1.1 主炮口径\n主炮口径为 125 mm。' }),
  row({ id: 'i07', name: '穿甲弹初速', value: '≥ 1700', unit: 'm/s', criteria: '≥ 1650 m/s（研制总要求 5.1.2）', domain: '火力', conf: 0.97, srcPage: 18, highlight: '穿甲弹初速不低于 1700 m/s', srcText: '5.1.2 穿甲弹初速\n穿甲弹初速不低于 1700 m/s。' }),
  row({ id: 'i08', name: '射速', value: '6–8', unit: '发/min', criteria: '6～8发/min（研制总要求 5.2.1）', domain: '火力', conf: 0.95, srcPage: 19, highlight: '射速为 6～8 发/min', srcText: '5.2.1 射速\n战斗射速为 6～8 发/min。' }),
  row({ id: 'i09', name: '最大射程', value: '≥ 4000', unit: 'm', criteria: '≥ 3500 m（研制总要求 5.2.2）', domain: '火力', conf: 0.92, srcPage: 19, highlight: '最大射程不低于 4000 m', srcText: '5.2.2 最大射程\n最大有效射程不低于 4000 m。' }),
  row({ id: 'i10', name: '首发命中概率', value: '≥ 0.85', criteria: '≥ 0.80（研制总要求 5.3.1）', domain: '火力', conf: 0.76, status: '待审核', srcPage: 20, highlight: '首发命中概率不低于 0.85', srcText: '5.3.1 首发命中概率\n静止对静止条件下首发命中概率不低于 0.85（研制总要求表述存在歧义，待核验）。' }),
  row({ id: 'i11', name: '装甲防护等级', value: 'RHA 600', unit: 'mm', criteria: '等效均质钢 ≥ 550 mm（5.4.1）', domain: '防护', conf: 0.90, srcPage: 22, highlight: '等效均质钢不低于 600 mm', srcText: '5.4.1 装甲防护\n正面装甲等效均质钢不低于 600 mm。' }),
  row({ id: 'i12', name: '核生化防护等级', value: '超压 ≥ 4', unit: 'Pa', criteria: '超压值 ≥ 3 Pa（研制总要求 5.4.2）', domain: '防护', conf: 0.86, srcPage: 22, highlight: '超压值不低于 4 Pa', srcText: '5.4.2 核生化防护\n三防系统超压值不低于 4 Pa。' }),
  row({ id: 'i13', name: '主动防护覆盖角', value: '360', unit: '°', criteria: '360° 全向（研制总要求 5.4.3）', domain: '防护', conf: 0.83, srcPage: 23, highlight: '覆盖角 360°', srcText: '5.4.3 主动防护\n主动防护系统覆盖角 360°。' }),
  row({ id: 'i14', name: 'MTBF', value: '≥ 320', unit: 'h', criteria: '≥ 300 h（研制总要求 6.1.1）', domain: '可靠性', conf: 0.94, srcPage: 26, highlight: 'MTBF 不低于 320 h', srcText: '6.1.1 平均故障间隔时间\nMTBF 不低于 320 h。' }),
  row({ id: 'i15', name: 'MTTR', value: '≤ 2', unit: 'h', criteria: '≤ 4 h（研制总要求 6.1.2）', domain: '可靠性', conf: 0.91, srcPage: 26, highlight: 'MTTR 不大于 2 h', srcText: '6.1.2 平均修复时间\nMTTR 不大于 2 h。' }),
  row({ id: 'i16', name: '使用可用度', value: '≥ 0.92', criteria: '≥ 0.90（研制总要求 6.1.3）', domain: '可靠性', conf: 0.87, srcPage: 27, highlight: '使用可用度不低于 0.92', srcText: '6.1.3 使用可用度\n使用可用度不低于 0.92。' }),
  row({ id: 'i17', name: '寿命', value: '≥ 25', unit: '年', criteria: '≥ 20 年（研制总要求 6.2.1）', domain: '可靠性', conf: 0.78, status: '待审核', srcPage: 27, highlight: '设计寿命不低于 25 年', srcText: '6.2.1 寿命\n设计寿命不低于 25 年（与附录表 A-3 表述 20 年冲突，待核验）。' }),
  row({ id: 'i18', name: '高温工作温度上限', value: '≥ 55', unit: '℃', criteria: '≥ 50 ℃（研制总要求 7.1.1）', domain: '环境适应性', conf: 0.93, srcPage: 30, highlight: '高温工作温度上限不低于 55 ℃', srcText: '7.1.1 高温工作\n高温工作温度上限不低于 55 ℃。' }),
  row({ id: 'i19', name: '低温工作温度下限', value: '≤ −40', unit: '℃', criteria: '≤ −40 ℃（研制总要求 7.1.2）', domain: '环境适应性', conf: 0.90, srcPage: 30, highlight: '低温工作温度下限不高于 −40 ℃', srcText: '7.1.2 低温工作\n低温工作温度下限不高于 −40 ℃。' }),
  row({ id: 'i20', name: '防尘等级', value: 'IP6X', criteria: '≥ IP5X（研制总要求 7.2.1）', domain: '环境适应性', conf: 0.85, srcPage: 31, highlight: '防尘等级达到 IP6X', srcText: '7.2.1 防尘\n防尘等级达到 IP6X。' }),
  row({ id: 'i21', name: '防水等级', value: 'IP67', criteria: '≥ IP56（研制总要求 7.2.2）', domain: '环境适应性', conf: 0.89, srcPage: 31, highlight: '防水等级达到 IP67', srcText: '7.2.2 防水\n防水等级达到 IP67。' }),
  row({ id: 'i22', name: '传导发射限值', value: '≤ RE102', criteria: 'RE102 B类（研制总要求 8.1.1）', domain: '电磁兼容', conf: 0.82, srcPage: 34, highlight: '传导发射满足 RE102', srcText: '8.1.1 传导发射\n传导发射满足 RE102 B 类限值。' }),
  row({ id: 'i23', name: '辐射敏感度阈值', value: '≥ RS103', criteria: 'RS103 C类（研制总要求 8.1.2）', domain: '电磁兼容', conf: 0.75, status: '待审核', srcPage: 34, highlight: '辐射敏感度满足 RS103', srcText: '8.1.2 辐射敏感度\n辐射敏感度满足 RS103 C 类（表格脚注与正文等级不一致，待核验）。' }),
  row({ id: 'i24', name: '综合电子系统接口', value: 'MIL-STD', criteria: 'MIL-STD-1553B（研制总要求 8.2.1）', domain: '电磁兼容', conf: 0.91, srcPage: 35, highlight: '接口符合 MIL-STD-1553B', srcText: '8.2.1 总线接口\n综合电子系统接口符合 MIL-STD-1553B。' }),
  row({ id: 'i25', name: '态势感知刷新率', value: '≥ 2', unit: 'Hz', criteria: '≥ 1 Hz（研制总要求 9.1.1）', domain: '信息能力', conf: 0.94, srcPage: 38, highlight: '态势感知刷新率不低于 2 Hz', srcText: '9.1.1 态势感知\n态势感知刷新率不低于 2 Hz。' }),
  row({ id: 'i26', name: '通信距离', value: '≥ 30', unit: 'km', criteria: '≥ 20 km（研制总要求 9.1.2）', domain: '信息能力', conf: 0.92, srcPage: 38, highlight: '通信距离不低于 30 km', srcText: '9.1.2 通信距离\n视距通信距离不低于 30 km。' }),
  row({ id: 'i27', name: '数据链吞吐量', value: '≥ 2', unit: 'Mbps', criteria: '≥ 1 Mbps（研制总要求 9.2.1）', domain: '信息能力', conf: 0.88, srcPage: 39, highlight: '数据链吞吐量不低于 2 Mbps', srcText: '9.2.1 数据链\n数据链吞吐量不低于 2 Mbps。' }),
  row({ id: 'i28', name: '目标识别距离', value: '≥ 3000', unit: 'm', criteria: '≥ 2500 m（研制总要求 9.2.2）', domain: '信息能力', conf: 0.86, srcPage: 39, highlight: '目标识别距离不低于 3000 m', srcText: '9.2.2 目标识别\n昼间目标识别距离不低于 3000 m。' }),
]
