<template>
  <div class="report-workflow">
    <template v-if="isReview && activeReview">
      <section class="flow-head">
        <button type="button" class="back-link" @click="backToReport(activeReview.reportId)">← 返回报告</button>
        <p>审查标准：报告内容审查规则 V1.0 · {{ activeReview.reportTitle }}</p>
        <div class="review-counts">
          <b>审查意见 {{ activeReview.issues.length }} 条</b>
          <span v-for="level in ['严重', '重要', '一般']" :key="level" :class="severityClass(level)">{{ level }} {{ countLevel(level) }} 条</span>
        </div>
      </section>
      <div class="review-columns">
        <section class="flow-panel">
          <div class="pane-heading"><b>报告原文</b><span>{{ activeReview.sections.length }} 章</span></div>
          <div class="original-scroll"><ReportDocument ref="reviewDocument" :sections="activeReview.sections" :active-block="activeIssue?.blockId" /></div>
        </section>
        <section class="flow-panel">
          <div class="review-tabs"><button v-for="type in reviewTypes" :key="type" type="button" :class="{ selected: issueFilter === type }" @click="issueFilter = type">{{ type }}</button></div>
          <div class="opinion-scroll">
            <el-empty v-if="!filteredIssues.length" description="当前范围内没有审查意见" />
            <article v-for="issue in filteredIssues" :key="issue.id" class="opinion" :class="{ selected: selectedIssueId === issue.id }" @click="locateIssue(issue)">
              <div class="opinion-head"><el-tag size="small">{{ issue.type }}</el-tag><span :class="severityClass(issue.severity)">{{ issue.severity }}风险</span><span class="badge" :class="issue.status === '已采纳' ? 'on' : 'hold'"><i></i>{{ issue.status }}</span></div>
              <button type="button" class="location-link" @click.stop="locateIssue(issue)">{{ issue.location }}</button>
              <small>提出的问题</small>
              <h4>{{ issue.title }}</h4>
              <blockquote>{{ issue.originalText }}</blockquote>
              <div class="opinion-basis"><small>审查依据</small><p>{{ issue.basis }}</p></div>
              <div class="opinion-suggestion"><small>修改建议</small><p>{{ issue.suggestion }}</p></div>
              <div v-if="editingIssueId === issue.id" class="manual-edit" @click.stop>
                <el-input v-model="manualText" type="textarea" :rows="5" />
                <p class="muted">请按依据补充，保存后写入报告原文。</p>
                <el-button @click="editingIssueId = ''">取消</el-button>
                <el-button type="primary" @click="saveManualIssue(issue)">保存并采纳</el-button>
              </div>
              <div v-else-if="issue.status === '待处理'" class="opinion-actions">
                <el-button type="danger" plain @click.stop="rejectIssue(issue)">驳回</el-button>
                <el-button type="primary" @click.stop="acceptIssue(issue)">{{ issue.replacement ? '采纳并修改' : '编辑并采纳' }}</el-button>
              </div>
              <p v-else-if="issue.handledAt" class="muted">{{ issue.status }} · {{ issue.handledAt }}</p>
            </article>
          </div>
        </section>
      </div>
    </template>

    <template v-else-if="isReview">
      <header class="flow-head">
        <div class="doc-mark">审</div>
        <div>
          <h2>多策略融合智能审查</h2>
          <p>选择刚生成的报告，按术语规范、数据勾稽、判据引用同时检查。意见落到原文位置，并给出依据和修改建议。</p>
        </div>
      </header>
      <section class="flow-panel">
        <div class="pane-heading"><b>审查任务</b><el-button type="primary" @click="openReviewDialog()">＋ 新建审查任务</el-button></div>
        <el-table :data="workflow.reviews">
          <el-table-column label="任务" min-width="160"><template #default="{ row }">审查任务</template></el-table-column>
          <el-table-column prop="reportTitle" label="审查对象" min-width="260" />
          <el-table-column label="规则包" min-width="200"><template #default="{ row }">{{ row.packs.join(' / ') }}</template></el-table-column>
          <el-table-column label="意见数" width="90"><template #default="{ row }">{{ row.issues.length }}</template></el-table-column>
          <el-table-column prop="status" label="状态" width="100" />
          <el-table-column prop="createdAt" label="创建时间" width="180" />
          <el-table-column label="操作" width="110"><template #default="{ row }"><el-button link type="primary" @click="openReviewResult(row)">查看结果</el-button></template></el-table-column>
        </el-table>
        <el-empty v-if="!workflow.reviews.length && !busy" description="暂无审查任务，请从报告初稿送审" />
        <div v-if="busy" class="inline-busy"><span class="loading-spinner"></span><b>{{ busyTitle }}</b><p>{{ busyDetail }}</p><el-progress :percentage="progress" :stroke-width="6" :show-text="false" /></div>
      </section>
    </template>

    <template v-else-if="view === 'list'">
      <header class="flow-head">
        <div class="doc-mark">文</div>
        <div>
          <h2>知识驱动文档生成</h2>
          <p>试验完成后，按指标树自动汇集 28 项结果、原始数据与异常根因，再选择模板组稿；后续进入智能审校、定稿与归档。</p>
        </div>
      </header>
      <section class="flow-panel">
        <div class="pane-heading"><b>报告列表</b><el-button type="primary" @click="newReport">＋ 新建报告</el-button></div>
        <el-table :data="workflow.reports">
          <el-table-column label="报告名称" min-width="280"><template #default="{ row }"><el-button link type="primary" @click="openReport(row)">{{ row.title }}</el-button></template></el-table-column>
          <el-table-column label="当前环节" width="140"><template #default="{ row }">{{ stageLabel(row.stage) }}</template></el-table-column>
          <el-table-column label="状态" width="120"><template #default="{ row }"><span class="badge" :class="row.status === '已完成' ? 'on' : 'run'"><i></i>{{ row.status || '进行中' }}</span></template></el-table-column>
          <el-table-column prop="createdAt" label="创建时间" width="180" />
          <el-table-column label="操作" width="140"><template #default="{ row }"><el-button link type="primary" @click="editReport(row)">编辑</el-button><el-button link type="danger" @click="deleteReport(row)">删除</el-button></template></el-table-column>
        </el-table>
        <el-empty v-if="!workflow.reports.length" description="暂无报告，点击新建报告开始编写" />
      </section>
    </template>

    <template v-else-if="view === 'config'">
      <header class="flow-head">
        <div>
          <button type="button" class="back-link" @click="goReportList">← 返回报告列表</button>
          <h2>{{ editingReportId ? '编辑报告配置' : '新建报告 · 关联试验结果' }}</h2>
          <p>进来后先选择已发布指标树。选定后自动带出试验结果、原始记录和异常根因，不必再手工勾选素材。</p>
        </div>
      </header>
      <section class="flow-panel padded">
        <h3><span class="step-number">1</span>报告信息与指标树</h3>
        <el-form label-position="top" class="form-grid">
          <el-form-item label="报告名称" required><el-input v-model="form.title" maxlength="80" placeholder="请输入报告名称" /></el-form-item>
          <el-form-item label="选择已发布指标树" required>
            <el-select v-model="form.treeId" placeholder="请选择指标树，自动关联试验结果" style="width:100%" @change="selectTree">
              <el-option v-for="tree in publishedTrees" :key="tree.id" :label="treeLabel(tree)" :value="tree.id" />
            </el-select>
          </el-form-item>
        </el-form>
        <el-alert v-if="!publishedTrees.length" type="warning" :closable="false" title="暂无已发布指标树，请先完成指标树发布。" />
      </section>
      <section v-if="configMaterials" class="flow-panel padded">
        <h3><span class="step-number">2</span>自动关联试验材料 <em>自动关联，无需手工选素材</em></h3>
        <div class="material-stats">
          <div><small>指标树与判据</small><strong>{{ configMaterials.metrics.length }} 项</strong><span>{{ configMaterials.tree.version }} · 已关联</span></div>
          <div><small>试验结果与符合性判定</small><strong>{{ configMaterials.metrics.length }} / {{ configMaterials.metrics.length }} 项</strong><span>{{ resultSummary(configMaterials) }}</span></div>
          <div><small>精度原始数据</small><strong>{{ configMaterials.shotCount }} + 1 发</strong><span>正式试验，独立复测记录</span></div>
          <div><small>异常定位与根因分析</small><strong>{{ configMaterials.cause }}</strong><span>事件 {{ configMaterials.eventId }} · 异常报告已关联</span></div>
        </div>
        <div class="material-preview-grid">
          <div>
            <h4>{{ configMaterials.metrics.length }} 项试验结果预览</h4>
            <el-table :data="configMaterials.metrics" height="280">
              <el-table-column prop="name" label="指标" min-width="150" />
              <el-table-column prop="value" label="实测结果" min-width="170" />
              <el-table-column label="判定" width="120"><template #default="{ row }"><span :class="row.conclusion === '符合' ? 'judge-ok' : 'judge-retest'">{{ row.conclusion }}</span></template></el-table-column>
            </el-table>
          </div>
          <aside class="analysis-preview">
            <small>异常分析报告</small>
            <h4>{{ configMaterials.analysisTitle }}</h4>
            <p>原始异常　第 {{ configMaterials.shot.shotNo }} 发 · {{ configMaterials.shot.firstDh }} {{ configMaterials.shot.unit }}</p>
            <p>确认根因　{{ configMaterials.cause }}（置信度 {{ configMaterials.confidence }}）</p>
            <p>复测结果　{{ configMaterials.shot.retestDh }} {{ configMaterials.shot.unit }} · {{ configMaterials.shot.retestDh <= configMaterials.shot.criterion ? '复测后符合' : '复测不符合' }}</p>
            <p>证据材料　异常解读、原始记录、标定资料与复测数据</p>
          </aside>
        </div>
      </section>
      <section class="flow-panel padded">
        <h3><span class="step-number">3</span>选择报告模板</h3>
        <div class="template-grid">
          <button v-for="template in reportTemplates" :key="template.id" type="button" class="template-card" :class="{ selected: form.templateId === template.id }" @click="form.templateId = template.id">
            <b>{{ template.name }}</b>
            <span>{{ template.chapters.length }} 章 · {{ template.description }}</span>
            <i v-if="form.templateId === template.id">已选</i>
          </button>
        </div>
      </section>
      <footer class="flow-foot">
        <span>创建后进入编写页。提纲和初稿都使用上面关联好的材料。</span>
        <el-button type="primary" :disabled="!configReady" @click="saveReportConfig">{{ editingReportId ? '保存配置并进入编写' : '创建报告并进入编写' }}</el-button>
      </footer>
    </template>

    <template v-else-if="currentReport">
      <header class="flow-head">
        <div>
          <button type="button" class="back-link" @click="goReportList">← 返回报告列表</button>
          <h2>{{ currentReport.title }}</h2>
          <p>指标树试验结果与异常根因已汇集。按所选模板生成提纲和初稿，每项判定都可以回到原始记录。</p>
          <div class="meta-line">
            <span>关联指标树 {{ currentReport.materials.tree.version }}</span>
            <span>报告模板 {{ currentTemplate.name }}</span>
            <span>试验结果 {{ currentReport.materials.metrics.length }} 项</span>
            <span>异常根因 {{ currentReport.materials.cause }}</span>
          </div>
        </div>
      </header>
      <section v-if="currentReport.stage !== 'draft' && currentReport.stage !== 'final'" class="flow-panel padded">
        <h3>试验材料 <small>按指标树自动关联，点击卡片可预览</small></h3>
        <div class="material-cards">
          <button v-for="card in materialCards" :key="card.id" type="button" @click="previewMaterial = card.id">
            <div><el-tag size="small">{{ card.label }}</el-tag><span>已自动关联</span></div>
            <b>{{ card.title }}</b>
            <small>{{ card.source }}</small>
          </button>
        </div>
        <div v-if="currentReport.stage === 'materials'" class="section-actions">
          <span>28 项判定、30 发正式记录和 1 发复测已进入编写范围。</span>
          <el-button type="primary" :disabled="busy" @click="generateOutline">按模板生成提纲</el-button>
        </div>
        <div v-if="busy && currentReport.stage === 'materials'" class="inline-busy"><span class="loading-spinner"></span><b>{{ busyTitle }}</b><el-progress :percentage="progress" :stroke-width="6" :show-text="false" /></div>
      </section>
      <section v-if="currentReport.stage === 'outline'" class="flow-panel padded">
        <h3>报告提纲 <small>{{ currentTemplate.chapters.length }} 章 · 每章附一段生成概述</small></h3>
        <ol class="outline-list">
          <li v-for="(chapter, index) in currentTemplate.chapters" :key="chapter">
            <span>{{ String(index + 1).padStart(2, '0') }}</span>
            <div><b>第{{ index + 1 }}章 {{ chapter }}</b><p>{{ currentReport.outlineNotes[index] }}</p></div>
          </li>
        </ol>
        <div class="section-actions">
          <span>确认提纲后，按章节写入试验结果、异常根因和复测结论。</span>
          <el-button type="primary" :disabled="busy" @click="generateDraft">生成报告初稿</el-button>
        </div>
        <div v-if="busy" class="inline-busy"><span class="loading-spinner"></span><b>{{ busyTitle }}</b><el-progress :percentage="progress" :stroke-width="6" :show-text="false" /></div>
      </section>
      <section v-if="currentReport.sections.length && (currentReport.stage === 'draft' || currentReport.stage === 'final')" class="flow-panel draft-panel">
        <div class="pane-heading">
          <b>初稿预览</b>
          <div><el-button @click="sendToReview">送智能审查</el-button><el-button type="primary" :disabled="currentReport.status === '已完成'" @click="finalizeReport">{{ currentReport.status === '已完成' ? '已定稿' : '定稿' }}</el-button></div>
        </div>
        <ReportDocument :sections="currentReport.sections" />
      </section>
    </template>

    <el-dialog v-model="reviewDialog" title="新建审查任务" width="560px" :close-on-click-modal="false">
      <div class="dialog-label">选择审查对象（本报告）</div>
      <div class="report-options">
        <label v-for="report in draftReports" :key="report.id" :class="{ selected: reviewReportId === report.id }"><input v-model="reviewReportId" type="radio" :value="report.id" /><span>{{ report.title }} <small>（{{ stageLabel(report.stage) }}）</small></span></label>
        <el-empty v-if="!draftReports.length" description="请先生成报告初稿" />
      </div>
      <div class="dialog-label">勾选审查规则包（三类同时检查）</div>
      <el-checkbox-group v-model="selectedPacks"><el-checkbox v-for="pack in reviewRulePacks" :key="pack" :value="pack" border>{{ pack }}</el-checkbox></el-checkbox-group>
      <template #footer>
        <el-button @click="reviewDialog = false">取消</el-button>
        <el-button type="primary" :disabled="!reviewReportId || !selectedPacks.length || busy" @click="startReview">启动审查</el-button>
      </template>
    </el-dialog>
    <el-dialog :model-value="Boolean(previewMaterial)" :title="materialCards.find((card) => card.id === previewMaterial)?.title || '材料预览'" width="820px" @close="previewMaterial = ''">
      <template v-if="currentReport">
        <el-table v-if="previewMaterial === 'tree' || previewMaterial === 'results'" :data="currentReport.materials.metrics" max-height="460">
          <el-table-column prop="name" label="指标" min-width="160" />
          <el-table-column prop="criterion" label="判据" min-width="120" />
          <el-table-column v-if="previewMaterial === 'results'" prop="value" label="实测结果" min-width="180" />
          <el-table-column v-if="previewMaterial === 'results'" prop="conclusion" label="判定" width="120" />
        </el-table>
        <template v-else-if="previewMaterial === 'data'">
          <el-table :data="currentReport.materials.shots" max-height="420"><el-table-column prop="id" label="发次" /><el-table-column prop="dH" label="高低偏差 (mil)" /><el-table-column prop="dL" label="方向偏差 (mil)" /><el-table-column prop="v0" label="初速 (m/s)" /></el-table>
          <p class="preview-note">独立复测：第 {{ currentReport.materials.shot.shotNo }} 发，高低偏差 {{ currentReport.materials.shot.retestDh }} mil。</p>
        </template>
        <template v-else>
          <p>事件 {{ currentReport.materials.eventId }} · {{ currentReport.materials.analysisTitle }}</p>
          <p>候选根因 {{ currentReport.materials.cause }}，置信度 {{ currentReport.materials.confidence }}</p>
          <p>首测 {{ currentReport.materials.shot.firstDh }} mil → 复测 {{ currentReport.materials.shot.retestDh }} mil</p>
        </template>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import ReportDocument from '@/components/ReportDocument.vue'
