<template>
  <div class="rich-type-m14">


      <!-- 详情页 -->
      <template v-if="m14Detail">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:18px">
          <span @click="m14Detail=null" style="cursor:pointer;color:#1668a8;font-size:13px;display:flex;align-items:center;gap:4px">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:15px;height:15px"><polyline points="15 18 9 12 15 6"/></svg>
            返回探针列表
          </span>
          <span style="color:#c4cdd6;font-size:13px">/</span>
          <span style="font-size:13px;color:#5a6978">{{ m14Detail.name }}</span>
        </div>

        <!-- 三行布局：上（基础信息+监测参数）/ 中（判据配置）/ 下（告警级别+图谱信息卡） -->
        <div style="display:flex;flex-direction:column;gap:16px">

          <!-- 上部：探针基础信息（左）+ 监测参数绑定（右） -->
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
            <!-- 基础信息卡 -->
            <div class="panel">
              <h3><i></i>探针基础信息</h3>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px 20px;margin-top:8px">
                <div><div style="font-size:12px;color:#8a99a8;margin-bottom:3px">探针名称</div><div style="font-weight:600;color:#1a2b3c">{{ m14Detail.name }}</div></div>
                <div><div style="font-size:12px;color:#8a99a8;margin-bottom:3px">状态</div><span class="badge" :class="m14Detail.enabled ? 'on' : 'hold'"><i></i>{{ m14Detail.enabled ? '已启用' : '已停用' }}</span></div>
                <div><div style="font-size:12px;color:#8a99a8;margin-bottom:3px">探针编号</div><div style="color:#333">{{ m14Detail.id }}</div></div>
                <div><div style="font-size:12px;color:#8a99a8;margin-bottom:3px">监测对象</div><div style="color:#333">{{ m14Detail.obj }}</div></div>
                <div><div style="font-size:12px;color:#8a99a8;margin-bottom:3px">监测参数数</div><div style="color:#333">{{ m14Detail.metrics }} 个</div></div>
                <div><div style="font-size:12px;color:#8a99a8;margin-bottom:3px">最近更新</div><div style="color:#333">{{ m14Detail.updated }}</div></div>
              </div>
            </div>
            <!-- 监测参数绑定 -->
            <div class="panel">
              <h3><i></i>监测参数绑定</h3>
              <div style="margin-top:10px;display:flex;flex-direction:column;gap:10px">
                <div style="display:flex;justify-content:space-between;padding:10px 14px;background:#f4f8fc;border-radius:6px">
                  <span style="font-size:13px;color:#5a6978;font-weight:500">绑定参数</span>
                  <span style="font-size:13px;color:#1a2b3c;font-weight:600">立靶高低偏差</span>
                </div>
                <div style="display:flex;justify-content:space-between;padding:10px 14px;background:#f4f8fc;border-radius:6px">
                  <span style="font-size:13px;color:#5a6978;font-weight:500">数据来源</span>
                  <span style="font-size:13px;color:#1a2b3c">弹道测量文件</span>
                </div>
                <div style="display:flex;justify-content:space-between;padding:10px 14px;background:#f4f8fc;border-radius:6px">
                  <span style="font-size:13px;color:#5a6978;font-weight:500">采集频率</span>
                  <span style="font-size:13px;color:#1a2b3c">每发一次</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 中部：判据配置区（全宽） -->
          <div class="panel">
            <h3><i></i>判据配置</h3>
            <div class="table-wrap" style="margin-top:10px">
              <table>
                <thead>
                  <tr>
                    <th style="width:120px">判据名称</th>
                    <th style="width:200px">阈值</th>
                    <th>来源</th>
                    <th style="width:100px">执行动作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style="font-weight:500">主判据</td>
                    <td style="font-size:13.5px;font-weight:700;color:#0d4e83">
                      立靶高低偏差 ≤ 0.30 mil
                    </td>
                    <td>
                      <span style="display:inline-flex;align-items:center;gap:4px;font-size:12px;color:#1668a8;background:#e8f2fb;border:1px solid #b8d9f4;padding:3px 10px;border-radius:8px;cursor:pointer"
                        @click="$emit('toast','预览：散布精度指标 → 试验大纲第3章3.1.1条')">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:11px;height:11px;flex-shrink:0"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                        引自 指标树V1.0 · {{ m14Detail.srcNode }}
                      </span>
                    </td>
                    <td style="color:#d48806;font-size:13px">触发告警</td>
                  </tr>
                  <tr>
                    <td style="font-weight:500">方向偏差</td>
                    <td style="font-size:13.5px;font-weight:700;color:#0d4e83">
                      立靶方向偏差 ≤ 0.30 mil
                    </td>
                    <td>
                      <span style="display:inline-flex;align-items:center;gap:4px;font-size:12px;color:#1668a8;background:#e8f2fb;border:1px solid #b8d9f4;padding:3px 10px;border-radius:8px;cursor:pointer"
                        @click="$emit('toast','预览：散布精度指标 → 试验大纲第3章3.1.1条')">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:11px;height:11px;flex-shrink:0"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                        引自 指标树V1.0 · {{ m14Detail.srcNode }}
                      </span>
                    </td>
                    <td style="color:#d48806;font-size:13px">触发告警</td>
                  </tr>
                  <tr>
                    <td style="font-weight:500">统计窗口</td>
                    <td style="color:#5a6978">单发判定</td>
                    <td><span style="font-size:12px;color:#8a99a8">系统默认</span></td>
                    <td style="color:#8a99a8;font-size:13px">—</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- 下部：告警级别配置（左）+ 图谱引用信息卡（右） -->
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;align-items:start">
            <!-- 告警级别配置 -->
            <div class="panel">
              <h3><i></i>告警级别配置</h3>
              <div style="margin-top:10px;display:flex;flex-direction:column;gap:8px">
                <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 14px;border:1px solid #e8f2fb;border-radius:6px">
                  <div style="display:flex;align-items:center;gap:8px">
                    <span style="width:10px;height:10px;border-radius:50%;background:#d4380d;display:inline-block"></span>
                    <span style="font-size:13px;font-weight:500;color:#1a2b3c">一级告警</span>
                  </div>
                  <span style="font-size:13px;color:#5a6978">任一分量超限 → 立即上报</span>
                </div>
                <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 14px;border:1px solid #e8f2fb;border-radius:6px">
                  <div style="display:flex;align-items:center;gap:8px">
                    <span style="width:10px;height:10px;border-radius:50%;background:#d48806;display:inline-block"></span>
                    <span style="font-size:13px;font-weight:500;color:#1a2b3c">二级预警</span>
                  </div>
                  <span style="font-size:13px;color:#5a6978">偏差 &gt; 0.25 mil → 记录关注</span>
                </div>
                <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 14px;border:1px solid #e8f2fb;border-radius:6px">
                  <div style="display:flex;align-items:center;gap:8px">
                    <span style="width:10px;height:10px;border-radius:50%;background:#22913c;display:inline-block"></span>
                    <span style="font-size:13px;font-weight:500;color:#1a2b3c">正常</span>
                  </div>
                  <span style="font-size:13px;color:#5a6978">偏差 ≤ 0.25 mil → 正常通过</span>
                </div>
              </div>
            </div>

            <!-- 图谱引用信息卡（只读） -->
            <div style="background:#f8fbff;border-left:3px solid #1668a8;border-radius:0 8px 8px 0;padding:16px">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
                <span style="font-size:14px;font-weight:600;color:#1a2b3c;display:flex;align-items:center;gap:6px">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#1668a8" stroke-width="1.8" style="width:17px;height:17px">
                    <circle cx="12" cy="5"  r="2.2"/>
                    <circle cx="5"  cy="19" r="2.2"/>
                    <circle cx="19" cy="19" r="2.2"/>
                    <line x1="12" y1="7.2"  x2="5.8"  y2="17"/>
                    <line x1="12" y1="7.2"  x2="18.2" y2="17"/>
                    <line x1="7.2" y1="19"  x2="16.8" y2="19"/>
                  </svg>
                  探针推理图谱引用信息
                </span>
                <span style="font-size:12px;color:#8a99a8;background:#eef4fa;padding:2px 8px;border-radius:4px">只读</span>
              </div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px 20px">
                <div style="display:flex;justify-content:space-between"><span style="font-size:13px;color:#8a99a8">图谱名称</span><span style="font-size:13px;font-weight:500;color:#1a2b3c">精度试验故障模式图谱</span></div>
                <div style="display:flex;justify-content:space-between"><span style="font-size:13px;color:#8a99a8">图谱版本</span><span style="font-size:13px;color:#1a2b3c">V1.0</span></div>
                <div style="display:flex;justify-content:space-between"><span style="font-size:13px;color:#8a99a8">节点总数</span><span style="font-size:13px;font-weight:500;color:#1a2b3c">120 余个</span></div>
                <div style="display:flex;justify-content:space-between"><span style="font-size:13px;color:#8a99a8">关系总数</span><span style="font-size:13px;font-weight:500;color:#1a2b3c">200 余条</span></div>
                <div style="display:flex;justify-content:space-between"><span style="font-size:13px;color:#8a99a8">最近更新</span><span style="font-size:13px;color:#1a2b3c">2024-10-15</span></div>
                <div style="display:flex;justify-content:space-between"><span style="font-size:13px;color:#8a99a8">来源</span><span style="font-size:13px;color:#1a2b3c">第一部分</span></div>
              </div>
              <div style="margin-top:12px;padding:8px 10px;background:#fffbe6;border-radius:4px;font-size:12px;color:#7a5a10">
                ⚠ 此图谱为只读背景资产，如需查看完整图谱请切换至增量式智能探针推理图谱构建系统
              </div>
            </div>
          </div>

        </div>
      </template>

      <!-- 列表页 -->
      <template v-else>
        <div style="height:8px"></div>
        <div class="crud-body">
          <!-- 工具栏 -->
          <div class="toolbar" style="padding-top:16px">
            <button class="btn btn-primary" @click="toast('新建探针功能即将上线')">＋ 新建探针</button>
            <button class="btn btn-outline" @click="enableAllProbes">批量启用</button>
            <span class="spacer"></span>
            <input placeholder="搜索探针名称…" style="width:200px;padding:6px 12px;border:1px solid #d6e4f0;border-radius:6px;font-size:13px;outline:none;color:#3f5062" />
          </div>
          <!-- 表格 -->
          <div class="table-inner">
            <table>
              <thead>
                <tr>
                  <th class="col-idx">序号</th>
                  <th>探针名称</th>
                  <th style="width:130px">监测对象</th>
                  <th style="width:220px">判据阈值</th>
                  <th style="width:90px">状态</th>
                  <th style="width:150px">判据来源</th>
                  <th style="width:110px">最近更新</th>
                  <th style="width:110px;text-align:center">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(p, i) in probeList.slice((m14PageNo-1)*m14PageSize, m14PageNo*m14PageSize)" :key="p.id">
                  <td class="col-idx">{{ String((m14PageNo-1)*m14PageSize+i+1).padStart(2,'0') }}</td>
                  <td>
                    <span style="color:#1668a8;cursor:pointer;font-weight:500" @click="m14Detail=p">{{ p.name }}</span>
                  </td>
                  <td>{{ p.obj }}</td>
                  <td style="font-family:monospace;font-size:13px;color:#0d4e83">{{ p.criteria }}</td>
                  <td><span class="badge" :class="p.enabled ? 'on' : 'hold'"><i></i>{{ p.enabled ? '已启用' : '已停用' }}</span></td>
                  <td>
                    <span style="display:inline-flex;align-items:center;gap:3px;font-size:11.5px;color:#1668a8;background:#e8f2fb;border:1px solid #b8d9f4;padding:2px 7px;border-radius:8px;white-space:nowrap">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:10px;height:10px;flex-shrink:0"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                      引自指标树V1.0
                    </span>
                  </td>
                  <td style="color:#8a99a8">{{ p.updated }}</td>
                  <td style="text-align:center">
                    <div class="ops" style="justify-content:center">
                      <button @click="m14Detail=p">配置</button>
                      <button @click="toggleProbe(p)">{{ p.enabled ? '停用' : '启用' }}</button>
                    </div>
                  </td>
                </tr>
                <!-- 补空行保持表格高度一致 -->
                <tr v-for="n in Math.max(0, m14PageSize - probeList.slice((m14PageNo-1)*m14PageSize, m14PageNo*m14PageSize).length)" :key="'e'+n" class="empty-row">
                  <td colspan="8"></td>
                </tr>
              </tbody>
            </table>
          </div>
          <!-- 分页 -->
          <div class="pager">
            <span>共 <b>{{ probeList.length }}</b> 条记录</span>
            <div class="pages">
              <button class="pg" :disabled="m14PageNo===1" @click="m14PageNo--">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M15 6l-6 6 6 6"/></svg>
              </button>
              <button v-for="n in Math.ceil(probeList.length/m14PageSize)" :key="n"
                class="pg" :class="{ cur: n===m14PageNo }" @click="m14PageNo=n">{{ n }}</button>
              <button class="pg" :disabled="m14PageNo===Math.ceil(probeList.length/m14PageSize)" @click="m14PageNo++">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M9 6l6 6-6 6"/></svg>
              </button>
            </div>
          </div>
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
