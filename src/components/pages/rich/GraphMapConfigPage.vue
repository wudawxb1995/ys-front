<template>
  <div class="graph-map">
    <div class="entry-title">
      <h2>{{ title || '结构化资源图谱映射' }}</h2>
      <p>选择结构化试验资源数据集，查看设备和参数源字段，配置字段至实体类型、实体属性和关系的映射，将结构化资源数据转化为知识图谱实体与关系。</p>
    </div>

    <div class="top-grid">
      <section class="sec-frame">
        <h3><em>1</em>选择结构化试验资源数据集</h3>
        <el-form
          label-width="6.2em"
          label-position="right"
          require-asterisk-position="right"
          class="info-form"
          @submit.prevent
        >
          <el-form-item label="数据源名称" required>
            <select-field
              v-model="form.sourceId"
              :options="sourceOpts"
              placeholder="请选择结构化资源数据集"
              clearable
            />
          </el-form-item>
          <el-form-item label="数据模型">
            <select-field
              v-model="form.model"
              :options="modelOpts"
              placeholder="请选择数据模型"
              clearable
            />
          </el-form-item>
          <el-form-item label="数据版本">
            <el-input v-model="form.version" placeholder="选择数据源后自动带出" disabled />
          </el-form-item>
          <el-form-item label="数据描述" class="ta-item">
            <text-area-field
              v-model="form.desc"
              :rows="3"
              :maxlength="200"
              placeholder="请输入或补充该数据集的说明"
            />
          </el-form-item>
        </el-form>
      </section>

      <section class="sec-frame field-panel">
        <h3><em>2</em>查看源数据字段</h3>
        <div class="sub-tabs">
          <button type="button" :class="{ on: fieldTab === 'device' }" @click="fieldTab = 'device'">试验设备字段</button>
          <button type="button" :class="{ on: fieldTab === 'param' }" @click="fieldTab = 'param'">试验参数字段</button>
        </div>
        <div class="table-wrap field-table">
          <el-table
            ref="fieldTableRef"
            :data="currentFields"
            height="100%"
            table-layout="auto"
            class="ys-table"
            empty-text="请先选择数据源"
            @selection-change="onFieldSelect"
            @row-click="onFieldRowClick"
          >
            <el-table-column type="selection" width="42" align="center" />
            <el-table-column prop="name" label="字段名称" min-width="96" show-overflow-tooltip />
            <el-table-column prop="type" label="字段类型" min-width="88" />
            <el-table-column prop="sample" label="示例值" min-width="120" show-overflow-tooltip />
          </el-table>
        </div>
      </section>

      <section class="sec-frame map-form-panel">
        <h3><em>3</em>配置字段映射</h3>
        <el-form
          label-width="5.5em"
          label-position="right"
          require-asterisk-position="right"
          class="info-form"
          @submit.prevent
        >
          <el-form-item label="实体类型" required>
            <select-field v-model="mapForm.entityType" :options="entityOpts" placeholder="请选择实体类型" />
          </el-form-item>
          <el-form-item label="源字段" required>
            <select-field v-model="mapForm.sourceField" :options="sourceFieldOpts" placeholder="请选择源字段" />
          </el-form-item>
          <el-form-item label="映射类型" required>
            <select-field v-model="mapForm.mapType" :options="mapTypeOpts" placeholder="请选择映射类型" />
          </el-form-item>
          <el-form-item :label="mapForm.mapType === '关系' ? '关系名称' : '属性名称'" required>
            <select-field
              v-model="mapForm.attrName"
              :options="attrOpts"
              :placeholder="mapForm.mapType === '关系' ? '请选择关系名称' : '请选择属性名称'"
            />
          </el-form-item>
        </el-form>
        <div class="add-row">
          <el-button @click="addRule">+ 添加映射规则</el-button>
        </div>
        <div class="panel-actions">
          <el-button class="pair-btn" @click="resetMapForm">重置</el-button>
          <el-button class="pair-btn" type="primary" @click="saveConfig">保存映射配置</el-button>
        </div>
      </section>
    </div>

    <div class="bottom-grid">
      <section class="sec-frame rules-panel">
        <h3><em>4</em>映射规则配置</h3>
        <div class="table-wrap rules-table">
          <el-table :data="rules" height="100%" table-layout="auto" class="ys-table" empty-text="暂无映射规则，请在右侧配置后添加">
            <el-table-column prop="sourceField" label="源字段名称" min-width="110" show-overflow-tooltip />
            <el-table-column prop="fieldType" label="字段类型" min-width="88" />
            <el-table-column prop="mapType" label="映射类型" min-width="88" />
            <el-table-column prop="entityType" label="目标实体类型" min-width="120" />
            <el-table-column label="目标属性/关系" min-width="200" show-overflow-tooltip>
              <template #default="{ row }">{{ targetCell(row) }}</template>
            </el-table-column>
            <el-table-column label="操作" width="112" align="center" fixed="right">
              <template #default="{ row }">
                <span class="ops">
                  <a @click="editRule(row)">编辑</a>
                  <a class="danger" @click="removeRule(row)">删除</a>
                </span>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </section>

      <section class="sec-frame preview-panel">
        <h3><em>5</em>映射预览</h3>
        <div class="sub-tabs">
          <button type="button" :class="{ on: previewTab === 'entity' }" @click="previewTab = 'entity'">实体映射预览</button>
          <button type="button" :class="{ on: previewTab === 'rel' }" @click="previewTab = 'rel'">关系映射预览</button>
        </div>
        <div v-if="rules.length" class="preview-body">
          <div class="ent-card">
            <div class="ent-head">
              <span class="ent-ico cube" aria-hidden="true">
                <svg viewBox="0 0 32 32" fill="none">
                  <path d="M16 5 6 10.5v11L16 27l10-5.5v-11L16 5z" stroke="#1668a8" stroke-width="1.8"/>
                  <path d="M16 5v11M6 10.5 16 16l10-5.5" stroke="#1668a8" stroke-width="1.8"/>
                </svg>
              </span>
              <div>
                <b>试验设备</b>
                <em>（实体）</em>
              </div>
            </div>
            <ul>
              <li v-for="item in devicePreview" :key="item.name">
                <span>{{ item.name }}：</span>{{ item.sample }}
              </li>
              <li v-if="!devicePreview.length" class="muted">暂无实体属性映射</li>
            </ul>
          </div>
          <div class="rel-mid">
            <span>{{ relationLabel }}</span>
            <i></i>
          </div>
          <div class="ent-card param">
            <div class="ent-head">
              <span class="ent-ico chart" aria-hidden="true">
                <svg viewBox="0 0 32 32" fill="none">
                  <path d="M6 24V10M13 24V6M20 24v-8M27 24V12" stroke="#22913c" stroke-width="2.2" stroke-linecap="round"/>
                </svg>
              </span>
              <div>
                <b>试验参数</b>
                <em>（实体）</em>
              </div>
            </div>
            <ul>
              <li v-for="item in paramPreview" :key="item.name">
                <span>{{ item.name }}：</span>{{ item.sample }}
              </li>
              <li v-if="!paramPreview.length" class="muted">暂无实体属性映射</li>
            </ul>
          </div>
        </div>
        <div v-else class="preview-empty">添加映射规则后可预览实体与关系</div>
        <div class="panel-actions">
          <el-button type="primary" @click="startMap">开始映射</el-button>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import { computed, reactive, ref, watch } from 'vue'
