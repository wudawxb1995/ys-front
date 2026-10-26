<template>
  <div class="studio" :class="{ embedded }">
    <header class="top" :class="{ embed: embedded }">
      <button v-if="!embedded" class="back" @click="router.push({ name: 'agent-templates' })">← 返回模板</button>
      <div class="title">
        <b>{{ graph.name }} · 智能体编排</b>
        <span>{{ modeHint || graph.desc }}</span>
      </div>
      <div class="apps"><span>{{ graph.category || '业务场景' }}</span><span>{{ graph.nodes.length }} 个节点</span><span>{{ graph.edges.length }} 条连线</span></div>
      <div class="ops">
        <em :class="{ on: graph.published }">{{ graph.published ? '已发布' : '草稿' }}</em>
        <button @click="publish">发布</button>
        <button class="run" :disabled="running" @click="startRun">{{ running ? '运行中' : '调试运行' }}</button>
      </div>
    </header>

    <div class="workspace">
      <aside class="palette" :class="{ focus: mode === 'drag' || mode === 'link' }">
        <h3>预置组件 · {{ palette.length }}</h3>
        <p>{{ mode === 'link' ? '保持节点输入输出相连，形成可执行工作流。' : '点击添加到画布，并从当前节点连出。' }}</p>
        <button v-for="item in palette" :key="item.type" @click="addNode(item)">
          <i :class="item.type">{{ item.mark }}</i>
          <span><b>{{ item.title }}</b><small>{{ item.sub }}</small></span>
        </button>
      </aside>

      <section ref="stageRef" class="stage" @click="selectedId = ''">
        <div class="zoom">
          <button @click.stop="scale = Math.max(0.7, +(scale - 0.1).toFixed(1))">−</button>
          <span>{{ Math.round(fit * scale * 100) }}%</span>
          <button @click.stop="scale = Math.min(1.4, +(scale + 0.1).toFixed(1))">+</button>
        </div>
        <div class="board-fit" :style="fitBox">
        <div class="board" :style="boardStyle">
          <svg class="wires">
            <path
              v-for="edge in edges"
              :key="edge.from + edge.to"
              :d="pathOf(edge)"
              :class="{ hot: activeId && (edge.from === activeId || edge.to === activeId) }"
            />
          </svg>
          <article
            v-for="node in graph.nodes"
            :key="node.id"
            class="node"
            :class="[node.type, { on: node.id === selectedId, run: node.id === activeId, done: doneIds.includes(node.id) }]"
            :style="{ left: node.x + 'px', top: node.y + 'px' }"
            @click.stop="selectedId = node.id"
            @mousedown="dragStart($event, node)"
          >
            <span v-if="node.type !== 'start'" class="port in"></span>
            <div class="node-h">
              <i>{{ markOf(node.type) }}</i>
              <div>
                <b>{{ node.title }}</b>
                <small>{{ node.sub }}</small>
              </div>
            </div>
            <em v-if="node.result" class="node-result">{{ node.result }}</em>
            <span v-if="node.type !== 'answer'" class="port out"></span>
          </article>
        </div>
        </div>
      </section>

      <aside class="side">
        <div class="tabs">
          <button :class="{ on: tab === 'config' }" @click="tab = 'config'">配置</button>
          <button :class="{ on: tab === 'trace' }" @click="tab = 'trace'">追踪</button>
        </div>
        <div v-if="tab === 'config'" class="pane">
          <template v-if="selected">
            <label>节点名称<input v-model="selected.title" /></label>
            <label>说明<input v-model="selected.sub" /></label>
            <label v-if="selected.type === 'llm'">模型
              <select v-model="selected.model">
                <option>鉴定-Qwen32B</option>
                <option>鉴定-GLM32B</option>
              </select>
            </label>
            <label v-if="selected.type === 'knowledge'">知识库<input v-model="selected.kb" /></label>
            <label>提示词 / 规则<textarea v-model="selected.prompt" rows="6"></textarea></label>
            <div class="io"><span>输入</span><b>{{ selected.input }}</b></div>
            <div class="io"><span>输出</span><b>{{ selected.output }}</b></div>
            <div v-if="selected.result" class="io"><span>本步结果</span><b>{{ selected.result }}</b></div>
            <button v-if="selected.type !== 'start'" class="danger" @click="removeNode(selected)">删除节点</button>
          </template>
          <div v-else class="empty">选择画布中的节点，配置模型、知识库和提示词。</div>
        </div>
        <div v-else class="pane">
          <div v-if="!trace.length" class="empty">点击右上角「调试运行」，按节点查看输入输出。</div>
          <article v-for="(step, index) in trace" :key="step.id + index" class="trace">
            <header><b>{{ step.title }}</b><span>{{ step.ms }} ms</span></header>
            <p>{{ step.out }}</p>
          </article>
          <div v-if="answer" class="answer"><b>最终输出</b><p>{{ answer }}</p></div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { agentTemplates } from '@/data/agentTemplates'

