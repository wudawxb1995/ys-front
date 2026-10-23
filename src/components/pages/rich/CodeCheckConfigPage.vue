<template>
  <div class="code-check">
    <div class="entry-title">
      <h2>{{ title || '代码检查任务配置' }}</h2>
      <p>选择需要检查的试验代码，配置检查范围及相关要求，明确代码纠错优化任务。</p>
    </div>

    <div class="main-grid">
        <section class="sec-frame info-panel">
          <h3><i></i>任务基本信息</h3>
          <el-form
            label-width="6em"
            label-position="right"
            require-asterisk-position="right"
            class="info-form"
            @submit.prevent
          >
            <el-form-item label="任务名称" required>
              <el-input v-model="form.name" placeholder="请输入任务名称" />
            </el-form-item>
            <el-form-item label="任务描述" required class="ta-item">
              <text-area-field
                v-model="form.desc"
                :rows="3"
                :maxlength="200"
                placeholder="请描述本次代码检查的目标与范围"
              />
            </el-form-item>
            <el-form-item label="代码来源" required>
              <el-radio-group v-model="form.source">
                <el-radio value="exist">已有代码</el-radio>
                <el-radio value="generated">生成成果</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="选择方式" required>
              <el-radio-group v-model="form.pick">
                <el-radio value="upload">上传文件</el-radio>
                <el-radio value="library">从已有代码中选择</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item v-if="form.pick === 'upload'" label="文件上传" required class="upload-item">
              <div class="upload-block">
                <div
                  class="dropzone"
                  :class="{ over: dragOver }"
                  @click="openPicker"
                  @dragover.prevent="dragOver = true"
                  @dragleave.prevent="dragOver = false"
                  @drop.prevent="onDrop"
                >
                  <div class="cloud" aria-hidden="true">
                    <svg viewBox="0 0 64 64" fill="none">
                      <path d="M46 42H20c-6 0-10-4.4-10-10.2C10 26 15 21 21.4 21c1.4-6.6 7-11.4 13.8-11.4 7.6 0 13.8 5.8 14.6 13.2C56 24.2 60 28.6 60 34c0 4.4-3.6 8-8 8h-6" stroke="#3d9adf" stroke-width="2.4" stroke-linecap="round"/>
                      <path d="M32 28v18" stroke="#3d9adf" stroke-width="2.6" stroke-linecap="round"/>
                      <path d="M24.5 35.5 32 28l7.5 7.5" stroke="#3d9adf" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                  <div class="drop-copy">
                    <div class="drop-title">点击上传文件，或将文件拖拽到此处</div>
                    <div class="drop-sub">支持 py、cpp、m、txt 等代码文件，单个文件不超过50MB</div>
                  </div>
                  <input
                    ref="fileInput"
                    type="file"
                    accept=".py,.cpp,.cc,.cxx,.h,.hpp,.m,.txt,.js,.ts,.c"
                    hidden
                    @change="onPick"
                  />
                </div>
                <div v-if="file" class="file-chip">
                  <span class="file-ico">{{ fileExt }}</span>
                  <div class="file-meta">
                    <b>{{ file.name }}</b>
                    <span>{{ file.size }}</span>
                  </div>
                  <button type="button" class="file-x" title="移除" @click="clearFile">×</button>
                </div>
              </div>
            </el-form-item>
            <el-form-item v-else label="选择代码" required>
              <select-field
                v-model="form.libId"
                :options="libOptions"
                placeholder="请从已有代码中选择"
              />
            </el-form-item>
          </el-form>
        </section>

        <section class="sec-frame preview-panel">
          <h3><i></i>源代码预览（只读）</h3>
          <div class="preview-head">
            <span>文件名：<b>{{ file ? file.name : '未选择文件' }}</b></span>
            <em>{{ file ? file.lang : '—' }}</em>
          </div>
          <div v-if="file" class="code-view">
            <div v-for="(row, i) in codeRows" :key="i" class="code-line">
              <span class="ln">{{ i + 1 }}</span>
              <span class="src" v-html="row" />
            </div>
          </div>
          <div v-else class="code-empty">请上传或选择代码文件后预览</div>
        </section>

        <section class="sec-frame scope-panel">
          <h3><i></i>检查范围选择</h3>
          <el-checkbox
            :model-value="scopeAll"
            :indeterminate="scopeIndet"
            @change="toggleAllScope"
          >全选</el-checkbox>
          <el-checkbox-group v-model="form.scopes" class="scope-grid">
            <el-checkbox v-for="opt in scopeOptions" :key="opt.key" :value="opt.key">
              {{ opt.label }}
            </el-checkbox>
          </el-checkbox-group>
        </section>

        <section class="sec-frame req-panel">
          <h3><i></i>检查要求</h3>
          <el-form label-width="5.5em" label-position="right" class="info-form req-form" @submit.prevent>
            <el-form-item label="检查重点" class="ta-item">
              <text-area-field
                v-model="form.focus"
                :rows="2"
                :maxlength="200"
                placeholder="请描述本次检查的重点关注内容"
              />
            </el-form-item>
            <el-form-item label="期望输出" class="ta-item">
              <text-area-field
                v-model="form.expect"
                :rows="2"
                :maxlength="200"
                placeholder="请描述期望输出的检查结果形式"
              />
            </el-form-item>
          </el-form>
        </section>
    </div>

    <div class="page-actions">
      <el-button @click="save">保存配置</el-button>
      <el-button type="primary" @click="submit">提交检查任务</el-button>
    </div>
  </div>
