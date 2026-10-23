<template>
  <div class="case-in">
    <div class="entry-title">
      <h2>{{ title || '历史试验案例入库' }}</h2>
      <p>支持历史试验案例资料的上传、信息登记与入库管理，实现已有试验案例的集中收录与规范化管理。</p>
    </div>

    <div class="entry-split">
      <div class="upload-card">
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
              v-for="tab in uploadTabs"
              :key="tab.key"
              type="button"
              :class="{ on: uploadMode === tab.key }"
              @click="uploadMode = tab.key"
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
            <div class="drop-sub">支持 Word、PDF、Excel、PPT、图片及压缩包等格式</div>
            <el-button type="primary" class="pick-btn" @click.stop="openPicker">选择文件</el-button>
          </div>
          <input
            ref="fileInput"
            type="file"
            :multiple="uploadMode !== 'single'"
            :webkitdirectory="uploadMode === 'folder'"
            accept=".doc,.docx,.pdf,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.zip,.rar,.7z"
            hidden
            @change="onPick"
          />
        </div>
      </div>

      <div class="form-card">
        <div class="form-frame">
          <h3><i></i>案例信息登记</h3>
          <div class="entry-form">
            <label>案例名称<span class="req">*</span></label>
            <input v-model="meta.name" placeholder="请输入案例名称" />
            <label>所属装备<span class="req">*</span></label>
            <select-field v-model="meta.equip" :options="equipOptions" placeholder="请选择所属装备" />

            <label>试验类型<span class="req">*</span></label>
            <select-field v-model="meta.type" :options="typeOptions" placeholder="请选择试验类型" />
            <label>试验阶段<span class="req">*</span></label>
            <select-field v-model="meta.stage" :options="stageOptions" placeholder="请选择试验阶段" />

            <label>试验对象<span class="req">*</span></label>
            <input v-model="meta.object" placeholder="请输入试验对象" />
            <label>试验时间<span class="req">*</span></label>
            <date-field v-model="meta.date" placeholder="选择日期" />

            <label>关键词</label>
            <input v-model="meta.tags" class="span-field" placeholder="请输入关键词（多个关键词用逗号分隔）" />

            <label class="align-top">备注</label>
            <text-area-field
              v-model="meta.remark"
              :maxlength="200"
              placeholder="请输入备注信息（可选）"
            />
          </div>
          <div class="form-actions">
            <el-button @click="resetForm">重置</el-button>
            <el-button type="primary" @click="confirmIn">确认入库</el-button>
          </div>
        </div>
      </div>
    </div>

    <div class="stat-row">
      <div class="stat" v-for="s in stats" :key="s.key">
        <div class="stat-ico" :class="s.key">
          <svg v-if="s.key === 'all'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="M8 13h8M8 17h5"/></svg>
          <svg v-else-if="s.key === 'done'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="8.2"/><path d="M8.2 12.4 10.8 15l5-5.2"/></svg>
          <svg v-else-if="s.key === 'run'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="8.2"/><path d="M12 8v4.2"/><circle cx="12" cy="12" r=".9" fill="currentColor" stroke="none"/><path d="M12 12l3.2 2"/></svg>
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/></svg>
        </div>
        <div>
          <div class="stat-label">{{ s.label }}</div>
          <div class="stat-value" :class="s.key">{{ s.value }} <small>项</small></div>
        </div>
      </div>
    </div>

    <div class="task-card">
      <div class="task-frame">
        <h3><i></i>入库任务列表</h3>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th class="col-idx">序号</th>
                <th>文件名称</th>
                <th>案例名称</th>
                <th>试验类型</th>
                <th>文件大小</th>
                <th>上传时间</th>
                <th>入库状态</th>
                <th style="text-align:center">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!tasks.length">
                <td colspan="8" class="empty">暂无入库任务，请先选择文件或填写案例信息</td>
              </tr>
              <tr v-for="(row, i) in tasks" :key="row.id">
                <td>{{ i + 1 }}</td>
                <td>
                  <div class="file-cell">
                    <span class="file-ico" :class="iconKind(row.fmt)">{{ iconText(row.fmt) }}</span>
                    <span>{{ row.file }}</span>
                  </div>
                </td>
                <td>{{ row.caseName }}</td>
                <td>{{ row.type }}</td>
                <td>{{ row.size }}</td>
                <td>{{ row.time }}</td>
                <td>
                  <span class="dot-status" :class="statusClass(row.status)">
                    <i></i>{{ row.status }}
                  </span>
                </td>
                <td>
                  <div class="ops" style="justify-content:center">
                    <a @click="viewTask(row)">查看</a>
                    <a @click="toast('已开始下载：' + row.file)">下载</a>
                    <a class="danger" @click="removeTask(row)">删除</a>
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
    const uploadMode = ref('single')
    let seq = 4

    const uploadTabs = [
      { key: 'single', label: '单个文件上传' },
      { key: 'batch', label: '批量文件上传' },
      { key: 'folder', label: '文件夹上传' },
    ]

    const meta = reactive({
      name: '',
      equip: '',
      type: '',
      stage: '',
      object: '',
      date: '',
      tags: '',
      remark: '',
    })

    const equipOptions = ['某型装备', 'XX-100', 'XX-200', 'XX-300']
    const typeOptions = ['环境试验', '力学试验', '电磁试验', '可靠性试验']
    const stageOptions = ['鉴定试验', '定型试验', '摸底试验', '补充试验']

    const tasks = ref([
      { id: 1, file: '某型装备高温环境适应性报告.docx', caseName: '高温环境适应性试验', type: '环境试验', size: '12.36 MB', time: '2026-10-22 14:23:16', status: '已完成', fmt: 'DOCX' },
      { id: 2, file: '某型装备振动试验数据.xlsx', caseName: '振动试验案例', type: '力学试验', size: '8.52 MB', time: '2026-10-22 11:09:35', status: '处理中', fmt: 'XLSX' },
      { id: 3, file: '某型装备盐雾试验方案.pdf', caseName: '盐雾腐蚀试验方案', type: '环境试验', size: '5.18 MB', time: '2026-10-21 16:45:22', status: '待提交', fmt: 'PDF' },
      { id: 4, file: '某型装备可靠性试验资料.zip', caseName: '可靠性增长试验', type: '可靠性试验', size: '26.76 MB', time: '2026-10-21 09:32:18', status: '已完成', fmt: 'ZIP' },
    ])

    const stats = computed(() => [
      { key: 'all', label: '本次文件', value: tasks.value.length },
      { key: 'done', label: '已完成', value: tasks.value.filter((t) => t.status === '已完成').length },
      { key: 'run', label: '处理中', value: tasks.value.filter((t) => t.status === '处理中').length },
      { key: 'wait', label: '待提交', value: tasks.value.filter((t) => t.status === '待提交').length },
    ])

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
      if (/PNG|JPE?G|TIF|BMP/.test(fmt)) return 'img'
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
      if (status === '已完成') return 'ok'
      if (status === '处理中') return 'run'
      return 'wait'
    }

    function openPicker() { fileInput.value?.click() }
    function addFiles(fileList) {
      const files = Array.from(fileList || [])
      if (!files.length) return
      const take = uploadMode.value === 'single' ? files.slice(0, 1) : files
      take.forEach((file) => {
        seq += 1
        tasks.value.unshift({
          id: seq,
          file: file.name,
          caseName: meta.name || file.name.replace(/\.[^.]+$/, ''),
          type: meta.type || '—',
          size: formatSize(file.size),
          time: nowText(),
          status: '待提交',
          fmt: extOf(file.name),
        })
      })
      if (!meta.name) meta.name = take[0].name.replace(/\.[^.]+$/, '')
      toast(`已加入 ${take.length} 个文件，待确认入库`)
    }
    function onPick(e) { addFiles(e.target.files); e.target.value = '' }
    function onDrop(e) { dragOver.value = false; addFiles(e.dataTransfer?.files) }

    function requiredOk() {
      if (!meta.name?.trim() || !meta.equip || !meta.type || !meta.stage || !meta.object?.trim() || !meta.date) {
        toast('请填写案例名称、所属装备、试验类型、试验阶段、试验对象与试验时间')
        return false
      }
      return true
    }
    function resetForm() {
      Object.keys(meta).forEach((k) => { meta[k] = '' })
    }
    function confirmIn() {
      if (!requiredOk()) return
      let pending = tasks.value.filter((t) => t.status === '待提交')
      if (!pending.length) {
        seq += 1
        const row = {
          id: seq,
          file: `${meta.name}.pdf`,
          caseName: meta.name,
          type: meta.type,
          size: '—',
          time: nowText(),
          status: '待提交',
          fmt: 'PDF',
        }
        tasks.value.unshift(row)
        pending = [row]
      }
      const ids = pending.map((t) => t.id)
      pending.forEach((row) => {
        row.status = '处理中'
        row.caseName = meta.name || row.caseName
        row.type = meta.type || row.type
      })
      const rows = useRows(props.page?.dataset || 'cases')
      rows.unshift({
        name: meta.name,
        kind: '历史案例',
        machine: meta.equip,
        ver: 'V1',
        time: nowText().slice(0, 10),
      })
      toast(`已确认入库 ${ids.length} 项，正在处理`)
      setTimeout(() => {
        tasks.value.forEach((row) => {
          if (ids.includes(row.id) && row.status === '处理中') row.status = '已完成'
        })
        toast('入库处理完成')
      }, 1400)
    }
    function viewTask(row) {
      openDrawer(row.file, [
        { label: '案例名称', value: row.caseName },
        { label: '试验类型', value: row.type },
        { label: '文件大小', value: row.size },
        { label: '上传时间', value: row.time },
        { label: '入库状态', value: row.status },
      ])
    }
    function removeTask(row) {
      confirm(`确认删除「${row.file}」？`, () => {
        tasks.value = tasks.value.filter((t) => t.id !== row.id)
        toast('已删除')
      })
    }

    return {
      uploadTabs, uploadMode, meta, equipOptions, typeOptions, stageOptions,
      tasks, stats, fileInput, dragOver,
      openPicker, onPick, onDrop, resetForm, confirmIn,
      iconKind, iconText, statusClass, viewTask, removeTask, toast,
    }
  },
}
</script>

