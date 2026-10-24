<template>
  <div class="rich-type-entry">
    <!-- 数据资源录入：对齐原型 5.2.5.1 资源录入页 -->
    <div v-if="isResourceEntry" class="res-entry">
      <div class="entry-title">
        <h2>{{ title || '数据资源录入' }}</h2>
        <p>统一录入定型资料、历史试验数据、标准规范及专业文献</p>
      </div>

      <div class="entry-split">
        <div class="panel upload-card">
          <div
            class="dropzone"
            :class="{ over: dragOver, busy: uploading }"
            @click="openPicker"
            @dragover.prevent="!uploading && (dragOver = true)"
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
              <template v-if="!pendingFiles.length">
                <div class="cloud">
                  <svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
                    <path d="M46 42H20c-6 0-10-4.4-10-10.2C10 26 15 21 21.4 21c1.4-6.6 7-11.4 13.8-11.4 7.6 0 13.8 5.8 14.6 13.2C56 24.2 60 28.6 60 34c0 4.4-3.6 8-8 8h-6" stroke="#3d9adf" stroke-width="2.4" stroke-linecap="round"/>
                    <path d="M32 28v18" stroke="#3d9adf" stroke-width="2.6" stroke-linecap="round"/>
                    <path d="M24.5 35.5 32 28l7.5 7.5" stroke="#3d9adf" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <div class="drop-title">拖拽文件至此处，或点击选择文件</div>
                <div class="drop-sub">支持 Word、PDF、Excel、图片及扫描件</div>
                <el-button type="primary" class="pick-btn" :disabled="uploading" @click.stop="openPicker">选择文件</el-button>
              </template>
              <div v-else class="pending-box" @click.stop>
                <div class="pending-title">已选择 {{ pendingFiles.length }} 个文件</div>
                <div class="pending-hint">请完善右侧资源信息后点击「确认录入」</div>
                <div class="pending-list">
                  <div v-for="(pf, i) in pendingFiles" :key="pf.uid" class="pending-chip">
                    <span class="file-ico" :class="iconKind(pf.fmt)">{{ iconText(pf.fmt) }}</span>
                    <span class="pending-name" :title="pf.name">{{ pf.name }}</span>
                    <span class="pending-size">{{ pf.size }}</span>
                    <button type="button" class="pending-rm" title="移除" @click="removePending(i)">×</button>
                  </div>
                </div>
                <div class="pending-actions">
                  <el-button @click="openPicker">继续添加</el-button>
                  <el-button @click="clearPending">清空</el-button>
                </div>
              </div>
            </div>
            <div v-if="uploading" class="upload-mask" @click.stop>
              <div class="spin" aria-hidden="true"></div>
              <div class="upload-title">正在上传文件</div>
              <div class="upload-name">{{ uploadHint }}</div>
              <el-progress :percentage="uploadPct" :stroke-width="8" />
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
              <input v-model="meta.name" placeholder="某型定型技术资料" />
              <label>所属项目<span class="req">*</span></label>
              <select-field v-model="meta.project" :options="projects" placeholder="请选择项目" />

              <label>资料类别<span class="req">*</span></label>
              <select-field v-model="meta.cat" :options="catOptions" placeholder="请选择类别" />
              <label>资源版本<span class="req">*</span></label>
              <input v-model="meta.version" placeholder="V1.0" />

              <label>来源单位<span class="req">*</span></label>
              <input v-model="meta.org" placeholder="试验单位" />
              <label>资料日期<span class="req">*</span></label>
              <date-field v-model="meta.date" placeholder="选择日期" />

              <label class="align-top">备注</label>
              <text-area-field
                v-model="meta.remark"
                :maxlength="200"
                placeholder="请输入备注信息（可选）"
              />
            </div>
            <div class="form-actions">
              <el-button @click="stash">暂存</el-button>
              <el-button type="primary" @click="confirmEntry">确认录入</el-button>
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
                <td colspan="6" class="empty">暂无录入任务，请选择文件并完善资源信息后点击「确认录入」</td>
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
        <el-button type="primary" style="width:100%;margin-top:4px" @click="addToList">加入导入清单</el-button>
      </div>
      <div class="panel">
        <h3 style="justify-content:space-between">
          <span style="display:flex;align-items:center;gap:8px"><i></i>批量导入清单</span>
          <span style="font-size:13px;color:#8a99a8;font-weight:400">支持单次批量导入（≥50篇 / ≥500MB）</span>
        </h3>
        <div style="display:flex;justify-content:flex-end;margin-bottom:12px">
          <el-button type="primary" @click="commitList">确认录入（{{ importList.length }}）</el-button>
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
import {
  guessFileUrl,
  registerResourceDetail,
} from '@/composables/resourceRegistry'
import {
  buildEquipmentReqDetail,
  isEquipmentReqDoc,
} from '@/data/equipmentReqDetail'
import { nowText } from '@/utils/format'
import SelectField from '@/components/SelectField.vue'
import DateField from '@/components/DateField.vue'
import TextAreaField from '@/components/TextAreaField.vue'

