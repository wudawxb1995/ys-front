<template>
  <div class="tpl">
    <header class="tpl-head">
      <div class="tpl-title">
        <h2>模板自定义配置</h2>
        <p>配置模板章节、格式和填写项，将编写要求落实为可复用的标准文档结构</p>
      </div>
      <div class="tpl-tools">
        <label class="tpl-current">
          <span>当前模板</span>
          <SelectField v-model="currentTemplate" :options="templateOptions" />
        </label>
        <span class="ver">V3.2</span>
        <span class="pub"><i></i>已发布</span>
        <div class="tpl-actions">
          <button class="btn btn-outline" @click="toast('已打开标准模板库')">模板库</button>
          <button class="btn btn-outline" @click="toast('已另存为模板副本')">另存为</button>
          <button class="btn btn-outline" @click="previewOpen = true">预览模板</button>
          <button class="btn btn-primary" @click="toast('模板配置已保存')">保存配置</button>
        </div>
      </div>
    </header>

    <section class="kpis">
      <article><i class="ico doc"></i><div><span>模板总数</span><b>128</b></div></article>
      <article><i class="ico stack"></i><div><span>标准模板</span><b>42</b></div></article>
      <article><i class="ico link"></i><div><span>已绑定规则</span><b>386</b></div></article>
      <article><i class="ico clock"></i><div><span>待更新模板</span><b>6</b></div></article>
    </section>

    <section class="workspace">
      <aside class="panel tree">
        <div class="panel-h"><b>模板章节结构</b></div>
        <div class="tree-body">
          <div v-for="node in chapters" :key="node.id">
            <button class="node" :class="{ on: selectedId === node.id }" @click="selectChapter(node)">
              <em :class="{ open: node.open, leaf: !node.children.length }" @click.stop="node.children.length && (node.open = !node.open)"></em>
              {{ node.name }}
            </button>
            <button
              v-for="child in node.children"
              v-show="node.open"
              :key="child.id"
              class="node child"
              :class="{ on: selectedId === child.id }"
              @click="selectField(node, child)"
            ><em class="leaf"></em>{{ child.name }}</button>
          </div>
        </div>
        <div class="tree-actions">
          <button @click="addChapter">添加章节</button>
          <button @click="addChild">添加子项</button>
        </div>
      </aside>

      <section class="panel preview">
        <div class="panel-h">
          <b>模板内容预览</b>
          <div class="zoom">
            <button title="搜索" @click="toast('可在章节中定位填写项')">⌕</button>
            <button title="放大" @click="scale = Math.min(1.15, +(scale + 0.05).toFixed(2))">+</button>
            <button title="缩小" @click="scale = Math.max(0.85, +(scale - 0.05).toFixed(2))">−</button>
            <button title="适应宽度" @click="scale = 1">⛶</button>
          </div>
        </div>
        <div class="paper-wrap">
          <article class="paper" :style="{ transform: `scale(${scale})` }">
            <h3>{{ paperTitle }}</h3>
            <h4>{{ activePreview.title }}</h4>
            <div v-for="block in activePreview.blocks" :key="block.h" class="block">
              <b>{{ block.h }}</b>
              <p v-for="row in block.rows" :key="row.label">
                {{ row.label }}：<span class="token">[{{ tokenName(row.fieldId) }}]</span> {{ row.unit }}
              </p>
            </div>
            <div v-if="activePreview.clause" class="clause">
              <span>原子化条款</span>
              {{ activePreview.clause }}
            </div>
          </article>
        </div>
        <div class="pager">第 {{ activePreview.page }} 页 / 共 18 页</div>
      </section>

      <aside class="panel config">
        <div class="panel-h"><b>字段与规则配置</b></div>
        <div class="tabs">
          <button v-for="tab in configTabs" :key="tab" :class="{ on: configTab === tab }" @click="configTab = tab">{{ tab }}</button>
        </div>

        <template v-if="configTab === '字段配置'">
          <div class="form">
            <label>字段名称<input v-model="activeField.name" /></label>
            <label>字段标识<input v-model="activeField.key" /></label>
            <label>字段类型
              <select v-model="activeField.type"><option>数值</option><option>文本</option><option>日期</option><option>枚举</option></select>
            </label>
            <label>计量单位<input v-model="activeField.unit" /></label>
            <label>填写方式
              <select v-model="activeField.fill"><option>用户填写</option><option>自动带入</option><option>公式计算</option></select>
            </label>
            <label>默认值<input v-model="activeField.defaultValue" /></label>
            <label class="wide">适用范围<input v-model="activeField.scope" /></label>
            <label class="switch-row">必填字段
              <button class="switch" :class="{ on: activeField.required }" type="button" @click="activeField.required = !activeField.required"><i></i></button>
            </label>
          </div>
          <div class="rule-box">
            <div class="sub-h">已绑定规则<button class="link" @click="toast('已打开规则库，可更换绑定')">更换规则</button></div>
            <b>{{ activeField.rule }}</b>
            <p>取值范围：{{ activeField.range }}</p>
            <p>标准依据：{{ activeField.basis }}</p>
          </div>
          <div class="perm">
            <div class="sub-h">访问权限</div>
            <label>编制人员<select v-model="activeField.editor"><option>可编辑</option><option>仅查看</option></select></label>
            <label>审核人员<select v-model="activeField.reviewer"><option>可查看</option><option>可编辑</option></select></label>
          </div>
          <div class="config-actions">
            <button class="btn btn-primary" @click="toast('字段配置已应用到当前章节')">应用配置</button>
            <button class="btn btn-outline" @click="toast(activeField.required ? '必填与取值范围校验通过' : '未设必填，建议补齐')">校验字段</button>
          </div>
        </template>

        <template v-else-if="configTab === '格式设置'">
          <div class="form">
            <label>标题字号<select><option>三号</option><option>四号</option></select></label>
            <label>正文字号<select><option>小四</option><option>五号</option></select></label>
            <label>对齐方式<select><option>左对齐</option><option>居中</option></select></label>
            <label>占位样式<select><option>[字段名称]</option><option>下划线</option></select></label>
            <label class="wide">章节编号<input value="自动按层级编号" /></label>
          </div>
          <div class="config-actions">
            <button class="btn btn-primary" @click="toast('格式已应用到模板预览')">应用配置</button>
            <button class="btn btn-outline" @click="toast('格式校验通过')">校验字段</button>
          </div>
        </template>

        <template v-else>
          <div class="bind-list">
            <article v-for="item in bindRules" :key="item.name">
              <b>{{ item.name }}</b>
              <p>{{ item.desc }}</p>
              <button @click="toast(`已绑定「${item.name}」`)">绑定</button>
            </article>
          </div>
        </template>
      </aside>
    </section>

    <section class="panel table-card">
      <div class="table-tabs">
        <button v-for="tab in tableTabs" :key="tab" :class="{ on: tableTab === tab }" @click="tableTab = tab">{{ tab }}</button>
      </div>
      <table>
        <thead>
          <tr><th>章节字段</th><th>关联规则</th><th>内容类型</th><th>适用范围</th><th>来源依据</th><th>状态</th><th>操作</th></tr>
        </thead>
        <tbody>
          <tr v-for="row in filteredRows" :key="row.field + row.rule">
            <td>{{ row.field }}</td>
            <td>{{ row.rule }}</td>
            <td>{{ row.type }}</td>
            <td>{{ row.scope }}</td>
            <td>{{ row.source }}</td>
            <td><span class="st" :class="row.tone">{{ row.status }}</span></td>
            <td>
              <button @click="toast(`查看：${row.rule}`)">查看</button>
              <button @click="toast(`编辑：${row.rule}`)">编辑</button>
            </td>
          </tr>
          <tr v-if="!filteredRows.length"><td colspan="7" class="empty">当前页签暂无记录</td></tr>
        </tbody>
      </table>
    </section>

    <div v-if="previewOpen" class="mask" @click.self="previewOpen = false">
      <div class="preview-dialog">
        <header><b>{{ paperTitle }} · 全文预览</b><button @click="previewOpen = false">×</button></header>
        <article class="paper plain">
          <h3>{{ paperTitle }}</h3>
          <div v-for="node in chapters" :key="node.id">
            <h4>{{ node.name }}</h4>
            <p v-if="node.children.length">{{ node.children.map((item) => item.name).join('、') }}</p>
          </div>
        </article>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import SelectField from '@/components/SelectField.vue'
