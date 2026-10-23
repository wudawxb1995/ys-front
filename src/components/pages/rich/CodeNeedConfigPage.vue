<template>
  <div class="code-need">
    <div class="entry-title">
      <h2>{{ title || '试验编码需求配置' }}</h2>
      <p>根据数字试验任务要求，配置试验代码生成需求，明确程序功能、编程语言及相关生成要求。</p>
    </div>

    <div class="page-grid">
      <section class="sec-frame">
        <h3><i></i>任务基础信息</h3>
        <el-form
          label-width="6.5em"
          label-position="right"
          require-asterisk-position="right"
          class="info-form"
          @submit.prevent
        >
          <div class="duo">
            <el-form-item label="任务名称" required>
              <el-input v-model="form.name" placeholder="请输入任务名称" />
            </el-form-item>
            <el-form-item label="所属项目" required>
              <select-field v-model="form.project" :options="projectOpts" placeholder="请选择所属项目" />
            </el-form-item>
            <el-form-item label="任务类型" required>
              <select-field v-model="form.taskType" :options="taskTypeOpts" placeholder="请选择任务类型" />
            </el-form-item>
            <el-form-item label="优先级" required>
              <select-field v-model="form.priority" :options="priorityOpts" placeholder="请选择优先级" />
            </el-form-item>
            <el-form-item label="试验领域" required>
              <select-field v-model="form.domain" :options="domainOpts" placeholder="请选择试验领域" />
            </el-form-item>
            <el-form-item label="计划完成时间">
              <date-field v-model="form.due" placeholder="请选择日期" clearable />
            </el-form-item>
          </div>
          <el-form-item label="任务描述" class="ta-item">
            <text-area-field v-model="form.desc" :rows="3" :maxlength="500" placeholder="请输入试验任务背景、目标及要求..." />
          </el-form-item>
        </el-form>
      </section>

      <section class="sec-frame">
        <h3><i></i>程序功能需求</h3>
        <el-form
          label-width="7.2em"
          label-position="right"
          require-asterisk-position="right"
          class="info-form fn-form"
          @submit.prevent
        >
          <el-form-item label="功能描述" required class="ta-item">
            <text-area-field v-model="form.fnDesc" :rows="2" :maxlength="1000" placeholder="请描述试验程序需要实现的主要功能、算法逻辑及计算流程..." />
          </el-form-item>
          <el-form-item label="关键技术要求" class="ta-item">
            <text-area-field v-model="form.tech" :rows="2" :maxlength="500" placeholder="请输入关键算法、涉及的理论模型或技术要点..." />
          </el-form-item>
          <el-form-item label="特殊约束条件" class="ta-item">
            <text-area-field v-model="form.constraint" :rows="2" :maxlength="500" placeholder="请输入运行环境、性能要求、精度要求等特殊约束条件..." />
          </el-form-item>
        </el-form>
      </section>

      <section class="sec-frame">
        <h3><i></i>编程语言选择</h3>
        <el-form
          label-width="7.2em"
          label-position="right"
          require-asterisk-position="right"
          class="info-form"
          @submit.prevent
        >
          <el-form-item label="目标编程语言" required class="lang-item">
            <div class="lang-cards">
              <button
                v-for="lang in langs"
                :key="lang.id"
                type="button"
                class="lang-card"
                :class="{ on: form.lang === lang.id }"
                @click="form.lang = lang.id"
              >
                <span class="lang-ico" v-html="lang.svg" />
                <b>{{ lang.name }}</b>
              </button>
            </div>
          </el-form-item>
        </el-form>
      </section>

      <section class="sec-frame">
        <h3><i></i>输入输出要求</h3>
        <el-form
          label-width="7.2em"
          label-position="right"
          require-asterisk-position="right"
          class="info-form io-form"
          @submit.prevent
        >
          <div class="duo io-duo">
            <el-form-item label="输入数据要求" required class="ta-item">
              <text-area-field v-model="form.inputReq" :rows="3" :maxlength="500" placeholder="请输入输入数据的格式、类型、数据结构及示例..." />
            </el-form-item>
            <el-form-item label="输出结果要求" required class="ta-item">
              <text-area-field v-model="form.outputReq" :rows="3" :maxlength="500" placeholder="请输入输出结果的格式、内容、精度要求及示例..." />
            </el-form-item>
          </div>
        </el-form>
      </section>

      <section class="sec-frame">
        <h3><i></i>生成要求设置</h3>
        <el-form
          label-width="6.5em"
          label-position="right"
          require-asterisk-position="right"
          class="info-form"
          @submit.prevent
        >
          <div class="duo">
            <el-form-item label="代码风格要求">
              <select-field v-model="form.style" :options="styleOpts" placeholder="请选择代码风格" />
            </el-form-item>
            <el-form-item label="代码注释要求">
              <select-field v-model="form.comment" :options="commentOpts" placeholder="请选择注释要求" />
            </el-form-item>
            <el-form-item label="代码完整性">
              <select-field v-model="form.complete" :options="completeOpts" placeholder="请选择完整性要求" />
            </el-form-item>
            <el-form-item label="示例数据要求">
              <select-field v-model="form.sample" :options="sampleOpts" placeholder="请选择示例数据要求" />
            </el-form-item>
          </div>
          <el-form-item label="其他要求" class="ta-item">
            <text-area-field v-model="form.extra" :rows="2" :maxlength="500" placeholder="请输入其他生成要求，如代码结构、模块划分、优化建议等..." />
          </el-form-item>
        </el-form>
      </section>

      <section class="sec-frame">
        <h3><i></i>其他信息</h3>
        <el-form label-width="6.5em" label-position="right" class="info-form" @submit.prevent>
          <el-form-item label="参考资料" class="upload-item">
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
              <div>
                <div class="drop-title">点击上传文件，或拖拽文件到此处</div>
                <div class="drop-sub">支持 Word、PDF、Excel、图片及压缩包</div>
              </div>
              <input ref="fileInput" type="file" multiple hidden @change="onPick">
            </div>
            <div v-if="files.length" class="file-list">
              <div v-for="(f, i) in files" :key="i" class="file-chip">
                <b>{{ f.name }}</b>
                <span>{{ f.size }}</span>
                <button type="button" class="file-x" @click.stop="removeFile(i)">×</button>
              </div>
            </div>
          </el-form-item>
          <el-form-item label="备注说明" class="ta-item">
            <text-area-field v-model="form.remark" :rows="2" :maxlength="500" placeholder="请输入备注信息（可选）" />
          </el-form-item>
        </el-form>
      </section>
    </div>

    <div class="page-actions">
      <el-button @click="saveDraft">暂存</el-button>
      <el-button type="primary" @click="save">保存需求</el-button>
    </div>
  </div>
