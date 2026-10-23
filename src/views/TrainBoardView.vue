<template>
  <div class="board">
    <header class="top">
      <div class="brand" @click="router.push('/hub')">
        <div class="logo"><Mark /></div>
        <div>
          <b>试验鉴定领域大模型训推平台</b>
          <span>专域预训练 · 训练监控态势</span>
        </div>
      </div>
      <div class="task">
        <i :class="{ live: running }"></i>
        <strong>鉴定-Qwen32B 专域预训练</strong>
        <em>{{ running ? '训练中 · 第 8/12 轮' : '已暂停' }}</em>
      </div>
      <div class="top-actions">
        <span class="clock">{{ clock }}</span>
        <button @click="running = !running">{{ running ? '暂停刷新' : '继续刷新' }}</button>
        <button class="ghost" @click="router.push('/hub')">返回</button>
      </div>
    </header>

    <section class="kpis">
      <article v-for="item in kpis" :key="item.label">
        <span>{{ item.label }}</span>
        <b>{{ item.value }}<small>{{ item.unit }}</small></b>
        <em :class="item.tone">{{ item.hint }}</em>
      </article>
    </section>

    <section class="body">
      <aside class="panel flow">
        <h3>训练全流程</h3>
        <button
          v-for="(stage, index) in stages"
          :key="stage.name"
          :class="['stage', stage.state, { on: activeStage === index }]"
          @click="focusStage(index)"
        >
          <i>{{ String(index + 1).padStart(2, '0') }}</i>
          <div>
            <b>{{ stage.name }}</b>
            <span>{{ stage.detail }}</span>
          </div>
        </button>
      </aside>

      <div class="center">
        <div class="panel chart-panel">
          <header>
            <h3>训练损失曲线</h3>
            <span>步 {{ step.toLocaleString() }} · 学习率 1.2e-5</span>
          </header>
          <div ref="lossEl" class="chart tall"></div>
        </div>
        <div class="split">
          <div class="panel chart-panel">
            <header><h3>评估指标</h3><span>准确率 / 召回率</span></header>
            <div ref="evalEl" class="chart"></div>
          </div>
          <div class="panel chart-panel">
            <header><h3>显存占用</h3><span>集群均值 / 80 GB</span></header>
            <div ref="memEl" class="chart"></div>
          </div>
        </div>
      </div>

      <aside class="panel gpus">
        <h3>GPU 利用率</h3>
        <button
          v-for="gpu in gpus"
          :key="gpu.id"
          :class="{ on: selected === gpu.id }"
          @click="selected = gpu.id"
        >
          <div class="gpu-h">
            <b>{{ gpu.id }}</b>
            <span>{{ gpu.util }}%</span>
          </div>
          <div class="bar"><i :style="{ width: gpu.util + '%' }"></i></div>
          <div class="gpu-m">显存 {{ gpu.mem }} GB · {{ gpu.temp }}°C</div>
        </button>
        <div v-if="currentGpu" class="gpu-detail">
          <b>{{ currentGpu.id }} 节点</b>
          <p>利用率 {{ currentGpu.util }}% · 显存 {{ currentGpu.mem }}/80 GB</p>
          <p>温度 {{ currentGpu.temp }}°C · 功耗 {{ currentGpu.power }} W</p>
        </div>
      </aside>
    </section>

    <footer class="log">
      <b>训练日志</b>
      <div>
        <p v-for="line in logs" :key="line.id">
          <span>{{ line.time }}</span>{{ line.text }}
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import Mark from '@/components/Mark.vue'

const router = useRouter()
const running = ref(true)
const clock = ref('')
const step = ref(18420)
const selected = ref('GPU0')
const activeStage = ref(2)
const lossEl = ref(null)
const evalEl = ref(null)
const memEl = ref(null)

