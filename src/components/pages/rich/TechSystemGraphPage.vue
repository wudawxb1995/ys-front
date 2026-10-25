<template>
  <div class="rich-type-m30">
    <div class="m30-layout">
      <!-- 左：技术体系目录 -->
      <section class="sec-frame m30-tree-pane">
        <h3><i></i>技术体系</h3>
        <div class="m30-tree-scroll">
          <div class="m30-root">{{ m30Tree.name }}</div>
          <div v-for="dir in m30Tree.children" :key="dir.name">
            <div
              class="m30-dir"
              :class="{ on: m30ExpandedDir === dir.name }"
              @click="m30SelectDir(dir.name)"
            >
              <svg
                viewBox="0 0 24 24"
                width="12"
                height="12"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                class="m30-chevron"
                :class="{ open: m30ExpandedDir === dir.name }"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
              {{ dir.name }}
              <em>{{ dir.children?.length || 0 }}</em>
            </div>
            <template v-if="m30ExpandedDir === dir.name">
              <div
                v-for="sub in dir.children"
                :key="sub.name"
                class="m30-sub"
                :class="{ highlight: sub.highlight, on: m30FocusSub === sub.name }"
                @click.stop="m30SelectSub(sub.name)"
              >
                <span v-if="sub.highlight" class="star">★</span>{{ sub.name }}
                <span v-if="sub.caseBadge" class="case-pill">{{ sub.caseBadge }}</span>
              </div>
            </template>
          </div>
          <div class="m30-tree-foot">1 领域 · 6 二级方向 · 18 三级方向</div>
        </div>
      </section>

      <!-- 右：AntV G6 知识图谱 -->
      <section class="sec-frame m30-graph-pane">
        <h3>
          <i></i>技术体系知识图谱
          <em v-if="activeDirName">当前：{{ activeDirName }}</em>
        </h3>
        <div class="m30-graph-toolbar">
          <span>默认放大主结构 · 外圈可裁切 · 拖拽/滚轮继续查看</span>
          <button type="button" class="tb-btn" @click="resetView">复位视图</button>
        </div>
        <div class="m30-graph-scroll" ref="containerEl">
          <div ref="graphEl" class="m30-chart" />
        </div>
        <div class="m30-legend">
          <i class="lg hub"></i>领域
          <i class="lg l2"></i>二级方向
          <i class="lg l3"></i>三级方向
          <i class="lg case"></i>本次试验沉淀
        </div>
      </section>
      </div>
  </div>
</template>

<script>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Graph } from '@antv/g6'
import { useRichPage } from '@/composables/rich/useRichPage'

const CX = 0
const CY = 0
const L2_R = 140
const L3_R = 237
const CASE_R = 460 // 与三级拉开距离，避免案例框压盖温补圆
/** 默认放大主结构（中心+二级），外圈三级/案例允许被视口裁切 */
const DEFAULT_ZOOM = 0.9
/** 默认构图：图谱偏左、右侧留白（相对视口宽度） */
const DEFAULT_PAN_X = -0.18
const DEFAULT_PAN_Y = 0.02

const DIR_DEG = {
  定位定向技术: 15,
  弹道修正技术: -45,
  惯导技术: -115,
  遥测技术: 180,
  气象修正: 125,
  信号处理: 70,
}

function polar(r, deg) {
  const a = (deg * Math.PI) / 180
  return { x: CX + r * Math.cos(a), y: CY + r * Math.sin(a) }
}

/** 圆外标签方位：避免 bottom（易被画布裁切/避让隐藏），下半区改左右侧 */
function placementOf(deg) {
  const d = ((deg % 360) + 360) % 360
  if (d >= 315 || d < 90) return 'right'   // 右、右下 → 标签在右侧
  if (d >= 90 && d < 225) return 'left'     // 下左、左 → 标签在左侧
  return 'top'                             // 左上、上
}

