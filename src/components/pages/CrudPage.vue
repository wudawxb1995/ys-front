<template>
  <div>
    <div class="page-head">
      <h2>{{ title }}</h2>
      <p>{{ page.desc }}</p>
    </div>

    <!-- 筛选栏 + 工具栏 + 表格 + 分页 统一白色卡片 -->
    <div class="crud-body">
      <!-- 筛选栏 -->
      <div v-if="schema.filters?.length" class="filter-bar filter-panel">
        <div v-for="f in schema.filters" :key="f.key" class="field">
          <label>{{ f.label }}</label>
          <input v-if="f.type === 'search'" v-model="draft[f.key]" :placeholder="f.placeholder || '请输入'" />
          <select-field
            v-else
            v-model="draft[f.key]"
            :options="[{ value: '', label: '全部' + f.label }, ...f.options.map(op => ({ value: op, label: op }))]"
            :placeholder="'全部' + f.label"
          />
        </div>
        <div class="filter-actions">
          <button class="btn btn-primary" @click="apply">查询</button>
          <button class="btn btn-outline" @click="reset">重置</button>
        </div>
      </div>

      <!-- 工具栏 -->
      <div class="toolbar">
        <button class="btn btn-primary" @click="create">＋ 新增录入</button>
        <button class="btn btn-outline" @click="removeSelected">批量删除</button>
        <span class="spacer"></span>
        <span style="color:#8a99a8;font-size:13.5px">
          {{ checked.length ? `已选 ${checked.length} 条` : '勾选多条记录后可执行批量删除' }}
        </span>
      </div>

      <!-- 表格 -->
      <div class="table-inner">
      <table>
        <thead>
          <tr>
            <th class="col-cb">
              <input type="checkbox" :checked="allChecked" @change="toggleAll" />
            </th>
            <th class="col-idx">序号</th>
            <th v-for="col in schema.columns" :key="col.key">{{ col.label }}</th>
            <th style="text-align:center">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, i) in pageRows" :key="i" :class="{ checked: checked.includes(row) }">
            <td class="col-cb">
              <input type="checkbox" v-model="checked" :value="row" />
            </td>
            <td class="col-idx">{{ (pageNo - 1) * pageSize + i + 1 }}</td>
            <td v-for="col in schema.columns" :key="col.key">
              <span v-if="col.kind === 'badge'" class="badge" :class="badgeKind(row[col.key])">
                <i></i>{{ row[col.key] }}
              </span>
              <template v-else-if="col.kind === 'progress'">
                <span class="prog" :class="{ done: row[col.key] >= 100 }">
                  <i :style="{ width: row[col.key] + '%' }"></i>
                </span>
                {{ row[col.key] }}%
              </template>
              <template v-else>{{ row[col.key] }}</template>
            </td>
            <td style="text-align:center">
              <div class="ops" style="justify-content:center">
                <a v-for="op in ops" :key="op"
                   :class="{ danger: op === '删除' }"
                   @click="act(op, row)">{{ op }}</a>
              </div>
            </td>
          </tr>
          <tr v-if="!pageRows.length">
            <td :colspan="schema.columns.length + 3" class="empty">
              没有符合条件的记录
            </td>
          </tr>
          <!-- 补空行，固定表格高度 -->
          <tr v-for="n in emptyRows" :key="'e'+n" class="empty-row">
            <td :colspan="schema.columns.length + 3"></td>
          </tr>
        </tbody>
      </table>
      </div><!-- /table-inner -->

      <!-- 分页 -->
      <div class="pager">
        <span>共 <b>{{ filtered.length }}</b> 条记录</span>
        <div class="pages">
          <button class="pg" :disabled="pageNo === 1" @click="pageNo--">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M15 6l-6 6 6 6"/></svg>
          </button>
          <button
            v-for="n in pageCount" :key="n"
            class="pg" :class="{ cur: n === pageNo }"
            @click="pageNo = n">{{ n }}</button>
          <button class="pg" :disabled="pageNo === pageCount" @click="pageNo++">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M9 6l6 6-6 6"/></svg>
          </button>
        </div>
      </div>
    </div><!-- /crud-body -->
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { datasetOf, useRows } from '@/composables/tables'
import { useUi } from '@/composables/ui'
import { badgeKind, nowText } from '@/utils/format'
import SelectField from '@/components/SelectField.vue'

const props = defineProps({ page: Object, title: String })
const { toast, confirm, openForm, openDrawer } = useUi()
const rows = useRows(props.page.dataset)
const schema = datasetOf(props.page.dataset) || { columns: [], filters: [], rows: [] }
const ops = schema.ops || ['详情', '删除']
const draft = reactive({})
const query = reactive({})
const checked = ref([])
const pageNo = ref(1)
const pageSize = 10

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
const emptyRows = computed(() => Math.max(0, pageSize - pageRows.value.length))
const allChecked = computed(() => pageRows.value.length > 0 && pageRows.value.every(r => checked.value.includes(r)))

watch(pageCount, (n) => { if (pageNo.value > n) pageNo.value = n })

function toggleAll(e) {
  if (e.target.checked) {
    pageRows.value.forEach(r => { if (!checked.value.includes(r)) checked.value.push(r) })
  } else {
    checked.value = checked.value.filter(r => !pageRows.value.includes(r))
  }
}
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
  const fields = schema.columns.filter((c) => c.kind !== 'progress').slice(0, 5).map((c) => ({
    key: c.key, label: c.label,
    options: c.kind === 'badge' ? (c.options || ['启用', '待审核', '已完成']) : undefined,
  }))
  openForm('新增' + props.title, fields, (model) => {
    rows.unshift({ ...model, status: model.status || '待审核', time: nowText(), progress: 0 })
    toast('已新增')
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
    const fields = schema.columns.slice(0, 5).map((c) => ({ key: c.key, label: c.label, value: row[c.key] }))
    openForm(op + '记录', fields, (model) => {
      Object.assign(row, model)
      toast('已保存')
    })
    return
  }
  openDrawer(op + '详情', schema.columns.map((c) => ({ label: c.label, value: row[c.key] })))
}
</script>
