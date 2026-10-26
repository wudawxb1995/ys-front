import { g, leaf, crud, home, reuse } from '@/data/menuKit'

export function insightSystems() {
  return [
    {
      id: 'innov',
      name: '试验鉴定技术创新点智能抽取',
      full: '试验鉴定技术创新点智能抽取系统',
      menus: [
        leaf('mine', '创新点挖掘结果', { type: 'insight-flow' }, 'spark'),
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
        g('papers-g', '科技文献分类收录', 'doc', reuse(
          crud('多格式接入、OCR、版式还原和分类收录。', 'papers'),
          [
            ['papers-in', '多类型科技文献接入'],
            ['papers-parse', '科技文献自动解析'],
            ['papers-ocr', '科技文献OCR识别'],
            ['papers-layout', '科技文献版式还原'],
            ['papers-clean', '非结构化文本清洗'],
            ['papers', '科技文献分类收录'],
          ],
        )),
        g('ctx-g', '长上下文语义解析', 'parse', reuse(
          crud('完成长上下文理解、垂域解析、跨段落/跨章节关联与指代消解。', 'papers'),
          [
            ['ctx-und', '长上下文语义理解'],
            ['ctx-dom', '科技文献垂域解析'],
            ['ctx-para', '跨段落创新逻辑关联'],
            ['ctx-chap', '跨章节创新逻辑关联'],
            ['ctx-ref', '创新点指代消解'],
          ],
        )),
        g('loc-g', '创新内容智能定位', 'target', reuse(
          crud('识别创新高发区域，定位问题、方案、效果等核心内容。', 'papers'),
          [
            ['loc-hot', '创新内容高发区域识别'],
            ['loc-field', '创新领域信息定位'],
            ['loc-prob', '技术问题内容定位'],
            ['loc-req', '功能要求内容定位'],
            ['loc-plan', '技术方案内容定位'],
            ['loc-eff', '效果评估内容定位'],
            ['loc-core', '核心创新内容识别'],
          ],
        )),
        g('ext-g', '技术创新点智能抽取', 'spark', [
          leaf('points', '创新点抽取', {
            type: 'm29',
            desc: '从326篇科技文献（含归档试验报告V2）中抽取58个技术创新点，每个创新点含四要素及原文页码溯源。',
          }),
          leaf('ext-sub', '创新主体抽取', { type: 'm29', desc: '抽取创新主体。' }),
          leaf('ext-act', '创新动作抽取', { type: 'm29', desc: '抽取创新动作。' }),
          leaf('ext-det', '技术细节抽取', { type: 'm29', desc: '抽取技术细节。' }),
          leaf('ext-eff', '目标效果抽取', { type: 'm29', desc: '抽取目标效果。' }),
          leaf('ext-link', '创新点信息关联', { type: 'm29', desc: '关联创新点四要素与原文出处。' }),
        ]),
        g('lab-g', '技术创新点结构化标注', 'cluster', reuse(
          { type: 'm29', desc: '对创新点做技术领域、试验场景、创新程度等语义标注并校验。' },
          [
            ['lab-field', '技术领域语义标注'],
            ['lab-scene', '试验场景语义标注'],
            ['lab-deg', '创新程度语义标注'],
            ['lab-merge', '多维语义标注整合'],
            ['lab-check', '结构化标注结果校验'],
          ],
        )),
        g('json-g', '创新点JSON数据生成', 'code', reuse(
          { type: 'code', codeKey: 'json', desc: '将抽取结果生成可校验的 JSON，支撑聚类与研判。' },
          [
            ['json-def', 'JSON数据结构定义'],
            ['json-map', '创新点数据字段映射'],
            ['json', '标准JSON数据生成'],
            ['json-check', 'JSON数据规范校验'],
            ['json-out', 'JSON数据输出'],
          ],
        )),
      ],
    },
    {
      id: 'cluster',
      name: '试验鉴定技术创新点聚类分类',
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
        g('feat-g', '创新点语义特征表征', 'semantic', reuse(
          crud('获取创新点语义数据，提取特征并完成向量化表征。', 'innovations'),
          [
            ['feat-get', '创新点语义数据获取'],
            ['feat-ext', '创新点语义特征提取'],
            ['sim', '创新点向量化表征'],
            ['feat-org', '语义计算基础数据组织'],
          ],
        )),
        g('sim-g', '创新点多维相似性分析', 'search', reuse(
          crud('融合技术标签、场景标识、应用领域，计算余弦相似度并组织相似关系。', 'innovations'),
          [
            ['sim-attr', '创新点多维属性提取'],
            ['sim-fuse', '多维属性特征融合'],
            ['sim-cos', '创新点余弦相似度计算'],
            ['sim-link', '创新点语义关联分析'],
            ['sim-org', '创新点相似关系组织'],
          ],
        )),
        g('cls-g', '创新点自适应聚类分类', 'cluster', reuse(
          crud('采用 K-Means、词共现等方法自动分类，并关联科技文献。', 'innovations'),
          [
            ['cls-cfg', '创新点聚类任务配置'],
            ['cls-km', 'K-Means聚类分析'],
            ['cls-co', '词共现聚类分析'],
            ['cls-adp', '自适应聚类策略选择'],
            ['cls-auto', '创新点自动分类'],
            ['cls-paper', '科技文献关联构建'],
          ],
        )),
        g('tree-g', '三级技术体系自动构建', 'scheme', reuse(
          { type: 'report', reportKey: 'tree', desc: '按技术原理、试验类型、应用领域生成三级架构。' },
          [
            ['tree-get', '技术体系基础数据获取'],
            ['tree-llm', '大模型技术推理'],
            ['tree-p', '技术原理层级构建'],
            ['tree-t', '试验类型层级构建'],
            ['tree-d', '应用领域层级构建'],
            ['tree', '三级技术体系架构生成校验'],
          ],
        )),
        g('kg-g', '技术体系知识图谱构建', 'graph', reuse(
          { type: 'm30', desc: '三级技术体系树（1领域→6二级→18三级）+ SVG图谱画布，温补技术节点下挂本次试验沉淀案例。' },
          [
            ['kg-get', '技术体系图谱数据获取'],
            ['kg-ent', '技术体系图谱实体建模'],
            ['kg-rel', '技术体系图谱关系建模'],
            ['kg-gen', '技术体系知识图谱生成'],
            ['graph', '技术体系知识图谱可视化'],
          ],
        )),
      ],
    },
    {
      id: 'judge',
      name: '试验鉴定技术研判',
      full: '试验鉴定技术研判系统',
      menus: [
        leaf('home', '首页', home(
          '欢迎使用 试验鉴定技术研判系统',
          '按任务类型、分类和决策层级匹配研判模板，自动组装成熟度、趋势、优先级、技术路径和高价值方向，并支持项目查重。',
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
        g('tpl-mgr', '研判报告模板管理', 'book', reuse(
          { type: 'cards', cardKey: 'judgeTpl', desc: '维护研判报告模板，支持新增、编辑、检索。' },
          [
            ['tpl-add', '研判报告模板新增'],
            ['tpl-edit', '研判报告模板编辑'],
            ['tpl', '研判报告模板维护'],
            ['tpl-search', '研判报告模板检索'],
          ],
        )),
        g('tpl-cfg', '研判报告模板自定义配置', 'sliders', reuse(
          { type: 'cards', cardKey: 'judgeTpl', desc: '维护技术领域、试验类型、应用场景、成熟度、趋势和高价值方向等板块。' },
          [
            ['cfg-chap', '报告章节结构配置'],
            ['cfg-field', '技术领域板块配置'],
            ['cfg-type', '试验类型板块配置'],
            ['cfg-scene', '应用场景板块配置'],
            ['cfg-mat', '技术成熟度板块配置'],
            ['cfg-trend', '发展趋势板块配置'],
            ['cfg-val', '高价值方向板块配置'],
            ['cfg-style', '报告展示样式配置'],
            ['cfg-prev', '模板配置预览'],
          ],
        )),
        g('tpl-rec', '研判报告模板智能推荐', 'spark', reuse(
          { type: 'cards', cardKey: 'judgeTpl', desc: '按任务类型、分类和决策层级匹配研判模板。' },
          [
            ['rec-type', '研判任务类型识别'],
            ['rec-eq', '分类需求分析'],
            ['rec-lvl', '决策层级适配'],
            ['rec-match', '报告模板自动匹配'],
            ['rec-smart', '报告模板智能推荐'],
          ],
        )),
        g('rpt-g', '技术研判报告生成', 'report', reuse(
          { type: 'm31', desc: '三栏布局（模板+对象+报告列表），报告预览页含ECharts图表与麦金色高亮建议块。' },
          [
            ['rpt-data', '研判核心数据获取'],
            ['rpt-mat', '技术成熟度评估内容组装'],
            ['rpt-trend', '发展趋势研判内容组装'],
            ['rpt-pri', '试验研发优先级排序'],
            ['rpt-path', '关键技术路径剖析'],
            ['rpt-val', '高价值研究方向推荐'],
            ['rpt-tpl', '研判报告模板组装'],
            ['rpt', '技术研判报告生成'],
          ],
        )),
        g('expr-g', '研判报告结构化表达', 'chart', reuse(
          { type: 'm31', desc: '自动生成图表、指标对比与结论摘要，并支持内容溯源。' },
          [
            ['expr-chart', '研判图表自动生成'],
            ['expr-cmp', '研判指标对比'],
            ['expr-sum', '研判结论摘要生成'],
            ['expr-org', '研判报告结构化组织'],
            ['expr-src', '研判报告内容溯源'],
          ],
        )),
        g('edit-g', '研判报告在线编辑导出', 'edit', reuse(
          { type: 'm31', desc: '在线预览、编辑、完善研判报告，并支持多格式导出。' },
          [
            ['edit-prev', '研判报告在线预览'],
            ['edit-txt', '研判报告内容编辑'],
            ['edit-ok', '研判报告完善'],
            ['edit-exp', '研判报告多格式导出'],
          ],
        )),
        g('dup-g', '科研项目方案多维查重', 'search', reuse(
          crud('从项目名称、目标、内容、技术路线、创新点、指标、预期成果、应用场景八个维度查重。', 'dupChecks'),
          [
            ['dup-name', '项目名称相似性查重'],
            ['dup-goal', '研究目标相似性查重'],
            ['dup-cont', '研究内容相似性查重'],
            ['dup-path', '技术路线相似性查重'],
            ['dup-inn', '技术创新点相似性查重'],
            ['dup-idx', '技术指标相似性查重'],
            ['dup-out', '预期成果相似性查重'],
            ['dup-scene', '应用场景相似性查重'],
            ['dup', '多维查重结果综合判定'],
          ],
        )),
        g('sim-g', '项目创新内容相似度分析', 'compare', reuse(
          crud('计算项目创新点与研究内容相似度，并溯源立项文件。', 'dupChecks'),
          [
            ['psim-cfg', '项目相似度分析对象配置'],
            ['psim-inn', '项目创新点相似度计算'],
            ['psim-cont', '项目研究内容相似度计算'],
            ['psim-show', '项目相似度结果展示'],
            ['psim-src', '项目立项文件溯源'],
          ],
        )),
        g('conc-g', '研判分析结论生成', 'flag', reuse(
          crud('汇集分析数据，生成、查看并导出研判结论。', 'dupChecks'),
          [
            ['conc-data', '分析结论基础数据汇集'],
            ['conc-gen', '分析结论智能生成'],
            ['conc-view', '分析结论查看'],
            ['conc-exp', '分析结论导出'],
          ],
        )),
      ],
    },
  ]
}
