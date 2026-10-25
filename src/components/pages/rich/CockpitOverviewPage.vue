<template>
  <div class="rich-type-m32">


      <!-- 顶部返回条（非首页时显示） -->
      <div v-if="m32Stage!=='home'" class="back-bar" style="margin-bottom:14px" @click="m32Stage='home'">← 返回管理端入口</div>

      <!-- ── stage: home 入口页 ── -->
      <template v-if="m32Stage==='home'">
        <div style="text-align:center;margin-bottom:24px">
          <div style="font-size:22px;font-weight:800;color:var(--navy-2);letter-spacing:.5px">管理端总览驾驶舱</div>
          <div style="font-size:13.5px;color:#7d90a3;margin-top:6px">三大底座平台运行状态总览</div>
        </div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:20px;max-width:900px;margin:0 auto">
          <div class="m32-platform-card" @click="m32Stage='train'">
            <div class="m32-platform-icon"><Icon name="model" /></div>
            <div class="m32-platform-name">大模型训推平台</div>
            <div class="m32-platform-sub">试验鉴定专域预训练</div>
            <div class="m32-platform-link">训练监控看板 →</div>
          </div>
          <div class="m32-platform-card" @click="m32Stage='agent'">
            <div class="m32-platform-icon"><Icon name="flow" /></div>
            <div class="m32-platform-name">智能体编排平台</div>
            <div class="m32-platform-sub">试验鉴定领域智能体工作流</div>
            <div class="m32-platform-link">模板库 →</div>
          </div>
          <div class="m32-platform-card" @click="m32Stage='resource'">
            <div class="m32-platform-icon"><Icon name="book" /></div>
            <div class="m32-platform-name">领域资源库</div>
            <div class="m32-platform-sub">试验鉴定数据资源库</div>
            <div class="m32-platform-link">资产总览 →</div>
          </div>
        </div>
        <div style="text-align:center;margin-top:22px">
          <el-button class="dev-link-btn" @click="goDeviationSummary">
            查看正偏离能力汇总（{{ deviationTotal }} 项）→
          </el-button>
        </div>
      </template>

      <!-- ── stage: train 训练监控看板 ── -->
      <template v-else-if="m32Stage==='train'">
        <div class="toolbar" style="margin-bottom:14px;align-items:center">
          <span style="font-size:14px;font-weight:700;color:var(--navy-2)">{{ trainTask.name }}</span>
          <span class="badge on" style="margin-left:12px">{{ trainTask.statusLabel }}</span>
          <span v-if="trainTask.baseModel" style="margin-left:12px;font-size:12px;color:#7a8b9a">
            {{ trainTask.baseModel }} · {{ trainTask.gpuCluster }} · lr {{ trainTask.lr }} · ETA {{ trainTask.eta }}
          </span>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;grid-template-rows:auto auto;gap:14px">
          <div class="panel" style="padding:14px">
            <div class="m32-chart-title">训练损失曲线（Train / Val）</div>
            <div :ref="el=>{ lossChartEl=el }" style="width:100%;height:200px"></div>
          </div>
          <div class="panel" style="padding:14px">
            <div class="m32-chart-title">评估指标（准确率／召回率／F1）</div>
            <div :ref="el=>{ evalChartEl=el }" style="width:100%;height:200px"></div>
          </div>
          <div class="panel" style="padding:14px">
            <div class="m32-chart-title">GPU 利用率（实时）</div>
            <div :ref="el=>{ gpuChartEl=el }" style="width:100%;height:200px"></div>
          </div>
          <div class="panel" style="padding:14px">
            <div class="m32-chart-title">显存占用曲线</div>
            <div :ref="el=>{ memChartEl=el; el&&initM32TrainCharts() }" style="width:100%;height:200px"></div>
          </div>
        </div>
      </template>

      <!-- ── stage: agent 智能体编排平台 ── -->
      <template v-else-if="m32Stage==='agent'">
        <div class="agent-head">
          <div>
            <div class="agent-head-title">智能体模板库</div>
            <div class="agent-head-sub">试验鉴定领域预制工作流 · 配置后即可运行</div>
          </div>
          <div class="agent-head-stat">
            <span class="agent-head-stat-num">{{ m32Agents.length }}</span>
            <span class="agent-head-stat-label">个可用模板</span>
          </div>
        </div>
        <div class="agent-grid">
          <div
            v-for="agt in m32Agents"
            :key="agt.id"
            class="agent-card"
            :class="{ running: m32RunningId === agt.id }"
          >
            <div class="agent-card-top">
              <div class="agent-icon" :class="'tone-' + agentTone(agt.id)">
                <Icon :name="agentIcon(agt.id)" />
              </div>
              <span class="agent-status">
                <i class="agent-status-dot" />
                {{ m32RunningId === agt.id ? '运行中' : '在线' }}
              </span>
            </div>
            <div class="agent-name">{{ agt.name }}</div>
            <div class="agent-tags">
              <span class="agent-tag"><em>场景</em>{{ agt.scene }}</span>
              <span class="agent-tag"><em>模型</em>{{ agt.model || 'Qwen2.5-32B' }}</span>
            </div>
            <div class="agent-runs">
              <div class="agent-runs-label">累计运行</div>
              <div class="agent-runs-value"><b>{{ agt.runs }}</b><span>次</span></div>
            </div>
            <div class="agent-actions">
              <el-button @click="m32OpenConfig(agt)">配置</el-button>
              <el-button
                type="primary"
                :loading="m32RunningId === agt.id"
                :disabled="!!m32RunningId && m32RunningId !== agt.id"
                @click="m32RunAgent(agt)"
              >{{ m32RunningId === agt.id ? '运行中' : '运行' }}</el-button>
            </div>
          </div>
        </div>

        <el-dialog
          v-model="m32CfgVisible"
          :title="m32CfgForm.name"
          width="560px"
          destroy-on-close
          align-center
        >
          <el-form label-width="6.5em" require-asterisk-position="right" class="agt-form">
            <el-form-item label="适用场景">
              <el-input :model-value="m32CfgForm.scene" disabled />
            </el-form-item>
            <el-form-item label="绑定模型" required>
              <el-select v-model="m32CfgForm.model" style="width:100%">
                <el-option label="Qwen2.5-32B" value="Qwen2.5-32B" />
                <el-option label="Qwen2.5-14B" value="Qwen2.5-14B" />
                <el-option label="DeepSeek-V3" value="DeepSeek-V3" />
                <el-option label="GLM-4" value="GLM-4" />
                <el-option label="Doubao-pro" value="Doubao-pro" />
              </el-select>
            </el-form-item>
            <el-form-item label="温度" required>
              <el-input-number v-model="m32CfgForm.temperature" :min="0" :max="1" :step="0.05" :precision="2" controls-position="right" style="width:100%" />
            </el-form-item>
            <el-form-item label="Top P" required>
              <el-input-number v-model="m32CfgForm.topP" :min="0" :max="1" :step="0.05" :precision="2" controls-position="right" style="width:100%" />
            </el-form-item>
            <el-form-item label="系统提示" required>
              <el-input v-model="m32CfgForm.prompt" type="textarea" :autosize="{ minRows: 3, maxRows: 6 }" placeholder="请输入系统提示词" />
            </el-form-item>
            <el-form-item label="工具能力">
              <el-input v-model="m32CfgForm.tools" type="textarea" :autosize="{ minRows: 2, maxRows: 4 }" placeholder="工具/插件说明" />
            </el-form-item>
          </el-form>
          <template #footer>
            <div class="dlg-actions">
              <el-button @click="m32CfgVisible = false">取消</el-button>
              <el-button type="primary" :loading="m32CfgSaving" @click="m32SaveConfig">保存配置</el-button>
            </div>
          </template>
        </el-dialog>
      </template>

      <!-- ── stage: resource 领域资源库 ── -->
      <template v-else-if="m32Stage==='resource'">
        <div style="font-size:16px;font-weight:700;color:var(--navy-2);margin-bottom:16px">资产总览</div>
        <div class="kpi-row" style="grid-template-columns:repeat(6,1fr);margin-bottom:16px">
          <div v-for="kpi in m32ResourceKpis" :key="kpi.label" class="kpi" :title="kpi.tip || ''">
            <div class="mark"><Icon :name="kpiIcon(kpi.label)" /></div>
            <div class="label">{{ kpi.label }}</div>
            <div class="value">{{ kpi.value }}</div>
            <div
              v-if="kpi.delta"
              class="delta"
              :class="{ up: String(kpi.delta).startsWith('+') }"
            >较上月 {{ kpi.delta }}</div>
          </div>
        </div>
        <div class="panel" style="padding:18px">
          <div class="m32-chart-title">近30日资产增长趋势</div>
          <div :ref="el=>{ resGrowthEl=el; el&&initM32ResourceChart() }" style="width:100%;height:240px"></div>
        </div>
      </template>

  </div>
