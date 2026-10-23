<template>
  <div class="cls-feat">
    <div class="entry-title">
      <h2>{{ title || '资源聚类特征提取' }}</h2>
      <p>面向历史试验资源信息，支持提取资源属性、用途、规格等特征，形成用于资源分类聚类的特征数据。</p>
    </div>

    <section class="sec-frame pick-frame">
      <el-form
        label-width="6.2em"
        label-position="right"
        require-asterisk-position="right"
        class="info-form pick-form"
        @submit.prevent
      >
        <h3 class="pick-title"><i></i>数据选择</h3>
        <el-form-item label="资源数据集" required class="pick-ds">
          <select-field v-model="query.dsId" :options="dsOpts" placeholder="请选择资源数据集" clearable />
        </el-form-item>
        <el-form-item label="资源范围" required class="pick-scope">
          <select-field v-model="query.scope" :options="scopeOpts" placeholder="请选择资源范围" clearable />
        </el-form-item>
        <div class="pick-rail" aria-hidden="true" />
        <el-form-item label="资源类型" class="pick-type">
          <select-field v-model="query.type" :options="typeOpts" placeholder="请选择资源类型" clearable />
        </el-form-item>
        <el-form-item label="时间范围" class="pick-date">
          <div class="date-range">
            <date-field v-model="query.start" placeholder="开始日期" clearable />
            <span class="range-sep">至</span>
            <date-field v-model="query.end" placeholder="结束日期" clearable />
          </div>
        </el-form-item>
      </el-form>
    </section>

    <div class="mid-split">
      <section class="sec-frame list-panel">
        <h3><i></i>结构化资源列表</h3>
        <div class="list-toolbar">
          <el-input
            v-model="kwDraft"
            placeholder="请输入资源名称、编号或关键词"
            clearable
            :prefix-icon="Search"
            @keyup.enter="applyKw"
          />
          <span class="sel-tip">已选择 <b>{{ selectedIds.length }}</b> 项，共 <b>{{ filtered.length }}</b> 项</span>
          <el-button type="primary" @click="batchSelect">批量选择</el-button>
        </div>
        <div class="table-wrap list-table">
          <el-table
            ref="listTable"
            :data="pageRows"
            row-key="id"
            height="100%"
            class="ys-table"
            empty-text="请先选择资源数据集"
            @selection-change="onSel"
          >
            <el-table-column type="selection" width="42" align="center" :selectable="() => !!query.dsId" />
            <el-table-column type="index" label="序号" width="64" align="center" :index="indexMethod" />
            <el-table-column prop="name" label="资源名称" min-width="220" show-overflow-tooltip />
            <el-table-column prop="type" label="资源类型" min-width="96" />
            <el-table-column prop="project" label="所属项目" min-width="120" />
            <el-table-column prop="ver" label="资源版本" min-width="88" />
            <el-table-column prop="date" label="创建日期" min-width="110" />
          </el-table>
        </div>
        <div class="list-foot">
          <el-pagination
            v-model:current-page="pageNo"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50]"
            :total="filtered.length"
            layout="total, prev, pager, next, sizes, jumper"
            background
            small
          />
        </div>
      </section>

      <section class="sec-frame cfg-panel">
        <h3><i></i>特征提取配置</h3>
        <div class="cfg-sub req">参与聚类的特征字段</div>
        <div class="feat-grid">
          <label v-for="f in featOpts" :key="f.key" class="feat-item">
            <el-checkbox v-model="featChecked[f.key]">{{ f.label }}</el-checkbox>
            <el-tooltip :content="f.hint" placement="top">
              <el-icon class="hint-ico"><QuestionFilled /></el-icon>
            </el-tooltip>
          </label>
        </div>
        <div class="cfg-sub cfg-req-title">特征提取要求</div>
        <el-form
          label-width="8.2em"
          label-position="right"
          require-asterisk-position="right"
          class="info-form cfg-form"
          @submit.prevent
        >
          <el-form-item label="特征数据格式" required>
            <select-field v-model="cfg.format" :options="formatOpts" placeholder="请选择特征数据格式" clearable />
          </el-form-item>
          <div class="cfg-duo">
            <el-form-item label="提取粒度" required>
              <select-field v-model="cfg.grain" :options="grainOpts" placeholder="请选择提取粒度" clearable />
            </el-form-item>
            <el-form-item label="缺失值处理" required>
              <select-field v-model="cfg.missing" :options="missingOpts" placeholder="请选择缺失值处理" clearable />
            </el-form-item>
          </div>
          <el-form-item label="备注">
            <text-area-field v-model="cfg.note" :rows="3" :maxlength="200" placeholder="请输入特征提取的其他要求（可选）" />
          </el-form-item>
        </el-form>
        <div class="cfg-actions">
          <el-button @click="previewFeat">预览特征数据</el-button>
          <el-button @click="saveCfg">保存特征配置</el-button>
          <el-button type="primary" @click="startExtract">开始提取</el-button>
        </div>
      </section>
    </div>

    <section class="sec-frame preview-panel">
      <h3><i></i>特征数据预览</h3>
      <div class="table-wrap preview-table">
        <el-table :data="previewRows" height="100%" class="ys-table" empty-text="请选择资源后查看特征数据预览">
          <el-table-column prop="name" label="资源名称" min-width="220" show-overflow-tooltip />
          <el-table-column
            v-for="col in previewCols"
            :key="col.key"
            :prop="col.key"
            :label="col.label"
            min-width="110"
            show-overflow-tooltip
          />
          <el-table-column label="提取状态" width="100" align="center">
            <template #default="{ row }">
              <span class="st" :class="row.status">
                <i></i>{{ row.status === 'run' ? '提取中' : '已提取' }}
              </span>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </section>
  </div>
