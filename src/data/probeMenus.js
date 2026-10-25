import { g, leaf, crud, home, reuse } from '@/data/menuKit'

export function probeSystems() {
  return [
    {
      id: 'probe-discover',
      name: '多模态试验鉴定体系知识发现',
      full: '多模态试验鉴定体系知识发现系统',
      menus: [
        leaf('home', '首页', home(
          '欢迎使用 多模态试验鉴定体系知识发现系统',
          '与数据智能再造平台、领域资源库打通，接入解析、去噪、对齐等预处理，完成多模态分词、实体识别、语义标注和关联匹配。',
          [
            { name: '数据对接', to: 'shot-list', desc: '实时 / 定时 / 增量' },
            { name: '语义解析', to: 'algo', desc: '不少于 5 种算法' },
            { name: '关联发现', to: 'trial', desc: '实体与事件关系' },
            { name: '检索运用', to: 'trial', desc: '导出与第三方对接' },
          ],
          [
            { label: '接入数据', value: '4,860', unit: '份' },
            { label: '解析算法', value: '6', unit: '种' },
            { label: '实体识别准确率', value: '84.6', unit: '%' },
            { label: '对接任务', value: '12', unit: '个' },
          ],
        )),
        g('fusion', '试验数据融合发现', 'graph', reuse(
          crud('对接多源试验数据，完成多格式接入、统一预处理、多模态语义发现与跨类型关联。', 'syncTasks'),
          [
            ['fusion-link', '试验数据资源对接'],
            ['fusion-fmt', '多格式数据接入'],
            ['fusion-pre', '统一预处理接入'],
            ['fusion-sem', '多模态语义发现'],
            ['fusion-cross', '跨类型数据关联'],
            ['fusion-know', '试验知识融合发现'],
          ],
        )),
        g('data-link', '数据对接任务控制', 'transfer', [
          leaf('sync-cfg', '跨应用对接配置', crud('跨资源库与业务智能体对接，配置接口与字段映射。', 'syncTasks')),
          leaf('sync-live', '实时数据同步', crud('支持实时同步试验回传数据。', 'syncTasks')),
          leaf('sync-cron', '定时数据同步', crud('按计划定时拉取试验数据。', 'syncTasks')),
          leaf('sync-inc', '数据增量更新', crud('识别变化并执行增量更新。', 'syncTasks')),
          leaf('shot-list', '对接任务监控', {
            type: 'm15',
            desc: '以对接任务方式回传试验数据入库，支持弹道测量、遥测文件接入；启动智能检测后探针逐项扫描，告警精确到发次。',
          }),
        ]),
        g('domain', '垂域语义特征解析', 'parse', reuse(
          crud('完成垂域语义解析、多模态特征提取、关联匹配与试验语义关系提取。', 'algorithms'),
          [
            ['domain-parse', '垂域语义解析'],
            ['domain-feat', '多模态特征提取'],
            ['domain-match', '解析数据关联匹配'],
            ['domain-rel', '试验语义关系提取'],
            ['domain-out', '特征解析成果管理'],
          ],
        )),
        g('algo-g', '数据解析算法管理', 'plugin', reuse(
          crud('分词、实体识别、语义标注、关系抽取与特征嵌入，提升处理效率与准确性。', 'algorithms'),
          [
            ['algo-cfg', '解析算法能力配置'],
            ['algo', '解析算法注册'],
            ['algo-sched', '解析算法调度'],
            ['algo-eval', '解析算法效果评估'],
          ],
        )),
        g('trial-g', '试验数据智能检索', 'search', reuse(
          crud('按数据类型、时间、关键词、试验场景检索，支持导出和向第三方对接。', 'trialData'),
          [
            ['trial-cfg', '试验数据检索条件配置'],
            ['trial', '试验数据精准检索'],
            ['trial-show', '检索结果展示'],
            ['trial-export', '检索数据导出'],
            ['trial-third', '第三方数据对接'],
          ],
        )),
      ],
    },
    {
      id: 'probe-build',
      name: '增量式智能探针推理图谱构建',
      full: '增量式智能探针推理图谱构建系统',
      menus: [
        leaf('probe-home', '首页', home(
          '欢迎使用 增量式智能探针推理图谱构建系统',
          '把问题描述、试验数据、事件时间、原因、处置和专家经验转为实体、关系与属性，形成探针定位的标准化参考。',
          [
            { name: '探针配置', to: 'probe-list', desc: '12个探针全部启用' },
            { name: '数据接入', to: 'shot-list', desc: '对接任务回传入库' },
            { name: '智能检测', to: 'shot-list', desc: '探针逐项扫描告警' },
            { name: '根因分析', to: 'cause-list', desc: '思维链四层推理' },
            { name: '解读报告', to: 'report-list', desc: '五节自动装配归档' },
          ],
          [
            { label: '在用探针', value: '12', unit: '个' },
            { label: '检测发次', value: '30', unit: '发' },
            { label: '根因采纳率', value: '86', unit: '%' },
            { label: '已归档报告', value: '1', unit: '份' },
          ],
        )),
        g('probe-mgmt', '试验鉴定探针管理', 'target', reuse(
          {
            type: 'm14',
            desc: '管理 12 个监测探针的参数配置与启用状态，判据全部引自指标树 V1.0，支持探针创建、编辑与批量启用。',
          },
          [
            ['probe-create', '探针创建'],
            ['probe-list', '探针管理'],
            ['probe-edit', '探针编辑'],
            ['probe-del', '探针删除'],
          ],
        )),
        g('pgraph-build', '探针推理图谱构建', 'graph', reuse(
          { type: 'graph', graphKey: 'probe', desc: '展示问题、数据、原因、措施之间的标准化关系。' },
          [
            ['graph-data', '图谱构建数据汇聚'],
            ['graph-core', '图谱核心要素识别'],
            ['graph-ext', '图谱知识抽取'],
            ['graph-view', '推理图谱生成'],
            ['graph-ref', '探针参考数据生成'],
          ],
        )),
        g('pgraph-opt', '探针推理图谱优化', 'clean', reuse(
          crud('识别重复实体和冗余关系，优化结构并评估检索效率。', 'entities'),
          [
            ['dedup-ent', '重复实体识别'],
            ['dedup-rel', '冗余关系识别'],
            ['dedup', '图谱数据去重'],
            ['dedup-struct', '图谱结构优化'],
            ['dedup-eval', '图谱检索效率评估'],
          ],
        )),
        g('pgraph-edit', '探针推理图谱编辑', 'edit', reuse(
          crud('专家编辑实体与关系，补充经验知识。', 'events'),
          [
            ['edit-ent', '图谱实体编辑'],
            ['edit-rel', '图谱关系编辑'],
            ['edit-add', '图谱知识补充'],
            ['expert-edit', '专家修订管理'],
          ],
        )),
        g('pgraph-inc', '探针推理图谱增量更新', 'compare', reuse(
          crud('识别变化、执行增量并校验质量，同步探针参考数据。', 'syncTasks'),
          [
            ['incr-chg', '图谱数据变化识别'],
            ['incr-data', '图谱增量数据处理'],
            ['incr', '图谱增量更新执行'],
            ['incr-qa', '增量更新质量校验'],
            ['incr-sync', '探针参考数据同步'],
          ],
        )),
      ],
    },
    {
      id: 'probe-interpret',
      name: '探针数据智能解读',
      full: '探针数据智能解读系统',
      menus: [
        leaf('home', '首页', home(
          '欢迎使用 探针数据智能解读系统',
          '结合历史探针、试验数据和专家经验，对异常数据做根因推理，生成可编辑、可导出的标准化解读报告。',
          [
            { name: '根因分析', to: 'cause-list', desc: '异常与历史探针对照' },
            { name: '趋势可视化', to: 'viz', desc: '成因与趋势' },
            { name: '解读报告', to: 'report-list', desc: '生成、编辑、导出' },
          ],
          [
            { label: '异常事件', value: '27', unit: '条' },
            { label: '已出具报告', value: '19', unit: '份' },
            { label: '根因采纳率', value: '82', unit: '%' },
            { label: '平均响应', value: '2.4', unit: 's' },
          ],
        )),
        g('analysis', '异常试验数据根因分析', 'flow', [
          leaf('cause-get', '异常数据获取', { type: 'm19', desc: '获取异常试验数据，作为根因分析输入。' }),
          leaf('cause-search', '图谱关联知识检索', { type: 'm19', desc: '检索探针推理图谱中的历史探针、试验数据与专家经验。' }),
          leaf('cause-list', '异常根因推理', {
            type: 'm19',
            desc: '基于探针推理图谱自动推理，给出候选根因与置信度排序；思维链四层展示推理依据；证据面板列明每条结论的原始出处。',
          }),
          leaf('cause-sol', '异常解决方案生成', { type: 'm19', desc: '针对采纳根因生成处置建议与解决方案。' }),
          leaf('cause-out', '根因分析成果展示', { type: 'm19', desc: '展示候选根因、置信度、思维链与证据出处。' }),
        ]),
        g('viz-g', '探针可视化分析', 'chart', reuse(
          { type: 'stats', statsKey: 'probe', desc: '分析历史探针问题的成因与趋势。' },
          [
            ['viz-hist', '历史探针数据分析'],
            ['viz-cause', '历史问题成因分析'],
            ['viz', '历史问题趋势分析'],
            ['viz-view', '探针分析可视化'],
            ['viz-render', '可视化渲染管理'],
          ],
        )),
        g('report-g', '智能解读报告生成', 'doc', reuse(
          {
            type: 'm22',
            desc: '分析结论一键固化为解读报告，五节自动装配，图表数据来自本次分析真实产物，归档标记"待试验后引用"。',
          },
          [
            ['report-prep', '报告分析数据准备'],
            ['report-cfg', '标准化报告配置'],
            ['report-list', '解读报告自动生成'],
            ['report-edit', '解读报告编辑'],
            ['report-export', '解读报告导出'],
          ],
        )),
      ],
    },
    {
      id: 'locate',
      name: '试验鉴定智能探针定位',
      full: '试验鉴定智能探针定位系统',
      menus: [
        leaf('home', '首页', home(
          '欢迎使用 试验鉴定智能探针定位系统',
          '结合探针参数与推理图谱，对试验总案、大纲、报告中的核心指标、异常模式和潜在故障信号定位，输出异常指标、异常节点与合规风险。',
          [
            { name: '思维链构建', to: 'chain', desc: '排查过程可视化' },
            { name: '异常输出', to: 'out', desc: '指标、节点、风险' },
            { name: '依据查验', to: 'chain', desc: '推理依据可回溯' },
          ],
          [
            { label: '定位任务', value: '46', unit: '个' },
            { label: '异常指标', value: '13', unit: '项' },
            { label: '识别准确率', value: '83.5', unit: '%' },
            { label: '合规风险', value: '5', unit: '项' },
          ],
        )),
        g('chain-g', '智能探针推理思维链构建', 'flow', [
          leaf('chain-prep', '探针推理数据准备', { type: 'flow', flowKey: 'probe', desc: '准备探针参数与推理图谱数据。' }),
          leaf('chain-doc', '试验文档信息识别', { type: 'flow', flowKey: 'probe', desc: '识别试验总案、大纲、报告中的核心指标与异常模式。' }),
          leaf('chain-loc', '异常信息智能定位', { type: 'flow', flowKey: 'probe', desc: '定位异常指标、异常节点与潜在故障信号。' }),
          leaf('chain-build', '智能推理思维链构建', { type: 'flow', flowKey: 'probe', desc: '构建问题排查的推理过程。' }),
          leaf('chain-risk', '合规风险识别', crud('识别合规潜在风险。性能指标、指标值、试验结果等实体识别准确率不低于 80%。', 'indicators')),
          leaf('out', '异常定位成果输出', crud('输出异常指标、异常节点和合规潜在风险。', 'indicators')),
        ]),
        g('chain-viz', '推理思维链可视化', 'eye', reuse(
          { type: 'flow', flowKey: 'probe', desc: '展示问题排查的推理过程和依据，帮助试验人员理解异常节点逻辑。' },
          [
            ['chain', '推理思维链展示'],
            ['chain-basis', '推理依据展示'],
            ['chain-path', '异常排查路径展示'],
            ['chain-check', '推理链交互查验'],
          ],
        )),
      ],
    },
  ]
}
