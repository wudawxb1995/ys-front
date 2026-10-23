<template>
  <div class="rich-type-m15">


      <!-- 融合监测视图 -->
      <template v-if="m15Detail">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">
          <span @click="m15Detail=null;scanCol=-1;alertVisible=false" style="cursor:pointer;color:#1668a8;font-size:13px;display:flex;align-items:center;gap:4px">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:15px;height:15px"><polyline points="15 18 9 12 15 6"/></svg>
            返回任务列表
          </span>
          <span style="color:#c4cdd6;font-size:13px">/</span>
          <span style="font-size:13px;color:#5a6978">{{ m15Detail.name }}</span>
          <div style="margin-left:auto;display:flex;gap:8px;align-items:center">
            <span style="font-size:12px;color:#8a99a8">30发 · 2024-10-18 · 异常1发</span>
            <button class="btn btn-primary" :disabled="scanCol>=0" @click="startScan()"
              :style="scanCol>=0?'opacity:.5;cursor:not-allowed':''">
              {{ scanCol<0?'启动智能检测':scanCol<6?'检测中…':'检测完成' }}
            </button>
          </div>
        </div>

        <!-- 告警横幅 -->
        <div v-if="alertVisible" style="background:#fff8e0;border-left:4px solid #d0ab68;border-radius:0 8px 8px 0;padding:12px 16px;margin-bottom:14px;display:flex;align-items:flex-start;gap:12px">
          <svg viewBox="0 0 24 24" fill="none" stroke="#d48806" stroke-width="2" style="width:20px;height:20px;flex-shrink:0;margin-top:1px"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          <div>
            <div style="font-weight:600;color:#7a5a10;margin-bottom:4px">告警 · 第 19 发 · 立靶高低偏差超限</div>
            <div style="font-size:13px;color:#7a5a10">探针：弹着点散布探针 P01　检测值：<b>+0.42 mil</b>（判据：≤0.30 mil）</div>
            <div style="font-size:13px;color:#9a7a30;margin-top:3px">触发时间：11:22:07　建议：标记为异常，进入根因分析流程</div>
            <button class="btn btn-primary" style="margin-top:8px;height:28px;padding:0 12px;font-size:12.5px" @click="goRootCause">进入根因分析</button>
          </div>
        </div>

        <!-- 四分区 grid 2×2 -->
        <div style="display:grid;grid-template-columns:1fr 1fr;grid-template-rows:auto auto;gap:12px;align-items:stretch">

          <!-- 左上：发次样本列表 -->
          <div class="panel" style="overflow:auto;height:360px;display:flex;flex-direction:column">
            <h3 style="margin-bottom:8px;flex-shrink:0"><i></i>发次样本列表</h3>
            <div class="table-wrap" style="flex:1;overflow:auto">
              <table style="font-size:12.5px">
                <thead>
                  <tr>
                    <th style="width:44px">发次</th>
                    <th style="width:72px">时间</th>
                    <th style="width:72px">初速(m/s)</th>
                    <th style="width:80px">高低偏(mil)</th>
                    <th style="width:80px">方向偏(mil)</th>
                    <th>状态</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="s in shots30" :key="s.id"
                    :style="s.anomaly?'background:rgba(212,56,13,.04);border-left:3px solid #d48806':''">
                    <td class="col-idx">{{ String(s.id).padStart(2,'0') }}</td>
                    <td>{{ s.ts }}</td>
                    <td :style="s.anomaly?'color:#d4380d;font-weight:700':''">{{ s.v0 }}</td>
                    <td :style="s.anomaly?'color:#d4380d;font-weight:700':''">{{ s.dH>0?'+':'' }}{{ s.dH }}</td>
                    <td>{{ s.dL>0?'+':'' }}{{ s.dL }}</td>
                    <td>
                      <span v-if="s.anomaly" class="badge warn"><i></i>异常</span>
                      <span v-else class="badge on"><i></i>正常</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- 右上：初速时序曲线 -->
          <div class="panel" style="height:360px;display:flex;flex-direction:column">
            <h3 style="margin-bottom:8px;flex-shrink:0"><i></i>初速时序曲线</h3>
            <div ref="v0ChartEl" style="width:100%;flex:1"></div>
          </div>

          <!-- 左下：探针状态矩阵 -->
          <div class="panel">
            <h3 style="margin-bottom:10px"><i></i>探针扫描矩阵</h3>
            <div style="font-size:12px;color:#8a99a8;margin-bottom:8px">12探针 × 6批次（每批5发）</div>
            <div style="overflow-x:auto">
              <table style="border-collapse:separate;border-spacing:3px;font-size:11.5px">
                <thead>
                  <tr>
                    <th style="text-align:left;font-size:11px;color:#8a99a8;padding:0 4px;font-weight:400;width:120px">探针</th>
                    <th v-for="c in 6" :key="c" style="width:42px;text-align:center;font-size:11px;color:#8a99a8;font-weight:400">第{{c*5-4}}-{{c*5}}发</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(p,pi) in probeList" :key="p.id">
                    <td style="padding:2px 4px;color:#5a6978;font-size:11.5px;white-space:nowrap">{{ p.name.replace('探针','') }}</td>
                    <td v-for="c in 6" :key="c" style="width:42px;height:26px;border-radius:4px;text-align:center;font-size:11px;font-weight:600;transition:background .3s"
                      :style="scanCol<0 ? 'background:#e4ecf4;color:#b0bcc8'
                        : c-1<scanCol ? (pi===0 && c===4 ? 'background:#d0ab68;color:#fff' : 'background:#1668a8;color:#fff')
                        : c-1===scanCol ? 'background:#9ec8e8;color:#fff'
                        : 'background:#e4ecf4;color:#b0bcc8'"
                    >
                      <template v-if="pi===0 && c===4 && scanCol>=4">!</template>
                      <template v-else-if="c-1<scanCol && scanCol>=0">✓</template>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- 右下：弹着点散布图 -->
          <div class="panel">
            <h3 style="margin-bottom:8px"><i></i>弹着点散布图</h3>
            <svg width="100%" viewBox="0 0 380 280" style="display:block">
              <!-- 坐标轴 -->
              <line x1="190" y1="20" x2="190" y2="260" stroke="#dce8f2" stroke-width="1"/>
              <line x1="30" y1="140" x2="360" y2="140" stroke="#dce8f2" stroke-width="1"/>
              <!-- ±0.30mil 判据虚线框 -->
              <rect x="110" y="60" width="160" height="160" fill="none" stroke="#d4380d" stroke-width="1.2" stroke-dasharray="4 3" opacity="0.7"/>
              <text x="193" y="57" font-size="10" fill="#d4380d">+0.30</text>
              <text x="193" y="230" font-size="10" fill="#d4380d">-0.30</text>
              <text x="270" y="143" font-size="10" fill="#d4380d">+0.30</text>
              <text x="28" y="143" font-size="10" fill="#d4380d">-0.30</text>
              <!-- 正常29发散点（坐标已固化，原点190,140，1mil≈53px） -->
              <circle cx="193" cy="136" r="4" fill="#1668a8" opacity="0.65"/>
              <circle cx="184" cy="143" r="4" fill="#1668a8" opacity="0.65"/>
              <circle cx="197" cy="134" r="4" fill="#1668a8" opacity="0.65"/>
              <circle cx="186" cy="137" r="4" fill="#1668a8" opacity="0.65"/>
              <circle cx="200" cy="135" r="4" fill="#1668a8" opacity="0.65"/>
              <circle cx="182" cy="140" r="4" fill="#1668a8" opacity="0.65"/>
              <circle cx="202" cy="132" r="4" fill="#1668a8" opacity="0.65"/>
              <circle cx="185" cy="146" r="4" fill="#1668a8" opacity="0.65"/>
              <circle cx="196" cy="136" r="4" fill="#1668a8" opacity="0.65"/>
              <circle cx="183" cy="135" r="4" fill="#1668a8" opacity="0.65"/>
              <circle cx="199" cy="133" r="4" fill="#1668a8" opacity="0.65"/>
              <circle cx="187" cy="148" r="4" fill="#1668a8" opacity="0.65"/>
              <circle cx="194" cy="137" r="4" fill="#1668a8" opacity="0.65"/>
              <circle cx="179" cy="141" r="4" fill="#1668a8" opacity="0.65"/>
              <circle cx="203" cy="130" r="4" fill="#1668a8" opacity="0.65"/>
              <circle cx="185" cy="149" r="4" fill="#1668a8" opacity="0.65"/>
              <circle cx="198" cy="134" r="4" fill="#1668a8" opacity="0.65"/>
              <circle cx="181" cy="135" r="4" fill="#1668a8" opacity="0.65"/>
              <!-- 第20~30发 -->
              <circle cx="195" cy="137" r="4" fill="#1668a8" opacity="0.65"/>
              <circle cx="184" cy="134" r="4" fill="#1668a8" opacity="0.65"/>
              <circle cx="200" cy="141" r="4" fill="#1668a8" opacity="0.65"/>
              <circle cx="186" cy="137" r="4" fill="#1668a8" opacity="0.65"/>
              <circle cx="198" cy="133" r="4" fill="#1668a8" opacity="0.65"/>
              <circle cx="182" cy="145" r="4" fill="#1668a8" opacity="0.65"/>
              <circle cx="196" cy="136" r="4" fill="#1668a8" opacity="0.65"/>
              <circle cx="201" cy="132" r="4" fill="#1668a8" opacity="0.65"/>
              <circle cx="188" cy="147" r="4" fill="#1668a8" opacity="0.65"/>
              <circle cx="184" cy="138" r="4" fill="#1668a8" opacity="0.65"/>
              <circle cx="195" cy="138" r="4" fill="#1668a8" opacity="0.65"/>
              <!-- 第19发异常点：190+0.42*53≈212, 140-0.18*53≈130 -->
              <circle cx="212" cy="130" r="8" fill="none" stroke="#d4380d" stroke-width="2"/>
              <line x1="207" y1="125" x2="217" y2="135" stroke="#d4380d" stroke-width="2"/>
              <line x1="217" y1="125" x2="207" y2="135" stroke="#d4380d" stroke-width="2"/>
              <text x="220" y="122" font-size="10" fill="#d4380d" font-weight="600">+0.42, +0.18</text>
              <text x="220" y="133" font-size="9" fill="#d4380d">第19发</text>
              <!-- 轴标签 -->
              <text x="190" y="275" text-anchor="middle" font-size="10" fill="#8a99a8">方向偏差(mil)</text>
              <text x="14" y="140" text-anchor="middle" font-size="10" fill="#8a99a8" transform="rotate(-90,14,140)">高低偏差(mil)</text>
            </svg>
          </div>
        </div>
      </template>

      <!-- 任务列表页 -->
      <template v-else>
        <div style="height:8px"></div>
        <div class="crud-body">
          <div class="filter-bar filter-panel">
            <div class="field" style="width:160px">
              <label>批次</label>
              <select-field v-model="m15FilterBatch"
                :options="[{value:'',label:'全部批次'},{value:'D-07',label:'D-07'}]"
                placeholder="全部批次" />
            </div>
            <div class="field" style="width:150px">
              <label>状态</label>
              <select-field v-model="m15FilterStatus"
                :options="[{value:'',label:'全部状态'},{value:'成功',label:'成功'},{value:'进行中',label:'进行中'}]"
                placeholder="全部状态" />
            </div>
            <div class="filter-actions">
              <button class="btn btn-primary" @click="$emit('toast','查询条件已应用')">查询</button>
              <button class="btn btn-outline" @click="m15FilterBatch='';m15FilterStatus=''">重置</button>
            </div>
            <span class="spacer"></span>
            <button class="btn btn-primary" style="align-self:flex-end" @click="$emit('toast','新建对接任务功能即将上线')">＋ 新建对接任务</button>
          </div>
          <div class="table-inner">
            <table>
              <thead>
                <tr>
                  <th style="width:220px">任务名称</th>
                  <th style="width:180px">数据源类型</th>
                  <th style="width:80px">数据量</th>
                  <th style="width:80px">状态</th>
                  <th style="width:160px">执行时间</th>
                  <th style="width:100px;text-align:center">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="t in dockTasks" :key="t.id">
                  <td>
                    <span style="color:#1668a8;cursor:pointer;font-weight:500" @click="m15Open(t)">{{ t.name }}</span>
                  </td>
                  <td>{{ t.srcType }}</td>
                  <td>{{ t.count }}</td>
                  <td><span class="badge on"><i></i>{{ t.status }}</span></td>
                  <td style="color:#8a99a8">{{ t.time }}</td>
                  <td style="text-align:center">
                    <div class="ops" style="justify-content:center">
                      <button @click="m15Open(t)">查看详情</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="pager">
            <span>共 <b>{{ dockTasks.length }}</b> 条记录</span>
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
