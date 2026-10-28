<template>
  <div class="insight-flow">
    <template v-if="view === 'results'">
      <div class="kpis">
        <div v-for="item in kpis" :key="item.label" class="kpi">
          <b>{{ item.value }}</b>
          <span>{{ item.label }}</span>
        </div>
      </div>
      <div class="dirs">
        <button v-for="dir in directions" :key="dir.id" type="button" :class="{ on: direction === dir.id }" @click="direction = dir.id">{{ dir.name }}</button>
      </div>
      <div class="result-grid">
        <aside class="result-list">
          <button v-for="item in filtered" :key="item.id" type="button" class="result-card" :class="{ on: item.id === activeId }" @click="activeId = item.id">
            <div class="card-top"><span>{{ item.no }} {{ item.directionName }}</span><em v-if="item.tag">{{ item.tag }}</em></div>
            <b>{{ item.title }}</b>
            <small>创新度 {{ item.innov }} · 热度 {{ item.heat }} · {{ item.stage }}</small>
          </button>
        </aside>
        <article v-if="active" class="result-detail">
          <div class="detail-top">
            <div>
              <div class="card-top"><span>{{ active.directionName }}</span><em>{{ active.tag || active.stage }}</em></div>
              <h2>{{ active.title }}</h2>
              <p>{{ active.summary }}</p>
            </div>
            <span class="code">{{ active.code }}</span>
          </div>
          <div class="detail-actions">
            <el-button type="primary" @click="view = 'graph'">查看技术图谱</el-button>
            <el-button @click="openReport">生成技术研判报告</el-button>
          </div>
          <section><h3>要解决的问题</h3><p>{{ active.problem }}</p></section>
          <section><h3>技术原理</h3><p>{{ active.principle }}</p></section>
          <section><h3>核心创新内容</h3><p>{{ active.content }}</p></section>
          <section><h3>试验鉴定应用价值</h3><p>{{ active.value }}</p></section>
          <blockquote>
            <b>证据原文</b>
            <p>{{ active.quote }}</p>
            <small>{{ active.source }}</small>
          </blockquote>
        </article>
      </div>
    </template>

    <template v-else-if="view === 'graph'">
      <div class="graph-bar">
        <button type="button" class="text-btn" @click="view = 'results'">← 返回挖掘结果</button>
        <div class="graph-current">
          <span>当前创新点</span>
          <b>{{ active.title }}</b>
          <em>{{ graphModel.nodes.length }} 个节点 · {{ graphModel.links.length }} 条关系</em>
        </div>
        <el-button type="primary" @click="openReport">生成技术研判报告</el-button>
      </div>
      <div class="graph-layout">
        <div class="graph-board">
          <div class="dirs">
            <button v-for="chip in graphChips" :key="chip" type="button" :class="{ on: graphChip === chip }" @click="graphChip = chip">{{ chip }}</button>
          </div>
          <InsightGraph
            :nodes="graphModel.nodes"
            :links="graphModel.links"
            :selected="graphNode"
            :focus="graphChip"
            @update:selected="graphNode = $event"
          />
        </div>
        <aside class="graph-side">
          <div class="side-kicker">当前选中节点</div>
          <span class="side-badge">{{ sideNode.group }}</span>
          <h3>{{ sideNode.title }}</h3>
          <p>{{ sideNode.text }}</p>
          <div class="side-block">
            <span>关联关系</span>
            <b>{{ sideNode.rels }}</b>
          </div>
          <div v-if="sideNode.evidence" class="side-block">
            <span>引用证据</span>
            <b>{{ sideNode.evidence.title }}</b>
            <small>{{ sideNode.evidence.source }}</small>
            <p class="quote">{{ sideNode.evidence.quote }}</p>
          </div>
          <div v-if="sideNode.hub" class="judge">
            <span>综合研判</span>
            <div class="judge-nums">
              <div><b>{{ active.innov }}</b><small>创新度</small></div>
              <div><b>{{ active.heat }}</b><small>热度</small></div>
              <div><b>{{ active.evidence }}</b><small>证据</small></div>
            </div>
            <p>{{ active.summary }}</p>
          </div>
        </aside>
      </div>
    </template>

    <template v-else>
      <section class="report-banner">
        <h2>{{ reportTitle }}</h2>
        <p>创新点、图谱关系与证据资料自动组稿，形成试验鉴定技术发展研判结论。</p>
      </section>
      <div class="report-tools">
        <button type="button" class="text-btn" @click="view = 'results'">← 返回挖掘结果</button>
        <button type="button" class="text-btn" @click="view = 'results'">查看创新点</button>
        <button type="button" class="text-btn" @click="view = 'graph'">查看关联图谱</button>
      </div>

      <section v-if="reportPhase === 'ready'" class="ready-card">
        <b>报告生成条件已就绪</b>
        <p>将自动组织技术背景、创新突破、图谱演进、发展态势、应用场景、风险与研发建议。</p>
        <el-button type="primary" @click="startReport">生成技术研判报告</el-button>
      </section>

      <section v-else-if="reportPhase === 'loading'" class="ready-card">
        <b>正在生成技术研判报告</b>
        <p>正在汇集创新点属性、图谱节点及证据引用，形成八部分研判正文。</p>
        <el-progress :percentage="progress" :stroke-width="8" />
      </section>

      <article v-else class="report-doc">
        <header>
          <span>技术研判报告已生成</span>
          <button type="button" class="text-btn" @click="reportPhase = 'ready'">重新生成</button>
        </header>
        <h2>{{ reportTitle }}</h2>
        <p class="report-sub">试验鉴定领域知识深度挖掘与技术研判平台</p>
        <section v-for="block in reportBlocks" :key="block.title">
          <h3>{{ block.title }}</h3>
          <p>{{ block.text }}</p>
        </section>
      </article>
    </template>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { insightDirections, insightMineItems } from '@/data/insightMine'