</template>

<script>
import { useRichPage } from '@/composables/rich/useRichPage'
import Icon from '@/components/Icon.vue'

const AGENT_META = {
  'AGT-01': { icon: 'extract', tone: 'blue' },
  'AGT-02': { icon: 'audit', tone: 'navy' },
  'AGT-03': { icon: 'chat', tone: 'teal' },
}

export default {
  components: { Icon },
  props: { page: Object, title: String },
  setup(props) {
    const pageApi = useRichPage(props)
    function agentIcon(id) {
      return AGENT_META[id]?.icon || 'spark'
    }
    function agentTone(id) {
      return AGENT_META[id]?.tone || 'blue'
    }
    return { ...pageApi, agentIcon, agentTone }
  },
}
</script>

<style scoped>
.dev-link-btn {
  height: 36px;
  border-color: #efd291 !important;
  color: #a36e0c !important;
  background: #fff !important;
}
.dev-link-btn:hover {
  background: #fffaf0 !important;
  border-color: #d0ab68 !important;
  color: #8a6000 !important;
}

.agent-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}
.agent-head-title {
  font-size: 18px;
  font-weight: 800;
  color: var(--navy-2);
  letter-spacing: .3px;
}
.agent-head-sub {
  margin-top: 4px;
  font-size: 12.5px;
  color: #7d90a3;
}
.agent-head-stat {
  flex-shrink: 0;
  display: flex;
  align-items: baseline;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 10px;
  background: linear-gradient(135deg, #f0f6fc, #e8f2fb);
  border: 1px solid #d5e6f5;
}
.agent-head-stat-num {
  font-size: 22px;
  font-weight: 800;
  color: var(--blue);
  line-height: 1;
}
.agent-head-stat-label {
  font-size: 12px;
  color: #6a7f94;
}

.agent-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
}
.agent-card {
  position: relative;
  padding: 20px 20px 18px;
  display: flex;
  flex-direction: column;
  min-height: 240px;
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 14px;
  box-shadow: 0 4px 14px rgba(15, 55, 95, .04);
  overflow: hidden;
  transition: transform .18s, box-shadow .18s, border-color .18s;
}
.agent-card::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--navy), var(--blue));
  opacity: .85;
}
.agent-card:hover {
  transform: translateY(-3px);
  border-color: #c5daf0;
  box-shadow: 0 14px 32px rgba(13, 78, 131, .10);
}
.agent-card.running {
  border-color: #b8d4ef;
  box-shadow: 0 0 0 2px rgba(22, 104, 168, .08), 0 10px 24px rgba(13, 78, 131, .08);
}

