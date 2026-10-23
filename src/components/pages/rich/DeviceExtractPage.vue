<template>
  <div class="dev-extract">
    <div class="entry-title">
      <h2>{{ title || '试验设备信息抽取' }}</h2>
      <p>从已识别的历史试验资源信息中提取试验设备名称、型号、规格等关键属性，获取设备相关资源数据。</p>
    </div>

    <div class="top-split">
      <section class="sec-frame src-panel">
        <h3><i></i>源文档选择</h3>
        <el-form label-width="5.5em" label-position="right" class="info-form" @submit.prevent="applyQuery">
          <div class="q-row3">
            <el-form-item label="文档名称">
              <el-input v-model="query.name" placeholder="请输入文档名称" clearable />
            </el-form-item>
            <el-form-item label="文档类型">
              <select-field v-model="query.docType" :options="docTypeOpts" placeholder="全部" clearable />
            </el-form-item>
            <el-form-item label="试验类型">
              <select-field v-model="query.testType" :options="testTypeOpts" placeholder="全部" clearable />
            </el-form-item>
          </div>
          <div class="q-row2">
            <el-form-item label="时间范围" class="date-item">
              <div class="date-range">
                <date-field v-model="query.start" placeholder="开始日期" clearable />
                <span class="range-sep">-</span>
                <date-field v-model="query.end" placeholder="结束日期" clearable />
              </div>
            </el-form-item>
            <el-form-item label="所属项目">
              <select-field v-model="query.project" :options="projectOpts" placeholder="请选择所属项目" clearable />
            </el-form-item>
          </div>
          <div class="query-actions">
            <el-button @click="resetQuery">重置</el-button>
            <el-button type="primary" @click="applyQuery">查询</el-button>
          </div>
        </el-form>

        <div class="table-wrap src-table">
          <el-table
            :data="filteredDocs"
            height="100%"
            highlight-current-row
            class="ys-table"
            empty-text="没有符合条件的文档"
            @row-click="selectDoc"
          >
            <el-table-column label="序号" width="78" align="center">
              <template #default="{ row, $index }">
                <span class="idx-cell">
                  <el-radio :model-value="selectedId" :value="row.id" @change="selectDoc(row)" @click.stop />
                  <em>{{ $index + 1 }}</em>
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="name" label="文档名称" min-width="220">
              <template #default="{ row }">
                <span class="res-name" :class="{ on: selectedId === row.id }">{{ row.name }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="docType" label="文档类型" min-width="88" />
            <el-table-column prop="project" label="所属项目" min-width="160" />
            <el-table-column prop="testDate" label="试验日期" width="112" />
            <el-table-column label="操作" width="64" align="center">
              <template #default="{ row }">
                <a class="view-link" @click.stop="selectDoc(row)">查看</a>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </section>

      <section class="sec-frame preview-panel">
        <h3><i></i>源文档内容片段</h3>
        <template v-if="currentDoc">
          <div class="file-bar">
            <span class="file-ico" :class="currentDoc.fmt">{{ currentDoc.fmt }}</span>
            <b>{{ currentDoc.name }}</b>
            <el-button @click="changeDoc">更换文档</el-button>
          </div>
          <div class="snippet" v-html="currentDoc.snippet" />
        </template>
        <div v-else class="preview-empty">请在左侧选择源文档后查看内容片段</div>
      </section>
    </div>

    <section class="sec-frame result-panel">
      <div class="result-head">
        <h3><i></i>设备信息抽取结果</h3>
        <div class="result-actions">
          <el-button :icon="Refresh" @click="reExtract">重新抽取</el-button>
          <el-button :icon="Download" @click="exportResult">导出结果</el-button>
          <el-button type="primary" @click="saveResult">
            <span class="save-ico" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M4.5 4.5h11.2L19.5 8.3v11.2H4.5V4.5z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
                <path d="M8 4.5v4.8h7.4V4.5" stroke="currentColor" stroke-width="1.8"/>
                <path d="M7.2 13.2h9.6v6.3H7.2z" stroke="currentColor" stroke-width="1.8"/>
                <path d="M9.2 4.8h2.2v4" stroke="currentColor" stroke-width="1.6"/>
              </svg>
            </span>
            保存结果
          </el-button>
        </div>
      </div>
      <div class="table-wrap result-table">
        <el-table :data="extractRows" height="100%" class="ys-table" empty-text="请选择源文档后查看抽取结果">
          <el-table-column type="index" label="序号" width="58" align="center" />
          <el-table-column prop="name" label="设备名称" min-width="140" />
          <el-table-column prop="model" label="型号" min-width="100" />
          <el-table-column prop="spec" label="规格/主要指标" min-width="220" />
          <el-table-column prop="unit" label="单位" min-width="88" />
          <el-table-column prop="sys" label="所属系统" min-width="110" />
          <el-table-column prop="quote" label="原文片段" min-width="220" show-overflow-tooltip />
          <el-table-column label="操作" width="100" align="center">
            <template #default="{ row }">
              <span class="ops">
                <a @click="viewRow(row)">查看</a>
                <a @click="editRow(row)">编辑</a>
              </span>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </section>
  </div>
</template>

<script>
import { computed, reactive, ref } from 'vue'
import { Download, Refresh } from '@element-plus/icons-vue'
import { useUi } from '@/composables/ui'
import SelectField from '@/components/SelectField.vue'
import DateField from '@/components/DateField.vue'

const DOCS = [
  {
    id: 1,
    name: '某型战斗机发动机高空台试验报告.docx',
    fmt: 'DOCX',
    docType: '试验报告',
    testType: '发动机试验',
    project: '某型战斗机发动机科研项目',
    testDate: '2024-05-18',
    snippet: `<h4>3.1 试验设备</h4>
<p>本次试验在某型高空模拟试验台上进行。本次主要设备包括：</p>
<p>（1）高空模拟试验台，型号：HTK-2000，最大模拟高度 20000 m，最高马赫数 2.5；</p>
<p>（2）发动机推力测量系统，型号：TMS-300，量程 0～200 kN，测量精度 ±0.5%；</p>
<p>（3）高空环境控制系统，型号：HES-1000，具备温度 -60℃～60℃、压力 5 kPa～110 kPa 的环境模拟能力；</p>
<p>（4）数据采集与控制系统，型号：DAS-5000，通道数 256 路，采样频率最高 100 kHz；</p>
<p>以上设备经校准后均处于有效期内，满足本次试验要求。</p>`,
    rows: [
      { id: 'e1', name: '高空模拟试验台', model: 'HTK-2000', spec: '最大模拟高度 20000；最高马赫数 2.5', unit: 'm / —', sys: '环境模拟系统', quote: '高空模拟试验台，型号：HTK-2000，最大模拟高度 20000 m' },
      { id: 'e2', name: '发动机推力测量系统', model: 'TMS-300', spec: '量程 0～200；测量精度 ±0.5%', unit: 'kN', sys: '测量系统', quote: '发动机推力测量系统，型号：TMS-300，量程 0～200 kN' },
      { id: 'e3', name: '高空环境控制系统', model: 'HES-1000', spec: '温度 -60～60；压力 5～110', unit: '℃ / kPa', sys: '环境控制系统', quote: '高空环境控制系统，型号：HES-1000，温度 -60℃～60℃' },
      { id: 'e4', name: '数据采集与控制系统', model: 'DAS-5000', spec: '通道数 256；采样频率最高 100', unit: '路 / kHz', sys: '数据采集系统', quote: '数据采集与控制系统，型号：DAS-5000，通道数 256 路' },
    ],
  },
  {
    id: 2,
    name: '机载雷达环境适应性试验记录.pdf',
    fmt: 'PDF',
    docType: '试验记录',
    testType: '环境试验',
    project: '机载雷达研制项目',
    testDate: '2023-11-02',
    snippet: `<h4>2.2 试验设备</h4>
<p>环境适应性试验主要使用温湿箱、振动台及数据采集装置。</p>`,
    rows: [
      { id: 'e5', name: '高低温湿热试验箱', model: 'EH-800', spec: '温度 -70～150；容积 800', unit: '℃ / L', sys: '环境模拟系统', quote: '高低温湿热试验箱，型号：EH-800' },
    ],
  },
  {
    id: 3,
    name: '导弹发射装置振动试验方案.docx',
    fmt: 'DOCX',
    docType: '试验方案',
    testType: '力学试验',
    project: '导弹发射装置研制项目',
    testDate: '2023-08-16',
    snippet: `<h4>4.1 振动试验设备</h4>
<p>振动试验在电动振动台上进行，配套力传感器与控制系统。</p>`,
    rows: [
      { id: 'e6', name: '电动振动台', model: 'VT-20', spec: '额定推力 20；频率 5～2000', unit: 'kN / Hz', sys: '力学加载系统', quote: '电动振动台，型号：VT-20' },
    ],
  },
  {
    id: 4,
    name: '某型直升机传动试验报告.pdf',
    fmt: 'PDF',
    docType: '试验报告',
    testType: '传动试验',
    project: '直升机传动系统研制项目',
    testDate: '2022-12-10',
    snippet: `<h4>3 试验设备</h4>
<p>传动试验台用于考核主减速器及尾传系统。</p>`,
    rows: [
      { id: 'e7', name: '传动试验台', model: 'DT-400', spec: '最大功率 400；最高转速 6000', unit: 'kW / r/min', sys: '动力传动系统', quote: '传动试验台，型号：DT-400' },
    ],
  },
]

export default {
  name: 'DeviceExtractPage',
  components: { SelectField, DateField },
  props: { title: String, page: Object },
  setup() {
    const { toast, openForm, openDrawer } = useUi()
    const selectedId = ref(null)
    const applied = reactive({ name: '', docType: '', testType: '', start: '', end: '', project: '' })
    const query = reactive({ name: '', docType: '', testType: '', start: '', end: '', project: '' })

    const docTypeOpts = ['试验报告', '试验记录', '试验方案']
    const testTypeOpts = ['发动机试验', '环境试验', '力学试验', '传动试验']
    const projectOpts = [...new Set(DOCS.map((d) => d.project))]

    const filteredDocs = computed(() => DOCS.filter((d) => {
      if (applied.name && !d.name.includes(applied.name.trim())) return false
      if (applied.docType && d.docType !== applied.docType) return false
      if (applied.testType && d.testType !== applied.testType) return false
      if (applied.project && d.project !== applied.project) return false
      if (applied.start && d.testDate < applied.start) return false
      if (applied.end && d.testDate > applied.end) return false
      return true
    }))

    const currentDoc = computed(() => DOCS.find((d) => d.id === selectedId.value) || null)
    const extractRows = computed(() => currentDoc.value?.rows || [])

    function selectDoc(row) { selectedId.value = row.id }
    function changeDoc() {
      selectedId.value = null
      toast('请在左侧列表重新选择源文档')
    }
    function applyQuery() { Object.assign(applied, { ...query }) }
    function resetQuery() {
      query.name = ''
      query.docType = ''
      query.testType = ''
      query.start = ''
      query.end = ''
      query.project = ''
      Object.assign(applied, { ...query })
    }
    function reExtract() {
      if (!selectedId.value) { toast('请先选择源文档'); return }
      toast('已重新抽取设备信息')
    }
    function exportResult() {
      if (!extractRows.value.length) { toast('暂无抽取结果可导出'); return }
      toast('抽取结果已导出')
    }
    function saveResult() {
      if (!extractRows.value.length) { toast('暂无抽取结果可保存'); return }
      toast('抽取结果已保存')
    }
    function viewRow(row) {
      openDrawer(row.name, [
        { label: '设备名称', value: row.name },
        { label: '型号', value: row.model },
        { label: '规格/主要指标', value: row.spec },
        { label: '单位', value: row.unit },
        { label: '所属系统', value: row.sys },
        { label: '原文片段', value: row.quote },
      ])
    }
    function editRow(row) {
      openForm('编辑设备信息', [
        { key: 'name', label: '设备名称', value: row.name },
        { key: 'model', label: '型号', value: row.model },
        { key: 'spec', label: '规格/主要指标', value: row.spec },
        { key: 'unit', label: '单位', value: row.unit },
        { key: 'sys', label: '所属系统', value: row.sys },
      ], (model) => {
        Object.assign(row, model)
        toast('设备信息已更新')
      })
    }

    return {
      Refresh, Download,
      query, selectedId, filteredDocs, currentDoc, extractRows,
      docTypeOpts, testTypeOpts, projectOpts,
      selectDoc, changeDoc, applyQuery, resetQuery,
      reExtract, exportResult, saveResult, viewRow, editRow,
    }
  },
}
</script>

<style scoped>
.dev-extract {
  display: flex;
  flex-direction: column;
  gap: 14px;
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 18px 20px 16px;
  box-shadow: 0 6px 18px rgba(15, 55, 95, .04);
}
.entry-title h2 { font-size: 20px; color: #0d4e83; font-weight: 700; }
.entry-title p { margin-top: 4px; color: #6d8092; font-size: 13.5px; line-height: 1.6; }

.top-split {
  display: grid;
  grid-template-columns: 1.45fr 0.9fr;
  gap: 14px;
  align-items: stretch;
}
.sec-frame {
  border: 1.5px dashed #b7d4ee;
  border-radius: 12px;
  padding: 14px 16px 16px;
  background: #fff;
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.sec-frame h3 {
  font-size: 15px;
  color: var(--navy-2);
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  flex: 0 0 auto;
}
.sec-frame h3 i {
  width: 4px; height: 15px; background: var(--blue); border-radius: 2px; display: inline-block;
}

.info-form :deep(.el-form-item) { margin-bottom: 12px; }
.info-form :deep(.el-form-item:last-child) { margin-bottom: 0; }
.info-form :deep(.el-form-item__label) {
  display: inline-flex !important;
  align-items: center;
  justify-content: flex-start;
  white-space: nowrap;
  line-height: 36px;
  height: 36px;
  padding-right: 16px !important;
  color: #4a5a6a;
  font-size: 13.5px;
  text-align: left !important;
  box-sizing: border-box;
}
.info-form :deep(.el-form-item__content) { flex: 1; min-width: 0; }
.info-form :deep(.el-input__inner::placeholder) { color: #a8b8c6 !important; opacity: 1; }

.q-row3, .q-row2 {
  display: grid;
  gap: 0 12px;
  align-items: center;
  margin-bottom: 12px;
}
.q-row3 { grid-template-columns: 1.2fr 0.85fr 0.85fr; }
.q-row2 { grid-template-columns: 1.7fr 1fr; margin-bottom: 10px; }
.q-row2 .date-item { min-width: 0; }
.q-row3 :deep(.el-form-item),
.q-row2 :deep(.el-form-item),
.q-row3 :deep(.el-form-item:last-child),
.q-row2 :deep(.el-form-item:last-child) { margin-bottom: 0; }

.date-range {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  min-width: 0;
}
.date-range :deep(.date-field),
.date-range :deep(.el-date-editor) {
  flex: 1 1 0;
  width: 100%;
  min-width: 148px;
}
.range-sep { color: #8a99a8; flex: 0 0 auto; }
.query-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin: 0 0 10px;
}
.query-actions :deep(.el-button + .el-button) { margin-left: 0; }
.query-actions :deep(.el-button--primary),
.query-actions :deep(.el-button--primary > span),
.result-actions :deep(.el-button--primary),
.result-actions :deep(.el-button--primary > span) { color: #fff !important; }

.table-wrap {
  flex: 1 1 auto;
  min-height: 0;
  border: 1px solid #e2ebf3;
  border-radius: 8px;
  overflow: hidden;
}
.src-table { min-height: 220px; height: 220px; }
.result-table { min-height: 220px; height: 220px; }
.ys-table { width: 100%; }
.ys-table :deep(.el-table__inner-wrapper::before) { display: none; }
.ys-table :deep(.el-table__header th) { background: #f4f9fd; color: #4a5a6a; font-weight: 600; }
.ys-table :deep(.el-table__header .el-table__cell),
.ys-table :deep(.el-table__body .el-table__cell) {
  padding: 8px 10px;
  font-size: 13.5px;
  color: #3f5062;
  white-space: nowrap;
}
.ys-table :deep(.el-table__header .cell),
.ys-table :deep(.el-table__body .cell) {
  white-space: nowrap !important;
  word-break: keep-all;
  overflow: hidden;
  text-overflow: clip;
}
.idx-cell { display: inline-flex; align-items: center; justify-content: center; gap: 6px; }
.idx-cell em { font-style: normal; color: #3f5062; }
.ys-table :deep(.el-radio) { margin-right: 0; height: 16px; }
.ys-table :deep(.el-radio__label) { display: none; padding: 0; }
.res-name.on { color: #1668a8; font-weight: 600; }
.view-link, .ops a { color: #1668a8; cursor: pointer; font-size: 13.5px; }
.ops { display: inline-flex; gap: 12px; }
.ops a:hover, .view-link:hover { text-decoration: underline; }

.preview-panel { min-height: 0; }
.file-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  flex: 0 0 auto;
}
.file-bar b {
  flex: 1;
  min-width: 0;
  font-size: 13.5px;
  color: #0d4e83;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.file-ico {
  flex: 0 0 auto;
  min-width: 42px;
  height: 22px;
  padding: 0 6px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: #d48806;
}
.file-ico.PDF { background: #d4380d; }
.snippet {
  flex: 1 1 auto;
  min-height: 0;
  overflow: auto;
  padding: 10px 12px;
  border: 1px solid #e2ebf3;
  border-radius: 8px;
  background: #f7fbfe;
  color: #3f5062;
  font-size: 13.5px;
  line-height: 1.75;
}
.snippet :deep(h4) { margin: 0 0 8px; color: #0d4e83; font-size: 14px; }
.snippet :deep(p) { margin: 0 0 6px; }
.preview-empty {
  flex: 1;
  min-height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8a99a8;
  background: #f7fbfe;
  border-radius: 8px;
}

.result-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}
.result-head h3 { margin-bottom: 0; }
.result-actions { display: flex; gap: 8px; }
.save-ico {
  display: inline-flex;
  width: 14px;
  height: 14px;
  margin-right: 4px;
}
.save-ico svg { width: 100%; height: 100%; display: block; }
.result-actions :deep(.el-button + .el-button) { margin-left: 0; }

@media (max-width: 1280px) {
  .top-split, .q-row3, .q-row2 { grid-template-columns: 1fr; }
}
</style>
