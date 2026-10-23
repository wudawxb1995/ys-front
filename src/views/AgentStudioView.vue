<template>
  <div class="studio">
    <header class="top">
      <button class="back" @click="router.push('/hub')">← 返回</button>
      <div class="title">
        <b>智能体编排</b>
        <span>{{ graph.desc }}</span>
      </div>
      <div class="apps">
        <button v-for="item in templates" :key="item.id" :class="{ on: item.id === current }" @click="switchTo(item.id)">
          {{ item.name }}
        </button>
      </div>
      <div class="ops">
        <em :class="{ on: graph.published }">{{ graph.published ? '已发布' : '草稿' }}</em>
        <button @click="publish">发布</button>
        <button class="run" :disabled="running" @click="startRun">{{ running ? '运行中' : '调试运行' }}</button>
      </div>
    </header>

    <div class="workspace">
      <aside class="palette">
        <h3>组件</h3>
        <p>点击添加到画布，并从当前节点连出。</p>
        <button v-for="item in palette" :key="item.type" @click="addNode(item)">
          <i :class="item.type">{{ item.mark }}</i>
          <span><b>{{ item.title }}</b><small>{{ item.sub }}</small></span>
        </button>
      </aside>

      <section class="stage" @click="selectedId = ''">
        <div class="zoom">
          <button @click.stop="scale = Math.max(0.7, +(scale - 0.1).toFixed(1))">−</button>
          <span>{{ Math.round(scale * 100) }}%</span>
          <button @click.stop="scale = Math.min(1.3, +(scale + 0.1).toFixed(1))">+</button>
        </div>
        <div class="board" :style="{ transform: `scale(${scale})` }">
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
            <span v-if="node.type !== 'answer'" class="port out"></span>
          </article>
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
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
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
  { type: 'llm', title: 'LLM', sub: '领域大模型', mark: 'L' },
  { type: 'knowledge', title: '知识检索', sub: '资源库召回', mark: '知' },
  { type: 'tool', title: '工具', sub: '解析 / 定位', mark: '具' },
  { type: 'if', title: '条件分支', sub: '规则判断', mark: '若' },
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
      node({ id: 'start', type: 'start', title: '开始', sub: '上传定型资料', x: 48, y: 210, input: '用户文件', output: '原文', prompt: '接收 PDF / Word 定型资料。' }),
      node({ id: 'parse', type: 'tool', title: '文档解析', sub: '版式还原', x: 320, y: 80, input: '原文', output: '段落与表格', prompt: '按页抽取正文、表格和图表标题。' }),
      node({ id: 'kb', type: 'knowledge', title: '指标字典', sub: '资源库 · 指标本体', x: 320, y: 330, input: '资料主题', output: '指标定义', kb: '定型指标字典', prompt: '召回指标名称、单位和判定阈值。' }),
      node({ id: 'llm', type: 'llm', title: '指标抽取', sub: '鉴定-Qwen32B', x: 610, y: 200, input: '正文 + 指标定义', output: '指标列表', prompt: '按指标字典抽取数值、单位和原文位置，无法确定时标记待确认。' }),
      node({ id: 'check', type: 'if', title: '量纲校验', sub: '单位 / 阈值', x: 900, y: 200, input: '指标列表', output: '通过 / 待确认', prompt: '单位与阈值不一致时进入待确认。' }),
      node({ id: 'end', type: 'answer', title: '写入指标表', sub: '资料再造', x: 1160, y: 200, input: '校验结果', output: '结构化指标', prompt: '回写资料再造平台的指标表，并保留页码溯源。' }),
    ],
    edges: [
      { from: 'start', to: 'parse' },
      { from: 'start', to: 'kb' },
      { from: 'parse', to: 'llm' },
      { from: 'kb', to: 'llm' },
      { from: 'llm', to: 'check' },
      { from: 'check', to: 'end' },
    ],
    steps: [
      { id: 'start', title: '开始', out: '接收《东方红-LF2204 定型试验报告.pdf》，86 页。' },
      { id: 'parse', title: '文档解析', out: '还原正文 86 页、表格 14 张、图题 9 条。' },
      { id: 'kb', title: '指标字典', out: '召回最大牵引力、燃油消耗率、通过性等 28 项定义。' },
      { id: 'llm', title: '指标抽取', out: '抽出 28 条指标，每条附页码与原文片段。' },
      { id: 'check', title: '量纲校验', out: '26 条通过，2 条单位待人工确认。' },
      { id: 'end', title: '写入指标表', out: '已回写资料再造指标表，溯源链接 28 条。' },
    ],
    answer: '关键指标 28 条已入库，其中 2 条单位待确认。该结果供资料再造环节直接使用。',
  },
  {
    id: 'review',
    name: '试验文档辅助审查',
    desc: '驱动文档审校：对照大纲和标准生成可定位的审查意见',
    published: true,
    nodes: [
      node({ id: 'start', type: 'start', title: '开始', sub: '待审试验报告', x: 48, y: 200, input: '报告 V2', output: '章节', prompt: '接收试验报告与对应大纲。' }),
      node({ id: 'align', type: 'tool', title: '大纲对齐', sub: '章节映射', x: 330, y: 90, input: '报告章节', output: '章节对照', prompt: '把报告章节映射到试验大纲 V4。' }),
      node({ id: 'kb', type: 'knowledge', title: '条款检索', sub: 'GJB / 原子化条款', x: 330, y: 320, input: '试验条件', output: '适用条款', kb: '标准与原子化条款', prompt: '检索环境试验和持续时间相关条款。' }),
      node({ id: 'llm', type: 'llm', title: '生成审查意见', sub: '鉴定-Qwen32B', x: 630, y: 200, input: '对照 + 条款', output: '意见草案', prompt: '指出与大纲或标准不一致之处，并给出修改建议。' }),
      node({ id: 'locate', type: 'tool', title: '意见定位', sub: '回写正文位置', x: 920, y: 200, input: '意见草案', output: '定位锚点', prompt: '把意见锚到具体段落。' }),
      node({ id: 'end', type: 'answer', title: '输出审查意见', sub: '审校台', x: 1180, y: 200, input: '定位结果', output: '审查意见', prompt: '推送到文档审校台，供评审人员确认。' }),
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
      node({ id: 'start', type: 'start', title: '开始', sub: '用户问题', x: 48, y: 200, input: '问题', output: '问句', prompt: '接收鉴定业务咨询。' }),
      node({ id: 'understand', type: 'llm', title: '问题理解', sub: '意图识别', x: 320, y: 200, input: '问句', output: '意图与对象', prompt: '识别意图、装备对象和需要的标准依据。' }),
      node({ id: 'kb', type: 'knowledge', title: '知识检索', sub: '资源库召回', x: 600, y: 200, input: '意图', output: '条款片段', kb: '标准规范库', prompt: '按意图召回标准条款和历史试验结论。' }),
      node({ id: 'llm', type: 'llm', title: '生成回答', sub: '鉴定-Qwen32B', x: 880, y: 200, input: '问句 + 条款', output: '回答草稿', prompt: '只依据召回内容回答，并保留引用编号。' }),
      node({ id: 'cite', type: 'tool', title: '引用溯源', sub: '原文页码', x: 1140, y: 80, input: '回答草稿', output: '引用', prompt: '为每条结论补上来源页码。' }),
      node({ id: 'end', type: 'answer', title: '返回答案', sub: '问答窗口', x: 1140, y: 320, input: '回答 + 引用', output: '最终答案', prompt: '把答案和出处一起返回给提问人。' }),
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

const graph = computed(() => templates.find((item) => item.id === current.value))
const selected = computed(() => graph.value.nodes.find((item) => item.id === selectedId.value))
const edges = computed(() => graph.value.edges)

function markOf(type) {
  return { start: '始', llm: 'L', knowledge: '知', tool: '具', if: '若', answer: '答' }[type] || '节'
}

function nodeById(id) {
  return graph.value.nodes.find((item) => item.id === id)
}

function pathOf(edge) {
  const from = nodeById(edge.from)
  const to = nodeById(edge.to)
  if (!from || !to) return ''
  const x1 = from.x + 220
  const y1 = from.y + 34
  const x2 = to.x
  const y2 = to.y + 34
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
</script>

<style scoped>
.studio { height: 100vh; display: flex; flex-direction: column; background: #f3f5f8; color: #1f3348; }
.top {
  height: 60px; flex: 0 0 60px; display: flex; align-items: center; gap: 14px;
  padding: 0 16px; background: #fff; border-bottom: 1px solid #e6ebf2;
}
.back { border: 0; background: transparent; color: #1a6eae; }
.title { min-width: 220px; }
.title b { display: block; font-size: 15px; }
.title span { color: #7d90a3; font-size: 12px; }
.apps { display: flex; gap: 6px; flex: 1; }
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
.workspace { flex: 1; min-height: 0; display: grid; grid-template-columns: 220px minmax(0, 1fr) 320px; }
.palette, .side { background: #fff; overflow: auto; }
.palette { border-right: 1px solid #e6ebf2; padding: 14px; }
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
.stage { position: relative; overflow: auto; background-image: radial-gradient(#d5dde6 1px, transparent 1px); background-size: 18px 18px; }
.zoom { position: sticky; top: 12px; left: 12px; z-index: 2; display: inline-flex; align-items: center; gap: 6px; margin: 12px; background: #fff; border: 1px solid #e1e7ef; border-radius: 8px; padding: 4px; }
.zoom button { width: 26px; height: 26px; }
.zoom span { font-size: 12px; color: #66788a; width: 36px; text-align: center; }
.board { position: relative; width: 1460px; height: 680px; transform-origin: 0 0; }
.wires { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
.wires path { fill: none; stroke: #c5d0dc; stroke-width: 2; }
.wires path.hot { stroke: #155eef; stroke-dasharray: 6 4; animation: flow 1s linear infinite; }
.node {
  position: absolute; width: 220px; min-height: 68px; background: #fff; border: 1px solid #e4eaf1;
  border-radius: 12px; box-shadow: 0 6px 16px rgba(16, 24, 40, .06); cursor: grab; padding: 10px 14px;
}
.node.on { border-color: #84adff; box-shadow: 0 0 0 3px rgba(21, 94, 239, .15); }
.node.run { border-color: #155eef; }
.node.done { border-color: #75e0a7; }
.node-h { display: flex; gap: 8px; align-items: center; }
.port { position: absolute; top: 28px; width: 8px; height: 8px; border-radius: 50%; background: #fff; border: 2px solid #98a2b3; }
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
