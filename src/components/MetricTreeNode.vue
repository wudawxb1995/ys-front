<template>
  <div>
    <div
      class="m03-tree-row"
      :class="{
        'm03-tree-sel': selId === node.id,
        'm03-tree-root': node.level === 0,
        'm03-tree-domain': node.level === 1,
        'm03-tree-cat': node.level === 2,
        'm03-tree-leaf': node.level === 3,
      }"
      :style="{ paddingLeft: (10 + node.level * 14) + 'px' }"
      @click="handleClick"
    >
      <!-- 展开/折叠箭头 or 叶子圆点 -->
      <svg v-if="node.children?.length" class="m03-arrow" :class="{ open: localOpen }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
        <path d="M9 6l6 6-6 6"/>
      </svg>
      <svg v-else class="m03-dot" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="4"/></svg>

      <!-- 根节点图标 -->
      <svg v-if="node.level === 0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" style="width:14px;height:14px;flex:0 0 14px;color:#0d4e83">
        <rect x="2" y="3" width="20" height="18" rx="2"/><path d="M8 3v18M16 3v18"/>
      </svg>

      <!-- 名称 -->
      <span class="m03-label">{{ node.name }}</span>

      <!-- 性能域：指标数徽标 -->
      <span v-if="node.level === 1 && node.badge" class="m03-badge-count">{{ node.badge }}</span>

      <!-- 指标项：来源文档关联标识 -->
      <span v-if="node.level === 3" class="m03-src-tag" title="来源文档：D-01·第12页">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" style="width:11px;height:11px"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        D-01
      </span>
    </div>

    <!-- 递归子节点 -->
    <template v-if="node.children?.length && localOpen">
      <metric-tree-node
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        :sel-id="selId"
        @select="$emit('select', $event)"
      />
    </template>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({ node: Object, selId: String })
const emit = defineEmits(['select'])

// 根节点和第一层性能域默认展开，其余折叠
const localOpen = ref(props.node.open !== undefined ? props.node.open : props.node.level <= 1)

// 外部 expandAll 通过修改 node.open 触发
watch(() => props.node.open, (v) => { if (v !== undefined) localOpen.value = v })

function handleClick() {
  if (props.node.children?.length) {
    localOpen.value = !localOpen.value
    props.node.open = localOpen.value
  }
  emit('select', props.node)
}
</script>

<style scoped>
.m03-tree-row {
  display: flex; align-items: center; gap: 6px;
  height: 34px; padding-right: 10px;
  cursor: pointer; transition: background .12s;
  border-left: 3px solid transparent;
  user-select: none;
}
.m03-tree-row:hover { background: #f4f8fc; }
.m03-tree-sel {
  background: #eaf4fd !important;
  border-left-color: #d0ab68 !important; /* 麦金色高亮 */
}

/* 根节点 */
.m03-tree-root .m03-label { font-size: 14px; font-weight: 700; color: #0d4e83; }
/* 性能域 */
.m03-tree-domain .m03-label { font-size: 13.5px; font-weight: 700; color: #1f3d5a; }
/* 指标类 */
.m03-tree-cat .m03-label { font-size: 13px; font-weight: 600; color: #3f5062; }
/* 指标项 */
.m03-tree-leaf .m03-label { font-size: 13px; color: #4a6c8c; }

.m03-arrow { width: 12px; height: 12px; flex: 0 0 12px; color: #8a99a8; transition: transform .18s; }
.m03-arrow.open { transform: rotate(90deg); }
.m03-dot { width: 8px; height: 8px; flex: 0 0 8px; color: #b0c4d8; }
.m03-label { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.m03-badge-count {
  flex: 0 0 auto;
  font-size: 11px; font-weight: 600;
  background: #e8f3fb; color: #0d4e83;
  padding: 1px 7px; border-radius: 9px;
}
.m03-src-tag {
  flex: 0 0 auto;
  display: inline-flex; align-items: center; gap: 3px;
  font-size: 11px; color: #4a7fa8;
  background: #edf5fc; border: 1px solid #c8dff0;
  padding: 1px 6px; border-radius: 8px;
}
</style>