import { useUi } from '@/composables/ui'
import SelectField from '@/components/SelectField.vue'
import TextAreaField from '@/components/TextAreaField.vue'

const DATASETS = [
  {
    id: 'eq-struct',
    name: '鉴定试验结构化资源',
    model: '试验设备及参数模型',
    version: 'v1.0',
    desc: '',
    deviceFields: [
      { name: '设备编号', type: '字符串', sample: 'EQ-202310001' },
      { name: '设备名称', type: '字符串', sample: '高精度试验台架' },
      { name: '设备型号', type: '字符串', sample: 'GDWY-100' },
      { name: '生产厂家', type: '字符串', sample: '某某测控仪器有限公司' },
      { name: '设备类型', type: '字符串', sample: '环境模拟设备' },
      { name: '技术指标', type: '字符串', sample: '-40℃～150℃' },
      { name: '所属专业', type: '字符串', sample: '环境试验' },
    ],
    paramFields: [
      { name: '试验参数名称', type: '字符串', sample: '牵引力' },
      { name: '参数数值', type: '数值', sample: '300' },
      { name: '参数单位', type: '字符串', sample: 'kN' },
      { name: '参数类型', type: '字符串', sample: '力学性能' },
      { name: '采集频率', type: '字符串', sample: '100Hz' },
    ],
  },
  {
    id: 'dyno-struct',
    name: '动力输出试验结构化资源',
    model: '试验设备及参数模型',
    version: 'v1.2',
    desc: '',
    deviceFields: [
      { name: '设备编号', type: '字符串', sample: 'DY-202401018' },
      { name: '设备名称', type: '字符串', sample: '电力测功机' },
      { name: '设备型号', type: '字符串', sample: 'DW-250' },
      { name: '生产厂家', type: '字符串', sample: '某某测控仪器有限公司' },
      { name: '设备类型', type: '字符串', sample: '动力测试设备' },
    ],
    paramFields: [
      { name: '试验参数名称', type: '字符串', sample: '输出功率' },
      { name: '参数数值', type: '数值', sample: '88.6' },
      { name: '参数单位', type: '字符串', sample: 'kW' },
    ],
  },
]

