<template>
  <div class="rich-type-m11">
    <div class="m11-shell">
      <div class="m11-top">
        <span>{{ m11Demand.line }}</span>
        <span class="m11-done" :class="{ off: !m11Demand.done }"><i></i>{{ m11Demand.status }}</span>
      </div>

      <div class="m11-result-title">{{ m11CurrentTab?.label }} 推荐结果如下</div>

      <div class="m11-result">
        <aside class="m11-catalog">
          <div class="m11-catalog-h">考核指标目录</div>
          <div class="m11-catalog-sub">每项指标独立推荐，点击切换</div>
          <div class="m11-catalog-list">
            <button
              v-for="(row, idx) in m11Indicators"
              :key="row.id"
              type="button"
              class="m11-ind"
              :class="{ on: m11ActiveInd?.id === row.id }"
              @click="m11IndId = row.id"
            >
              <span class="m11-ind-no">{{ String(idx + 1).padStart(2, '0') }}</span>
              <span class="m11-ind-txt">
                <b>{{ row.name }}</b>
                <em>{{ row.klass.split(' / ')[0] }} · {{ row.criteria }}</em>
              </span>
              <svg v-if="m11ActiveInd?.id === row.id" class="m11-ind-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <path d="M14 3h7v7"/><path d="M10 14L21 3"/><path d="M21 14v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h6"/>
              </svg>
            </button>
          </div>
        </aside>

        <div class="m11-detail">
          <div class="m11-detail-head">
            <div>
              <div class="m11-detail-name">{{ m11ActiveInd?.name }}</div>
              <div class="m11-detail-meta">{{ m11ActiveInd?.klass }} · 判据 {{ m11ActiveInd?.criteria }}</div>
            </div>
            <span class="m11-detail-badge">{{ m11CurrentTab?.algo }} · {{ m11IndRecommend.items.length }}项资源</span>
          </div>
          <div class="m11-basis">方案匹配依据：{{ m11IndRecommend.basis }}</div>
          <div class="m11-cards">
            <article v-for="row in m11IndRecommend.items" :key="row.name" class="m11-card" :class="{ off: !m11IsAdopted(row.name) }">
              <div class="m11-ring">{{ row.score }}</div>
              <div class="m11-card-main">
                <div class="m11-card-name">
                  {{ row.name }}
                  <span>{{ row.cat }}</span>
                </div>
                <p>判据与方案约束匹配：{{ row.match }}</p>
                <p class="sub">适用约束：{{ row.apply }}</p>
              </div>
              <div class="m11-card-ops">
                <el-button size="small" @click="m11OpenCase(row)">
                  <el-icon><Clock /></el-icon>
                  回溯案例
                </el-button>
                <el-button
                  size="small"
                  :type="m11IsAdopted(row.name) ? 'primary' : 'default'"
                  @click="m11ToggleAdopt(row.name)"
                >{{ m11IsAdopted(row.name) ? '已采纳' : '采纳' }}</el-button>
              </div>
            </article>
          </div>
        </div>
      </div>

      <el-dialog v-model="m11CaseVisible" title="历史案例回溯" width="520px" align-center>
        <div v-if="m11CaseRow" class="m11-case-dlg">
          <div class="m11-case-name">{{ m11CaseRow.caseName }}</div>
          <div class="m11-case-res">关联资源：{{ m11CaseRow.name }}</div>
          <p>{{ m11CaseRow.caseText }}</p>
        </div>
        <template #footer>
          <el-button type="primary" @click="m11CaseVisible = false">关闭</el-button>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import { Clock } from '@element-plus/icons-vue'
import { useRichPage } from '@/composables/rich/useRichPage'

export default {
  components: { Clock },
  props: { page: Object, title: String },
  setup(props) {
    return useRichPage(props)
  },
}
</script>

