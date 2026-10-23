<template>
  <div class="vec-parse">
    <div class="entry-title">
      <h2>{{ title || '试验资源向量化解析' }}</h2>
      <p>面向试验设备、试验参数等结构化试验资源数据，支持试验资源数据向量化解析，对资源信息进行向量化处理，为后续向量生成提供基础。</p>
    </div>

    <div class="top-grid">
      <section class="sec-frame">
        <h3><em>1</em>选择结构化资源数据集</h3>
        <el-form
          label-width="6.2em"
          label-position="right"
          require-asterisk-position="right"
          class="info-form"
          @submit.prevent
        >
          <el-form-item label="数据集名称" required>
            <select-field v-model="form.dsId" :options="dsOpts" placeholder="请选择数据集" clearable />
          </el-form-item>
          <el-form-item label="资源类型">
            <select-field v-model="form.resType" :options="resTypeOpts" placeholder="请选择资源类型" clearable />
          </el-form-item>
          <el-form-item label="数据来源">
            <select-field v-model="form.source" :options="sourceOpts" placeholder="请选择数据来源" clearable />
          </el-form-item>
        </el-form>
        <div v-if="currentDs" class="ds-desc">
          <span class="ds-desc-lab">数据集描述</span>
          <div class="ds-desc-txt">
            {{ currentDs.desc }}<br>
            共 <b>{{ currentDs.total }}</b> 条记录。
          </div>
        </div>
      </section>

      <section class="sec-frame field-panel">
        <h3><em>2</em>字段选择与解析配置</h3>
        <div class="sec2-split">
          <div class="field-block">
            <div class="sub-title">字段选择 <span>将字段拼接为文本用于向量化（至少选择1个字段）</span></div>
            <div class="table-wrap field-table">
              <el-table
                :data="fields"
                row-key="key"
                height="100%"
                class="ys-table"
                empty-text="请先选择数据集"
                @selection-change="onFieldSel"
              >
                <el-table-column type="selection" width="42" align="center" :selectable="() => !!fields.length" />
                <el-table-column prop="name" label="字段名称" min-width="96" />
                <el-table-column prop="type" label="字段类型" min-width="80" />
                <el-table-column prop="sample" label="示例值" min-width="100" show-overflow-tooltip />
              </el-table>
            </div>
          </div>
          <div class="cfg-block">
            <div class="sub-title">解析配置</div>
            <el-form label-width="7.2em" label-position="right" class="info-form cfg-form" @submit.prevent>
              <el-form-item label="文本拼接模板">
                <select-field v-model="cfg.tpl" :options="tplOpts" placeholder="请选择拼接模板" />
              </el-form-item>
              <el-form-item label="字段分隔符">
                <select-field v-model="cfg.sep" :options="sepOpts" placeholder="请选择分隔符" />
              </el-form-item>
              <el-form-item label="空值处理">
                <select-field v-model="cfg.empty" :options="emptyOpts" placeholder="请选择空值处理" />
              </el-form-item>
              <el-form-item label="自定义文本（可选）" class="stack-ta">
                <text-area-field v-model="cfg.extra" :rows="3" :maxlength="200" placeholder="请输入自定义文本拼接规则" />
              </el-form-item>
              <div class="clean-row">
                <el-checkbox v-model="cfg.clean">启用数据清洗</el-checkbox>
                <el-tooltip content="对拼接文本进行去空格、归一化等清洗" placement="top">
                  <el-icon class="hint-ico"><Warning /></el-icon>
                </el-tooltip>
              </div>
            </el-form>
          </div>
        </div>
      </section>
    </div>

    <div class="bottom-grid">
      <section class="sec-frame rec-panel">
        <div class="rec-head">
          <h3><em>3</em>结构化资源记录</h3>
          <div class="rec-search">
            <el-input
              v-model="kwDraft"
              placeholder="请输入设备名称、型号或厂家"
              clearable
              :prefix-icon="Search"
              @keyup.enter="applyKw"
            />
            <el-button type="primary" @click="applyKw">查询</el-button>
            <el-button @click="resetKw">重置</el-button>
          </div>
        </div>
        <div class="table-wrap rec-table">
          <el-table
            :data="pageRows"
            row-key="id"
            height="100%"
            class="ys-table"
            empty-text="请先选择数据集"
            @selection-change="onRecSel"
          >
            <el-table-column type="selection" width="42" align="center" />
            <el-table-column type="index" label="序号" width="64" align="center" :index="indexMethod" />
            <el-table-column prop="name" label="设备名称" min-width="120" />
            <el-table-column prop="model" label="设备型号" min-width="110" />
            <el-table-column prop="factory" label="生产厂家" min-width="140" />
            <el-table-column prop="use" label="主要用途" min-width="160" show-overflow-tooltip />
          </el-table>
        </div>
        <div class="rec-foot">
          <span>已选择 <b>{{ selectedRecs.length }}</b> 项，共 <b>{{ filteredRecs.length }}</b> 项</span>
          <el-pagination
            v-model:current-page="pageNo"
            v-model:page-size="pageSize"
            :page-sizes="[5, 10, 20]"
            :total="filteredRecs.length"
            layout="prev, pager, next, sizes"
            background
            small
          />
        </div>
      </section>

      <section class="sec-frame preview-panel">
        <h3><em>4</em>解析文本预览</h3>
        <div class="preview-cap">
          <span>解析后文本示例</span>
          <a class="switch-rec" @click="switchRecord">
            <el-icon><Sort /></el-icon>
            切换记录
          </a>
        </div>
        <div v-if="previewText" class="preview-box">{{ previewText }}</div>
        <div v-else class="preview-empty">请选择记录后预览解析文本</div>
        <div class="preview-foot">
          <span>预览第 <b>{{ previewIdx + 1 }}</b> 条记录，共 <b>{{ previewList.length }}</b> 条</span>
          <div class="preview-pager">
            <button type="button" class="pg-btn" :disabled="previewIdx <= 0" @click="onPreviewPage(previewIdx)">‹</button>
            <template v-for="(item, i) in previewPagers" :key="i">
              <span v-if="item === '...'" class="pg-more">...</span>
              <button
                v-else
                type="button"
                class="pg-btn"
                :class="{ on: item === previewIdx + 1 }"
                @click="onPreviewPage(item)"
              >{{ item }}</button>
            </template>
            <button type="button" class="pg-btn" :disabled="previewIdx >= previewList.length - 1" @click="onPreviewPage(previewIdx + 2)">›</button>
          </div>
        </div>
        <div class="panel-actions">
          <el-button @click="saveParse">保存解析结果</el-button>
          <el-button type="primary" @click="startParse">开始解析</el-button>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import { computed, reactive, ref, watch } from 'vue'
