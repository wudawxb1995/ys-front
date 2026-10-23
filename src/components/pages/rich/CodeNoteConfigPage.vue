<template>
  <div class="code-note">
    <div class="entry-title">
      <h2>{{ title || '代码注释任务配置' }}</h2>
      <p>选择需要加注释的试验代码，配置注释生成范围及相关要求，明确代码注释任务。</p>
    </div>

    <div class="top-grid">
      <section class="sec-frame">
        <h3><i></i>基本信息</h3>
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
          <el-form-item label="任务描述" class="ta-item">
            <text-area-field
              v-model="form.desc"
              :rows="3"
              :maxlength="200"
              placeholder="请描述本次注释任务的目标与范围"
            />
          </el-form-item>
        </el-form>
      </section>

      <section class="sec-frame source-panel">
        <h3><i></i>代码来源选择<span class="req">*</span></h3>
        <el-radio-group v-model="form.source" class="source-radios">
          <el-radio value="generated">生成代码</el-radio>
          <el-radio value="fixed">纠错后代码</el-radio>
          <el-radio value="exist">已有代码</el-radio>
        </el-radio-group>

        <h3 class="sub-h"><i></i>选择代码文件<span class="req">*</span></h3>
        <div class="upload-row">
          <div
            class="dropzone"
            :class="{ over: dragOver }"
            @click="openPicker"
            @dragover.prevent="dragOver = true"
            @dragleave.prevent="dragOver = false"
            @drop.prevent="onDrop"
          >
            <div class="file-ico-lg" aria-hidden="true">
              <svg viewBox="0 0 48 48" fill="none">
                <path d="M16 6h12l8 8v26a2 2 0 0 1-2 2H16a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" stroke="#3d9adf" stroke-width="2" fill="#eaf4fc"/>
                <path d="M28 6v8h8" stroke="#3d9adf" stroke-width="2" stroke-linejoin="round"/>
                <path d="M24 20v12" stroke="#3d9adf" stroke-width="2.2" stroke-linecap="round"/>
                <path d="M19 25l5-5 5 5" stroke="#3d9adf" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="drop-copy">
              <div class="drop-title">点击选择文件，或将文件拖拽到此处</div>
              <div class="drop-sub">支持 Python、C++、MATLAB 等代码文件</div>
              <el-button type="primary" size="small" @click.stop="openPicker">选择文件</el-button>
            </div>
            <input
              ref="fileInput"
              type="file"
              accept=".py,.cpp,.cc,.cxx,.h,.hpp,.m,.txt,.c,.js,.ts"
              hidden
              @change="onPick"
            />
          </div>
          <div v-if="file" class="file-chip">
            <span class="file-doc" aria-hidden="true">
              <svg viewBox="0 0 32 32" fill="none">
                <rect x="6" y="4" width="16" height="22" rx="2" stroke="#3d9adf" stroke-width="1.6" fill="#eaf4fc"/>
                <path d="M22 10h4v16a2 2 0 0 1-2 2H10" stroke="#3d9adf" stroke-width="1.6"/>
                <path d="M10 12h8M10 16h8M10 20h5" stroke="#7eadd4" stroke-width="1.4" stroke-linecap="round"/>
              </svg>
            </span>
            <div class="file-meta">
              <b>{{ file.name }}</b>
              <span>{{ file.size }}</span>
            </div>
            <button type="button" class="file-x" title="移除" @click="clearFile">×</button>
          </div>
        </div>
      </section>
    </div>

    <section class="sec-frame preview-panel">
      <h3>
        <span class="h3-left"><i></i>源代码预览</span>
        <span class="enc">
          文件编码
          <el-select v-model="form.encoding" style="width: 108px">
            <el-option label="UTF-8" value="UTF-8" />
            <el-option label="GBK" value="GBK" />
            <el-option label="GB2312" value="GB2312" />
          </el-select>
        </span>
      </h3>
      <div v-if="file" class="code-view">
        <div v-for="(row, i) in codeRows" :key="i" class="code-line">
          <span class="ln">{{ i + 1 }}</span>
          <span class="src" v-html="row" />
        </div>
      </div>
      <div v-else class="code-empty">请上传代码文件后预览</div>
    </section>

    <div class="bottom-grid">
      <section class="sec-frame scope-panel">
        <h3><i></i>注释范围与内容要求</h3>
        <el-checkbox-group v-model="form.scopes" class="scope-list">
          <el-checkbox v-for="opt in scopeOptions" :key="opt.key" :value="opt.key">
            <span class="scope-name">{{ opt.label }}</span>
            <span class="scope-desc">{{ opt.desc }}</span>
          </el-checkbox>
        </el-checkbox-group>
      </section>

      <section class="sec-frame spec-panel">
        <h3><i></i>注释规范要求</h3>
        <el-form
          label-width="7em"
          label-position="right"
          require-asterisk-position="right"
          class="info-form spec-form"
          @submit.prevent
        >
          <div class="spec-grid">
            <el-form-item label="注释语言" required>
              <select-field v-model="form.lang" :options="langOptions" placeholder="请选择注释语言" />
            </el-form-item>
            <el-form-item label="注释详细程度" required>
              <select-field v-model="form.detail" :options="detailOptions" placeholder="请选择详细程度" />
            </el-form-item>
            <el-form-item label="注释风格" required>
              <select-field v-model="form.style" :options="styleOptions" placeholder="请选择注释风格" />
            </el-form-item>
            <el-form-item label="其他要求" class="ta-item">
              <text-area-field
                v-model="form.extra"
                :rows="2"
                :maxlength="200"
                placeholder="请输入其他特殊要求（可选）"
              />
            </el-form-item>
          </div>
        </el-form>
      </section>
    </div>

    <div class="page-actions">
      <el-button @click="save">保存配置</el-button>
      <el-button type="primary" @click="submit">提交任务</el-button>
    </div>
  </div>
