<template>
  <div class="page-host">
    <DashboardPage v-if="page?.type === 'dashboard'" :page="page" @open="open" />
    <CrudPage v-else-if="page?.type === 'crud'" :key="pageKey" :page="page" :title="title" />
    <RichPage v-else-if="page" :key="pageKey" :page="page" :title="title" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DashboardPage from '@/components/pages/DashboardPage.vue'
import CrudPage from '@/components/pages/CrudPage.vue'
import RichPage from '@/views/RichPage.vue'

const props = defineProps({ page: Object, title: String })
const route = useRoute()
const router = useRouter()
const pageKey = computed(() => [
  props.title, props.page?.type, props.page?.dataset, props.page?.graphKey,
  props.page?.chatKey, props.page?.reportKey, props.page?.entryKey,
  props.page?.flowKey, props.page?.canvasKey, props.page?.cardKey, props.page?.statsKey, props.page?.codeKey,
].join('-'))

function open(mid) {
  if (!mid) return
  router.push({ name: 'app', params: { pid: route.params.pid, sid: route.params.sid, mid } })
}
</script>
