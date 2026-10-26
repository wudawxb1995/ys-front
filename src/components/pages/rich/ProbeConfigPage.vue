<template>
  <div class="rich-type-m14">
    <div v-if="m14Wizard" class="m14-wizard">
      <div class="m14-topbar">
        <button type="button" class="m14-back" @click="closeProbeWizard">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          返回探针列表
        </button>
        <span class="m14-sep">|</span>
        <span class="m14-title">{{ m14DialogTitle }}</span>
      </div>
      <p class="m14-wiz-sub">四步完成配置：绑定监测参数 → 判据从指标树同源引用 → 告警级别 → 触发后联动动作。</p>
      <div class="m14-wiz-grid">
        <section class="m14-wiz-card">
          <h3><i>1</i>监测参数绑定</h3>
          <label>探针名称</label>
          <el-input v-model="m14CreateForm.name" maxlength="40" placeholder="如 弹着点散布探针-2" />
          <label>监测参数</label>
          <el-select
            :model-value="m14CreateForm.indicatorId"
            :disabled="!m14CreateForm.treeVer"
            filterable
            placeholder="请先在右侧选择指标树，再选指标"
            style="width:100%"
            @change="m14PickIndicator"
          >
            <el-option v-for="row in m14TreeIndicators" :key="row.id" :label="row.name" :value="row.id" />
          </el-select>
          <label>数据来源</label>
          <el-select v-model="m14CreateForm.dataSrc" style="width:100%">
            <el-option v-for="item in m14DataSrcOpts" :key="item" :label="item" :value="item" />
          </el-select>
          <label>采样方式</label>
          <el-select v-model="m14CreateForm.sampleMode" style="width:100%">
            <el-option v-for="item in m14SampleOpts" :key="item" :label="item" :value="item" />
          </el-select>
        </section>

        <section class="m14-wiz-card">
          <h3><i>2</i>判据配置</h3>
          <button v-if="!m14TreeOpen" type="button" class="m14-tree-btn" @click="m14TreeOpen = true">从指标树选择</button>
          <template v-else>
            <label>指标树</label>
            <el-select
              :model-value="m14CreateForm.treeVer"
              placeholder="先选择已生成的指标树"
              style="width:100%"
              @change="m14PickTree"
            >
              <el-option v-for="tree in m14TreeOptions" :key="tree.value" :label="tree.label" :value="tree.value" />
            </el-select>
            <label>指标</label>
            <el-select
              :model-value="m14CreateForm.indicatorId"
              :disabled="!m14CreateForm.treeVer"
              filterable
              placeholder="再选择该指标树下的指标"
              style="width:100%"
              @change="m14PickIndicator"
            >
              <el-option
                v-for="row in m14TreeIndicators"
                :key="row.id"
                :label="`${row.name}  ${row.criteria}`"
                :value="row.id"
              />
            </el-select>
          </template>
          <div v-if="m14PickedIndicator" class="m14-picked">
            <span>当前判据</span>
            <b>{{ m14PickedIndicator.name }}</b>
            <em>{{ m14PickedIndicator.criteria }}</em>
            <small>引自{{ m14CreateForm.treeVer }}</small>
          </div>
          <p v-else class="m14-wiz-hint">判据不手工录入，请从指标树引用。</p>
          <label>告警级别</label>
          <div class="m14-alarm-picks">
            <button
              v-for="level in m14AlarmOpts"
              :key="level"
              type="button"
              :class="{ on: m14CreateForm.alarmLevel === level }"
              @click="m14CreateForm.alarmLevel = level"
            >{{ level }}</button>
          </div>
          <el-checkbox v-model="m14CreateForm.autoCause">触发后自动启动根因分析</el-checkbox>
        </section>

        <section class="m14-wiz-card m14-wiz-graph">
          <h3><i>3</i>挂载推理图谱</h3>
          <div class="m14-graph-stats">
            <div><b>128</b><span>图谱节点</span></div>
            <div><b>214</b><span>关系</span></div>
            <div><b>6</b><span>历史案例</span></div>
          </div>
          <p>探针保存后自动挂载至推理图谱子图，异常触发时沿图谱开展根因推理。</p>
          <el-button type="primary" class="m14-save" @click="submitCreateProbe">保存探针</el-button>
        </section>
      </div>
    </div>

    <!-- ═══ 第二级：探针配置详情（白底整卡） ═══ -->
    <div v-else-if="m14Detail" class="m14-detail-shell">
      <div class="m14-topbar">
        <button type="button" class="m14-back" @click="m14Detail = null">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          返回探针列表
        </button>
        <span class="m14-sep">|</span>
        <span class="m14-title">{{ m14Detail.name }}</span>
        <span class="badge" :class="m14Detail.enabled ? 'run' : 'hold'">
          <i></i>{{ m14Detail.enabled ? '已启用，待检测' : '已停用' }}
        </span>
      </div>

      <div class="m14-stack">
        <!-- 上部：基础信息 + 监测参数绑定 -->
        <div class="m14-row2">
          <section class="m14-dash">
            <h3 class="m14-dash-title"><i></i>探针基础信息</h3>
            <div class="m14-kv-grid">
              <div class="m14-kv">
                <div class="lab">探针名称</div>
                <div class="val strong">{{ m14Detail.name }}</div>
              </div>
              <div class="m14-kv">
                <div class="lab">状态</div>
                <span class="badge" :class="m14Detail.enabled ? 'run' : 'hold'">
                  <i></i>{{ m14Detail.enabled ? '已启用，待检测' : '已停用' }}
                </span>
              </div>
              <div class="m14-kv">
                <div class="lab">探针编号</div>
                <div class="val">{{ m14Detail.id }}</div>
              </div>
              <div class="m14-kv">
                <div class="lab">监测对象</div>
                <div class="val">{{ m14Detail.obj }}</div>
              </div>
              <div class="m14-kv">
                <div class="lab">监测参数数</div>
                <div class="val">{{ m14Detail.metrics }} 个</div>
              </div>
              <div class="m14-kv">
                <div class="lab">最近更新</div>
                <div class="val">{{ m14Detail.updated }}</div>
              </div>
            </div>
          </section>

          <section class="m14-dash">
            <h3 class="m14-dash-title"><i></i>监测参数绑定</h3>
            <div class="m14-bind-list">
              <div class="m14-bind-row">
                <span class="lab">绑定参数</span>
                <span class="val">{{ m14Detail.bindParam || '立靶高低偏差' }}</span>
              </div>
              <div class="m14-bind-row">
                <span class="lab">数据来源</span>
                <span class="val">{{ m14Detail.dataSrc || '弹道测量文件' }}</span>
              </div>
              <div class="m14-bind-row">
                <span class="lab">采集频率</span>
                <span class="val">每发一次</span>
              </div>
            </div>
          </section>
        </div>

        <!-- 中部：判据配置 -->
        <section class="m14-dash">
          <h3 class="m14-dash-title"><i></i>判据配置</h3>
          <div class="m14-table-wrap">
            <table>
              <thead>
                <tr>
                  <th class="col-name">判据名称</th>
                  <th class="col-th">阈值</th>
                  <th>来源</th>
                  <th class="col-act">执行动作</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="strong">主判据</td>
                  <td class="crit">{{ mainCriteriaText }}</td>
                  <td>
                    <button type="button" class="m14-cite" @click="previewProbeCite(m14Detail.srcNode)">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                      引自指标树V1.0 · {{ m14Detail.srcNode }}
                    </button>
                  </td>
                  <td class="warn">触发告警</td>
                </tr>
                <tr>
                  <td class="strong">方向偏差</td>
                  <td class="crit">立靶方向偏差 ≤ 0.30 mil</td>
                  <td>
                    <button type="button" class="m14-cite" @click="previewProbeCite(m14Detail.srcNode)">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                      引自指标树V1.0 · {{ m14Detail.srcNode }}
                    </button>
                  </td>
                  <td class="warn">触发告警</td>
                </tr>
                <tr>
                  <td class="strong">统计窗口</td>
                  <td class="muted">单发判定</td>
                  <td><span class="sys">--</span></td>
                  <td class="muted">—</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- 下部：告警级别 + 图谱引用 -->
        <div class="m14-row2">
          <section class="m14-dash">
            <h3 class="m14-dash-title"><i></i>告警级别配置</h3>
            <div class="m14-alarm-list">
              <div class="m14-alarm">
                <div class="left"><span class="dot d1"></span><span>一级告警</span></div>
                <span class="desc">任一分量超限 → 立即上报</span>
              </div>
              <div class="m14-alarm">
                <div class="left"><span class="dot d2"></span><span>二级预警</span></div>
                <span class="desc">偏差 &gt; 0.25 mil → 记录关注</span>
              </div>
              <div class="m14-alarm">
                <div class="left"><span class="dot d3"></span><span>正常</span></div>
                <span class="desc">偏差 ≤ 0.25 mil → 正常通过</span>
              </div>
            </div>
          </section>

          <section class="m14-graph">
            <div class="m14-graph-head">
              <span class="tit">
                <svg viewBox="0 0 24 24" fill="none" stroke="#1668a8" stroke-width="1.8">
                  <circle cx="12" cy="5" r="2.2"/><circle cx="5" cy="19" r="2.2"/><circle cx="19" cy="19" r="2.2"/>
                  <line x1="12" y1="7.2" x2="5.8" y2="17"/><line x1="12" y1="7.2" x2="18.2" y2="17"/><line x1="7.2" y1="19" x2="16.8" y2="19"/>
                </svg>
                探针推理图谱引用信息
              </span>
              <span class="ro">只读</span>
            </div>
            <div class="m14-graph-grid">
              <div class="row"><span class="lab">图谱名称</span><span class="val">精度试验故障模式图谱</span></div>
              <div class="row"><span class="lab">图谱版本</span><span class="val">V1.0</span></div>
              <div class="row"><span class="lab">节点总数</span><span class="val strong">120 余个</span></div>
              <div class="row"><span class="lab">关系总数</span><span class="val strong">200 余条</span></div>
              <div class="row"><span class="lab">最近更新</span><span class="val">2024-10-15</span></div>
              <div class="row"><span class="lab">来源</span><span class="val">第一部分</span></div>
            </div>
          </section>
        </div>
      </div>
    </div>

    <!-- ═══ 第一级：探针列表 ═══ -->
    <div v-else class="crud-body m14-list-card">
      <div class="toolbar m14-toolbar">
        <el-button type="primary" @click="openCreateProbe">＋ 新建探针</el-button>
        <el-button :disabled="!m14CheckedIds.length" @click="enableSelectedProbes">批量启用</el-button>
        <el-button :disabled="!m14CheckedIds.length" @click="disableSelectedProbes">批量停用</el-button>
        <div class="m14-search">
          <el-input
            v-model="m14Search"
            clearable
            placeholder="搜索探针名称…"
            style="width: 220px"
            @keyup.enter="applyM14Search"
            @clear="applyM14Search"
          />
          <el-button type="primary" @click="applyM14Search">查询</el-button>
        </div>
      </div>

      <div class="table-inner m14-table-inner">
        <table>
          <thead>
            <tr>
              <th class="col-check">
                <el-checkbox
                  :model-value="m14AllPageChecked()"
                  :indeterminate="m14SomePageChecked()"
                  @change="m14ToggleAllPage"
                />
              </th>
              <th class="col-idx">序号</th>
              <th>探针名称</th>
              <th style="width:130px">监测对象</th>
              <th style="width:220px">判据阈值</th>
              <th style="width:130px">状态</th>
              <th style="width:150px">判据来源</th>
              <th style="width:120px">最近触发时间</th>
              <th style="width:110px;text-align:center">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(p, i) in pageRows"
              :key="p.id"
            >
              <td class="col-check">
                <el-checkbox
                  :model-value="m14IsChecked(p.id)"
                  @change="(v) => m14ToggleOne(p.id, v)"
                />
              </td>
              <td class="col-idx">{{ String((m14PageNo - 1) * m14PageSize + i + 1).padStart(2, '0') }}</td>
              <td>
                <button type="button" class="m14-name-link" @click="m14Detail = p">{{ p.name }}</button>
              </td>
              <td>{{ p.obj }}</td>
              <td class="mono">{{ p.criteria }}</td>
              <td>
                <span class="badge" :class="p.enabled ? 'run' : 'hold'">
                  <i></i>{{ p.enabled ? '已启用，待检测' : '已停用' }}
                </span>
              </td>
              <td>
                <span class="m14-cite-sm">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                  引自{{ p.treeVer || '指标树 V1.0' }}
                </span>
              </td>
              <td class="time">{{ p.lastTrigger || '—' }}</td>
              <td style="text-align:center">
                <div class="ops" style="justify-content:center">
                  <button type="button" @click="openEditProbe(p)">配置</button>
                  <button type="button" @click="toggleProbe(p)">{{ p.enabled ? '停用' : '启用' }}</button>
                </div>
              </td>
            </tr>
            <tr
              v-for="n in emptyPad"
              :key="'e' + n"
              class="empty-row"
            >
              <td colspan="9"></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pager">
        <span>共 <b>{{ m14FilteredList.length }}</b> 条记录</span>
        <div class="pages">
          <button class="pg" type="button" :disabled="m14PageNo === 1" @click="m14PageNo--">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M15 6l-6 6 6 6"/></svg>
          </button>
          <button
            v-for="n in pageCount"
            :key="n"
            type="button"
            class="pg"
            :class="{ cur: n === m14PageNo }"
            @click="m14PageNo = n"
          >{{ n }}</button>
          <button class="pg" type="button" :disabled="m14PageNo === pageCount" @click="m14PageNo++">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M9 6l6 6-6 6"/></svg>
          </button>
        </div>
      </div>
    </div>

    <!-- 新建探针 -->
    <el-dialog
      v-model="m14CreateVisible"
      :title="m14DialogTitle"
      width="560px"
      align-center
      destroy-on-close
      :close-on-click-modal="false"
      class="m14-create-dlg"
      @closed="m14EditingId = null"
    >
      <el-form
        label-width="7.2em"
        require-asterisk-position="right"
        class="m14-create-form"
      >
        <el-form-item label="探针名称" required>
          <el-input v-model="m14CreateForm.name" maxlength="40" placeholder="如 弹着点散布探针" />
        </el-form-item>
        <el-form-item label="监测对象" required>
          <el-select v-model="m14CreateForm.obj" filterable allow-create default-first-option style="width:100%" placeholder="请选择或输入">
            <el-option v-for="o in m14ObjOpts" :key="o" :label="o" :value="o" />
          </el-select>
        </el-form-item>
        <el-form-item label="判据阈值" required>
          <el-input v-model="m14CreateForm.criteria" maxlength="80" placeholder="如 |dH|≤0.30mil & |dL|≤0.30mil" />
        </el-form-item>
        <el-form-item label="绑定参数">
          <el-input v-model="m14CreateForm.bindParam" maxlength="40" placeholder="默认与监测对象一致，如 立靶高低偏差" />
        </el-form-item>
        <el-form-item label="数据来源">
          <el-input v-model="m14CreateForm.dataSrc" maxlength="40" placeholder="如 弹道测量文件" />
        </el-form-item>
        <el-form-item label="指标树节点">
          <el-select v-model="m14CreateForm.srcNode" filterable style="width:100%" placeholder="引自指标树">
            <el-option v-for="o in m14SrcNodeOpts" :key="o" :label="o" :value="o" />
          </el-select>
        </el-form-item>
        <el-form-item label="监测参数数">
          <el-input-number v-model="m14CreateForm.metrics" :min="1" :max="20" controls-position="right" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="m14-dlg-foot">
          <el-button @click="m14CreateVisible = false">取消</el-button>
          <el-button type="primary" @click="submitCreateProbe">保存配置</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useRichPage } from '@/composables/rich/useRichPage'

