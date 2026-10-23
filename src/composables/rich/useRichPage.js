import { useRichContext } from '@/composables/rich/useRichContext'

/**
 * 各镜头页通过 setup() 返回此对象，模板即可使用原变量名。
 * 不可再 Object.assign 到 setupState：Vue 3 会将其设为不可扩展。
 */
export function useRichPage(props) {
  const ctx = useRichContext(props)
  const skip = new Set(['props', 'page', 'title', 'router', 'route'])
  const exposed = {}
  for (const key of Object.keys(ctx)) {
    if (skip.has(key)) continue
    exposed[key] = ctx[key]
  }
  return exposed
}
