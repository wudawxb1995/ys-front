<template>
  <div class="page-host">
    <DashboardPage v-if="page?.type === 'dashboard'" :page="page" @open="open" />
    <CrudPage v-else-if="page?.type === 'crud'" :key="pageKey" :page="page" :title="title" />
    <ResourceManagePage v-else-if="page?.type === 'm01'" :key="pageKey" :page="page" :title="title" />
    <IndicatorExtractPage v-else-if="page?.type === 'm02'" :key="pageKey" :page="page" :title="title" />
    <PostTrialPage v-else-if="page?.type === 'post-trial'" :key="pageKey" :page="page" :title="title" />
    <TemplateConfigPage v-else-if="page?.type === 'template-config'" :key="pageKey" />
    <DeviationSummaryPage v-else-if="page?.type === 'deviations'" :key="pageKey" :page="page" :title="title" />
    <CollectPrototypePage v-else-if="page?.type === 'doc-feature' && prototypeScenes.includes(page?.scene)" :key="pageKey" :page="page" :title="title" />
    <DocModulePage v-else-if="page?.type === 'doc-feature'" :key="pageKey" :page="page" :title="title" />
    <RichPage v-else-if="page" :key="pageKey" :page="page" :title="title" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getPlatform } from '@/data/catalog'
import DashboardPage from '@/components/pages/DashboardPage.vue'
import CrudPage from '@/components/pages/CrudPage.vue'
import ResourceManagePage from '@/components/pages/ResourceManagePage.vue'
import IndicatorExtractPage from '@/components/pages/IndicatorExtractPage.vue'
import DeviationSummaryPage from '@/components/pages/DeviationSummaryPage.vue'
import DocModulePage from '@/components/pages/DocModulePage.vue'
import CollectPrototypePage from '@/components/pages/CollectPrototypePage.vue'
import TemplateConfigPage from '@/components/pages/TemplateConfigPage.vue'
import PostTrialPage from '@/components/pages/PostTrialPage.vue'
import RichPage from '@/views/RichPage.vue'

const props = defineProps({ page: Object, title: String })
const route = useRoute()
const router = useRouter()
const prototypeScenes = ['upload', 'classify', 'transfer', 'ontology', 'extract', 'terms', 'constraint', 'validation', 'policy', 'api', 'knowledge']
const pageKey = computed(() => [
  props.title, props.page?.type, props.page?.dataset, props.page?.graphKey,
  props.page?.chatKey, props.page?.reportKey, props.page?.entryKey,
  props.page?.flowKey, props.page?.canvasKey, props.page?.cardKey, props.page?.statsKey, props.page?.codeKey,
  props.page?.stage, props.page?.module, props.page?.scene,
  props.page?.moduleName, props.page?.featureName,
].join('-'))

function open(mid) {
  if (!mid) return
  const pid = route.params.pid
  const platform = getPlatform(pid)
  let sid = route.params.sid
  if (platform) {
    outer: for (const sys of platform.systems) {
      for (const item of sys.menus) {
        if (item.id === mid && item.page) { sid = sys.id; break outer }
        if (item.children?.some((c) => c.id === mid)) { sid = sys.id; break outer }
      }
    }
  }
  router.push({ name: 'app', params: { pid, sid, mid } })
}
</script>
