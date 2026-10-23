<template>
  <div class="post-trial">
    <div class="post-head">
      <div>
        <div class="module-code">{{ page.module }}</div>
        <h2>{{ title }}</h2>
        <p>{{ page.desc }}</p>
      </div>
      <div class="head-actions">
        <span class="baseline">业务基线：D-12 / D-13 / D-14</span>
        <button class="btn btn-outline" @click="toast('演示数据已刷新')">刷新数据</button>
      </div>
    </div>

    <template v-if="stage === 'outline'">
      <section class="step-strip compact">
        <div v-for="(step, index) in wizardSteps" :key="step" class="step" :class="{ done: index < 2, active: index === 1 }">
          <b>{{ index < 2 ? '✓' : index + 1 }}</b><span>{{ step }}</span>
        </div>
      </section>
      <div class="kpi-row post-kpis">
        <div class="kpi"><div class="label">提纲章节</div><div class="value">8 <small>章</small></div></div>
        <div class="kpi"><div class="label">提纲要点</div><div class="value">24 <small>项</small></div></div>
        <div class="kpi"><div class="label">知识引用</div><div class="value">31 <small>条</small></div></div>
        <div class="kpi"><div class="label">完整度</div><div class="value">100<small>%</small></div></div>
      </div>
      <div class="outline-layout">
        <section class="post-panel outline-tree">
          <div class="panel-title"><span>自动生成提纲</span><div><button class="mini-btn" @click="toast('已按鉴定报告模板重新排序')">自动排序</button><button class="mini-btn gold" @click="addOutline">新增章节</button></div></div>
          <div v-for="item in outlineRows" :key="item.no" class="outline-row" :class="{ selected: selectedOutline.no === item.no }" @click="selectedOutline = item">
            <span class="drag">⋮⋮</span><span class="chapter-no">{{ item.no }}</span><b>{{ item.name }}</b><span class="source-pill">{{ item.source }}</span><span class="chev">›</span>
          </div>
        </section>
        <section class="post-panel outline-editor">
          <div class="panel-title"><span>章节设计</span><span class="good-tag">已通过完整性检查</span></div>
          <label>章节名称</label>
          <input v-model="selectedOutline.name" />
          <label>生成来源</label>
          <div class="source-box">{{ selectedOutline.source }}<span>已绑定</span></div>
          <label>章节要点</label>
          <div class="point-list">
            <div v-for="(child, index) in selectedOutline.children" :key="index"><span>☷</span><input v-model="selectedOutline.children[index]" /><button @click="removePoint(index)">×</button></div>
          </div>
          <button class="btn btn-outline" @click="addPoint">＋ 添加要点</button>
          <div class="recommend-box"><b>智能建议</b><p>建议在“符合性判定”章保留指标树版本与第19发事件关联字段，便于后续审查和溯源。</p></div>
          <div class="editor-actions"><button class="btn btn-outline" @click="saveOutline">保存提纲</button><button class="btn btn-primary" @click="goTo('write', 'draft')">下一步：生成初稿</button></div>
        </section>
      </div>
    </template>

    <template v-else-if="stage === 'compose'">
      <template v-if="composeMode === 'wizard'">
        <section class="step-strip">
          <div v-for="(step, index) in wizardSteps" :key="step" class="step" :class="{ done: index < 2, active: index === 2 }">
            <b>{{ index < 2 ? '✓' : index + 1 }}</b><span>{{ step }}</span><small>{{ index === 0 ? '3类素材就绪' : index === 1 ? '8章提纲完成' : index === 2 ? '等待生成' : '生成后进入审校' }}</small>
          </div>
        </section>
        <div class="material-grid">
          <article v-for="material in postTrialMaterials" :key="material.id" class="material-card" :class="material.tone">
            <div class="material-icon">{{ material.id === 'rule' ? '树' : material.id === 'data' ? '表' : '析' }}</div>
            <div><h3>{{ material.name }}</h3><p>{{ material.meta }}</p><small>来源：{{ material.source }}</small></div>
            <span class="status-badge">{{ material.status }}</span>
          </article>
        </div>
        <div class="compose-grid">
          <section class="post-panel">
            <div class="panel-title"><span>8章提纲预览</span><button class="mini-btn" @click="goTo('write', 'outline')">编辑提纲</button></div>
            <div class="chapter-preview" v-for="item in outlineRows" :key="item.no"><b>{{ item.no }} {{ item.name }}</b><span>{{ item.children.join(' · ') }}</span><em>{{ item.source }}</em></div>
          </section>
          <section class="post-panel generate-panel">
            <div class="panel-title"><span>报告生成向导</span><span class="good-tag">素材校验通过</span></div>
            <div class="config-row"><span>报告模板</span><b>性能鉴定试验报告标准模板 V3.2</b></div>
            <div class="config-row"><span>判据版本</span><b>指标树 V1.0</b></div>
            <div class="config-row"><span>试验数据</span><b>30发 + 复测数据</b></div>
            <div class="config-row"><span>生成策略</span><b>装配式生成 · 强制溯源</b></div>
            <div class="check-list"><span>✓ 素材完整</span><span>✓ 提纲完整</span><span>✓ 引用有效</span><span>✓ 数据勾稽通过</span></div>
            <button class="generate-btn" :disabled="assembling" @click="generateDraft"><span>{{ assembling ? '正在装配…' : '生成初稿' }}</span><small>章节、数据、图表自动装配</small></button>
          </section>
        </div>
      </template>

      <template v-else>
        <div class="document-toolbar">
          <div><b>某型装备性能鉴定试验报告</b><span>V1（初稿）</span><span class="good-tag">已生成</span></div>
          <div><button class="btn btn-outline" @click="composeMode = 'wizard'">返回编写向导</button><button class="btn btn-outline" @click="goTo('write', 'trace')">查看数据溯源</button><button class="btn btn-primary" @click="submitReview">进入智能审查</button></div>
        </div>
        <div class="report-layout">
          <aside class="report-nav post-panel">
            <div class="panel-title"><span>报告章节</span><small>8章</small></div>
            <button v-for="item in outlineRows" :key="item.no" :class="{ active: postTrialState.selectedChapter === item.name }" @click="postTrialState.selectedChapter = item.name"><span>{{ item.no }}</span>{{ item.name }}<em>✓</em></button>
          </aside>
          <section class="report-paper post-panel">
            <div class="paper-title"><div><small>第六章</small><h2>{{ postTrialState.selectedChapter }}</h2></div><span class="trace-badge">⌁ 本节可溯源</span></div>
            <template v-if="postTrialState.selectedChapter === '异常事件与处置'">
              <div class="event-summary"><b>第19发异常事件闭环</b><span>事件编号 EVT-19</span></div>
              <p class="paper-text">第19发试验中发现立靶高低偏差超差。经探针平台定位，根因为定位定向系统温补失效；完成温补校准后，对同一工况组织复测，复测值为 0.18 mil，符合不大于 0.30 mil 的判据要求。</p>
              <div class="scatter"><div class="target-ring r1"></div><div class="target-ring r2"></div><div class="target-ring r3"></div><i v-for="n in 8" :key="n" :style="scatterStyle(n)"></i><i class="outlier"></i><span>× 第19发首测</span><em>● 复测</em></div>
              <div class="cause-table"><div><b>候选根因</b><b>证据</b><b>结论</b></div><div><span>定位定向系统温补失效</span><span>温漂曲线与偏差同向，校准后恢复</span><strong>确认根因</strong></div><div><span>机械安装偏差</span><span>复核无松动，静态检查正常</span><span>排除</span></div></div>
              <div class="source-note">来源：第19发异常解读报告 · 探针平台 · V1.1</div>
            </template>
            <template v-else>
              <div v-if="postTrialState.selectedChapter === '符合性判定'" class="event-summary"><b>第19发判定：复测后符合</b><span>首测 0.42 mil 超差，温补校准后复测 0.18 mil，判据 ≤ 0.30 mil</span></div>
              <p class="paper-text">依据指标树 V1.0、30发试验数据汇总表及复测记录，对28项性能指标逐项完成符合性判定。27项直接符合，立靶高低偏差经温补校准后复测符合。</p>
              <div class="metric-table-wrap">
                <table class="metric-table"><thead><tr><th>序号</th><th>指标名称</th><th>实测值</th><th>判据</th><th>符合性结论</th><th>引用</th></tr></thead><tbody>
                  <tr v-for="metric in postTrialMetrics" :key="metric.no" :class="{ focus: metric.event }"><td>{{ metric.no }}</td><td><b>{{ metric.name }}</b><small v-if="metric.event">{{ metric.event }}</small></td><td>{{ metric.value }}</td><td>{{ metric.criterion }}</td><td><span class="result-tag" :class="{ gold: metric.event }">{{ metric.conclusion }}</span></td><td><button class="source-link" @click="showSource(metric)">⌁ {{ metric.source }}</button></td></tr>
                </tbody></table>
              </div>
            </template>
            <footer class="version-bar"><span>文档版本：<b>V1 初稿</b></span><span>素材基线：指标树 V1.0 / 性能试验提纲 V4</span><span>生成时间：2026-10-22 15:32</span></footer>
          </section>
        </div>
      </template>
    </template>

    <template v-else-if="stage === 'trace'">
      <div class="document-toolbar">
        <div><b>文档生成溯源与版本管控</b><span>某型装备性能鉴定试验报告</span></div>
        <div><button class="btn btn-outline" @click="goTo('write', 'draft')">返回初稿</button><button class="btn btn-primary" @click="submitReview">进入智能审查</button></div>
      </div>
      <div class="kpi-row post-kpis">
        <div class="kpi"><div class="label">过程节点</div><div class="value">8</div></div><div class="kpi"><div class="label">引用依据</div><div class="value">36</div></div><div class="kpi"><div class="label">文档版本</div><div class="value">2</div></div><div class="kpi"><div class="label">修改记录</div><div class="value">11</div></div>
      </div>
      <section class="post-panel lineage-panel">
        <div class="panel-title"><span>文档生成全过程</span><div class="tab-line"><button class="active">过程时间轴</button><button>条款关系图</button><button>版本演进</button></div></div>
        <div class="lineage-flow"><div v-for="(node, index) in lineage" :key="node.name" class="lineage-node" :class="{ active: index === 5 }"><b>{{ node.icon }}</b><strong>{{ node.name }}</strong><span>{{ node.time }}</span><small>{{ node.desc }}</small></div></div>
      </section>
      <div class="trace-grid">
        <section class="post-panel"><div class="panel-title"><span>条款与引用追溯</span><button class="mini-btn" @click="toast('全部引用校验通过')">引用校验</button></div><table class="simple-table"><thead><tr><th>文书条款</th><th>来源类型</th><th>来源名称</th><th>来源位置</th><th>引用状态</th><th>操作</th></tr></thead><tbody><tr v-for="row in traceRows" :key="row.clause"><td>{{ row.clause }}</td><td>{{ row.type }}</td><td>{{ row.source }}</td><td>{{ row.location }}</td><td><span class="good-tag">引用有效</span></td><td><button class="link-btn" @click="toast(`已定位：${row.source} ${row.location}`)">跳转原文</button></td></tr></tbody></table></section>
        <section class="post-panel version-panel"><div class="panel-title"><span>版本记录</span></div><div class="version-item current"><b>V2 定稿</b><span>审查意见处理后形成</span><small>2026-10-22 16:38 · 7项意见已留痕</small></div><div class="version-item"><b>V1 初稿</b><span>装配式生成</span><small>2026-10-22 15:32 · 素材基线 D-12/D-13</small></div></section>
      </div>
    </template>

    <template v-else-if="stage === 'review'">
      <template v-if="reviewMode === 'tasks'">
        <div class="review-overview"><div><b>智能审查任务</b><span>融合术语规范、数据勾稽、判据引用三类策略</span></div><button class="btn btn-primary" @click="toast('新建审查任务窗口已打开')">新建任务</button></div>
        <div class="kpi-row post-kpis"><div class="kpi"><div class="label">审查任务</div><div class="value">3</div></div><div class="kpi"><div class="label">本报告意见</div><div class="value">7</div></div><div class="kpi"><div class="label">已处理</div><div class="value">5</div></div><div class="kpi"><div class="label">策略命中</div><div class="value">3<small>类</small></div></div></div>
        <section class="post-panel"><div class="filter-row"><input v-model="taskSearch" placeholder="搜索任务名称或审查对象" /><select v-model="taskStatus"><option>全部状态</option><option>已完成</option><option>待复核</option></select><button class="btn btn-outline">查询</button></div><table class="simple-table task-table"><thead><tr><th>任务名称</th><th>审查对象</th><th>审查规则集</th><th>意见数</th><th>状态</th><th>完成时间</th><th>操作</th></tr></thead><tbody><tr v-for="task in filteredTasks" :key="task.id" :class="{ important: task.id === 'review-v1' }" @click="openReview(task)"><td><b>{{ task.name }}</b><small v-if="task.id === 'review-v1'">D-14 演示任务</small></td><td>{{ task.target }}</td><td>{{ task.rules }}</td><td><span class="issue-count">{{ task.issues }}</span></td><td><span class="result-tag" :class="{ gold: task.status !== '已完成' }">{{ task.status }}</span></td><td>{{ task.time }}</td><td><button class="link-btn">查看结果</button></td></tr></tbody></table></section>
      </template>
      <template v-else>
        <div class="review-toolbar"><button class="back-button" @click="reviewMode = 'tasks'">‹ 返回任务列表</button><div><b>试验报告V1审查</b><span>术语规范 · 数据勾稽 · 判据引用</span></div><div class="review-progress"><span>处理进度 {{ processedCount }}/7</span><i><em :style="{ width: `${processedCount / 7 * 100}%` }"></em></i></div><button class="btn btn-primary" @click="finalizeArchive">一键定稿归集</button></div>
        <div class="review-layout">
          <section class="review-document post-panel">
            <div class="doc-toolbar"><span>某型装备性能鉴定试验报告 V1</span><div><button class="mini-btn" @click="toast('已定位上一条意见')">上一条</button><button class="mini-btn" @click="toast('已定位下一条意见')">下一条</button></div></div>
            <div class="doc-page">
              <small>{{ activeIssue.location }}</small><h2>{{ activeIssue.type === '判据引用' ? '6 符合性判定' : activeIssue.type === '数据勾稽' ? '8 结论与建议' : '1 试验任务概述' }}</h2>
              <p>根据试验任务安排，本次试验依据性能试验提纲组织实施，试验数据完整，过程记录可追溯。</p>
              <p class="highlight-line" :class="{ pulse: locating }">{{ activeIssue.snippet }}<span>审查意见 {{ activeIssue.id }}</span></p>
              <p>经逐项核对指标树、原始记录与数据汇总表，报告所列结果具备判定依据；相关修改将在定稿版本中保留处理记录。</p>
              <div class="located-tip">已定位到：{{ activeIssue.location }}</div>
            </div>
          </section>
          <aside class="issue-panel post-panel">
            <div class="issue-head"><div><b>审查意见</b><span>术语3 · 勾稽2 · 引用2</span></div><select v-model="issueFilter"><option>全部类型</option><option>术语规范</option><option>数据勾稽</option><option>判据引用</option></select></div>
            <div class="issue-list"><article v-for="issue in filteredIssues" :key="issue.id" :class="{ active: activeIssue.id === issue.id }" @click="locateIssue(issue)"><div class="issue-top"><span class="issue-type">{{ issue.type }}</span><span class="issue-status" :class="{ done: issue.status === '已采纳' }">{{ issue.status }}</span></div><h4>{{ issue.title }}</h4><p>位置：{{ issue.location }}</p><p>依据：{{ issue.basis }}</p><div class="issue-actions"><button @click.stop="locateIssue(issue)">定位</button><span>{{ issue.handler }} · {{ issue.time.slice(11) }}</span></div></article></div>
            <div class="issue-detail"><b>智能修改建议</b><p>{{ activeIssue.suggestion }}</p><div><button class="btn btn-outline" @click="ignoreIssue">忽略</button><button class="btn btn-primary" @click="acceptIssue">采纳建议</button></div></div>
          </aside>
        </div>
      </template>
    </template>

    <template v-else-if="stage === 'archive'">
      <div class="archive-banner"><div><b>文档归集</b><span>统一归档、分类标注、版本固化与知识沉淀衔接</span></div><div><span>今日入库 <b>3</b></span><span>归集文档 <b>8,643</b></span><button class="btn btn-primary" @click="toast('批量归集窗口已打开')">批量归集</button></div></div>
      <section class="post-panel"><div class="filter-row"><input v-model="archiveSearch" placeholder="搜索文档名称、编号或来源" /><select v-model="archiveType"><option>全部类型</option><option>性能鉴定试验报告</option><option>试验提纲</option><option>异常分析报告</option></select><select><option>全部密级</option><option>内部</option></select><button class="btn btn-outline">查询</button><button class="btn btn-outline" @click="archiveSearch = ''; archiveType = '全部类型'">重置</button></div></section>
      <section class="post-panel archive-table"><div class="panel-title"><span>归集文档列表</span><div><button class="mini-btn" @click="toast('已导出归集清单')">导出清单</button><button class="mini-btn gold" @click="toast('已生成归集校验报告')">归集校验</button></div></div><table class="simple-table"><thead><tr><th>文档编号</th><th>文档名称</th><th>类型</th><th>密级</th><th>版本</th><th>归集时间</th><th>状态</th><th>操作</th></tr></thead><tbody><tr v-for="row in filteredArchive" :key="row.id" :class="{ archived: row.id.startsWith('RPT') }"><td>{{ row.id }}</td><td><b>{{ row.name }}</b><small v-if="row.id.startsWith('RPT')">审查闭环成果 · 接入第四部分知识沉淀</small></td><td>{{ row.type }}</td><td>{{ row.secret }}</td><td>{{ row.version }}</td><td>{{ row.time }}</td><td><span class="result-tag">{{ row.status }}</span></td><td><button class="link-btn" @click="viewArchive(row)">查看</button><button class="link-btn" @click="toast(`${row.name} 已下载`)">下载</button></td></tr></tbody></table></section>
      <div class="archive-foot"><span>✓ 试验报告V2（定稿）已完成版本固化、元数据校验与归档入库</span><b>下一阶段：归档报告知识化转化 →</b></div>
    </template>
    <div v-if="assembling || archiving" class="work-mask">
      <div>
        <b>{{ assembling ? '正在装配《性能鉴定试验报告》初稿' : '正在定稿归集' }}</b>
        <p>{{ workStage }}</p>
        <i><em :style="{ width: workProgress + '%' }"></em></i>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUi } from '@/composables/ui'
