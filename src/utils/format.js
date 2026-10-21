export function badgeKind(status) {
  const s = String(status || '')
  if (/失败|停用|下线|驳回/.test(s)) return 'off'
  if (s === '高') return 'off'
  if (/进行|解析中|增强|运行|纠错|处理中/.test(s)) return 'run'
  if (/完成|启用|确认|在线|可用|达标|已解析|在库|激活|有效|正常|上线|可训练|已清洗|已抽取|已定稿/.test(s)) return 'on'
  if (/待|暂存|排队|草稿|审核|校准|校核|预警|中|低/.test(s)) return 'warn'
  return 'hold'
}

export function nowText() {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}