</template>

<script>
import { computed, nextTick, reactive, ref, watch } from 'vue'
import { QuestionFilled, Search } from '@element-plus/icons-vue'
import { useUi } from '@/composables/ui'
import SelectField from '@/components/SelectField.vue'
import DateField from '@/components/DateField.vue'
import TextAreaField from '@/components/TextAreaField.vue'

const FEAT_OPTS = [
  { key: 'attr', label: '资源属性', hint: '资源所属试验属性类别，如环境试验、力学试验' },
  { key: 'use', label: '资源用途', hint: '资源的主要用途，如性能验证、可靠性验证' },
  { key: 'spec', label: '资源规格', hint: '规格、量程或关键指标' },
  { key: 'obj', label: '试验对象', hint: '试验对象或被试品' },
  { key: 'cond', label: '试验条件', hint: '温度、湿度、周期等试验条件' },
  { key: 'method', label: '试验方法', hint: '采用的试验方法' },
  { key: 'env', label: '环境类型', hint: '试验环境类型，如高温、振动、低温' },
  { key: 'device', label: '试验设备', hint: '实施试验所使用的设备' },
  { key: 'other', label: '其他特征', hint: '其他可参与聚类的补充特征' },
]

const PREVIEW_COLS = [
  { key: 'attr', label: '资源属性' },
  { key: 'use', label: '资源用途' },
  { key: 'spec', label: '资源规格' },
  { key: 'obj', label: '试验对象' },
  { key: 'env', label: '环境类型' },
  { key: 'method', label: '试验方法' },
]