<style scoped>
.case-in {
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
.upload-card { display: flex; flex-direction: column; min-height: 100%; }

.dropzone {
  position: relative;
  flex: 1;
  min-height: 320px;
  border: 1.5px dashed #b7d4ee;
  border-radius: 12px;
  background: linear-gradient(180deg, #f7fbfe 0%, #eef6fc 100%);
  cursor: pointer;
}
.dropzone.over, .dropzone:hover { border-color: #3d9adf; background: #f3f9fe; }

.type-tabs {
  position: absolute;
  top: 14px; left: 14px; right: 14px; z-index: 2;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}
.type-tabs button {
  height: 36px; border: 0;
  background: rgba(255, 255, 255, .92);
  color: #1668a8; font-size: 13.5px; border-radius: 8px; font-weight: 500;
  box-shadow: 0 1px 4px rgba(13, 78, 131, .08);
}
.type-tabs button.on {
  background: #fff; color: #0d4e83; font-weight: 700;
  box-shadow: 0 2px 8px rgba(13, 78, 131, .14);
}

.drop-body {
  height: 100%; min-height: 320px; padding: 70px 16px 28px;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
}
.cloud { width: 72px; height: 72px; margin-bottom: 8px; }
.cloud svg { width: 100%; height: 100%; }
.drop-title { font-size: 16px; color: #1668a8; font-weight: 700; }
.drop-sub { margin-top: 6px; color: #8a99a8; font-size: 13px; }
.pick-btn { margin-top: 18px; min-width: 120px; height: 38px; }

.form-card {
  display: flex;
  flex-direction: column;
  min-height: 100%;
}
.form-frame {
  border: 1.5px dashed #b7d4ee;
  border-radius: 12px;
  padding: 16px;
  min-height: 320px;
  display: flex;
  flex-direction: column;
  flex: 1;
  background: #fff;
}
.form-frame h3,
.task-frame h3 {
  font-size: 16px; color: var(--navy-2);
  display: flex; align-items: center; gap: 8px; margin-bottom: 14px;
}
.form-frame h3 i,
.task-frame h3 i { width: 4px; height: 16px; background: var(--blue); border-radius: 2px; display: inline-block; }
.task-frame {
  border: 1.5px dashed #b7d4ee;
  border-radius: 12px;
  padding: 16px 16px 8px;
}
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
.entry-form .span-field,
.entry-form :deep(.ta-field) { grid-column: 2 / -1; }
.form-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: auto; padding-top: 16px; }
.form-actions :deep(.el-button) { min-width: 88px; }

.stat-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
.stat {
  background: #f7fbfe; border: 1px solid #e6eef6; border-radius: 10px;
  padding: 16px 18px; display: flex; align-items: center; gap: 14px;
}
.stat-ico {
  width: 44px; height: 44px; border-radius: 50%;
  display: grid; place-items: center; flex: 0 0 auto;
}
.stat-ico svg { width: 22px; height: 22px; }
.stat-ico.all { background: #e8f2fb; color: #1668a8; }
.stat-ico.done { background: #fff6e6; color: #d48806; }
.stat-ico.run { background: #e8f2fb; color: #1668a8; }
.stat-ico.wait { background: #fff1e8; color: #e06a1a; }
.stat-label { color: #6d8092; font-size: 13.5px; }
.stat-value { margin-top: 2px; font-size: 26px; font-weight: 700; line-height: 1.2; }
.stat-value small { font-size: 13px; font-weight: 500; color: #8a99a8; }
.stat-value.all { color: #1668a8; }
.stat-value.done { color: #d48806; }
.stat-value.run { color: #1668a8; }
.stat-value.wait { color: #e06a1a; }

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
.file-ico.ppt { background: #c43e1c; }
.file-ico.img { background: #7b6bb0; }
.file-ico.zip { background: #d48806; }
.file-ico.file { background: #7c8fa2; }

.dot-status { display: inline-flex; align-items: center; gap: 6px; font-size: 13.5px; }
.dot-status i { width: 7px; height: 7px; border-radius: 50%; }
.dot-status.ok { color: #2f9e62; } .dot-status.ok i { background: #2fbf4a; }
.dot-status.run { color: #d48806; } .dot-status.run i { background: #faad14; }
.dot-status.wait { color: #e06a1a; } .dot-status.wait i { background: #fa8c16; }
</style>
