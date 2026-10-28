/** 指标树配置：与 44 项抽取结果同源（7 性能域 / 13 指标类） */
import { tank99aIndicators } from './tank99a'

function buildTree() {
  const domains = []
  tank99aIndicators.forEach((item) => {
    const [domainName, className] = String(item.klass || '').split(' / ')
    let domain = domains.find((node) => node.name === domainName)
    if (!domain) {
      domain = {
        id: `d-${domains.length + 1}`,
        name: domainName,
        level: 1,
        open: domains.length === 0,
        badge: 0,
        children: [],
      }
      domains.push(domain)
    }
    let klass = domain.children.find((node) => node.name === className)
    if (!klass) {
      klass = {
        id: `${domain.id}-c${domain.children.length + 1}`,
        name: className,
        level: 2,
        open: domain.open,
        children: [],
      }
      domain.children.push(klass)
    }
    klass.children.push({
      id: item.code,
      name: item.name,
      level: 3,
      value: item.criteria,
      criteriaType: item.criteriaType,
      examMethod: item.examMethod,
      srcSection: item.srcSection,
      srcPage: item.srcPage,
      domain: item.domain,
    })
  })
  domains.forEach((domain) => {
    domain.badge = domain.children.reduce((sum, klass) => sum + klass.children.length, 0)
  })
  return [{
    id: 'root',
    name: '99A式主战坦克',
    level: 0,
    open: true,
    icon: 'device',
    children: domains,
  }]
}

export const m03TreeData = buildTree()

/** 抽取性能域简称 → 指标树性能域名称 */
export const m03DomainAlias = {
  火力: ['火力性能'],
  机动: ['机动性能'],
  防护: ['防护性能'],
  信息能力: ['探测性能', '通信性能'],
  可靠性: ['可靠性'],
  环境适应性: ['环境适应性'],
  电磁兼容: ['环境适应性'],
}