import { useUi } from '@/composables/ui'

const { toast } = useUi()
const templateOptions = ['定型试验报告模板', '性能鉴定试验报告模板', '试验大纲模板']
const currentTemplate = ref(templateOptions[0])
const paperTitle = computed(() => currentTemplate.value.replace('模板', ''))
const scale = ref(1)
const previewOpen = ref(false)
const configTab = ref('字段配置')
const tableTab = ref('规则与原子条款')
const configTabs = ['字段配置', '格式设置', '规则绑定']
const tableTabs = ['规则与原子条款', '绑定规则', '引用条款', '配置溯源', '同步关联文档']
const selectedId = ref('c4')

const fields = reactive({
  temp: { name: '环境温度', key: 'environment_temperature', type: '数值', unit: '℃', fill: '用户填写', defaultValue: '25', scope: '高温、低温试验', required: true, rule: '环境温度范围校验', range: '-55℃ ~ 85℃', basis: 'GJB 150A', editor: '可编辑', reviewer: '可查看' },
  duration: { name: '持续时间', key: 'duration_hours', type: '数值', unit: 'h', fill: '用户填写', defaultValue: '8', scope: '连续运行试验', required: true, rule: '持续时长下限校验', range: '不少于规定时长', basis: '试验大纲 V4', editor: '可编辑', reviewer: '可查看' },
  equip: { name: '试验设备', key: 'test_equipment', type: '文本', unit: '—', fill: '用户填写', defaultValue: '', scope: '全部试验', required: true, rule: '设备名称完整性', range: '不得为空', basis: '资源库', editor: '可编辑', reviewer: '可查看' },
  humidity: { name: '相对湿度', key: 'relative_humidity', type: '数值', unit: '%', fill: '用户填写', defaultValue: '60', scope: '环境试验', required: false, rule: '湿度范围校验', range: '20% ~ 95%', basis: 'GJB 150A', editor: '可编辑', reviewer: '可查看' },
})

