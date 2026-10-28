/**
 * 正偏离能力汇总（演示收尾指认）
 * 相对招标技术要求的正向增强项，共 32 条
 */
export const deviationGroups = [
  {
    id: 'p1',
    part: '第一部分 · 试验前',
    items: [
      { id: 'd01', title: '关键指标抽取置信度评估', evidence: 'm02 抽取结果页置信度列 + 低置信度标黄', better: '准确率 ≥85%，并提供置信度分流人工' },
      { id: 'd02', title: '原文一键溯源高亮', evidence: 'm02 点击指标同步跳转原文并高亮', better: '优于仅输出结构化列表' },
      { id: 'd03', title: '试验因子配置 ≥20', evidence: 'm08 因子面板「已配置因子：22个」', better: '招标要求不少于 20 个' },
      { id: 'd04', title: '4 种资源推荐算法', evidence: 'm11 四算法 Tab 同屏', better: '招标要求 3 种，提供规则/内容/协同/综合' },
      { id: 'd05', title: '方案多轮对话优化留痕', evidence: 'm08 三轮对话 + 差异摘要 + V1→V4', better: '机器起草、专家校核可追溯' },
      { id: 'd06', title: '指标树四级结构化落库', evidence: 'm03 七域十五类二十八项', better: '支撑后续探针判据与报告引用同源' },
      { id: 'd07', title: '资料解析语义索引', evidence: 'm01 语义索引状态「已建立」', better: '解析结果可检索、可复用' },
      { id: 'd08', title: '多模态解析统计可视', evidence: 'm01 表格/图片/段落统计卡', better: '处理结果可指认、可核验' },
    ],
  },
  {
    id: 'p2',
    part: '第二部分 · 试验中',
    items: [
      { id: 'd09', title: '探针判据与指标树同源', evidence: 'm14「引自指标树 V1.0」标识', better: '试验前基准直接成为检测尺子' },
      { id: 'd10', title: '对接任务式数据接入', evidence: 'm15 任务成功状态 + 30 发留痕', better: '对应数据对接任务控制语义' },
      { id: 'd11', title: '探针扫描过程可视', evidence: 'm15 矩阵扫描动画 + 告警横幅', better: '检测非黑盒等待' },
      { id: 'd12', title: '异常精确到发次', evidence: '第19发 0.42 m vs ≤0.30 m', better: '告警即结论、可定位' },
      { id: 'd13', title: '候选根因置信度排序', evidence: 'm19 0.86 / 0.41 / 0.22', better: '图谱给假设、人来定夺' },
      { id: 'd14', title: '多参数可视化联动', evidence: 'm19 姿态/初速/温度三图', better: '根因证据曲线联动' },
      { id: 'd15', title: '推理思维链可视化', evidence: 'm19 思维链四层展开', better: '大模型过程可解释' },
      { id: 'd16', title: '证据面板可溯源', evidence: '大纲条款 / 遥测 / 历史案例', better: '每条结论带来源' },
      { id: 'd17', title: '解读报告五节自动装配', evidence: 'm22 待试验后引用', better: '分析产物直接进文书链路' },
    ],
  },
  {
    id: 'p3',
    part: '第三部分 · 试验后',
    items: [
      { id: 'd18', title: '三类素材装配式生成', evidence: '指标树 / 汇总表 / 解读报告', better: '报告生成可溯源非「写作文」' },
      { id: 'd19', title: '符合性判定闭环', evidence: '「复测后符合」关联第19发', better: '试验中处置在报告中闭环' },
      { id: 'd20', title: '章节溯源徽标', evidence: '报告预览页节级溯源', better: '每一节有出处' },
      { id: 'd21', title: '三类智能审查策略', evidence: '术语 / 勾稽 / 判据引用', better: '审查升维为业务把关' },
      { id: 'd22', title: '审查意见定位高亮', evidence: '点击定位正文即时跳转', better: '意见可落地、可留痕' },
      { id: 'd23', title: '定稿一键归集入库', evidence: '试验报告 V2 已入库', better: '文书闭环并接知识沉淀' },
      { id: 'd24', title: '跨阶段数据贯通', evidence: 'demo-store session 持久化', better: '四部分同一套演示数据' },
    ],
  },
  {
    id: 'p4',
    part: '第四部分 · 知识沉淀与底座',
    items: [
      { id: 'd25', title: '创新点四要素结构化', evidence: 'm29 问题/原理/创新/效果', better: '可抽取、可溯源、可统计' },
      { id: 'd26', title: '试验问题挂接技术体系', evidence: 'm30 温补节点麦金案例', better: '打一仗、进一步实体化' },
      { id: 'd27', title: '研判模板智能推荐', evidence: 'm31 麦金「智能推荐」徽标', better: '按浏览方向自动推荐' },
      { id: 'd28', title: '研判建议实证支撑', evidence: '温补技术工程化改进', better: '建议来自本次试验数据' },
      { id: 'd29', title: '查重入口露出', evidence: 'm31 页底多维查重', better: '研判与查新能力同屏' },
      { id: 'd30', title: '专域预训练过程可视', evidence: '训推看板四区曲线', better: '优于招标要求的训练监控' },
      { id: 'd31', title: '智能体模板库 ≥3', evidence: '抽取 / 审查 / 问答三模板', better: '覆盖典型业务场景' },
      { id: 'd32', title: '资源库六类资产同源', evidence: '数据集/探针/文书/文献/创新点/图谱', better: '与应用端统计同源' },
    ],
  },
]

export const deviationFlat = deviationGroups.flatMap((g) =>
  g.items.map((item) => ({ ...item, part: g.part, groupId: g.id })),
)

export const deviationTotal = deviationFlat.length
