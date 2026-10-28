/** 试验方案生成预览可选的专家与技能。口径对齐指标树、大纲模板和校核留痕。 */

export const schemeExperts = [
  { id: 'ex-fire', group: '射击精度', name: '射击精度试验专家', brief: '负责立靶偏差、密集度和首发命中的科目、样本与判据设计。', tags: ['立靶偏差', '密集度', '首发命中'] },
  { id: 'ex-measure', group: '射击精度', name: '弹道测量专家', brief: '组织光测、初速和膛压共用测量链，统一发次编号与设备优先级。', tags: ['测量链', '初速', '膛压'] },
  { id: 'ex-aim', group: '射击精度', name: '定位定向校核专家', brief: '核对温补、校靶和第19发超差后的复测口径，避免复测回写首测。', tags: ['温补', '校靶', '复测'] },
  { id: 'ex-weather', group: '射击精度', name: '气象保障专家', brief: '规定标准气象条件和弹道气象修正的采集、冻结与引用方式。', tags: ['气象修正', '试验条件'] },
  { id: 'ex-move', group: '机动防护', name: '机动性能试验专家', brief: '安排速度、爬坡、越壕和涉水科目，并按场地分区排程。', tags: ['行驶性能', '通过性能'] },
  { id: 'ex-protect', group: '机动防护', name: '防护与三防专家', brief: '审定装甲抗弹和三防密封的判定口径，超标样本冻结待审查。', tags: ['弹道防护', '三防'] },
  { id: 'ex-info', group: '机动防护', name: '信息能力试验专家', brief: '覆盖昼夜间探测、激光测距和电台通信的科目与记录要求。', tags: ['观瞄探测', '通信'] },
  { id: 'ex-env', group: '环境可靠', name: '环境适应性专家', brief: '划定高低温工作边界，并与电磁兼容科目的实施顺序衔接。', tags: ['高低温', '环境适应'] },
  { id: 'ex-rel', group: '环境可靠', name: '可靠性维修专家', brief: '校核平均故障间隔、任务可靠度和平均修复时间的统计口径。', tags: ['可靠性', '维修性'] },
  { id: 'ex-emc', group: '环境可靠', name: '电磁兼容试验专家', brief: '按适用标准安排传导发射与辐射敏感度，低置信项定稿前确认。', tags: ['电磁兼容', '电源瞬态'] },
  { id: 'ex-safe', group: '组织校核', name: '试验安全专家', brief: '明确停试权限、无效发会签和安全中断后的记录保留要求。', tags: ['停试', '无效发'] },
  { id: 'ex-evidence', group: '组织校核', name: '证据链校核专家', brief: '检查判据是否回链指标树条款和研制总要求页码。', tags: ['指标树', '原文溯源'] },
  { id: 'ex-outline', group: '组织校核', name: '大纲编制专家', brief: '按所选模板装配章节，保证条件、步骤、记录、判据和处置成套。', tags: ['大纲模板', '章节结构'] },
]

export const schemeSkills = [
  { id: 'sk-outline', group: '大纲装配', name: '五章大纲装配', brief: '以所选大纲模板为骨架，逐项生成条件、步骤、数据记录、判据和异常处置。', tags: ['模板骨架', '章节成套'] },
  { id: 'sk-criteria', group: '大纲装配', name: '指标树判据回填', brief: '按指标树 V1.0 把考核判据写入正文，并保留条款来源。', tags: ['指标树 V1.0', '判据回填'] },
  { id: 'sk-trace', group: '大纲装配', name: '原文溯源引用', brief: '为判据标注《99A式主战坦克研制总案-模拟数据》页码，正文与指标树同源。', tags: ['页码引用', '同源'] },
  { id: 'sk-factor', group: '试验组织', name: '试验因子交叉编排', brief: '弹药批次、身管状态和操作人员按因子表交叉，避免集中在同一组次。', tags: ['因子表', '分组'] },
  { id: 'sk-sample', group: '试验组织', name: '样本分组', brief: '精度科目按 10 发、2 组组织，预热和校靶不计入有效样本。', tags: ['10发', '有效样本'] },
  { id: 'sk-ready', group: '试验组织', name: '试前准入校核', brief: '写清指挥、测试、数据和专家组职责，关键资源不可用不得开试。', tags: ['职责', '开试条件'] },
  { id: 'sk-resource', group: '试验组织', name: '资源冲突检查', brief: '共用测量链设置占用优先级，场地冲突须留下调整记录。', tags: ['测量链', '场地'] },
  { id: 'sk-budget', group: '测量判据', name: '测量链误差预算', brief: '为 0.30 m 附近的立靶高低中间偏差判定补充误差预算和双人独立复算。', tags: ['误差预算', '复算'] },
  { id: 'sk-weather', group: '测量判据', name: '气象修正写入', brief: '每组射击前采集气象，事后不得修改输入或隐去超差。', tags: ['气象', '冻结'] },
  { id: 'sk-anomaly', group: '异常复测', name: '异常发次处置', brief: '超差发次冻结原始数据，复测单独编号，不得覆盖首测值。', tags: ['第19发', '复测'] },
  { id: 'sk-stop', group: '异常复测', name: '安全停试编排', brief: '按缺数、超差、设备不一致、安全中断和无效发配置停试权限。', tags: ['五类异常', '停试'] },
  { id: 'sk-review', group: '异常复测', name: '专家校核留痕', brief: '机器起草内容标记待校核，后续对话修改可回溯到版本。', tags: ['校核', '版本留痕'] },
]

export const schemeExpertGroups = ['全部', ...new Set(schemeExperts.map((item) => item.group))]
export const schemeSkillGroups = ['全部', ...new Set(schemeSkills.map((item) => item.group))]