import { Search, Sort, Warning } from '@element-plus/icons-vue'
import { useUi } from '@/composables/ui'
import SelectField from '@/components/SelectField.vue'
import TextAreaField from '@/components/TextAreaField.vue'

const DATASETS = [
  {
    id: 'eq-dev',
    name: '试验设备资源数据集',
    resType: '试验设备',
    source: '试验资源结构化处理',
    desc: '包含试验设备的基本信息、技术参数、使用条件等结构化数据。',
    total: 258,
    fields: [
      { key: 'name', name: '设备名称', type: '文本', sample: '高速数据采集仪' },
      { key: 'model', name: '设备型号', type: '文本', sample: 'HS-DAQ-2000' },
      { key: 'factory', name: '生产厂家', type: '文本', sample: '航天测控技术有限公司' },
      { key: 'use', name: '主要用途', type: '文本', sample: '用于飞行器结构载荷测试' },
      { key: 'range', name: '测量范围', type: '文本', sample: '0～5000g' },
      { key: 'acc', name: '精度等级', type: '文本', sample: '0.5级' },
    ],
    records: [
      { id: 1, name: '高速数据采集仪', model: 'HS-DAQ-2000', factory: '航天测控技术有限公司', use: '用于飞行器结构载荷测试', range: '0～5000g', acc: '0.5级' },
      { id: 2, name: '高低温试验箱', model: 'GDW-1000', factory: '中航试验设备厂', use: '模拟高低温环境试验', range: '-70～150℃', acc: '1.0级' },
      { id: 3, name: '振动试验台', model: 'ZDP-300', factory: '航天测控技术有限公司', use: '用于产品振动环境试验', range: '5～2000Hz', acc: '1.0级' },
      { id: 4, name: '压力测试系统', model: 'PTS-500', factory: '航天测控技术有限公司', use: '用于压力传感器校准测试', range: '0～50MPa', acc: '0.2级' },
      { id: 5, name: '多通道信号发生器', model: 'MSG-800', factory: '电子科技仪器公司', use: '提供多通道激励信号', range: '1Hz～10MHz', acc: '0.5级' },
      { id: 6, name: '噪声频谱仪', model: 'NSA-100', factory: '电子科技仪器公司', use: '耳旁噪声与频谱分析', range: '20Hz～20kHz', acc: '1级' },
      { id: 7, name: '电涡流测功机', model: 'DW-250', factory: '中航试验设备厂', use: 'PTO功率测量', range: '0～250kW', acc: '0.5级' },
      { id: 8, name: '盐雾试验箱', model: 'YF-600', factory: '中航试验设备厂', use: '盐雾腐蚀环境试验', range: '35℃恒定', acc: '—' },
    ],
  },
  {
    id: 'eq-param',
    name: '试验参数结构化数据集',
    resType: '试验参数',
    source: '试验资源结构化处理',
    desc: '包含试验参数名称、代号、采集设备及用途等结构化数据。',
    total: 86,
    fields: [
      { key: 'name', name: '参数名称', type: '文本', sample: '牵引力' },
      { key: 'model', name: '参数代号', type: '文本', sample: 'F-T' },
      { key: 'factory', name: '采集设备', type: '文本', sample: 'HS-DAQ-2000' },
      { key: 'use', name: '用途说明', type: '文本', sample: '牵引性能评定' },
    ],
    records: [
      { id: 1, name: '牵引力', model: 'F-T', factory: 'HS-DAQ-2000', use: '牵引性能评定' },
      { id: 2, name: '滑转率', model: 'δ', factory: 'HS-DAQ-2000', use: '附着性能分析' },
    ],
  },
]

