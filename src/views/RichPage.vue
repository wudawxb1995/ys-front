<template>
  <div>
    <div class="page-head" v-if="page.type !== 'dashboard'">
      <h2>{{ title }}</h2>
      <p>{{ page.desc }}</p>
      <div class="deco"></div>
    </div>

    <template v-if="page.type === 'entry'">
      <div class="split" style="grid-template-columns: 1fr 1.1fr; align-items: start;">
        <!-- 左：资源信息登记 -->
        <div class="panel">
          <h3><i></i>资源信息登记</h3>

          <!-- 资源名称（全宽） -->
          <div class="form-row">
            <label><span class="req">*</span>资源名称</label>
            <input v-model="form.name" placeholder="如：东方红-LF2204轮式拖拉机定型试验报告" />
          </div>

          <!-- 资源类别 + 文件格式（两列） -->
          <div class="form-cols">
            <div class="form-row">
              <label><span class="req">*</span>资源类别</label>
              <select v-model="form.cat">
                <option v-for="op in ['定型资料','历史试验数据','标准规范','专业文献']" :key="op">{{ op }}</option>
              </select>
            </div>
            <div class="form-row">
              <label><span class="req">*</span>文件格式</label>
              <select v-model="form.fmt">
                <option v-for="op in ['DOCX','PDF','TXT','XLSX','JPG','PNG','MP4','MP3','CSV']" :key="op">{{ op }}</option>
              </select>
            </div>
          </div>

          <!-- 数据模态 + 文件大小（两列） -->
          <div class="form-cols">
            <div class="form-row">
              <label>数据模态</label>
              <select v-model="form.modal">
                <option v-for="op in ['文本','图像','表格','音视频']" :key="op">{{ op }}</option>
              </select>
            </div>
            <div class="form-row">
              <label>文件大小（MB）</label>
              <input v-model="form.size" type="number" placeholder="如：36.5" />
            </div>
          </div>

          <!-- 页数（全宽） -->
          <div class="form-row">
            <label>页数</label>
            <input v-model="form.pages" type="number" placeholder="如：128" />
          </div>

          <!-- 解析模式 -->
          <div class="form-row">
            <label>解析模式</label>
            <div class="radio-row">
              <label><input type="radio" value="即时解析" v-model="form.mode" /> 即时解析</label>
              <label><input type="radio" value="暂存" v-model="form.mode" /> 暂存</label>
            </div>
            <p class="hint" style="margin-top:6px">即时解析：录入后立即调度解析引擎处理；暂存：仅入库保存，后续在解析任务管理中统一发起。</p>
          </div>

          <button class="btn btn-primary" style="width:100%;margin-top:4px" @click="addToList">加入导入清单</button>
        </div>

        <!-- 右：批量导入清单 -->
        <div class="panel">
          <h3 style="justify-content:space-between">
            <span style="display:flex;align-items:center;gap:8px"><i></i>批量导入清单</span>
            <span style="font-size:13px;color:#8a99a8;font-weight:400">支持单次批量导入（≥50篇 / ≥500MB）</span>
          </h3>
          <div style="display:flex;justify-content:flex-end;margin-bottom:12px">
            <button class="btn btn-primary" @click="commitList">
              确认录入（{{ importList.length }}）
            </button>
          </div>
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th class="col-idx">序号</th>
                  <th>名称</th>
                  <th>类别</th>
                  <th>格式</th>
                  <th>大小(MB)</th>
                  <th>解析模式</th>
                  <th style="text-align:center">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="!importList.length">
                  <td colspan="7" class="empty">清单为空，请先在左侧登记资源信息</td>
                </tr>
                <tr v-for="(item, i) in importList" :key="i">
                  <td>{{ i + 1 }}</td>
                  <td style="max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{{ item.name }}</td>
                  <td>{{ item.cat }}</td>
                  <td>{{ item.fmt }}</td>
                  <td>{{ item.size || '—' }}</td>
                  <td>{{ item.mode }}</td>
                  <td style="text-align:center">
                    <div class="ops" style="justify-content:center">
                      <a class="danger" @click="importList.splice(i, 1)">删除</a>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </template>

    <template v-else-if="page.type === 'workbench'">
      <div class="toolbar">
        <div class="field" style="width:280px">
          <label>审核对象</label>
          <select v-model="docId"><option v-for="d in docs" :key="d.id" :value="d.id">{{ d.name }}</option></select>
        </div>
        <button class="btn btn-primary" @click="toast('审核意见已保存')">保存审核</button>
        <button class="btn btn-outline" @click="toast('已调整章节层级')">调整层级</button>
      </div>
      <div class="workbench">
        <div class="wb-col">
          <h4>解析结果目录</h4>
          <div v-for="c in chapters" :key="c.id" class="dir-item" :class="{ on: c.id === cur.id }" @click="cur = c">
            {{ c.title }}<small :class="c.tag === '已确认' ? 'ok' : 'wait'">{{ c.tag }}</small>
          </div>
        </div>
        <div class="wb-col">
          <h4>审核与编辑</h4>
          <div class="editor">
            <div class="field"><label>章节标题</label><input v-model="cur.title" /></div>
            <div class="field" style="margin-top:10px"><label>正文内容</label><textarea v-model="cur.body" style="height:180px" /></div>
            <p style="margin-top:10px;font-size:13px;color:#6d8092">实体识别预览：<span class="ent">东方红-LF2204</span>　<span class="ent">162 kW</span>　<span class="ent">DG/T 001-2025</span></p>
            <div style="margin-top:12px;display:flex;gap:8px">
              <button class="btn btn-outline" @click="toast('已新增实体标注')">新增实体</button>
              <button class="btn btn-danger" @click="toast('已删除当前条目')">删除当前条目</button>
            </div>
          </div>
        </div>
        <div class="wb-col">
          <h4>源文件预览</h4>
          <div class="source">
            <h5 :class="{ hit: cur.id === 'c1' }">第一章 概述</h5>
            <p>受生产企业委托，对<span class="hit">东方红-LF2204</span>轮式拖拉机开展定型试验，验证其是否满足 DG/T 001-2025 的定型鉴定要求。</p>
            <h5>第二章 试验条件与仪器设备</h5>
            <p>试验地点：河南省洛阳市拖拉机试验场；环境温度 12～26 ℃；牵引设备：300 kN 负荷车。</p>
            <h5 :class="{ hit: cur.id === 'c3' }">第三章 性能试验结果</h5>
            <p>动力输出轴试验：标定转速 540/1000 r/min，发动机标定功率 <span class="hit">162 kW</span>，动力输出轴功率 138.5 kW。</p>
            <p>牵引性能试验：最大牵引力 38.6 kN，滑转率 8.2%，牵引功率 118.4 kW。</p>
            <h5>第四章 可靠性试验</h5>
            <p>累计作业 750 h，一般故障 2 次，MTBF = 375 h。</p>
          </div>
        </div>
      </div>
    </template>

    <template v-else-if="page.type === 'parse'">
      <div class="tabs">
        <button v-for="t in parseTabs" :key="t" :class="{ on: tab === t }" @click="tab = t">{{ t }}</button>
      </div>
      <div class="split" style="grid-template-columns: 1fr 1fr">
        <div class="panel">
          <h3><i></i>解析能力</h3>
          <ul class="check-list">
            <li v-for="item in parsePoints" :key="item" style="list-style:none;padding:8px 0;border-bottom:1px solid #f0f4f8;color:#3f5062">{{ item }}</li>
          </ul>
        </div>
        <div class="panel">
          <h3><i></i>解析结果预览</h3>
          <div class="kv">
            <b>机型</b><span>东方红-LF2204</span>
            <b>关键指标</b><span>标定功率 162 kW；牵引力 38.6 kN</span>
            <b>段落主旨</b><span>本章给出动力输出与牵引性能的实测结果</span>
            <b>语义关系</b><span>指标—数值、项目—方法、结论—标准条款</span>
            <b>调度引擎</b><span>{{ tab === '图像解析' ? '文档OCR识别引擎 95.6%' : tab === '表格解析' ? '表格结构识别引擎 94.1%' : '领域多模态大模型 92.4%' }}</span>
          </div>
        </div>
      </div>
    </template>

    <template v-else-if="page.type === 'engines'">
      <div class="engine-grid">
        <div v-for="e in engines" :key="e.name" class="engine">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <h4>{{ e.name }}</h4>
            <span class="badge" :class="e.on ? 'on' : 'hold'"><i></i>{{ e.on ? '启用' : '停用' }}</span>
          </div>
          <p>{{ e.vendor }} · {{ e.type }}</p>
          <p>准确率 {{ e.acc }} · {{ e.lang }}</p>
          <p>{{ e.cap }}</p>
          <button class="btn btn-outline" style="margin-top:8px" @click="e.on = !e.on; toast(e.on ? '已启用' : '已停用')">{{ e.on ? '停用' : '启用' }}</button>
        </div>
      </div>
    </template>

    <template v-else-if="page.type === 'clean'">
      <div class="split" style="grid-template-columns: 1fr 1fr">
        <div class="panel">
          <h3><i></i>去噪归一规则</h3>
          <div class="check-list">
            <label v-for="r in rules" :key="r.name"><input type="checkbox" v-model="r.on" /> {{ r.name }}（{{ r.target }}）</label>
          </div>
        </div>
        <div class="panel">
          <h3><i></i>执行清洗</h3>
          <div class="field"><label>选择资源</label>
            <select v-model="cleanRes">
              <option>东方红-LF2204轮式拖拉机定型试验报告</option>
              <option>雷沃谷神4LZ-8谷物联合收割机鉴定大纲</option>
            </select>
          </div>
          <button class="btn btn-primary" style="margin-top:12px" @click="runClean">执行清洗</button>
        </div>
      </div>
      <div class="table-wrap" style="margin-top:12px">
        <table>
          <thead><tr><th>数据资源</th><th>应用规则</th><th>剔除噪声</th><th>状态</th><th>处理时间</th></tr></thead>
          <tbody>
            <tr v-for="log in cleanLogs" :key="log.time"><td>{{ log.res }}</td><td>{{ log.rule }}</td><td>{{ log.n }}</td><td><span class="badge on"><i></i>已完成</span></td><td>{{ log.time }}</td></tr>
          </tbody>
        </table>
      </div>
    </template>

    <template v-else-if="page.type === 'export'">
      <div class="panel">
        <h3><i></i>批量导出配置</h3>
        <p class="hint" style="margin-bottom:8px">第一步：勾选已解析文档</p>
        <div class="check-list">
          <label v-for="n in exportDocs" :key="n"><input type="checkbox" checked /> {{ n }}</label>
        </div>
        <p class="hint" style="margin:12px 0 8px">第二步：选择目标格式</p>
        <div class="code-tabs">
          <button v-for="f in ['JSON','DOCX','Markdown','PDF','TXT']" :key="f" :class="{ on: fmt === f }" @click="fmt = f">{{ f }}</button>
        </div>
        <button class="btn btn-primary" @click="toast('已生成 ' + fmt + ' 导出任务')">开始导出</button>
      </div>
      <CrudPage :page="{ type:'crud', desc:'最近导出任务', dataset:'exports' }" title="导出成果" style="margin-top:8px" />
    </template>

    <template v-else-if="page.type === 'graph'">
      <div class="toolbar">
        <input v-model="gkey" class="g-search" placeholder="搜索节点名称或类型" />
        <button class="btn btn-outline" @click="toast('已切换为三维布局预览')">三维展示</button>
        <button class="btn btn-primary" @click="toast('节点已加入画布，可在右侧编辑属性')">新建节点</button>
        <button class="btn btn-outline" @click="toast('图谱压缩包已开始导出')">导出压缩包</button>
      </div>
      <div class="graph-wrap">
        <svg class="graph-svg" viewBox="0 0 760 520">
          <line v-for="e in graphEdges" :key="e[0]+e[1]" :x1="nodeMap[e[0]].x" :y1="nodeMap[e[0]].y" :x2="nodeMap[e[1]].x" :y2="nodeMap[e[1]].y" stroke="#b7cbe0" stroke-width="1.4" />
          <g v-for="n in graphNodes" :key="n.id" @click="activeNode = n" style="cursor:pointer">
            <circle :cx="n.x" :cy="n.y" :r="n.id === activeNode.id ? 30 : 26" :fill="n.color" :stroke="nodeHit(n) ? '#e3bd6a' : '#fff'" :stroke-width="nodeHit(n) ? 4 : 2" />
            <text :x="n.x" :y="n.y + 4" text-anchor="middle" font-size="12" font-weight="700" :fill="n.color === '#d0ab68' ? '#5a3e12' : '#fff'">{{ n.type.slice(0, 2) }}</text>
            <text :x="n.x" :y="n.y + 48" text-anchor="middle" font-size="12" fill="#1d3e5c" paint-order="stroke" stroke="#f7fbfe" stroke-width="4">{{ n.label }}</text>
          </g>
        </svg>
        <div class="panel node-card">
          <h4>{{ activeNode.label }}</h4>
          <p>类型：{{ activeNode.type }}</p>
          <p>{{ activeNode.detail }}</p>
          <div class="actions">
            <button class="btn btn-outline" @click="toast('关系已保存')">编辑关系</button>
            <button class="btn btn-primary" @click="toast('已打开原文溯源')">原文溯源</button>
          </div>
        </div>
      </div>
    </template>

    <template v-else-if="page.type === 'chat'">
      <div class="chat-wrap">
        <div class="chat-side">
          <div class="side-title">会话主题</div>
          <div v-for="t in topics" :key="t" class="topic" :class="{ on: t === topic }" @click="topic = t">{{ t }}</div>
        </div>
        <div class="chat-main">
          <div class="chat-bar">{{ topic }}</div>
          <div class="msgs">
            <div v-for="(m, i) in messages" :key="i" class="bubble" :class="m.role">
              {{ m.text }}
              <span v-if="m.src" class="src">来源：{{ m.src }}</span>
            </div>
          </div>
          <div class="suggest">
            <button v-for="q in suggests" :key="q" @click="ask(q)">{{ q }}</button>
          </div>
          <div class="chat-input">
            <input v-model="input" placeholder="请输入问题，支持多轮补充" @keyup.enter="ask(input)" />
            <button class="btn btn-primary" @click="ask(input)">发送</button>
          </div>
        </div>
      </div>
    </template>

    <template v-else-if="page.type === 'code'">
      <div class="code-tabs">
        <button v-for="l in codeLangs" :key="l" :class="{ on: lang === l }" @click="lang = l">{{ l }}</button>
      </div>
      <pre class="code" v-html="codeHtml"></pre>
      <div style="margin-top:10px;display:flex;gap:8px">
        <button class="btn btn-primary" @click="toast('已写入代码成果库')">保存成果</button>
        <button class="btn btn-outline" @click="toast('已生成函数、参数与执行逻辑注释')">生成注释</button>
        <button class="btn btn-outline" @click="toast('未发现语法错误，建议核对滑转率分母')">纠错检查</button>
      </div>
    </template>

    <template v-else-if="page.type === 'radar'">
      <div class="split" style="grid-template-columns: 360px 1fr">
        <div class="panel">
          <h3><i></i>能力雷达 · 东方红-LF2204</h3>
          <svg viewBox="0 0 320 300" width="100%">
            <polygon points="160,40 262,112 230,230 90,230 58,112" fill="none" stroke="#d5e4f2" />
            <polygon points="160,78 226,126 206,204 112,204 94,126" fill="rgba(22,104,168,.25)" stroke="#1668a8" />
            <text x="150" y="32" font-size="12" fill="#0d4e83">打击 86</text>
            <text x="266" y="116" font-size="12" fill="#0d4e83">机动 82</text>
            <text x="214" y="252" font-size="12" fill="#0d4e83">防护 78</text>
            <text x="48" y="252" font-size="12" fill="#0d4e83">可靠 90</text>
            <text x="20" y="116" font-size="12" fill="#0d4e83">效率 84</text>
          </svg>
        </div>
        <div class="panel">
          <h3><i></i>能力矩阵</h3>
          <div class="table-wrap">
            <table>
              <thead><tr><th>维度</th><th>得分</th><th>主要依据</th><th>状态</th></tr></thead>
              <tbody>
                <tr v-for="r in radarRows" :key="r.name"><td>{{ r.name }}</td><td>{{ r.score }}</td><td>{{ r.basis }}</td><td><span class="badge on"><i></i>达标</span></td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </template>

    <template v-else-if="page.type === 'timeline'">
      <div class="panel">
        <div class="timeline">
          <div v-for="item in timeline" :key="item.t" class="tl-item">
            <b>{{ item.t }} · {{ item.title }}</b>
            <p>{{ item.text }}</p>
          </div>
        </div>
      </div>
    </template>

    <template v-else-if="page.type === 'flow'">
      <div class="chain">
        <template v-for="(n, i) in flowNodes">
          <div :key="n.title" class="node" :class="{ on: n.title === flowOn.title }" @click="flowOn = n">
            <em>{{ String(i + 1).padStart(2, '0') }}</em>
            <b>{{ n.title }}</b>
            <p>{{ n.text }}</p>
          </div>
          <div v-if="i < flowNodes.length - 1" :key="n.title + '-arrow'" class="arrow">→</div>
        </template>
      </div>
      <div class="panel" style="margin-top:12px">
        <h3><i></i>{{ flowOn.title }}</h3>
        <p style="color:#3f5062;line-height:1.75">{{ flowOn.detail }}</p>
      </div>
    </template>

    <template v-else-if="page.type === 'canvas'">
      <div class="split" style="grid-template-columns: 1fr 280px">
        <div class="canvas">
          <svg class="canvas-lines">
            <line v-for="(e, i) in canvasLinks" :key="i" :x1="e[0].x + 75" :y1="e[0].y + 28" :x2="e[1].x + 75" :y2="e[1].y + 28" />
          </svg>
          <div v-for="n in canvasNodes" :key="n.title" class="wf-node" :class="{ on: n.title === canvasOn.title }" :style="{ left: n.x + 'px', top: n.y + 'px' }" @click="canvasOn = n">
            <b>{{ n.title }}</b><span>{{ n.sub }}</span>
          </div>
        </div>
        <div class="panel">
          <h3><i></i>节点参数</h3>
          <p style="color:#3f5062;line-height:1.7;margin-bottom:8px">{{ canvasOn.detail }}</p>
          <div class="field"><label>输入参数</label><input :value="canvasOn.input" /></div>
          <div class="field" style="margin-top:8px"><label>输出参数</label><input :value="canvasOn.output" /></div>
          <button class="btn btn-primary" style="margin-top:12px" @click="toast('组件调试通过，日志已写入')">在线调试</button>
        </div>
      </div>
    </template>

    <template v-else-if="page.type === 'cards'">
      <div class="cards">
        <div v-for="c in cardList" :key="c.title" class="info-card" @click="toast('已打开「' + c.title + '」')">
          <div class="tag">{{ c.tag }}</div>
          <h4>{{ c.title }}</h4>
          <p>{{ c.text }}</p>
          <button class="btn btn-ghost" @click.stop="toast('已打开「' + c.title + '」')">查看</button>
        </div>
      </div>
    </template>

    <template v-else-if="page.type === 'report'">
      <div style="display:flex;gap:8px;margin-bottom:12px">
        <button class="btn btn-primary" @click="toast('报告已保存')">保存</button>
        <button class="btn btn-outline" @click="toast('已导出 Word')">导出 Word</button>
        <button class="btn btn-outline" @click="toast('已导出 PDF')">导出 PDF</button>
      </div>
      <article class="doc-paper">
        <h3>{{ paper.title }}</h3>
        <div class="meta">{{ paper.meta }}</div>
        <template v-for="sec in paper.sections">
          <h4 :key="sec.h">{{ sec.h }}</h4>
          <p :key="sec.h + '-p'">{{ sec.p }}</p>
        </template>
      </article>
    </template>

    <template v-else-if="page.type === 'stats'">
      <div class="kpi-row">
        <div v-for="k in statKpis" :key="k.label" class="kpi">
          <div class="mark"><Icon :name="kpiIcon(k.label)" /></div>
          <div class="label">{{ k.label }}</div>
          <div class="value">{{ k.value }}<small>{{ k.unit }}</small></div>
        </div>
      </div>
      <div class="split" style="grid-template-columns: 1.2fr .8fr">
        <div class="panel">
          <h3><i></i>{{ statChart.title }}</h3>
          <div class="bars">
            <div v-for="item in statChart.data" :key="item[0]" class="bar-col">
              <div class="num">{{ item[1] }}</div>
              <div class="bar" :style="{ height: Math.max(12, item[1] / statMax * 130) + 'px' }"></div>
              <div class="lb">{{ item[0] }}</div>
            </div>
          </div>
        </div>
        <div class="panel">
          <h3><i></i>结构分布</h3>
          <div v-for="d in dist" :key="d.name" class="dist-row">
            <div class="dist-meta"><span>{{ d.name }}</span><b>{{ d.v }}%</b></div>
            <div class="progress"><span :style="{ width: d.v + '%' }"></span></div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useUi } from '@/composables/ui'
