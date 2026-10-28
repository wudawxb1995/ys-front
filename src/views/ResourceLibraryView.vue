<template>
  <div class="lib">
    <header class="top">
      <button class="back" @click="router.push('/hub')">← 返回</button>
      <div class="brand">
        <b>ZB试验鉴定领域资源库</b>
      </div>
    </header>

    <main v-if="!activeLayer" class="page">
      <section class="hero">
        <h1>三级数据资源，一条链路可追溯</h1>
        <p>资料原样留存进原始库，解析切分形成基础库，二次分析产出知识库，每一层都能回到原文与发次。</p>
      </section>

      <section class="cards">
        <article v-for="layer in layerList" :key="layer.id" class="pcard" @click="openLayer(layer)">
          <div class="pcard-top">
            <div class="pico"><Icon :name="layer.icon" /></div>
            <span class="pno">{{ layer.no }}</span>
          </div>
          <h3>{{ layer.name }}</h3>
          <p>{{ layer.desc }}</p>
          <div class="ptags">
            <span v-for="cat in layer.categories" :key="cat.id">{{ cat.name }} {{ cat.rows.length }}</span>
          </div>
          <div class="pmeta">{{ layer.tags.join(' / ') }}</div>
          <button class="enter" @click.stop="openLayer(layer)">进入库 <span>→</span></button>
        </article>
      </section>
    </main>

    <main v-else class="page detail">
      <div class="crumb">
        <button @click="activeLayer = null">三级数据资源</button>
        <span>/</span>
        <em>{{ activeLayer.name }}</em>
      </div>
      <div class="detail-head">
        <div class="dh-icon"><Icon :name="activeLayer.icon" /></div>
        <div class="dh-text">
          <h2>{{ activeLayer.name }}</h2>
          <p>{{ activeLayer.desc }}</p>
        </div>
        <label class="search">
          <input v-model="keyword" placeholder="搜索名称、来源或任务" />
        </label>
      </div>

      <div class="detail-body">
        <aside class="cats">
          <button class="cat" :class="{ on: !selectedCat }" @click="selectedCat = ''">
            全部资源<em>{{ categoryRows.length }}</em>
          </button>
          <button v-for="cat in activeLayer.categories" :key="cat.id" class="cat" :class="{ on: selectedCat === cat.id }" @click="selectedCat = cat.id">
            {{ cat.name }}<em>{{ cat.rows.length }}</em>
          </button>
        </aside>

        <section class="table-wrap">
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
              <tr v-for="row in filteredRows" :key="row.name" :class="{ on: activeRow?.name === row.name }" @click="activeRow = activeRow?.name === row.name ? null : row">
                <td>{{ row.name }}</td>
                <td>{{ row.kind }}</td>
                <td>{{ row.source }}</td>
                <td>{{ row.task }}</td>
                <td>{{ row.time }}</td>
                <td><span :class="row.tone">{{ row.status }}</span></td>
              </tr>
              <tr v-if="!filteredRows.length"><td colspan="6" class="empty">该类下没有匹配的数据</td></tr>
            </tbody>
          </table>
        </section>
      </div>

      <article v-if="activeRow" class="detail-card">
        <header>
          <b>{{ activeRow.name }}</b>
          <button @click="activeRow = null">关闭</button>
        </header>
        <p>{{ activeRow.detail }}</p>
        <div class="meta">
          <span>分类 {{ activeRow.kind }}</span>
          <span>来源 {{ activeRow.source }}</span>
          <span>任务 {{ activeRow.task }}</span>
          <span>更新 {{ activeRow.time }}</span>
        </div>
      </article>

      <button class="back-cards" @click="activeLayer = null">← 返回三级数据资源</button>
    </main>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import Icon from '@/components/Icon.vue'

const router = useRouter()
const keyword = ref('')
const activeLayer = ref(null)
const selectedCat = ref('')
const activeRow = ref(null)