import {
  archiveRows,
  postTrialMaterials,
  postTrialMetrics,
  postTrialOutline,
  postTrialState,
  reviewIssues,
  reviewTasks,
} from '@/data/postTrial'

const props = defineProps({ page: Object, title: String })
const router = useRouter()
const { toast, openDrawer } = useUi()
const stage = computed(() => props.page.stage)
const wizardSteps = ['汇集素材', '设计提纲', '生成初稿', '审校定稿']
const outlineRows = ref(postTrialOutline.map((item) => ({ ...item, children: [...item.children] })))
const selectedOutline = ref(outlineRows.value[5])
const composeMode = ref('wizard')
const reviewMode = ref(props.page.entry === 'result' ? 'result' : 'tasks')
const taskSearch = ref('')
const taskStatus = ref('全部状态')
const issueFilter = ref('全部类型')
const archiveSearch = ref('')
const archiveType = ref('全部类型')
const assembling = ref(false)
const archiving = ref(false)
const locating = ref(false)
const workProgress = ref(0)
const workStage = ref('')

const lineage = [
  { icon: '需', name: '需求配置', time: '14:56', desc: '报告类型与生成范围' },
  { icon: '模', name: '模板引用', time: '15:02', desc: '标准模板 V3.2' },
  { icon: '纲', name: '提纲生成', time: '15:08', desc: '8章24项要点' },
  { icon: '知', name: '知识提取', time: '15:14', desc: '三类素材完成汇集' },
  { icon: '数', name: '数据装配', time: '15:25', desc: '28项判定与图表' },
  { icon: '文', name: '内容生成', time: '15:32', desc: '初稿 V1 已生成' },
  { icon: '审', name: '智能审查', time: '15:46', desc: '发现7条意见' },
  { icon: '定', name: '版本定稿', time: '16:38', desc: '定稿 V2 已归集' },
]