const props = defineProps({
  embedded: Boolean,
  mode: { type: String, default: '' },
})
const router = useRouter()
const route = useRoute()
const modeHint = computed(() => ({
  create: '选择预置模板创建试验鉴定智能体，再在画布上调整。',
  design: '在画布上配置节点、模型和知识库。',
  drag: '从左侧点选预置组件，组合成本业务工作流。',
  link: '连接上下游节点，输入输出保持对应。',
  complex: '用分支、循环、代码和 HTTP 编排复杂鉴定业务。',
}[props.mode] || ''))
const current = ref('extract')
const selectedId = ref('llm')
const tab = ref('config')
const scale = ref(1)
const running = ref(false)
const activeId = ref('')
const doneIds = ref([])
const trace = ref([])
const answer = ref('')
let timer = null

const palette = [
  { type: 'classify', title: '问题分类', sub: '意图归类', mark: '类' },
  { type: 'if', title: '条件分支', sub: '规则判断', mark: '若' },
  { type: 'iterate', title: '迭代', sub: '逐项处理', mark: '迭' },
  { type: 'loop', title: '循环', sub: '重复执行', mark: '环' },
  { type: 'code', title: '代码执行', sub: 'Python', mark: '码' },
  { type: 'transform', title: '数据转换', sub: '结构映射', mark: '转' },
  { type: 'aggregate', title: '变量聚合', sub: '多路汇总', mark: '聚' },
  { type: 'doc', title: '文档提取', sub: '正文 / 表格', mark: '文' },
  { type: 'assign', title: '变量赋值', sub: '写入变量', mark: '赋' },
  { type: 'param', title: '参数提取', sub: '字段抽取', mark: '参' },
  { type: 'http', title: 'HTTP请求', sub: '训推 / 工具', mark: 'H' },
  { type: 'list', title: '列表操作', sub: '过滤排序', mark: '列' },
  { type: 'knowledge', title: '知识检索', sub: '资源库召回', mark: '知' },
  { type: 'llm', title: '大模型', sub: 'Qwen32B', mark: 'L' },
  { type: 'answer', title: '直接回复', sub: '输出到业务', mark: '答' },
]

function node(partial) {
  return {
    model: '鉴定-Qwen32B',
    kb: '试验鉴定资源库',
    prompt: '',
    input: '上游输出',
    output: '本节点结果',
    ...partial,
  }
}