const SEEDS = [
  { name: '某型高温环境试验报告', type: '试验报告', project: '定型试验', ver: 'V1.0', date: '2024-06-12', attr: '环境试验', use: '性能验证', spec: '高温：150℃', obj: '整机', env: '高温', method: '高温试验', cond: '150℃ / 2h', device: '高温试验箱', other: '—' },
  { name: '某型发动机振动试验数据', type: '试验数据', project: '发动机专项', ver: 'V2.1', date: '2024-05-28', attr: '力学试验', use: '可靠性验证', spec: '频率：20-2000Hz', obj: '发动机', env: '振动', method: '振动试验', cond: '20–2000Hz', device: '电动振动台', other: '—' },
  { name: '某型电磁兼容试验方案', type: '试验方案', project: '定型试验', ver: 'V1.0', date: '2024-04-13', attr: '电磁试验', use: '符合性验证', spec: '频段：30MHz–1GHz', obj: '整机', env: '电磁', method: 'EMC试验', cond: '标准限值', device: 'EMC暗室', other: '—' },
  { name: '某型低温试验数据记录', type: '试验记录', project: '环境试验项目', ver: 'V1.3', date: '2024-03-15', attr: '环境试验', use: '可靠性验证', spec: '低温：-40℃', obj: '整机', env: '低温', method: '低温试验', cond: '-40℃ / 4h', device: '高低温试验箱', other: '—' },
  { name: '某型雷达性能摸底试验', type: '试验报告', project: '雷达专项', ver: 'V2.0', date: '2024-02-28', attr: '性能试验', use: '摸底评估', spec: '作用距离：120km', obj: '雷达', env: '常温', method: '性能测试', cond: '常温常湿', device: '雷达综合测试仪', other: '—' },
  { name: '某型环境适应性试验报告', type: '试验报告', project: '定型试验', ver: 'V1.0', date: '2024-01-17', attr: '环境试验', use: '适应性考核', spec: '温循：-40～70℃', obj: '整机', env: '温循', method: '环境试验', cond: '温循 10 周期', device: '温循试验箱', other: '—' },
  { name: '某型可靠性增长试验数据', type: '试验数据', project: '可靠性试验', ver: 'V1.5', date: '2024-01-05', attr: '可靠性增长', use: '寿命评估', spec: '周期：1000h', obj: '发动机', env: '低温', method: '加速试验', cond: '1000h', device: '可靠性试验台', other: '—' },
  { name: '某型静力试验方案', type: '试验方案', project: '结构强度试验', ver: 'V1.3', date: '2023-12-20', attr: '结构试验', use: '强度考核', spec: '载荷：120%', obj: '结构件', env: '静载', method: '静力试验', cond: '分级加载', device: '静力加载架', other: '—' },
  { name: '某型疲劳试验数据', type: '试验数据', project: '疲劳试验', ver: 'V1.0', date: '2023-11-11', attr: '结构试验', use: '寿命验证', spec: '循环：1e6', obj: '结构件', env: '疲劳', method: '疲劳试验', cond: '1×10⁶ 次', device: '疲劳试验机', other: '—' },
  { name: '某型冲击试验数据', type: '试验数据', project: '冲击环境试验', ver: 'V1.0', date: '2023-10-09', attr: '力学试验', use: '抗冲击考核', spec: '峰值：50g', obj: '整机', env: '冲击', method: '冲击试验', cond: '半正弦 11ms', device: '冲击试验台', other: '—' },
]

function buildCatalog() {
  const list = []
  for (let i = 0; i < 326; i++) {
    const s = SEEDS[i % SEEDS.length]
    list.push({
      ...s,
      id: i + 1,
      name: i < SEEDS.length ? s.name : `${s.name}（${i + 1}）`,
    })
  }
  return list
}

const CATALOG = buildCatalog()

