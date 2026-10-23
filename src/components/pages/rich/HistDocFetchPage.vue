<template>
  <div class="hist-doc">
    <div class="entry-title">
      <h2>{{ title || '历史文档获取' }}</h2>
      <p>从试验鉴定领域资源库中获取历史试验文档，支持按条件查询、选择并获取所需历史试验文档。</p>
    </div>

    <section class="query-card">
      <el-form
        label-width="5.5em"
        label-position="right"
        require-asterisk-position="right"
        class="info-form"
        @submit.prevent="applyQuery"
      >
        <div class="q-grid">
          <el-form-item label="数据来源" required>
            <select-field v-model="draft.source" :options="sourceOpts" placeholder="请选择数据来源" clearable />
          </el-form-item>
          <el-form-item label="文档名称">
            <el-input v-model="draft.name" placeholder="请输入文档名称关键词" clearable />
          </el-form-item>
          <el-form-item label="试验类型">
            <select-field v-model="draft.testType" :options="testTypeOpts" placeholder="请选择试验类型" clearable />
          </el-form-item>
          <el-form-item label="文档类型">
            <select-field v-model="draft.docType" :options="docTypeOpts" placeholder="请选择文档类型" clearable />
          </el-form-item>
          <el-form-item label="试验时间">
            <div class="date-range">
              <date-field v-model="draft.start" placeholder="开始日期" clearable />
              <span class="range-sep">~</span>
              <date-field v-model="draft.end" placeholder="结束日期" clearable />
            </div>
          </el-form-item>
          <el-form-item label="试验对象">
            <el-input v-model="draft.object" placeholder="请输入试验对象" clearable />
          </el-form-item>
          <el-form-item label="所属项目">
            <el-input v-model="draft.project" placeholder="请输入所属项目" clearable />
          </el-form-item>
          <el-form-item label="关键词">
            <el-input v-model="draft.keyword" placeholder="请输入关键词" clearable />
          </el-form-item>
        </div>
        <div class="query-actions">
          <el-button @click="resetQuery">重置</el-button>
          <el-button type="primary" @click="applyQuery">查询</el-button>
        </div>
      </el-form>
    </section>

    <div class="bottom-split">
      <section class="list-card">
        <div class="list-toolbar">
          <el-checkbox
            :model-value="allChecked"
            :indeterminate="isIndeterminate"
            @change="toggleAll"
          >已选择 <b>{{ selectedIds.length }}</b> 项，共 <b>{{ filtered.length }}</b> 项</el-checkbox>
          <div class="toolbar-btns">
            <el-button type="primary" :icon="Download" @click="fetchSelected">获取所选文档</el-button>
            <el-button :icon="Delete" @click="clearSel">清空选择</el-button>
          </div>
        </div>
        <div class="table-wrap">
          <el-table
            ref="listTable"
            :data="filtered"
            row-key="id"
            height="100%"
            highlight-current-row
            class="ys-table"
            empty-text="没有符合条件的文档"
            @row-click="onRowClick"
            @selection-change="onSel"
          >
            <el-table-column type="selection" width="42" align="center" />
            <el-table-column type="index" label="序号" width="64" align="center" />
            <el-table-column label="文档名称" min-width="240" show-overflow-tooltip>
              <template #default="{ row }">
                <el-tooltip :content="row.name" placement="top" :show-after="300">
                  <span class="doc-name" :class="{ on: currentId === row.id }">
                    <em class="fico" :class="row.kind">{{ row.mark }}</em>
                    {{ row.name }}
                  </span>
                </el-tooltip>
              </template>
            </el-table-column>
            <el-table-column prop="docType" label="文档类型" min-width="88" show-overflow-tooltip />
            <el-table-column prop="testType" label="试验类型" min-width="110" show-overflow-tooltip />
            <el-table-column prop="object" label="试验对象" min-width="96" show-overflow-tooltip />
            <el-table-column prop="date" label="试验时间" min-width="110" show-overflow-tooltip />
            <el-table-column prop="size" label="文件大小" min-width="88" show-overflow-tooltip />
            <el-table-column label="操作" width="110" align="center">
              <template #default="{ row }">
                <span class="ops">
                  <a @click.stop="viewDoc(row)">查看</a>
                  <a @click.stop="downloadDoc(row)">下载</a>
                </span>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </section>

      <section class="info-card">
        <h3><i></i>文档信息</h3>
        <template v-if="currentDoc">
          <div class="file-bar">
            <em class="fico" :class="currentDoc.kind">{{ currentDoc.mark }}</em>
            <b>{{ currentDoc.name }}</b>
          </div>
          <dl class="info-dl">
            <div><dt>文档类型</dt><dd>{{ currentDoc.docType }}</dd></div>
            <div><dt>试验类型</dt><dd>{{ currentDoc.testType }}</dd></div>
            <div><dt>试验对象</dt><dd>{{ currentDoc.object }}</dd></div>
            <div><dt>所属项目</dt><dd>{{ currentDoc.project }}</dd></div>
            <div><dt>试验时间</dt><dd>{{ currentDoc.date }}</dd></div>
            <div><dt>文件大小</dt><dd>{{ currentDoc.size }}</dd></div>
            <div class="full"><dt>关键词</dt><dd>{{ currentDoc.keywords }}</dd></div>
            <div class="full abstr"><dt>摘要</dt><dd>{{ currentDoc.abstract }}</dd></div>
          </dl>
          <div class="info-actions">
            <el-button @click="previewDoc">预览文档</el-button>
            <el-button type="primary" @click="fetchOne">获取该文档</el-button>
          </div>
        </template>
        <div v-else class="info-empty">请选择文档后查看信息</div>
      </section>
    </div>
  </div>
