<template>
  <div>
    <section class="banner">
      <h3>{{ page.bannerTitle }}</h3>
      <p>{{ page.bannerDesc }}</p>
    </section>
    <div class="steps">
      <div v-for="(s, i) in page.steps" :key="s.name" class="step" @click="$emit('open', s.to)">
        <div class="no">0{{ i + 1 }}</div>
        <b>{{ s.name }}</b>
        <span>{{ s.desc }}</span>
      </div>
    </div>
    <div class="kpi-row">
      <div v-for="k in displayKpis" :key="k.label" class="kpi">
        <div class="mark"><Icon :name="kpiIcon(k.label)" /></div>
        <div class="label">{{ k.label }}</div>
        <div class="value">{{ k.value }}<small>{{ k.unit }}</small></div>
      </div>
    </div>
    <div class="dash-grid">
      <div class="panel">
        <h3><i></i>{{ page.chart.title }} <span class="hint">单位：{{ page.chart.unit }}</span></h3>
        <div class="bars">
          <div v-for="item in page.chart.data" :key="item[0]" class="bar-col">
            <div class="num">{{ item[1] }}</div>
            <div class="bar" :style="{ height: Math.max(8, item[1] / max * 130) + 'px' }"></div>
            <div class="lb">{{ item[0] }}</div>
          </div>
        </div>
      </div>
      <div class="panel">
        <h3><i></i>建议继续处理</h3>
        <button v-for="(s, i) in page.steps" :key="s.name" class="next-item" @click="$emit('open', s.to)">
          <em>0{{ i + 1 }}</em>
          <span>
            <b>{{ s.name }}</b>
            <small>{{ s.desc }}</small>
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Icon from '@/components/Icon.vue'
import { useRows } from '@/composables/tables'
const props = defineProps({ page: Object })
const route = useRoute()
const resources = useRows('resources')
const displayKpis = computed(() => route.params.pid === 'rebuild' && route.params.sid === 'quant'
  ? props.page.kpis.map(item => {
      if (item.label === '数据资源总量') return { ...item, value: String(resources.length) }
      if (item.label === '已完成解析') return { ...item, value: String(resources.filter(row => row.status === '已解析').length) }
      return item
    })
  : props.page.kpis)
function kpiIcon(label = '') {
  if (/卡片/.test(label)) return 'card'
  if (/问答/.test(label)) return 'chat'
  if (/图谱|关系|节点/.test(label)) return 'graph'
  if (/接口|服务/.test(label)) return 'plugin'
  if (/探针|模型|算法/.test(label)) return 'model'
  if (/任务|对接/.test(label)) return 'flow'
  if (/准确|率|评估/.test(label)) return 'chart'
  if (/创新|方向|覆盖/.test(label)) return 'spark'
  if (/文献|文书|文档|报告/.test(label)) return 'doc'
  if (/资源|数据|数据集/.test(label)) return 'database'
  if (/抽取|收录/.test(label)) return 'extract'
  return 'chart'
}
defineEmits(['open'])
const max = computed(() => Math.max(...props.page.chart.data.map((d) => d[1])))
</script>
