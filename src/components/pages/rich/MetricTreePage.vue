<template>
  <div class="rich-type-m03">


      <!-- ═══ 第二级：指标树详情页 ═══ -->
      <template v-if="m03DetailOpen">
        <!-- 版本信息条 -->
        <div class="crud-body" style="margin-bottom:14px;padding:14px 18px">
          <div style="display:flex;align-items:center;gap:16px">
            <!-- 返回 -->
            <span style="display:inline-flex;align-items:center;gap:4px;font-size:13px;color:#1668a8;cursor:pointer" @click="m03DetailOpen=false">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="width:13px;height:13px"><polyline points="15 18 9 12 15 6"/></svg>
              返回列表
            </span>
            <div style="width:1px;height:22px;background:#dde8f0"></div>
            <div style="display:flex;align-items:center;gap:10px;flex:1">
              <span style="font-weight:700;font-size:15px;color:#1f3d5a">{{ m03CurrentRow?.version || '指标树 V1.0' }}</span>
              <span class="badge" :class="m03CurrentRow?.status==='已发布'?'on':'hold'"><i></i>{{ m03CurrentRow?.status || '已发布' }}</span>
              <span style="font-size:13px;color:#8a99a8">发布时间：{{ m03CurrentRow?.publishedAt || '—' }}</span>
            </div>
            <button class="btn btn-primary" style="height:32px;padding:0 16px;font-size:13px" @click="m03SaveToStore">保存并同步</button>
          </div>
        </div>

        <!-- 主体：左树 + 右属性面板 -->
        <div style="display:grid;grid-template-columns:320px 1fr;gap:14px;align-items:stretch">

          <!-- 左：四级指标树 -->
          <div class="crud-body" style="padding:0;overflow:hidden;display:flex;flex-direction:column">
            <div style="padding:10px 14px;border-bottom:1px solid #eef3f8;display:flex;align-items:center;gap:8px;flex:0 0 auto">
              <span style="font-weight:600;font-size:13.5px;color:#1f3d5a">指标树结构</span>
              <button class="btn btn-ghost" style="margin-left:auto;height:26px;padding:0 8px;font-size:12px;color:#4a7fa8" @click="m03ExpandAll">展开全部</button>
            </div>
            <div style="padding:6px 0;flex:1;overflow:auto">
              <metric-tree-node
                v-for="node in m03Tree"
                :key="node.id"
                :node="node"
                :sel-id="m03SelId"
                @select="m03Select"
              />
            </div>
          </div>

          <!-- 右：属性面板 -->
          <div class="crud-body" style="padding:0;overflow:hidden;display:flex;flex-direction:column">
            <template v-if="m03SelNode">
              <!-- 标题栏 -->
              <div style="padding:10px 14px;border-bottom:1px solid #eef3f8;display:flex;align-items:center;gap:8px;flex:0 0 auto">
                <span style="font-weight:600;font-size:13.5px;color:#1f3d5a">指标属性</span>
                <span class="badge on" style="margin-left:auto"><i></i>已确认</span>
              </div>
              
              <!-- 内容区 -->
              <div style="padding:16px 18px;flex:1;overflow:auto">
                <div style="margin-bottom:16px">
                  <div style="font-size:16px;font-weight:700;color:#1f3d5a">{{ m03SelNode.name }}</div>
                  <div style="margin-top:4px;font-size:13px;color:#8a99a8">指标项 · 属性详情</div>
                </div>

                <!-- 基本属性 -->
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">
                  <div class="m03-field">
                    <div class="m03-field-label">指标名称</div>
                    <div class="m03-field-value">{{ m03SelNode.name }}</div>
                  </div>
                  <div class="m03-field">
                    <div class="m03-field-label">指标值</div>
                    <div class="m03-field-value" style="font-weight:600;color:#0d4e83">{{ m03SelNode.value }}</div>
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

                <!-- 来源文档关联区 -->
                <div style="border:1px solid #d8eaf7;border-radius:8px;padding:12px 14px;background:#f4f9fe">
                  <div style="font-size:12.5px;font-weight:600;color:#4a7fa8;margin-bottom:10px;letter-spacing:.5px">来源文档</div>
                  <div style="display:flex;align-items:center;gap:10px">
                    <div style="width:30px;height:30px;background:#0d4e83;border-radius:6px;display:grid;place-items:center;flex:0 0 auto">
                      <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" style="width:16px;height:16px"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    </div>
                    <div style="flex:1">
                      <div style="font-weight:600;font-size:13.5px;color:#1f3d5a">D-01《某型装备研制总要求》</div>
                      <div style="font-size:12.5px;color:#8a99a8;margin-top:2px">第 12 页 · {{ m03SelNode.srcSection }}</div>
                    </div>
                    <button @click="toast('原文定位：第12页')" style="width:32px;height:32px;border:1px solid #c8dff0;border-radius:6px;background:#fff;cursor:pointer;display:grid;place-items:center;color:#4a7fa8;flex:0 0 auto" title="查看原文">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="width:15px;height:15px"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                    </button>
                  </div>
                </div>

                <div style="margin-top:14px;padding-top:12px;border-top:1px solid #eef3f8;display:flex;gap:8px">
                  <button class="btn btn-outline" @click="toast('已打开编辑面板')">编辑属性</button>
                  <button class="btn btn-outline" @click="toast('已跳转原文')">原文追溯</button>
                </div>
              </div>
            </template>
            <div v-else style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#a0aab4;font-size:13.5px;padding:24px">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width:36px;height:36px;margin-bottom:8px;color:#c8d8e8"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/></svg>
              点击左侧树节点查看指标属性
            </div>
          </div>
        </div>
      </template>

      <!-- ═══ 第一级：指标树列表页 ═══ -->
      <template v-else>
        <div class="crud-body">
          <div class="toolbar">
            <button class="btn btn-primary" style="height:36px;padding:0 18px;font-size:14px;gap:6px;display:inline-flex;align-items:center" @click="toast('已打开新建指标树面板')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" style="width:15px;height:15px"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              新建指标树
            </button>
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
  </div>
</template>

<script>
import { useRichPage } from '@/composables/rich/useRichPage'
import MetricTreeNode from '@/components/MetricTreeNode.vue'

export default {
  components: { MetricTreeNode },
  props: { page: Object, title: String },
  setup(props) {
    return useRichPage(props)
  },
}
</script>