</template>

<script>
import { computed, reactive, ref } from 'vue'
import { Delete, Download } from '@element-plus/icons-vue'
import { useUi } from '@/composables/ui'
import SelectField from '@/components/SelectField.vue'
import DateField from '@/components/DateField.vue'

const DOCS = [
  { id: 1, name: '某型飞机高温环境试验报告.docx', kind: 'doc', mark: 'W', docType: '试验报告', testType: '环境试验', object: '某型飞机', project: '某型飞机研制项目', date: '2023-06-12', size: '12.36 MB', keywords: '高温环境、性能测试、试验报告', abstract: '本文档为某型飞机在高温环境条件下的试验报告，涵盖试验目的、试验条件、试验过程及结果分析。' },
  { id: 2, name: '某型发动机振动试验记录.pdf', kind: 'pdf', mark: 'A', docType: '试验记录', testType: '振动试验', object: '某型发动机', project: '发动机专项', date: '2022-11-03', size: '8.15 MB', keywords: '振动试验、发动机、试验记录', abstract: '记录某型发动机振动试验过程数据、测点布置及主要结论。' },
  { id: 3, name: '某型雷达电磁兼容试验方案.docx', kind: 'doc', mark: 'W', docType: '试验方案', testType: '电磁兼容试验', object: '某型雷达', project: '雷达专项', date: '2022-08-21', size: '5.23 MB', keywords: '电磁兼容、试验方案、雷达', abstract: '制定某型雷达电磁兼容试验的项目、限值、场地与判定准则。' },
  { id: 4, name: '某型装备可靠性试验报告.pdf', kind: 'pdf', mark: 'A', docType: '试验报告', testType: '可靠性试验', object: '某型装备', project: '装备定型试验', date: '2022-05-17', size: '10.29 MB', keywords: '可靠性、寿命、试验报告', abstract: '给出某型装备可靠性试验剖面、故障统计与评估结论。' },
  { id: 5, name: '某型车辆道路试验数据.xlsx', kind: 'xls', mark: 'X', docType: '试验数据', testType: '道路试验', object: '某型车辆', project: '车辆道路试验', date: '2021-12-08', size: '4.76 MB', keywords: '道路试验、车辆、试验数据', abstract: '汇总某型车辆道路试验的速度、载荷与油耗等结构化数据。' },
  { id: 6, name: '某型导弹环境试验图片资料.zip', kind: 'zip', mark: 'Z', docType: '试验资料', testType: '环境试验', object: '某型导弹', project: '导弹环境试验', date: '2021-09-14', size: '28.67 MB', keywords: '环境试验、图片、导弹', abstract: '收集某型导弹环境试验现场照片与配套说明资料。' },
  { id: 7, name: '某型卫星热真空试验报告.pdf', kind: 'pdf', mark: 'A', docType: '试验报告', testType: '热真空试验', object: '某型卫星', project: '卫星热真空试验', date: '2021-06-30', size: '9.14 MB', keywords: '热真空、卫星、试验报告', abstract: '描述某型卫星热真空试验工况、温度曲线及性能复核结果。' },
  { id: 8, name: '某型装备试验大纲.docx', kind: 'doc', mark: 'W', docType: '试验大纲', testType: '综合试验', object: '某型装备', project: '装备综合试验', date: '2021-03-18', size: '6.81 MB', keywords: '试验大纲、综合试验、装备', abstract: '明确某型装备综合试验的目的、项目、方法与验收要求。' },
]