const TYPE_TABS = [
  { key: '定型资料', label: '定型资料' },
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
  components: { SelectField, DateField, TextAreaField },
  props: { page: Object, title: String },
  setup(props) {
    const rich = useRichPage(props)
    const { toast, confirm, openDrawer } = useUi()
    const fileInput = ref(null)
    const dragOver = ref(false)
    const uploading = ref(false)
    const uploadPct = ref(0)
    const uploadHint = ref('')
    const activeType = ref('定型资料')
    let seq = 2
    let pendingUid = 0
    const ALLOW_EXT = /\.(doc|docx|pdf|xls|xlsx|csv|jpg|jpeg|png|tif|tiff|bmp)$/i
    const MAX_BYTES = 500 * 1024 * 1024

    const isResourceEntry = computed(() => !props.page?.entryKey && props.page?.dataset === 'resources')

    /** 已选文件暂存区：确认录入前不进入「录入任务」表 */
    const pendingFiles = ref([])

    const meta = reactive({
      name: '某型定型技术资料',
      project: '定型试验项目',
      cat: '定型资料',
      version: 'V1.0',
      org: '试验单位',
      date: '2026-10-22',
      remark: '',
    })

    const tasks = ref([
      { id: 1, name: '定型技术资料.docx', cat: '定型资料', catLabel: '定型资料', size: '2.36 MB', version: 'V1.0', status: '已完成', fmt: 'DOCX', org: '试验单位', project: '定型试验项目', date: '2026-10-22' },
      { id: 2, name: '技术研究文献.pdf', cat: '专业文献', catLabel: '专业文献', size: '3.85 MB', version: 'V1.0', status: '已完成', fmt: 'PDF', org: '试验单位', project: '定型试验项目', date: '2026-10-22' },
    ])

    const projects = ['定型试验项目', '性能鉴定试验项目', '可靠性试验项目']
    const catOptions = TYPE_TABS.map((t) => ({ value: t.key, label: t.label }))

    const stats = computed(() => {
      const all = tasks.value.length
      const done = tasks.value.filter((t) => t.status === '已完成').length
      const run = tasks.value.filter((t) => t.status === '处理中').length
      const wait = pendingFiles.value.length
      return [
        { key: 'all', label: '本次文件', value: all },
        { key: 'done', label: '已完成', value: done },
        { key: 'run', label: '处理中', value: run },
        { key: 'wait', label: '待确认', value: wait },
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
      if (uploading.value) return
      fileInput.value?.click()
    }

    function readSlice(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve()
        reader.onerror = () => reject(new Error('read'))
        const chunk = file.size > 2 * 1024 * 1024 ? file.slice(0, 2 * 1024 * 1024) : file
        reader.readAsArrayBuffer(chunk)
      })
    }

    function runProgress(ms, onTick) {
      return new Promise((resolve) => {
        const start = Date.now()
        const timer = setInterval(() => {
          const pct = Math.min(90, Math.round(((Date.now() - start) / ms) * 90))
          onTick(pct)
          if (pct >= 90) {
            clearInterval(timer)
            resolve()
          }
        }, 80)
      })
    }

    async function addFiles(fileList) {
      const files = Array.from(fileList || [])
      if (!files.length) return
      if (uploading.value) {
        toast('文件正在上传，请稍候', 'warning')
        return
      }
      const ok = []
      let badFmt = 0
      let tooBig = 0
      files.forEach((file) => {
        if (!ALLOW_EXT.test(file.name)) badFmt += 1
        else if (file.size > MAX_BYTES) tooBig += 1
        else ok.push(file)
      })
      if (badFmt) toast(`有 ${badFmt} 个文件格式不支持`, 'error')
      if (tooBig) toast(`有 ${tooBig} 个文件超过 500 MB，无法上传`, 'error')
      if (!ok.length) return

      const total = ok.reduce((sum, f) => sum + (f.size || 0), 0)
      const duration = Math.min(4800, Math.max(700, Math.round(total / (1024 * 1024) * 380 + 600)))
      uploading.value = true
      uploadPct.value = 0
      uploadHint.value = ok.length === 1 ? ok[0].name : `共 ${ok.length} 个文件（${formatSize(total)}）`
      try {
        await runProgress(duration, (pct) => { uploadPct.value = pct })
        await readSlice(ok[0])
        uploadPct.value = 100
        ok.forEach((file) => {
          pendingUid += 1
          const fmt = extOf(file.name)
          pendingFiles.value.push({
            uid: pendingUid,
            name: file.name,
            size: isEquipmentReqDoc(file.name) ? '0.35 MB' : formatSize(file.size),
            fmt,
            fileUrl: guessFileUrl(file.name, file),
            pages: isEquipmentReqDoc(file.name) ? '48' : '—',
            file,
          })
        })
        if (!meta.name || meta.name === '某型定型技术资料') {
          meta.name = ok[0].name.replace(/\.[^.]+$/, '')
        }
        toast(`已选择 ${ok.length} 个文件，请完善资源信息后确认录入`, 'success')
      } catch {
        toast('文件上传失败，请重试', 'error')
      } finally {
        uploading.value = false
        uploadPct.value = 0
        uploadHint.value = ''
      }
    }

    function removePending(index) {
      pendingFiles.value.splice(index, 1)
    }
    function clearPending() {
      pendingFiles.value = []
      toast('已清空所选文件', 'success')
    }

    function buildTasksFromPending() {
      return pendingFiles.value.map((pf) => {
        seq += 1
        const displayName = pendingFiles.value.length === 1 && meta.name?.trim()
          ? (/\.[a-zA-Z0-9]+$/.test(meta.name.trim())
            ? meta.name.trim()
            : `${meta.name.trim()}.${String(pf.fmt || 'pdf').toLowerCase()}`)
          : pf.name
        return {
          id: seq,
          name: displayName,
          cat: meta.cat || activeType.value,
          catLabel: catLabelOf(meta.cat || activeType.value),
          size: pf.size,
          version: meta.version || 'V1.0',
          status: '处理中',
          fmt: pf.fmt,
          org: meta.org,
          project: meta.project,
          date: meta.date,
          remark: meta.remark,
          fileUrl: pf.fileUrl || guessFileUrl(displayName, pf.file),
          pages: pf.pages || (isEquipmentReqDoc(displayName) ? '48' : '—'),
          file: pf.file,
        }
      })
    }

    function onPick(e) {
      addFiles(e.target.files)
      e.target.value = ''
    }
    function onDrop(e) {
      dragOver.value = false
      if (uploading.value) {
        toast('文件正在上传，请稍候', 'warning')
        return
      }
      addFiles(e.dataTransfer?.files)
    }

    function requiredOk() {
      if (!meta.name?.trim() || !meta.project || !meta.cat || !meta.version?.trim() || !meta.org?.trim() || !meta.date) {
        toast('请填写资源名称、所属项目、资料类别、资源版本、来源单位与资料日期', 'error')
        return false
      }
      return true
    }

    function pushResource(row, status) {
      if (props.page?.dataset !== 'resources') return null
      const rows = useRows('resources')
      const modal = /XLS|CSV/.test(row.fmt) ? '表格' : /PNG|JPE?G|TIF|BMP/.test(row.fmt) ? '图像' : '文本'
      const time = nowText()
      const record = {
        name: row.name,
        cat: row.cat,
        fmt: row.fmt,
        modal,
        size: row.size,
        pages: row.pages || '—',
        status,
        by: 'Mona',
        time,
        fileUrl: row.fileUrl || '',
        version: row.version,
        project: row.project,
        org: row.org,
        date: row.date,
        remark: row.remark,
      }
      const existIdx = rows.findIndex((r) => r.name === record.name)
      if (existIdx >= 0) {
        Object.assign(rows[existIdx], record)
        return rows[existIdx]
      }
      rows.unshift(record)
      return record
    }

    function seedVectorResults(resourceName, time) {
      const chunks = useRows('vecChunks')
      const tasks = useRows('vecTasks')
      if (!chunks.some((c) => c.res === resourceName)) {
        const samples = isEquipmentReqDoc(resourceName)
          ? [
              { no: '#001', text: '本文件规定某型装备研制的总体目标、任务使命、系统组成与主要战术技术指标。', vec: '[0.18, -0.06, 0.41, 0.22]' },
              { no: '#012', text: '系统 MTBF 不低于 300 h（置信度 80%），MTTR 不大于 1.5 h。', vec: '[0.27, 0.11, -0.09, 0.48]' },
              { no: '#028', text: '定位精度（平面）≤ 5 cm（差分条件），本地闭环控制响应时延 ≤ 50 ms。', vec: '[0.09, 0.36, 0.14, -0.21]' },
              { no: '#045', text: '试验与鉴定应覆盖性能、五性、环境、电磁兼容、软件与安全性等科目。', vec: '[-0.03, 0.29, 0.37, 0.08]' },
            ]
          : [
              { no: '#001', text: `「${resourceName}」解析正文分块，用于语义检索与指标抽取。`, vec: '[0.11, 0.07, 0.29, -0.04]' },
              { no: '#002', text: `「${resourceName}」关键条款与结构化字段向量化结果。`, vec: '[0.24, -0.13, 0.18, 0.36]' },
            ]
        samples.reverse().forEach((s) => {
          chunks.unshift({
            res: resourceName,
            no: s.no,
            text: s.text,
            vec: s.vec,
            dim: '1024',
            time,
          })
        })
      }
      if (!tasks.some((t) => t.name === resourceName)) {
        tasks.unshift({
          name: resourceName,
          progress: 100,
          status: '已完成',
          dim: '1024',
          chunks: String(chunks.filter((c) => c.res === resourceName).length),
          cost: '8.6s',
          ok: '达标',
          time,
        })
      }
    }

    function finishParse(row) {
      const rows = useRows('resources')
      const target = rows.find((r) => r.name === row.name)
      if (!target) return
      const time = nowText()
      target.status = '已解析'
      target.time = time
      if (isEquipmentReqDoc(row.name)) {
        target.pages = '48'
        target.fileUrl = target.fileUrl || '/samples/某型装备研制总要求.pdf'
        target.size = target.size === '—' ? '0.35 MB' : target.size
        registerResourceDetail(target.name, buildEquipmentReqDetail({ ...target, time }))
      } else {
        if (/PDF/i.test(row.fmt) && (!target.pages || target.pages === '—')) {
          target.pages = String(Math.max(12, Math.min(86, Math.round((parseFloat(String(row.size)) || 8) * 4))))
        }
        registerResourceDetail(target.name, {
          name: target.name,
          fmt: target.fmt,
          size: target.size,
          pages: target.pages === '—' ? '—' : Number(target.pages) || target.pages,
          parsedAt: time,
          tableCount: 6,
          imageCount: /PNG|JPE?G|TIF|BMP/i.test(target.fmt) ? 12 : 4,
          paraCount: 86,
          indexStatus: '已建立',
          indexName: `idx-${Date.now()}`,
          indexAt: time,
          fileUrl: target.fileUrl || '',
          chapters: [
            { id: 'c1', title: '1 概述', level: 1 },
            {
              id: 'c2',
              title: '2 主体内容',
              level: 1,
              children: [
                { id: 'c2-1', title: '2.1 正文', level: 2 },
                { id: 'c2-2', title: '2.2 附表', level: 2 },
              ],
            },
            { id: 'c3', title: '3 结论', level: 1 },
          ],
        })
      }
      seedVectorResults(target.name, time)
    }

    function stash() {
      if (!requiredOk()) return
      if (!pendingFiles.value.length) {
        toast('请先选择文件后再暂存', 'warning')
        return
      }
      toast('资源信息已暂存，确认录入后才会写入录入任务', 'success')
    }

    function confirmEntry() {
      if (!requiredOk()) return
      if (!pendingFiles.value.length) {
        toast('请先选择文件，完善资源信息后再确认录入', 'warning')
        return
      }
      const batch = buildTasksFromPending()
      pendingFiles.value = []
      const ids = batch.map((t) => t.id)
      const names = batch.map((t) => t.name)
      batch.forEach((row) => {
        tasks.value.unshift(row)
        pushResource(row, '解析中')
      })
      toast(`已确认录入 ${ids.length} 项，正在解析`, 'success')
      setTimeout(() => {
        tasks.value.forEach((row) => {
          if (ids.includes(row.id) && row.status === '处理中') {
            row.status = '已完成'
            finishParse(row)
          }
        })
        names.forEach((name) => {
          const task = tasks.value.find((t) => t.name === name)
          if (task) finishParse(task)
        })
        toast('解析完成，已写入录入任务与数据资源管理', 'success')
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
        toast('已移除', 'success')
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
      pendingFiles,
      removePending,
      clearPending,
      tasks,
      stats,
      fileInput,
      dragOver,
      uploading,
      uploadPct,
      uploadHint,
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
.dropzone.busy { cursor: wait; pointer-events: auto; }
.upload-mask {
  position: absolute;
  inset: 0;
  z-index: 4;
  background: rgba(247, 251, 254, .92);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px 32px;
}
.spin {
  width: 36px;
  height: 36px;
  border: 3px solid #c8e0f5;
  border-top-color: #1668a8;
  border-radius: 50%;
  animation: spin .75s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.upload-title { margin-top: 12px; font-size: 15px; font-weight: 700; color: #0d4e83; }
.upload-name {
  margin: 6px 0 14px;
  max-width: 280px;
  color: #6d8092;
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.upload-mask :deep(.el-progress) { width: 240px; }
.upload-mask :deep(.el-progress__text) { color: #1668a8 !important; min-width: 36px; }

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

.pending-box {
  width: 100%;
  max-width: 420px;
  padding: 8px 4px 4px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 8px;
}
.pending-title { font-size: 15px; font-weight: 700; color: #0d4e83; text-align: center; }
.pending-hint { font-size: 12.5px; color: #8a99a8; text-align: center; margin-bottom: 4px; }
.pending-list {
  max-height: 140px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.pending-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  background: #fff;
  border: 1px solid #d5e0ea;
  border-radius: 8px;
}
.pending-name {
  flex: 1;
  min-width: 0;
  font-size: 13px;
  color: #3f5062;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.pending-size { font-size: 12px; color: #8a99a8; flex: 0 0 auto; }
.pending-rm {
  width: 22px;
  height: 22px;
  border: 0;
  border-radius: 50%;
  background: #f0f4f8;
  color: #6d8092;
  cursor: pointer;
  line-height: 1;
  font-size: 14px;
  flex: 0 0 auto;
}
.pending-rm:hover { background: #fdeceb; color: #d4380d; }
.pending-actions {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 4px;
}
.pending-actions :deep(.el-button + .el-button) { margin-left: 0; }

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
.entry-form :deep(.sf-select),
.entry-form :deep(.sf-select),
.entry-form :deep(.date-field) { width: 100%; }
.entry-form :deep(.ta-field) { grid-column: 2 / -1; }
.form-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: auto; padding-top: 16px; }
.form-actions :deep(.el-button) { min-width: 88px; }

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