</template>

<script>
import { computed, reactive, ref, watch } from 'vue'
import { useUi } from '@/composables/ui'
import SelectField from '@/components/SelectField.vue'
import TextAreaField from '@/components/TextAreaField.vue'

const SAMPLE_PY = `import numpy as np
from scipy import integrate

class FlightController:
    def __init__(self, kp, ki, kd):
        self.kp = kp
        self.ki = ki
        self.kd = kd
        self.integral = 0.0
        self.prev_error = 0.0

    def compute_control(self, target, current, dt):
        error = target - current
        self.integral += error * dt
        derivative = (error - self.prev_error) / dt
        output = self.kp * error + self.ki * self.integral + self.kd * derivative
        self.prev_error = error
        return output
`

const KW = new Set([
  'and', 'as', 'assert', 'async', 'await', 'break', 'class', 'continue', 'def', 'del',
  'elif', 'else', 'except', 'False', 'finally', 'for', 'from', 'global', 'if', 'import',
  'in', 'is', 'lambda', 'None', 'nonlocal', 'not', 'or', 'pass', 'raise', 'return',
  'True', 'try', 'while', 'with', 'yield', 'include', 'using', 'namespace', 'public',
  'private', 'protected', 'virtual', 'override', 'void', 'int', 'double', 'float',
  'bool', 'const', 'static', 'new', 'this', 'function', 'end',
])

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function highlightLine(raw) {
  let i = 0
  let out = ''
  const line = String(raw)
  while (i < line.length) {
    const ch = line[i]
    if (ch === '#') {
      out += `<span class="cmt">${esc(line.slice(i))}</span>`
      break
    }
    if (ch === '/' && line[i + 1] === '/') {
      out += `<span class="cmt">${esc(line.slice(i))}</span>`
      break
    }
    if (ch === '"' || ch === "'") {
      let j = i + 1
      while (j < line.length && line[j] !== ch) {
        if (line[j] === '\\') j += 1
        j += 1
      }
      out += `<span class="str">${esc(line.slice(i, j + 1))}</span>`
      i = j + 1
      continue
    }
    if (/[A-Za-z_]/.test(ch)) {
      let j = i + 1
      while (j < line.length && /[A-Za-z0-9_]/.test(line[j])) j += 1
      const w = line.slice(i, j)
      if (KW.has(w)) out += `<span class="kw">${w}</span>`
      else if (/^[A-Z]/.test(w)) out += `<span class="cls">${w}</span>`
      else out += esc(w)
      i = j
      continue
    }
    if (/[0-9]/.test(ch)) {
      let j = i
      while (j < line.length && /[0-9.]/.test(line[j])) j += 1
      out += `<span class="num">${line.slice(i, j)}</span>`
      i = j
      continue
    }
    out += esc(ch)
    i += 1
  }
  return out || '&nbsp;'
}

