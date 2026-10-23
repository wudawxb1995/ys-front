<template>
  <div class="need-cfg">
    <div class="entry-title">
      <h2>{{ title || '试验设计需求配置' }}</h2>
      <p>配置试验设计任务的基本信息、试验对象、试验条件与方案设计要求，为后续方案生成提供结构化输入。</p>
    </div>

    <!-- 基本信息：左三右一（任务目标独占右侧） -->
    <section class="sec-frame">
      <h3><i></i>基本信息</h3>
      <div class="split-form">
        <div class="split-left">
          <div class="field-row">
            <label>任务名称<span class="req">*</span></label>
            <input v-model="form.taskName" placeholder="请输入试验任务名称" />
          </div>
          <div class="field-row">
            <label>任务来源</label>
            <select-field v-model="form.source" :options="sourceOptions" placeholder="请选择任务来源" />
          </div>
          <div class="field-row">
            <label>计划时间</label>
            <div class="date-range">
              <date-field v-model="form.planStart" placeholder="开始日期" />
              <span class="range-sep">-</span>
              <date-field v-model="form.planEnd" placeholder="结束日期" />
            </div>
          </div>
        </div>
        <div class="split-right">
          <label class="align-top">任务目标<span class="req">*</span></label>
          <text-area-field
            v-model="form.goal"
            tall
            :maxlength="500"
            placeholder="请描述本次试验的主要目标和预期成果"
          />
        </div>
      </div>
    </section>

    <!-- 试验对象：左右双栏，底行「对象描述 | 对象图片」并排 -->
    <section class="sec-frame">
      <h3><i></i>试验对象</h3>
      <div class="dual-cols">
        <div class="col">
          <div class="field-row">
            <label>装备类别<span class="req">*</span></label>
            <select-field v-model="form.equipCat" :options="equipCatOptions" placeholder="请选择装备类别" />
          </div>
          <div class="field-row">
            <label>装备型号</label>
            <input v-model="form.equipModel" placeholder="请输入装备型号" />
          </div>
          <div class="field-row grow">
            <label class="align-top">对象描述</label>
            <text-area-field
              v-model="form.objectDesc"
              tall
              :maxlength="300"
              placeholder="请描述试验对象的主要特性、功能及技术状态等信息"
            />
          </div>
        </div>
        <div class="col">
          <div class="field-row">
            <label>所属项目</label>
            <select-field v-model="form.project" :options="projectOptions" placeholder="请选择所属项目" />
          </div>
          <div class="field-row">
            <label>使用环境</label>
            <select-field v-model="form.env" :options="envOptions" placeholder="请选择使用环境" />
          </div>
          <div class="field-row grow">
            <label class="align-top">对象图片</label>
            <div
              class="img-upload tall"
              :class="{ over: imgOver }"
              @click="openImgPicker"
              @dragover.prevent="imgOver = true"
              @dragleave.prevent="imgOver = false"
              @drop.prevent="onImgDrop"
            >
              <template v-if="!form.imageName">
                <div class="cloud">
                  <svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
                    <path d="M46 42H20c-6 0-10-4.4-10-10.2C10 26 15 21 21.4 21c1.4-6.6 7-11.4 13.8-11.4 7.6 0 13.8 5.8 14.6 13.2C56 24.2 60 28.6 60 34c0 4.4-3.6 8-8 8h-6" stroke="#3d9adf" stroke-width="2.4" stroke-linecap="round"/>
                    <path d="M32 28v18" stroke="#3d9adf" stroke-width="2.6" stroke-linecap="round"/>
                    <path d="M24.5 35.5 32 28l7.5 7.5" stroke="#3d9adf" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <div class="up-title">点击上传图片</div>
                <div class="up-sub">支持 JPG、PNG，单个文件不超过 10MB</div>
              </template>
              <template v-else>
                <div class="img-name">{{ form.imageName }}</div>
                <button type="button" class="btn-link" @click.stop="clearImage">移除</button>
              </template>
              <input ref="imgInput" type="file" accept=".jpg,.jpeg,.png,.webp" hidden @change="onImgPick" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 试验条件：左右双栏，底行「试验资源 | 其他条件」并排 -->
    <section class="sec-frame">
      <h3><i></i>试验条件</h3>
      <div class="dual-cols">
        <div class="col">
          <div class="field-row">
            <label>试验场地</label>
            <input v-model="form.site" placeholder="请输入试验场地" />
          </div>
          <div class="field-row">
            <label>环境条件</label>
            <select-field v-model="form.condEnv" :options="condEnvOptions" placeholder="请选择环境条件" />
          </div>
          <div class="field-row grow">
            <label class="align-top">试验资源</label>
            <text-area-field
              v-model="form.resources"
              tall
              :maxlength="300"
              placeholder="请填写可用试验设备、仪器与保障资源"
            />
          </div>
        </div>
        <div class="col">
          <div class="field-row">
            <label>试验时间</label>
            <div class="date-range">
              <date-field v-model="form.testStart" placeholder="开始日期" />
              <span class="range-sep">-</span>
              <date-field v-model="form.testEnd" placeholder="结束日期" />
            </div>
          </div>
          <div class="field-row">
            <label>试验人员</label>
            <input v-model="form.staff" placeholder="请输入试验人员" />
          </div>
          <div class="field-row grow">
            <label class="align-top">其他条件</label>
            <text-area-field
              v-model="form.otherCond"
              tall
              :maxlength="300"
              placeholder="其他约束或补充条件（可选）"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- 方案设计要求：左二右一（重点关注内容独占右侧） -->
    <section class="sec-frame">
      <h3><i></i>方案设计要求</h3>
      <div class="split-form">
        <div class="split-left">
          <div class="field-row">
            <label>方案类型<span class="req">*</span></label>
            <select-field v-model="form.schemeType" :options="schemeTypeOptions" placeholder="请选择方案类型" />
          </div>
          <div class="field-row">
            <label>参考标准</label>
            <input v-model="form.standard" placeholder="请输入参考标准或规范编号" />
          </div>
        </div>
        <div class="split-right focus-wide">
          <label class="align-top">重点关注内容<span class="req">*</span></label>
          <text-area-field
            v-model="form.focus"
            tall
            :maxlength="300"
            placeholder="请说明方案设计需重点关注的指标、因子或约束"
          />
        </div>
      </div>
    </section>

    <div class="page-actions">
      <el-button @click="saveDraft">暂存</el-button>
      <el-button type="primary" @click="submit">确认提交</el-button>
    </div>
  </div>
