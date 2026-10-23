import { cleanDocLabel, docPlatformModules } from '@/data/docPlatform'
import { rebuildSystems } from '@/data/rebuildMenus'
import { probeSystems } from '@/data/probeMenus'
import { designSystems } from '@/data/designMenus'
import { insightSystems } from '@/data/insightMenus'
import { ICON_POOL, uniquifySystemMenuIcons } from '@/utils/iconFor'

const g = (id, name, icon, children) => ({ id, name, icon, children })
const leaf = (id, name, page, icon) => (icon ? { id, name, page, icon } : { id, name, page })
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
  'write/outline-design/outline': { type: 'post-trial', stage: 'outline', module: 'M23', desc: '按性能鉴定试验报告模板整理 8 章提纲，供初稿装配使用。' },
  'write/knowledge-generate/draft': { type: 'post-trial', stage: 'compose', module: 'M24', desc: '报告生成向导：汇集指标树、30 发数据与第 19 发异常解读，一键装配《性能鉴定试验报告》初稿。' },
  'write/generation-trace/trace': { type: 'post-trial', stage: 'trace', module: 'M25', desc: '每项判定回到指标树、原始记录和第 19 发异常解读报告。' },
  'review/strategy-review/run': { type: 'post-trial', stage: 'review', module: 'M26 / M27', desc: '术语规范、数据勾稽、判据引用三类意见自动给出，点击即可定位原文。' },
  'review/review-result/issues': { type: 'post-trial', stage: 'review', entry: 'result', module: 'M27', desc: '术语规范、数据勾稽、判据引用三类意见自动给出，点击即可定位原文。' },
  'collect/doc-collect/document-type-archive': { type: 'post-trial', stage: 'archive', module: 'M28', desc: '确认后一键定稿归集，试验报告 V2 状态为已入库。' },
}

function docFeaturePage(systemId, module, feature) {
  if (`${systemId}/${module.id}/${feature.id}` === 'write/template-manage/template-custom-config') {
    return { type: 'template-config' }
  }
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
    ...modules.map((module, index) => g(
      module.id,
      cleanDocLabel(module.name),
      ICON_POOL[index + 1] || ICON_POOL[(index + 1) % ICON_POOL.length],
      module.features.map((feature) => leaf(
        feature.id,
        cleanDocLabel(feature.name),
        docFeaturePage(systemId, module, feature),
      )),
    )),
  ]
}

