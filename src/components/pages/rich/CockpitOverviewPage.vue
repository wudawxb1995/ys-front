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
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;grid-template-rows:auto auto;gap:14px">
          <div class="panel" style="padding:14px">
            <div class="m32-chart-title">训练损失曲线</div>
            <div :ref="el=>{ lossChartEl=el }" style="width:100%;height:200px"></div>
          </div>
          <div class="panel" style="padding:14px">
            <div class="m32-chart-title">评估指标变化（准确率／召回率）</div>
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
        <div style="font-size:16px;font-weight:700;color:var(--navy-2);margin-bottom:16px">智能体模板库</div>
        <div class="agent-grid">
          <div v-for="agt in m32Agents" :key="agt.id" class="panel agent-card">
            <div class="agent-name">{{ agt.name }}</div>
            <div class="agent-meta">场景：{{ agt.scene }}</div>
            <div class="agent-meta">模型：{{ agt.model || 'Qwen2.5-32B' }}</div>
            <div class="agent-meta runs">累计运行：<b>{{ agt.runs }}</b> 次</div>
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
          <div v-for="kpi in m32ResourceKpis" :key="kpi.label" class="kpi">
            <div class="label">{{ kpi.label }}</div>
            <div class="value">{{ kpi.value }}</div>
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

export default {
  components: { Icon },
  props: { page: Object, title: String },
  setup(props) {
    return useRichPage(props)
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
.agent-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
.agent-card {
  padding: 20px;
  display: flex;
  flex-direction: column;
  min-height: 188px;
  background: #fff;
}
.agent-name {
  font-size: 15px;
  font-weight: 700;
  color: var(--navy-2);
  margin-bottom: 8px;
}
.agent-meta {
  font-size: 12px;
  color: #7a8b9a;
  margin-bottom: 4px;
  line-height: 1.5;
}
.agent-meta.runs { margin-bottom: 16px; }
.agent-meta.runs b { color: var(--blue); }
.agent-actions {
  margin-top: auto;
  display: flex;
  gap: 8px;
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
