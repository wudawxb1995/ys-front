/**
 * Rich 页通用镜头（录入 / 解析 / 图谱 / m01 / m03 / m08 / m11）
 */
import { computed, reactive, ref, toRaw, watch } from 'vue'
import { useRows } from '@/composables/tables'
import { nowText } from '@/utils/format'
import { resourceDetails } from '@/data/mock'
import { resourceCategories } from '@/data/resourceCorpus'
import {
  updateMetricTree,
  getPersistedM03List,
  persistM03List,
  getPersistedM08List,
  persistM08List,
  setMatchContext,
  useDemoStore,
} from '@/composables/demo-store'
import { m03TreeData } from '@/data/m03-tree'
import { m02Domains, m02IndRows, getM02RowsForDoc, getM02CountForDoc } from '@/data/m02-indicators'
import { schemeDocToc, schemeDocChapters, schemeDocRounds, schemeDocVersions } from '@/data/schemeFullDoc'
import { schemeExperts, schemeSkills } from '@/data/schemeAgents'
import { recommendForIndicator } from '@/data/resourceRecommend'

export function buildRichPartA({ toast, router, route, props, bag }) {
  /** 深拷贝：兼容 Vue Proxy（structuredClone 对响应式对象会抛错） */
  function cloneDeep(data) {
    return JSON.parse(JSON.stringify(data == null ? data : toRaw(data)))
  }
  function kpiIcon(label = '') {
    if (/卡片/.test(label)) return 'card'
    if (/问答/.test(label)) return 'chat'
    if (/图谱|关系|节点/.test(label)) return 'graph'
    if (/接口|服务/.test(label)) return 'plugin'
    if (/探针|模型|算法/.test(label)) return 'model'
    if (/任务|对接/.test(label)) return 'flow'
    if (/准确|率|评估/.test(label)) return 'chart'
    if (/创新|方向|覆盖/.test(label)) return 'spark'
    if (/文献|文书|文档|报告/.test(label)) return 'doc'
    if (/资源|数据|数据集/.test(label)) return 'database'
    if (/抽取|收录/.test(label)) return 'extract'
    return 'chart'
  }

  const tab = ref('文本解析')
  const parseTabs = ['文本解析', '图像解析', '表格解析']
  const parsePoints = computed(() => ({
    文本解析: ['关键信息精准提取：机型、指标、数值、标准编号', '段落主旨归纳：按章节生成摘要与目录', '语义关系识别：指标与数值、项目与方法', '中英文双语，支持印刷体、繁体与手写体上下文'],
    图像解析: ['OCR 识别图像中的文字与图形', '标准印刷体及有线表格准确率不低于 95%', '单张图片支持 30 MB 以上', '解析时间每 MB 不大于 10 秒'],
    表格解析: ['识别行列关系与单元格内容', '不可编辑表格转为结构化数据', '复杂表格保留表头层级', '结果可回写指标抽取'],
  }[tab.value]))

  const engines = reactive([
    { name: '领域多模态大模型', vendor: '中科智算 · V3.2', on: true, type: '多模态理解', acc: '92.4%', lang: '中文 / 英文', cap: '文本解析、语义关系识别' },
    { name: '文档OCR识别引擎', vendor: '华光识图 · V5.1', on: true, type: '文字识别', acc: '95.6%', lang: '中文 / 英文 / 繁体 / 手写体', cap: '图像文字、复杂表格' },
    { name: '语音转写ASR引擎', vendor: '讯飞聆声 · V4.0', on: true, type: '语音识别', acc: '86.2%', lang: '中文', cap: '试验音视频转写，准确率不低于 85%' },
    { name: '表格结构识别引擎', vendor: '格致表格 · V2.6', on: false, type: '结构识别', acc: '94.1%', lang: '中文 / 英文', cap: '行列识别、不可编辑表格转换' },
  ])

  const rules = reactive([
    { name: '页眉页脚页码剔除', target: '去除版式噪声', on: true },
    { name: '乱码与特殊符号清理', target: '文本可用性修复', on: true },
    { name: '单位与术语归一', target: '统一 kW、kN、r/min', on: true },
    { name: '重复段落合并', target: '结构整合', on: true },
  ])
  const cleanRes = ref('东方红-LF2204轮式拖拉机定型试验报告')
  const cleanLogs = ref([
    { res: '东方红-LF2204轮式拖拉机定型试验报告', rule: '页眉页脚页码剔除', n: '126 处', time: '2026-10-09 14:06' },
    { res: 'NY/T 2090-2025', rule: '单位与术语归一', n: '38 处', time: '2026-10-10 09:18' },
  ])
  function runClean() {
    cleanLogs.value.unshift({ res: cleanRes.value, rule: '已启用规则', n: '54 处', time: nowText() })
    toast('清洗完成，噪声已剔除并完成归一')
  }

  const fmt = ref('JSON')
  const exportDocs = ['东方红-LF2204定型试验报告', '雷沃谷神4LZ-8鉴定大纲', 'NY/T 2090-2025', 'DG/T 001-2025']

  const fieldMap = {
    extract: [
      { key: 'name', label: '抽取条目', required: true, placeholder: '如：动力性能指标' },
      { key: 'scope', label: '文档范围', options: ['定型试验报告', '鉴定大纲', '原始记录'] },
      { key: 'kind', label: '内容类型', options: ['性能指标', '技术参数', '试验结论'] },
      { key: 'fmt', label: '结果格式', options: ['结构化字段', 'JSON', '表格'] },
      { key: 'note', label: '抽取说明', type: 'textarea' },
    ],
    graphUpload: [
      { key: 'name', label: '构建任务', required: true },
      { key: 'mode', label: '构建方式', type: 'radio', options: ['表格构建', '文本构建'] },
      { key: 'file', label: '数据说明', placeholder: '批量上传文件名' },
      { key: 'dict', label: '字典推荐', options: ['启用', '关闭'] },
    ],
    sft: [
      { key: 'name', label: '数据配置任务', required: true },
      { key: 'src', label: '源数据集', options: ['定型报告语料-2026Q3', '指标抽取指令集', '标准条款问答对'] },
      { key: 'need', label: '需求描述', type: 'textarea' },
      { key: 'tag', label: '自动标签', placeholder: '拖拉机,指标' },
    ],
  }
  const defaultFields = [
    { key: 'name', label: '资源名称', required: true, placeholder: '如：某型装备性能鉴定试验报告V2' },
    { key: 'cat', label: '资源类别', required: true, options: resourceCategories },
    { key: 'fmt', label: '文件格式', required: true, options: ['DOCX', 'PDF', 'TXT', 'XLSX', 'JPG', 'PNG', 'MP4', 'MP3', 'CSV'] },
    { key: 'modal', label: '数据模态', options: ['文本', '图像', '表格', '音视频'] },
    { key: 'size', label: '文件大小（MB）', placeholder: '如：36.5' },
    { key: 'pages', label: '页数', placeholder: '如：128' },
    { key: 'mode', label: '解析模式', type: 'radio', options: ['即时解析', '暂存'] },
  ]
  const fields = computed(() => fieldMap[props.page.entryKey] || defaultFields)
  const form = reactive({ mode: '即时解析' })
  function resetForm() { Object.keys(form).forEach((k) => delete form[k]); form.mode = '即时解析' }
  const formTitle = computed(() => props.page.entryKey === 'extract' ? '抽取条目配置' : props.page.entryKey === 'sft' ? '微调数据配置' : '资源信息登记')
  const sideNote = '提交后写入对应数据目录。即时解析会生成解析任务；暂存仅入库。批量场景支持不少于 50 篇、总容量不少于 500 MB。'
  const notes = ['单文档支持 100 MB、1000 页以上', '图片支持 30 MB 以上', '音视频支持 100 MB 以上', '中英文双语解析']

  // 批量导入清单
  const importList = ref([])

  function addToList() {
    if (fields.value.some((f) => f.required && !form[f.key])) { toast('请填写必填项'); return }
    importList.value.push({
      name: form.name,
      cat: form.cat || '试验鉴定',
      fmt: form.fmt || 'PDF',
      modal: form.modal || '文本',
      size: form.size || '—',
      pages: form.pages || '—',
      mode: form.mode || '即时解析',
    })
    toast('已加入导入清单')
    resetForm()
  }

  function commitList() {
    if (!importList.value.length) { toast('导入清单为空'); return }
    const names = []
    if (props.page.dataset) {
      const rows = useRows(props.page.dataset)
      importList.value.forEach((item) => {
        const name = item.name
        names.push(name)
        const instant = item.mode === '即时解析'
        rows.unshift({
          name,
          cat: item.cat,
          fmt: item.fmt,
          modal: item.modal,
          size: item.size === '—' ? '—' : String(item.size).includes('MB') ? item.size : `${item.size} MB`,
          pages: item.pages,
          status: instant ? '解析中' : '暂存',
          by: 'Mona',
          time: nowText(),
          fileUrl: /某型装备研制总要求|某型研制总要求/.test(name) ? '/samples/某型装备研制总要求.pdf' : '',
        })
      })
    }
    toast(`成功录入 ${importList.value.length} 项资源，已进入数据资源目录`)
    importList.value = []
    if (props.page?.dataset === 'resources') {
      setTimeout(() => {
        const rows = useRows('resources')
        names.forEach((name) => {
          const row = rows.find((r) => r.name === name && r.status === '解析中')
          if (row) {
            row.status = '已解析'
            row.time = nowText()
            if (/某型装备研制总要求|某型研制总要求/.test(name)) row.pages = row.pages || '48'
          }
        })
      }, 1200)
      router.push({ name: 'app', params: { pid: route.params.pid, sid: route.params.sid, mid: 'res-list' } })
    }
  }

  function submitEntry() {
    if (fields.value.some((f) => f.required && !form[f.key])) { toast('请填写必填项'); return }
    if (props.page.dataset) {
      const rows = useRows(props.page.dataset)
      rows.unshift({ name: form.name || '新建记录', cat: form.cat || '试验鉴定', fmt: form.fmt || 'PDF', modal: form.modal || '文本', size: (form.size || '10') + (String(form.size || '').includes('MB') ? '' : ' MB'), pages: form.pages || '—', status: form.mode === '暂存' ? '暂存' : '解析中', by: 'Mona', time: nowText(), value: '—', unit: '—', machine: '某型装备', source: '新录入', page: '—', score: '—', stage: '性能试验鉴定', docs: '新归集', state: '待整理', updated: nowText() })
    }
    toast('已提交，可在目录中查看')
    resetForm()
  }

  const docs = [
    { id: 'a', name: '东方红-LF2204轮式拖拉机定型试验报告' },
    { id: 'b', name: '雷沃谷神4LZ-8鉴定大纲' },
  ]
  const docId = ref('a')
  const chapters = reactive([
    { id: 'c1', title: '第一章 概述', tag: '已确认', body: '说明试验目的与依据。对东方红-LF2204开展定型试验。' },
    { id: 'c2', title: '第二章 试验条件', tag: '已确认', body: '洛阳拖拉机试验场，300 kN 负荷车，电涡流测功机。' },
    { id: 'c3', title: '第三章 性能试验结果', tag: '待审核', body: '标定功率 162 kW，牵引力 38.6 kN，滑转率 8.2%。' },
    { id: 'c4', title: '第四章 可靠性试验', tag: '待审核', body: '累计 750 h，MTBF 375 h。' },
  ])
  const cur = ref(chapters[2])

  const graphs = {
    resume: {
      nodes: [
        { id: 'm', label: '东方红-LF2204', type: '农业机械', x: 380, y: 250, color: '#0d4e83', detail: '轮式拖拉机，技术状态 B2，定型试验已完成。' },
        { id: 'i', label: '标定功率 162 kW', type: '性能指标', x: 180, y: 120, color: '#d0ab68', detail: '来源定型报告 P.17，已人工确认。' },
        { id: 't', label: '牵引性能试验', type: '试验', x: 580, y: 130, color: '#3f88bd', detail: '混凝土路面，最大牵引力 38.6 kN。' },
        { id: 'e', label: '滑转率归零', type: '事件', x: 600, y: 360, color: '#d48806', detail: '配重调整后复测合格。' },
        { id: 's', label: 'DG/T 001-2025', type: '标准规范', x: 170, y: 380, color: '#2f9e62', detail: '轮式拖拉机鉴定技术规范。' },
      ],
      edges: [['m', 'i'], ['m', 't'], ['t', 'e'], ['t', 's'], ['m', 's']],
    },
    schema: {
      nodes: [
        { id: 'a', label: '农业机械', type: '节点类型', x: 380, y: 80, color: '#0d4e83', detail: '属性：型号、类别、企业。' },
        { id: 'b', label: '性能指标', type: '节点类型', x: 160, y: 240, color: '#d0ab68', detail: '关系：农业机械—具备指标。' },
        { id: 'c', label: '试验', type: '节点类型', x: 380, y: 400, color: '#3f88bd', detail: '关系：开展试验、依据标准。' },
        { id: 'd', label: '事件', type: '节点类型', x: 600, y: 240, color: '#d48806', detail: '内置因果、条件、组成。' },
      ],
      edges: [['a', 'b'], ['a', 'c'], ['c', 'd'], ['b', 'c']],
    },
    probe: {
      nodes: [
        { id: 'p', label: '牵引力滑转探针', type: '探针', x: 380, y: 250, color: '#0d4e83', detail: '定位维度：指标关系。关注牵引力与滑转率。' },
        { id: 'q', label: '滑转率 8.2%', type: '指标值', x: 170, y: 140, color: '#d0ab68', detail: '实测值，接近关注阈值。' },
        { id: 'r', label: '配重不足', type: '原因', x: 590, y: 140, color: '#c4472d', detail: '历史同类问题的根因。' },
        { id: 'u', label: '调整配重', type: '措施', x: 560, y: 380, color: '#2f9e62', detail: '专家经验：前配重增加后复测。' },
      ],
      edges: [['p', 'q'], ['p', 'r'], ['r', 'u']],
    },
    resource: {
      nodes: [
        { id: 'a', label: '牵引试验', type: '试验', x: 380, y: 240, color: '#0d4e83', detail: '历史高频试验项目。' },
        { id: 'b', label: '300 kN 负荷车', type: '设备', x: 180, y: 120, color: '#3f88bd', detail: '聚类：牵引加载。' },
        { id: 'c', label: '混凝土跑道', type: '场地', x: 590, y: 130, color: '#d0ab68', detail: '洛阳 1.2 km 标准路面。' },
        { id: 'd', label: '电涡流测功机', type: '仪器', x: 220, y: 390, color: '#2f9e62', detail: '0–250 kW，用于 PTO。' },
      ],
      edges: [['a', 'b'], ['a', 'c'], ['a', 'd']],
    },
    tech: {
      nodes: [
        { id: 'a', label: '传动控制', type: '技术簇', x: 380, y: 230, color: '#0d4e83', detail: '三级体系中的技术原理层。' },
        { id: 'b', label: '无级变速匹配', type: '创新点', x: 160, y: 110, color: '#d0ab68', detail: '牵引功率提高约 6%。' },
        { id: 'c', label: '收获损失控制', type: '技术簇', x: 590, y: 140, color: '#3f88bd', detail: '剥皮与清选相关。' },
        { id: 'd', label: '变量施药', type: '创新点', x: 560, y: 370, color: '#2f9e62', detail: '药液减量约 12%。' },
      ],
      edges: [['a', 'b'], ['a', 'c'], ['c', 'd']],
    },
  }
  const graph = computed(() => graphs[props.page.graphKey] || graphs.resume)
  const graphNodes = computed(() => graph.value.nodes)
  function nodeHit(n) {
    const q = gkey.value.trim()
    if (!q) return false
    return `${n.label}${n.type}`.includes(q)
  }
  const graphEdges = computed(() => graph.value.edges)
  const nodeMap = computed(() => Object.fromEntries(graph.value.nodes.map((n) => [n.id, n])))
  const activeNode = ref(graphs.resume.nodes[0])
  const gkey = ref('')
  watch(graph, (g) => { activeNode.value = g.nodes[0]; gkey.value = '' }, { immediate: true })
  watch(gkey, (q) => {
    const hit = graphNodes.value.find((n) => `${n.label}${n.type}`.includes(q.trim()))
    if (q.trim() && hit) activeNode.value = hit
  })

  const chatBank = {
    kg: {
      topics: ['标定功率问答', '滑转率判定', '可靠性计算'],
      suggests: ['LF2204标定功率是多少？', '滑转率依据哪条标准？', 'MTBF如何计算？'],
      reply: (q) => {
        if (q.includes('滑转')) return { text: '东方红-LF2204 混凝土路面最大牵引力对应滑转率为 8.2%。判定依据为 DG/T 001-2025 牵引性能条款。', src: '定型试验报告 P.36；DG/T 001-2025' }
        if (q.includes('MTBF') || q.includes('可靠')) return { text: '可靠性试验累计作业 750 h，一般故障 2 次，MTBF = 375 h，满足定型要求。', src: '五征/东方红可靠性记录；NY/T 2090-2025' }
        return { text: '东方红-LF2204 发动机标定功率为 162 kW，动力输出轴功率 138.5 kW，标定转速 540/1000 r/min。', src: '定型试验报告 P.17' }
      },
    },
    cause: {
      topics: ['滑转率偏高', '收获损失波动', '早期故障'],
      suggests: ['为什么滑转率偏高？', '给出复测建议'],
      reply: () => ({ text: '根因倾向为前配重不足，导致驱动轮滑转升高。历史探针“牵引力滑转耦合”给出相同结论。建议增加前配重后按原工况复测牵引力-滑转曲线。', src: '探针推理图谱 · 专家经验 2026-06' }),
    },
    scheme: {
      topics: ['LF2204 补充试验', '4LZ-8 收获方案'],
      suggests: ['补充低速档牵引因子', '把样本量调到 24'],
      reply: (q) => ({ text: `已按「${q || '补充约束'}」调整方案：保留 PTO、牵引、制动、噪声四组必做项目，牵引因子增至低速三档，总因子 24 个，与轮拖定型模板一致。`, src: '轮式拖拉机定型试验方案模板 V2.1' }),
    },
    code: {
      topics: ['PTO 计算脚本', '滑转率拟合'],
      suggests: ['检查除零', '补充转速单位换算'],
      reply: () => ({ text: '语法检查通过。逻辑上滑转率计算应使用理论速度与实际速度之差除以理论速度，当前草稿把分母写成了实际速度，建议修正后再跑一组 8.2% 的已知样例。', src: '编码纠错智能体' }),
    },
    recommend: {
      topics: ['补充牵引试验', '收获损失试验'],
      suggests: ['只要洛阳场地', '测功机需要 200 kW 以上'],
      reply: () => ({ text: '在余弦相似度与欧氏距离两类算法下，优先推荐 300 kN 负荷车和洛阳混凝土跑道，相似度 0.93，可溯源至 2024 年大马力轮拖定型案例。', src: '试验资源图谱' }),
    },
    draft: {
      topics: ['性能试验大纲', '呈批件'],
      suggests: ['生成大纲提纲', '把话术改成请示'],
      reply: () => ({ text: '已按鉴定大纲模板生成提纲：1 任务来源 2 试验对象 3 试验项目与指标 4 条件与仪器 5 方法 6 数据处理 7 判定准则。术语已校准为“动力输出轴功率”“滑转率”。', src: '术语库 · 动力性能' }),
    },
    rule: {
      topics: ['一致性规则', '章节完整性'],
      suggests: ['报告数值必须回链大纲', '关联 DG/T 001'],
      reply: () => ({ text: '已生成规则：若性能试验报告中的指标数值与性能试验大纲不一致，且偏差超过允差，则判定为强制性跨文档冲突，并引用 DG/T 001 对应条款作为依据。', src: '审查规则库' }),
    },
    prompt: {
      topics: ['指标抽取提示', '审查提示'],
      suggests: ['生成收获机械抽取提示'],
      reply: () => ({ text: '未命中完全匹配的预制模板，已生成新模板：角色为鉴定指标抽取员，输出 JSON 字段 machine、indicator、value、unit、page、standard，禁止编造未出现的数值。', src: '提示词生成智能体' }),
    },
    debug: {
      topics: ['Qwen32B 调试', 'GLM32B 调试'],
      suggests: ['温度 0.2 抽取功率', 'Top P 0.8'],
      reply: () => ({ text: '当前参数 temperature=0.2，top_p=0.8，top_k=40。输出：发动机标定功率 162 kW。与标准答案一致。', src: '在线调试 · 鉴定-Qwen32B-v3' }),
    },
    kb: {
      topics: ['本周问答', '个人知识库'],
      suggests: ['定型鉴定和推广鉴定有何区别？', '把上一问改得更具体'],
      reply: (q) => ({ text: q.includes('区别') ? '定型鉴定验证新产品是否达到鉴定大纲和标准规定的性能、安全性与可靠性；推广鉴定侧重在用或拟推广机型的适用性评价。两者依据的大纲深度不同。' : '已根据上一轮上下文补充：若针对轮式拖拉机，定型需覆盖动力、牵引、制动、噪声与可靠性。', src: '领域通识库 · NY/T 2090-2025' }),
    },
  }
  const bank = computed(() => chatBank[props.page.chatKey] || chatBank.kg)
  const topics = computed(() => bank.value.topics)
  const topic = ref(bank.value.topics[0])
  const suggests = computed(() => bank.value.suggests)
  const messages = ref([{ role: 'bot', text: '可以围绕试验指标、标准条款或方案约束提问，回答会附带引用。', src: '' }])
  const input = ref('')
  function ask(q) {
    const text = (q || '').trim()
    if (!text) return
    messages.value.push({ role: 'user', text })
    const ans = bank.value.reply(text)
    messages.value.push({ role: 'bot', ...ans })
    input.value = ''
  }

  const lang = ref('Python')
  const codeLangs = computed(() => props.page.codeKey === 'json' ? ['JSON'] : ['Python', 'C++', 'MATLAB'])
  const codeHtml = computed(() => {
    if (props.page.codeKey === 'json') {
      return `{
  <span class="kw">"innovation"</span>: <span class="str">"双行星排无级变速匹配牵引工况"</span>,
  <span class="kw">"subject"</span>: <span class="str">"传动系统"</span>,
  <span class="kw">"action"</span>: <span class="str">"匹配优化"</span>,
  <span class="kw">"effect"</span>: <span class="str">"牵引功率提高 6%"</span>,
  <span class="kw">"scene"</span>: <span class="str">"轮式拖拉机牵引试验"</span>
}`
    }
    const map = {
      Python: `<span class="kw">def</span> slip_ratio(v_theory, v_actual):\n    <span class="cmt"># 滑转率 = (理论速度 - 实际速度) / 理论速度</span>\n    <span class="kw">return</span> (v_theory - v_actual) / v_theory\n\n<span class="cmt"># 东方红-LF2204 混凝土路面样例，期望约 0.082</span>\nprint(slip_ratio(<span class="str">2.44</span>, <span class="str">2.24</span>))`,
      'C++': `<span class="kw">double</span> slipRatio(<span class="kw">double</span> vTheory, <span class="kw">double</span> vActual) {\n  <span class="cmt">// 避免理论速度为 0</span>\n  <span class="kw">if</span> (vTheory &lt;= 0) <span class="kw">return</span> 0;\n  <span class="kw">return</span> (vTheory - vActual) / vTheory;\n}`,
      MATLAB: `<span class="kw">function</span> s = slipRatio(vTheory, vActual)\n<span class="cmt">% 牵引试验滑转率</span>\ns = (vTheory - vActual) ./ vTheory;\n<span class="kw">end</span>`,
    }
    return map[lang.value] || map.Python
  })

  const radarRows = [
    { name: '打击（作业效能）', score: '86', basis: '标定功率、PTO 功率达到大纲' },
    { name: '机动', score: '82', basis: '牵引通过与滑转率满足限值' },
    { name: '防护', score: '78', basis: '制动、噪声、安全防护合格' },
    { name: '可靠性', score: '90', basis: 'MTBF 375 h' },
    { name: '作业效率', score: '84', basis: '牵引功率 118.4 kW' },
  ]

  const timeline = [
    { t: '2025-11-02', title: '设计冻结 B2', text: 'PTO 传动比确定，覆盖 540/1000 r/min。依据设计任务书。' },
    { t: '2026-03-12', title: '性能变更', text: '补充双转速动力输出，技术状态由 B1 升至 B2。' },
    { t: '2026-06-18', title: '问题归零', text: '牵引试验滑转率偏高，调整配重后复测合格。' },
    { t: '2026-08-02', title: '可靠性节点', text: '累计作业 750 h，一般故障 2 次。' },
    { t: '2026-10-08', title: '定型报告归档', text: '报告完成解析与指标确认，进入成果验收。' },
  ]

  const flows = {
    probe: [
      { title: '读取探针', text: '牵引力滑转耦合', detail: '加载探针的应用范围、定位维度和关注信号。' },
      { title: '对齐文档', text: '总案 / 大纲 / 报告', detail: '在三份文书中定位牵引力、滑转率及其限值。' },
      { title: '异常定位', text: '滑转率贴近阈值', detail: '实测 8.2%，标记为需关注的异常指标，节点为牵引性能试验。' },
      { title: '合规风险', text: '复测记录不完整', detail: '归零过程有结论，原始复测曲线附件缺失，列为潜在合规风险。' },
      { title: '输出依据', text: '图谱 + 条款', detail: '依据历史探针、专家措施和 DG/T 001 牵引条款生成思维链。' },
    ],
    reason: [
      { title: '问句理解', text: '意图识别', detail: '识别用户问的是指标事实、原因还是时间变化。' },
      { title: '溯源分析', text: '回链原文', detail: '定位指标所在报告页码和标准条款。' },
      { title: '推理分析', text: '规则判断', detail: '用阈值和关系判断是否满足鉴定要求。' },
      { title: '关联分析', text: '指标—试验—事件', detail: '沿知识图谱展开相关实体。' },
      { title: '时序 / 时空', text: '状态变化', detail: '比较技术状态阶段，并关联试验场地与时间。' },
    ],
    docs: [
      { title: '研制总要求', text: '指标源头', detail: '提出战技指标和功能要求，向下游传递。' },
      { title: '试验总案', text: '任务分解', detail: '把指标拆成试验项目和时间节点。' },
      { title: '性能试验大纲', text: '方法细化', detail: '明确方法、样本量、仪器和判定准则。' },
      { title: '性能试验报告', text: '结果回写', detail: '用实测值响应大纲，差异需可解释。' },
    ],
    review: [
      { title: '语义规则', text: '条款符合性', detail: '按已发布规则检查必需要素和数值。' },
      { title: '本体逻辑', text: '概念约束', detail: '校验指标、项目、时间节点的关系是否闭合。' },
      { title: '图谱推理', text: '跨文档', detail: '在六类文书间比对同一实体。' },
      { title: '策略组合', text: '自适应', detail: '定型审查启用一致性+完整性+术语三项策略。' },
      { title: '结果回写', text: '批注与建议', detail: '问题分级，并绑定依据。' },
    ],
  }
  const flowNodes = computed(() => flows[props.page.flowKey] || flows.probe)
  const flowOn = ref(flowNodes.value[0])
  const flowChain = computed(() => {
    const nodes = flowNodes.value
    const result = []
    nodes.forEach((n, i) => {
      result.push({ ...n, idx: i, isArrow: false, key: n.title })
      if (i < nodes.length - 1) result.push({ isArrow: true, key: n.title + '-arrow' })
    })
    return result
  })

  const canvases = {
    agent: [
      { title: '问题分类', sub: '组件', x: 30, y: 40, input: 'query', output: 'intent', detail: '区分指标问答、方案生成和审查三类问题。' },
      { title: '知识检索', sub: '组件', x: 220, y: 40, input: 'intent', output: 'passages', detail: '调用资源库统一接口召回证据。' },
      { title: '条件分支', sub: '组件', x: 410, y: 40, input: 'intent', output: 'branch', detail: '审查类走冲突比对，其余走抽取。' },
      { title: '文档提取', sub: '组件', x: 220, y: 180, input: 'fileId', output: 'blocks', detail: '调用解析模块获取章节。' },
      { title: '参数提取', sub: '组件', x: 410, y: 180, input: 'blocks', output: 'indicators', detail: '按指标模式抽取数值。' },
      { title: '代码执行', sub: '组件', x: 600, y: 180, input: 'indicators', output: 'judge', detail: '计算是否超出允差。' },
      { title: 'HTTP 请求', sub: '组件', x: 410, y: 320, input: 'payload', output: 'response', detail: '回写业务系统。' },
    ],
    entity: [
      { title: '战技指标', sub: '实体', x: 40, y: 60, input: '总要求/大纲', output: '指标实体', detail: '抽取名称、数值、单位、允差。' },
      { title: '试验项目', sub: '实体', x: 250, y: 60, input: '大纲/报告', output: '项目实体', detail: '抽取方法与样本量。' },
      { title: '验证', sub: '约束', x: 250, y: 210, input: '项目 → 指标', output: '关系', detail: '方向：项目验证指标，禁止反向缺失。' },
      { title: '时间节点', sub: '实体', x: 460, y: 60, input: '总案', output: '节点', detail: '计划时间不得晚于报告形成时间。' },
    ],
    review: [
      { title: '任务规划', sub: '智能体', x: 40, y: 80, input: '审查目标', output: '步骤', detail: '自主规划单文档或跨文档路径。' },
      { title: '术语技能包', sub: '技能', x: 240, y: 40, input: '正文', output: '术语问题', detail: '加载术语一致性技能。' },
      { title: '数值技能包', sub: '技能', x: 240, y: 180, input: '指标', output: '冲突', detail: '比对六类文书中的同一指标。' },
      { title: '人工确认', sub: '交互', x: 460, y: 110, input: '问题清单', output: '复核意见', detail: '审查人员可改判等级。' },
    ],
  }
  const canvasNodes = computed(() => canvases[props.page.canvasKey] || canvases.agent)
  const canvasOn = ref(canvasNodes.value[0])
  const canvasLinks = computed(() => canvasNodes.value.slice(0, -1).map((n, i) => [n, canvasNodes.value[i + 1]]))

  const cardSets = {
    knowledge: [
      { tag: '平台卡片', title: '轮式拖拉机动力指标', text: '汇总标定功率、PTO 功率、标定转速的常见问法与标准出处。' },
      { tag: '平台卡片', title: '牵引性能鉴定方法', text: '牵引力、滑转率、牵引功率的试验条件与判定要点。' },
      { tag: '个人卡片', title: '我的收获机械问答', text: '基于当前账号近期提问，聚合总损失率、含杂率、破碎率。' },
      { tag: '参数卡片', title: '东方红-LF2204', text: '162 kW / 38.6 kN / MTBF 375 h，可跳转原文。' },
      { tag: '方法卡片', title: '可靠性试验', text: '有效度、故障分类和 MTBF 计算步骤。' },
      { tag: '个人卡片', title: '待核对指标', text: '滑转率、播种合格率仍处于待审核。' },
    ],
    modalPref: [
      { tag: '文本', title: '要点与关系', text: '提取章节主旨、指标与数值、项目与方法的语义关系。' },
      { tag: '图像', title: '文字与图形', text: '识别铭牌、曲线图坐标和表格截图。' },
      { tag: '视频', title: '事件导览', text: '按作业过程切分事件，标记异常片段。' },
      { tag: '跨模态', title: '对照策略', text: '同一指标在文本、表格、影像中的值必须可对齐。' },
    ],
    fusion: [
      { tag: '推荐', title: '东方红 LF2204 / LX2204', text: '型号相近，建议融合为企业产品系列，保留各自试验。' },
      { tag: '推荐', title: '滑转率 / 打滑率', text: '术语同义，融合到规范名“滑转率”。' },
      { tag: '预览', title: '融合后节点', text: '指标节点减少 2 个，关系保持可追溯。' },
    ],
    layers: [
      { tag: '原始库', title: '未处理的原始资料', text: '定型报告、扫描件、影像按采集原样留存，可回溯到现场记录与原始文件。' },
      { tag: '基础库', title: '解析后的结构化数据', text: '对原始资料解析切分，形成章节、表格、实体和指标，可被抽取与审查直接引用。' },
      { tag: '推理库', title: '二次分析产出知识', text: '在基础库之上推理出图谱、探针结论、问答对和创新点，直接支撑智能体调用。' },
    ],
    trainParam: [
      { tag: '默认', title: '训练集 90%', text: '测试集 10%，适用于指标抽取指令数据。' },
      { tag: '默认', title: 'LoRA rank 16', text: '学习率 1e-4，可在微调系统中覆盖。' },
      { tag: '手动', title: '长文审查', text: '建议降低批大小，保留更长上下文。' },
    ],
    judgeTpl: [
      { tag: '决策层', title: '年度技术研判', text: '含成熟度、趋势、优先级、高价值方向。' },
      { tag: '专业组', title: '拖拉机专题', text: '按传动、液压、电控三条技术原理展开。' },
      { tag: '项目', title: '立项查重简报', text: '八个维度的相似度对照表。' },
    ],
  }
  const cardList = computed(() => cardSets[props.page.cardKey] || cardSets.knowledge)

  const papers = {
    compare: {
      title: '东方红-LF2204 技术状态阶段对比',
      meta: 'B1（2025-11）  →  B2（2026-03）  →  定型（2026-10）',
      sections: [
        { h: '变更内容', p: 'B2 增加 1000 r/min 动力输出转速，传动比调整，其余整机布置保持不变。' },
        { h: '影响分析', p: 'PTO 试验需覆盖双转速；牵引性能限值不变。滑转率问题已归零，不改变定型结论。' },
        { h: '原文回溯', p: '设计任务书第 4 章、定型报告第 3 章、问题归零单 Q-2026-0618。' },
      ],
    },
    topic: {
      title: '轮式拖拉机牵引性能专题',
      meta: '个性化专题 · 依据 Mona 近期问答生成 · 可下载',
      sections: [
        { h: '一、指标定义', p: '牵引力、滑转率、牵引功率构成牵引性能的基本观测项。' },
        { h: '二、LF2204 实测', p: '最大牵引力 38.6 kN，滑转率 8.2%，牵引功率 118.4 kW。' },
        { h: '三、方法要点', p: '混凝土路面、规定配重、负荷车加载。多媒体：牵引曲线图、现场影像片段。' },
      ],
    },
    probe: {
      title: '牵引力滑转异常解读报告',
      meta: '探针：牵引力滑转耦合 · 2026-10-18',
      sections: [
        { h: '异常描述', p: '滑转率在最大牵引力点达到 8.2%，高于该场地历史均值。' },
        { h: '根因', p: '前配重不足。图谱中 2024 年同类机型有相同路径。' },
        { h: '处置', p: '增加前配重并复测。复测后滑转率回落，问题归零。' },
      ],
    },
    scheme: {
      title: 'LF2204 轮式拖拉机定型试验方案（初稿）',
      meta: '模板 V2.1 · 试验因子 24 个 · 可编辑',
      sections: [
        { h: '1 试验依据', p: 'NY/T 2090-2025、DG/T 001-2025，以及研制总要求中的动力、牵引、安全指标。' },
        { h: '2 因子设计', p: '覆盖转速、负荷、挡位、配重、路面、环境温度等 24 个因子，不少于指标要求的 20 个。' },
        { h: '3 资源', p: '300 kN 负荷车、电涡流测功机、洛阳混凝土跑道。' },
      ],
    },
    outline: {
      title: '性能试验大纲提纲',
      meta: '已做术语校准',
      sections: [
        { h: '1 任务来源', p: '依据试验总案和研制总要求。' },
        { h: '2 试验项目', p: '动力输出、牵引、制动、噪声、可靠性。' },
        { h: '3 判定准则', p: '指标数值不得低于总要求，方法符合 DG/T 001。' },
      ],
    },
    std: {
      title: 'DG/T 001-2025 审查要点',
      meta: '自动解析结果',
      sections: [
        { h: '结构', p: '范围、规范性引用文件、术语、试验条件、试验方法、判定规则。' },
        { h: '审查要点', p: '动力、牵引、安全、可靠性章节不得缺失；数值须带单位。' },
      ],
    },
    api: {
      title: '统一数据与模型服务接口',
      meta: '供智能体和业务平台调用',
      sections: [
        { h: 'GET /kb/passages', p: '按知识库、分类和语义检索高精度参考片段，返回原文位置。' },
        { h: 'POST /model/chat', p: '指定模型版本、温度、Top P、Top K，返回生成结果与置信度。' },
        { h: 'POST /agent/run', p: '按智能体标识执行已发布工作流，返回结构化结果。' },
      ],
    },
    review: {
      title: 'LF2204 定型文件一致性审查报告',
      meta: '问题 7 项 · 高 2 · 中 3 · 低 2',
      sections: [
        { h: '审查逻辑', p: '先抽取六类文书实体，再按一致性、完整性、术语三条策略联合推理。' },
        { h: '主要问题', p: '报告牵引力 36.2 kN 与大纲 38 kN 不一致；大纲缺少环境条件章节。' },
        { h: '溯源', p: '依据：跨文档一致性规则 V1.4；原文位于大纲 P.12 与报告 P.36。' },
      ],
    },
    tree: {
      title: '三级技术体系',
      meta: '技术原理 / 试验类型 / 应用领域',
      sections: [
        { h: '传动与控制', p: '无级变速、牵引滑转控制、负荷传感液压。对应牵引试验与 PTO 试验。' },
        { h: '收获损失', p: '割台、脱粒、剥皮、清选。对应田间收获试验。' },
        { h: '变量作业', p: '施药决策、播种监测。对应植保与播种试验。' },
      ],
    },
    judge: {
      title: '拖拉机传动技术研判报告',
      meta: '模板：年度技术研判 · 决策层',
      sections: [
        { h: '技术成熟度', p: '机械传动成熟，无级变速与滑转闭环控制处于工程化验证阶段。' },
        { h: '趋势', p: '电控传动与作业质量闭环是高价值方向。' },
        { h: '优先级', p: '建议优先安排牵引滑转控制的鉴定方法研究。' },
      ],
    },
  }
  const paper = computed(() => papers[props.page.reportKey] || papers.scheme)

  const statPack = {
    situation: {
      kpis: [
        { label: '在试任务', value: '6', unit: '项' },
        { label: '占用资源', value: '14', unit: '台套' },
        { label: '异常问题', value: '3', unit: '项' },
        { label: '已出结果', value: '11', unit: '份' },
      ],
      chart: { title: '本周试验任务', data: [['牵引', 4], ['PTO', 3], ['收获', 2], ['可靠', 2], ['安全', 1]] },
      dist: [{ name: '任务', v: 40 }, { name: '资源', v: 35 }, { name: '环境', v: 25 }],
    },
    probe: {
      kpis: [
        { label: '历史探针问题', value: '86', unit: '条' },
        { label: '配重类成因', value: '22', unit: '条' },
        { label: '传感器类', value: '15', unit: '条' },
        { label: '已关闭', value: '71', unit: '条' },
      ],
      chart: { title: '近六月异常趋势', data: [['5月', 9], ['6月', 14], ['7月', 11], ['8月', 8], ['9月', 7], ['10月', 6]] },
      dist: [{ name: '配重与附着', v: 36 }, { name: '仪器', v: 24 }, { name: '操作', v: 22 }, { name: '环境', v: 18 }],
    },
    agent: {
      kpis: [
        { label: '在线智能体', value: '6', unit: '个' },
        { label: 'CPU', value: '37', unit: '%' },
        { label: '内存', value: '52', unit: '%' },
        { label: '调度时延', value: '1.6', unit: 's' },
      ],
      chart: { title: '今日调用', data: [['抽取', 120], ['审查', 80], ['问答', 96], ['方案', 34], ['探针', 28]] },
      dist: [{ name: '成功', v: 96 }, { name: '超时', v: 3 }, { name: '失败', v: 1 }],
    },
    default: {
      kpis: [
        { label: '累计上传', value: '286', unit: '项' },
        { label: '已审核', value: '214', unit: '项' },
        { label: '待审核', value: '37', unit: '项' },
        { label: '存储占用', value: '1.8', unit: 'TB' },
      ],
      chart: { title: '近7日历史上传', data: [['10-13', 18], ['10-14', 26], ['10-15', 15], ['10-16', 32], ['10-17', 22], ['10-18', 12], ['10-19', 20]] },
      dist: [{ name: '定型资料', v: 46 }, { name: '历史试验', v: 28 }, { name: '标准规范', v: 16 }, { name: '专业文献', v: 10 }],
    },
  }
  const pack = computed(() => statPack[props.page.statsKey] || statPack.default)
  const statKpis = computed(() => pack.value.kpis)
  const statChart = computed(() => pack.value.chart)
  const dist = computed(() => pack.value.dist)
  const statMax = computed(() => Math.max(...statChart.value.data.map((d) => d[1])))

  // ── 镜头一（M01）数据资源目录 两级页面 ──────────────────────────────

  const m01Resources = useRows('resources')

  // 左侧分类目录树与数据资源管理共用八类口径
  const m01Cats = computed(() => {
    const all = m01Resources
    const cats = resourceCategories
    const list = [{ key: 'all', label: '全部资料', count: all.length }]
    cats.forEach((c) => list.push({ key: c, label: c, count: all.filter((r) => r.cat === c).length }))
    return list
  })

  const m01ActiveCat = ref('all')
  const m01Search = ref('')
  const m01Page = ref(1)
  const m01PageSize = 15

  const m01FilteredRows = computed(() => {
    let rows = m01Resources
    if (m01ActiveCat.value !== 'all') rows = rows.filter((r) => r.cat === m01ActiveCat.value)
    if (m01Search.value.trim()) rows = rows.filter((r) => r.name.includes(m01Search.value.trim()))
    return rows
  })
  const m01VisibleRows = computed(() => m01FilteredRows.value.slice((m01Page.value - 1) * m01PageSize, m01Page.value * m01PageSize))
  watch([m01ActiveCat, m01Search], () => { m01Page.value = 1 })

  // 密级 mock（按类别默认）
  function m01Secret(cat) {
    return { '论证立项': '秘密', '方案设计': '秘密', '工程研制': '秘密', '试验鉴定': '内部', '定型与验收': '内部', '批产与保障': '内部', '成果与知识产权': '内部', '过程管理': '内部' }[cat] || '内部'
  }

  // 第二级：处理结果详情
  const m01Detail = ref(null)
  const m01SelChapter = ref(null)
  const m01SelSub = ref(null)

  function m01OpenDetail(row) {
    const detail = resourceDetails[row.name]
    if (!detail) { toast('该资源暂无处理结果详情'); return }
    m01Detail.value = { ...detail, secret: m01Secret(row.cat) }
    m01SelChapter.value = detail.chapters?.[0]?.id || null
    m01SelSub.value = null
  }

  // ── 镜头三（M03）标准化数据建模 ──────────────────────────────────────

  // 指标树列表：从 sessionStorage（demo-store）恢复，切平台 / 刷新不丢；关 tab 才清空
  const m03List = ref(getPersistedM03List())
  watch(
    m03List,
    (val) => persistM03List(val),
    { deep: true },
  )

  const m03DetailOpen = ref(false)
  const m03CurrentRow = ref(null)
  function m03FlatNodes(nodes = []) {
    const res = []
    nodes.forEach((n) => {
      res.push(n)
      if (n.children) res.push(...m03FlatNodes(n.children))
    })
    return res
  }

  /** 按来源文档抽取结果 + 所选性能域，生成/裁剪指标树（与列表 count 联动） */
  function buildM03TreeForRow(row) {
    if (row?.tree?.length) {
      return cloneDeep(row.tree)
    }
    const tree = cloneDeep(m03TreeData)
    const domainSet = Array.isArray(row?.domains) && row.domains.length
      ? new Set(row.domains)
      : null
    const root = tree[0]
    if (domainSet && root?.children) {
      root.children = root.children.filter((d) => domainSet.has(d.name))
    }

    // 用 M02 抽取结果回填叶子指标值 / 页码，保证与「指标数据提取」同源
    const srcKey = row?.srcDoc || ''
    const m02Rows = [
      ...getM02RowsForDoc(srcKey),
      ...getM02RowsForDoc('某型研制总要求（D-01）'),
      ...getM02RowsForDoc('某型装备研制总要求.pdf'),
    ]
    const byName = new Map()
    m02Rows.forEach((r) => {
      if (r?.name && !byName.has(r.name)) byName.set(r.name, r)
    })

    m03FlatNodes(tree).forEach((node) => {
      if (node.level === 3) {
        const hit = byName.get(node.name)
        if (hit) {
          const unit = hit.unit ? ` ${hit.unit}` : ''
          node.value = `${hit.value}${unit}`.trim()
          node.srcPage = hit.srcPage || node.srcPage || 12
          node.srcText = hit.srcText
          node.highlight = hit.highlight
          node.srcDoc = hit.srcDoc || srcKey
        }
      }
    })

    root?.children?.forEach((d) => {
      const leaves = m03FlatNodes([d]).filter((n) => n.level === 3)
      d.badge = leaves.length
      d.open = true
    })
    return tree
  }

  function m03ApplyTreeForRow(row) {
    m03Tree.value = buildM03TreeForRow(row)
    const leaves = m03FlatNodes(m03Tree.value).filter((n) => n.level === 3)
    if (row) {
      row.count = leaves.length
      if (!Array.isArray(row.domains) || !row.domains.length) {
        row.domains = m03FlatNodes(m03Tree.value)
          .filter((n) => n.level === 1)
          .map((n) => n.name)
      }
    }
    m03SelId.value = leaves[0]?.id || m03Tree.value[0]?.id || 'root'
  }

  function m03SnapshotTreeToRow() {
    const row = m03CurrentRow.value
    if (!row) return
    row.tree = cloneDeep(m03Tree.value)
    row.count = m03FlatNodes(m03Tree.value).filter((n) => n.level === 3).length
  }

  function m03OpenDetail(row) {
    // 始终挂到列表中的同一引用，保证详情顶栏与列表字段联动
    const src = row || m03List.value[0]
    const hit = src?.id ? m03List.value.find((r) => r.id === src.id) : src
    m03CurrentRow.value = hit || src
    m03ApplyTreeForRow(m03CurrentRow.value)
    m03DetailOpen.value = true
  }
  function m03SaveToStore() {
    const cur = m03CurrentRow.value || m03List.value[0]
    if (!cur) {
      toast('未找到当前指标树', 'error')
      return
    }
    const row = m03List.value.find((r) => r.id === cur.id) || cur
    try {
      m03SnapshotTreeToRow()
    } catch (err) {
      console.error(err)
      toast('保存失败，请重试', 'error')
      return
    }
    const version = (row?.version || 'V1.0').replace(/^指标树\s*/, '')
    const leafCount = m03FlatNodes(m03Tree.value).filter((n) => n.level === 3).length
    const count = leafCount || row?.count || 28
    row.count = count
    row.status = '已发布'
    row.publishedAt = nowText()
    m03CurrentRow.value = row
    updateMetricTree(version, count)
    toast(`已同步指标树 ${version}（${count} 项），发布时间 ${row.publishedAt}`, 'success')
  }

  // ── 新建指标树弹窗（蒙版 + 来源文档/性能域/指标数联动）────────────────
  const m03CreateVisible = ref(false)
  const m03CreateForm = reactive({
    version: '',
    srcKey: '',
    srcDoc: '',
    domains: [...m02Domains],
    status: '草稿',
    remark: '',
  })

  const m03SrcOptions = computed(() => {
    const rows = useRows('resources') || []
    const fromRes = rows
      .filter((r) => r.status === '已解析')
      .map((r) => ({
        value: r.name,
        label: r.name,
        count: getM02CountForDoc(r.name),
      }))
    const extras = [
      { value: 'D-01《某型研制总要求》', label: 'D-01《某型研制总要求》', count: 28 },
    ]
    const seen = new Set()
    return [...extras, ...fromRes].filter((o) => {
      if (seen.has(o.value)) return false
      seen.add(o.value)
      return true
    })
  })

  const m03CreatePreviewCount = computed(() => {
    const key = m03CreateForm.srcKey || m03CreateForm.srcDoc
    if (!key) return 0
    const rows = getM02RowsForDoc(key)
    if (rows.length) {
      const set = new Set(m03CreateForm.domains)
      return rows.filter((r) => set.has(r.domain)).length
    }
    // D-01 展示名无扩展名时按全量 × 域占比估算
    const total = getM02CountForDoc(key) || (isD01Label(key) ? 28 : 0)
    if (!total) return 0
    if (m03CreateForm.domains.length >= m02Domains.length) return total
    return Math.max(1, Math.round((total * m03CreateForm.domains.length) / m02Domains.length))
  })

  function isD01Label(name = '') {
    return /D-01|研制总要求/.test(String(name))
  }

  function nextM03VersionLabel() {
    let maxMinor = 10 // V1.0 → 10
    m03List.value.forEach((row) => {
      const m = String(row.version || '').match(/V(\d+)\.(\d+)/i)
      if (m) {
        const n = Number(m[1]) * 10 + Number(m[2])
        if (n > maxMinor) maxMinor = n
      }
    })
    const next = maxMinor + 1
    return `指标树 V${Math.floor(next / 10)}.${next % 10}`
  }

  function m03OpenCreate() {
    m03CreateForm.version = nextM03VersionLabel()
    m03CreateForm.status = '草稿'
    m03CreateForm.remark = ''
    m03CreateForm.domains = [...m02Domains]
    const prefer = m03SrcOptions.value.find((o) => isD01Label(o.value) || getM02CountForDoc(o.value) > 0)
      || m03SrcOptions.value[0]
    m03CreateForm.srcKey = prefer?.value || ''
    m03CreateForm.srcDoc = prefer?.label || ''
    m03CreateVisible.value = true
  }

  function m03OnSrcChange(val) {
    m03CreateForm.srcKey = val
    const hit = m03SrcOptions.value.find((o) => o.value === val)
    m03CreateForm.srcDoc = hit?.label || val
    // 换文档时默认全选性能域，指标数随之联动
    m03CreateForm.domains = [...m02Domains]
  }

  function m03ToggleDomain(d) {
    const i = m03CreateForm.domains.indexOf(d)
    if (i >= 0) {
      if (m03CreateForm.domains.length <= 1) {
        toast('至少保留一个性能域', 'warning')
        return
      }
      m03CreateForm.domains.splice(i, 1)
    } else {
      m03CreateForm.domains.push(d)
    }
  }

  function m03SubmitCreate() {
    if (!m03CreateForm.version?.trim()) {
      toast('请填写版本号', 'error')
      return
    }
    if (!m03CreateForm.srcKey && !m03CreateForm.srcDoc) {
      toast('请选择关联来源文档', 'error')
      return
    }
    if (!m03CreateForm.domains.length) {
      toast('请至少选择一个性能域', 'error')
      return
    }
    const count = m03CreatePreviewCount.value
    if (!count) {
      toast('当前来源文档暂无可用指标，请更换文档或检查抽取结果', 'error')
      return
    }
    const row = {
      id: `v-${Date.now()}`,
      version: m03CreateForm.version.trim().startsWith('指标树')
        ? m03CreateForm.version.trim()
        : `指标树 ${m03CreateForm.version.trim()}`,
      srcDoc: m03CreateForm.srcDoc || m03CreateForm.srcKey,
      count,
      status: m03CreateForm.status || '草稿',
      publishedAt: m03CreateForm.status === '已发布' ? nowText() : null,
      domains: [...m03CreateForm.domains],
      remark: m03CreateForm.remark || '',
    }
    m03List.value.unshift(row)
    m03CreateVisible.value = false
    toast(`已新建 ${row.version}（${count} 项），关联 ${row.srcDoc}`, 'success')
  }

  // 四级树：打开详情时按「来源文档 × 性能域」重建；编辑后快照写回列表行
  const m03Tree = ref(cloneDeep(m03TreeData))

  const m03SelId = ref('i-jd-1')

  const m03AllNodes = computed(() => m03FlatNodes(m03Tree.value))
  const m03SelNode = computed(() => m03AllNodes.value.find((n) => n.id === m03SelId.value) || null)

  function m03Select(node) { m03SelId.value = node.id }
  const m03AllExpanded = computed(() => {
    const nodes = m03AllNodes.value.filter((n) => n.children?.length)
    return nodes.length > 0 && nodes.every((n) => n.open)
  })
  function m03ExpandAll() {
    const expand = !m03AllExpanded.value
    m03AllNodes.value.forEach((n) => {
      if (n.children?.length) n.open = expand
    })
  }

  const m03SrcDocLabel = computed(() => m03CurrentRow.value?.srcDoc || 'D-01《某型研制总要求》')

  function m03ExtOf(name = '') {
    const i = String(name).lastIndexOf('.')
    return i >= 0 ? String(name).slice(i + 1).toUpperCase() : ''
  }
  const m03SrcIconKind = computed(() => {
    const ext = m03ExtOf(m03SrcDocLabel.value)
    if (/PDF/.test(ext) || /研制总要求|D-01/.test(m03SrcDocLabel.value)) return 'pdf'
    if (/DOC/.test(ext)) return 'word'
    if (/XLS|CSV/.test(ext)) return 'excel'
    return 'file'
  })
  const m03SrcIconText = computed(() => {
    const kind = m03SrcIconKind.value
    if (kind === 'pdf') return 'PDF'
    if (kind === 'word') return 'DOCX'
    if (kind === 'excel') return 'XLS'
    return 'DOC'
  })

  // ── 编辑属性弹窗 ─────────────────────────────────────────────────────
  const m03EditVisible = ref(false)
  const m03EditForm = reactive({
    name: '',
    value: '',
    criteriaType: '定量',
    examMethod: '实测',
    srcSection: '',
    srcPage: 12,
  })
  const m03CriteriaOptions = ['定量', '定性', '阈值', '阈值+定量']
  const m03ExamOptions = ['实测', '试验', '检验', '测试', '统计', '仿真', '查验']

  function m03OpenEdit() {
    const n = m03SelNode.value
    if (!n || n.level !== 3) {
      toast('请先选择叶子指标项再编辑', 'warning')
      return
    }
    const trace = findM03Trace(n.name)
    m03EditForm.name = n.name || ''
    m03EditForm.value = n.value || ''
    m03EditForm.criteriaType = n.criteriaType || '定量'
    m03EditForm.examMethod = n.examMethod || '实测'
    m03EditForm.srcSection = n.srcSection || ''
    m03EditForm.srcPage = n.srcPage || trace?.srcPage || 12
    m03EditVisible.value = true
  }

  function m03SaveEdit() {
    const n = m03SelNode.value
    if (!n) return
    if (!m03EditForm.name?.trim()) {
      toast('指标名称不能为空', 'error')
      return
    }
    if (!m03EditForm.value?.trim()) {
      toast('指标值不能为空', 'error')
      return
    }
    n.name = m03EditForm.name.trim()
    n.value = m03EditForm.value.trim()
    n.criteriaType = m03EditForm.criteriaType
    n.examMethod = m03EditForm.examMethod
    n.srcSection = m03EditForm.srcSection?.trim() || n.srcSection
    n.srcPage = Number(m03EditForm.srcPage) || n.srcPage || 12
    m03SnapshotTreeToRow()
    m03EditVisible.value = false
    toast('指标属性已更新', 'success')
  }

  // ── 原文追溯弹窗 ─────────────────────────────────────────────────────
  const m03TraceVisible = ref(false)
  const m03Trace = ref(null)

  function findM03Trace(indicatorName = '') {
    const srcKey = m03CurrentRow.value?.srcDoc || ''
    const rows = [
      ...getM02RowsForDoc(srcKey),
      ...getM02RowsForDoc('某型研制总要求（D-01）'),
      ...getM02RowsForDoc('某型装备研制总要求.pdf'),
    ]
    const hit = rows.find((r) => r.name === indicatorName)
    if (hit) return hit
    const node = m03SelNode.value
    if (!node) return null
    return {
      name: node.name,
      value: String(node.value || '').replace(/\s*[a-zA-Z/%°]+.*$/, '').trim() || node.value,
      unit: '',
      srcDoc: m03SrcDocLabel.value,
      srcPage: node.srcPage || 12,
      highlight: node.name,
      srcText: `${node.srcSection || '相关条款'}\n${node.name}：${node.value}\n（根据指标树节点与来源章节生成的追溯摘要，可结合原文 PDF 核对。）`,
    }
  }

  function m03TraceHtml(trace) {
    if (!trace?.srcText) return ''
    const phrase = trace.highlight || ''
    const escaped = String(trace.srcText)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/\n/g, '<br/>')
    if (!phrase) return escaped
    const safe = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    return escaped.replace(new RegExp(safe, 'g'), `<mark class="m03-hl">${phrase}</mark>`)
  }

  function m03OpenTrace() {
    const n = m03SelNode.value
    if (!n || n.level !== 3) {
      toast('请先选择叶子指标项再追溯原文', 'warning')
      return
    }
    const trace = findM03Trace(n.name)
    if (!trace) {
      toast('未找到对应原文片段', 'warning')
      return
    }
    m03Trace.value = {
      ...trace,
      srcDoc: trace.srcDoc || m03SrcDocLabel.value,
      html: m03TraceHtml(trace),
    }
    m03TraceVisible.value = true
  }

  function m03OpenSourceQuick() {
    m03OpenTrace()
  }

  // ── 镜头四（M08）试验方案生成结果 ────────────────────────────────────
  // 二级页按列表「状态」切换内容：已定稿=镜头四完整结果；已归档/草稿为不同进度快照。
  // 「多轮校核优化」对话来自方案生成过程中沉淀的历史记录（非本页现场即时问答）；
  // 草稿态可输入补充一轮演示；已定稿/已归档只读展示历史。

  const m08StepsBase = [
    { name: '选定考核指标' },
    { name: '配置试验因子' },
    { name: '选择模板与案例' },
    { name: '生成预览' },
  ]

  const m08FactorsFull = [
    { name: '温度', levels: '−41℃贮存 / −41℃工作 / 常温 / +55℃', cat: '环境' },
    { name: '路面', levels: '硬路面 / 砂石 / 泥泞', cat: '环境' },
    { name: '最大公路速度', levels: '≥ 65 km/h', cat: '机动' },
    { name: '最大越野速度', levels: '≥ 35 km/h', cat: '机动' },
    { name: '最大行程', levels: '≥ 500 km', cat: '机动' },
    { name: '爬坡度', levels: '≥ 30°', cat: '机动' },
    { name: '涉水深度', levels: '≥ 1.2 m', cat: '机动' },
    { name: '主炮口径', levels: '125 mm', cat: '火力' },
    { name: '穿甲弹初速', levels: '≥ 1700 m/s', cat: '火力' },
    { name: '射速', levels: '6–8 发/min', cat: '火力' },
    { name: '最大射程', levels: '≥ 4000 m', cat: '火力' },
    { name: '首发命中概率', levels: '≥ 0.85', cat: '火力' },
    { name: 'MTBF', levels: '≥ 320 h', cat: '可靠性' },
    { name: 'MTTR', levels: '≤ 2 h', cat: '可靠性' },
    { name: '使用可用度', levels: '≥ 0.92', cat: '可靠性' },
    { name: '防护等级', levels: 'RHA 600 mm / 核生化', cat: '防护' },
    { name: '防尘防水', levels: 'IP67 / IP6X', cat: '环境' },
    { name: '传导发射', levels: '≤ RE102 B类', cat: '电磁' },
    { name: '辐射敏感度', levels: '≥ RS103 C类', cat: '电磁' },
    { name: '态势感知刷新率', levels: '≥ 2 Hz', cat: '信息' },
    { name: '通信距离', levels: '≥ 30 km', cat: '信息' },
    { name: '目标识别距离', levels: '≥ 3000 m', cat: '信息' },
  ]

  const m08LinkIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="#1668a8" stroke-width="2" style="width:13px;height:13px;display:inline;vertical-align:middle"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>'

  const m08ChaptersFull = [
    { no: '第一章', title: '试验目的', content: '本试验旨在对某型进行全面性能鉴定，验证各项技术指标是否满足研制总要求（D-01）规定的性能指标，为定型提供依据。<br><br>试验依据：《某型研制总要求》（D-01）、军标 GJB 4239-2001。' },
    { no: '第二章', title: '试验条件', content: '2.1 环境条件<br>试验在标准试验场地进行，温度范围 −41℃ 至 +55℃，分贮存工况与工作工况两类。路面条件覆盖硬路面、砂石路面、泥泞路面三类。<br><br>2.2 试验<br>受试编号：SB-2026-001，配置标准弹药基数，燃油满载。' },
    { no: '第三章', title: '试验项目与方法', content: `3.1 机动性能试验<br>3.1.1 最大公路速度：在硬路面直线段测量，取三次均值，判据 <b style="color:#0d4e83">≥ 65 km/h ${m08LinkIcon}</b>（引自指标树 D-01·4.1.1）<br><br>3.1.2 最大越野速度：砂石路面测量，判据 <b style="color:#0d4e83">≥ 35 km/h ${m08LinkIcon}</b>（引自指标树 D-01·4.1.2）<br><br>3.2 电磁兼容考核（第1轮对话新增）<br>按 GJB 1389B 执行传导发射与辐射敏感度测试，判据 ≤ RE102 B类 / ≥ RS103 C类。` },
    { no: '第四章', title: '测量要求', content: '4.1 速度测量：使用标定 GPS 测速仪，精度 ±0.2 km/h。<br>4.2 火力测量：弹道测量仪精度 ±0.5 m/s，计时精度 ±0.01 s。<br>4.3 可靠性记录：故障严格按 GJB 451A 分类，A 类故障单独统计。' },
    { no: '第五章', title: '数据处理与判据', content: `5.1 判据引用自指标树 V1.0<br><br><table style="border-collapse:collapse;width:100%;font-size:13px"><thead><tr style="background:#eaf3fa"><th style="padding:6px 10px;text-align:left;border:1px solid #dce8f2">指标名称</th><th style="padding:6px 10px;text-align:left;border:1px solid #dce8f2">判据</th><th style="padding:6px 10px;border:1px solid #dce8f2">来源</th></tr></thead><tbody><tr><td style="padding:6px 10px;border:1px solid #dce8f2">最大公路速度</td><td style="padding:6px 10px;border:1px solid #dce8f2;font-weight:600;color:#0d4e83">≥ 65 km/h</td><td style="padding:6px 10px;border:1px solid #dce8f2;text-align:center">${m08LinkIcon}</td></tr><tr><td style="padding:6px 10px;border:1px solid #dce8f2">首发命中概率</td><td style="padding:6px 10px;border:1px solid #dce8f2;font-weight:600;color:#0d4e83">≥ 0.85</td><td style="padding:6px 10px;border:1px solid #dce8f2;text-align:center">${m08LinkIcon}</td></tr><tr><td style="padding:6px 10px;border:1px solid #dce8f2">MTBF</td><td style="padding:6px 10px;border:1px solid #dce8f2;font-weight:600;color:#0d4e83">≥ 320 h</td><td style="padding:6px 10px;border:1px solid #dce8f2;text-align:center">${m08LinkIcon}</td></tr></tbody></table>` },
  ]

  /** 按大纲模板 + 历史案例生成有差异的草稿大纲（生成预览用） */
  function m08BuildDraftChapters(row) {
    const tpl = row?.template || '性能鉴定试验大纲模板'
    const cs = row?.caseName || '某型定型性能鉴定案例（2024）'
    const tree = row?.treeVer || '指标树 V1.0'
    const ik = m08LinkIcon

    if (tpl.includes('可靠性')) {
      return [
        {
          no: '第一章',
          title: '试验目的',
          content: `本试验按<strong>可靠性鉴定试验大纲</strong>组织，验证某型在规定任务剖面下的 MTBF / MTTR / 使用可用度是否满足研制总要求。<br><br>大纲骨架：${tpl}<br>相似案例参考：${cs}<br>判据来源：${tree}`,
        },
        {
          no: '第二章',
          title: '试验条件',
          content: '2.1 任务剖面<br>综合道路行驶、火力射击、待机贮存三类剖面，累计试验时间按 GJB 899A 统计。<br><br>2.2 受试与保障<br>受试编号：SB-REL-2026-001；保障按二级维修体制配置备件与检测设备。',
        },
        {
          no: '第三章',
          title: '试验项目与方法',
          content: `3.1 可靠性增长与鉴定<br>3.1.1 MTBF：判据 <b style="color:#0d4e83">≥ 320 h ${ik}</b>（引自 ${tree}）<br>3.1.2 MTTR：判据 <b style="color:#0d4e83">≤ 2 h ${ik}</b><br>3.1.3 使用可用度：判据 <b style="color:#0d4e83">≥ 0.92 ${ik}</b><br><br>3.2 故障分类<br>按 GJB 451A 区分 A/B/C 类故障；参考案例「${cs}」中 A 类故障处置流程纳入本大纲。`,
        },
      ]
    }

    if (tpl.includes('环境')) {
      return [
        {
          no: '第一章',
          title: '试验目的',
          content: `本试验按<strong>环境适应性试验大纲</strong>组织，考核某型在高低温、湿热、砂尘等环境应力下的功能保持与性能衰减。<br><br>大纲骨架：${tpl}<br>相似案例参考：${cs}<br>关联指标树：${tree}`,
        },
        {
          no: '第二章',
          title: '试验条件',
          content: '2.1 环境应力<br>温度：−41℃ 贮存 / −41℃ 工作 / +55℃ 工作；湿度：湿热循环按 GJB 150.9A；砂尘：扬尘浓度按任务剖面设置。<br><br>2.2 场地与工装<br>寒区场、湿热箱、扬尘道联合使用；受试编号：SB-ENV-2026-001。',
        },
        {
          no: '第三章',
          title: '试验项目与方法',
          content: `3.1 高低温适应性<br>3.1.1 低温贮存后启动：判据满足功能恢复时限（引自 ${tree}） ${ik}<br>3.1.2 高温工作稳定性：关键参数漂移不超过门限 ${ik}<br><br>3.2 湿热与砂尘<br>参照案例「${cs}」补入湿热长时浸泡与扬尘密封检查条目。`,
        },
      ]
    }

    // 性能鉴定模板：再按案例侧重拉开差异
    if (cs.includes('寒区') || cs.includes('电磁')) {
      return [
        {
          no: '第一章',
          title: '试验目的',
          content: `本试验在<strong>性能鉴定</strong>框架下，突出<strong>寒区环境 + 电磁兼容</strong>联合考核，验证机动与 EMC 指标是否满足研制总要求。<br><br>大纲骨架：${tpl}<br>案例取材：${cs}<br>指标树：${tree}`,
        },
        {
          no: '第二章',
          title: '试验条件',
          content: '2.1 寒区环境<br>−41℃ 贮存与工作分列考核；路面含硬路面、砂石、泥泞。<br><br>2.2 EMC 试验条件<br>按 GJB 1389B 布置屏蔽室与传导/辐射测点；受试编号：SB-EMC-2026-019。',
        },
        {
          no: '第三章',
          title: '试验项目与方法',
          content: `3.1 寒区机动<br>3.1.1 最大公路速度：判据 <b style="color:#0d4e83">≥ 65 km/h ${ik}</b><br>3.1.2 涉水深度：判据 <b style="color:#0d4e83">≥ 1.2 m ${ik}</b><br><br>3.2 电磁兼容（案例强化）<br>传导发射 ≤ RE102 B类；辐射敏感度 ≥ RS103 C类；条目结构参考「${cs}」。`,
        },
      ]
    }

    if (cs.includes('高原')) {
      return [
        {
          no: '第一章',
          title: '试验目的',
          content: `本试验在<strong>性能鉴定</strong>框架下，突出<strong>高原低气压与动力保持</strong>考核，验证机动与信息能力在海拔工况下的达标情况。<br><br>大纲骨架：${tpl}<br>案例取材：${cs}<br>指标树：${tree}`,
        },
        {
          no: '第二章',
          title: '试验条件',
          content: '2.1 高原条件<br>试验海拔约 4200 m；气温与气压按高原场实测记录。<br><br>2.2 受试配置<br>受试编号：SB-PLT-2026-007；燃油、润滑按高原规程调整。',
        },
        {
          no: '第三章',
          title: '试验项目与方法',
          content: `3.1 高原机动<br>3.1.1 最大越野速度：判据 <b style="color:#0d4e83">≥ 35 km/h ${ik}</b>（高原修正）<br>3.1.2 爬坡度：判据 <b style="color:#0d4e83">≥ 30° ${ik}</b><br><br>3.2 信息与测控<br>遥测链路与态势刷新率按「${cs}」补充高原丢包容限说明。`,
        },
      ]
    }

    if (cs.includes('湿热')) {
      return [
        {
          no: '第一章',
          title: '试验目的',
          content: `本试验在<strong>性能鉴定</strong>框架下，强化<strong>湿热长时考核</strong>与密封防潮条款，验证防护与可靠性相关指标。<br><br>大纲骨架：${tpl}<br>案例取材：${cs}<br>指标树：${tree}`,
        },
        {
          no: '第二章',
          title: '试验条件',
          content: '2.1 湿热剖面<br>温度/湿度循环按 GJB 150.9A；长时浸泡不少于案例「' + cs + '」建议时长。<br><br>2.2 场地<br>湿热箱 + 露天湿热场；受试编号：SB-HUM-2026-011。',
        },
        {
          no: '第三章',
          title: '试验项目与方法',
          content: `3.1 湿热后机动复测<br>恢复常温后复查最大公路速度、最大行程等关键机动指标 ${ik}<br><br>3.2 防护与密封<br>防尘防水等级复查（IP67 / IP6X）；霉菌与凝露检查条目引自案例「${cs}」。`,
        },
      ]
    }

    // 默认：标准性能鉴定 + 定型类案例
    return [
      {
        no: '第一章',
        title: '试验目的',
        content: `本试验旨在对某型进行全面<strong>性能鉴定</strong>，验证各项技术指标是否满足研制总要求，为定型提供依据。<br><br>大纲骨架：${tpl}<br>相似案例参考：${cs}<br>试验依据：研制总要求、军标 GJB 4239-2001；判据映射自 ${tree}。`,
      },
      {
        no: '第二章',
        title: '试验条件',
        content: '2.1 环境条件<br>温度范围 −41℃ 至 +55℃，分贮存工况与工作工况；路面覆盖硬路面、砂石、泥泞。<br><br>2.2 受试<br>受试编号：SB-2026-001，配置标准弹药基数，燃油满载。',
      },
      {
        no: '第三章',
        title: '试验项目与方法',
        content: `3.1 机动性能试验<br>3.1.1 最大公路速度：判据 <b style="color:#0d4e83">≥ 65 km/h ${ik}</b>（引自 ${tree}）<br>3.1.2 最大越野速度：判据 <b style="color:#0d4e83">≥ 35 km/h ${ik}</b><br><br>3.2 火力与命中<br>首发命中概率判据 <b style="color:#0d4e83">≥ 0.85 ${ik}</b>；章节编排参考「${cs}」。`,
      },
    ]
  }

  const m08RoundsFull = [
    {
      time: '10-05 14:22',
      user: '补充关键词"电磁兼容考核"',
      bot: '已在第三章"试验项目与方法"中新增 3.2 节"电磁兼容考核"，按 GJB 1389B 标准执行传导发射与辐射敏感度测试，涉及因子已同步更新。',
      diff: '新增 3.2 节电磁兼容考核，新增因子：传导发射（≤ RE102 B类）、辐射敏感度（≥ RS103 C类）',
    },
    {
      time: '10-06 09:41',
      user: '设计思路：寒区因子细化',
      bot: '已将温度因子从"−41℃/常温/+55℃"拆分为"−41℃贮存 / −41℃工作 / 常温 / +55℃"四个水平，寒区工作与贮存分别考核，方案因子总数维持 22 个。',
      diff: '温度因子水平由 3 个扩展为 4 个：新增"−41℃工作"水平，与"−41℃贮存"分列',
    },
    {
      time: '10-07 16:08',
      user: '判据与指标树核对',
      bot: '已对第五章判据表全面核对并自动回填：最大公路速度 ≥ 65 km/h、首发命中概率 ≥ 0.85、MTBF ≥ 320 h 等 22 项指标值均引用自指标树 V1.0，每项右侧标注来源链接。',
      diff: '判据表新增来源引用标注：22 项指标值与指标树 V1.0 完成映射，3 项低置信度指标以橙色标注',
    },
  ]

  const m08VersionsFull = [
    { ver: 'V1', label: '初稿', time: '10-04 09:11', final: false },
    { ver: 'V2', label: '一轮优化', time: '10-05 14:35', final: false },
    { ver: 'V3', label: '二轮优化', time: '10-06 09:55', final: false },
    { ver: 'V4', label: '定稿', time: '10-08 10:42', final: true },
  ]

  /** 按方案状态组装二级页快照（步骤进度 / 因子 / 对话轮次 / 版本条不同） */
  function buildM08Snapshot(row) {
    const status = row?.status || '草稿'
    if (status === '已定稿') {
      return {
        doneSteps: 4,
        factors: m08FactorsFull,
        factorOk: true,
        chapters: schemeDocChapters.map((item) => ({ ...item })),
        activeChapter: 2,
        rounds: m08CloneRounds(schemeDocRounds),
        versions: schemeDocVersions.map((item) => ({ ...item })),
        previewBadge: 'V4.0 三轮优化',
        chatReadonly: true,
        chatHint: '定稿方案仅展示历史校核记录（生成过程中沉淀，非本页即时问答）',
        showMatch: true,
        readonlyFactors: true,
      }
    }
    if (status === '已归档') {
      return {
        doneSteps: 4,
        factors: m08FactorsFull.slice(0, 18),
        factorOk: false,
        chapters: m08ChaptersFull.map((c, i) => (i === 2
          ? { ...c, content: '3.1 机动性能试验<br>3.1.1 最大公路速度……（归档快照，电磁兼容节已纳入）' }
          : c)),
        activeChapter: 0,
        rounds: m08RoundsFull.slice(0, 2),
        versions: m08VersionsFull.slice(0, 3).map((v, i, arr) => ({ ...v, final: i === arr.length - 1 })),
        previewBadge: 'V3 已归档',
        chatReadonly: true,
        chatHint: '归档方案只读，历史对话不可追加',
        showMatch: false,
        readonlyFactors: true,
      }
    }
    // 草稿：可对话优化；轮次/版本条与 row 上沉淀数据联动
    const draftRounds = Array.isArray(row?.rounds) ? row.rounds.map((r) => ({ ...r })) : []
    const draftVersions = Array.isArray(row?.versions) && row.versions.length
      ? row.versions.map((v, i, arr) => ({ ...v, final: i === arr.length - 1 }))
      : [{ ver: 'V1', label: '初稿', time: '10-04 09:11', final: true }]
    const lastVer = draftVersions[draftVersions.length - 1]
    // 进度：显式 doneSteps 优先；有模板且已有 chapters 视为已生成预览；仅有模板则为待生成
    let doneSteps = row?.doneSteps
    if (doneSteps == null) {
      if (row?.template && Array.isArray(row?.chapters) && row.chapters.length) doneSteps = 4
      else if (row?.template) doneSteps = 3
      else doneSteps = 2
    }
    doneSteps = Math.max(0, Math.min(4, Number(doneSteps) || 0))
    const previewReady = doneSteps >= 4
    return {
      doneSteps,
      factors: Array.isArray(row?.factors) && row.factors.length
        ? row.factors.map((f) => ({ ...f }))
        : m08FactorsFull.slice(0, 12).map((f) => (
          f.name === '温度' ? { ...f, levels: '−41℃ / 常温 / +55℃' } : f
        )),
      factorOk: false,
      // 大纲正文仅在「生成预览」完成后产出；此前为空
      chapters: previewReady
        ? (Array.isArray(row?.chapters) && row.chapters.length
          ? row.chapters.map((c) => ({ ...c }))
          : m08BuildDraftChapters(row))
        : [],
      activeChapter: 0,
      rounds: draftRounds,
      versions: draftVersions,
      previewBadge: previewReady
        ? (lastVer ? `${lastVer.ver} ${lastVer.label}` : 'V1 草稿')
        : '待生成',
      chatReadonly: !previewReady,
      chatHint: previewReady
        ? '继续输入优化要求。思考只引用系统内的专家、技能、大纲和指标，生成后可点击查看文档'
        : '请先完成步骤「生成预览」，再进行多轮校核优化',
      showMatch: false,
      readonlyFactors: false,
      previewReady,
    }
  }

  // 方案列表：sessionStorage 恢复，切平台/刷新不丢
  const m08List = ref(getPersistedM08List())
  watch(m08List, (val) => persistM08List(val), { deep: true })

  const m08DetailOpen = ref(false)
  const m08CurrentRow = ref(null)
  const m08Snap = ref(buildM08Snapshot(m08List.value[0]))
  const m08SelFactor = ref(0)
  const m08ActiveChapter = ref(0)
  const m08ChatInput = ref('')
  const m08Steps = m08StepsBase
  const m08FocusStep = ref(-1)
  const m08FocusVer = ref('')
  const m08StepDialog = ref(false)
  const m08StepDialogIdx = ref(0)
  const m08NewFactorSeq = ref(1)

  // ── 新建方案弹窗 ─────────────────────────────────────────────────────
  const m08CreateVisible = ref(false)
  const m08CreateForm = reactive({
    name: '',
    ver: 'V1',
    projectId: '',
    treeVer: '',
    template: '',
    status: '草稿',
    remark: '',
    openAfter: true,
  })
  const m08Projects = [
    { id: 'proj-qual', name: '某型装备性能鉴定试验', treeVer: '指标树 V1.0' },
    { id: 'proj-type', name: '定型试验项目', treeVer: '指标树 V1.0' },
    { id: 'proj-perf', name: '性能鉴定试验项目', treeVer: '指标树 V1.0' },
    { id: 'proj-rel', name: '可靠性试验项目', treeVer: '指标树 V1.0' },
  ]
  const m08PickedIds = ref([])
  const m08Generating = ref(false)
  const m08GenProgress = ref(0)
  let m08GenTimer = null

  const m08IndicatorRows = computed(() => {
    if (!m08CreateForm.treeVer) return []
    const all = getM02RowsForDoc('某型装备研制总要求')
    return String(m08CreateForm.treeVer).includes('0.9') ? all.slice(0, 24) : all
  })

  const m08TemplateCards = [
    { name: '装备设计定型性能鉴定试验方案模板', brief: '适用于设计定型阶段，围绕战术技术指标、功能性能、边界性能开展考核。', recommend: true },
    { name: '装备生产定型一致性鉴定试验方案模板', brief: '适用于批量生产定型，重点验证工艺稳定性、产品一致性和批产质量控制能力。' },
    { name: '可靠性鉴定与验收试验方案模板', brief: '依据 GJB 899A 等要求，覆盖 MTBF、故障判据、抽样方案、统计试验方案等内容。' },
    { name: '环境适应性与特殊环境试验方案模板', brief: '依据 GJB 150A 系列，覆盖高低温、湿热、振动、冲击、盐雾、砂尘等环境考核。' },
    { name: '作战试验与部队适用性试验方案模板', brief: '面向近似实战条件，考核作战使用性能、人机适应性、保障性、机动性、安全性等。' },
    { name: '智能化装备与软件系统试验方案模板', brief: '面向含算法、软件、指控、感知、协同等能力的装备，重点考核算法鲁棒性、实时性、可解释性和系统协同能力。' },
  ]

  const m08TemplateOptions = m08TemplateCards.map((item) => item.name)

  const m08CaseOptions = [
    '寒区电磁兼容历史案例',
    '高原环境适应性试验案例',
    '某型定型性能鉴定案例（2024）',
    '湿热环境长时考核案例',
  ]

  const m08TplForm = reactive({
    template: m08TemplateOptions[0],
    caseName: m08CaseOptions[0],
  })

  /** 步骤1：考核指标（指标树 + 性能域） */
  const m08IndForm = reactive({
    treeVer: '指标树 V1.0',
    domains: [...m02Domains],
  })

  /** 步骤2：因子配置（策略 + 纳入类别） */
  const m08FactorStepForm = reactive({
    strategy: '标准',
    cats: ['环境', '机动', '火力', '防护', '可靠性', '电磁', '信息'],
  })

  const m08FactorStrategies = [
    { value: '精简', label: '精简（约 12 个）', count: 12 },
    { value: '标准', label: '标准（约 18 个）', count: 18 },
    { value: '完整', label: '完整（≥ 20 个）', count: 22 },
  ]

  const M08_DOMAIN_TO_CAT = {
    机动: '机动',
    火力: '火力',
    防护: '防护',
    可靠性: '可靠性',
    环境适应性: '环境',
    电磁兼容: '电磁',
    信息能力: '信息',
  }

  const m08FactorCatOptions = ['环境', '机动', '火力', '防护', '可靠性', '电磁', '信息']

  const m08TreeOptions = computed(() => {
    const fromM03 = (m03List.value || [])
      .filter((r) => r.status === '已发布' || r.status === '草稿')
      .map((r) => ({
        value: r.version,
        label: r.version,
        count: r.count,
        status: r.status,
      }))
    const fallback = [
      { value: '指标树 V1.0', label: '指标树 V1.0', count: 28, status: '已发布' },
      { value: '指标树 V0.9', label: '指标树 V0.9', count: 24, status: '草稿' },
    ]
    const seen = new Set()
    return [...fromM03, ...fallback].filter((o) => {
      if (seen.has(o.value)) return false
      seen.add(o.value)
      return true
    })
  })

  function m08OpenCreate() {
    m08CreateForm.name = '某型装备性能鉴定试验方案'
    m08CreateForm.ver = 'V1'
    m08CreateForm.projectId = ''
    m08CreateForm.treeVer = ''
    m08CreateForm.template = ''
    m08CreateForm.status = '草稿'
    m08CreateForm.remark = ''
    m08CreateForm.openAfter = true
    m08PickedIds.value = []
    m08CreateVisible.value = true
  }

  const m08PublishedTrees = computed(() => m08TreeOptions.value
    .filter((item) => item.status === '已发布')
    .map((item) => ({
      ...item,
      label: item.count >= 28
        ? `${item.value}（7 个性能域 / 11 个指标类 / ${item.count} 项指标）`
        : `${item.value}（${item.count || 0} 项指标）`,
    })))

  const m08WizardFactors = [
    { name: '目标类型', levels: '固定靶 / 运动靶', cat: '火力' },
    { name: '目标距离', levels: '1000 m / 1500 m / 2000 m', cat: '火力' },
    { name: '弹种', levels: '杀伤爆破弹 / 破甲弹', cat: '火力' },
    { name: '装药号', levels: '全装药 / 二号装药', cat: '火力' },
    { name: '射击方式', levels: '单发 / 连发', cat: '火力' },
    { name: '射向方式', levels: '首发 / 齐射', cat: '火力' },
    { name: '海拔高度', levels: '平原 / 高原', cat: '环境' },
    { name: '能见度', levels: '良好 / 一般', cat: '环境' },
    { name: '温度', levels: '常温 / 高温 / 低温', cat: '环境' },
    { name: '风速', levels: '静风 / 3～5 级 / 5 级以上', cat: '环境' },
    { name: '气压', levels: '标准 / 低压', cat: '环境' },
    { name: '操作人员', levels: '基准班组 / 加强班组', cat: '保障' },
    { name: '弹药批次', levels: '批次 A / 批次 B', cat: '火力' },
    { name: '姿势状态', levels: '立姿 / 卧姿', cat: '火力' },
    { name: '供电方式', levels: '车载电源 / 外接电源', cat: '保障' },
    { name: '通信工况', levels: '开机 / 关机', cat: '信息' },
    { name: '振动工况', levels: '静止 / 行驶后', cat: '环境' },
    { name: '贮存经历', levels: '新研装备 / 列装装备', cat: '保障' },
  ]

  const m08QuickFactors = [
    { name: '路面', levels: '硬路面 / 砂石 / 泥泞', cat: '环境' },
    { name: '目标运动速度', levels: '静止 / 15 km/h / 30 km/h', cat: '火力' },
    { name: '电磁环境', levels: '满足 GJB 151B / GJB 181A', cat: '电磁' },
    { name: '低温工作', levels: '−41℃正常启动', cat: '环境' },
  ]

  const m08Wizard = ref(false)
  const m08FactorName = ref('')

  function m08ToggleIndicator(id) {
    const list = m08PickedIds.value
    const index = list.indexOf(id)
    if (index >= 0) list.splice(index, 1)
    else list.push(id)
  }

  function m08ToggleAllIndicators() {
    const rows = m08IndicatorRows.value
    m08PickedIds.value = m08PickedIds.value.length === rows.length ? [] : rows.map((row) => row.id)
  }

  function m08SyncFactors(factors) {
    m08Snap.value.factors = factors.map((item) => ({ ...item }))
    m08Snap.value.factorOk = factors.length >= 20
    const row = m08CurrentRow.value
    if (row) {
      row.factors = factors.map((item) => ({ ...item }))
      row.updatedAt = nowText()
    }
  }

  const m08AutoTreeLabel = computed(() => {
    if (!m08CreateForm.treeVer) return ''
    return m08PublishedTrees.value.find((item) => item.value === m08CreateForm.treeVer)?.label || m08CreateForm.treeVer
  })

  function m08SelectProject(id) {
    const project = m08Projects.find((item) => item.id === id)
    const published = m08PublishedTrees.value.find((item) => item.value === project?.treeVer)
    m08CreateForm.treeVer = published?.value || ''
    m08PickedIds.value = []
  }

  function m08GoFactorStep() {
    if (!m08CreateForm.name?.trim()) {
      toast('请填写方案名称', 'warning')
      return
    }
    if (!m08CreateForm.projectId) {
      toast('请先选择试验项目', 'warning')
      return
    }
    if (!m08CreateForm.treeVer) {
      toast('该项目暂无已发布指标树', 'warning')
      return
    }
    if (!m08PickedIds.value.length) {
      toast('请勾选本次考核指标', 'warning')
      return
    }
    const picked = m08IndicatorRows.value.filter((row) => m08PickedIds.value.includes(row.id))
    const factors = m08WizardFactors.map((item) => ({ ...item }))
    const row = {
      id: `m-${Date.now()}`,
      name: m08CreateForm.name.trim(),
      ver: 'V1',
      project: m08Projects.find((item) => item.id === m08CreateForm.projectId)?.name || '',
      treeVer: m08CreateForm.treeVer,
      template: '',
      caseName: '',
      status: '草稿',
      updatedAt: nowText(),
      remark: `考核指标 ${picked.length} 项`,
      doneSteps: 1,
      wizard: true,
      factors,
      picked: picked.map((item) => ({ id: item.id, name: item.name, criteria: item.criteria })),
      domains: [...new Set(picked.map((item) => item.domain).filter(Boolean))],
      chapters: [],
      rounds: [],
      versions: [{ ver: 'V1', label: '初稿', time: nowText().slice(5), final: true }],
    }
    m08List.value.unshift(row)
    m08CreateVisible.value = false
    m08Wizard.value = true
    m08OpenDetail(row)
    m08FocusStep.value = 1
  }

  function m08QuickAddFactor(item) {
    const factors = m08Snap.value.factors || []
    if (factors.some((factor) => factor.name === item.name)) {
      toast(`「${item.name}」已在因子列表中`, 'warning')
      return
    }
    m08SyncFactors([...factors, { ...item }])
  }

  function m08AddFactorLine() {
    const name = m08FactorName.value.trim()
    if (!name) {
      toast('请输入因子名', 'warning')
      return
    }
    m08QuickAddFactor({ name, levels: '待配置', cat: '自定义' })
    m08FactorName.value = ''
  }

  function m08WizardNextFactors() {
    const count = m08Snap.value.factors?.length || 0
    if (count < 1) {
      toast('请至少配置一个试验因子', 'warning')
      return
    }
    m08Snap.value.doneSteps = 2
    if (m08CurrentRow.value) m08CurrentRow.value.doneSteps = 2
    m08FocusStep.value = 2
  }

  function m08PickTemplate(name) {
    m08TplForm.template = name
    if (m08CurrentRow.value) {
      m08CurrentRow.value.template = name
      m08CurrentRow.value.updatedAt = nowText()
    }
  }

  function m08WizardBack() {
    const step = Math.max(1, (m08Snap.value.doneSteps || 2) - 1)
    m08Snap.value.doneSteps = step
    if (m08CurrentRow.value) m08CurrentRow.value.doneSteps = step
    m08FocusStep.value = step
  }

  function m08WizardToPreview() {
    const name = m08TplForm.template || m08CurrentRow.value?.template
    if (!name) {
      toast('请先选择一个大纲模板', 'warning')
      return
    }
    if (m08CurrentRow.value) m08CurrentRow.value.template = name
    m08Snap.value.doneSteps = 3
    if (m08CurrentRow.value) m08CurrentRow.value.doneSteps = 3
    m08FocusStep.value = 3
  }

  function m08CloneRounds(rounds) {
    return rounds.map((item) => ({
      ...item,
      think: (item.think || []).map((step) => ({ ...step })),
    }))
  }

  function m08ApplyFullDoc(row) {
    if (!row) return
    row.fullDoc = true
    row.chapters = schemeDocChapters.map((item) => ({ ...item }))
    row.rounds = []
    row.versions = [{ ver: 'V1.0', label: '初稿', time: nowText().slice(5, 16), final: true }]
    row.ver = 'V1.0'
    row.doneSteps = 4
    row.wizard = false
    row.updatedAt = nowText()
  }

  function m08ChapterKey(chapter) {
    return chapter?.id || chapter?.no || ''
  }

  function m08OpenAnchor(id) {
    const chapters = m08Snap.value.chapters || []
    const next = {}
    chapters.forEach((chapter) => {
      next[m08ChapterKey(chapter)] = m08ChapterKey(chapter) === id
    })
    if (id && !next[id] && chapters[0]) next[m08ChapterKey(chapters[0])] = true
    Object.keys(m08ChapterOpen).forEach((key) => { delete m08ChapterOpen[key] })
    Object.assign(m08ChapterOpen, next)
  }

  function m08ToggleChapter(id) {
    m08ChapterOpen[id] = !m08ChapterOpen[id]
    m08TocId.value = id
  }

  function m08ToggleAllChapters() {
    const chapters = m08Snap.value.chapters || []
    const open = chapters.some((chapter) => !m08ChapterOpen[m08ChapterKey(chapter)])
    chapters.forEach((chapter) => { m08ChapterOpen[m08ChapterKey(chapter)] = open })
  }

  function m08FoldDoc() {
    m08DocShown.value = !m08DocShown.value
    if (m08DocShown.value) m08OpenAnchor(m08TocId.value || 'c1')
  }

  function m08JumpDoc(id) {
    m08DocShown.value = true
    m08TocId.value = id
    m08ChapterOpen[id] = true
    window.setTimeout(() => {
      document.querySelector(`#doc-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 40)
  }

  function m08ViewRoundDoc(round) {
    if (!round) return
    m08DocShown.value = true
    m08FocusVer.value = round.resultVer || m08FocusVer.value
    const hit = (m08Snap.value.versions || []).find((item) => item.ver === round.resultVer)
    if (hit) m08Snap.value.previewBadge = `${hit.ver} ${hit.label}`
    if (round.anchor) m08OpenAnchor(round.anchor)
    window.setTimeout(() => {
      const anchor = round.anchor ? `#doc-${round.anchor}` : '.m08-stage .m08-doc'
      document.querySelector(anchor)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 60)
  }

  function m08StartGenerate() {
    if (m08Generating.value) return
    const row = m08CurrentRow.value
    if (!row?.template) {
      toast('请先选择大纲模板', 'warning')
      return
    }
    m08Generating.value = true
    m08GenProgress.value = 6
    toast('初稿生成中，逐节装配', 'success')
    clearInterval(m08GenTimer)
    m08GenTimer = setInterval(() => {
      m08GenProgress.value = Math.min(100, m08GenProgress.value + 8)
      if (m08GenProgress.value < 100) return
      clearInterval(m08GenTimer)
      m08GenTimer = null
      m08ApplyFullDoc(row)
      m08Snap.value.chapters = row.chapters.map((item) => ({ ...item }))
      m08Snap.value.rounds = []
      m08Snap.value.versions = row.versions.map((item) => ({ ...item }))
      m08Snap.value.doneSteps = 4
      m08Snap.value.previewReady = true
      m08Snap.value.previewBadge = 'V1.0 初稿'
      m08Snap.value.chatReadonly = false
      m08Snap.value.chatHint = '继续输入优化要求。思考只引用系统内的专家、技能、大纲和指标，生成后可点击查看文档'
      m08FocusVer.value = 'V1.0'
      m08ActiveChapter.value = 0
      m08Generating.value = false
      m08Wizard.value = false
      m08FocusStep.value = 3
      toast('大纲初稿已生成', 'success')
      m08EnsureGenTalk()
    }, 420)
  }

  const m08InWizard = computed(() => m08Wizard.value && (m08Snap.value?.doneSteps || 0) < 4)

  function m08SubmitCreate() {
    if (!m08CreateForm.name?.trim()) {
      toast('请填写方案名称', 'error')
      return
    }
    if (!m08CreateForm.treeVer) {
      toast('请选择关联指标树版本', 'error')
      return
    }
    const ver = (m08CreateForm.ver || 'V1').toUpperCase().replace(/^V?/i, 'V')
    const baseName = m08CreateForm.name.trim().replace(/\s*V\d+(\.\d+)?\s*$/i, '')
    const name = `${baseName} ${ver}`
    const hasTpl = !!m08CreateForm.template
    const draftRow = {
      name,
      ver,
      treeVer: m08CreateForm.treeVer,
      template: m08CreateForm.template,
      caseName: m08CaseOptions[0],
      domains: [...m02Domains],
    }
    // 新建时已选大纲模板 → 默认完成「生成预览」；之后若改选模板再回退需手动生成
    const chapters = hasTpl ? m08BuildDraftChapters(draftRow) : []
    const row = {
      id: `m-${Date.now()}`,
      ...draftRow,
      status: m08CreateForm.status || '草稿',
      updatedAt: nowText(),
      factorStrategy: '标准',
      factorCats: [...m08FactorCatOptions],
      remark: (m08CreateForm.remark || '').trim(),
      doneSteps: hasTpl ? 4 : 2,
      chapters,
    }
    m08List.value.unshift(row)
    m08CreateVisible.value = false
    toast(
      hasTpl
        ? `已新建方案「${row.name}」，已按模板生成大纲预览`
        : `已新建方案「${row.name}」，关联 ${row.treeVer}`,
      'success',
    )
    if (m08CreateForm.openAfter) {
      m08OpenDetail(row)
    }
  }

  const m08StepDetails = [
    {
      title: '选定考核指标',
      body: '从关联指标树勾选本方案需考核的性能域，作为后续因子配置与判据回填的依据。',
      demo: '',
    },
    {
      title: '配置试验因子',
      body: '按考核域与配置策略生成/同步试验因子卡片（也可在页面因子区逐条新增编辑）。',
      demo: '',
    },
    {
      title: '选择模板与案例',
      body: '从标准方案模板库与历史案例中选取大纲骨架与相似案例段落，作为智能生成的结构与措辞参考。',
      demo: '', // 动态展示当前选用，见 m08TplSummary
    },
    {
      title: '生成预览',
      body: '基于指标、因子、模板/案例一键生成大纲全文，进入下方「大纲预览」与「多轮校核优化」。',
      demo: '本页下部左右并排区域即为本步产出；定稿方案四步均已完成。',
    },
  ]

  const m08Factors = computed(() => m08Snap.value.factors)
  const m08Chapters = computed(() => m08Snap.value.chapters)
  const m08Rounds = computed(() => m08Snap.value.rounds)
  const m08Versions = computed(() => m08Snap.value.versions)
  const m08FactorCount = computed(() => m08Factors.value.length)
  const m08ChatStreaming = ref(false)
  const m08StreamText = ref('')
  const m08StreamPhase = ref('')
  const m08StreamThink = ref([])
  const m08StreamStep = ref(-1)
  const m08StreamElapsed = ref(0)
  const m08DocView = ref(false)
  const m08DocShown = ref(false)
  const m08ChapterOpen = reactive({})
  const m08StreamDoc = ref({ index: -1, text: '', caret: false })
  const m08TocId = ref('c1')
  let m08StreamTimer = null
  const m08ChatCanSend = computed(() => !m08Snap.value.chatReadonly && !m08ChatStreaming.value)

  function m08OpenDetail(row) {
    const hit = row?.id ? m08List.value.find((r) => r.id === row.id) : m08List.value[0]
    m08CurrentRow.value = hit || row || m08List.value[0]
    const current = m08CurrentRow.value
    if (current?.status === '已定稿') current.fullDoc = true
    if (
      current
      && current.status === '草稿'
      && Array.isArray(current.picked)
      && current.picked.length
      && (current.doneSteps || 0) >= 4
      && !current.fullDoc
    ) {
      m08ApplyFullDoc(current)
    }
    m08Snap.value = buildM08Snapshot(m08CurrentRow.value)
    m08SelFactor.value = 0
    m08ActiveChapter.value = m08Snap.value.activeChapter
    m08ChatInput.value = ''
    m08FocusStep.value = Math.max(0, m08Snap.value.doneSteps - 1)
    m08NewFactorSeq.value = 1
    // 草稿：若已有对话但版本条未跟上，打开时补齐联动
    const optCount = (m08Snap.value.rounds || []).filter((item) => item.kind !== 'gen').length
    if (
      m08CurrentRow.value?.status === '草稿'
      && optCount + 1 !== (m08Snap.value.versions?.length || 0)
    ) {
      m08SyncVersionsFromRounds()
    }
    m08FocusVer.value = m08Snap.value.versions[m08Snap.value.versions.length - 1]?.ver || ''
    m08Wizard.value = !!(m08CurrentRow.value?.wizard && (m08Snap.value.doneSteps || 0) < 4)
    m08DocView.value = false
    const ready = !!(m08Snap.value.previewReady || (m08Snap.value.doneSteps || 0) >= 4)
    m08DocShown.value = ready && m08CurrentRow.value?.status !== '草稿'
    if (m08DocShown.value) m08OpenAnchor('c1')
    m08DetailOpen.value = true
    if (!m08Wizard.value) m08EnsureGenTalk()
  }

  function m08ScrollTo(sel) {
    requestAnimationFrame(() => {
      const el = document.querySelector(sel)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  const m08IsDraft = computed(() => m08CurrentRow.value?.status === '草稿')
  const m08IsFinal = computed(() => m08CurrentRow.value?.status === '已定稿')

  const m08TplSummary = computed(() => {
    const tpl = m08CurrentRow.value?.template || m08TplForm.template || m08TemplateOptions[0]
    const cs = m08CurrentRow.value?.caseName || m08TplForm.caseName || m08CaseOptions[0]
    return `当前选用：${tpl} + ${cs}`
  })

  const m08IndSummary = computed(() => {
    const tree = m08IndForm.treeVer || m08CurrentRow.value?.treeVer || '—'
    const n = m08IndForm.domains?.length || 0
    return `当前：${tree} · 已选 ${n} 个性能域`
  })

  const m08FactorStepSummary = computed(() => {
    const st = m08FactorStrategies.find((s) => s.value === m08FactorStepForm.strategy)
    const n = m08Snap.value?.factors?.length || 0
    return `策略「${m08FactorStepForm.strategy}」目标约 ${st?.count || 18} 个 · 面板已配置 ${n} 个`
  })

  function m08ToggleIndDomain(d) {
    if (!m08IsDraft.value) return
    const i = m08IndForm.domains.indexOf(d)
    if (i >= 0) {
      if (m08IndForm.domains.length <= 1) {
        toast('至少保留一个性能域', 'warning')
        return
      }
      m08IndForm.domains.splice(i, 1)
    } else {
      m08IndForm.domains.push(d)
    }
  }

  function m08ToggleFactorCat(c) {
    if (!m08IsDraft.value) return
    const i = m08FactorStepForm.cats.indexOf(c)
    if (i >= 0) {
      if (m08FactorStepForm.cats.length <= 1) {
        toast('至少保留一个因子类别', 'warning')
        return
      }
      m08FactorStepForm.cats.splice(i, 1)
    } else {
      m08FactorStepForm.cats.push(c)
    }
  }

  function m08LoadStepForms(i) {
    const row = m08CurrentRow.value
    if (i === 0) {
      m08IndForm.treeVer = row?.treeVer || m08TreeOptions.value[0]?.value || '指标树 V1.0'
      m08IndForm.domains = Array.isArray(row?.domains) && row.domains.length
        ? [...row.domains]
        : [...m02Domains]
    } else if (i === 1) {
      const fromDomains = (Array.isArray(row?.domains) ? row.domains : m02Domains)
        .map((d) => M08_DOMAIN_TO_CAT[d])
        .filter(Boolean)
      m08FactorStepForm.strategy = row?.factorStrategy || '标准'
      m08FactorStepForm.cats = Array.isArray(row?.factorCats) && row.factorCats.length
        ? [...row.factorCats]
        : (fromDomains.length ? [...new Set(fromDomains)] : [...m08FactorCatOptions])
    } else if (i === 2) {
      m08TplForm.template = row?.template || m08TemplateOptions[0]
      m08TplForm.caseName = row?.caseName || m08CaseOptions[0]
    }
  }

  /** 点击四步向导：仅弹说明/配置，不做页内滚动；草稿可继续未完成步骤 */
  function m08ClickStep(i) {
    if (m08Wizard.value && (m08Snap.value.doneSteps || 0) < 4) {
      if (i > m08Snap.value.doneSteps) return
      m08FocusStep.value = i
      return
    }
    const done = m08Snap.value.doneSteps
    if (!m08IsDraft.value && i > done) {
      toast(`「${m08Steps[i].name}」尚未到达（当前完成 ${done}/4 步）`, 'warning')
      return
    }
    m08FocusStep.value = i
    m08StepDialogIdx.value = i
    m08LoadStepForms(i)
    m08StepDialog.value = true
  }

  function m08SaveIndStep() {
    if (!m08IndForm.treeVer) {
      toast('请选择关联指标树', 'warning')
      return false
    }
    if (!m08IndForm.domains.length) {
      toast('请至少选择一个考核性能域', 'warning')
      return false
    }
    const row = m08CurrentRow.value
    if (row) {
      row.treeVer = m08IndForm.treeVer
      row.domains = [...m08IndForm.domains]
      row.updatedAt = nowText()
      // 联动步骤2默认类别
      row.factorCats = [...new Set(m08IndForm.domains.map((d) => M08_DOMAIN_TO_CAT[d]).filter(Boolean))]
    }
    return true
  }

  function m08SaveFactorStep() {
    if (!m08FactorStepForm.cats.length) {
      toast('请至少选择一个因子类别', 'warning')
      return false
    }
    const st = m08FactorStrategies.find((s) => s.value === m08FactorStepForm.strategy) || m08FactorStrategies[1]
    const customs = (m08Snap.value.factors || []).filter((f) => f.cat === '自定义')
    const pool = m08FactorsFull.filter((f) => m08FactorStepForm.cats.includes(f.cat))
    const need = Math.max(1, st.count - customs.length)
    const picked = pool.slice(0, need)
    m08Snap.value.factors = [...picked, ...customs]
    m08Snap.value.factorOk = m08Snap.value.factors.length >= 20
    m08SelFactor.value = 0

    const row = m08CurrentRow.value
    if (row) {
      row.factorStrategy = m08FactorStepForm.strategy
      row.factorCats = [...m08FactorStepForm.cats]
      row.factors = m08Snap.value.factors.map((f) => ({ ...f }))
      row.updatedAt = nowText()
    }
    return true
  }

  /** 模板/案例变更后：回退「生成预览」勾选，清空大纲，需手动重新生成 */
  function m08InvalidatePreviewAfterTplChange() {
    if (!m08IsDraft.value) return
    const wasReady = m08Snap.value.previewReady || (m08Snap.value.doneSteps || 0) >= 4
    m08Snap.value.doneSteps = Math.min(m08Snap.value.doneSteps || 0, 3)
    if (m08Snap.value.doneSteps < 3) m08Snap.value.doneSteps = 3
    m08Snap.value.previewReady = false
    m08Snap.value.chapters = []
    m08Snap.value.previewBadge = '待生成'
    m08Snap.value.chatReadonly = true
    m08Snap.value.chatHint = wasReady
      ? '模板/案例已变更，请重新完成「生成预览」'
      : '请先完成步骤「生成预览」，再进行多轮校核优化'
    m08ActiveChapter.value = 0
    const row = m08CurrentRow.value
    if (row) {
      row.doneSteps = 3
      row.chapters = []
      row.updatedAt = nowText()
    }
  }

  /** 保存步骤 3 的模板与案例选择 */
  function m08SaveTplCase() {
    if (!m08TplForm.template) {
      toast('请选择大纲模板', 'warning')
      return false
    }
    if (!m08TplForm.caseName) {
      toast('请选择历史案例', 'warning')
      return false
    }
    const row = m08CurrentRow.value
    const changed = !row
      || row.template !== m08TplForm.template
      || row.caseName !== m08TplForm.caseName
    if (row) {
      row.template = m08TplForm.template
      row.caseName = m08TplForm.caseName
      row.updatedAt = nowText()
    }
    if (changed) m08InvalidatePreviewAfterTplChange()
    return true
  }

  function m08SaveCurrentStepConfig() {
    const idx = m08StepDialogIdx.value
    if (idx === 0) return m08SaveIndStep()
    if (idx === 1) return m08SaveFactorStep()
    if (idx === 2) return m08SaveTplCase()
    return true
  }

  /** 草稿：完成当前步骤并点亮进度（不跳转页面） */
  function m08ContinueStep() {
    if (!m08IsDraft.value) {
      m08StepDialog.value = false
      return
    }
    const idx = m08StepDialogIdx.value
    if (idx <= 2 && !m08SaveCurrentStepConfig()) return
    const need = idx + 1
    if (m08Snap.value.doneSteps < need) {
      m08Snap.value.doneSteps = Math.min(4, need)
    }
    if (m08Snap.value.doneSteps >= 2) {
      m08Snap.value.readonlyFactors = false
    }
    if (m08Snap.value.doneSteps >= 4) {
      m08Snap.value.previewReady = true
      m08Snap.value.previewBadge = `${m08CurrentRow.value?.ver || 'V1'} 预览`
      m08Snap.value.chatHint = '四步已完成，可继续通过对话优化大纲（草稿）'
      m08Snap.value.chatReadonly = false
      // 每次「生成预览」都按当前模板/案例重算大纲（避免换模板后内容不变）
      const chapters = m08BuildDraftChapters(m08CurrentRow.value)
      m08Snap.value.chapters = chapters
      m08ActiveChapter.value = 0
      if (m08CurrentRow.value) {
        m08CurrentRow.value.chapters = chapters.map((c) => ({ ...c }))
      }
    }
    if (m08CurrentRow.value) m08CurrentRow.value.doneSteps = m08Snap.value.doneSteps
    m08StepDialog.value = false
    toast(`已完成「${m08Steps[idx].name}」`, 'success')
    if (idx === 3) {
      m08ScrollTo('#m08-outline-panel')
    }
  }

  /** 步骤 1~3 弹窗：草稿保存配置并关闭 */
  function m08ConfirmStepConfig() {
    if (m08IsDraft.value) {
      if (!m08SaveCurrentStepConfig()) return
      const tips = [
        '已更新考核指标选用',
        '已同步试验因子配置',
        (m08Snap.value.previewReady || (m08Snap.value.doneSteps || 0) >= 4)
          ? '已更新模板与案例；请重新「生成预览」'
          : '已更新模板与案例选用',
      ]
      // 步骤3若已回退预览，提示以 invalidate 文案为准
      const tip = m08StepDialogIdx.value === 2 && !(m08Snap.value.previewReady)
        ? '已更新模板与案例，请重新完成「生成预览」'
        : (tips[m08StepDialogIdx.value] || '已保存')
      toast(tip, 'success')
    }
    m08StepDialog.value = false
  }

  /** @deprecated 兼容旧导出名 */
  function m08ConfirmTplStep() {
    m08ConfirmStepConfig()
  }

  const m08FactorCats = ['环境', '机动', '火力', '防护', '可靠性', '电磁', '信息', '自定义']
  const m08FactorDialog = ref(false)
  const m08FactorEditIdx = ref(-1)
  const m08FactorForm = reactive({
    name: '',
    levels: '',
    cat: '自定义',
  })

  function m08OpenFactorDialog(editIdx = -1) {
    if (m08Snap.value.readonlyFactors && editIdx < 0) {
      toast('定稿/归档方案不可新增因子', 'warning')
      return
    }
    m08FactorEditIdx.value = editIdx
    if (editIdx >= 0) {
      const f = m08Snap.value.factors[editIdx]
      if (!f) return
      if (m08Snap.value.readonlyFactors) {
        toast('当前状态仅可查看因子', 'warning')
        return
      }
      m08FactorForm.name = f.name || ''
      m08FactorForm.levels = f.levels || ''
      m08FactorForm.cat = f.cat || '自定义'
    } else {
      const n = m08NewFactorSeq.value
      m08FactorForm.name = `自定义因子 ${n}`
      m08FactorForm.levels = ''
      m08FactorForm.cat = '自定义'
    }
    m08FactorDialog.value = true
  }

  function m08AddFactor() {
    m08OpenFactorDialog(-1)
  }

  function m08PersistFactorsToRow() {
    const row = m08CurrentRow.value
    if (!row) return
    row.factors = (m08Snap.value.factors || []).map((f) => ({ ...f }))
    row.updatedAt = nowText()
  }

  function m08RemoveFactor(idx) {
    if (m08Snap.value.readonlyFactors) {
      toast('定稿/归档方案不可删除因子', 'warning')
      return
    }
    const list = m08Snap.value.factors || []
    const hit = list[idx]
    if (!hit) return
    if (list.length <= 1) {
      toast('至少保留 1 个试验因子', 'warning')
      return
    }
    const name = hit.name
    list.splice(idx, 1)
    m08Snap.value.factorOk = list.length >= 20
    if (m08SelFactor.value >= list.length) m08SelFactor.value = Math.max(0, list.length - 1)
    if (m08FactorEditIdx.value === idx) {
      m08FactorDialog.value = false
      m08FactorEditIdx.value = -1
    } else if (m08FactorEditIdx.value > idx) {
      m08FactorEditIdx.value -= 1
    }
    m08PersistFactorsToRow()
    toast(`已删除「${name}」`, 'success')
  }

  function m08SubmitFactor() {
    if (!m08FactorForm.name?.trim()) {
      toast('请填写因子名称', 'warning')
      return
    }
    if (!m08FactorForm.levels?.trim()) {
      toast('请填写取值水平，如 −41℃ / 常温 / +55℃', 'warning')
      return
    }
    const item = {
      name: m08FactorForm.name.trim(),
      levels: m08FactorForm.levels.trim(),
      cat: m08FactorForm.cat || '自定义',
    }
    const idx = m08FactorEditIdx.value
    if (idx >= 0 && m08Snap.value.factors[idx]) {
      Object.assign(m08Snap.value.factors[idx], item)
      m08SelFactor.value = idx
      toast(`已更新「${item.name}」`, 'success')
    } else {
      m08NewFactorSeq.value += 1
      m08Snap.value.factors.push(item)
      m08SelFactor.value = m08Snap.value.factors.length - 1
      toast(`已新增「${item.name}」`, 'success')
    }
    m08Snap.value.factorOk = m08Snap.value.factors.length >= 20
    m08PersistFactorsToRow()
    m08FactorDialog.value = false
  }

  /**
   * 版本条节点 ↔ 右侧「多轮校核优化」对应关系：
   * V1 初稿 = 首次生成结果；V2/V3 = 第1/2 轮对话后；V4 定稿 = 第3 轮对话后定稿。
   * 点击可回溯高亮对应轮次与预览徽章。
   */
  function m08ClickVersion(ver, vi) {
    m08FocusVer.value = ver.ver
    const rounds = m08Snap.value.rounds
    // V1 无对话；V2→第1轮；V3→第2轮；V4→第3轮
    m08DocView.value = false
    const list = rounds || []
    const target = vi === 0
      ? list.find((item) => item.kind === 'gen') || null
      : list.filter((item) => item.kind !== 'gen')[vi - 1]
    const roundIdx = target ? list.indexOf(target) : -1
    if (roundIdx >= 0) {
      m08ScrollTo('#m08-chat-panel')
      requestAnimationFrame(() => {
        document.querySelector(`#m08-round-${roundIdx}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      })
      toast(`${ver.ver}「${ver.label}」`, 'success')
    } else if (vi === 0) {
      m08DocView.value = true
      m08TocId.value = 'c1'
      toast(`${ver.ver} 初稿`, 'success')
    } else {
      toast(`当前快照未包含 ${ver.ver} 对应校核轮次`, 'warning')
    }
    // 演示：切换预览徽章
    m08Snap.value.previewBadge = `${ver.ver} ${ver.label}`
  }

  function m08ExportWord() {
    if (!m08Snap.value.previewReady && (m08Snap.value.doneSteps || 0) < 4) {
      toast('请先完成「生成预览」后再导出', 'warning')
      return
    }
    const name = m08CurrentRow.value?.name || '试验大纲'
    const chapters = m08Snap.value.chapters || []
    if (!chapters.length) {
      toast('暂无大纲内容可导出', 'warning')
      return
    }
    const body = chapters.map((ch) => {
      const html = String(ch.content || '').replace(/<svg[\s\S]*?<\/svg>/gi, '')
      return `<h2>${ch.no} ${ch.title}</h2><div>${html}</div>`
    }).join('\n')
    const html = `<!DOCTYPE html><html xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><title>${name}</title>
<!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View></w:WordDocument></xml><![endif]-->
<style>
body{font-family:SimSun,宋体,serif;font-size:12pt;line-height:1.8;color:#222}
h1{font-size:18pt;text-align:center;color:#0d4e83}
h2{font-size:14pt;color:#0d4e83;margin-top:1.2em;border-bottom:1px solid #ccc;padding-bottom:4px}
table{border-collapse:collapse;width:100%}
th,td{border:1px solid #999;padding:6px 10px}
</style></head><body>
<h1>${name}</h1>
<p>状态：${m08CurrentRow.value?.status || ''}　版本：${m08Snap.value.previewBadge || ''}　关联：${m08CurrentRow.value?.treeVer || ''}</p>
<hr/>
${body}
</body></html>`
    const blob = new Blob(['\ufeff', html], { type: 'application/msword;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${name}.doc`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast('已导出 Word 文档', 'success')
  }

  /** 对话轮次 → 版本条：V1 初稿；第 n 轮 → V(n+1)「n轮优化」 */
  function m08SyncVersionsFromRounds() {
    const roundLabels = ['一轮优化', '二轮优化', '三轮优化', '四轮优化', '五轮优化', '六轮优化']
    const rounds = (m08Snap.value.rounds || []).filter((item) => item.kind !== 'gen')
    const v1Time = m08Snap.value.versions?.[0]?.time || '10-04 09:11'
    const dotted = String(m08Snap.value.versions?.[0]?.ver || '').includes('.')
    const verOf = (n) => (dotted ? `V${n}.0` : `V${n}`)
    const versions = [
      { ver: verOf(1), label: '初稿', time: v1Time, final: rounds.length === 0 },
    ]
    rounds.forEach((r, i) => {
      versions.push({
        ver: verOf(i + 2),
        label: roundLabels[i] || `${i + 1}轮优化`,
        time: r.time,
        final: false,
      })
    })
    versions.forEach((v, i) => { v.final = i === versions.length - 1 })
    m08Snap.value.versions = versions

    const last = versions[versions.length - 1]
    m08Snap.value.previewBadge = `${last.ver} ${last.label}`
    m08FocusVer.value = last.ver

    const row = m08CurrentRow.value
    if (row) {
      row.ver = last.ver
      row.updatedAt = nowText()
      const base = String(row.name || '试验大纲').replace(/\s*V\d+(\.\d+)?\s*$/i, '').trim()
      row.name = `${base} ${last.ver}`
      row.rounds = (m08Snap.value.rounds || []).map((item) => ({
        ...item,
        think: (item.think || []).map((step) => ({ ...step })),
      }))
      row.versions = versions.map((v) => ({ ...v }))
      row.doneSteps = m08Snap.value.doneSteps
      row.factors = (m08Snap.value.factors || []).map((f) => ({ ...f }))
    }
  }

  /** 草稿 → 已定稿：锁定对话/因子，版本末节点标为定稿，可走资源匹配 */
  function m08Finalize() {
    const row = m08CurrentRow.value
    if (!row) return
    if (row.status === '已定稿') {
      toast('当前方案已是定稿状态', 'warning')
      return
    }
    if (row.status === '已归档') {
      toast('归档方案不可再定稿', 'warning')
      return
    }

    const now = new Date()
    const time = `${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    const vers = m08Snap.value.versions || []
    vers.forEach((v) => { v.final = false })
    if (vers.length) {
      const last = vers[vers.length - 1]
      last.label = '定稿'
      last.time = time
      last.final = true
      m08FocusVer.value = last.ver
      row.ver = last.ver
      const base = String(row.name || '试验大纲').replace(/\s*V\d+(\.\d+)?\s*$/i, '').trim()
      row.name = `${base} ${last.ver}`
      m08Snap.value.previewBadge = `${last.ver} 定稿`
    } else {
      m08Snap.value.versions = [{ ver: 'V1', label: '定稿', time, final: true }]
      m08Snap.value.previewBadge = 'V1 定稿'
      row.ver = 'V1'
    }

    row.status = '已定稿'
    row.updatedAt = nowText()
    row.rounds = (m08Snap.value.rounds || []).map((r) => ({ ...r }))
    row.versions = (m08Snap.value.versions || []).map((v) => ({ ...v }))
    row.factors = (m08Snap.value.factors || []).map((f) => ({ ...f }))
    row.doneSteps = 4

    m08Snap.value.doneSteps = 4
    m08Snap.value.chatReadonly = true
    m08Snap.value.readonlyFactors = true
    m08Snap.value.showMatch = true
    m08Snap.value.factorOk = (m08Snap.value.factors?.length || 0) >= 20
    m08Snap.value.chatHint = '定稿方案仅展示历史校核记录（生成过程中沉淀，非本页即时问答）'

    toast(`「${row.name}」已定稿，可进行资源匹配`, 'success')
  }

  /** 已定稿 → 草稿：恢复可编辑与对话迭代，末节点改回「优化」标签 */
  function m08RevertDraft() {
    const row = m08CurrentRow.value
    if (!row) return
    if (row.status !== '已定稿') {
      toast('仅已定稿方案可回退为草稿', 'warning')
      return
    }

    row.status = '草稿'
    row.updatedAt = nowText()

    const vers = m08Snap.value.versions || []
    const roundLabels = ['一轮优化', '二轮优化', '三轮优化', '四轮优化', '五轮优化', '六轮优化']
    vers.forEach((v, i) => {
      v.final = i === vers.length - 1
      if (i === 0) {
        v.label = '初稿'
      } else if (v.label === '定稿') {
        v.label = roundLabels[i - 1] || `${i}轮优化`
      }
    })
    const last = vers[vers.length - 1]
    if (last) {
      m08Snap.value.previewBadge = `${last.ver} ${last.label}`
      m08FocusVer.value = last.ver
    } else {
      m08Snap.value.previewBadge = 'V1 草稿'
    }

    m08Snap.value.chatReadonly = false
    m08Snap.value.readonlyFactors = false
    m08Snap.value.showMatch = false
    m08Snap.value.chatHint = '已回退为草稿，可继续对话优化并联动版本条；定稿前可再次点「定稿」'

    row.rounds = (m08Snap.value.rounds || []).map((r) => ({ ...r }))
    row.versions = vers.map((v) => ({ ...v }))
    row.factors = (m08Snap.value.factors || []).map((f) => ({ ...f }))
    row.doneSteps = m08Snap.value.doneSteps

    toast(`「${row.name}」已回退为草稿，可继续迭代`, 'success')
  }

  function m08EscHtml(value) {
    return String(value).replace(/[&<>"']/g, (ch) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[ch]))
  }

  function m08ClearMarks(html) {
    return String(html || '').replace(/<mark class="m08-hl">([\s\S]*?)<\/mark>/gi, '$1')
  }

  function m08PlainText(html) {
    return String(html || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  }

  function m08ChapterSentence(chapter, text) {
    const plain = m08PlainText(chapter?.content)
    if (!plain) return ''
    const parts = plain.split(/(?<=。)/).map((item) => item.trim()).filter(Boolean)
    const keys = String(text || '').split(/[，。、；\s]+/).filter((item) => item.length >= 2)
    const hit = parts.find((item) => keys.some((key) => item.includes(key))) || parts[0] || plain
    return hit.length > 160 ? `${hit.slice(0, 160)}…` : hit
  }

  function m08PickByRule(text, rules, list, fallbackId) {
    const id = rules.find(([test]) => test.test(text))?.[1] || fallbackId
    return list.find((item) => item.id === id) || list[0]
  }

  function m08MatchExpert(text) {
    return m08PickByRule(text, [
      [/立靶|密集|首发|精度|偏差|火力/, 'ex-fire'],
      [/测量|初速|膛压|光测/, 'ex-measure'],
      [/温补|校靶|复测|第19|第 19/, 'ex-aim'],
      [/气象|寒区|低温|贮存|高低温/, 'ex-weather'],
      [/机动|爬坡|涉水|行驶|越壕|速度/, 'ex-move'],
      [/防护|三防|装甲/, 'ex-protect'],
      [/探测|激光|发现|观瞄|夜视/, 'ex-info'],
      [/通信|电台/, 'ex-info'],
      [/环境|湿热|高原/, 'ex-env'],
      [/可靠|维修|故障|可用度/, 'ex-rel'],
      [/电磁|兼容/, 'ex-emc'],
      [/停试|安全|无效/, 'ex-safe'],
      [/溯源|判据|指标树|核对|页码/, 'ex-evidence'],
    ], schemeExperts, 'ex-outline')
  }

  function m08MatchSkill(text) {
    return m08PickByRule(text, [
      [/立靶|误差|复算|mil/, 'sk-budget'],
      [/复测|超差|第19|第 19/, 'sk-anomaly'],
      [/停试|无效|安全/, 'sk-stop'],
      [/气象|寒区|贮存|低温/, 'sk-weather'],
      [/因子|批次|身管/, 'sk-factor'],
      [/样本|30发|30 发/, 'sk-sample'],
      [/资源|场地|优先级/, 'sk-resource'],
      [/溯源|页码|研制总要求/, 'sk-trace'],
      [/判据|指标树|回填|核对/, 'sk-criteria'],
      [/校核|留痕|版本/, 'sk-review'],
      [/准入|开试|职责/, 'sk-ready'],
    ], schemeSkills, 'sk-outline')
  }

  function m08MatchIndicators(text) {
    const keys = String(text || '').split(/[，。、；\s]+/).filter((item) => item.length >= 2)
    const hits = m02IndRows.filter((item) => (
      text.includes(item.name)
      || keys.some((key) => item.name.includes(key) || item.klass.includes(key))
    ))
    if (hits.length) return hits.slice(0, 3)
    const picked = m08CurrentRow.value?.picked || []
    const fromPicked = picked
      .map((item) => m02IndRows.find((row) => row.id === item.id || row.name === item.name))
      .filter(Boolean)
    if (fromPicked.length) return fromPicked.slice(0, 3)
    return []
  }

  function m08FindChapter(chapters, text) {
    const rules = [
      [/电磁|兼容/, ['环境适应', '电磁'], 8],
      [/寒区|低温|贮存|高原|湿热|高低温/, ['环境适应', '温度'], 8],
      [/立靶|密集度|首发|膛压|初速|射速|射程|精度|火力|偏差/, ['火力'], 2],
      [/机动|爬坡|涉水|行驶|越壕|速度/, ['机动'], 3],
      [/防护|三防|装甲/, ['防护'], 4],
      [/探测|发现|激光|观瞄|夜视/, ['探测'], 5],
      [/通信|电台/, ['通信'], 6],
      [/可靠|维修|故障|可用度/, ['可靠性', '维修'], 7],
      [/异常|复测|停试|无效|超差/, ['异常', '数据管理', '复测'], 9],
      [/因子|资源|组织|矩阵|场地/, ['组织', '资源'], 1],
      [/总则|依据|范围|目的|骨架|装配/, ['总则'], 0],
      [/追溯|版本|判据|核对/, ['追溯'], 10],
    ]
    const hit = rules.find(([test]) => test.test(text))
    const keys = hit?.[1] || ['总则']
    const fallback = hit?.[2] || 0
    const last = Math.max(0, chapters.length - 1)
    const titled = chapters.findIndex((chapter) => keys.some((key) => `${chapter.no || ''}${chapter.title || ''}`.includes(key)))
    if (titled >= 0) return titled
    const inBody = chapters.findIndex((chapter) => keys.some((key) => m08PlainText(chapter.content).includes(key)))
    if (inBody >= 0) return inBody
    return Math.min(Math.max(0, fallback), last)
  }

  function m08ChapterParas(chapter, count = 3) {
    const parts = m08PlainText(chapter?.content).split(/(?<=。)/).map((item) => item.trim()).filter((item) => item.length > 12)
    return parts.slice(0, count).map((item) => (item.length > 240 ? `${item.slice(0, 240)}…` : item))
  }

  function m08IndicatorLine(item) {
    const page = item.srcPage ? `，研制总要求第${item.srcPage}页` : ''
    const klass = item.klass ? `${item.klass}，` : ''
    return `${item.name}：${klass}判据 ${item.criteria || '见指标树'}${page}`
  }

  function m08ResolveIndicators(list) {
    return (list || []).map((item) => (
      m02IndRows.find((row) => row.id === item.id || row.name === item.name) || item
    )).filter((item) => item?.name)
  }

  function m08BuildTalk(text, chapters, kind) {
    if (kind === 'gen') return m08BuildGenScript(chapters)
    const index = m08FindChapter(chapters, text)
    const chapter = chapters[index] || chapters[0] || { no: '', title: '正文', content: '' }
    const expert = m08MatchExpert(text)
    const skill = m08MatchSkill(text)
    const indicators = m08MatchIndicators(text)
    const paras = m08ChapterParas(chapter, 3)
    const where = `${chapter.no || ''} ${chapter.title || ''}`.trim() || '正文'
    const think = [
      {
        label: '1. 对照专家与技能',
        text: `${expert.name}：${expert.brief}\n${skill.name}：${skill.brief}`,
      },
      {
        label: `2. ${where}原文`,
        text: paras.join('\n') || m08ChapterSentence(chapter, text),
      },
    ]
    if (indicators.length) {
      think.push({
        label: '3. 指标树判据',
        text: indicators.map((item) => m08IndicatorLine(item)).join('\n'),
      })
    }
    think.push({
      label: '4. 写入文档',
      text: `以上条款保持指标树口径，写入${where}。思考结束后再展开右侧文档，并高亮这一处。`,
    })
    return {
      chapter: index,
      anchor: chapter.id || '',
      where,
      expertName: expert.name,
      think,
      cite: [skill.brief, ...indicators.map((item) => item.srcText || m08IndicatorLine(item))].filter(Boolean).join(''),
    }
  }

  const m08AlgoNotes = [
    ['向量语义召回', '将方案需求与资源描述编码为向量，按语义相似度召回候选资源'],
    ['大模型推理重排', '在召回结果上由领域大模型按任务约束推理重排'],
    ['知识图谱增强', '沿指标、科目、设备与历史案例的图谱关系扩展并增强排序'],
    ['用户行为序列建模', '按历史方案的资源采纳序列建模，推荐相近试验路径下的资源'],
    ['多模态融合', '融合文本、指标判据、因子与案例画像进行联合匹配'],
    ['多目标优化混合', '语义召回、推理重排、图谱增强与行为序列按多目标加权融合'],
  ]

  function m08IndicatorDigest(list) {
    const rows = list.length ? list : m02IndRows
    const groups = new Map()
    rows.forEach((item) => {
      const key = String(item.klass || '指标').split('/')[0].trim()
      if (!groups.has(key)) groups.set(key, [])
      groups.get(key).push(item)
    })
    return [...groups.entries()].map(([name, items]) => {
      const sample = items.slice(0, 2).map((item) => {
        const conf = item.conf != null ? `，置信度 ${item.conf}` : ''
        return `${item.name} ${item.criteria || ''}${conf}`
      }).join('；')
      return `${name} ${items.length} 项：${sample}`
    }).join('\n')
  }

  function m08BuildGenScript(chapters) {
    const row = m08CurrentRow.value || {}
    const outline = schemeExperts.find((item) => item.id === 'ex-outline') || schemeExperts[0]
    const evidence = schemeExperts.find((item) => item.id === 'ex-evidence')
    const skill = schemeSkills.find((item) => item.id === 'sk-outline') || schemeSkills[0]
    const criteria = schemeSkills.find((item) => item.id === 'sk-criteria') || schemeSkills[1]
    const picked = m08ResolveIndicators(row.picked)
    const library = picked.length ? picked : m02IndRows
    const head = chapters[0] || { no: '第一章', title: '总则', content: '' }
    const focus = chapters.find((item) => `${item.title || ''}`.includes('火力')) || chapters[Math.min(2, chapters.length - 1)] || head
    const factors = (m08Snap.value.factors || row.factors || []).slice(0, 6)
    const tree = row.treeVer || '指标树 V1.0'
    const tpl = row.template || '装备设计定型性能鉴定试验方案模板'
    return {
      chapter: Math.max(0, chapters.indexOf(focus)),
      anchor: focus.id || head.id || 'c1',
      where: `${focus.no || ''} ${focus.title || ''}`.trim(),
      expertName: outline.name,
      cite: '',
      think: [
        {
          label: '读取依据',
          text: `按「${tpl}」和${tree}装配，共 ${library.length} 项指标、${chapters.length} 章。\n${outline.name}：${outline.brief}\n${evidence ? `${evidence.name}：${evidence.brief}\n` : ''}${skill.name}：${skill.brief}\n${criteria.name}：${criteria.brief}`,
        },
        {
          label: '1. 指标库',
          text: m08IndicatorDigest(library),
        },
        {
          label: '2. 推荐算法',
          text: m08AlgoNotes.map(([name, desc]) => `${name}：${desc}`).join('\n'),
        },
        {
          label: '3. 试验因子',
          text: factors.length
            ? factors.map((item) => `${item.name}：${item.levels || item.cat || ''}`).join('\n')
            : '当前方案尚未写入因子表，正式大纲仍按指标树判据组织科目。',
        },
        {
          label: '4. 大纲原文',
          text: `${m08ChapterParas(head, 2).join('\n')}\n${m08ChapterParas(focus, 1).join('\n')}`,
        },
        {
          label: '5. 生成文档',
          text: `思考已完成。接下来展开右侧文档，目录和章节可逐章展开或收起，并定位到${focus.no || '对应章节'}。`,
        },
      ],
    }
  }

  function m08GenAskText() {
    const row = m08CurrentRow.value || {}
    const tpl = row.template || '装备设计定型性能鉴定试验方案模板'
    const tree = row.treeVer || '指标树 V1.0'
    const picked = Array.isArray(row.picked) ? row.picked : []
    const names = picked.slice(0, 4).map((item) => item.name).filter(Boolean)
    if (!names.length) return `以「${tpl}」为骨架，按${tree}装配试验方案。`
    const tail = picked.length > names.length ? `等 ${picked.length} 项` : ''
    return `以「${tpl}」为骨架，按${tree}装配试验方案，纳入${names.join('、')}${tail}。`
  }

  const m08TalkExpert = computed(() => {
    const rounds = m08Snap.value.rounds || []
    const last = [...rounds].reverse().find((item) => item.expertName)
    return last?.expertName || '大纲编制专家'
  })


  function m08PaintOptimize(base, index, partial, caret) {
    if (!partial) {
      m08Snap.value.chapters = base.map((chapter) => ({ ...chapter }))
      m08StreamDoc.value = { index: -1, text: '', caret: false }
      return
    }
    m08StreamDoc.value = { index, text: partial, caret }
  }

  function m08Wait(ms) {
    return new Promise((resolve) => {
      m08StreamTimer = window.setTimeout(resolve, ms)
    })
  }

  async function m08TypeText(full, write) {
    const step = 2
    for (let n = step; n < full.length; n += step) {
      write(full.slice(0, n))
      await m08Wait(16)
    }
    write(full)
  }

  async function m08RunTalk({ kind, text }) {
    const chapters = m08Snap.value.chapters || []
    if (!chapters.length) return
    const plan = m08BuildTalk(text, chapters, kind)
    const base = chapters.map((chapter) => ({ ...chapter, content: m08ClearMarks(chapter.content) }))
    if (kind === 'gen') {
      m08Snap.value.rounds = (m08Snap.value.rounds || []).filter((item) => item.kind !== 'gen')
    }
    m08DocShown.value = false
    const optBefore = (m08Snap.value.rounds || []).filter((item) => item.kind !== 'gen').length
    const dotted = String(m08Snap.value.versions?.[0]?.ver || '').includes('.')
    const verOf = (n) => (dotted ? `V${n}.0` : `V${n}`)
    const resultVer = kind === 'gen'
      ? (m08Snap.value.versions?.[0]?.ver || verOf(1))
      : verOf(optBefore + 2)
    const now = new Date()
    const time = `${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    const started = Date.now()
    const round = {
      kind,
      time,
      user: text,
      expertName: plan.expertName,
      elapsed: 1,
      streaming: true,
      anchor: plan.anchor,
      where: plan.where,
      resultVer,
    }
    m08Snap.value.rounds.push(round)
    m08ChatInput.value = ''
    m08ChatStreaming.value = true
    m08StreamPhase.value = 'think'
    m08StreamElapsed.value = 1
    m08StreamThink.value = []
    const scrollChat = () => {
      const el = document.querySelector('.m08-thread-scroll')
      if (el) el.scrollTop = el.scrollHeight
    }
    const touchElapsed = () => {
      const sec = Math.max(1, Math.round((Date.now() - started) / 1000))
      m08StreamElapsed.value = sec
      round.elapsed = sec
    }
    requestAnimationFrame(scrollChat)
    await m08Wait(640)
    touchElapsed()
    const shown = []
    for (let i = 0; i < plan.think.length; i += 1) {
      const step = plan.think[i]
      m08StreamStep.value = i
      const item = { label: step.label, text: '', live: true }
      shown.push(item)
      m08StreamThink.value = shown.slice()
      await m08TypeText(step.text, (partial) => {
        item.text = partial
        m08StreamThink.value = shown.slice()
        touchElapsed()
        if (partial.length % 16 === 0) scrollChat()
      })
      item.live = false
      m08StreamThink.value = shown.slice()
      scrollChat()
    }
    if (kind !== 'gen' && plan.cite) {
      const written = base.map((chapter, i) => (
        i === plan.chapter
          ? { ...chapter, content: `${chapter.content}<p><mark class="m08-hl">${m08EscHtml(plan.cite)}</mark></p>` }
          : { ...chapter }
      ))
      m08Snap.value.chapters = written
      if (m08CurrentRow.value) m08CurrentRow.value.chapters = written.map((item) => ({ ...item }))
      round.quote = plan.cite
    }
    touchElapsed()
    round.think = plan.think.map((step) => ({ ...step }))
    round.streaming = false
    m08DocShown.value = true
    m08OpenAnchor(plan.anchor || 'c1')
    m08ChatStreaming.value = false
    m08StreamPhase.value = ''
    m08StreamThink.value = []
    m08StreamStep.value = -1
    m08SyncVersionsFromRounds()
    m08FocusVer.value = resultVer
    requestAnimationFrame(scrollChat)
    if (kind !== 'gen') toast(`已生成 ${resultVer}`, 'success')
  }

  function m08EnsureGenTalk() {
    const row = m08CurrentRow.value
    if (!row || row.status !== '草稿' || m08ChatStreaming.value) return
    if (!(m08Snap.value.previewReady || (m08Snap.value.doneSteps || 0) >= 4)) return
    if (!m08Snap.value.chapters?.length) return
    m08DocShown.value = false
    m08RunTalk({ kind: 'gen', text: m08GenAskText() })
  }

  async function m08SendChat() {
    if (m08ChatStreaming.value) return
    if (!m08ChatCanSend.value) {
      toast(m08Snap.value.chatHint || '当前状态不可追加对话', 'warning')
      return
    }
    const text = m08ChatInput.value.trim()
    if (!text) {
      toast('请输入优化要求', 'warning')
      return
    }
    if (!(m08Snap.value.chapters || []).length) {
      toast('请先生成初稿，再进行对话优化', 'warning')
      return
    }
    await m08RunTalk({ kind: 'opt', text })
  }

  function goResourceMatch() {
    if (!m08Snap.value.showMatch) {
      toast('请先打开已定稿方案再进行资源匹配', 'warning')
      return
    }
    const key = demoStore.matchContext?.algo || 'vector'
    const picked = m11Tabs.find((item) => item.key === key) || m11Tabs[0]
    setMatchContext(m08CurrentRow.value)
    demoStore.matchContext = { ...demoStore.matchContext, algo: picked.key }
    m11Tab.value = picked.key
    router.push({ name: 'app', params: { pid: 'design', sid: 'match', mid: 'rec' } })
    toast(`已按「${picked.label}」带入方案「${m08CurrentRow.value?.name || ''}」`, 'success')
  }



  // ── 镜头五（M11）资源推荐四算法（与定稿方案上下文联动） ───────────────

  const demoStore = useDemoStore()
  const m11Tab = ref('vector')
  const m11SelIdx = ref(0)

  const m11Tabs = [
    { key: 'vector', label: '基于向量语义召回的推荐算法', algo: '向量语义召回', desc: '将方案需求与资源描述编码为向量，按语义相似度召回候选资源' },
    { key: 'llm', label: '基于大模型推理重排的推荐算法', algo: '大模型推理重排', desc: '在召回结果上由领域大模型按任务约束推理重排' },
    { key: 'graph', label: '基于知识图谱增强的推荐算法', algo: '知识图谱增强', desc: '沿指标、科目、设备与历史案例的图谱关系扩展并增强排序' },
    { key: 'seq', label: '基于用户行为序列建模的推荐算法', algo: '用户行为序列建模', desc: '按历史方案的资源采纳序列建模，推荐相近试验路径下的资源' },
    { key: 'modal', label: '基于多模态融合的推荐算法', algo: '多模态融合', desc: '融合文本、指标判据、因子与案例画像进行联合匹配' },
    { key: 'hybrid', label: '基于多目标优化的混合推荐算法', algo: '多目标优化混合', desc: '语义召回、推理重排、图谱增强与行为序列按多目标加权融合' },
  ]

  /** 左侧菜单 mid → 页面侧重（避免各叶子完全同页） */
  const m11ViewMeta = computed(() => {
    const mid = String(route.params.mid || 'rec')
    if (mid.startsWith('rec-feat')) {
      return { mid, title: '新试验任务特征提取', focus: 'feat', hint: '从关联方案抽取结构化需求特征，作为相似度匹配输入' }
    }
    if (mid.startsWith('rec-sim')) {
      return { mid, title: '相似度计算配置', focus: 'sim', hint: '按当前算法权重对候选资源打分；切换算法 Tab 可对比' }
    }
    if (mid.startsWith('rec-cmp')) {
      return { mid, title: '历史资源对比', focus: 'cmp', hint: '横向对比 TOP 资源在各算法下的综合匹配度' }
    }
    if (mid.startsWith('show')) {
      return { mid, title: '推荐资源可视化展示', focus: 'show', hint: '以列表+图文方式展示当前方案的推荐结果' }
    }
    if (mid.startsWith('trace')) {
      return { mid, title: '推荐资源历史案例溯源', focus: 'trace', hint: '突出资源关联的历史试验案例与来源说明' }
    }
    return { mid, title: '历史资源相似度匹配', focus: 'match', hint: '按所选推荐算法匹配资源，结果随关联定稿方案联动' }
  })

  const m11SchemeOptions = computed(() => {
    const list = Array.isArray(m08List.value) ? m08List.value : []
    const finalized = list.filter((r) => r.status === '已定稿' || r.status === '已归档')
    return (finalized.length ? finalized : list).map((r) => ({
      value: r.id,
      label: `${r.name}${r.status ? `（${r.status}）` : ''}`,
    }))
  })

  function m11EnsureMatchContext() {
    const ctx = demoStore.matchContext
    if (ctx?.schemeId) {
      const hit = m08List.value.find((r) => r.id === ctx.schemeId)
      if (hit) {
        // 用列表最新行刷新（模板/案例可能已改）
        setMatchContext(hit)
        return
      }
    }
    const prefer = m08List.value.find((r) => r.status === '已定稿')
      || m08List.value.find((r) => r.status === '已归档')
      || m08List.value[0]
    if (prefer) setMatchContext(prefer)
  }

  function m11SelectScheme(id) {
    const hit = m08List.value.find((r) => r.id === id)
    if (!hit) {
      toast('未找到该方案', 'warning')
      return
    }
    setMatchContext(hit)
    m11SelIdx.value = 0
    toast(`已切换关联方案：${hit.name}`, 'success')
  }

  function m11ReparseScheme() {
    m11EnsureMatchContext()
    m11SelIdx.value = 0
    toast('已按当前方案重新解析需求摘要', 'success')
  }

  /** 从方案上下文推导需求标签 */
  function m11DeriveTags(ctx) {
    const tags = []
    const tpl = ctx?.template || ''
    const cs = ctx?.caseName || ''
    const factors = Array.isArray(ctx?.factors) ? ctx.factors : []
    const domains = Array.isArray(ctx?.domains) ? ctx.domains : []

    if (tpl.includes('可靠性')) {
      tags.push('MTBF ≥ 320 h', '使用可用度 ≥ 0.92', '二级维修保障能力')
    } else if (tpl.includes('环境')) {
      tags.push('−41℃ 寒区贮存/工作', '湿热循环考核', '砂尘密封 IP6X')
    } else {
      tags.push('−41℃ 寒区环境能力', '机动性能综合考核', '火力命中考核')
    }

    if (cs.includes('高原')) tags.push('海拔 4200 m 高原工况')
    if (cs.includes('电磁') || cs.includes('寒区')) tags.push('电磁兼容 GJB 1389B')
    if (cs.includes('湿热')) tags.push('湿热长时浸泡')
    if (cs.includes('定型') && !tags.some((t) => t.includes('靶道'))) tags.push('2000 m 射击靶道')

    const temp = factors.find((f) => f.name === '温度')
    if (temp?.levels && !tags.some((t) => t.includes('℃'))) {
      tags.push(`温度水平：${String(temp.levels).split('/')[0].trim()}`)
    }
    const range = factors.find((f) => /射程|靶道/.test(f.name || ''))
    if (range?.levels) tags.push(`${range.name} ${range.levels}`)

    domains.slice(0, 2).forEach((d) => {
      if (d && !tags.includes(d)) tags.push(`性能域·${d}`)
    })

    // 去重保序，最多 5 个
    const seen = new Set()
    return tags.filter((t) => {
      if (seen.has(t)) return false
      seen.add(t)
      return true
    }).slice(0, 5)
  }

  /** 按方案画像生成候选资源池（内容随模板/案例变化） */
  function m11BuildBaseResults(ctx) {
    const tpl = ctx?.template || ''
    const cs = ctx?.caseName || ''
    const nameHint = (ctx?.schemeName || '').slice(0, 18)

    if (tpl.includes('可靠性')) {
      return [
        { res: '可靠性综合试验室（A 区）', cat: '专项场地', spec: '任务剖面台架 + 故障注入', case: '2024 可靠性鉴定案例', reason: `贴合模板「${tpl}」：MTBF/MTTR 剖面齐全` },
        { res: '二级维修保障演练场', cat: '保障资源', spec: '备件库 + 检测工位', case: cs || '保障演练案例', reason: '满足二级维修与可用度验证需求' },
        { res: '某综合试验场寒区', cat: '试验场地', spec: '−50℃ 实验室', case: '寒区可靠性叠加案例', reason: '可叠加寒区应力，可靠性主指标非其强项' },
        { res: '高原综合试验场', cat: '试验场地', spec: '海拔 4200 m', case: '高原长时运行案例', reason: '偏环境应力，可靠性统计样本偏少' },
        { res: '室内环境模拟舱（B 型）', cat: '试验设备', spec: '部件级温箱', case: '部件可靠性筛试', reason: '仅部件级，不满足整机剖面' },
      ]
    }
    if (tpl.includes('环境')) {
      return [
        { res: '湿热综合试验箱群', cat: '试验设备', spec: 'GJB 150.9A 循环', case: cs || '湿热长时案例', reason: `匹配环境大纲与案例「${cs || '湿热'}」` },
        { res: '某综合试验场寒区', cat: '试验场地', spec: '−50℃ 贮存/工作分列', case: '寒区环境案例', reason: '满足 −41℃ 贮存与工作分列考核' },
        { res: '扬尘密封试验道', cat: '试验场地', spec: '可控扬尘浓度', case: '砂尘防护案例', reason: '覆盖砂尘/密封条款' },
        { res: '高原综合试验场', cat: '试验场地', spec: '低气压工况', case: '高原环境案例', reason: '低气压可用，湿热条款需另配' },
        { res: '某电磁兼容试验中心', cat: '专项场地', spec: '屏蔽室', case: 'EMC 专项', reason: '偏 EMC，非环境主体' },
      ]
    }
    if (cs.includes('高原')) {
      return [
        { res: '高原综合试验场', cat: '试验场地', spec: '海拔 4200 m，2200 m 靶道', case: cs, reason: `案例「${cs}」主场匹配，高原机动/测控齐全` },
        { res: '高原遥测接力站', cat: '试验设备', spec: '低气压抗干扰链路', case: '高原测控案例', reason: '补强高原丢包容限与刷新率' },
        { res: '某综合试验场寒区', cat: '试验场地', spec: '−50℃ + 靶道', case: '寒区定型案例', reason: '有靶道但海拔不足' },
        { res: '某机动性能试验跑道', cat: '试验场地', spec: '1500 m 跑道', case: '平原机动案例', reason: '海拔与靶道均不满足高原需求' },
        { res: '室内环境模拟舱（B 型）', cat: '试验设备', spec: '部件温箱', case: '部件试验', reason: '无法开展整车高原试验' },
      ]
    }
    if (cs.includes('电磁') || cs.includes('寒区')) {
      return [
        { res: '某综合试验场寒区', cat: '试验场地', spec: '−50℃ 实验室 + 2400 m 靶道', case: cs || '寒区定型案例', reason: `满足寒区 + 靶道；关联方案「${nameHint}」` },
        { res: '某电磁兼容试验中心', cat: '专项场地', spec: '全域屏蔽，GJB 1389B', case: '电磁兼容专项案例', reason: '满足 EMC 条款，需与寒区场组合使用' },
        { res: '高原综合试验场', cat: '试验场地', spec: '海拔 4200 m', case: '高原案例', reason: '缺寒区低温与 EMC 屏蔽条件' },
        { res: '某机动性能试验跑道', cat: '试验场地', spec: '1500 m 跑道', case: '机动案例', reason: '靶道偏短，无寒区/EMC' },
        { res: '室内环境模拟舱（B 型）', cat: '试验设备', spec: '−40℃ ~ +80℃', case: '部件环境', reason: '温度可模拟，非整车级' },
      ]
    }
    if (cs.includes('湿热')) {
      return [
        { res: '湿热综合试验箱群', cat: '试验设备', spec: '长时湿热循环', case: cs, reason: `直接对齐案例「${cs}」湿热剖面` },
        { res: '露天湿热试验场', cat: '试验场地', spec: '自然湿热 + 凝露', case: '湿热外场案例', reason: '补强外场凝露与霉菌检查' },
        { res: '某综合试验场寒区', cat: '试验场地', spec: '低温为主', case: '寒区案例', reason: '温度能力反向，湿热非其强项' },
        { res: '高原综合试验场', cat: '试验场地', spec: '低气压干燥', case: '高原案例', reason: '气候偏干，湿热条款弱' },
        { res: '某机动性能试验跑道', cat: '试验场地', spec: '混凝土跑道', case: '机动案例', reason: '无湿热应力能力' },
      ]
    }
    // 默认性能鉴定 / 定型
    return [
      { res: '某综合试验场寒区', cat: '试验场地', spec: '−50℃ 低温实验室 + 2400 m 靶道', case: '2024 年某型定型案例', reason: `满足寒区/靶道等需求；解析自「${nameHint || '定稿方案'}」` },
      { res: '高原综合试验场', cat: '试验场地', spec: '海拔 4200 m，2200 m 靶道', case: '2023 年高原环境试验案例', reason: '满足靶道，缺寒区低温' },
      { res: '某电磁兼容试验中心', cat: '专项场地', spec: '全域屏蔽，满足 GJB 1389B', case: '2025 年电磁兼容专项案例', reason: '满足 EMC/遥测类需求，靶道与寒区不足' },
      { res: '某机动性能试验跑道', cat: '试验场地', spec: '1500 m 混凝土跑道', case: '2023 年机动性能试验案例', reason: '靶道长度不足 2000 m' },
      { res: '室内环境模拟舱（B 型）', cat: '试验设备', spec: '−40℃ ~ +80℃，内尺寸 3×3×3 m', case: '部件环境耐受性案例', reason: '可模拟温度，无法容纳整车级试验' },
    ]
  }

  function m11ScoreSet(focus, seed) {
    // focus 微调分数，让不同菜单叶子结果排序略有差异
    const base = {
      match: [0.91, 0.78, 0.62, 0.54, 0.43],
      feat: [0.89, 0.81, 0.66, 0.55, 0.47],
      sim: [0.87, 0.83, 0.70, 0.58, 0.50],
      cmp: [0.90, 0.76, 0.68, 0.57, 0.45],
      show: [0.92, 0.79, 0.64, 0.53, 0.44],
      trace: [0.88, 0.80, 0.69, 0.61, 0.48],
    }[focus] || [0.91, 0.78, 0.62, 0.54, 0.43]
    const jitter = (seed % 7) * 0.002
    return {
      vector: base.map((s, i) => Math.min(0.99, +(s + jitter - i * 0.001).toFixed(2))),
      llm: base.map((s, i) => Math.min(0.99, +(s - 0.02 + jitter + (i % 2) * 0.012).toFixed(2))),
      graph: base.map((s, i) => Math.min(0.99, +(s - 0.04 + jitter).toFixed(2))),
      seq: base.map((s, i) => Math.min(0.99, +(s - 0.06 + jitter + (i === 1 ? 0.03 : 0)).toFixed(2))),
      modal: base.map((s, i) => Math.min(0.99, +(s - 0.01 + jitter - (i === 3 ? 0.02 : 0)).toFixed(2))),
      hybrid: base.map((s, i) => Math.min(0.99, +((s * 0.3 + (s - 0.02) * 0.25 + (s - 0.04) * 0.2 + (s - 0.06) * 0.25) + jitter).toFixed(2))),
    }
  }

  const m11MatchCtx = computed(() => demoStore.matchContext || {})
  const m11ReqTags = computed(() => m11DeriveTags(m11MatchCtx.value))
  const m11SchemeTitle = computed(() => m11MatchCtx.value.schemeName || '未关联方案')
  const m11SchemeId = computed(() => m11MatchCtx.value.schemeId || '')

  const m11Results = computed(() => {
    const ctx = m11MatchCtx.value
    const focus = m11ViewMeta.value.focus
    const seed = String(ctx.schemeId || ctx.schemeName || '').length
    const base = m11BuildBaseResults(ctx)
    const scores = m11ScoreSet(focus, seed)
    // trace 页：理由更强调案例来源
    const rows = base.map((r) => {
      if (focus === 'trace') {
        return { ...r, reason: `溯源：${r.case} · ${r.reason}` }
      }
      if (focus === 'feat') {
        return { ...r, reason: `特征命中：${r.reason}` }
      }
      return { ...r }
    })
    return {
      vector: rows.map((r, i) => ({ ...r, score: scores.vector[i] })),
      llm: rows.map((r, i) => ({ ...r, score: scores.llm[i] })),
      graph: rows.map((r, i) => ({ ...r, score: scores.graph[i] })),
      seq: rows.map((r, i) => ({ ...r, score: scores.seq[i] })),
      modal: rows.map((r, i) => ({ ...r, score: scores.modal[i] })),
      hybrid: rows.map((r, i) => ({ ...r, score: scores.hybrid[i] })),
    }
  })

  const m11CurrentTab = computed(() => m11Tabs.find((t) => t.key === m11Tab.value))
  const m11CurrentResults = computed(() => m11Results.value[m11Tab.value] || m11Results.value.hybrid)

  const m11Indicators = computed(() => getM02RowsForDoc('某型装备研制总要求'))
  const m11IndId = ref('i01')
  const m11ActiveInd = computed(() => m11Indicators.value.find((row) => row.id === m11IndId.value) || m11Indicators.value[0])
  const m11IndRecommend = computed(() => recommendForIndicator(m11ActiveInd.value, m11Tab.value))
  const m11Demand = computed(() => {
    const ctx = m11MatchCtx.value
    const rawName = String(ctx.schemeName || '未关联方案')
    const name = rawName.replace(/\s+V\d+(?:\.\d+)?$/, '')
    const ver = /^V\d+$/.test(ctx.ver || '') ? `${ctx.ver}.0` : (ctx.ver || 'V1.0')
    const stored = Array.isArray(ctx.factors) ? ctx.factors.length : 0
    const factorCount = stored || (ctx.status === '已归档' ? 18 : 22)
    const done = ctx.status === '已定稿' || ctx.status === '已归档'
    return {
      line: `定稿方案需求：${name} · ${ver} · 考核指标 ${m11Indicators.value.length} 项 · 试验因子 ${factorCount} 个`,
      status: done ? '已完成' : (ctx.status || '进行中'),
      done,
    }
  })
  const m11Adopted = ref({})
  const m11CaseVisible = ref(false)
  const m11CaseRow = ref(null)

  function m11AdoptKey(name) {
    return `${m11IndId.value}::${m11Tab.value}::${name}`
  }
  function m11IsAdopted(name) {
    return m11Adopted.value[m11AdoptKey(name)] !== false
  }
  function m11ToggleAdopt(name) {
    const key = m11AdoptKey(name)
    const next = !m11IsAdopted(name)
    m11Adopted.value = { ...m11Adopted.value, [key]: next }
    toast(next ? `已采纳：${name}` : `已取消采纳：${name}`, next ? 'success' : 'info')
  }
  function m11OpenCase(row) {
    m11CaseRow.value = row
    m11CaseVisible.value = true
  }

  // 进入匹配相关页时，若无上下文则回填最近定稿方案
  watch(
    () => route.params.mid,
    (mid) => {
      if (String(mid || '').startsWith('rec') || String(mid || '').startsWith('show') || String(mid || '').startsWith('trace')) {
        m11EnsureMatchContext()
        m11SelIdx.value = 0
        const algo = demoStore.matchContext?.algo
        if (algo && m11Tabs.some((item) => item.key === algo)) m11Tab.value = algo
      }
    },
    { immediate: true },
  )


  Object.assign(bag, {
    kpiIcon,
    tab,
    parseTabs,
    parsePoints,
    engines,
    rules,
    cleanRes,
    cleanLogs,
    runClean,
    fmt,
    exportDocs,
    fieldMap,
    defaultFields,
    fields,
    form,
    resetForm,
    formTitle,
    sideNote,
    notes,
    importList,
    addToList,
    commitList,
    submitEntry,
    docs,
    docId,
    chapters,
    cur,
    graphs,
    graph,
    graphNodes,
    nodeHit,
    graphEdges,
    nodeMap,
    activeNode,
    gkey,
    chatBank,
    bank,
    topics,
    topic,
    suggests,
    messages,
    input,
    ask,
    lang,
    codeLangs,
    codeHtml,
    radarRows,
    timeline,
    flows,
    flowNodes,
    flowOn,
    flowChain,
    canvases,
    canvasNodes,
    canvasOn,
    canvasLinks,
    cardSets,
    cardList,
    papers,
    paper,
    statPack,
    pack,
    statKpis,
    statChart,
    dist,
    statMax,
    m01Resources,
    m01Cats,
    m01ActiveCat,
    m01Search,
    m01FilteredRows,
    m01VisibleRows,
    m01Page,
    m01PageSize,
    m01Secret,
    m01Detail,
    m01SelChapter,
    m01SelSub,
    m01OpenDetail,
    m03List,
    m03DetailOpen,
    m03CurrentRow,
    m03OpenDetail,
    m03SaveToStore,
    m03SrcDocLabel,
    m03SrcIconKind,
    m03SrcIconText,
    m03EditVisible,
    m03EditForm,
    m03CriteriaOptions,
    m03ExamOptions,
    m03OpenEdit,
    m03SaveEdit,
    m03TraceVisible,
    m03Trace,
    m03OpenTrace,
    m03OpenSourceQuick,
    m03CreateVisible,
    m03CreateForm,
    m03SrcOptions,
    m03CreatePreviewCount,
    m03DomainOptions: m02Domains,
    m03OpenCreate,
    m03OnSrcChange,
    m03ToggleDomain,
    m03SubmitCreate,
    m03Tree,
    m03SelId,
    flatM03Nodes: m03FlatNodes,
    m03AllNodes,
    m03SelNode,
    m03Select,
    m03AllExpanded,
    m03ExpandAll,
    m08List,
    m08DetailOpen,
    m08CurrentRow,
    m08Snap,
    m08OpenDetail,
    m08CreateVisible,
    m08CreateForm,
    m08Projects,
    m08AutoTreeLabel,
    m08SelectProject,
    m08TreeOptions,
    m08TemplateOptions,
    m08CaseOptions,
    m08TplForm,
    m08TplSummary,
    m08IndForm,
    m08IndSummary,
    m08DomainOptions: m02Domains,
    m08FactorStepForm,
    m08FactorStepSummary,
    m08FactorStrategies,
    m08FactorCatOptions,
    m08ToggleIndDomain,
    m08ToggleFactorCat,
    m08ConfirmTplStep,
    m08ConfirmStepConfig,
    m08SaveTplCase,
    m08OpenCreate,
    m08SubmitCreate,
    m08GoFactorStep,
    m08PublishedTrees,
    m08IndicatorRows,
    m08PickedIds,
    m08ToggleIndicator,
    m08ToggleAllIndicators,
    m08TemplateCards,
    m08Wizard,
    m08InWizard,
    m08Generating,
    m08GenProgress,
    m08QuickFactors,
    m08QuickAddFactor,
    m08FactorName,
    m08AddFactorLine,
    m08WizardNextFactors,
    m08WizardBack,
    m08PickTemplate,
    m08WizardToPreview,
    m08StartGenerate,
    m08ViewRoundDoc,
    m08JumpDoc,
    m08TocId,
    schemeDocToc,
    m08SendChat,
    m08AddFactor,
    m08OpenFactorDialog,
    m08SubmitFactor,
    m08RemoveFactor,
    m08FactorDialog,
    m08FactorForm,
    m08FactorEditIdx,
    m08FactorCats,
    m08IsDraft,
    m08IsFinal,
    m08ContinueStep,
    m08Finalize,
    m08RevertDraft,
    m08ClickStep,
    m08ClickVersion,
    m08ExportWord,
    m08ChatInput,
    m08ChatCanSend,
    m08ChatStreaming,
    m08StreamText,
    m08StreamPhase,
    m08StreamThink,
    m08StreamStep,
    m08StreamElapsed,
    m08DocView,
    m08DocShown,
    m08ChapterOpen,
    m08ToggleChapter,
    m08ToggleAllChapters,
    m08FoldDoc,
    m08TalkExpert,
    m08StreamDoc,
    m08FactorCount,
    m08FocusStep,
    m08FocusVer,
    m08StepDialog,
    m08StepDialogIdx,
    m08StepDetails,
    goResourceMatch,
    m11ViewMeta,
    m11SchemeOptions,
    m11SchemeTitle,
    m11SchemeId,
    m11SelectScheme,
    m11ReparseScheme,
    m11EnsureMatchContext,
    m08Steps,
    m08Factors,
    m08SelFactor,
    m08ActiveChapter,
    m08Chapters,
    m08Rounds,
    m08Versions,
    m11ReqTags,
    m11Tab,
    m11Tabs,
    m11Results,
    m11CurrentTab,
    m11CurrentResults,
    m11SelIdx,
    m11Indicators,
    m11IndId,
    m11ActiveInd,
    m11IndRecommend,
    m11Demand,
    m11IsAdopted,
    m11ToggleAdopt,
    m11CaseVisible,
    m11CaseRow,
    m11OpenCase,
  })
}