import { useRows } from '@/composables/tables'
import { nowText } from '@/utils/format'
import CrudPage from '@/components/pages/CrudPage.vue'
import Icon from '@/components/Icon.vue'

function kpiIcon(label = '') {
  if (/卡片/.test(label)) return 'card'
  if (/问答/.test(label)) return 'chat'
  if (/图谱|关系/.test(label)) return 'graph'
  if (/接口|服务/.test(label)) return 'plugin'
  if (/算法|模型/.test(label)) return 'model'
  if (/任务|对接/.test(label)) return 'flow'
  if (/准确|率|评估/.test(label)) return 'chart'
  if (/文档|报告|资源|数据/.test(label)) return 'folder'
  return 'chart'
}

const props = defineProps({ page: Object, title: String })
const { toast } = useUi()

const tab = ref('文本解析')
const parseTabs = ['文本解析', '图像解析', '表格解析']
const parsePoints = computed(() => ({
  文本解析: ['关键信息精准提取：机型、指标、数值、标准编号', '段落主旨归纳：按章节生成摘要与目录', '语义关系识别：指标与数值、项目与方法', '中英文双语，支持印刷体、繁体与手写体上下文'],
  图像解析: ['OCR 识别图像中的文字与图形', '标准印刷体及有线表格准确率不低于 95%', '单张图片支持 30 MB 以上', '解析时间每 MB 不大于 10 秒'],
  表格解析: ['识别行列关系与单元格内容', '不可编辑表格转为结构化数据', '复杂表格保留表头层级', '结果可回写指标抽取'],
}[tab.value]))