export default {
  props: { page: Object, title: String },
  setup(props) {
    const ctx = useRichPage(props)
    const graphEl = ref(null)
    const containerEl = ref(null)
    let graph = null
    let ro = null
    let rendering = false

    const activeDirName = computed(() => ctx.m30ExpandedDir.value || '')

    function m30SelectDir(name) {
      ctx.m30ExpandedDir.value = name
      ctx.m30FocusSub.value = null
      // 写入 demoStore，供研判报告生成页自动带入对象
      if (ctx.demoStore) {
        ctx.demoStore.graphBrowseDirection = name
        ctx.demoStore.graphBrowseSub = ''
      }
    }

    function m30SelectSub(name) {
      if (!ctx.m30ExpandedDir.value) {
        const hit = ctx.m30Tree.children.find((d) => d.children?.some((c) => c.name === name))
        if (hit) ctx.m30ExpandedDir.value = hit.name
      }
      ctx.m30FocusSub.value = name
      if (ctx.demoStore) {
        ctx.demoStore.graphBrowseDirection = ctx.m30ExpandedDir.value || name
        ctx.demoStore.graphBrowseSub = name
      }
    }

    function buildData() {
      const active = ctx.m30ExpandedDir.value
      const focusSub = ctx.m30FocusSub.value
      const nodes = []
      const edges = []

      nodes.push({
        id: 'hub',
        data: { kind: 'hub', label: '试验鉴定\n技术' },
        style: { x: CX, y: CY },
      })

      ctx.m30Tree.children.forEach((dir) => {
        const deg = DIR_DEG[dir.name] ?? 0
        const p = polar(L2_R, deg)
        const on = dir.name === active
        const l2Id = `l2:${dir.name}`
        nodes.push({
          id: l2Id,
          data: {
            kind: 'l2',
            label: dir.name.replace(/技术$/, '\n技术').replace(/修正$/, '\n修正'),
            active: on,
            placement: placementOf(deg),
            name: dir.name,
          },
          style: { x: p.x, y: p.y },
        })
        edges.push({
          id: `e-hub-${l2Id}`,
          source: 'hub',
          target: l2Id,
          data: { active: on },
        })

        if (!on) return

        const kids = dir.children || []
        const n = kids.length
        const span = n <= 1 ? 0 : 40
        kids.forEach((sub, i) => {
          const t = n === 1 ? 0 : i - (n - 1) / 2
          const sdeg = deg + t * span
          const sp = polar(L3_R, sdeg)
          const l3Id = `l3:${sub.name}`
          const focus = !!(sub.highlight || sub.name === focusSub || (sub.caseBadge && !focusSub))
          nodes.push({
            id: l3Id,
            data: {
              kind: 'l3',
              label: sub.name,
              focus,
              placement: placementOf(sdeg),
              name: sub.name,
              badge: sub.caseBadge || '',
            },
            style: { x: sp.x, y: sp.y },
          })
          edges.push({
            id: `e-${l2Id}-${l3Id}`,
            source: l2Id,
            target: l3Id,
            data: { focus },
          })

          if (sub.caseBadge || sub.caseLabel) {
            // 案例框再外推并右移，避免压盖温补圆
            const cp = polar(CASE_R, sdeg)
            const rad = (sdeg * Math.PI) / 180
            cp.x += Math.cos(rad) * 48 + 56
            cp.y += Math.sin(rad) * 16 - 8
            const caseId = `case:${sub.name}`
            nodes.push({
              id: caseId,
              data: {
                kind: 'case',
                label: `${sub.caseBadge || '本次试验沉淀'}\n${sub.caseLabel || '第19发超差事件·温补失效案例'}`,
                placement: 'center',
              },
              style: { x: cp.x, y: cp.y },
            })
            edges.push({
              id: `e-${l3Id}-${caseId}`,
              source: l3Id,
              target: caseId,
              data: { case: true },
            })
          }
        })
      })

      return { nodes, edges }
    }

    function createGraph() {
      if (!graphEl.value) return
      const w = containerEl.value?.clientWidth || 640
      const h = containerEl.value?.clientHeight || 480

      graph = new Graph({
        container: graphEl.value,
        width: w,
        height: h,
        // 不 autoFit 全图，默认放大主结构，外圈允许裁切
        autoFit: false,
        padding: 0,
        zoomRange: [0.45, 2.8],
        animation: true,
        data: buildData(),
        node: {
          type: (d) => (d.data?.kind === 'case' ? 'rect' : 'circle'),
          style: {
            size: (d) => {
              const k = d.data?.kind
              if (k === 'hub') return 86
              if (k === 'l2') return d.data?.active ? 62 : 52
              if (k === 'case') return [176, 54]
              return d.data?.focus ? 42 : 36
            },
            fill: (d) => {
              const k = d.data?.kind
              if (k === 'hub') return 'l(0) 0:#2a6798 0.55:#0d4e83 1:#062f4f'
              if (k === 'l2') return d.data?.active ? 'l(0) 0:#1a6fb0 1:#0a3a60' : 'l(0) 0:#4a9acc 1:#1668a8'
              if (k === 'case') return '#fffaf0'
              return d.data?.focus ? '#fff3cc' : '#eef6fc'
            },
            stroke: (d) => {
              const k = d.data?.kind
              if (k === 'hub') return 'rgba(180,210,235,.65)'
              if (k === 'l2') return d.data?.active ? '#d0ab68' : 'rgba(255,255,255,.4)'
              if (k === 'case') return '#d0ab68'
              return d.data?.focus ? '#d0ab68' : '#8eb8d8'
            },
            lineWidth: (d) => {
              const k = d.data?.kind
              if (k === 'l2' && d.data?.active) return 3
              if (k === 'case' || d.data?.focus) return 2
              return 1.5
            },
            radius: 10,
            shadowColor: (d) => {
              if (d.data?.kind === 'case' || d.data?.focus || d.data?.active) return 'rgba(208,171,104,.45)'
              if (d.data?.kind === 'hub') return 'rgba(13,78,131,.5)'
              return 'rgba(13,78,131,.28)'
            },
            shadowBlur: (d) => (d.data?.active || d.data?.focus || d.data?.kind === 'case' ? 22 : 14),
            shadowOffsetY: 5,
            // 辉光：选中二级 / 聚焦三级
            halo: (d) => !!(d.data?.active || d.data?.focus || d.data?.kind === 'case'),
            haloStroke: (d) => (d.data?.kind === 'hub' ? '#5a9ad0' : '#d0ab68'),
            haloLineWidth: 14,
            haloStrokeOpacity: 0.35,
            // 标签：圆外 + 白底，避免压盖
            labelText: (d) => d.data?.label || '',
            labelPlacement: (d) => {
              if (d.data?.kind === 'hub' || d.data?.kind === 'case') return 'center'
              return d.data?.placement || 'bottom'
            },
            labelFill: (d) => {
              if (d.data?.kind === 'hub') return '#fff'
              if (d.data?.kind === 'case') return '#8a6000'
              if (d.data?.focus) return '#8a6000'
              if (d.data?.active) return '#0d4e83'
              return '#33506a'
            },
            labelFontSize: (d) => {
              if (d.data?.kind === 'hub') return 14
              if (d.data?.kind === 'case') return 11
              return 12
            },
            labelFontWeight: 700,
            labelLineHeight: 16,
            labelBackground: (d) => d.data?.kind !== 'hub',
            labelBackgroundFill: (d) => {
              if (d.data?.kind === 'case') return 'transparent'
              if (d.data?.focus) return 'rgba(255,248,224,.96)'
              return 'rgba(255,255,255,.94)'
            },
            labelBackgroundRadius: 6,
            labelPadding: [3, 7],
            labelBackgroundStroke: (d) => {
              if (d.data?.kind === 'hub' || d.data?.kind === 'case') return 'transparent'
              if (d.data?.focus || d.data?.active) return '#d0ab68'
              return '#d5e0ea'
            },
            labelBackgroundLineWidth: 1,
            labelOffsetX: (d) => {
              if (d.data?.kind === 'hub' || d.data?.kind === 'case') return 0
              const p = d.data?.placement
              if (p === 'left') return -14
              if (p === 'right') return 14
              return 0
            },
            labelOffsetY: (d) => {
              if (d.data?.kind === 'hub' || d.data?.kind === 'case') return 0
              const p = d.data?.placement
              if (p === 'top') return -14
              if (p === 'bottom') return 14
              return 0
            },
            badges: (d) => {
              if (!d.data?.badge || d.data?.kind !== 'l3') return []
              return [{ text: '沉淀', placement: 'right-top', offsetX: 4, offsetY: -2 }]
            },
            badgeFontSize: 10,
            badgePadding: [1, 5],
            badgeBackgroundFill: '#d0ab68',
            badgeFill: '#fff',
            cursor: 'pointer',
          },
          state: {
            active: {
              halo: true,
              haloStroke: '#d0ab68',
              lineWidth: 3,
            },
          },
        },
        edge: {
          type: (d) => (d.data?.case ? 'cubic' : 'quadratic'),
          style: {
            stroke: (d) => {
              if (d.data?.case || d.data?.focus) return '#d0ab68'
              if (d.data?.active) return '#1668a8'
              return '#b0c7dc'
            },
            lineWidth: (d) => {
              if (d.data?.case || d.data?.focus) return 2
              if (d.data?.active) return 2.4
              return 1.4
            },
            lineDash: (d) => (d.data?.case ? [6, 4] : undefined),
            opacity: 0.95,
            curveOffset: 28,
            shadowColor: 'rgba(13,78,131,.12)',
            shadowBlur: 4,
          },
        },
        behaviors: [
          'drag-canvas',
          'zoom-canvas',
          {
            type: 'hover-activate',
            degree: 1,
            state: 'active',
          },
          {
            type: 'auto-adapt-label',
            throttle: 80,
          },
        ],
        plugins: [
          {
            type: 'background',
            key: 'bg',
            background: 'radial-gradient(circle at 50% 45%, #f4f9fd 0%, #e8f0f7 55%, #dfe9f3 100%)',
          },
        ],
      })

      graph.on('node:click', (evt) => {
        const id = String(evt.target?.id || '')
        if (id.startsWith('l2:')) m30SelectDir(id.slice(3))
        else if (id.startsWith('l3:')) m30SelectSub(id.slice(3))
      })

      graph.render().then(() => applyDefaultView())
    }

    /** 默认如图：0.9 倍、图谱偏左、右侧留白 */
    async function applyDefaultView() {
      if (!graph) return
      const w = containerEl.value?.clientWidth || 640
      const h = containerEl.value?.clientHeight || 480
      try {
        await graph.focusElement('hub', false)
        await graph.zoomTo(DEFAULT_ZOOM, false)
        await graph.translateBy([w * DEFAULT_PAN_X, h * DEFAULT_PAN_Y], false)
      } catch (_) {
        try {
          await graph.fitCenter(false)
          await graph.zoomTo(DEFAULT_ZOOM, false)
          await graph.translateBy([w * DEFAULT_PAN_X, h * DEFAULT_PAN_Y], false)
        } catch (__) { /* ignore */ }
      }
    }

    async function refreshGraph() {
      if (!graph || rendering) return
      rendering = true
      try {
        graph.setData(buildData())
        await graph.render()
        await applyDefaultView()
      } finally {
        rendering = false
      }
    }

    function resetView() {
      applyDefaultView()
    }

    function resizeGraph() {
      if (!graph || !containerEl.value) return
      const w = containerEl.value.clientWidth
      const h = containerEl.value.clientHeight
      if (w > 0 && h > 0) {
        graph.resize(w, h)
        applyDefaultView()
      }
    }

    onMounted(async () => {
      await nextTick()
      createGraph()
      window.addEventListener('resize', resizeGraph)
      if (containerEl.value && typeof ResizeObserver !== 'undefined') {
        ro = new ResizeObserver(() => resizeGraph())
        ro.observe(containerEl.value)
      }
    })

    onBeforeUnmount(() => {
      window.removeEventListener('resize', resizeGraph)
      ro?.disconnect()
      graph?.destroy()
      graph = null
    })

    watch(
      () => [ctx.m30ExpandedDir.value, ctx.m30FocusSub.value],
      () => nextTick(refreshGraph),
    )

    return {
      ...ctx,
      graphEl,
      containerEl,
      activeDirName,
      m30SelectDir,
      m30SelectSub,
      resetView,
    }
  },
}
</script>

