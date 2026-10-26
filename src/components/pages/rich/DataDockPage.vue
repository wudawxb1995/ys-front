<template>
  <div class="rich-type-m15">


      <!-- 融合监测视图（按任务类型区分） -->
      <template v-if="m15Detail">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">
          <span @click="m15Detail=null;scanCol=-1;alertVisible=false" style="cursor:pointer;color:#1668a8;font-size:13px;display:flex;align-items:center;gap:4px">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:15px;height:15px"><polyline points="15 18 9 12 15 6"/></svg>
            返回任务列表
          </span>
          <span style="color:#c4cdd6;font-size:13px">/</span>
          <span style="font-size:13px;color:#5a6978">{{ m15Detail.name }}</span>
          <span class="badge" style="margin-left:4px" :class="m15ViewKind==='ballistic'?'warn':m15ViewKind==='weather'?'on':'hold'"><i></i>{{ m15ViewKind==='ballistic'?'弹道融合':m15ViewKind==='weather'?'气象接入':'标定接入' }}</span>
          <div style="margin-left:auto;display:flex;gap:8px;align-items:center">
            <span style="font-size:12px;color:#8a99a8">{{ m15DetailMeta.summary }}</span>
            <button class="btn btn-primary" :disabled="scanCol>=0" @click="startScan()"
              :style="scanCol>=0?'opacity:.5;cursor:not-allowed':''">
              {{ scanCol<0 ? m15DetailMeta.scanLabel : (scanCol < (m15ViewKind==='ballistic'?6:4) ? m15DetailMeta.scanRun : m15DetailMeta.scanDone) }}
            </button>
          </div>
        </div>

        <div v-if="alertVisible" style="background:#fff8e0;border-left:4px solid #d0ab68;border-radius:0 8px 8px 0;padding:12px 16px;margin-bottom:14px;display:flex;align-items:flex-start;gap:12px">
          <svg viewBox="0 0 24 24" fill="none" stroke="#d48806" stroke-width="2" style="width:20px;height:20px;flex-shrink:0;margin-top:1px"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          <div>
            <div style="font-weight:600;color:#7a5a10;margin-bottom:4px">{{ m15DetailMeta.alertTitle }}</div>
            <div style="font-size:13px;color:#7a5a10">{{ m15DetailMeta.alertBody }}</div>
            <div style="font-size:13px;color:#9a7a30;margin-top:3px">{{ m15DetailMeta.alertSub }}</div>
            <button v-if="m15DetailMeta.showRootCause" class="btn btn-primary" style="margin-top:8px;height:28px;padding:0 12px;font-size:12.5px" @click="goRootCause">进入根因分析</button>
          </div>
        </div>

        <!-- T01 精度弹道 -->
        <div v-if="m15ViewKind==='ballistic'" style="display:grid;grid-template-columns:1fr 1fr;grid-template-rows:auto auto;gap:12px;align-items:stretch">
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
          <div class="panel" style="height:360px;display:flex;flex-direction:column">
            <h3 style="margin-bottom:8px;flex-shrink:0"><i></i>初速时序曲线</h3>
            <div ref="v0ChartEl" style="width:100%;flex:1"></div>
          </div>
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
          <div class="panel">
            <h3 style="margin-bottom:8px"><i></i>弹着点散布图</h3>
            <svg width="100%" viewBox="0 0 380 280" style="display:block">
              <line x1="190" y1="20" x2="190" y2="260" stroke="#dce8f2" stroke-width="1"/>
              <line x1="30" y1="140" x2="360" y2="140" stroke="#dce8f2" stroke-width="1"/>
              <rect x="110" y="60" width="160" height="160" fill="none" stroke="#d4380d" stroke-width="1.2" stroke-dasharray="4 3" opacity="0.7"/>
              <text x="193" y="57" font-size="10" fill="#d4380d">+0.30</text>
              <text x="193" y="230" font-size="10" fill="#d4380d">-0.30</text>
              <circle cx="193" cy="136" r="4" fill="#1668a8" opacity="0.65"/>
              <circle cx="184" cy="143" r="4" fill="#1668a8" opacity="0.65"/>
              <circle cx="197" cy="134" r="4" fill="#1668a8" opacity="0.65"/>
              <circle cx="200" cy="135" r="4" fill="#1668a8" opacity="0.65"/>
              <circle cx="182" cy="140" r="4" fill="#1668a8" opacity="0.65"/>
              <circle cx="196" cy="136" r="4" fill="#1668a8" opacity="0.65"/>
              <circle cx="188" cy="147" r="4" fill="#1668a8" opacity="0.65"/>
              <circle cx="195" cy="138" r="4" fill="#1668a8" opacity="0.65"/>
              <circle cx="212" cy="130" r="8" fill="none" stroke="#d4380d" stroke-width="2"/>
              <line x1="207" y1="125" x2="217" y2="135" stroke="#d4380d" stroke-width="2"/>
              <line x1="217" y1="125" x2="207" y2="135" stroke="#d4380d" stroke-width="2"/>
              <text x="220" y="122" font-size="10" fill="#d4380d" font-weight="600">+0.42, +0.18</text>
              <text x="220" y="133" font-size="9" fill="#d4380d">第19发</text>
              <text x="190" y="275" text-anchor="middle" font-size="10" fill="#8a99a8">方向偏差(mil)</text>
              <text x="14" y="140" text-anchor="middle" font-size="10" fill="#8a99a8" transform="rotate(-90,14,140)">高低偏差(mil)</text>
            </svg>
          </div>
        </div>

        <!-- T02 气象 -->
        <div v-else-if="m15ViewKind==='weather'" class="m15-split">
          <div class="panel m15-list-panel">
            <h3 class="m15-panel-h"><i></i>气象样本列表</h3>
            <div class="table-wrap m15-table-scroll">
              <table style="font-size:12.5px">
                <thead>
                  <tr>
                    <th style="width:44px">组次</th>
                    <th style="width:72px">时间</th>
                    <th>气温(℃)</th>
                    <th>湿度(%)</th>
                    <th>风速(m/s)</th>
                    <th>气压(hPa)</th>
                    <th>状态</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="r in weather30" :key="r.id">
                    <td class="col-idx">{{ String(r.id).padStart(2,'0') }}</td>
                    <td>{{ r.ts }}</td>
                    <td>{{ r.temp }}</td>
                    <td>{{ r.humidity }}</td>
                    <td>{{ r.wind }}</td>
                    <td>{{ r.pressure }}</td>
                    <td><span class="badge on"><i></i>合格</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div class="m15-side">
            <div class="panel m15-chart-panel">
              <h3 class="m15-panel-h"><i></i>气温 / 风速时序</h3>
              <div ref="v0ChartEl" class="m15-chart-el"></div>
            </div>
            <div class="panel m15-meta-panel">
              <h3 class="m15-panel-h"><i></i>气象窗口判据</h3>
              <div class="m15-kv-grid">
                <div class="m15-kv"><span>气温范围</span><b>15 ~ 25 ℃</b></div>
                <div class="m15-kv"><span>实测均值</span><b>19.1 ℃</b></div>
                <div class="m15-kv"><span>风速上限</span><b>≤ 5 m/s</b></div>
                <div class="m15-kv"><span>实测最大</span><b>3.4 m/s</b></div>
                <div class="m15-kv"><span>湿度窗口</span><b>30% ~ 70%</b></div>
                <div class="m15-kv"><span>数据源</span><b>气象站接口</b></div>
              </div>
            </div>
          </div>
        </div>

        <!-- T03 标定台 -->
        <div v-else class="m15-split">
          <div class="panel m15-list-panel">
            <h3 class="m15-panel-h"><i></i>标定检测项目</h3>
            <div class="table-wrap m15-table-scroll">
              <table style="font-size:12.5px">
                <thead>
                  <tr>
                    <th style="width:40px">序号</th>
                    <th>检测项</th>
                    <th>实测值</th>
                    <th>判据</th>
                    <th>结论</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="r in calib12" :key="r.id"
                    :style="r.watch?'background:rgba(208,171,104,.08);border-left:3px solid #d0ab68':''">
                    <td class="col-idx">{{ String(r.id).padStart(2,'0') }}</td>
                    <td>{{ r.name }}</td>
                    <td :style="r.watch?'color:#d48806;font-weight:700':''">{{ r.value }}{{ r.unit && r.unit!=='—' && r.unit!=='项' ? ' '+r.unit : '' }}</td>
                    <td style="color:#8a99a8">{{ r.criterion }}</td>
                    <td>
                      <span v-if="r.watch" class="badge warn"><i></i>关注</span>
                      <span v-else class="badge on"><i></i>合格</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div class="m15-side">
            <div class="panel m15-chart-panel">
              <h3 class="m15-panel-h"><i></i>标定达标度</h3>
              <div ref="v0ChartEl" class="m15-chart-el"></div>
            </div>
            <div class="panel m15-meta-panel">
              <h3 class="m15-panel-h"><i></i>标定台摘要</h3>
              <div class="m15-kv-grid">
                <div class="m15-kv"><span>设备</span><b>惯导标定台 A2</b></div>
                <div class="m15-kv"><span>检测项</span><b>12 项</b></div>
                <div class="m15-kv"><span>合格</span><b style="color:#22913c">11 项</b></div>
                <div class="m15-kv"><span>关注</span><b style="color:#d48806">1 项（K1）</b></div>
                <div class="m15-kv"><span>导出文件</span><b>标定台导出文件</b></div>
                <div class="m15-kv"><span>用途</span><b>温补系数溯源</b></div>
              </div>
            </div>
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
            <button class="btn btn-primary" style="align-self:flex-end" @click="openCreateDockTask">＋ 新建对接任务</button>
          </div>
          <div class="m15-task-list">
            <article v-for="t in m15FilteredTasks" :key="t.id" class="m15-task">
              <div class="m15-task-main">
                <b @click="m15Open(t)">{{ t.name }}</b>
                <p>数据源：{{ t.srcType }} · 计划 {{ t.count }}</p>
              </div>
              <div class="m15-task-side">
                <span>已回传 {{ m15TaskMeta(t).received }} / {{ m15TaskMeta(t).total }} {{ m15TaskMeta(t).unit }}</span>
                <span class="badge" :class="t.status === '成功' ? 'on' : t.status === '暂存' ? 'hold' : 'run'">
                  <i></i>{{ m15TaskMeta(t).label }}
                </span>
                <el-button v-if="t.status === '暂存'" type="primary" @click="startDockReturn(t)">启动回传</el-button>
                <el-button v-else @click="m15Open(t)">融合监测视图</el-button>
              </div>
            </article>
          </div>
          <div class="pager">
            <span>共 <b>{{ m15FilteredTasks.length }}</b> 条记录</span>
          </div>
        </div>
      </template>

      <el-dialog
        v-model="m15CreateVisible"
        title="新建对接任务"
        width="520px"
        align-center
        destroy-on-close
        :close-on-click-modal="false"
      >
        <el-form label-position="top" class="m15-create-form">
          <el-form-item label="任务名称" required>
            <el-input v-model="m15CreateForm.name" maxlength="40" placeholder="精度试验数据对接 (30发)" />
          </el-form-item>
          <el-form-item label="勾选精度试验数据源" required>
            <el-checkbox-group v-model="m15CreateForm.sources" class="m15-src-checks">
              <el-checkbox v-for="item in m15SourceOpts" :key="item" :value="item">{{ item }}</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </el-form>
        <template #footer>
          <div class="m15-dlg-foot">
            <el-button @click="m15CreateVisible = false">取消</el-button>
            <el-button type="primary" @click="submitCreateDockTask">创建任务</el-button>
          </div>
        </template>
      </el-dialog>
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
.m15-split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  align-items: stretch;
  /* 顶栏+面包屑+返回操作条约占 200px，详情区占满剩余视口 */
  height: calc(100vh - 200px);
  max-height: calc(100vh - 200px);
  min-height: 360px;
}
.m15-list-panel {
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: 100%;
  max-height: 100%;
  overflow: hidden;
}
.m15-panel-h {
  margin-bottom: 8px;
  flex-shrink: 0;
}
.m15-table-scroll {
  flex: 1;
  min-height: 0;
  overflow: auto;
}
.m15-side {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 0;
  height: 100%;
  max-height: 100%;
  overflow: hidden;
}
.m15-chart-panel {
  flex: 1.15;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.m15-chart-el {
  width: 100%;
  flex: 1;
  min-height: 0;
}
.m15-meta-panel {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: auto;
}
.m15-kv-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 12px;
  flex: 1;
  align-content: start;
}
.m15-kv {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 3px;
  padding: 10px 12px;
  border-radius: 8px;
  background: #f5f8fb;
  border: 1px solid #e8f2fb;
}
.m15-kv span { font-size: 12px; color: #8a99a8; }
.m15-kv b { font-size: 13.5px; color: #1a2b3c; font-weight: 600; }

.m15-create-form :deep(.el-form-item__label) {
  justify-content: flex-start;
  text-align: left !important;
  white-space: nowrap;
  box-sizing: border-box;
  padding-right: 18px !important;
  position: relative;
}
/* 文字左对齐；必填 * 在标签区右侧，与输入框留出间距 */
.m15-create-form :deep(.el-form-item.is-required:not(.is-no-asterisk) > .el-form-item__label::before) {
  content: none !important;
  margin: 0 !important;
}
.m15-create-form :deep(.el-form-item.is-required:not(.is-no-asterisk) > .el-form-item__label::after) {
  content: '*' !important;
  color: #f5222d;
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  margin: 0;
  line-height: 1;
}
.m15-dlg-foot {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
.m15-dlg-foot :deep(.el-button + .el-button) { margin-left: 0; }
.m15-task-list { display: flex; flex-direction: column; gap: 10px; }
.m15-task {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  background: #fff;
  border: 1px solid #e3edf6;
  border-radius: 10px;
  padding: 14px 16px;
}
.m15-task-main b { color: #1668a8; cursor: pointer; font-size: 14px; }
.m15-task-main p { margin: 4px 0 0; font-size: 12px; color: #8a99a8; }
.m15-task-side { display: flex; align-items: center; gap: 10px; flex: 0 0 auto; color: #5c7084; font-size: 13px; }
.m15-src-checks { display: flex; flex-direction: column; align-items: stretch; gap: 8px; width: 100%; }
.m15-src-checks :deep(.el-checkbox) {
  margin-right: 0;
  height: auto;
  padding: 8px 10px;
  border: 1px solid #e3edf6;
  border-radius: 8px;
  background: #fff;
}
</style>
