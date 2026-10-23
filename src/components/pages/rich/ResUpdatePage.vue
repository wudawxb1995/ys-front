<template>
  <div class="res-up">
    <div class="entry-title">
      <h2>{{ title || '试验资源更新' }}</h2>
      <p>支持对已有试验资源信息进行查询和更新，维护资源的基础信息及相关内容，确保试验资源数据与实际情况保持一致。</p>
    </div>

    <div class="page-split">
      <div class="left-col">
        <section class="sec-frame">
          <h3><i></i>资源查询</h3>
          <el-form
            label-width="5.5em"
            label-position="right"
            class="info-form"
            @submit.prevent="applyQuery"
          >
            <div class="duo">
              <el-form-item label="资源名称">
                <el-input v-model="query.name" placeholder="请输入资源名称" clearable />
              </el-form-item>
              <el-form-item label="资源类型">
                <select-field v-model="query.type" :options="typeOpts" placeholder="请选择资源类型" clearable />
              </el-form-item>
            </div>
            <div class="duo">
              <el-form-item label="所属专业">
                <select-field v-model="query.major" :options="majorOpts" placeholder="请选择所属专业" clearable />
              </el-form-item>
              <el-form-item label="状态">
                <select-field v-model="query.status" :options="statusOpts" placeholder="请选择资源状态" clearable />
              </el-form-item>
            </div>
            <el-form-item label="起止时间">
              <div class="date-range">
                <date-field v-model="query.start" placeholder="开始日期" clearable />
                <span class="range-sep">-</span>
                <date-field v-model="query.end" placeholder="结束日期" clearable />
              </div>
            </el-form-item>
          </el-form>
          <div class="query-actions">
            <el-button type="primary" @click="applyQuery">查询</el-button>
            <el-button @click="resetQuery">重置</el-button>
          </div>
        </section>

        <section class="sec-frame list-panel">
          <h3><i></i>资源列表</h3>
          <div class="table-wrap">
            <el-table
              :data="pageRows"
              height="100%"
              highlight-current-row
              class="ys-table"
              empty-text="没有符合条件的记录"
              @row-click="selectRow"
            >
              <el-table-column label="序号" width="78" align="center">
                <template #default="{ row, $index }">
                  <span class="idx-cell">
                    <el-radio
                      :model-value="selectedId"
                      :value="row.id"
                      @change="selectRow(row)"
                      @click.stop
                    />
                    <em>{{ indexMethod($index) }}</em>
                  </span>
                </template>
              </el-table-column>
              <el-table-column prop="name" label="资源名称" min-width="148">
                <template #default="{ row }">
                  <span class="res-name" :class="{ on: selectedId === row.id }">{{ row.name }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="type" label="资源类型" min-width="96" />
              <el-table-column prop="spec" label="型号规格" min-width="88" />
              <el-table-column prop="major" label="所属专业" min-width="88" />
              <el-table-column prop="updatedAt" label="更新日期" min-width="102" />
              <el-table-column prop="version" label="当前版本" min-width="80" />
              <el-table-column label="状态" min-width="72" align="center">
                <template #default="{ row }">
                  <span class="st" :class="row.status === '有效' ? 'ok' : 'warn'">{{ row.status }}</span>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="64" align="center">
                <template #default="{ row }">
                  <a class="view-link" @click.stop="selectRow(row)">查看</a>
                </template>
              </el-table-column>
            </el-table>
          </div>
          <div class="pager">
            <el-pagination
              v-model:current-page="pageNo"
              v-model:page-size="pageSize"
              :page-sizes="[10, 20, 50]"
              :total="filtered.length"
              layout="total, sizes, prev, pager, next, jumper"
              background
              small
            />
          </div>
        </section>
      </div>

      <section class="sec-frame detail-panel">
        <h3><i></i>资源详细信息</h3>
        <el-form
          label-width="5.5em"
          label-position="right"
          require-asterisk-position="right"
          class="info-form"
          @submit.prevent
        >
          <el-form-item label="资源名称" required>
            <el-input v-model="detail.name" placeholder="请输入资源名称" />
          </el-form-item>
          <div class="duo">
            <el-form-item label="资源类型" required>
              <select-field v-model="detail.type" :options="typeOpts" placeholder="请选择资源类型" />
            </el-form-item>
            <el-form-item label="型号规格">
              <el-input v-model="detail.spec" placeholder="请输入型号规格" />
            </el-form-item>
          </div>
          <el-form-item label="所属专业" required>
            <select-field v-model="detail.major" :options="majorOpts" placeholder="请选择所属专业" />
          </el-form-item>
          <el-form-item label="用途" class="ta-item">
            <text-area-field v-model="detail.usage" :rows="3" :maxlength="200" placeholder="请输入资源用途说明" />
          </el-form-item>
          <el-form-item label="适用条件" class="ta-item">
            <text-area-field v-model="detail.cond" :rows="2" :maxlength="200" placeholder="请输入适用条件" />
          </el-form-item>
          <div class="duo">
            <el-form-item label="当前版本">
              <el-input v-model="detail.version" placeholder="请输入版本号" />
            </el-form-item>
            <el-form-item label="更新日期">
              <date-field v-model="detail.updatedAt" placeholder="请选择日期" clearable />
            </el-form-item>
          </div>
          <el-form-item label="状态">
            <select-field v-model="detail.status" :options="statusOpts" placeholder="请选择状态" />
          </el-form-item>
          <el-form-item label="更新说明" required class="ta-item">
            <text-area-field v-model="detail.note" :rows="3" :maxlength="500" placeholder="请输入本次更新说明" />
          </el-form-item>
        </el-form>
        <div class="panel-actions">
          <el-button @click="cancelEdit">取消</el-button>
          <el-button type="primary" @click="saveUpdate">保存更新</el-button>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import { computed, reactive, ref } from 'vue'
import { useUi } from '@/composables/ui'
import SelectField from '@/components/SelectField.vue'
import DateField from '@/components/DateField.vue'
import TextAreaField from '@/components/TextAreaField.vue'

const ROWS = [
  { id: 1, name: '某型装备定型技术资料', type: '装备定型资料', spec: 'XX-100', major: '试验技术', updatedAt: '2026-10-22', version: 'V1.2', status: '有效', usage: '', cond: '', note: '' },
  { id: 2, name: '发动机高空模拟试验数据', type: '试验数据', spec: 'AE-300', major: '动力装置', updatedAt: '2026-10-18', version: 'V1.0', status: '有效', usage: '', cond: '', note: '' },
  { id: 3, name: '环境试验规范', type: '标准规范', spec: 'GJB 150A', major: '环境工程', updatedAt: '2026-10-15', version: 'V2.0', status: '有效', usage: '', cond: '', note: '' },
  { id: 4, name: '结构强度试验报告', type: '试验报告', spec: 'STR-001', major: '结构力学', updatedAt: '2026-10-12', version: 'V1.1', status: '有效', usage: '', cond: '', note: '' },
  { id: 5, name: '可靠性试验数据集', type: '试验数据', spec: 'REL-2024', major: '可靠性工程', updatedAt: '2026-10-10', version: 'V1.0', status: '待更新', usage: '', cond: '', note: '' },
  { id: 6, name: '电磁兼容试验报告', type: '试验报告', spec: 'EMC-2023', major: '电磁兼容', updatedAt: '2026-10-08', version: 'V1.0', status: '有效', usage: '', cond: '', note: '' },
  { id: 7, name: '材料性能试验数据', type: '试验数据', spec: 'MAT-001', major: '材料工程', updatedAt: '2026-10-05', version: 'V1.0', status: '有效', usage: '', cond: '', note: '' },
  { id: 8, name: '某型雷达测试报告', type: '试验报告', spec: 'RAD-2024', major: '电子信息', updatedAt: '2026-10-03', version: 'V1.1', status: '有效', usage: '', cond: '', note: '' },
]

function emptyDetail() {
  return { name: '', type: '', spec: '', major: '', usage: '', cond: '', version: '', updatedAt: '', status: '', note: '' }
}

export default {
  name: 'ResUpdatePage',
  components: { SelectField, DateField, TextAreaField },
  props: { title: String, page: Object },
  setup() {
    const { toast } = useUi()
    const rows = ref(ROWS.map((r) => ({ ...r })))
    const selectedId = ref(null)
    const pageNo = ref(1)
    const pageSize = ref(10)
    const applied = reactive({ name: '', type: '', major: '', status: '', start: '', end: '' })
    const query = reactive({ name: '', type: '', major: '', status: '', start: '', end: '' })
    const detail = reactive(emptyDetail())

    const typeOpts = ['装备定型资料', '试验数据', '标准规范', '试验报告']
    const majorOpts = ['试验技术', '动力装置', '环境工程', '结构力学', '可靠性工程', '电磁兼容', '材料工程', '电子信息']
    const statusOpts = ['有效', '待更新']

    const filtered = computed(() => rows.value.filter((r) => {
      if (applied.name && !r.name.includes(applied.name.trim())) return false
      if (applied.type && r.type !== applied.type) return false
      if (applied.major && r.major !== applied.major) return false
      if (applied.status && r.status !== applied.status) return false
      if (applied.start && r.updatedAt < applied.start) return false
      if (applied.end && r.updatedAt > applied.end) return false
      return true
    }))
    const pageRows = computed(() => {
      const start = (pageNo.value - 1) * pageSize.value
      return filtered.value.slice(start, start + pageSize.value)
    })

    function indexMethod(i) {
      return (pageNo.value - 1) * pageSize.value + i + 1
    }

    function fillDetail(row) {
      detail.name = row.name
      detail.type = row.type
      detail.spec = row.spec
      detail.major = row.major
      detail.usage = row.usage
      detail.cond = row.cond
      detail.version = row.version
      detail.updatedAt = row.updatedAt
      detail.status = row.status
      detail.note = row.note
    }

    function selectRow(row) {
      selectedId.value = row.id
      fillDetail(row)
    }

    function applyQuery() {
      Object.assign(applied, { ...query })
      pageNo.value = 1
    }

    function resetQuery() {
      query.name = ''
      query.type = ''
      query.major = ''
      query.status = ''
      query.start = ''
      query.end = ''
      Object.assign(applied, { ...query })
      pageNo.value = 1
    }

    function cancelEdit() {
      const row = rows.value.find((r) => r.id === selectedId.value)
      if (row) fillDetail(row)
      else Object.assign(detail, emptyDetail())
    }

    function saveUpdate() {
      if (!selectedId.value) {
        toast('请先在列表中选择要更新的资源')
        return
      }
      if (!detail.name?.trim() || !detail.type || !detail.major) {
        toast('请填写资源名称、资源类型和所属专业')
        return
      }
      if (!detail.note?.trim()) {
        toast('请填写更新说明')
        return
      }
      const row = rows.value.find((r) => r.id === selectedId.value)
      if (!row) return
      Object.assign(row, {
        name: detail.name.trim(),
        type: detail.type,
        spec: detail.spec,
        major: detail.major,
        usage: detail.usage,
        cond: detail.cond,
        version: detail.version,
        updatedAt: detail.updatedAt,
        status: detail.status,
        note: detail.note.trim(),
      })
      toast('资源信息已更新')
    }

    return {
      query, detail, selectedId, pageNo, pageSize,
      typeOpts, majorOpts, statusOpts,
      filtered, pageRows,
      indexMethod, selectRow, applyQuery, resetQuery, cancelEdit, saveUpdate,
    }
  },
}
</script>

<style scoped>
.res-up {
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

.page-split {
  display: grid;
  grid-template-columns: 1.55fr 0.95fr;
  gap: 14px;
  align-items: stretch;
}
.left-col { display: flex; flex-direction: column; gap: 14px; min-width: 0; }

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
  width: 4px;
  height: 15px;
  background: var(--blue);
  border-radius: 2px;
  display: inline-block;
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
.info-form :deep(.el-textarea__inner) { min-height: 72px; }

.duo {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 16px;
  align-items: center;
  margin-bottom: 12px;
}
.duo :deep(.el-form-item),
.duo :deep(.el-form-item:last-child) {
  display: flex;
  align-items: center;
  width: 100%;
  min-width: 0;
  margin-bottom: 0;
}
.duo :deep(.el-input),
.duo :deep(.el-select),
.duo :deep(.date-field) {
  width: 100%;
}
.duo :deep(.el-form-item__label) { align-self: center; }
.duo :deep(.el-input__wrapper),
.duo :deep(.el-select__wrapper) {
  min-height: 36px;
  height: 36px;
}
.date-range {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  min-width: 0;
}
.date-range :deep(.date-field) { flex: 1; min-width: 0; }
.range-sep { color: #8a99a8; flex: 0 0 auto; }

.query-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 4px;
}
.query-actions :deep(.el-button + .el-button) { margin-left: 0; }
.query-actions :deep(.el-button--primary),
.query-actions :deep(.el-button--primary > span) { color: #fff !important; }

.list-panel { flex: 1; min-height: 0; }
.table-wrap {
  flex: 1 1 auto;
  min-height: 320px;
  height: 320px;
  border: 1px solid #e2ebf3;
  border-radius: 8px;
  overflow: hidden;
}
.ys-table { width: 100%; }
.ys-table :deep(.el-table__inner-wrapper::before) { display: none; }
.ys-table :deep(.el-table__header th) {
  background: #f4f9fd;
  color: #4a5a6a;
  font-weight: 600;
}
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
  line-height: 1.4;
  overflow: hidden;
  text-overflow: clip;
}
.idx-cell {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}
.idx-cell em {
  font-style: normal;
  font-weight: 400;
  color: #3f5062;
}
.ys-table :deep(.el-radio) { margin-right: 0; height: 16px; }
.ys-table :deep(.el-radio__label) { display: none; padding: 0; }
.res-name.on { color: #1668a8; font-weight: 600; }
.st { font-size: 13.5px; }
.st.ok { color: #22913c; }
.st.warn { color: #d48806; }
.view-link { color: #1668a8; cursor: pointer; font-size: 13.5px; }
.view-link:hover { text-decoration: underline; }

.pager {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-top: 10px;
  flex: 0 0 auto;
}
.pager :deep(.el-pagination) {
  flex-wrap: nowrap;
  justify-content: flex-end;
}
.pager :deep(.el-pagination__total) {
  margin-right: 8px;
  color: #6d8092;
}

.detail-panel { min-width: 0; }
.panel-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;
}
.panel-actions :deep(.el-button + .el-button) { margin-left: 0; }
.panel-actions :deep(.el-button--primary),
.panel-actions :deep(.el-button--primary > span) { color: #fff !important; }

@media (max-width: 1280px) {
  .page-split, .duo { grid-template-columns: 1fr; }
}
</style>