const templates = reactive([
  {
    id: 'extract',
    name: '关键指标抽取',
    desc: '驱动资料再造：从定型资料抽取指标并挂接溯源',
    published: true,
    nodes: [
      node({ id: 'start', type: 'start', title: '开始', sub: '定型试验资料', x: 12, y: 148, result: '86 页 · docx', input: '用户文件', output: '原文', prompt: '接收《某型装备性能鉴定试验资料.docx》，共 86 页。' }),
      node({ id: 'doc', type: 'doc', title: '文档提取', sub: '正文 / 表格 / 页码', x: 210, y: 24, result: '正文 86 页 · 表 14', input: '原文', output: '段落与表格', prompt: '按阅读顺序抽出正文、表格和图表标题，保留 P12–P33。' }),
      node({ id: 'kb', type: 'knowledge', title: '指标字典', sub: '7 域 · 11 类', x: 210, y: 276, result: '召回 28 项定义', input: '资料主题', output: '指标定义', kb: '定型指标字典', prompt: '召回火力、机动、防护、探测、通信、可靠性、环境适应性的判据。' }),
      node({ id: 'param', type: 'param', title: '参数提取', sub: '名称 / 数值 / 单位', x: 408, y: 24, result: '≤0.30 mil · ≥65 km/h', input: '正文', output: '参数候选', prompt: '抽出立靶高低偏差、最大行驶速度、最大膛压等判据。' }),
      node({ id: 'llm', type: 'llm', title: '指标抽取', sub: '鉴定-Qwen32B', x: 408, y: 148, result: '28 条 · 0.68–0.95', input: '正文 + 指标定义', output: '指标列表', prompt: '按指标字典抽取数值、单位、页码和原文，低置信标记待审。' }),
      node({ id: 'code', type: 'code', title: '单位换算', sub: 'Python', x: 408, y: 276, result: 'mil / MPa / km/h', input: '指标列表', output: '标准单位', prompt: '把膛压、速度、里程换到指标字典约定的单位。' }),
      node({ id: 'check', type: 'if', title: '量纲校验', sub: '阈值 / 置信度', x: 606, y: 86, result: '25 通过 · 3 待审', input: '标准单位指标', output: '通过 / 待审', prompt: '置信度低于 0.80 的立靶高低偏差、任务可靠度、电磁兼容性进入待审。' }),
      node({ id: 'end', type: 'answer', title: '写入指标表', sub: '资料再造', x: 606, y: 248, result: '28 项 · P12–P33', input: '校验结果', output: '结构化指标', prompt: '回写资料再造指标表，每条保留页码和原文片段。' }),
    ],
    edges: [
      { from: 'start', to: 'doc' },
      { from: 'start', to: 'kb' },
      { from: 'doc', to: 'param' },
      { from: 'doc', to: 'llm' },
      { from: 'kb', to: 'llm' },
      { from: 'param', to: 'llm' },
      { from: 'llm', to: 'code' },
      { from: 'llm', to: 'check' },
      { from: 'code', to: 'check' },
      { from: 'check', to: 'end' },
    ],
    steps: [
      { id: 'start', title: '开始', out: '接收《某型装备性能鉴定试验资料.docx》，86 页。' },
      { id: 'doc', title: '文档提取', out: '抽出正文 86 页、表格 14 张，指标集中在 P12–P33。' },
      { id: 'kb', title: '指标字典', out: '召回 7 个性能域、11 个指标类、28 项判据定义。' },
      { id: 'param', title: '参数提取', out: '识别立靶高低偏差 ≤0.30 mil、最大行驶速度 ≥65 km/h、最大膛压 ≤315 MPa。' },
      { id: 'llm', title: '指标抽取', out: '抽出 28 条指标，置信度 0.68–0.95，每条附页码。' },
      { id: 'code', title: '单位换算', out: '速度、膛压、里程已换到指标字典约定单位。' },
      { id: 'check', title: '量纲校验', out: '25 条通过；0.76、0.72、0.68 三条低置信待审。' },
      { id: 'end', title: '写入指标表', out: '28 项已回写资料再造指标表，溯源 P12–P33。' },
    ],
    answer: '关键指标 28 条已入库。其中立靶高低偏差、任务可靠度、电磁兼容性 3 条置信度低于 0.80，待人工审定。',
  },
  {
    id: 'review',
    name: '试验文档辅助审查',
    desc: '驱动文档审校：对照大纲和标准生成可定位的审查意见',
    published: true,
    nodes: [
      node({ id: 'start', type: 'start', title: '开始', sub: '待审试验报告', x: 12, y: 148, result: '报告 V2 · 8 章', input: '报告 V2', output: '章节', prompt: '接收试验报告与对应大纲。' }),
      node({ id: 'align', type: 'doc', title: '大纲对齐', sub: '章节映射', x: 210, y: 24, result: '第 4 章 ↔ 大纲 V4', input: '报告章节', output: '章节对照', prompt: '把报告章节映射到试验大纲 V4。' }),
      node({ id: 'kb', type: 'knowledge', title: '条款检索', sub: '标准条款', x: 210, y: 276, result: '命中持续时间条款', input: '试验条件', output: '适用条款', kb: '标准与原子化条款', prompt: '检索环境试验和持续时间相关条款。' }),
      node({ id: 'llm', type: 'llm', title: '生成审查意见', sub: '鉴定-Qwen32B', x: 408, y: 148, result: '1 条不一致', input: '对照 + 条款', output: '意见草案', prompt: '指出与大纲或标准不一致之处，并给出修改建议。' }),
      node({ id: 'locate', type: 'param', title: '意见定位', sub: '回写正文位置', x: 606, y: 24, result: '4.2 持续时间', input: '意见草案', output: '定位锚点', prompt: '把意见锚到具体段落。' }),
      node({ id: 'end', type: 'answer', title: '输出审查意见', sub: '审校台', x: 606, y: 248, result: '已推送 1 条意见', input: '定位结果', output: '审查意见', prompt: '推送到文档审校台，供评审人员确认。' }),
    ],
    edges: [
      { from: 'start', to: 'align' },
      { from: 'start', to: 'kb' },
      { from: 'align', to: 'llm' },
      { from: 'kb', to: 'llm' },
      { from: 'llm', to: 'locate' },
      { from: 'locate', to: 'end' },
    ],
    steps: [
      { id: 'start', title: '开始', out: '载入试验报告 V2，共 8 章。' },
      { id: 'align', title: '大纲对齐', out: '第 4 章对齐试验大纲 V4「试验条件」。' },
      { id: 'kb', title: '条款检索', out: '命中原子化条款：规定环境条件下连续运行不少于规定时长。' },
      { id: 'llm', title: '生成审查意见', out: '持续时间记录短于大纲要求，建议复核第 19 发数据。' },
      { id: 'locate', title: '意见定位', out: '定位到「4.2 持续时间」。' },
      { id: 'end', title: '输出审查意见', out: '1 条审查意见已推送到审校台。' },
    ],
    answer: '审查意见已定位到 4.2 持续时间，供文档审校环节直接打开。',
  },
  {
    id: 'qa',
    name: '试验鉴定知识问答',
    desc: '驱动知识问答：检索资源库后生成带来源的回答',
    published: false,
    nodes: [
      node({ id: 'start', type: 'start', title: '开始', sub: '用户问题', x: 12, y: 148, result: '低温试验温度依据？', input: '问题', output: '问句', prompt: '接收鉴定业务咨询。' }),
      node({ id: 'understand', type: 'classify', title: '问题分类', sub: '意图识别', x: 210, y: 148, result: '标准依据 · 环境温度', input: '问句', output: '意图与对象', prompt: '识别意图、对象和需要的标准依据。' }),
      node({ id: 'kb', type: 'knowledge', title: '知识检索', sub: '资源库召回', x: 408, y: 24, result: 'GJB 150A 低温条款', input: '意图', output: '条款片段', kb: '标准规范库', prompt: '按意图召回标准条款和历史试验结论。' }),
      node({ id: 'llm', type: 'llm', title: '生成回答', sub: '鉴定-Qwen32B', x: 408, y: 248, result: '低温工作 -55℃', input: '问句 + 条款', output: '回答草稿', prompt: '只依据召回内容回答，并保留引用编号。' }),
      node({ id: 'cite', type: 'doc', title: '引用溯源', sub: '原文页码', x: 606, y: 24, result: '条款 + 字段出处', input: '回答草稿', output: '引用', prompt: '为每条结论补上来源页码。' }),
      node({ id: 'end', type: 'answer', title: '返回答案', sub: '问答窗口', x: 606, y: 248, result: '答案附出处', input: '回答 + 引用', output: '最终答案', prompt: '把答案和出处一起返回给提问人。' }),
    ],
    edges: [
      { from: 'start', to: 'understand' },
      { from: 'understand', to: 'kb' },
      { from: 'kb', to: 'llm' },
      { from: 'llm', to: 'cite' },
      { from: 'llm', to: 'end' },
      { from: 'cite', to: 'end' },
    ],
    steps: [
      { id: 'start', title: '开始', out: '问题：低温试验的温度范围依据是什么？' },
      { id: 'understand', title: '问题理解', out: '意图=标准依据，对象=环境温度。' },
      { id: 'kb', title: '知识检索', out: '召回 GJB 150A 低温试验条款与资源库温度字段说明。' },
      { id: 'llm', title: '生成回答', out: '低温工作范围通常按 -55℃ 控制，并引用条款编号。' },
      { id: 'cite', title: '引用溯源', out: '出处：GJB 150A，资源库字段 environment_temperature。' },
      { id: 'end', title: '返回答案', out: '答案与出处已返回问答窗口。' },
    ],
    answer: '低温试验温度范围依据 GJB 150A，资源库字段为 environment_temperature。',
  },
])

