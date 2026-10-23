<template>
  <div class="rich-type-graph">

      <div class="toolbar" style="margin-bottom:16px;background:#fff;border:1px solid var(--line);border-radius:10px;padding:10px 16px">
        <input v-model="gkey" class="g-search" placeholder="搜索节点名称或类型" />
        <span class="spacer"></span>
        <button class="btn btn-outline" @click="toast('已切换为三维布局预览')">三维展示</button>
        <button class="btn btn-primary" @click="toast('节点已加入画布，可在右侧编辑属性')">新建节点</button>
        <button class="btn btn-outline" @click="toast('图谱压缩包已开始导出')">导出压缩包</button>
      </div>
      <div class="graph-wrap">
        <svg class="graph-svg" viewBox="0 0 760 520">
          <line v-for="e in graphEdges" :key="e[0]+e[1]" :x1="nodeMap[e[0]].x" :y1="nodeMap[e[0]].y" :x2="nodeMap[e[1]].x" :y2="nodeMap[e[1]].y" stroke="#b7cbe0" stroke-width="1.4" />
          <g v-for="n in graphNodes" :key="n.id" @click="activeNode = n" style="cursor:pointer">
            <circle :cx="n.x" :cy="n.y" :r="n.id === activeNode.id ? 30 : 26" :fill="n.color" :stroke="nodeHit(n) ? '#e3bd6a' : '#fff'" :stroke-width="nodeHit(n) ? 4 : 2" />
            <text :x="n.x" :y="n.y + 4" text-anchor="middle" font-size="12" font-weight="700" :fill="n.color === '#d0ab68' ? '#5a3e12' : '#fff'">{{ n.type.slice(0, 2) }}</text>
            <text :x="n.x" :y="n.y + 48" text-anchor="middle" font-size="12" fill="#1d3e5c" paint-order="stroke" stroke="#f7fbfe" stroke-width="4">{{ n.label }}</text>
          </g>
        </svg>
        <div class="panel node-card">
          <h4>{{ activeNode.label }}</h4>
          <p>类型：{{ activeNode.type }}</p>
          <p>{{ activeNode.detail }}</p>
          <div class="actions">
            <button class="btn btn-outline" @click="toast('关系已保存')">编辑关系</button>
            <button class="btn btn-primary" @click="toast('已打开原文溯源')">原文溯源</button>
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
