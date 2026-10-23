<template>
  <el-date-picker
    class="date-field"
    :model-value="modelValue || null"
    type="date"
    :placeholder="placeholder"
    value-format="YYYY-MM-DD"
    format="YYYY-MM-DD"
    :editable="false"
    :clearable="clearable"
    style="width: 100%"
    @update:model-value="onUpdate"
  />
</template>

<script setup>
/**
 * 平台日期：Element Plus el-date-picker，禁止原生 input[type=date]。
 */
defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: '选择日期' },
  clearable: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue'])

function onUpdate(val) {
  emit('update:modelValue', val || '')
}
</script>

<style scoped>
.date-field { width: 100%; min-width: 0; }
/* 日历图标靠右（对齐入库/需求配置原型） */
.date-field :deep(.el-input__wrapper) {
  position: relative;
  padding-right: 36px;
  padding-left: 12px;
}
.date-field :deep(.el-input__prefix) {
  position: absolute;
  right: 10px;
  left: auto;
  color: #8aa0b4;
}
.date-field :deep(.el-input__suffix) {
  display: none;
}
</style>
