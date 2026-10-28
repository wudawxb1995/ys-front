<template>
  <div class="rich-type-m19">


      <!-- 根因分析四分屏 -->
      <template v-if="m19Detail">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">
          <span @click="m19Detail=null" style="cursor:pointer;color:#1668a8;font-size:13px;display:flex;align-items:center;gap:4px">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:15px;height:15px"><polyline points="15 18 9 12 15 6"/></svg>
            返回事件列表
          </span>
          <span style="color:#c4cdd6;font-size:13px">/</span>
          <span style="font-size:13px;font-weight:600;color:#1a2b3c">{{ m19Detail.name }}</span>
        </div>

        <div class="m19-board">
          <!-- 上行：摘要｜候选根因（等高对齐） -->
          <div class="m19-top">
            <div class="panel m19-summary">
              <h3 class="m19-card-h"><i></i>异常事件摘要</h3>
              <div class="m19-summary-meta">
                <div class="m19-meta-item">
                  <span class="lab">事件名称</span>
                  <b>{{ m19Detail.name }}</b>
                </div>
                <div class="m19-meta-item">
                  <span class="lab">状态</span>
                  <span class="m19-status" :class="'badge ' + m19Detail.statusClass"><i></i>{{ m19Detail.status }}</span>
                </div>
                <div class="m19-meta-item">
                  <span class="lab">触发探针</span>
                  <em>{{ m19Detail.probe }}</em>
                </div>
                <div class="m19-meta-item">
                  <span class="lab">关联批次</span>
                  <em>D-07（30发）</em>
                </div>
                <div class="m19-meta-item">
                  <span class="lab">发生时间</span>
                  <em>{{ m19Detail.time }}</em>
                </div>
                <div class="m19-meta-item">
                  <span class="lab">异常发次</span>
                  <strong class="warn">第 19 发</strong>
                </div>
              </div>
              <div class="m19-summary-kpis">
                <div class="m19-kpi">
                  <span>立靶高低偏</span>
                  <b class="warn">+0.42 mil</b>
                  <em>判据 ≤ 0.30</em>
                </div>
                <div class="m19-kpi">
                  <span>炮口初速</span>
                  <b class="warn">818.3 m/s</b>
                  <em>下限 820</em>
                </div>
                <div class="m19-kpi">
                  <span>姿态角 pitch</span>
                  <b class="warn">+0.38°</b>
                  <em>阈值 ±0.20°</em>
                </div>
                <div class="m19-kpi">
                  <span>系统温度跳变</span>
                  <b class="warn">+2.1 ℃</b>
                  <em>TH-03 测点</em>
                </div>
              </div>
            </div>

            <div class="panel m19-candidates">
              <h3 class="m19-card-h"><i></i>候选根因排序</h3>
              <div class="m19-cand-list">
                <div
                  v-for="c in candidates"
                  :key="c.rank"
                  class="m19-cand-item"
                  :class="{ top: c.rank === 1 }"
                  @click="openCauseChain(c)"
                >
                  <div class="m19-cand-head">
                    <div class="m19-cand-name">
                      <span class="m19-cand-rank" :class="{ on: c.rank === 1 }">{{ c.rank }}</span>
                      <span>{{ c.name }}</span>
                    </div>
                    <span class="m19-cand-score" :class="c.confidence>=0.7?'hi':c.confidence>=0.4?'mid':'lo'">{{ c.confidence }}</span>
                  </div>
                  <div class="m19-cand-bar">
                    <div :style="{ width: Math.round(c.confidence * 100) + '%', background: c.confidence>=0.7?'#1668a8':c.confidence>=0.4?'#d0ab68':'#c4cdd6' }"></div>
                  </div>
                  <div class="m19-cand-basis">
                    <span>排序依据：</span>{{ c.basis }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 下行：三图联动｜思维链+证据（等高对齐） -->
          <div class="m19-bottom">
            <div class="panel m19-charts">
              <h3 class="m19-card-h m19-charts-h">
                <i></i>多参数可视化联动
                <span class="m19-charts-tip">高亮第 <b>19</b> 发</span>
              </h3>
              <div class="m19-chart-stack">
                <div class="m19-chart-block">
                  <div class="m19-chart-lab">① 姿态角 pitch 时序</div>
                  <div ref="pitchChartEl" class="m19-chart-el"></div>
                </div>
                <div class="m19-chart-block">
                  <div class="m19-chart-lab">② 各发次初速分布</div>
                  <div ref="scatterChartEl" class="m19-chart-el"></div>
                </div>
                <div class="m19-chart-block">
                  <div class="m19-chart-lab">③ 定位定向系统内部温度</div>
                  <div ref="tempChartEl" class="m19-chart-el"></div>
                </div>
              </div>
            </div>

            <div class="panel m19-reason">
              <div class="m19-evidence">
                <h3 class="m19-card-h m19-evidence-h"><i></i>证据面板
                  <span class="m19-charts-tip">{{ evidence.length }} 条</span>
                </h3>
                <div class="m19-evidence-list">
                  <div
                    v-for="e in evidence"
                    :key="e.id"
                    class="m19-evidence-item"
                    :class="{ on: focusEvidence === e.id }"
                    @click="focusEvidence = e.id"
                  >
                    <span class="m19-evidence-id">{{ e.id }}</span>
                    <div class="m19-evidence-body">
                      <div class="txt">{{ e.text }}</div>
                      <div class="src">来源：<span :class="{ link: e.source.includes('D-06') }">{{ e.source }}</span></div>
                      <div class="rel">对应推理链 · {{ evidenceRelLabel(e.relNode) }}</div>
                    </div>
                  </div>
                </div>
                <div class="m19-actions">
                  <button class="btn btn-outline" @click="toast('暂未实现该功能', 'warning')">导入证据</button>
                  <button class="btn btn-primary" :disabled="m19GenerationStatus!=='idle'" @click="doM19ConfirmRootCause">采纳根因 &amp; 生成报告</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <el-dialog v-model="chainOpen" title="推理思维链" width="1080px" align-center class="m19-chain-dialog">
          <div class="mm">
            <svg class="mm-lines" viewBox="0 0 1000 440" aria-hidden="true">
              <g v-for="(link, index) in mindLinks" :key="link.id">
                <path class="track" :d="link.d" :class="{ hot: mindLinkHot(link), dim: !mindLinkHot(link) }" />
                <path
                  class="flow"
                  :d="link.d"
                  :class="{ hot: mindLinkHot(link), dim: !mindLinkHot(link) }"
                  :style="{ animationDelay: `${index * -0.22}s` }"
                />
              </g>
            </svg>
            <button
              v-for="node in mindNodes"
              :key="node.id"
              type="button"
              class="mm-node"
              :class="[node.kind, { on: mindId === node.id, dim: mindDim(node.id) }]"
              :style="{ left: node.x + 'px', top: node.y + 'px', width: node.w + 'px' }"
              @click="mindId = node.id"
            >
              <em>{{ node.layer }}</em>
              <b>{{ node.label }}</b>
              <span>{{ node.value }}</span>
            </button>
          </div>
          <div class="mm-detail">
            <div>
              <b>{{ mindActive.label }}</b>
              <em>{{ mindActive.layer }}</em>
              <p>{{ mindActive.detail }}</p>
            </div>
            <div v-if="mindEvidence.length" class="mm-evid">
              <span v-for="item in mindEvidence" :key="item.id">
                <i>{{ item.id }}</i>{{ item.text }}
                <small>{{ item.source }}</small>
              </span>
            </div>
          </div>
        </el-dialog>
      </template>

      <!-- 异常事件列表页 -->
      <template v-else>
        <div style="height:8px"></div>
        <div class="crud-body">
          <!-- 筛选栏 -->
          <div class="filter-bar filter-panel">
            <div class="field" style="width:200px">
              <label>事件名称</label>
              <input v-model="m19FilterName" placeholder="请输入" />
            </div>
            <div class="field" style="width:200px">
              <label>触发探针</label>
              <select-field v-model="m19FilterProbe"
                :options="[{value:'',label:'全部探针'},{value:'P01',label:'弹着点散布探针 P01'},{value:'P07',label:'遥测信号探针 P07'},{value:'P04',label:'身管温度探针 P04'}]"
                placeholder="全部探针" />
            </div>
            <div class="field" style="width:150px">
              <label>状态</label>
              <select-field v-model="m19FilterStatus"
                :options="[{value:'',label:'全部状态'},{value:'已分析',label:'已分析'},{value:'已关闭',label:'已关闭'},{value:'分析中',label:'分析中'}]"
                placeholder="全部状态" />
            </div>
            <div class="filter-actions">
              <button class="btn btn-primary" @click="toast('查询条件已应用')">查询</button>
              <button class="btn btn-outline" @click="m19FilterName='';m19FilterProbe='';m19FilterStatus=''">重置</button>
            </div>
          </div>

          <!-- 表格 -->
          <div class="table-inner">
            <table style="table-layout:fixed;width:100%">
              <thead>
                <tr>
                  <th>事件名称</th>
                  <th>触发探针</th>
                  <th>发生时间</th>
                  <th>状态</th>
                  <th style="text-align:center">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="ev in m19Events" :key="ev.id">
                  <td>
                    <span :style="ev.statusClass!=='hold'?'color:#1668a8;cursor:pointer;font-weight:500':'font-weight:500;color:#3f5062'"
                      @click="ev.statusClass!=='hold'&&(m19Detail=ev)">{{ ev.name }}</span>
                  </td>
                  <td style="color:#5a6978">{{ ev.probe }}</td>
                  <td style="color:#8a99a8">{{ ev.time }}</td>
                  <td><span :class="'badge '+ev.statusClass"><i></i>{{ ev.status }}</span></td>
                  <td style="text-align:center">
                    <div class="ops" style="justify-content:center">
                      <button :style="ev.statusClass==='hold'?'opacity:.4;cursor:not-allowed':''"
                        @click="ev.statusClass!=='hold'&&(m19Detail=ev)">查看分析</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="pager">
            <span>共 <b>{{ m19Events.length }}</b> 条记录</span>
          </div>
        </div>
      </template>
      <div v-if="m19GenerationStatus!=='idle'" class="m19-generation-overlay" role="status" aria-live="polite">
        <div class="m19-generation-dialog">
          <span v-if="m19GenerationStatus==='generating'" class="m19-generation-spinner" aria-hidden="true"></span>
          <span v-else class="m19-generation-check" aria-hidden="true">✓</span>
          <strong>{{ m19GenerationStatus==='generating' ? '正在生成异常分析报告…' : '异常分析报告生成成功' }}</strong>
          <p>{{ m19GenerationStatus==='generating' ? '正在汇总异常特征、推理链与证据记录' : '正在打开报告详情…' }}</p>
        </div>
      </div>
  </div>
</template>

<script>
import { computed, ref } from 'vue'
import { useRichPage } from '@/composables/rich/useRichPage'
import SelectField from '@/components/SelectField.vue'
import { evidence } from '@/data/mock'

const mindNodes = [
  { id: 'alarm', layer: '现象', label: '弹着点散布', value: '探针 P01', kind: 'mid', x: 18, y: 28, w: 118, keep: ['dh', 'v0'], evid: [], detail: '第19发触发弹着点散布探针 P01。告警只说明落点异常，还要往下拆是高低、方向，还是整批都偏。' },
  { id: 'dh', layer: '超差', label: '高低偏差', value: '+0.42 mil', kind: 'bad', x: 168, y: 6, w: 124, keep: ['alarm', 'pitch'], evid: [], detail: '立靶高低偏差 +0.42 mil，判据 ≤0.30 mil，超出 40%。这是本发被单独标出来的直接原因。' },
  { id: 'dir', layer: '未超', label: '方向偏差', value: '0.18 mil', kind: 'ok', x: 150, y: 118, w: 118, keep: ['base', 'weather'], evid: [], detail: '同发方向偏差 0.18 mil，没有超过 ≤0.30 mil。高低是孤立超差，不能把方向指标整批否决。' },
  { id: 'v0', layer: '伴随', label: '初速偏低', value: '818.3 m/s', kind: 'bad', x: 12, y: 156, w: 124, keep: ['alarm', 'temp'], evid: [], detail: '炮口初速 818.3 m/s，低于下限 820 m/s。它和落点超差出现在同一发，但是初速偏低本身还指不到温补。' },
  { id: 'base', layer: '对照', label: '前18发正常', value: '最大 0.25 mil', kind: 'ok', x: 24, y: 292, w: 132, keep: ['dir', 'weather'], evid: [], detail: '前18发高低偏差最大是第15发 0.25 mil，都在判据内。第19发 0.42 mil 是孤立突增，批次性因素因此降权。' },
  { id: 'pitch', layer: '姿态', label: 'pitch 漂移', value: '+0.38°', kind: 'bad', x: 330, y: 48, w: 124, keep: ['dh', 'time', 'root', 'fire'], evid: ['E1'], detail: '飞行段 pitch +0.38°，阈值 0.20°。遥测通道 T-07 能证明姿态偏了，但只有姿态、没有温度和标定，还不能写成根因。' },
  { id: 'temp', layer: '温度', label: 'TH-03 跳变', value: '+2.1 ℃', kind: 'bad', x: 348, y: 176, w: 124, keep: ['v0', 'time', 'root'], evid: ['E2'], detail: 'TH-03 在 T+4.2s 跳变 +2.1℃，记录在弹载记录仪。温度和姿态、落点落在同一发，温补回路才开始成为优先方向。' },
  { id: 'time', layer: '时序', label: '同发次对齐', value: 'T+4.2 s', kind: 'mid', x: 230, y: 248, w: 124, keep: ['pitch', 'temp', 'calib'], evid: [], detail: '姿态、初速和温度跳变对齐到第19发、T+4.2s 附近。时间接近只说明该继续追查定位定向系统，不能单独证明温补失效。' },
  { id: 'calib', layer: '标定', label: '系数偏差', value: '12.4%', kind: 'bad', x: 530, y: 18, w: 118, keep: ['time', 'root'], evid: ['E3'], detail: '标定台测得温补系数与出厂标定值偏差 12.4%，容差 5%，超出 7.4 个百分点。这是把「温度跳了」收成「温补失效」的直接证据。' },
  { id: 'root', layer: '根因', label: '温补失效', value: '置信 0.86', kind: 'root', x: 548, y: 148, w: 148, keep: ['pitch', 'temp', 'calib', 'case', 'retest', 'dh', 'alarm'], evid: ['E3'], detail: '定位定向系统温补失效被采纳。标定偏差、TH-03 跳变和 pitch 漂移三条线交汇，置信度 0.86。它解释的是第19发孤立超差，不是整批故障。' },
  { id: 'case', layer: '类比', label: '历史案例', value: 'D-06', kind: 'case', x: 820, y: 36, w: 124, keep: ['root'], evid: ['E4'], detail: '2019 年同型装甲车 A 精度试验有同类温补失效，来源是历史案例库 D-06。案例只帮助排序，不能代替本次标定台的 12.4%。' },
  { id: 'retest', layer: '印证', label: '复测对照', value: '0.18 mil', kind: 'ok', x: 812, y: 176, w: 124, keep: ['root'], evid: [], detail: '温补重新标定后复测高低偏差 0.18 mil，回到 ≤0.30 mil。首测 0.42 mil 继续保留，复测不回写为首测合格。' },
  { id: 'fire', layer: '降权', label: '火控解算', value: '置信 0.41', kind: 'down', x: 690, y: 300, w: 128, keep: ['pitch'], evid: [], detail: '火控解算软件异常只接得上姿态角偏差。没有 TH-03 跳变，也没有标定台 12.4% 的偏差，所以停在 0.41，不采纳。' },
  { id: 'weather', layer: '排除', label: '气象修正', value: '置信 0.22', kind: 'down', x: 196, y: 348, w: 128, keep: ['base', 'dir'], evid: [], detail: '气象修正误差排在 0.22。前18发都在判据内，第19发之后的发次也回到正常区间，不像一批气象修正把落点整体带偏。' },
]
const mindPairs = [
  ['alarm', 'dh'], ['alarm', 'v0'], ['dh', 'pitch'], ['v0', 'temp'], ['dir', 'base'],
  ['base', 'weather'], ['pitch', 'time'], ['temp', 'time'], ['pitch', 'fire'],
  ['time', 'calib'], ['temp', 'root'], ['pitch', 'root'], ['calib', 'root'],
  ['root', 'case'], ['root', 'retest'],
]
const mindMap = Object.fromEntries(mindNodes.map((node) => [node.id, node]))

export default {
  components: { SelectField },
  props: { page: Object, title: String },
  setup(props) {
    const bag = useRichPage(props)
    const chainOpen = ref(false)
    const mindId = ref('root')
    const mindLinks = computed(() => mindPairs.map(([from, to]) => {
      const a = mindMap[from]
      const b = mindMap[to]
      const x1 = a.x + a.w / 2
      const y1 = a.y + 26
      const x2 = b.x + b.w / 2
      const y2 = b.y + 26
      const mx = (x1 + x2) / 2 + (y1 - y2) * 0.12
      const my = (y1 + y2) / 2 + (x2 - x1) * 0.05
      return { id: `${from}-${to}`, from, to, d: `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}` }
    }))
    const mindActive = computed(() => mindMap[mindId.value] || mindMap.root)
    const mindEvidence = computed(() => evidence.filter((item) => mindActive.value.evid?.includes(item.id)))
    function mindLit(id) {
      const active = mindActive.value
      return id === active.id || active.keep?.includes(id)
    }
    function mindDim(id) {
      return !mindLit(id)
    }
    function mindLinkHot(link) {
      return mindLit(link.from) && mindLit(link.to)
    }
    function openCauseChain(row) {
      mindId.value = row.rank === 2 ? 'fire' : row.rank === 3 ? 'weather' : 'root'
      chainOpen.value = true
    }
    function evidenceRelLabel(id) {
      return { C4: '姿态角漂移', C5: '温度跳变', C6: '温补失效' }[id] || '候选根因'
    }
    return {
      ...bag,
      chainOpen,
      mindNodes,
      mindLinks,
      mindId,
      mindActive,
      mindEvidence,
      mindDim,
      mindLinkHot,
      openCauseChain,
      evidenceRelLabel,
    }
  },
}
</script>

<style scoped>
.m19-generation-overlay { position: fixed; inset: 0; z-index: 2000; display: grid; place-items: center; background: rgba(14, 38, 61, .32); }
.m19-generation-dialog { width: min(360px, calc(100vw - 40px)); padding: 32px 28px; border-radius: 12px; background: #fff; box-shadow: 0 18px 50px rgba(15, 55, 95, .2); display: flex; flex-direction: column; align-items: center; text-align: center; }
.m19-generation-dialog strong { color: #123c5f; font-size: 17px; margin-top: 18px; }
.m19-generation-dialog p { color: #6d8092; font-size: 13px; margin: 8px 0 0; }
.m19-generation-spinner { width: 36px; height: 36px; border: 3px solid #dceaf4; border-top-color: #1668a8; border-radius: 50%; animation: m19-spin .8s linear infinite; }
.m19-generation-check { width: 40px; height: 40px; border-radius: 50%; background: #e4f7eb; color: #1c9a52; font-size: 27px; line-height: 40px; }
@keyframes m19-spin { to { transform: rotate(360deg); } }
.m19-board {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.m19-top {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  align-items: stretch;
}
.m19-bottom {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  align-items: stretch;
}
.m19-card-h { margin-bottom: 10px; }
.m19-summary,
.m19-candidates,
.m19-charts,
.m19-reason {
  display: flex;
  flex-direction: column;
  height: 100%;
  box-sizing: border-box;
  min-height: 0;
}
.m19-charts-h {
  display: flex;
  align-items: center;
  gap: 8px;
}
.m19-charts-tip {
  margin-left: auto;
  font-size: 12px;
  color: #8a99a8;
  font-weight: 400;
}
.m19-charts-tip b { color: #d4380d; font-weight: 600; }
.m19-chart-stack {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-height: 420px;
}
.m19-chart-block {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 130px;
}
.m19-chart-lab {
  font-size: 12px;
  color: #5a6978;
  font-weight: 500;
  margin-bottom: 2px;
  flex-shrink: 0;
}
.m19-chart-el {
  flex: 1;
  width: 100%;
  min-height: 120px;
}
.m19-reason-chain {
  position: relative;
  height: 200px;
  flex-shrink: 0;
  margin-bottom: 12px;
  overflow: hidden;
}
.m19-chain-svg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 200px;
  pointer-events: none;
}
.m19-reason-chain .chain-node { position: absolute; }
.chain-node-root {
  background: #fff8e6 !important;
  border: 2px solid #d0ab68 !important;
}
.m19-evidence {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.m19-evidence-h {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
.m19-evidence-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 0;
  margin-bottom: 12px;
}
.m19-evidence-item {
  flex: 1;
  display: flex;
  gap: 10px;
  padding: 12px 14px;
  border: 1px solid #e3edf6;
  border-radius: 8px;
  background: #f8fbfe;
  cursor: pointer;
  min-height: 0;
}
.m19-evidence-item.on {
  border-color: #1668a8;
  background: #f3f8fd;
  box-shadow: inset 3px 0 0 #1668a8;
}
.m19-evidence-id {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  background: #1668a8;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
}
.m19-evidence-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.m19-evidence-body .txt {
  font-size: 13px;
  font-weight: 600;
  color: #1a2b3c;
  line-height: 1.5;
}
.m19-evidence-body .src {
  font-size: 12px;
  color: #8a99a8;
}
.m19-evidence-body .src .link {
  color: #1668a8;
  font-weight: 500;
}
.m19-evidence-body .rel {
  margin-top: auto;
  font-size: 12px;
  color: #1668a8;
}
.m19-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
  margin-top: auto;
}
.m19-summary-meta {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px 16px;
  background: #f4f8fc;
  border-radius: 8px;
  padding: 12px 14px;
  font-size: 13px;
  flex-shrink: 0;
}
.m19-meta-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  min-width: 0;
}
.m19-meta-item .lab {
  display: block;
  color: #8a99a8;
  font-size: 12px;
  line-height: 1.3;
}
.m19-meta-item b {
  display: block;
  font-weight: 600;
  color: #1a2b3c;
  line-height: 1.4;
}
.m19-meta-item em {
  display: block;
  font-style: normal;
  color: #333;
  line-height: 1.4;
}
.m19-meta-item .warn {
  display: block;
  color: #d4380d;
  font-weight: 700;
  line-height: 1.4;
}
.m19-meta-item .m19-status.badge {
  display: inline-flex;
  width: auto;
  max-width: max-content;
  margin-top: 0;
  align-self: flex-start;
}
.m19-summary-kpis {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: 12px;
  flex: 1;
  align-content: stretch;
}
.m19-kpi {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2px;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #e8f2fb;
  background: #fff;
  min-height: 64px;
}
.m19-kpi span {
  font-size: 11.5px;
  color: #8a99a8;
}
.m19-kpi b {
  font-size: 16px;
  font-weight: 700;
  color: #1a2b3c;
  line-height: 1.2;
}
.m19-kpi b.warn { color: #d4380d; }
.m19-kpi em {
  font-style: normal;
  font-size: 11px;
  color: #9aa8b5;
}

.m19-cand-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 0;
}
.m19-cand-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 12px 14px;
  border: 1px solid #e8f2fb;
  border-radius: 8px;
  min-height: 0;
  cursor: pointer;
}
.m19-cand-item:hover { border-color: #1668a8; }
.mm {
  position: relative;
  width: 1000px;
  height: 440px;
  border: 1px solid #e3edf6;
  border-radius: 10px;
  background: radial-gradient(circle at 62% 40%, #e7f3fb, #f7fbfe 68%);
  overflow: hidden;
}
.mm-lines { position: absolute; inset: 0; width: 100%; height: 100%; }
.mm-lines path { fill: none; }
.mm-lines path.track { stroke: #d3e2ee; stroke-width: 1.5; }
.mm-lines path.track.hot { stroke: #b7d4ee; stroke-width: 1.8; }
.mm-lines path.track.dim { opacity: .35; }
.mm-lines path.flow {
  stroke: #7ec4ef;
  stroke-width: 2.2;
  stroke-linecap: round;
  stroke-dasharray: 16 88;
  animation: mm-flow 2.6s linear infinite;
  filter: drop-shadow(0 0 3px rgba(80, 170, 230, .9));
}
.mm-lines path.flow.hot {
  stroke: #1668a8;
  stroke-width: 2.6;
  stroke-dasharray: 20 72;
  filter: drop-shadow(0 0 4px rgba(22, 104, 168, .95));
}
.mm-lines path.flow.dim { opacity: .22; filter: none; }
@keyframes mm-flow { to { stroke-dashoffset: -108; } }
.mm-node {
  position: absolute;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 1px;
  padding: 7px 8px;
  border: 1px solid #d5e4f0;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 4px 12px rgba(15, 55, 95, .06);
  text-align: left;
  cursor: pointer;
  font: inherit;
}
.mm-node em { font-style: normal; font-size: 11px; color: #1668a8; }
.mm-node b { font-size: 13px; color: #1f3d5a; font-weight: 600; }
.mm-node span { font-size: 12px; color: #d4380d; }
.mm-node.ok span { color: #1c9a52; }
.mm-node.mid span, .mm-node.down span { color: #6d8092; }
.mm-node.root { background: #fff8ee; border-color: #e2c48a; animation: mm-root 2.6s ease-in-out infinite; }
.mm-node.case { background: #f8fbff; }
.mm-node.on { border-color: #1668a8; z-index: 2; animation: mm-on 1.8s ease-in-out infinite; }
.mm-node.dim { opacity: .36; animation: none; }
@keyframes mm-root {
  0%, 100% { box-shadow: 0 0 0 0 rgba(22, 104, 168, .12); }
  50% { box-shadow: 0 0 0 6px rgba(22, 104, 168, 0), 0 0 16px rgba(22, 104, 168, .28); }
}
@keyframes mm-on {
  0%, 100% { box-shadow: 0 0 0 2px #1668a8, 0 0 8px rgba(22, 104, 168, .18); }
  50% { box-shadow: 0 0 0 3px #1668a8, 0 0 18px rgba(22, 104, 168, .48); }
}
@media (prefers-reduced-motion: reduce) {
  .mm-lines path.flow, .mm-node.root, .mm-node.on { animation: none; }
}
.mm-detail {
  display: grid;
  grid-template-columns: 1.2fr .8fr;
  gap: 12px;
  margin-top: 12px;
  padding: 12px 14px;
  border: 1px solid #e3edf6;
  border-radius: 8px;
  background: #fff;
}
.mm-detail b { display: block; color: #1f3d5a; font-size: 14px; }
.mm-detail em { font-style: normal; color: #1668a8; font-size: 12px; }
.mm-detail p { margin: 6px 0 0; color: #5c7084; font-size: 13px; line-height: 1.65; }
.mm-evid { display: flex; flex-direction: column; gap: 8px; }
.mm-evid span { display: block; color: #3f5062; font-size: 12.5px; line-height: 1.5; }
.mm-evid i {
  display: inline-flex;
  margin-right: 6px;
  min-width: 22px;
  height: 18px;
  padding: 0 4px;
  border-radius: 4px;
  background: #eef4fa;
  color: #1668a8;
  font-style: normal;
  font-size: 11px;
  align-items: center;
  justify-content: center;
}
.mm-evid small { display: block; margin-top: 2px; color: #8a99a8; }
.m19-cand-item.top {
  background: rgba(208, 171, 104, .10);
  border: none;
  border-left: 3px solid #d0ab68;
  border-radius: 0 8px 8px 0;
}
.m19-cand-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  gap: 8px;
}
.m19-cand-name {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #1a2b3c;
  font-size: 13.5px;
  min-width: 0;
}
.m19-cand-rank {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  background: #e4ecf4;
  color: #5a6978;
  flex-shrink: 0;
}
.m19-cand-rank.on {
  background: #d0ab68;
  color: #fff;
}
.m19-cand-score {
  font-size: 16px;
  font-weight: 700;
  flex-shrink: 0;
}
.m19-cand-score.hi { color: #0d4e83; }
.m19-cand-score.mid { color: #d0ab68; }
.m19-cand-score.lo { color: #8a99a8; }
.m19-cand-bar {
  background: #e8eef4;
  border-radius: 4px;
  height: 6px;
  margin-bottom: 8px;
  overflow: hidden;
}
.m19-cand-bar > div {
  height: 100%;
  border-radius: 4px;
}
.m19-cand-basis {
  font-size: 12px;
  color: #6d8092;
  line-height: 1.6;
  padding: 6px 8px;
  background: #f8fbff;
  border-radius: 4px;
}
.m19-cand-basis span { color: #8a99a8; }
</style>

<style>
.m19-chain-dialog.el-dialog { max-height: calc(100vh - 48px); display: flex; flex-direction: column; }
.m19-chain-dialog .el-dialog__body { overflow: auto; }
</style>
