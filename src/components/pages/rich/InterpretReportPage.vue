<template>
  <div class="rich-type-m22">


      <!-- 报告预览页 -->
      <template v-if="m22Detail">
        <div class="m22-detail">
        <div class="m22-topbar">
          <span class="m22-back" @click="m22Detail=null">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
            返回报告列表
          </span>
          <span class="m22-sep">/</span>
          <span class="m22-title">{{ m22Detail.title }}</span>
          <div class="m22-actions">
            <button class="btn btn-primary" @click="m22ExportWord(m22Detail)">
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
        <div v-if="demoStore.reportArchived?.id === m22Detail?.id" class="m22-banner">
          <svg viewBox="0 0 24 24" fill="none" stroke="#d0ab68" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
          <div>
            <span class="m22-banner-lab">已归档 · 待试验后引用</span>
            <span class="m22-banner-txt">本报告已归档，等待后续验证试验结果引用。</span>
          </div>
        </div>

        <!-- 双栏：左导航 + 右正文（满屏高度，各自可滚） -->
        <div class="m22-split">

          <!-- 章节导航 -->
          <div class="panel m22-pane m22-nav">
            <div class="m22-nav-lab">章节导航</div>
            <div v-for="sec in m22Sections" :key="sec.no"
              class="m22-nav-item"
              :class="{ on: activeSection===sec.no }"
              @click="jumpToSection(sec.no)"
            >
              <span class="m22-nav-no">{{ sec.no }}</span>
              {{ sec.title }}
            </div>
          </div>

          <!-- 正文 -->
          <div ref="m22BodyEl" class="panel m22-pane m22-body">

            <!-- 第1节 -->
            <section data-section="1" class="m22-section">
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
              <p class="m22-paragraph">本报告汇集 D-07 批次逐发测量、探针告警、遥测记录和标定资料，分析对象为第 19 发异常。判据引用指标树 V1.0；报告中的根因结论为当前证据支持的推断，后续复测结果应继续回填。</p>
              <div class="m22-fact-grid">
                <div><span>立靶高低中间偏差</span><strong>+0.42 m</strong><small>判据 ≤0.30 m，超出 40%</small></div>
                <div><span>炮口初速</span><strong>818.3 m/s</strong><small>低于下限 820 m/s</small></div>
                <div><span>飞行段 pitch</span><strong>+0.38°</strong><small>超出 ±0.20° 阈值</small></div>
                <div><span>温度测点 TH-03</span><strong>+2.1 ℃</strong><small>在 T+4.2s 出现跳变</small></div>
              </div>
            </section>

            <!-- 第2节 -->
            <section data-section="2" class="m22-section">
              <h3 style="margin-bottom:12px"><i></i>2 异常特征</h3>
              <p style="font-size:13.5px;color:#333;margin-bottom:14px;line-height:1.8">
                第 19 发立靶高低中间偏差 <b style="color:#d4380d">+0.42 m</b>，超出判据阈值 ≤0.30 m（超出 40%），触发立靶精度探针 P01 告警，判定为异常发次。前 18 发高低偏差绝对值最大为 {{ reportBaseline.maxDeviation }} m，第 19 发呈孤立突增；这一对比降低了批次性因素的优先级，但仍需结合复测核查。
              </p>
              <div class="m22-analysis-note"><b>同发次关联：</b>第 19 发初速为 818.3 m/s，低于 820 m/s 下限；飞行段 pitch 偏差和 TH-03 温度跳变也在同一异常发次出现。三项信号时间接近，支持继续追查定位定向系统，但时间相关性本身不能单独证明根因。</div>
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
                    <text x="133" y="48" font-size="9" fill="#d4380d">+0.30 m</text>
                    <text x="133" y="172" font-size="9" fill="#d4380d">-0.30 m</text>
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
                      <div style="color:#5a6978">高低偏差 <b style="color:#d4380d">+0.42 m</b>，超出判据 ≤0.30 m（超出 40%），触发一级告警</div>
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
            </section>

            <!-- 第3节 -->
            <section data-section="3" class="m22-section">
              <h3 style="margin-bottom:12px"><i></i>3 根因分析过程</h3>
              <!-- 思维链缩略 -->
              <div style="border:1px solid #e8f2fb;border-radius:8px;padding:14px;margin-bottom:16px;background:#fafcff">
                <div style="font-size:12px;color:#8a99a8;margin-bottom:10px;font-weight:500">推理思维链（四层推导）</div>
                <div style="display:flex;align-items:center;gap:0;overflow-x:auto">
                  <template v-for="(node, ni) in [{id:'C1',layer:'现象',label:'弹着点散布异常',val:'超判据40%',color:''},{id:'C2',layer:'特征',label:'立靶偏差超限',val:'+0.42 m',color:''},{id:'C4',layer:'中间因',label:'姿态角漂移 + 温度跳变',val:'+0.38° / +2.1℃',color:''},{id:'C6',layer:'根因',label:'温补系数失效',val:'置信度 0.86',color:'gold'}]" :key="node.id">
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
              <div class="m22-analysis-note"><b>排序依据：</b>温补失效同时获得 E1 姿态异常、E2 温度跳变和 E3 标定偏差支持；火控解算软件异常缺少对应的软件故障记录；气象修正误差与前 18 发稳定表现不吻合。历史案例 E4 仅作类比，不作为本次故障的直接证据。</div>
            </section>

            <!-- 第4节 -->
            <section data-section="4" class="m22-section">
              <h3 style="margin-bottom:12px"><i></i>4 结论与处置建议</h3>
              <div style="background:#f4f8fc;border-radius:6px;padding:14px;margin-bottom:16px;font-size:13.5px;color:#1a2b3c;line-height:1.8">
                <b>结论：</b>本批次试验共 30 发，第 19 发立靶高低中间偏差超出判据 40%。现有证据最支持定位定向系统温补系数失效（候选置信度 0.86）；前 18 发稳定表现降低了批次性因素的优先级，最终结论仍需复测验证。
              </div>
              <div style="background:#fff8e6;border-left:4px solid #d0ab68;border-radius:0 8px 8px 0;padding:14px 16px;margin-bottom:16px;font-size:13.5px;color:#7a5a10;line-height:1.8">
                <b style="color:#1a2b3c">核心建议：</b>建议对定位定向系统执行温补校准后，复测第 19 发工况，以验证温补系数修正效果。
              </div>
              <div class="m22-analysis-note"><b>验证闭环：</b>完成温补系数复核与修正后，使用相同测量链路复测对应工况；核对高低偏差是否回到 ≤0.30 m、初速是否回到 ≥820 m/s，并确认 pitch 与 TH-03 温度曲线恢复稳定。若仍异常，应重新评估候选根因排序。</div>
              <div style="font-size:13.5px;color:#1a2b3c;line-height:1.8">
                <b>详细处置步骤：</b>
                <ol style="margin:10px 0 0 20px;display:flex;flex-direction:column;gap:8px">
                  <li>对该定位定向系统重新进行温补系数标定，参照出厂校准规程执行；</li>
                  <li>扩大 TH-03 传感器检测范围，在现有采样基础上增加温度梯度采样点（建议不少于 3 个）；</li>
                  <li>下批次试验前完成上述修正后，在相同工况下对第 19 发场景执行复测验证；</li>
                  <li>复测结果纳入 D-07 批次试验数据库，更新探针 P01 判据基线。</li>
                </ol>
              </div>
            </section>

            <!-- 第5节 -->
            <section data-section="5" class="m22-section">
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
                    <tr v-for="item in evidence" :key="item.id">
                      <td style="font-famy:monospace;color:#5a6978;font-weight:600">{{ item.id }}</td>
                      <td style="font-size:13px">{{ item.text }}</td>
                      <td><span style="font-size:12px;color:#5a6978">{{ item.source }}</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p class="m22-paragraph">证据 E1–E3 来自本次遥测和标定资料，E4 为历史案例。报告保留证据来源，便于复核分析结论与后续复测结果。</p>
            </section>

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
                      <button @click="m22ExportWord(r)">导出</button>
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
import { ref } from 'vue'
import { useRichPage } from '@/composables/rich/useRichPage'
import { shots30 } from '@/data/mock'
import SelectField from '@/components/SelectField.vue'

