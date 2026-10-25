<template>
  <div class="board">
    <header class="top">
      <div class="brand" @click="router.push('/hub')">
        <div class="logo"><Mark /></div>
        <div>
          <b>试验鉴定领域大模型训推平台</b>
          <span>四类基座同时微调 · 参数量均不小于 32B</span>
        </div>
      </div>
      <div class="task">
        <i :class="{ live: running }"></i>
        <strong>{{ activeModel.full }}</strong>
        <em>{{ activeModel.task }} · {{ activeModel.epoch }}</em>
      </div>
      <div class="top-actions">
        <span class="clock">{{ clock }}</span>
        <button @click="running = !running">{{ running ? '暂停刷新' : '继续刷新' }}</button>
        <button class="ghost" @click="router.push('/hub')">返回</button>
      </div>
    </header>

    <section class="models">
      <button
        v-for="model in models"
        :key="model.id"
        :class="{ on: model.id === activeId }"
        @click="focusModel(model.id)"
      >
        <i :style="{ background: model.color }"></i>
        <div>
          <b>{{ model.full }}</b>
          <span>{{ model.kind }} · {{ model.task }}</span>
        </div>
        <em>32B</em>
        <small :class="model.state">{{ model.status }}</small>
      </button>
    </section>

    <div class="ticker" :class="{ paused: !running }">
      <div class="ticker-track">
        <span v-for="(item, index) in tickerLoop" :key="index">{{ item }}</span>
      </div>
    </div>

    <section class="kpis">
      <article v-for="item in kpis" :key="item.label">
        <span>{{ item.label }}</span>
        <b>{{ item.value }}<small>{{ item.unit }}</small></b>
        <em :class="item.tone">{{ item.hint }}</em>
      </article>
    </section>

    <section class="body">
      <aside class="panel flow">
        <div class="gif" aria-hidden="true">
          <span class="ring a"></span>
          <span class="ring b"></span>
          <span class="ring c"></span>
          <span class="sweep"></span>
          <b>32B</b>
          <i class="orb q">Q</i>
          <i class="orb g">G</i>
          <i class="orb n">I</i>
        </div>
        <h3>训练全流程</h3>
        <div class="stage-list" :class="{ paused: !running }">
          <div class="roll">
            <button
              v-for="(stage, index) in stageLoop"
              :key="`${stage.name}-${index}`"
              :class="['stage', stage.state, { on: activeStage === index % stages.length }]"
              @click="focusStage(index % stages.length)"
            >
              <i>{{ String((index % stages.length) + 1).padStart(2, '0') }}</i>
              <div>
                <b>{{ stage.name }}</b>
                <span>{{ stage.detail }}</span>
              </div>
            </button>
          </div>
        </div>
      </aside>

      <div class="center">
        <div class="panel chart-panel">
          <header>
            <h3>四类 32B 微调损失</h3>
            <span>步 {{ step.toLocaleString() }} · {{ activeModel.name }}</span>
          </header>
          <div ref="lossEl" class="chart tall"></div>
        </div>
        <div class="split">
          <div class="panel chart-panel">
            <header><h3>评估指标</h3><span>准确率 / 召回率 / F1</span></header>
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
        <div class="gpu-list" :class="{ paused: !running }">
          <div class="roll">
            <button
              v-for="(gpu, index) in gpuLoop"
              :key="`${gpu.id}-${index}`"
              :class="{ on: selected === gpu.id }"
              @click="selected = gpu.id"
            >
              <div class="gpu-h">
                <b>{{ gpu.id }} · {{ gpu.family }}</b>
                <span>{{ gpu.util }}%</span>
              </div>
              <div class="bar"><i :style="{ width: gpu.util + '%' }"></i></div>
              <div class="gpu-m">显存 {{ gpu.mem }} GB · {{ gpu.temp }}°C</div>
            </button>
          </div>
        </div>
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
const activeId = ref('qwen')
const lossEl = ref(null)
const evalEl = ref(null)
const memEl = ref(null)

