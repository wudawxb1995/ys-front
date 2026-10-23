<template>
  <div class="m02-page">
    <template v-if="detail">
      <div class="back-bar">
        <span class="back-link" @click="closeDetail">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          返回任务列表
        </span>
        <span class="sep">|</span>
        <span class="crumb">{{ detail.name }}</span>
      </div>

      <div class="doc-bar">
        <div class="doc-ico">DOCX</div>
        <div class="doc-meta">
          <div class="doc-title">{{ detail.doc }}</div>
          <div class="doc-sub">来源文档：{{ detail.name }} · 抽取完成：{{ detail.finishedAt }}</div>
        </div>
        <el-button type="primary" @click="toast('已提交审核，进入人工核验队列')">提交审核</el-button>
      </div>

      <div class="domain-row">
        <span class="domain-label">性能域：</span>
        <button
          v-for="d in domains"
          :key="d"
          type="button"
          class="m02-domain-tag"
          :class="{ on: activeDomains.has(d) }"
          @click="toggleDomain(d)"
        >{{ d }}</button>
        <el-button text @click="activeDomains = new Set(domains)">全选</el-button>
        <el-button text @click="activeDomains = new Set()">清空</el-button>
      </div>

      <div class="stat-bar">
        <div class="stat-item"><span class="n">{{ visibleRows.length }}</span><span class="u">项指标</span></div>
        <i class="stat-div" />
        <div class="stat-item"><span class="n">{{ activeDomains.size }}</span><span class="u">个性能域</span></div>
        <i class="stat-div" />
        <div class="stat-item"><span class="n gold">{{ pendingCount }}</span><span class="u">项待人工审核</span></div>
        <div class="stat-legend">
          置信度：
          <span class="lg b1" /><span>≥0.90</span>
          <span class="lg b2" /><span>0.80–0.90</span>
          <span class="lg b3" /><span>&lt;0.80</span>
        </div>
      </div>

      <div class="result-layout" :class="{ split: !!selected }">
        <div class="crud-body table-pane">
          <div class="toolbar">
            <span class="hint">共 <b>{{ visibleRows.length }}</b> 项抽取结果 · 点击行可回溯原文</span>
          </div>
          <div class="table-inner">
            <table>
              <thead>
                <tr>
                  <th class="col-idx">序号</th>
                  <th>指标名称</th>
                  <th>指标值</th>
                  <th>单位</th>
                  <th>判据</th>
                  <th>所属性能域</th>
                  <th>置信度</th>
                  <th>状态</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(row, idx) in visibleRows"
                  :key="row.id"
                  :class="{ 'm02-gold-row': row.conf < 0.80, selected: selected?.id === row.id }"
                  @click="openSource(row)"
                >
                  <td class="col-idx muted">{{ idx + 1 }}</td>
                  <td class="name">{{ row.name }}</td>
                  <td class="mono">{{ row.value }}</td>
                  <td class="nowrap muted2">{{ row.unit }}</td>
                  <td class="ellipsis" :title="row.criteria">{{ row.criteria }}</td>
                  <td class="center"><span class="m02-domain-pill">{{ row.domain }}</span></td>
                  <td>
                    <div class="conf">
                      <div class="conf-bar"><div :style="{ width: (row.conf * 100).toFixed(0) + '%', background: confColor(row.conf) }" /></div>
                      <span :style="{ color: confText(row.conf) }">{{ (row.conf * 100).toFixed(0) }}%</span>
                    </div>
                  </td>
                  <td class="center">
                    <span class="badge" :class="row.status === '已确认' ? 'on' : row.status === '待审核' ? 'warn' : 'hold'"><i></i>{{ row.status }}</span>
                  </td>
                </tr>
                <tr v-if="!visibleRows.length" class="empty-row">
                  <td colspan="8" class="empty">当前性能域筛选下无数据</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <aside v-if="selected" class="source-panel">
          <div class="source-head">
            <div>
              <div class="source-title">原文溯源</div>
              <div class="source-sub">{{ selected.srcDoc }} · 第 {{ selected.srcPage }} 页</div>
            </div>
            <button type="button" class="close-btn" @click="selected = null">×</button>
          </div>
          <div class="source-ind">
            <div class="ind-name">{{ selected.name }}</div>
            <div class="ind-val">{{ selected.value }}{{ selected.unit ? ' ' + selected.unit : '' }}</div>
          </div>
          <div class="source-body">
            <div class="page-tag">第 {{ selected.srcPage }} 页</div>
            <p class="src-text" v-html="highlightedHtml" />
          </div>
          <div class="source-foot">点击表格其他行可切换溯源位置 · 高亮句为抽取依据</div>
        </aside>
      </div>
    </template>

    <template v-else>
      <div class="crud-body task-card">
        <div class="toolbar">
          <el-button type="primary" @click="toast('已打开新建抽取任务面板')">新建抽取任务</el-button>
          <span class="spacer" />
          <el-input v-model="filterDoc" clearable placeholder="按来源文档筛选…" style="width: 240px" />
          <span class="hint">共 {{ filteredTasks.length }} 个任务</span>
        </div>
        <div class="table-inner">
          <table>
            <thead>
              <tr>
                <th>任务名称</th>
                <th>来源文档</th>
                <th class="center">抽取指标数</th>
                <th class="center">状态</th>
                <th>完成时间</th>
                <th class="center op">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="task in filteredTasks"
                :key="task.name"
                :class="{ clickable: task.status === '已完成' }"
                @click="task.status === '已完成' && openDetail(task)"
              >
                <td class="name">{{ task.name }}</td>
                <td class="doc">{{ task.doc }}</td>
                <td class="center count">{{ task.count || '—' }}</td>
                <td class="center">
                  <span class="badge" :class="task.status === '已完成' ? 'on' : task.status === '进行中' ? 'warn' : 'hold'"><i></i>{{ task.status }}</span>
                </td>
                <td class="time">{{ task.finishedAt || '—' }}</td>
                <td class="center" @click.stop>
                  <button v-if="task.status === '已完成'" type="button" class="btn-link" @click="openDetail(task)">查看结果</button>
                  <span v-else class="dash">—</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useUi } from '@/composables/ui'
