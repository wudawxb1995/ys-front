<template>
  <div class="portal">
    <header class="p-header">
      <div class="p-brand">
        <div class="p-logo"><Mark /></div>
        <div>
          <div class="p-title">试验鉴定综合服务平台</div>
          <div class="p-en">AGRI-MACHINERY TEST & APPRAISAL SERVICE PLATFORM</div>
        </div>
      </div>
      <div class="p-user">
        <span class="live"><i></i>服务正常</span>
        <button class="hub-btn" @click="$router.push('/hub')">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.7">
            <rect x="4" y="4" width="6" height="6" rx="1" /><rect x="14" y="4" width="6" height="6" rx="1" />
            <rect x="4" y="14" width="6" height="6" rx="1" /><rect x="14" y="14" width="6" height="6" rx="1" />
          </svg>
          后台管理系统
        </button>
        <span class="mona">Mona</span>
      </div>
    </header>

    <main class="p-main">
      <div class="hero">
        <div class="pill">数智驱动 · 智慧鉴定</div>
        <h1>汇聚试验数据，赋能智能鉴定</h1>
        <p>面向农业机械试验鉴定领域的一站式数智化服务，五大应用平台协同，让数据价值充分释放</p>
        <div class="arch">
          <span>1 个领域资源库</span>
          <span>2 个训推与编排平台</span>
          <span>5 个业务应用</span>
        </div>
      </div>
      <section class="cards">
        <article v-for="app in apps" :key="app.id" class="pcard" @click="enter(app)">
          <div class="pcard-top">
            <div class="pico">
              <Icon :name="app.icon" />
            </div>
            <span class="pno">{{ app.no }}</span>
          </div>
          <h3>{{ app.name }}</h3>
          <p>{{ app.brief }}</p>
          <div class="ptags">{{ app.tags.join(' / ') }}</div>
          <button class="enter" @click.stop="enter(app)">进入平台 <span>→</span></button>
        </article>
      </section>
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import Icon from '@/components/Icon.vue'
import Mark from '@/components/Mark.vue'
import { appPlatforms, firstLeaf } from '@/data/catalog'

const router = useRouter()
const apps = appPlatforms()

function enter(app) {
  const system = app.systems[0]
  const leaf = firstLeaf(system)
  router.push({ name: 'app', params: { pid: app.id, sid: system.id, mid: leaf.id } })
}
</script>

<style scoped>
.portal {
  min-height: 100vh;
  background:
    radial-gradient(900px 280px at 50% -40px, rgba(13, 78, 131, .06), transparent 70%),
    #f4f7fb;
}
.p-header {
  height: 72px; background: rgba(255,255,255,.92); display: flex; align-items: center; justify-content: space-between;
  padding: 0 36px; border-bottom: 1px solid #e8eef5; position: sticky; top: 0; z-index: 5;
  backdrop-filter: blur(10px);
}
.p-brand { display: flex; align-items: center; gap: 12px; }
.p-logo { width: 40px; height: 40px; border-radius: 50%; overflow: hidden; box-shadow: 0 0 0 1px rgba(13,78,131,.08); }
.p-title { font-size: 18px; font-weight: 700; color: #16324f; letter-spacing: .5px; }
.p-en { font-size: 11px; color: #8aa0b5; letter-spacing: .6px; margin-top: 2px; }
.p-user { display: flex; align-items: center; gap: 16px; }
.hub-btn {
  display: inline-flex; align-items: center; gap: 6px; background: #fff; border: 1px solid #d7e3ee;
  color: #27445f; font-size: 14px; height: 34px; padding: 0 12px; border-radius: 8px;
}
.hub-btn:hover { border-color: #9ec0de; color: #0d4e83; }
.live { display: inline-flex; align-items: center; gap: 6px; color: #3d7a52; font-size: 13px; }
.live i { width: 7px; height: 7px; border-radius: 50%; background: #2fbf4a; box-shadow: 0 0 0 4px rgba(47,191,74,.15); }
.mona {
  background: #0d4e83; color: #fff; border-radius: 8px; padding: 6px 16px; font-size: 14px; font-weight: 600;
}
.p-main { max-width: 1440px; margin: 0 auto; padding: 54px 40px 48px; }
.hero { text-align: center; margin-bottom: 36px; }
.pill {
  display: inline-block; border: 1px solid #d5e0ea; background: #fff; color: #5d7388;
  border-radius: 20px; padding: 6px 16px; font-size: 13px; letter-spacing: 1px;
}
.hero h1 { margin-top: 18px; font-size: 40px; color: #0d3f73; letter-spacing: 2px; font-weight: 800; }
.hero p { margin-top: 12px; color: #7d90a3; font-size: 15px; }
.arch { display: flex; justify-content: center; gap: 10px; margin-top: 18px; }
.arch span {
  background: #fff; border: 1px solid #e4edf5; color: #4d6780; border-radius: 999px;
  padding: 6px 14px; font-size: 13px;
}
.cards { display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; }
.pcard {
  background: #fff; border-radius: 16px; padding: 22px 18px 18px; min-height: 372px;
  box-shadow: 0 10px 28px rgba(20, 60, 100, .05); border: 1px solid #e8eef5;
  display: flex; flex-direction: column; cursor: pointer; transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease;
}
.pcard:hover { transform: translateY(-4px); border-color: #c5daf0; box-shadow: 0 16px 36px rgba(13, 78, 131, .12); }
.pcard-top { display: flex; justify-content: space-between; align-items: flex-start; }
.pico {
  width: 48px; height: 48px; border-radius: 12px; background: #f3f8fd; color: #0d4e83;
  display: grid; place-items: center;
}
.pico :deep(svg) { width: 26px; height: 26px; }
.pno { color: #c6a15a; font-weight: 700; letter-spacing: 1px; }
.pcard h3 { margin-top: 18px; color: #14365c; font-size: 18px; line-height: 1.45; min-height: 78px; }
.pcard p { color: #7b8ea1; font-size: 13px; line-height: 1.7; min-height: 88px; }
.ptags { color: #9aaaba; font-size: 12px; line-height: 1.6; margin-top: 8px; }
.enter {
  margin-top: auto; align-self: flex-start; background: #fff; color: #1a6eae; border: 1px solid #c5daf0;
  border-radius: 8px; padding: 8px 14px; font-size: 14px;
}
.pcard:hover .enter { background: #0d4e83; color: #fff; border-color: #0d4e83; }
</style>
