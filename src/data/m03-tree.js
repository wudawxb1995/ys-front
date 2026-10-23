/** 指标树配置：7 性能域 / 15 类 / 28 项 */
export const m03TreeData = [
  {
    id: 'root', name: '某型装备', level: 0, open: true, icon: 'device',
    children: [
      {
        id: 'd-jd', name: '机动', level: 1, open: true, badge: 5,
        children: [
          { id: 'c-jd-1', name: '速度指标', level: 2, open: true, children: [
            { id: 'i-jd-1', name: '最大公路速度', level: 3, value: '≥ 65 km/h', criteriaType: '定量', examMethod: '实测', srcSection: '4.1 速度性能要求' },
            { id: 'i-jd-2', name: '最大越野速度', level: 3, value: '≥ 35 km/h', criteriaType: '定量', examMethod: '实测', srcSection: '4.1 速度性能要求' },
          ]},
          { id: 'c-jd-2', name: '行程续航', level: 2, open: false, children: [
            { id: 'i-jd-3', name: '最大行程', level: 3, value: '≥ 500 km', criteriaType: '定量', examMethod: '测试', srcSection: '4.2 行程与续航' },
          ]},
          { id: 'c-jd-3', name: '通行能力', level: 2, open: false, children: [
            { id: 'i-jd-4', name: '爬坡度', level: 3, value: '≥ 30°', criteriaType: '定量', examMethod: '试验', srcSection: '4.3 越障性能' },
            { id: 'i-jd-5', name: '涉水深度', level: 3, value: '≥ 1.2 m', criteriaType: '定量', examMethod: '试验', srcSection: '4.4 涉水性能' },
          ]},
        ],
      },
      {
        id: 'd-hl', name: '火力', level: 1, open: false, badge: 5,
        children: [
          { id: 'c-hl-1', name: '主炮性能', level: 2, open: false, children: [
            { id: 'i-hl-1', name: '主炮口径', level: 3, value: '125 mm', criteriaType: '定量', examMethod: '检验', srcSection: '5.1 主炮系统' },
            { id: 'i-hl-2', name: '穿甲弹初速', level: 3, value: '≥ 1700 m/s', criteriaType: '定量', examMethod: '实测', srcSection: '5.1 主炮系统' },
          ]},
          { id: 'c-hl-2', name: '射击效能', level: 2, open: false, children: [
            { id: 'i-hl-3', name: '射速', level: 3, value: '6–8 发/min', criteriaType: '定量', examMethod: '测试', srcSection: '5.2 射击性能' },
            { id: 'i-hl-4', name: '最大射程', level: 3, value: '≥ 4000 m', criteriaType: '定量', examMethod: '实测', srcSection: '5.2 射击性能' },
          ]},
          { id: 'c-hl-3', name: '命中精度', level: 2, open: false, children: [
            { id: 'i-hl-5', name: '首发命中概率', level: 3, value: '≥ 0.85', criteriaType: '定量', examMethod: '统计', srcSection: '5.3 命中精度' },
          ]},
        ],
      },
      {
        id: 'd-fh', name: '防护', level: 1, open: false, badge: 3,
        children: [
          { id: 'c-fh-1', name: '装甲防护', level: 2, open: false, children: [
            { id: 'i-fh-1', name: '装甲防护等级', level: 3, value: 'RHA 600 mm', criteriaType: '定量', examMethod: '检验', srcSection: '5.4 防护性能' },
            { id: 'i-fh-2', name: '核生化防护等级', level: 3, value: '超压 ≥ 4 Pa', criteriaType: '定量', examMethod: '测试', srcSection: '5.4 防护性能' },
          ]},
          { id: 'c-fh-2', name: '主动防护', level: 2, open: false, children: [
            { id: 'i-fh-3', name: '主动防护覆盖角', level: 3, value: '360°', criteriaType: '定量', examMethod: '验证', srcSection: '5.4 防护性能' },
          ]},
        ],
      },
      {
        id: 'd-kk', name: '可靠性', level: 1, open: false, badge: 4,
        children: [
          { id: 'c-kk-1', name: '可靠度指标', level: 2, open: false, children: [
            { id: 'i-kk-1', name: 'MTBF', level: 3, value: '≥ 320 h', criteriaType: '定量', examMethod: '统计', srcSection: '6.1 可靠性要求' },
            { id: 'i-kk-2', name: 'MTTR', level: 3, value: '≤ 2 h', criteriaType: '定量', examMethod: '测试', srcSection: '6.1 可靠性要求' },
            { id: 'i-kk-3', name: '使用可用度', level: 3, value: '≥ 0.92', criteriaType: '定量', examMethod: '统计', srcSection: '6.1 可靠性要求' },
          ]},
          { id: 'c-kk-2', name: '寿命指标', level: 2, open: false, children: [
            { id: 'i-kk-4', name: '寿命', level: 3, value: '≥ 25 年', criteriaType: '定量', examMethod: '分析', srcSection: '6.2 寿命要求' },
          ]},
        ],
      },
      {
        id: 'd-hj', name: '环境适应性', level: 1, open: false, badge: 4,
        children: [
          { id: 'c-hj-1', name: '温度适应性', level: 2, open: false, children: [
            { id: 'i-hj-1', name: '高温工作温度上限', level: 3, value: '≥ 55 ℃', criteriaType: '定量', examMethod: '试验', srcSection: '7.1 温度环境' },
            { id: 'i-hj-2', name: '低温工作温度下限', level: 3, value: '≤ −40 ℃', criteriaType: '定量', examMethod: '试验', srcSection: '7.1 温度环境' },
          ]},
          { id: 'c-hj-2', name: '防尘防水', level: 2, open: false, children: [
            { id: 'i-hj-3', name: '防尘等级', level: 3, value: 'IP6X', criteriaType: '定量', examMethod: '检验', srcSection: '7.2 防尘防水' },
            { id: 'i-hj-4', name: '防水等级', level: 3, value: 'IP67', criteriaType: '定量', examMethod: '检验', srcSection: '7.2 防尘防水' },
          ]},
        ],
      },
      {
        id: 'd-dz', name: '电磁兼容', level: 1, open: false, badge: 3,
        children: [
          { id: 'c-dz-1', name: '电磁发射', level: 2, open: false, children: [
            { id: 'i-dz-1', name: '传导发射限值', level: 3, value: '≤ RE102', criteriaType: '定量', examMethod: '测试', srcSection: '8.1 电磁兼容性能' },
          ]},
          { id: 'c-dz-2', name: '敏感度与接口', level: 2, open: false, children: [
            { id: 'i-dz-2', name: '辐射敏感度阈值', level: 3, value: '≥ RS103', criteriaType: '定量', examMethod: '测试', srcSection: '8.1 电磁兼容性能' },
            { id: 'i-dz-3', name: '综合电子系统接口', level: 3, value: 'MIL-STD-1553B', criteriaType: '定性', examMethod: '检验', srcSection: '8.2 接口标准' },
          ]},
        ],
      },
      {
        id: 'd-xx', name: '信息能力', level: 1, open: false, badge: 4,
        children: [
          { id: 'c-xx-1', name: '态势感知', level: 2, open: false, children: [
            { id: 'i-xx-1', name: '态势感知刷新率', level: 3, value: '≥ 2 Hz', criteriaType: '定量', examMethod: '测试', srcSection: '9.1 信息处理' },
            { id: 'i-xx-4', name: '目标识别距离', level: 3, value: '≥ 3000 m', criteriaType: '定量', examMethod: '实测', srcSection: '9.2 数据链' },
          ]},
          { id: 'c-xx-2', name: '通信与数据链', level: 2, open: false, children: [
            { id: 'i-xx-2', name: '通信距离', level: 3, value: '≥ 30 km', criteriaType: '定量', examMethod: '实测', srcSection: '9.1 信息处理' },
            { id: 'i-xx-3', name: '数据链吞吐量', level: 3, value: '≥ 2 Mbps', criteriaType: '定量', examMethod: '测试', srcSection: '9.2 数据链' },
          ]},
        ],
      },
    ],
  },
]
