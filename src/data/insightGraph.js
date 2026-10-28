/** 创新点技术图谱。ip-30005 与挖掘结果页「查看技术图谱」图一致：21 个节点、25 条关系。 */

export const insightGraphChips = [
  '全部节点',
  '创新点',
  '技术方向',
  '关键方法',
  '验证指标',
  '指标判据',
  '异常发次',
  '复测结果',
  '质量评价',
  '异常溯源',
  '根因案例',
  '应用场景',
  '标准规范',
  '证据文献',
  '发展趋势',
]

const evidence30005 = {
  title: '立靶偏差多源光测融合测量与误差溯源研究',
  source: '领域科技文献库 · 2025年',
  quote: '以多站光测观测和标靶图像为共同证据，经时间同步、坐标统一转换和弹着点像素定位计算立靶高低偏差，并同步给出测量不确定度及原始证据索引。',
}

function node(partial) {
  return {
    hollow: false,
    radius: 0.8,
    size: 46,
    rels: partial.rel || '',
    evidence: null,
    hub: false,
    ...partial,
  }
}

function baseNodes(item) {
  return [
    node({
      id: 'hub', hub: true, group: '创新点', angle: 0, radius: 0, size: 132,
      label: item.title,
      title: item.title,
      text: '突破弹着点业像素识别、多源光测时间同步、炮目坐标统一转换和测量不确定度自动评定，形成从原始图像到偏差判定、异常溯源的完整证据链。',
      rels: '属于、观测手段、关键方法、误差修正、质量评价、工程应用、文献佐证、演进方向',
      evidence: evidence30005,
    }),
    node({
      id: 'dir', group: '技术方向', angle: 234, radius: 0.58, size: 64,
      label: '智能测量', title: '智能测量', rel: '属于', rels: '属于',
      text: '通用技术分类。多源测量方法纳入射击精度类指标试验，由本次立靶试验给出偏差判定与误差溯源的新思路。',
    }),
    node({
      id: 'm1', group: '关键方法', angle: 36, radius: 0.58, size: 52,
      label: '弹着点像素识别', title: '弹着点像素识别', rel: '关键方法', rels: '关键方法',
      text: '从靶面图像中定位弹着点像素，作为高低偏差计算的起点。',
    }),
    node({
      id: 'm2', group: '关键方法', angle: 90, radius: 0.58, size: 50,
      label: '多源光测时间同步', title: '多源光测时间同步', rel: '观测手段', rels: '观测手段',
      text: '统一各站曝光时刻，避免同一发弹着点被拆成多个位置。',
    }),
    node({
      id: 'm3', group: '关键方法', angle: 144, radius: 0.58, size: 50,
      label: '炮目坐标统一转换', title: '炮目坐标统一转换', rel: '观测手段', rels: '观测手段',
      text: '把各站观测转换到同一炮目坐标系，再解算弹着点空间位置。',
    }),
    node({
      id: 'm4', group: '关键方法', angle: 54, radius: 0.76, size: 46,
      label: '不确定度自动评定', title: '测量不确定度自动评定', rel: '关键方法', rels: '关键方法',
      text: '随偏差结果同步给出测量不确定度，供判读和复核使用。',
    }),
    node({
      id: 'm5', group: '关键方法', angle: 0, radius: 0.94, size: 32, hollow: true,
      label: '多站测量时间同步', title: '多站测量时间同步', rel: '时序对齐', rels: '时序对齐',
      text: '以授时脉冲对齐多站曝光，残差超限的站点不进入正式偏差计算。',
    }),
    node({
      id: 'weather', group: '关键方法', angle: 288, radius: 0.58, size: 60,
      label: '弹道气象修正', title: '弹道气象修正', rel: '误差修正', rels: '误差修正',
      text: '联合弹道气象数据修正系统误差，避免把环境修正误差写成装备故障。',
    }),
    node({
      id: 'ind', group: '验证指标', angle: 324, radius: 0.58, size: 56,
      label: '立靶高低偏差', title: '立靶高低偏差', rel: '验证指标', rels: '验证指标',
      text: '本创新点直接服务的验证指标，判读结果需同时保留首测、复测和不确定度。',
    }),
    node({
      id: 'judge', group: '指标判据', angle: 306, radius: 0.94, size: 32, hollow: true,
      label: '高低 ≤0.30 mil', title: '高低 ≤0.30 mil', rel: '指标判据', rels: '指标判据',
      text: '指标树判据。第19发首测 0.42 mil，超出 0.30 mil，复测 0.18 mil。',
    }),
    node({
      id: 'evt', group: '异常发次', angle: 18, radius: 0.94, size: 34, hollow: true,
      label: '第19发 EVT-001', title: '第19发 EVT-001', rel: '异常发次', rels: '异常发次',
      text: '立靶高低偏差超差事件。首测与复测分开保留，不回写为首测合格。',
    }),
    node({
      id: 'over', group: '异常发次', angle: 198, radius: 0.94, size: 26, hollow: true,
      label: '首测 0.42 mil', title: '首测 0.42 mil', rel: '首测记录', rels: '首测记录',
      text: '第19发首测高低偏差 0.42 mil，超过判据 0.30 mil。',
    }),
    node({
      id: 're', group: '复测结果', angle: 216, radius: 0.94, size: 30, hollow: true,
      label: '复测 0.18 mil', title: '复测 0.18 mil', rel: '复测结果', rels: '复测结果',
      text: '复测记录单独保留，符合判据，但不回写为首测合格。',
    }),
    node({
      id: 'qual', group: '质量评价', angle: 126, radius: 0.76, size: 46,
      label: '正式样本与复测分离', title: '正式统计 30 发与复测分离', rel: '质量评价', rels: '质量评价',
      text: '正式统计只计 30 发，复测单独列表，结论里并列首测和复测。',
    }),
    node({
      id: 'cause', group: '异常溯源', angle: 252, radius: 0.94, size: 34, hollow: true,
      label: '温补失效', title: '温补失效', rel: '异常溯源', rels: '异常溯源',
      text: '定位定向系统温补失效为候选根因，需与气象修正误差分流判断。',
    }),
    node({
      id: 'root', group: '根因案例', angle: 162, radius: 0.94, size: 28, hollow: true,
      label: '定位定向温补失效', title: '定位定向系统温补失效', rel: '根因案例', rels: '根因案例',
      text: '把温补系数偏差、现场处置和复测结果连成同一发次的证据闭环。',
    }),
    node({
      id: 'scene', group: '应用场景', angle: 180, radius: 0.76, size: 40,
      label: '正式试验判读复核', title: '正式试验判读与复核', rel: '工程应用', rels: '工程应用',
      text: '用于立靶高低偏差指标的智能判读与复核，辅助区分测量误差、气象修正误差与装备状态异常。',
    }),
    node({
      id: 'std', group: '标准规范', angle: 72, radius: 0.94, size: 30, hollow: true,
      label: '证据链组织规范', title: '试验鉴定证据链组织规范', rel: '标准规范', rels: '标准规范',
      text: '判定句需能顺着发次编号回到源文件，没有出处的条款不自动编号。',
    }),
    node({
      id: 'doc', group: '证据文献', angle: 108, radius: 0.78, size: 38,
      label: '光测融合研究', title: '立靶偏差多源光测融合测量与误差溯源研究', rel: '文献佐证', rels: '文献佐证',
      text: evidence30005.quote,
      evidence: evidence30005,
    }),
    node({
      id: 'img', group: '证据文献', angle: 342, radius: 0.94, size: 28, hollow: true,
      label: '靶面图像证据', title: '靶面图像与标靶证据', rel: '引用', rels: '引用',
      text: '靶纸、测量文件和设备日志按同一发次编号存放，作为弹着点识别的原始证据。',
    }),
    node({
      id: 'trend', group: '发展趋势', angle: 270, radius: 0.94, size: 34, hollow: true,
      label: '复杂背景多站协同', title: '复杂背景与多站协同', rel: '演进方向', rels: '演进方向',
      text: '先完成与现有测量链路的同工况比对，再扩展到复杂背景和多站协同。',
    }),
  ]
}

