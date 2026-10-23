<template>
  <div class="rich-page-host">
    <component :is="view" v-if="view" :page="page" :title="title" />
    <div v-else class="panel" style="padding:24px;color:#8a99a8">未知页面类型：{{ page?.type }}</div>
  </div>
</template>

<script setup>
import { defineAsyncComponent, shallowRef, watch } from 'vue'
import { richPageTypes } from '@/config/page-registry'
import { resetRichContext } from '@/composables/rich/useRichContext'

const props = defineProps({ page: Object, title: String })
const view = shallowRef(null)

watch(
  () => props.page?.type,
  (type, prev) => {
    if (type !== prev) resetRichContext()
    const loader = richPageTypes[type]
    view.value = loader ? defineAsyncComponent(loader) : null
  },
  { immediate: true },
)
</script>
