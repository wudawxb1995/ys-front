import { cleanDocLabel, docPlatformModules } from '@/data/docPlatform'

const g = (id, name, icon, children) => ({ id, name, icon, children })
const leaf = (id, name, page) => ({ id, name, page })
const crud = (desc, dataset) => ({ type: 'crud', desc, dataset })

const week = [['10-13', 18], ['10-14', 26], ['10-15', 15], ['10-16', 32], ['10-17', 22], ['10-18', 12], ['10-19', 20]]

function home(title, desc, steps, kpis, chartTitle = '近7日业务量') {
  return {
    type: 'dashboard',
    bannerTitle: title,
    bannerDesc: desc,
    steps,
    kpis,
    chart: { title: chartTitle, unit: '项', data: week },
  }
}

const postTrialPages = {
  'write/outline-design/outline': { type: 'post-trial', stage: 'outline', module: 'M23' },
  'write/knowledge-generate/draft': { type: 'post-trial', stage: 'compose', module: 'M24' },
  'write/generation-trace/trace': { type: 'post-trial', stage: 'trace', module: 'M25' },
  'review/strategy-review/run': { type: 'post-trial', stage: 'review', module: 'M26 / M27' },
  'review/review-result/issues': { type: 'post-trial', stage: 'review', entry: 'result', module: 'M27' },
  'collect/doc-collect/document-type-archive': { type: 'post-trial', stage: 'archive', module: 'M28' },
}

function docFeaturePage(systemId, module, feature) {
  return postTrialPages[`${systemId}/${module.id}/${feature.id}`] || {
    type: 'doc-feature',
    scene: module.scene,
    moduleName: cleanDocLabel(module.name),
    featureName: cleanDocLabel(feature.name),
  }
}

function buildDocMenus(systemId, systemName) {
  const modules = docPlatformModules[systemId]
  const firstModule = modules[0]
  return [
    leaf('home', '首页', {
      type: 'doc-feature',
      scene: firstModule.scene,
      moduleName: '首页',
      featureName: systemName,
    }),
    ...modules.map((module) => g(
      module.id,
      cleanDocLabel(module.name),
      undefined,
      module.features.map((feature) => leaf(
        feature.id,
        cleanDocLabel(feature.name),
        docFeaturePage(systemId, module, feature),
      )),
    )),
  ]
}