const stages = [
  { name: '数据接入', state: 'done', detail: '42 个源数据集已入库' },
  { name: '清洗提炼', state: 'done', detail: '8.6 万问答对已打包' },
  { name: '专域预训练', state: 'run', detail: '第 8/12 轮进行中' },
  { name: '置信评估', state: 'run', detail: '准确率 0.88 · 召回 0.85' },
  { name: '量化压缩', state: 'wait', detail: '待本轮训练结束' },
  { name: '服务部署', state: 'wait', detail: '待评估通过后发布' },
]

const gpus = ref([
  { id: 'GPU0', util: 87, mem: 62, temp: 68, power: 286 },
  { id: 'GPU1', util: 92, mem: 64, temp: 71, power: 302 },
  { id: 'GPU2', util: 85, mem: 61, temp: 67, power: 274 },
  { id: 'GPU3', util: 89, mem: 63, temp: 69, power: 291 },
  { id: 'GPU4', util: 91, mem: 65, temp: 72, power: 308 },
  { id: 'GPU5', util: 84, mem: 60, temp: 66, power: 268 },
  { id: 'GPU6', util: 88, mem: 62, temp: 68, power: 283 },
  { id: 'GPU7', util: 86, mem: 61, temp: 67, power: 277 },
])

const lossX = ref(['E1', 'E2', 'E3', 'E4', 'E5', 'E6', 'E7', 'E8'])
const lossY = ref([2.84, 2.21, 1.76, 1.42, 1.18, 1.02, 0.91, 0.83])
const evalX = ref(['E1', 'E2', 'E3', 'E4', 'E5', 'E6', 'E7', 'E8'])
const accuracy = ref([0.72, 0.76, 0.79, 0.82, 0.84, 0.86, 0.87, 0.88])
const recall = ref([0.68, 0.71, 0.74, 0.77, 0.80, 0.82, 0.83, 0.85])
const memX = ref(['E1', 'E2', 'E3', 'E4', 'E5', 'E6', 'E7', 'E8'])
const memY = ref([58, 60, 61, 62, 63, 62, 64, 63])
const logs = ref([
  { id: 1, time: '15:36:02', text: 'step 18420  loss 0.830  lr 1.2e-5  tokens/s 1860' },
  { id: 2, time: '15:35:48', text: '评估批次完成  准确率 0.881  召回率 0.852' },
  { id: 3, time: '15:35:11', text: 'GPU1 利用率 92%  显存 64/80 GB  温度 71°C' },
])
let logSeq = 4
let timer = null
let clockTimer = null
let lossChart = null
let evalChart = null
let memChart = null

const currentGpu = computed(() => gpus.value.find((item) => item.id === selected.value))
const kpis = computed(() => {
  const loss = lossY.value[lossY.value.length - 1]
  const acc = accuracy.value[accuracy.value.length - 1]
  const rec = recall.value[recall.value.length - 1]
  const util = Math.round(gpus.value.reduce((sum, item) => sum + item.util, 0) / gpus.value.length)
  const mem = Math.round(gpus.value.reduce((sum, item) => sum + item.mem, 0) / gpus.value.length)
  return [
    { label: '当前损失', value: loss.toFixed(3), unit: '', hint: '持续下降', tone: 'ok' },
    { label: '评估准确率', value: acc.toFixed(3), unit: '', hint: '较上轮 +0.004', tone: 'ok' },
    { label: '召回率', value: rec.toFixed(3), unit: '', hint: '鉴定问答集', tone: '' },
    { label: 'GPU 均值', value: String(util), unit: '%', hint: '8 卡在训', tone: 'ok' },
    { label: '显存占用', value: String(mem), unit: '/80 GB', hint: '无溢出', tone: 'ok' },
    { label: '吞吐', value: '1,860', unit: ' tok/s', hint: '全局批次 128', tone: '' },
  ]
})

const axis = {
  axisLabel: { color: '#8ea4bb', fontSize: 11 },
  axisLine: { lineStyle: { color: 'rgba(120,160,190,.25)' } },
  axisTick: { show: false },
  splitLine: { lineStyle: { color: 'rgba(120,160,190,.12)' } },
}

