<template>
  <div class="rich-type-stats">

      <div class="kpi-row">
        <div v-for="k in statKpis" :key="k.label" class="kpi">
          <div class="mark"><Icon :name="kpiIcon(k.label)" /></div>
          <div class="label">{{ k.label }}</div>
          <div class="value">{{ k.value }}<small>{{ k.unit }}</small></div>
        </div>
      </div>
      <div class="split" style="grid-template-columns: 1.2fr .8fr">
        <div class="panel">
          <h3><i></i>{{ statChart.title }}</h3>
          <div class="bars">
            <div v-for="item in statChart.data" :key="item[0]" class="bar-col">
              <div class="num">{{ item[1] }}</div>
              <div class="bar" :style="{ height: Math.max(12, item[1] / statMax * 130) + 'px' }"></div>
              <div class="lb">{{ item[0] }}</div>
            </div>
          </div>
        </div>
        <div class="panel">
          <h3><i></i>结构分布</h3>
          <div v-for="d in dist" :key="d.name" class="dist-row">
            <div class="dist-meta"><span>{{ d.name }}</span><b>{{ d.v }}%</b></div>
            <div class="progress"><span :style="{ width: d.v + '%' }"></span></div>
          </div>
        </div>
      </div>
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
