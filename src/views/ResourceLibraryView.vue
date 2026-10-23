<template>
  <div class="lib">
    <header class="top">
      <button class="back" @click="router.push('/hub')">← 返回</button>
      <div>
        <b>领域资源库</b>
        <span>一次任务的全部产出与历年积累，按类归档在同一库中</span>
      </div>
      <label class="search">
        <input v-model="keyword" placeholder="搜索名称、来源或任务" />
      </label>
    </header>

    <div class="body">
      <aside class="tree">
        <div v-for="group in tree" :key="group.id" class="group">
          <button class="row group-row" :class="{ on: selectedId === group.id }" @click="select(group)">
            <i :class="{ open: group.open }" @click.stop="group.open = !group.open"></i>
            {{ group.name }}
            <em>{{ totalOf(group) }}</em>
          </button>
          <div v-show="group.open" class="children">
            <div v-for="child in group.children" :key="child.id">
              <button class="row" :class="{ on: selectedId === child.id }" @click="select(child)">
                <i v-if="child.children" :class="{ open: child.open }" @click.stop="child.open = !child.open"></i>
                <i v-else class="dot"></i>
                {{ child.name }}
                <em>{{ totalOf(child) }}</em>
              </button>
              <div v-if="child.children" v-show="child.open" class="leaves">
                <button
                  v-for="leaf in child.children"
                  :key="leaf.id"
                  class="row leaf"
                  :class="{ on: selectedId === leaf.id }"
                  @click="select(leaf)"
                >
                  {{ leaf.name }}
                  <em>{{ totalOf(leaf) }}</em>
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <section class="main">
        <div class="crumb">{{ crumb }}</div>
        <div class="head">
          <div>
            <h2>{{ current.name }}</h2>
            <p>{{ current.desc }}</p>
          </div>
          <b>{{ keyword ? filtered.length : totalOf(current) }}<small>{{ keyword ? '条匹配' : '条归档' }}</small></b>
        </div>

        <div v-if="current.children?.length" class="chips">
          <button v-for="child in current.children" :key="child.id" @click="select(child)">
            {{ child.name }} <em>{{ totalOf(child) }}</em>
          </button>
        </div>

        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>名称</th>
                <th>分类</th>
                <th>来源</th>
                <th>关联任务</th>
                <th>更新时间</th>
                <th>状态</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="row in filtered"
                :key="row.name"
                :class="{ on: active?.name === row.name }"
                @click="active = active?.name === row.name ? null : row"
              >
                <td>{{ row.name }}</td>
                <td>{{ row.kind }}</td>
                <td>{{ row.source }}</td>
                <td>{{ row.task }}</td>
                <td>{{ row.time }}</td>
                <td><span :class="row.tone">{{ row.status }}</span></td>
              </tr>
              <tr v-if="!filtered.length"><td colspan="6" class="empty">该类下没有匹配的数据</td></tr>
            </tbody>
          </table>
        </div>

        <article v-if="active" class="detail">
          <header>
            <b>{{ active.name }}</b>
            <button @click="active = null">关闭</button>
          </header>
          <p>{{ active.detail }}</p>
          <div class="meta">
            <span>分类 {{ active.kind }}</span>
            <span>来源 {{ active.source }}</span>
            <span>任务 {{ active.task }}</span>
            <span>更新 {{ active.time }}</span>
          </div>
        </article>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const keyword = ref('')
const selectedId = ref('dataset')
const active = ref(null)

function item(partial) {
  return { open: true, desc: '', total: 0, children: null, ...partial }
}