function langOf(name) {
  const ext = (name.split('.').pop() || '').toLowerCase()
  if (ext === 'py') return 'Python'
  if (['cpp', 'cc', 'cxx', 'h', 'hpp', 'c'].includes(ext)) return 'C++'
  if (ext === 'm') return 'MATLAB'
  return 'Text'
}

function fmtSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default {
  components: { SelectField, TextAreaField },
  props: { page: Object, title: String },
  setup() {
    const { toast, confirm } = useUi()
    const fileInput = ref(null)
    const dragOver = ref(false)

    const libFiles = [
      {
        id: 'fc',
        name: 'flight_control.py',
        size: '1.2 KB',
        lang: 'Python',
        code: SAMPLE_PY,
      },
      {
        id: 'slip',
        name: 'slip_ratio.py',
        size: '0.6 KB',
        lang: 'Python',
        code: 'def slip_ratio(v_theory, v_actual):\n    return (v_theory - v_actual) / v_theory\n',
      },
      {
        id: 'pto',
        name: 'pto_calc.py',
        size: '0.8 KB',
        lang: 'Python',
        code: 'def pto_power(torque, rpm):\n    return torque * rpm / 9549\n',
      },
    ]
    const genFiles = [
      {
        id: 'gen1',
        name: 'generated_pid.py',
        size: '0.9 KB',
        lang: 'Python',
        code: 'class PID:\n    def __init__(self, kp, ki, kd):\n        self.kp, self.ki, self.kd = kp, ki, kd\n',
      },
    ]

    const scopeOptions = [
      { key: 'syntax', label: '语法检查' },
      { key: 'logic', label: '逻辑漏洞分析' },
      { key: 'style', label: '代码规范性检查' },
      { key: 'perf', label: '性能瓶颈分析' },
      { key: 'sec', label: '安全性检查' },
      { key: 'bound', label: '边界条件检查' },
      { key: 'exc', label: '异常处理检查' },
      { key: 'lib', label: '第三方库使用检查' },
    ]

    const form = reactive({
      name: '',
      desc: '',
      source: 'exist',
      pick: 'upload',
      libId: '',
      scopes: [],
      focus: '',
      expect: '',
    })

    const file = ref(null)

    const libOptions = computed(() => {
      const list = form.source === 'generated' ? genFiles : libFiles
      return list.map((f) => f.name)
    })
    const libMap = computed(() => {
      const list = form.source === 'generated' ? genFiles : libFiles
      return Object.fromEntries(list.map((f) => [f.name, f]))
    })

    const scopeAll = computed(() => form.scopes.length === scopeOptions.length)
    const scopeIndet = computed(() => form.scopes.length > 0 && !scopeAll.value)
    const fileExt = computed(() => (file.value?.name.split('.').pop() || 'py').toUpperCase())
    const codeRows = computed(() => (file.value?.code || '').replace(/\r\n/g, '\n').split('\n').map(highlightLine))

    function toggleAllScope(val) {
      form.scopes = val ? scopeOptions.map((o) => o.key) : []
    }
    function openPicker() {
      fileInput.value?.click()
    }
    function applyFile(raw, name, sizeLabel) {
      file.value = {
        name,
        size: sizeLabel,
        lang: langOf(name),
        code: raw,
      }
    }
    function readBlob(blob, name) {
      if (blob.size > 50 * 1024 * 1024) {
        toast('单个文件不超过 50MB')
        return
      }
      const reader = new FileReader()
      reader.onload = () => {
        applyFile(String(reader.result || ''), name, fmtSize(blob.size))
      }
      reader.readAsText(blob)
    }
    function onPick(e) {
      const f = e.target.files && e.target.files[0]
      e.target.value = ''
      if (f) readBlob(f, f.name)
    }
    function onDrop(e) {
      dragOver.value = false
      const f = e.dataTransfer?.files && e.dataTransfer.files[0]
      if (f) readBlob(f, f.name)
    }
    function clearFile() {
      file.value = null
    }
    function requiredOk() {
      if (!form.name?.trim()) {
        toast('请填写任务名称')
        return false
      }
      if (!form.desc?.trim()) {
        toast('请填写任务描述')
        return false
      }
      if (!form.source || !form.pick) {
        toast('请选择代码来源与选择方式')
        return false
      }
      if (!file.value) {
        toast('请上传或选择待检查代码')
        return false
      }
      return true
    }
    function save() {
      if (!requiredOk()) return
      toast('检查任务配置已保存')
    }
    function submit() {
      if (!requiredOk()) return
      if (!form.scopes.length) {
        toast('请至少选择一项检查范围')
        return
      }
      confirm('确认提交本次代码检查任务？', () => {
        toast('检查任务已提交')
      }, false)
    }

    watch(() => form.source, () => {
      form.libId = ''
      if (form.pick !== 'upload') file.value = null
    })
    watch(() => form.pick, (pick) => {
      if (pick === 'upload') {
        file.value = null
        return
      }
      const hit = libMap.value[form.libId]
      file.value = hit ? { ...hit } : null
    })
    watch(() => form.libId, (id) => {
      if (form.pick !== 'library') return
      const hit = libMap.value[id]
      if (hit) file.value = { ...hit }
    })

    return {
      form, file, fileInput, dragOver, scopeOptions, libOptions,
      scopeAll, scopeIndet, fileExt, codeRows,
      toggleAllScope, openPicker, onPick, onDrop, clearFile, save, submit,
    }
  },
}
</script>

