/**
 * Rich 页运行时入口：按配置注册表分发后，各镜头从这里取共享状态。
 * sessionStorage 仍走 demo-store。
 */
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUi } from '@/composables/ui'
import { buildRichPartA } from '@/composables/rich/useRichPartA'
import { buildRichPartB } from '@/composables/rich/useRichPartB'

let _singleton = null

export function useRichContext(props) {
  if (_singleton) return _singleton
  const { toast } = useUi()
  const router = useRouter()
  const route = useRoute()
  const bag = {
    props,
    toast,
    router,
    route,
    page: computed(() => props.page),
    title: computed(() => props.title),
  }
  buildRichPartA({ toast, router, route, props, bag })
  buildRichPartB({ toast, router, route, props, bag })
  _singleton = bag
  return _singleton
}

export function resetRichContext() {
  _singleton = null
}