export default {
  name: 'HistDocFetchPage',
  components: { SelectField, DateField, Download, Delete },
  props: { title: String, page: Object },
  setup() {
    const { toast } = useUi()
    const emptyQ = () => ({ source: '', name: '', testType: '', docType: '', start: '', end: '', object: '', project: '', keyword: '' })
    const draft = reactive(emptyQ())
    const applied = reactive(emptyQ())
    const selectedIds = ref([])
    const currentId = ref(null)
    const listTable = ref(null)

    const sourceOpts = ['试验鉴定领域资源库', '历史试验档案库', '型号试验数据库']
    const testTypeOpts = ['环境试验', '振动试验', '电磁兼容试验', '可靠性试验', '道路试验', '热真空试验', '综合试验']
    const docTypeOpts = ['试验报告', '试验记录', '试验方案', '试验数据', '试验资料', '试验大纲']

    const filtered = computed(() => {
      const q = applied
      return DOCS.filter((d) => {
        if (q.name && !d.name.includes(q.name.trim())) return false
        if (q.testType && d.testType !== q.testType) return false
        if (q.docType && d.docType !== q.docType) return false
        if (q.object && !d.object.includes(q.object.trim())) return false
        if (q.project && !d.project.includes(q.project.trim())) return false
        if (q.keyword && !`${d.name}${d.keywords}${d.abstract}`.includes(q.keyword.trim())) return false
        if (q.start && d.date < q.start) return false
        if (q.end && d.date > q.end) return false
        return true
      })
    })
    const currentDoc = computed(() => DOCS.find((d) => d.id === currentId.value) || null)
    const allChecked = computed(() => filtered.value.length > 0 && filtered.value.every((d) => selectedIds.value.includes(d.id)))
    const isIndeterminate = computed(() => selectedIds.value.length > 0 && !allChecked.value)

    function applyQuery() {
      if (!draft.source) { toast('请选择数据来源'); return }
      Object.assign(applied, { ...draft })
    }
    function resetQuery() {
      Object.assign(draft, emptyQ())
      Object.assign(applied, emptyQ())
    }
    function showDoc(row) {
      if (!row) { currentId.value = null; return }
      currentId.value = row.id
    }
    function onSel(rows) {
      const ids = rows.map((r) => r.id)
      selectedIds.value = ids
      if (!ids.length) {
        currentId.value = null
        return
      }
      if (!ids.includes(currentId.value)) showDoc(rows[rows.length - 1])
    }
    function onRowClick(row) { showDoc(row) }
    function viewDoc(row) { showDoc(row) }
    function toggleAll(val) {
      const tb = listTable.value
      if (!tb) return
      filtered.value.forEach((row) => tb.toggleRowSelection(row, !!val))
    }
    function clearSel() { listTable.value?.clearSelection() }
    function downloadDoc(row) { toast(`已开始下载：${row.name}`) }
    function fetchSelected() {
      if (!selectedIds.value.length) { toast('请先选择文档'); return }
      toast(`已获取 ${selectedIds.value.length} 份文档`)
    }
    function previewDoc() {
      if (!currentDoc.value) return
      toast(`正在预览：${currentDoc.value.name}`)
    }
    function fetchOne() {
      if (!currentDoc.value) { toast('请先选择文档'); return }
      toast(`已获取：${currentDoc.value.name}`)
    }

    return {
      Download, Delete,
      draft, filtered, selectedIds, currentId, currentDoc, listTable,
      sourceOpts, testTypeOpts, docTypeOpts,
      allChecked, isIndeterminate,
      applyQuery, resetQuery, onSel, onRowClick, viewDoc, toggleAll,
      clearSel, downloadDoc, fetchSelected, previewDoc, fetchOne,
    }
  },
}
</script>