const tree = reactive([
  item({
    id: 'task',
    name: '本次任务产出',
    desc: '东方红-LF2204 定型试验本次形成的数据、模型、文书和创新点。',
    children: [
      item({
        id: 'dataset',
        name: '数据集',
        total: 14,
        desc: '本次试验采集并治理后的数据集，供探针和报告引用。',
        children: [
          item({ id: 'dataset-raw', name: '原始采集', total: 6, desc: '试验现场直接采集、尚未治理的原始数据。' }),
          item({ id: 'dataset-clean', name: '治理成果', total: 8, desc: '清洗、对齐并挂接指标后的可用数据集。' }),
        ],
      }),
      item({ id: 'probe', name: '探针模型', total: 12, desc: '本次任务训练或调用的探针模型，用于异常定位和根因分析。' }),
      item({
        id: 'doc',
        name: '文书',
        total: 38,
        desc: '本次任务形成的大纲、报告和审查留痕。',
        children: [
          item({ id: 'doc-outline', name: '试验大纲', total: 11, desc: '试验大纲及其版本。' }),
          item({ id: 'doc-report', name: '试验报告', total: 27, desc: '定型试验报告、审查稿和归集版本。' }),
        ],
      }),
      item({ id: 'innov', name: '创新点', total: 58, desc: '从本次试验和文档中沉淀的技术创新点。' }),
    ],
  }),
  item({
    id: 'history',
    name: '历年积累',
    desc: '历年试验、标准和文献积累，可被本次任务检索引用。',
    children: [
      item({
        id: 'paper',
        name: '文献',
        total: 326,
        desc: '标准规范与专业文献，支撑指标定义和审查依据。',
        children: [
          item({ id: 'paper-std', name: '标准规范', total: 48, desc: 'GJB、国标和行业规范。' }),
          item({ id: 'paper-thesis', name: '专业论文', total: 278, desc: '鉴定方法、农机试验相关论文与报告。' }),
        ],
      }),
      item({ id: 'dataset-hist', name: '历史数据集', total: 36, desc: '往年机型试验数据，用于对比和查重。' }),
    ],
  }),
  item({
    id: 'graph',
    name: '知识组织',
    desc: '把数据集、文书、文献和创新点连成可追溯的知识图谱。',
    children: [
      item({
        id: 'graph-node',
        name: '图谱节点',
        total: 247,
        desc: '装备、指标和标准条款三类节点，记录与本次任务的关联。',
        children: [
          item({ id: 'graph-equip', name: '装备实体', total: 86, desc: '机型、部件和试验对象。' }),
          item({ id: 'graph-metric', name: '指标实体', total: 102, desc: '性能、环境和可靠性指标。' }),
          item({ id: 'graph-std', name: '标准条款', total: 59, desc: '可被审查和问答直接引用的条款。' }),
        ],
      }),
    ],
  }),
])

const rows = {
  'dataset-raw': [
    ['LF2204 牵引性能原始采样', '现场数采', '50Hz，12.4 万行，含第 19 发标记。'],
    ['LF2204 环境温度原始记录', '传感器回传', '覆盖高温、低温两个工况。'],
    ['LF2204 燃油消耗原始日志', '油耗仪', '按工况分段，尚未剔除怠速段。'],
    ['通过性试验视频索引', '影像采集', '6 段作业视频及时间码。'],
  ],
  'dataset-clean': [
    ['牵引性能治理集 V3', '治理流水线', '已对齐指标字典，可直接出图。'],
    ['环境温度对齐集', '治理流水线', '单位统一为 ℃，异常点已标注。'],
    ['燃油消耗率标准集', '治理流水线', '按 GJB 口径折算公顷油耗。'],
    ['第 19 发复核数据集', '人工复核', '复测后判定为符合，保留原始与复核两版。'],
  ],
  probe: [
    ['牵引异常定位探针', '探针训练', '用于识别牵引力突变。'],
    ['温度越限探针', '探针训练', '对照 -55℃～85℃ 范围。'],
    ['油耗偏离探针', '探针训练', '对比历史同功率机型。'],
    ['第 19 发根因探针', '本次调用', '输出复测后符合的依据链。'],
    ['通过性场景探针', '探针训练', '关联地形与滑转率。'],
  ],
  'doc-outline': [
    ['试验大纲 V4', '编写平台', '第 4 章为试验条件，已被报告引用。'],
    ['大纲变更说明', '编写平台', '持续时间下限调整留痕。'],
    ['大纲审查单', '审校平台', '3 条意见已关闭。'],
  ],
  'doc-report': [
    ['装备定型试验报告 V2', '编写平台', '已归集，含审查留痕。'],
    ['符合性判定章', '编写平台', '第 19 发复测后符合。'],
    ['审查意见回写稿', '审校平台', '意见定位到 4.2 持续时间。'],
  ],
  innov: [
    ['低温工况牵引修正方法', '本次沉淀', '由第 19 发复测数据归纳。'],
    ['油耗分段折算规则', '本次沉淀', '已写入指标字典。'],
    ['探针与报告联动追溯', '本次沉淀', '报告中的判定可回跳探针输出。'],
    ['大纲条款自动对齐', '本次沉淀', '供文档审查智能体调用。'],
  ],
  'paper-std': [
    ['GJB 150A 环境试验', '标准库', '低温、湿热条款被字段和审查引用。'],
    ['农业机械定型试验规程', '标准库', '牵引、油耗、通过性试验方法。'],
    ['试验文档编制规定', '标准库', '大纲、报告章节结构依据。'],
  ],
  'paper-thesis': [
    ['大功率轮式拖拉机牵引特性研究', '文献库', '用于同功率段对比。'],
    ['农机环境适应性试验综述', '文献库', '支持温度范围说明。'],
    ['试验数据治理与溯源方法', '文献库', '对应三级库组织方式。'],
  ],
  'dataset-hist': [
    ['东方红-1804 牵引历史集', '2019 定型', '作为本次牵引曲线对照。'],
    ['同类机型油耗基线', '2021—2024', '6 个机型的公顷油耗分布。'],
    ['低温试验历史样本', '历年环境试验', '含 -41℃ 实车记录。'],
  ],
  'graph-equip': [
    ['东方红-LF2204', '图谱构建', '本次试验对象，关联报告、数据集和探针。'],
    ['东方红-1804', '历年积累', '历史对照机型。'],
    ['牵引试验装置', '图谱构建', '连接牵引数据集与大纲设备条款。'],
  ],
  'graph-metric': [
    ['最大牵引力', '指标字典', '单位 kN，关联治理数据集。'],
    ['环境温度', '指标字典', '字段 environment_temperature，依据 GJB 150A。'],
    ['持续时间', '指标字典', '关联大纲 V4 与审查意见。'],
    ['燃油消耗率', '指标字典', '关联油耗治理集。'],
  ],
  'graph-std': [
    ['低温试验温度范围', 'GJB 150A', '被知识问答和字段校验引用。'],
    ['规定环境连续运行时长', '原子化条款', '审查意见的判定依据。'],
    ['牵引性能试验方法', '定型规程', '对应大纲第 4 章。'],
  ],
}