import { useRows } from '@/composables/tables'
import { useDemoStore } from '@/composables/demo-store'
import { m02Domains, m02CountMap, m02IndRows } from '@/data/m02-indicators'

defineProps({ page: Object, title: String })
const { toast } = useUi()
const demoStore = useDemoStore()

const resources = useRows('resources')
const filterDoc = ref('')
const detail = ref(null)
const selected = ref(null)
const domains = m02Domains
const activeDomains = ref(new Set(domains))

const tasks = computed(() =>
  resources.map((res, idx) => {
    const taskStatus = res.status === '已解析' ? '已完成' : res.status === '解析中' ? '进行中' : '排队中'
    const count = taskStatus === '已完成' ? (m02CountMap[res.name] || Math.floor(idx * 3 + 5)) : 0
    return {
      name: res.name,
      doc: res.name,
      count,
      status: taskStatus,
      finishedAt: taskStatus === '已完成' ? res.time : null,
    }
  }),
)
const filteredTasks = computed(() =>
  tasks.value.filter((t) => !filterDoc.value || t.doc.includes(filterDoc.value)),
)
const visibleRows = computed(() => m02IndRows.filter((r) => activeDomains.value.has(r.domain)))
const pendingCount = computed(() => visibleRows.value.filter((r) => r.status === '待审核').length)

const highlightedHtml = computed(() => {
  if (!selected.value?.srcText) return ''
  const phrase = selected.value.highlight || ''
  const escaped = selected.value.srcText
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/\n/g, '<br/>')
  if (!phrase) return escaped
  const safe = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return escaped.replace(new RegExp(safe, 'g'), `<mark class="hl">${phrase}</mark>`)
})

function confColor(c) {
  return c >= 0.90 ? '#1668a8' : c >= 0.80 ? '#a8c8e8' : '#d0ab68'
}
function confText(c) {
  return c >= 0.90 ? '#1668a8' : c >= 0.80 ? '#4a7fa8' : '#c8902a'
}
function toggleDomain(d) {
  const s = new Set(activeDomains.value)
  s.has(d) ? s.delete(d) : s.add(d)
  activeDomains.value = s
}
function openDetail(task) {
  detail.value = task
  selected.value = null
  activeDomains.value = new Set(domains)
  demoStore.lastM02Task = task.name
}
function closeDetail() {
  detail.value = null
  selected.value = null
}
function openSource(row) {
  selected.value = row
  demoStore.lastM02IndicatorId = row.id
}
</script>