export default {
  props: { page: Object, title: String },
  setup(props) {
    const bag = useRichPage(props)
    const pageRows = computed(() => {
      const list = bag.m14FilteredList?.value ?? bag.m14FilteredList ?? []
      const no = bag.m14PageNo?.value ?? bag.m14PageNo ?? 1
      const size = bag.m14PageSize ?? 10
      const start = (no - 1) * size
      return list.slice(start, start + size)
    })
    const pageCount = computed(() => {
      const list = bag.m14FilteredList?.value ?? bag.m14FilteredList ?? []
      const size = bag.m14PageSize ?? 10
      return Math.max(1, Math.ceil(list.length / size))
    })
    const emptyPad = computed(() => {
      const size = bag.m14PageSize ?? 10
      return Math.max(0, size - pageRows.value.length)
    })
    const mainCriteriaText = computed(() => {
      const d = bag.m14Detail?.value ?? bag.m14Detail
      if (!d) return '立靶高低偏差 ≤ 0.30 mil'
      if (d.id === 'P01' || d.name?.includes('弹着点')) return '立靶高低偏差 ≤ 0.30 mil'
      return d.criteria || '立靶高低偏差 ≤ 0.30 mil'
    })
    return {
      ...bag,
      pageRows,
      pageCount,
      emptyPad,
      mainCriteriaText,
    }
  },
}
</script>