import { useDemoStore } from '@/composables/demo-store'
import { useUi } from '@/composables/ui'
import {
  cloneReportData, collectReportMaterials, createWorkflowReport, generateReportSections, inspectReport,
  outlineBlurbs, reportTemplates, reportWorkflow, resultSummary, reviewRulePacks, reviewTypes, seedWorkflow, workflowTime,
} from '@/data/reportWorkflow'

const props = defineProps({ page: Object, title: String })
const router = useRouter()
const demo = useDemoStore()
const { toast, confirm } = useUi()
seedWorkflow(demo)

const isReview = computed(() => props.page?.mode === 'review')
const workflow = reportWorkflow
const view = ref('list')
const editingReportId = ref('')
const currentId = ref('')
const configMaterials = ref(null)
const previewMaterial = ref('')
const reviewDialog = ref(false)
const reviewReportId = ref('')
const selectedPacks = ref([...reviewRulePacks])
const issueFilter = ref('全部')
const selectedIssueId = ref('')
const editingIssueId = ref('')
const manualText = ref('')
const reviewDocument = ref(null)
const busy = ref(false)
const busyTitle = ref('')
const busyDetail = ref('')
const progress = ref(0)
let progressTimer = 0
const form = reactive({ title: '某型装备性能鉴定试验报告', treeId: '', templateId: 'qualification' })

