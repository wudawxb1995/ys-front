<template>
  <div class="rich-type-m29">
    <!-- 顶部统计条 -->
    <div class="kpi-row kpi-row-3">
      <div class="kpi">
        <div class="mark"><Icon name="doc" /></div>
        <div class="label">收录科技文献</div>
        <div class="value">326<small>篇</small></div>
      </div>
      <div class="kpi">
        <div class="mark"><Icon name="spark" /></div>
        <div class="label">抽取技术创新点</div>
        <div class="value">58<small>个</small></div>
      </div>
      <div class="kpi">
        <div class="mark"><Icon name="target" /></div>
        <div class="label">覆盖技术方向</div>
        <div class="value">6<small>个</small></div>
      </div>
    </div>

    <!-- 筛选 + 结果表（与 CrudPage 同构） -->
    <div class="crud-body">
      <div class="filter-bar filter-panel">
        <div class="field">
          <label>技术方向</label>
          <SelectField v-model="m29FilterDirection" :options="m29DirectionOpts" placeholder="全部方向" clearable />
        </div>
        <div class="field" style="width:240px">
          <label>来源文献</label>
          <el-input v-model="m29FilterSource" clearable placeholder="请输入" />
        </div>
        <div class="filter-actions">
          <el-button type="primary" @click="m29ApplyFilter">查询</el-button>
          <el-button @click="m29ResetFilter">重置</el-button>
        </div>
      </div>

      <div class="table-inner">
        <table>
          <thead>
            <tr>
              <th>创新点名称</th>
              <th>来源文献</th>
              <th>技术方向</th>
              <th>置信度</th>
              <th style="text-align:center">操作</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="inn in m29Filtered" :key="inn.id">
              <tr :class="{ open: m29ExpandedId === inn.id }">
                <td>{{ inn.name }}</td>
                <td>{{ inn.source }}</td>
                <td>{{ inn.direction }}</td>
                <td><b class="conf">{{ inn.confidence }}</b></td>
                <td style="text-align:center">
                  <div class="ops" style="justify-content:center">
                    <a @click="m29ExpandedId = m29ExpandedId === inn.id ? null : inn.id">
                      {{ m29ExpandedId === inn.id ? '收起' : '展开' }}
                    </a>
                  </div>
                </td>
              </tr>
              <tr v-if="m29ExpandedId === inn.id" class="m29-expand-row">
                <td colspan="5">
                  <div class="m29-quadrant">
                    <div class="m29-cell">
                      <div class="m29-cell-title"><i></i>问题定义</div>
                      <p class="m29-cell-body">{{ inn.q }}</p>
                      <span class="ref-tag">{{ inn.qRef }}</span>
                    </div>
                    <div class="m29-cell">
                      <div class="m29-cell-title"><i></i>技术原理</div>
                      <p class="m29-cell-body">{{ inn.p }}</p>
                      <span class="ref-tag">{{ inn.pRef }}</span>
                    </div>
                    <div class="m29-cell">
                      <div class="m29-cell-title"><i></i>创新点</div>
                      <p class="m29-cell-body">{{ inn.i }}</p>
                      <span class="ref-tag">{{ inn.iRef }}</span>
                    </div>
                    <div class="m29-cell">
                      <div class="m29-cell-title"><i></i>应用效果</div>
                      <p class="m29-cell-body">{{ inn.e }}</p>
                      <span class="ref-tag">{{ inn.eRef }}</span>
                    </div>
                  </div>
                </td>
              </tr>
            </template>
            <tr v-if="!m29Filtered.length">
              <td colspan="5" class="empty">没有符合条件的记录</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pager">
        <span>共 <b>{{ m29Filtered.length }}</b> 条记录</span>
      </div>
    </div>
  </div>
</template>

<script>
import { useRichPage } from '@/composables/rich/useRichPage'
import SelectField from '@/components/SelectField.vue'
import Icon from '@/components/Icon.vue'

export default {
  components: { SelectField, Icon },
  props: { page: Object, title: String },
  setup(props) {
    return useRichPage(props)
  },
}
</script>

<style scoped>
.rich-type-m29 {
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 20px 22px;
  box-shadow: 0 6px 18px rgba(15, 55, 95, .04);
  min-width: 0;
}
.kpi-row-3 { margin-bottom: 16px; }
.rich-type-m29 :deep(.crud-body .filter-panel) {
  margin-bottom: 0;
  border: none;
  border-radius: 0;
  box-shadow: none;
  border-bottom: none;
  padding-bottom: 16px;
}
.rich-type-m29 :deep(.crud-body) {
  box-shadow: none;
  border-color: #d5e0ea;
}
.conf { color: var(--blue); font-variant-numeric: tabular-nums; }
.m29-expand-row td {
  padding: 0 !important;
  white-space: normal !important;
  max-width: none !important;
  overflow: visible !important;
  text-overflow: clip !important;
  height: auto !important;
  border-bottom: 1px solid #eef3f8;
}
.m29-expand-row :deep(.m29-cell-body) {
  white-space: normal;
}
.filter-actions :deep(.el-button + .el-button) { margin-left: 0; }
tbody tr.open td { background: #f6fafd; }
</style>