import { buildInsightGraph, insightGraphChips } from '@/data/insightGraph'
import InsightGraph from '@/components/pages/InsightGraph.vue'

const directions = insightDirections
const items = insightMineItems

const route = useRoute()
const view = ref('results')
const direction = ref('all')
const activeId = ref(String(route.query.id || items[0].id))
watch(() => route.query.id, (id) => {
  if (id && items.some((item) => item.id === id)) activeId.value = String(id)
})
const graphChip = ref('全部节点')
const graphNode = ref('hub')
const graphChips = insightGraphChips
const reportPhase = ref('ready')
const progress = ref(0)
let timer = 0

const filtered = computed(() => items.filter((item) => direction.value === 'all' || item.direction === direction.value))
const active = computed(() => items.find((item) => item.id === activeId.value) || filtered.value[0] || items[0])
const kpis = computed(() => [
  { label: '挖掘创新点', value: `${items.length} 项` },
  { label: '覆盖技术方向', value: `${directions.length - 1} 个` },
  { label: '关联证据资料', value: `${items.reduce((sum, item) => sum + item.evidence, 0)} 份` },
  { label: '优先研发方向', value: `${items.filter((item) => item.tag === '优先研发').length} 项` },
])
const reportTitle = computed(() => `${active.value.title}研判报告`)

const graphModel = computed(() => buildInsightGraph(active.value))
const sideNode = computed(() => graphModel.value.nodes.find((node) => node.id === graphNode.value) || graphModel.value.nodes[0])
watch(activeId, () => { graphNode.value = 'hub' })

const reportBlocks = computed(() => {
  const item = active.value
  return [
    { title: '一、技术背景与问题牵引', text: `${item.title}直接关系军事试验鉴定的科学性、效率和证据质量。当前主要问题为：${item.problem}本次研判以已入库科技文献、归档试验报告、指标和图谱关系为依据，重述并评估该技术方法研究走向工程应用的条件。` },
    { title: '二、创新点关键技术突破', text: `${item.title}的核心突破在于：${item.content}其技术原理为：${item.principle}与传统依赖人工经验、分散数据和事后分析的方式相比，该方向强调模型、规则与试验证据协同。` },
    { title: '三、技术关联与演进路径', text: `图谱已关联该创新点的测量方法、验证指标、异常发次和复测结果。${item.value}关键技术包括时间同步、坐标统一和测量不确定度评定，经关键方法验证、指标比对和标准约束，逐步进入 30 发正式试验与 1 发复测。` },
    { title: '四、发展态势分析', text: `该方向创新度 ${item.innov}、发展热度 ${item.heat}，当前阶段为${item.stage}。近两年工程化验证比例上升，优先建议先完成与现有测量链路的同工况比对，再扩展到复杂背景和多站协同。` },
    { title: '五、试验鉴定应用场景', text: item.value },
    { title: '六、证据与风险', text: `${item.quote}主要风险是测量链路时钟不一致、复测结果被回写为首测合格，以及没有条款出处时自行编号。证据来源：${item.source}` },
    { title: '七、研发与验证建议', text: '建议先做小样本同链路比对，核对时间同步、坐标基准和不确定度评定；通过后再纳入正式鉴定流程。复测样本继续单独编号，不并入正式统计。' },
    { title: '八、结论', text: `${item.title}已具备从原型验证走向工程试用的证据基础。结论只适用于当前指标树版本和已关联的试验数据，指标树升版或新增样本后需要重新核对。` },
  ]
})

function openReport() {
  reportPhase.value = 'ready'
  progress.value = 0
  view.value = 'report'
}
function startReport() {
  reportPhase.value = 'loading'
  progress.value = 8
  clearInterval(timer)
  timer = setInterval(() => {
    progress.value = Math.min(100, progress.value + 12)
    if (progress.value >= 100) {
      clearInterval(timer)
      reportPhase.value = 'done'
    }
  }, 180)
}
onBeforeUnmount(() => clearInterval(timer))
</script>