function workflowFromTemplate(item) {
  const blank = item.mine
  const names = blank ? ['开始', '直接回复'] : ['开始', '数据解析', '知识检索', item.name, '结果校验', '输出结果']
  const types = blank ? ['start', 'answer'] : ['start', 'tool', 'knowledge', 'llm', 'if', 'answer']
  const positions = blank ? [[80, 150], [360, 150]] : [[12, 148], [210, 24], [210, 276], [408, 148], [606, 24], [606, 248]]
  const nodes = names.map((title, index) => node({
    id: `step-${index}`, type: types[index], title,
    sub: index === 0 ? '业务输入' : index === names.length - 1 ? '业务输出' : item.category,
    x: positions[index][0], y: positions[index][1],
    input: index === 0 ? '任务输入' : '上游结果', output: index === names.length - 1 ? '最终结果' : '节点结果',
    prompt: index === 0 ? `接收${item.name}所需的业务资料。` : `按照${item.name}场景处理输入，保留依据与溯源信息。`,
    result: index === 0 ? '任务已接收' : index === names.length - 1 ? '结果已生成' : '本步已完成',
  }))
  const edges = blank ? [{ from: 'step-0', to: 'step-1' }] : [
    { from: 'step-0', to: 'step-1' }, { from: 'step-0', to: 'step-2' },
    { from: 'step-1', to: 'step-3' }, { from: 'step-2', to: 'step-3' },
    { from: 'step-3', to: 'step-4' }, { from: 'step-4', to: 'step-5' },
  ]
  return {
    id: item.id, name: item.name, category: item.category,
    desc: item.brief, published: false, nodes, edges,
    steps: nodes.map((entry, index) => ({ id: entry.id, title: entry.title, out: `${entry.title}已完成${index === 0 ? '，任务输入已接收。' : '，结果已传递至下游节点。'}` })),
    answer: `${item.name}流程调试完成，结果已生成，可继续调整节点配置。`,
  }
}