export default {
  name: 'VectorParsePage',
  components: { SelectField, TextAreaField, Warning, Search, Sort },
  props: { title: String, page: Object },
  setup() {
    const { toast } = useUi()
    const form = reactive({ dsId: '', resType: '', source: '' })
    const cfg = reactive({ tpl: '', sep: '', empty: '', extra: '', clean: false })
    const kwDraft = ref('')
    const kw = ref('')
    const pageNo = ref(1)
    const pageSize = ref(5)
    const previewIdx = ref(0)
    const selectedFields = ref([])
    const selectedRecs = ref([])

    const dsOpts = DATASETS.map((d) => ({ value: d.id, label: d.name }))
    const resTypeOpts = ['试验设备', '试验参数']
    const sourceOpts = ['试验资源结构化处理', '试验资源智能提取']
    const tplOpts = ['默认模板（字段名+字段值）', '仅字段值', '字段名=字段值']
    const sepOpts = ['；（分号）', '，（逗号）', '空格', '换行']
    const emptyOpts = ['忽略该字段', '填入空字符串', '填入N/A']

    const currentDs = computed(() => DATASETS.find((d) => d.id === form.dsId) || null)
    const fields = computed(() => currentDs.value?.fields || [])
    const records = computed(() => currentDs.value?.records || [])
    const filteredRecs = computed(() => {
      const k = kw.value.trim()
      if (!k) return records.value
      return records.value.filter((r) => `${r.name}${r.model}${r.factory}`.includes(k))
    })
    const pageRows = computed(() => {
      const start = (pageNo.value - 1) * pageSize.value
      return filteredRecs.value.slice(start, start + pageSize.value)
    })

    const sepChar = computed(() => {
      if (cfg.sep.includes('逗号')) return '，'
      if (cfg.sep.includes('空格')) return ' '
      if (cfg.sep.includes('换行')) return '\n'
      return '；'
    })

    const parseFields = computed(() => (selectedFields.value.length ? selectedFields.value : fields.value))

    function buildText(row) {
      if (!parseFields.value.length || !row) return ''
      const parts = []
      parseFields.value.forEach((f) => {
        let val = row[f.key]
        if (val == null || String(val).trim() === '') {
          if (cfg.empty === '填入空字符串') val = ''
          else if (cfg.empty === '填入N/A') val = 'N/A'
          else return
        }
        let chunk
        if (cfg.tpl === '仅字段值') chunk = String(val)
        else if (cfg.tpl.includes('=')) chunk = `${f.name}=${val}`
        else chunk = `${f.name}：${val}`
        parts.push(chunk)
      })
      let text = parts.join(sepChar.value)
      if (cfg.extra?.trim()) text = `${text}${sepChar.value}${cfg.extra.trim()}`
      if (cfg.clean) text = text.replace(/\s+/g, ' ').trim()
      return text
    }

    const previewList = computed(() => selectedRecs.value.map((r) => ({ ...r, text: buildText(r) })).filter((r) => r.text))
    const previewText = computed(() => previewList.value[previewIdx.value]?.text || '')

    watch(() => form.dsId, (id) => {
      const ds = DATASETS.find((d) => d.id === id)
      form.resType = ds?.resType || ''
      form.source = ds?.source || ''
      selectedFields.value = []
      selectedRecs.value = []
      pageNo.value = 1
      previewIdx.value = 0
      kwDraft.value = ''
      kw.value = ''
    })
    watch(previewList, (list) => {
      if (previewIdx.value >= list.length) previewIdx.value = 0
    })

    function onFieldSel(rows) { selectedFields.value = rows }
    function onRecSel(rows) {
      const ids = new Set(pageRows.value.map((r) => r.id))
      const keep = selectedRecs.value.filter((r) => !ids.has(r.id))
      selectedRecs.value = [...keep, ...rows]
    }
    function indexMethod(i) { return (pageNo.value - 1) * pageSize.value + i + 1 }
    function applyKw() { kw.value = kwDraft.value; pageNo.value = 1 }
    function resetKw() { kwDraft.value = ''; kw.value = ''; pageNo.value = 1 }
    const previewPagers = computed(() => {
      const n = previewList.value.length
      const cur = previewIdx.value + 1
      if (n <= 3) return Array.from({ length: Math.max(n, 0) }, (_, i) => i + 1)
      if (cur <= 2) return [1, 2, '...']
      if (cur >= n - 1) return ['...', n - 1, n]
      return ['...', cur, '...']
    })
    function onPreviewPage(p) { previewIdx.value = Math.max(0, (p || 1) - 1) }
    function switchRecord() {
      if (!previewList.value.length) { toast('请先选择记录'); return }
      previewIdx.value = (previewIdx.value + 1) % previewList.value.length
    }
    function saveParse() {
      if (!previewList.value.length) { toast('请先选择字段和记录'); return }
      toast('解析结果已保存')
    }
    function startParse() {
      if (!form.dsId) { toast('请先选择数据集'); return }
      if (!parseFields.value.length) { toast('请至少选择 1 个字段'); return }
      if (!selectedRecs.value.length) { toast('请至少选择 1 条记录'); return }
      toast('已开始向量化解析')
    }

    return {
      Search, Warning, Sort,
      form, cfg, currentDs, kwDraft, pageNo, pageSize, previewIdx,
      dsOpts, resTypeOpts, sourceOpts, tplOpts, sepOpts, emptyOpts,
      fields, filteredRecs, pageRows, selectedRecs,
      previewList, previewText, previewPagers,
      onFieldSel, onRecSel, indexMethod, applyKw, resetKw,
      onPreviewPage, switchRecord, saveParse, startParse,
    }
  },
}
</script>