const kindOf = {
  'dataset-raw': '原始采集',
  'dataset-clean': '治理成果',
  probe: '探针模型',
  'doc-outline': '试验大纲',
  'doc-report': '试验报告',
  innov: '创新点',
  'paper-std': '标准规范',
  'paper-thesis': '专业论文',
  'dataset-hist': '历史数据集',
  'graph-equip': '装备实体',
  'graph-metric': '指标实体',
  'graph-std': '标准条款',
}

const taskOf = {
  'dataset-raw': 'LF2204 定型试验',
  'dataset-clean': 'LF2204 定型试验',
  probe: 'LF2204 定型试验',
  'doc-outline': 'LF2204 定型试验',
  'doc-report': 'LF2204 定型试验',
  innov: 'LF2204 定型试验',
  'paper-std': '历年积累',
  'paper-thesis': '历年积累',
  'dataset-hist': '历年积累',
  'graph-equip': '知识图谱',
  'graph-metric': '知识图谱',
  'graph-std': '知识图谱',
}

function flatten(nodes, bag = []) {
  nodes.forEach((node) => {
    bag.push(node)
    if (node.children) flatten(node.children, bag)
  })
  return bag
}

const flat = flatten(tree)
const byId = Object.fromEntries(flat.map((node) => [node.id, node]))

function leavesOf(node) {
  if (!node.children?.length) return [node]
  return node.children.flatMap(leavesOf)
}

function totalOf(node) {
  if (!node.children?.length) return node.total || (rows[node.id]?.length ?? 0)
  return node.children.reduce((sum, child) => sum + totalOf(child), 0)
}

const current = computed(() => byId[selectedId.value] || tree[0])

const listed = computed(() => leavesOf(current.value).flatMap((leaf) => (rows[leaf.id] || []).map((item, index) => ({
  name: item[0],
  source: item[1],
  detail: item[2],
  kind: kindOf[leaf.id],
  task: taskOf[leaf.id],
  time: `2026-10-${String(12 + (index % 10)).padStart(2, '0')}`,
  status: leaf.id.includes('hist') || leaf.id.startsWith('paper') ? '可引用' : index === 3 ? '待复核' : '已入库',
  tone: leaf.id.includes('hist') || leaf.id.startsWith('paper') ? 'ok' : index === 3 ? 'warn' : 'ok',
}))))

const filtered = computed(() => {
  const q = keyword.value.trim()
  if (!q) return listed.value
  return listed.value.filter((row) => `${row.name}${row.source}${row.task}${row.kind}`.includes(q))
})