const publishedTrees = computed(() => (demo.m03List || []).filter((row) => row.status === '已发布'))
const currentReport = computed(() => workflow.reports.find((row) => row.id === currentId.value) || null)
const currentTemplate = computed(() => reportTemplates.find((item) => item.id === currentReport.value?.templateId) || reportTemplates[0])
const configReady = computed(() => form.title.trim() && form.treeId && form.templateId && configMaterials.value)
const draftReports = computed(() => workflow.reports.filter((row) => row.sections?.length))
const activeReview = computed(() => workflow.reviews.find((row) => row.id === workflow.activeReviewId) || null)
const filteredIssues = computed(() => (activeReview.value?.issues || []).filter((issue) => issueFilter.value === '全部' || issue.type === issueFilter.value))
const activeIssue = computed(() => filteredIssues.value.find((issue) => issue.id === selectedIssueId.value) || null)
const materialCards = computed(() => {
  const materials = currentReport.value?.materials
  if (!materials) return []
  const passed = materials.metrics.filter((row) => row.conclusion === '符合').length
  const retested = materials.metrics.filter((row) => row.conclusion === '复测后符合').length
  return [
    { id: 'tree', label: '指标树判据', title: `${materials.tree.version} · 判据集（${materials.metrics.length}项）`, source: '来源：定型资料数据智能再造平台' },
    { id: 'results', label: '试验结果汇总', title: `${materials.metrics.length}项试验结果（${passed}项符合 / ${retested}项复测后符合）`, source: '来源：试验数据汇总与符合性判定' },
    { id: 'data', label: '试验原始数据', title: `试验数据汇总表（${materials.shotCount}发 + 复测1发）`, source: `来源：${materials.sourceName}` },
    { id: 'event', label: '异常分析与根因', title: materials.analysisTitle, source: '来源：探针设计与智能定位平台' },
  ]
})