const models = ref([
  { id: 'qwen', name: 'Qwen2.5', full: '鉴定-Qwen2.5-32B', kind: '生成式', task: '专域微调', color: '#3ec6ff', area: 'rgba(62,198,255,.18)', status: '训练中', state: 'run', epoch: '第 8/12 轮', loss: [2.84, 2.21, 1.76, 1.42, 1.18, 1.02, 0.91, 0.83] },
  { id: 'glm', name: 'GLM-4', full: '鉴定-GLM-4-32B', kind: '语言理解', task: '对齐微调', color: '#d0ab68', area: 'rgba(208,171,104,.18)', status: '训练中', state: 'run', epoch: '第 5/8 轮', loss: [2.62, 2.08, 1.71, 1.39, 1.16, 0.99, 0.88, 0.79] },
  { id: 'intern', name: 'InternLM2.5', full: '鉴定-InternLM2.5-32B', kind: '知识增强', task: '知识注入', color: '#49d39a', area: 'rgba(73,211,154,.16)', status: '训练中', state: 'run', epoch: '第 3/6 轮', loss: [2.91, 2.34, 1.88, 1.55, 1.29, 1.11, 0.98, 0.90] },
  { id: 'deepseek', name: 'DeepSeek', full: '鉴定-DeepSeek-32B', kind: '推理增强', task: '指令微调', color: '#7aa2ff', area: 'rgba(122,162,255,.16)', status: '训练中', state: 'run', epoch: '第 4/8 轮', loss: [2.73, 2.15, 1.69, 1.36, 1.14, 0.97, 0.86, 0.77] },
])

const stages = [
  { name: '数据接入', state: 'done', detail: '42 个源数据集已入库' },
  { name: '清洗提炼', state: 'done', detail: '8.6 万问答对已打包' },
  { name: '专域微调', state: 'run', detail: '4 类 32B 基座并行训练' },
  { name: '置信评估', state: 'run', detail: '准确率 0.88 · 召回 0.85' },
  { name: '量化压缩', state: 'wait', detail: '待本轮微调结束' },
  { name: '服务部署', state: 'wait', detail: '待评估通过后发布' },
]

const gpus = ref([
  { id: 'GPU0', family: 'Qwen', util: 87, mem: 62, temp: 68, power: 286 },
  { id: 'GPU1', family: 'Qwen', util: 92, mem: 64, temp: 71, power: 302 },
  { id: 'GPU2', family: 'GLM', util: 85, mem: 61, temp: 67, power: 274 },
  { id: 'GPU3', family: 'GLM', util: 89, mem: 63, temp: 69, power: 291 },
  { id: 'GPU4', family: 'Intern', util: 91, mem: 65, temp: 72, power: 308 },
  { id: 'GPU5', family: 'Intern', util: 84, mem: 60, temp: 66, power: 268 },
  { id: 'GPU6', family: 'DeepSeek', util: 88, mem: 62, temp: 68, power: 283 },
  { id: 'GPU7', family: 'DeepSeek', util: 86, mem: 61, temp: 67, power: 277 },
])

const lossX = ref(['E1', 'E2', 'E3', 'E4', 'E5', 'E6', 'E7', 'E8'])
const evalX = ref(['E1', 'E2', 'E3', 'E4', 'E5', 'E6', 'E7', 'E8'])
const accuracy = ref([0.72, 0.76, 0.79, 0.82, 0.84, 0.86, 0.87, 0.88])
const recall = ref([0.68, 0.71, 0.74, 0.77, 0.80, 0.82, 0.83, 0.85])
const f1 = ref([0.70, 0.73, 0.76, 0.79, 0.82, 0.84, 0.85, 0.86])
const memX = ref(['E1', 'E2', 'E3', 'E4', 'E5', 'E6', 'E7', 'E8'])
const memY = ref([58, 60, 61, 62, 63, 62, 64, 63])
const memCap = ref([72, 72, 72, 72, 72, 72, 72, 72])
const logs = ref([
  { id: 1, time: '15:36:02', text: 'step 18420  loss 0.830  lr 1.2e-5  tokens/s 1860' },
  { id: 2, time: '15:35:48', text: '评估批次完成  准确率 0.881  召回率 0.852  F1 0.866' },
  { id: 3, time: '15:35:11', text: 'GPU1 利用率 92%  显存 64/80 GB  温度 71°C' },
])
let logSeq = 4
let timer = null
let clockTimer = null
let lossChart = null
let evalChart = null
let memChart = null