function plain(list) {
  return list.map((item) => item)
}

function base(x, yAxis = {}) {
  return {
    grid: { top: 28, right: 16, bottom: 26, left: 46 },
    tooltip: { trigger: 'axis', backgroundColor: '#0d2136', borderColor: '#1d4e73', textStyle: { color: '#d7e7f4', fontSize: 12 } },
    xAxis: { type: 'category', data: plain(x), axisLabel: axis.axisLabel, axisLine: axis.axisLine, axisTick: { show: false } },
    yAxis: { type: 'value', axisLabel: axis.axisLabel, axisLine: { show: false }, axisTick: { show: false }, splitLine: axis.splitLine, ...yAxis },
  }
}

function paint() {
  lossChart?.setOption({
    ...base(lossX.value),
    series: [{
      type: 'line', data: plain(lossY.value), smooth: true, symbol: 'none',
      lineStyle: { color: '#3ec6ff', width: 2 },
      areaStyle: { color: 'rgba(62,198,255,.16)' },
    }],
  })
  evalChart?.setOption({
    ...base(evalX.value, { min: 0.6, max: 1 }),
    legend: { top: 0, right: 8, textStyle: { color: '#9eb4c8', fontSize: 11 }, itemWidth: 12, itemHeight: 8 },
    series: [
      { name: '准确率', type: 'line', data: plain(accuracy.value), smooth: true, symbol: 'circle', symbolSize: 6, lineStyle: { color: '#3ec6ff', width: 2 }, itemStyle: { color: '#3ec6ff' } },
      { name: '召回率', type: 'line', data: plain(recall.value), smooth: true, symbol: 'circle', symbolSize: 6, lineStyle: { color: '#d0ab68', width: 2 }, itemStyle: { color: '#d0ab68' } },
    ],
  })
  memChart?.setOption({
    ...base(memX.value, { min: 40, max: 80 }),
    series: [{
      type: 'line', data: plain(memY.value), smooth: true, symbol: 'none',
      lineStyle: { color: '#49d39a', width: 2 },
      areaStyle: { color: 'rgba(73,211,154,.16)' },
    }],
  })
}

function tickClock() {
  const now = new Date()
  clock.value = now.toLocaleString('zh-CN', { hour12: false })
}

function pushLog(text) {
  const now = new Date()
  const time = [now.getHours(), now.getMinutes(), now.getSeconds()].map((n) => String(n).padStart(2, '0')).join(':')
  logs.value.unshift({ id: logSeq++, time, text })
  logs.value = logs.value.slice(0, 5)
}

function tick() {
  if (!running.value) return
  step.value += 20
  const last = lossY.value[lossY.value.length - 1]
  const next = Math.max(0.46, +(last * 0.997 + (Math.random() - 0.62) * 0.018).toFixed(3))
  lossX.value = [...lossX.value.slice(-15), String(step.value)]
  lossY.value = [...lossY.value.slice(-15), next]
  gpus.value = gpus.value.map((gpu) => ({
    ...gpu,
    util: Math.min(97, Math.max(78, gpu.util + Math.round((Math.random() - 0.5) * 4))),
    mem: Math.min(72, Math.max(56, gpu.mem + Math.round((Math.random() - 0.5) * 2))),
    temp: Math.min(78, Math.max(62, gpu.temp + Math.round((Math.random() - 0.5) * 2))),
    power: Math.min(340, Math.max(250, gpu.power + Math.round((Math.random() - 0.5) * 12))),
  }))
  if (step.value % 80 === 0) {
    const acc = Math.min(0.94, +(accuracy.value.at(-1) + 0.002).toFixed(3))
    const rec = Math.min(0.92, +(recall.value.at(-1) + 0.002).toFixed(3))
    evalX.value = [...evalX.value.slice(-11), `S${step.value}`]
    accuracy.value = [...accuracy.value.slice(-11), acc]
    recall.value = [...recall.value.slice(-11), rec]
    const mem = Math.round(gpus.value.reduce((sum, item) => sum + item.mem, 0) / gpus.value.length)
    memX.value = [...memX.value.slice(-11), `S${step.value}`]
    memY.value = [...memY.value.slice(-11), mem]
    pushLog(`评估批次完成  准确率 ${acc.toFixed(3)}  召回率 ${rec.toFixed(3)}`)
  } else if (step.value % 40 === 0) {
    const hot = [...gpus.value].sort((a, b) => b.util - a.util)[0]
    pushLog(`${hot.id} 利用率 ${hot.util}%  显存 ${hot.mem}/80 GB  温度 ${hot.temp}°C`)
  } else {
    pushLog(`step ${step.value}  loss ${next.toFixed(3)}  lr 1.2e-5  tokens/s ${1800 + (step.value % 90)}`)
  }
  paint()
}

