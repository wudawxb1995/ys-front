<template>
  <el-input
    class="ta-field"
    :class="{ tall }"
    type="textarea"
    :model-value="modelValue"
    :placeholder="placeholder"
    :maxlength="maxlength"
    :rows="rows"
    :autosize="false"
    resize="none"
    show-word-limit
    @update:model-value="onUpdate"
  />
</template>

<script setup>
/**
 * 多行文字域：Element Plus textarea + 字数在组件右下角（show-word-limit）
 */
defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  maxlength: { type: [Number, String], default: 200 },
  rows: { type: Number, default: 4 },
  /** 在 split/dual 布局中拉高铺满 */
  tall: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue'])
function onUpdate(val) {
  emit('update:modelValue', val ?? '')
}
</script>

<style scoped>
.ta-field { width: 100%; }
.ta-field.tall,
.ta-field.tall :deep(.el-textarea),
.ta-field.tall :deep(.el-textarea__inner) {
  height: 100%;
}
.ta-field :deep(.el-textarea) {
  position: relative;
  height: 100%;
}
.ta-field :deep(.el-textarea__inner) {
  min-height: 88px;
  padding: 8px 12px 28px;
  line-height: 1.6;
  font-size: 14px;
  color: #3f5062;
  border-radius: 6px;
  box-shadow: 0 0 0 1px #d5e0ea inset;
  background: #fff;
}
.ta-field :deep(.el-textarea__inner::placeholder) {
  color: #a8b8c6 !important;
  opacity: 1;
  font-weight: 400;
}
.ta-field :deep(.el-textarea__inner:hover) {
  box-shadow: 0 0 0 1px #b8cfe4 inset;
}
.ta-field :deep(.el-textarea__inner:focus) {
  box-shadow: 0 0 0 1px #7eadd4 inset;
}
/* 字数压在框内右下角 */
.ta-field :deep(.el-input__count) {
  position: absolute;
  right: 10px;
  bottom: 6px;
  background: transparent;
  color: #9fb0c0;
  font-size: 12px;
  line-height: 1;
  z-index: 1;
}
</style>
