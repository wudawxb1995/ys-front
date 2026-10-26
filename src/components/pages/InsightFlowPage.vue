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
        <div class="dirs">
          <button v-for="chip in graphChips" :key="chip" type="button" :class="{ on: graphChip === chip }" @click="graphChip = chip">{{ chip }}</button>
        </div>
      </div>
      <div class="graph-layout">
        <div class="graph-canvas">
          <button type="button" class="g-node hub" :style="hubStyle" @click="graphNode = 'hub'">{{ active.title }}</button>
          <button v-for="node in visibleNodes" :key="node.id" type="button" class="g-node" :class="[node.tone, { on: graphNode === node.id }]" :style="node.style" @click="graphNode = node.id">{{ node.label }}</button>
        </div>
        <aside class="graph-side">
          <h3>{{ sideNode.label }}</h3>
          <p>{{ sideNode.text }}</p>
          <div class="side-meta"><span>关联关系</span><b>{{ sideNode.rel }}</b></div>
          <div class="side-meta"><span>证据</span><b>{{ active.evidence }} 份资料</b></div>
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
import { computed, onBeforeUnmount, ref } from 'vue'

const directions = [
  { id: 'all', name: '全部方向' },
  { id: 'target', name: '立靶偏差智能测量' },
  { id: 'cause', name: '智能试验与异常分析' },
  { id: 'sim', name: '试验推演与评估' },
  { id: 'plan', name: '智能试验设计' },
  { id: 'evidence', name: '试验质量与证据链' },
  { id: 'guide', name: '智能测量与制导' },
]

