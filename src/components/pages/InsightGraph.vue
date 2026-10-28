<template>
  <div
    ref="stage"
    class="ig"
    :class="{ ready }"
    @pointermove="onPointer"
    @pointerleave="onLeave"
  >
    <i class="blob b1"></i>
    <i class="blob b2"></i>
    <i class="blob b3"></i>
    <svg class="ig-svg" aria-hidden="true">
      <g ref="orbitGroup" class="orbits">
        <circle class="orbit o1" r="0" />
        <circle class="orbit o2" r="0" />
      </g>
      <path
        v-for="link in links"
        :key="link.id"
        class="ig-link"
        :class="{ hot: hotLink(link), dim: dimLink(link) }"
        :data-from="link.from"
        :data-to="link.to"
        :data-bend="link.bend"
      />
      <circle
        v-for="dot in dots"
        :key="dot.id"
        class="ig-dot"
        :class="{ dim: dimLink(dot), hot: hotLink(dot) }"
        r="2.2"
        :data-from="dot.from"
        :data-to="dot.to"
        :data-bend="dot.bend"
        :data-phase="dot.phase"
      />
    </svg>
    <button
      v-for="node in nodes"
      :key="node.id"
      type="button"
      class="ig-node"
      :class="{ hub: node.hub, on: selected === node.id, dim: dimNode(node), near: nearIds.has(node.id) }"
      :data-id="node.id"
      @click="$emit('update:selected', node.id)"
      @mouseenter="hover = node.id"
      @mouseleave="hover = ''"
    >
      <span class="orb" :class="{ hollow: node.hollow, hub: node.hub }" :style="orbStyle(node)">
        <span v-if="node.hub" class="hub-text">{{ node.label }}</span>
      </span>
      <span v-if="!node.hub" class="pill">{{ node.label }}</span>
    </button>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps({
  nodes: { type: Array, default: () => [] },
  links: { type: Array, default: () => [] },
  selected: { type: String, default: 'hub' },
  focus: { type: String, default: '全部节点' },
})
defineEmits(['update:selected'])

const stage = ref(null)
const orbitGroup = ref(null)
const ready = ref(false)
const hover = ref('')
const dots = computed(() => props.links.flatMap((link) => ([
  { id: `${link.id}-a`, from: link.from, to: link.to, bend: link.bend, phase: 0 },
  { id: `${link.id}-b`, from: link.from, to: link.to, bend: link.bend, phase: 0.48 },
])))

const nearIds = computed(() => {
  const id = hover.value || props.selected
  const set = new Set()
  props.links.forEach((link) => {
    if (link.from === id || link.to === id) {
      set.add(link.from)
      set.add(link.to)
    }
  })
  set.delete(id)
  return set
})

const points = new Map()
let raf = 0
let ro
let width = 0
let height = 0
const pointer = { x: 0, y: 0 }
const eased = { x: 0, y: 0 }
let started = 0

function dimNode(node) {
  if (!props.focus || props.focus === '全部节点') return false
  if (node.hub || node.id === props.selected) return false
  return node.group !== props.focus
}
function dimLink(link) {
  if (!props.focus || props.focus === '全部节点') return false
  const from = props.nodes.find((node) => node.id === link.from)
  const to = props.nodes.find((node) => node.id === link.to)
  return dimNode(from || {}) || dimNode(to || {})
}
function hotLink(link) {
  const id = hover.value || props.selected
  return link.from === id || link.to === id
}
function orbStyle(node) {
  return { width: `${node.size}px`, height: `${node.size}px` }
}

function layoutOf(node) {
  const cx = width / 2
  const cy = height / 2 + 6
  const rx = Math.max(108, width / 2 - 168)
  const ry = Math.max(96, height / 2 - 72)
  if (node.hub) return { x: cx, y: cy, depth: 0.15 }
  const rad = (node.angle * Math.PI) / 180
  const reach = Math.min(node.radius, 0.92)
  return {
    x: cx + Math.cos(rad) * rx * reach,
    y: cy + Math.sin(rad) * ry * reach,
    depth: 0.45 + reach * 0.7,
  }
}