const layerList = [
  {
    id: 'raw',
    no: '01',
    name: '原始库',
    icon: 'database',
    desc: '保存未经处理的原始资料，按采集原样留存，可回溯到现场记录、扫描件与影像。',
    tags: ['原样留存', '格式识别', '全量溯源'],
    categories: [
      {
        id: 'raw-data',
        name: '试验原始数据',
        rows: [
          ['LF2204 牵引性能原始采样', '现场数采', '50Hz，12.4 万行，含第 19 发标记。', '2026-10-22', '已入库'],
          ['LF2204 环境温度原始记录', '传感器回传', '覆盖高温、低温两个工况。', '2026-10-21', '已入库'],
          ['LF2204 燃油消耗原始日志', '油耗仪', '按工况分段，尚未剔除怠速段。', '2026-10-20', '待复核'],
          ['通过性试验视频索引', '影像采集', '6 段作业视频及时间码。', '2026-10-19', '已入库'],
        ],
      },
      {
        id: 'raw-doc',
        name: '定型资料原件',
        rows: [
          ['LF2204 试验大纲 V4', '编写平台原件', 'PDF 原件，含签批页与修订记录。', '2026-10-18', '已入库'],
          ['LF2204 研制总要求', '任务下达', '扫描件 22 页，判据来源。', '2026-10-17', '已入库'],
          ['定型试验任务书', '任务下达', '含科目设置与样本数量要求。', '2026-10-17', '已入库'],
        ],
      },
      {
        id: 'raw-media',
        name: '影像与扫描件',
        rows: [
          ['通过性试验作业视频', '现场影像', '6 段，含地形与时间码标记。', '2026-10-19', '已入库'],
          ['第 19 发复测现场照片', '现场影像', '含靶纸、设备状态与处置过程。', '2026-10-23', '已入库'],
          ['原始记录签批页扫描件', '扫描件', '按发次归档，保留签字与涂改痕迹。', '2026-10-23', '待复核'],
        ],
      },
    ],
  },
  {
    id: 'basic',
    no: '02',
    name: '基础库',
    icon: 'layers',
    desc: '经过解析与标注的结构化数据，章节、表格、实体和指标都能被直接引用。',
    tags: ['解析切分', '指标挂接', '可直接引用'],
    categories: [
      {
        id: 'basic-metric',
        name: '指标与实测值',
        rows: [
          ['牵引性能治理集 V3', '治理流水线', '已对齐指标字典，可直接出图。', '2026-10-24', '已入库'],
          ['最大牵引力实测值', '指标解析', '单位 kN，关联 12 发有效记录。', '2026-10-24', '已入库'],
          ['燃油消耗率标准集', '治理流水线', '按 GJB 口径折算公顷油耗。', '2026-10-24', '已入库'],
          ['第 19 发复核数据集', '人工复核', '复测后判定为符合，保留首测与复测两版。', '2026-10-23', '待复核'],
        ],
      },
      {
        id: 'basic-doc',
        name: '章节与条款',
        rows: [
          ['报告章节结构化结果', '版面解析', '8 章 42 节，按标题层级切分。', '2026-10-24', '已入库'],
          ['GJB 150A 低温条款', '标准解析', '原子化条款 18 条，可被审查引用。', '2026-10-23', '已入库'],
          ['大纲试验条件章节', '版面解析', '对齐报告第 2 章与条件记录。', '2026-10-23', '已入库'],
        ],
      },
      {
        id: 'basic-dict',
        name: '指标字典与术语',
        rows: [
          ['指标字典 V2', '人工维护', '102 项指标含判据、单位与来源。', '2026-10-24', '已入库'],
          ['术语规范表', '人工维护', '炮口初速 → 弹丸初速等映射关系。', '2026-10-22', '已入库'],
          ['实体词典', '模型抽取 + 人工', '86 个机型与部件实体。', '2026-10-21', '已入库'],
        ],
      },
    ],
  },
  {
    id: 'reason',
    no: '03',
    name: '知识库',
    icon: 'graph',
    desc: '在基础库之上二次分析产出图谱、探针结论与问答对，直接支撑审查判定与智能体调用。',
    tags: ['图谱推理', '探针结论', '智能体调用'],
    categories: [
      {
        id: 'reason-graph',
        name: '知识图谱',
        rows: [
          ['装备-指标-条款图谱', '图谱构建', '247 个节点，关系可回跳原文。', '2026-10-24', '已入库'],
          ['东方红-LF2204 实体', '图谱构建', '关联报告、数据集与探针输出。', '2026-10-23', '已入库'],
          ['同义节点融合记录', '人工确认', '合并 3 组术语同义节点并留痕。', '2026-10-22', '待复核'],
        ],
      },
      {
        id: 'reason-probe',
        name: '探针与根因',
        rows: [
          ['第 19 发根因探针', '本次调用', '输出复测后符合的完整依据链。', '2026-10-23', '已入库'],
          ['牵引异常定位探针', '探针训练', '识别牵引力突变与工况漂移。', '2026-10-22', '已入库'],
          ['温度越限探针', '探针训练', '对照 -55℃～85℃ 范围判定。', '2026-10-21', '已入库'],
        ],
      },
      {
        id: 'reason-qa',
        name: '问答对与结论',
        rows: [
          ['低温启动时间是否合格', '问答沉淀', '命中大纲条款与实测记录。', '2026-10-24', '已入库'],
          ['第 19 发为何判复测后符合', '问答沉淀', '同时引用首测与复测两个值。', '2026-10-23', '已入库'],
          ['燃料消耗折算口径', '问答沉淀', '说明 GJB 口径与折算方法。', '2026-10-22', '已入库'],
        ],
      },
      {
        id: 'reason-innov',
        name: '创新点',
        rows: [
          ['低温工况牵引修正方法', '本次沉淀', '由第 19 发复测数据归纳。', '2026-10-24', '已入库'],
          ['油耗分段折算规则', '本次沉淀', '已写入指标字典。', '2026-10-23', '已入库'],
          ['探针与报告联动追溯', '本次沉淀', '报告判定可回跳探针输出。', '2026-10-22', '已入库'],
        ],
      },
    ],
  },
]

