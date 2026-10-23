<template>
  <div class="rich-type-entry">
    <!-- 数据资源录入：对齐原型 5.2.5.1 资源录入页 -->
    <div v-if="isResourceEntry" class="res-entry">
      <div class="entry-title">
        <h2>{{ title || '数据资源录入' }}</h2>
        <p>统一录入装备定型资料、历史试验数据、标准规范及专业文献</p>
      </div>

      <div class="entry-split">
        <div class="panel upload-card">
          <div
            class="dropzone"
            :class="{ over: dragOver }"
            @click="openPicker"
            @dragover.prevent="dragOver = true"
            @dragleave.prevent="dragOver = false"
            @drop.prevent="onDrop"
          >
            <div class="type-tabs" @click.stop>
              <button
                v-for="tab in typeTabs"
                :key="tab.key"
                type="button"
                :class="{ on: activeType === tab.key }"
                @click="setType(tab.key)"
              >{{ tab.label }}</button>
            </div>
            <div class="drop-body">
              <div class="cloud">
                <svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
                  <path d="M46 42H20c-6 0-10-4.4-10-10.2C10 26 15 21 21.4 21c1.4-6.6 7-11.4 13.8-11.4 7.6 0 13.8 5.8 14.6 13.2C56 24.2 60 28.6 60 34c0 4.4-3.6 8-8 8h-6" stroke="#3d9adf" stroke-width="2.4" stroke-linecap="round"/>
                  <path d="M32 28v18" stroke="#3d9adf" stroke-width="2.6" stroke-linecap="round"/>
                  <path d="M24.5 35.5 32 28l7.5 7.5" stroke="#3d9adf" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div class="drop-title">拖拽文件至此处，或点击选择文件</div>
              <div class="drop-sub">支持 Word、PDF、Excel、图片及扫描件</div>
              <button type="button" class="btn btn-primary pick-btn" @click.stop="openPicker">选择文件</button>
            </div>
            <input
              ref="fileInput"
              type="file"
              multiple
              accept=".doc,.docx,.pdf,.xls,.xlsx,.csv,.jpg,.jpeg,.png,.tif,.tiff,.bmp"
              hidden
              @change="onPick"
            />
          </div>
        </div>

        <div class="panel form-card">
          <div class="form-frame">
            <h3><i></i>资源信息登记</h3>
            <div class="entry-form">
              <label>资源名称<span class="req">*</span></label>
              <input v-model="meta.name" placeholder="某型装备定型技术资料" />
              <label>所属项目<span class="req">*</span></label>
              <select-field v-model="meta.project" :options="projects" placeholder="请选择项目" />

              <label>资料类别<span class="req">*</span></label>
              <select-field v-model="meta.cat" :options="catOptions" placeholder="请选择类别" />
              <label>资源版本<span class="req">*</span></label>
              <input v-model="meta.version" placeholder="V1.0" />

              <label>来源单位<span class="req">*</span></label>
              <input v-model="meta.org" placeholder="试验单位" />
              <label>资料日期<span class="req">*</span></label>
              <input v-model="meta.date" type="date" />

              <label class="align-top">备注</label>
              <div class="remark">
                <textarea v-model="meta.remark" maxlength="200" placeholder="请输入备注信息（可选）" />
                <span class="counter">{{ (meta.remark || '').length }}/200</span>
              </div>
            </div>
            <div class="form-actions">
              <button type="button" class="btn btn-outline" @click="stash">暂存</button>
              <button type="button" class="btn btn-primary" @click="confirmEntry">确认录入</button>
            </div>
          </div>
        </div>
      </div>

      <div class="stat-row">
        <div class="stat" v-for="s in stats" :key="s.key">
          <div class="stat-ico" :class="s.key">
            <svg v-if="s.key === 'all'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="M8 13h8M8 17h5"/></svg>
            <svg v-else-if="s.key === 'done'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="8.2"/><path d="M8.2 12.4 10.8 15l5-5.2"/></svg>
            <svg v-else-if="s.key === 'run'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="8.2"/><path d="M12 8v4.4l3 1.8"/></svg>
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/></svg>
          </div>
          <div>
            <div class="stat-label">{{ s.label }}</div>
            <div class="stat-value" :class="s.key">{{ s.value }} <small>项</small></div>
          </div>
        </div>
      </div>

      <div class="panel task-card">
        <div class="task-frame">
        <h3><i></i>录入任务</h3>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>文件名称</th>
                <th>资源类型</th>
                <th>文件大小</th>
                <th>资源版本</th>
                <th>录入状态</th>
                <th style="text-align:center">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!tasks.length">
                <td colspan="6" class="empty">暂无录入任务，请先选择文件或填写资源信息</td>
              </tr>
              <tr v-for="row in tasks" :key="row.id">
                <td>
                  <div class="file-cell">
                    <span class="file-ico" :class="iconKind(row.fmt)">{{ iconText(row.fmt) }}</span>
                    <span>{{ row.name }}</span>
                  </div>
                </td>
                <td>{{ row.catLabel }}</td>
                <td>{{ row.size }}</td>
                <td>{{ row.version }}</td>
                <td>
                  <span class="dot-status" :class="statusClass(row.status)">
                    <i></i>{{ row.status }}
                  </span>
                </td>
                <td>
                  <div class="ops" style="justify-content:center">
                    <a @click="viewTask(row)">查看</a>
                    <a class="danger" @click="removeTask(row)">移除</a>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        </div>
      </div>
    </div>

    <!-- 其它录入页（抽取配置 / 微调 / 图谱上传）保持原布局 -->
    <div v-else class="split" style="grid-template-columns: 1fr 1.1fr; align-items: start;">
      <div class="panel">
        <h3><i></i>{{ formTitle }}</h3>
        <div class="form-row" v-for="f in fields" :key="f.key">
          <label><span v-if="f.required" class="req">*</span>{{ f.label }}</label>
          <select-field v-if="f.options && f.type !== 'radio'" v-model="form[f.key]" :options="f.options" :placeholder="'请选择' + f.label" />
          <textarea v-else-if="f.type === 'textarea'" v-model="form[f.key]" :placeholder="f.placeholder || ''" />
          <div v-else-if="f.type === 'radio'" class="radio-row">
            <label v-for="op in f.options" :key="op"><input type="radio" :value="op" v-model="form[f.key]" /> {{ op }}</label>
          </div>
          <input v-else v-model="form[f.key]" :placeholder="f.placeholder || ''" />
        </div>
        <button class="btn btn-primary" style="width:100%;margin-top:4px" @click="addToList">加入导入清单</button>
      </div>
      <div class="panel">
        <h3 style="justify-content:space-between">
          <span style="display:flex;align-items:center;gap:8px"><i></i>批量导入清单</span>
          <span style="font-size:13px;color:#8a99a8;font-weight:400">支持单次批量导入（≥50篇 / ≥500MB）</span>
        </h3>
        <div style="display:flex;justify-content:flex-end;margin-bottom:12px">
          <button class="btn btn-primary" @click="commitList">确认录入（{{ importList.length }}）</button>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th class="col-idx">序号</th>
                <th>名称</th>
                <th>类别</th>
                <th>格式</th>
                <th>大小(MB)</th>
                <th>解析模式</th>
                <th style="text-align:center">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!importList.length">
                <td colspan="7" class="empty">清单为空，请先在左侧登记资源信息</td>
              </tr>
              <tr v-for="(item, i) in importList" :key="i">
                <td>{{ i + 1 }}</td>
                <td style="max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{{ item.name }}</td>
                <td>{{ item.cat }}</td>
                <td>{{ item.fmt }}</td>
                <td>{{ item.size || '—' }}</td>
                <td>{{ item.mode }}</td>
                <td style="text-align:center">
                  <div class="ops" style="justify-content:center">
                    <a class="danger" @click="importList.splice(i, 1)">删除</a>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, reactive, ref, watch } from 'vue'
