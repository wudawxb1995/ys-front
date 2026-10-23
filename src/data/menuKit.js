export const g = (id, name, icon, children) => ({ id, name, icon, children })
export const leaf = (id, name, page) => ({ id, name, page })
export const crud = (desc, dataset) => ({ type: 'crud', desc, dataset })

const week = [['10-13', 18], ['10-14', 26], ['10-15', 15], ['10-16', 32], ['10-17', 22], ['10-18', 12], ['10-19', 20]]

export function home(title, desc, steps, kpis, chartTitle = '近7日业务量') {
  return {
    type: 'dashboard',
    bannerTitle: title,
    bannerDesc: desc,
    steps,
    kpis,
    chart: { title: chartTitle, unit: '项', data: week },
  }
}

export function reuse(page, items) {
  return items.map(([id, name]) => leaf(id, name, { ...page }))
}