function treeLabel(tree) {
  const name = String(tree.version || '').includes('指标树') ? `试验鉴定${tree.version}` : tree.version
  return `${name} · ${tree.count}项指标`
}
function stageLabel(stage) {
  return { materials: '素材已关联', outline: '提纲', draft: '初稿', final: '初稿' }[stage] || '初稿'
}
function severityClass(level) {
  return { 严重: 'sev sev-high', 重要: 'sev sev-mid', 一般: 'sev sev-low' }[level] || 'sev'
}
function countLevel(level) {
  return (activeReview.value?.issues || []).filter((issue) => issue.severity === level).length
}
function goReportList() {
  view.value = 'list'
  currentId.value = ''
  editingReportId.value = ''
}
function newReport() {
  editingReportId.value = ''
  form.title = '某型装备性能鉴定试验报告'
  form.treeId = ''
  form.templateId = 'qualification'
  configMaterials.value = null
  view.value = 'config'
}
function selectTree(id) {
  const tree = publishedTrees.value.find((item) => item.id === id)
  configMaterials.value = tree ? collectReportMaterials(tree, demo) : null
}
function editReport(row) {
  editingReportId.value = row.id
  form.title = row.title
  form.templateId = row.templateId || 'qualification'
  form.treeId = row.materials?.tree?.id || ''
  configMaterials.value = cloneReportData(row.materials)
  view.value = 'config'
}
function openReport(row) {
  currentId.value = row.id
  view.value = 'editor'
}
function deleteReport(row) {
  confirm(`删除报告「${row.title}」？删除后不可恢复。`, () => {
    const index = workflow.reports.findIndex((item) => item.id === row.id)
    if (index >= 0) workflow.reports.splice(index, 1)
    if (currentId.value === row.id) goReportList()
    toast('报告已删除')
  })
}
function saveReportConfig() {
  if (!configReady.value) return
  if (editingReportId.value) {
    const row = workflow.reports.find((item) => item.id === editingReportId.value)
    if (!row) return
    const changed = row.templateId !== form.templateId || row.materials?.tree?.id !== form.treeId
    row.title = form.title.trim()
    row.templateId = form.templateId
    row.materials = cloneReportData(configMaterials.value)
    row.updatedAt = workflowTime()
    if (changed) {
      row.sections = []
      row.outlineNotes = []
      row.stage = 'materials'
      row.status = '进行中'
    }
    openReport(row)
    return
  }
  const report = createWorkflowReport(form.title, form.templateId, configMaterials.value)
  workflow.reports.unshift(report)
  openReport(report)
}
async function runBusy(title, detail) {
  busy.value = true
  busyTitle.value = title
  busyDetail.value = detail
  progress.value = 12
  clearInterval(progressTimer)
  progressTimer = setInterval(() => { progress.value = Math.min(progress.value + 8, 92) }, 140)
  await new Promise((resolve) => setTimeout(resolve, 1400))
  clearInterval(progressTimer)
  progress.value = 100
  await new Promise((resolve) => setTimeout(resolve, 220))
  busy.value = false
}
async function generateOutline() {
  const report = currentReport.value
  if (!report || busy.value) return
  await runBusy(`正在按${currentTemplate.value.name}生成提纲`, '正在按章节整理试验范围、样本、判据和异常闭环。')
  report.outlineNotes = outlineBlurbs(currentTemplate.value, report.materials)
  report.stage = 'outline'
  report.updatedAt = workflowTime()
}
async function generateDraft() {
  const report = currentReport.value
  if (!report || busy.value) return
  await runBusy('正在生成报告初稿', `正在写入${report.materials.metrics.length}项试验结果、异常根因和复测结论。`)
  if (report.sections.length) report.version += 1
  report.sections = generateReportSections(report)
  report.stage = 'draft'
  report.status = '进行中'
  report.updatedAt = workflowTime()
}
function finalizeReport() {
  const report = currentReport.value
  if (!report) return
  report.stage = 'final'
  report.status = '已完成'
  report.updatedAt = workflowTime()
  toast('报告已定稿')
}
function sendToReview() {
  if (!currentReport.value?.sections?.length) return
  workflow.pendingReviewReportId = currentReport.value.id
  workflow.activeReviewId = ''
  router.push({ name: 'app', params: { pid: 'doc', sid: 'review', mid: 'run' } })
}
function openReviewDialog(reportId = '') {
  reviewReportId.value = reportId || workflow.pendingReviewReportId || draftReports.value[0]?.id || ''
  selectedPacks.value = [...reviewRulePacks]
  reviewDialog.value = true
}
function openReviewResult(row) {
  workflow.activeReviewId = row.id
  selectedIssueId.value = row.issues[0]?.id || ''
}
async function startReview() {
  const report = draftReports.value.find((item) => item.id === reviewReportId.value)
  if (!report || busy.value) return
  reviewDialog.value = false
  workflow.pendingReviewReportId = ''
  await runBusy('正在审查报告原文', '正在根据初稿提出问题，并整理审查依据和修改建议。')
  const review = inspectReport(report, selectedPacks.value)
  workflow.reviews.unshift(review)
  workflow.activeReviewId = review.id
  selectedIssueId.value = review.issues[0]?.id || ''
  issueFilter.value = '全部'
}
function backToReport(id) {
  workflow.openReportId = id
  workflow.activeReviewId = ''
  router.push({ name: 'app', params: { pid: 'doc', sid: 'write', mid: 'generate-requirement' } })
}
function syncReportBlock(blockId, text) {
  const report = workflow.reports.find((item) => item.id === activeReview.value?.reportId)
  const blocks = report?.sections?.flatMap((section) => section.blocks) || []
  const block = blocks.find((item) => item.id === blockId)
  if (block) block.text = text
}
function acceptIssue(issue) {
  if (!issue.replacement) {
    editingIssueId.value = issue.id
    manualText.value = issue.originalText
    return
  }
  const block = activeReview.value.sections.flatMap((section) => section.blocks).find((item) => item.id === issue.blockId)
  if (block) block.text = issue.replacement
  syncReportBlock(issue.blockId, issue.replacement)
  issue.status = '已采纳'
  issue.handledAt = workflowTime()
  toast('已采纳并写入报告')
}
function saveManualIssue(issue) {
  const text = manualText.value.trim()
  if (!text) return
  const block = activeReview.value.sections.flatMap((section) => section.blocks).find((item) => item.id === issue.blockId)
  if (block) block.text = text
  syncReportBlock(issue.blockId, text)
  issue.status = '已采纳'
  issue.handledAt = workflowTime()
  editingIssueId.value = ''
  toast('已保存并采纳')
}
function rejectIssue(issue) {
  issue.status = '已驳回'
  issue.handledAt = workflowTime()
  toast('已驳回该意见')
}
async function locateIssue(issue) {
  selectedIssueId.value = issue.id
  await nextTick()
  reviewDocument.value?.locateBlock(issue.blockId)
}
function consumeHandoff() {
  if (isReview.value && workflow.pendingReviewReportId) openReviewDialog(workflow.pendingReviewReportId)
  if (!isReview.value && workflow.openReportId) {
    const row = workflow.reports.find((item) => item.id === workflow.openReportId)
    workflow.openReportId = ''
    if (row) openReport(row)
  }
}
onMounted(consumeHandoff)
watch(() => props.page?.mode, consumeHandoff)
onBeforeUnmount(() => clearInterval(progressTimer))
</script>