const categoryRows = computed(() => {
  if (!activeLayer.value) return []
  const cats = activeLayer.value.categories.filter((cat) => !selectedCat.value || cat.id === selectedCat.value)
  return cats.flatMap((cat) => cat.rows.map((row) => ({
    name: row[0],
    source: row[1],
    detail: row[2],
    time: row[3],
    status: row[4],
    tone: row[4] === '待复核' ? 'warn' : 'ok',
    kind: cat.name,
    task: activeLayer.value.id === 'raw' ? 'LF2204 定型试验' : activeLayer.value.id === 'basic' ? '治理流水线' : '知识组织',
  })))
})

const filteredRows = computed(() => {
  const q = keyword.value.trim()
  if (!q) return categoryRows.value
  return categoryRows.value.filter((row) => `${row.name}${row.source}${row.task}${row.kind}`.includes(q))
})

function openLayer(layer) {
  activeLayer.value = layer
  selectedCat.value = ''
  activeRow.value = null
  keyword.value = ''
}
</script>

<style scoped>
.lib { min-height: 100vh; background: radial-gradient(900px 280px at 50% -40px, rgba(13, 78, 131, .06), transparent 70%), #f4f7fb; color: #1f3348; }
.top {
  height: 72px; display: flex; align-items: center; gap: 18px; padding: 0 36px;
  background: rgba(255, 255, 255, .94); border-bottom: 1px solid #e8eef5; backdrop-filter: blur(10px);
  position: sticky; top: 0; z-index: 5;
}
.back { border: 0; background: transparent; color: #1a6eae; font-size: 14px; padding: 0; }
.brand b { display: block; font-size: 18px; color: #16324f; letter-spacing: .3px; }

.page { max-width: 1200px; margin: 0 auto; padding: 40px 40px 48px; }
.hero { text-align: center; margin-bottom: 30px; }
.hero h1 { margin-top: 0; font-size: 32px; color: #0d3f73; letter-spacing: 1.5px; font-weight: 800; }
.hero p { margin-top: 12px; color: #7d90a3; font-size: 14px; line-height: 1.7; }

.cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
.pcard {
  background: #fff; border-radius: 16px; padding: 22px 20px; border: 1px solid #eef3f8;
  display: flex; flex-direction: column; cursor: pointer; box-shadow: 0 10px 30px rgba(20, 60, 100, .05);
  transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease;
}
.pcard:hover { transform: translateY(-4px); border-color: #c5daf0; box-shadow: 0 16px 36px rgba(13, 78, 131, .12); }
.pcard-top { display: flex; justify-content: space-between; align-items: flex-start; }
.pico { width: 48px; height: 48px; border-radius: 12px; background: #f3f8fd; color: #0d4e83; display: grid; place-items: center; }
.pico :deep(svg) { width: 26px; height: 26px; }
.pno { color: #c6a15a; font-weight: 700; letter-spacing: 1px; }
.pcard h3 { margin-top: 16px; color: #14365c; font-size: 19px; line-height: 1.45; }
.pcard p { margin-top: 8px; color: #7b8ea1; font-size: 13.5px; line-height: 1.75; min-height: 70px; }
.ptags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
.ptags span { background: #f4f8fc; border: 1px solid #eaf1f8; color: #5d7388; border-radius: 999px; padding: 2px 10px; font-size: 12px; }
.pmeta { margin-top: 10px; color: #9aaaba; font-size: 12px; }
.enter {
  margin-top: 16px; width: 100%; background: #e8f2fb; color: #1a6eae; border: 0; border-radius: 8px;
  padding: 10px 14px; font-size: 14px; display: flex; align-items: center; justify-content: space-between;
}
.pcard:hover .enter { background: #0d4e83; color: #fff; }

.detail .crumb { display: flex; align-items: center; gap: 8px; color: #8aa0b5; font-size: 12.5px; }
.detail .crumb button { border: 0; background: transparent; color: #1a6eae; padding: 0; font-size: 12.5px; }
.detail .crumb em { font-style: normal; color: #4d6982; }
.detail-head { display: flex; align-items: center; gap: 14px; margin: 12px 0 16px; }
.dh-icon { width: 46px; height: 46px; border-radius: 12px; background: #f3f8fd; color: #0d4e83; display: grid; place-items: center; flex: 0 0 auto; }
.dh-icon :deep(svg) { width: 24px; height: 24px; }
.dh-text h2 { color: #0d3f73; font-size: 22px; }
.dh-text p { margin-top: 4px; color: #7d90a3; font-size: 13px; }
.search { margin-left: auto; }
.search input { width: 260px; height: 36px; border: 1px solid #d5e0ea; border-radius: 8px; padding: 0 12px; background: #fff; font-size: 13px; }
.search input:focus { outline: 0; border-color: #1668a8; box-shadow: 0 0 0 2px rgba(22, 104, 168, .12); }

.detail-body { display: grid; grid-template-columns: 240px minmax(0, 1fr); gap: 14px; }
.cats { background: #fff; border: 1px solid #eef3f8; border-radius: 14px; padding: 10px; align-self: start; }
.cat {
  width: 100%; height: 38px; border: 0; background: transparent; display: flex; align-items: center;
  padding: 0 10px; border-radius: 9px; color: #355067; font-size: 13.5px; text-align: left;
}
.cat em { margin-left: auto; font-style: normal; color: #8aa0b5; font-size: 12px; }
.cat.on { background: #e8f3fb; color: #0d4e83; font-weight: 650; }

.table-wrap { background: #fff; border: 1px solid #eef3f8; border-radius: 14px; overflow: hidden; }
table { width: 100%; border-collapse: collapse; font-size: 13.5px; }
th { text-align: left; background: #f7fafc; color: #6d8296; font-weight: 600; padding: 11px 14px; }
td { padding: 12px 14px; border-top: 1px solid #eef3f8; color: #355067; }
tbody tr { cursor: pointer; }
tbody tr:hover, tr.on { background: #f4f9fd; }
.empty { text-align: center; color: #8aa0b5; cursor: default; }
td span { font-size: 12px; }
td .ok { color: #1c8a42; }
td .warn { color: #d48806; }

.detail-card { margin-top: 14px; background: #fff; border: 1px solid #d7e6f4; border-radius: 14px; padding: 16px 18px; }
.detail-card header { display: flex; justify-content: space-between; align-items: center; }
.detail-card header b { color: #14365c; font-size: 15px; }
.detail-card header button { border: 0; background: transparent; color: #1a6eae; }
.detail-card p { margin-top: 8px; color: #3e556b; line-height: 1.75; }
.meta { display: flex; flex-wrap: wrap; gap: 14px; margin-top: 10px; color: #7d90a3; font-size: 12px; }
.back-cards { margin-top: 18px; border: 1px solid #d5e2ee; background: #fff; color: #1a6eae; border-radius: 8px; padding: 8px 16px; font-size: 13px; }
.back-cards:hover { border-color: #9ec0de; }

@media (max-width: 1080px) {
  .cards { grid-template-columns: 1fr; }
  .detail-body { grid-template-columns: 1fr; }
  .top { flex-wrap: wrap; height: auto; padding: 14px 20px; gap: 10px; }
  .page { padding: 24px 20px 36px; }
  .search input { width: 200px; }
}
</style>