const engines = reactive([
  { name: '领域多模态大模型', vendor: '中科智算 · V3.2', on: true, type: '多模态理解', acc: '92.4%', lang: '中文 / 英文', cap: '文本解析、语义关系识别' },
  { name: '文档OCR识别引擎', vendor: '华光识图 · V5.1', on: true, type: '文字识别', acc: '95.6%', lang: '中文 / 英文 / 繁体 / 手写体', cap: '图像文字、复杂表格' },
  { name: '语音转写ASR引擎', vendor: '讯飞聆声 · V4.0', on: true, type: '语音识别', acc: '86.2%', lang: '中文', cap: '试验音视频转写，准确率不低于 85%' },
  { name: '表格结构识别引擎', vendor: '格致表格 · V2.6', on: false, type: '结构识别', acc: '94.1%', lang: '中文 / 英文', cap: '行列识别、不可编辑表格转换' },
])

const rules = reactive([
  { name: '页眉页脚页码剔除', target: '去除版式噪声', on: true },
  { name: '乱码与特殊符号清理', target: '文本可用性修复', on: true },
  { name: '单位与术语归一', target: '统一 kW、kN、r/min', on: true },
  { name: '重复段落合并', target: '结构整合', on: true },
])
const cleanRes = ref('东方红-LF2204轮式拖拉机定型试验报告')
const cleanLogs = ref([
  { res: '东方红-LF2204轮式拖拉机定型试验报告', rule: '页眉页脚页码剔除', n: '126 处', time: '2026-10-09 14:06' },
  { res: 'NY/T 2090-2025', rule: '单位与术语归一', n: '38 处', time: '2026-10-10 09:18' },
])
function runClean() {
  cleanLogs.value.unshift({ res: cleanRes.value, rule: '已启用规则', n: '54 处', time: nowText() })
  toast('清洗完成，噪声已剔除并完成归一')
}

