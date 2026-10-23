<template>
  <div class="rich-type-canvas">

      <div class="split" style="grid-template-columns: 1fr 280px">
        <div class="canvas">
          <svg class="canvas-lines">
            <line v-for="(e, i) in canvasLinks" :key="i" :x1="e[0].x + 75" :y1="e[0].y + 28" :x2="e[1].x + 75" :y2="e[1].y + 28" />
          </svg>
          <div v-for="n in canvasNodes" :key="n.title" class="wf-node" :class="{ on: n.title === canvasOn.title }" :style="{ left: n.x + 'px', top: n.y + 'px' }" @click="canvasOn = n">
            <b>{{ n.title }}</b><span>{{ n.sub }}</span>
          </div>
        </div>
        <div class="panel">
          <h3><i></i>节点参数</h3>
          <p style="color:#3f5062;line-height:1.7;margin-bottom:8px">{{ canvasOn.detail }}</p>
          <div class="field"><label>输入参数</label><input :value="canvasOn.input" /></div>
          <div class="field" style="margin-top:8px"><label>输出参数</label><input :value="canvasOn.output" /></div>
          <button class="btn btn-primary" style="margin-top:12px" @click="toast('组件调试通过，日志已写入')">在线调试</button>
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
