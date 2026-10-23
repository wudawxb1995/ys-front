<template>
  <div class="tpl-in">
    <div class="entry-title">
      <h2>{{ title || '试验方案模板入库' }}</h2>
      <p>支持试验方案模板的上传、元信息登记与集中入库，实现标准方案模板的规范化收录与管理。</p>
    </div>

    <div class="entry-split">
      <div class="upload-card">
        <div class="upload-frame">
          <h3><i></i>模板文件上传</h3>
          <div
            class="dropzone"
            :class="{ over: dragOver }"
            @click="openPicker"
            @dragover.prevent="dragOver = true"
            @dragleave.prevent="dragOver = false"
            @drop.prevent="onDrop"
          >
            <div class="drop-body">
              <div class="cloud">
                <svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
                  <path d="M46 42H20c-6 0-10-4.4-10-10.2C10 26 15 21 21.4 21c1.4-6.6 7-11.4 13.8-11.4 7.6 0 13.8 5.8 14.6 13.2C56 24.2 60 28.6 60 34c0 4.4-3.6 8-8 8h-6" stroke="#3d9adf" stroke-width="2.4" stroke-linecap="round"/>
                  <path d="M32 28v18" stroke="#3d9adf" stroke-width="2.6" stroke-linecap="round"/>
                  <path d="M24.5 35.5 32 28l7.5 7.5" stroke="#3d9adf" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div class="drop-title">拖拽文件至此处，或点击选择文件</div>
              <div class="drop-sub">支持 Word、PDF、Excel、PPT、zip 等格式</div>
              <el-button type="primary" class="pick-btn" @click.stop="openPicker">选择文件</el-button>
            </div>
            <input
              ref="fileInput"
              type="file"
              multiple
              accept=".doc,.docx,.pdf,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.7z"
              hidden
              @change="onPick"
            />
          </div>
        </div>
      </div>

      <div class="form-card">
        <div class="form-frame">
          <h3><i></i>模板元信息登记</h3>
          <div class="entry-form">
            <label>模板名称<span class="req">*</span></label>
            <input v-model="meta.name" placeholder="请输入模板名称" />
            <label>所属专业领域<span class="req">*</span></label>
            <select-field v-model="meta.field" :options="fieldOptions" placeholder="请选择专业领域" />

            <label>模板类型<span class="req">*</span></label>
            <select-field v-model="meta.kind" :options="kindOptions" placeholder="请选择模板类型" />
            <label>版本号<span class="req">*</span></label>
            <input v-model="meta.ver" placeholder="如 V1.0" />

            <label>适用类型<span class="req">*</span></label>
            <select-field v-model="meta.equip" :options="equipOptions" placeholder="请选择类型" />
            <label>制定单位<span class="req">*</span></label>
            <input v-model="meta.org" placeholder="请输入制定单位" />

            <label>适用试验阶段<span class="req">*</span></label>
            <select-field v-model="meta.stage" :options="stageOptions" placeholder="请选择试验阶段" />
            <label>制定日期<span class="req">*</span></label>
            <date-field v-model="meta.date" placeholder="选择日期" />

            <label class="align-top">模板摘要</label>
            <text-area-field
              v-model="meta.summary"
              :maxlength="500"
              placeholder="请输入模板摘要（可选）"
            />
          </div>
          <div class="form-actions">
            <el-button @click="resetForm">重置</el-button>
            <el-button type="primary" @click="confirmIn">确认入库</el-button>
          </div>
        </div>
      </div>
    </div>

    <div class="task-card">
      <div class="task-frame">
        <h3><i></i>待入库文件列表</h3>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th class="col-check">
                  <input type="checkbox" :checked="allChecked" :indeterminate.prop="someChecked" @change="toggleAll" />
                </th>
                <th>文件名</th>
                <th>文件大小</th>
                <th>文件类型</th>
                <th>上传时间</th>
                <th>状态</th>
                <th style="text-align:center">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!files.length">
                <td colspan="7" class="empty-cell">
                  <div class="empty-box">
                    <svg viewBox="0 0 64 48" fill="none" aria-hidden="true">
                      <rect x="8" y="14" width="48" height="28" rx="3" stroke="#c5d5e4" stroke-width="1.6" fill="#f4f8fc"/>
                      <path d="M8 20h48" stroke="#c5d5e4" stroke-width="1.6"/>
                      <rect x="20" y="6" width="24" height="10" rx="2" stroke="#c5d5e4" stroke-width="1.6" fill="#fff"/>
                    </svg>
                    <span>暂无数据</span>
                  </div>
                </td>
              </tr>
              <tr v-for="row in files" :key="row.id">
                <td class="col-check">
                  <input type="checkbox" :checked="selected.has(row.id)" @change="toggleOne(row.id)" />
                </td>
                <td>
                  <div class="file-cell">
                    <span class="file-ico" :class="iconKind(row.fmt)">{{ iconText(row.fmt) }}</span>
                    <span>{{ row.name }}</span>
                  </div>
                </td>
                <td>{{ row.size }}</td>
                <td>{{ row.fmt }}</td>
                <td>{{ row.time }}</td>
                <td>
                  <span class="dot-status" :class="statusClass(row.status)">
                    <i></i>{{ row.status }}
                  </span>
                </td>
                <td>
                  <div class="ops" style="justify-content:center">
                    <a @click="viewFile(row)">查看</a>
                    <a @click="toast('已开始下载：' + row.name)">下载</a>
                    <a class="danger" @click="removeFile(row)">删除</a>
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
import { computed, reactive, ref } from 'vue'
import { useUi } from '@/composables/ui'
import { useRows } from '@/composables/tables'
import { nowText } from '@/utils/format'
import SelectField from '@/components/SelectField.vue'
import DateField from '@/components/DateField.vue'
import TextAreaField from '@/components/TextAreaField.vue'

