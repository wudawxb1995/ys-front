<template>
  <el-select
    class="sf-select"
    :model-value="modelValue === '' || modelValue === undefined || modelValue === null ? undefined : modelValue"
    :placeholder="placeholder"
    :clearable="clearable"
    style="width: 100%"
    @update:model-value="onUpdate"
  >
    <el-option
      v-for="op in normalizedOptions"
      :key="String(op.value)"
      :label="op.label"
      :value="op.value"
    />
  </el-select>
</template>

<script setup>
/**
 * 平台下拉：Element Plus el-select 封装，保持原 SelectField API，视觉由 element-theme.css 对齐。
 */
import { computed } from 'vue'

const props = defineProps({
  modelValue: { default: '' },
  options: { type: Array, default: () => [] },
  placeholder: { type: String, default: '请选择' },
  clearable: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue'])

const normalizedOptions = computed(() =>
  props.options.map((op) =>
    typeof op === 'object' ? op : { value: op, label: op },
  ),
)

function onUpdate(val) {
  emit('update:modelValue', val ?? '')
}
</script>

<style scoped>
.sf-select { width: 100%; }
</style>