export default {
  name: 'ClusterFeatPage',
  components: { SelectField, DateField, TextAreaField, QuestionFilled, Search },
  props: { title: String, page: Object },
  setup() {
    const { toast } = useUi()
    const query = reactive({ dsId: '', scope: '', type: '', start: '', end: '' })
    const cfg = reactive({ format: '', grain: '', missing: '', note: '' })
    const featChecked = reactive(Object.fromEntries(FEAT_OPTS.map((f) => [f.key, false])))
    const kwDraft = ref('')
    const kw = ref('')
    const pageNo = ref(1)
    const pageSize = ref(10)
    const selectedIds = ref([])
    const previewRows = ref([])
    const listTable = ref(null)

    const dsOpts = ['试验结构化资源数据集', '试验参数结构化数据集']
    const scopeOpts = ['全部资源', '已结构化资源', '已校验资源']
    const typeOpts = ['全部类型', '试验报告', '试验数据', '试验方案', '试验记录']
    const formatOpts = ['结构化表格（CSV）', 'JSON', '向量特征表']
    const grainOpts = ['按资源级', '按字段级', '按试验项目级']
    const missingOpts = ['自动识别并填充', '忽略空值', '标记为缺失']

    const catalog = computed(() => (query.dsId ? CATALOG : []))
    const filtered = computed(() => {
      let rows = catalog.value
      if (query.type && query.type !== '全部类型') rows = rows.filter((r) => r.type === query.type)
      if (query.start) rows = rows.filter((r) => r.date >= query.start)
      if (query.end) rows = rows.filter((r) => r.date <= query.end)
      const k = kw.value.trim()
      if (k) rows = rows.filter((r) => `${r.name}${r.project}${r.ver}`.includes(k))
      return rows
    })
    const pageRows = computed(() => {
      const start = (pageNo.value - 1) * pageSize.value
      return filtered.value.slice(start, start + pageSize.value)
    })
    const activeFeats = computed(() => FEAT_OPTS.filter((f) => featChecked[f.key]))
    const previewCols = PREVIEW_COLS

    watch(() => query.dsId, () => {
      selectedIds.value = []
      previewRows.value = []
      pageNo.value = 1
      kwDraft.value = ''
      kw.value = ''
    })
    watch(() => [query.type, query.start, query.end, kw.value], () => { pageNo.value = 1 })

    let syncingSel = false
    function onSel(rows) {
      if (syncingSel) return
      const pageIds = new Set(pageRows.value.map((r) => r.id))
      const keep = selectedIds.value.filter((id) => !pageIds.has(id))
      selectedIds.value = [...keep, ...rows.map((r) => r.id)]
    }
    function syncPageSelection() {
      const tb = listTable.value
      if (!tb) return
      syncingSel = true
      pageRows.value.forEach((row) => {
        tb.toggleRowSelection(row, selectedIds.value.includes(row.id))
      })
      nextTick(() => { syncingSel = false })
    }
    watch(pageRows, syncPageSelection)
    watch(selectedIds, syncPageSelection)
    function indexMethod(i) { return (pageNo.value - 1) * pageSize.value + i + 1 }
    function applyKw() { kw.value = kwDraft.value; pageNo.value = 1 }
    function batchSelect() {
      if (!query.dsId) { toast('请先选择资源数据集'); return }
      const ids = filtered.value.map((r) => r.id)
      const allOn = ids.length && ids.every((id) => selectedIds.value.includes(id))
      selectedIds.value = allOn ? [] : ids
      toast(allOn ? '已取消批量选择' : `已批量选择 ${ids.length} 项`)
    }
    function selectedRows() {
      const set = new Set(selectedIds.value)
      return filtered.value.filter((r) => set.has(r.id))
    }
    function buildPreview(statusMap) {
      return selectedRows().map((r, i) => {
        const row = { id: r.id, name: r.name, status: statusMap?.(r, i) || 'ok' }
        PREVIEW_COLS.forEach((f) => { row[f.key] = r[f.key] || '—' })
        activeFeats.value.forEach((f) => { row[f.key] = r[f.key] || '—' })
        return row
      })
    }
    function refreshPreview(statusMap) {
      previewRows.value = selectedIds.value.length ? buildPreview(statusMap) : []
    }
    watch(selectedIds, () => refreshPreview())
    function previewFeat() {
      if (!selectedIds.value.length) { toast('请至少选择 1 条资源'); return }
      if (!activeFeats.value.length) { toast('请至少选择 1 个特征字段'); return }
      if (!cfg.format) { toast('请选择特征数据格式'); return }
      if (!cfg.grain) { toast('请选择提取粒度'); return }
      refreshPreview(() => 'ok')
      toast('已生成特征数据预览')
    }
    function saveCfg() {
      if (!activeFeats.value.length) { toast('请至少选择 1 个特征字段'); return }
      if (!cfg.format) { toast('请选择特征数据格式'); return }
      if (!cfg.grain) { toast('请选择提取粒度'); return }
      if (!cfg.missing) { toast('请选择缺失值处理'); return }
      toast('特征配置已保存')
    }
    function startExtract() {
      if (!query.dsId) { toast('请先选择资源数据集'); return }
      if (!query.scope) { toast('请选择资源范围'); return }
      if (!selectedIds.value.length) { toast('请至少选择 1 条资源'); return }
      if (!activeFeats.value.length) { toast('请至少选择 1 个特征字段'); return }
      if (!cfg.format) { toast('请选择特征数据格式'); return }
      if (!cfg.grain) { toast('请选择提取粒度'); return }
      if (!cfg.missing) { toast('请选择缺失值处理'); return }
      refreshPreview((_, i) => (i === 2 ? 'run' : 'ok'))
      toast('已开始特征提取')
    }

    return {
      Search, QuestionFilled,
      query, cfg, featChecked, featOpts: FEAT_OPTS,
      kwDraft, pageNo, pageSize, selectedIds, previewRows, listTable,
      dsOpts, scopeOpts, typeOpts, formatOpts, grainOpts, missingOpts,
      filtered, pageRows, previewCols,
      onSel, indexMethod, applyKw, batchSelect, previewFeat, saveCfg, startExtract,
    }
  },
}
</script>

