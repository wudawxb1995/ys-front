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

        <!-- 四分屏：2×2 网格，上行（摘要｜候选根因）下行（三图联动｜思维链+证据） -->
        <div style="display:grid;grid-template-columns:1fr 1fr;grid-template-rows:auto auto;gap:12px;align-items:stretch">

          <!-- 左上：异常事件摘要卡 -->
          <div class="panel m19-summary">
            <h3 style="margin-bottom:10px"><i></i>异常事件摘要</h3>
            <div class="m19-summary-meta">
              <div><span>事件名称</span><b>{{ m19Detail.name }}</b></div>
              <div><span>状态</span><div><span :class="'badge '+m19Detail.statusClass"><i></i>{{ m19Detail.status }}</span></div></div>
              <div><span>触发探针</span><em>{{ m19Detail.probe }}</em></div>
              <div><span>关联批次</span><em>D-07（30发）</em></div>
              <div><span>发生时间</span><em>{{ m19Detail.time }}</em></div>
              <div><span>异常发次</span><strong class="warn">第 19 发</strong></div>
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

          <!-- 右上：候选根因置信度列表 -->
          <div class="panel">
            <h3 style="margin-bottom:10px"><i></i>候选根因排序</h3>
            <div style="display:flex;flex-direction:column;gap:8px">
              <div v-for="c in candidates" :key="c.rank"
                :style="c.rank===1
                  ?'background:rgba(208,171,104,.10);border-left:3px solid #d0ab68;border-radius:0 8px 8px 0;padding:12px 14px'
                  :'padding:12px 14px;border:1px solid #e8f2fb;border-radius:8px'">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
                  <div style="display:flex;align-items:center;gap:8px">
                    <span :style="c.rank===1?'background:#d0ab68;color:#fff':'background:#e4ecf4;color:#5a6978'"
                      style="width:22px;height:22px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:12px;font-weight:700">{{ c.rank }}</span>
                    <span style="font-weight:600;color:#1a2b3c;font-size:13.5px">{{ c.name }}</span>
                  </div>
                  <span :style="c.confidence>=0.7?'color:#0d4e83':c.confidence>=0.4?'color:#d0ab68':'color:#8a99a8'"
                    style="font-size:16px;font-weight:700">{{ c.confidence }}</span>
                </div>
                <!-- 置信度进度条 -->
                <div style="background:#e8eef4;border-radius:4px;height:6px;margin-bottom:8px">
                  <div :style="'width:'+Math.round(c.confidence*100)+'%;height:100%;border-radius:4px;background:'+(c.confidence>=0.7?'#1668a8':c.confidence>=0.4?'#d0ab68':'#c4cdd6')"></div>
                </div>
                <!-- 排序依据 -->
                <div style="font-size:12px;color:#6d8092;line-height:1.6;padding:6px 8px;background:#f8fbff;border-radius:4px">
                  <span style="color:#8a99a8">排序依据：</span>{{ c.basis }}
                </div>
              </div>
            </div>
          </div>

          <!-- 左下：多图联动区（三图 ECharts） -->
          <div class="panel">
            <h3 style="margin-bottom:6px"><i></i>多参数可视化联动
              <span style="margin-left:auto;font-size:12px;color:#8a99a8;font-weight:400">
                高亮第 <span style="color:#d4380d;font-weight:600">19</span> 发
              </span>
            </h3>
            <div style="font-size:12px;color:#5a6978;margin:6px 0 2px;font-weight:500">① 姿态角 pitch 时序</div>
            <div ref="pitchChartEl" style="width:100%;height:160px"></div>
            <div style="font-size:12px;color:#5a6978;margin:6px 0 2px;font-weight:500">② 各发次初速分布</div>
            <div ref="scatterChartEl" style="width:100%;height:160px"></div>
            <div style="font-size:12px;color:#5a6978;margin:6px 0 2px;font-weight:500">③ 定位定向系统内部温度</div>
            <div ref="tempChartEl" style="width:100%;height:160px"></div>
          </div>

          <!-- 右下：思维链画布 + 证据面板 -->
          <div class="panel">
            <h3 style="margin-bottom:10px"><i></i>推理思维链</h3>
            <div style="position:relative;height:200px;overflow:auto;margin-bottom:14px">
              <svg style="position:absolute;top:0;left:0;width:100%;height:200px;pointer-events:none" viewBox="0 0 580 200">
                <defs><marker id="arr" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="#b7cbe0"/></marker></defs>
                <line x1="113" y1="50" x2="150" y2="50" stroke="#b7cbe0" stroke-width="1.5" marker-end="url(#arr)"/>
                <line x1="113" y1="50" x2="150" y2="130" stroke="#b7cbe0" stroke-width="1.5" marker-end="url(#arr)"/>
                <line x1="273" y1="50" x2="310" y2="50" stroke="#b7cbe0" stroke-width="2" marker-end="url(#arr)"/>
                <line x1="273" y1="130" x2="310" y2="50" stroke="#b7cbe0" stroke-width="1.5" marker-end="url(#arr)"/>
                <line x1="433" y1="50" x2="470" y2="50" stroke="#b7cbe0" stroke-width="2" marker-end="url(#arr)"/>
              </svg>
              <!-- 层一 -->
              <div style="position:absolute;left:0;top:18px;width:110px" class="chain-node"
                :class="m19ActiveNode==='C1'?'chain-node-active':''"
                @click="m19ActiveNode='C1'">
                <div class="chain-layer">现象</div>
                <div class="chain-label">弹着点散布异常</div>
                <div class="chain-val red">超判据40%</div>
              </div>
              <!-- 层二上 -->
              <div style="position:absolute;left:153px;top:18px;width:116px" class="chain-node"
                :class="m19ActiveNode==='C2'?'chain-node-active':''"
                @click="m19ActiveNode='C2'">
                <div class="chain-layer">特征</div>
                <div class="chain-label">立靶偏差超限</div>
                <div class="chain-val red">+0.42 mil</div>
              </div>
              <!-- 层二下 -->
              <div style="position:absolute;left:153px;top:106px;width:116px" class="chain-node"
                :class="m19ActiveNode==='C3'?'chain-node-active':''"
                @click="m19ActiveNode='C3'">
                <div class="chain-layer">特征</div>
                <div class="chain-label">前18发正常</div>
                <div class="chain-val blue">排除批次因素</div>
              </div>
              <!-- 层三上 -->
              <div style="position:absolute;left:312px;top:18px;width:116px" class="chain-node"
                :class="m19ActiveNode==='C4'?'chain-node-active':''"
                @click="m19ActiveNode='C4'">
                <div class="chain-layer">中间因</div>
                <div class="chain-label">姿态角漂移</div>
                <div class="chain-val red">+0.38°超阈值</div>
              </div>
              <!-- 层三下 -->
              <div style="position:absolute;left:312px;top:106px;width:116px" class="chain-node"
                :class="m19ActiveNode==='C5'?'chain-node-active':''"
                @click="m19ActiveNode='C5'">
                <div class="chain-layer">中间因</div>
                <div class="chain-label">温度跳变</div>
                <div class="chain-val red">TH-03 +2.1℃</div>
              </div>
              <!-- 层四（根因） -->
              <div style="position:absolute;left:472px;top:18px;width:104px;background:#fff8e6;border:2px solid #d0ab68 !important" class="chain-node"
                :class="m19ActiveNode==='C6'?'chain-node-active':''"
                @click="m19ActiveNode='C6'">
                <div class="chain-layer" style="color:#d0ab68">根因</div>
                <div class="chain-label">温补失效</div>
                <div style="font-size:11px;color:#d48806;margin-top:2px">置信度 0.86</div>
              </div>
            </div>

            <!-- 证据面板 -->
            <div style="border-top:1px solid #eef3f8;padding-top:12px">
              <h3 style="margin-bottom:8px;font-size:13px"><i></i>证据面板
                <span style="margin-left:auto;font-size:12px;color:#8a99a8;font-weight:400">{{ evidence.length }} 条</span>
              </h3>
              <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:12px">
                <div v-for="e in evidence" :key="e.id"
                  @click="focusEvidence=e.id"
                  :style="focusEvidence===e.id?'border-color:#1668a8;background:#f0f7ff':''"
                  style="display:flex;gap:10px;padding:8px 10px;border:1px solid #e8f2fb;border-radius:6px;cursor:pointer;transition:all .15s">
                  <span style="flex-shrink:0;width:22px;height:22px;background:#eef4fa;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:600;color:#5a6978">{{ e.id }}</span>
                  <div style="flex:1;min-width:0">
                    <div style="font-size:13px;color:#1a2b3c;margin-bottom:2px">{{ e.text }}</div>
                    <div style="font-size:11.5px;color:#8a99a8">
                      来源：<span :style="e.source.includes('D-06')?'color:#1668a8;font-weight:500':''">{{ e.source }}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div style="display:flex;gap:8px">
                <button class="btn btn-outline" @click="$emit('toast','导入证据功能即将上线')">导入证据</button>
                <button class="btn btn-primary" @click="doM19ConfirmRootCause">采纳根因 &amp; 生成报告</button>
              </div>
            </div>
          </div>

        </div>
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
              <button class="btn btn-primary" @click="$emit('toast','查询条件已应用')">查询</button>
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
  </div>
</template>

<script>
import { useRichPage } from '@/composables/rich/useRichPage'
import SelectField from '@/components/SelectField.vue'

export default {
  components: { SelectField },
  props: { page: Object, title: String },
  setup(props) {
    return useRichPage(props)
  },
}
</script>

<style scoped>
.m19-summary {
  display: flex;
  flex-direction: column;
  min-height: 100%;
}
.m19-summary-meta {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 16px;
  background: #f4f8fc;
  border-radius: 8px;
  padding: 12px 14px;
  font-size: 13px;
}
.m19-summary-meta span {
  display: block;
  color: #8a99a8;
  font-size: 12px;
}
.m19-summary-meta b {
  display: block;
  font-weight: 600;
  color: #1a2b3c;
  margin-top: 2px;
}
.m19-summary-meta em {
  display: block;
  font-style: normal;
  color: #333;
  margin-top: 2px;
}
.m19-summary-meta .warn {
  display: block;
  color: #d4380d;
  font-weight: 700;
  margin-top: 2px;
}
.m19-summary-kpis {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: 12px;
  flex: 1;
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
  min-height: 72px;
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
</style>