const activeModel = computed(() => models.value.find((item) => item.id === activeId.value) || models.value[0])
const currentGpu = computed(() => gpus.value.find((item) => item.id === selected.value))
const stageLoop = computed(() => [...stages, ...stages])
const gpuLoop = computed(() => [...gpus.value, ...gpus.value])
const tickerLoop = computed(() => {
  const lines = models.value.map((model) => `${model.full}  ${model.task}  loss ${model.loss.at(-1).toFixed(3)}  ${model.epoch}  参数量 32B`)
  lines.push('集群 8×80GB  已并行接入 4 类基座  参数量均不小于 32B')
  return [...lines, ...lines]
})
const kpis = computed(() => {
  const loss = activeModel.value.loss.at(-1)
  const acc = accuracy.value[accuracy.value.length - 1]
  const rec = recall.value[recall.value.length - 1]
  const util = Math.round(gpus.value.reduce((sum, item) => sum + item.util, 0) / gpus.value.length)
  const mem = Math.round(gpus.value.reduce((sum, item) => sum + item.mem, 0) / gpus.value.length)
  const tok = 1680 + (step.value % 240)
  return [
    { label: '当前损失', value: loss.toFixed(3), unit: '', hint: activeModel.value.name, tone: 'ok' },
    { label: '评估准确率', value: acc.toFixed(3), unit: '', hint: '较上轮 +0.004', tone: 'ok' },
    { label: '召回率', value: rec.toFixed(3), unit: '', hint: '鉴定问答集', tone: '' },
    { label: 'GPU 均值', value: String(util), unit: '%', hint: '8 卡在训', tone: 'ok' },
    { label: '显存占用', value: String(mem), unit: '/80 GB', hint: '无溢出', tone: 'ok' },
    { label: '吞吐', value: tok.toLocaleString(), unit: ' tok/s', hint: '4 类并行', tone: '' },
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

function focusModel(id) {
  activeId.value = id
  const model = models.value.find((item) => item.id === id)
  pushLog(`切换监控 ${model.full}  ${model.task}  参数量 32B`)
  paint()
}

function paint() {
  lossChart?.setOption({
    ...base(lossX.value),
    legend: { top: 0, right: 8, textStyle: { color: '#9eb4c8', fontSize: 11 }, itemWidth: 12, itemHeight: 8 },
    series: models.value.map((model) => ({
      name: `${model.name}-32B`,
      type: 'line',
      data: plain(model.loss),
      smooth: true,
      symbol: 'none',
      lineStyle: { color: model.color, width: model.id === activeId.value ? 2.6 : 1.4 },
      areaStyle: model.id === activeId.value ? { color: model.area } : undefined,
    })),
  })
  evalChart?.setOption({
    ...base(evalX.value, { min: 0.6, max: 1 }),
    legend: { top: 0, right: 8, textStyle: { color: '#9eb4c8', fontSize: 11 }, itemWidth: 12, itemHeight: 8 },
    series: [
      { name: '准确率', type: 'line', data: plain(accuracy.value), smooth: true, symbol: 'circle', symbolSize: 6, lineStyle: { color: '#3ec6ff', width: 2 }, itemStyle: { color: '#3ec6ff' } },
      { name: '召回率', type: 'line', data: plain(recall.value), smooth: true, symbol: 'circle', symbolSize: 6, lineStyle: { color: '#d0ab68', width: 2 }, itemStyle: { color: '#d0ab68' } },
      {
        name: 'F1', type: 'line', data: plain(f1.value), smooth: true, symbol: 'circle', symbolSize: 6,
        lineStyle: { color: '#49d39a', width: 2.2 }, itemStyle: { color: '#49d39a' },
        areaStyle: { color: 'rgba(73,211,154,.12)' },
        markLine: {
          silent: true, symbol: 'none',
          lineStyle: { color: '#49d39a', type: 'dashed', width: 1 },
          data: [{ yAxis: 0.85, label: { formatter: '目标', color: '#49d39a', fontSize: 10 } }],
        },
      },
    ],
  })
  memChart?.setOption({
    ...base(memX.value, { min: 40, max: 80 }),
    legend: { top: 0, right: 8, textStyle: { color: '#9eb4c8', fontSize: 11 }, itemWidth: 12, itemHeight: 8 },
    series: [
      {
        name: '已用均值', type: 'line', data: plain(memY.value), smooth: true, symbol: 'none',
        lineStyle: { color: '#49d39a', width: 2 },
        areaStyle: { color: 'rgba(73,211,154,.16)' },
      },
      {
        name: '预留上限', type: 'line', data: plain(memCap.value), smooth: false, symbol: 'none',
        lineStyle: { color: '#8ea4bb', width: 1.4, type: 'dashed' },
      },
    ],
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
  lossX.value = [...lossX.value.slice(-15), String(step.value)]
  models.value.forEach((model) => {
    const last = model.loss.at(-1)
    const next = Math.max(0.42, +(last * 0.997 + (Math.random() - 0.62) * 0.018).toFixed(3))
    model.loss = [...model.loss.slice(-15), next]
  })
  const next = activeModel.value.loss.at(-1)
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
    const nextF1 = Math.min(0.93, +((2 * acc * rec) / (acc + rec)).toFixed(3))
    evalX.value = [...evalX.value.slice(-11), `S${step.value}`]
    accuracy.value = [...accuracy.value.slice(-11), acc]
    recall.value = [...recall.value.slice(-11), rec]
    f1.value = [...f1.value.slice(-11), nextF1]
    const mem = Math.round(gpus.value.reduce((sum, item) => sum + item.mem, 0) / gpus.value.length)
    memX.value = [...memX.value.slice(-11), `S${step.value}`]
    memY.value = [...memY.value.slice(-11), mem]
    memCap.value = [...memCap.value.slice(-11), 72]
    pushLog(`评估批次完成  准确率 ${acc.toFixed(3)}  召回率 ${rec.toFixed(3)}  F1 ${nextF1.toFixed(3)}`)
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
  gap: 8px;
  padding: 12px 14px 10px;
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
.board::after {
  content: "";
  position: fixed;
  left: 0;
  right: 0;
  height: 140px;
  pointer-events: none;
  background: linear-gradient(180deg, transparent, rgba(62, 198, 255, .09), transparent);
  animation: scan 7s linear infinite;
  z-index: 3;
}
.top, .models, .ticker, .kpis, .body, .log { position: relative; z-index: 1; }
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
.models { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; }
.models button {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  padding: 7px 10px;
  border-radius: 10px;
  border: 1px solid rgba(80, 150, 196, .28);
  background: rgba(8, 22, 38, .78);
  color: #d7e6f2;
  text-align: left;
  cursor: pointer;
}
.models button.on { border-color: rgba(62, 198, 255, .75); box-shadow: 0 0 18px rgba(62, 198, 255, .16); }
.models i { width: 4px; height: 28px; border-radius: 4px; flex: none; }
.models div { min-width: 0; flex: 1; }
.models b { display: block; font-size: 13px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.models span, .models small { color: #8eabc2; font-size: 12px; }
.models em { font-style: normal; font-weight: 700; color: #3ec6ff; font-size: 13px; }
.models small.run { color: #49d39a; }
.ticker {
  height: 28px;
  overflow: hidden;
  border-radius: 8px;
  border: 1px solid rgba(80, 150, 196, .28);
  background: rgba(6, 18, 32, .88);
}
.ticker-track { display: flex; width: max-content; animation: marquee 32s linear infinite; }
.ticker-track span { padding: 0 26px; line-height: 28px; font-size: 12px; color: #c5dded; white-space: nowrap; }
.ticker-track span::before { content: "●"; margin-right: 8px; color: #3ec6ff; }
.ticker.paused .ticker-track,
.stage-list.paused .roll,
.gpu-list.paused .roll { animation-play-state: paused; }
.kpis { display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px; }
.kpis article {
  position: relative;
  overflow: hidden;
  min-height: 78px;
  padding: 12px 12px 10px 14px;
  border: 1px solid rgba(80, 150, 196, .28);
  border-radius: 12px;
  background: linear-gradient(180deg, rgba(16, 42, 68, .9), rgba(8, 22, 38, .9));
}
.kpis article::before {
  content: '';
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 3px;
  background: #3ec6ff;
}
.kpis article:nth-child(2)::before { background: #d0ab68; }
.kpis article:nth-child(3)::before { background: #49d39a; }
.kpis article:nth-child(4)::before { background: #7aa2ff; }
.kpis article:nth-child(5)::before { background: #3ec6ff; }
.kpis article:nth-child(6)::before { background: #d0ab68; }
.kpis span, .kpis em { display: block; color: #8eabc2; font-size: 12px; }
.kpis b { display: block; margin: 4px 0 2px; font-size: 22px; line-height: 1; color: #f3f8fc; font-variant-numeric: tabular-nums; }
.kpis small { margin-left: 4px; font-size: 12px; color: #8eabc2; font-weight: 500; }
.kpis em.ok { color: #49d39a; }
.body { flex: 1; min-height: 0; display: grid; grid-template-columns: 248px minmax(0, 1fr) 292px; gap: 8px; }
.panel {
  border: 1px solid rgba(80, 150, 196, .28);
  border-radius: 14px;
  background: rgba(8, 22, 38, .78);
  box-shadow: inset 0 1px 0 rgba(180, 220, 245, .06);
}
.flow, .gpus { padding: 10px; }
.flow { display: flex; flex-direction: column; overflow: hidden; }
.gpus { display: flex; flex-direction: column; overflow: hidden; }
.gif {
  position: relative;
  height: 132px;
  margin-bottom: 8px;
  border-radius: 12px;
  overflow: hidden;
  background: radial-gradient(circle at 50% 55%, rgba(62, 198, 255, .28), transparent 62%), #061422;
  border: 1px solid rgba(62, 198, 255, .4);
  box-shadow: inset 0 0 24px rgba(62, 198, 255, .12);
}
.gif b {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  font-size: 22px;
  letter-spacing: 1px;
  text-shadow: 0 0 16px rgba(62, 198, 255, .85);
}
.ring, .sweep, .orb { position: absolute; left: 50%; top: 50%; }
.ring { border: 1px solid rgba(62, 198, 255, .5); border-radius: 50%; }
.ring.a { width: 52px; height: 52px; margin: -26px; animation: spin 7s linear infinite; border-style: dashed; }
.ring.b { width: 84px; height: 84px; margin: -42px; animation: spin 11s linear infinite reverse; }
.ring.c { width: 116px; height: 116px; margin: -58px; animation: spin 16s linear infinite; border-color: rgba(208, 171, 104, .55); }
.sweep {
  width: 58px;
  height: 2px;
  margin-top: -1px;
  background: linear-gradient(90deg, rgba(62, 198, 255, .05), #9ae6ff);
  transform-origin: left center;
  animation: sweep 2.2s linear infinite;
}
.orb {
  width: 18px;
  height: 18px;
  margin: -9px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-style: normal;
  font-size: 10px;
  font-weight: 700;
  color: #041018;
  animation: orbit 6.5s linear infinite;
}
.orb.q { background: #3ec6ff; }
.orb.g { background: #d0ab68; animation-delay: -2.15s; }
.orb.n { background: #49d39a; animation-delay: -4.3s; }
.stage-list, .gpu-list { flex: 1; min-height: 0; overflow: hidden; }
.stage-list .roll { animation: vmarquee 22s linear infinite; }
.gpu-list .roll { animation: vmarquee 16s linear infinite; }
.stage-list:hover .roll, .gpu-list:hover .roll { animation-play-state: paused; }
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
.chart.tall { min-height: 120px; }
.split { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; min-height: 168px; }
.gpu-h, .gpu-m { display: flex; justify-content: space-between; }
.bar { height: 4px; margin: 6px 0 4px; border-radius: 4px; background: rgba(255,255,255,.08); overflow: hidden; }
.bar i { display: block; height: 100%; border-radius: 4px; background: linear-gradient(90deg, #1d7eb8, #3ec6ff); transition: width .4s ease; }
.gpu-detail { margin-top: 10px; padding: 10px; border-radius: 10px; background: rgba(62, 198, 255, .08); }
.gpu-detail b { margin-bottom: 4px; }
.log {
  height: 74px;
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
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes sweep { to { transform: rotate(360deg); } }
@keyframes orbit {
  from { transform: rotate(0deg) translateX(50px) rotate(0deg); }
  to { transform: rotate(360deg) translateX(50px) rotate(-360deg); }
}
@keyframes marquee { to { transform: translateX(-50%); } }
@keyframes vmarquee { to { transform: translateY(-50%); } }
@keyframes scan {
  from { top: -140px; }
  to { top: 100%; }
}
</style>
