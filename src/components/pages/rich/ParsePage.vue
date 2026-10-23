<template>
  <div class="rich-type-parse">

      <div class="tabs">
        <button v-for="t in parseTabs" :key="t" :class="{ on: tab === t }" @click="tab = t">{{ t }}</button>
      </div>
      <div class="split" style="grid-template-columns: 1fr 1fr">
        <div class="panel">
          <h3><i></i>解析能力</h3>
          <ul class="check-list">
            <li v-for="item in parsePoints" :key="item" style="list-style:none;padding:8px 0;border-bottom:1px solid #f0f4f8;color:#3f5062">{{ item }}</li>
          </ul>
        </div>
        <div class="panel">
          <h3><i></i>解析结果预览</h3>
          <div class="kv">
            <b>机型</b><span>东方红-LF2204</span>
            <b>关键指标</b><span>标定功率 162 kW；牵引力 38.6 kN</span>
            <b>段落主旨</b><span>本章给出动力输出与牵引性能的实测结果</span>
            <b>语义关系</b><span>指标—数值、项目—方法、结论—标准条款</span>
            <b>调度引擎</b><span>{{ tab === '图像解析' ? '文档OCR识别引擎 95.6%' : tab === '表格解析' ? '表格结构识别引擎 94.1%' : '领域多模态大模型 92.4%' }}</span>
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