<style scoped>
.rich-type-m30 {
  --m30-page-h: calc(100vh - var(--top, 68px) - 88px);
  height: var(--m30-page-h);
  max-height: var(--m30-page-h);
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 14px 16px;
  box-shadow: 0 6px 18px rgba(15, 55, 95, .04);
  min-width: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
}
.m30-layout {
  flex: 1;
  min-height: 0;
  height: 100%;
  display: grid;
  grid-template-columns: 248px 1fr;
  gap: 14px;
  align-items: stretch;
}
.sec-frame {
  border: 1.5px dashed #b7d4ee;
  border-radius: 12px;
  background: #fff;
  min-width: 0;
  min-height: 0;
  height: 100%;
  max-height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.sec-frame h3 {
  font-size: 15px;
  color: var(--navy-2);
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 8px;
  font-weight: 700;
  flex: 0 0 auto;
}
.sec-frame h3 i {
  width: 4px;
  height: 16px;
  background: var(--blue);
  border-radius: 2px;
  display: inline-block;
}
.sec-frame h3 em {
  margin-left: auto;
  font-style: normal;
  font-size: 12px;
  font-weight: 500;
  color: #1668a8;
  background: #e8f3fb;
  padding: 2px 8px;
  border-radius: 8px;
}
.m30-tree-pane { padding: 14px 0 12px; }
.m30-tree-pane h3 { margin: 0 14px 10px; }
.m30-tree-scroll {
  flex: 1;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
}
.m30-graph-pane { padding: 14px 16px 12px; }
.m30-graph-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 12px;
  color: #8a99a8;
  flex: 0 0 auto;
}
.tb-btn {
  height: 28px;
  padding: 0 12px;
  border-radius: 6px;
  border: 1px solid #8eb4d4;
  background: #fff;
  color: #1668a8;
  font-size: 12px;
  cursor: pointer;
}
.tb-btn:hover { background: #f0f7fd; }
.m30-graph-scroll {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  border-radius: 10px;
  border: 1px solid #d5e0ea;
  position: relative;
  background: #e8f0f7;
}
.m30-chart {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
.m30-legend {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 8px;
  font-size: 12px;
  color: #5a6b7c;
  flex: 0 0 auto;
}
.m30-legend .lg {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
  margin-right: 4px;
  vertical-align: -1px;
  box-shadow: 0 0 8px rgba(13,78,131,.25);
}
.lg.hub { background: #0d4e83; }
.lg.l2 { background: #1668a8; }
.lg.l3 { background: #eaf4fc; border: 1.5px solid #8eb8d8; box-shadow: none; }
.lg.case { background: #d0ab68; box-shadow: 0 0 10px rgba(208,171,104,.55); border-radius: 3px; }
.m30-root {
  margin: 0 14px 8px;
  padding: 8px 12px;
  border-radius: 8px;
  background: linear-gradient(180deg, #f4f9fd, #eaf3fb);
  border: 1px solid #d5e6f4;
  color: var(--navy-2);
  font-size: 13.5px;
  font-weight: 700;
}
.m30-dir {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 14px;
  font-size: 13.5px;
  font-weight: 600;
  color: var(--navy-2);
  cursor: pointer;
}
.m30-dir:hover,
.m30-dir.on { background: #f0f7fd; color: var(--blue); }
.m30-dir em {
  margin-left: auto;
  font-style: normal;
  font-size: 12px;
  font-weight: 500;
  color: #8a99a8;
}
.m30-chevron { flex-shrink: 0; transition: transform .2s; }
.m30-chevron.open { transform: rotate(90deg); }
.m30-sub {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px 7px 34px;
  font-size: 13px;
  color: #4a5a6a;
  cursor: pointer;
}
.m30-sub:hover,
.m30-sub.on { background: #f5f9fd; }
.m30-sub.highlight { color: #8a6000; font-weight: 600; }
.m30-sub .star { color: var(--gold); }
.case-pill {
  margin-left: 4px;
  height: 18px;
  padding: 0 8px;
  border-radius: 9px;
  background: var(--gold);
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  line-height: 18px;
  white-space: nowrap;
}
.m30-tree-foot {
  margin: 12px 14px 0;
  padding-top: 10px;
  border-top: 1px solid var(--line);
  font-size: 12px;
  color: #8a99a8;
}
</style>