const platformsRaw = [
  {
    id: 'rebuild',
    group: 'app',
    no: '01',
    name: '定型资料数据智能再造平台',
    brief: '异构资料统一汇聚与结构化解析，关键指标定向抽取，构建履历知识图谱',
    tags: ['数据解析', '指标抽取', '履历图谱', '态势展示'],
    icon: 'book',
    iconFile: '/icons/p1-rebuild.svg',
    systems: rebuildSystems(),
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
    systems: probeSystems(),
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
    systems: designSystems(),
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
        name: '某型领域文档归集系统',
        full: '某型领域文档归集系统',
        menus: buildDocMenus('collect', '某型领域文档归集系统'),
      },
      {
        id: 'write',
        name: '某型试验文档设计系统',
        full: '某型试验文档设计系统',
        menus: buildDocMenus('write', '某型试验文档设计系统'),
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
    systems: insightSystems(),
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
          leaf('deviations', '正偏离能力汇总', {
            type: 'deviations',
            desc: '相对招标技术要求的正偏离能力清单，演示收尾指认用。',
          }, 'flag'),
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
          leaf('in', '汇聚接入', crud('定型原始资料、试验数据、标准规范、专业文献统一采集入库。', 'resources'), 'transfer'),
          leaf('gov', '多模态治理', crud('文本、图像、表格清洗去噪、标注和结构化解析，并可按统一接口调用开源标注清洗工具。', 'parseTasks'), 'clean'),
          leaf('audit', '治理审核', { type: 'workbench', desc: '人工审核治理与图谱结果，通过原文溯源辅助校验。' }, 'audit'),
          leaf('layers', '三级数据资源', { type: 'cards', cardKey: 'layers', desc: '原始库、结构化基础库、推理知识库分层组织，支持多层级关联与全链路追溯。' }, 'layers'),
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
          leaf('graph', '业务知识图谱', { type: 'graph', graphKey: 'resume', desc: '语义关联网络化展示，支持可视化管理。' }, 'graph'),
          leaf('cls', '领域知识分类', crud('维护分类及定义描述，驱动大模型对新数据自动分类。', 'categories'), 'cluster'),
          leaf('search', '多维知识检索', crud('按模态、分类标签、内容语义和图谱信息检索、推荐与推送。', 'resources'), 'search'),
          leaf('api', '统一数据接口', { type: 'report', reportKey: 'api', desc: '按规范提供高精度知识参考数据，支撑各智能体调用。' }, 'api'),
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
          leaf('chat', '智能问答', { type: 'chat', chatKey: 'kb', desc: '检索增强问答，文字、图片和音视频片段融合呈现，答案可复制复用。' }, 'chat'),
          leaf('trace', '对话轨迹', { type: 'timeline', desc: '保留对话轨迹，支持版本差异比对和回溯。' }, 'timeline'),
          leaf('qa-lib', 'QA 库', crud('CSV / JSON 批量上传、编辑、检索和回流审核。', 'qa'), 'database'),
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
          leaf('kb', '个人与团队知识库', crud('后台批量导入、权限分配、数据隔离与版本控制。', 'kb'), 'folder'),
          leaf('std', '试验文档标准化', crud('试验总案、大纲、报告的标准化存储和关联管理。', 'stdDocs'), 'book'),
          leaf('ops', '用户与许可证', crud('用户、部门、对话、服务监控，以及许可证登记、激活、续期、变更和终止。', 'licenses'), 'user'),
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
          leaf('sets', '源数据集', crud('支持 txt、doc、docx、pdf、json、csv、xlsx、markdown、png、jpg、jpeg。可重命名、筛选删除，并查看关联训练任务。', 'trainSets'), 'folder'),
          leaf('preview', '双视图预览', { type: 'workbench', desc: '同时预览解析后文件和原文档。' }, 'eye'),
          leaf('sft', '微调数据集', { type: 'entry', entryKey: 'sft', desc: '配置任务名称、源数据集、参数、需求描述和自动标签，生成领域微调数据。', dataset: 'trainSets' }, 'tag'),
          leaf('param', '训练参数', { type: 'cards', cardKey: 'trainParam', desc: '提供默认配置和手动配置，可设置训练集与测试集比例。' }, 'sliders'),
          leaf('infer', '历史推理任务', crud('展示任务名、时间、状态、创建人、可见成员、来源和审核进度。标签不超过 10 字且不含特殊符号，支持多选筛选。', 'inferTasks'), 'list'),
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
          leaf('score', '置信度评估', crud('覆盖多模型集成准确率、上下文一致性等指标，并以图表展示。', 'confidence'), 'chart'),
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
          leaf('jobs', '微调任务', crud('配置迭代轮次、学习率、批处理大小，跟踪性能并动态调整策略。', 'loraJobs'), 'train'),
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
          leaf('models', '模型目录', crud('检索、筛选、详情、部署调度与在线调试。支持多版本存储、对比、回滚。', 'llmModels'), 'model'),
          leaf('api', '管理接口', { type: 'report', reportKey: 'api', desc: '管理界面与标准化 API，供业务按需选用模型。' }, 'api'),
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
          leaf('cmp', '量化对比', crud('利用预制指标对比同一模型不同量化程度的生成质量。', 'quants'), 'compare'),
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
          leaf('lib', '模板库', crud('分类存储、检索复用和动态修改。', 'prompts'), 'book'),
          leaf('chat', '模板生成', { type: 'chat', chatKey: 'prompt', desc: '描述任务后检索或生成针对性提示模板。' }, 'spark'),
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
          leaf('metrics', '评估指标', crud('管理名称、类型、适用领域、描述、API 和版本。修改后版本号自动更新，新增时校验必填项。', 'metrics'), 'rule'),
          leaf('board', '评分榜单', crud('搭建评估体系、配置场景、创建任务并展示榜单。', 'confidence'), 'chart'),
          leaf('debug', '在线调试', { type: 'chat', chatKey: 'debug', desc: '选择模型并调节温度、Top P、Top K 后查看生成结果。' }, 'sliders'),
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
          leaf('canvas', '可视化编排', { type: 'canvas', canvasKey: 'agent', desc: '定义节点输入输出、类型校验、默认值和参数映射，支持单组件调试与日志。' }, 'flow'),
          leaf('integ', '能力集成封装', crud('同步知识库、切换大模型版本、接入工具，并以 API 组合封装训推平台能力。', 'agents'), 'plugin'),
          leaf('mon', '服务监控', { type: 'stats', statsKey: 'agent', desc: '监控已发布智能体的服务状态、CPU、内存和网络。' }, 'chart'),
          leaf('perm', '权限控制', crud('按角色分配查看、编辑、执行、管理权限。', 'kb'), 'shield'),
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
          leaf('agents', '智能体发布', crud('上线、下线、Web 集成、接口调用和集成后的启停、访问控制。', 'agents'), 'spark'),
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
          leaf('list', '插件管理', crud('注册、审核、上线、下线，查看调试日志和运行状态，设置可见范围与调用权限。', 'plugins'), 'plugin'),
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
          leaf('mods', '模块目录', crud('配置模块信息与调用参数映射，验证复杂业务组合。', 'modules'), 'box'),
        ],
      },
    ],
  },
]

export const platforms = platformsRaw.map((p) => ({
  ...p,
  systems: uniquifySystemMenuIcons(p.systems),
}))

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