.agent-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}
.agent-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  color: #fff;
}
.agent-icon :deep(svg) {
  width: 22px;
  height: 22px;
}
.agent-icon.tone-blue {
  background: linear-gradient(135deg, #1a6fb5, #2f8fd4);
}
.agent-icon.tone-navy {
  background: linear-gradient(135deg, var(--navy), #1a5a8a);
}
.agent-icon.tone-teal {
  background: linear-gradient(135deg, #1a7a8c, #2a9bb0);
}

.agent-status {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 9px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  color: #2d7a4f;
  background: #eef8f1;
  border: 1px solid #cfe8d8;
}
.agent-card.running .agent-status {
  color: var(--blue);
  background: #eef5fb;
  border-color: #c5daf0;
}
.agent-status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  box-shadow: 0 0 0 3px rgba(45, 122, 79, .15);
}
.agent-card.running .agent-status-dot {
  box-shadow: 0 0 0 3px rgba(22, 104, 168, .15);
  animation: agent-pulse 1.2s ease-in-out infinite;
}
@keyframes agent-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: .35; }
}

.agent-name {
  font-size: 15.5px;
  font-weight: 700;
  color: var(--navy-2);
  line-height: 1.35;
  margin-bottom: 12px;
}
.agent-tags {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 14px;
}
.agent-tag {
  display: flex;
  align-items: baseline;
  gap: 8px;
  padding: 7px 10px;
  border-radius: 8px;
  background: #f5f8fb;
  font-size: 12.5px;
  color: var(--navy-2);
  line-height: 1.4;
}
.agent-tag em {
  flex-shrink: 0;
  font-style: normal;
  font-size: 11px;
  font-weight: 600;
  color: #8a9bab;
  min-width: 2em;
}

.agent-runs {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-radius: 10px;
  background: linear-gradient(135deg, #f3f8fd, #eaf3fb);
  border: 1px solid #dceaf6;
  margin-bottom: 16px;
}
.agent-runs-label {
  font-size: 12px;
  color: #6a7f94;
}
.agent-runs-value {
  display: flex;
  align-items: baseline;
  gap: 3px;
}
.agent-runs-value b {
  font-size: 20px;
  font-weight: 800;
  color: var(--blue);
  line-height: 1;
}
.agent-runs-value span {
  font-size: 12px;
  color: #7a8b9a;
}

.agent-actions {
  margin-top: auto;
  display: flex;
  gap: 8px;
}
.agent-actions :deep(.el-button) {
  flex: 1;
}
.agent-actions :deep(.el-button + .el-button) { margin-left: 0; }
.agent-actions :deep(.el-button--primary),
.agent-actions :deep(.el-button--primary > span) { color: #fff !important; }
.dlg-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
.dlg-actions :deep(.el-button + .el-button) { margin-left: 0; }
.dlg-actions :deep(.el-button--primary),
.dlg-actions :deep(.el-button--primary > span) { color: #fff !important; }
.agt-form :deep(.el-form-item__label) {
  justify-content: flex-start;
  text-align: left;
  white-space: nowrap;
  line-height: 32px;
  height: auto;
}
</style>