const fmt = ref('JSON')
const exportDocs = ['东方红-LF2204定型试验报告', '雷沃谷神4LZ-8鉴定大纲', 'NY/T 2090-2025', 'DG/T 001-2025']

const fieldMap = {
  extract: [
    { key: 'name', label: '抽取条目', required: true, placeholder: '如：动力性能指标' },
    { key: 'scope', label: '文档范围', options: ['定型试验报告', '鉴定大纲', '原始记录'] },
    { key: 'kind', label: '内容类型', options: ['性能指标', '技术参数', '试验结论'] },
    { key: 'fmt', label: '结果格式', options: ['结构化字段', 'JSON', '表格'] },
    { key: 'note', label: '抽取说明', type: 'textarea' },
  ],
  graphUpload: [
    { key: 'name', label: '构建任务', required: true },
    { key: 'mode', label: '构建方式', type: 'radio', options: ['表格构建', '文本构建'] },
    { key: 'file', label: '数据说明', placeholder: '批量上传文件名' },
    { key: 'dict', label: '字典推荐', options: ['启用', '关闭'] },
  ],
  sft: [
    { key: 'name', label: '数据配置任务', required: true },
    { key: 'src', label: '源数据集', options: ['定型报告语料-2026Q3', '指标抽取指令集', '标准条款问答对'] },
    { key: 'need', label: '需求描述', type: 'textarea' },
    { key: 'tag', label: '自动标签', placeholder: '拖拉机,指标' },
  ],
}
const defaultFields = [
  { key: 'name', label: '资源名称', required: true, placeholder: '如：东方红-LF2204轮式拖拉机定型试验报告' },
  { key: 'cat', label: '资源类别', required: true, options: ['定型资料', '历史试验数据', '标准规范', '专业文献'] },
  { key: 'fmt', label: '文件格式', required: true, options: ['DOCX', 'PDF', 'TXT', 'XLSX', 'JPG', 'PNG', 'MP4', 'MP3', 'CSV'] },
  { key: 'modal', label: '数据模态', options: ['文本', '图像', '表格', '音视频'] },
  { key: 'size', label: '文件大小（MB）', placeholder: '如：36.5' },
  { key: 'pages', label: '页数', placeholder: '如：128' },
  { key: 'mode', label: '解析模式', type: 'radio', options: ['即时解析', '暂存'] },
]
const fields = computed(() => fieldMap[props.page.entryKey] || defaultFields)
const form = reactive({ mode: '即时解析' })
function resetForm() { Object.keys(form).forEach((k) => delete form[k]); form.mode = '即时解析' }
const formTitle = computed(() => props.page.entryKey === 'extract' ? '抽取条目配置' : props.page.entryKey === 'sft' ? '微调数据配置' : '资源信息登记')
const sideNote = '提交后写入对应数据目录。即时解析会生成解析任务；暂存仅入库。批量场景支持不少于 50 篇、总容量不少于 500 MB。'
const notes = ['单文档支持 100 MB、1000 页以上', '图片支持 30 MB 以上', '音视频支持 100 MB 以上', '中英文双语解析']

// 批量导入清单
const importList = ref([])

function addToList() {
  if (fields.value.some((f) => f.required && !form[f.key])) { toast('请填写必填项'); return }
  importList.value.push({
    name: form.name,
    cat: form.cat || '定型资料',
    fmt: form.fmt || 'PDF',
    modal: form.modal || '文本',
    size: form.size || '—',
    pages: form.pages || '—',
    mode: form.mode || '即时解析',
  })
  toast('已加入导入清单')
  resetForm()
}

function commitList() {
  if (!importList.value.length) { toast('导入清单为空'); return }
  if (props.page.dataset) {
    const rows = useRows(props.page.dataset)
    importList.value.forEach((item) => {
      rows.unshift({
        name: item.name, cat: item.cat, fmt: item.fmt, modal: item.modal,
        size: item.size === '—' ? '—' : item.size + ' MB',
        pages: item.pages, status: item.mode === '即时解析' ? '解析中' : '暂存',
        by: 'Mona', time: nowText(),
      })
    })
  }
  toast(`成功录入 ${importList.value.length} 项资源，已进入数据资源目录`)
  importList.value = []
}

function submitEntry() {
  if (fields.value.some((f) => f.required && !form[f.key])) { toast('请填写必填项'); return }
  if (props.page.dataset) {
    const rows = useRows(props.page.dataset)
    rows.unshift({ name: form.name || '新建记录', cat: form.cat || '定型资料', fmt: form.fmt || 'PDF', modal: form.modal || '文本', size: (form.size || '10') + (String(form.size || '').includes('MB') ? '' : ' MB'), pages: form.pages || '—', status: form.mode === '暂存' ? '暂存' : '解析中', by: 'Mona', time: nowText(), value: '—', unit: '—', machine: '东方红-LF2204', source: '新录入', page: '—', score: '—', stage: '性能试验鉴定', docs: '新归集', state: '待整理', updated: nowText() })
  }
  toast('已提交，可在目录中查看')
  resetForm()
}

