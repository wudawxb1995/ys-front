<template>
  <div class="dev-page">
    <div class="dev-hero">
      <div>
        <div class="eyebrow">相对招标技术要求 · 正向增强</div>
        <h2>正偏离能力汇总</h2>
        <p>共 <b>{{ total }}</b> 项正偏离，覆盖试验前、试验中、试验后与知识沉淀全链路；点击条目可记录演示指认位置（sessionStorage 持久化）。</p>
      </div>
      <div class="hero-kpi">
        <div class="kpi">
          <div class="mark"><Icon name="spark" /></div>
          <div class="label">正偏离项</div>
          <div class="value">{{ total }}</div>
        </div>
        <div class="kpi">
          <div class="mark"><Icon name="eye" /></div>
          <div class="label">已浏览</div>
          <div class="value">{{ viewedCount }}</div>
        </div>
        <div class="kpi">
          <div class="mark"><Icon name="target" /></div>
          <div class="label">最近指认</div>
          <div class="value sm">{{ lastTitle }}</div>
        </div>
      </div>
    </div>

    <div class="filter-row">
      <button
        v-for="g in groups"
        :key="g.id"
        class="filter-chip"
        :class="{ on: activeGroup === g.id }"
        @click="activeGroup = g.id"
      >{{ g.part.replace(' · ', ' ') }} · {{ g.items.length }}</button>
      <button class="filter-chip" :class="{ on: activeGroup === 'all' }" @click="activeGroup = 'all'">全部 · {{ total }}</button>
    </div>

    <section v-for="g in visibleGroups" :key="g.id" class="group-block">
      <div class="group-head">
        <span class="group-title">{{ g.part }}</span>
        <span class="group-count">{{ g.items.length }} 项</span>
      </div>
      <div class="item-grid">
        <article
          v-for="item in g.items"
          :key="item.id"
          class="dev-card"
          :class="{ active: lastId === item.id, viewed: viewedIds.includes(item.id) }"
          @click="mark(item)"
        >
          <div class="card-top">
            <span class="badge on"><i></i>正偏离</span>
            <span v-if="viewedIds.includes(item.id)" class="viewed-tag">已指认</span>
          </div>
          <h3>{{ item.title }}</h3>
          <p class="ev"><span>界面证据</span>{{ item.evidence }}</p>
          <p class="bt"><span>优于要求</span>{{ item.better }}</p>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { deviationGroups, deviationTotal, deviationFlat } from '@/data/deviations'
import { useDemoStore, markDeviationViewed } from '@/composables/demo-store'
import Icon from '@/components/Icon.vue'

defineProps({ page: Object, title: String })

const store = useDemoStore()
const groups = deviationGroups
const total = deviationTotal
const activeGroup = ref('all')

const viewedIds = computed(() => store.deviationViewedIds || [])
const lastId = computed(() => store.lastDeviationId || '')
const viewedCount = computed(() => viewedIds.value.length)
const lastTitle = computed(() => {
  const hit = deviationFlat.find((d) => d.id === lastId.value)
  return hit?.title || '—'
})
const visibleGroups = computed(() =>
  activeGroup.value === 'all' ? groups : groups.filter((g) => g.id === activeGroup.value),
)

function mark(item) {
  markDeviationViewed(item.id)
}
</script>

<style scoped>
.dev-page {
  min-width: 960px;
  color: #2f465b;
  background: #fff;
  border: 1px solid var(--line, #e0eaf3);
  border-radius: 12px;
  padding: 20px 22px 24px;
  box-shadow: 0 6px 18px rgba(15, 55, 95, .04);
}
.dev-hero {
  background: #f7fbfe; border: 1px solid #e0eaf3; border-radius: 9px;
  padding: 18px 22px; margin-bottom: 14px;
  display: flex; align-items: center; justify-content: space-between; gap: 24px;
}
.eyebrow {
  display: inline-flex; color: #a36e0c; background: #fff5dc; border: 1px solid #efd291;
  border-radius: 4px; font-size: 12px; font-weight: 700; padding: 2px 7px; margin-bottom: 8px;
}
.dev-hero h2 { color: #074b88; font-size: 22px; margin: 0; }
.dev-hero p { color: #75889b; font-size: 13.5px; margin: 8px 0 0; max-width: 560px; line-height: 1.6; }
.dev-hero b { color: #0d4e83; }
.hero-kpi { display: flex; gap: 12px; flex: 0 0 auto; }
.hero-kpi .kpi {
  min-width: 168px;
  background: #fff;
}
.hero-kpi .kpi .value.sm {
  font-size: 13px;
  font-weight: 600;
  color: #1f3d5a;
  max-width: 140px;
  line-height: 1.35;
}
.filter-row { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 14px; }
.filter-chip {
  height: 32px; padding: 0 12px; border-radius: 6px; border: 1px solid #d6e4f0;
  background: #fff; color: #4a6c8c; font-size: 12.5px; cursor: pointer;
}
.filter-chip.on { background: #eaf3fd; border-color: #9ec0de; color: #0d4e83; font-weight: 600; }
.group-block {
  background: #fff; border: 1px solid #e0eaf3; border-radius: 9px;
  padding: 16px 18px; margin-bottom: 14px;
  box-shadow: 0 5px 16px rgba(18, 61, 96, .04);
}
.group-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.group-title {
  font-size: 15px; font-weight: 700; color: #074b88;
  display: inline-flex; align-items: center;
}
.group-title::before {
  content: ''; display: inline-block; width: 4px; height: 16px; margin-right: 8px;
  border-radius: 3px; background: #0868b7;
}
.group-count { font-size: 12.5px; color: #8a99a8; background: #f4f8fc; border-radius: 8px; padding: 2px 8px; }
.item-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
.dev-card {
  border: 1px solid #e4ecf4; border-radius: 8px; padding: 14px 16px; cursor: pointer;
  background: #fff; transition: border-color .15s, box-shadow .15s;
}
.dev-card:hover { border-color: #9ec0de; box-shadow: 0 4px 12px rgba(18, 61, 96, .06); }
.dev-card.active { border-color: #d0ab68; background: #fffaf0; }
.dev-card.viewed:not(.active) { background: #f8fbfe; }
.card-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
.viewed-tag { font-size: 11.5px; color: #16843a; background: #e1f6e8; border-radius: 10px; padding: 2px 8px; }
.dev-card h3 { margin: 0 0 10px; font-size: 14.5px; font-weight: 700; color: #1f3d5a; }
.ev, .bt { margin: 0 0 6px; font-size: 12.5px; color: #5a6978; line-height: 1.55; }
.ev span, .bt span {
  display: inline-block; min-width: 56px; margin-right: 6px;
  color: #8a99a8; font-weight: 600;
}
.bt span { color: #a36e0c; }
@media (max-width: 1100px) {
  .item-grid { grid-template-columns: 1fr; }
  .dev-hero { flex-direction: column; align-items: flex-start; }
}
</style>