import { useRichPage } from '@/composables/rich/useRichPage'
import { useUi } from '@/composables/ui'
import { useRows } from '@/composables/tables'
import { nowText } from '@/utils/format'
import SelectField from '@/components/SelectField.vue'

const TYPE_TABS = [
  { key: '定型资料', label: '装备定型资料' },
  { key: '历史试验数据', label: '历史试验数据' },
  { key: '标准规范', label: '标准规范' },
  { key: '专业文献', label: '专业文献' },
]

function catLabelOf(key) {
  return TYPE_TABS.find((t) => t.key === key)?.label || key
}

function extOf(name = '') {
  const i = name.lastIndexOf('.')
  return i >= 0 ? name.slice(i + 1).toUpperCase() : 'FILE'
}

function formatSize(bytes) {
  if (!bytes && bytes !== 0) return '—'
  const mb = bytes / (1024 * 1024)
  if (mb < 0.01) return `${(bytes / 1024).toFixed(1)} KB`
  return `${mb.toFixed(2)} MB`
}

export default {
  components: { SelectField },
  props: { page: Object, title: String },
  setup(props) {
    const rich = useRichPage(props)
    const { toast, confirm, openDrawer } = useUi()
    const fileInput = ref(null)
    const dragOver = ref(false)
    const activeType = ref('定型资料')
    let seq = 4

    const isResourceEntry = computed(() => !props.page?.entryKey && props.page?.dataset === 'resources')

    const meta = reactive({
      name: '某型装备定型技术资料',
      project: '装备定型试验项目',
      cat: '定型资料',
      version: 'V1.0',
      org: '试验单位',
      date: '2026-10-22',
      remark: '',
    })

    const tasks = ref([
      { id: 1, name: '装备定型技术资料.docx', cat: '定型资料', catLabel: '装备定型资料', size: '2.36 MB', version: 'V1.0', status: '已完成', fmt: 'DOCX', org: '试验单位', project: '装备定型试验项目', date: '2026-10-22' },
      { id: 2, name: '历史试验数据.xlsx', cat: '历史试验数据', catLabel: '历史试验数据', size: '5.12 MB', version: 'V1.0', status: '处理中', fmt: 'XLSX', org: '试验单位', project: '装备定型试验项目', date: '2026-10-22' },
      { id: 3, name: '试验标准规范.pdf', cat: '标准规范', catLabel: '标准规范', size: '8.23 MB', version: 'V2.0', status: '待提交', fmt: 'PDF', org: '试验单位', project: '装备定型试验项目', date: '2026-10-22' },
      { id: 4, name: '装备技术研究文献.pdf', cat: '专业文献', catLabel: '专业文献', size: '3.85 MB', version: 'V1.0', status: '已完成', fmt: 'PDF', org: '试验单位', project: '装备定型试验项目', date: '2026-10-22' },
    ])

    const projects = ['装备定型试验项目', '性能鉴定试验项目', '可靠性试验项目']
    const catOptions = TYPE_TABS.map((t) => ({ value: t.key, label: t.label }))

    const stats = computed(() => {
      const all = tasks.value.length
      const done = tasks.value.filter((t) => t.status === '已完成').length
      const run = tasks.value.filter((t) => t.status === '处理中').length
      const wait = tasks.value.filter((t) => t.status === '待提交').length
      return [
        { key: 'all', label: '本次文件', value: all },
        { key: 'done', label: '已完成', value: done },
        { key: 'run', label: '处理中', value: run },
        { key: 'wait', label: '待提交', value: wait },
      ]
    })

    function setType(key) {
      activeType.value = key
      meta.cat = key
    }
    watch(() => meta.cat, (v) => { if (v) activeType.value = v })

    function iconKind(fmt) {
      if (/DOC/.test(fmt)) return 'word'
      if (/XLS|CSV/.test(fmt)) return 'excel'
      if (/PDF/.test(fmt)) return 'pdf'
      if (/PNG|JPE?G|TIF|BMP/.test(fmt)) return 'img'
      return 'file'
    }
    function iconText(fmt) {
      if (/DOC/.test(fmt)) return 'W'
      if (/XLS/.test(fmt)) return 'X'
      if (/PDF/.test(fmt)) return 'A'
      return extOf(fmt).slice(0, 1)
    }
    function statusClass(status) {
      if (status === '已完成') return 'ok'
      if (status === '处理中') return 'run'
      return 'wait'
    }

    function openPicker() {
      fileInput.value?.click()
    }

    function addFiles(fileList) {
      const files = Array.from(fileList || [])
      if (!files.length) return
      files.forEach((file) => {
        seq += 1
        const fmt = extOf(file.name)
        tasks.value.unshift({
          id: seq,
          name: file.name,
          cat: meta.cat || activeType.value,
          catLabel: catLabelOf(meta.cat || activeType.value),
          size: formatSize(file.size),
          version: meta.version || 'V1.0',
          status: '待提交',
          fmt,
          org: meta.org,
          project: meta.project,
          date: meta.date,
          remark: meta.remark,
        })
      })
      if (!meta.name || meta.name === '某型装备定型技术资料') {
        meta.name = files[0].name.replace(/\.[^.]+$/, '')
      }
      toast(`已加入 ${files.length} 个文件，待确认录入`)
    }

    function onPick(e) {
      addFiles(e.target.files)
      e.target.value = ''
    }
    function onDrop(e) {
      dragOver.value = false
      addFiles(e.dataTransfer?.files)
    }

    function requiredOk() {
      if (!meta.name?.trim() || !meta.project || !meta.cat || !meta.version?.trim() || !meta.org?.trim() || !meta.date) {
        toast('请填写资源名称、所属项目、资料类别、资源版本、来源单位与资料日期')
        return false
      }
      return true
    }

    function taskFromForm() {
      seq += 1
      return {
        id: seq,
        name: /\.[a-zA-Z0-9]+$/.test(meta.name) ? meta.name : `${meta.name}.pdf`,
        cat: meta.cat,
        catLabel: catLabelOf(meta.cat),
        size: '—',
        version: meta.version || 'V1.0',
        status: '待提交',
        fmt: extOf(/\.[a-zA-Z0-9]+$/.test(meta.name) ? meta.name : 'file.pdf'),
        org: meta.org,
        project: meta.project,
        date: meta.date,
        remark: meta.remark,
      }
    }

    function pushResource(row, status) {
      if (props.page?.dataset !== 'resources') return
      const rows = useRows('resources')
      const modal = /XLS|CSV/.test(row.fmt) ? '表格' : /PNG|JPE?G|TIF|BMP/.test(row.fmt) ? '图像' : '文本'
      rows.unshift({
        name: row.name,
        cat: row.cat,
        fmt: row.fmt,
        modal,
        size: row.size,
        pages: '—',
        status,
        by: 'Mona',
        time: nowText(),
      })
    }

    function stash() {
      if (!requiredOk()) return
      const pending = tasks.value.filter((t) => t.status === '待提交')
      if (!pending.length) tasks.value.unshift(taskFromForm())
      toast('已暂存，可在录入任务中继续提交')
    }

    function confirmEntry() {
      if (!requiredOk()) return
      let pending = tasks.value.filter((t) => t.status === '待提交')
      if (!pending.length) {
        const row = taskFromForm()
        tasks.value.unshift(row)
        pending = [row]
      }
      const ids = pending.map((t) => t.id)
      pending.forEach((row) => {
        row.status = '处理中'
        row.version = row.version || meta.version
        row.project = row.project || meta.project
        row.org = row.org || meta.org
        row.date = row.date || meta.date
        pushResource(row, '解析中')
      })
      toast(`已确认录入 ${ids.length} 项，正在处理`)
      setTimeout(() => {
        tasks.value.forEach((row) => {
          if (ids.includes(row.id) && row.status === '处理中') row.status = '已完成'
        })
        toast('录入处理完成')
      }, 1400)
    }

    function viewTask(row) {
      openDrawer(row.name, [
        { label: '资源类型', value: row.catLabel },
        { label: '文件大小', value: row.size },
        { label: '资源版本', value: row.version },
        { label: '所属项目', value: row.project || '—' },
        { label: '来源单位', value: row.org || '—' },
        { label: '资料日期', value: row.date || '—' },
        { label: '录入状态', value: row.status },
      ])
    }

    function removeTask(row) {
      confirm(`确认移除「${row.name}」？`, () => {
        tasks.value = tasks.value.filter((t) => t.id !== row.id)
        toast('已移除')
      })
    }

    return {
      ...rich,
      isResourceEntry,
      typeTabs: TYPE_TABS,
      activeType,
      setType,
      meta,
      projects,
      catOptions,
      tasks,
      stats,
      fileInput,
      dragOver,
      openPicker,
      onPick,
      onDrop,
      iconKind,
      iconText,
      statusClass,
      stash,
      confirmEntry,
      viewTask,
      removeTask,
    }
  },
}
</script>