<style scoped>
/* 白底整卡壳 */
.m14-detail-shell {
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: #fff;
  border: 1px solid var(--line, #e0eaf3);
  border-radius: 12px;
  padding: 18px 20px 16px;
  box-shadow: 0 6px 18px rgba(15, 55, 95, .04);
}
.m14-topbar {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 36px;
}
.m14-back {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border: 0;
  background: none;
  padding: 0;
  color: #1668a8;
  font-size: 13px;
  cursor: pointer;
}
.m14-back:hover { color: #0d4e83; }
.m14-back svg { width: 13px; height: 13px; }
.m14-sep { color: #d0dce8; }
.m14-title {
  font-weight: 700;
  font-size: 15px;
  color: #1f3d5a;
}
.m14-wiz-sub { margin: 0; font-size: 13px; color: #7c8fa2; }
.m14-wiz-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  align-items: stretch;
}
.m14-wiz-card {
  background: #fff;
  border: 1px solid #e3edf6;
  border-radius: 12px;
  padding: 16px 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 420px;
}
.m14-wiz-card h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 6px;
  font-size: 15px;
  color: #1f3d5a;
}
.m14-wiz-card h3 i {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #1668a8;
  color: #fff;
  font-style: normal;
  font-size: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.m14-wiz-card label { font-size: 13px; color: #5c7084; margin-top: 4px; }
.m14-tree-btn {
  height: 40px;
  border: 1px dashed #9ec8e8;
  background: #f4f9fd;
  color: #1668a8;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
}
.m14-picked {
  background: #f7fbfe;
  border: 1px solid #d5e6f4;
  border-radius: 8px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.m14-picked span, .m14-picked small { font-size: 12px; color: #7c8fa2; }
.m14-picked b { color: #1f3d5a; font-size: 14px; }
.m14-picked em { font-style: normal; color: #0d4e83; font-weight: 700; }
.m14-wiz-hint { margin: 0; font-size: 12px; color: #8aa0b3; }
.m14-alarm-picks { display: flex; gap: 8px; }
.m14-alarm-picks button {
  flex: 1;
  height: 34px;
  border: 1px solid #d5e4f0;
  background: #fff;
  border-radius: 8px;
  color: #3f5062;
  cursor: pointer;
}
.m14-alarm-picks button.on {
  border-color: #1668a8;
  background: #e8f3fb;
  color: #0d4e83;
  font-weight: 700;
}
.m14-graph-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  background: #f4f9fd;
  border-radius: 10px;
  padding: 14px 8px;
  text-align: center;
}
.m14-graph-stats b { display: block; font-size: 22px; color: #1668a8; }
.m14-graph-stats span { font-size: 12px; color: #7c8fa2; }
.m14-wiz-graph p { margin: 0; font-size: 13px; line-height: 1.6; color: #5c7084; }
.m14-save { margin-top: auto; width: 100%; }

.m14-stack { display: flex; flex-direction: column; gap: 14px; }
.m14-row2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  align-items: stretch;
}

/* 虚线框分段 */
.m14-dash {
  background: #fff;
  border: 1.5px dashed #b7d4ee;
  border-radius: 12px;
  padding: 14px 16px 16px;
  min-width: 0;
}
.m14-dash-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 700;
  color: #1f3d5a;
  margin: 0 0 12px;
}
.m14-dash-title i {
  width: 4px;
  height: 16px;
  background: var(--blue, #1668a8);
  border-radius: 2px;
  display: inline-block;
}

.m14-kv-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 20px;
}
.m14-kv .lab { font-size: 12px; color: #8a99a8; margin-bottom: 4px; }
.m14-kv .val { font-size: 13.5px; color: #333; }
.m14-kv .val.strong { font-weight: 600; color: #1a2b3c; }

.m14-bind-list { display: flex; flex-direction: column; gap: 10px; }
.m14-bind-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  background: #f4f8fc;
  border-radius: 6px;
}
.m14-bind-row .lab { font-size: 13px; color: #5a6978; font-weight: 500; }
.m14-bind-row .val { font-size: 13px; color: #1a2b3c; font-weight: 600; }

.m14-table-wrap {
  border: 1px solid var(--line, #e0eaf3);
  border-radius: 8px;
  overflow: hidden;
}
.m14-table-wrap table { width: 100%; border-collapse: collapse; }
.m14-table-wrap th {
  background: #f3f8fd;
  color: #3f5062;
  font-size: 13px;
  font-weight: 600;
  padding: 10px 14px;
  text-align: left;
  white-space: nowrap;
  border-bottom: 1px solid var(--line, #e0eaf3);
}
.m14-table-wrap td {
  padding: 12px 14px;
  font-size: 13.5px;
  border-bottom: 1px solid #eef3f8;
  vertical-align: middle;
}
.m14-table-wrap tr:last-child td { border-bottom: none; }
.col-name { width: 120px; }
.col-th { width: 220px; }
.col-act { width: 100px; }
.strong { font-weight: 500; }
.crit { font-size: 13.5px; font-weight: 700; color: #0d4e83; }
.warn { color: #d48806; font-size: 13px; }
.muted { color: #5a6978; }
.sys { font-size: 12px; color: #8a99a8; }

.m14-cite {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #1668a8;
  background: #e8f2fb;
  border: 1px solid #b8d9f4;
  padding: 3px 10px;
  border-radius: 8px;
  cursor: pointer;
  white-space: nowrap;
}
.m14-cite:hover { background: #dceefb; }
.m14-cite svg { width: 11px; height: 11px; flex-shrink: 0; }

.m14-alarm-list { display: flex; flex-direction: column; gap: 8px; }
.m14-alarm {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 14px;
  border: 1px solid #e8f2fb;
  border-radius: 6px;
}
.m14-alarm .left {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 500;
  color: #1a2b3c;
}
.m14-alarm .dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}
.m14-alarm .dot.d1 { background: #d4380d; }
.m14-alarm .dot.d2 { background: #d48806; }
.m14-alarm .dot.d3 { background: #22913c; }
.m14-alarm .desc { font-size: 13px; color: #5a6978; }

.m14-graph {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f8fbff;
  border-left: 3px solid #1668a8;
  border-radius: 0 8px 8px 0;
  padding: 16px 18px;
  min-width: 0;
  box-sizing: border-box;
}
.m14-graph-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
  flex-shrink: 0;
}
.m14-graph-head .tit {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: #1a2b3c;
}
.m14-graph-head .tit svg { width: 17px; height: 17px; }
.m14-graph-head .ro {
  font-size: 12px;
  color: #8a99a8;
  background: #eef4fa;
  padding: 2px 8px;
  border-radius: 4px;
}
.m14-graph-grid {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px 28px;
  align-content: space-evenly;
  min-height: 112px;
}
.m14-graph-grid .row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  padding: 6px 0;
  line-height: 1.5;
}
.m14-graph-grid .lab { font-size: 13px; color: #8a99a8; }
.m14-graph-grid .val { font-size: 13.5px; color: #1a2b3c; }
.m14-graph-grid .val.strong { font-weight: 600; }

/* 列表：工具栏与表格间距减半；搜索靠左 + 查询 */
.m14-list-card :deep(.m14-toolbar) {
  padding: 16px 16px 8px;
}
.m14-list-card :deep(.m14-table-inner) {
  padding-top: 7px;
}
.m14-search {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-left: 8px;
}
.col-check {
  width: 44px;
  text-align: center !important;
  vertical-align: middle;
}
.col-check :deep(.el-checkbox) {
  height: auto;
}
.m14-dlg-foot :deep(.el-button + .el-button),
.m14-search :deep(.el-button + .el-button) {
  margin-left: 0;
}

.m14-name-link {
  border: 0;
  background: none;
  padding: 0;
  color: #1668a8;
  font-weight: 500;
  font-size: inherit;
  cursor: pointer;
}
.m14-name-link:hover { color: #0d4e83; text-decoration: underline; }
.mono {
  font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
  font-size: 13px;
  color: #0d4e83;
}
.time { color: #8a99a8; }
.m14-cite-sm {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 11.5px;
  color: #1668a8;
  background: #e8f2fb;
  border: 1px solid #b8d9f4;
  padding: 2px 7px;
  border-radius: 8px;
  white-space: nowrap;
}
.m14-cite-sm svg { width: 10px; height: 10px; flex-shrink: 0; }

.m14-dlg-foot {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
.m14-create-form :deep(.el-form-item__label) {
  text-align: left;
  justify-content: flex-start;
  white-space: nowrap;
}
</style>