export default {
  components: { SelectField, DateField, TextAreaField },
  props: { page: Object, title: String },
  setup(props) {
    const { toast, confirm, openDrawer } = useUi()
    const fileInput = ref(null)
    const dragOver = ref(false)
    let seq = 0

    const meta = reactive({
      name: '',
      field: '',
      kind: '',
      ver: '',
      equip: '',
      org: '',
      stage: '',
      date: '',
      summary: '',
    })

    const fieldOptions = ['动力系统', '环境适应', '可靠性', '电磁兼容', '综合性能']
    const kindOptions = ['定型试验模板', '性能试验模板', '可靠性试验模板', '专项试验模板']
    const equipOptions = ['轮式', '履带', '农机', '通用']
    const stageOptions = ['摸底试验', '鉴定试验', '定型试验', '补充试验']

    const files = ref([])
    const selected = ref(new Set())

    const allChecked = computed(() => files.value.length > 0 && files.value.every((f) => selected.value.has(f.id)))
    const someChecked = computed(() => {
      const n = files.value.filter((f) => selected.value.has(f.id)).length
      return n > 0 && n < files.value.length
    })

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
    function iconKind(fmt) {
      if (/DOC/.test(fmt)) return 'word'
      if (/XLS|CSV/.test(fmt)) return 'excel'
      if (/PDF/.test(fmt)) return 'pdf'
      if (/PPT/.test(fmt)) return 'ppt'
      if (/ZIP|RAR|7Z/.test(fmt)) return 'zip'
      return 'file'
    }
    function iconText(fmt) {
      if (/DOC/.test(fmt)) return 'W'
      if (/XLS/.test(fmt)) return 'X'
      if (/PDF/.test(fmt)) return 'A'
      if (/PPT/.test(fmt)) return 'P'
      if (/ZIP|RAR|7Z/.test(fmt)) return 'Z'
      return String(fmt || 'F').slice(0, 1)
    }
    function statusClass(status) {
      if (status === '已完成' || status === '待入库') return 'ok'
      if (status === '处理中') return 'run'
      return 'wait'
    }

    function openPicker() { fileInput.value?.click() }
    function addFiles(fileList) {
      const list = Array.from(fileList || [])
      if (!list.length) return
      list.forEach((file) => {
        seq += 1
        files.value.unshift({
          id: seq,
          name: file.name,
          size: formatSize(file.size),
          fmt: extOf(file.name),
          time: nowText(),
          status: '待入库',
        })
      })
      if (!meta.name) meta.name = list[0].name.replace(/\.[^.]+$/, '')
      toast(`已加入 ${list.length} 个文件`)
    }
    function onPick(e) { addFiles(e.target.files); e.target.value = '' }
    function onDrop(e) { dragOver.value = false; addFiles(e.dataTransfer?.files) }

    function toggleAll(e) {
      const next = new Set()
      if (e.target.checked) files.value.forEach((f) => next.add(f.id))
      selected.value = next
    }
    function toggleOne(id) {
      const next = new Set(selected.value)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      selected.value = next
    }

    function requiredOk() {
      if (!meta.name?.trim() || !meta.field || !meta.kind || !meta.ver?.trim()
        || !meta.equip || !meta.org?.trim() || !meta.stage || !meta.date) {
        toast('请填写模板名称、专业领域、模板类型、版本号、适用类型、制定单位、适用试验阶段与制定日期')
        return false
      }
      return true
    }
    function resetForm() {
      Object.keys(meta).forEach((k) => { meta[k] = '' })
    }
    function confirmIn() {
      if (!requiredOk()) return
      let pending = files.value.filter((f) => f.status === '待入库' || f.status === '待提交')
      if (!pending.length) {
        toast('请先上传待入库的模板文件')
        return
      }
      const ids = pending.map((f) => f.id)
      pending.forEach((row) => { row.status = '处理中' })
      const rows = useRows(props.page?.dataset || 'schemeTpls')
      rows.unshift({
        name: meta.name,
        scene: meta.stage || meta.kind,
        factors: '—',
        ver: meta.ver || 'V1.0',
        status: '启用',
      })
      toast(`已确认入库 ${ids.length} 项，正在处理`)
      setTimeout(() => {
        files.value.forEach((row) => {
          if (ids.includes(row.id) && row.status === '处理中') row.status = '已完成'
        })
        toast('入库处理完成')
      }, 1400)
    }
    function viewFile(row) {
      openDrawer(row.name, [
        { label: '文件名', value: row.name },
        { label: '文件大小', value: row.size },
        { label: '文件类型', value: row.fmt },
        { label: '上传时间', value: row.time },
        { label: '状态', value: row.status },
        { label: '模板名称', value: meta.name || '—' },
      ])
    }
    function removeFile(row) {
      confirm(`确认删除「${row.name}」？`, () => {
        files.value = files.value.filter((f) => f.id !== row.id)
        const next = new Set(selected.value)
        next.delete(row.id)
        selected.value = next
        toast('已删除')
      })
    }

    return {
      meta, fieldOptions, kindOptions, equipOptions, stageOptions,
      files, selected, allChecked, someChecked,
      fileInput, dragOver,
      openPicker, onPick, onDrop, toggleAll, toggleOne,
      resetForm, confirmIn, viewFile, removeFile,
      iconKind, iconText, statusClass, toast,
    }
  },
}
</script>