export default {
  name: 'GraphMapConfigPage',
  components: { SelectField, TextAreaField },
  props: { title: String, page: Object },
  setup() {
    const { toast, confirm } = useUi()
    const fieldTableRef = ref(null)
    const fieldTab = ref('device')
    const previewTab = ref('entity')
    const editingId = ref('')
    const rules = ref([])

    const form = reactive({
      sourceId: '',
      model: '',
      version: '',
      desc: '',
    })
    const mapForm = reactive({
      entityType: '',
      sourceField: '',
      mapType: '',
      attrName: '',
    })

    const currentDs = computed(() => DATASETS.find((d) => d.id === form.sourceId) || null)
    const currentFields = computed(() => {
      if (!currentDs.value) return []
      return fieldTab.value === 'param' ? currentDs.value.paramFields : currentDs.value.deviceFields
    })
    const allFields = computed(() => {
      if (!currentDs.value) return []
      return [...currentDs.value.deviceFields, ...currentDs.value.paramFields]
    })
    const sourceOpts = DATASETS.map((d) => ({ value: d.id, label: d.name }))
    const modelOpts = computed(() => {
      const set = new Set(DATASETS.map((d) => d.model))
      return [...set]
    })
    const entityOpts = ['试验设备', '试验参数']
    const mapTypeOpts = ['实体属性', '关系']
    const sourceFieldOpts = computed(() => allFields.value.map((f) => f.name))
    const attrOpts = computed(() => {
      if (mapForm.mapType === '关系') return ['具有参数', '属于试验', '使用设备']
      const names = allFields.value.map((f) => f.name)
      return names.length ? names : ['设备名称', '设备编号']
    })

    const fieldByName = (name) => allFields.value.find((f) => f.name === name)

    const devicePreview = computed(() => {
      const names = rules.value
        .filter((r) => r.entityType === '试验设备' && r.mapType === '实体属性')
        .map((r) => r.attrName)
      const uniq = [...new Set(names)]
      return uniq.map((name) => fieldByName(name) || { name, sample: '—' })
    })
    const paramPreview = computed(() => {
      const names = rules.value
        .filter((r) => r.entityType === '试验参数' && r.mapType === '实体属性')
        .map((r) => r.attrName)
      const uniq = [...new Set(names)]
      return uniq.map((name) => fieldByName(name) || { name, sample: '—' })
    })
    const relationLabel = computed(() => {
      const rel = rules.value.find((r) => r.mapType === '关系')
      return rel?.attrName || '具有参数'
    })

    watch(() => form.sourceId, (id) => {
      const ds = DATASETS.find((d) => d.id === id)
      form.model = ds?.model || ''
      form.version = ds?.version || ''
      form.desc = ''
      fieldTab.value = 'device'
      rules.value = []
      resetMapForm()
    })

    function onFieldSelect(rows) {
      if (rows?.length) mapForm.sourceField = rows[rows.length - 1].name
    }
    function onFieldRowClick(row) {
      mapForm.sourceField = row.name
    }

    function targetCell(row) {
      if (row.mapType === '关系') {
        const other = row.entityType === '试验设备' ? '试验参数' : '试验设备'
        return `${row.entityType} → ${row.attrName} → ${other}`
      }
      return row.attrName
    }

    function validateMap() {
      if (!form.sourceId) {
        toast('请先选择数据源')
        return false
      }
      if (!mapForm.entityType || !mapForm.sourceField || !mapForm.mapType || !mapForm.attrName) {
        toast('请完整填写字段映射')
        return false
      }
      return true
    }

    function addRule() {
      if (!validateMap()) return
      const field = fieldByName(mapForm.sourceField)
      const payload = {
        id: editingId.value || `r-${Date.now()}`,
        sourceField: mapForm.sourceField,
        fieldType: field?.type || '字符串',
        mapType: mapForm.mapType,
        entityType: mapForm.entityType,
        attrName: mapForm.attrName,
      }
      const idx = rules.value.findIndex((r) => r.id === payload.id)
      if (idx >= 0) rules.value.splice(idx, 1, payload)
      else {
        const dup = rules.value.some(
          (r) => r.sourceField === payload.sourceField && r.mapType === payload.mapType && r.entityType === payload.entityType,
        )
        if (dup) {
          toast('该源字段已存在相同映射')
          return
        }
        rules.value.push(payload)
      }
      editingId.value = ''
      toast(idx >= 0 ? '映射规则已更新' : '已添加映射规则')
      resetMapForm()
    }

    function editRule(row) {
      editingId.value = row.id
      mapForm.entityType = row.entityType
      mapForm.sourceField = row.sourceField
      mapForm.mapType = row.mapType
      mapForm.attrName = row.attrName
    }

    function removeRule(row) {
      confirm(`确认删除源字段「${row.sourceField}」的映射规则？`, () => {
        rules.value = rules.value.filter((r) => r.id !== row.id)
        if (editingId.value === row.id) {
          editingId.value = ''
          resetMapForm()
        }
        toast('映射规则已删除')
      })
    }

    function resetMapForm() {
      editingId.value = ''
      mapForm.entityType = ''
      mapForm.sourceField = ''
      mapForm.mapType = ''
      mapForm.attrName = ''
    }

    function saveConfig() {
      if (!form.sourceId) {
        toast('请先选择数据源')
        return
      }
      if (!rules.value.length) {
        toast('请至少添加一条映射规则')
        return
      }
      toast('映射配置已保存')
    }

    function startMap() {
      if (!rules.value.length) {
        toast('请先添加映射规则')
        return
      }
      toast('已开始按当前规则执行图谱映射')
    }

    return {
      form,
      mapForm,
      fieldTab,
      previewTab,
      fieldTableRef,
      currentFields,
      rules,
      sourceOpts,
      modelOpts,
      entityOpts,
      mapTypeOpts,
      sourceFieldOpts,
      attrOpts,
      devicePreview,
      paramPreview,
      relationLabel,
      onFieldSelect,
      onFieldRowClick,
      targetCell,
      addRule,
      editRule,
      removeRule,
      resetMapForm,
      saveConfig,
      startMap,
    }
  },
}
</script>

