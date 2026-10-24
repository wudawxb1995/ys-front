<template>
  <div class="rich-type-m11">
    <div class="m11-shell">
      <!-- 需求摘要卡（浅蓝底，自动解析自定稿方案） -->
      <div class="m11-req">
        <div class="m11-req-head">
          <svg viewBox="0 0 24 24" fill="none" stroke="#0d4e83" stroke-width="1.8" class="m11-req-ico"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
          <span class="m11-req-title">需求摘要</span>
          <span class="m11-req-sub">自动解析自定稿方案《某型性能鉴定试验大纲 V4》</span>
          <el-button class="m11-req-btn" @click="toast('已重新解析方案')">重新解析</el-button>
        </div>
        <div class="m11-req-tags">
          <span v-for="tag in m11ReqTags" :key="tag" class="m11-tag">
            <span class="m11-tag-dot"></span>
            {{ tag }}
          </span>
        </div>
      </div>

      <!-- 四算法 Tab（默认「基于规则」） -->
      <div class="m11-tabs">
        <button
          v-for="t in m11Tabs"
          :key="t.key"
          type="button"
          class="m11-tab"
          :class="{ on: m11Tab === t.key, gold: t.key === 'hybrid' && m11Tab === t.key }"
          @click="m11Tab = t.key"
        >
          {{ t.label }}
        </button>
      </div>

      <!-- 算法描述条 -->
      <div class="m11-algo">
        <el-icon class="m11-algo-ico" :size="14"><WarningFilled /></el-icon>
        <span>算法：<b>{{ m11CurrentTab?.algo }}</b> {{ m11CurrentTab?.desc }}</span>
      </div>

      <!-- 匹配结果列表 -->
      <div class="m11-table-wrap">
        <table>
          <thead>
            <tr>
              <th class="col-rank">排名</th>
              <th>资源名称</th>
              <th>类型</th>
              <th class="col-score">综合匹配度</th>
              <th>命中理由摘要</th>
              <th class="col-op">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(r, i) in m11CurrentResults"
              :key="r.res"
              :class="{ 'm11-top': i === 0, 'm11-sel-row': m11SelIdx === i }"
              @click="m11SelIdx = i"
            >
              <td class="col-rank">
                <div class="m11-rank">
                  <svg v-if="i === 0" viewBox="0 0 24 24" fill="#d0ab68" class="m11-star"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  <span :class="{ gold: i === 0 }">{{ i + 1 }}</span>
                </div>
              </td>
              <td class="name">{{ r.res }}</td>
              <td><span class="m11-cat">{{ r.cat }}</span></td>
              <td class="col-score">
                <div class="m11-score">
                  <div class="m11-bar">
                    <div
                      class="m11-bar-fill"
                      :class="{ gold: r.score >= 0.90 }"
                      :style="{ width: (r.score * 100).toFixed(0) + '%' }"
                    ></div>
                  </div>
                  <span class="m11-score-n" :class="{ gold: r.score >= 0.90 }">
                    {{ (r.score * 100).toFixed(2).replace(/\.?0+$/, '') }}
                  </span>
                </div>
              </td>
              <td class="reason">
                <span v-if="i === 0" class="m11-star-txt">★</span>{{ r.reason }}
              </td>
              <td class="col-op" @click.stop>
                <el-button type="primary" size="small" @click="toast('已采纳：' + r.res)">采纳</el-button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 四算法综合对比（TOP1 资源横排） -->
      <div class="m11-compare">
        <div class="m11-compare-title">四算法综合对比（各算法 TOP1 资源）</div>
        <div class="m11-compare-grid">
          <div
            v-for="t in m11Tabs"
            :key="t.key"
            class="m11-cmp"
            :class="{ on: t.key === m11Tab, gold: t.key === 'hybrid' }"
          >
            <div class="m11-cmp-lab">{{ t.label }}</div>
            <div class="m11-cmp-score">{{ (m11Results[t.key][0].score * 100).toFixed(0) }}%</div>
            <div class="m11-cmp-res">{{ m11Results[t.key][0].res }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { WarningFilled } from '@element-plus/icons-vue'
import { useRichPage } from '@/composables/rich/useRichPage'

export default {
  components: { WarningFilled },
  props: { page: Object, title: String },
  setup(props) {
    return useRichPage(props)
  },
}
</script>

<style scoped>
/* 白底整卡壳 —— 对齐 ys-form-ui：圆角 12px + 浅阴影 + var(--line) */
.m11-shell {
  display: flex;
  flex-direction: column;
  gap: 14px;
  background: #fff;
  border: 1px solid var(--line, #e0eaf3);
  border-radius: 12px;
  padding: 18px 20px 16px;
  box-shadow: 0 6px 18px rgba(15, 55, 95, .04);
}

.m11-req {
  background: #eef7fe;
  border: 1px solid #c8e0f5;
  border-radius: 10px;
  padding: 14px 18px;
}
.m11-req-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}
.m11-req-ico { width: 16px; height: 16px; flex: 0 0 auto; }
.m11-req-title { font-weight: 700; font-size: 13.5px; color: #0d4e83; }
.m11-req-sub { font-size: 12.5px; color: #4a7fa8; }
.m11-req-btn { margin-left: auto; }

.m11-req-tags { display: flex; gap: 10px; flex-wrap: wrap; }
.m11-tag {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: #fff;
  border: 1px solid #b8d8f0;
  border-radius: 16px;
  padding: 4px 12px;
  font-size: 13px;
  color: #1668a8;
  font-weight: 500;
}
.m11-tag-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #1668a8;
  flex: 0 0 auto;
}

.m11-tabs {
  display: flex;
  gap: 0;
  border-bottom: 2px solid #e2ebf3;
}
.m11-tab {
  padding: 10px 22px;
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  margin-bottom: -2px;
  font-size: 14px;
  color: #7c8fa2;
  cursor: pointer;
  white-space: nowrap;
  transition: color .15s;
}
.m11-tab.on {
  color: #1f3d5a;
  font-weight: 700;
  border-bottom-color: #1668a8;
}
.m11-tab.on.gold { border-bottom-color: #d0ab68; }

.m11-algo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #5c7084;
  line-height: 1.5;
}
.m11-algo-ico { color: #1668a8; flex: 0 0 auto; }
.m11-algo b { color: #0d4e83; font-weight: 700; }

.m11-table-wrap {
  border: 1px solid var(--line, #e0eaf3);
  border-radius: 8px;
  overflow: auto;
}
.m11-table-wrap table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}
.m11-table-wrap thead th {
  background: #f3f8fd;
  color: #3f5062;
  font-size: 13px;
  font-weight: 600;
  padding: 12px 14px;
  text-align: left;
  white-space: nowrap;
  border-bottom: 1px solid var(--line, #e0eaf3);
}
.m11-table-wrap tbody td {
  padding: 12px 14px;
  font-size: 13.5px;
  color: #3f5062;
  border-bottom: 1px solid #eef3f8;
  vertical-align: middle;
}
.m11-table-wrap tbody tr {
  cursor: pointer;
  height: 51px;
}
.m11-table-wrap tbody tr:last-child td { border-bottom: none; }
.m11-table-wrap tbody tr:hover td { background: #f7fbfe; }
.m11-table-wrap tbody tr.m11-top td { background: #fffaed; }
.m11-table-wrap tbody tr.m11-sel-row td { background: #f0f8ff; }
.m11-table-wrap tbody tr.m11-top.m11-sel-row td { background: #fff6e0; }

.col-rank { width: 64px; text-align: center !important; }
.col-score { width: 220px; }
.col-op { width: 88px; text-align: center !important; }

.m11-rank {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-weight: 700;
  color: #5c7084;
}
.m11-rank .gold { color: #c8902a; }
.m11-star { width: 15px; height: 15px; flex: 0 0 auto; }

.name { font-weight: 600; color: #1f3d5a; }
.m11-cat {
  background: #edf5fc;
  color: #1668a8;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 10px;
}

.m11-score { display: flex; align-items: center; gap: 8px; }
.m11-bar {
  flex: 1;
  height: 8px;
  background: #e6eef5;
  border-radius: 6px;
  overflow: hidden;
}
.m11-bar-fill {
  height: 100%;
  border-radius: 6px;
  background: linear-gradient(90deg, #4b95cc, #0d4e83);
}
.m11-bar-fill.gold { background: linear-gradient(90deg, #d0ab68, #c8902a); }
.m11-score-n {
  font-size: 13px;
  font-weight: 700;
  min-width: 38px;
  text-align: right;
  color: #0d4e83;
}
.m11-score-n.gold { color: #c8902a; }

.reason {
  font-size: 13px;
  color: #5c7084;
  white-space: normal;
  line-height: 1.5;
}
.m11-star-txt { color: #c8902a; font-weight: 600; margin-right: 4px; }

.m11-compare-title {
  font-size: 13.5px;
  font-weight: 600;
  color: #0d4e83;
  margin-bottom: 12px;
}
.m11-compare-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}
.m11-cmp {
  border-radius: 8px;
  padding: 12px 14px;
  border: 1px solid #e8f2fb;
  background: #f7fbfe;
}
.m11-cmp.on {
  background: #edf5fc;
  border-color: #9ec8e8;
}
.m11-cmp.on.gold {
  background: #fffaed;
  border-color: #d0ab68;
}
.m11-cmp-lab { font-size: 12px; color: #8a99a8; margin-bottom: 6px; font-weight: 500; }
.m11-cmp-score {
  font-weight: 700;
  font-size: 22px;
  margin-bottom: 4px;
  color: #0d4e83;
}
.m11-cmp.gold .m11-cmp-score,
.m11-cmp.on.gold .m11-cmp-score { color: #c8902a; }
.m11-cmp-res {
  font-size: 12.5px;
  color: #3f5062;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
