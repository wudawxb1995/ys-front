<template>
  <div class="res-manage">
    <div class="entry-title">
      <h2>{{ title || '数据资源管理' }}</h2>
    </div>

    <div class="stat-row">
      <div class="stat" v-for="s in stats" :key="s.key">
        <div class="stat-ico" :class="s.tone">
          <svg v-if="s.tone === 'all'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="M8 13h8M8 17h5"/></svg>
          <svg v-else-if="s.tone === 'done'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="8.2"/><path d="M8.2 12.4 10.8 15l5-5.2"/></svg>
          <svg v-else-if="s.tone === 'run'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="8.2"/><path d="M12 8v4.4l3 1.8"/></svg>
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/></svg>
        </div>
        <div>
          <div class="stat-label">{{ s.label }}</div>
          <div class="stat-value" :class="s.tone">{{ s.value }} <small>项</small></div>
        </div>
      </div>
    </div>

    <div class="manage-split">
      <aside class="cat-frame">
        <h3><i></i>资料分类</h3>
        <div
          v-for="cat in catTree"
          :key="cat.key"
          class="cat-item"
          :class="{ active: activeCat === cat.key }"
          @click="activeCat = cat.key"
        >
          <span class="cat-name">{{ cat.label }}</span>
          <span class="cat-badge">{{ cat.count }}</span>
        </div>
      </aside>

      <div class="list-frame">
        <h3><i></i>资源目录</h3>
        <div class="list-toolbar">
          <el-input
            v-model="keyword"
            class="search-input"
            clearable
            placeholder="按名称搜索资料…"
            :prefix-icon="Search"
          />
          <div class="status-filter">
            <el-radio-group v-model="activeStatus" size="default">
              <el-radio-button
                v-for="s in statusOptions"
                :key="s.key"
                :value="s.key"
              >{{ s.label }}</el-radio-button>
            </el-radio-group>
          </div>
          <el-button :disabled="!checkedNames.size" @click="batchDelete">批量删除</el-button>
          <el-button type="primary" @click="pickImport">导入资料</el-button>
          <input ref="fileInput" class="file-input" type="file" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.png,.jpg,.jpeg,.txt" @change="onImport" />
        </div>
        <p v-if="checkedNames.size" class="sel-hint">已选 {{ checkedNames.size }} 条</p>

        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th class="col-cb">
                  <el-checkbox :model-value="isAllChecked" :indeterminate="isSomeChecked" @change="toggleAll" />
                </th>
                <th>文件名称</th>
                <th>资源类型</th>
                <th>文件大小</th>
                <th>数据模态</th>
                <th>录入状态</th>
                <th style="text-align:center">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!filtered.length">
                <td colspan="7" class="empty">没有符合条件的资料，可调整分类或搜索关键词</td>
              </tr>
              <tr v-for="row in pageRows" :key="row.name" :class="{ checked: checkedNames.has(row.name), fresh: row.fresh }">
                <td class="col-cb" @click.stop>
                  <el-checkbox :model-value="checkedNames.has(row.name)" @change="(v) => toggleRow(row.name, v)" />
                </td>
                <td>
                  <div class="file-cell" @click="openDetail(row)">
                    <span class="file-ico" :class="iconKind(row.fmt)">{{ iconText(row.fmt) }}</span>
                    <span class="file-name">{{ row.name }}</span>
                    <em v-if="row.fresh" class="fresh-tag">刚刚导入</em>
                  </div>
                </td>
                <td>{{ catLabelOf(row.cat) }}</td>
                <td>{{ row.size }}</td>
                <td>{{ row.modal }}</td>
                <td>
                  <span class="dot-status" :class="statusClass(row.status)">
                    <i></i>{{ row.status }}
                  </span>
                </td>
                <td>
                  <div class="ops" style="justify-content:center">
                    <a @click="openDetail(row)">查看</a>
                    <a v-if="row.status === '暂存' || row.status === '解析失败'" @click="toast('已加入解析队列：' + row.name)">发起解析</a>
                    <a class="danger" @click="deleteRow(row)">删除</a>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="res-foot">
          共 {{ filtered.length }} 条资料
          <span v-if="activeCat !== 'all'">（{{ catTree.find(c => c.key === activeCat)?.label }}）</span>
          <el-pagination v-if="filtered.length > pageSize" v-model:current-page="currentPage" :page-size="pageSize" :total="filtered.length" layout="prev, pager, next" small background />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { useUi } from '@/composables/ui'
import { registerResourceDetail } from '@/composables/resourceRegistry'
import { buildTank99aDetail, isTank99aDoc } from '@/data/tank99a'
import { useRows } from '@/composables/tables'
import { resourceCategories } from '@/data/resourceCorpus'