const items = [
  {
    id: 'ip-30005', no: '01', direction: 'target', directionName: '立靶偏差智能测量', tag: '优先研发',
    title: '多源光测融合的立靶高低偏差智能测量与误差溯源技术',
    code: '创新点编号 IP-30005', innov: 96, heat: 94, stage: '原型验证', evidence: 4,
    summary: '建议优先开展与现有立靶测量链路的比对验证，重点验证时间同步、坐标基准统一和复杂背景下弹着点识别能力。',
    problem: '立靶高低偏差测量涉及弹着点识别、炮目坐标转换、弹道气象修正和复测判定。单一测量链路难以同时支撑高精度判定与异常复盘。',
    principle: '融合靶面图像、雷达通测和光电经纬仪测量，通过统一时间基准和炮目坐标系完成弹着点空间定位，并联合弹道气象数据修正系统误差。',
    content: '突破弹着点业像素识别、多源光测时间同步、炮目坐标统一转换和测量不确定度自动评定，形成从原始图像到偏差判定、异常溯源的完整证据链。',
    value: '可用于立靶高低偏差指标的智能判读与复核。对第19发 0.42 mil 超差和复测 0.18 mil 结果进行同链路比对，辅助区分测量误差、气象修正误差与装备状态异常。',
    quote: '以多站光测观测和标靶图像为共同证据，经时间同步、坐标统一转换和弹着点像素定位计算立靶高低偏差，并同步给出测量不确定度及原始证据索引。',
    source: '《立靶偏差多源光测融合测量与误差溯源研究》，武器科技文献库，2025年。',
  },
  {
    id: 'ip-30011', no: '02', direction: 'cause', directionName: '智能试验与异常分析', tag: '优先研发',
    title: '多源试验数据驱动的异常根因推理',
    code: '创新点编号 IP-30011', innov: 95, heat: 91, stage: '工程验证', evidence: 5,
    summary: '把遥测、光测和标定记录放到同一发次上推理，优先解释单发超差而不是用批次均值掩盖。',
    problem: '异常发次往往同时出现姿态、温度和初速变化，人工复盘很难判断哪一条证据先发生。',
    principle: '按发次对齐遥测、光测和标定数据，沿温度跳变、姿态漂移和温补系数偏差逐层回溯。',
    content: '输出候选根因、置信度和证据链，保留首测与复测两套记录，避免把复测符合回写成首测合格。',
    value: '直接服务第19发立靶超差复盘，把定位定向系统温补失效与现场处置、复测结果连成闭环。',
    quote: '异常事件按发次编号串联原始记录、分析结论和处置单，缺失任一环节不得给出闭环结论。',
    source: '《第19发超差事件解读报告》V1.1，事件 EVT-001。',
  },
  {
    id: 'ip-30018', no: '03', direction: 'target', directionName: '立靶偏差智能测量', tag: '',
    title: '多站光电时序同步与弹着点三维重构技术',
    code: '创新点编号 IP-30018', innov: 91, heat: 87, stage: '原型验证', evidence: 3,
    summary: '用统一授时把多站光电观测恢复到同一时刻，再重建弹着点空间位置。',
    problem: '各观测站时钟偏差会把同一发弹着点拆成多个位置，高低偏差随之失真。',
    principle: '以授时脉冲对齐各站曝光时刻，再用共同炮目坐标系解算弹着点。',
    content: '输出三维弹着点和各站残差，残差超限的站点不进入正式偏差计算。',
    value: '为立靶高低、方向偏差提供可复核的空间位置，而不是只保留一张靶纸读数。',
    quote: '多站观测必须先完成时序同步，再进入弹着点解算。',
    source: '光电测量试验记录，2025年。',
  },
  {
    id: 'ip-30022', no: '04', direction: 'sim', directionName: '试验推演与评估', tag: '',
    title: '数字孪生驱动的试验过程推演与鉴定评估',
    code: '创新点编号 IP-30022', innov: 90, heat: 88, stage: '原理验证', evidence: 3,
    summary: '用孪生模型预演工况和样本安排，再对照实测判断方案是否覆盖判据。',
    problem: '大纲样本和工况往往到现场才发现覆盖不足，补测成本高。',
    principle: '把指标树判据、装备状态和气象边界放进孪生过程，提前推演超差风险。',
    content: '推演结果只作为试验准备依据，不替代实测判定。',
    value: '帮助在开试前发现温补、气象和测量链路的薄弱工况。',
    quote: '推演结论必须回链到指标树条款，不能单独作为鉴定结论。',
    source: '试验过程推演技术说明，2025年。',
  },
  {
    id: 'ip-30027', no: '05', direction: 'plan', directionName: '智能试验设计', tag: '',
    title: '指标树约束下的试验方案与资源协同优化',
    code: '创新点编号 IP-30027', innov: 88, heat: 86, stage: '原理验证', evidence: 2,
    summary: '按已发布指标树安排科目、样本和测量资源，避免方案与判据脱节。',
    problem: '方案章节和指标树版本不一致时，现场记录无法直接支撑判定。',
    principle: '以指标树为约束生成科目和资源清单，并标注每项指标对应的数据源。',
    content: '资源冲突和缺测项在方案阶段标出，不留到数据汇总后再补。',
    value: '保证 28 项指标都有对应的测量链路和样本数量。',
    quote: '试验方案中的判据版本应与已发布指标树一致。',
    source: '指标树 V1.0 与试验大纲对照说明。',
  },
  {
    id: 'ip-30031', no: '06', direction: 'guide', directionName: '智能测量与制导', tag: '',
    title: '温补气象联合修正的弹道偏差溯源试验技术',
    code: '创新点编号 IP-30031', innov: 86, heat: 84, stage: '工程验证', evidence: 4,
    summary: '把温补系数和气象修正放到同一发次里解释弹道偏差来源。',
    problem: '温补失效和气象修正误差都会表现为立靶偏差，单独看其中一个容易误判。',
    principle: '对照温补标定、气象观测和弹道测量残差，区分装备状态与环境修正。',
    content: '给出偏差来源排序和对应证据，不把环境修正误差写成装备故障。',
    value: '支撑第19发温补失效与气象修正的分流判断。',
    quote: '弹道残差需同时对照温补系数和气象修正量。',
    source: '弹道测量与气象保障对照记录。',
  },
  {
    id: 'ip-30036', no: '07', direction: 'evidence', directionName: '试验质量与证据链', tag: '',
    title: '复测样本与正式样本分离的判定口径固化',
    code: '创新点编号 IP-30036', innov: 84, heat: 80, stage: '工程验证', evidence: 2,
    summary: '正式统计只计 30 发，复测单独列表，结论里并列首测和复测。',
    problem: '复测符合容易被读成首测合格，批次统计被单发处置结果带偏。',
    principle: '正式样本、复测样本和判定结论使用不同字段，禁止回写。',
    content: '判定表保留两个值，并写明复测不进入正式样本基数。',
    value: '避免鉴定结论把处置后的复测结果算进首测合格数。',
    quote: '复测符合不能回写为首测合格，两套数值都要保留。',
    source: '精度试验数据汇总口径说明。',
  },
  {
    id: 'ip-30040', no: '08', direction: 'evidence', directionName: '试验质量与证据链', tag: '优先研发',
    title: '试验证据链自动回链与条款定位',
    code: '创新点编号 IP-30040', innov: 83, heat: 79, stage: '原型验证', evidence: 3,
    summary: '从结论句回到指标树条款、发次记录和异常事件编号。',
    problem: '报告判定句经常缺少条款号和原始记录位置，复核时对不上。',
    principle: '每条判定同时挂指标树版本、发次编号和证据原文位置。',
    content: '没有出处的条款不自动编号，只提示人工核对。',
    value: '让审校可以直接从结论跳回原文和数据源。',
    quote: '任一判定句都应能顺着发次编号回到源文件。',
    source: '试验鉴定证据链组织规范。',
  },
]

