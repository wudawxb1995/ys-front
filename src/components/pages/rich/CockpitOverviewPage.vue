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
          <div class="m32-platform-card" @click="router.push({ name: 'resource-library' })">
            <div class="m32-platform-icon"><Icon name="book" /></div>
            <div class="m32-platform-name">领域资源库</div>
            <div class="m32-platform-sub">试验鉴定数据资源库</div>
            <div class="m32-platform-link">资产总览 →</div>
          </div>
        </div>
        <div style="text-align:center;margin-top:22px">
          <button class="btn btn-outline" style="height:36px;padding:0 18px;border-color:#d7ac58;color:#a36e0c" @click="goDeviationSummary">
            查看正偏离能力汇总（{{ deviationTotal }} 项）→
          </button>
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
            <div class="m32-chart-title">评估指标变化</div>
            <div :ref="el=>{ evalChartEl=el }" style="width:100%;height:200px"></div>
          </div>
          <div class="panel" style="padding:14px">
            <div class="m32-chart-title">GPU 利用率</div>
            <div :ref="el=>{ gpuChartEl=el }" style="width:100%;height:200px"></div>
          </div>
          <div class="panel" style="padding:14px">
            <div class="m32-chart-title">显存占用</div>
            <div :ref="el=>{ memChartEl=el; el&&initM32TrainCharts() }" style="width:100%;height:200px"></div>
          </div>
        </div>
      </template>

      <!-- ── stage: agent 智能体编排平台 ── -->
      <template v-else-if="m32Stage==='agent'">
        <div style="font-size:16px;font-weight:700;color:var(--navy-2);margin-bottom:16px">智能体模板库</div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px">
          <div v-for="agt in m32Agents" :key="agt.id" class="panel" style="padding:20px">
            <div style="font-size:15px;font-weight:700;color:var(--navy-2);margin-bottom:8px">{{ agt.name }}</div>
            <div style="font-size:12px;color:#7a8b9a;margin-bottom:4px">场景：{{ agt.scene }}</div>
            <div style="font-size:12px;color:#7a8b9a;margin-bottom:16px">累计运行：<b style="color:var(--blue)">{{ agt.runs }}</b> 次</div>
            <div style="display:flex;gap:8px">
              <button class="btn btn-outline" style="font-size:12px;padding:5px 14px" @click="toast('配置功能即将开放')">配置</button>
              <button class="btn btn-primary" style="font-size:12px;padding:5px 14px" @click="toast('运行功能即将开放')">运行</button>
            </div>
          </div>
        </div>
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
import { useRouter } from 'vue-router'
import { useRichPage } from '@/composables/rich/useRichPage'
import Icon from '@/components/Icon.vue'

export default {
  components: { Icon },
  props: { page: Object, title: String },
  setup(props) {
    return { ...useRichPage(props), router: useRouter() }
  },
}
</script>