export const platforms = [
  {
    id: 'rebuild',
    group: 'app',
    no: '01',
    name: '定型资料数据智能再造平台',
    brief: '异构资料统一汇聚与结构化解析，关键指标定向抽取，构建农业机械履历知识图谱',
    tags: ['数据解析', '指标抽取', '履历图谱', '态势展示'],
    icon: 'book',
    iconFile: '/icons/p1-rebuild.svg',
    systems: [
      {
        id: 'quant',
        name: '异构数据智能量化',
        full: '试验鉴定异构数据智能量化系统',
        menus: [
          leaf('home', '首页', home(
            '欢迎使用 试验鉴定异构数据智能量化系统',
            '面向农业机械试验鉴定业务，提供定型资料、历史试验数据、标准规范、专业文献的统一录入、智能解析、清洗规整、语义量化与成果导出，支撑定型资料数据智能再造。',
            [
              { name: '资源录入', to: 'res-add', desc: '统一汇聚多模态资料' },
              { name: '智能解析', to: 'parse-multi', desc: '文本、图像、表格、音视频' },
              { name: '清洗规整', to: 'clean', desc: '去噪与格式归一' },
              { name: '成果审核', to: 'audit', desc: '三栏对照修订' },
              { name: '语义量化', to: 'vec-task', desc: '50页内 ≤15 秒' },
            ],
            [
              { label: '数据资源总量', value: '286', unit: '项' },
              { label: '已完成解析', value: '214', unit: '项' },
              { label: '待审核成果', value: '37', unit: '项' },
              { label: '向量化完成', value: '168', unit: '项' },
            ],
            '近7日数据上传统计',
          )),
          g('res', '数据资源管理', 'folder', [
            leaf('res-add', '数据资源录入', { type: 'entry', desc: '登记定型资料、历史试验数据、标准规范与专业文献。支持即时解析或暂存，单次批量不少于 50 篇、总容量不少于 500 MB。', dataset: 'resources' }),
            leaf('res-list', '数据资源目录', { type: 'm01', desc: '按名称、类别、解析状态与数据模态检索已录入资源，点击资源可查看处理结果详情，包含章节结构、表格识别统计与语义索引状态。' }),
          ]),
          g('parse', '智能解析', 'parse', [
            leaf('parse-multi', '多格式结构化解析', { type: 'parse', desc: '文本提取关键信息、段落主旨与语义关系；图像经 OCR 转为可编辑文本；表格识别行列并结构化。支持中英双语、印刷体、繁体、手写体与复杂表格。' }),
            leaf('parse-task', '解析任务管理', crud('即时解析、暂存后解析与批量解析任务的进度监控。音视频 ≤5 秒/MB，图片 ≤10 秒/MB。', 'parseTasks')),
            leaf('parse-rule', '解析规则配置', crud('按章节、字符数或页码切分，识别单栏、双栏版式并按阅读顺序还原，提取实体与关系。', 'parseRules')),
            leaf('engines', '解析引擎管理', { type: 'engines', desc: '集成多模态大模型、OCR 与 ASR，按数据类型调度差异化解析服务。' }),
          ]),
          g('clean-g', '数据清洗规整', 'clean', [
            leaf('clean', '去噪归一处理', { type: 'clean', desc: '去除页眉页脚等噪声，将多格式数据按统一标准清洗、转换与整合。' }),
          ]),
          g('audit-g', '解析成果审核', 'audit', [
            leaf('audit', '成果审核工作台', { type: 'workbench', desc: '左侧结构化目录，中间审核编辑，右侧源文件。支持章节层级调整、增删改查，以及源文件与解析结果联动定位。' }),
            leaf('entities', '实体标注管理', crud('修订实体边界与类型，也可手动新增系统未识别的实体。对象覆盖文本、图片与视频。', 'entities')),
          ]),
          g('vec', '语义量化', 'vector', [
            leaf('vec-task', '向量化任务', crud('将非结构化文本转为可计算向量。50 页以内文档向量化处理时间不大于 15 秒。', 'vecTasks')),
            leaf('vec-chunks', '向量成果管理', crud('查看分块文本与向量预览，供检索与比对调用。', 'vecChunks')),
          ]),
          g('exp', '成果导出与存储', 'export', [
            leaf('export', '格式转换导出', { type: 'export', desc: '批量选择文档，导出为 JSON、DOCX、Markdown、PDF、TXT。', dataset: 'exports' }),
            leaf('store', '多模态资源库', crud('按文本、图像、表格、音视频组织存储。单文档 ≥100 MB / ≥1000 页，单图 ≥30 MB，音视频 ≥100 MB。', 'resources')),
          ]),
          leaf('stat', '数据统计工作台', { type: 'stats', desc: '可视化展示历史上传、数据审核与服务器存储资源。' }),
        ],
      },
      {
        id: 'extract',
        name: '关键指标定向抽取',
        full: '农业机械关键指标定向抽取系统',
        menus: [
          leaf('home', '首页', home(
            '欢迎使用 农业机械关键指标定向抽取系统',
            '从定型资料与试验报告中识别性能参数与技术指标，支持意图推断、分类打标、人工审核与原文追溯，并按领域标准生成结构化数据。',
            [
              { name: '解析偏好', to: 'pref', desc: '意图映射为解析策略' },
              { name: '指标抽取', to: 'inds', desc: '性能参数自动抽取' },
              { name: '分类打标', to: 'cats', desc: '章节分类全生命周期' },
              { name: '审核追溯', to: 'preview', desc: '预览、修订与原文定位' },
              { name: '标准建模', to: 'models', desc: '元数据与分类编码' },
            ],
            [
              { label: '已抽取指标', value: '1,286', unit: '条' },
              { label: '待审核', value: '96', unit: '条' },
              { label: '实体抽取准确率', value: '87.4', unit: '%' },
              { label: '问答训练数据', value: '5,200', unit: '条' },
            ],
          )),
          g('pref-g', '解析策略配置', 'target', [
            leaf('pref', '解析偏好管理', crud('按知识库名称或描述推断解析偏好；意图不明时启用预制通用模板，保证策略始终可用。', 'preferences')),
            leaf('tpl-parse', '通用解析模板', crud('维护通用解析模板，支持新增、编辑、启用与停用。', 'schemeTpls')),
            leaf('entity-cfg', '实体识别配置', crud('按条目约定实体类别。可识别文档、音频、视频和图片中的业务对象。', 'entities')),
            leaf('modal-pref', '模态策略管理', { type: 'cards', cardKey: 'modalPref', desc: '文本侧重要点与关系，图像侧重文字与图形，视频侧重事件导览，并给出可对照的跨模态策略。' }),
          ]),
          g('ind-g', '指标抽取', 'parse', [
            leaf('custom', '抽取配置管理', { type: 'entry', entryKey: 'extract', desc: '定义文档范围、内容类型与结果格式，系统按配置定位并提取指标。', dataset: 'indicators' }),
            leaf('inds', '指标抽取任务', crud('抽取文档信息、概要、标签、导航与关键实体，内容对齐知识库主题。', 'indicators')),
            leaf('cats', '文档分类管理', crud('分类信息可增删改查。系统按配置对章节自动打标，用户可审核修改。', 'categories')),
          ]),
          g('rev-g', '抽取结果审核', 'audit', [
            leaf('preview', '结果预览与审核', { type: 'm02', desc: '预览模式查看自动解析结果；审核模式对结果增删改。支持多类别农机的精细化人工核验。' }),
            leaf('multi-rev', '多类别农机核验', crud('针对不同农业机械类别分别核验抽取结果，确保分类准确性。', 'indicators')),
            leaf('trace', '指标原文追溯', crud('由指标项定位并展示源文件，辅助人工核验。', 'indicators')),
          ]),
          g('model-g', '标准化数据建模', 'model', [
            leaf('models', '指标树管理', { type: 'm03', desc: '依据试验鉴定数据标准建立统一指标树，完成语义标注、分类编码和结构化生成。' }),
            leaf('auto-label', '自动标注与编码', crud('对抽取结果执行自动标注与分类编码，支持批量处理与人工复核。', 'entities')),
          ]),
        ],
      },
      {
        id: 'resume',
        name: '履历知识库构建',
        full: '农业机械履历知识库构建系统',
        menus: [
          leaf('home', '首页', home(
            '欢迎使用 农业机械履历知识库构建系统',
            '把定型资料与相关数据归入研发设计、性能试验设计、性能试验鉴定、成果验收，记录技术状态、性能变更、问题归零与关键事件，构建“农业机械—指标—试验—事件”知识图谱。',
            [
              { name: '阶段归类', to: 'life', desc: '全生命周期整合' },
              { name: '过程记录', to: 'events', desc: '状态、变更、归零' },
              { name: '图谱构建', to: 'graph', desc: '三元组与融合' },
              { name: '结构设计', to: 'schema', desc: '节点、关系、Schema' },
              { name: '权限交换', to: 'perm', desc: '分角色与压缩包交换' },
            ],
            [
              { label: '履历机型', value: '128', unit: '个' },
              { label: '图谱节点类型', value: '106', unit: '类' },
              { label: '关系类型', value: '218', unit: '类' },
              { label: '关系抽取准确率', value: '79.2', unit: '%' },
            ],
          )),
          g('life-g', '履历数据管理', 'book', [
            leaf('life', '全生命周期数据整合', crud('资料按研发设计、性能试验设计、性能试验鉴定、成果验收归类。', 'lifecycle')),
            leaf('events', '履历过程记录', crud('记录技术状态、性能变更、问题及归零、关键事件。', 'events')),
          ]),
          g('build', '履历图谱构建', 'graph', [
            leaf('graph', '图谱构建任务', { type: 'graph', graphKey: 'resume', desc: '二维 / 三维展示，支持搜索、筛选、查验、编辑。可手动创建节点、关系与事件类型。' }),
            leaf('fusion', '知识融合管理', { type: 'cards', cardKey: 'fusion', desc: '推荐可融合节点组，编辑后预览融合效果。' }),
          ]),
          g('schema-g', '图谱Schema管理', 'model', [
            leaf('nodes', '节点类型定义', crud('定义实体类型，配置属性、颜色与图标。', 'nodeTypes')),
            leaf('rels', '关系与事件类型定义', crud('内置因果、条件、组成等事件关系，并支持扩展。', 'relTypes')),
            leaf('schema', 'Schema可视化预览', { type: 'graph', graphKey: 'schema', desc: '实时展示节点、关系与事件类型的整体关联，辅助结构设计与校验。' }),
          ]),
          g('ops', '图谱浏览与管理', 'shield', [
            leaf('graph-view', '图谱可视化浏览', { type: 'graph', graphKey: 'resume', desc: '全图谱浏览与查询，支持节点筛选、关系展开与详情查看。' }),
            leaf('pack', '图谱导入导出', crud('以压缩包导入外部图谱的数据与结构，也可导出当前图谱。', 'lifecycle')),
          ]),
          g('resume-show', '履历信息展示', 'book', [
            leaf('life-view', '履历结构化视图', { type: 'timeline', desc: '按时间轴展示农业机械全生命周期履历，支持阶段筛选与事件详情查看。' }),
          ]),
          leaf('perm', '图谱权限管理', { type: 'crud', desc: '按角色管理图谱查看、编辑与发布权限。', dataset: 'kb' }),
        ],
      },
      {
        id: 'situation',
        name: '态势综合展示',
        full: '农业机械能力牵引的试验鉴定态势综合展示系统',
        menus: [
          leaf('home', '首页（综合态势面板）', { type: 'stats', statsKey: 'situation', desc: '覆盖试验任务、资源、环境的综合信息面板，融合试验情况与测试数据，快速定位问题与结果。' }),
          g('trace-g', '技术状态追溯', 'timeline', [
            leaf('trace', '技术状态发展链', { type: 'timeline', desc: '建立技术状态发展链，按时间轴展示关键技术节点演进，支持原文回溯。' }),
            leaf('evt-axis', '关键事件时间轴', { type: 'timeline', desc: '展示农业机械关键事件时间轴，支持事件筛选与详情查看。' }),
          ]),
          g('hist-g', '履历全景追溯', 'report', [
            leaf('compare', '阶段对比分析', { type: 'report', reportKey: 'compare', desc: '对比技术状态阶段，分析各阶段差异与演变规律。' }),
            leaf('change-imp', '变更影响分析', { type: 'report', reportKey: 'changeImp', desc: '分析变更对指标与试验结论的影响，辅助决策。' }),
          ]),
          g('cap-g', '能力评估展示', 'radar', [
            leaf('cap-idx', '能力指标体系', crud('维护能力评估指标体系，配置指标权重与评分规则。', 'indicators')),
            leaf('radar', '能力可视化', { type: 'radar', desc: '以雷达图、能力矩阵和柱状图展示能力状态，维度包括打击、机动、防护，并补充可靠性与作业效率。' }),
          ]),
          g('panel-g', '综合态势面板', 'chart', [
            leaf('task-panel', '试验任务态势', { type: 'stats', statsKey: 'taskPanel', desc: '展示试验任务进度、完成率与资源占用等态势信息。' }),
            leaf('res-panel', '试验资源态势', { type: 'stats', statsKey: 'resPanel', desc: '展示试验资源分布、使用率与可用状态等态势信息。' }),
            leaf('env-panel', '试验环境态势', { type: 'stats', statsKey: 'envPanel', desc: '展示试验环境参数、气候条件与保障状态等态势信息。' }),
          ]),
          g('node-g', '关键节点融合展示', 'flow', [
            leaf('locate', '关键节点融合视图', { type: 'flow', flowKey: 'probe', desc: '融合展示关键节点推理过程和依据，帮助试验人员理解异常节点逻辑。' }),
            leaf('issue-loc', '问题与结果定位', crud('在任务、资源、环境面板中定位试验问题与试验结果。', 'events')),
          ]),
        ],
      },
      {
        id: 'remake',
        name: '多维数据再造',
        full: '面向智能服务的多维数据再造系统',
        menus: [
          leaf('home', '首页', home(
            '欢迎使用 面向智能服务的多维数据再造系统',
            '基于问答主题生成平台级与个人知识卡片，支持专题文档、多维检索、混合检索与知识图谱推理，形成可追溯的领域问答服务。',
            [
              { name: '知识卡片', to: 'cards', desc: '参数与方法卡片' },
              { name: '专题文档', to: 'topic', desc: '可下载、可溯源' },
              { name: '智能检索', to: 'search', desc: '实体、关系、事件' },
              { name: '图谱问答', to: 'qa', desc: '意图识别与引用' },
              { name: '推理分析', to: 'reason', desc: '五种分析能力' },
            ],
            [
              { label: '知识卡片', value: '640', unit: '张' },
              { label: '领域问答数据', value: '5,200', unit: '条' },
              { label: '图谱关系', value: '1.2', unit: '万' },
              { label: '服务接口', value: '18', unit: '个' },
            ],
          )),
          g('card-g', '知识卡片服务', 'cards', [
            leaf('plat-card', '平台级知识卡片', { type: 'cards', cardKey: 'platCard', desc: '平台级卡片来自全平台问答主题，涵盖农机参数与试验鉴定方法。' }),
            leaf('cards', '个性化知识卡片', { type: 'cards', cardKey: 'knowledge', desc: '个性化卡片来自当前账号，按个人关注领域推送。' }),
            leaf('topic', '专题知识管理', { type: 'report', reportKey: 'topic', desc: '按个人偏好生成专题目录、正文与多媒体，支持下载留存。' }),
          ]),
          g('search-g', '智能检索', 'search', [
            leaf('search', '多维组合检索', crud('按实体、关系、事件组合检索，并做语义扩展。可按需求调整排序权重。', 'indicators')),
            leaf('search-cfg', '检索策略管理', crud('配置检索权重、排序规则与语义扩展策略。', 'preferences')),
          ]),
          g('qa-g', '知识问答与推理', 'chat', [
            leaf('qa', '图谱智能问答', { type: 'chat', chatKey: 'kg', desc: '全文与向量混合检索、重排、问题改写与对话补全，答案附带引用来源。' }),
            leaf('reason', '推理分析服务', { type: 'flow', flowKey: 'reason', desc: '支持溯源、推理、关联、时序、时空分析，推理链路完成取数、裁剪与上下文拼装，并输出结构化结果。' }),
          ]),
          g('dkg-g', '领域知识组织', 'graph', [
            leaf('onto', '图谱本体配置', crud('自定义图谱本体，配置核心概念与关系类型。', 'ontology')),
            leaf('dkg', '知识抽取与融合', { type: 'graph', graphKey: 'resume', desc: '接入量化系统数据，调用资源库图谱工具，自定义本体并融合为统一实体库与关系网络。' }),
            leaf('entity-lib', '统一实体库', crud('管理领域统一实体，支持实体合并、别名维护与属性补全。', 'entities')),
          ]),
          g('train-g', '训练数据生成', 'train', [
            leaf('qa-gen', '问答数据生成', { type: 'entry', entryKey: 'qaGen', desc: '基于领域知识自动生成问答训练数据对，支持质量审核与批量导出。', dataset: 'indicators' }),
            leaf('train-sets', '训练数据集管理', crud('管理生成的训练数据集，支持版本控制、筛选与导出。', 'trainSets')),
          ]),
        ],
      },
    ],
  },
  {
    id: 'probe',
    group: 'app',
    no: '02',
    name: '探针设计与智能定位平台',
    brief: '基于试验探针与推理图谱，实现试验数据融合监测、异常定位与智能根因分析，输出结构化解读报告',
    tags: ['探针管理', '融合监测', '根因分析', '智能报告'],
    icon: 'target',
    iconFile: '/icons/p2-probe.svg',
    systems: [
      // ── 系统一：增量式智能探针推理图谱构建 ──────────────────────────
      {
        id: 'probe-build',
        name: '增量式智能探针推理图谱构建',
        full: '增量式智能探针推理图谱构建系统',
        menus: [
          leaf('probe-home', '首页', home(
            '欢迎使用 探针设计与智能定位平台',
            '基于试验探针与推理图谱，实现试验数据融合监测、异常定位与智能根因分析，输出结构化解读报告。',
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
          g('probe-mgmt', '探针管理', 'probe', [
            leaf('probe-list', '探针配置管理', {
              type: 'm14',
              desc: '管理 12 个监测探针的参数配置与启用状态，判据全部引自指标树 V1.0，支持探针创建、编辑与批量启用。',
            }),
          ]),
          g('pgraph-g', '推理图谱', 'graph', [
            leaf('graph-view', '推理图谱', { type: 'graph', graphKey: 'probe', desc: '展示问题、数据、原因、措施之间的标准化关系。' }),
            leaf('dedup', '去重与优化', crud('识别重复实体和冗余关系，优化结构并评估检索效率。', 'entities')),
            leaf('expert-edit', '专家修订', crud('专家编辑实体与关系，补充经验知识。', 'events')),
            leaf('incr', '增量更新', crud('识别变化、执行增量并校验质量，同步探针参考数据。', 'syncTasks')),
          ]),
        ],
      },
      // ── 系统二：多模态试验鉴定体系知识发现 ──────────────────────────
      {
        id: 'probe-discover',
        name: '多模态试验鉴定体系知识发现',
        full: '多模态试验鉴定体系知识发现系统',
        menus: [
          g('data-link', '数据对接任务', 'signal', [
            leaf('shot-list', '数据对接任务', {
              type: 'm15',
              desc: '以对接任务方式回传试验数据入库，支持弹道测量、遥测文件接入；启动智能检测后探针逐项扫描，告警精确到发次。',
            }),
          ]),
          g('algo-g', '语义解析', 'parse', [
            leaf('algo', '解析算法', crud('分词、实体识别、语义标注、关系抽取与特征嵌入，提升处理效率与准确性。', 'algorithms')),
          ]),
          g('trial-g', '数据检索', 'search', [
            leaf('trial', '试验数据检索', crud('按数据类型、时间、关键词、试验场景检索，支持导出和向第三方对接。', 'trialData')),
          ]),
        ],
      },
      // ── 系统三：探针数据智能解读 ──────────────────────────────────────
      {
        id: 'probe-interpret',
        name: '探针数据智能解读',
        full: '探针数据智能解读系统',
        menus: [
          g('analysis', '根因分析', 'brain', [
            leaf('cause-list', '根因分析工作台', {
              type: 'm19',
              desc: '基于探针推理图谱自动推理，给出候选根因与置信度排序；思维链四层展示推理依据；证据面板列明每条结论的原始出处。',
            }),
          ]),
          g('viz-g', '可视化分析', 'chart', [
            leaf('viz', '可视化分析', { type: 'stats', statsKey: 'probe', desc: '分析历史探针问题的成因与趋势。' }),
          ]),
          g('report-g', '解读报告', 'doc', [
            leaf('report-list', '智能解读报告', {
              type: 'm22',
              desc: '分析结论一键固化为解读报告，五节自动装配，图表数据来自本次分析真实产物，归档标记"待试验后引用"。',
            }),
          ]),
          g('locate-g', '探针定位', 'target', [
            leaf('chain', '推理思维链', { type: 'flow', flowKey: 'probe', desc: '展示问题排查的推理过程和依据，帮助试验人员理解异常节点逻辑。' }),
            leaf('out', '异常定位成果', crud('输出异常指标、异常节点和合规潜在风险。性能指标、指标值、试验结果等实体识别准确率不低于 80%。', 'indicators')),
          ]),
        ],
      },
      // ── 原有系统（保留完整功能目录）─────────────────────────────────
      {
        id: 'discover',
        name: '多模态知识发现',
        full: '多模态试验鉴定体系知识发现系统',
        menus: [
          leaf('home', '首页', home(
            '欢迎使用 多模态试验鉴定体系知识发现系统',
            '与数据智能再造平台、领域资源库打通，接入解析、去噪、对齐等预处理，完成多模态分词、实体识别、语义标注和关联匹配。',
            [
              { name: '数据对接', to: 'sync', desc: '实时 / 定时 / 增量' },
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
          leaf('sync', '数据对接任务', crud('跨资源库与业务智能体对接，支持实时、定时同步和增量更新。', 'syncTasks')),
          leaf('algo', '解析算法', crud('分词、实体识别、语义标注、关系抽取与特征嵌入，提升处理效率与准确性。', 'algorithms')),
          leaf('trial', '试验数据检索', crud('按数据类型、时间、关键词、试验场景检索，支持导出和向第三方对接。', 'trialData')),
        ],
      },
      {
        id: 'pgraph',
        name: '探针推理图谱',
        full: '增量式智能探针推理图谱构建系统',
        menus: [
          leaf('home', '首页', home(
            '欢迎使用 增量式智能探针推理图谱构建系统',
            '把问题描述、试验数据、事件时间、原因、处置和专家经验转为实体、关系与属性，形成探针定位的标准化参考。',
            [
              { name: '探针配置', to: 'probes', desc: '范围与定位维度' },
              { name: '图谱构建', to: 'graph', desc: '垂域图库 + 大模型' },
              { name: '去重优化', to: 'dedup', desc: '重复实体与冗余关系' },
              { name: '专家修订', to: 'edit', desc: '补充与修正' },
              { name: '增量更新', to: 'incr', desc: '参考数据保持时效' },
            ],
            [
              { label: '在用探针', value: '12', unit: '个' },
              { label: '图谱实体', value: '6,420', unit: '个' },
              { label: '本周增量', value: '186', unit: '条' },
              { label: '去重合并', value: '43', unit: '组' },
            ],
          )),
          leaf('probes', '探针管理', crud('配置应用范围与定位维度，支持新增、编辑、删除。探针数量不少于 10 个。', 'probes')),
          leaf('graph', '推理图谱', { type: 'graph', graphKey: 'probe', desc: '展示问题、数据、原因、措施之间的标准化关系。' }),
          leaf('dedup', '去重与优化', crud('识别重复实体和冗余关系，优化结构并评估检索效率。', 'entities')),
          leaf('edit', '专家修订', crud('专家编辑实体与关系，补充经验知识。', 'events')),
          leaf('incr', '增量更新', crud('识别变化、执行增量并校验质量，同步探针参考数据。', 'syncTasks')),
        ],
      },
      {
        id: 'read',
        name: '探针智能解读',
        full: '探针数据智能解读系统',
        menus: [
          leaf('home', '首页', home(
            '欢迎使用 探针数据智能解读系统',
            '结合历史探针、试验数据和专家经验，对异常数据做根因推理，生成可编辑、可导出的标准化解读报告。',
            [
              { name: '根因分析', to: 'cause', desc: '异常与历史探针对照' },
              { name: '趋势可视化', to: 'viz', desc: '成因与趋势' },
              { name: '解读报告', to: 'rpt', desc: '生成、编辑、导出' },
            ],
            [
              { label: '异常事件', value: '27', unit: '条' },
              { label: '已出具报告', value: '19', unit: '份' },
              { label: '根因采纳率', value: '82', unit: '%' },
              { label: '平均响应', value: '2.4', unit: 's' },
            ],
          )),
          leaf('cause', '异常根因分析', { type: 'chat', chatKey: 'cause', desc: '针对异常数据检索图谱中的历史探针、试验数据与专家经验，生成解决方案。' }),
          leaf('viz', '可视化分析', { type: 'stats', statsKey: 'probe', desc: '分析历史探针问题的成因与趋势。' }),
          leaf('rpt', '解读报告', { type: 'report', reportKey: 'probe', desc: '按锁定的异常数据生成标准化解读报告，支持编辑与导出。' }),
        ],
      },
      {
        id: 'locate',
        name: '智能探针定位',
        full: '农业机械试验鉴定智能探针定位系统',
        menus: [
          leaf('home', '首页', home(
            '欢迎使用 农业机械试验鉴定智能探针定位系统',
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
          leaf('chain', '推理思维链', { type: 'flow', flowKey: 'probe', desc: '展示问题排查的推理过程和依据，帮助试验人员理解异常节点逻辑。' }),
          leaf('out', '异常定位成果', crud('输出异常指标、异常节点和合规潜在风险。性能指标、指标值、试验结果等实体识别准确率不低于 80%。', 'indicators')),
        ],
      },
    ],
  },
  {
    id: 'design',
    group: 'app',
    no: '03',
    name: '智能试验设计与资源推荐平台',
    brief: '大模型辅助试验方案设计，智能匹配设备、场地、仪器等试验资源',
    tags: ['方案生成', '资源推荐', '编码辅助'],
    icon: 'flow',
    iconFile: '/icons/p3-design.svg',
    systems: [
      {
        id: 'scheme',
        name: '试验方案设计',
        full: '试验方案智能设计系统',
        menus: [
          leaf('home', '首页', home(
            '欢迎使用 试验方案智能设计系统',
            '结合历史案例、资源条件与标准模板生成方案初稿，支持入库、版本管理和多轮自然语言校核。试验因子数量可不少于 20 个。',
            [
              { name: '方案生成', to: 'gen', desc: '案例 + 模板 + 资源' },
              { name: '案例入库', to: 'cases', desc: '检索与查阅' },
              { name: '模板库', to: 'tpl', desc: '上传、更新、删除' },
              { name: '多轮优化', to: 'chat', desc: '补充关键词与思路' },
            ],
            [
              { label: '方案', value: '86', unit: '份' },
              { label: '历史案例', value: '240', unit: '个' },
              { label: '标准模板', value: '18', unit: '套' },
              { label: '最大因子数', value: '24', unit: '个' },
            ],
          )),
          leaf('gen', '试验方案辅助生成', { type: 'm08', desc: '生成新方案初稿并支持人工编辑。当前示例方案包含 24 个试验因子。' }),
          leaf('cases', '案例与资源库', crud('历史试验案例与试验资源的入库、关键词检索和多条件查阅。', 'cases')),
          leaf('ver', '版本管理', crud('案例与资源版本管理，历史版本可在线查看。', 'schemes')),
          leaf('tpl', '标准模板库', crud('管理资源库中的试验方案模板，支持上传、更新与删除。', 'schemeTpls')),
          leaf('chat', '多轮校核优化', { type: 'chat', chatKey: 'scheme', desc: '通过多轮对话补充关键词和设计思路，持续校核方案合理性。' }),
        ],
      },
      {
        id: 'code',
        name: '数字试验编码',
        full: '数字试验编码生成系统',
        menus: [
          leaf('home', '首页', home(
            '欢迎使用 数字试验编码生成系统',
            '基于编码大模型生成 Python、C++、MATLAB 代码，支持语法与逻辑纠错、多轮优化和规范注释。',
            [
              { name: '代码生成', to: 'gen', desc: '不少于 3 种语言' },
              { name: '纠错优化', to: 'fix', desc: '语法与逻辑' },
              { name: '注释生成', to: 'note', desc: '函数、参数、逻辑' },
            ],
            [
              { label: '编码任务', value: '64', unit: '个' },
              { label: '支持语言', value: '3', unit: '种' },
              { label: '纠错采纳', value: '77', unit: '%' },
              { label: '已注释函数', value: '210', unit: '个' },
            ],
          )),
          leaf('gen', '代码生成', { type: 'code', desc: '按试验编码需求生成 Python、C++、MATLAB 代码并管理成果。' }),
          leaf('fix', '纠错优化', { type: 'chat', chatKey: 'code', desc: '识别语法错误和逻辑漏洞，给出纠错建议，支持多轮对话优化。' }),
          leaf('note', '注释生成', crud('自动补充函数说明、参数含义和执行逻辑，提升可读性。', 'codes')),
        ],
      },
      {
        id: 'cluster',
        name: '资源表征聚类',
        full: '试验资源表征与聚类系统',
        menus: [
          leaf('home', '首页', home(
            '欢迎使用 试验资源表征与聚类系统',
            '从历史试验文档、图表和图像中提取设备与参数，完成结构化、向量化、知识图谱和自动聚类，并支持迭代校验。',
            [
              { name: '资源提取', to: 'res', desc: '含图像 OCR' },
              { name: '结构化', to: 'res', desc: '设备与参数' },
              { name: '向量与图谱', to: 'graph', desc: '资源关系网络' },
              { name: '聚类维护', to: 'res', desc: '属性、用途、规格' },
            ],
            [
              { label: '资源条目', value: '1,120', unit: '条' },
              { label: '聚类类别', value: '16', unit: '类' },
              { label: '图像OCR准确率', value: '76.4', unit: '%' },
              { label: '向量维度', value: '1024', unit: '维' },
            ],
          )),
          leaf('res', '资源提取与维护', crud('识别文本、图表、图像中的试验资源。图像提供 OCR。支持更新、删除和校验。', 'testRes')),
          leaf('graph', '资源知识图谱', { type: 'graph', graphKey: 'resource', desc: '结构化资源映射为实体和关系，形成历史试验资源图谱。' }),
          leaf('vec', '向量数据库', crud('资源向量化解析并构建向量库。', 'vecChunks')),
        ],
      },
      {
        id: 'match',
        name: '资源匹配推荐',
        full: '试验资源任务匹配与智能推荐系统',
        menus: [
          leaf('home', '首页', home(
            '欢迎使用 试验资源任务匹配与智能推荐系统',
            '面向新试验任务计算与历史资源的特征相似度，至少使用两类算法，并以图文和列表展示设备、方案和农机参数，支持多轮交互与案例溯源。',
            [
              { name: '相似度匹配', to: 'rec', desc: '余弦 / 欧氏等' },
              { name: '结果展示', to: 'rec', desc: '图文与列表' },
              { name: '多轮交互', to: 'chat', desc: '收敛推荐条件' },
              { name: '案例溯源', to: 'rec', desc: '方案与参数' },
            ],
            [
              { label: '推荐任务', value: '58', unit: '个' },
              { label: '相似度算法', value: '3', unit: '类' },
              { label: '平均采纳率', value: '71', unit: '%' },
              { label: '可溯源案例', value: '240', unit: '个' },
            ],
          )),
          leaf('rec', '匹配推荐', { type: 'm11', desc: '对比历史资源的设备、操作参数等详细信息。算法包含余弦相似度、欧氏距离和加权杰卡德。' }),
          leaf('chat', '多轮交互推荐', { type: 'chat', chatKey: 'recommend', desc: '用自然语言补充约束，提高匹配准确性。' }),
        ],
      },
      {
        id: 'sample',
        name: '样本智能分析',
        full: '试验数据智能分析系统',
        menus: [
          leaf('home', '首页', home(
            '欢迎使用 试验数据智能分析系统',
            '对试验参数进行智能研判，发现样本偏差过大或数量不足，并利用大模型补全缺失、消除噪声。',
            [
              { name: '样本研判', to: 'ana', desc: '偏差与数量' },
              { name: '数据增强', to: 'ana', desc: '补全与去噪' },
            ],
            [
              { label: '样本集', value: '73', unit: '个' },
              { label: '偏差预警', value: '9', unit: '个' },
              { label: '已补全字段', value: '146', unit: '个' },
              { label: '待人工核验', value: '11', unit: '个' },
            ],
          )),
          leaf('ana', '样本分析与增强', crud('快速分析样本偏差和数量，对缺失数据补全、对噪声消除，并校验增强结果。', 'samples')),
        ],
      },
    ],
  },
  {
    id: 'doc',
    group: 'app',
    no: '04',
    name: '领域文档自动编写与审校平台',
    brief: '领域文档自动编写，规则化智能审校与跨文档比对，评审报告一键生成',
    tags: ['规则审查', '模板库', '评审报告'],
    icon: 'doc',
    iconFile: '/icons/p4-doc.svg',
    systems: [
      {
        id: 'collect',
        name: '某型装备领域文档归集系统',
        full: '某型装备领域文档归集系统',
        menus: buildDocMenus('collect', '某型装备领域文档归集系统'),
      },
      {
        id: 'write',
        name: '某型装备试验文档设计系统',
        full: '某型装备试验文档设计系统',
        menus: buildDocMenus('write', '某型装备试验文档设计系统'),
      },
      {
        id: 'review',
        name: '领域文档核文勘误与逻辑审查系统',
        full: '领域文档核文勘误与逻辑审查系统',
        menus: buildDocMenus('review', '领域文档核文勘误与逻辑审查系统'),
      },
      {
        id: 'report',
        name: '试验评审报告智能生成系统',
        full: '试验评审报告智能生成系统',
        menus: buildDocMenus('report', '试验评审报告智能生成系统'),
      },
    ],
  },
  {
    id: 'insight',
    group: 'app',
    no: '05',
    name: '试验鉴定领域知识深度挖掘与技术研判平台',
    brief: '文献创新点深度挖掘与聚类分析，支撑技术趋势研判与查新查重',
    tags: ['创新挖掘', '聚类分析', '技术研判'],
    icon: 'graph',
    iconFile: '/icons/p5-insight.svg',
    systems: [
      {
        id: 'innov',
        name: '创新点抽取',
        full: '试验鉴定技术创新点智能抽取系统',
        menus: [
          leaf('home', '首页', home(
            '欢迎使用 试验鉴定技术创新点智能抽取系统',
            '收录试验论文、课题成果和技术鉴定文件，完成长上下文理解、指代消解和创新点结构化抽取，输出标准 JSON。',
            [
              { name: '文献收录', to: 'papers', desc: 'PDF / Word 清洗' },
              { name: '区域定位', to: 'papers', desc: '问题、方案、效果' },
              { name: '创新抽取', to: 'points', desc: '主体、动作、细节' },
              { name: 'JSON 输出', to: 'json', desc: '供后续分析' },
            ],
            [
              { label: '收录文献', value: '1,860', unit: '篇' },
              { label: '创新点', value: '4,320', unit: '条' },
              { label: '已标注', value: '3,905', unit: '条' },
              { label: 'JSON 成果', value: '3,640', unit: '份' },
            ],
          )),
          leaf('papers', '科技文献收录', crud('多格式接入、OCR、版式还原和分类收录。', 'papers')),
          leaf('points', '创新点抽取标注', {
            type: 'm29',
            desc: '从326篇科技文献（含归档试验报告V2）中抽取58个技术创新点，每个创新点含四要素及原文页码溯源。',
          }),
          leaf('json', '标准 JSON', { type: 'code', codeKey: 'json', desc: '将抽取结果生成可校验的 JSON，支撑聚类与研判。' }),
        ],
      },
      {
        id: 'cluster',
        name: '聚类分类',
        full: '试验鉴定技术创新点聚类分类系统',
        menus: [
          leaf('home', '首页', home(
            '欢迎使用 试验鉴定技术创新点聚类分类系统',
            '对创新点做向量化与余弦相似度分析，采用 K-Means、词共现和层次聚类自动分类，并构建三级技术体系图谱。',
            [
              { name: '向量表征', to: 'sim', desc: '语义计算基础' },
              { name: '多算法聚类', to: 'sim', desc: '不少于 3 种方法' },
              { name: '三级体系', to: 'tree', desc: '原理 / 类型 / 领域' },
              { name: '体系图谱', to: 'graph', desc: '关系可视化' },
            ],
            [
              { label: '向量创新点', value: '4,320', unit: '条' },
              { label: '聚类簇', value: '36', unit: '个' },
              { label: '技术体系', value: '3', unit: '级' },
              { label: '图谱节点规模', value: '12,480', unit: '个' },
            ],
          )),
          leaf('sim', '相似度与聚类', crud('融合技术标签、场景标识、应用领域，计算余弦相似度并自动分类、关联文献。', 'innovations')),
          leaf('tree', '三级技术体系', { type: 'report', reportKey: 'tree', desc: '按技术原理、试验类型、应用领域生成三级架构。' }),
          leaf('graph', '技术体系图谱', { type: 'm30', desc: '三级技术体系树（1领域→6二级→18三级）+ SVG图谱画布，温补技术节点下挂本次试验沉淀案例。' }),
        ],
      },
      {
        id: 'judge',
        name: '技术研判',
        full: '试验鉴定技术研判系统',
        menus: [
          leaf('home', '首页', home(
            '欢迎使用 试验鉴定技术研判系统',
            '按任务类型、农业分类和决策层级匹配研判模板，自动组装成熟度、趋势、优先级、技术路径和高价值方向，并支持项目查重。',
            [
              { name: '模板配置', to: 'tpl', desc: '章节与样式' },
              { name: '报告生成', to: 'rpt', desc: '图表与摘要' },
              { name: '项目查重', to: 'dup', desc: '不少于 6 个维度' },
              { name: '结论导出', to: 'dup', desc: '可溯源立项文件' },
            ],
            [
              { label: '研判模板', value: '14', unit: '套' },
              { label: '研判报告', value: '67', unit: '份' },
              { label: '查重维度', value: '8', unit: '个' },
              { label: '高相似预警', value: '6', unit: '项' },
            ],
          )),
          leaf('tpl', '模板管理配置', { type: 'cards', cardKey: 'judgeTpl', desc: '维护技术领域、试验类型、应用场景、成熟度、趋势和高价值方向等板块，支持自动推荐。' }),
          leaf('rpt', '技术研判报告生成', { type: 'm31', desc: '三栏布局（模板+对象+报告列表），报告预览页含ECharts图表与麦金色高亮建议块。' }),
          leaf('dup', '查重与相似度', crud('从项目名称、目标、内容、技术路线、创新点、指标、预期成果、应用场景八个维度查重，并溯源立项文件。', 'dupChecks')),
        ],
      },
    ],
  },
  {
    id: 'cockpit',
    group: 'infra',
    no: 'A0',
    name: '管理端总览驾驶舱',
    brief: '三大底座平台运行状态总览',
    tags: ['管理端', '训推', '编排', '资源库'],
    icon: 'chart',
    systems: [
      {
        id: 'cockpit-main',
        name: '管理端',
        full: '管理端总览驾驶舱',
        menus: [
          leaf('home', '管理端入口', {
            type: 'm32',
            stage: 'home',
            desc: '三大底座平台入口总览。',
          }),
        ],
      },
    ],
  },
  {
    id: 'resource',
    group: 'infra',
    no: 'A1',
    name: '农业机械试验鉴定领域资源库',
    brief: '原始库、基础库、推理库三级资源，为五大应用和智能体提供可追溯的数据支撑',
    tags: ['汇聚治理', '知识图谱', '智能问答'],
    icon: 'book',
    systems: [
      {
        id: 'ingest',
        name: '数据汇聚治理',
        full: '多源异构数据汇聚与治理',
        menus: [
          leaf('home', '首页', home(
            '欢迎使用 农业机械试验鉴定领域资源库',
            '统一采集定型资料、试验鉴定数据、标准规范和专业文献，完成去噪、标注和结构化，形成原始库、结构化基础库、推理知识库。',
            [
              { name: '汇聚入库', to: 'in', desc: '格式识别与标准化' },
              { name: '智能治理', to: 'gov', desc: '清洗、去噪、解析' },
              { name: '人工审核', to: 'audit', desc: '原文溯源校验' },
              { name: '三级库', to: 'layers', desc: '原始 / 基础 / 推理' },
            ],
            [
              { label: '存储容量', value: '12.6', unit: 'TB' },
              { label: '知识库', value: '1,086', unit: '个' },
              { label: '同时在用库', value: '186', unit: '个' },
              { label: '单库最大文档', value: '12,400', unit: '篇' },
            ],
          )),
          leaf('in', '汇聚接入', crud('定型原始资料、试验数据、标准规范、专业文献统一采集入库。', 'resources')),
          leaf('gov', '多模态治理', crud('文本、图像、表格清洗去噪、标注和结构化解析，并可按统一接口调用开源标注清洗工具。', 'parseTasks')),
          leaf('audit', '治理审核', { type: 'workbench', desc: '人工审核治理与图谱结果，通过原文溯源辅助校验。' }),
          leaf('layers', '三级数据资源', { type: 'cards', cardKey: 'layers', desc: '原始库、结构化基础库、推理知识库分层组织，支持多层级关联与全链路追溯。' }),
        ],
      },
      {
        id: 'kg',
        name: '知识图谱分类',
        full: '业务知识图谱与领域分类',
        menus: [
          leaf('home', '首页', home(
            '知识图谱与领域分类',
            '自定义图谱本体并自动构建业务图谱。初始分类覆盖领域通识、定型资料、作战运用、试验鉴定研究成果、试验资料，新数据按分类描述自动入库。',
            [
              { name: '图谱构建', to: 'graph', desc: '本体驱动' },
              { name: '领域分类', to: 'cls', desc: '五类专业知识' },
              { name: '智能检索', to: 'search', desc: '模态、标签、语义、图谱' },
            ],
            [
              { label: '图谱节点', value: '12,480', unit: '个' },
              { label: '万级召回', value: '3.6', unit: 's' },
              { label: '常见问题准确率', value: '86', unit: '%' },
              { label: '文档库召回', value: '4.2', unit: 's' },
            ],
          )),
          leaf('graph', '业务知识图谱', { type: 'graph', graphKey: 'resume', desc: '语义关联网络化展示，支持可视化管理。' }),
          leaf('cls', '领域知识分类', crud('维护分类及定义描述，驱动大模型对新数据自动分类。', 'categories')),
          leaf('search', '多维知识检索', crud('按模态、分类标签、内容语义和图谱信息检索、推荐与推送。', 'resources')),
          leaf('api', '统一数据接口', { type: 'report', reportKey: 'api', desc: '按规范提供高精度知识参考数据，支撑各智能体调用。' }),
        ],
      },
      {
        id: 'qa',
        name: '检索问答',
        full: '多模态解析与智能问答',
        menus: [
          leaf('home', '首页', home(
            '多模态知识检索与智能问答',
            '解析文字、图片、音视频并向量检索，以问答融合呈现。支持历史问题编辑、重新问答、轨迹保留和版本比对。上下文记忆不少于 5000 字符。',
            [
              { name: '智能问答', to: 'chat', desc: '多模态融合呈现' },
              { name: '历史修正', to: 'chat', desc: '编辑后重新问答' },
              { name: '轨迹回溯', to: 'trace', desc: '版本比对' },
            ],
            [
              { label: '历史对话检索', value: '1.8', unit: 's' },
              { label: '常见问题', value: '1.2', unit: 's' },
              { label: '上下文记忆', value: '5,000', unit: '字' },
              { label: '问答准确率', value: '86', unit: '%' },
            ],
          )),
          leaf('chat', '智能问答', { type: 'chat', chatKey: 'kb', desc: '检索增强问答，文字、图片和音视频片段融合呈现，答案可复制复用。' }),
          leaf('trace', '对话轨迹', { type: 'timeline', desc: '保留对话轨迹，支持版本差异比对和回溯。' }),
          leaf('qa-lib', 'QA 库', crud('CSV / JSON 批量上传、编辑、检索和回流审核。', 'qa')),
        ],
      },
      {
        id: 'ops',
        name: '知识库运营',
        full: '个人团队知识库与运营管理',
        menus: [
          leaf('home', '首页', home(
            '资源库运营管理',
            '支持个人 / 团队知识库、批量导入、权限隔离和版本控制，以及用户、部门、对话、服务状态和许可证全生命周期管理。',
            [
              { name: '知识库', to: 'kb', desc: '个人与团队' },
              { name: '标准文档', to: 'std', desc: '总案、大纲、报告' },
              { name: '用户许可', to: 'ops', desc: '组织与许可证' },
            ],
            [
              { label: '用户', value: '326', unit: '人' },
              { label: '部门', value: '18', unit: '个' },
              { label: '在线服务', value: '正常', unit: '' },
              { label: '许可证', value: '有效', unit: '' },
            ],
          )),
          leaf('kb', '个人与团队知识库', crud('后台批量导入、权限分配、数据隔离与版本控制。', 'kb')),
          leaf('std', '试验文档标准化', crud('试验总案、大纲、报告的标准化存储和关联管理。', 'stdDocs')),
          leaf('ops', '用户与许可证', crud('用户、部门、对话、服务监控，以及许可证登记、激活、续期、变更和终止。', 'licenses')),
        ],
      },
    ],
  },
  {
    id: 'train',
    group: 'infra',
    no: 'A2',
    name: '试验鉴定领域大模型训推平台',
    brief: '支撑 3 类以上、参数量不小于 32B 的领域大模型微调、评估、量化与部署',
    tags: ['预训练', '微调', '评估部署'],
    icon: 'model',
    systems: [
      {
        id: 'pretrain',
        name: '专域预训练',
        full: '试验鉴定专域预训练系统',
        menus: [
          leaf('home', '首页', home(
            '欢迎使用 试验鉴定专域预训练系统',
            '管理本地训练数据，完成清洗、知识提炼和结构化打包，生成微调数据配置，并管理部门推理任务与标签。',
            [
              { name: '数据集', to: 'sets', desc: '上传与预览' },
              { name: '清洗打包', to: 'sets', desc: '多格式训练数据' },
              { name: '微调数据', to: 'sft', desc: '自动标签' },
              { name: '推理任务', to: 'infer', desc: '标签筛选' },
            ],
            [
              { label: '源数据集', value: '42', unit: '个' },
              { label: '问答对', value: '86,000', unit: '条' },
              { label: '训练任务', value: '9', unit: '个' },
              { label: '支持格式', value: '11', unit: '种' },
            ],
          )),
          leaf('sets', '源数据集', crud('支持 txt、doc、docx、pdf、json、csv、xlsx、markdown、png、jpg、jpeg。可重命名、筛选删除，并查看关联训练任务。', 'trainSets')),
          leaf('preview', '双视图预览', { type: 'workbench', desc: '同时预览解析后文件和原文档。' }),
          leaf('sft', '微调数据集', { type: 'entry', entryKey: 'sft', desc: '配置任务名称、源数据集、参数、需求描述和自动标签，生成领域微调数据。', dataset: 'trainSets' }),
          leaf('param', '训练参数', { type: 'cards', cardKey: 'trainParam', desc: '提供默认配置和手动配置，可设置训练集与测试集比例。' }),
          leaf('infer', '历史推理任务', crud('展示任务名、时间、状态、创建人、可见成员、来源和审核进度。标签不超过 10 字且不含特殊符号，支持多选筛选。', 'inferTasks')),
        ],
      },
      {
        id: 'conf',
        name: '置信度评估',
        full: '试验鉴定领域大模型置信度评估系统',
        menus: [
          leaf('home', '首页', home(
            '欢迎使用 大模型置信度评估系统',
            '综合推理过程可视化、同题多次采样、多模型概率分布和人工校核，计算加权置信度，并识别业务强弱项。',
            [
              { name: '多方法评估', to: 'score', desc: '采样、集成、一致性' },
              { name: '加权综合', to: 'score', desc: '图表与报告' },
              { name: '强弱项', to: 'score', desc: '按鉴定场景对比' },
            ],
            [
              { label: '评估任务', value: '28', unit: '个' },
              { label: '最高综合分', value: '0.89', unit: '' },
              { label: '参评模型', value: '3', unit: '个' },
              { label: '人工校核', value: '640', unit: '条' },
            ],
          )),
          leaf('score', '置信度评估', crud('覆盖多模型集成准确率、上下文一致性等指标，并以图表展示。', 'confidence')),
        ],
      },
      {
        id: 'lora',
        name: '知识微调',
        full: '细粒度试验鉴定知识微调系统',
        menus: [
          leaf('home', '首页', home(
            '欢迎使用 细粒度试验鉴定知识微调系统',
            '以 LoRA 注入领域专家知识。至少支撑 3 类、参数量不小于 32B 的基座微调，可预估耗时并一键启动。',
            [
              { name: '知识注入', to: 'jobs', desc: '结构化样本' },
              { name: '过程监控', to: 'jobs', desc: '动态调整策略' },
              { name: 'LoRA 配置', to: 'jobs', desc: '轮次、学习率、批大小' },
              { name: '一键启动', to: 'jobs', desc: '增量微调' },
            ],
            [
              { label: '基座类型', value: '3', unit: '类' },
              { label: '最大参数量', value: '32', unit: 'B' },
              { label: '运行任务', value: '1', unit: '个' },
              { label: '框架', value: 'LoRA', unit: '' },
            ],
          )),
          leaf('jobs', '微调任务', crud('配置迭代轮次、学习率、批处理大小，跟踪性能并动态调整策略。', 'loraJobs')),
        ],
      },
      {
        id: 'mgr',
        name: '模型管理',
        full: '试验鉴定大模型管理系统',
        menus: [
          leaf('home', '首页', home(
            '欢迎使用 试验鉴定大模型管理系统',
            '覆盖训练、评估、发版、部署、下线。统一管理开源基座与微调模型，支持 vLLM，兼容 Qwen、GLM。',
            [
              { name: '生命周期', to: 'models', desc: '版本、回滚、切换' },
              { name: '部署调试', to: 'models', desc: 'vLLM 在线调试' },
              { name: '标准接口', to: 'api', desc: '按业务选用模型' },
            ],
            [
              { label: '纳管模型', value: '8', unit: '个' },
              { label: '在线服务', value: '3', unit: '个' },
              { label: '32B 加载', value: '4.2', unit: 'min' },
              { label: '服务启动', value: '78', unit: 's' },
            ],
          )),
          leaf('models', '模型目录', crud('检索、筛选、详情、部署调度与在线调试。支持多版本存储、对比、回滚。', 'llmModels')),
          leaf('api', '管理接口', { type: 'report', reportKey: 'api', desc: '管理界面与标准化 API，供业务按需选用模型。' }),
        ],
      },
      {
        id: 'quant',
        name: '量化推理',
        full: '试验鉴定领域模型量化推理系统',
        menus: [
          leaf('home', '首页', home(
            '欢迎使用 模型量化推理系统',
            '按不同量化程度执行推理并横向对比质量。结合算力与质量要求推荐模型类型和量化程度。标准输入 256 token 时首 token ≤3 秒，单卡平均输出不少于 18 token/s。',
            [
              { name: '量化推理', to: 'cmp', desc: '选择量化程度' },
              { name: '质量对比', to: 'cmp', desc: '预制指标横向比' },
              { name: '适配推荐', to: 'cmp', desc: '算力与质量' },
            ],
            [
              { label: '首 token', value: '1.8', unit: 's' },
              { label: '输出速率', value: '22', unit: 'token/s' },
              { label: '量化档位', value: '3', unit: '档' },
              { label: '推荐档位', value: '8bit', unit: '' },
            ],
          )),
          leaf('cmp', '量化对比', crud('利用预制指标对比同一模型不同量化程度的生成质量。', 'quants')),
        ],
      },
      {
        id: 'prompt',
        name: '提示模板',
        full: '智能提示模版生成系统',
        menus: [
          leaf('home', '首页', home(
            '欢迎使用 智能提示模版生成系统',
            '按任务检索预制模板；无法满足时由提示词生成智能体生成新模板，标准化入库并持续优化。',
            [
              { name: '检索生成', to: 'lib', desc: '预制或即时生成' },
              { name: '入库复用', to: 'lib', desc: '分类存储' },
              { name: '反馈优化', to: 'chat', desc: '结合使用反馈' },
            ],
            [
              { label: '模板', value: '126', unit: '套' },
              { label: '分类', value: '8', unit: '类' },
              { label: '本月复用', value: '340', unit: '次' },
              { label: '新生成', value: '12', unit: '套' },
            ],
          )),
          leaf('lib', '模板库', crud('分类存储、检索复用和动态修改。', 'prompts')),
          leaf('chat', '模板生成', { type: 'chat', chatKey: 'prompt', desc: '描述任务后检索或生成针对性提示模板。' }),
        ],
      },
      {
        id: 'eval',
        name: '评估调试',
        full: '模型评估与调试',
        menus: [
          leaf('home', '首页', home(
            '欢迎使用 模型评估与调试',
            '预置 ROUGE、BLEU、BERTScore、Accuracy、F1，支持自定义指标、场景配置、评分榜单，以及温度、Top P、Top K 在线调试。',
            [
              { name: '指标体系', to: 'metrics', desc: '预置与自定义' },
              { name: '评估任务', to: 'board', desc: '场景与榜单' },
              { name: '在线调试', to: 'debug', desc: '温度 / Top P / Top K' },
            ],
            [
              { label: '预置指标', value: '5', unit: '项' },
              { label: '自定义指标', value: '6', unit: '项' },
              { label: '评估任务', value: '22', unit: '个' },
              { label: '在线模型', value: '3', unit: '个' },
            ],
          )),
          leaf('metrics', '评估指标', crud('管理名称、类型、适用领域、描述、API 和版本。修改后版本号自动更新，新增时校验必填项。', 'metrics')),
          leaf('board', '评分榜单', crud('搭建评估体系、配置场景、创建任务并展示榜单。', 'confidence')),
          leaf('debug', '在线调试', { type: 'chat', chatKey: 'debug', desc: '选择模型并调节温度、Top P、Top K 后查看生成结果。' }),
        ],
      },
    ],
  },
  {
    id: 'agent',
    group: 'infra',
    no: 'A3',
    name: '试验鉴定专用智能体自动化编排平台',
    brief: '以可视化编排组合知识库、大模型和工具，形成可发布、可监控的业务智能体',
    tags: ['工作流', '插件', '模块复用'],
    icon: 'plugin',
    systems: [
      {
        id: 'flow',
        name: '工作流编排',
        full: '试验鉴定领域智能体工作流编排平台',
        menus: [
          leaf('home', '首页', home(
            '欢迎使用 智能体工作流编排平台',
            '通过拖拽组合预置能力形成工作流。调度响应时延不超过 3 秒（不含网络时延），并发不少于 10。',
            [
              { name: '可视化编排', to: 'canvas', desc: '拖拽组合' },
              { name: '流程组件', to: 'canvas', desc: '不少于 14 个' },
              { name: '能力集成', to: 'integ', desc: '知识库、模型、插件' },
              { name: '运行监控', to: 'mon', desc: '状态与资源' },
            ],
            [
              { label: '工作流', value: '24', unit: '条' },
              { label: '流程组件', value: '14', unit: '个' },
              { label: '在线智能体', value: '6', unit: '个' },
              { label: '调度时延', value: '1.6', unit: 's' },
            ],
          )),
          leaf('canvas', '可视化编排', { type: 'canvas', canvasKey: 'agent', desc: '定义节点输入输出、类型校验、默认值和参数映射，支持单组件调试与日志。' }),
          leaf('integ', '能力集成封装', crud('同步知识库、切换大模型版本、接入工具，并以 API 组合封装训推平台能力。', 'agents')),
          leaf('mon', '服务监控', { type: 'stats', statsKey: 'agent', desc: '监控已发布智能体的服务状态、CPU、内存和网络。' }),
          leaf('perm', '权限控制', crud('按角色分配查看、编辑、执行、管理权限。', 'kb')),
        ],
      },
      {
        id: 'tool',
        name: '工具调用',
        full: '试验鉴定领域智能体工具调用平台',
        menus: [
          leaf('home', '首页', home(
            '欢迎使用 智能体工具调用平台',
            '将编排完成的工作流封装为智能体，管理上线、下线与调用说明，并以 Web 页面或接口向第三方集成。',
            [
              { name: '封装上线', to: 'agents', desc: '调用方式说明' },
              { name: '发布集成', to: 'agents', desc: '页面与接口' },
            ],
            [
              { label: '已发布', value: '6', unit: '个' },
              { label: '第三方集成', value: '4', unit: '个' },
              { label: '并发上限', value: '10', unit: '路' },
              { label: '调用成功率', value: '99.2', unit: '%' },
            ],
          )),
          leaf('agents', '智能体发布', crud('上线、下线、Web 集成、接口调用和集成后的启停、访问控制。', 'agents')),
        ],
      },
      {
        id: 'plugin',
        name: '插件扩展',
        full: '插件扩展平台',
        menus: [
          leaf('home', '首页', home(
            '欢迎使用 插件扩展平台',
            '支持 Python、Java 插件规范，兼容 MCP、HTTP、TCP，并可自定义协议适配。插件需注册、审核后上线。',
            [
              { name: '开发规范', to: 'list', desc: 'Python / Java' },
              { name: '协议适配', to: 'list', desc: 'MCP、HTTP、TCP' },
              { name: '审核上线', to: 'list', desc: '调试日志与权限' },
            ],
            [
              { label: '插件', value: '18', unit: '个' },
              { label: '已上线', value: '11', unit: '个' },
              { label: '待审核', value: '2', unit: '个' },
              { label: '协议', value: '3', unit: '类' },
            ],
          )),
          leaf('list', '插件管理', crud('注册、审核、上线、下线，查看调试日志和运行状态，设置可见范围与调用权限。', 'plugins')),
        ],
      },
      {
        id: 'module',
        name: '模块构建',
        full: '模块化应用构建平台',
        menus: [
          leaf('home', '首页', home(
            '欢迎使用 模块化应用构建平台',
            '把工作流封装为可复用模块，明确名称、描述、参数和返回值，支持嵌套调用和跨智能体参数映射。',
            [
              { name: '模块封装', to: 'mods', desc: '输入与返回' },
              { name: '嵌套调用', to: 'mods', desc: '跨智能体组合' },
            ],
            [
              { label: '可复用模块', value: '15', unit: '个' },
              { label: '嵌套调用', value: '7', unit: '条' },
              { label: '跨智能体', value: '4', unit: '条' },
              { label: '组合场景', value: '9', unit: '个' },
            ],
          )),
          leaf('mods', '模块目录', crud('配置模块信息与调用参数映射，验证复杂业务组合。', 'modules')),
        ],
      },
    ],
  },
]

export function getPlatform(id) {
  return platforms.find((p) => p.id === id)
}

export function appPlatforms() {
  return platforms.filter((p) => p.group === 'app')
}

export function infraPlatforms() {
  return platforms.filter((p) => p.group === 'infra')
}

export function firstLeaf(system) {
  for (const item of system.menus) {
    if (item.page) return item
    if (item.children?.length) return item.children[0]
  }
  return null
}

export function findMenu(platform, sid, mid) {
  const system = platform?.systems.find((s) => s.id === sid) || platform?.systems[0]
  if (!system) return {}
  let groupName = ''
  let menu = null
  for (const item of system.menus) {
    if (item.id === mid && item.page) {
      menu = item
      groupName = item.name
      break
    }
    if (item.children) {
      const child = item.children.find((c) => c.id === mid)
      if (child) {
        menu = child
        groupName = item.name
        break
      }
    }
  }
  if (!menu) {
    menu = firstLeaf(system)
    groupName = system.menus.find((m) => m.id === menu?.id || m.children?.some((c) => c.id === menu?.id))?.name || menu?.name
  }
  return { system, menu, groupName }
}
