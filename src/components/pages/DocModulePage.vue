<template>
  <div class="doc-module-page">
    <section class="dm-workspace">
      <header class="dm-titlebar">
        <div>
          <h2>{{ featureName }}</h2>
          <p>{{ subtitle }}</p>
        </div>
        <div class="dm-actions">
          <button class="dm-btn" @click="toast('配置已载入')">{{ secondaryAction }}</button>
          <button class="dm-btn gold" @click="save">保存草稿</button>
          <button class="dm-btn primary" @click="run">{{ primaryAction }}</button>
        </div>
      </header>

      <div v-if="showSteps" class="dm-steps">
        <div v-for="(step, index) in steps" :key="step" :class="{ done: index < activeStep, active: index === activeStep }"><b>{{ index < activeStep ? '✓' : index + 1 }}</b><span>{{ step }}</span></div>
      </div>

      <div class="dm-kpis">
        <article v-for="(kpi, index) in kpis" :key="kpi.label" :class="`tone-${index}`">
          <div class="dm-kpi-icon"><Icon :name="kpi.icon" /></div>
          <div class="dm-kpi-body"><span>{{ kpi.label }}</span><strong>{{ kpi.value }}<small>{{ kpi.unit }}</small></strong></div>
        </article>
      </div>

      <template v-if="scene === 'upload'">
        <div class="dm-grid upload-layout">
          <section
            class="dm-panel upload-box"
            :class="{ drag: dragging, busy: uploading }"
            @click="pickFile"
            @dragover.prevent="dragging = true"
            @dragleave="dragging = false"
            @drop.prevent="onDrop"
          >
            <input ref="fileInput" class="file-input" type="file" accept=".doc,.docx,.pdf,.wps,.png,.jpg,.jpeg,.zip,.rar,.tif,.tiff" @change="onFile" @click.stop />
            <template v-if="!uploading">
              <div class="cloud">↑</div>
              <h3>{{ pickedName || '拖拽文件至此处，或点击选择文件' }}</h3>
              <p>支持 Word、PDF、WPS、图片、扫描件、压缩包等不少于6种格式</p>
              <button class="dm-btn primary" type="button" @click.stop="pickFile">选择文件</button>
            </template>
            <template v-else>
              <b class="upload-name">{{ pickedName }}</b>
              <p>{{ uploadStage }}</p>
              <i class="upload-bar"><em :style="{ width: uploadProgress + '%' }"></em></i>
            </template>
          </section>
          <section class="dm-panel">
            <PanelTitle title="接入信息" />
            <div class="dm-form two"><label>文档来源<input value="内部系统上传" /></label><label>文档类型<select><option>性能试验报告</option></select></label><label>业务用途<select><option>试验鉴定审查</option></select></label><label>资料日期<input value="2026-10-22" /></label><label class="wide">备注<textarea>第三部分试验后阶段演示资料</textarea></label></div>
            <div class="align-right"><button class="dm-btn">暂存</button><button class="dm-btn primary" @click="run">提交接入</button></div>
          </section>
        </div>
      </template>

      <template v-else-if="formScenes.includes(scene)">
        <div class="dm-grid form-layout">
          <section class="dm-panel">
            <PanelTitle :title="leftTitle" />
            <div class="dm-form two">
              <label>{{ featureName }}名称<input v-model="formName" /></label><label>启用状态<span class="switch" :class="{ on: enabled }" @click="enabled = !enabled"><i></i></span></label>
              <label>适用文书类型<select><option>性能试验报告</option><option>试验大纲</option><option>评审报告</option></select></label><label>优先级<select><option>高</option><option>一般</option></select></label>
              <label class="wide">业务说明<textarea v-model="description"></textarea></label>
            </div>
          </section>
          <section class="dm-panel">
            <PanelTitle :title="rightTitle" />
            <div class="condition-row" v-for="(condition, index) in conditions" :key="index"><select><option>{{ condition.field }}</option></select><select><option>{{ condition.op }}</option></select><input v-model="condition.value" /><button @click="conditions.splice(index,1)">×</button></div>
            <button class="dash-button" @click="addCondition">＋ 添加条件</button>
          </section>
        </div>
      </template>

      <template v-else-if="graphScenes.includes(scene)">
        <div class="dm-grid graph-layout">
          <section class="dm-panel graph-panel">
            <PanelTitle :title="leftTitle"><button class="mini-control">＋</button><button class="mini-control">－</button><button class="mini-control">⛶</button></PanelTitle>
            <div class="graph-canvas">
              <div class="graph-node center"><Icon name="doc" /><b>试验项目</b><small>高温启动试验</small></div>
              <div v-for="node in graphNodes" :key="node.name" class="graph-node" :class="node.pos"><Icon :name="node.icon" /><b>{{ node.name }}</b><small>{{ node.value }}</small></div>
              <svg viewBox="0 0 800 380" preserveAspectRatio="none"><path d="M170 95 L360 185 M630 85 L450 185 M155 290 L360 215 M645 290 L450 215 M540 190 L670 190" /></svg>
            </div>
          </section>
          <section class="dm-panel property-panel">
            <PanelTitle :title="rightTitle" />
            <div class="selected-relation"><b>技术指标</b><span>→</span><b>指标值</b><em>约束关系</em></div>
            <div class="dm-form"><label>关系名称<input value="指标值约束" /></label><label>来源实体<select><option>高温启动时间</option></select></label><label>目标实体<select><option>≤ 30 s</option></select></label><label>适用条件<input value="低温启动试验" /></label><label>关系状态<select><option>已启用</option></select></label></div>
            <div class="align-right"><button class="dm-btn gold">验证关系</button><button class="dm-btn primary">确认关系</button></div>
          </section>
        </div>
      </template>

      <template v-else-if="documentScenes.includes(scene)">
        <div class="dm-grid document-layout" :class="{ 'review-layout': isReportScene }">
          <section class="dm-panel doc-tree" :class="{ 'review-toc': isReportScene }">
            <PanelTitle :title="isReportScene ? '评审报告目录' : leftTitle" />
            <input v-if="!isReportScene" class="dm-search" v-model="search" placeholder="搜索章节或内容" />
            <button
              v-for="(item, index) in chapters"
              :key="item"
              type="button"
              :class="{ active: selectedChapter === index }"
              @click="selectedChapter = index"
            >
              <span>{{ index + 1 }}</span>{{ item }}
              <em v-if="!isReportScene">{{ index < 4 ? '✓' : '!' }}</em>
            </button>
          </section>
          <section class="dm-panel doc-editor">
            <PanelTitle :title="centerTitle"><span class="blue-tag">{{ featureName }}</span></PanelTitle>
            <div class="editor-tabs"><button class="active">正文</button><button>引用来源</button><button>处理记录</button></div>
            <div class="paper">
              <template v-if="isReportScene && currentReviewBody">
                <h2>{{ selectedChapter + 1 }} {{ chapters[selectedChapter] }}</h2>
                <p class="lead">{{ currentReviewBody.lead }}</p>
                <p v-for="(p, i) in currentReviewBody.paras" :key="i">{{ p }}</p>
                <div v-if="currentReviewBody.table" class="review-table-wrap">
                  <div class="review-table-cap">{{ currentReviewBody.table.caption }}</div>
                  <table class="review-table">
                    <thead>
                      <tr>
                        <th v-for="h in currentReviewBody.table.headers" :key="h">{{ h }}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(row, ri) in currentReviewBody.table.rows" :key="ri">
                        <td v-for="(cell, ci) in row" :key="ci">{{ cell }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p v-if="currentReviewBody.figureNote" class="figure-note">{{ currentReviewBody.figureNote }}</p>
                <p class="content-hint">说明：章节正文以文字为主，具体内容可嵌入图、表等材料。</p>
              </template>
              <template v-else>
                <h2>{{ selectedChapter + 1 }} {{ chapters[selectedChapter] }}</h2>
                <p>本章以文字论述为主，必要时嵌入图表、试验记录表与附图说明，保持与提纲章节一一对应。</p>
                <p>依据定型试验任务要求，对试验对象、试验条件、技术指标与判定依据进行结构化处理。</p>
                <p>高温环境稳定后，样品应连续运行不少于 <mark>8 h</mark>；启动时间不应超过 <mark>30 s</mark>，并形成完整试验记录。</p>
                <div class="paper-table"><b>检查对象</b><b>标准值</b><b>文档值</b><span>高温启动时间</span><span>≤30 s</span><strong>35 s</strong></div>
              </template>
            </div>
          </section>
          <section class="dm-panel insight-panel">
            <PanelTitle :title="rightTitle" />
            <template v-if="isReportScene">
              <div class="alert-card tone-ok"><b>目录已按产品评审报告七章组织</b><em>已对齐</em><p>正文以文字为主，可含表格与附图说明；当前章：{{ chapters[selectedChapter] }}</p></div>
              <h4>目录结构</h4>
              <ul>
                <li v-for="sec in reviewReportSections" :key="sec.no">{{ sec.no }} {{ sec.title }}</li>
              </ul>
              <h4>生成说明</h4>
              <p class="suggestion">按评审报告目录逐章组装内容，引用试验记录与判据版本，保持来源可查。</p>
            </template>
            <template v-else>
              <div class="alert-card"><b>启动时间指标不符合</b><em>严重</em><p>报告值35 s，与标准要求30 s不一致。</p></div>
              <h4>依据来源</h4><ul><li>GJB 150.3A—2009 第5.2条</li><li>审查规则 R-HT-024</li><li>指标树 V1.0</li></ul>
              <h4>智能建议</h4><p class="suggestion">核查原始记录并统一判据版本，修改后保留处理记录与来源链路。</p>
              <button class="dm-btn primary wide" @click="toast('建议已应用并留痕')">应用建议</button>
            </template>
          </section>
        </div>
      </template>

      <template v-else>
        <div class="dm-grid flow-layout">
          <section class="dm-panel flow-panel">
            <PanelTitle :title="leftTitle"><button class="mini-control">自动布局</button></PanelTitle>
            <div class="flow-canvas">
              <div v-for="(node,index) in flowNodes" :key="node.title" class="flow-node" :class="`n${index}`"><Icon :name="node.icon" /><b>{{ node.title }}</b><span>{{ node.text }}</span><em>{{ index < 3 ? '已完成' : index === 3 ? '执行中 72%' : '等待依赖' }}</em></div>
              <svg viewBox="0 0 850 400" preserveAspectRatio="none"><path d="M205 105 H345 M505 105 H645 M720 145 V245 M645 295 H505 M345 295 H205" /></svg>
            </div>
          </section>
          <section class="dm-panel detail-panel">
            <PanelTitle :title="rightTitle" />
            <div class="detail-status"><span>当前任务</span><b>{{ featureName }}</b><em>执行中</em></div>
            <div class="progress"><i><span :style="{ width: progress + '%' }"></span></i><b>{{ progress }}%</b></div>
            <h4>任务输入</h4><ul><li>文书范围：6份关联文档</li><li>审查对象：高温启动时间</li><li>引用规则：R-HT-024</li></ul>
            <div class="alert-card"><b>发现数据差异 +5 s</b><p>试验报告35 s，任务指标30 s。</p></div>
            <button class="dm-btn primary wide" @click="progress = Math.min(100, progress + 12)">继续执行</button>
          </section>
        </div>
      </template>

      <section class="dm-panel dm-table-panel">
        <div class="table-tools"><PanelTitle :title="tableTitle" /><div><input v-model="search" placeholder="搜索名称或业务对象" /><button class="dm-btn" @click="search=''">重置</button><button class="dm-btn primary" @click="addRecord">新增</button></div></div>
        <table class="dm-table"><thead><tr><th>序号</th><th>名称</th><th>业务对象</th><th>规则 / 来源</th><th>状态</th><th>更新时间</th><th>操作</th></tr></thead><tbody><tr v-for="row in filteredRows" :key="row.id"><td>{{ row.id }}</td><td><b>{{ row.name }}</b></td><td>{{ row.object }}</td><td>{{ row.source }}</td><td><span class="state" :class="row.tone">● {{ row.status }}</span></td><td>{{ row.time }}</td><td><button @click="view(row)">查看</button><button @click="edit(row)">编辑</button></td></tr></tbody></table>
      </section>
    </section>
  </div>
</template>

<script setup>
import { computed, defineComponent, h, ref } from 'vue'
import Icon from '@/components/Icon.vue'
import { useUi } from '@/composables/ui'
import { reviewReportSections, reviewReportBodies } from '@/data/mock'

const props = defineProps({ page: Object, title: String })
const { toast, openDrawer, openForm } = useUi()
const scene = computed(() => props.page.scene)
const featureName = computed(() => props.page.featureName || props.title)
const moduleName = computed(() => props.page.moduleName || '')
const search = ref('')
const fileInput = ref(null)
const dragging = ref(false)
const uploading = ref(false)
const pickedName = ref('')
const uploadStage = ref('')
const uploadProgress = ref(0)
const enabled = ref(true)
const formName = ref(featureName.value)
const description = ref(`面向${moduleName.value}业务，对${featureName.value}的对象、条件、规则和处理结果进行统一配置与管理。`)
const activeStep = ref(2)
const selectedChapter = ref(0)
const progress = ref(72)
const conditions = ref([
  { field: '文档内容', op: '包含', value: '试验报告' }, { field: '文档来源', op: '等于', value: '试验部门' }, { field: '元数据主题', op: '包含', value: '性能试验' },
])

const formScenes = ['classify','ontology','terms','policy','rule-model','natural-rule','standard-parse','template','migration']
const graphScenes = ['transfer','extract','constraint','validation']
const documentScenes = ['knowledge','api','outline','generate','generation-trace','standard-review','result-review','result-mapping','report-generate','report-compliance']
const showSteps = computed(() => ['natural-rule','standard-parse','strategy-review','agent-review','skill-review','result-mapping','report-generate','migration'].includes(scene.value))
const steps = computed(() => scene.value === 'report-generate' ? ['场景识别','模板匹配','逻辑匹配','报告生成','格式输出'] : ['任务配置','资源关联','智能处理','结果确认'])
const primaryAction = computed(() => ({ upload:'提交接入', api:'发起调用', migration:'重新校验', 'report-generate':'开始生成', 'result-review':'生成成果文件' }[scene.value] || (scene.value.includes('review') ? '开始审查' : '执行处理')))
const secondaryAction = computed(() => ({ api:'接口配置', upload:'选择文件', template:'模板库', migration:'查看数据包' }[scene.value] || '配置设置'))
const subtitle = computed(() => {
  const map = {
    upload:'集中接收多源文档，登记来源信息并形成统一文档记录', classify:'配置分类条件与标签规则，为自动分类和智能标注提供依据', ontology:'统一领域核心概念、属性与关系，构建标准化本体模型', transfer:'厘清不同文书间的信息来源、承接方式与细化路径', extract:'将文书中的审查要素转化为类型明确、来源可查的结构化实体', constraint:'建立实体语义关联、约束方向与可校验网络结构', terms:'结合上下文与业务对象完成同义映射和术语消歧', policy:'将差异化审查要求配置为可维护、可调用的规则策略', validation:'检查模型定义、实体抽取、关系流向和方向约束的一致性', knowledge:'从规范和历史资料识别对象、条件与约束，沉淀审查知识资产', api:'按文书类型、业务对象和检索条件调用领域知识服务', template:'配置模板章节、格式和填写项，形成可复用的标准文档结构', outline:'基于术语库、知识库与历史案例生成可调整的标准化提纲', generate:'结合模板、提纲与领域知识，生成来源可查、表述规范的专业文稿', 'generation-trace':'关联需求、模板、提纲、知识引用和内容修改，记录文稿形成过程', 'rule-model':'将审查依据配置为对象、条件和约束明确的可执行规则', 'natural-rule':'将自然语言审查需求解析为对象、条件和约束明确的规则', 'standard-parse':'解析标准章节结构、审查要点与引用依据，生成结构化审查模板', 'strategy-review':'融合语义规则、本体模型与领域知识图谱完成联合推理', 'cross-review':'贯通文书要求、实施内容与试验结果，定位跨文档冲突和遗漏', 'agent-review':'统一编排专项智能体的任务分派、执行依赖、结果交接与异常处理', 'skill-review':'自动匹配专业技能包，调用规则、工具与知识库完成专项核查', 'standard-review':'依据选定模板核验章节结构、必需要素、内容完整性与语义规则', 'result-review':'对照文档原文、审查依据和修改建议完成问题复核修订', 'review-trace':'还原审查结论形成过程，关联原文事实、适用依据与复核结果', migration:'核对迁移前后的知识内容、版本信息与资源关联，确保数据完整一致', 'result-mapping':'将结构化审查成果自动归集并映射至评审报告章节与内容项', 'report-generate':'依据场景、模板和生成逻辑，将审查成果组织为完整评审报告', 'report-compliance':'校验报告完整性、准确性和逻辑一致性，并追溯结论对应成果与依据',
  }
  return map[scene.value] || `完成${featureName.value}的配置、执行、校验和成果管理。`
})

const kpis = computed(() => {
  const pools = {
    upload: [['本次文件','4','项','doc'],['已完成','2','项','audit'],['处理中','1','项','timeline'],['待提交','1','项','folder']],
    migration: [['迁移资源','156','项','doc'],['成功写入','149','项','audit'],['待处理','5','项','timeline'],['失败','2','项','target']],
    'report-generate': [['采用成果','128','项','doc'],['报告章节','7','章','book'],['引用依据','46','条','graph'],['内容完成度','92','%','chart']],
  }
  const base = pools[scene.value] || [['业务对象','128','项','doc'],['已完成','96','项','audit'],['关联规则','36','条','graph'],['待处理','3','项','timeline']]
  return base.map(([label,value,unit,icon]) => ({ label,value,unit,icon }))
})
const leftTitle = computed(() => ({ upload:'文件接入', classify:'规则基本信息', ontology:'核心概念列表', transfer:'文档信息传递关系画布', extract:'文档原文与实体标识', constraint:'实体关系建模画布', terms:'跨文书上下文对照', policy:'规则组合编排', validation:'领域模型验证视图', knowledge:'知识原文与要素识别', api:'请求参数', template:'模板章节结构', outline:'提纲结构', generate:'章节与生成进度', 'generation-trace':'文档生成全过程', 'rule-model':'规则逻辑构建器', 'natural-rule':'需求解析与知识关联', 'standard-parse':'标准结构与原文校对', 'strategy-review':'待审文档与内容定位', 'cross-review':'一致性链路图', 'agent-review':'协同审查流程', 'skill-review':'技能包自动匹配', 'standard-review':'待审文档结构', 'result-review':'审查问题', 'review-trace':'可视化审查理由链', migration:'迁移数据包',     'result-mapping':'审查成果归集', 'report-generate':'评审报告目录', 'report-compliance':'评审报告目录' }[scene.value] || moduleName.value))
const centerTitle = computed(() => ({ generate:'正文生成编辑器', 'result-review':'文档批注与修订', 'report-generate':'评审报告正文', 'report-compliance':'报告内容与自动标记' }[scene.value] || '内容处理工作区'))
const rightTitle = computed(() => ({ classify:'匹配条件配置', ontology:'本体结构预览', transfer:'关系配置', extract:'实体详情', constraint:'关系属性', validation:'验证结果概览', knowledge:'结构化规则', api:'调用结果', outline:'章节设计', generate:'知识与话术推荐', 'generation-trace':'过程节点详情', 'rule-model':'知识依据与模板绑定', 'natural-rule':'可执行规则预览', 'standard-parse':'审查要点与模板配置', 'strategy-review':'融合审查结论', 'cross-review':'问题详情与证据链', 'agent-review':'当前任务执行详情', 'skill-review':'阶段结果与人机交互', 'standard-review':'问题详情与依据', 'result-review':'问题依据与复核', 'review-trace':'节点详情与来源', migration:'校验结果', 'result-mapping':'模板填充预览', 'report-generate':'生成说明', 'report-compliance':'结论溯源链路' }[scene.value] || '配置详情'))
const tableTitle = computed(() => `${featureName.value}记录`)

const graphNodes = [
  { name:'对象', value:'某型A01', icon:'model', pos:'p1' }, { name:'技术指标', value:'高温启动时间', icon:'chart', pos:'p2' }, { name:'指标值', value:'≤ 30 s', icon:'target', pos:'p3' }, { name:'试验条件', value:'环境温度 -40℃', icon:'code', pos:'p4' }, { name:'标准依据', value:'GJB 150.3A', icon:'book', pos:'p5' }, { name:'评审结论', value:'符合要求', icon:'audit', pos:'p6' },
]
const flowNodes = [
  { title:'语义规则审查', text:'规则事件与文档内容校验', icon:'doc' }, { title:'本体逻辑审查', text:'概念、属性与关系核验', icon:'graph' }, { title:'跨文档核查', text:'指标承接与结果一致性', icon:'compare' }, { title:'证据追溯', text:'原文、条款与版本定位', icon:'search' }, { title:'结果汇集', text:'问题分级与整改建议', icon:'audit' },
]
const defaultChapters = ['试验目的','引用文件','试验条件','高温启动试验','结果判定','问题清单','统计分析','评审结论']
const reviewChapters = reviewReportSections.map((s) => s.title)
const reportScenes = ['report-generate', 'report-compliance', 'result-mapping']
const isReportScene = computed(() => reportScenes.includes(scene.value))
const chapters = computed(() => (isReportScene.value ? reviewChapters : defaultChapters))
const currentReviewBody = computed(() => {
  const no = selectedChapter.value + 1
  return reviewReportBodies[no] || null
})
const rows = ref([
  { id:1, name:`${featureName.value}任务A`, object:'高温启动时间', source:'GJB 150.3A / R-HT-024', status:'已启用', tone:'ok', time:'2026-10-22 14:25' },
  { id:2, name:`${featureName.value}任务B`, object:'立靶高低偏差', source:'指标树 V1.0', status:'已完成', tone:'ok', time:'2026-10-22 11:32' },
  { id:3, name:`${featureName.value}任务C`, object:'试验样本量', source:'性能试验提纲 V4', status:'待复核', tone:'warn', time:'2026-10-21 17:03' },
  { id:4, name:`${featureName.value}任务D`, object:'越壕宽', source:'审查知识库 V2.3', status:'草稿', tone:'muted', time:'2026-10-20 09:18' },
])
const filteredRows = computed(() => rows.value.filter((row) => !search.value || `${row.name}${row.object}${row.source}`.includes(search.value)))

function addCondition() { conditions.value.push({ field:'业务对象', op:'等于', value:'高温启动时间' }) }
function save() { toast(`${featureName.value}已保存`) }
function pickFile() { if (!uploading.value) fileInput.value?.click() }
function onDrop(event) {
  dragging.value = false
  const file = event.dataTransfer?.files?.[0]
  if (file) startUpload(file)
}
function onFile(event) {
  const file = event.target.files?.[0]
  if (file) startUpload(file)
  event.target.value = ''
}
function startUpload(file) {
  if (uploading.value) return
  pickedName.value = file.name
  uploading.value = true
  uploadProgress.value = 8
  const stages = ['正在上传', 'OCR 与版式还原', '文字识别与格式归一', '写入归集库']
  uploadStage.value = stages[0]
  let step = 0
  const timer = setInterval(() => {
    step += 1
    uploadProgress.value = Math.min(100, step * 25)
    uploadStage.value = stages[Math.min(stages.length - 1, step)]
    if (step < stages.length) return
    clearInterval(timer)
    uploading.value = false
    rows.value.unshift({
      id: rows.value.length + 1,
      name: file.name,
      object: '多源文档接入',
      source: '内部系统上传',
      status: '已入库',
      tone: 'ok',
      time: '2026-10-22 16:40',
    })
    toast(`${file.name} 已完成识别并入库`)
  }, 450)
}
function run() {
  if (scene.value === 'upload') {
    if (uploading.value) return
    if (!pickedName.value) return toast('请先选择文件')
    return toast(`${pickedName.value} 已入库`)
  }
  activeStep.value = Math.min(steps.value.length - 1, activeStep.value + 1)
  progress.value = Math.min(100, progress.value + 14)
  toast(`${featureName.value}执行成功`)
}
function addRecord() { openForm(`新增${featureName.value}`, [{ key:'name', label:'名称', value:`${featureName.value}新任务` },{ key:'object', label:'业务对象', value:'技术指标' },{ key:'source', label:'规则或来源', value:'审查知识库' }], (value) => { rows.value.unshift({ id:rows.value.length+1, ...value, status:'草稿', tone:'muted', time:'2026-10-22 17:10' }); toast('记录已新增') }) }
function view(row) { openDrawer(row.name, [{label:'业务对象',value:row.object},{label:'规则 / 来源',value:row.source},{label:'状态',value:row.status},{label:'更新时间',value:row.time}]) }
function edit(row) { openForm(`编辑${row.name}`, [{key:'name',label:'名称',value:row.name},{key:'object',label:'业务对象',value:row.object},{key:'source',label:'规则或来源',value:row.source}], (value) => Object.assign(row,value)) }

const PanelTitle = defineComponent({
  props: { title: String },
  setup(props, { slots }) { return () => h('div', { class:'dm-panel-title' }, [h('b', props.title), h('div', slots.default?.())]) },
})
</script>

<style scoped>
.doc-module-page{min-width:1080px;color:#334e66}.dm-workspace{background:#fff;border:1px solid #dbe6ef;border-radius:7px;padding:16px 18px;box-shadow:0 5px 18px rgba(20,62,96,.04)}.dm-titlebar{display:flex;align-items:flex-start;justify-content:space-between;gap:18px;margin-bottom:12px}.dm-titlebar h2{font-size:23px;color:#064b88;line-height:1.2}.dm-titlebar p{margin-top:5px;color:#74899d;font-size:13px}.dm-actions{display:flex;gap:9px}.dm-btn{height:36px;padding:0 18px;border:1px solid #8db9de;background:#fff;color:#0867b2;border-radius:4px;font-weight:600}.dm-btn.primary{color:#fff;border-color:#075692;background:linear-gradient(#0874c5,#05528e)}.dm-btn.gold{border-color:#dfb35c;color:#a86b00}.dm-btn.wide{width:100%;margin-top:12px}.dm-steps{height:48px;display:grid;grid-template-columns:repeat(5,1fr);align-items:center;border-top:1px solid #edf2f6;border-bottom:1px solid #edf2f6;margin-bottom:12px}.dm-steps>div{display:flex;align-items:center;gap:8px;color:#8394a4;position:relative}.dm-steps>div:not(:last-child)::after{content:'';height:2px;background:#d9e4ee;position:absolute;left:72%;right:-8%;top:16px}.dm-steps b{width:30px;height:30px;border-radius:50%;display:grid;place-items:center;background:#e2e9f0}.dm-steps .done b,.dm-steps .active b{background:#0970c1;color:#fff}.dm-steps .done,.dm-steps .active{color:#0867b2;font-weight:600}.dm-kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:14px}.dm-kpis article{position:relative;display:flex;align-items:center;gap:14px;min-height:84px;border:1px solid #e2ebf3;border-radius:10px;padding:14px 16px 14px 18px;background:#fff;overflow:hidden}.dm-kpis article::before{content:'';position:absolute;left:0;top:0;bottom:0;width:3px;background:#d0ab68}.dm-kpis article:nth-child(2)::before{background:#1668a8}.dm-kpis article:nth-child(3)::before{background:#22913c}.dm-kpis article:nth-child(4)::before{background:#8b6bb8}.dm-kpi-icon{position:static;width:44px;height:44px;padding:10px;border-radius:10px;background:#fff8e8;color:#a07820;box-sizing:border-box;flex:0 0 44px}.dm-kpis article:nth-child(2) .dm-kpi-icon{background:#e8f2fb;color:#1668a8}.dm-kpis article:nth-child(3) .dm-kpi-icon{background:#eaf7ee;color:#22913c}.dm-kpis article:nth-child(4) .dm-kpi-icon{background:#f3eef8;color:#8b6bb8}.dm-kpis span{display:block;color:#6d8092;font-size:13px}.dm-kpis strong{display:block;margin-top:4px;font-size:28px;color:#0d4e83;line-height:1.15}.dm-kpis small{margin-left:5px;color:#8a99a8;font-size:13px}.dm-grid{display:grid;gap:12px;margin-bottom:12px}.dm-panel{border:1px solid #dce7f0;border-radius:6px;background:#fff;padding:12px}.dm-panel-title{display:flex;justify-content:space-between;align-items:center;min-height:30px;color:#07518f;border-bottom:1px solid #edf2f6;padding-bottom:8px;margin-bottom:10px}.dm-panel-title>b:before{content:'';display:inline-block;width:4px;height:17px;border-radius:2px;background:#0870bf;margin-right:8px;vertical-align:-3px}.dm-panel-title>div{display:flex;gap:6px}.upload-layout{grid-template-columns:1fr 1.1fr}.upload-box{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:250px;border:1px dashed #78b9e9;background:#f8fcff}.upload-box .cloud{width:70px;height:48px;border-radius:30px 30px 15px 15px;background:#1378c6;color:#fff;font-size:35px;text-align:center;line-height:52px}.upload-box h3{color:#07518f;margin-top:15px}.upload-box p{color:#718599;margin:8px 0 18px}.upload-box.drag{background:#eef6fd;border-color:#0870bf}.upload-box.busy{cursor:default}.file-input{display:none}.upload-name{color:#07518f;margin-top:8px}.upload-bar{display:block;width:min(320px,80%);height:8px;border-radius:6px;background:#e3edf5;overflow:hidden}.upload-bar em{display:block;height:100%;background:linear-gradient(90deg,#0874c5,#d0ab68);transition:width .35s ease}.form-layout{grid-template-columns:1fr 1fr}.dm-form{display:grid;gap:10px}.dm-form.two{grid-template-columns:1fr 1fr}.dm-form label{font-size:12.5px;color:#607589}.dm-form label.wide{grid-column:1/-1}.dm-form input,.dm-form select,.dm-form textarea,.condition-row input,.condition-row select,.dm-search,.table-tools input{display:block;width:100%;height:34px;border:1px solid #cfdae5;border-radius:4px;padding:0 10px;color:#405970;background:#fff;margin-top:5px}.dm-form textarea{height:65px;padding-top:8px;resize:none}.switch{display:inline-block;width:47px;height:25px;border-radius:15px;background:#aebbc6;margin:7px 0 0 10px;vertical-align:middle;padding:3px;cursor:pointer}.switch i{display:block;width:19px;height:19px;border-radius:50%;background:#fff}.switch.on{background:#1178c7}.switch.on i{margin-left:22px}.condition-row{display:grid;grid-template-columns:1fr .8fr 1.4fr 28px;gap:8px;align-items:end;margin-bottom:8px}.condition-row button{height:34px;border:0;background:transparent;color:#e14731;font-size:18px}.dash-button{height:34px;border:1px dashed #77b8e8;background:#fff;color:#0870bf;padding:0 18px}.align-right{display:flex;justify-content:flex-end;gap:8px;margin-top:12px}.graph-layout{grid-template-columns:1.5fr .7fr}.graph-panel{min-height:390px}.mini-control{height:28px;border:1px solid #c7d8e7;background:#fff;color:#0867b2;border-radius:4px;padding:0 9px}.graph-canvas{position:relative;height:325px;background-image:linear-gradient(#edf4f9 1px,transparent 1px),linear-gradient(90deg,#edf4f9 1px,transparent 1px);background-size:24px 24px;overflow:hidden}.graph-canvas svg,.flow-canvas svg{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}.graph-canvas path,.flow-canvas path{fill:none;stroke:#1781cf;stroke-width:2}.graph-node{position:absolute;width:150px;height:67px;border:1px solid #65ace2;background:#f6fbff;border-radius:8px;padding:9px 8px 8px 47px}.graph-node svg{position:absolute;left:13px;top:17px;width:27px;height:27px;color:#1477bf}.graph-node b,.graph-node small{display:block}.graph-node b{color:#07518f}.graph-node small{font-size:11px;margin-top:5px}.graph-node.center{left:calc(50% - 75px);top:142px;color:#fff;background:linear-gradient(#1480d1,#075b9c);border:0}.graph-node.center b,.graph-node.center small{color:#fff}.graph-node.p1{left:25px;top:35px}.graph-node.p2{right:25px;top:25px;border-color:#d9aa49}.graph-node.p3{right:20px;top:150px}.graph-node.p4{left:25px;bottom:28px}.graph-node.p5{left:calc(50% - 75px);bottom:18px}.graph-node.p6{right:25px;bottom:25px}.selected-relation{display:grid;grid-template-columns:1fr 26px 1fr;align-items:center;text-align:center;background:#eef7fd;padding:12px;border-left:5px solid #e3b64f;position:relative}.selected-relation em{position:absolute;right:8px;top:4px;color:#a86b00;font-size:11px}.document-layout{grid-template-columns:250px 1fr 340px;align-items:stretch}.doc-tree{padding:10px}.dm-search{margin:0 0 8px}.doc-tree>button{width:100%;height:38px;border:0;background:#fff;display:grid;grid-template-columns:26px 1fr 20px;align-items:center;text-align:left;color:#496178;padding:0 8px}.doc-tree>button.active{background:#e8f4fd;color:#0870bf;font-weight:700;border-left:3px solid #0870bf}.doc-tree>button em{font-style:normal;color:#2da251}.editor-tabs{height:34px;display:flex;border-bottom:1px solid #dfe8ef}.editor-tabs button{border:0;background:#fff;color:#73869a;padding:0 22px}.editor-tabs button.active{color:#0870bf;border-bottom:2px solid #0870bf}.blue-tag{background:#e7f3fd;color:#0870bf;border-radius:4px;padding:3px 8px;font-size:11px}.paper{min-height:355px;margin:10px;background:#fff;box-shadow:0 4px 16px rgba(24,62,93,.1);padding:28px 38px}.paper h2{color:#213e56;margin-bottom:24px}.paper p{line-height:1.9;margin:14px 0}.paper mark{background:#ffe4a8;padding:2px 6px}.paper-table{display:grid;grid-template-columns:1.4fr 1fr 1fr;border:1px solid #dbe5ed}.paper-table>*{padding:9px;border-right:1px solid #dbe5ed;text-align:center}.paper-table b{background:#eaf3fa}.paper-table strong{color:#e3302f;background:#ffeded}.alert-card{border:1px solid #efb6af;background:#fff2f1;padding:12px;border-radius:5px;margin-bottom:12px;position:relative}.alert-card b{color:#d92d20}.alert-card em{position:absolute;right:10px;top:8px;background:#e54235;color:#fff;padding:2px 8px;border-radius:4px;font-size:11px}.alert-card p{font-size:12px;margin-top:7px}.insight-panel h4,.detail-panel h4{color:#07518f;margin:12px 0 6px}.insight-panel ul,.detail-panel ul{padding-left:20px;line-height:1.8;font-size:12px}.suggestion{background:#eef7fd;padding:10px;line-height:1.6;font-size:12px}.flow-layout{grid-template-columns:1.45fr .65fr}.flow-canvas{height:405px;position:relative;background-image:linear-gradient(#edf4f9 1px,transparent 1px),linear-gradient(90deg,#edf4f9 1px,transparent 1px);background-size:24px 24px}.flow-node{position:absolute;width:160px;min-height:88px;border:1px solid #4aa0dc;background:#fff;border-radius:7px;padding:10px 9px 10px 43px;z-index:1}.flow-node>svg{position:absolute;left:11px;top:15px;width:24px;height:24px;color:#0870bf}.flow-node b,.flow-node span,.flow-node em{display:block}.flow-node b{color:#07518f}.flow-node span{font-size:11px;margin:6px 0;color:#60758a}.flow-node em{font-size:11px;font-style:normal;color:#239049}.flow-node.n0{left:35px;top:60px}.flow-node.n1{left:345px;top:60px}.flow-node.n2{right:35px;top:60px}.flow-node.n3{right:130px;bottom:45px}.flow-node.n4{left:120px;bottom:45px}.detail-status{display:flex;align-items:center;gap:8px;background:#f3f8fc;padding:10px}.detail-status span{color:#798b9b;font-size:12px}.detail-status b{color:#07518f}.detail-status em{margin-left:auto;background:#e3f6e9;color:#218844;padding:3px 8px;border-radius:9px;font-style:normal;font-size:11px}.progress{display:flex;align-items:center;gap:8px;margin:13px 0}.progress i{height:9px;flex:1;background:#dce7ef;border-radius:5px;overflow:hidden}.progress i span{display:block;height:100%;background:#0875c7}.progress b{color:#0870bf}.dm-table-panel{margin-top:2px}.table-tools{display:flex;justify-content:space-between;align-items:center}.table-tools .dm-panel-title{border:0;margin:0}.table-tools>div{display:flex;gap:7px}.table-tools input{width:260px;margin:0}.dm-table{width:100%;border-collapse:collapse;font-size:12px}.dm-table th{background:#e9f2f9;color:#38546c;text-align:left;padding:9px}.dm-table td{border-top:1px solid #e4ebf1;padding:9px}.dm-table td button{border:0;background:transparent;color:#0870bf;margin-right:10px}.state{font-size:11px}.state.ok{color:#168c40}.state.warn{color:#d28a00}.state.muted{color:#8695a4}@media(max-width:1500px){.document-layout{grid-template-columns:220px 1fr 290px}.doc-module-page{min-width:1000px}}
.review-layout{grid-template-columns:280px 1fr 300px}
.review-toc{padding:12px 10px 14px}
.review-toc>button{
  width:100%;min-height:44px;height:auto;border:0;background:#fff;
  display:grid;grid-template-columns:28px 1fr;align-items:flex-start;gap:8px;
  text-align:left;color:#3f5062;padding:8px 10px;border-radius:8px;line-height:1.45;font-size:13px;
}
.review-toc>button>span{
  width:22px;height:22px;border-radius:6px;display:grid;place-items:center;
  background:#5b8fbe;color:#fff;font-size:12px;font-weight:700;margin-top:1px;
}
.review-toc>button.active{background:#e9f5fe;color:#0868b7;font-weight:600}
.review-toc>button.active>span{background:#0868b7}
.paper .lead{color:#5a6d7e;font-size:13.5px}
.paper .content-hint{margin-top:18px;color:#8a99a8;font-size:12.5px}
.paper .figure-note{background:#f5f9fd;border:1px solid #d7e6f3;border-radius:6px;padding:10px 12px;color:#4a5a6a;font-size:13px}
.review-table-wrap{margin:16px 0}
.review-table-cap{font-size:13px;font-weight:600;color:#07518f;margin-bottom:8px}
.review-table{width:100%;border-collapse:collapse;font-size:13px}
.review-table th,.review-table td{border:1px solid #dbe5ed;padding:8px 10px;text-align:left}
.review-table th{background:#eaf3fa;color:#38546c;white-space:nowrap}
.alert-card.tone-ok{border-color:#9fd0b0;background:#f0faf3}
.alert-card.tone-ok b{color:#16843a}
.alert-card.tone-ok em{background:#2f9e62}
</style>
