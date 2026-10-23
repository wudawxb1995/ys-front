<template>
  <div class="rich-type-m31">


      <!-- ══ 第二级：报告预览页 ══ -->
      <template v-if="m31Detail">

        <!-- 顶部标题行 + 操作按钮 -->
        <div class="preview-head">
          <div class="preview-crumb">
            <span class="back-link" @click="m31Detail=null;m31ResetCharts()">← 返回</span>
            <span class="sep">|</span>
            <span class="preview-title">{{ m31Detail.title }}</span>
          </div>
          <div class="preview-actions">
            <el-button @click="toast('在线编辑功能即将开放')">在线编辑</el-button>
            <el-button type="primary" @click="toast('正在导出…')">导出</el-button>
          </div>
        </div>

        <!-- 双栏：左侧章节导航 + 右侧正文 -->
        <div style="display:grid;grid-template-columns:170px 1fr;gap:14px;align-items:start">

          <!-- 左侧章节导航 -->
          <div class="panel" style="padding:10px 0;position:sticky;top:16px">
            <div style="font-size:12px;color:#8a99a8;font-weight:600;padding:4px 14px 10px;letter-spacing:.5px">章节目录</div>
            <div v-for="sec in m31Sections" :key="sec.no"
              class="m31-nav-item" :class="{on: activeReportSection===sec.no}"
              @click="m31GoSection(sec.no)">
              <span style="font-size:11px;color:inherit;margin-right:6px;opacity:.6">0{{ sec.no }}</span>{{ sec.title }}
            </div>
            <!-- 状态信息 -->
            <div style="margin:14px 14px 4px;padding-top:12px;border-top:1px solid var(--line)">
              <div style="font-size:12px;color:#7a8b9a;margin-bottom:4px">研判方向</div>
              <div style="font-size:12.5px;color:var(--navy-2);font-weight:600">{{ m31Detail.direction }}</div>
              <div style="font-size:12px;color:#7a8b9a;margin-top:8px;margin-bottom:4px">生成时间</div>
              <div style="font-size:12.5px;color:#4a5a6a">{{ m31Detail.time }}</div>
              <div style="margin-top:10px">
                <span class="badge" :class="m31Detail.statusClass">{{ m31Detail.status }}</span>
              </div>
            </div>
          </div>

          <!-- 右侧正文区 -->
          <div style="display:flex;flex-direction:column;gap:14px">

            <!-- 第1节：技术现状综述 -->
            <div id="m31sec1" class="panel" :class="{'m31-section-active': activeReportSection===1}" style="padding:22px 26px" @click="activeReportSection=1">
              <div class="m31-section-anchor">
                <span class="m31-section-no">01</span>
                <h3 class="report-section-title" style="margin-bottom:0">技术现状综述</h3>
              </div>
              <template v-if="activeReportSection===1">
                <p class="report-body" style="margin-top:14px">定位定向技术是现代精确制导武器系统和试验鉴定领域的核心支撑技术之一。近年来，随着对精度要求的持续提高，定位定向技术在温度补偿、初始对准、误差建模等方面取得了一系列进展。本报告基于收录的326篇科技文献（含{{ demoStore.judgeInputReportTitle || '试验报告V2' }}，{{ demoStore.judgeInputArchivedAt ? demoStore.judgeInputArchivedAt.slice(0,10)+'归档' : '已归档' }}），系统分析定位定向技术方向创新点的现状与趋势。</p>
                <p class="report-body">当前该方向共收录创新点12个，覆盖温补技术、定向精度校准、初始对准三个三级方向。其中温补技术方向在近2年产出了5个创新点，是当前研究最活跃的子方向，与本次试验第19发超差事件的根因直接相关。</p>
                <div style="margin-top:14px;background:#f5f9fd;border-radius:8px;padding:12px 14px">
                  <div style="font-size:12px;font-weight:600;color:#7a8b9a;margin-bottom:8px">主要参考文献（6篇）</div>
                  <div style="font-size:12.5px;color:#4a5a6a;line-height:2">
                    <div>[1] 温补系数自校准方法研究，2023</div>
                    <div>[2] 定向系统误差补偿综述，2022</div>
                    <div>[3] 试验报告V2·第19发超差分析，2024</div>
                    <div>[4] 自适应惯导对准技术，2021</div>
                    <div>[5] 定向精度评估标准研究，2020</div>
                    <div>[6] 某型温补失效案例分析，2019</div>
                  </div>
                </div>
              </template>
              <p v-else class="report-body" style="margin-top:10px;color:#8a99a8;font-size:13px">涵盖定位定向技术领域现状综述，引用6篇核心文献……</p>
            </div>

            <!-- 第2节：创新点分布分析 -->
            <div id="m31sec2" class="panel" :class="{'m31-section-active': activeReportSection===2}" style="padding:22px 26px" @click="activeReportSection=2">
              <div class="m31-section-anchor">
                <span class="m31-section-no">02</span>
                <h3 class="report-section-title" style="margin-bottom:0">创新点分布分析</h3>
              </div>
              <template v-if="activeReportSection===2">
                <p class="report-body" style="margin-top:14px">58个技术创新点按6个技术方向分布如下图所示，其中<b style="color:var(--blue)">定位定向技术</b>方向创新点数量最多（12个），与本次试验异常事件直接相关。</p>
                <!-- 两栏：左柱状图 + 右技术体系子图 -->
                <div style="display:grid;grid-template-columns:1fr 220px;gap:16px;margin:14px 0">
                  <div>
                    <div style="font-size:12px;color:#7a8b9a;margin-bottom:8px;font-weight:500">各方向创新点数量分布</div>
                    <div ref="innovBarEl" style="width:100%;height:200px"></div>
                  </div>
                  <!-- 右：技术体系子图（SVG） -->
                  <div style="background:#f8fbfe;border:1px solid var(--line);border-radius:8px;padding:12px 10px">
                    <div style="font-size:12px;color:#7a8b9a;margin-bottom:10px;font-weight:500">定位定向技术体系</div>
                    <svg viewBox="0 0 160 190" width="100%" style="display:block;overflow:visible">
                      <!-- 根节点 -->
                      <rect x="20" y="4" width="120" height="28" rx="6" fill="var(--blue)"/>
                      <text x="80" y="22" text-anchor="middle" fill="#fff" font-size="11" font-weight="600">定位定向技术</text>
                      <!-- 竖线主干 -->
                      <line x1="80" y1="32" x2="80" y2="50" stroke="#b7cbe0" stroke-width="1.2"/>
                      <!-- 横线 -->
                      <line x1="26" y1="50" x2="134" y2="50" stroke="#b7cbe0" stroke-width="1.2"/>
                      <!-- 三根竖线到子节点 -->
                      <line x1="26" y1="50" x2="26" y2="62" stroke="#b7cbe0" stroke-width="1.2"/>
                      <line x1="80" y1="50" x2="80" y2="62" stroke="#b7cbe0" stroke-width="1.2"/>
                      <line x1="134" y1="50" x2="134" y2="62" stroke="#b7cbe0" stroke-width="1.2"/>
                      <!-- 温补技术（麦金色） -->
                      <rect x="2" y="62" width="48" height="26" rx="5" fill="#fff8e0" stroke="var(--gold)" stroke-width="1.5"/>
                      <text x="26" y="79" text-anchor="middle" fill="#8a6000" font-size="10" font-weight="600">温补技术</text>
                      <!-- 数量气泡 -->
                      <circle cx="46" cy="62" r="8" fill="var(--blue)"/>
                      <text x="46" y="66" text-anchor="middle" fill="#fff" font-size="9" font-weight="700">5</text>
                      <!-- 定向精度校准 -->
                      <rect x="56" y="62" width="48" height="26" rx="5" fill="#e8f2fb" stroke="#b8d9f4" stroke-width="1.2"/>
                      <text x="80" y="73" text-anchor="middle" fill="var(--navy-2)" font-size="9.5">定向精度</text>
                      <text x="80" y="84" text-anchor="middle" fill="var(--navy-2)" font-size="9.5">校准</text>
                      <circle cx="100" cy="62" r="7" fill="#8ab4cc"/>
                      <text x="100" y="66" text-anchor="middle" fill="#fff" font-size="9" font-weight="700">4</text>
                      <!-- 初始对准 -->
                      <rect x="110" y="62" width="48" height="26" rx="5" fill="#e8f2fb" stroke="#b8d9f4" stroke-width="1.2"/>
                      <text x="134" y="79" text-anchor="middle" fill="var(--navy-2)" font-size="10">初始对准</text>
                      <circle cx="154" cy="62" r="7" fill="#8ab4cc"/>
                      <text x="154" y="66" text-anchor="middle" fill="#fff" font-size="9" font-weight="700">3</text>
                      <!-- 本次试验沉淀徽标 -->
                      <rect x="2" y="93" width="56" height="16" rx="8" fill="var(--gold)"/>
                      <text x="30" y="104" text-anchor="middle" fill="#fff" font-size="9" font-weight="600">本次试验沉淀</text>
                      <!-- 图例 -->
                      <rect x="2" y="120" width="8" height="8" rx="2" fill="#fff8e0" stroke="var(--gold)" stroke-width="1.2"/>
                      <text x="14" y="128" fill="#8a6000" font-size="9">研究热点方向</text>
                      <circle cx="6" cy="142" r="5" fill="var(--blue)"/>
                      <text x="14" y="146" fill="#7a8b9a" font-size="9">创新点数量</text>
                    </svg>
                  </div>
                </div>
                <!-- 分布汇总表 -->
                <table class="inner-table" style="width:100%;margin-top:4px">
                  <thead><tr><th>技术方向</th><th>创新点数量</th><th>占比</th><th>备注</th></tr></thead>
                  <tbody>
                    <tr style="background:#fffaf0">
                      <td><b style="color:#8a6000">定位定向技术</b> <span style="background:var(--gold);color:#fff;font-size:11px;padding:1px 6px;border-radius:6px;margin-left:4px">重点</span></td>
                      <td><b style="color:var(--blue)">12</b></td><td>20.7%</td><td style="color:#8a6000;font-size:12px">含本次试验沉淀</td>
                    </tr>
                    <tr v-for="(name,i) in innovBarData.xData.slice(1)" :key="i">
                      <td>{{ name }}</td><td>{{ innovBarData.yData[i+1] }}</td><td>{{ (innovBarData.yData[i+1]/58*100).toFixed(1) }}%</td><td style="color:#8a99a8;font-size:12px">—</td>
                    </tr>
                  </tbody>
                </table>
              </template>
              <p v-else class="report-body" style="margin-top:10px;color:#8a99a8;font-size:13px">58个创新点按6个方向分布，定位定向技术方向12个（含本次试验沉淀）……</p>
            </div>

            <!-- 第3节：技术发展趋势研判 -->
            <div id="m31sec3" class="panel" :class="{'m31-section-active': activeReportSection===3}" style="padding:22px 26px" @click="activeReportSection=3">
              <div class="m31-section-anchor">
                <span class="m31-section-no">03</span>
                <h3 class="report-section-title" style="margin-bottom:0">技术发展趋势研判</h3>
              </div>
              <template v-if="activeReportSection===3">
                <p class="report-body" style="margin-top:14px">近5年技术创新点数量呈持续上升趋势，年均增长约2.5个，表明该领域研究热度持续攀升。</p>
                <div ref="trendLineEl" style="width:100%;height:220px;margin:12px 0 16px"></div>
                <p class="report-body">从发展脉络看，<b>2020—2022年</b>以基础算法创新为主（误差建模、温补系数优化）；<b>2023—2024年</b>工程化应用创新比例显著提升，温补技术与自校准算法融合成为热点方向。预计2025年该方向将持续保持6—8个新增创新点的增速。</p>
              </template>
              <p v-else class="report-body" style="margin-top:10px;color:#8a99a8;font-size:13px">近5年创新点数量持续上升，年均增长约2.5个……</p>
            </div>

            <!-- 第4节：建议方向与对策 -->
            <div id="m31sec4" class="panel" :class="{'m31-section-active': activeReportSection===4}" style="padding:22px 26px" @click="activeReportSection=4">
              <div class="m31-section-anchor">
                <span class="m31-section-no">04</span>
                <h3 class="report-section-title" style="margin-bottom:0">建议方向与对策</h3>
              </div>
              <template v-if="activeReportSection===4">
                <!-- 首条：麦金色高亮 -->
                <div class="m31-highlight-block" style="margin-top:16px">
                  <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
                    <span style="background:var(--gold);color:#fff;font-size:11px;padding:2px 8px;border-radius:6px;font-weight:600">首要建议</span>
                    <div class="m31-highlight-title" style="margin-bottom:0">温补技术工程化改进</div>
                  </div>
                  <p style="font-size:13.5px;line-height:1.85;color:#4a5a6a">推进低成本温补方案与自校准算法融合，形成可工程化复制的温补系数分级修正流程，重点解决高温差场景下的鲁棒性问题。</p>
                  <div class="m31-source-note" style="margin-top:10px;display:flex;align-items:center;gap:6px">
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    实证支撑：第19发超差事件（D-07）· 定位定向系统温补失效根因分析
                  </div>
                </div>
                <!-- 建议2 -->
                <div style="margin-top:14px;padding:14px 16px;background:#f8fbfe;border-radius:8px;border-left:3px solid var(--blue)">
                  <p class="report-body" style="margin-bottom:0"><b style="color:var(--navy-2)">② 初始对准快速收敛能力提升</b><br/>结合多位置观测与卡尔曼滤波融合方法，将对准时间压缩至4分钟以内，提高快速反应能力。</p>
                </div>
                <!-- 建议3 -->
                <div style="margin-top:10px;padding:14px 16px;background:#f8fbfe;border-radius:8px;border-left:3px solid var(--blue)">
                  <p class="report-body" style="margin-bottom:0"><b style="color:var(--navy-2)">③ 定向精度评估标准完善</b><br/>建立涵盖温度、振动、电磁干扰多因素的综合评估体系，为后续型号定型试验提供判据依据。</p>
                </div>
                <!-- 页底查重入口 -->
                <div class="m31-bottom-bar" style="cursor:pointer" @click="goProjectDup">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#1668a8" stroke-width="1.8" style="flex-shrink:0"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  <span style="color:#1668a8;font-size:13px;font-weight:600">科研项目方案多维查重</span>
                  <span style="margin-left:auto;font-size:12px;color:#8a99a8">入口露出 · 8 维</span>
                </div>
              </template>
              <p v-else class="report-body" style="margin-top:10px;color:#8a99a8;font-size:13px">首条建议：温补技术工程化改进；另含2条建议方向……</p>
            </div>

          </div>
        </div>
      </template>

      <!-- ══ 第一级：报告生成页 ══ -->
      <template v-else>
        <div class="entry-title">
          <h2>{{ title || '技术研判报告生成' }}</h2>
          <p>按当前图谱浏览方向推荐研判模板，自动带入研判对象，生成并预览研判报告。</p>
        </div>

        <div class="work-grid">
          <section class="sec-frame tpl-pane">
            <h3><i></i>研判模板 <em>{{ m31Templates.length }} 套</em></h3>
            <div
              v-for="(tpl, idx) in m31Templates"
              :key="tpl.id"
              class="tpl-item"
              :class="{ on: m31SelectedTpl === tpl.id }"
              @click="m31SelectTemplate(tpl)"
            >
              <span class="tpl-no">T{{ idx + 1 }}</span>
              <div class="tpl-meta">
                <b>{{ tpl.name }}</b>
                <span v-if="tpl.recommended" class="rec-badge">智能推荐</span>
                <span v-else class="tpl-hint">点击选择</span>
              </div>
            </div>
          </section>

          <section class="sec-frame obj-pane">
            <h3><i></i>研判对象 <em class="auto">自动带入</em></h3>
            <div class="obj-stats">
              <div class="stat">
                <div class="k">技术方向</div>
                <div class="v">定位定向技术</div>
                <div class="s">来自图谱浏览</div>
              </div>
              <div class="stat">
                <div class="k">创新点统计</div>
                <div class="n">7 <small>个</small></div>
                <div class="s">置信度均值 0.88</div>
              </div>
            </div>
            <div class="tree-cap">三级体系子树</div>
            <div class="tree">
              <div class="tree-root">定位定向技术</div>
              <div class="tree-child gold">
                <i></i>温补技术
                <em>本次试验沉淀</em>
              </div>
              <div class="tree-child"><i></i>定向精度校准</div>
              <div class="tree-child"><i></i>初始对准</div>
            </div>
          </section>

          <section class="sec-frame list-pane">
            <h3><i></i>已生成报告 <em>{{ m31Reports.length }} 份</em></h3>
            <el-input
              v-model="m31FilterDirection"
              clearable
              placeholder="请输入报告名称或研判方向"
            />
            <div class="rpt-list">
              <div
                v-for="rpt in m31FilteredReports"
                :key="rpt.id"
                class="rpt-item"
                @click="m31OpenReport(rpt)"
              >
                <div class="rpt-ico">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>
                </div>
                <div class="rpt-meta">
                  <b>{{ rpt.title }}</b>
                  <div class="rpt-sub">
                    <span>{{ rpt.direction }}</span>
                    <span class="dot">·</span>
                    <span>{{ rpt.time }}</span>
                    <span class="badge" :class="rpt.statusClass"><i></i>{{ rpt.status }}</span>
                  </div>
                </div>
                <button type="button" class="btn-link" @click.stop="m31OpenReport(rpt)">查看</button>
              </div>
              <div v-if="!m31FilteredReports.length" class="rpt-empty">暂无报告</div>
            </div>
          </section>
        </div>
      </template>

  </div>
