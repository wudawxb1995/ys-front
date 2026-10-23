<template>
  <div class="rich-type-clean">

      <div class="split" style="grid-template-columns: 1fr 1fr">
        <div class="panel">
          <h3><i></i>去噪归一规则</h3>
          <div class="check-list">
            <label v-for="r in rules" :key="r.name"><input type="checkbox" v-model="r.on" /> {{ r.name }}（{{ r.target }}）</label>
          </div>
        </div>
        <div class="panel">
          <h3><i></i>执行清洗</h3>
          <div class="field"><label>选择资源</label>
            <select-field v-model="cleanRes" :options="['东方红-LF2204轮式拖拉机定型试验报告','雷沃谷神4LZ-8谷物联合收割机鉴定大纲']" placeholder="请选择资源" />
          </div>
          <button class="btn btn-primary" style="margin-top:12px" @click="runClean">执行清洗</button>
        </div>
      </div>
      <div class="table-wrap" style="margin-top:12px">
        <table>
          <thead><tr><th>数据资源</th><th>应用规则</th><th>剔除噪声</th><th>状态</th><th>处理时间</th></tr></thead>
          <tbody>
            <tr v-for="log in cleanLogs" :key="log.time"><td>{{ log.res }}</td><td>{{ log.rule }}</td><td>{{ log.n }}</td><td><span class="badge on"><i></i>已完成</span></td><td>{{ log.time }}</td></tr>
          </tbody>
        </table>
      </div>
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
