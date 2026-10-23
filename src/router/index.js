import { createRouter, createWebHashHistory } from 'vue-router'
import PortalView from '@/layouts/PortalView.vue'
import HubView from '@/layouts/HubView.vue'
import AppShell from '@/layouts/AppShell.vue'
import TrainBoardView from '@/views/TrainBoardView.vue'
import AgentStudioView from '@/views/AgentStudioView.vue'
import ResourceLibraryView from '@/views/ResourceLibraryView.vue'
import { findMenu, firstLeaf, getPlatform } from '@/data/catalog'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'portal', component: PortalView },
    { path: '/hub', name: 'hub', component: HubView },
    { path: '/train-board', name: 'train-board', component: TrainBoardView },
    { path: '/agent-studio', name: 'agent-studio', component: AgentStudioView },
    { path: '/resource-library', name: 'resource-library', component: ResourceLibraryView },
    { path: '/p/:pid/:sid?/:mid?', name: 'app', component: AppShell },
  ],
})

router.afterEach((to) => {
  const platform = to.name === 'app' ? getPlatform(to.params.pid) : null
  const titles = { 'train-board': '大模型训推态势', 'agent-studio': '智能体编排', 'resource-library': '领域资源库', hub: '后台管理系统' }
  document.title = platform?.name || titles[to.name] || '试验鉴定综合服务平台'
})

router.beforeEach((to) => {
  if (to.name !== 'app') return true
  const platform = getPlatform(to.params.pid)
  if (!platform) return { path: '/' }
  const system = platform.systems.find((s) => s.id === to.params.sid) || platform.systems[0]
  const located = findMenu(platform, system.id, to.params.mid)
  const mid = located.menu?.id
  if (to.params.sid === system.id && to.params.mid === mid) return true
  return { name: 'app', params: { pid: platform.id, sid: system.id, mid: mid || firstLeaf(system).id } }
})

export default router