const crumb = computed(() => {
  const names = []
  function walk(nodes, stack) {
    for (const node of nodes) {
      const next = [...stack, node.name]
      if (node.id === selectedId.value) {
        names.push(...next)
        return true
      }
      if (node.children && walk(node.children, next)) return true
    }
    return false
  }
  walk(tree, [])
  return names.join(' / ')
})

function select(node) {
  selectedId.value = node.id
  active.value = null
  if (node.children) node.open = true
}
</script>

<style scoped>
.lib { height: 100vh; display: flex; flex-direction: column; background: #f4f7fb; color: #1f3348; }
.top {
  height: 64px; flex: 0 0 64px; display: flex; align-items: center; gap: 16px;
  padding: 0 18px; background: #fff; border-bottom: 1px solid #e6ebf2;
}
.back { border: 0; background: transparent; color: #1a6eae; }
.top b { display: block; font-size: 16px; color: #0d3f73; }
.top span { color: #7d90a3; font-size: 12px; }
.search { margin-left: auto; }
.search input {
  width: 260px; height: 34px; border: 1px solid #d5e0ea; border-radius: 8px; padding: 0 12px; background: #fff;
}
.body { flex: 1; min-height: 0; display: grid; grid-template-columns: 280px minmax(0, 1fr); }
.tree { background: #fff; border-right: 1px solid #e6ebf2; overflow: auto; padding: 10px 8px 24px; }
.row {
  width: 100%; height: 36px; border: 0; background: transparent; display: flex; align-items: center; gap: 6px;
  padding: 0 8px; border-radius: 8px; color: #355067; text-align: left; font-size: 13.5px;
}
.row em { margin-left: auto; color: #8aa0b5; font-style: normal; font-size: 12px; }
.row.on { background: #e8f3fb; color: #0d4e83; font-weight: 650; }
.group-row { font-weight: 700; color: #16324f; }
.row i {
  width: 14px; height: 14px; flex: 0 0 14px; position: relative;
}
.row i::before {
  content: ""; position: absolute; left: 4px; top: 3px; border: 4px solid transparent; border-left-color: #8aa0b5;
}
.row i.open::before { left: 2px; top: 5px; border-left-color: transparent; border-top-color: #8aa0b5; }
.row i.dot::before { left: 4px; top: 4px; width: 6px; height: 6px; border: 0; border-radius: 50%; background: #c5d0dc; }
.children { padding-left: 12px; }
.leaves { padding-left: 22px; }
.leaf { color: #55677a; }
.main { min-width: 0; overflow: auto; padding: 16px 18px 28px; }
.crumb { color: #8aa0b5; font-size: 12px; }
.head { display: flex; justify-content: space-between; align-items: flex-end; gap: 16px; margin: 6px 0 12px; }
.head h2 { color: #0d3f73; font-size: 22px; }
.head p { margin-top: 4px; color: #7d90a3; font-size: 13px; }
.head > b { color: #0d4e83; font-size: 28px; line-height: 1; }
.head small { font-size: 14px; color: #8aa0b5; font-weight: 500; }
.chips { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
.chips button { height: 32px; padding: 0 12px; border-radius: 999px; border: 1px solid #d5e2ee; background: #fff; color: #0d4e83; }
.chips em { font-style: normal; color: #8aa0b5; margin-left: 4px; }
.table-wrap { background: #fff; border: 1px solid #e6ebf2; border-radius: 12px; overflow: hidden; }
table { width: 100%; border-collapse: collapse; font-size: 13.5px; }
th { text-align: left; background: #f7fafc; color: #6d8296; font-weight: 600; padding: 10px 14px; }
td { padding: 11px 14px; border-top: 1px solid #eef3f8; }
tr { cursor: pointer; }
tbody tr:hover, tr.on { background: #f4f9fd; }
.empty { text-align: center; color: #8aa0b5; cursor: default; }
td span { font-size: 12px; }
td .ok { color: #1c8a42; }
td .warn { color: #d48806; }
.detail { margin-top: 12px; background: #fff; border: 1px solid #d7e6f4; border-radius: 12px; padding: 14px 16px; }
.detail header { display: flex; justify-content: space-between; align-items: center; }
.detail header button { border: 0; background: transparent; color: #1a6eae; }
.detail p { margin-top: 8px; color: #3e556b; line-height: 1.7; }
.meta { display: flex; flex-wrap: wrap; gap: 14px; margin-top: 8px; color: #7d90a3; font-size: 12px; }
</style>
