import { g, leaf, crud, home, reuse } from '@/data/menuKit'

export function rebuildSystems() {
  return [
    {
      id: 'quant',
      name: '实验判定异构数据智能量化',
      full: '实验判定异构数据智能量化系统',
      menus: [
        leaf('home', '首页', home(
          '欢迎使用 实验判定异构数据智能量化系统',
          '面向试验鉴定业务，提供定型资料、历史试验数据、标准规范、专业文献的统一录入、智能解析、清洗规整、语义量化与成果导出，支撑定型资料数据智能再造。',
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
          leaf('res-list', '数据资源管理', { type: 'm01', desc: '按名称、类别、解析状态与数据模态检索已录入资源，点击资源可查看处理结果详情，包含章节结构、表格识别统计与语义索引状态。' }),
        ]),
        g('parse', '多格式结构化解析', 'parse', reuse(
          { type: 'parse', desc: '文本提取关键信息、段落主旨与语义关系；图像经 OCR 转为可编辑文本；表格识别行列并结构化。支持中英双语、印刷体、繁体、手写体与复杂表格。' },
          [['parse-multi', '文本解析'], ['parse-image', '图像解析'], ['parse-table', '表格解析']],
        )),
        g('parse-task-g', '解析任务管理', 'list', [
          leaf('parse-mode', '解析模式配置', crud('选择即时解析或暂存后解析，配置解析规则、适用资料类型与目标输出格式。', 'parseRules')),
          leaf('parse-batch', '批量解析', crud('批量启动解析任务，支持按资料类别与规则集中处理。', 'parseTasks')),
          leaf('parse-task', '任务进度监控', crud('即时解析、暂存后解析与批量解析任务的进度监控。音视频 ≤5 秒/MB，图片 ≤10 秒/MB。', 'parseTasks')),
        ]),
        g('clean-g', '数据清洗', 'clean', reuse(
          { type: 'clean', desc: '去除页眉页脚等噪声，将多格式数据按统一标准清洗、转换与整合。' },
          [['clean', '噪声清除'], ['clean-norm', '数据归一'], ['clean-merge', '数据整合']],
        )),
        g('layout', '文档版式分析', 'layout', reuse(
          { type: 'parse', desc: '识别单栏、双栏版式与页面区域，还原阅读顺序，提取标题、正文、表格与图片结构。' },
          [['layout-page', '页面布局识别'], ['layout-struct', '文档结构识别'], ['layout-order', '阅读顺序还原']],
        )),
        g('understand', '文档内容理解', 'eye', [
          leaf('parse-rule', '切分规则配置', crud('按章节、字符数或页码切分，识别单栏、双栏版式并按阅读顺序还原，提取实体与关系。', 'parseRules')),
          leaf('split-smart', '文档智能切分', crud('按已保存规则切分文档，合并相邻小片段，形成有序内容单元。', 'parseTasks')),
          leaf('semantic-ana', '内容语义分析', crud('提取段落主旨、实体与语义关系，为向量化与检索提供结构化片段。', 'entities')),
        ]),
        g('engines-g', '多模态工具集成', 'plugin', [
          leaf('engines', '智能工具接入', { type: 'engines', desc: '集成多模态大模型、OCR 与 ASR，按数据类型调度差异化解析服务。' }),
          leaf('engines-diff', '差异化解析服务', { type: 'engines', desc: '按文本、图像、表格与音视频匹配差异化解析工具。' }),
          leaf('engines-sched', '解析能力调度', { type: 'engines', desc: '按资料类型与任务优先级调度解析能力。' }),
        ]),
        g('lang', '多语种内容识别', 'globe', reuse(
          { type: 'parse', desc: '处理中文、英文及中英混合资料，识别印刷体、繁体、手写体与特殊文字。' },
          [['lang-text', '双语文本解析'], ['lang-media', '双语媒体解析'], ['lang-special', '特殊文字识别']],
        )),
        g('audit-g', '三栏式审核视图', 'audit', reuse(
          { type: 'workbench', desc: '左侧结构化目录，中间审核编辑，右侧源文件。支持章节层级调整、增删改查，以及源文件与解析结果联动定位。' },
          [['audit', '三栏视图展示'], ['audit-edit', '审核内容编辑'], ['audit-nav', '智能导航定位']],
        )),
        g('edit-g', '解析成果编辑', 'edit', [
          leaf('edit-struct', '结构化数据维护', crud('维护文档名称、型号、试验阶段等字段，支持增删改与修改记录。', 'resources')),
          leaf('edit-media', '多媒体内容编辑', crud('修订解析结果中的图片、表格与音视频关联内容。', 'resources')),
          leaf('entities', '实体标注修订', crud('修订实体边界与类型，也可手动新增系统未识别的实体。对象覆盖文本、图片与视频。', 'entities')),
          leaf('entities-add', '实体标注新增', crud('手动新增系统未识别的实体，覆盖文本、图片与视频。', 'entities')),
        ]),
        g('toc', '文档目录调整', 'hash', reuse(
          { type: 'workbench', desc: '修正文档解析后的章节归属与层级关系，对照原文调整目录结构。' },
          [['toc-edit', '章节结构编辑'], ['toc-fix', '目录结构修正']],
        )),
        g('vec', '文档语义量化', 'semantic', [
          leaf('vec-task', '语义向量生成', crud('将非结构化文本转为可计算向量。50 页以内文档向量化处理时间不大于 15 秒。', 'vecTasks')),
          leaf('vec-chunks', '向量成果管理', crud('查看分块文本与向量预览，供检索与比对调用。', 'vecChunks')),
          leaf('vec-calc', '向量计算支持', crud('配置相似度计算方式、摘要向量与结果存储，支撑后续语义检索。', 'vecTasks')),
        ]),
        g('exp', '文件格式转换', 'export', [
          leaf('export', '批量导出配置', { type: 'export', desc: '批量选择文档，导出为 JSON、DOCX、Markdown、PDF、TXT。', dataset: 'exports' }),
          leaf('export-fmt', '目标格式转换', { type: 'export', desc: '将解析成果转换为指定目标格式。', dataset: 'exports' }),
          leaf('export-get', '导出成果获取', crud('查看历史导出任务，下载转换成果。', 'exports')),
        ]),
        g('store-g', '多模态数据存储', 'database', reuse(
          crud('按文本、图像、表格、音视频组织存储。单文档 ≥100 MB / ≥1000 页，单图 ≥30 MB，音视频 ≥100 MB。', 'resources'),
          [['store', '多模态数据存储'], ['store-maint', '多模态资源维护']],
        )),
        g('stat-g', '数据统计工作台', 'chart', reuse(
          { type: 'stats', desc: '可视化展示历史上传、数据审核与服务器存储资源。' },
          [['stat', '历史上传统计'], ['stat-audit', '数据审核统计'], ['stat-storage', '存储资源监控']],
        )),
      ],
    },
    {
      id: 'extract',
      name: '关键指标定向抽取',
      full: '关键指标定向抽取系统',
      menus: [
        leaf('home', '首页', home(
          '欢迎使用 关键指标定向抽取系统',
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
        g('parse-ind', '关键指标解析', 'parse', reuse(
          { type: 'parse', desc: '上传定型资料与试验报告，提取文档原始信息、概要、标签与关键实体，对齐知识库主题。' },
          [['parse-info', '文档信息解析'], ['parse-nav', '信息导航解析'], ['parse-ent', '关键实体解析'], ['parse-kb', '知识库主题适配']],
        )),
        g('intent', '业务意图推断', 'target', [
          leaf('pref', '业务意图识别', crud('按知识库名称或描述推断解析偏好；意图不明时启用预制通用模板，保证策略始终可用。', 'preferences')),
          leaf('pref-gen', '解析偏好生成', crud('将识别出的业务意图映射为可执行的解析偏好。', 'preferences')),
          leaf('pref-map', '解析策略映射', crud('把解析偏好落实为字段、实体与输出格式策略。', 'preferences')),
        ]),
        g('tpl', '通用解析模板', 'book', reuse(
          crud('维护通用解析模板，支持新增、编辑、启用与停用。意图不明时作为默认策略。', 'schemeTpls'),
          [['tpl-parse', '通用模板预置'], ['tpl-enable', '默认模板启用'], ['tpl-check', '默认策略校验']],
        )),
        g('entity', '实体识别配置', 'tag', reuse(
          crud('按条目约定实体类别。可识别文档、音频、视频和图片中的业务对象。', 'entities'),
          [['entity-cfg', '实体条目配置'], ['entity-multi', '多类型实体识别'], ['entity-org', '实体成果组织']],
        )),
        g('modal', '多模态解析偏好', 'cards', reuse(
          { type: 'cards', cardKey: 'modalPref', desc: '文本侧重要点与关系，图像侧重文字与图形，视频侧重事件导览，并给出可对照的跨模态策略。' },
          [['modal-pref', '模态偏好配置'], ['modal-focus', '解析重点设置'], ['modal-cross', '跨模态策略管理']],
        )),
        g('ind', '关键指标抽取', 'extract', [
          leaf('inds', '关键指标识别', crud('抽取文档信息、概要、标签、导航与关键实体，内容对齐知识库主题。', 'indicators')),
          leaf('ind-data', '指标数据提取', { type: 'm02', desc: '从定型资料与试验报告中抽取指标数值、计量单位与属性关联，支持任务进度查看与结果溯源。' }),
          leaf('ind-out', '抽取成果生成', crud('按配置输出指定格式的指标抽取成果。', 'indicators')),
        ]),
        g('cats-g', '文档分类标注', 'cluster', reuse(
          crud('分类信息可增删改查。系统按配置对章节自动打标，用户可审核修改。', 'categories'),
          [['cats', '分类信息管理'], ['cats-tag', '章节分类打标'], ['cats-rev', '分类标注审核']],
        )),
        g('custom-g', '自定义指标抽取', 'sliders', [
          leaf('custom', '抽取条目配置', { type: 'entry', entryKey: 'extract', desc: '定义文档范围、内容类型与结果格式，系统按配置定位并提取指标。', dataset: 'indicators' }),
          leaf('custom-maint', '抽取配置维护', crud('维护自定义抽取条目的适用范围、规则与启用状态。', 'indicators')),
          leaf('custom-run', '定向抽取执行', crud('加载有效配置，完成目标内容定位和提取。', 'indicators')),
        ]),
        g('rev', '解析结果审核', 'audit', [
          leaf('preview', '解析结果预览', { type: 'parse-preview', desc: '预览模式查看自动解析结果；审核模式对结果增删改。支持多类别的精细化人工核验。' }),
          leaf('preview-mode', '审核模式管理', { type: 'parse-preview', desc: '在预览与审核模式间切换，按权限开展增删改、保存及审核确认。' }),
          leaf('preview-edit', '解析结果编辑', { type: 'parse-preview', desc: '对自动解析结果增删改，保存核验意见。' }),
        ]),
        g('multi', '多类别审核', 'table', reuse(
          crud('针对不同类别分别核验抽取结果，确保分类准确性。', 'indicators'),
          [['multi-rev', '审核对象管理'], ['multi-viz', '模型结果可视化'], ['multi-check', '指标核验']],
        )),
        g('trace-g', '指标原文追溯', 'timeline', reuse(
          crud('由指标项定位并展示源文件，辅助人工核验。', 'indicators'),
          [['trace', '指标来源关联'], ['trace-loc', '指标原文定位'], ['trace-show', '指标来源展示']],
        )),
        g('model', '标准化数据建模', 'model', [
          leaf('models', '数据模型管理', { type: 'm03', desc: '依据试验鉴定数据标准建立统一指标树，完成语义标注、分类编码和结构化生成。' }),
          leaf('model-meta', '元数据体系管理', crud('维护领域标准对应的元数据字段与映射关系。', 'indicators')),
          leaf('auto-label', '字段语义标注', crud('对抽取结果执行自动标注与分类编码，支持批量处理与人工复核。', 'entities')),
          leaf('model-code', '数据分类编码', crud('按模型与元数据映射关系对指标成果分类编码。', 'categories')),
          leaf('model-struct', '结构化数据生成', { type: 'm03', desc: '将指标成果按模型规范组织为结构化数据，供履历知识库构建使用。' }),
        ]),
      ],
    },
    {
      id: 'resume',
      name: '履历知识库构建',
      full: '履历知识库构建系统',
      menus: [
        leaf('home', '首页', home(
          '欢迎使用 履历知识库构建系统',
          '把定型资料与相关数据归入研发设计、性能试验设计、性能试验鉴定、成果验收，记录技术状态、性能变更、问题归零与关键事件，构建“指标—试验—事件”知识图谱。',
          [
            { name: '阶段归类', to: 'life', desc: '全生命周期整合' },
            { name: '过程记录', to: 'events', desc: '状态、变更、归零' },
            { name: '图谱构建', to: 'graph', desc: '三元组与融合' },
            { name: '结构设计', to: 'schema', desc: '节点、关系、Schema' },
            { name: '权限交换', to: 'perm', desc: '分角色与压缩包交换' },
          ],
          [
            { label: '履历型号', value: '128', unit: '个' },
            { label: '图谱节点类型', value: '106', unit: '类' },
            { label: '关系类型', value: '218', unit: '类' },
            { label: '关系抽取准确率', value: '79.2', unit: '%' },
          ],
        )),
        g('life-g', '全生命周期数据整合', 'layers', reuse(
          crud('资料按研发设计、性能试验设计、性能试验鉴定、成果验收归类。', 'lifecycle'),
          [['life', '全生命周期数据汇聚'], ['life-class', '生命周期阶段归类'], ['life-merge', '生命周期数据整合']],
        )),
        g('events-g', '履历过程记录', 'timeline', reuse(
          crud('记录技术状态、性能变更、问题及归零、关键事件。', 'events'),
          [['events', '技术状态记录'], ['events-chg', '性能变更记录'], ['events-zero', '问题归零记录'], ['events-key', '关键事件记录']],
        )),
        g('build', '履历知识图谱构建', 'graph', reuse(
          { type: 'graph', graphKey: 'resume', desc: '二维 / 三维展示，支持搜索、筛选、查验、编辑。可手动创建节点、关系与事件类型。' },
          [['graph', '履历要素识别'], ['graph-rel', '履历关系挖掘'], ['graph-triple', '知识三元组构建'], ['graph-gen', '履历图谱生成']],
        )),
        g('resume-show', '履历信息展示', 'report', reuse(
          { type: 'timeline', desc: '按时间轴展示全生命周期履历，支持阶段筛选与事件详情查看。' },
          [['life-view', '履历信息结构化'], ['life-layout', '履历信息编排'], ['life-viz', '履历信息可视化']],
        )),
        g('hand', '图谱手工构建', 'edit', reuse(
          { type: 'graph', graphKey: 'resume', desc: '在指定履历知识图谱中补充节点、关系与事件类型，并维护 Schema。' },
          [['hand-node', '图谱节点创建'], ['hand-rel', '图谱关系创建'], ['hand-evt', '事件类型创建'], ['hand-schema', '图谱Schema维护']],
        )),
        g('multi-src', '多源数据图谱构建', 'swap', reuse(
          { type: 'entry', desc: '集中接入结构化与非结构化履历资料，支持表格与文本图谱构建。', dataset: 'lifecycle' },
          [['multi-up', '构建数据批量上传'], ['multi-table', '表格图谱构建'], ['multi-text', '文本图谱构建'], ['multi-rec', '构建辅助推荐']],
        )),
        g('ops', '图谱交互管理', 'compass', [
          leaf('graph-view', '图谱空间展示', { type: 'graph', graphKey: 'resume', desc: '全图谱浏览与查询，支持节点筛选、关系展开与详情查看。' }),
          leaf('graph-search', '图谱信息检索', { type: 'graph', graphKey: 'resume', desc: '按节点名称、类型或关键词检索图谱对象。' }),
          leaf('graph-check', '图谱内容查验', { type: 'graph', graphKey: 'resume', desc: '核验节点属性、关系与关联路径。' }),
          leaf('graph-edit', '图谱交互编辑', { type: 'graph', graphKey: 'resume', desc: '按权限编辑实例节点与关系。' }),
          leaf('graph-io', '图谱数据导入导出', crud('导入外部图谱数据与结构，也可导出当前图谱。', 'lifecycle')),
        ]),
        g('fusion-g', '知识融合节点组', 'spark', reuse(
          { type: 'cards', cardKey: 'fusion', desc: '推荐可融合节点组，编辑后预览融合效果。' },
          [['fusion', '融合节点组推荐'], ['fusion-edit', '融合节点组编辑'], ['fusion-preview', '融合效果预览']],
        )),
        g('perm-g', '图谱角色权限管理', 'shield', reuse(
          { type: 'crud', desc: '按角色管理图谱查看、编辑与发布权限。', dataset: 'kb' },
          [['perm', '图谱角色管理'], ['perm-cfg', '图谱权限配置'], ['perm-assign', '角色权限分配'], ['perm-ctrl', '图谱权限控制']],
        )),
        g('pack-g', '图谱压缩包交换', 'export', reuse(
          crud('以压缩包导入外部图谱的数据与结构，也可导出当前图谱。', 'lifecycle'),
          [['pack', '图谱压缩包导入'], ['pack-out', '图谱压缩包导出'], ['pack-result', '图谱交换结果管理']],
        )),
        g('del', '图谱安全删除', 'flag', reuse(
          crud('筛选待清理图谱，核对删除清单与风险后执行受控删除。', 'lifecycle'),
          [['del-pick', '图谱删除对象选择'], ['del-confirm', '图谱删除确认'], ['del-run', '图谱安全删除']],
        )),
        g('schema-sys', '履历知识结构体系', 'ontology', reuse(
          crud('划分履历知识域、规划层级并扩展图谱结构。', 'ontology'),
          [['schema-plan', '履历知识结构规划'], ['schema-build', '图谱结构体系构建'], ['schema-ext', '图谱结构扩展']],
        )),
        g('nodes-g', '履历节点类型定义', 'tag', reuse(
          crud('定义实体类型，配置属性、颜色与图标。', 'nodeTypes'),
          [['nodes', '节点类型定义'], ['nodes-attr', '节点类型属性配置'], ['nodes-style', '节点类型样式配置']],
        )),
        g('rels-g', '履历关系类型定义', 'link', reuse(
          crud('内置因果、条件、组成等事件关系，并支持扩展。', 'relTypes'),
          [['rels', '节点关系类型定义'], ['rels-evt', '事件关系类型管理'], ['rels-ext', '自定义关系扩展'], ['rels-sem', '关系语义体系组织']],
        )),
        g('schema-g', '图谱Schema可视化预览', 'eye', reuse(
          { type: 'graph', graphKey: 'schema', desc: '实时展示节点、关系与事件类型的整体关联，辅助结构设计与校验。' },
          [['schema', 'Schema结构图展示'], ['schema-live', 'Schema实时预览'], ['schema-check', 'Schema关联查验']],
        )),
      ],
    },
    {
      id: 'situation',
      name: '能力牵引的实验判定态势综合展示',
      full: '能力牵引的实验判定态势综合展示系统',
      menus: [
        leaf('home', '首页', { type: 'stats', statsKey: 'situation', desc: '覆盖试验任务、资源、环境的综合信息面板，融合试验情况与测试数据，快速定位问题与结果。' }),
        g('trace-g', '技术状态追溯', 'timeline', reuse(
          { type: 'timeline', desc: '建立技术状态发展链，按时间轴展示关键技术节点演进，支持原文回溯。' },
          [['trace', '技术状态发展链构建'], ['evt-axis', '关键事件时间轴构建'], ['trace-hist', '技术状态历程追溯']],
        )),
        g('hist-g', '履历全景追溯', 'report', [
          leaf('hist-src', '原文信息回溯', { type: 'timeline', desc: '关联履历记录与原始资料，定位原文页码与章节。' }),
          leaf('compare', '技术状态阶段对比', { type: 'report', reportKey: 'compare', desc: '对比技术状态阶段，分析各阶段差异与演变规律。' }),
          leaf('change-imp', '技术状态变更影响分析', { type: 'report', reportKey: 'changeImp', desc: '分析变更对指标与试验结论的影响，辅助决策。' }),
          leaf('hist-view', '履历全景展示', { type: 'timeline', desc: '全景展示履历与关联技术状态。' }),
        ]),
        g('cap-g', '能力评估展示', 'radar', [
          leaf('cap-idx', '能力指标组织', crud('维护能力评估指标体系，配置指标权重与评分规则。', 'indicators')),
          leaf('cap-eval', '能力评估', { type: 'radar', desc: '按打击、机动、防护等维度评估能力状态。' }),
          leaf('radar', '能力雷达图展示', { type: 'radar', desc: '以雷达图展示能力状态，维度包括打击、机动、防护，并补充可靠性与作业效率。' }),
          leaf('cap-matrix', '能力矩阵展示', { type: 'radar', desc: '以能力矩阵展示各维度评估结果。' }),
          leaf('cap-bar', '能力柱状图展示', { type: 'radar', desc: '以柱状图对比各能力维度得分。' }),
        ]),
        g('panel-g', '实验判定态势综合查看', 'chart', [
          leaf('task-panel', '试验任务态势展示', { type: 'stats', statsKey: 'taskPanel', desc: '展示试验任务进度、完成率与资源占用等态势信息。' }),
          leaf('res-panel', '试验资源态势展示', { type: 'stats', statsKey: 'resPanel', desc: '展示试验资源分布、使用率与可用状态等态势信息。' }),
          leaf('env-panel', '试验环境态势展示', { type: 'stats', statsKey: 'envPanel', desc: '展示试验环境参数、气候条件与保障状态等态势信息。' }),
          leaf('panel-mgr', '综合态势面板管理', { type: 'stats', statsKey: 'situation', desc: '覆盖试验任务、资源、环境的综合信息面板管理。' }),
        ]),
        g('node-g', '试验关键节点融合展示', 'flow', [
          leaf('node-agg', '试验关键节点信息汇聚', { type: 'flow', flowKey: 'probe', desc: '识别任务关键节点并关联试验情况与测试数据。' }),
          leaf('locate', '关键节点融合展示', { type: 'flow', flowKey: 'probe', desc: '融合展示关键节点推理过程和依据，帮助试验人员理解异常节点逻辑。' }),
          leaf('issue-loc', '试验问题定位', crud('在任务、资源、环境面板中定位试验问题。', 'events')),
          leaf('result-loc', '试验结果定位', crud('在综合态势中定位试验结果与关联记录。', 'events')),
        ]),
      ],
    },
    {
      id: 'remake',
      name: '面向智能服务的多维数据再造',
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
        g('card-g', '个性化知识卡片', 'cards', [
          leaf('theme-ana', '问答主题分析', { type: 'cards', cardKey: 'platCard', desc: '分析平台热点主题与个人兴趣主题，支撑卡片生成与推荐。' }),
          leaf('plat-card', '平台知识卡片生成', { type: 'cards', cardKey: 'platCard', desc: '平台级卡片来自全平台问答主题，涵盖参数与试验鉴定方法。' }),
          leaf('cards', '个性化卡片推荐', { type: 'cards', cardKey: 'knowledge', desc: '个性化卡片来自当前账号，按个人关注领域推送。' }),
          leaf('card-biz', '业务知识卡片组织', { type: 'cards', cardKey: 'knowledge', desc: '按业务主题组织知识卡片，便于共享与按需获取。' }),
        ]),
        g('topic-g', '专题知识卡片', 'doc', reuse(
          { type: 'report', reportKey: 'topic', desc: '按个人偏好生成专题目录、正文与多媒体，支持下载留存。' },
          [['topic-gen', '专题内容生成'], ['topic', '专题文档组织'], ['topic-mm', '多模态专题展示'], ['topic-src', '专题内容溯源'], ['topic-dl', '专题文档下载']],
        )),
        g('mine-g', '多类型文档要素挖掘', 'spark', reuse(
          crud('识别试验鉴定资料中的性能、过程与技术状态等要素，并组织挖掘成果。', 'entities'),
          [['mine', '文档要素识别'], ['mine-rel', '业务关系挖掘'], ['mine-org', '要素挖掘成果组织']],
        )),
        g('search-g', '多维数据智能检索', 'search', reuse(
          crud('按实体、关系、事件组合检索，并做语义扩展。可按需求调整排序权重。', 'indicators'),
          [['search-cfg', '多维检索条件配置'], ['search', '多维组合检索'], ['search-sem', '语义扩展检索'], ['search-show', '检索成果展示']],
        )),
        g('dyn', '动态检索策略', 'sliders', reuse(
          crud('配置检索权重、排序规则与语义扩展策略。', 'preferences'),
          [['dyn-need', '数据检索需求分析'], ['dyn-adj', '检索策略调整'], ['dyn-weight', '排序权重调节'], ['dyn-merge', '数据知识整合'], ['dyn-push', '检索成果推送']],
        )),
        g('qa-g', '知识图谱问答', 'chat', reuse(
          { type: 'chat', chatKey: 'kg', desc: '全文与向量混合检索、重排、问题改写与对话补全，答案附带引用来源。' },
          [['qa-intent', '问答意图识别'], ['qa', '知识图谱问答检索'], ['qa-ans', '问答答案生成'], ['qa-cite', '问答引用溯源']],
        )),
        g('mix', '混合检索优化', 'swap', reuse(
          { type: 'chat', chatKey: 'kg', desc: '结合全文检索与语义向量检索，支持重排、问题改写与对话语义补全。' },
          [['mix-search', '全文向量混合检索'], ['mix-rerank', '重排模型排序'], ['mix-rewrite', '用户问题改写'], ['mix-complete', '对话语义补全']],
        )),
        g('reason-g', '业务知识图谱推理', 'flow', reuse(
          { type: 'flow', flowKey: 'reason', desc: '支持溯源、推理、关联、时序、时空分析，推理链路完成取数、裁剪与上下文拼装，并输出结构化结果。' },
          [
            ['reason-ask', '业务问询理解'],
            ['reason', '图谱推理执行'],
            ['reason-src', '知识溯源分析'],
            ['reason-logic', '业务逻辑推理'],
            ['reason-rel', '业务关联分析'],
            ['reason-time', '业务时序分析'],
            ['reason-space', '业务时空分析'],
            ['reason-ans', '推理答案生成'],
            ['reason-api', '问答服务接口'],
          ],
        )),
        g('chain', '推理链路知识检索', 'link', reuse(
          { type: 'flow', flowKey: 'reason', desc: '为业务推理获取实体、文档与证据，完成候选裁剪、上下文拼装与结果结构化。' },
          [['chain-get', '推理数据获取'], ['chain-cut', '检索候选裁剪'], ['chain-ctx', '推理上下文拼装'], ['chain-out', '推理结果结构化']],
        )),
        g('dkg-g', '领域知识图谱构建', 'graph', [
          leaf('dkg-in', '领域数据接入', crud('从异构数据智能量化系统筛选图谱构建所需资源并接入。', 'resources')),
          leaf('onto', '知识图谱本体配置', crud('自定义图谱本体，配置核心概念与关系类型。', 'ontology')),
          leaf('dkg', '知识抽取工具调用', { type: 'graph', graphKey: 'resume', desc: '接入量化系统数据，调用资源库图谱工具，自定义本体并融合为统一实体库与关系网络。' }),
          leaf('entity-lib', '统一实体库构建', crud('管理领域统一实体，支持实体合并、别名维护与属性补全。', 'entities')),
          leaf('dkg-net', '领域关系网络构建', { type: 'graph', graphKey: 'resume', desc: '经实体消歧与关系关联，形成领域关系网络。' }),
        ]),
      ],
    },
  ]
}