function controlPoint(a, b, bend) {
  const mx = (a.x + b.x) / 2
  const my = (a.y + b.y) / 2
  const dx = b.x - a.x
  const dy = b.y - a.y
  const len = Math.hypot(dx, dy) || 1
  return { x: mx + (-dy / len) * bend, y: my + (dx / len) * bend }
}

function circleBox(x, y, size) {
  const r = size / 2 + 6
  return { left: x - r, top: y - r, right: x + r, bottom: y + r }
}
function overlaps(a, b, pad = 5) {
  return a.left < b.right + pad && a.right > b.left - pad && a.top < b.bottom + pad && a.bottom > b.top - pad
}
function anchorBox(x, y, dir, dist, w, h) {
  const px = x + Math.cos(dir) * dist
  const py = y + Math.sin(dir) * dist
  const c = Math.cos(dir)
  const s = Math.sin(dir)
  let left = px
  let top = py
  if (c < -0.25) left = px - w
  else if (c < 0.25) left = px - w / 2
  if (s < -0.25) top = py - h
  else if (s < 0.25) top = py - h / 2
  return { left, top, right: left + w, bottom: top + h }
}
function curvePoint(a, b, c, t) {
  const u = 1 - t
  return {
    x: u * u * a.x + 2 * u * t * c.x + t * t * b.x,
    y: u * u * a.y + 2 * u * t * c.y + t * t * b.y,
  }
}

function measure() {
  const box = stage.value?.getBoundingClientRect()
  if (!box) return
  width = box.width
  height = box.height
  const cx = width / 2
  const cy = height / 2 + 6
  const rx = Math.max(108, width / 2 - 168)
  const ry = Math.max(96, height / 2 - 72)
  if (orbitGroup.value) orbitGroup.value.setAttribute('transform', `translate(${cx} ${cy})`)
  const orbits = orbitGroup.value?.querySelectorAll('circle') || []
  if (orbits[0]) orbits[0].setAttribute('r', String(Math.min(rx, ry) * 0.42))
  if (orbits[1]) orbits[1].setAttribute('r', String(Math.min(rx, ry) * 0.72))
}

function onPointer(event) {
  const box = stage.value.getBoundingClientRect()
  pointer.x = (event.clientX - box.left) / box.width - 0.5
  pointer.y = (event.clientY - box.top) / box.height - 0.5
}
function onLeave() {
  pointer.x = 0
  pointer.y = 0
  hover.value = ''
}