</template>

<script>
import { reactive, ref } from 'vue'
import { useUi } from '@/composables/ui'
import SelectField from '@/components/SelectField.vue'
import DateField from '@/components/DateField.vue'
import TextAreaField from '@/components/TextAreaField.vue'

export default {
  components: { SelectField, DateField, TextAreaField },
  props: { page: Object, title: String },
  setup() {
    const { toast } = useUi()
    const imgInput = ref(null)
    const imgOver = ref(false)

    const form = reactive({
      taskName: '',
      source: '',
      planStart: '',
      planEnd: '',
      goal: '',
      equipCat: '',
      equipModel: '',
      objectDesc: '',
      project: '',
      env: '',
      imageName: '',
      site: '',
      condEnv: '',
      resources: '',
      testStart: '',
      testEnd: '',
      staff: '',
      otherCond: '',
      schemeType: '',
      standard: '',
      focus: '',
    })

    const sourceOptions = ['上级下达', '型号研制', '专项课题', '用户委托']
    const equipCatOptions = ['轮式装备', '履带装备', '农机装备', '通用装备']
    const projectOptions = ['某型装备定型', '性能鉴定专项', '可靠性增长课题', '综合试验课题']
    const envOptions = ['实验室', '野外', '高原', '湿热', '寒区']
    const condEnvOptions = ['常温常湿', '高温高湿', '低温低湿', '盐雾', '沙尘']
    const schemeTypeOptions = ['定型试验方案', '性能鉴定方案', '可靠性试验方案', '专项试验方案']

    function openImgPicker() { imgInput.value?.click() }
    function setImage(file) {
      if (!file) return
      form.imageName = file.name
      toast('已选择图片：' + file.name)
    }
    function onImgPick(e) { setImage(e.target.files?.[0]); e.target.value = '' }
    function onImgDrop(e) {
      imgOver.value = false
      const f = e.dataTransfer?.files?.[0]
      if (f) setImage(f)
    }
    function clearImage() { form.imageName = '' }

    function requiredOk() {
      if (!form.taskName?.trim() || !form.goal?.trim() || !form.equipCat || !form.schemeType || !form.focus?.trim()) {
        toast('请填写任务名称、任务目标、装备类别、方案类型与重点关注')
        return false
      }
      return true
    }
    function saveDraft() {
      toast('需求配置已暂存')
    }
    function submit() {
      if (!requiredOk()) return
      toast('需求配置已提交，可用于后续方案生成')
    }

    return {
      form, imgInput, imgOver,
      sourceOptions, equipCatOptions, projectOptions, envOptions, condEnvOptions, schemeTypeOptions,
      openImgPicker, onImgPick, onImgDrop, clearImage, saveDraft, submit,
    }
  },
}
</script>

