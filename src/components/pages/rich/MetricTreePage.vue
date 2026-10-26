<template>
  <div class="rich-type-m03">
      <div v-if="published" class="pub">
        <div class="pub-banner">
          <div class="pub-banner-ico">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3v6M8 21h8M12 9l-4 4M12 9l4 4M8 13v8M16 13v8"/></svg>
          </div>
          <div>
            <h2>标准化数据建模 · 指标树</h2>
            <p>审定通过的指标自动组织为「性能域 → 指标类 → 指标」三级指标树并发布版本，后续判据配置、符合性判定全程同源引用。</p>
          </div>
        </div>

        <div class="pub-card">
          <div class="pub-ver">
            <span class="pub-ok">✓</span>
            <b>指标树 V1.0</b>
            <span class="badge on"><i></i>已发布</span>
            <span class="pub-meta">发布时间：{{ publishedAt }}　来源：D-01《某型研制总要求》</span>
          </div>
          <div class="pub-stats">
            <div><b>{{ pubStats.domains }}</b><span>性能域</span></div>
            <div><b>{{ pubStats.classes }}</b><span>指标类</span></div>
            <div><b>{{ pubStats.items }}</b><span>项指标</span></div>
          </div>
        </div>

        <div v-for="domain in pubTree" :key="domain.name" class="pub-domain">
          <button type="button" class="pub-domain-h" @click="togglePub(domain.name)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" :class="{ open: pubOpen[domain.name] }"><path d="M9 6l6 6-6 6"/></svg>
            {{ domain.name }}
            <em>{{ domain.classes.length }} 类 · {{ domain.count }} 项</em>
          </button>
          <div v-show="pubOpen[domain.name]" class="pub-body">
            <div v-for="klass in domain.classes" :key="klass.name" class="pub-class">
              <div class="pub-class-name">{{ klass.name }}</div>
              <div v-for="item in klass.items" :key="item.id" class="pub-item">
                <span>{{ item.name }}</span>
                <em>{{ item.criteria }} <small>P{{ item.srcPage }}</small></em>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ═══ 第二级：指标树详情页（白底整卡，内容虚线框分段） ═══ -->
      <div v-if="!published && m03DetailOpen" class="m03-detail-shell">
        <div class="m03-topbar">
          <button type="button" class="m03-back" @click="m03DetailOpen = false">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg>
            返回列表
          </button>
          <span class="m03-sep">|</span>
          <span class="m03-ver">{{ m03CurrentRow?.version || '指标树 V1.0' }}</span>
          <span class="badge" :class="m03CurrentRow?.status === '已发布' ? 'on' : 'hold'"><i></i>{{ m03CurrentRow?.status || '已发布' }}</span>
          <span class="m03-time">
            发布时间：{{ m03CurrentRow?.publishedAt || (m03CurrentRow?.status === '草稿' ? '未发布' : '—') }}
          </span>
          <el-button type="primary" class="m03-sync-btn" @click="m03SaveToStore">保存并同步</el-button>
        </div>

        <div class="m03-split">
          <div class="m03-dash m03-tree-panel">
            <h3 class="m03-dash-title">
              <i></i>指标树结构
              <button type="button" class="m03-expand-link" @click="m03ExpandAll">{{ m03AllExpanded ? '收起全部' : '展开全部' }}</button>
            </h3>
            <div class="m03-tree-scroll">
              <metric-tree-node
                v-for="node in m03Tree"
                :key="node.id"
                :node="node"
                :sel-id="m03SelId"
                @select="m03Select"
              />
            </div>
          </div>

          <div class="m03-dash m03-attr-panel">
            <template v-if="m03SelNode">
              <h3 class="m03-dash-title">
                <i></i>指标属性
                <span class="badge on m03-attr-badge"><i></i>已确认</span>
              </h3>
              <div class="m03-attr-scroll">
                <div class="m03-attr-hero">
                  <div class="m03-attr-name">{{ m03SelNode.name }}</div>
                </div>

                <div class="m03-attr-grid">
                  <div class="m03-field">
                    <div class="m03-field-label">指标名称</div>
                    <div class="m03-field-value">{{ m03SelNode.name }}</div>
                  </div>
                  <div class="m03-field">
                    <div class="m03-field-label">指标值</div>
                    <div class="m03-field-value accent">{{ m03SelNode.value }}</div>
                  </div>
                  <div class="m03-field">
                    <div class="m03-field-label">判据类型</div>
                    <div class="m03-field-value">{{ m03SelNode.criteriaType }}</div>
                  </div>
                  <div class="m03-field">
                    <div class="m03-field-label">考核方式</div>
                    <div class="m03-field-value">{{ m03SelNode.examMethod }}</div>
                  </div>
                </div>

                <div class="m03-src-card">
                  <div class="m03-src-label">来源文档</div>
                  <div class="m03-src-row">
                    <div class="m03-src-ico" :class="m03SrcIconKind">{{ m03SrcIconText }}</div>
                    <div class="m03-src-meta">
                      <div class="m03-src-name">{{ m03SrcDocLabel }}</div>
                      <div class="m03-src-sub">第 {{ m03SelNode.srcPage || 12 }} 页 · {{ m03SelNode.srcSection || '—' }}</div>
                    </div>
                  </div>
                </div>

                <div class="m03-attr-actions">
                  <el-button @click="m03OpenEdit">编辑属性</el-button>
                  <el-button @click="m03OpenTrace">原文追溯</el-button>
                </div>
              </div>
            </template>
            <div v-else class="m03-attr-empty">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/></svg>
              点击左侧树节点查看指标属性
            </div>
          </div>
        </div>
      </div>

      <!-- ═══ 第一级：指标树列表页 ═══ -->
      <template v-else-if="!published">
        <div class="crud-body">
          <div class="toolbar">
            <el-button type="primary" class="m03-create-btn" @click="m03OpenCreate">
              <span class="m03-create-ico" aria-hidden="true">＋</span>
              新建指标树
            </el-button>
            <span class="spacer"></span>
            <span class="hint">共 {{ m03List.length }} 个版本</span>
          </div>
          <div class="table-inner">
            <table>
              <thead>
                <tr>
                  <th>版本号</th>
                  <th>关联来源文档</th>
                  <th style="text-align:center">指标项数</th>
                  <th style="text-align:center">状态</th>
                  <th>发布时间</th>
                  <th style="text-align:center">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="row in m03List"
                  :key="row.id"
                  style="cursor:pointer"
                  @click="m03OpenDetail(row)"
                >
                  <td style="font-weight:600;color:#1f3d5a">{{ row.version }}</td>
                  <td>
                    <div style="display:flex;align-items:center;gap:6px">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" style="width:13px;height:13px;color:#0d4e83;flex:0 0 auto"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                      <span style="color:#3f5062">{{ row.srcDoc }}</span>
                    </div>
                  </td>
                  <td style="text-align:center;font-weight:600;color:#0d4e83">{{ row.count }}</td>
                  <td style="text-align:center">
                    <span class="badge" :class="row.status==='已发布'?'on':row.status==='草稿'?'hold':'warn'">
                      <i></i>{{ row.status }}
                    </span>
                  </td>
                  <td style="color:#8a99a8;font-size:13px">{{ row.publishedAt || '—' }}</td>
                  <td style="text-align:center" @click.stop>
                    <button class="btn-link" @click="m03OpenDetail(row)">查看</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </template>

    <!-- 新建指标树：EP Dialog（自带蒙版）+ 来源/性能域/指标数联动 -->
    <el-dialog
      v-model="m03CreateVisible"
      title="新建指标树"
      width="560px"
      align-center
      destroy-on-close
      :close-on-click-modal="false"
      class="m03-create-dlg"
    >
      <el-form
        label-width="7.2em"
        require-asterisk-position="right"
        class="m03-create-form"
      >
        <el-form-item label="版本号" required>
          <el-input v-model="m03CreateForm.version" placeholder="如 指标树 V1.1" maxlength="40" />
        </el-form-item>
        <el-form-item label="来源文档" required>
          <el-select
            v-model="m03CreateForm.srcKey"
            placeholder="请选择已解析资源"
            filterable
            style="width:100%"
            @change="m03OnSrcChange"
          >
            <el-option
              v-for="op in m03SrcOptions"
              :key="op.value"
              :label="op.label"
              :value="op.value"
            >
              <span>{{ op.label }}</span>
              <span class="m03-opt-count">{{ op.count || 0 }} 项</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="性能域" required>
          <div class="m03-domain-wrap">
            <button
              v-for="d in m03DomainOptions"
              :key="d"
              type="button"
              class="m03-domain-chip"
              :class="{ on: m03CreateForm.domains.includes(d) }"
              @click="m03ToggleDomain(d)"
            >{{ d }}</button>
          </div>
        </el-form-item>
        <el-form-item label="指标项数">
          <div class="m03-count-box">
            <span class="m03-count-num">{{ m03CreatePreviewCount }}</span>
            <span class="m03-count-unit">项</span>
          </div>
        </el-form-item>
        <el-form-item label="初始状态">
          <el-radio-group v-model="m03CreateForm.status">
            <el-radio value="草稿">草稿</el-radio>
            <el-radio value="已发布">已发布</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注">
          <text-area-field
            v-model="m03CreateForm.remark"
            :maxlength="120"
            :rows="2"
            placeholder="可选，说明本版本建模范围或差异"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="m03CreateVisible = false">取消</el-button>
        <el-button type="primary" @click="m03SubmitCreate">创建</el-button>
      </template>
    </el-dialog>

    <!-- 编辑属性 -->
    <el-dialog
      v-model="m03EditVisible"
      title="编辑指标属性"
      width="520px"
      align-center
      destroy-on-close
      :close-on-click-modal="false"
    >
      <el-form label-width="7.2em" require-asterisk-position="right" class="m03-create-form">
        <el-form-item label="指标名称" required>
          <el-input v-model="m03EditForm.name" maxlength="40" />
        </el-form-item>
        <el-form-item label="指标值" required>
          <el-input v-model="m03EditForm.value" maxlength="60" placeholder="如 ≥ 35 km/h" />
        </el-form-item>
        <el-form-item label="判据类型" required>
          <el-select v-model="m03EditForm.criteriaType" style="width:100%">
            <el-option v-for="op in m03CriteriaOptions" :key="op" :label="op" :value="op" />
          </el-select>
        </el-form-item>
        <el-form-item label="考核方式" required>
          <el-select v-model="m03EditForm.examMethod" style="width:100%">
            <el-option v-for="op in m03ExamOptions" :key="op" :label="op" :value="op" />
          </el-select>
        </el-form-item>
        <el-form-item label="来源章节">
          <el-input v-model="m03EditForm.srcSection" maxlength="80" placeholder="如 4.1 速度性能要求" />
        </el-form-item>
        <el-form-item label="原文页码">
          <el-input-number v-model="m03EditForm.srcPage" :min="1" :max="999" controls-position="right" style="width:100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="m03EditVisible = false">取消</el-button>
        <el-button type="primary" @click="m03SaveEdit">保存</el-button>
      </template>
    </el-dialog>

    <!-- 原文追溯 -->
    <el-dialog
      v-model="m03TraceVisible"
      title="原文追溯"
      width="560px"
      align-center
      destroy-on-close
    >
      <div v-if="m03Trace" class="m03-trace">
        <div class="m03-trace-head">
          <div>
            <div class="m03-trace-name">{{ m03Trace.name }}</div>
            <div class="m03-trace-sub">{{ m03Trace.srcDoc }} · 第 {{ m03Trace.srcPage }} 页</div>
          </div>
          <div class="m03-trace-val">{{ m03Trace.value }}{{ m03Trace.unit ? ' ' + m03Trace.unit : '' }}</div>
        </div>
        <div class="m03-trace-body">
          <span class="m03-page-tag">第 {{ m03Trace.srcPage }} 页</span>
          <p class="m03-trace-text" v-html="m03Trace.html" />
        </div>
      </div>
      <template #footer>
        <el-button type="primary" @click="m03TraceVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { computed, onMounted, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { useRichPage } from '@/composables/rich/useRichPage'