const chapters = reactive([
  { id: 'cover', name: '封面', open: false, children: [] },
  { id: 'note', name: '编制说明', open: false, children: [] },
  { id: 'c1', name: '1 试验目的', open: false, children: [] },
  { id: 'c2', name: '2 试验依据', open: false, children: [] },
  { id: 'c3', name: '3 试验对象', open: false, children: [] },
  { id: 'c4', name: '4 试验条件', open: true, children: [
    { id: 'temp', name: '环境温度' },
    { id: 'duration', name: '持续时间' },
    { id: 'equip', name: '试验设备' },
  ] },
  { id: 'c5', name: '5 试验方法', open: false, children: [] },
  { id: 'c6', name: '6 结果判定', open: false, children: [] },
  { id: 'c7', name: '7 附件', open: false, children: [] },
])

const previews = {
  c4: {
    title: '4 试验条件',
    page: 4,
    clause: '在规定环境条件下，应连续运行不少于规定时长。各项功能应保持正常。',
    blocks: [
      { h: '4.1 环境条件', rows: [{ label: '环境温度', fieldId: 'temp', unit: '℃' }, { label: '相对湿度', fieldId: 'humidity', unit: '%' }] },
      { h: '4.2 持续时间', rows: [{ label: '持续时间', fieldId: 'duration', unit: 'h' }] },
      { h: '4.3 试验设备', rows: [{ label: '设备名称', fieldId: 'equip', unit: '' }] },
    ],
  },
}

const activeFieldId = ref('temp')
const activeField = computed(() => fields[activeFieldId.value] || fields.temp)
const activeChapter = computed(() => chapters.find((item) => item.id === selectedId.value || item.children.some((child) => child.id === selectedId.value)) || chapters[5])
const activePreview = computed(() => previews[activeChapter.value.id] || {
  title: activeChapter.value.name,
  page: Math.max(1, chapters.findIndex((item) => item.id === activeChapter.value.id) + 1),
  clause: '',
  blocks: [{ h: activeChapter.value.name, rows: activeChapter.value.children.map((child) => ({ label: child.name, fieldId: child.id, unit: fields[child.id]?.unit || '' })) }],
})

const rows = [
  { field: '4.1 环境条件', rule: '环境温度范围校验', type: '审查规则', scope: '高温、低温试验', source: 'GJB 150A', status: '已绑定', tone: 'ok', tab: '绑定规则' },
  { field: '环境温度', rule: '环境试验通用要求', type: '原子化条款', scope: '标准模板试验', source: '标准模板库', status: '已引用', tone: 'blue', tab: '引用条款' },
  { field: '6 结果判定', rule: '试验结论完整性', type: '审查规则', scope: '试验报告', source: '评审规则库', status: '待校验', tone: 'warn', tab: '绑定规则' },
]
const filteredRows = computed(() => {
  if (tableTab.value === '规则与原子条款' || tableTab.value === '配置溯源') return rows
  if (tableTab.value === '同步关联文档') return rows.filter((row) => row.tone === 'ok')
  return rows.filter((row) => row.tab === tableTab.value)
})
const bindRules = [
  { name: '环境温度范围校验', desc: '取值 -55℃ ~ 85℃ · GJB 150A' },
  { name: '环境试验通用要求', desc: '原子化条款 · 标准模板库' },
  { name: '试验结论完整性', desc: '结果判定章必填结论与判据版本' },
]