<style scoped>
.cls-feat {
  display: flex;
  flex-direction: column;
  gap: 14px;
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 20px 22px 20px;
  box-shadow: 0 6px 18px rgba(15, 55, 95, .04);
}
.entry-title { padding: 0 0 4px; }
.entry-title h2 { font-size: 20px; color: #0d4e83; font-weight: 700; }
.entry-title p { margin-top: 4px; color: #6d8092; font-size: 13.5px; line-height: 1.6; }

.mid-split {
  display: grid;
  grid-template-columns: 1.7fr 0.95fr;
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

.pick-form {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr) 1px minmax(0, 1.25fr);
  grid-template-areas:
    "title . rail type"
    "ds scope rail date";
  column-gap: 12px;
  row-gap: 6px;
  align-items: start;
  align-content: start;
}
.pick-title {
  grid-area: title;
  margin: 0 !important;
  white-space: nowrap;
  align-self: center;
}
.pick-ds { grid-area: ds; }
.pick-scope { grid-area: scope; }
.pick-rail {
  grid-area: rail;
  width: 1px;
  align-self: stretch;
  background: #dcdfe6;
}
.pick-type { grid-area: type; }
.pick-date { grid-area: date; }

.info-form :deep(.el-form-item.is-required:not(.is-no-asterisk) > .el-form-item__label::before) {
  display: none !important;
}
.info-form :deep(.el-form-item.is-required:not(.is-no-asterisk) > .el-form-item__label::after) {
  content: '*' !important;
  color: #f5222d;
  position: absolute;
  right: 6px;
  top: 50%;
  transform: translateY(-50%);
  margin: 0;
  line-height: 1;
}

.info-form :deep(.el-form-item) { margin-bottom: 12px; }
.info-form :deep(.el-form-item:last-child) { margin-bottom: 0; }
.pick-form :deep(.el-form-item),
.pick-form :deep(.el-form-item:last-child) { margin-bottom: 0 !important; }
.info-form :deep(.el-form-item__label) {
  position: relative;
  display: inline-flex !important;
  align-items: center;
  justify-content: flex-start;
  white-space: nowrap;
  line-height: 36px;
  height: 36px;
  padding-right: 18px !important;
  color: #4a5a6a;
  font-size: 13.5px;
  text-align: left !important;
  box-sizing: border-box;
}
.info-form :deep(.el-form-item__content) { flex: 1; min-width: 0; }
.info-form :deep(.el-input__inner::placeholder),
.info-form :deep(.el-textarea__inner::placeholder) { color: #a8b8c6 !important; opacity: 1; }

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
  min-width: 132px;
}
.range-sep { color: #8a99a8; flex: 0 0 auto; font-size: 13px; }

.list-panel, .cfg-panel { min-height: 420px; }
.list-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
  flex: 0 0 auto;
}
.list-toolbar :deep(.el-input) { flex: 1; min-width: 0; max-width: 360px; }
.sel-tip { margin-left: auto; font-size: 13px; color: #6d8092; white-space: nowrap; }
.sel-tip b { color: #0d4e83; }
.list-toolbar :deep(.el-button--primary),
.list-toolbar :deep(.el-button--primary > span),
.cfg-actions :deep(.el-button--primary),
.cfg-actions :deep(.el-button--primary > span) { color: #fff !important; }
.list-toolbar :deep(.el-button + .el-button),
.cfg-actions :deep(.el-button + .el-button) { margin-left: 0; }

.table-wrap {
  flex: 1 1 auto;
  min-height: 0;
  border: 1px solid #e2ebf3;
  border-radius: 8px;
  overflow: hidden;
}
.list-table { min-height: 280px; height: 280px; }
.preview-table { min-height: 200px; height: 200px; }
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
  word-break: keep-all;
  overflow: visible;
  text-overflow: clip;
}
.ys-table :deep(.el-table__body .cell) {
  white-space: nowrap !important;
  word-break: keep-all;
  overflow: hidden;
  text-overflow: ellipsis;
}
.list-foot {
  display: flex;
  justify-content: flex-end;
  padding-top: 10px;
  flex: 0 0 auto;
}

.cfg-sub { font-size: 13.5px; color: #3f5062; margin: 0 0 10px; }
.cfg-sub.req {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.cfg-sub.req::after { content: '*'; color: #f5222d; font-size: 13px; line-height: 1; }
.cfg-req-title { color: #1668a8; font-weight: 600; }
.feat-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 10px 8px;
  margin-bottom: 16px;
  padding: 12px 14px;
  border: 1px solid #d7e6f2;
  border-radius: 8px;
  background: #fff;
}
.cfg-duo {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}
.cfg-duo :deep(.el-form-item) {
  flex: 1 1 0;
  min-width: 0;
  margin-bottom: 0 !important;
}
.cfg-duo :deep(.el-form-item__label) {
  width: 7em !important;
}
.feat-item {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  min-width: 0;
}
.feat-item :deep(.el-checkbox) { margin-right: 0; }
.feat-item :deep(.el-checkbox__label) { padding-left: 6px; font-size: 13.5px; color: #3f5062; }
.hint-ico { color: #8aa0b4; font-size: 14px; cursor: default; }
.cfg-form { flex: 1 1 auto; }
.cfg-form :deep(.el-form-item) { margin-bottom: 12px; }
.cfg-form :deep(.el-form-item__label) { padding-right: 20px !important; }
.cfg-actions {
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: auto;
  padding-top: 8px;
}

.st {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  white-space: nowrap;
}
.st i { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
.st.ok { color: #389e0d; }
.st.ok i { background: #52c41a; }
.st.run { color: #08979c; }
.st.run i { background: #13c2c2; }

@media (max-width: 1280px) {
  .mid-split, .feat-grid, .cfg-duo { grid-template-columns: 1fr; }
  .pick-form {
    grid-template-columns: 1fr;
    grid-template-areas:
      "title"
      "ds"
      "scope"
      "rail"
      "type"
      "date";
  }
  .pick-rail { width: 100%; height: 1px; }
  .list-toolbar { flex-wrap: wrap; }
  .list-toolbar :deep(.el-input) { max-width: none; }
  .sel-tip { margin-left: 0; }
}
</style>