<style scoped>
.vec-parse {
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

.top-grid {
  display: grid;
  grid-template-columns: 0.92fr 1.58fr;
  gap: 14px;
  align-items: stretch;
}
.bottom-grid {
  display: grid;
  grid-template-columns: 1.9fr 0.7fr;
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
.sec-frame h3 em {
  width: 22px; height: 22px; border-radius: 4px;
  background: var(--blue); color: #fff;
  font-size: 13px; font-style: normal; font-weight: 700;
  display: inline-flex; align-items: center; justify-content: center; line-height: 1;
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
  position: relative;
}
.info-form :deep(.el-form-item.is-required:not(.is-no-asterisk) > .el-form-item__label::before) {
  content: none !important; margin: 0 !important;
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
.info-form :deep(.el-form-item__content) { flex: 1; min-width: 0; }
.ta-item :deep(.el-form-item__label) { align-self: start; }
.info-form :deep(.el-textarea__inner) { min-height: 72px; }
.ds-desc {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-top: 16px;
  padding: 10px 12px;
  border-radius: 8px;
  background: #e8f2fb;
  font-size: 13.5px;
  line-height: 1.7;
  color: #3f5062;
}
.ds-desc-lab {
  flex: 0 0 6.2em;
  color: #4a5a6a;
  white-space: nowrap;
  line-height: 1.7;
}
.ds-desc-txt { flex: 1; min-width: 0; }
.ds-desc b { color: #1668a8; font-weight: 700; }
.info-form :deep(.el-input__inner::placeholder),
.info-form :deep(.el-textarea__inner::placeholder) { color: #a8b8c6 !important; opacity: 1; }
.cfg-form :deep(.stack-ta) {
  display: flex;
  flex-direction: column;
  align-items: stretch;
}
.cfg-form :deep(.stack-ta .el-form-item__label) {
  width: auto !important;
  height: auto !important;
  line-height: 1.4 !important;
  justify-content: flex-start;
  padding: 0 0 8px !important;
}
.cfg-form :deep(.stack-ta .el-form-item__content) {
  margin-left: 0 !important;
}
.clean-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
}
.hint-ico {
  color: #8a99a8;
  font-size: 15px;
  cursor: help;
}

.sec2-split {
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
  gap: 14px;
  min-height: 0;
  flex: 1;
}
.sub-title {
  font-size: 13.5px;
  color: #0d4e83;
  font-weight: 600;
  margin-bottom: 8px;
}
.sub-title span { color: #8a99a8; font-weight: 400; font-size: 12.5px; margin-left: 6px; }
.field-block, .cfg-block { min-width: 0; display: flex; flex-direction: column; overflow: hidden; }
.cfg-form :deep(.el-checkbox) { margin-top: 4px; color: #3f5062; }

.table-wrap {
  flex: 1 1 auto;
  min-height: 180px;
  border: 1px solid #e2ebf3;
  border-radius: 8px;
  overflow: hidden;
}
.field-table { height: 228px; min-height: 228px; }
.rec-table { height: 240px; min-height: 240px; }
.ys-table { width: 100%; }
.ys-table :deep(.el-table__inner-wrapper::before) { display: none; }
.ys-table :deep(.el-table__header th) { background: #f4f9fd; color: #4a5a6a; font-weight: 600; }
.ys-table :deep(.el-table__header .el-table__cell),
.ys-table :deep(.el-table__body .el-table__cell) {
  padding: 8px 10px; font-size: 13.5px; color: #3f5062; white-space: nowrap;
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

.rec-head {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 16px;
  margin-bottom: 12px;
}
.rec-head h3 { margin-bottom: 0; flex: 0 0 auto; }
.rec-search { display: flex; align-items: center; gap: 8px; min-width: 0; flex: 1; }
.rec-search :deep(.el-input) { width: 280px; max-width: 100%; }
.rec-search :deep(.el-button + .el-button) { margin-left: 0; }
.rec-search :deep(.el-button--primary),
.rec-search :deep(.el-button--primary > span),
.panel-actions :deep(.el-button--primary),
.panel-actions :deep(.el-button--primary > span) { color: #fff !important; }
.rec-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-top: 10px;
  font-size: 13px;
  color: #6d8092;
}
.rec-foot b { color: #0d4e83; }

.preview-cap {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 13.5px;
  color: #3f5062;
}
.preview-cap a { color: #1668a8; cursor: pointer; }
.preview-cap a:hover { text-decoration: underline; }
.switch-rec {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 13.5px;
}
.switch-rec .el-icon { font-size: 15px; transform: rotate(90deg); }
.preview-box, .preview-empty {
  flex: 1 1 auto;
  min-height: 140px;
  border: 1px solid #e2ebf3;
  border-radius: 8px;
  background: #f7fbfe;
  padding: 12px 14px;
  font-size: 13.5px;
  line-height: 1.75;
  color: #3f5062;
}
.preview-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8a99a8;
}
.preview-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  margin-top: 10px;
  font-size: 13px;
  color: #6d8092;
  flex-wrap: nowrap;
  min-width: 0;
}
.preview-foot > span {
  flex: 1 1 auto;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.preview-foot b { color: #0d4e83; }
.preview-pager {
  display: inline-flex;
  align-items: center;
  flex: 0 0 auto;
  white-space: nowrap;
}
.pg-btn {
  min-width: 22px;
  height: 22px;
  padding: 0 4px;
  border: none;
  background: transparent;
  color: #606266;
  font-size: 13px;
  line-height: 22px;
  cursor: pointer;
  border-radius: 2px;
}
.pg-btn:hover:not(:disabled) { color: #1668a8; }
.pg-btn:disabled { color: #c0c4cc; cursor: not-allowed; }
.pg-btn.on { color: #1668a8; font-weight: 700; }
.pg-more {
  min-width: 22px;
  padding: 0 2px;
  color: #a8b8c6;
  font-size: 13px;
  line-height: 22px;
  letter-spacing: 1px;
}
.panel-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 12px;
}
.panel-actions :deep(.el-button + .el-button) { margin-left: 0; }

@media (max-width: 1280px) {
  .top-grid, .bottom-grid, .sec2-split { grid-template-columns: 1fr; }
}
</style>