</template>

<script>
import { reactive, ref } from 'vue'
import { useUi } from '@/composables/ui'
import SelectField from '@/components/SelectField.vue'
import DateField from '@/components/DateField.vue'
import TextAreaField from '@/components/TextAreaField.vue'

const PY = `<svg viewBox="0 0 48 48"><path fill="#3776AB" d="M24.1 6c-8 0-7.5 3.5-7.5 3.5v4h7.6v1.2H13S6 13.8 6 24.1c0 10.3 5.7 9.9 5.7 9.9h3.4v-4.8s-.2-5.7 5.6-5.7h8.1s5.4.1 5.4-5.2V9.6S35.1 6 24.1 6zm-4.1 2.6a1.8 1.8 0 1 1 0 3.6 1.8 1.8 0 0 1 0-3.6z"/><path fill="#FFD43B" d="M23.9 42c8 0 7.5-3.5 7.5-3.5v-4h-7.6v-1.2h11.2S42 34.2 42 23.9c0-10.3-5.7-9.9-5.7-9.9h-3.4v4.8s.2 5.7-5.6 5.7h-8.1s-5.4-.1-5.4 5.2v8.8S12.9 42 23.9 42zm4.1-2.6a1.8 1.8 0 1 1 0-3.6 1.8 1.8 0 0 1 0 3.6z"/></svg>`
const CPP = `<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="16" fill="#00599C"/><path fill="#fff" d="M19.2 31.2c-4.2-2.4-5.6-7.6-3.2-11.8 2.4-4.2 7.6-5.6 11.8-3.2l-1.6 2.8c-2.6-1.5-5.9-.6-7.4 2-1.5 2.6-.6 5.9 2 7.4l-1.6 2.8z"/><text x="26" y="28" fill="#fff" font-size="11" font-weight="700" font-family="Arial">++</text></svg>`
const MAT = `<svg viewBox="0 0 48 48"><path fill="#E87722" d="M8 34 18 10l8 16 6-10 8 18H8z"/><path fill="#6CACE4" d="M18 10 8 34h12L18 10z"/></svg>`

function fmtSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default {
  components: { SelectField, DateField, TextAreaField },
  props: { page: Object, title: String },
  setup() {
    const { toast } = useUi()
    const fileInput = ref(null)
    const dragOver = ref(false)
    const files = ref([])

    const form = reactive({
      name: '', project: '', taskType: '', priority: '', domain: '', due: '', desc: '',
      fnDesc: '', tech: '', constraint: '',
      lang: 'python',
      inputReq: '', outputReq: '',
      style: '', comment: '', complete: '', sample: '', extra: '',
      remark: '',
    })

    const langs = [
      { id: 'python', name: 'Python', svg: PY },
      { id: 'cpp', name: 'C++', svg: CPP },
      { id: 'matlab', name: 'MATLAB', svg: MAT },
    ]

    function openPicker() { fileInput.value?.click() }
    function addFiles(list) {
      Array.from(list || []).forEach((f) => {
        files.value.push({ name: f.name, size: fmtSize(f.size) })
      })
    }
    function onPick(e) {
      addFiles(e.target.files)
      e.target.value = ''
    }
    function onDrop(e) {
      dragOver.value = false
      addFiles(e.dataTransfer?.files)
    }
    function removeFile(i) { files.value.splice(i, 1) }

    function requiredOk() {
      if (!form.name?.trim() || !form.project || !form.taskType || !form.priority || !form.domain) {
        toast('请完善任务基础信息中的必填项')
        return false
      }
      if (!form.fnDesc?.trim()) {
        toast('请填写功能描述')
        return false
      }
      if (!form.lang) {
        toast('请选择目标编程语言')
        return false
      }
      if (!form.inputReq?.trim() || !form.outputReq?.trim()) {
        toast('请填写输入数据要求与输出结果要求')
        return false
      }
      return true
    }
    function saveDraft() { toast('需求配置已暂存') }
    function save() {
      if (!requiredOk()) return
      toast('编码需求已保存')
    }

    return {
      form, files, fileInput, dragOver, langs,
      projectOpts: ['牵引性能试验', '动力输出试验', '可靠性试验', '整机试验'],
      taskTypeOpts: ['新研编码', '复用改造', '纠错优化'],
      priorityOpts: ['高', '中', '低'],
      domainOpts: ['动力传动', '液压', '电气', '整机'],
      styleOpts: ['PEP8', 'Google 风格', '项目规范'],
      commentOpts: ['完整注释', '关键注释', '无需注释'],
      completeOpts: ['可运行完整程序', '核心函数', '代码片段'],
      sampleOpts: ['提供测试用例', '仅接口说明', '不需要'],
      openPicker, onPick, onDrop, removeFile, saveDraft, save,
    }
  },
}
</script>

<style scoped>
.code-need {
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

.page-grid {
  display: grid;
  grid-template-columns: 1.12fr 0.88fr;
  gap: 14px;
  align-items: stretch;
}
.sec-frame {
  border: 1.5px dashed #b7d4ee;
  border-radius: 12px;
  padding: 14px 16px 16px;
  background: #fff;
  min-width: 0;
}
.sec-frame h3 {
  font-size: 15px; color: var(--navy-2);
  display: flex; align-items: center; gap: 8px; margin-bottom: 12px;
}
.sec-frame h3 i {
  width: 4px; height: 15px; background: var(--blue); border-radius: 2px; display: inline-block;
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
  content: none !important; margin: 0 !important;
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
.ta-item :deep(.el-form-item__label),
.upload-item :deep(.el-form-item__label),
.lang-item :deep(.el-form-item__label) { align-self: start; }
.info-form :deep(.el-form-item__content) { flex: 1; min-width: 0; }
.info-form :deep(.el-textarea__inner) { min-height: 72px; }
.fn-form :deep(.el-textarea__inner) {
  min-height: 56px !important;
  padding: 6px 10px 22px;
  line-height: 1.5;
}

.duo {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 16px;
  align-items: start;
}
.io-duo { gap: 12px 20px; }
.io-form :deep(.el-form-item) { align-items: flex-start; }
.io-form :deep(.el-textarea__inner) {
  min-height: 88px !important;
}

.lang-cards {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  width: 100%;
}
.lang-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 92px;
  padding: 10px 8px;
  border: 1.5px solid #d5e0ea;
  border-radius: 10px;
  background: #fff;
  cursor: pointer;
  color: #3f5062;
}
.lang-card:hover { border-color: #8eb4d4; background: #f7fbfe; }
.lang-card.on {
  border-color: #3d9adf;
  background: #eef6fc;
  box-shadow: 0 0 0 2px rgba(61, 154, 223, .25);
  color: #0d4e83;
}
.lang-card b { font-size: 13.5px; font-weight: 600; }
.lang-ico { width: 36px; height: 36px; }
.lang-ico :deep(svg) { width: 100%; height: 100%; }

.dropzone {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  box-sizing: border-box;
  min-height: 78px;
  padding: 10px 12px;
  border: 1.5px dashed #b7d4ee;
  border-radius: 10px;
  background: linear-gradient(180deg, #f7fbfe 0%, #eef6fc 100%);
  cursor: pointer;
}
.dropzone.over,
.dropzone:hover { border-color: #3d9adf; }
.cloud { width: 40px; height: 40px; flex: 0 0 auto; }
.cloud svg { width: 100%; height: 100%; }
.drop-title { font-size: 13.5px; color: #1668a8; font-weight: 600; line-height: 1.3; }
.drop-sub { margin-top: 2px; font-size: 12px; color: #8a99a8; line-height: 1.3; }
.file-list { display: flex; flex-direction: column; gap: 6px; margin-top: 8px; }
.file-chip {
  display: flex; align-items: center; gap: 8px;
  padding: 6px 10px; border: 1px solid #e2ebf3; border-radius: 8px;
}
.file-chip b { font-size: 13px; color: #0d4e83; }
.file-chip span { font-size: 12px; color: #8a99a8; }
.file-x { margin-left: auto; border: 0; background: transparent; color: #8a99a8; cursor: pointer; font-size: 16px; }
.file-x:hover { color: #d4380d; }

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
  .page-grid, .duo, .lang-cards { grid-template-columns: 1fr; }
}
</style>
