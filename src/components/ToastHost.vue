<template>
  <div v-if="state.toast" class="toast">{{ state.toast }}</div>
</template>

<script setup>
import { useUi } from '@/composables/ui'
const { state } = useUi()
</script>