<style scoped>
.tpl-in {
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
.entry-title p { margin-top: 4px; color: #6d8092; font-size: 13.5px; line-height: 1.6; }

.entry-split { display: grid; grid-template-columns: 1fr 1.08fr; gap: 22px; align-items: stretch; }
.upload-card, .form-card { display: flex; flex-direction: column; min-height: 100%; }

.upload-frame,
.form-frame,
.task-frame {
  border: 1.5px dashed #b7d4ee;
  border-radius: 12px;
  padding: 16px;
  background: #fff;
  display: flex;
  flex-direction: column;
  flex: 1;
}
.task-frame { padding-bottom: 8px; }

.upload-frame h3,
.form-frame h3,
.task-frame h3 {
  font-size: 16px; color: var(--navy-2);
  display: flex; align-items: center; gap: 8px; margin-bottom: 14px;
}
.upload-frame h3 i,
.form-frame h3 i,
.task-frame h3 i {
  width: 4px; height: 16px; background: var(--blue); border-radius: 2px; display: inline-block;
}

.dropzone {
  flex: 1;
  min-height: 280px;
  border: 1.5px dashed #b7d4ee;
  border-radius: 12px;
  background: linear-gradient(180deg, #f7fbfe 0%, #eef6fc 100%);
  cursor: pointer;
}
.dropzone.over, .dropzone:hover { border-color: #3d9adf; background: #f3f9fe; }
.drop-body {
  height: 100%; min-height: 280px; padding: 28px 16px;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
}
.cloud { width: 72px; height: 72px; margin-bottom: 8px; }
.cloud svg { width: 100%; height: 100%; }
.drop-title { font-size: 16px; color: #1668a8; font-weight: 700; }
.drop-sub { margin-top: 6px; color: #8a99a8; font-size: 13px; }
.pick-btn { margin-top: 18px; min-width: 120px; height: 38px; }

.entry-form {
  display: grid;
  grid-template-columns: auto 1fr auto 1fr;
  gap: 16px 10px;
  align-items: center;
}
.entry-form label {
  font-size: 13.5px; color: #4a5a6a; text-align: left;
  line-height: 1.3; white-space: nowrap; padding-right: 4px;
}
.entry-form label.align-top { align-self: start; padding-top: 10px; }
.entry-form .req { color: #f5222d; margin-left: 2px; }
.entry-form input, .entry-form textarea {
  width: 100%; height: 36px; border: 1px solid #d5e0ea; border-radius: 6px;
  background: #fff; padding: 0 12px; font-size: 14px; color: #3f5062;
  outline: none; font-family: inherit;
}
.entry-form input:focus, .entry-form textarea:focus { border-color: #7eadd4; }
.entry-form :deep(.sf-select),
.entry-form :deep(.date-field) { width: 100%; }
.entry-form :deep(.ta-field) { grid-column: 2 / -1; }
.form-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: auto; padding-top: 16px; }
.form-actions :deep(.el-button) { min-width: 88px; }

.task-card .table-wrap { border: 0; box-shadow: none; border-radius: 0; }
.col-check { width: 44px; text-align: center; }
.col-check input { width: 15px; height: 15px; accent-color: #1668a8; cursor: pointer; }
.file-cell { display: flex; align-items: center; gap: 10px; min-width: 0; }
.file-ico {
  width: 26px; height: 26px; border-radius: 4px;
  display: grid; place-items: center;
  color: #fff; font-size: 11px; font-weight: 700; flex: 0 0 auto;
}
.file-ico.word { background: #2b7cd3; }
.file-ico.excel { background: #217346; }
.file-ico.pdf { background: #e2574c; }
.file-ico.ppt { background: #c43e1c; }
.file-ico.zip { background: #d48806; }
.file-ico.file { background: #7c8fa2; }

.dot-status { display: inline-flex; align-items: center; gap: 6px; font-size: 13.5px; }
.dot-status i { width: 7px; height: 7px; border-radius: 50%; }
.dot-status.ok { color: #2f9e62; } .dot-status.ok i { background: #2fbf4a; }
.dot-status.run { color: #d48806; } .dot-status.run i { background: #faad14; }
.dot-status.wait { color: #e06a1a; } .dot-status.wait i { background: #fa8c16; }

.empty-cell { padding: 48px 16px !important; border-bottom: 0 !important; }
.empty-box {
  display: flex; flex-direction: column; align-items: center; gap: 10px;
  color: #9fb0c0; font-size: 14px;
}
.empty-box svg { width: 72px; height: 54px; }
</style>
