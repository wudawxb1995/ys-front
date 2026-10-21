<template>
  <div>
    <div class="page-head">
      <h2>{{ title }}</h2>
      <p>{{ page.desc }}</p>
      <div class="deco"></div>
    </div>
    <div v-if="schema.filters?.length" class="filter-bar filter-panel">
      <div v-for="f in schema.filters" :key="f.key" class="field">
        <label>{{ f.label }}</label>
        <input v-if="f.type === 'search'" v-model="draft[f.key]" placeholder="请输入" />
        <select v-else v-model="draft[f.key]">
          <option value="">全部</option>
          <option v-for="op in f.options" :key="op" :value="op">{{ op }}</option>
        </select>
      </div>
      <div class="filter-actions">
        <button class="btn btn-primary" @click="apply">查询</button>
        <button class="btn btn-outline" @click="reset">重置</button>
      </div>
    </div>
    <div class="toolbar">
      <button class="btn btn-primary" @click="create">新增</button>
      <button class="btn btn-outline" @click="toast('已按当前筛选条件生成导出文件')">导出</button>
      <button class="btn btn-danger" @click="removeSelected">删除</button>
      <span class="spacer"></span>
      <span v-if="checked.length" class="count-pill">已选 {{ checked.length }}</span>
      <span class="count-pill">共 {{ filtered.length }} 条</span>
    </div>
    <div class="table-card">
      <table>
        <thead>
          <tr>
            <th style="width:42px"></th>
            <th style="width:56px">序号</th>
            <th v-for="col in schema.columns" :key="col.key">{{ col.label }}</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, i) in pageRows" :key="i">
            <td><input type="checkbox" v-model="checked" :value="row" /></td>
            <td>{{ (pageNo - 1) * pageSize + i + 1 }}</td>
            <td v-for="col in schema.columns" :key="col.key">
              <span v-if="col.kind === 'badge'" class="badge" :class="badgeKind(row[col.key])"><i></i>{{ row[col.key] }}</span>
              <template v-else-if="col.kind === 'progress'">
                <span class="progress"><span :style="{ width: row[col.key] + '%' }"></span></span>{{ row[col.key] }}%
              </template>
              <template v-else>{{ row[col.key] }}</template>
            </td>
            <td>
              <div class="ops">
                <button v-for="op in ops" :key="op" :class="{ danger: op === '删除' }" @click="act(op, row)">{{ op }}</button>
              </div>
            </td>
          </tr>
          <tr v-if="!pageRows.length"><td :colspan="schema.columns.length + 3" class="empty">没有符合条件的记录。可以调整筛选条件，或新增一条。</td></tr>
        </tbody>
      </table>
    <div class="pager">
      <span>第 {{ pageNo }} / {{ pageCount }} 页</span>
      <button :disabled="pageNo === 1" @click="pageNo--">上一页</button>
      <button class="on">{{ pageNo }}</button>
      <button :disabled="pageNo === pageCount" @click="pageNo++">下一页</button>
    </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { datasetOf, useRows } from '@/composables/tables'
import { useUi } from '@/composables/ui'
import { badgeKind, nowText } from '@/utils/format'

const props = defineProps({ page: Object, title: String })
const { toast, confirm, openForm, openDrawer } = useUi()
const rows = useRows(props.page.dataset)
const schema = datasetOf(props.page.dataset) || { columns: [], filters: [], rows: [] }
const ops = schema.ops || ['详情', '编辑', '删除']
const draft = reactive({})
const query = reactive({})
const checked = ref([])
const pageNo = ref(1)
const pageSize = 8

watch(() => props.page.dataset, () => { pageNo.value = 1; checked.value = [] })

const filtered = computed(() => rows.filter((row) => {
  return (schema.filters || []).every((f) => {
    const v = query[f.key]
    if (!v) return true
    const cell = String(row[f.key] ?? '')
    return f.type === 'search' ? cell.includes(v) : cell === v
  })
}))
const pageCount = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize)))
const pageRows = computed(() => filtered.value.slice((pageNo.value - 1) * pageSize, pageNo.value * pageSize))
watch(pageCount, (n) => { if (pageNo.value > n) pageNo.value = n })

function apply() {
  Object.keys(query).forEach((k) => delete query[k])
  Object.assign(query, draft)
  pageNo.value = 1
  checked.value = []
}
function reset() {
  Object.keys(draft).forEach((k) => delete draft[k])
  Object.keys(query).forEach((k) => delete query[k])
  pageNo.value = 1
}
function create() {
  const fields = schema.columns.filter((c) => c.kind !== 'progress').slice(0, 4).map((c) => ({
    key: c.key, label: c.label, options: c.kind === 'badge' ? ['启用', '待审核', '已完成'] : undefined,
  }))
  openForm('新增' + props.title, fields, (model) => {
    rows.unshift({ ...model, status: model.status || '待审核', time: nowText(), progress: 0 })
    toast('已新增，可在列表中继续维护')
  })
}
function removeSelected() {
  if (!checked.value.length) { toast('请先勾选要删除的数据'); return }
  confirm(`确认删除已选的 ${checked.value.length} 条数据？删除后不可恢复。`, () => {
    checked.value.forEach((row) => {
      const i = rows.indexOf(row)
      if (i >= 0) rows.splice(i, 1)
    })
    checked.value = []
    toast('已删除')
  })
}
function act(op, row) {
  if (op === '删除' || op === '停用' || op === '下线') {
    confirm(`确认对「${row.name || row.title || row.text || row.q || '该记录'}」执行${op}？`, () => {
      if (op === '删除') rows.splice(rows.indexOf(row), 1)
      else row.status = op === '下线' ? '下线' : '停用'
      toast('操作已完成')
    })
    return
  }
  if (op === '编辑' || op === '修订' || op === '审核' || op === '属性') {
    const fields = schema.columns.slice(0, 4).map((c) => ({ key: c.key, label: c.label, value: row[c.key] }))
    openForm(op + '记录', fields, (model) => {
      Object.assign(row, model)
      toast('已保存')
    })
    return
  }
  openDrawer(op.endsWith('详情') ? '记录详情' : op + '详情', schema.columns.map((c) => ({ label: c.label, value: row[c.key] })))
}
</script>