import { useUi } from '@/composables/ui'
import { m02IndRows } from '@/data/m02-indicators'
import MetricTreeNode from '@/components/MetricTreeNode.vue'
import TextAreaField from '@/components/TextAreaField.vue'

function buildPublishedTree(rows) {
  const domains = []
  rows.forEach((row) => {
    const [domainName, className] = String(row.klass || '').split(' / ')
    let domain = domains.find((item) => item.name === domainName)
    if (!domain) {
      domain = { name: domainName, classes: [], count: 0 }
      domains.push(domain)
    }
    let klass = domain.classes.find((item) => item.name === className)
    if (!klass) {
      klass = { name: className, items: [] }
      domain.classes.push(klass)
    }
    klass.items.push(row)
    domain.count += 1
  })
  return domains
}

export default {
  components: { MetricTreeNode, TextAreaField },
  props: { page: Object, title: String },
  setup(props) {
    const route = useRoute()
    const { toast } = useUi()
    const published = computed(() => route.query.published === '1')
    const pubTree = buildPublishedTree(m02IndRows)
    const pubStats = {
      domains: pubTree.length,
      classes: pubTree.reduce((n, domain) => n + domain.classes.length, 0),
      items: pubTree.reduce((n, domain) => n + domain.count, 0),
    }
    const pubOpen = reactive(Object.fromEntries(pubTree.map((domain) => [domain.name, true])))
    const publishedAt = '2026-10-26 16:21:51'
    function togglePub(name) {
      pubOpen[name] = !pubOpen[name]
    }
    onMounted(() => {
      if (!published.value) return
      toast(`指标树 V1.0 已发布：${pubStats.domains} 个性能域 / ${pubStats.classes} 个指标类 / ${pubStats.items} 项指标`, 'success')
    })
    return {
      ...useRichPage(props),
      published,
      pubTree,
      pubStats,
      pubOpen,
      publishedAt,
      togglePub,
    }
  },
}
</script>