<style scoped>
.need-cfg {
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 20px 22px 20px;
  box-shadow: 0 6px 18px rgba(15, 55, 95, .04);
}
.entry-title h2 { font-size: 20px; color: #0d4e83; font-weight: 700; letter-spacing: .3px; }
.entry-title p { margin-top: 4px; color: #6d8092; font-size: 13.5px; line-height: 1.6; }

.sec-frame {
  border: 1.5px dashed #b7d4ee;
  border-radius: 12px;
  padding: 16px 18px 18px;
  background: #fff;
}
.sec-frame h3 {
  font-size: 16px; color: var(--navy-2);
  display: flex; align-items: center; gap: 8px; margin-bottom: 16px;
}
.sec-frame h3 i {
  width: 4px; height: 16px; background: var(--blue); border-radius: 2px; display: inline-block;
}

/* 左 N 右 1：右侧大文本独占整列并等高 */
.split-form {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px 28px;
  align-items: stretch;
}
.split-left {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
}
.split-right {
  display: grid;
  grid-template-columns: 5.5em 1fr;
  gap: 10px;
  align-items: stretch;
  min-width: 0;
}
.split-right.focus-wide {
  grid-template-columns: 6.5em 1fr;
}
.split-right > label { padding-top: 8px; }

/* 左右双栏：底行大控件各占半宽并排，不通栏 */
.dual-cols {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px 28px;
  align-items: stretch;
}
.dual-cols .col {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
}
.dual-cols .field-row.grow {
  flex: 1;
  align-items: stretch;
}
.dual-cols .field-row.grow > label { padding-top: 8px; }

.field-row {
  display: grid;
  /* 全页统一标签列宽，各段输入框左边框与「任务名称」齐平 */
  grid-template-columns: 5.5em 1fr;
  gap: 10px;
  align-items: center;
}
.field-row > :not(label) { min-width: 0; width: 100%; }

.field-row label,
.split-right label {
  font-size: 13.5px; color: #4a5a6a; white-space: nowrap; padding-right: 0;
  text-align: left;
  box-sizing: border-box;
}
.field-row label.align-top,
.split-right label.align-top { align-self: start; }
.req { color: #f5222d; margin-left: 2px; }
.field-row input {
  width: 100%; height: 36px; border: 1px solid #d5e0ea; border-radius: 6px;
  background: #fff; padding: 0 12px; font-size: 14px; color: #3f5062;
  outline: none; font-family: inherit;
  box-sizing: border-box;
  margin: 0;
}
.field-row input:focus { border-color: #7eadd4; }
.field-row :deep(.sf-select),
.field-row :deep(.date-field),
.field-row :deep(.ta-field),
.split-right :deep(.ta-field) {
  width: 100%;
  height: 100%;
  min-height: 0;
  margin: 0;
  box-sizing: border-box;
}

.date-range {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  width: 100%;
}
.date-range > :not(.range-sep) {
  flex: 1;
  min-width: 0;
  width: auto;
}
.range-sep { color: #8a99a8; font-size: 13px; flex: 0 0 auto; }

.img-upload {
  min-height: 100px;
  border: 1.5px dashed #b7d4ee;
  border-radius: 12px;
  background: linear-gradient(180deg, #f7fbfe 0%, #eef6fc 100%);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 6px; cursor: pointer; padding: 16px;
  width: 100%;
  box-sizing: border-box;
}
.img-upload.tall { flex: 1; min-height: 100px; height: 100%; }
.img-upload.over, .img-upload:hover { border-color: #3d9adf; background: #f3f9fe; }
.img-upload .cloud { width: 48px; height: 48px; }
.img-upload .cloud svg { width: 100%; height: 100%; }
.up-title { font-size: 14px; color: #1668a8; font-weight: 600; }
.up-sub { font-size: 12.5px; color: #8a99a8; }
.img-name { font-size: 14px; color: #0d4e83; font-weight: 600; }
.btn-link { border: 0; background: transparent; color: #e06a1a; cursor: pointer; font-size: 13px; }

.page-actions {
  display: flex; justify-content: center; gap: 12px; padding-top: 4px;
}
.page-actions :deep(.el-button) { min-width: 108px; height: 38px; }
.page-actions :deep(.el-button--primary),
.page-actions :deep(.el-button--primary > span) { color: #ffffff !important; }
</style>
