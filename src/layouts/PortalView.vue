<template>
  <div class="portal">
    <header class="p-header">
      <div class="p-header-inner">
        <div class="p-brand">
          <div class="p-logo"><img src="@/assets/logo.webp" alt="" /></div>
          <div>
            <div class="p-title">试验鉴定综合服务平台</div>
            <div class="p-en">AGRI-MACHINERY TEST & APPRAISAL SERVICE PLATFORM</div>
          </div>
        </div>
        <div class="p-user">
          <button class="hub-btn cockpit-btn" @click="$router.push('/p/cockpit/cockpit-main/home')">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.7">
              <circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/>
            </svg>
            总览驾驶舱
          </button>
          <button class="hub-btn cockpit-btn" @click="$router.push('/p/cockpit/cockpit-main/deviations')">
            正偏离汇总
          </button>
          <button class="hub-btn" @click="$router.push('/hub')">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.7">
              <rect x="4" y="4" width="6" height="6" rx="1" /><rect x="14" y="4" width="6" height="6" rx="1" />
              <rect x="4" y="14" width="6" height="6" rx="1" /><rect x="14" y="14" width="6" height="6" rx="1" />
            </svg>
            后台管理系统
          </button>
          <span class="mona">管理员</span>
        </div>
      </div>
    </header>

    <main class="p-main">
      <div class="hero">
        <div class="pill">数智驱动 · 智慧鉴定</div>
        <h1>汇聚试验数据，赋能智能鉴定</h1>
        <p>面向农业机械试验鉴定领域的一站式数智化服务，五大应用平台协同，让数据价值充分释放</p>
      </div>
      <section class="cards">
        <article v-for="app in apps" :key="app.id" class="pcard" @click="enter(app)">
          <div class="pcard-top">
            <div class="pico">
              <img v-if="app.iconFile" :src="app.iconFile" :alt="app.name" />
              <Icon v-else :name="app.icon" />
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
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background:
    radial-gradient(900px 280px at 50% -40px, rgba(13, 78, 131, .06), transparent 70%),
    #f4f7fb;
}
.p-header {
  height: 72px; flex: 0 0 72px;
  background: rgba(255,255,255,.92);
  border-bottom: 1px solid #e8eef5; z-index: 5;
  backdrop-filter: blur(10px);
}
.p-header-inner {
  max-width: 1440px; width: 100%; margin: 0 auto;
  padding: 0 40px; height: 100%;
  display: flex; align-items: center; justify-content: space-between;
}
.p-brand { display: flex; align-items: center; gap: 12px; }
.p-logo { width: 40px; height: 40px; flex: 0 0 auto; }
.p-logo img { width: 100%; height: 100%; object-fit: contain; display: block; }
.p-title { font-size: 22px; font-weight: 800; color: #1e6fa8; letter-spacing: .5px; }
.p-en { font-size: 11px; color: #8aa0b5; letter-spacing: .6px; margin-top: 2px; }
.p-user { display: flex; align-items: center; gap: 16px; }
.hub-btn {
  display: inline-flex; align-items: center; gap: 6px; background: transparent; border: none;
  color: #27445f; font-size: 14px; height: 34px; padding: 0 12px; border-radius: 8px;
}
.hub-btn:hover { border-color: #9ec0de; color: #0d4e83; }
.cockpit-btn { border: 1px solid rgba(208,171,104,.4); color: #a07020; }
.cockpit-btn:hover { border-color: var(--gold); color: #8a6000; background: #fffaf0; }
.live { display: inline-flex; align-items: center; gap: 6px; color: #3d7a52; font-size: 13px; }
.live i { width: 7px; height: 7px; border-radius: 50%; background: #2fbf4a; box-shadow: 0 0 0 4px rgba(47,191,74,.15); }
.mona {
  background: #0d4e83; color: #fff; border-radius: 8px; padding: 6px 16px; font-size: 14px; font-weight: 600;
}
.p-main {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 30px 40px 32px;
  max-width: 1440px;
  width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
}
.hero { text-align: center; margin-bottom: 32px; flex: 0 0 auto; padding-top: 12px; padding-bottom: 4px; }
.pill {
  display: inline-block; border: 1.5px solid #1668a8; background: #e8f2fb; color: #1668a8;
  border-radius: 20px; padding: 6px 20px; font-size: 13px; letter-spacing: 1px;
}
.hero h1 { margin-top: 14px; font-size: 40px; color: #0d3f73; letter-spacing: 2px; font-weight: 800; }
.hero p { margin-top: 14px; color: #7d90a3; font-size: 15px; }
.arch { display: flex; justify-content: center; gap: 10px; margin-top: 18px; }
.arch span {
  background: #fff; border: 1px solid #e4edf5; color: #4d6780; border-radius: 999px;
  padding: 6px 14px; font-size: 13px;
}
.cards {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  align-content: start;
  gap: 16px;
}
.pcard {
  background: #fff; border-radius: 16px; padding: 22px 18px 18px; min-height: 372px;
  box-shadow: 0 10px 28px rgba(20, 60, 100, .05); border: 1px solid #e8eef5;
  display: flex; flex-direction: column; cursor: pointer;
  transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease;
}
.pcard:hover { transform: translateY(-4px); border-color: #c5daf0; box-shadow: 0 16px 36px rgba(13, 78, 131, .12); }
.pcard-top { display: flex; justify-content: space-between; align-items: flex-start; }
.pico {
  width: 56px; height: 56px; border-radius: 14px;
  display: grid; place-items: center;
  overflow: hidden;
}
.pico :deep(svg) { width: 30px; height: 30px; }
.pico img { width: 48px; height: 48px; object-fit: contain; }
.pno { color: #c6a15a; font-weight: 700; letter-spacing: 1px; }
.pcard h3 { margin-top: 18px; color: #22547e; font-size: 20px; line-height: 1.45; min-height: 78px; }
.pcard p { color: #7b8ea1; font-size: 13px; line-height: 1.7; min-height: 88px; }
.ptags { color: #9aaaba; font-size: 12px; line-height: 1.6; margin-top: 8px; flex: 1; }
.enter {
  margin-top: auto; width: 100%; background: #e8f2fb; color: #1a6eae; border: none;
  border-radius: 8px; padding: 10px 14px; font-size: 14px;
  display: flex; align-items: center; justify-content: space-between;
}
.ptags + .enter { margin-top: 24px; }
.pcard:hover .enter { background: #0d4e83; color: #fff; }
</style>