const traceRows = [
  { clause: '立靶高低偏差 ≤ 0.30 mil', type: '指标树判据', source: '指标树 V1.0', location: '6.5.19' },
  { clause: '首测0.42 / 复测0.18 mil', type: '试验数据', source: '试验数据汇总表', location: '记录19及复测记录' },
  { clause: '温补失效及校准处置', type: '异常解读', source: '第19发异常解读报告', location: '根因结论' },
  { clause: '越壕宽 ≥ 1.8 m', type: '指标树判据', source: '指标树 V1.0', location: '6.3.9' },
]

const filteredTasks = computed(() => reviewTasks.filter((task) => {
  const matchSearch = !taskSearch.value || `${task.name}${task.target}`.includes(taskSearch.value)
  const matchStatus = taskStatus.value === '全部状态' || task.status === taskStatus.value
  return matchSearch && matchStatus
}))
const filteredIssues = computed(() => reviewIssues.filter((issue) => issueFilter.value === '全部类型' || issue.type === issueFilter.value))
const activeIssue = computed(() => reviewIssues.find((issue) => issue.id === postTrialState.activeIssueId) || reviewIssues[0])
const processedCount = computed(() => reviewIssues.filter((issue) => issue.status === '已采纳').length)
const filteredArchive = computed(() => archiveRows.filter((row) => {
  const matchSearch = !archiveSearch.value || `${row.name}${row.id}${row.source}`.includes(archiveSearch.value)
  const matchType = archiveType.value === '全部类型' || row.type === archiveType.value
  return matchSearch && matchType
}))