function tokenName(id) {
  return fields[id]?.name || id
}
function selectChapter(node) {
  selectedId.value = node.id
  if (node.children.length) {
    node.open = true
    if (fields[node.children[0].id]) activeFieldId.value = node.children[0].id
  }
}
function selectField(node, child) {
  selectedId.value = child.id
  node.open = true
  if (fields[child.id]) activeFieldId.value = child.id
}
function addChapter() {
  const id = `n${chapters.length + 1}`
  chapters.push({ id, name: `${chapters.length - 1} 新增章节`, open: false, children: [] })
  selectedId.value = id
  toast('已添加章节')
}
function addChild() {
  const chapter = activeChapter.value
  const id = `f${Object.keys(fields).length + 1}`
  fields[id] = { name: '新增字段', key: id, type: '文本', unit: '—', fill: '用户填写', defaultValue: '', scope: '本章', required: false, rule: '待绑定规则', range: '—', basis: '—', editor: '可编辑', reviewer: '可查看' }
  chapter.children.push({ id, name: '新增字段' })
  chapter.open = true
  selectedId.value = id
  activeFieldId.value = id
  toast('已添加子项')
}
</script>

<style scoped>
:global(.main:has(.tpl)) { padding-bottom: 12px; }
.tpl { color: #334e66; min-width: 1180px; }
.tpl :deep(.btn) { height: 32px; padding: 0 12px; border-radius: 4px; font-size: 13px; }
.tpl :deep(.btn-primary) { background: #0870bf; border-color: #0870bf; box-shadow: none; }
.tpl :deep(.btn-outline) { color: #0870bf; border-color: #8ebfe6; background: #fff; }
.tpl-head { display: flex; justify-content: space-between; align-items: center; gap: 20px; margin-bottom: 12px; }
.tpl-title { min-width: 0; }
.tpl-head h2 { color: #07508c; font-size: 20px; font-weight: 700; line-height: 1.25; letter-spacing: .2px; }
.tpl-head p { margin-top: 4px; color: #8a9aab; font-size: 13px; line-height: 1.4; }
.tpl-tools { display: flex; align-items: center; gap: 10px; flex: 0 0 auto; }
.tpl-current { display: flex; align-items: center; gap: 8px; color: #5d7388; font-size: 13px; white-space: nowrap; }
.tpl-current :deep(.sf-wrap) { width: 228px; }
.tpl-current :deep(.sf-trigger) { height: 32px; border-radius: 8px; border-color: #d5e2ee; font-size: 13px; color: #2f4a63; box-shadow: 0 1px 2px rgba(18, 61, 96, .04); }
.tpl-current :deep(.sf-trigger:hover) { border-color: #8ebfe6; }
.tpl-current :deep(.sf-wrap.open .sf-trigger) { border-color: #0870bf; box-shadow: 0 0 0 3px rgba(8, 112, 191, .12); }
.tpl-current :deep(.sf-panel) { border-radius: 10px; }
.form input, .form select, .perm select { border: 1px solid #d3e0eb; border-radius: 6px; background: #fff; color: #2f4a63; padding: 0 8px; height: 28px; }
.ver, .pub { display: inline-flex; align-items: center; height: 26px; padding: 0 10px; font-size: 12px; font-weight: 650; white-space: nowrap; }
.ver { background: #e7f3fd; color: #0870bf; border-radius: 8px; }
.pub { background: #e8f7ee; color: #1c8a42; border-radius: 999px; gap: 5px; }
.pub i { width: 6px; height: 6px; border-radius: 50%; background: #1c8a42; }
.tpl-actions { display: flex; align-items: center; gap: 8px; margin-left: 2px; }
.tpl-actions :deep(.btn) { height: 32px; padding: 0 14px; border-radius: 8px; font-size: 13px; letter-spacing: 0; }
.tpl-actions :deep(.btn-outline) { color: #0870bf; border-color: #9ec8ea; background: #fff; }
.tpl-actions :deep(.btn-outline:hover) { background: #f4f9fd; border-color: #0870bf; }
.tpl-actions :deep(.btn-primary) { background: #0870bf; border-color: #0870bf; box-shadow: 0 2px 6px rgba(8, 112, 191, .22); }
.tpl-actions :deep(.btn-primary:hover) { background: #075fa6; }
.kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 8px; }
.kpis article { display: flex; align-items: center; gap: 12px; background: #fff; border: 1px solid #e5e8ef; border-bottom: 3px solid #d0ab68; border-radius: 0; padding: 10px 14px; box-shadow: 0 2px 8px rgba(18, 61, 96, .05); }
.kpis span { display: block; color: #7d90a3; font-size: 13px; }
.kpis b { color: #07508c; font-size: 24px; line-height: 1.15; }
.ico { width: 38px; height: 38px; border-radius: 0; background: #eef6fd center / 20px no-repeat; flex: 0 0 38px; }
.ico.doc { background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%230870bf' stroke-width='1.7'><path d='M7 3.5h7l4 4V20H7z'/><path d='M14 3.5V8h4.5'/></svg>"); }
.ico.stack { background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%230870bf' stroke-width='1.7'><path d='M7 6.5h11v13H7z'/><path d='M5 4.5h11v2'/><path d='M9 10h7M9 13.5h7M9 17h4'/></svg>"); }
.ico.link { background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%230870bf' stroke-width='1.7'><path d='M10 13a4 4 0 0 0 5.7.4l2-2a4 4 0 0 0-5.7-5.7l-1 1'/><path d='M14 11a4 4 0 0 0-5.7-.4l-2 2a4 4 0 0 0 5.7 5.7l1-1'/></svg>"); }
.ico.clock { background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%230870bf' stroke-width='1.7'><circle cx='12' cy='12' r='8'/><path d='M12 8v5l3 2'/></svg>"); }
.workspace { display: grid; grid-template-columns: 228px minmax(0, 1fr) 430px; gap: 10px; margin-bottom: 8px; align-items: stretch; }
.panel { background: #fff; border: 1px solid #e5e8ef; border-radius: 0; box-shadow: 0 2px 8px rgba(18, 61, 96, .05); }
.panel-h { display: flex; align-items: center; justify-content: space-between; padding: 6px 12px; border-bottom: 1px solid #eef3f8; }
.panel-h b { color: #07508c; font-size: 14px; }
.panel-h b::before, .sub-h::before { content: ''; display: inline-block; width: 3px; height: 14px; border-radius: 2px; background: #0870bf; margin-right: 8px; vertical-align: -2px; }
.tree { display: flex; flex-direction: column; min-height: 0; }
.tree-body { flex: 1; padding: 4px 0; overflow: auto; }
.node { width: 100%; height: 28px; border: 0; background: transparent; display: flex; align-items: center; gap: 6px; padding: 0 12px; color: #3d556b; text-align: left; font-size: 13px; }
.node.child { padding-left: 34px; color: #5c7286; }
.node.on { background: #e8f4fd; color: #07508c; font-weight: 650; box-shadow: inset 3px 0 #0870bf; }
.node em { width: 14px; height: 14px; position: relative; flex: 0 0 14px; }
.node em::before { content: ''; position: absolute; left: 4px; top: 3px; border: 4px solid transparent; border-left-color: #8aa0b4; }
.node em.open::before { left: 2px; top: 5px; border-left-color: transparent; border-top-color: #0870bf; }
.node em.leaf::before { width: 6px; height: 6px; border: 0; border-radius: 1px; background: #c5d4e2; left: 4px; top: 4px; }
.tree-actions { display: flex; gap: 8px; padding: 8px 10px; border-top: 1px solid #eef3f8; }
.tree-actions button { flex: 1; height: 30px; border: 1px dashed #8ebfe6; background: #fff; color: #0870bf; border-radius: 4px; }
.preview { display: flex; flex-direction: column; min-width: 0; }
.zoom { display: flex; gap: 4px; }
.zoom button { width: 26px; height: 26px; border: 1px solid #d5e2ee; background: #fff; color: #5d7388; border-radius: 4px; }
.paper-wrap { flex: 1; display: grid; place-items: start center; padding: 12px 12px 4px; background: #f7fafc; overflow: auto; }
.paper { width: min(460px, 100%); background: #fff; border: 1px solid #e6eef5; box-shadow: 0 8px 24px rgba(20, 60, 96, .08); padding: 16px 28px 14px; transform-origin: top center; }
.paper h3 { text-align: center; color: #1d3f5e; font-size: 18px; margin-bottom: 12px; }
.paper h4 { color: #1d3f5e; font-size: 15px; margin: 4px 0 8px; }
.block { margin-bottom: 8px; }
.block b { display: block; color: #24506f; margin-bottom: 2px; }
.block p { margin: 0; color: #3e5870; line-height: 1.7; font-size: 13.5px; }
.token { color: #0870bf; }
.clause { margin-top: 10px; background: #fff8e8; border: 1px solid #f0d48a; border-radius: 4px; padding: 8px 10px; color: #6a5520; font-size: 13px; line-height: 1.65; }
.clause span { display: inline-block; background: #f3d78a; color: #7a5a10; border-radius: 3px; padding: 0 6px; margin-right: 6px; font-size: 12px; }
.pager { text-align: center; color: #8aa0b3; font-size: 12px; padding: 6px 0 8px; }
.config { padding-bottom: 4px; }
.tabs, .table-tabs { display: flex; gap: 18px; padding: 0 14px; border-bottom: 1px solid #eef3f8; }
.tabs button, .table-tabs button { height: 30px; border: 0; background: transparent; color: #6d8296; font-size: 13px; border-bottom: 2px solid transparent; white-space: nowrap; padding: 0 2px; }
.tabs button.on, .table-tabs button.on { color: #07508c; font-weight: 700; border-bottom-color: #0870bf; }
.form { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 10px; padding: 6px 12px 4px; }
.form label, .perm label { display: flex; flex-direction: column; gap: 2px; color: #6a8296; font-size: 12px; line-height: 1.2; }
.form .wide, .switch-row { grid-column: 1 / -1; }
.form input, .form select { width: 100%; margin: 0; font-size: 13px; }
.switch-row { flex-direction: row !important; align-items: center; justify-content: space-between; }
.switch { width: 36px; height: 20px; border: 0; border-radius: 10px; background: #c5d0da; padding: 2px; }
.switch i { display: block; width: 16px; height: 16px; border-radius: 50%; background: #fff; }
.switch.on { background: #0870bf; }
.switch.on i { margin-left: 16px; }
.rule-box, .perm { margin: 0 12px 6px; background: #f5f9fc; border-radius: 6px; padding: 6px 10px; }
.sub-h { display: flex; justify-content: space-between; align-items: center; color: #07508c; font-weight: 700; font-size: 13px; margin-bottom: 2px; }
.rule-box b { color: #1e4668; font-size: 13px; }
.rule-box p, .bind-list p { margin: 0; color: #6d8296; font-size: 12px; line-height: 1.45; }
.link { border: 0; background: transparent; color: #0870bf; font-size: 12px; }
.perm { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 8px; }
.perm .sub-h { grid-column: 1 / -1; }
.config-actions { display: flex; justify-content: flex-end; gap: 8px; padding: 2px 12px 0; }
.bind-list { padding: 12px; display: flex; flex-direction: column; gap: 8px; }
.bind-list article { border: 1px solid #e3edf5; border-radius: 6px; padding: 10px; position: relative; }
.bind-list button { position: absolute; right: 10px; top: 10px; border: 1px solid #8ebfe6; background: #fff; color: #0870bf; border-radius: 4px; height: 26px; padding: 0 8px; }
.table-card { padding-bottom: 8px; }
table { width: 100%; border-collapse: collapse; font-size: 13px; }
th { text-align: left; background: #f3f8fc; color: #5d7388; font-weight: 600; padding: 8px 12px; }
td { padding: 8px 12px; border-top: 1px solid #eef3f8; color: #3d556b; }
td button { border: 0; background: transparent; color: #0870bf; margin-right: 8px; }
.st::before { content: ''; display: inline-block; width: 6px; height: 6px; border-radius: 50%; margin-right: 5px; }
.st.ok { color: #1c8a42; } .st.ok::before { background: #1c8a42; }
.st.blue { color: #0870bf; } .st.blue::before { background: #0870bf; }
.st.warn { color: #d48806; } .st.warn::before { background: #d48806; }
.empty { text-align: center; color: #8aa0b3; }
.mask { position: fixed; inset: 0; background: rgba(15, 35, 55, .35); display: grid; place-items: center; z-index: 40; }
.preview-dialog { width: min(720px, 92vw); max-height: 80vh; overflow: auto; background: #f4f7fb; border-radius: 10px; padding: 12px; }
.preview-dialog header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; color: #07508c; }
.preview-dialog header button { border: 0; background: transparent; font-size: 20px; color: #5d7388; }
.paper.plain { width: 100%; }
</style>
