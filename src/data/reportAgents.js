/** 报告编写可选的专家与技能。口径对齐指标树、试验结果和异常闭环。 */

export const reportExperts = [
  { id: 'rx-judge', group: '符合性判定', name: '符合性判定专家', brief: '按指标树 V1.0 逐项核对实测与判据，复测符合不改写为首测符合。', tags: ['44项判定', '复测后符合'] },
  { id: 'rx-fire', group: '符合性判定', name: '射击精度鉴定专家', brief: '核对立靶高低、方向偏差和密集度，第19发超差与复测分列。', tags: ['立靶偏差', '第19发'] },
  { id: 'rx-measure', group: '符合性判定', name: '弹道测量专家', brief: '核对照正式 30 发与复测 1 发的初速、膛压和发次编号。', tags: ['30发', '初速'] },
  { id: 'rx-move', group: '性能域', name: '机动性能鉴定专家', brief: '审定行驶、通过科目的实测与判据是否同源引用。', tags: ['行驶性能', '通过性能'] },
  { id: 'rx-protect', group: '性能域', name: '防护与三防专家', brief: '核对装甲抗弹和三防密封的判定口径与证据。', tags: ['弹道防护', '三防'] },
  { id: 'rx-info', group: '性能域', name: '信息能力鉴定专家', brief: '覆盖昼夜间探测、激光测距和电台通信的结果表述。', tags: ['观瞄探测', '通信'] },
  { id: 'rx-env', group: '环境可靠', name: '环境适应性专家', brief: '分列高低温工况，条件偏差与常温基线分开说明。', tags: ['高低温', '环境适应'] },
  { id: 'rx-rel', group: '环境可靠', name: '可靠性维修专家', brief: '校核平均故障间隔、任务可靠度和平均修复时间的统计口径。', tags: ['可靠性', '维修性'] },
  { id: 'rx-emc', group: '环境可靠', name: '电磁兼容鉴定专家', brief: '按适用标准核对电磁兼容与电源瞬态的判定表述。', tags: ['电磁兼容', '电源瞬态'] },
  { id: 'rx-cause', group: '异常归零', name: '异常归零专家', brief: '写清第19发超差事实、温补失效根因和复测闭环。', tags: ['温补失效', '归零'] },
  { id: 'rx-evidence', group: '异常归零', name: '证据链校核专家', brief: '检查判定是否回链指标树条款和研制总要求页码。', tags: ['指标树', '原文溯源'] },
  { id: 'rx-report', group: '报告编制', name: '报告编制专家', brief: '按所选报告模板装配章节，判定、原始记录和异常闭环成套。', tags: ['报告模板', '章节结构'] },
]

export const reportSkills = [
  { id: 'rs-outline', group: '报告装配', name: '报告提纲装配', brief: '以所选报告模板为骨架，按章节整理试验范围、样本、判据和异常闭环。', tags: ['模板骨架', '提纲'] },
  { id: 'rs-criteria', group: '报告装配', name: '指标树判据回填', brief: '按指标树 V1.0 把考核判据写入判定表，并保留条款来源。', tags: ['指标树 V1.0', '判据回填'] },
  { id: 'rs-review', group: '报告装配', name: '结论口径校核', brief: '结论同时引用首测和复测，适用范围限于本批次。', tags: ['结论', '批次'] },
  { id: 'rs-judge', group: '判定成文', name: '符合性判定表', brief: '44 项逐条列出实测与结论，复测后符合单独成列。', tags: ['44项', '符合性'] },
  { id: 'rs-raw', group: '判定成文', name: '原始记录汇总', brief: '汇总 30 发正式记录与 1 发复测，高低、方向和初速分开统计。', tags: ['30发', '复测'] },
  { id: 'rs-shot', group: '异常闭环', name: '超差发次对照', brief: '第19发首测 0.42 mil 与复测 0.18 mil 并列，不覆盖首测值。', tags: ['第19发', '0.42 mil'] },
  { id: 'rs-cause', group: '异常闭环', name: '根因证据引用', brief: '引用定位定向系统温补失效及置信度，证据不代替复测结论。', tags: ['温补失效', '置信度'] },
  { id: 'rs-close', group: '异常闭环', name: '复测闭环写入', brief: '写明复测满足判据、首测记录继续保留，并回链异常解读报告。', tags: ['复测闭环', '解读报告'] },
]

export const reportExpertGroups = ['全部', ...new Set(reportExperts.map((item) => item.group))]
export const reportSkillGroups = ['全部', ...new Set(reportSkills.map((item) => item.group))]

export const reportProjects = [
  { id: 'proj-qual', name: '某型装备性能鉴定试验', org: '试验鉴定机构', scope: '火力、机动、防护、探测、通信、可靠性与环境适应性' },
  { id: 'proj-type', name: '定型试验项目', org: '试验鉴定机构', scope: '定型阶段性能与可靠性科目' },
  { id: 'proj-perf', name: '性能鉴定试验项目', org: '试验鉴定机构', scope: '性能指标符合性鉴定' },
  { id: 'proj-rel', name: '可靠性试验项目', org: '试验鉴定机构', scope: '任务可靠度与维修性科目' },
]
