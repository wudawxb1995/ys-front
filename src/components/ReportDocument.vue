<template>
  <article ref="documentEl" class="workflow-document">
    <section v-for="chapter in sections" :key="chapter.id" class="report-chapter">
      <h3>第{{ chapter.number }}章 {{ chapter.title }}</h3>
      <div v-for="block in chapter.blocks" :key="block.id" :data-block-id="block.id" class="report-block" :class="{ located: activeBlock === block.id }">
        <p>{{ block.text }}</p>
        <div v-if="block.kind === 'metrics'" class="report-metric-wrap">
          <table><thead><tr><th>序号</th><th>指标</th><th>判据</th><th>实测结果</th><th>判定</th></tr></thead>
            <tbody><tr v-for="row in block.rows" :key="row.no" :class="{ retested: row.linkedShot }"><td>{{ row.no }}</td><td>{{ row.name }}</td><td>{{ row.criterion }}</td><td>{{ row.value }}</td><td>{{ row.conclusion }}</td></tr></tbody>
          </table>
        </div>
        <small class="block-source">来源：{{ block.source }}</small>
        <small v-if="activeBlock === block.id" class="block-location">⌖ 当前审查位置</small>
      </div>
    </section>
  </article>
</template>
<script setup>
import { ref } from 'vue'
defineProps({ sections: { type: Array, default: () => [] }, activeBlock: String })
const documentEl = ref(null)
function locateBlock(id) {
  const block = [...(documentEl.value?.querySelectorAll('[data-block-id]') || [])].find((el) => el.dataset.blockId === id)
  block?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}
defineExpose({ locateBlock })
</script>
<style scoped>
.workflow-document { color: #294960; font-size: 13.5px; line-height: 1.95; padding: 8px 24px 28px; }
.report-chapter { margin-bottom: 30px; }
.report-chapter h3 { color: #07518a; font-size: 16px; padding: 12px 0; border-bottom: 1px solid #e3e9ee; margin: 0 0 14px; }
.report-block { border: 1px solid transparent; border-radius: 6px; padding: 10px 12px; margin: 8px 0; scroll-margin: 16px; }
.report-block p { margin: 0 0 7px; white-space: pre-wrap; }
.report-block.located { background: #fbf6ec; border-color: #e4d3b0; box-shadow: none; }
.block-source { color: #8b9cac; font-size: 11px; display: block; }
.block-location { color: #1668a8; display: block; margin-top: 7px; font-size: 12px; }
.report-metric-wrap { overflow-x: auto; margin: 10px 0; }
table { width: 100%; border-collapse: collapse; font-size: 12px; }
th, td { text-align: left; padding: 9px 10px; border: 1px solid #e3e9ee; }
th { background: #f3f7fa; font-weight: 500; color: #607b91; }
.retested { background: #fbf7ef; }
@media(max-width: 800px) { .workflow-document { padding: 8px 10px; } }
</style>
