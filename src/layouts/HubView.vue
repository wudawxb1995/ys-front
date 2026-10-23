<template>
  <div class="portal">
    <header class="p-header">
      <div class="p-brand" @click="$router.push('/')">
        <div class="p-logo"><Mark /></div>
        <div>
          <div class="p-title">试验鉴定综合服务平台</div>
          <div class="p-en">支撑环境 · 1 个资源库 + 2 个训推与编排平台</div>
        </div>
      </div>
      <div class="p-user">
        <button class="hub-btn" @click="$router.push('/')">返回门户</button>
        <span class="mona">Mona</span>
      </div>
    </header>
    <main class="p-main">
      <div class="hero">
        <div class="pill">后台管理系统</div>
        <h1>领域创新运用支撑环境</h1>
        <p>资源库为五大应用供给可追溯数据，训推平台提供领域大模型，编排平台把能力封装成智能体。</p>
      </div>
      <section class="flow">
        <div class="fnode">资源库<br><small>原始 / 基础 / 推理</small></div>
        <div class="farrow">→</div>
        <div class="fnode">训推平台<br><small>32B 微调与推理</small></div>
        <div class="farrow">→</div>
        <div class="fnode">智能体编排<br><small>工作流与插件</small></div>
        <div class="farrow">→</div>
        <div class="fnode wide">五大业务应用<br><small>再造 · 探针 · 设计 · 审校 · 研判</small></div>
      </section>
      <section class="cards">
        <article v-for="app in infras" :key="app.id" class="pcard" @click="enter(app)">
          <div class="pcard-top">
            <div class="pico"><Icon :name="app.icon" /></div>
            <span class="pno">{{ app.no }}</span>
          </div>
          <h3>{{ app.name }}</h3>
          <p>{{ app.brief }}</p>
          <div class="ptags">{{ app.tags.join(' / ') }}</div>
          <button class="enter" @click.stop="enter(app)">进入系统 <span>→</span></button>
        </article>
      </section>
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import Icon from '@/components/Icon.vue'
import Mark from '@/components/Mark.vue'
import { firstLeaf, infraPlatforms } from '@/data/catalog'

const router = useRouter()
const infras = infraPlatforms()
function enter(app) {
  const system = app.systems[0]
  const leaf = firstLeaf(system)
  router.push({ name: 'app', params: { pid: app.id, sid: system.id, mid: leaf.id } })
}
</script>

<style scoped>
.portal { min-height: 100vh; background: radial-gradient(900px 280px at 50% -40px, rgba(13, 78, 131, .06), transparent 70%), #f4f7fb; }
.p-header {
  height: 72px; background: #fff; display: flex; align-items: center; justify-content: space-between;
  padding: 0 36px; border-bottom: 1px solid #e8eef5;
}
.p-brand { display: flex; align-items: center; gap: 12px; cursor: pointer; }
.p-logo { width: 40px; height: 40px; flex: 0 0 auto; }
.p-title { font-size: 18px; font-weight: 700; color: #16324f; }
.pcard { cursor: pointer; }
.pcard:hover .enter { background: #0d4e83; color: #fff; border-color: #0d4e83; }
.p-en { font-size: 12px; color: #8aa0b5; margin-top: 3px; }
.p-user { display: flex; align-items: center; gap: 16px; }
.hub-btn { background: none; border: 0; color: #1a6eae; font-size: 14px; }
.mona { background: #0d4e83; color: #fff; border-radius: 8px; padding: 6px 16px; font-weight: 600; }
.p-main { max-width: 1200px; margin: 0 auto; padding: 48px 40px; }
.hero { text-align: center; margin-bottom: 28px; }
.pill { display: inline-block; border: 1px solid #d5e0ea; background: #fff; color: #5d7388; border-radius: 20px; padding: 6px 16px; font-size: 13px; }
.hero h1 { margin-top: 14px; font-size: 34px; color: #0d3f73; }
.hero p { margin-top: 10px; color: #7d90a3; }
.flow { display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 28px; }
.fnode { background: #fff; border: 1px solid #e3edf6; border-radius: 12px; padding: 12px 16px; text-align: center; color: #0d4e83; font-weight: 700; min-width: 140px; }
.fnode.wide { min-width: 220px; }
.fnode small { display: block; font-weight: 400; color: #7d90a3; margin-top: 4px; }
.farrow { color: #c6a15a; font-size: 20px; }
.cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
.pcard { background: #fff; border-radius: 16px; padding: 22px 20px; min-height: 280px; border: 1px solid #eef3f8; display: flex; flex-direction: column; box-shadow: 0 10px 30px rgba(20,60,100,.05); transition: transform .18s ease, box-shadow .18s ease; }
.pcard:hover { transform: translateY(-4px); box-shadow: 0 16px 36px rgba(13, 78, 131, .12); }
.pcard-top { display: flex; justify-content: space-between; }
.pico { width: 48px; height: 48px; border-radius: 12px; background: #f3f8fd; color: #0d4e83; display: grid; place-items: center; }
.pico :deep(svg) { width: 26px; height: 26px; }
.pno { color: #c6a15a; font-weight: 700; }
.pcard h3 { margin-top: 16px; color: #14365c; font-size: 18px; line-height: 1.45; }
.pcard p { color: #7b8ea1; font-size: 13.5px; line-height: 1.7; margin-top: 8px; }
.ptags { color: #9aaaba; font-size: 12px; margin-top: 10px; }
.enter { margin-top: auto; align-self: flex-start; background: #fff; color: #1a6eae; border: 1px solid #c5daf0; border-radius: 8px; padding: 8px 14px; }
</style>