<style scoped>
.insight-flow { display: flex; flex-direction: column; gap: 12px; color: #29465c; }
.kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.kpi, .result-card, .result-detail, .graph-board, .graph-side, .report-banner, .ready-card, .report-doc {
  background: #fff; border: 1px solid #e3edf5; border-radius: 12px;
}
.kpi { padding: 14px 16px; }
.kpi b { display: block; color: #0d4e83; font-size: 22px; }
.kpi span, .card-top, .result-card small, .code, .report-sub { color: #8a9aaa; font-size: 12px; }
.dirs { display: flex; flex-wrap: wrap; gap: 8px; }
.dirs button, .text-btn { border: 1px solid #d7e3ee; background: #fff; color: #4d6982; border-radius: 999px; padding: 5px 12px; cursor: pointer; }
.dirs button.on { background: #1668a8; color: #fff; border-color: #1668a8; }
.text-btn { border: 0; background: none; color: #1668a8; padding: 0; }
.result-grid { display: grid; grid-template-columns: 320px minmax(0, 1fr); gap: 12px; align-items: start; }
.graph-layout { display: grid; grid-template-columns: minmax(0, 1fr) 300px; gap: 12px; align-items: start; }
.result-list { display: flex; flex-direction: column; gap: 8px; max-height: calc(100vh - 250px); overflow: auto; }
.result-card { text-align: left; padding: 12px; cursor: pointer; }
.result-card.on { border-color: #1668a8; box-shadow: 0 0 0 3px rgba(22, 104, 168, .12); }
.card-top { display: flex; justify-content: space-between; gap: 8px; margin-bottom: 6px; }
.card-top em { font-style: normal; color: #1668a8; background: #e8f3fb; border-radius: 999px; padding: 1px 8px; }
.result-card b, .result-detail h2, .graph-side h3, .report-banner h2, .report-doc h2 { color: #16324a; }
.result-card b { display: block; font-size: 14px; line-height: 1.5; }
.result-detail { padding: 18px 20px; }
.result-detail h2 { margin: 6px 0; font-size: 20px; line-height: 1.45; }
.detail-top { display: flex; justify-content: space-between; gap: 16px; }
.detail-actions { display: flex; gap: 8px; margin: 14px 0; }
.result-detail section { margin-top: 14px; }
.result-detail h3, .report-doc h3 { margin: 0 0 6px; color: #0d4e83; font-size: 15px; }
.result-detail p, .report-doc p, .ready-card p, .graph-side p { margin: 0; line-height: 1.75; color: #4d6278; }
.result-detail blockquote { margin: 16px 0 0; padding: 12px 14px; background: #f7fbfe; border-radius: 8px; }
.result-detail blockquote small { display: block; margin-top: 6px; color: #8a9aaa; }
.graph-bar, .report-tools { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
.graph-current { display: flex; align-items: baseline; gap: 10px; min-width: 0; flex: 1; }
.graph-current span, .graph-current em, .side-kicker, .side-block span, .judge > span { color: #8a9aaa; font-size: 12px; }
.graph-current b { color: #16324a; font-size: 14px; line-height: 1.45; }
.graph-current em { font-style: normal; white-space: nowrap; }
.graph-bar :deep(.el-button) { margin-left: auto; }
.graph-board { padding: 14px 14px 16px; }
.graph-board .dirs { margin-bottom: 12px; }
.graph-side { padding: 16px; }
.side-kicker { margin-bottom: 8px; }
.side-badge { display: inline-block; margin-bottom: 8px; color: #1668a8; background: #e8f3fb; border-radius: 999px; padding: 2px 8px; font-size: 12px; }
.graph-side h3 { margin: 0 0 8px; font-size: 16px; line-height: 1.45; }
.side-block { margin-top: 14px; padding-top: 12px; border-top: 1px solid #eef3f8; }
.side-block b, .side-block small { display: block; }
.side-block b { margin-top: 4px; color: #16324a; line-height: 1.5; }
.side-block small { margin-top: 2px; color: #8a9aaa; }
.quote { margin-top: 8px; color: #4d6278; line-height: 1.7; }
.judge { margin-top: 14px; padding-top: 12px; border-top: 1px solid #eef3f8; }
.judge-nums { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin: 10px 0; }
.judge-nums div { background: #f4f8fb; border-radius: 8px; padding: 8px 6px; text-align: center; }
.judge-nums b { display: block; color: #0d4e83; font-size: 20px; }
.judge-nums small, .judge p { color: #6d8194; }
.judge p { margin: 0; line-height: 1.7; font-size: 13px; }
.report-banner, .ready-card, .report-doc { padding: 18px 20px; }
.report-banner h2, .report-doc h2 { margin: 0; font-size: 20px; }
.report-banner p { margin: 6px 0 0; }
.ready-card { text-align: center; padding: 48px 20px; }
.ready-card b { color: #0d4e83; font-size: 16px; }
.ready-card p { margin: 8px auto 16px; max-width: 640px; }
.ready-card :deep(.el-progress) { max-width: 720px; margin: 8px auto 0; }
.report-doc header { display: flex; justify-content: space-between; color: #2e9b57; margin-bottom: 12px; }
.report-doc h2 { text-align: center; }
.report-sub { text-align: center; color: #8a9aaa; margin: 6px 0 18px; }
.report-doc section { margin-top: 16px; }
@media (max-width: 1100px) {
  .kpis, .result-grid, .graph-layout { grid-template-columns: 1fr; }
}
</style>