<style scoped>
.m02-page { min-width: 0; max-width: 100%; }
.task-card { background: #fff; }
.task-card :deep(.toolbar) { padding: 16px 16px 0; }
.task-card :deep(.table-inner) { padding-top: 16px; }
.back-bar { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; font-size: 13.5px; color: #7c8fa2; cursor: default; }
.back-bar:hover { text-decoration: none; color: #7c8fa2; }
.back-link { display: inline-flex; align-items: center; gap: 4px; font-size: 13px; color: #1668a8; cursor: pointer; text-decoration: none; }
.back-link:hover { text-decoration: none; color: #0d4e83; }
.back-link svg { width: 13px; height: 13px; }
.sep { color: #d0dce8; }
.crumb { color: #3f5062; font-weight: 500; }
.doc-bar {
  background: #fff; border: 1px solid #e4ecf4; border-radius: 8px;
  padding: 14px 18px; margin-bottom: 10px; display: flex; align-items: center; gap: 16px;
}
.doc-ico {
  width: 42px; height: 42px; border-radius: 8px; flex: 0 0 42px;
  background: linear-gradient(135deg, #2b6cb0, #1668a8);
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 700; color: #fff;
}
.doc-meta { flex: 1; min-width: 0; }
.doc-title { font-size: 15px; font-weight: 600; color: #1a3a5a; }
.doc-sub { font-size: 13px; color: #8a99a8; margin-top: 3px; }
.domain-row { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; flex-wrap: wrap; }
.domain-label { font-size: 13px; color: #6d8092; }
.stat-bar {
  background: linear-gradient(100deg, #062848, #0b3e6e); border-radius: 8px;
  padding: 12px 20px; margin-bottom: 12px; display: flex; align-items: center; gap: 32px;
}
.stat-item { display: flex; align-items: baseline; gap: 5px; }
.stat-item .n { font-size: 26px; font-weight: 700; color: #fff; }
.stat-item .n.gold { color: #e3bd6a; }
.stat-item .u { font-size: 13px; color: #aac4de; }
.stat-div { width: 1px; height: 28px; background: rgba(255, 255, 255, .15); }
.stat-legend { margin-left: auto; font-size: 13px; color: #7ca5c8; display: flex; align-items: center; gap: 6px; }
.lg { display: inline-block; width: 28px; height: 7px; border-radius: 3px; }
.lg.b1 { background: #1668a8; }
.lg.b2 { background: #a8c8e8; }
.lg.b3 { background: #d0ab68; }
.result-layout { display: block; }
.result-layout.split { display: grid; grid-template-columns: minmax(0, 1fr) 340px; gap: 14px; align-items: start; }
.table-pane { padding-bottom: 16px; min-width: 0; }
.table-pane :deep(tr) { cursor: pointer; }
.table-pane :deep(tr.selected) { background: #eaf3fd; }
.table-pane :deep(tr.m02-gold-row) { background: #fff8e8; }
.table-pane :deep(tr.m02-gold-row.selected) { background: #fff0cc; }
.hint b { color: #0d4e83; }
.center { text-align: center; }
.op { width: 120px; }
.name { font-weight: 600; color: #1f3d5a; }
.doc { color: #5a6978; }
.count { font-weight: 600; color: #0d4e83; }
.time { color: #8a99a8; font-size: 13px; }
.dash { color: #b0bfc8; font-size: 13px; }
.clickable { cursor: pointer; }
.muted { color: #8a99a8; }
.muted2 { color: #6d8092; }
.nowrap { white-space: nowrap; }
.mono { font-family: ui-monospace, monospace; color: #0d4e83; font-weight: 600; }
.ellipsis { font-size: 13px; color: #5c7084; max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.conf { display: flex; align-items: center; gap: 6px; justify-content: center; }
.conf-bar { width: 64px; height: 7px; background: #e6eef5; border-radius: 4px; overflow: hidden; flex: 0 0 64px; }
.conf-bar > div { height: 100%; border-radius: 4px; }
.conf span { font-size: 12.5px; font-weight: 600; min-width: 34px; text-align: right; }
.source-panel {
  background: #fff; border: 1px solid #e4ecf4; border-radius: 8px;
  padding: 16px 18px; box-shadow: 0 5px 16px rgba(18, 61, 96, .04);
  position: sticky; top: 0;
}
.source-head { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 12px; }
.source-title { font-size: 15px; font-weight: 700; color: #1f3d5a; }
.source-sub { font-size: 12.5px; color: #8a99a8; margin-top: 4px; }
.close-btn {
  width: 28px; height: 28px; border: 1px solid #d6e4f0; border-radius: 6px;
  background: #fff; color: #8a99a8; cursor: pointer; font-size: 18px; line-height: 1;
}
.source-ind {
  display: flex; align-items: baseline; justify-content: space-between; gap: 10px;
  padding: 10px 12px; background: #f4f8fc; border-radius: 6px; margin-bottom: 12px;
}
.ind-name { font-size: 13.5px; font-weight: 600; color: #1f3d5a; }
.ind-val { font-size: 13px; font-weight: 700; color: #0d4e83; font-family: ui-monospace, monospace; }
.source-body {
  border: 1px solid #e8eef5; border-radius: 8px; padding: 14px; background: #fafcfe; min-height: 160px;
}
.page-tag {
  display: inline-flex; font-size: 11.5px; color: #a36e0c; background: #fff5dc;
  border: 1px solid #efd291; border-radius: 4px; padding: 2px 7px; font-weight: 700; margin-bottom: 10px;
}
.src-text { font-size: 13.5px; line-height: 1.75; color: #3f5062; margin: 0; }
.src-text :deep(.hl) {
  background: #fff2c6; color: #8a6000; padding: 1px 3px; border-radius: 3px;
  box-shadow: inset 0 -2px 0 #d0ab68; font-weight: 600;
}
.source-foot { margin-top: 12px; font-size: 12px; color: #8a99a8; }
</style>