<style scoped>
.graph-map {
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
  grid-template-columns: 1.05fr 1.2fr 0.95fr;
  gap: 14px;
  align-items: stretch;
}
.bottom-grid {
  display: grid;
  grid-template-columns: 1.45fr 1fr;
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
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--blue);
  color: #fff;
  font-size: 13px;
  font-style: normal;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.info-form :deep(.el-form-item) { margin-bottom: 12px; }
.info-form :deep(.el-form-item:last-child) { margin-bottom: 0; }
.info-form :deep(.el-form-item__label) {
  display: inline-flex !important;
  align-items: center;
  justify-content: flex-start;
  align-self: start;
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
  content: none !important;
  margin: 0 !important;
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
.info-form :deep(.el-input__inner),
.info-form :deep(.el-textarea__inner) { color: #3f5062; }
.info-form :deep(.el-input__inner::placeholder),
.info-form :deep(.el-textarea__inner::placeholder) { color: #a8b8c6 !important; opacity: 1; }
.ta-item :deep(.el-form-item__label) { align-self: start; }
.info-form :deep(.el-form-item__content) { flex: 1; min-width: 0; }
.info-form :deep(.el-textarea__inner) {
  min-height: 72px;
}

.sub-tabs {
  display: flex;
  gap: 18px;
  border-bottom: 1px solid #e6eef6;
  margin-bottom: 10px;
  flex: 0 0 auto;
}
.sub-tabs button {
  border: 0;
  background: transparent;
  padding: 0 0 8px;
  color: #6d8092;
  font-size: 13.5px;
  cursor: pointer;
  position: relative;
}
.sub-tabs button.on {
  color: #1668a8;
  font-weight: 600;
}
.sub-tabs button.on::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -1px;
  height: 2px;
  background: #1668a8;
  border-radius: 2px;
}

.field-panel,
.rules-panel,
.preview-panel,
.map-form-panel { min-height: 0; }
.table-wrap {
  flex: 1 1 auto;
  min-height: 220px;
  height: 220px;
  border: 1px solid #e2ebf3;
  border-radius: 8px;
  overflow: hidden;
}
.field-table { min-height: 248px; height: 248px; }
.rules-table { min-height: 248px; height: 248px; }
.ys-table { width: 100%; }
.ys-table :deep(.el-table__inner-wrapper::before) { display: none; }
.ys-table :deep(.el-table__header th) {
  background: #f4f9fd;
  color: #4a5a6a;
  font-weight: 600;
  overflow: visible;
}
.ys-table :deep(.el-table__cell) {
  padding: 8px 10px;
  font-size: 13.5px;
  color: #3f5062;
}
.ys-table :deep(.el-table__header .el-table__cell .cell) {
  white-space: nowrap !important;
  overflow: visible !important;
  text-overflow: clip !important;
  word-break: keep-all;
  line-height: 1.4;
}
.ys-table :deep(.el-table__body .cell) {
  white-space: nowrap;
  line-height: 1.4;
}

.map-form-panel .info-form { flex: 1 1 auto; }
.add-row {
  display: flex;
  justify-content: center;
  margin: 8px 0 16px;
}
.panel-actions {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: auto;
  padding-top: 4px;
  flex: 0 0 auto;
}
.map-form-panel .panel-actions .pair-btn {
  width: 128px;
  min-width: 128px;
}
.preview-panel .panel-actions {
  justify-content: flex-end;
}
.panel-actions :deep(.el-button + .el-button),
.add-row :deep(.el-button + .el-button) { margin-left: 0; }
.panel-actions :deep(.el-button--primary),
.panel-actions :deep(.el-button--primary > span) { color: #ffffff !important; }

.ops {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}
.ops a { color: #1668a8; font-size: 13.5px; cursor: pointer; }
.ops a:hover { color: #0d4e83; text-decoration: underline; }
.ops a.danger { color: #d4380d; }
.ops a.danger:hover { color: #b02a08; }

.preview-body {
  flex: 1 1 auto;
  min-height: 220px;
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  gap: 10px;
  padding: 8px 4px 4px;
}
.preview-empty {
  flex: 1 1 auto;
  min-height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8a99a8;
  font-size: 13.5px;
  background: #f7fbfe;
  border-radius: 8px;
}
.ent-card {
  flex: 1 1 0;
  min-width: 0;
  border: 1px solid #d6e8f6;
  border-radius: 10px;
  background: linear-gradient(180deg, #f7fbfe, #fff);
  padding: 12px 12px 10px;
}
.ent-card.param { border-color: #cfe8d6; background: linear-gradient(180deg, #f4fbf6, #fff); }
.ent-head { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.ent-head b { color: #0d4e83; font-size: 14px; }
.ent-card.param .ent-head b { color: #1b7a36; }
.ent-head em { color: #8a99a8; font-size: 12px; font-style: normal; margin-left: 4px; }
.ent-ico {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #e8f2fb;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.ent-ico.chart { background: #e8f6ec; }
.ent-ico svg { width: 20px; height: 20px; }
.ent-card ul { margin: 0; padding: 0; list-style: none; }
.ent-card li {
  font-size: 12.5px;
  color: #3f5062;
  line-height: 1.7;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.ent-card li span { color: #6d8092; }
.ent-card li.muted { color: #8a99a8; }
.rel-mid {
  flex: 0 0 72px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: #1668a8;
  font-size: 12.5px;
  font-weight: 600;
  white-space: nowrap;
}
.rel-mid i {
  width: 42px;
  height: 2px;
  background: #3d9adf;
  position: relative;
  display: block;
}
.rel-mid i::after {
  content: '';
  position: absolute;
  right: -1px;
  top: -4px;
  border: 5px solid transparent;
  border-left-color: #3d9adf;
  border-right: 0;
}

@media (max-width: 1280px) {
  .top-grid, .bottom-grid { grid-template-columns: 1fr; }
}
</style>