export default {
  components: { SelectField },
  props: { page: Object, title: String },
  setup(props) {
    const rich = useRichPage(props)
    const m22BodyEl = ref(null)
    const reportBaseline = {
      maxDeviation: Math.max(...shots30.slice(0, 18).map((shot) => Math.abs(shot.dH))).toFixed(2),
    }
    function jumpToSection(no) {
      rich.activeSection.value = no
      m22BodyEl.value?.querySelector(`[data-section="${no}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    return { ...rich, m22BodyEl, reportBaseline, jumpToSection }
  },
}
</script>

<style scoped>
.m22-detail {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.m22-topbar {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 0 0 auto;
}
.m22-back {
  cursor: pointer;
  color: #1668a8;
  font-size: 13px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.m22-back svg { width: 15px; height: 15px; }
.m22-back:hover { color: #0d4e83; }
.m22-sep { color: #c4cdd6; font-size: 13px; }
.m22-title { font-size: 13px; font-weight: 600; color: #1a2b3c; }
.m22-actions { margin-left: auto; display: flex; gap: 8px; }

.m22-banner {
  flex: 0 0 auto;
  background: #fff8e6;
  border-left: 4px solid #d0ab68;
  border-radius: 0 8px 8px 0;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.m22-banner svg { width: 18px; height: 18px; flex-shrink: 0; }
.m22-banner-lab { font-weight: 600; color: #7a5a10; margin-right: 12px; }
.m22-banner-txt { font-size: 13px; color: #9a7a30; }

.m22-split {
  display: grid;
  grid-template-columns: 200px minmax(0, 1fr);
  gap: 16px;
  align-items: start;
}
.m22-pane {
  min-height: 0;
  box-sizing: border-box;
}
.m22-nav { padding: 14px 12px; position: sticky; top: 16px; }
.m22-nav-lab {
  font-size: 12px;
  color: #8a99a8;
  margin-bottom: 10px;
  font-weight: 500;
  text-transform: uppercase;
}
.m22-nav-item {
  padding: 7px 10px;
  cursor: pointer;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 2px;
  color: #5a6978;
  border-radius: 6px;
}
.m22-nav-item.on {
  color: #1668a8;
  background: #edf5fc;
}
.m22-nav-no {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
  background: #e4ecf4;
  color: #8a99a8;
  flex: 0 0 auto;
}
.m22-nav-item.on .m22-nav-no {
  background: #1668a8;
  color: #fff;
}
.m22-body { line-height: 1.8; }
.m22-section { padding: 4px 0 26px; scroll-margin-top: 16px; }
.m22-section + .m22-section { border-top: 1px solid #e8eef4; padding-top: 24px; }
.m22-paragraph { color: #40556a; font-size: 13.5px; line-height: 1.85; margin: 14px 0 0; }
.m22-analysis-note { background: #f4f8fc; border-left: 3px solid #9cc5e3; padding: 12px 14px; border-radius: 4px; color: #40556a; line-height: 1.8; font-size: 13px; margin: 14px 0; }
.m22-fact-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; margin-top: 16px; }
.m22-fact-grid > div { padding: 12px; border: 1px solid #dceaf4; border-radius: 7px; }
.m22-fact-grid span, .m22-fact-grid small { display: block; color: #7890a5; font-size: 11px; }
.m22-fact-grid strong { display: block; color: #d4380d; font-size: 16px; margin: 3px 0; }
@media (max-width: 980px) { .m22-fact-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 700px) { .m22-split { grid-template-columns: 1fr; } .m22-nav { position: static; } }
</style>