const docs = [
  { id: 'a', name: '东方红-LF2204轮式拖拉机定型试验报告' },
  { id: 'b', name: '雷沃谷神4LZ-8鉴定大纲' },
]
const docId = ref('a')
const chapters = reactive([
  { id: 'c1', title: '第一章 概述', tag: '已确认', body: '说明试验目的与依据。对东方红-LF2204开展定型试验。' },
  { id: 'c2', title: '第二章 试验条件', tag: '已确认', body: '洛阳拖拉机试验场，300 kN 负荷车，电涡流测功机。' },
  { id: 'c3', title: '第三章 性能试验结果', tag: '待审核', body: '标定功率 162 kW，牵引力 38.6 kN，滑转率 8.2%。' },
  { id: 'c4', title: '第四章 可靠性试验', tag: '待审核', body: '累计 750 h，MTBF 375 h。' },
])
const cur = ref(chapters[2])

const graphs = {
  resume: {
    nodes: [
      { id: 'm', label: '东方红-LF2204', type: '农业机械', x: 380, y: 250, color: '#0d4e83', detail: '轮式拖拉机，技术状态 B2，定型试验已完成。' },
      { id: 'i', label: '标定功率 162 kW', type: '性能指标', x: 180, y: 120, color: '#d0ab68', detail: '来源定型报告 P.17，已人工确认。' },
      { id: 't', label: '牵引性能试验', type: '试验', x: 580, y: 130, color: '#3f88bd', detail: '混凝土路面，最大牵引力 38.6 kN。' },
      { id: 'e', label: '滑转率归零', type: '事件', x: 600, y: 360, color: '#d48806', detail: '配重调整后复测合格。' },
      { id: 's', label: 'DG/T 001-2025', type: '标准规范', x: 170, y: 380, color: '#2f9e62', detail: '轮式拖拉机鉴定技术规范。' },
    ],
    edges: [['m', 'i'], ['m', 't'], ['t', 'e'], ['t', 's'], ['m', 's']],
  },
  schema: {
    nodes: [
      { id: 'a', label: '农业机械', type: '节点类型', x: 380, y: 80, color: '#0d4e83', detail: '属性：型号、类别、企业。' },
      { id: 'b', label: '性能指标', type: '节点类型', x: 160, y: 240, color: '#d0ab68', detail: '关系：农业机械—具备指标。' },
      { id: 'c', label: '试验', type: '节点类型', x: 380, y: 400, color: '#3f88bd', detail: '关系：开展试验、依据标准。' },
      { id: 'd', label: '事件', type: '节点类型', x: 600, y: 240, color: '#d48806', detail: '内置因果、条件、组成。' },
    ],
    edges: [['a', 'b'], ['a', 'c'], ['c', 'd'], ['b', 'c']],
  },
  probe: {
    nodes: [
      { id: 'p', label: '牵引力滑转探针', type: '探针', x: 380, y: 250, color: '#0d4e83', detail: '定位维度：指标关系。关注牵引力与滑转率。' },
      { id: 'q', label: '滑转率 8.2%', type: '指标值', x: 170, y: 140, color: '#d0ab68', detail: '实测值，接近关注阈值。' },
      { id: 'r', label: '配重不足', type: '原因', x: 590, y: 140, color: '#c4472d', detail: '历史同类问题的根因。' },
      { id: 'u', label: '调整配重', type: '措施', x: 560, y: 380, color: '#2f9e62', detail: '专家经验：前配重增加后复测。' },
    ],
    edges: [['p', 'q'], ['p', 'r'], ['r', 'u']],
  },
  resource: {
    nodes: [
      { id: 'a', label: '牵引试验', type: '试验', x: 380, y: 240, color: '#0d4e83', detail: '历史高频试验项目。' },
      { id: 'b', label: '300 kN 负荷车', type: '设备', x: 180, y: 120, color: '#3f88bd', detail: '聚类：牵引加载。' },
      { id: 'c', label: '混凝土跑道', type: '场地', x: 590, y: 130, color: '#d0ab68', detail: '洛阳 1.2 km 标准路面。' },
      { id: 'd', label: '电涡流测功机', type: '仪器', x: 220, y: 390, color: '#2f9e62', detail: '0–250 kW，用于 PTO。' },
    ],
    edges: [['a', 'b'], ['a', 'c'], ['a', 'd']],
  },
  tech: {
    nodes: [
      { id: 'a', label: '传动控制', type: '技术簇', x: 380, y: 230, color: '#0d4e83', detail: '三级体系中的技术原理层。' },
      { id: 'b', label: '无级变速匹配', type: '创新点', x: 160, y: 110, color: '#d0ab68', detail: '牵引功率提高约 6%。' },
      { id: 'c', label: '收获损失控制', type: '技术簇', x: 590, y: 140, color: '#3f88bd', detail: '剥皮与清选相关。' },
      { id: 'd', label: '变量施药', type: '创新点', x: 560, y: 370, color: '#2f9e62', detail: '药液减量约 12%。' },
    ],
    edges: [['a', 'b'], ['a', 'c'], ['c', 'd']],
  },
}
const graph = computed(() => graphs[props.page.graphKey] || graphs.resume)
const graphNodes = computed(() => graph.value.nodes)
function nodeHit(n) {
  const q = gkey.value.trim()
  if (!q) return false
  return `${n.label}${n.type}`.includes(q)
}
const graphEdges = computed(() => graph.value.edges)
const nodeMap = computed(() => Object.fromEntries(graph.value.nodes.map((n) => [n.id, n])))
const activeNode = ref(graphs.resume.nodes[0])
const gkey = ref('')
watch(graph, (g) => { activeNode.value = g.nodes[0]; gkey.value = '' }, { immediate: true })
watch(gkey, (q) => {
  const hit = graphNodes.value.find((n) => `${n.label}${n.type}`.includes(q.trim()))
  if (q.trim() && hit) activeNode.value = hit
})