const props = defineProps({ page: Object, title: String })
const emit = defineEmits(['open-detail'])
const { toast, confirm } = useUi()

const rows = useRows('resources')
const fileInput = ref(null)
const keyword = ref('')
const activeCat = ref('all')
const activeStatus = ref('all')
const checkedNames = ref(new Set())
const currentPage = ref(1)
const pageSize = 15

const CAT_TABS = [{ key: 'all', label: '全部资料' }, ...resourceCategories.map(name => ({ key: name, label: name }))]

const statusOptions = [
  { key: 'all', label: '全部' },
  { key: '已解析', label: '已解析' },
  { key: '解析中', label: '解析中' },
  { key: '暂存', label: '暂存' },
  { key: '解析失败', label: '解析失败' },
]

function catLabelOf(key) {
  return CAT_TABS.find((t) => t.key === key)?.label || key
}

const catTree = computed(() => CAT_TABS.map((c) => ({
  ...c,
  count: c.key === 'all' ? rows.length : rows.filter((r) => r.cat === c.key).length,
})))

const filtered = computed(() => rows.filter((r) => {
  const matchCat = activeCat.value === 'all' || r.cat === activeCat.value
  const matchStatus = activeStatus.value === 'all' || r.status === activeStatus.value
  const matchKey = !keyword.value || r.name.includes(keyword.value)
  return matchCat && matchStatus && matchKey
}))
const pageRows = computed(() => filtered.value.slice((currentPage.value - 1) * pageSize, currentPage.value * pageSize))
watch([activeCat, activeStatus, keyword], () => { currentPage.value = 1 })

const stats = computed(() => [
  { key: 'all', label: '全部资料', tone: 'all', value: rows.length },
  { key: 'done', label: '已解析', tone: 'done', value: rows.filter((r) => r.status === '已解析').length },
  { key: 'run', label: '解析中', tone: 'run', value: rows.filter((r) => r.status === '解析中').length },
  { key: 'wait', label: '待处理', tone: 'wait', value: rows.filter((r) => r.status === '暂存' || r.status === '解析失败').length },
])

const isAllChecked = computed(
  () => pageRows.value.length > 0 && pageRows.value.every((r) => checkedNames.value.has(r.name)),
)
const isSomeChecked = computed(() => {
  const n = pageRows.value.filter((r) => checkedNames.value.has(r.name)).length
  return n > 0 && n < pageRows.value.length
})

function toggleRow(name, val) {
  const s = new Set(checkedNames.value)
  if (val) s.add(name)
  else s.delete(name)
  checkedNames.value = s
}

function toggleAll(val) {
  const s = new Set(checkedNames.value)
  if (val) pageRows.value.forEach((r) => s.add(r.name))
  else pageRows.value.forEach((r) => s.delete(r.name))
  checkedNames.value = s
}

function deleteRow(row) {
  confirm(`确认删除「${row.name}」？此操作不可撤销。`, () => {
    const idx = rows.findIndex((r) => r.name === row.name)
    if (idx !== -1) rows.splice(idx, 1)
    checkedNames.value.delete(row.name)
    toast(`已删除：${row.name}`)
  })
}

function batchDelete() {
  const names = [...checkedNames.value]
  if (!names.length) return
  confirm(`确认删除选中的 ${names.length} 条资料？此操作不可撤销。`, () => {
    names.forEach((name) => {
      const idx = rows.findIndex((r) => r.name === name)
      if (idx !== -1) rows.splice(idx, 1)
    })
    checkedNames.value = new Set()
    toast(`已删除 ${names.length} 条资料`)
  }, true)
}

function iconKind(fmt) {
  if (/DOC/.test(fmt)) return 'word'
  if (/XLS|CSV/.test(fmt)) return 'excel'
  if (/PDF/.test(fmt)) return 'pdf'
  if (/PNG|JPE?G|TIF|BMP/.test(fmt)) return 'img'
  if (/MP4|MP3/.test(fmt)) return 'media'
  return 'file'
}
function iconText(fmt = '') {
  if (/DOC/.test(fmt)) return 'W'
  if (/XLS/.test(fmt)) return 'X'
  if (/PDF/.test(fmt)) return 'A'
  if (/CSV/.test(fmt)) return 'C'
  return String(fmt).slice(0, 1) || 'F'
}
function statusClass(status) {
  if (status === '已解析') return 'ok'
  if (status === '解析中') return 'run'
  if (status === '解析失败') return 'fail'
  return 'wait'
}

function openDetail(row) {
  emit('open-detail', row)
}