<style scoped>
.hist-doc {
  display: flex;
  flex-direction: column;
  gap: 14px;
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 20px 22px 20px;
  box-shadow: 0 6px 18px rgba(15, 55, 95, .04);
}
.entry-title h2 { font-size: 20px; color: #0d4e83; font-weight: 700; }
.entry-title p { margin-top: 4px; color: #6d8092; font-size: 13.5px; line-height: 1.6; }

.query-card, .list-card, .info-card {
  border: 1px solid #d7e6f2;
  border-radius: 12px;
  background: #fff;
  min-width: 0;
}
.query-card { padding: 16px 18px 12px; }
.list-card, .info-card { display: flex; flex-direction: column; padding: 12px 14px 14px; }

.info-form :deep(.el-form-item) { margin-bottom: 12px; }
.info-form :deep(.el-form-item:last-child) { margin-bottom: 0; }
.info-form :deep(.el-form-item__label) {
  position: relative;
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
}
.info-form :deep(.el-form-item.is-required:not(.is-no-asterisk) > .el-form-item__label::before) {
  display: none !important;
}
.info-form :deep(.el-form-item.is-required:not(.is-no-asterisk) > .el-form-item__label::after) {
  content: '*' !important;
  color: #f5222d;
  position: absolute;
  right: 4px;
  top: 50%;
  transform: translateY(-50%);
  margin: 0;
  line-height: 1;
}
.info-form :deep(.el-form-item__content) { flex: 1; min-width: 0; }
.info-form :deep(.el-input__inner::placeholder) { color: #a8b8c6 !important; opacity: 1; }

.q-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  gap: 0 12px;
}
.q-grid :deep(.el-form-item) { margin-bottom: 12px; }
.date-range {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  width: 100%;
}
.date-range :deep(.date-field),
.date-range :deep(.el-date-editor) {
  flex: 1 1 0;
  width: 100%;
  min-width: 0;
}
.range-sep { color: #8a99a8; flex: 0 0 auto; }
.query-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 2px;
}
.query-actions :deep(.el-button + .el-button),
.toolbar-btns :deep(.el-button + .el-button),
.info-actions :deep(.el-button + .el-button) { margin-left: 0; }
.query-actions :deep(.el-button--primary),
.query-actions :deep(.el-button--primary > span),
.toolbar-btns :deep(.el-button--primary),
.toolbar-btns :deep(.el-button--primary > span),
.info-actions :deep(.el-button--primary),
.info-actions :deep(.el-button--primary > span) { color: #fff !important; }

.bottom-split {
  display: grid;
  grid-template-columns: minmax(0, 1.7fr) 300px;
  gap: 14px;
  align-items: stretch;
  min-height: 420px;
}
.list-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
  flex: 0 0 auto;
}
.list-toolbar :deep(.el-checkbox__label) { color: #4a5a6a; font-size: 13.5px; }
.list-toolbar b { color: #0d4e83; }
.toolbar-btns { display: flex; gap: 8px; }

.table-wrap {
  flex: 1 1 auto;
  min-height: 280px;
  height: 320px;
  border: 1px solid #e2ebf3;
  border-radius: 8px;
  overflow: hidden;
}
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
.ys-table :deep(.el-table__header .cell) {
  white-space: nowrap !important;
  overflow: visible;
  text-overflow: clip;
}
.ys-table :deep(.el-table__body .cell) {
  white-space: nowrap !important;
  overflow: hidden;
  text-overflow: ellipsis;
}
.doc-name {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #3f5062;
}
.doc-name.on { color: #1668a8; font-weight: 600; }
.fico {
  flex: 0 0 auto;
  width: 20px;
  height: 20px;
  border-radius: 3px;
  font-size: 11px;
  font-style: normal;
  font-weight: 700;
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.fico.doc { background: #2b7cd3; }
.fico.pdf { background: #d4380d; }
.fico.xls { background: #217346; }
.fico.zip { background: #d48806; }
.ops { display: inline-flex; gap: 12px; }
.ops a { color: #1668a8; cursor: pointer; }
.ops a:hover { text-decoration: underline; }

.info-card h3 {
  font-size: 15px;
  color: var(--navy-2);
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  flex: 0 0 auto;
}
.info-card h3 i {
  width: 4px; height: 15px; background: var(--blue); border-radius: 2px; display: inline-block;
}
.file-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}
.file-bar b {
  font-size: 13.5px;
  color: #0d4e83;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.info-dl { flex: 1; min-height: 0; overflow: auto; }
.info-dl > div {
  display: grid;
  grid-template-columns: 5.5em 1fr;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 13.5px;
}
.info-dl dt { color: #8a99a8; }
.info-dl dd { color: #3f5062; min-width: 0; word-break: break-all; }
.info-dl .abstr dd { line-height: 1.7; }
.info-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 12px;
  flex: 0 0 auto;
}
.info-empty {
  flex: 1;
  min-height: 240px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8a99a8;
  background: #f7fbfe;
  border-radius: 8px;
}

@media (max-width: 1280px) {
  .q-grid, .bottom-split { grid-template-columns: 1fr; }
}
</style>