function baseLinks() {
  return [
    { id: 'l1', from: 'hub', to: 'dir', rel: '属于', bend: 28 },
    { id: 'l2', from: 'hub', to: 'm1', rel: '关键方法', bend: -26 },
    { id: 'l3', from: 'hub', to: 'm2', rel: '观测手段', bend: 22 },
    { id: 'l4', from: 'hub', to: 'm3', rel: '观测手段', bend: -24 },
    { id: 'l5', from: 'hub', to: 'm4', rel: '关键方法', bend: 20 },
    { id: 'l6', from: 'hub', to: 'weather', rel: '误差修正', bend: -30 },
    { id: 'l7', from: 'hub', to: 'ind', rel: '验证指标', bend: 26 },
    { id: 'l8', from: 'hub', to: 'qual', rel: '质量评价', bend: -18 },
    { id: 'l9', from: 'hub', to: 'scene', rel: '工程应用', bend: 24 },
    { id: 'l10', from: 'hub', to: 'doc', rel: '文献佐证', bend: -22 },
    { id: 'l11', from: 'hub', to: 'trend', rel: '演进方向', bend: 32 },
    { id: 'l12', from: 'hub', to: 'std', rel: '标准规范', bend: -16 },
    { id: 'l13', from: 'm2', to: 'm5', rel: '时序对齐', bend: 18 },
    { id: 'l14', from: 'ind', to: 'judge', rel: '指标判据', bend: -20 },
    { id: 'l15', from: 'ind', to: 'evt', rel: '异常发次', bend: 16 },
    { id: 'l16', from: 'evt', to: 'over', rel: '首测记录', bend: 14 },
    { id: 'l17', from: 'evt', to: 're', rel: '复测结果', bend: -16 },
    { id: 'l18', from: 'evt', to: 'cause', rel: '异常溯源', bend: 22 },
    { id: 'l19', from: 'cause', to: 'root', rel: '根因案例', bend: -14 },
    { id: 'l20', from: 'qual', to: 're', rel: '口径分离', bend: 18 },
    { id: 'l21', from: 'root', to: 'weather', rel: '对照', bend: -20 },
    { id: 'l22', from: 'm1', to: 'img', rel: '引用', bend: 16 },
    { id: 'l23', from: 'scene', to: 'ind', rel: '服务于', bend: -18 },
    { id: 'l24', from: 'trend', to: 'm5', rel: '演进', bend: 14 },
    { id: 'l25', from: 'std', to: 'doc', rel: '依据', bend: -12 },
  ]
}

