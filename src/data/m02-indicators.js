/**
 * M02 关键指标抽取结果（D-01 / 某型装备研制总要求 · 28 项）
 * 列表「抽取指标数」必须与 getM02RowsForDoc(name).length 一致。
 * domain 仍用七域口径，供新建任务筛选；klass 为详情表「性能域/指标类」。
 */
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

export const m02IndRows = [
  row({ id: 'i01', klass: '火力性能 / 射击精度', name: '立靶高低偏差', criteria: '≤0.30 mil', domain: '火力', conf: 0.76, srcPage: 12 }),
  row({ id: 'i02', klass: '火力性能 / 射击精度', name: '立靶方向偏差', criteria: '≤0.30 mil', domain: '火力', conf: 0.93, srcPage: 12 }),
  row({ id: 'i03', klass: '火力性能 / 射击精度', name: '1000m立靶密集度（高低×方向）', criteria: '≤2.6×2.6 m', domain: '火力', conf: 0.91, srcPage: 13 }),
  row({ id: 'i04', klass: '火力性能 / 射击精度', name: '地面目标首发命中概率', criteria: '≥85 %', domain: '火力', conf: 0.88, srcPage: 13 }),
  row({ id: 'i05', klass: '火力性能 / 火力强度', name: '战斗射速', criteria: '6-8 发/min', domain: '火力', conf: 0.94, srcPage: 14 }),
  row({ id: 'i06', klass: '火力性能 / 火力强度', name: '最大射程', criteria: '≥15 km', domain: '火力', conf: 0.92, srcPage: 14 }),
  row({ id: 'i07', klass: '火力性能 / 火力强度', name: '初速', criteria: '930±10 m/s', domain: '火力', conf: 0.90, srcPage: 14 }),
  row({ id: 'i08', klass: '火力性能 / 火力强度', name: '最大膛压', criteria: '≤315 MPa', domain: '火力', conf: 0.89, srcPage: 15 }),
  row({ id: 'i09', klass: '机动性能 / 行驶性能', name: '最大行驶速度', criteria: '≥65 km/h', domain: '机动', conf: 0.95, srcPage: 17 }),
  row({ id: 'i10', klass: '机动性能 / 行驶性能', name: '0-32 km/h加速时间', criteria: '≤12 s', domain: '机动', conf: 0.90, srcPage: 17 }),
  row({ id: 'i11', klass: '机动性能 / 行驶性能', name: '最大爬坡度', criteria: '≥60 %', domain: '机动', conf: 0.93, srcPage: 18 }),
  row({ id: 'i12', klass: '机动性能 / 行驶性能', name: '最大行程', criteria: '≥500 km', domain: '机动', conf: 0.91, srcPage: 18 }),
  row({ id: 'i13', klass: '机动性能 / 通过性能', name: '越壕宽', criteria: '≥2.5 m', domain: '机动', conf: 0.92, srcPage: 19 }),
  row({ id: 'i14', klass: '机动性能 / 通过性能', name: '涉水深度', criteria: '≥1.2 m', domain: '机动', conf: 0.90, srcPage: 19 }),
  row({ id: 'i15', klass: '防护性能 / 弹道防护', name: '正面装甲抗弹能力', criteria: '满足战术技术要求', domain: '防护', conf: 0.87, srcPage: 21 }),
  row({ id: 'i16', klass: '防护性能 / 弹道防护', name: '三防密封性', criteria: '满足三防防护要求', domain: '防护', conf: 0.86, srcPage: 22 }),
  row({ id: 'i17', klass: '探测性能 / 观瞄探测', name: '昼间目标发现距离', criteria: '≥5.0 km', domain: '信息能力', conf: 0.90, srcPage: 24 }),
  row({ id: 'i18', klass: '探测性能 / 观瞄探测', name: '夜间目标发现距离', criteria: '≥3.0 km', domain: '信息能力', conf: 0.88, srcPage: 24 }),
  row({ id: 'i19', klass: '探测性能 / 观瞄探测', name: '激光测距误差', criteria: '≤5 m', domain: '信息能力', conf: 0.92, srcPage: 25 }),
  row({ id: 'i20', klass: '通信性能 / 电台通信', name: '电台通信距离', criteria: '≥25 km', domain: '信息能力', conf: 0.90, srcPage: 27 }),
  row({ id: 'i21', klass: '通信性能 / 电台通信', name: '数传传输速率', criteria: '≥9.6 kbps', domain: '信息能力', conf: 0.89, srcPage: 27 }),
  row({ id: 'i22', klass: '可靠性 / 任务可靠', name: '平均故障间隔里程', criteria: '≥800 km', domain: '可靠性', conf: 0.84, srcPage: 29 }),
  row({ id: 'i23', klass: '可靠性 / 任务可靠', name: '任务可靠度', criteria: '≥0.92', domain: '可靠性', conf: 0.72, srcPage: 29 }),
  row({ id: 'i24', klass: '可靠性 / 维修性', name: '平均修复时间', criteria: '≤30 min', domain: '可靠性', conf: 0.87, srcPage: 30 }),
  row({ id: 'i25', klass: '环境适应性 / 温度适应', name: '高温工作能力', criteria: '+55℃正常工作', domain: '环境适应性', conf: 0.90, srcPage: 32 }),
  row({ id: 'i26', klass: '环境适应性 / 温度适应', name: '低温工作能力', criteria: '-41℃正常启动', domain: '环境适应性', conf: 0.90, srcPage: 32 }),
  row({ id: 'i27', klass: '环境适应性 / 电磁兼容', name: '电磁兼容性', criteria: '满足GJB 151B要求', domain: '电磁兼容', conf: 0.68, srcPage: 33 }),
  row({ id: 'i28', klass: '环境适应性 / 电磁兼容', name: '电源瞬态耐受', criteria: '满足GJB 181A要求', domain: '电磁兼容', conf: 0.85, srcPage: 33 }),
]

function copyMasterRows(name) {
  return m02IndRows.map((r) => ({
    ...r,
    srcDoc: name && name.includes('.pdf') ? name : r.srcDoc,
  }))
}

/** 按来源文档取抽取结果行；列表 count 与详情共用此函数，保证联动。未单独配置条数的文档沿用 28 项样例。 */
export function getM02RowsForDoc(docName = '') {
  const name = String(docName || '')
  if (!name) return []
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
