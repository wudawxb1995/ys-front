import { g, leaf, crud, home, reuse } from '@/data/menuKit'

export function designSystems() {
  return [
    {
      id: 'scheme',
      name: '试验方案智能设计',
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
            { label: '最大因子数', value: '22', unit: '个' },
          ],
        )),
        g('gen-g', '试验方案辅助生成', 'scheme', [
          leaf('gen-need', '试验设计需求配置', { type: 'm08', desc: '配置试验设计需求、考核指标与约束条件。' }),
          leaf('gen-src', '方案生成依据获取', { type: 'm08', desc: '获取历史案例、资源条件与标准模板作为生成依据。' }),
          leaf('gen', '试验方案智能生成', { type: 'm08', desc: '生成新方案初稿并支持人工编辑。当前示例方案包含 22 个试验因子。' }),
          leaf('gen-edit', '方案初稿编辑', { type: 'm08', desc: '对方案初稿进行人工编辑与确认。' }),
        ]),
        g('case-in', '试验案例资源入库', 'database', reuse(
          crud('历史试验案例与试验资源的入库、关键词检索和多条件查阅。', 'cases'),
          [
            ['cases', '历史试验案例入库'],
            ['cases-res', '试验资源入库'],
            ['cases-search', '案例资源检索'],
            ['cases-read', '案例资源查阅'],
          ],
        )),
        g('case-up', '试验案例资源更新', 'compare', reuse(
          crud('案例与资源版本管理，历史版本可在线查看。', 'schemes'),
          [
            ['ver-case', '历史试验案例更新'],
            ['ver-res', '试验资源更新'],
            ['ver', '案例资源版本管理'],
            ['ver-hist', '历史版本在线查阅'],
          ],
        )),
        g('tpl-g', '试验标准方案模板库', 'book', reuse(
          crud('管理资源库中的试验方案模板，支持上传、更新与删除。', 'schemeTpls'),
          [
            ['tpl', '试验方案模板入库'],
            ['tpl-up', '试验方案模板更新'],
            ['tpl-del', '试验方案模板删除'],
            ['tpl-mgr', '标准方案模板库管理'],
          ],
        )),
        g('opt-g', '试验方案交互优化', 'chat', reuse(
          { type: 'chat', chatKey: 'scheme', desc: '通过多轮对话补充关键词和设计思路，持续校核方案合理性。' },
          [
            ['chat-man', '试验方案人工校核'],
            ['chat', '自然语言交互'],
            ['chat-cond', '方案优化条件补充'],
            ['chat-round', '多轮方案优化'],
            ['chat-check', '方案合理性校核'],
          ],
        )),
      ],
    },
    {
      id: 'code',
      name: '数字试验编码生成',
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
        g('code-gen', '数字试验代码生成', 'code', reuse(
          { type: 'code', desc: '按试验编码需求生成 Python、C++、MATLAB 代码并管理成果。' },
          [
            ['code-need', '试验编码需求配置'],
            ['code-llm', '编码大模型调用'],
            ['code-py', 'Python代码生成'],
            ['code-cpp', 'C++代码生成'],
            ['code-mat', 'MATLAB代码生成'],
            ['gen', '代码生成成果管理'],
          ],
        )),
        g('code-fix', '试验代码纠错优化', 'chat', reuse(
          { type: 'chat', chatKey: 'code', desc: '识别语法错误和逻辑漏洞，给出纠错建议，支持多轮对话优化。' },
          [
            ['fix-task', '代码检查任务配置'],
            ['fix-syn', '代码语法错误识别'],
            ['fix-logic', '代码逻辑漏洞分析'],
            ['fix', '代码纠错建议生成'],
            ['fix-round', '多轮对话优化'],
            ['fix-ok', '代码纠错结果验证'],
          ],
        )),
        g('code-note', '试验代码注释生成', 'code', reuse(
          crud('自动补充函数说明、参数含义和执行逻辑，提升可读性。', 'codes'),
          [
            ['note-task', '代码注释任务配置'],
            ['note', '函数说明注释生成'],
            ['note-param', '参数含义注释生成'],
            ['note-logic', '执行逻辑注释生成'],
            ['note-std', '注释规范化处理'],
            ['note-mgr', '注释成果管理'],
          ],
        )),
      ],
    },
    {
      id: 'cluster',
      name: '试验资源表征与聚类',
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
        g('res-ext', '试验资源智能提取', 'parse', reuse(
          crud('识别文本、图表、图像中的试验资源。图像提供 OCR。', 'testRes'),
          [
            ['res-doc', '历史文档获取'],
            ['res-text', '文本资源识别'],
            ['res-chart', '图表资源识别'],
            ['res-img', '图像资源识别'],
            ['res', '试验资源信息提取'],
          ],
        )),
        g('res-struct', '试验资源结构化处理', 'parse', reuse(
          crud('抽取试验设备与参数信息，生成标准化结构化数据。', 'testRes'),
          [
            ['struct-dev', '试验设备信息抽取'],
            ['struct-param', '试验参数信息抽取'],
            ['struct-std', '资源数据标准化'],
            ['struct-out', '结构化数据生成'],
          ],
        )),
        g('res-vec', '试验资源向量数据库构建', 'vector', reuse(
          crud('资源向量化解析并构建向量库。', 'vecChunks'),
          [
            ['vec-parse', '试验资源向量化解析'],
            ['vec-gen', '试验资源向量生成'],
            ['vec', '向量数据库构建'],
            ['vec-mgr', '向量资源管理'],
          ],
        )),
        g('res-kg', '历史试验资源知识图谱构建', 'graph', reuse(
          { type: 'graph', graphKey: 'resource', desc: '结构化资源映射为实体和关系，形成历史试验资源图谱。' },
          [
            ['graph-map', '结构化资源图谱映射'],
            ['graph-ent', '试验资源实体构建'],
            ['graph-rel', '试验资源关系构建'],
            ['graph', '历史试验资源图谱生成'],
          ],
        )),
        g('res-cls', '试验资源智能分类聚类', 'cluster', reuse(
          crud('按属性、用途、规格提取聚类特征并生成分类体系。', 'testRes'),
          [
            ['cls-feat', '资源聚类特征提取'],
            ['cls-run', '资源智能聚类'],
            ['cls-sys', '资源分类体系生成'],
            ['cls-mgr', '分类聚类结果管理'],
          ],
        )),
        g('res-ops', '试验资源迭代维护', 'database', reuse(
          crud('支持更新、删除和校验，跟踪资源更新状态。', 'testRes'),
          [
            ['ops-up', '试验资源更新'],
            ['ops-del', '试验资源删除'],
            ['ops-check', '资源数据校验'],
            ['ops-st', '资源更新状态管理'],
          ],
        )),
      ],
    },
    {
      id: 'match',
      name: '试验资源任务匹配与智能推荐',
      full: '试验资源任务匹配与智能推荐系统',
      menus: [
        leaf('home', '首页', home(
          '欢迎使用 试验资源任务匹配与智能推荐系统',
          '面向新试验任务计算与历史资源的特征相似度，至少使用两类算法，并以图文和列表展示设备、方案和装备参数，支持多轮交互与案例溯源。',
          [
            { name: '相似度匹配', to: 'rec', desc: '四算法并行' },
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
        g('match-g', '试验资源智能匹配', 'search', reuse(
          { type: 'm11', desc: '对比历史资源的设备、操作参数等详细信息。算法含基于规则、内容相似度、协同过滤、多维度综合。' },
          [
            ['rec-feat', '新试验任务特征提取'],
            ['rec-sim', '相似度计算配置'],
            ['rec', '历史资源相似度匹配'],
            ['rec-cmp', '历史资源对比'],
          ],
        )),
        g('show-g', '推荐资源可视化展示', 'chart', reuse(
          { type: 'm11', desc: '以图文和列表展示推荐设备、方案和装备参数。' },
          [
            ['show-over', '推荐结果概览展示'],
            ['show-pic', '推荐资源图文展示'],
            ['show-list', '推荐资源列表展示'],
            ['show-detail', '推荐资源详情展示'],
          ],
        )),
        g('chat-g', '多轮交互资源推荐', 'chat', reuse(
          { type: 'chat', chatKey: 'recommend', desc: '用自然语言补充约束，提高匹配准确性。' },
          [
            ['chat', '推荐对话发起'],
            ['chat-und', '交互需求理解'],
            ['chat-opt', '推荐条件优化'],
            ['chat-run', '多轮推荐执行'],
            ['chat-st', '交互推荐状态管理'],
          ],
        )),
        g('trace-g', '推荐资源历史案例溯源', 'timeline', reuse(
          { type: 'm11', desc: '关联推荐资源与历史试验案例，支持追溯与详情查阅。' },
          [
            ['trace-link', '资源案例关联'],
            ['trace-hist', '历史案例追溯'],
            ['trace-read', '历史案例详情查阅'],
            ['trace-src', '案例来源关联展示'],
          ],
        )),
      ],
    },
    {
      id: 'sample',
      name: '试验数据智能分析',
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
        g('ana-g', '试验样本数据智能分析', 'chart', reuse(
          crud('快速分析样本偏差和数量，对缺失数据补全、对噪声消除，并校验增强结果。', 'samples'),
          [
            ['ana-get', '试验样本数据获取'],
            ['ana', '试验参数智能研判'],
            ['ana-dev', '试验样本偏差分析'],
            ['ana-num', '试验样本数量分析'],
            ['ana-all', '试验样本综合分析'],
          ],
        )),
        g('aug-g', '试验样本数据增强', 'chart', reuse(
          crud('对缺失数据补全、对噪声消除，并校验增强结果。', 'samples'),
          [
            ['aug-cfg', '样本增强任务配置'],
            ['aug-miss', '样本缺失数据识别'],
            ['aug-fill', '样本缺失数据补全'],
            ['aug-noise', '样本噪声消除'],
            ['aug-check', '样本增强结果校验'],
            ['aug-mgr', '样本增强成果管理'],
          ],
        )),
      ],
    },
  ]
}