</template>

<script>
import { computed, reactive, ref } from 'vue'
import { useUi } from '@/composables/ui'
import SelectField from '@/components/SelectField.vue'
import TextAreaField from '@/components/TextAreaField.vue'

const KW = new Set([
  'and', 'as', 'assert', 'async', 'await', 'break', 'class', 'continue', 'def', 'del',
  'elif', 'else', 'except', 'False', 'finally', 'for', 'from', 'global', 'if', 'import',
  'in', 'is', 'lambda', 'None', 'nonlocal', 'not', 'or', 'pass', 'raise', 'return',
  'True', 'try', 'while', 'with', 'yield', 'include', 'using', 'namespace', 'void',
  'int', 'double', 'float', 'bool', 'const', 'function', 'end',
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
    if (ch === '"' || ch === "'") {
      const triple = line.slice(i, i + 3)
      if (triple === '"""' || triple === "'''") {
        const q = triple
        let j = i + 3
        while (j < line.length && line.slice(j, j + 3) !== q) j += 1
        out += `<span class="str">${esc(line.slice(i, Math.min(j + 3, line.length)))}</span>`
        i = j + 3
        continue
      }
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
    const file = ref(null)

    const scopeOptions = [
      { key: 'fn', label: '函数说明注释', desc: '生成函数的主要作用、功能描述及返回值说明' },
      { key: 'param', label: '参数含义注释', desc: '生成函数参数的含义、类型及取值说明' },
      { key: 'logic', label: '执行逻辑注释', desc: '对代码的主要处理步骤及逻辑关联进行说明' },
    ]
    const langOptions = ['中文', '英文']
    const detailOptions = ['简洁', '标准', '详细']
    const styleOptions = ['标准规范风格', 'Google 风格', 'NumPy 风格', '简洁行内风格']

    const form = reactive({
      name: '',
      desc: '',
      source: 'generated',
      encoding: 'UTF-8',
      scopes: [],
      lang: '',
      detail: '',
      style: '',
      extra: '',
    })

    const codeRows = computed(() => (
      (file.value?.code || '').replace(/\r\n/g, '\n').split('\n').map(highlightLine)
    ))

    function openPicker() {
      fileInput.value?.click()
    }
    function applyFile(raw, name, sizeLabel) {
      file.value = { name, size: sizeLabel, code: raw }
    }
    function readBlob(blob, name) {
      if (blob.size > 50 * 1024 * 1024) {
        toast('单个文件不超过 50MB')
        return
      }
      const reader = new FileReader()
      reader.onload = () => applyFile(String(reader.result || ''), name, fmtSize(blob.size))
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
      if (!form.source) {
        toast('请选择代码来源')
        return false
      }
      if (!file.value) {
        toast('请选择代码文件')
        return false
      }
      if (!form.lang || !form.detail || !form.style) {
        toast('请完善注释语言、详细程度与风格')
        return false
      }
      return true
    }
    function save() {
      if (!requiredOk()) return
      toast('注释任务配置已保存')
    }
    function submit() {
      if (!requiredOk()) return
      if (!form.scopes.length) {
        toast('请至少选择一项注释范围')
        return
      }
      confirm('确认提交本次代码注释任务？', () => {
        toast('注释任务已提交')
      }, false)
    }

    return {
      form, file, fileInput, dragOver, scopeOptions, langOptions, detailOptions, styleOptions, codeRows,
      openPicker, onPick, onDrop, clearFile, save, submit,
    }
  },
}
</script>

<style scoped>
.code-note {
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

.top-grid,
.bottom-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  align-items: stretch;
}

.sec-frame {
  border: 1.5px dashed #b7d4ee;
  border-radius: 12px;
  padding: 14px 16px 16px;
  background: #fff;
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
}
.sec-frame h3 {
  font-size: 15px; color: var(--navy-2);
  display: flex; align-items: center; gap: 8px; margin-bottom: 12px; flex: 0 0 auto;
}
.sec-frame h3 i {
  width: 4px; height: 15px; background: var(--blue); border-radius: 2px; display: inline-block;
}
.sec-frame h3 .req {
  color: #f5222d;
  font-size: 14px;
  font-weight: 500;
  margin-left: 4px;
  line-height: 1;
}
.sec-frame h3.sub-h { margin: 16px 0 12px; }
.source-radios { margin-bottom: 2px; }
.source-radios :deep(.el-radio) { margin-right: 18px; height: 32px; }

.info-form :deep(.el-form-item) { margin-bottom: 14px; }
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
.info-form :deep(.el-radio) { margin-right: 18px; height: 32px; }
.info-form :deep(.el-input__inner),
.info-form :deep(.el-textarea__inner) { color: #3f5062; }
.info-form :deep(.el-input__inner::placeholder),
.info-form :deep(.el-textarea__inner::placeholder) {
  color: #a8b8c6 !important;
  opacity: 1;
}
.ta-item :deep(.el-form-item__label),
.upload-item :deep(.el-form-item__label) {
  align-self: start;
}

.upload-row {
  display: flex;
  align-items: stretch;
  gap: 12px;
  min-width: 0;
}
.dropzone {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 84px;
  padding: 10px 12px;
  border: 1.5px dashed #b7d4ee;
  border-radius: 10px;
  background: linear-gradient(180deg, #f7fbfe 0%, #eef6fc 100%);
  cursor: pointer;
}
.dropzone.over,
.dropzone:hover { border-color: #3d9adf; background: #f3f9fe; }
.file-ico-lg { width: 36px; height: 36px; flex: 0 0 auto; }
.file-ico-lg svg { width: 100%; height: 100%; }
.drop-copy { display: flex; flex-direction: column; align-items: flex-start; gap: 2px; }
.drop-title { font-size: 13.5px; color: #1668a8; font-weight: 600; line-height: 1.3; }
.drop-sub { margin: 0 0 4px; font-size: 12px; color: #8a99a8; line-height: 1.3; }
.dropzone :deep(.el-button--primary),
.dropzone :deep(.el-button--primary > span) { color: #fff !important; }

.file-chip {
  flex: 0 0 200px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border: 1px solid #e2ebf3;
  border-radius: 8px;
  background: #fff;
}
.file-doc { width: 32px; height: 32px; flex: 0 0 auto; }
.file-doc svg { width: 100%; height: 100%; }
.file-meta { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.file-meta b {
  font-size: 13px; color: #0d4e83; font-weight: 600;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.file-meta span { font-size: 12px; color: #8a99a8; }
.file-x {
  border: 0; background: transparent; color: #8a99a8;
  font-size: 18px; line-height: 1; cursor: pointer;
}
.file-x:hover { color: #d4380d; }

.preview-panel h3 { justify-content: space-between; }
.h3-left { display: inline-flex; align-items: center; gap: 8px; }
.enc {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #5c7084;
  font-weight: 400;
}
.preview-panel { min-width: 0; overflow: hidden; }
.code-view {
  flex: 0 0 auto;
  min-width: 0;
  width: 100%;
  height: 240px;
  max-height: 240px;
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
.ln { width: 28px; flex: 0 0 auto; text-align: right; color: #b0bec8; user-select: none; }
.src { flex: 1; min-width: 0; white-space: pre; color: #3f5062; }
.src :deep(.kw) { color: #7b4fc4; }
.src :deep(.str) { color: #389e0d; }
.src :deep(.num) { color: #d48806; }
.src :deep(.cmt) { color: #8a99a8; }
.code-empty {
  height: 180px;
  display: grid;
  place-items: center;
  color: #8a99a8;
  font-size: 13.5px;
  border: 1px dashed #d5e0ea;
  border-radius: 8px;
  background: #f7fafd;
}

.scope-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.scope-list :deep(.el-checkbox) {
  display: flex !important;
  align-items: flex-start !important;
  margin-right: 0;
  height: auto;
  white-space: normal;
}
.scope-list :deep(.el-checkbox__input) {
  align-self: flex-start;
  margin-top: 3px;
  height: auto;
  line-height: 1;
}
.scope-list :deep(.el-checkbox__label) {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 8px 12px;
  line-height: 1.5;
  padding-left: 8px;
  padding-top: 0;
  white-space: normal;
}
.scope-name { color: #3f5062; font-weight: 600; }
.scope-desc { color: #8a99a8; font-size: 13px; font-weight: 400; }

.spec-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 16px;
  align-items: start;
}
.spec-form :deep(.el-form-item) {
  margin-bottom: 0;
  align-items: flex-start;
}
.spec-form :deep(.el-form-item__content) {
  align-items: flex-start;
  min-width: 0;
}
.spec-form :deep(.el-select),
.spec-form :deep(.sf-select) {
  width: 100%;
}
.spec-panel :deep(.el-textarea__inner) {
  min-height: 52px !important;
  padding: 6px 10px 22px;
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
  .top-grid, .bottom-grid, .spec-grid { grid-template-columns: 1fr; }
  .upload-row { flex-direction: column; }
  .file-chip { flex-basis: auto; }
}
</style>
