/**
 * Rich 页通用镜头（录入 / 解析 / 图谱 / m01 / m03 / m08 / m11）
 */
import { computed, reactive, ref, watch } from 'vue'
import { useRows } from '@/composables/tables'
import { nowText } from '@/utils/format'
import { resourceDetails } from '@/data/mock'
import { updateMetricTree } from '@/composables/demo-store'
import { m03TreeData } from '@/data/m03-tree'

export function buildRichPartA({ toast, router, route, props, bag }) {
function kpiIcon(label = '') {
  if (/卡片/.test(label)) return 'card'
  if (/问答/.test(label)) return 'chat'
  if (/图谱|关系/.test(label)) return 'graph'
  if (/接口|服务/.test(label)) return 'plugin'
  if (/算法|模型/.test(label)) return 'model'
  if (/任务|对接/.test(label)) return 'flow'
  if (/准确|率|评估/.test(label)) return 'chart'
  if (/文档|报告|资源|数据/.test(label)) return 'folder'
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
  { key: 'name', label: '资源名称', required: true, placeholder: '如：东方红-LF2204轮式拖拉机定型试验报告' },
  { key: 'cat', label: '资源类别', required: true, options: ['定型资料', '历史试验数据', '标准规范', '专业文献'] },
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
    cat: form.cat || '定型资料',
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
  if (props.page.dataset) {
    const rows = useRows(props.page.dataset)
    importList.value.forEach((item) => {
      rows.unshift({
        name: item.name, cat: item.cat, fmt: item.fmt, modal: item.modal,
        size: item.size === '—' ? '—' : item.size + ' MB',
        pages: item.pages, status: item.mode === '即时解析' ? '解析中' : '暂存',
        by: 'Mona', time: nowText(),
      })
    })
  }
  toast(`成功录入 ${importList.value.length} 项资源，已进入数据资源目录`)
  importList.value = []
  if (props.page?.dataset === 'resources') {
    router.push({ name: 'app', params: { pid: route.params.pid, sid: route.params.sid, mid: 'res-list' } })
  }
}

function submitEntry() {
  if (fields.value.some((f) => f.required && !form[f.key])) { toast('请填写必填项'); return }
  if (props.page.dataset) {
    const rows = useRows(props.page.dataset)
    rows.unshift({ name: form.name || '新建记录', cat: form.cat || '定型资料', fmt: form.fmt || 'PDF', modal: form.modal || '文本', size: (form.size || '10') + (String(form.size || '').includes('MB') ? '' : ' MB'), pages: form.pages || '—', status: form.mode === '暂存' ? '暂存' : '解析中', by: 'Mona', time: nowText(), value: '—', unit: '—', machine: '东方红-LF2204', source: '新录入', page: '—', score: '—', stage: '性能试验鉴定', docs: '新归集', state: '待整理', updated: nowText() })
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
    { tag: '原始库', title: '未处理资料', text: '定型报告、扫描件、影像按原样保存，容量计入 10 TB 以上资源池。' },
    { tag: '基础库', title: '结构化解析', text: '章节、表格、实体和指标，可供抽取与审查复用。' },
    { tag: '推理库', title: '二次分析', text: '图谱、问答对、审查结论和创新点，服务智能体。' },
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

// 左侧分类目录树（4类+计数）
const m01Cats = computed(() => {
  const all = m01Resources
  const cats = ['定型资料', '历史试验数据', '标准规范', '专业文献']
  const list = [{ key: 'all', label: '全部资料', count: all.length }]
  cats.forEach((c) => list.push({ key: c, label: c, count: all.filter((r) => r.cat === c).length }))
  return list
})

const m01ActiveCat = ref('all')
const m01Search = ref('')

const m01FilteredRows = computed(() => {
  let rows = m01Resources
  if (m01ActiveCat.value !== 'all') rows = rows.filter((r) => r.cat === m01ActiveCat.value)
  if (m01Search.value.trim()) rows = rows.filter((r) => r.name.includes(m01Search.value.trim()))
  return rows
})

// 密级 mock（按类别默认）
function m01Secret(cat) {
  return { '定型资料': '秘密', '历史试验数据': '内部', '标准规范': '公开', '专业文献': '内部' }[cat] || '内部'
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

// 指标树列表
const m03List = ref([
  { id: 'v1', version: '指标树 V1.0', srcDoc: 'D-01《某型研制总要求》', count: 28, status: '已发布', publishedAt: '2026-10-08 09:24' },
  { id: 'v2', version: '指标树 V0.9', srcDoc: 'D-01《某型研制总要求》', count: 24, status: '草稿',   publishedAt: null },
])

const m03DetailOpen = ref(false)
const m03CurrentRow = ref(null)
function m03OpenDetail(row) {
  m03CurrentRow.value = row || m03List.value[0]
  m03DetailOpen.value = true
}
function m03SaveToStore() {
  const row = m03CurrentRow.value || m03List.value[0]
  const version = (row?.version || 'V1.0').replace(/^指标树\s*/, '')
  const count = row?.count ?? 28
  updateMetricTree(version, count)
  if (row && row.status !== '已发布') {
    row.status = '已发布'
    row.publishedAt = nowText()
  }
  toast(`已同步指标树 ${version}（${count} 项）到试验后阶段`)
}

// 四级树：根节点 → 7 性能域 → 15 指标类 → 28 指标项
const m03Tree = ref(structuredClone(m03TreeData))

const m03SelId = ref('i-jd-1')

function flatM03Nodes(nodes) {
  const res = []
  nodes.forEach((n) => { res.push(n); if (n.children) res.push(...flatM03Nodes(n.children)) })
  return res
}
const m03AllNodes = computed(() => flatM03Nodes(m03Tree.value))
const m03SelNode = computed(() => m03AllNodes.value.find((n) => n.id === m03SelId.value) || null)

function m03Select(node) { m03SelId.value = node.id }
function m03ExpandAll() {
  m03AllNodes.value.forEach((n) => { if (n.children) n.open = true })
}



// ── 镜头四（M08）试验方案生成结果 ────────────────────────────────────

// 第一级：方案列表
const m08List = ref([
  { id: 'm1', name: '某型性能鉴定试验大纲 V4', ver: 'V4', treeVer: '指标树 V1.0', status: '已定稿', updatedAt: '2026-10-08 10:42' },
  { id: 'm2', name: '某型性能鉴定试验大纲 V3', ver: 'V3', treeVer: '指标树 V0.9', status: '已归档', updatedAt: '2026-10-06 15:20' },
  { id: 'm3', name: '某型性能鉴定试验大纲 V1', ver: 'V1', treeVer: '指标树 V0.9', status: '草稿',   updatedAt: '2026-10-04 09:11' },
])
const m08DetailOpen = ref(false)
function m08OpenDetail() { m08DetailOpen.value = true }
function goResourceMatch() {
  router.push({ name: 'app', params: { pid: 'design', sid: 'match', mid: 'rec' } })
}

// 四步向导（全部完成）
const m08Steps = [
  { name: '选定考核指标' },
  { name: '配置试验因子' },
  { name: '选择模板与案例' },
  { name: '生成预览' },
]

// 22个因子卡片（含取值水平）
const m08Factors = reactive([
  { name: '温度',       levels: '−41℃贮存 / −41℃工作 / 常温 / +55℃', cat: '环境' },
  { name: '路面',       levels: '硬路面 / 砂石 / 泥泞',                cat: '环境' },
  { name: '最大公路速度', levels: '≥ 65 km/h',                         cat: '机动' },
  { name: '最大越野速度', levels: '≥ 35 km/h',                         cat: '机动' },
  { name: '最大行程',   levels: '≥ 500 km',                            cat: '机动' },
  { name: '爬坡度',     levels: '≥ 30°',                               cat: '机动' },
  { name: '涉水深度',   levels: '≥ 1.2 m',                             cat: '机动' },
  { name: '主炮口径',   levels: '125 mm',                              cat: '火力' },
  { name: '穿甲弹初速', levels: '≥ 1700 m/s',                          cat: '火力' },
  { name: '射速',       levels: '6–8 发/min',                          cat: '火力' },
  { name: '最大射程',   levels: '≥ 4000 m',                            cat: '火力' },
  { name: '首发命中概率', levels: '≥ 0.85',                            cat: '火力' },
  { name: 'MTBF',       levels: '≥ 320 h',                            cat: '可靠性' },
  { name: 'MTTR',       levels: '≤ 2 h',                              cat: '可靠性' },
  { name: '使用可用度', levels: '≥ 0.92',                              cat: '可靠性' },
  { name: '防护等级',   levels: 'RHA 600 mm / 核生化',                 cat: '防护' },
  { name: '防尘防水',   levels: 'IP67 / IP6X',                        cat: '环境' },
  { name: '传导发射',   levels: '≤ RE102 B类',                        cat: '电磁' },
  { name: '辐射敏感度', levels: '≥ RS103 C类',                        cat: '电磁' },
  { name: '态势感知刷新率', levels: '≥ 2 Hz',                         cat: '信息' },
  { name: '通信距离',   levels: '≥ 30 km',                            cat: '信息' },
  { name: '目标识别距离', levels: '≥ 3000 m',                         cat: '信息' },
])
const m08SelFactor = ref(0)

// 大纲章节树
const m08ActiveChapter = ref(3) // 默认显示"试验项目与方法"章
const m08Chapters = [
  { no: '第一章', title: '试验目的', content: '本试验旨在对某型进行全面性能鉴定，验证各项技术指标是否满足研制总要求（D-01）规定的性能指标，为定型提供依据。<br><br>试验依据：《某型研制总要求》（D-01）、军标 GJB 4239-2001。' },
  { no: '第二章', title: '试验条件', content: '2.1 环境条件<br>试验在标准试验场地进行，温度范围 −41℃ 至 +55℃，分贮存工况与工作工况两类。路面条件覆盖硬路面、砂石路面、泥泞路面三类。<br><br>2.2 试验<br>受试编号：SB-2026-001，配置标准弹药基数，燃油满载。' },
  { no: '第三章', title: '试验项目与方法', content: '3.1 机动性能试验<br>3.1.1 最大公路速度：在硬路面直线段测量，取三次均值，判据 <b style="color:#0d4e83">≥ 65 km/h <svg viewBox="0 0 24 24" fill="none" stroke="#1668a8" stroke-width="2" style="width:13px;height:13px;display:inline;vertical-align:middle"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg></b>（引自指标树 D-01·4.1.1）<br><br>3.1.2 最大越野速度：砂石路面测量，判据 <b style="color:#0d4e83">≥ 35 km/h <svg viewBox="0 0 24 24" fill="none" stroke="#1668a8" stroke-width="2" style="width:13px;height:13px;display:inline;vertical-align:middle"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg></b>（引自指标树 D-01·4.1.2）<br><br>3.2 电磁兼容考核（第1轮对话新增）<br>按 GJB 1389B 执行传导发射与辐射敏感度测试，判据 ≤ RE102 B类 / ≥ RS103 C类。' },
  { no: '第四章', title: '测量要求', content: '4.1 速度测量：使用标定 GPS 测速仪，精度 ±0.2 km/h。<br>4.2 火力测量：弹道测量仪精度 ±0.5 m/s，计时精度 ±0.01 s。<br>4.3 可靠性记录：故障严格按 GJB 451A 分类，A 类故障单独统计。' },
  { no: '第五章', title: '数据处理与判据', content: '5.1 判据引用自指标树 V1.0<br><br><table style="border-collapse:collapse;width:100%;font-size:13px"><thead><tr style="background:#eaf3fa"><th style="padding:6px 10px;text-align:left;border:1px solid #dce8f2">指标名称</th><th style="padding:6px 10px;text-align:left;border:1px solid #dce8f2">判据</th><th style="padding:6px 10px;border:1px solid #dce8f2">来源</th></tr></thead><tbody><tr><td style="padding:6px 10px;border:1px solid #dce8f2">最大公路速度</td><td style="padding:6px 10px;border:1px solid #dce8f2;font-weight:600;color:#0d4e83">≥ 65 km/h</td><td style="padding:6px 10px;border:1px solid #dce8f2;text-align:center"><svg viewBox="0 0 24 24" fill="none" stroke="#1668a8" stroke-width="2" style="width:14px;height:14px;vertical-align:middle"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg></td></tr><tr><td style="padding:6px 10px;border:1px solid #dce8f2">首发命中概率</td><td style="padding:6px 10px;border:1px solid #dce8f2;font-weight:600;color:#0d4e83">≥ 0.85</td><td style="padding:6px 10px;border:1px solid #dce8f2;text-align:center"><svg viewBox="0 0 24 24" fill="none" stroke="#1668a8" stroke-width="2" style="width:14px;height:14px;vertical-align:middle"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg></td></tr><tr><td style="padding:6px 10px;border:1px solid #dce8f2">MTBF</td><td style="padding:6px 10px;border:1px solid #dce8f2;font-weight:600;color:#0d4e83">≥ 320 h</td><td style="padding:6px 10px;border:1px solid #dce8f2;text-align:center"><svg viewBox="0 0 24 24" fill="none" stroke="#1668a8" stroke-width="2" style="width:14px;height:14px;vertical-align:middle"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg></td></tr></tbody></table>' },
]

// 3轮对话记录
const m08Rounds = [
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

// 版本条
const m08Versions = [
  { ver: 'V1', label: '初稿',     time: '10-04 09:11', final: false },
  { ver: 'V2', label: '一轮优化', time: '10-05 14:35', final: false },
  { ver: 'V3', label: '二轮优化', time: '10-06 09:55', final: false },
  { ver: 'V4', label: '定稿',     time: '10-08 10:42', final: true  },
]



// ── 镜头五（M11）资源推荐四算法 ─────────────────────────────────────

// 需求摘要标签（自动解析自定稿方案）
const m11ReqTags = ['−41℃ 寒区环境能力', '2000 m 射击靶道', '遥测采集能力']

const m11Tab = ref('rule')

const m11Tabs = [
  { key: 'rule',     label: '基于规则',       algo: '规则匹配', desc: '按需求标签逐条规则过滤，满足全部约束的资源才进入候选' },
  { key: 'content',  label: '基于内容相似度', algo: '内容相似度（余弦）', desc: '将资源描述向量化，与需求摘要做余弦相似计算' },
  { key: 'collab',   label: '基于协同过滤',   algo: '协同过滤', desc: '基于历史试验案例中同类需求的资源使用频次协同推荐' },
  { key: 'hybrid',   label: '多维度综合',     algo: '多维度综合（加权融合）', desc: '规则×0.35 + 内容相似度×0.35 + 协同过滤×0.30，融合排序' },
]

const m11BaseResults = [
  {
    res: '某综合试验场寒区',
    cat: '试验场地',
    spec: '−50℃ 低温实验室 + 2400 m 靶道',
    case: '2024 年某型定型案例',
    reason: '满足全部 3 条需求标签：寒区能力 / 2000 m 靶道 / 遥测采集',
  },
  {
    res: '高原综合试验场',
    cat: '试验场地',
    spec: '海拔 4200 m，2200 m 靶道',
    case: '2023 年高原环境试验案例',
    reason: '满足靶道与遥测需求，缺−41℃寒区低温环境',
  },
  {
    res: '某电磁兼容试验中心',
    cat: '专项场地',
    spec: '全域屏蔽，满足 GJB 1389B',
    case: '2025 年电磁兼容专项案例',
    reason: '满足遥测采集需求，不满足靶道与寒区需求',
  },
  {
    res: '某机动性能试验跑道',
    cat: '试验场地',
    spec: '1500 m 混凝土跑道',
    case: '2023 年机动性能试验案例',
    reason: '靶道长度 1500 m，不满足 2000 m 要求',
  },
  {
    res: '室内环境模拟舱（B 型）',
    cat: '试验设备',
    spec: '−40℃ ~ +80℃，内尺寸 3×3×3 m',
    case: '部件环境耐受性案例',
    reason: '可满足寒区温度，但无法容纳整车级试验',
  },
]
const m11Results = {
  rule:    m11BaseResults.map((r, i) => ({ ...r, score: [0.91, 0.78, 0.62, 0.54, 0.43][i] })),
  content: m11BaseResults.map((r, i) => ({ ...r, score: [0.88, 0.82, 0.71, 0.65, 0.58][i] })),
  collab:  m11BaseResults.map((r, i) => ({ ...r, score: [0.86, 0.79, 0.68, 0.60, 0.52][i] })),
  hybrid:  m11BaseResults.map((r, i) => ({ ...r, score: [0.91, 0.80, 0.67, 0.59, 0.49][i] })),
}
const m11CurrentTab = computed(() => m11Tabs.find((t) => t.key === m11Tab.value))
const m11CurrentResults = computed(() => m11Results[m11Tab.value] || m11Results.hybrid)
const m11SelIdx = ref(0)


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
    m03Tree,
    m03SelId,
    flatM03Nodes,
    m03AllNodes,
    m03SelNode,
    m03Select,
    m03ExpandAll,
    m08List,
    m08DetailOpen,
    m08OpenDetail,
    goResourceMatch,
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
    m11BaseResults,
    m11Results,
    m11CurrentTab,
    m11CurrentResults,
    m11SelIdx
  })
}