function goTo(sid, mid) {
  router.push({ name: 'app', params: { pid: 'doc', sid, mid } })
}
function addOutline() {
  outlineRows.value.push({ no: String(outlineRows.value.length + 1), name: '新增章节', source: '人工维护', children: ['新增要点'] })
  selectedOutline.value = outlineRows.value.at(-1)
  toast('已新增章节，可在右侧编辑')
}
function addPoint() {
  selectedOutline.value.children.push('新增要点')
}
function removePoint(index) {
  if (selectedOutline.value.children.length === 1) return toast('每章至少保留一个要点')
  selectedOutline.value.children.splice(index, 1)
}
function saveOutline() {
  toast('提纲已保存，并同步到知识驱动文档生成')
}
function runWork(flag, stages, done) {
  if (assembling.value || archiving.value) return
  flag.value = true
  workProgress.value = 6
  workStage.value = stages[0]
  let step = 0
  const timer = setInterval(() => {
    step += 1
    workProgress.value = Math.min(100, step * 25)
    workStage.value = stages[Math.min(stages.length - 1, step)]
    if (step < stages.length) return
    clearInterval(timer)
    flag.value = false
    done()
  }, 420)
}
function generateDraft() {
  runWork(assembling, [
    '汇集指标树判据、数据汇总表、第19发异常解读',
    '按 8 章提纲装配章节与图表',
    '写入 28 项符合性判定',
    '挂接溯源出处',
  ], () => {
    postTrialState.generated = true
    postTrialState.currentVersion = 'V1（初稿）'
    postTrialState.selectedChapter = '符合性判定'
    composeMode.value = 'preview'
    toast('初稿已装配，28 项判定已写入')
  })
}
function showSource(metric) {
  openDrawer(`${metric.name} · 原文溯源`, [
    { label: '文书位置', value: '第六章 符合性判定' },
    { label: '实测值', value: metric.value },
    { label: '判据', value: metric.criterion },
    { label: '结论', value: metric.conclusion },
    { label: '出处', value: metric.source },
    { label: '原始记录', value: metric.event ? '第19发原始记录及复测记录' : '30发试验数据汇总表' },
  ])
}
function submitReview() {
  toast('进入智能审查任务')
  goTo('review', 'run')
}
function openReview() {
  reviewMode.value = 'result'
  locateIssue(reviewIssues.find((issue) => issue.id === 7) || reviewIssues[0])
}
function locateIssue(issue) {
  postTrialState.activeIssueId = issue.id
  locating.value = false
  requestAnimationFrame(() => { locating.value = true })
  toast(`已定位：${issue.location}`)
}
function acceptIssue() {
  if (activeIssue.value.status === '已采纳') return toast('该意见已采纳并留痕')
  activeIssue.value.status = '已采纳'
  activeIssue.value.handler = '当前用户'
  activeIssue.value.time = '2026-10-22 16:31'
  toast('已采纳修改建议，处理记录已留痕')
}
function ignoreIssue() {
  toast('已记录忽略原因，意见保留在审查轨迹中')
}
function finalizeArchive() {
  runWork(archiving, [
    '固化审查留痕与版本 V2',
    '写入文档归集库',
    '更新状态为已入库',
    '归集完成',
  ], () => {
    reviewIssues.forEach((issue) => { issue.status = '已采纳' })
    postTrialState.archived = true
    postTrialState.currentVersion = 'V2（定稿）'
    toast('试验报告 V2 已入库')
    goTo('collect', 'document-type-archive')
  })
}
function viewArchive(row) {
  openDrawer(row.name, [
    { label: '文档编号', value: row.id },
    { label: '文档类型', value: row.type },
    { label: '版本', value: row.version },
    { label: '归集状态', value: row.status },
    { label: '责任部门', value: row.owner },
    { label: '来源链路', value: row.source },
    { label: '归集时间', value: row.time },
  ])
}
function scatterStyle(index) {
  const points = [[47, 42], [52, 48], [45, 53], [57, 45], [49, 58], [42, 47], [55, 55], [51, 39]]
  return { left: `${points[index - 1][0]}%`, top: `${points[index - 1][1]}%` }
}
</script>