const chatBank = {
  kg: {
    topics: ['标定功率问答', '滑转率判定', '可靠性计算'],
    suggests: ['LF2204标定功率是多少？', '滑转率依据哪条标准？', 'MTBF如何计算？'],
    reply: (q) => {
      if (q.includes('滑转')) return { text: '东方红-LF2204 混凝土路面最大牵引力对应滑转率为 8.2%。判定依据为 DG/T 001-2025 牵引性能条款。', src: '定型试验报告 P.36；DG/T 001-2025' }
      if (q.includes('MTBF') || q.includes('可靠')) return { text: '可靠性试验累计作业 750 h，一般故障 2 次，MTBF = 375 h，满足定型要求。', src: '五征/东方红可靠性记录；NY/T 2090-2025' }
      return { text: '东方红-LF2204 发动机标定功率为 162 kW，动力输出轴功率 138.5 kW，标定转速 540/1000 r/min。', src: '定型试验报告 P.17' }
    },
  },
  cause: {
    topics: ['滑转率偏高', '收获损失波动', '早期故障'],
    suggests: ['为什么滑转率偏高？', '给出复测建议'],
    reply: () => ({ text: '根因倾向为前配重不足，导致驱动轮滑转升高。历史探针“牵引力滑转耦合”给出相同结论。建议增加前配重后按原工况复测牵引力-滑转曲线。', src: '探针推理图谱 · 专家经验 2026-06' }),
  },
  scheme: {
    topics: ['LF2204 补充试验', '4LZ-8 收获方案'],
    suggests: ['补充低速档牵引因子', '把样本量调到 24'],
    reply: (q) => ({ text: `已按「${q || '补充约束'}」调整方案：保留 PTO、牵引、制动、噪声四组必做项目，牵引因子增至低速三档，总因子 24 个，与轮拖定型模板一致。`, src: '轮式拖拉机定型试验方案模板 V2.1' }),
  },
  code: {
    topics: ['PTO 计算脚本', '滑转率拟合'],
    suggests: ['检查除零', '补充转速单位换算'],
    reply: () => ({ text: '语法检查通过。逻辑上滑转率计算应使用理论速度与实际速度之差除以理论速度，当前草稿把分母写成了实际速度，建议修正后再跑一组 8.2% 的已知样例。', src: '编码纠错智能体' }),
  },
  recommend: {
    topics: ['补充牵引试验', '收获损失试验'],
    suggests: ['只要洛阳场地', '测功机需要 200 kW 以上'],
    reply: () => ({ text: '在余弦相似度与欧氏距离两类算法下，优先推荐 300 kN 负荷车和洛阳混凝土跑道，相似度 0.93，可溯源至 2024 年大马力轮拖定型案例。', src: '试验资源图谱' }),
  },
  draft: {
    topics: ['性能试验大纲', '呈批件'],
    suggests: ['生成大纲提纲', '把话术改成请示'],
    reply: () => ({ text: '已按鉴定大纲模板生成提纲：1 任务来源 2 试验对象 3 试验项目与指标 4 条件与仪器 5 方法 6 数据处理 7 判定准则。术语已校准为“动力输出轴功率”“滑转率”。', src: '术语库 · 动力性能' }),
  },
  rule: {
    topics: ['一致性规则', '章节完整性'],
    suggests: ['报告数值必须回链大纲', '关联 DG/T 001'],
    reply: () => ({ text: '已生成规则：若性能试验报告中的指标数值与性能试验大纲不一致，且偏差超过允差，则判定为强制性跨文档冲突，并引用 DG/T 001 对应条款作为依据。', src: '审查规则库' }),
  },
  prompt: {
    topics: ['指标抽取提示', '审查提示'],
    suggests: ['生成收获机械抽取提示'],
    reply: () => ({ text: '未命中完全匹配的预制模板，已生成新模板：角色为鉴定指标抽取员，输出 JSON 字段 machine、indicator、value、unit、page、standard，禁止编造未出现的数值。', src: '提示词生成智能体' }),
  },
  debug: {
    topics: ['Qwen32B 调试', 'GLM32B 调试'],
    suggests: ['温度 0.2 抽取功率', 'Top P 0.8'],
    reply: () => ({ text: '当前参数 temperature=0.2，top_p=0.8，top_k=40。输出：发动机标定功率 162 kW。与标准答案一致。', src: '在线调试 · 鉴定-Qwen32B-v3' }),
  },
  kb: {
    topics: ['本周问答', '个人知识库'],
    suggests: ['定型鉴定和推广鉴定有何区别？', '把上一问改得更具体'],
    reply: (q) => ({ text: q.includes('区别') ? '定型鉴定验证新产品是否达到鉴定大纲和标准规定的性能、安全性与可靠性；推广鉴定侧重在用或拟推广机型的适用性评价。两者依据的大纲深度不同。' : '已根据上一轮上下文补充：若针对轮式拖拉机，定型需覆盖动力、牵引、制动、噪声与可靠性。', src: '领域通识库 · NY/T 2090-2025' }),
  },
}
const bank = computed(() => chatBank[props.page.chatKey] || chatBank.kg)
const topics = computed(() => bank.value.topics)
const topic = ref(bank.value.topics[0])
const suggests = computed(() => bank.value.suggests)
const messages = ref([{ role: 'bot', text: '可以围绕试验指标、标准条款或方案约束提问，回答会附带引用。', src: '' }])
const input = ref('')
function ask(q) {
  const text = (q || '').trim()
  if (!text) return
  messages.value.push({ role: 'user', text })
  const ans = bank.value.reply(text)
  messages.value.push({ role: 'bot', ...ans })
  input.value = ''
}

const lang = ref('Python')
const codeLangs = computed(() => props.page.codeKey === 'json' ? ['JSON'] : ['Python', 'C++', 'MATLAB'])
const codeHtml = computed(() => {
  if (props.page.codeKey === 'json') {
    return `{
  <span class="kw">"innovation"</span>: <span class="str">"双行星排无级变速匹配牵引工况"</span>,
  <span class="kw">"subject"</span>: <span class="str">"传动系统"</span>,
  <span class="kw">"action"</span>: <span class="str">"匹配优化"</span>,
  <span class="kw">"effect"</span>: <span class="str">"牵引功率提高 6%"</span>,
  <span class="kw">"scene"</span>: <span class="str">"轮式拖拉机牵引试验"</span>
}`
  }
  const map = {
    Python: `<span class="kw">def</span> slip_ratio(v_theory, v_actual):\n    <span class="cmt"># 滑转率 = (理论速度 - 实际速度) / 理论速度</span>\n    <span class="kw">return</span> (v_theory - v_actual) / v_theory\n\n<span class="cmt"># 东方红-LF2204 混凝土路面样例，期望约 0.082</span>\nprint(slip_ratio(<span class="str">2.44</span>, <span class="str">2.24</span>))`,
    'C++': `<span class="kw">double</span> slipRatio(<span class="kw">double</span> vTheory, <span class="kw">double</span> vActual) {\n  <span class="cmt">// 避免理论速度为 0</span>\n  <span class="kw">if</span> (vTheory &lt;= 0) <span class="kw">return</span> 0;\n  <span class="kw">return</span> (vTheory - vActual) / vTheory;\n}`,
    MATLAB: `<span class="kw">function</span> s = slipRatio(vTheory, vActual)\n<span class="cmt">% 牵引试验滑转率</span>\ns = (vTheory - vActual) ./ vTheory;\n<span class="kw">end</span>`,
  }
  return map[lang.value] || map.Python
})

const radarRows = [
  { name: '打击（作业效能）', score: '86', basis: '标定功率、PTO 功率达到大纲' },
  { name: '机动', score: '82', basis: '牵引通过与滑转率满足限值' },
  { name: '防护', score: '78', basis: '制动、噪声、安全防护合格' },
  { name: '可靠性', score: '90', basis: 'MTBF 375 h' },
  { name: '作业效率', score: '84', basis: '牵引功率 118.4 kW' },
]

const timeline = [
  { t: '2025-11-02', title: '设计冻结 B2', text: 'PTO 传动比确定，覆盖 540/1000 r/min。依据设计任务书。' },
  { t: '2026-03-12', title: '性能变更', text: '补充双转速动力输出，技术状态由 B1 升至 B2。' },
  { t: '2026-06-18', title: '问题归零', text: '牵引试验滑转率偏高，调整配重后复测合格。' },
  { t: '2026-08-02', title: '可靠性节点', text: '累计作业 750 h，一般故障 2 次。' },
  { t: '2026-10-08', title: '定型报告归档', text: '报告完成解析与指标确认，进入成果验收。' },
]