</template>

<script>
import { useRichPage } from '@/composables/rich/useRichPage'

export default {
  props: { page: Object, title: String },
  setup(props) {
    return useRichPage(props)
  },
}
</script>

<style scoped>
.rich-type-m31 {
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 20px 22px;
  box-shadow: 0 6px 18px rgba(15, 55, 95, .04);
  min-width: 0;
}
.entry-title h2 { font-size: 20px; color: #0d4e83; font-weight: 700; }
.entry-title p { margin-top: 4px; color: #6d8092; font-size: 13.5px; line-height: 1.6; }

.work-grid {
  display: grid;
  grid-template-columns: 252px 288px minmax(0, 1fr);
  gap: 16px;
  margin-top: 16px;
  align-items: stretch;
}
.sec-frame {
  border: 1.5px dashed #b7d4ee;
  border-radius: 12px;
  padding: 14px 16px 16px;
  background: #fff;
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.sec-frame h3 {
  font-size: 15px;
  color: var(--navy-2);
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  flex: 0 0 auto;
}
.sec-frame h3 i {
  width: 4px; height: 16px; background: var(--blue); border-radius: 2px; display: inline-block;
}
.sec-frame h3 em {
  margin-left: auto;
  font-style: normal;
  font-size: 12px;
  font-weight: 500;
  color: #8a99a8;
  background: #f4f8fc;
  padding: 2px 8px;
  border-radius: 8px;
}
.sec-frame h3 em.auto { color: #1668a8; background: #e8f3fb; }

.tpl-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  border: 1px solid #e4ecf4;
  border-radius: 10px;
  cursor: pointer;
  margin-bottom: 8px;
}
.tpl-item:last-child { margin-bottom: 0; }
.tpl-item:hover { background: #f6fafd; }
.tpl-item.on { background: #fffaf0; border-color: #efd291; }
.tpl-no {
  flex: 0 0 28px;
  width: 28px; height: 28px;
  border-radius: 8px;
  display: grid; place-items: center;
  font-size: 11px; font-weight: 700;
  background: #eef5fb; color: #1668a8;
}
.tpl-item.on .tpl-no { background: #d0ab68; color: #fff; }
.tpl-meta { min-width: 0; display: flex; flex-direction: column; gap: 4px; }
.tpl-meta b {
  font-size: 13.5px;
  color: #1f3d5a;
  font-weight: 600;
  white-space: nowrap;
}
.tpl-hint { font-size: 12px; color: #b0bfc8; }
.rec-badge {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  height: 20px;
  padding: 0 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 700;
  color: #8a6000;
  background: #fff8e0;
  border: 1px solid #efd291;
}

.obj-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 14px;
}
.stat {
  background: #f5f9fd;
  border-radius: 10px;
  padding: 12px;
  min-width: 0;
}
.stat .k { font-size: 12px; color: #8a99a8; margin-bottom: 6px; }
.stat .v { font-size: 15px; font-weight: 700; color: #1f3d5a; white-space: nowrap; }
.stat .n { font-size: 24px; font-weight: 800; color: #1668a8; line-height: 1.1; }
.stat .n small { font-size: 13px; font-weight: 400; color: #7a8b9a; }
.stat .s { font-size: 12px; color: #8a99a8; margin-top: 4px; white-space: nowrap; }
.tree-cap { font-size: 12px; color: #8a99a8; font-weight: 600; margin-bottom: 8px; }
.tree-root { color: #1668a8; font-weight: 600; font-size: 13.5px; margin-bottom: 6px; }
.tree-child {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-left: 14px;
  line-height: 2.1;
  color: #4a5a6a;
  font-size: 13px;
  white-space: nowrap;
}
.tree-child i {
  width: 6px; height: 6px; border-radius: 50%; background: #c5d9ea; flex: 0 0 6px;
}
.tree-child.gold i { background: #d0ab68; }
.tree-child em {
  font-style: normal;
  font-size: 11px;
  color: #8a6000;
  background: #fff8e0;
  border: 1px solid #efd291;
  border-radius: 5px;
  padding: 1px 6px;
}

.list-pane :deep(.el-input) { margin-bottom: 10px; flex: 0 0 auto; }
.rpt-list { display: flex; flex-direction: column; gap: 8px; }
.rpt-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid #e4ecf4;
  border-radius: 10px;
  cursor: pointer;
}
.rpt-item:hover { background: #f6fafd; border-color: #c5d9ea; }
.rpt-ico {
  flex: 0 0 36px;
  width: 36px; height: 36px;
  border-radius: 9px;
  background: #eef5fb;
  color: #1668a8;
  display: grid;
  place-items: center;
}
.rpt-ico svg { width: 16px; height: 16px; }
.rpt-meta { flex: 1; min-width: 0; }
.rpt-meta b {
  display: block;
  font-size: 13.5px;
  color: #0d4e83;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.rpt-sub {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 6px;
  font-size: 12px;
  color: #7a8b9a;
}
.rpt-sub .dot { color: #c5d9ea; }
.rpt-empty { padding: 28px; text-align: center; color: #9fb0c0; font-size: 13px; }

.preview-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}
.preview-crumb { display: flex; align-items: center; gap: 8px; min-width: 0; }
.back-link { color: #1668a8; font-size: 13px; cursor: pointer; text-decoration: none; }
.back-link:hover { text-decoration: none; color: #0d4e83; }
.sep { color: #d0dce8; }
.preview-title { font-size: 15px; font-weight: 700; color: var(--navy-2); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.preview-actions { display: flex; gap: 8px; flex: 0 0 auto; }
.preview-actions :deep(.el-button + .el-button) { margin-left: 0; }
.preview-actions :deep(.el-button--primary),
.preview-actions :deep(.el-button--primary > span) { color: #fff !important; }
</style>