function tick(now) {
  if (!started) started = now
  const t = (now - started) / 1000
  eased.x += (pointer.x - eased.x) * 0.06
  eased.y += (pointer.y - eased.y) * 0.06
  const root = stage.value
  if (root && width) {
    props.nodes.forEach((node, index) => {
      const base = layoutOf(node)
      const amp = node.hub ? 4 : 7 + (index % 3)
      const speed = node.hub ? 0.55 : 0.72 + (index % 5) * 0.08
      const phase = index * 0.7
      const x = base.x + Math.sin(t * speed + phase) * amp + eased.x * 22 * base.depth
      const y = base.y + Math.cos(t * speed * 0.85 + phase) * amp * 0.85 + eased.y * 16 * base.depth
      points.set(node.id, { x, y })
      const el = root.querySelector(`.ig-node[data-id="${node.id}"]`)
      if (!el) return
      el.style.transform = `translate(${x}px, ${y}px)`
    })
    const reserved = []
    const hub = points.get('hub')
    const hubNode = props.nodes.find((node) => node.hub)
    if (hub && hubNode) reserved.push(circleBox(hub.x, hub.y, hubNode.size))
    const labeled = props.nodes
      .filter((node) => !node.hub)
      .map((node) => {
        const pos = points.get(node.id)
        const el = root.querySelector(`.ig-node[data-id="${node.id}"]`)
        const pill = el?.querySelector('.pill')
        if (pos) reserved.push(circleBox(pos.x, pos.y, node.size))
        return { node, pos, pill }
      })
      .filter((item) => item.pos && item.pill)
      .sort((a, b) => b.node.radius - a.node.radius)
    labeled.forEach(({ node, pos, pill }) => {
      const w = pill.offsetWidth
      const h = pill.offsetHeight
      const base = (node.angle * Math.PI) / 180
      const dist = node.size / 2 + 8
      const dirs = [0, 0.7, -0.7, 1.3, -1.3, 2, -2, Math.PI]
      const turns = pill.dataset.dir ? [Number(pill.dataset.dir) - base, ...dirs] : dirs
      let chosen = null
      let chosenDir = base
      for (const extra of [0, 24, 46]) {
        for (const turn of turns) {
          const box = anchorBox(pos.x, pos.y, base + turn, dist + extra, w, h)
          const inside = box.left >= 2 && box.top >= 2 && box.right <= width - 2 && box.bottom <= height - 2
          if (!inside) continue
          if (reserved.some((item) => overlaps(box, item))) continue
          chosen = box
          chosenDir = base + turn
          break
        }
        if (chosen) break
      }
      pill.dataset.dir = String(chosenDir)
      if (!chosen) chosen = anchorBox(pos.x, pos.y, base, dist, w, h)
      reserved.push(chosen)
      pill.style.transform = `translate(${chosen.left - pos.x}px, ${chosen.top - pos.y}px)`
    })
    root.querySelectorAll('.ig-link').forEach((path) => {
      const a = points.get(path.dataset.from)
      const b = points.get(path.dataset.to)
      if (!a || !b) return
      const sway = Number(path.dataset.bend) + Math.sin(t * 0.8 + Number(path.dataset.bend)) * 6
      const c = controlPoint(a, b, sway)
      path.setAttribute('d', `M ${a.x} ${a.y} Q ${c.x} ${c.y} ${b.x} ${b.y}`)
    })
    root.querySelectorAll('.ig-dot').forEach((dot) => {
      const a = points.get(dot.dataset.from)
      const b = points.get(dot.dataset.to)
      if (!a || !b) return
      const sway = Number(dot.dataset.bend) + Math.sin(t * 0.8 + Number(dot.dataset.bend)) * 6
      const c = controlPoint(a, b, sway)
      const travel = (t * 0.16 + Number(dot.dataset.phase)) % 1
      const p = curvePoint(a, b, c, travel)
      dot.setAttribute('cx', String(p.x))
      dot.setAttribute('cy', String(p.y))
    })
  }
  if (!ready.value) ready.value = true
  raf = requestAnimationFrame(tick)
}

onMounted(() => {
  measure()
  ro = new ResizeObserver(measure)
  if (stage.value) ro.observe(stage.value)
  raf = requestAnimationFrame(tick)
})
onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  ro?.disconnect()
})
watch(() => props.nodes, () => { ready.value = false })
</script>