<style scoped>
.pub { display: flex; flex-direction: column; gap: 14px; }
.pub-banner {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  background: #fff;
  border: 1px solid #e6eef6;
  border-radius: 12px;
  padding: 18px 20px;
}
.pub-banner-ico {
  width: 36px; height: 36px; border-radius: 8px; flex: 0 0 auto;
  display: grid; place-items: center; background: #e8f3fb; color: #1668a8;
}
.pub-banner-ico svg { width: 18px; height: 18px; }
.pub-banner h2 { margin: 0; font-size: 18px; color: #153b62; }
.pub-banner p { margin: 6px 0 0; color: #7c8fa2; font-size: 13px; line-height: 1.6; }
.pub-card {
  display: flex; align-items: center; justify-content: space-between; gap: 16px;
  background: #fff; border: 1px solid #e6eef6; border-radius: 12px; padding: 16px 20px;
}
.pub-ver { display: flex; align-items: center; gap: 10px; min-width: 0; flex-wrap: wrap; }
.pub-ok {
  width: 22px; height: 22px; border-radius: 50%; background: #e7f6ec; color: #1a8a45;
  display: grid; place-items: center; font-size: 13px; font-weight: 700;
}
.pub-ver b { color: #1f3d5a; font-size: 15px; }
.pub-meta { color: #8a99a8; font-size: 13px; }
.pub-stats { display: flex; gap: 28px; flex: 0 0 auto; }
.pub-stats div { text-align: center; }
.pub-stats b { display: block; font-size: 22px; color: #0d4e83; line-height: 1.1; }
.pub-stats span { color: #8a99a8; font-size: 12px; }
.pub-domain { background: #fff; border: 1px solid #e6eef6; border-radius: 12px; overflow: hidden; }
.pub-domain-h {
  width: 100%; display: flex; align-items: center; gap: 8px;
  border: 0; background: #fff; padding: 14px 16px; cursor: pointer;
  color: #1f3d5a; font-size: 15px; font-weight: 700; text-align: left;
}
.pub-domain-h svg { width: 14px; height: 14px; color: #8a99a8; transition: transform .15s; }
.pub-domain-h svg.open { transform: rotate(90deg); }
.pub-domain-h em { margin-left: 8px; font-style: normal; font-weight: 500; color: #8a99a8; font-size: 12.5px; }
.pub-body { padding: 0 18px 12px 38px; }
.pub-class-name { color: #1668a8; font-size: 13.5px; font-weight: 600; margin: 8px 0 4px; }
.pub-item { display: flex; justify-content: space-between; gap: 16px; padding: 6px 0; font-size: 13.5px; color: #3f5062; }
.pub-item em { font-style: normal; color: #1668a8; font-weight: 600; white-space: nowrap; }
.pub-item small { margin-left: 8px; color: #8a99a8; font-weight: 500; }
.m03-detail-shell {
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 20px 22px 18px;
  box-shadow: 0 6px 18px rgba(15, 55, 95, .04);
}
.m03-topbar {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 36px;
}
.m03-back {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border: 0;
  background: none;
  padding: 0;
  color: #1668a8;
  font-size: 13px;
  cursor: pointer;
}
.m03-back:hover { color: #0d4e83; }
.m03-back svg { width: 13px; height: 13px; }
.m03-sep { color: #d0dce8; }
.m03-ver { font-weight: 700; font-size: 15px; color: #1f3d5a; }
.m03-time { font-size: 13px; color: #8a99a8; }
.m03-sync-btn { margin-left: auto; height: 32px; }

.m03-split {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 14px;
  align-items: start;
}
.m03-dash {
  border: 1.5px dashed #b7d4ee;
  border-radius: 12px;
  background: #fff;
  padding: 14px 14px 10px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.m03-dash-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 12px;
  font-size: 16px;
  color: var(--navy-2, #1f3d5a);
  flex: 0 0 auto;
}
.m03-dash-title > i {
  width: 4px;
  height: 16px;
  background: var(--blue, #1668a8);
  border-radius: 2px;
  display: inline-block;
}
.m03-expand-link {
  margin-left: auto;
  border: 0;
  background: none;
  color: #4a7fa8;
  font-size: 12.5px;
  cursor: pointer;
  padding: 0 4px;
}
.m03-expand-link:hover { color: #0d4e83; }
.m03-attr-badge { margin-left: auto; }

.m03-tree-panel,
.m03-attr-panel {
  height: 520px;
  min-height: 520px;
  max-height: 520px;
}
.m03-tree-scroll {
  flex: 1 1 auto;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  padding: 2px 0 4px;
}
.m03-attr-scroll {
  flex: 1 1 auto;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  padding: 0 2px 4px;
}
.m03-attr-hero { margin-bottom: 14px; }
.m03-attr-name { font-size: 16px; font-weight: 700; color: #1f3d5a; }
.m03-attr-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 16px;
}
.m03-field-value.accent { font-weight: 600; color: #0d4e83; }
.m03-src-card {
  border: 1px solid #d8eaf7;
  border-radius: 8px;
  padding: 12px 14px;
  background: #f4f9fe;
}
.m03-src-label {
  font-size: 12.5px;
  font-weight: 600;
  color: #4a7fa8;
  margin-bottom: 10px;
  letter-spacing: .5px;
}
.m03-src-row { display: flex; align-items: center; gap: 10px; }
.m03-src-ico {
  width: 30px;
  height: 30px;
  border-radius: 6px;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  color: #fff;
  font-size: 9px;
  font-weight: 700;
  background: #7c8fa2;
}
.m03-src-ico.pdf { background: linear-gradient(135deg, #e2574c, #c0392b); }
.m03-src-ico.word { background: linear-gradient(135deg, #2b7cd3, #1a5fa8); }
.m03-src-ico.excel { background: linear-gradient(135deg, #2f9e62, #217346); }
.m03-src-ico.file { background: #0d4e83; }
.m03-src-meta { flex: 1; min-width: 0; }
.m03-src-name { font-weight: 600; font-size: 13.5px; color: #1f3d5a; }
.m03-src-sub { font-size: 12.5px; color: #8a99a8; margin-top: 2px; }
.m03-attr-actions {
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid #eef3f8;
  display: flex;
  gap: 8px;
}
.m03-attr-actions :deep(.el-button + .el-button) { margin-left: 0; }
.m03-attr-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #a0aab4;
  font-size: 13.5px;
  padding: 24px;
  gap: 8px;
}
.m03-attr-empty svg { width: 36px; height: 36px; color: #c8d8e8; }

.m03-create-btn { height: 36px; padding: 0 18px; }
.m03-create-ico { margin-right: 4px; font-weight: 700; }

.m03-create-form :deep(.el-form-item__label) {
  text-align: left;
  justify-content: flex-start;
  white-space: nowrap;
}
.m03-opt-count {
  float: right;
  color: #8a99a8;
  font-size: 12.5px;
  margin-left: 12px;
}
.m03-domain-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  width: 100%;
}
.m03-domain-chip {
  height: 30px;
  padding: 0 12px;
  border-radius: 15px;
  border: 1px solid #c5d8ea;
  background: #fff;
  color: #4a5a6a;
  font-size: 13px;
  cursor: pointer;
}
.m03-domain-chip.on {
  border-color: #1668a8;
  background: #e8f2fb;
  color: #0d4e83;
  font-weight: 600;
}
.m03-count-box {
  display: flex;
  align-items: baseline;
  gap: 6px;
  width: 100%;
  min-height: 36px;
  padding: 8px 12px;
  border: 1px solid #d5e0ea;
  border-radius: 6px;
  background: #f7fbfe;
}
.m03-count-num {
  font-size: 22px;
  font-weight: 700;
  color: #0d4e83;
  line-height: 1;
}
.m03-count-unit { font-size: 13px; color: #6d8092; }

.m03-trace-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}
.m03-trace-name { font-size: 16px; font-weight: 700; color: #1f3d5a; }
.m03-trace-sub { margin-top: 4px; font-size: 12.5px; color: #8a99a8; }
.m03-trace-val {
  font-size: 14px;
  font-weight: 700;
  color: #0d4e83;
  font-family: ui-monospace, monospace;
  white-space: nowrap;
}
.m03-trace-body {
  border: 1px solid #e8eef5;
  border-radius: 8px;
  padding: 14px;
  background: #fafcfe;
  min-height: 140px;
}
.m03-page-tag {
  display: inline-flex;
  font-size: 11.5px;
  color: #a36e0c;
  background: #fff5dc;
  border: 1px solid #efd291;
  border-radius: 4px;
  padding: 2px 7px;
  font-weight: 700;
  margin-bottom: 10px;
}
.m03-trace-text {
  margin: 0;
  font-size: 13.5px;
  line-height: 1.75;
  color: #3f5062;
}
.m03-trace-text :deep(.m03-hl) {
  background: #fff2c6;
  color: #8a6000;
  padding: 1px 3px;
  border-radius: 3px;
  box-shadow: inset 0 -2px 0 #d0ab68;
  font-weight: 600;
}
</style>