const savedMine = (() => { try { return JSON.parse(localStorage.getItem('agent-my-templates') || '[]') } catch { return [] } })()
for (const item of [...agentTemplates, ...savedMine]) {
  if (!templates.some(graph => graph.id === item.id)) templates.push(workflowFromTemplate(item))
}

const picked = templates.some((item) => item.id === route.query.tpl) ? route.query.tpl : 'extract'
current.value = picked
selectedId.value = templates.find((item) => item.id === picked).nodes.find((item) => item.type === 'llm')?.id || ''

const NODE_W = 176
const stageRef = ref(null)
const fit = ref(1)
let stageObserver = null

const graph = computed(() => templates.find((item) => item.id === current.value))
const selected = computed(() => graph.value.nodes.find((item) => item.id === selectedId.value))
const edges = computed(() => graph.value.edges)
const boardBox = computed(() => {
  const nodes = graph.value?.nodes || []
  return {
    w: Math.max(640, ...nodes.map((item) => item.x + NODE_W + 24)),
    h: Math.max(380, ...nodes.map((item) => item.y + 108)),
  }
})
const boardScale = computed(() => fit.value * scale.value)
const boardStyle = computed(() => ({
  width: `${boardBox.value.w}px`,
  height: `${boardBox.value.h}px`,
  transform: `scale(${boardScale.value.toFixed(3)})`,
}))
const fitBox = computed(() => ({
  width: `${Math.round(boardBox.value.w * boardScale.value)}px`,
  height: `${Math.round(boardBox.value.h * boardScale.value)}px`,
}))

