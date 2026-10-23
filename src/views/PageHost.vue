<template>
  <div class="page-host">
    <DashboardPage v-if="page?.type === 'dashboard'" :page="page" @open="open" />
    <CrudPage v-else-if="page?.type === 'crud'" :key="pageKey" :page="page" :title="title" />
    <M01Page v-else-if="page?.type === 'm01'" :key="pageKey" :page="page" :title="title" />
    <PostTrialPage v-else-if="page?.type === 'post-trial'" :key="pageKey" :page="page" :title="title" />
    <TemplateConfigPage v-else-if="page?.type === 'template-config'" :key="pageKey" />
    <DocModulePage v-else-if="page?.type === 'doc-feature'" :key="pageKey" :page="page" :title="title" />
    <RichPage v-else-if="page" :key="pageKey" :page="page" :title="title" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DashboardPage from '@/components/pages/DashboardPage.vue'
import CrudPage from '@/components/pages/CrudPage.vue'
import M01Page from '@/components/pages/M01Page.vue'
import DocModulePage from '@/components/pages/DocModulePage.vue'
import TemplateConfigPage from '@/components/pages/TemplateConfigPage.vue'
import PostTrialPage from '@/components/pages/PostTrialPage.vue'
import RichPage from '@/views/RichPage.vue'

const props = defineProps({ page: Object, title: String })
const route = useRoute()
const router = useRouter()
const pageKey = computed(() => [
  props.title, props.page?.type, props.page?.dataset, props.page?.graphKey,
  props.page?.chatKey, props.page?.reportKey, props.page?.entryKey,
  props.page?.flowKey, props.page?.canvasKey, props.page?.cardKey, props.page?.statsKey, props.page?.codeKey,
  props.page?.stage, props.page?.module, props.page?.scene,
  props.page?.moduleName, props.page?.featureName,
].join('-'))

function open(mid) {
  if (!mid) return
  router.push({ name: 'app', params: { pid: route.params.pid, sid: route.params.sid, mid } })
}
</script>