<style scoped>
.code-check {
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

.main-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.08fr) minmax(0, 0.92fr);
  grid-template-rows: minmax(0, auto) minmax(0, auto);
  gap: 14px;
  align-items: stretch;
}
.info-panel { grid-column: 1; grid-row: 1; }
.preview-panel { grid-column: 2; grid-row: 1; }
.scope-panel { grid-column: 1; grid-row: 2; }
.req-panel { grid-column: 2; grid-row: 2; }

.sec-frame {
  border: 1.5px dashed #b7d4ee;
  border-radius: 12px;
  padding: 14px 16px 16px;
  background: #fff;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.sec-frame h3 {
  font-size: 15px; color: var(--navy-2);
  display: flex; align-items: center; gap: 8px; margin-bottom: 12px; flex: 0 0 auto;
}
.sec-frame h3 i {
  width: 4px; height: 15px; background: var(--blue); border-radius: 2px; display: inline-block;
}

.info-form :deep(.el-form-item) { margin-bottom: 14px; }
.info-form :deep(.el-form-item__label) {
  display: inline-flex !important;
  align-items: center;
  justify-content: flex-start;
  align-self: start;
  width: 6em !important;
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
  right: 6px; /* 相对输入框左移 4px，避免贴死 */
  top: 50%;
  transform: translateY(-50%);
  margin: 0;
  line-height: 1;
}
.info-form :deep(.el-form-item:last-child) { margin-bottom: 0; }
.info-form :deep(.el-radio) { margin-right: 22px; height: 32px; }
.info-form :deep(.el-input__inner) { color: #3f5062; }
.info-form :deep(.el-input__inner::placeholder),
.info-form :deep(.el-textarea__inner::placeholder) {
  color: #a8b8c6 !important;
  opacity: 1;
  font-weight: 400;
}
.info-form :deep(.el-textarea__inner) { color: #3f5062; }

.dropzone {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 72px;
  padding: 12px 14px;
  border: 1.5px dashed #b7d4ee;
  border-radius: 10px;
  background: linear-gradient(180deg, #f7fbfe 0%, #eef6fc 100%);
  cursor: pointer;
}
.dropzone.over,
.dropzone:hover { border-color: #3d9adf; background: #f3f9fe; }
.cloud { width: 42px; height: 42px; flex: 0 0 auto; }
.cloud svg { width: 100%; height: 100%; }
.drop-title { font-size: 13.5px; color: #1668a8; font-weight: 600; }
.drop-sub { margin-top: 4px; font-size: 12px; color: #8a99a8; }

.file-chip {
  margin-top: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border: 1px solid #e2ebf3;
  border-radius: 8px;
  background: #fff;
}
.file-ico {
  width: 32px; height: 32px; border-radius: 6px;
  background: linear-gradient(#f5c16c, #e09a2a);
  color: #fff; font-size: 10px; font-weight: 700;
  display: grid; place-items: center;
  flex: 0 0 auto;
}
.file-meta { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.file-meta b { font-size: 13.5px; color: #0d4e83; font-weight: 600; }
.file-meta span { font-size: 12px; color: #8a99a8; }
.file-x {
  border: 0; background: transparent; color: #8a99a8;
  font-size: 18px; line-height: 1; cursor: pointer; padding: 0 4px;
}
.file-x:hover { color: #d4380d; }

.scope-panel {
  overflow: hidden;
  padding-right: 18px;
}
.scope-panel :deep(.el-checkbox) { margin-right: 0; }
.scope-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  column-gap: 10px;
  row-gap: 20px;
  margin-top: 12px;
  min-width: 0;
}
.scope-grid :deep(.el-checkbox) {
  margin: 0;
  height: auto;
  max-width: 100%;
  min-width: 0;
  align-items: flex-start;
  white-space: normal;
}
.scope-grid :deep(.el-checkbox__label) {
  white-space: normal;
  line-height: 1.45;
  padding-left: 6px;
  overflow-wrap: break-word;
}

.preview-panel {
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}
.preview-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 13px;
  color: #5c7084;
  flex: 0 0 auto;
}
.preview-head b { color: #0d4e83; font-weight: 600; }
.preview-head em { font-style: normal; color: #1668a8; }
.code-view {
  flex: 1 1 auto;
  min-width: 0;
  min-height: 0;
  height: 0; /* 配合 flex，宽度跟面板走，超长只在框内滚动 */
  width: 100%;
  overflow-x: auto;
  overflow-y: auto;
  border: 1px solid #e2ebf3;
  border-radius: 8px;
  background: #f7fafd;
  padding: 8px 0;
  font-family: Consolas, "SFMono-Regular", Menlo, monospace;
  font-size: 12.5px;
  line-height: 1.7;
}
.code-line { display: flex; gap: 12px; padding: 0 12px; width: max-content; min-width: 100%; box-sizing: border-box; }
.code-line:hover { background: #eef5fb; }
.ln {
  width: 24px; flex: 0 0 auto; text-align: right;
  color: #b0bec8; user-select: none;
}
.src { flex: 1; min-width: 0; white-space: pre; color: #3f5062; }
.src :deep(.kw) { color: #7b4fc4; }
.src :deep(.str) { color: #389e0d; }
.src :deep(.num) { color: #d48806; }
.src :deep(.cmt) { color: #8a99a8; }
.src :deep(.cls) { color: #08979c; }
.code-empty {
  flex: 1;
  min-height: 180px;
  display: grid;
  place-items: center;
  color: #8a99a8;
  font-size: 13.5px;
  border: 1px dashed #d5e0ea;
  border-radius: 8px;
  background: #f7fafd;
}

.scope-panel,
.req-panel {
  min-height: 0;
}
.req-form :deep(.el-form-item) { margin-bottom: 8px; }
.req-panel :deep(.el-textarea__inner) {
  min-height: 52px !important;
  padding: 6px 10px 22px;
  line-height: 1.5;
}

.page-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 2px;
}
.page-actions :deep(.el-button + .el-button) { margin-left: 0; }
.page-actions :deep(.el-button--primary),
.page-actions :deep(.el-button--primary > span) { color: #ffffff !important; }

@media (max-width: 1280px) {
  .main-grid {
    grid-template-columns: 1fr;
    grid-template-rows: none;
  }
  .info-panel, .preview-panel, .scope-panel, .req-panel {
    grid-column: auto;
    grid-row: auto;
  }
  .scope-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
</style>