function pickImport() {
  fileInput.value?.click()
}

function formatSize(bytes) {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function fmtOf(name) {
  const ext = (name.split('.').pop() || '').toUpperCase()
  if (ext === 'JPEG') return 'JPG'
  return ext || 'FILE'
}

function modalOf(fmt) {
  if (/XLS|CSV/.test(fmt)) return '表格'
  if (/PNG|JPE?G|TIF|BMP/.test(fmt)) return '图像'
  return '文本'
}

function uniqueName(name) {
  if (!rows.some((r) => r.name === name)) return name
  const dot = name.lastIndexOf('.')
  const base = dot > 0 ? name.slice(0, dot) : name
  const ext = dot > 0 ? name.slice(dot) : ''
  let n = 2
  while (rows.some((r) => r.name === `${base}（${n}）${ext}`)) n += 1
  return `${base}（${n}）${ext}`
}

function nowText() {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}

function onImport(e) {
  const files = [...(e.target.files || [])]
  e.target.value = ''
  if (!files.length) return
  rows.forEach((r) => { if (r.fresh) r.fresh = false })
  const cat = activeCat.value !== 'all' ? activeCat.value : '试验鉴定'
  const time = nowText()
  files.reverse().forEach((file) => {
    const fmt = fmtOf(file.name)
    const name = uniqueName(file.name)
    const record = {
      name,
      cat,
      fmt,
      modal: modalOf(fmt),
      size: formatSize(file.size),
      pages: /PDF|DOC/.test(fmt) ? String(Math.max(8, Math.min(48, Math.round(file.size / 80000) || 12))) : '—',
      status: '已解析',
      by: '管理员',
      time,
      fileUrl: URL.createObjectURL(file),
      fresh: true,
    }
    rows.unshift(record)
    registerResourceDetail(name, isTank99aDoc(name)
      ? buildTank99aDetail({ ...record, parsedAt: time })
      : {
      name,
      fmt,
      size: record.size,
      pages: record.pages,
      parsedAt: time,
      tableCount: record.modal === '表格' ? 4 : 2,
      imageCount: record.modal === '图像' ? 1 : 0,
      paraCount: 24,
      indexStatus: '已建立',
      indexName: `idx-${Date.now()}`,
      indexAt: time,
      fileUrl: record.fileUrl,
      chapters: [
        { id: 'c1', title: '1 概述', level: 1 },
        { id: 'c2', title: '2 主体内容', level: 1 },
        { id: 'c3', title: '3 结论', level: 1 },
      ],
    })
  })
  activeCat.value = 'all'
  activeStatus.value = 'all'
  keyword.value = ''
  currentPage.value = 1
  const added = files.length
  const all = rows.length
  const done = rows.filter((r) => r.status === '已解析').length
  toast(added === 1
    ? `已导入并完成解析：${files[0].name}。全部资料 ${all} 项，已解析 ${done} 项`
    : `已导入并完成解析 ${added} 份资料。全部资料 ${all} 项，已解析 ${done} 项`,
  'success')
}
</script>

<style scoped>
.res-manage {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 20px 22px 16px;
  box-shadow: 0 6px 18px rgba(15, 55, 95, .04);
  overflow: hidden;
}
.entry-title h2 { font-size: 20px; color: #0d4e83; font-weight: 700; letter-spacing: .3px; }

.stat-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
.stat {
  background: #f7fbfe;
  border: 1px solid #e6eef6;
  border-radius: 10px;
  padding: 16px 18px;
  display: flex;
  align-items: center;
  gap: 14px;
}
.stat-ico {
  width: 44px; height: 44px; border-radius: 50%;
  display: grid; place-items: center; flex: 0 0 auto;
}
.stat-ico svg { width: 22px; height: 22px; }
.stat-ico.all { background: #e8f2fb; color: #1668a8; }
.stat-ico.done { background: #e8f7ec; color: #2f9e62; }
.stat-ico.run { background: #fff6e6; color: #d48806; }
.stat-ico.wait { background: #fdeceb; color: #d4380d; }
.stat-label { color: #6d8092; font-size: 13.5px; }
.stat-value { margin-top: 2px; font-size: 26px; font-weight: 700; line-height: 1.2; }
.stat-value small { font-size: 13px; font-weight: 500; color: #8a99a8; }
.stat-value.all { color: #1668a8; }
.stat-value.done { color: #2f9e62; }
.stat-value.run { color: #d48806; }
.stat-value.wait { color: #d4380d; }

.manage-split {
  display: grid;
  grid-template-columns: minmax(160px, 200px) minmax(0, 1fr);
  gap: 16px;
  align-items: stretch;
  min-width: 0;
  width: 100%;
}
.cat-frame, .list-frame {
  border: 1.5px dashed #b7d4ee;
  border-radius: 12px;
  padding: 16px;
  background: #fff;
  min-width: 0;
}
.list-frame { overflow: hidden; }
.cat-frame h3, .list-frame h3 {
  font-size: 16px;
  color: var(--navy-2);
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}
.cat-frame h3 i, .list-frame h3 i {
  width: 4px; height: 16px; background: var(--blue); border-radius: 2px; display: inline-block;
}

.cat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 40px;
  padding: 0 10px;
  cursor: pointer;
  color: #3e5163;
  font-size: 14px;
  border-radius: 6px;
}
.cat-item:hover { background: #f4f8fc; }
.cat-item.active { background: #e8f2fb; color: #1668a8; font-weight: 600; }
.cat-name { flex: 1; }
.cat-badge {
  min-width: 20px;
  height: 18px;
  padding: 0 5px;
  border-radius: 9px;
  background: #eef3f8;
  color: #5d7388;
  font-size: 11px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.cat-item.active .cat-badge { background: #c8def4; color: #0d4e83; }

.list-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  flex-wrap: wrap;
  min-width: 0;
}
.search-input { flex: 1 1 180px; min-width: 160px; max-width: 280px; }
.status-filter { display: flex; gap: 4px; flex: 1 1 280px; min-width: 0; }
.status-filter :deep(.el-radio-group) {
  display: flex;
  flex-wrap: wrap;
}
.status-filter :deep(.el-radio-button__inner) {
  padding: 7px 12px;
  font-size: 13px;
  border-color: #e4ecf4;
  background: #f5f8fb;
  color: #5d7388;
  box-shadow: none !important;
}
.status-filter :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background: #e8f2fb;
  border-color: #9ec8e8;
  color: #1668a8;
  font-weight: 600;
}
.sel-hint { font-size: 13px; color: #1668a8; font-weight: 500; margin-bottom: 10px; }

.list-frame .table-wrap {
  border: 0;
  box-shadow: none;
  border-radius: 0;
  overflow-x: auto;
  max-width: 100%;
}
.list-frame table {
  table-layout: fixed;
  width: 100%;
  min-width: 640px;
}
.list-frame th:nth-child(1),
.list-frame td:nth-child(1) { width: 42px; }
.list-frame th:nth-child(3),
.list-frame td:nth-child(3) { width: 7.5em; }
.list-frame th:nth-child(4),
.list-frame td:nth-child(4) { width: 5.5em; }
.list-frame th:nth-child(5),
.list-frame td:nth-child(5) { width: 5em; }
.list-frame th:nth-child(6),
.list-frame td:nth-child(6) { width: 5.5em; }
.list-frame th:nth-child(7),
.list-frame td:nth-child(7) { width: 6.5em; }
.file-cell {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  max-width: 100%;
  cursor: pointer;
}
.file-name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.file-name:hover { color: #1668a8; text-decoration: underline; }
.fresh-tag {
  flex: 0 0 auto;
  margin-left: 2px;
  padding: 0 6px;
  border-radius: 8px;
  background: #e7f6ec;
  color: #1a8a45;
  font-size: 12px;
  font-style: normal;
  line-height: 18px;
}
tr.fresh td { background: #f3faf6; }
.file-input { display: none; }
.file-ico {
  width: 26px; height: 26px; border-radius: 4px;
  display: grid; place-items: center;
  color: #fff; font-size: 11px; font-weight: 700; flex: 0 0 auto;
}
.file-ico.word { background: #2b7cd3; }
.file-ico.excel { background: #217346; }
.file-ico.pdf { background: #e2574c; }
.file-ico.img { background: #7b6bb0; }
.file-ico.media { background: #6b46c1; }
.file-ico.file { background: #7c8fa2; }

.dot-status { display: inline-flex; align-items: center; gap: 6px; font-size: 13.5px; }
.dot-status i { width: 7px; height: 7px; border-radius: 50%; }
.dot-status.ok { color: #2f9e62; } .dot-status.ok i { background: #2fbf4a; }
.dot-status.run { color: #d48806; } .dot-status.run i { background: #faad14; }
.dot-status.wait { color: #d4380d; } .dot-status.wait i { background: #f5222d; }
.dot-status.fail { color: #d4380d; } .dot-status.fail i { background: #f5222d; }

.list-frame .ops { gap: 8px; }
.res-foot { display: flex; align-items: center; justify-content: space-between; gap: 12px; font-size: 13.5px; color: #7c8fa2; padding: 10px 2px 0; }
</style>
