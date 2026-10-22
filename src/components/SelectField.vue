<template>
  <div class="sf-wrap" :class="{ open: open }" ref="wrap">
    <!-- 触发器 -->
    <div
      class="sf-trigger"
      :tabindex="0"
      @click="toggle"
      @keydown="onKey"
      @blur="onBlur"
      :aria-expanded="open"
      role="combobox"
    >
      <span class="sf-label">{{ displayLabel }}</span>
      <svg class="sf-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="6 9 12 15 18 9"/>
      </svg>
    </div>

    <!-- 下拉面板 -->
    <Transition name="sf-drop">
      <div v-if="open" class="sf-panel" role="listbox">
        <div
          v-for="(op, idx) in normalizedOptions"
          :key="op.value"
          class="sf-option"
          :class="{ selected: modelValue === op.value, focused: focusIdx === idx }"
          role="option"
          :aria-selected="modelValue === op.value"
          @mousedown.prevent="select(op.value)"
          @mousemove="focusIdx = idx"
        >{{ op.label }}</div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  modelValue: { default: '' },
  options: { type: Array, default: () => [] },
  placeholder: { type: String, default: '请选择' },
})
const emit = defineEmits(['update:modelValue'])

const open = ref(false)
const focusIdx = ref(-1)
const wrap = ref(null)

// 统一成 { value, label } 格式，支持字符串数组或对象数组
const normalizedOptions = computed(() =>
  props.options.map((op) =>
    typeof op === 'object' ? op : { value: op, label: op }
  )
)

const displayLabel = computed(() => {
  if (!props.modelValue && props.modelValue !== 0) return props.placeholder
  const match = normalizedOptions.value.find((o) => o.value === props.modelValue)
  return match ? match.label : props.placeholder
})

function toggle() {
  open.value = !open.value
  if (open.value) {
    focusIdx.value = normalizedOptions.value.findIndex((o) => o.value === props.modelValue)
  }
}

function select(val) {
  emit('update:modelValue', val)
  open.value = false
}

function onBlur(e) {
  // 点面板内部不关闭（mousedown.prevent 保持 focus 在 trigger）
  setTimeout(() => {
    if (!wrap.value?.contains(document.activeElement)) open.value = false
  }, 100)
}

function onKey(e) {
  if (!open.value) {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') { open.value = true; e.preventDefault() }
    return
  }
  if (e.key === 'Escape') { open.value = false; return }
  if (e.key === 'ArrowDown') { focusIdx.value = Math.min(focusIdx.value + 1, normalizedOptions.value.length - 1); e.preventDefault() }
  if (e.key === 'ArrowUp')   { focusIdx.value = Math.max(focusIdx.value - 1, 0); e.preventDefault() }
  if (e.key === 'Enter' && focusIdx.value >= 0) {
    select(normalizedOptions.value[focusIdx.value].value)
    e.preventDefault()
  }
}
</script>

<style scoped>
.sf-wrap {
  position: relative;
  width: 100%;
  user-select: none;
}

/* 触发器 */
.sf-trigger {
  display: flex;
  align-items: center;
  height: 36px;
  border: 1px solid #d5e0ea;
  border-radius: 6px;
  background: #fff;
  padding: 0 10px 0 10px;
  font-size: 14px;
  color: var(--text-2, #3f5062);
  cursor: pointer;
  outline: none;
  transition: border-color .15s;
}
.sf-trigger:hover { border-color: #b8cfe4; }
.sf-wrap.open .sf-trigger { border-color: #7eadd4; }

.sf-label { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.sf-arrow {
  flex: 0 0 13px;
  width: 13px;
  height: 13px;
  margin-left: 8px;
  color: #8a99a8;
  transition: transform .2s;
}
.sf-wrap.open .sf-arrow { transform: rotate(180deg); }

/* 下拉面板 */
.sf-panel {
  position: absolute;
  top: calc(100% + 5px);
  left: 0;
  right: 0;
  z-index: 999;
  background: #fff;
  border: 1px solid #d5e0ea;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(15, 55, 95, .12);
  padding: 4px 0;
  overflow: hidden;
}

/* 选项 */
.sf-option {
  padding: 8px 12px;
  font-size: 14px;
  color: #3f5062;
  cursor: pointer;
  transition: background .1s;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.sf-option:hover,
.sf-option.focused { background: #f0f6fb; }
.sf-option.selected { background: #e6f1fa; color: #0d4e83; font-weight: 600; }
.sf-option.selected.focused { background: #dceef7; }

/* 过渡动画 */
.sf-drop-enter-active,
.sf-drop-leave-active { transition: opacity .15s, transform .15s; transform-origin: top center; }
.sf-drop-enter-from,
.sf-drop-leave-to { opacity: 0; transform: scaleY(.92) translateY(-4px); }
</style>
