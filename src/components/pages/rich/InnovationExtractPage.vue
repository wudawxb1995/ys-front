<template>
  <div class="rich-type-m29">


      <!-- 顶部统计条 -->
      <div class="kpi-row" style="grid-template-columns:repeat(3,1fr);margin-bottom:14px">
        <div class="kpi">
          <div class="label">收录科技文献</div>
          <div class="value">326 <small>篇</small></div>
        </div>
        <div class="kpi">
          <div class="label">技术创新点</div>
          <div class="value">58 <small>个</small></div>
        </div>
        <div class="kpi">
          <div class="label">覆盖技术方向</div>
          <div class="value">6 <small>个</small></div>
        </div>
      </div>

      <!-- 筛选栏 + 表格（同一 crud-body 容器） -->
      <div class="crud-body">
        <div class="filter-bar filter-panel">
          <div class="field">
            <label>技术方向</label>
            <SelectField v-model="m29FilterDirection" :options="m29DirectionOpts" />
          </div>
          <div class="field">
            <label>来源文献</label>
            <input v-model="m29FilterSource" placeholder="请输入" />
          </div>
          <button class="btn btn-primary" @click="()=>{}">查询</button>
          <button class="btn btn-outline" @click="m29FilterDirection='';m29FilterSource=''">重置</button>
        </div>

        <!-- 表格 -->
        <div class="table-inner">
          <table style="table-layout:fixed;width:100%">
            <thead>
              <tr>
                <th>创新点名称</th>
                <th>来源文献</th>
                <th>技术方向</th>
                <th>置信度</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="inn in m29Filtered" :key="inn.id">
                <tr @click="m29ExpandedId = m29ExpandedId===inn.id ? null : inn.id" style="cursor:pointer">
                  <td>{{ inn.name }}</td>
                  <td>{{ inn.source }}</td>
                  <td>{{ inn.direction }}</td>
                  <td><b style="color:var(--blue)">{{ inn.confidence }}</b></td>
                  <td>
                    <span class="link-btn">{{ m29ExpandedId===inn.id ? '收起' : '展开' }}</span>
                  </td>
                </tr>
                <tr v-if="m29ExpandedId===inn.id" class="m29-expand-row">
                  <td colspan="5" style="padding:0">
                    <div class="m29-quadrant">
                      <div class="m29-cell">
                        <div class="m29-cell-title">问题定义</div>
                        <p class="m29-cell-body">{{ inn.q }}</p>
                        <span class="ref-tag">{{ inn.qRef }}</span>
                      </div>
                      <div class="m29-cell">
                        <div class="m29-cell-title">技术原理</div>
                        <p class="m29-cell-body">{{ inn.p }}</p>
                        <span class="ref-tag">{{ inn.pRef }}</span>
                      </div>
                      <div class="m29-cell">
                        <div class="m29-cell-title">创新点</div>
                        <p class="m29-cell-body">{{ inn.i }}</p>
                        <span class="ref-tag">{{ inn.iRef }}</span>
                      </div>
                      <div class="m29-cell">
                        <div class="m29-cell-title">应用效果</div>
                        <p class="m29-cell-body">{{ inn.e }}</p>
                        <span class="ref-tag">{{ inn.eRef }}</span>
                      </div>
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
          <div class="pager"><span>共 <b>{{ m29Filtered.length }}</b> 条记录</span></div>
        </div>
      </div>

  </div>
</template>

<script>
import { useRichPage } from '@/composables/rich/useRichPage'
import SelectField from '@/components/SelectField.vue'

export default {
  components: { SelectField },
  props: { page: Object, title: String },
  setup(props) {
    return useRichPage(props)
  },
}
</script>
