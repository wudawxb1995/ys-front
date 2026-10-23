<template>
  <div class="rich-type-report">

      <div style="display:flex;gap:8px;margin-bottom:12px">
        <button class="btn btn-primary" @click="toast('报告已保存')">保存</button>
        <button class="btn btn-outline" @click="toast('已导出 Word')">导出 Word</button>
        <button class="btn btn-outline" @click="toast('已导出 PDF')">导出 PDF</button>
      </div>
      <article class="doc-paper">
        <h3>{{ paper.title }}</h3>
        <div class="meta">{{ paper.meta }}</div>
        <div v-for="sec in paper.sections" :key="sec.h" class="paper-sec">
          <h4>{{ sec.h }}</h4>
          <p>{{ sec.p }}</p>
        </div>
      </article>
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
