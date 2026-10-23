<template>
  <div class="rich-type-export">

      <div class="panel">
        <h3><i></i>批量导出配置</h3>
        <p class="hint" style="margin-bottom:8px">第一步：勾选已解析文档</p>
        <div class="check-list">
          <label v-for="n in exportDocs" :key="n"><input type="checkbox" checked /> {{ n }}</label>
        </div>
        <p class="hint" style="margin:12px 0 8px">第二步：选择目标格式</p>
        <div class="code-tabs">
          <button v-for="f in ['JSON','DOCX','Markdown','PDF','TXT']" :key="f" :class="{ on: fmt === f }" @click="fmt = f">{{ f }}</button>
        </div>
        <button class="btn btn-primary" @click="toast('已生成 ' + fmt + ' 导出任务')">开始导出</button>
      </div>
      <CrudPage :page="{ type:'crud', desc:'最近导出任务', dataset:'exports' }" title="导出成果" style="margin-top:8px" />
  </div>
</template>

<script>
import { useRichPage } from '@/composables/rich/useRichPage'
import CrudPage from '@/components/pages/CrudPage.vue'

export default {
  components: { CrudPage },
  props: { page: Object, title: String },
  setup(props) {
    return useRichPage(props)
  },
}
</script>