function focusStage(index) {
  activeStage.value = index
  const stage = stages[index]
  pushLog(`查看环节「${stage.name}」· ${stage.detail}`)
}

function onResize() {
  lossChart?.resize()
  evalChart?.resize()
  memChart?.resize()
}

onMounted(async () => {
  tickClock()
  clockTimer = setInterval(tickClock, 1000)
  await nextTick()
  lossChart = echarts.init(lossEl.value)
  evalChart = echarts.init(evalEl.value)
  memChart = echarts.init(memEl.value)
  paint()
  timer = setInterval(tick, 1600)
  window.addEventListener('resize', onResize)
  requestAnimationFrame(onResize)
})

watch(running, (value) => {
  pushLog(value ? '训练监控已继续刷新' : '训练监控已暂停刷新')
})

onBeforeUnmount(() => {
  clearInterval(timer)
  clearInterval(clockTimer)
  window.removeEventListener('resize', onResize)
  lossChart?.dispose()
  evalChart?.dispose()
  memChart?.dispose()
})
</script>

<style scoped>
.board {
  height: 100vh;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px 16px 12px;
  color: #d7e6f2;
  background:
    radial-gradient(900px 280px at 50% -80px, rgba(22, 104, 168, .35), transparent 70%),
    linear-gradient(180deg, #071422 0%, #06101a 100%);
  overflow: hidden;
}
.board::before {
  content: "";
  position: fixed;
  inset: 0;
  pointer-events: none;
  background-image: linear-gradient(rgba(90, 150, 190, .05) 1px, transparent 1px), linear-gradient(90deg, rgba(90, 150, 190, .05) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: linear-gradient(180deg, #000, transparent 88%);
}
.top, .kpis, .body, .log { position: relative; z-index: 1; }
.top { display: flex; align-items: center; gap: 18px; }
.brand { display: flex; align-items: center; gap: 10px; cursor: pointer; min-width: 320px; }
.logo { width: 36px; height: 36px; flex: 0 0 36px; }
.brand b { display: block; font-size: 16px; letter-spacing: .4px; }
.brand span, .task em, .top-actions .clock { color: #8eabc2; font-size: 12px; }
.task { flex: 1; display: flex; align-items: center; justify-content: center; gap: 10px; }
.task i { width: 8px; height: 8px; border-radius: 50%; background: #6d8294; }
.task i.live { background: #49d39a; box-shadow: 0 0 0 0 rgba(73, 211, 154, .7); animation: pulse 1.6s infinite; }
.task strong { font-size: 15px; }
.top-actions { display: flex; align-items: center; gap: 8px; }
.top-actions button, .stage, .gpus button {
  border: 1px solid rgba(90, 160, 205, .35);
  background: rgba(10, 32, 52, .72);
  color: #d7e6f2;
  border-radius: 8px;
}
.top-actions button { height: 32px; padding: 0 12px; }
.top-actions .ghost { background: transparent; }
.kpis { display: grid; grid-template-columns: repeat(6, 1fr); gap: 10px; }
.kpis article {
  padding: 10px 12px 8px;
  border: 1px solid rgba(80, 150, 196, .28);
  border-radius: 12px;
  background: linear-gradient(180deg, rgba(16, 42, 68, .9), rgba(8, 22, 38, .9));
}
.kpis span, .kpis em { display: block; color: #8eabc2; font-size: 12px; }
.kpis b { display: block; margin: 4px 0 2px; font-size: 26px; line-height: 1; color: #f3f8fc; font-variant-numeric: tabular-nums; }
.kpis small { margin-left: 4px; font-size: 12px; color: #8eabc2; font-weight: 500; }
.kpis em.ok { color: #49d39a; }
.body { flex: 1; min-height: 0; display: grid; grid-template-columns: 250px minmax(0, 1fr) 280px; gap: 12px; }
.panel {
  border: 1px solid rgba(80, 150, 196, .28);
  border-radius: 14px;
  background: rgba(8, 22, 38, .78);
  box-shadow: inset 0 1px 0 rgba(180, 220, 245, .06);
}
.flow, .gpus { padding: 12px; overflow: auto; }
.flow h3, .gpus h3, .chart-panel h3 { font-size: 14px; font-weight: 650; }
.stage, .gpus button { width: 100%; text-align: left; margin-top: 8px; padding: 8px 10px; cursor: pointer; }
.stage { display: flex; gap: 10px; align-items: center; }
.stage i { width: 28px; color: #8eabc2; font-style: normal; font-size: 12px; }
.stage b, .gpus b { display: block; font-size: 13px; }
.stage span, .gpu-m, .gpu-detail p { color: #8eabc2; font-size: 12px; }
.stage.done { border-color: rgba(73, 211, 154, .35); }
.stage.run { border-color: rgba(62, 198, 255, .7); box-shadow: 0 0 16px rgba(62, 198, 255, .12); }
.stage.on, .gpus button.on { background: rgba(22, 92, 140, .45); }
.center { min-width: 0; display: flex; flex-direction: column; gap: 12px; }
.chart-panel { flex: 1; min-height: 0; display: flex; flex-direction: column; padding: 10px 12px 6px; }
.chart-panel header { display: flex; justify-content: space-between; align-items: baseline; }
.chart-panel header span { color: #8eabc2; font-size: 12px; }
.chart { flex: 1; min-height: 120px; }
.chart.tall { min-height: 180px; }
.split { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; min-height: 210px; }
.gpu-h, .gpu-m { display: flex; justify-content: space-between; }
.bar { height: 4px; margin: 6px 0 4px; border-radius: 4px; background: rgba(255,255,255,.08); overflow: hidden; }
.bar i { display: block; height: 100%; border-radius: 4px; background: linear-gradient(90deg, #1d7eb8, #3ec6ff); transition: width .4s ease; }
.gpu-detail { margin-top: 10px; padding: 10px; border-radius: 10px; background: rgba(62, 198, 255, .08); }
.gpu-detail b { margin-bottom: 4px; }
.log {
  height: 92px;
  display: grid;
  grid-template-columns: 72px 1fr;
  gap: 12px;
  align-items: start;
  padding: 8px 12px;
  border-radius: 12px;
  background: rgba(5, 14, 24, .8);
  border: 1px solid rgba(80, 150, 196, .22);
  overflow: hidden;
}
.log b { font-size: 13px; padding-top: 4px; }
.log p { font-size: 12px; line-height: 1.7; color: #c5d7e6; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.log span { display: inline-block; width: 68px; color: #6f8ea8; }
@keyframes pulse {
  70% { box-shadow: 0 0 0 8px rgba(73, 211, 154, 0); }
  100% { box-shadow: 0 0 0 0 rgba(73, 211, 154, 0); }
}
</style>