function parts(item) {
  const text = `${item.content}、${item.principle}、${item.problem}`
  const list = text.split(/[、，。；]/).map((part) => part.trim()).filter((part) => part.length >= 4)
  return [...new Set(list)]
}

function clip(text, size = 10) {
  const value = String(text || '').replace(/\s/g, '')
  return value.length > size ? `${value.slice(0, size)}` : value
}

function bookTitle(source = '') {
  const matched = source.match(/《([^》]+)》/)
  return matched?.[1] || source.split(/[，,]/)[0] || '关联证据'
}

/** 其他创新点沿用同一套 21 节点 / 25 关系，文字改成该创新点自己的内容。 */
function applyItem(item, nodes) {
  const bits = parts(item)
  const pick = (index, fallback) => bits[index] || fallback
  const book = bookTitle(item.source)
  const evidence = { title: book, source: item.source, quote: item.quote }
  const patch = {
    hub: { label: item.title, title: item.title, text: item.content, evidence },
    dir: { label: clip(item.directionName, 10), title: item.directionName, text: item.summary },
    m1: { label: clip(pick(0, '关键方法'), 8), title: pick(0, item.content), text: item.principle },
    m2: { label: clip(pick(1, '观测对齐'), 8), title: pick(1, item.principle), text: item.principle },
    m3: { label: clip(pick(2, '坐标统一'), 8), title: pick(2, item.principle), text: item.problem },
    m4: { label: clip(pick(3, '结果评定'), 8), title: pick(3, item.content), text: item.content },
    m5: { label: clip(pick(4, '协同测量'), 8), title: pick(4, item.principle), text: item.principle },
    weather: { label: clip(pick(5, '误差修正'), 8), title: pick(5, item.problem), text: item.problem },
    ind: { label: clip(item.directionName, 8), title: item.directionName, text: item.value },
    judge: { label: `创新度 ${item.innov}`, title: `创新度 ${item.innov}`, text: `当前创新度 ${item.innov}，发展阶段为${item.stage}。` },
    evt: { label: item.stage, title: item.stage, text: item.problem },
    over: { label: `热度 ${item.heat}`, title: `发展热度 ${item.heat}`, text: item.summary },
    re: { label: `${item.evidence} 份证据`, title: `${item.evidence} 份关联证据`, text: item.quote },
    qual: { label: '证据与结论分离', title: '证据与结论分离', text: item.quote },
    cause: { label: clip(pick(6, '异常溯源'), 8), title: pick(6, item.problem), text: item.problem },
    root: { label: clip(item.title, 8), title: item.title, text: item.value },
    scene: { label: '鉴定应用', title: '试验鉴定应用', text: item.value },
    std: { label: '证据回链', title: '证据回链要求', text: item.quote },
    doc: { label: clip(book, 8), title: book, text: item.quote, evidence },
    img: { label: '原始记录', title: '原始记录', text: item.source },
    trend: { label: item.tag || item.stage, title: item.tag || item.stage, text: item.summary },
  }
  nodes.forEach((entry) => {
    const next = patch[entry.id]
    if (next) Object.assign(entry, next)
  })
}

export function buildInsightGraph(item) {
  const nodes = baseNodes(item)
  const links = baseLinks()
  if (item?.id !== 'ip-30005') applyItem(item, nodes)
  return { nodes, links }
}
