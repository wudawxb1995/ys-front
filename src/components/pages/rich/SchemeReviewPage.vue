<template>
  <div class="scheme-review">
    <div class="entry-title">
      <h2>{{ title || '试验方案人工校核' }}</h2>
      <p>对照方案基本信息与正文内容进行人工校核，按章节登记意见并提交校核结果。</p>
    </div>

    <div class="top-grid">
      <!-- 方案基本信息 -->
      <section class="sec-frame info-panel">
        <h3><i></i>方案基本信息</h3>
        <el-form
          label-width="7.2em"
          label-position="right"
          require-asterisk-position="right"
          class="info-form"
          @submit.prevent
        >
          <div class="info-grid">
            <el-form-item label="试验方案名称" required>
              <el-input v-model="meta.name" placeholder="请输入试验方案名称" />
            </el-form-item>
            <el-form-item label="方案版本" required>
              <el-select v-model="meta.ver" placeholder="请选择方案版本" style="width:100%">
                <el-option v-for="v in verOptions" :key="v" :label="v" :value="v" />
              </el-select>
            </el-form-item>

            <el-form-item label="所属对象" required>
              <el-select v-model="meta.equip" placeholder="请选择所属对象" style="width:100%">
                <el-option v-for="e in equipOptions" :key="e" :label="e" :value="e" />
              </el-select>
            </el-form-item>
            <el-form-item label="试验类型" required>
              <el-select v-model="meta.type" placeholder="请选择试验类型" style="width:100%">
                <el-option v-for="t in typeOptions" :key="t" :label="t" :value="t" />
              </el-select>
            </el-form-item>

            <el-form-item label="方案来源">
              <el-input v-model="meta.source" disabled />
            </el-form-item>
            <el-form-item label="生成时间">
              <date-field v-model="meta.time" placeholder="选择日期" />
            </el-form-item>
          </div>
          <el-form-item label="方案简介" class="intro-item">
            <text-area-field
              v-model="meta.intro"
              :maxlength="200"
              :rows="3"
              placeholder="请简要描述方案背景、目标与适用范围"
            />
          </el-form-item>
        </el-form>
      </section>

      <!-- 章节目录 -->
      <section class="sec-frame chapter-panel">
        <h3><i></i>章节目录</h3>
        <div class="chapter-list">
          <button
            v-for="(ch, i) in chapters"
            :key="ch.id"
            type="button"
            class="chapter-item"
            :class="{ on: activeChapter === i }"
            @click="activeChapter = i"
          >
            <span class="ch-ico" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
                <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/>
                <path d="M14 3v5h5"/>
              </svg>
            </span>
            <span class="ch-text">{{ i + 1 }}. {{ ch.title }}</span>
          </button>
        </div>
      </section>
    </div>

    <div class="bottom-grid">
      <!-- 方案正文 -->
      <section class="sec-frame body-panel">
        <h3><i></i>方案正文</h3>
        <div class="editor-shell">
          <div class="editor-toolbar">
            <el-select
              v-model="editor.font"
              style="width:100px"
              @visible-change="onToolbarFocus"
              @change="applyFont"
            >
              <el-option label="宋体" value="宋体" />
              <el-option label="黑体" value="黑体" />
              <el-option label="微软雅黑" value="微软雅黑" />
            </el-select>
            <el-select
              v-model="editor.size"
              style="width:72px"
              @visible-change="onToolbarFocus"
              @change="applyFontSize"
            >
              <el-option label="12" value="12" />
              <el-option label="14" value="14" />
              <el-option label="16" value="16" />
            </el-select>
            <div class="tb-sep" />
            <button type="button" class="tb-btn" :class="{ on: fmt.bold }" title="加粗" @mousedown.prevent="execFmt('bold')"><b>B</b></button>
            <button type="button" class="tb-btn" :class="{ on: fmt.italic }" title="斜体" @mousedown.prevent="execFmt('italic')"><i>I</i></button>
            <button type="button" class="tb-btn" :class="{ on: fmt.underline }" title="下划线" @mousedown.prevent="execFmt('underline')"><u>U</u></button>
            <div class="tb-sep" />
            <button type="button" class="tb-btn wide" :class="{ on: fmt.list }" title="项目列表" @mousedown.prevent="execFmt('insertUnorderedList')">列表</button>
            <button type="button" class="tb-btn wide" title="插入链接" @mousedown.prevent="insertLink">链接</button>
            <button type="button" class="tb-btn wide" title="插入图片" @mousedown.prevent="insertImage">图片</button>
            <input ref="imgInput" type="file" accept="image/*" hidden @change="onPickImage">
          </div>
          <div
            ref="editorEl"
            class="editor-body"
            contenteditable="true"
            :style="{ fontFamily: editor.font, fontSize: editor.size + 'px' }"
            @input="onEditorInput"
            @mouseup="syncFmt"
            @keyup="syncFmt"
            @focus="saveSelection"
          />
          <div class="editor-foot">
            <span>字数：{{ wordCount }}</span>
            <span>最后保存时间：{{ savedAt }}</span>
          </div>
        </div>
      </section>

      <!-- 人工校核意见 -->
      <section class="sec-frame opinion-panel">
        <h3><i></i>人工校核意见</h3>
        <div class="table-wrap">
          <el-table
            :data="opinions"
            class="opinion-table"
            height="100%"
            :header-cell-style="tableHeaderStyle"
            table-layout="auto"
          >
            <el-table-column type="index" label="序号" width="58" align="center" />
            <el-table-column prop="chapter" label="章节" min-width="120" />
            <el-table-column prop="opinion" label="校核意见" min-width="180" />
            <el-table-column label="处理状态" width="100" align="center">
              <template #default="{ row }">
                <span class="dot-status" :class="statusClass(row.status)">
                  <i></i>{{ row.status }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="112" align="center">
              <template #default="{ row }">
                <div class="ops">
                  <a @click="editOpinion(row)">编辑</a>
                  <a class="danger" @click="removeOpinion(row)">删除</a>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div class="opinion-actions">
          <el-button @click="addOpinion">+ 新增校核意见</el-button>
        </div>
      </section>
    </div>

    <div class="page-actions">
      <el-button @click="preview">预览方案</el-button>
      <el-button @click="save">保存修改</el-button>
      <el-button type="primary" @click="submit">提交校核结果</el-button>
    </div>

    <el-dialog v-model="dlgVisible" :title="dlgTitle" width="480px" destroy-on-close align-center>
      <el-form label-width="5.5em" require-asterisk-position="right" class="dlg-form">
        <el-form-item label="章节" required>
          <el-select v-model="dlgForm.chapter" placeholder="请选择章节" style="width:100%">
            <el-option
              v-for="(ch, i) in chapters"
              :key="ch.id"
              :label="`${i + 1}. ${ch.title}`"
              :value="ch.title"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="校核意见" required>
          <text-area-field
            v-model="dlgForm.opinion"
            :maxlength="200"
            :rows="4"
            placeholder="请填写校核意见"
          />
        </el-form-item>
        <el-form-item label="处理状态">
          <el-select v-model="dlgForm.status" style="width:100%">
            <el-option v-for="s in statusOptions" :key="s" :label="s" :value="s" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dlgVisible = false">取消</el-button>
        <el-button type="primary" @click="saveOpinion">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'
import { ElMessageBox } from 'element-plus'
import { useUi } from '@/composables/ui'
import DateField from '@/components/DateField.vue'
import TextAreaField from '@/components/TextAreaField.vue'

export default {
  components: { DateField, TextAreaField },
  props: { page: Object, title: String },
  setup() {
    const { toast, confirm, openDrawer } = useUi()
    const activeChapter = ref(0)
    const editorEl = ref(null)
    const imgInput = ref(null)
    const fmt = reactive({ bold: false, italic: false, underline: false, list: false })
    let savedRange = null
    let opinionSeq = 4

    const meta = reactive({
      name: '某型定型试验方案（校核稿）',
      ver: 'V3.2',
      equip: '某型',
      type: '定型试验',
      source: '智能生成',
      time: '2026-10-20',
      intro: '本方案用于某型定型鉴定试验，涵盖牵引、动力输出与可靠性等考核项目。',
    })

    const verOptions = ['V1.0', 'V2.0', 'V3.0', 'V3.2', 'V4.0']
    const equipOptions = ['某型', 'XX-100', 'XX-200', '轮式拖拉机']
    const typeOptions = ['定型试验', '鉴定试验', '摸底试验', '补充试验']
    const statusOptions = ['待处理', '处理中', '已处理', '已关闭']

    const editor = reactive({ font: '微软雅黑', size: '14' })
    const savedAt = ref('2026-10-22 14:30:15')
    const bodyText = ref('')

    const chapters = ref([
      {
        id: 1,
        title: '试验任务与目的',
        html: `<h4>1. 试验任务与目的</h4><h5>1.1 试验任务</h5><p>依据定型大纲，完成牵引性能、动力输出及可靠性等相关试验项目。</p><ul><li>明确考核指标与判定准则</li><li>形成可追溯的试验记录</li></ul>`,
      },
      {
        id: 2,
        title: '试验依据与引用标准',
        html: `<h4>2. 试验依据与引用标准</h4><p>引用相关国家军用标准、行业规范及本项目技术要求。</p>`,
      },
      {
        id: 3,
        title: '被试品与配套设备',
        html: `<h4>3. 被试品与配套设备</h4><p>明确被试状态、配套仪器及校准要求。</p>`,
      },
      {
        id: 4,
        title: '试验项目与方法',
        html: `<h4>4. 试验项目与方法</h4><p>按项目分别给出试验条件、步骤、采样与数据处理方法。</p>`,
      },
      {
        id: 5,
        title: '试验条件与约束',
        html: `<h4>5. 试验条件与约束</h4><p>环境、场地、人员与安全约束说明。</p>`,
      },
      {
        id: 6,
        title: '数据采集与处理',
        html: `<h4>6. 数据采集与处理</h4><p>采集频率、传感器布置与异常值处理规则。</p>`,
      },
      {
        id: 7,
        title: '判定准则',
        html: `<h4>7. 判定准则</h4><p>给出合格判定边界与复测规则。</p>`,
      },
      {
        id: 8,
        title: '风险分析与措施',
        html: `<h4>8. 风险分析与措施</h4><p>识别主要风险并制定应对措施。</p>`,
      },
      {
        id: 9,
        title: '进度与组织保障',
        html: `<h4>9. 进度与组织保障</h4><p>试验阶段划分、责任单位与进度节点。</p>`,
      },
      {
        id: 10,
        title: '附录',
        html: `<h4>10. 附录</h4><p>图表、原始记录模板与引用文件清单。</p>`,
      },
    ])

    const opinions = ref([
      { id: 1, chapter: '试验任务与目的', opinion: '建议补充低速档牵引工况说明', status: '待处理' },
      { id: 2, chapter: '试验项目与方法', opinion: '样本量建议调整为 24', status: '处理中' },
      { id: 3, chapter: '判定准则', opinion: '合格边界与大纲条款对齐已确认', status: '已处理' },
      { id: 4, chapter: '风险分析与措施', opinion: '关闭历史重复意见', status: '已关闭' },
    ])

    const dlgVisible = ref(false)
    const dlgTitle = ref('新增校核意见')
    const editingId = ref(null)
    const dlgForm = reactive({ chapter: '', opinion: '', status: '待处理' })

    const wordCount = computed(() => {
      const raw = bodyText.value || chapters.value[activeChapter.value]?.html || ''
      return raw.replace(/<[^>]+>/g, '').replace(/\s/g, '').length
    })

    function statusClass(status) {
      if (status === '已处理') return 'ok'
      if (status === '处理中') return 'run'
      if (status === '已关闭') return 'off'
      return 'wait'
    }
    function renderChapter() {
      const ch = chapters.value[activeChapter.value]
      if (editorEl.value && ch) {
        editorEl.value.innerHTML = ch.html || ''
        bodyText.value = editorEl.value.innerText || ''
      }
    }
    function persistEditor() {
      const el = editorEl.value
      if (!el) return
      bodyText.value = el.innerText || ''
      const ch = chapters.value[activeChapter.value]
      if (ch) ch.html = el.innerHTML
    }
    function onEditorInput(e) {
      bodyText.value = e.target.innerText || ''
      const ch = chapters.value[activeChapter.value]
      if (ch) ch.html = e.target.innerHTML
      saveSelection()
      syncFmt()
    }
    function saveSelection() {
      const sel = window.getSelection()
      if (!sel || sel.rangeCount === 0) return
      const range = sel.getRangeAt(0)
      if (editorEl.value && editorEl.value.contains(range.commonAncestorContainer)) {
        savedRange = range.cloneRange()
      }
    }
    function restoreSelection() {
      const el = editorEl.value
      if (!el) return
      el.focus()
      const sel = window.getSelection()
      sel.removeAllRanges()
      if (savedRange) sel.addRange(savedRange)
    }
    function onToolbarFocus(visible) {
      if (visible) saveSelection()
    }
    function syncFmt() {
      saveSelection()
      fmt.bold = document.queryCommandState('bold')
      fmt.italic = document.queryCommandState('italic')
      fmt.underline = document.queryCommandState('underline')
      fmt.list = document.queryCommandState('insertUnorderedList')
    }
    function execFmt(cmd) {
      restoreSelection()
      document.execCommand(cmd, false, null)
      persistEditor()
      syncFmt()
    }
    function applyFont(name) {
      restoreSelection()
      document.execCommand('fontName', false, name)
      persistEditor()
    }
    function applyFontSize(px) {
      restoreSelection()
      document.execCommand('fontSize', false, '7')
      const el = editorEl.value
      if (el) {
        el.querySelectorAll('font[size="7"]').forEach((font) => {
          const span = document.createElement('span')
          span.style.fontSize = `${px}px`
          while (font.firstChild) span.appendChild(font.firstChild)
          font.replaceWith(span)
        })
      }
      persistEditor()
    }
    function insertLink() {
      saveSelection()
      ElMessageBox.prompt('请输入链接地址', '插入链接', {
        inputValue: 'https://',
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /\S+/,
        inputErrorMessage: '请输入有效地址',
      }).then(({ value }) => {
        const url = String(value || '').trim()
        if (!url) return
        restoreSelection()
        const sel = window.getSelection()
        if (!sel || sel.rangeCount === 0 || sel.isCollapsed) {
          const safe = url.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;')
          document.execCommand('insertHTML', false, `<a href="${safe}" target="_blank" rel="noopener">${safe}</a>`)
        } else {
          document.execCommand('createLink', false, url)
        }
        editorEl.value?.querySelectorAll('a[href]').forEach((a) => {
          if (!a.getAttribute('target')) a.setAttribute('target', '_blank')
        })
        persistEditor()
      }).catch(() => {})
    }
    function insertImage() {
      saveSelection()
      imgInput.value?.click()
    }
    function onPickImage(e) {
      const file = e.target.files && e.target.files[0]
      e.target.value = ''
      if (!file) return
      const reader = new FileReader()
      reader.onload = () => {
        restoreSelection()
        const src = String(reader.result || '')
        document.execCommand('insertHTML', false, `<img src="${src}" alt="${file.name.replace(/"/g, '')}">`)
        persistEditor()
      }
      reader.readAsDataURL(file)
    }
    watch(activeChapter, () => nextTick(renderChapter))
    onMounted(renderChapter)
    function addOpinion() {
      editingId.value = null
      dlgTitle.value = '新增校核意见'
      dlgForm.chapter = chapters.value[activeChapter.value]?.title || ''
      dlgForm.opinion = ''
      dlgForm.status = '待处理'
      dlgVisible.value = true
    }
    function editOpinion(row) {
      editingId.value = row.id
      dlgTitle.value = '编辑校核意见'
      dlgForm.chapter = row.chapter
      dlgForm.opinion = row.opinion
      dlgForm.status = row.status
      dlgVisible.value = true
    }
    function saveOpinion() {
      if (!dlgForm.chapter || !dlgForm.opinion?.trim()) {
        toast('请填写章节与校核意见')
        return
      }
      if (editingId.value) {
        const row = opinions.value.find((o) => o.id === editingId.value)
        if (row) Object.assign(row, { ...dlgForm })
        toast('已更新校核意见')
      } else {
        opinionSeq += 1
        opinions.value.unshift({ id: opinionSeq, ...dlgForm })
        toast('已新增校核意见')
      }
      dlgVisible.value = false
    }
    function removeOpinion(row) {
      confirm(`确认删除该校核意见？`, () => {
        opinions.value = opinions.value.filter((o) => o.id !== row.id)
        toast('已删除')
      })
    }
    function preview() {
      openDrawer('方案预览', [
        { label: '方案名称', value: meta.name },
        { label: '版本', value: meta.ver },
        { label: '', value: meta.equip },
        { label: '当前章节', value: chapters.value[activeChapter.value]?.title },
        { label: '意见数', value: String(opinions.value.length) },
      ])
    }
    function save() {
      const now = new Date()
      const pad = (n) => String(n).padStart(2, '0')
      savedAt.value = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
      toast('修改已保存')
    }
    function submit() {
      if (!meta.name?.trim() || !meta.ver || !meta.equip || !meta.type) {
        toast('请完善方案名称、版本、所属对象与试验类型')
        return
      }
      confirm('确认提交本次人工校核结果？', () => {
        toast('校核结果已提交')
      }, false)
    }

    const tableHeaderStyle = {
      background: '#eaf3fa',
      color: '#3f5062',
      fontWeight: '600',
      fontSize: '13.5px',
    }

    return {
      meta, verOptions, equipOptions, typeOptions, statusOptions,
      chapters, activeChapter, editor, editorEl, imgInput, fmt, opinions, savedAt, wordCount,
      dlgVisible, dlgTitle, dlgForm, tableHeaderStyle,
      statusClass, onEditorInput, onToolbarFocus, applyFont, applyFontSize,
      execFmt, insertLink, insertImage, onPickImage, saveSelection, syncFmt,
      addOpinion, editOpinion, saveOpinion, removeOpinion,
      preview, save, submit, toast,
    }
  },
}
</script>

<style scoped>
.scheme-review {
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

.top-grid {
  display: grid;
  grid-template-columns: 1.35fr 0.9fr;
  gap: 14px;
  align-items: stretch;
}
.bottom-grid {
  display: grid;
  grid-template-columns: 1.35fr 0.9fr;
  gap: 14px;
  align-items: stretch;
  min-height: 420px;
}

.info-form :deep(.el-form-item) { margin-bottom: 14px; }
.info-form :deep(.el-form-item__label) {
  display: inline-flex !important;
  align-items: center;
  justify-content: flex-start;
  width: 7.2em !important;
  white-space: nowrap;
  line-height: 36px;
  height: 36px;
  padding-right: 10px !important;
  color: #4a5a6a;
  font-size: 13.5px;
  text-align: left !important;
  box-sizing: border-box;
  position: relative;
}
/* 文字左对齐；必填 * 固定贴在标签区右缘（靠近输入框） */
.info-form :deep(.el-form-item.is-required:not(.is-no-asterisk) > .el-form-item__label::before) {
  content: none !important;
  margin: 0 !important;
}
.info-form :deep(.el-form-item.is-required:not(.is-no-asterisk) > .el-form-item__label::after) {
  content: '*' !important;
  color: #f5222d;
  position: absolute;
  right: 2px;
  top: 50%;
  transform: translateY(-50%);
  margin: 0;
  line-height: 1;
}
.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 18px;
}
.intro-item { margin-bottom: 0 !important; }
.intro-item :deep(.el-form-item__label) { height: auto; line-height: 22px; padding-top: 8px; align-items: flex-start; }
.intro-item :deep(.el-form-item__content) { display: block; width: 100%; }

.chapter-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow: auto;
  max-height: 280px;
}
.chapter-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  text-align: left;
  border: 0;
  background: transparent;
  border-radius: 6px;
  padding: 9px 10px;
  color: #3f5062;
  font-size: 13.5px;
  cursor: pointer;
}
.chapter-item:hover { background: #f4f8fc; }
.chapter-item.on {
  background: #eaf3fd;
  color: #0d4e83;
  font-weight: 600;
}
.ch-ico { width: 16px; height: 16px; color: #7ea3c2; flex: 0 0 auto; }
.ch-ico svg { width: 100%; height: 100%; }
.chapter-item.on .ch-ico { color: #1668a8; }
.ch-text { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.body-panel {
  min-height: 420px;
  max-height: 520px;
}
.editor-shell {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: 100%;
  max-height: 100%;
  border: 1px solid #d5e0ea;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
}
.editor-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  background: #f7fbfe;
  border-bottom: 1px solid #e6eef6;
}
.tb-sep {
  width: 1px; height: 18px; background: #d5e0ea; margin: 0 2px;
}
.tb-btn {
  height: 30px; min-width: 30px; padding: 0 8px;
  border: 1px solid #d5e0ea; border-radius: 5px;
  background: #fff; color: #3f5062; font-size: 13px; cursor: pointer;
}
.tb-btn:hover { border-color: #8eb4d4; color: #0d4e83; background: #f4f9fd; }
.tb-btn.on { border-color: #8eb4d4; color: #0d4e83; background: #eaf3fd; }
.tb-btn.wide { min-width: 48px; }
.editor-toolbar :deep(.el-select .el-select__wrapper) {
  min-height: 30px !important;
  height: 30px;
}
.editor-body {
  flex: 1 1 auto;
  min-height: 0;
  height: 0; /* 配合 flex，限制高度，超长内部滚动 */
  overflow-x: hidden;
  overflow-y: auto;
  padding: 14px 16px;
  color: #3f5062;
  line-height: 1.8;
  outline: none;
}
.editor-toolbar,
.editor-foot {
  flex: 0 0 auto;
}
.editor-body :deep(h4) { color: #0d4e83; margin: 0 0 10px; font-size: 15px; font-weight: 700; }
.editor-body :deep(h5) { color: #1668a8; margin: 12px 0 6px; font-size: 14px; font-weight: 600; }
.editor-body :deep(p) { margin: 0 0 8px; }
.editor-body :deep(ul) { padding-left: 1.2em; margin: 0 0 8px; }
.editor-body :deep(a) { color: #1668a8; text-decoration: underline; }
.editor-body :deep(img) { max-width: 100%; height: auto; display: inline-block; vertical-align: middle; border-radius: 4px; }
.editor-foot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #8a99a8;
  font-size: 12.5px;
  padding: 8px 14px;
  background: #fbfcfe;
  border-top: 1px solid #e6eef6;
}

.opinion-panel {
  min-height: 420px;
  max-height: 520px;
}
.table-wrap {
  flex: 1 1 auto;
  min-height: 0;
  height: 0; /* 配合 flex，限制高度，超长表体内部滚动 */
  border: 1px solid #e2ebf3;
  border-radius: 8px;
  overflow: hidden;
}
.opinion-table { width: 100%; height: 100%; }
.opinion-table :deep(.el-table__inner-wrapper::before) { display: none; }
.opinion-table :deep(.el-table__cell) {
  padding: 12px 10px;
  font-size: 13.5px;
  color: #3f5062;
}
.opinion-table :deep(.el-table__header .el-table__cell),
.opinion-table :deep(.el-table__body .el-table__cell) {
  white-space: nowrap;
}
.opinion-table :deep(.el-table__header .cell),
.opinion-table :deep(.el-table__body .cell) {
  white-space: nowrap !important;
  word-break: keep-all;
  line-height: 1.4;
  overflow: visible;
  text-overflow: clip;
}
.ops {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
}
.ops a {
  color: #1668a8;
  font-size: 13.5px;
  cursor: pointer;
}
.ops a:hover { color: #0d4e83; text-decoration: underline; }
.ops a.danger { color: #d4380d; }
.ops a.danger:hover { color: #b02a08; }
.opinion-actions { flex: 0 0 auto; margin-top: 12px; }
.dot-status { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; white-space: nowrap; }
.dot-status i { width: 7px; height: 7px; border-radius: 50%; flex: 0 0 auto; }
.dot-status.ok { color: #2f9e62; } .dot-status.ok i { background: #2fbf4a; }
.dot-status.run { color: #1668a8; } .dot-status.run i { background: #3d9adf; }
.dot-status.wait { color: #e06a1a; } .dot-status.wait i { background: #fa8c16; }
.dot-status.off { color: #8a99a8; } .dot-status.off i { background: #b0bec8; }

.page-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 2px;
}
.page-actions :deep(.el-button + .el-button) {
  margin-left: 0;
}
.page-actions :deep(.el-button--primary),
.page-actions :deep(.el-button--primary > span) { color: #ffffff !important; }

.dlg-form :deep(.el-form-item.is-required:not(.is-no-asterisk) > .el-form-item__label::before) {
  content: none !important;
}
.dlg-form :deep(.el-form-item.is-required:not(.is-no-asterisk) > .el-form-item__label::after) {
  content: '*' !important;
  color: #f5222d;
  margin-left: 2px;
}

@media (max-width: 1280px) {
  .top-grid, .bottom-grid { grid-template-columns: 1fr; }
}
</style>
