<template>
  <div class="rich-type-code">

      <div class="code-tabs">
        <button v-for="l in codeLangs" :key="l" :class="{ on: lang === l }" @click="lang = l">{{ l }}</button>
      </div>
      <pre class="code" v-html="codeHtml"></pre>
      <div style="margin-top:10px;display:flex;gap:8px">
        <button class="btn btn-primary" @click="toast('已写入代码成果库')">保存成果</button>
        <button class="btn btn-outline" @click="toast('已生成函数、参数与执行逻辑注释')">生成注释</button>
        <button class="btn btn-outline" @click="toast('未发现语法错误，建议核对滑转率分母')">纠错检查</button>
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