<style scoped>
.res-entry {
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 20px 22px 16px;
  box-shadow: 0 6px 18px rgba(15, 55, 95, .04);
}
.entry-title h2 { font-size: 20px; color: #0d4e83; font-weight: 700; letter-spacing: .3px; }
.entry-title p { margin-top: 4px; color: #6d8092; font-size: 13.5px; }

.entry-split { display: grid; grid-template-columns: 1fr 1.08fr; gap: 22px; align-items: stretch; }
.upload-card,
.form-card,
.task-card {
  background: transparent;
  border: none;
  box-shadow: none;
  padding: 0;
}
.upload-card { display: flex; flex-direction: column; min-height: 100%; }

.dropzone {
  position: relative;
  flex: 1;
  min-height: 280px;
  border: 1.5px dashed #b7d4ee;
  border-radius: 12px;
  background: linear-gradient(180deg, #f7fbfe 0%, #eef6fc 100%);
  cursor: pointer;
  transition: border-color .16s, background .16s;
}
.dropzone.over, .dropzone:hover { border-color: #3d9adf; background: #f3f9fe; }

.type-tabs {
  position: absolute;
  top: 12px;
  left: 12px;
  right: 12px;
  z-index: 2;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  background: rgba(255, 255, 255, .78);
  border-radius: 8px;
  padding: 4px;
  box-shadow: 0 1px 6px rgba(13, 78, 131, .06);
}
.type-tabs button {
  height: 36px;
  border: 0;
  background: transparent;
  color: #5d7388;
  font-size: 13.5px;
  border-radius: 6px;
  font-weight: 500;
}
.type-tabs button.on {
  background: #fff;
  color: #0d4e83;
  font-weight: 700;
  box-shadow: 0 1px 4px rgba(13, 78, 131, .12);
}

.drop-body {
  height: 100%;
  min-height: 280px;
  padding: 64px 16px 28px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.cloud { width: 72px; height: 72px; margin-bottom: 8px; }
.cloud svg { width: 100%; height: 100%; }
.drop-title { font-size: 16px; color: #1668a8; font-weight: 700; }
.drop-sub { margin-top: 6px; color: #8a99a8; font-size: 13px; }
.pick-btn { margin-top: 18px; min-width: 120px; height: 38px; border-radius: 8px; }

.form-frame {
  border: 1.5px dashed #b7d4ee;
  border-radius: 12px;
  padding: 16px 16px 16px;
  min-height: 280px;
  display: flex;
  flex-direction: column;
}
.form-frame h3 { margin-bottom: 14px; }
.entry-form {
  display: grid;
  grid-template-columns: auto 1fr auto 1fr;
  gap: 16px 10px;
  align-items: center;
}
.entry-form label {
  font-size: 13.5px;
  color: #4a5a6a;
  text-align: left;
  line-height: 1.3;
  white-space: nowrap;
  padding-right: 4px;
}
.entry-form label.align-top { align-self: start; padding-top: 10px; }
.entry-form .req { color: #f5222d; margin-left: 2px; }
.entry-form input, .entry-form textarea {
  width: 100%;
  height: 36px;
  border: 1px solid #d5e0ea;
  border-radius: 6px;
  background: #fff;
  padding: 0 12px;
  font-size: 14px;
  color: #3f5062;
  outline: none;
  font-family: inherit;
}
.entry-form input:focus, .entry-form textarea:focus { border-color: #7eadd4; }
.entry-form :deep(.sf-wrap) { width: 100%; }
.remark { grid-column: 2 / -1; }
.remark textarea { height: 78px; padding: 8px 12px; resize: none; line-height: 1.6; }
.counter { display: block; text-align: right; color: #9fb0c0; font-size: 12px; margin-top: 4px; }
.form-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: auto; padding-top: 16px; }
.form-actions .btn { min-width: 88px; }

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

.task-frame {
  border: 1.5px dashed #b7d4ee;
  border-radius: 12px;
  padding: 16px 16px 8px;
}
.task-frame h3 { margin-bottom: 12px; }
.task-card .table-wrap { border: 0; box-shadow: none; border-radius: 0; }
.file-cell { display: flex; align-items: center; gap: 10px; min-width: 0; }
.file-ico {
  width: 26px; height: 26px; border-radius: 4px;
  display: grid; place-items: center;
  color: #fff; font-size: 11px; font-weight: 700; flex: 0 0 auto;
}
.file-ico.word { background: #2b7cd3; }
.file-ico.excel { background: #217346; }
.file-ico.pdf { background: #e2574c; }
.file-ico.img { background: #7b6bb0; }
.file-ico.file { background: #7c8fa2; }

.dot-status { display: inline-flex; align-items: center; gap: 6px; font-size: 13.5px; }
.dot-status i { width: 7px; height: 7px; border-radius: 50%; }
.dot-status.ok { color: #2f9e62; } .dot-status.ok i { background: #2fbf4a; }
.dot-status.run { color: #d48806; } .dot-status.run i { background: #faad14; }
.dot-status.wait { color: #d4380d; } .dot-status.wait i { background: #f5222d; }
</style>
