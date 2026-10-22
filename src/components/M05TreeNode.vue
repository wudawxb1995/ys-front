<template>
  <div>
    <div
      class="tree-row"
      :class="{ 'tree-sel': selId === node.id }"
      :style="{ paddingLeft: (8 + (node.level - 1) * 16) + 'px' }"
      @click="handleClick"
    >
      <!-- 展开/折叠箭头 or 叶子圆点 -->
      <svg v-if="node.children?.length" class="tree-arrow" :class="{ open }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M9 6l6 6-6 6"/>
      </svg>
      <svg v-else class="tree-dot" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="4"/></svg>

      <!-- 名称 -->
      <span class="tree-label" :class="{ 'tree-l1': node.level === 1, 'tree-l2': node.level === 2 }">{{ node.name }}</span>

      <!-- 落库徽标（仅叶子节点） -->
      <span v-if="!node.children?.length" class="tree-badge" :class="node.inDb ? 'in' : 'out'">
        {{ node.inDb ? '已落库' : '待落库' }}
      </span>
    </div>

    <!-- 递归子节点 -->
    <template v-if="node.children?.length && open">
      <M05TreeNode
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
import { ref } from 'vue'

const props = defineProps({ node: Object, selId: String })
const emit = defineEmits(['select'])

// 一二级默认展开，三四级默认折叠
const open = ref(props.node.level <= 2)

function handleClick() {
  if (props.node.children?.length) {
    open.value = !open.value
  }
  emit('select', props.node)
}
</script>

<style scoped>
.tree-row {
  display: flex; align-items: center; gap: 6px;
  height: 36px; padding-right: 10px;
  cursor: pointer; transition: background .12s;
  border-left: 3px solid transparent;
}
.tree-row:hover { background: #f4f8fc; }
.tree-sel { background: #e8f3fb !important; border-left-color: #1668a8 !important; }
.tree-arrow {
  width: 12px; height: 12px; flex: 0 0 12px;
  color: #8a99a8; transition: transform .18s;
}
.tree-arrow.open { transform: rotate(90deg); }
.tree-dot { width: 10px; height: 10px; flex: 0 0 10px; color: #b0c4d8; }
.tree-label {
  flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  font-size: 13.5px; color: #3f5062;
}
.tree-l1 { font-size: 14px; font-weight: 700; color: #0d4e83; }
.tree-l2 { font-size: 13.5px; font-weight: 600; }
.tree-badge {
  flex: 0 0 auto; font-size: 11px; padding: 1px 7px;
  border-radius: 8px; white-space: nowrap;
}
.tree-badge.in  { background: #e4f6e8; color: #22913c; }
.tree-badge.out { background: #eef1f4; color: #7c8fa2; }
</style>