const flows = {
  probe: [
    { title: '读取探针', text: '牵引力滑转耦合', detail: '加载探针的应用范围、定位维度和关注信号。' },
    { title: '对齐文档', text: '总案 / 大纲 / 报告', detail: '在三份文书中定位牵引力、滑转率及其限值。' },
    { title: '异常定位', text: '滑转率贴近阈值', detail: '实测 8.2%，标记为需关注的异常指标，节点为牵引性能试验。' },
    { title: '合规风险', text: '复测记录不完整', detail: '归零过程有结论，原始复测曲线附件缺失，列为潜在合规风险。' },
    { title: '输出依据', text: '图谱 + 条款', detail: '依据历史探针、专家措施和 DG/T 001 牵引条款生成思维链。' },
  ],
  reason: [
    { title: '问句理解', text: '意图识别', detail: '识别用户问的是指标事实、原因还是时间变化。' },
    { title: '溯源分析', text: '回链原文', detail: '定位指标所在报告页码和标准条款。' },
    { title: '推理分析', text: '规则判断', detail: '用阈值和关系判断是否满足鉴定要求。' },
    { title: '关联分析', text: '指标—试验—事件', detail: '沿知识图谱展开相关实体。' },
    { title: '时序 / 时空', text: '状态变化', detail: '比较技术状态阶段，并关联试验场地与时间。' },
  ],
  docs: [
    { title: '研制总要求', text: '指标源头', detail: '提出战技指标和功能要求，向下游传递。' },
    { title: '试验总案', text: '任务分解', detail: '把指标拆成试验项目和时间节点。' },
    { title: '性能试验大纲', text: '方法细化', detail: '明确方法、样本量、仪器和判定准则。' },
    { title: '性能试验报告', text: '结果回写', detail: '用实测值响应大纲，差异需可解释。' },
  ],
  review: [
    { title: '语义规则', text: '条款符合性', detail: '按已发布规则检查必需要素和数值。' },
    { title: '本体逻辑', text: '概念约束', detail: '校验指标、项目、时间节点的关系是否闭合。' },
    { title: '图谱推理', text: '跨文档', detail: '在六类文书间比对同一实体。' },
    { title: '策略组合', text: '自适应', detail: '定型审查启用一致性+完整性+术语三项策略。' },
    { title: '结果回写', text: '批注与建议', detail: '问题分级，并绑定依据。' },
  ],
}
const flowNodes = computed(() => flows[props.page.flowKey] || flows.probe)
const flowOn = ref(flowNodes.value[0])

const canvases = {
  agent: [
    { title: '问题分类', sub: '组件', x: 30, y: 40, input: 'query', output: 'intent', detail: '区分指标问答、方案生成和审查三类问题。' },
    { title: '知识检索', sub: '组件', x: 220, y: 40, input: 'intent', output: 'passages', detail: '调用资源库统一接口召回证据。' },
    { title: '条件分支', sub: '组件', x: 410, y: 40, input: 'intent', output: 'branch', detail: '审查类走冲突比对，其余走抽取。' },
    { title: '文档提取', sub: '组件', x: 220, y: 180, input: 'fileId', output: 'blocks', detail: '调用解析模块获取章节。' },
    { title: '参数提取', sub: '组件', x: 410, y: 180, input: 'blocks', output: 'indicators', detail: '按指标模式抽取数值。' },
    { title: '代码执行', sub: '组件', x: 600, y: 180, input: 'indicators', output: 'judge', detail: '计算是否超出允差。' },
    { title: 'HTTP 请求', sub: '组件', x: 410, y: 320, input: 'payload', output: 'response', detail: '回写业务系统。' },
  ],
  entity: [
    { title: '战技指标', sub: '实体', x: 40, y: 60, input: '总要求/大纲', output: '指标实体', detail: '抽取名称、数值、单位、允差。' },
    { title: '试验项目', sub: '实体', x: 250, y: 60, input: '大纲/报告', output: '项目实体', detail: '抽取方法与样本量。' },
    { title: '验证', sub: '约束', x: 250, y: 210, input: '项目 → 指标', output: '关系', detail: '方向：项目验证指标，禁止反向缺失。' },
    { title: '时间节点', sub: '实体', x: 460, y: 60, input: '总案', output: '节点', detail: '计划时间不得晚于报告形成时间。' },
  ],
  review: [
    { title: '任务规划', sub: '智能体', x: 40, y: 80, input: '审查目标', output: '步骤', detail: '自主规划单文档或跨文档路径。' },
    { title: '术语技能包', sub: '技能', x: 240, y: 40, input: '正文', output: '术语问题', detail: '加载术语一致性技能。' },
    { title: '数值技能包', sub: '技能', x: 240, y: 180, input: '指标', output: '冲突', detail: '比对六类文书中的同一指标。' },
    { title: '人工确认', sub: '交互', x: 460, y: 110, input: '问题清单', output: '复核意见', detail: '审查人员可改判等级。' },
  ],
}
const canvasNodes = computed(() => canvases[props.page.canvasKey] || canvases.agent)
const canvasOn = ref(canvasNodes.value[0])
const canvasLinks = computed(() => canvasNodes.value.slice(0, -1).map((n, i) => [n, canvasNodes.value[i + 1]]))

const cardSets = {
  knowledge: [
    { tag: '平台卡片', title: '轮式拖拉机动力指标', text: '汇总标定功率、PTO 功率、标定转速的常见问法与标准出处。' },
    { tag: '平台卡片', title: '牵引性能鉴定方法', text: '牵引力、滑转率、牵引功率的试验条件与判定要点。' },
    { tag: '个人卡片', title: '我的收获机械问答', text: '基于当前账号近期提问，聚合总损失率、含杂率、破碎率。' },
    { tag: '参数卡片', title: '东方红-LF2204', text: '162 kW / 38.6 kN / MTBF 375 h，可跳转原文。' },
    { tag: '方法卡片', title: '可靠性试验', text: '有效度、故障分类和 MTBF 计算步骤。' },
    { tag: '个人卡片', title: '待核对指标', text: '滑转率、播种合格率仍处于待审核。' },
  ],
  modalPref: [
    { tag: '文本', title: '要点与关系', text: '提取章节主旨、指标与数值、项目与方法的语义关系。' },
    { tag: '图像', title: '文字与图形', text: '识别铭牌、曲线图坐标和表格截图。' },
    { tag: '视频', title: '事件导览', text: '按作业过程切分事件，标记异常片段。' },
    { tag: '跨模态', title: '对照策略', text: '同一指标在文本、表格、影像中的值必须可对齐。' },
  ],
  fusion: [
    { tag: '推荐', title: '东方红 LF2204 / LX2204', text: '型号相近，建议融合为企业产品系列，保留各自试验。' },
    { tag: '推荐', title: '滑转率 / 打滑率', text: '术语同义，融合到规范名“滑转率”。' },
    { tag: '预览', title: '融合后节点', text: '指标节点减少 2 个，关系保持可追溯。' },
  ],
  layers: [
    { tag: '原始库', title: '未处理资料', text: '定型报告、扫描件、影像按原样保存，容量计入 10 TB 以上资源池。' },
    { tag: '基础库', title: '结构化解析', text: '章节、表格、实体和指标，可供抽取与审查复用。' },
    { tag: '推理库', title: '二次分析', text: '图谱、问答对、审查结论和创新点，服务智能体。' },
  ],
  trainParam: [
    { tag: '默认', title: '训练集 90%', text: '测试集 10%，适用于指标抽取指令数据。' },
    { tag: '默认', title: 'LoRA rank 16', text: '学习率 1e-4，可在微调系统中覆盖。' },
    { tag: '手动', title: '长文审查', text: '建议降低批大小，保留更长上下文。' },
  ],
  judgeTpl: [
    { tag: '决策层', title: '年度技术研判', text: '含成熟度、趋势、优先级、高价值方向。' },
    { tag: '专业组', title: '拖拉机专题', text: '按传动、液压、电控三条技术原理展开。' },
    { tag: '项目', title: '立项查重简报', text: '八个维度的相似度对照表。' },
  ],
}
const cardList = computed(() => cardSets[props.page.cardKey] || cardSets.knowledge)

