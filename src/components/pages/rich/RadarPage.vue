<template>
  <div class="rich-type-radar">

      <div class="split" style="grid-template-columns: 360px 1fr">
        <div class="panel">
          <h3><i></i>能力雷达 · 东方红-LF2204</h3>
          <svg viewBox="0 0 320 300" width="100%">
            <polygon points="160,40 262,112 230,230 90,230 58,112" fill="none" stroke="#d5e4f2" />
            <polygon points="160,78 226,126 206,204 112,204 94,126" fill="rgba(22,104,168,.25)" stroke="#1668a8" />
            <text x="150" y="32" font-size="12" fill="#0d4e83">打击 86</text>
            <text x="266" y="116" font-size="12" fill="#0d4e83">机动 82</text>
            <text x="214" y="252" font-size="12" fill="#0d4e83">防护 78</text>
            <text x="48" y="252" font-size="12" fill="#0d4e83">可靠 90</text>
            <text x="20" y="116" font-size="12" fill="#0d4e83">效率 84</text>
          </svg>
        </div>
        <div class="panel">
          <h3><i></i>能力矩阵</h3>
          <div class="table-wrap">
            <table>
              <thead><tr><th>维度</th><th>得分</th><th>主要依据</th><th>状态</th></tr></thead>
              <tbody>
                <tr v-for="r in radarRows" :key="r.name"><td>{{ r.name }}</td><td>{{ r.score }}</td><td>{{ r.basis }}</td><td><span class="badge on"><i></i>达标</span></td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
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