<style scoped>
.report-workflow { display: flex; flex-direction: column; gap: 12px; color: #29465c; }
.flow-head, .flow-panel, .flow-foot { background: #fff; border: 1px solid #e3edf5; border-radius: 12px; }
.flow-head { display: flex; gap: 14px; padding: 18px 20px; align-items: flex-start; }
.flow-head h2 { margin: 0; color: #0d4e83; font-size: 20px; }
.flow-head p, .flow-foot span, .section-actions span { margin: 6px 0 0; color: #6d8092; font-size: 13.5px; line-height: 1.6; }
.doc-mark { width: 42px; height: 42px; border-radius: 10px; background: #e7f2fb; color: #0d4e83; display: grid; place-items: center; font-weight: 700; flex: none; }
.back-link { border: 0; background: none; color: #1668a8; padding: 0 0 6px; cursor: pointer; }
.flow-panel { padding: 0 0 8px; }
.flow-panel.padded, .flow-foot { padding: 16px 18px 18px; }
.flow-foot { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
.pane-heading, .section-actions { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
.pane-heading { padding: 14px 16px; }
.section-actions { margin-top: 14px; }
.pane-heading b, .flow-panel h3 { color: #1f3d5a; }
.flow-panel h3 { display: flex; align-items: center; gap: 8px; margin: 0 0 14px; font-size: 15px; }
.flow-panel h3 small, .flow-panel h3 em { margin-left: auto; color: #16815a; font-style: normal; font-size: 12px; font-weight: 500; }
.step-number { width: 22px; height: 22px; border-radius: 50%; background: #0d4e83; color: #fff; display: inline-grid; place-items: center; font-size: 12px; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 18px; }
.material-stats, .template-grid, .material-cards { display: grid; gap: 10px; }
.material-stats, .material-cards { grid-template-columns: repeat(4, minmax(0, 1fr)); }
.material-stats div, .template-card, .material-cards button, .analysis-preview { border: 1px solid #e3edf5; border-radius: 10px; background: #f8fbfe; }
.material-stats div, .analysis-preview { padding: 12px 14px; }
.material-stats small, .template-card span, .material-cards small, .analysis-preview small { color: #7d90a3; font-size: 12px; }
.material-stats strong, .analysis-preview h4 { display: block; margin: 6px 0; color: #16324a; font-size: 15px; }
.material-stats span, .analysis-preview p { display: block; color: #5d7388; font-size: 12.5px; line-height: 1.6; }
.material-preview-grid { display: grid; grid-template-columns: 1.4fr .8fr; gap: 12px; margin-top: 12px; }
.material-preview-grid h4 { margin: 0 0 8px; font-size: 14px; }
.judge-ok { color: #16815a; font-weight: 600; }
.judge-retest { color: #d48806; font-weight: 600; }
.template-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.template-card { text-align: left; padding: 12px 14px; cursor: pointer; min-height: 86px; position: relative; }
.template-card b { display: block; color: #16324a; margin-bottom: 6px; }
.template-card.selected { border-color: #1668a8; background: #f3f8fd; box-shadow: inset 0 0 0 1px #1668a8; }
.template-card i { position: absolute; top: 10px; right: 10px; color: #1668a8; font-style: normal; font-size: 12px; }
.material-cards button { text-align: left; padding: 12px; cursor: pointer; }
.material-cards div { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.material-cards b { display: block; color: #16324a; line-height: 1.45; }
.meta-line { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
.meta-line span { background: #f3f7fb; color: #3e627f; border-radius: 999px; padding: 3px 10px; font-size: 12px; }
.outline-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
.outline-list li { display: flex; gap: 12px; padding: 12px 14px; border: 1px solid #e3edf5; border-radius: 10px; background: #fff; }
.outline-list li > span { width: 32px; height: 32px; border-radius: 8px; background: #e7f2fb; color: #0d4e83; display: grid; place-items: center; font-weight: 700; flex: none; }
.outline-list b { color: #16324a; }
.outline-list p { margin: 4px 0 0; color: #5d7388; font-size: 13px; line-height: 1.65; }
.inline-busy { margin-top: 12px; padding: 10px 12px; background: #f7fbfe; border-radius: 8px; }
.inline-busy b, .inline-busy p { margin: 0 0 6px; }
.loading-spinner { width: 14px; height: 14px; margin-right: 6px; border: 2px solid #d5e4f2; border-top-color: #1668a8; border-radius: 50%; display: inline-block; vertical-align: -2px; animation: spin .8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.review-columns { display: grid; grid-template-columns: 1.15fr .85fr; gap: 12px; min-height: 640px; }
.review-columns .flow-panel { display: flex; flex-direction: column; min-height: 0; }
.original-scroll, .opinion-scroll { overflow: auto; max-height: calc(100vh - 230px); }
.review-tabs { display: flex; gap: 6px; flex-wrap: wrap; padding: 0 14px 10px; }
.review-tabs button { border: 1px solid #d5e3ef; background: #fff; color: #4d6982; border-radius: 999px; padding: 4px 10px; cursor: pointer; }
.review-tabs button.selected { background: #0d4e83; color: #fff; border-color: #0d4e83; }
.opinion { margin: 0 12px 12px; padding: 12px; border: 1px solid #e3edf5; border-radius: 10px; cursor: pointer; }
.opinion.selected { border-color: #1668a8; box-shadow: 0 0 0 2px #e4eef6; }
.opinion-head, .opinion-actions, .manual-edit { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.opinion h4 { margin: 4px 0 8px; font-size: 14px; color: #16324a; }
.opinion small { color: #7d90a3; }
.opinion blockquote, .opinion-basis, .opinion-suggestion { margin: 8px 0; padding: 8px 10px; border-radius: 8px; font-size: 13px; line-height: 1.65; }
.opinion blockquote { background: #fbf7ef; color: #5c4b32; }
.opinion-basis { background: #f4f8fc; }
.opinion-suggestion { background: #f3faf6; }
.opinion-basis p, .opinion-suggestion p { margin: 4px 0 0; }
.location-link { border: 0; background: none; color: #1668a8; padding: 6px 0; cursor: pointer; }
.sev { font-size: 12px; font-weight: 650; }
.sev-high { color: #d4380d; }
.sev-mid { color: #d48806; }
.sev-low { color: #6d8092; }
.review-counts { margin-left: auto; display: flex; gap: 10px; align-items: center; }
.dialog-label { margin: 8px 0; color: #5d7388; font-size: 13px; }
.report-options { display: flex; flex-direction: column; gap: 8px; max-height: 280px; overflow: auto; }
.report-options label { display: flex; gap: 8px; align-items: center; border: 1px solid #e3edf5; border-radius: 8px; padding: 8px 10px; }
.report-options label.selected { border-color: #1668a8; background: #f3f8fd; }
.report-options small { color: #7d90a3; }
.preview-note { color: #5d7388; }
.muted { color: #7d90a3; font-size: 12px; }
@media (max-width: 1100px) {
  .form-grid, .material-stats, .material-cards, .template-grid, .material-preview-grid, .review-columns { grid-template-columns: 1fr; }
  .review-counts { margin-left: 0; }
}
</style>