const papers = {
  compare: {
    title: '东方红-LF2204 技术状态阶段对比',
    meta: 'B1（2025-11）  →  B2（2026-03）  →  定型（2026-10）',
    sections: [
      { h: '变更内容', p: 'B2 增加 1000 r/min 动力输出转速，传动比调整，其余整机布置保持不变。' },
      { h: '影响分析', p: 'PTO 试验需覆盖双转速；牵引性能限值不变。滑转率问题已归零，不改变定型结论。' },
      { h: '原文回溯', p: '设计任务书第 4 章、定型报告第 3 章、问题归零单 Q-2026-0618。' },
    ],
  },
  topic: {
    title: '轮式拖拉机牵引性能专题',
    meta: '个性化专题 · 依据 Mona 近期问答生成 · 可下载',
    sections: [
      { h: '一、指标定义', p: '牵引力、滑转率、牵引功率构成牵引性能的基本观测项。' },
      { h: '二、LF2204 实测', p: '最大牵引力 38.6 kN，滑转率 8.2%，牵引功率 118.4 kW。' },
      { h: '三、方法要点', p: '混凝土路面、规定配重、负荷车加载。多媒体：牵引曲线图、现场影像片段。' },
    ],
  },
  probe: {
    title: '牵引力滑转异常解读报告',
    meta: '探针：牵引力滑转耦合 · 2026-10-18',
    sections: [
      { h: '异常描述', p: '滑转率在最大牵引力点达到 8.2%，高于该场地历史均值。' },
      { h: '根因', p: '前配重不足。图谱中 2024 年同类机型有相同路径。' },
      { h: '处置', p: '增加前配重并复测。复测后滑转率回落，问题归零。' },
    ],
  },
  scheme: {
    title: 'LF2204 轮式拖拉机定型试验方案（初稿）',
    meta: '模板 V2.1 · 试验因子 24 个 · 可编辑',
    sections: [
      { h: '1 试验依据', p: 'NY/T 2090-2025、DG/T 001-2025，以及研制总要求中的动力、牵引、安全指标。' },
      { h: '2 因子设计', p: '覆盖转速、负荷、挡位、配重、路面、环境温度等 24 个因子，不少于指标要求的 20 个。' },
      { h: '3 资源', p: '300 kN 负荷车、电涡流测功机、洛阳混凝土跑道。' },
    ],
  },
  outline: {
    title: '性能试验大纲提纲',
    meta: '已做术语校准',
    sections: [
      { h: '1 任务来源', p: '依据试验总案和研制总要求。' },
      { h: '2 试验项目', p: '动力输出、牵引、制动、噪声、可靠性。' },
      { h: '3 判定准则', p: '指标数值不得低于总要求，方法符合 DG/T 001。' },
    ],
  },
  std: {
    title: 'DG/T 001-2025 审查要点',
    meta: '自动解析结果',
    sections: [
      { h: '结构', p: '范围、规范性引用文件、术语、试验条件、试验方法、判定规则。' },
      { h: '审查要点', p: '动力、牵引、安全、可靠性章节不得缺失；数值须带单位。' },
    ],
  },
  api: {
    title: '统一数据与模型服务接口',
    meta: '供智能体和业务平台调用',
    sections: [
      { h: 'GET /kb/passages', p: '按知识库、分类和语义检索高精度参考片段，返回原文位置。' },
      { h: 'POST /model/chat', p: '指定模型版本、温度、Top P、Top K，返回生成结果与置信度。' },
      { h: 'POST /agent/run', p: '按智能体标识执行已发布工作流，返回结构化结果。' },
    ],
  },
  review: {
    title: 'LF2204 定型文件一致性审查报告',
    meta: '问题 7 项 · 高 2 · 中 3 · 低 2',
    sections: [
      { h: '审查逻辑', p: '先抽取六类文书实体，再按一致性、完整性、术语三条策略联合推理。' },
      { h: '主要问题', p: '报告牵引力 36.2 kN 与大纲 38 kN 不一致；大纲缺少环境条件章节。' },
      { h: '溯源', p: '依据：跨文档一致性规则 V1.4；原文位于大纲 P.12 与报告 P.36。' },
    ],
  },
  tree: {
    title: '三级技术体系',
    meta: '技术原理 / 试验类型 / 应用领域',
    sections: [
      { h: '传动与控制', p: '无级变速、牵引滑转控制、负荷传感液压。对应牵引试验与 PTO 试验。' },
      { h: '收获损失', p: '割台、脱粒、剥皮、清选。对应田间收获试验。' },
      { h: '变量作业', p: '施药决策、播种监测。对应植保与播种试验。' },
    ],
  },
  judge: {
    title: '拖拉机传动技术研判报告',
    meta: '模板：年度技术研判 · 决策层',
    sections: [
      { h: '技术成熟度', p: '机械传动成熟，无级变速与滑转闭环控制处于工程化验证阶段。' },
      { h: '趋势', p: '电控传动与作业质量闭环是高价值方向。' },
      { h: '优先级', p: '建议优先安排牵引滑转控制的鉴定方法研究。' },
    ],
  },
}
const paper = computed(() => papers[props.page.reportKey] || papers.scheme)

const statPack = {
  situation: {
    kpis: [
      { label: '在试任务', value: '6', unit: '项' },
      { label: '占用资源', value: '14', unit: '台套' },
      { label: '异常问题', value: '3', unit: '项' },
      { label: '已出结果', value: '11', unit: '份' },
    ],
    chart: { title: '本周试验任务', data: [['牵引', 4], ['PTO', 3], ['收获', 2], ['可靠', 2], ['安全', 1]] },
    dist: [{ name: '任务', v: 40 }, { name: '资源', v: 35 }, { name: '环境', v: 25 }],
  },
  probe: {
    kpis: [
      { label: '历史探针问题', value: '86', unit: '条' },
      { label: '配重类成因', value: '22', unit: '条' },
      { label: '传感器类', value: '15', unit: '条' },
      { label: '已关闭', value: '71', unit: '条' },
    ],
    chart: { title: '近六月异常趋势', data: [['5月', 9], ['6月', 14], ['7月', 11], ['8月', 8], ['9月', 7], ['10月', 6]] },
    dist: [{ name: '配重与附着', v: 36 }, { name: '仪器', v: 24 }, { name: '操作', v: 22 }, { name: '环境', v: 18 }],
  },
  agent: {
    kpis: [
      { label: '在线智能体', value: '6', unit: '个' },
      { label: 'CPU', value: '37', unit: '%' },
      { label: '内存', value: '52', unit: '%' },
      { label: '调度时延', value: '1.6', unit: 's' },
    ],
    chart: { title: '今日调用', data: [['抽取', 120], ['审查', 80], ['问答', 96], ['方案', 34], ['探针', 28]] },
    dist: [{ name: '成功', v: 96 }, { name: '超时', v: 3 }, { name: '失败', v: 1 }],
  },
  default: {
    kpis: [
      { label: '累计上传', value: '286', unit: '项' },
      { label: '已审核', value: '214', unit: '项' },
      { label: '待审核', value: '37', unit: '项' },
      { label: '存储占用', value: '1.8', unit: 'TB' },
    ],
    chart: { title: '近7日历史上传', data: [['10-13', 18], ['10-14', 26], ['10-15', 15], ['10-16', 32], ['10-17', 22], ['10-18', 12], ['10-19', 20]] },
    dist: [{ name: '定型资料', v: 46 }, { name: '历史试验', v: 28 }, { name: '标准规范', v: 16 }, { name: '专业文献', v: 10 }],
  },
}
const pack = computed(() => statPack[props.page.statsKey] || statPack.default)
const statKpis = computed(() => pack.value.kpis)
const statChart = computed(() => pack.value.chart)
const dist = computed(() => pack.value.dist)
const statMax = computed(() => Math.max(...statChart.value.data.map((d) => d[1])))
</script>