<style scoped>
.ig {
  position: relative;
  min-height: 640px;
  height: 640px;
  border-radius: 12px;
  overflow: hidden;
  background:
    radial-gradient(520px 280px at 50% 46%, rgba(214, 230, 245, .9), rgba(243, 247, 252, .2) 70%),
    linear-gradient(180deg, #f7fafd, #eef3f8);
}
.ig-svg, .ig-node { opacity: 0; }
.ig.ready .ig-svg, .ig.ready .ig-node { opacity: 1; transition: opacity .45s ease; }
.blob {
  position: absolute; border-radius: 50%; filter: blur(26px); pointer-events: none;
  animation: drift 16s ease-in-out infinite;
}
.b1 { width: 200px; height: 200px; left: 6%; top: 10%; background: rgba(186, 214, 238, .55); }
.b2 { width: 240px; height: 240px; right: 4%; bottom: 6%; background: rgba(214, 228, 242, .7); animation-delay: -6s; }
.b3 { width: 140px; height: 140px; left: 38%; bottom: 14%; background: rgba(196, 220, 240, .45); animation-delay: -10s; }
.ig-svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
.orbit { fill: none; stroke: rgba(126, 166, 204, .35); stroke-width: 1; stroke-dasharray: 2 9; transform-box: fill-box; transform-origin: center; }
.o1 { animation: spin 42s linear infinite; }
.o2 { animation: spin 68s linear infinite reverse; stroke-dasharray: 1 12; }
.ig-link { fill: none; stroke: #c5d4e3; stroke-width: 1.35; transition: stroke .25s, stroke-width .25s, opacity .35s; }
.ig-link.hot { stroke: #3b82c4; stroke-width: 2.1; stroke-dasharray: 6 9; animation: flow 1.15s linear infinite; }
.ig-link.dim { opacity: .08; }
.ig-dot { fill: #7eb0dc; opacity: .75; pointer-events: none; transition: opacity .35s; }
.ig-dot.hot { fill: #2f78bc; opacity: 1; }
.ig-dot.dim { opacity: 0; }
.ig-node {
  position: absolute; left: 0; top: 0; padding: 0; border: 0; background: none;
  cursor: pointer; z-index: 1; transition: opacity .35s ease;
}
.ig-node.hub { z-index: 2; }
.ig-node.on { z-index: 4; }
.ig-node.dim { opacity: .16; }
.orb {
  position: absolute; left: 0; top: 0; border-radius: 50%;
  transform: translate(-50%, -50%);
  background: radial-gradient(circle at 32% 28%, #8ec4ef 0%, #3d86c8 38%, #1a5c9a 70%, #123f72 100%);
  box-shadow:
    inset 0 1px 1px rgba(255, 255, 255, .5),
    inset 0 -10px 16px rgba(8, 32, 64, .28),
    0 10px 18px rgba(22, 72, 120, .22);
  transition: transform .25s ease;
}
.orb.hollow {
  background: radial-gradient(circle at 32% 28%, #fff 0%, #f7fbfe 68%, #e7f0f8 100%);
  box-shadow: inset 0 0 0 1.5px #d5e3f0, 0 8px 14px rgba(40, 80, 120, .1);
}
.orb.hub {
  background: radial-gradient(circle at 36% 30%, #3f86cf 0%, #1a5ea3 46%, #0d3e74 78%, #0a315c 100%);
  box-shadow:
    inset 0 1px 1px rgba(255, 255, 255, .35),
    0 0 0 8px rgba(70, 132, 188, .08),
    0 14px 28px rgba(16, 58, 102, .28);
  animation: hub 4.6s ease-in-out infinite;
}
.ig-node:hover .orb { transform: translate(-50%, -50%) scale(1.07); }
.ig-node.on .orb::before {
  content: "";
  position: absolute;
  inset: -8px;
  border-radius: 50%;
  border: 3px solid #e4c48a;
  box-shadow: 0 0 0 7px rgba(228, 196, 138, .28), 0 0 18px rgba(228, 196, 138, .45);
  animation: ring 1.8s ease-in-out infinite;
}
.ig-node.on .orb::after {
  content: "";
  position: absolute;
  inset: -8px;
  border-radius: 50%;
  border: 2px solid rgba(228, 196, 138, .75);
  animation: ripple 2.4s ease-out infinite;
}
.orb.hub::after {
  content: "";
  position: absolute;
  inset: -6px;
  border-radius: 50%;
  border: 1px solid rgba(120, 176, 220, .45);
  animation: ripple 3.4s ease-out infinite;
}
.hub-text {
  position: absolute; inset: 10px;
  display: flex; align-items: center; justify-content: center;
  color: #fff; text-align: center; font-size: 13px; font-weight: 650; line-height: 1.35;
  text-shadow: 0 1px 2px rgba(0, 0, 0, .25); pointer-events: none;
}
.pill {
  position: absolute; left: 0; top: 0;
  width: max-content; max-width: 132px; padding: 4px 8px;
  background: #fff; color: #243e58; border: 1px solid #e5eef6; border-radius: 8px;
  font-size: 12px; line-height: 1.35; text-align: left;
  box-shadow: 0 6px 14px rgba(28, 62, 96, .08);
}
.ig-node.on .pill { border-color: #e4c48a; box-shadow: 0 6px 16px rgba(176, 138, 60, .2); }
.ig-node.near .orb { box-shadow: inset 0 1px 1px rgba(255,255,255,.5), 0 0 0 5px rgba(61, 134, 200, .16), 0 10px 18px rgba(22, 72, 120, .22); }
@keyframes drift {
  50% { transform: translate(16px, -12px) scale(1.06); }
}
@keyframes hub {
  50% { filter: brightness(1.06); }
}
@keyframes ring {
  50% { box-shadow: 0 0 0 11px rgba(228, 196, 138, .12), 0 0 22px rgba(228, 196, 138, .35); }
}
@keyframes ripple {
  0% { transform: scale(.86); opacity: .8; }
  100% { transform: scale(1.35); opacity: 0; }
}
@keyframes flow { to { stroke-dashoffset: -30; } }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