const view = ref('results')
const direction = ref('all')
const activeId = ref(items[0].id)
const graphChip = ref('全部节点')
const graphNode = ref('hub')
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

const graphNodes = [
  { id: 'n1', group: '创新点', tone: 'blue', label: '立靶偏差智能测量', text: '当前创新点所属技术方向，承接光测、雷达和靶纸证据。', rel: '属于' },
  { id: 'n2', group: '关键方法', tone: 'blue', label: '多源光测时间同步', text: '统一各站曝光时刻，避免同一发弹着点被拆开。', rel: '采用' },
  { id: 'n3', group: '关键方法', tone: 'blue', label: '炮目坐标统一转换', text: '把各站观测转换到同一炮目坐标系。', rel: '采用' },
  { id: 'n4', group: '验证指标', tone: 'gold', label: '高低 ≤0.30 mil', text: '指标树判据。第19发首测 0.42 mil，复测 0.18 mil。', rel: '对照' },
  { id: 'n5', group: '异常发次', tone: 'gold', label: '第19发 EVT-001', text: '立靶高低偏差超差事件，处置后复测符合。', rel: '关联' },
  { id: 'n6', group: '复测结果', tone: 'green', label: '复测 0.18 mil', text: '复测记录单独保留，不回写为首测合格。', rel: '形成' },
  { id: 'n7', group: '根因溯源', tone: 'green', label: '温补失效', text: '定位定向系统温补失效为候选根因，置信度 0.86。', rel: '解释' },
  { id: 'n8', group: '证据文献', tone: 'blue', label: '光测与靶纸证据', text: '靶纸、测量文件和设备日志按同一发次编号存放。', rel: '引用' },
]
const graphChips = ['全部节点', ...new Set(graphNodes.map((node) => node.group))]
const visibleNodes = computed(() => graphNodes
  .filter((node) => graphChip.value === '全部节点' || node.group === graphChip.value)
  .map((node, index, list) => {
    const angle = (-90 + (360 / list.length) * index) * Math.PI / 180
    return { ...node, style: { left: `${50 + Math.cos(angle) * 34}%`, top: `${46 + Math.sin(angle) * 38}%` } }
  }))
const hubStyle = { left: '50%', top: '46%' }
const sideNode = computed(() => {
  if (graphNode.value === 'hub') return { label: active.value.title, text: active.value.content, rel: '创新点' }
  return graphNodes.find((node) => node.id === graphNode.value) || graphNodes[0]
})

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
.kpi, .result-card, .result-detail, .graph-canvas, .graph-side, .report-banner, .ready-card, .report-doc {
  background: #fff; border: 1px solid #e3edf5; border-radius: 12px;
}
.kpi { padding: 14px 16px; }
.kpi b { display: block; color: #0d4e83; font-size: 22px; }
.kpi span, .card-top, .result-card small, .code, .report-sub { color: #8a9aaa; font-size: 12px; }
.dirs { display: flex; flex-wrap: wrap; gap: 8px; }
.dirs button, .text-btn { border: 1px solid #d7e3ee; background: #fff; color: #4d6982; border-radius: 999px; padding: 5px 12px; cursor: pointer; }
.dirs button.on { background: #1668a8; color: #fff; border-color: #1668a8; }
.text-btn { border: 0; background: none; color: #1668a8; padding: 0; }
.result-grid, .graph-layout { display: grid; grid-template-columns: 320px minmax(0, 1fr); gap: 12px; align-items: start; }
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
.graph-canvas { position: relative; min-height: 560px; overflow: hidden; }
.g-node { position: absolute; transform: translate(-50%, -50%); max-width: 150px; border: 0; border-radius: 999px; padding: 8px 12px; color: #fff; background: #1668a8; cursor: pointer; font-size: 12px; line-height: 1.4; }
.g-node.hub { max-width: 220px; background: #0d4e83; font-weight: 650; }
.g-node.gold { background: #c9842a; }
.g-node.green { background: #2e9b57; }
.g-node.on { box-shadow: 0 0 0 3px rgba(22, 104, 168, .25); }
.graph-side { padding: 16px; }
.side-meta { display: flex; justify-content: space-between; gap: 8px; margin-top: 10px; padding-top: 10px; border-top: 1px solid #eef3f8; }
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