function measure() {
  const stage = stageRef.value
  const nodes = graph.value?.nodes || []
  if (!stage || !nodes.length) return
  const w = Math.max(...nodes.map((item) => item.x + NODE_W + 24))
  const h = Math.max(...nodes.map((item) => item.y + 108))
  const sx = Math.max(stage.clientWidth - 20, 240) / w
  const sy = Math.max(stage.clientHeight - 20, 220) / h
  fit.value = Math.min(1, sx, sy)
}

function markOf(type) {
  return palette.find((item) => item.type === type)?.mark || { start: '始', tool: '具' }[type] || '节'
}

function nodeById(id) {
  return graph.value.nodes.find((item) => item.id === id)
}

function pathOf(edge) {
  const from = nodeById(edge.from)
  const to = nodeById(edge.to)
  if (!from || !to) return ''
  const x1 = from.x + NODE_W
  const y1 = from.y + 28
  const x2 = to.x
  const y2 = to.y + 28
  const bend = Math.max(48, (x2 - x1) / 2)
  return `M ${x1} ${y1} C ${x1 + bend} ${y1}, ${x2 - bend} ${y2}, ${x2} ${y2}`
}

function switchTo(id) {
  stopRun()
  current.value = id
  selectedId.value = templates.find((item) => item.id === id).nodes.find((item) => item.type === 'llm')?.id || ''
  tab.value = 'config'
  trace.value = []
  answer.value = ''
  doneIds.value = []
}

function addNode(item) {
  const id = `n${Date.now()}`
  const from = selected.value
  graph.value.nodes.push(node({
    id,
    type: item.type,
    title: item.title,
    sub: item.sub,
    x: (from?.x || 200) + 260,
    y: (from?.y || 160) + 20,
    prompt: `配置${item.title}的输入、规则和输出。`,
  }))
  if (from && from.type !== 'answer') graph.value.edges.push({ from: from.id, to: id })
  selectedId.value = id
  tab.value = 'config'
}

function removeNode(node) {
  const graphNow = graph.value
  graphNow.nodes.splice(graphNow.nodes.findIndex((item) => item.id === node.id), 1)
  graphNow.edges = graphNow.edges.filter((edge) => edge.from !== node.id && edge.to !== node.id)
  selectedId.value = ''
}

function dragStart(event, node) {
  if (event.button !== 0) return
  selectedId.value = node.id
  const ox = node.x
  const oy = node.y
  const sx = event.clientX
  const sy = event.clientY
  function move(ev) {
    node.x = Math.max(12, ox + (ev.clientX - sx) / scale.value)
    node.y = Math.max(12, oy + (ev.clientY - sy) / scale.value)
  }
  function up() {
    window.removeEventListener('mousemove', move)
    window.removeEventListener('mouseup', up)
  }
  window.addEventListener('mousemove', move)
  window.addEventListener('mouseup', up)
}