<style scoped>
.post-trial { min-width: 1040px; color: #2f465b; position: relative; }
.work-mask { position: fixed; inset: 0; z-index: 30; background: rgba(244, 248, 252, .82); display: grid; place-items: center; }
.work-mask > div { width: min(460px, 86%); background: #fff; border: 1px solid #d5e4f0; border-radius: 10px; padding: 22px 24px; box-shadow: 0 12px 32px rgba(13, 62, 102, .12); }
.work-mask b { color: #07518f; font-size: 16px; }
.work-mask p { margin: 8px 0 14px; color: #5d7388; font-size: 13px; min-height: 20px; }
.work-mask i { display: block; height: 8px; border-radius: 6px; background: #e3edf5; overflow: hidden; }
.work-mask em { display: block; height: 100%; width: 0; background: linear-gradient(90deg, #0b6dbd, #d0ab68); transition: width .35s ease; }
.highlight-line.pulse { animation: locatePulse .7s ease; }
@keyframes locatePulse { 0% { box-shadow: 0 0 0 0 rgba(208, 171, 104, .7); } 100% { box-shadow: 0 0 0 8px rgba(208, 171, 104, 0); } }
.post-head, .document-toolbar, .review-overview, .review-toolbar, .archive-banner { background: #fff; border: 1px solid #e0eaf3; border-radius: 9px; padding: 15px 20px; display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; box-shadow: 0 5px 16px rgba(18,61,96,.04); }
.post-head h2 { color: #074b88; font-size: 23px; margin-top: 2px; }
.post-head p { color: #75889b; font-size: 13.5px; margin-top: 5px; }
.module-code { display: inline-flex; color: #a36e0c; background: #fff5dc; border: 1px solid #efd291; border-radius: 4px; font-size: 12px; font-weight: 700; padding: 2px 7px; }
.head-actions { display: flex; gap: 10px; align-items: center; }
.baseline { color: #7a8c9e; font-size: 12px; }
.post-panel { background: #fff; border: 1px solid #dfe9f2; border-radius: 9px; padding: 14px; min-width: 0; }
.panel-title { display: flex; align-items: center; justify-content: space-between; min-height: 30px; padding-bottom: 10px; color: #074b88; font-weight: 700; font-size: 16px; }
.panel-title > span:first-child::before { content: ''; display: inline-block; width: 4px; height: 17px; margin-right: 8px; border-radius: 3px; background: #0868b7; vertical-align: -3px; }
.panel-title > div { display: flex; gap: 7px; }
.mini-btn, .link-btn, .source-link { border: 0; background: transparent; color: #0868b7; cursor: pointer; font-size: 12.5px; }
.mini-btn { border: 1px solid #b7d1e8; border-radius: 4px; padding: 5px 10px; background: #fff; }
.mini-btn.gold { border-color: #d7ac58; color: #a36e0c; }
.good-tag, .result-tag { display: inline-flex; align-items: center; border-radius: 10px; padding: 3px 9px; background: #e1f6e8; color: #16843a; font-size: 12px; font-style: normal; white-space: nowrap; }
.result-tag.gold, .status-badge { background: #fff2d6; color: #b67800; }
.step-strip { background: #fff; border: 1px solid #dfe9f2; border-radius: 9px; display: grid; grid-template-columns: repeat(4, 1fr); padding: 14px 20px; margin-bottom: 14px; }
.step-strip.compact { padding: 10px 20px; }
.step { position: relative; display: grid; grid-template-columns: 34px 1fr; grid-template-rows: auto auto; align-items: center; gap: 0 9px; color: #91a1b1; }
.step:not(:last-child)::after { content: ''; position: absolute; left: calc(50% + 28px); right: -25%; top: 17px; height: 2px; background: #d7e2ec; }
.step b { grid-row: 1 / 3; width: 34px; height: 34px; border-radius: 50%; display: grid; place-items: center; background: #e7edf3; color: #7f91a3; z-index: 1; }
.step span { font-weight: 700; font-size: 14px; }
.step small { font-size: 11px; margin-top: 3px; }
.step.done b, .step.active b { background: #0a68b6; color: #fff; }
.step.done, .step.active { color: #07518f; }
.step.done:not(:last-child)::after { background: #4d9bd3; }
.post-kpis { margin-bottom: 14px; }
.material-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 14px; }
.material-card { position: relative; min-height: 112px; padding: 18px; display: flex; gap: 14px; align-items: center; background: #fff; border: 1px solid #dbe7f1; border-radius: 9px; box-shadow: 0 5px 15px rgba(18,61,96,.04); }
.material-card.gold { border-color: #ead29e; background: linear-gradient(135deg,#fff,#fffaf0); }
.material-icon { width: 46px; height: 46px; border-radius: 10px; display: grid; place-items: center; background: #e6f3fd; color: #0868b7; font-weight: 800; font-size: 17px; }
.material-card.gold .material-icon { background: #fff0ce; color: #b47a0e; }
.material-card h3 { color: #07518f; font-size: 16px; }
.material-card p { margin-top: 7px; font-size: 13px; }
.material-card small { display: block; color: #8a99a8; margin-top: 5px; }
.status-badge { position: absolute; right: 12px; top: 12px; }
.material-card.blue .status-badge { background: #e1f1fd; color: #0872c5; }
.compose-grid { display: grid; grid-template-columns: 1.35fr .65fr; gap: 14px; }
.chapter-preview { display: grid; grid-template-columns: 190px 1fr 150px; gap: 12px; align-items: center; padding: 10px 9px; border-top: 1px solid #edf2f6; font-size: 13px; }
.chapter-preview b { color: #264b6b; }
.chapter-preview span { color: #718396; }
.chapter-preview em { color: #aa740d; font-style: normal; text-align: right; }
.generate-panel { display: flex; flex-direction: column; }
.config-row { display: flex; justify-content: space-between; gap: 20px; padding: 12px 4px; border-bottom: 1px solid #edf2f6; font-size: 13px; }
.config-row span { color: #7c8fa2; }.config-row b { color: #2f4e68; text-align: right; }
.check-list { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: 16px 0; color: #21834a; font-size: 13px; }
.generate-btn { margin-top: auto; min-height: 74px; border: 0; border-radius: 7px; color: #fff; background: linear-gradient(135deg,#0b6dbd,#06477f); box-shadow: 0 8px 18px rgba(5,72,128,.22); }
.generate-btn span, .generate-btn small { display: block; }.generate-btn span { font-size: 18px; font-weight: 700; }.generate-btn small { margin-top: 5px; color: #cfe7fa; }
.outline-layout { display: grid; grid-template-columns: 1.1fr .9fr; gap: 14px; }
.outline-row { display: grid; grid-template-columns: 22px 30px 1fr auto 20px; align-items: center; gap: 7px; padding: 11px 8px; border-top: 1px solid #edf2f6; cursor: pointer; }
.outline-row.selected { background: #edf7ff; box-shadow: inset 3px 0 #0b6dbd; }.drag { color: #aab8c4; }.chapter-no { color: #7d91a4; }.source-pill { color: #a36e0c; background: #fff5dc; padding: 2px 7px; border-radius: 8px; font-size: 11px; }.chev { color: #92a3b2; font-size: 20px; }
.outline-editor > label { display: block; color: #718396; font-size: 12px; margin: 12px 0 5px; }.outline-editor > input, .point-list input { width: 100%; height: 36px; border: 1px solid #d5e1eb; border-radius: 5px; padding: 0 10px; color: #2f4e68; }.source-box { border: 1px solid #d5e1eb; padding: 10px; border-radius: 5px; }.source-box span { float: right; color: #208744; }.point-list > div { display: grid; grid-template-columns: 22px 1fr 24px; gap: 5px; margin-bottom: 7px; align-items: center; }.point-list button { border: 0; background: transparent; color: #ca4c37; font-size: 18px; }.recommend-box { margin-top: 14px; padding: 12px; background: #fff9ec; border: 1px solid #efd8a7; border-radius: 6px; }.recommend-box b { color: #a46e08; }.recommend-box p { color: #6f6044; font-size: 12.5px; margin-top: 6px; line-height: 1.6; }.editor-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 14px; }
.document-toolbar > div { display: flex; align-items: center; gap: 10px; }.document-toolbar b { color: #07518f; font-size: 17px; }.document-toolbar span { color: #718396; font-size: 12px; }.report-layout { display: grid; grid-template-columns: 220px 1fr; gap: 14px; align-items: start; }.report-nav { padding: 10px; position: sticky; top: 0; }.report-nav button { width: 100%; height: 42px; display: grid; grid-template-columns: 25px 1fr 20px; align-items: center; text-align: left; border: 0; background: transparent; color: #486078; border-radius: 5px; padding: 0 8px; }.report-nav button.active { background: #e9f5fe; color: #0868b7; font-weight: 700; box-shadow: inset 3px 0 #d0ab68; }.report-nav button em { color: #258b47; font-style: normal; }.report-paper { padding: 18px 20px; }.paper-title { display: flex; justify-content: space-between; border-bottom: 2px solid #d9e6f0; padding-bottom: 12px; }.paper-title small { color: #8a99a8; }.paper-title h2 { color: #124d7f; margin-top: 4px; }.trace-badge { align-self: center; color: #a8710c; border: 1px solid #e8ca8b; background: #fff8e8; border-radius: 14px; padding: 5px 10px; font-size: 12px; }.paper-text { margin: 14px 0; line-height: 1.8; font-size: 13.5px; }.metric-table-wrap { max-height: 510px; overflow: auto; border: 1px solid #e3ebf2; }.metric-table, .simple-table { width: 100%; border-collapse: collapse; font-size: 12.5px; }.metric-table th, .simple-table th { position: sticky; top: 0; z-index: 1; background: #eaf3fa; color: #31516c; text-align: left; padding: 10px 9px; }.metric-table td, .simple-table td { border-top: 1px solid #e8eef4; padding: 9px; }.metric-table tr.focus { background: #fff8e8; }.metric-table td small, .simple-table td small { display: block; color: #b57b0a; margin-top: 3px; }.source-link { white-space: nowrap; }.version-bar { display: flex; flex-wrap: wrap; gap: 24px; margin-top: 12px; padding: 10px 12px; background: #f3f7fa; color: #60778b; font-size: 12px; }.event-summary { display: flex; align-items: center; justify-content: space-between; margin: 18px 0 8px; padding: 10px 12px; background: #fff7e6; border-left: 4px solid #d0ab68; }.event-summary b { color: #8d5d08; }.event-summary span { font-size: 12px; color: #b0780b; }.scatter { height: 220px; position: relative; overflow: hidden; background: linear-gradient(135deg,#f8fbfd,#eef6fb); border: 1px solid #dbe7f0; border-radius: 7px; }.target-ring { position: absolute; border: 1px solid #8fb9d6; border-radius: 50%; left: 50%; top: 50%; transform: translate(-50%,-50%); }.r1{width:180px;height:180px}.r2{width:120px;height:120px}.r3{width:60px;height:60px}.scatter i { position:absolute;width:8px;height:8px;border-radius:50%;background:#0b72c4;transform:translate(-50%,-50%)}.scatter i.outlier{left:76%;top:24%;background:#d0ab68;width:13px;height:13px;box-shadow:0 0 0 5px rgba(208,171,104,.2)}.scatter span,.scatter em{position:absolute;bottom:10px;font-size:12px;font-style:normal}.scatter span{right:18px;color:#aa7108}.scatter em{right:125px;color:#0b72c4}.cause-table{margin-top:10px;border:1px solid #e4ebf1}.cause-table>div{display:grid;grid-template-columns:1fr 1.6fr .7fr}.cause-table b,.cause-table span,.cause-table strong{padding:9px;border-right:1px solid #e4ebf1}.cause-table>div:first-child{background:#eaf3fa}.source-note{text-align:right;margin-top:8px;color:#a7710c;font-size:12px}
.lineage-panel { margin-bottom: 14px; }.tab-line button { border: 0; background: transparent; color: #72869a; padding: 4px 10px; }.tab-line button.active { color: #0868b7; border-bottom: 2px solid #0868b7; }.lineage-flow { display: grid; grid-template-columns: repeat(8, 1fr); gap: 14px; padding: 18px 4px 10px; }.lineage-node { position: relative; display: flex; min-height: 132px; align-items: center; flex-direction: column; text-align: center; padding: 13px 8px; border: 1px solid #dce8f2; border-radius: 7px; background: #fbfdff; }.lineage-node:not(:last-child)::after { content: '→'; position: absolute; right: -17px; top: 45px; color: #3386c5; font-weight: 700; }.lineage-node > b { width: 36px; height: 36px; display: grid; place-items: center; border-radius: 8px; background: #e9f5fe; color: #0868b7; }.lineage-node strong { margin-top: 8px; color: #245371; }.lineage-node span { color: #9a741e; font-size: 11px; margin: 3px 0; }.lineage-node small { color: #7f90a0; line-height: 1.4; }.lineage-node.active { border-color: #0b72c4; box-shadow: 0 0 0 2px rgba(11,114,196,.12); }.trace-grid { display: grid; grid-template-columns: 1fr 300px; gap: 14px; }.version-item { border: 1px solid #e0e8ef; border-radius: 7px; padding: 14px; margin-bottom: 10px; }.version-item b,.version-item span,.version-item small { display:block }.version-item b { color:#07518f }.version-item span { margin:6px 0;color:#415b71 }.version-item small{color:#8797a6}.version-item.current{border-color:#dbbd7b;background:#fffaf0}
.review-overview > div { display: flex; flex-direction: column; gap: 4px; }.review-overview b, .archive-banner > div:first-child b { color: #07518f; font-size: 18px; }.review-overview span, .archive-banner > div:first-child span { color: #76899a; font-size: 13px; }.filter-row { display: flex; gap: 9px; }.filter-row input { flex: 1; }.filter-row input, .filter-row select, .issue-head select { height: 34px; border: 1px solid #d3dfe9; border-radius: 5px; padding: 0 10px; color: #496076; background: #fff; }.task-table tr { cursor: pointer; }.task-table tr:hover { background:#f4f9fd }.task-table tr.important { background:#fffaf0 }.issue-count { display:inline-grid;place-items:center;min-width:27px;height:27px;border-radius:14px;background:#fff0cf;color:#ae7206;font-weight:700 }.review-toolbar { gap: 14px; }.back-button { border:0;background:transparent;color:#0868b7 }.review-toolbar > div:nth-child(2){display:flex;flex-direction:column;margin-right:auto}.review-toolbar > div:nth-child(2) b{color:#07518f}.review-toolbar > div:nth-child(2) span{font-size:12px;color:#7e90a1}.review-progress{width:190px}.review-progress span{font-size:12px}.review-progress i{display:block;height:7px;border-radius:5px;background:#e2eaf1;margin-top:5px;overflow:hidden}.review-progress em{display:block;height:100%;background:linear-gradient(90deg,#d0ab68,#0b72c4)}.review-layout{display:grid;grid-template-columns:1.2fr .8fr;gap:14px;align-items:start}.review-document{padding:0;overflow:hidden}.doc-toolbar{height:47px;padding:0 14px;background:#f6f9fb;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #e1eaf2;font-size:13px}.doc-page{width:82%;min-height:570px;margin:20px auto;padding:44px 55px;background:#fff;box-shadow:0 4px 22px rgba(18,61,96,.12);border:1px solid #edf1f4}.doc-page>small{color:#9a7a37}.doc-page h2{color:#253d52;margin:8px 0 30px;border-bottom:1px solid #cbd7e1;padding-bottom:10px}.doc-page p{line-height:2;text-indent:2em;margin:18px 0}.highlight-line{position:relative;background:#fff4cf;border-bottom:2px solid #d0ab68;padding:8px}.highlight-line span{position:absolute;right:0;top:-26px;text-indent:0;color:#a66e03;border:1px solid #e1bd70;background:#fff;padding:2px 7px;border-radius:4px;font-size:11px}.located-tip{margin-top:28px;padding:9px 12px;background:#edf7ff;color:#0870bc;border-left:3px solid #0b72c4;font-size:12px}.issue-panel{padding:0;overflow:hidden}.issue-head{padding:12px 14px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #e4ecf3}.issue-head>div{display:flex;flex-direction:column}.issue-head b{color:#07518f}.issue-head span{font-size:11px;color:#8a99a8;margin-top:3px}.issue-list{max-height:440px;overflow:auto;padding:10px}.issue-list article{padding:11px;border:1px solid #e1e9f0;border-radius:6px;margin-bottom:8px;cursor:pointer}.issue-list article.active{border-color:#d0ab68;background:#fffaf0;box-shadow:0 0 0 2px rgba(208,171,104,.12)}.issue-top{display:flex;justify-content:space-between}.issue-type{color:#986704;background:#fff0cf;padding:2px 7px;border-radius:9px;font-size:11px}.issue-status{color:#b0780a;font-size:11px}.issue-status.done{color:#16843a}.issue-list h4{font-size:13px;color:#29495f;margin:8px 0}.issue-list p{font-size:11.5px;color:#7a8b9a;margin-top:4px}.issue-actions{display:flex;justify-content:space-between;margin-top:7px}.issue-actions button{border:0;background:transparent;color:#0870bc}.issue-actions span{font-size:11px;color:#9aa8b5}.issue-detail{border-top:1px solid #e1e9f0;background:#f8fbfd;padding:13px}.issue-detail b{color:#07518f}.issue-detail p{font-size:12px;line-height:1.6;margin:7px 0 10px}.issue-detail>div{display:flex;justify-content:flex-end;gap:8px}
.archive-banner { background: linear-gradient(100deg,#062e52,#0b5f9d); color:#fff; border:0; }.archive-banner > div:first-child b { color:#f2d99d }.archive-banner > div:first-child span { color:#d5e6f3 }.archive-banner > div { display:flex;align-items:center;gap:18px }.archive-banner > div:first-child { flex-direction:column;align-items:flex-start;gap:5px }.archive-banner > div:last-child > span { color:#d8e7f2;font-size:12px }.archive-banner > div:last-child > span b { display:block;color:#fff;font-size:21px;margin-top:4px }.archive-table{margin-top:14px}.archive-table tr.archived{background:#fffaf0;box-shadow:inset 3px 0 #d0ab68}.archive-table td:last-child{white-space:nowrap}.archive-table td:last-child button{margin-right:8px}.archive-foot{display:flex;justify-content:space-between;align-items:center;margin-top:12px;padding:11px 15px;background:#eef8f1;border:1px solid #cfe8d7;border-radius:7px;color:#267442;font-size:12.5px}.archive-foot b{color:#9a6c11}
@media (max-width: 1500px) { .lineage-flow { grid-template-columns: repeat(4,1fr) }.lineage-node:not(:last-child)::after{display:none}.chapter-preview{grid-template-columns:160px 1fr 120px}.post-trial{min-width:980px} }
</style>