<style scoped>
.m11-shell {
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: transparent;
  border: none;
  padding: 0;
  box-shadow: none;
}
.m11-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  background: #fff;
  border: 1px solid #e3edf6;
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 14px;
  color: #3f5062;
  line-height: 22px;
}
.m11-top > span:first-child {
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.m11-done {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex: 0 0 auto;
  color: #1f9d55;
  background: #f3fbf6;
  border: 1px solid #b7e7c9;
  border-radius: 14px;
  padding: 2px 10px;
  font-size: 13px;
}
.m11-done i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #1f9d55;
}
.m11-done.off {
  color: #8a6a2f;
  background: #fbf6ea;
  border-color: #ead7a8;
}
.m11-done.off i { background: #c4a35a; }

.m11-req {
  background: #eef7fe;
  border: 1px solid #c8e0f5;
  border-radius: 10px;
  padding: 14px 18px;
}
.m11-req-bind {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}
.m11-req-bind .lab {
  font-size: 13px;
  color: #5c7084;
  font-weight: 600;
  white-space: nowrap;
}

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
.m11-tag.muted { color: #8a99a8; border-style: dashed; font-weight: 400; }
.m11-tag-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #1668a8;
  flex: 0 0 auto;
}

.m11-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0;
  border-bottom: 2px solid #e2ebf3;
}
.m11-tab {
  padding: 8px 12px;
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  margin-bottom: -2px;
  font-size: 13px;
  line-height: 1.4;
  color: #7c8fa2;
  cursor: pointer;
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

.m11-result-title {
  font-size: 15px;
  font-weight: 600;
  color: #1f3d5a;
  line-height: 22px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0 2px;
}
.m11-result {
  display: grid;
  grid-template-columns: 248px minmax(0, 1fr);
  gap: 12px;
  align-items: start;
  min-height: 560px;
}
.m11-catalog {
  border: 1px solid #e3edf6;
  border-radius: 10px;
  background: #fff;
  display: flex;
  flex-direction: column;
  min-height: 560px;
  max-height: calc(100vh - 196px);
}
.m11-catalog-h {
  padding: 14px 14px 0;
  font-size: 14px;
  font-weight: 700;
  color: #1f3d5a;
}
.m11-catalog-sub {
  padding: 2px 14px 10px;
  font-size: 12px;
  color: #8aa0b3;
}
.m11-catalog-list {
  overflow: auto;
  padding: 0 8px 10px;
}
.m11-ind {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  width: 100%;
  text-align: left;
  border: none;
  background: transparent;
  border-radius: 8px;
  padding: 8px 8px;
  cursor: pointer;
}
.m11-ind-no {
  flex: 0 0 auto;
  width: 22px;
  font-size: 12px;
  font-weight: 700;
  color: #8aa0b3;
  line-height: 1.4;
}
.m11-ind-txt { flex: 1; min-width: 0; }
.m11-ind b {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #1f3d5a;
  line-height: 1.35;
}
.m11-ind em {
  display: block;
  margin-top: 2px;
  font-style: normal;
  font-size: 12px;
  color: #8aa0b3;
}
.m11-ind-ico {
  width: 14px;
  height: 14px;
  flex: 0 0 auto;
  margin-top: 2px;
  color: #1668a8;
}
.m11-ind.on {
  background: #e8f4fc;
}
.m11-ind.on .m11-ind-no,
.m11-ind.on b { color: #0d4e83; }
.m11-detail {
  min-width: 0;
  background: #fff;
  border: 1px solid #e3edf6;
  border-radius: 10px;
  padding: 14px 16px 16px;
}
.m11-detail-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
  background: #fff;
}
.m11-detail-name {
  font-size: 16px;
  font-weight: 700;
  color: #1f3d5a;
}
.m11-detail-meta {
  margin-top: 2px;
  font-size: 12px;
  color: #7c8fa2;
}
.m11-detail-badge {
  flex: 0 0 auto;
  font-size: 12px;
  color: #8a6a2f;
  background: #fbf6ea;
  border: 1px solid #ead7a8;
  border-radius: 12px;
  padding: 3px 10px;
}
.m11-basis {
  background: #fff;
  border: 1px solid #e3edf6;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 13px;
  color: #3f5062;
  line-height: 1.5;
  margin-bottom: 10px;
}
.m11-cards { display: flex; flex-direction: column; gap: 10px; }
.m11-card {
  display: flex;
  align-items: center;
  gap: 14px;
  border: 1px solid #e3edf6;
  border-radius: 10px;
  background: #fff;
  padding: 14px 14px;
}
.m11-card.off { background: #f7f9fb; }
.m11-card.off .m11-ring { border-color: #c5d3e0; color: #8aa0b3; }
.m11-ring {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  border: 3px solid #1668a8;
  color: #1668a8;
  font-size: 15px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
}
.m11-card-main { flex: 1; min-width: 0; }
.m11-card-name {
  font-size: 15px;
  font-weight: 700;
  color: #1f3d5a;
  margin-bottom: 4px;
}
.m11-card-name span {
  margin-left: 8px;
  font-size: 12px;
  font-weight: 500;
  color: #1668a8;
  background: #eef6fc;
  border-radius: 10px;
  padding: 1px 8px;
}
.m11-card-main p {
  margin: 0;
  font-size: 13px;
  line-height: 1.55;
  color: #3f5062;
}
.m11-card-main p.sub { color: #7c8fa2; margin-top: 2px; }
.m11-card-ops {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 0 0 auto;
}
.m11-card-ops :deep(.el-button) {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.m11-card-ops :deep(.el-button + .el-button) { margin-left: 0; }
.m11-case-name { font-size: 16px; font-weight: 700; color: #1f3d5a; }
.m11-case-res { margin: 6px 0 10px; font-size: 13px; color: #7c8fa2; }
.m11-case-dlg p { margin: 0; font-size: 14px; line-height: 1.6; color: #3f5062; }

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
.m11-case {
  margin-top: 4px;
  font-size: 12px;
  color: #1668a8;
}

.m11-compare-title {
  font-size: 13.5px;
  font-weight: 600;
  color: #0d4e83;
  margin-bottom: 12px;
}
.m11-compare-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
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