function stopRun() {
  clearInterval(timer)
  timer = null
  running.value = false
  activeId.value = ''
}

function startRun() {
  stopRun()
  const steps = graph.value.steps
  let index = 0
  running.value = true
  tab.value = 'trace'
  trace.value = []
  answer.value = ''
  doneIds.value = []
  timer = setInterval(() => {
    if (index >= steps.length) {
      answer.value = graph.value.answer
      stopRun()
      return
    }
    const step = steps[index]
    activeId.value = step.id
    doneIds.value = [...doneIds.value, step.id]
    trace.value = [...trace.value, { ...step, ms: 420 + index * 90 }]
    index += 1
    if (index >= steps.length) activeId.value = ''
  }, 700)
}

function publish() {
  graph.value.published = true
  answer.value = answer.value || `${graph.value.name}已发布，可供对应业务环节调用。`
  tab.value = 'trace'
}
onMounted(() => {
  measure()
  if (stageRef.value) {
    stageObserver = new ResizeObserver(measure)
    stageObserver.observe(stageRef.value)
  }
})
watch(() => graph.value?.id, () => nextTick(measure))
onBeforeUnmount(() => {
  stopRun()
  stageObserver?.disconnect()
})
</script>

<style scoped>
.studio { height: 100vh; display: flex; flex-direction: column; background: #f3f5f8; color: #1f3348; }
.studio.embedded { height: 100%; }
.top {
  height: 60px; flex: 0 0 60px; display: flex; align-items: center; gap: 14px;
  padding: 0 16px; background: #fff; border-bottom: 1px solid #e6ebf2;
}
.back { border: 0; background: transparent; color: #1a6eae; }
.title { min-width: 220px; }
.title b { display: block; font-size: 15px; }
.title span { color: #7d90a3; font-size: 12px; }
.apps { display: flex; align-items: center; gap: 8px; flex: 1; }
.apps span { color: #63819f; background: #f2f6fa; padding: 5px 9px; border-radius: 6px; font-size: 11px; white-space: nowrap; }
.apps button, .ops button, .zoom button, .palette button, .tabs button {
  border: 1px solid #d7e1ec; background: #fff; color: #355067; border-radius: 8px;
}
.apps button { height: 32px; padding: 0 12px; }
.apps button.on { background: #eef5ff; color: #155eef; border-color: #b9d0fb; font-weight: 650; }
.ops { display: flex; align-items: center; gap: 8px; }
.ops em { font-style: normal; font-size: 12px; color: #8a9aab; background: #f4f6f8; border-radius: 999px; padding: 3px 8px; }
.ops em.on { color: #067647; background: #e7f8ef; }
.ops button { height: 32px; padding: 0 12px; }
.ops .run { background: #155eef; border-color: #155eef; color: #fff; }
.ops .run:disabled { opacity: .6; }
.workspace { flex: 1; min-height: 0; display: grid; grid-template-columns: 188px minmax(0, 1fr) 268px; }
.studio:not(.embedded) .workspace { grid-template-columns: 220px minmax(0, 1fr) 320px; }
.palette, .side { background: #fff; overflow: auto; }
.palette { border-right: 1px solid #e6ebf2; padding: 14px; }
.palette.focus { box-shadow: inset 3px 0 0 #1668a8; }
.palette h3 { font-size: 14px; }
.palette p, .empty { color: #8a9aab; font-size: 12px; line-height: 1.6; }
.palette button { width: 100%; display: flex; gap: 8px; align-items: center; text-align: left; margin-top: 8px; padding: 8px; }
.palette i, .node-h i {
  width: 28px; height: 28px; border-radius: 8px; display: grid; place-items: center;
  color: #fff; font-style: normal; font-size: 12px; flex: 0 0 28px;
}
.palette b, .node-h b { display: block; font-size: 13px; }
.palette small, .node-h small { color: #7d90a3; font-size: 12px; }
.llm { background: #6938ef; } .knowledge { background: #079455; } .tool { background: #155eef; }
.if { background: #dc6803; } .answer { background: #067647; } .start { background: #2970ff; }
.classify { background: #7a5af8; } .iterate, .loop { background: #0e7090; } .code { background: #344054; }
.transform, .aggregate, .assign, .param, .list { background: #175cd3; } .doc { background: #b54708; } .http { background: #b42318; }
.stage { position: relative; overflow: hidden; display: grid; place-items: center; background-image: radial-gradient(#d5dde6 1px, transparent 1px); background-size: 18px 18px; }
.zoom { position: absolute; top: 12px; left: 12px; z-index: 2; display: inline-flex; align-items: center; gap: 6px; background: #fff; border: 1px solid #e1e7ef; border-radius: 8px; padding: 4px; }
.zoom button { width: 26px; height: 26px; }
.zoom span { font-size: 12px; color: #66788a; width: 36px; text-align: center; }
.board-fit { position: relative; }
.board { position: absolute; left: 0; top: 0; transform-origin: 0 0; }
.wires { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
.wires path { fill: none; stroke: #c5d0dc; stroke-width: 2; }
.wires path.hot { stroke: #155eef; stroke-dasharray: 6 4; animation: flow 1s linear infinite; }
.node {
  position: absolute; width: 176px; min-height: 78px; background: #fff; border: 1px solid #e4eaf1;
  border-radius: 12px; box-shadow: 0 6px 16px rgba(16, 24, 40, .06); cursor: grab; padding: 8px 10px 8px 12px;
}
.node.on { border-color: #84adff; box-shadow: 0 0 0 3px rgba(21, 94, 239, .15); }
.node.run { border-color: #155eef; }
.node.done { border-color: #75e0a7; }
.node-h { display: flex; gap: 8px; align-items: center; }
.node-result { display: block; margin: 6px 0 0 36px; color: #1668a8; font-style: normal; font-size: 11px; line-height: 1.35; }
.port { position: absolute; top: 22px; width: 8px; height: 8px; border-radius: 50%; background: #fff; border: 2px solid #98a2b3; }
.port.in { left: -5px; } .port.out { right: -5px; }
.side { border-left: 1px solid #e6ebf2; display: flex; flex-direction: column; }
.tabs { display: flex; gap: 6px; padding: 12px; }
.tabs button { flex: 1; height: 32px; }
.tabs button.on { background: #eef5ff; color: #155eef; border-color: #b9d0fb; }
.pane { padding: 0 12px 16px; overflow: auto; }
.pane label { display: block; margin-bottom: 10px; color: #66788a; font-size: 12px; }
.pane input, .pane select, .pane textarea {
  width: 100%; margin-top: 4px; border: 1px solid #d7e1ec; border-radius: 8px; padding: 8px 10px;
  color: #1f3348; background: #fff; font-size: 13px;
}
.io { display: flex; justify-content: space-between; gap: 8px; font-size: 12px; padding: 6px 0; border-top: 1px solid #eef2f6; }
.io span { color: #8a9aab; } .io b { font-weight: 550; text-align: right; }
.danger { margin-top: 12px; border: 1px solid #f3c3bd; background: #fff; color: #b42318; border-radius: 8px; height: 32px; padding: 0 12px; }
.trace { border: 1px solid #e6ebf2; border-radius: 10px; padding: 8px 10px; margin-bottom: 8px; }
.trace header { display: flex; justify-content: space-between; font-size: 13px; }
.trace span, .trace p, .answer p { color: #66788a; font-size: 12px; line-height: 1.6; }
.answer { background: #f4f8ff; border-radius: 10px; padding: 10px; }
@keyframes flow { to { stroke-dashoffset: -20; } }
</style>
