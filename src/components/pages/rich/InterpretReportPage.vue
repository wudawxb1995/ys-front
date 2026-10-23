<template>
  <div class="rich-type-m22">


      <!-- 报告预览页 -->
      <template v-if="m22Detail">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">
          <span @click="m22Detail=null" style="cursor:pointer;color:#1668a8;font-size:13px;display:flex;align-items:center;gap:4px">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:15px;height:15px"><polyline points="15 18 9 12 15 6"/></svg>
            返回报告列表
          </span>
          <span style="color:#c4cdd6;font-size:13px">/</span>
          <span style="font-size:13px;font-weight:600;color:#1a2b3c">{{ m22Detail.title }}</span>
          <div style="margin-left:auto;display:flex;gap:8px">
            <button class="btn btn-primary" @click="$emit('toast','正在导出报告…')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              导出
            </button>
            <button v-if="!demoStore.reportArchived?.id || demoStore.reportArchived.id !== m22Detail?.id"
              class="btn btn-outline"
              @click="doM22Archive(m22Detail)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
              归档
            </button>
            <button v-else class="btn btn-outline" style="opacity:.45;cursor:not-allowed" disabled>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
              已归档
            </button>
          </div>
        </div>

        <!-- 状态横幅 -->
        <div style="background:#fff8e6;border-left:4px solid #d0ab68;border-radius:0 8px 8px 0;padding:12px 16px;margin-bottom:16px;display:flex;align-items:center;gap:10px">
          <svg viewBox="0 0 24 24" fill="none" stroke="#d0ab68" stroke-width="2" style="width:18px;height:18px;flex-shrink:0"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
          <div>
            <span style="font-weight:600;color:#7a5a10;margin-right:12px">已归档 · 待试验后引用</span>
            <span style="font-size:13px;color:#9a7a30">本报告已归档，等待后续验证试验结果引用。</span>
          </div>
        </div>

        <!-- 双栏：左导航 + 右正文 -->
        <div style="display:grid;grid-template-columns:200px 1fr;gap:16px;align-items:start">

          <!-- 章节导航 -->
          <div class="panel" style="position:sticky;top:12px">
            <div style="font-size:12px;color:#8a99a8;margin-bottom:10px;font-weight:500;text-transform:uppercase">章节导航</div>
            <div v-for="sec in m22Sections" :key="sec.no"
              @click="activeSection=sec.no"
              :style="activeSection===sec.no?'color:#1668a8;background:#edf5fc;border-radius:6px':'color:#5a6978'"
              style="padding:7px 10px;cursor:pointer;font-size:13px;display:flex;align-items:center;gap:8px;margin-bottom:2px">
              <span :style="activeSection===sec.no?'background:#1668a8;color:#fff':'background:#e4ecf4;color:#8a99a8'" style="width:18px;height:18px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:11px;font-weight:600">{{ sec.no }}</span>
              {{ sec.title }}
            </div>
          </div>

          <!-- 正文 -->
          <div class="panel" style="line-height:1.8">

            <!-- 第1节 -->
            <div v-show="activeSection===1">
              <h3 style="margin-bottom:14px"><i></i>1 事件概述</h3>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px 24px;background:#f4f8fc;border-radius:6px;padding:14px;font-size:13px">
                <div><span style="color:#8a99a8">型号：</span><span style="font-weight:500">某型精度武器系统</span></div>
                <div><span style="color:#8a99a8">试验批次：</span><span>D-07</span></div>
                <div><span style="color:#8a99a8">试验时间：</span><span>2024-10-18</span></div>
                <div><span style="color:#8a99a8">试验场地：</span><span>某综合试验场寒区</span></div>
                <div><span style="color:#8a99a8">总发次：</span><span>30 发</span></div>
                <div><span style="color:#8a99a8">异常发次：</span><span style="color:#d4380d;font-weight:600">第 19 发</span></div>
                <div><span style="color:#8a99a8">触发探针：</span><span>弹着点散布探针 P01</span></div>
              </div>
            </div>

            <!-- 第2节 -->
            <div v-show="activeSection===2">
              <h3 style="margin-bottom:12px"><i></i>2 异常特征</h3>
              <p style="font-size:13.5px;color:#333;margin-bottom:14px;line-height:1.8">
                第 19 发立靶高低偏差 <b style="color:#d4380d">+0.42 mil</b>，超出判据阈值 ≤0.30 mil（超出 40%），触发立靶精度探针 P01 告警，判定为异常发次。同批次前 18 发偏差均在 ±0.25 mil 以内，排除弹药批次因素。
              </p>
              <!-- 散布图 + 告警记录 并排 -->
              <div style="display:grid;grid-template-columns:auto 1fr;gap:16px;align-items:start">
                <!-- 散布图 -->
                <div style="border:1px solid #e8f2fb;border-radius:8px;padding:10px;background:#fafcff">
                  <div style="font-size:11px;color:#8a99a8;margin-bottom:6px;text-align:center;font-weight:500">弹着点散布图（第19发）</div>
                  <svg width="220" viewBox="0 0 260 210" style="display:block">
                    <!-- 坐标轴 -->
                    <line x1="130" y1="10" x2="130" y2="195" stroke="#dce8f2" stroke-width="1"/>
                    <line x1="20" y1="105" x2="245" y2="105" stroke="#dce8f2" stroke-width="1"/>
                    <!-- 判据框 -->
                    <rect x="78" y="52" width="108" height="108" fill="none" stroke="#d4380d" stroke-width="1.2" stroke-dasharray="4 3" opacity="0.6"/>
                    <text x="133" y="48" font-size="9" fill="#d4380d">+0.30 mil</text>
                    <text x="133" y="172" font-size="9" fill="#d4380d">-0.30 mil</text>
                    <!-- 正常弹点（蓝） -->
                    <circle cx="128" cy="102" r="3" fill="#1668a8" opacity="0.55"/>
                    <circle cx="133" cy="98" r="3" fill="#1668a8" opacity="0.55"/>
                    <circle cx="126" cy="107" r="3" fill="#1668a8" opacity="0.55"/>
                    <circle cx="135" cy="100" r="3" fill="#1668a8" opacity="0.55"/>
                    <circle cx="130" cy="95" r="3" fill="#1668a8" opacity="0.55"/>
                    <circle cx="124" cy="103" r="3" fill="#1668a8" opacity="0.55"/>
                    <circle cx="138" cy="97" r="3" fill="#1668a8" opacity="0.55"/>
                    <circle cx="127" cy="99" r="3" fill="#1668a8" opacity="0.55"/>
                    <circle cx="132" cy="104" r="3" fill="#1668a8" opacity="0.55"/>
                    <circle cx="136" cy="96" r="3" fill="#1668a8" opacity="0.55"/>
                    <circle cx="123" cy="101" r="3" fill="#1668a8" opacity="0.55"/>
                    <circle cx="131" cy="108" r="3" fill="#1668a8" opacity="0.55"/>
                    <circle cx="129" cy="94" r="3" fill="#1668a8" opacity="0.55"/>
                    <circle cx="134" cy="106" r="3" fill="#1668a8" opacity="0.55"/>
                    <circle cx="137" cy="101" r="3" fill="#1668a8" opacity="0.55"/>
                    <circle cx="125" cy="97" r="3" fill="#1668a8" opacity="0.55"/>
                    <circle cx="139" cy="103" r="3" fill="#1668a8" opacity="0.55"/>
                    <circle cx="122" cy="105" r="3" fill="#1668a8" opacity="0.55"/>
                    <!-- 第19发（红叉） -->
                    <circle cx="158" cy="83" r="6" fill="none" stroke="#d4380d" stroke-width="1.8"/>
                    <line x1="153" y1="78" x2="163" y2="88" stroke="#d4380d" stroke-width="1.8"/>
                    <line x1="163" y1="78" x2="153" y2="88" stroke="#d4380d" stroke-width="1.8"/>
                    <text x="166" y="82" font-size="8.5" fill="#d4380d" font-weight="bold">⑲ +0.42</text>
                    <!-- 图例 -->
                    <circle cx="30" cy="190" r="3" fill="#1668a8" opacity="0.6"/>
                    <text x="36" y="193" font-size="9" fill="#5a6978">正常（1-18发）</text>
                    <line x1="140" y1="187" x2="146" y2="193" stroke="#d4380d" stroke-width="1.5"/>
                    <line x1="146" y1="187" x2="140" y2="193" stroke="#d4380d" stroke-width="1.5"/>
                    <text x="150" y="193" font-size="9" fill="#d4380d">第19发</text>
                  </svg>
                </div>
                <!-- 告警记录 -->
                <div>
                  <div style="font-size:13px;font-weight:600;color:#1a2b3c;margin-bottom:8px;display:flex;align-items:center;gap:6px">
                    <span style="width:8px;height:8px;border-radius:50%;background:#d4380d;display:inline-block"></span>
                    探针告警记录
                  </div>
                  <div style="display:flex;flex-direction:column;gap:8px">
                    <div style="padding:10px 12px;background:#fff5f5;border:1px solid #ffd6cc;border-radius:6px;font-size:13px">
                      <div style="display:flex;justify-content:space-between;margin-bottom:4px">
                        <span style="font-weight:600;color:#c0392b">P01 立靶精度告警</span>
                        <span style="color:#8a99a8;font-size:12px">2024-10-18 14:32:07</span>
                      </div>
                      <div style="color:#5a6978">高低偏差 <b style="color:#d4380d">+0.42 mil</b>，超出判据 ≤0.30 mil（超出 40%），触发一级告警</div>
                    </div>
                    <div style="padding:10px 12px;background:#fff8e6;border:1px solid #ffe4a0;border-radius:6px;font-size:13px">
                      <div style="display:flex;justify-content:space-between;margin-bottom:4px">
                        <span style="font-weight:600;color:#a07020">P04 身管温度预警</span>
                        <span style="color:#8a99a8;font-size:12px">2024-10-18 14:31:52</span>
                      </div>
                      <div style="color:#5a6978">TH-03 传感器温度跳变 <b style="color:#d48806">+2.1℃</b>，超出正常波动阈值，触发预警</div>
                    </div>
                    <div style="padding:10px 12px;background:#f4f8fc;border:1px solid #d6e8f6;border-radius:6px;font-size:13px">
                      <div style="display:flex;justify-content:space-between;margin-bottom:4px">
                        <span style="font-weight:600;color:#1a2b3c">P07 遥测信号</span>
                        <span style="color:#8a99a8;font-size:12px">2024-10-18 14:32:10</span>
                      </div>
                      <div style="color:#5a6978">姿态角 pitch 偏移 <b style="color:#d48806">+0.38°</b>，超出阈值 ±0.25°</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 第3节 -->
            <div v-show="activeSection===3">
              <h3 style="margin-bottom:12px"><i></i>3 根因分析过程</h3>
              <!-- 思维链缩略 -->
              <div style="border:1px solid #e8f2fb;border-radius:8px;padding:14px;margin-bottom:16px;background:#fafcff">
                <div style="font-size:12px;color:#8a99a8;margin-bottom:10px;font-weight:500">推理思维链（四层推导）</div>
                <div style="display:flex;align-items:center;gap:0;overflow-x:auto">
                  <template v-for="(node, ni) in [{id:'C1',layer:'现象',label:'弹着点散布异常',val:'超判据40%',color:''},{id:'C2',layer:'特征',label:'立靶偏差超限',val:'+0.42 mil',color:''},{id:'C4',layer:'中间因',label:'姿态角漂移 + 温度跳变',val:'+0.38° / +2.1℃',color:''},{id:'C6',layer:'根因',label:'温补系数失效',val:'置信度 0.86',color:'gold'}]" :key="node.id">
                    <div :style="node.color==='gold'?'border-color:#d0ab68;background:#fffbe6':''"
                      style="flex:1;padding:10px 12px;border:1px solid #d0e6f4;border-radius:8px;font-size:12px;text-align:center;min-width:110px">
                      <div style="font-size:10px;color:#8a99a8;margin-bottom:3px">{{ node.layer }}</div>
                      <div style="font-weight:600;color:#1a2b3c;line-height:1.4">{{ node.label }}</div>
                      <div :style="node.color==='gold'?'color:#d48806':'color:#d4380d'" style="font-size:11px;margin-top:3px">{{ node.val }}</div>
                    </div>
                    <div v-if="ni<3" style="padding:0 6px;color:#b7cbe0;font-size:18px;flex-shrink:0">→</div>
                  </template>
                </div>
              </div>
              <!-- 候选根因表 -->
              <div style="font-size:13px;font-weight:600;color:#1a2b3c;margin-bottom:8px">候选根因置信度排序</div>
              <div class="table-wrap">
                <table>
                  <thead>
                    <tr><th style="width:50px">排名</th><th>候选根因</th><th style="width:90px">置信度</th><th style="width:80px">结论</th></tr>
                  </thead>
                  <tbody>
                    <tr v-for="c in candidates" :key="c.rank">
                      <td class="col-idx">{{ c.rank }}</td>
                      <td style="font-weight:500">{{ c.name }}</td>
                      <td :style="c.rank===1?'color:#0d4e83;font-weight:700':'color:#8a99a8'">{{ c.confidence }}</td>
                      <td>
                        <span v-if="c.rank===1" class="badge on"><i></i>采纳</span>
                        <span v-else-if="c.rank===2" class="badge hold"><i></i>参考</span>
                        <span v-else style="font-size:12px;color:#8a99a8">排除</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- 第4节 -->
            <div v-show="activeSection===4">
              <h3 style="margin-bottom:12px"><i></i>4 结论与处置建议</h3>
              <div style="background:#f4f8fc;border-radius:6px;padding:14px;margin-bottom:16px;font-size:13.5px;color:#1a2b3c;line-height:1.8">
                <b>结论：</b>本批次弹道试验共 30 发，第 19 发出现弹着点散布异常（超判据 40%），根因推断为定位定向系统温补系数失效（置信度 0.86），前 18 发均正常，排除弹药批次性因素。
              </div>
              <div style="background:#fff8e6;border-left:4px solid #d0ab68;border-radius:0 8px 8px 0;padding:14px 16px;margin-bottom:16px;font-size:13.5px;color:#7a5a10;line-height:1.8">
                <b style="color:#1a2b3c">核心建议：</b>建议对定位定向系统执行温补校准后，复测第 19 发工况，以验证温补系数修正效果。
              </div>
              <div style="font-size:13.5px;color:#1a2b3c;line-height:1.8">
                <b>详细处置步骤：</b>
                <ol style="margin:10px 0 0 20px;display:flex;flex-direction:column;gap:8px">
                  <li>对该定位定向系统重新进行温补系数标定，参照出厂校准规程执行；</li>
                  <li>扩大 TH-03 传感器检测范围，在现有采样基础上增加温度梯度采样点（建议不少于 3 个）；</li>
                  <li>下批次试验前完成上述修正后，在相同工况下对第 19 发场景执行复测验证；</li>
                  <li>复测结果纳入 D-07 批次试验数据库，更新探针 P01 判据基线。</li>
                </ol>
              </div>
            </div>

            <!-- 第5节 -->
            <div v-show="activeSection===5">
              <h3 style="margin-bottom:12px"><i></i>5 证据清单</h3>
              <div class="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th style="width:50px">编号</th>
                      <th>证据内容</th>
                      <th style="width:200px">来源</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style="font-family:monospace;color:#5a6978;font-weight:600">E1</td>
                      <td style="font-size:13px">第19发飞行段 pitch 角偏差 0.38°，超出阈值 0.20°</td>
                      <td><span style="font-size:12px;color:#5a6978">遥测数据 D-07</span></td>
                    </tr>
                    <tr>
                      <td style="font-family:monospace;color:#5a6978;font-weight:600">E2</td>
                      <td style="font-size:13px">温度传感器 TH-03 在第 4.2s 出现 2.1℃ 跳变</td>
                      <td><span style="font-size:12px;color:#5a6978">监控仪</span></td>
                    </tr>
                    <tr>
                      <td style="font-family:monospace;color:#5a6978;font-weight:600">E3</td>
                      <td style="font-size:13px">2019年同型某次试验出现相同温补失效案例，处置后复测达标</td>
                      <td><span style="font-size:12px;color:#1668a8;font-weight:500">历史案例库 D-06 · 某型装甲车A精度试验2019</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      </template>

      <!-- 报告列表页 -->
      <template v-else>
        <div style="height:8px"></div>
        <div class="crud-body">
          <!-- 筛选栏 -->
          <div class="filter-bar filter-panel">
            <div class="field" style="width:220px">
              <label>报告名称</label>
              <input v-model="m22FilterName" placeholder="请输入" />
            </div>
            <div class="field" style="width:160px">
              <label>状态</label>
              <select-field v-model="m22FilterStatus"
                :options="[{value:'',label:'全部状态'},{value:'archive',label:'已归档'},{value:'hold',label:'草稿'}]"
                placeholder="全部状态" />
            </div>
            <div class="filter-actions">
              <button class="btn btn-primary" @click="$emit('toast','查询条件已应用')">查询</button>
              <button class="btn btn-outline" @click="m22FilterName='';m22FilterStatus=''">重置</button>
            </div>
            <span class="spacer"></span>
            <button class="btn btn-primary" style="align-self:flex-end" @click="$emit('toast','正在生成报告…')">生成报告</button>
          </div>

          <!-- 表格 -->
          <div class="table-inner">
            <table style="table-layout:fixed;width:100%">
              <thead>
                <tr>
                  <th>报告名称</th>
                  <th>关联事件</th>
                  <th>生成时间</th>
                  <th>状态</th>
                  <th style="text-align:center">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="r in m22Reports" :key="r.id">
                  <td>
                    <span style="color:#1668a8;cursor:pointer;font-weight:500" @click="m22Detail=r;activeSection=1">{{ r.title }}</span>
                  </td>
                  <td style="color:#5a6978">{{ r.event }}</td>
                  <td style="color:#8a99a8">{{ r.time }}</td>
                  <td>
                    <span v-if="r.statusClass==='archive'" style="background:#fff6e0;color:#a07020;border:1px solid #e3c96e;padding:2px 10px;border-radius:9px;font-size:12px;font-weight:600">
                      {{ r.statusLabel }}
                    </span>
                    <span v-else :class="'badge '+r.statusClass"><i></i>{{ r.statusLabel }}</span>
                  </td>
                  <td style="text-align:center">
                    <div class="ops" style="justify-content:center">
                      <button @click="m22Detail=r;activeSection=1">预览</button>
                      <button @click="$emit('toast','正在导出…')">导出</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="pager">
            <span>共 <b>{{ m22Reports.length }}</b> 条记录</span>
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
